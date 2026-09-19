import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  getRedirectResult, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc,
  getDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ============================================================
// 1. Firebase 初始化
// ============================================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let currentClientId = null;
let editing = { type:null, id:null };
let migrationPayload = null;

const state = {
  clients: [],
  communications: [],
  quotes: [],
  orders: [],
  tasks: [],
  holidays: [],
  files: [],
  settings: { quoteFollowDays:5, dormantDays:30, weekendFollow:false, currency:"USD" }
};

const unsubscribers = [];

// ============================================================
// 2. 工具函数
// ============================================================
const $ = id => document.getElementById(id);
const esc = (v="") => String(v).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));
const todayISO = () => {
  const d=new Date(), off=d.getTimezoneOffset();
  return new Date(d.getTime()-off*60000).toISOString().slice(0,10);
};
const parseDate = s => s ? new Date(s+"T00:00:00") : null;
const fmtDate = s => {
  const d=parseDate(s); if(!d) return "—";
  return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
};
const addDays = (s,n) => {
  const d=parseDate(s); if(!d) return "";
  d.setDate(d.getDate()+Number(n||0));
  const off=d.getTimezoneOffset();
  return new Date(d.getTime()-off*60000).toISOString().slice(0,10);
};
const daysBetween = (a,b) => {
  const x=parseDate(a), y=parseDate(b); if(!x||!y) return null;
  return Math.round((y-x)/86400000);
};
const isWeekend = () => [0,6].includes(new Date().getDay());
const badge = (text,cls="") => `<span class="badge ${cls}">${esc(text||"未设置")}</span>`;
const empty = text => `<div class="empty">${esc(text)}</div>`;
const clientName = id => state.clients.find(x=>x.id===id)?.company || "未关联客户";
const sync = (status,text) => {
  $("syncDot").className="sync-dot "+status;
  $("syncText").textContent=text;
};
const pathFor = type => ({
  client:"clients",communication:"communications",quote:"quotes",order:"orders",
  task:"tasks",holiday:"holidays",file:"files"
})[type];
const refCollection = name => collection(db,"users",currentUser.uid,name);

// ============================================================
// 3. 登录 / 登出
// ============================================================
async function doLogin(){
  try{
    // 桌面端优先 popup；手机浏览器若拦截，可改用 redirect。
    await signInWithPopup(auth, provider);
  }catch(err){
    console.warn("popup failed, trying redirect", err);
    await signInWithRedirect(auth, provider);
  }
}
$("googleLoginBtn").addEventListener("click", doLogin);
$("logoutBtn").addEventListener("click", ()=>signOut(auth));

try { await getRedirectResult(auth); } catch(e){ console.warn(e); }

onAuthStateChanged(auth, async user=>{
  currentUser=user;
  if(!user){
    $("loginScreen").style.display="grid";
    $("workspaceApp").style.display="none";
    unsubscribers.splice(0).forEach(fn=>fn());
    return;
  }
  $("loginScreen").style.display="none";
  $("workspaceApp").style.display="grid";
  $("userName").textContent=user.displayName||user.email||"Google用户";
  $("userAvatar").src=user.photoURL||"";
  await ensureProfileAndSettings();
  bindRealtimeData();
});

// ============================================================
// 4. 用户初始化与实时同步
// ============================================================
async function ensureProfileAndSettings(){
  sync("busy","正在连接云端…");
  const profileRef=doc(db,"users",currentUser.uid);
  await setDoc(profileRef,{
    displayName:currentUser.displayName||"",
    email:currentUser.email||"",
    photoURL:currentUser.photoURL||"",
    updatedAt:serverTimestamp()
  },{merge:true});

  const settingsRef=doc(db,"users",currentUser.uid,"settings","main");
  const snap=await getDoc(settingsRef);
  if(!snap.exists()){
    await setDoc(settingsRef,state.settings);
  }
}

function bindRealtimeData(){
  unsubscribers.splice(0).forEach(fn=>fn());
  const collections=["clients","communications","quotes","orders","tasks","holidays","files"];
  collections.forEach(name=>{
    const unsub=onSnapshot(refCollection(name),snap=>{
      state[name]=snap.docs.map(d=>({id:d.id,...d.data()}));
      sync("ok","已自动同步");
      renderAll();
    },err=>{
      console.error(err);sync("err","同步失败");
    });
    unsubscribers.push(unsub);
  });
  const settingsUnsub=onSnapshot(doc(db,"users",currentUser.uid,"settings","main"),snap=>{
    if(snap.exists()) state.settings={...state.settings,...snap.data()};
    renderSettings();renderAll();
  });
  unsubscribers.push(settingsUnsub);
}

// ============================================================
// 5. 页面切换
// ============================================================
document.querySelectorAll(".nav button").forEach(btn=>{
  btn.addEventListener("click",()=>showPage(btn.dataset.page));
});
window.showPage = name => {
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
  $("page-"+name)?.classList.add("active");
  document.querySelector(`.nav button[data-page="${name}"]`)?.classList.add("active");
  $("sidebar").classList.remove("open");
};
$("menuBtn").addEventListener("click",()=> $("sidebar").classList.toggle("open"));

// ============================================================
// 6. 自动跟进逻辑
// ============================================================
function getFollowups(){
  const out=[];
  const weekend=isWeekend()&&!state.settings.weekendFollow;

  state.orders.forEach(o=>{
    if(["未付款","部分付款"].includes(o.paymentStatus)){
      out.push({type:"order",id:o.id,priority:"high",title:`${clientName(o.clientId)} · ${o.piNo||"PI"}`,meta:`${o.paymentStatus} · ${o.amount||0} ${o.currency||state.settings.currency}`});
    }
  });

  state.quotes.forEach(q=>{
    const due=q.nextFollowUp || (q.quoteDate?addDays(q.quoteDate,state.settings.quoteFollowDays):"");
    if(due && due<=todayISO() && !["成交","丢单","暂停"].includes(q.status)){
      const overdue=Math.max(0,daysBetween(due,todayISO())||0);
      out.push({type:"quote",id:q.id,priority:overdue>=5?"high":"normal",title:`${clientName(q.clientId)} · ${q.partNo||"报价"}`,meta:`${q.status||"已报价"} · ${overdue?`逾期${overdue}天`:"今天到期"}`});
    }
  });

  state.clients.forEach(c=>{
    if(c.nextFollowUp && c.nextFollowUp<=todayISO()){
      const long=["长期维护","沉睡客户"].includes(c.status);
      out.push({type:"client",id:c.id,priority:long?"long":c.grade==="A"?"high":"normal",title:c.company,meta:`${c.country||""} · ${c.status||""}`});
    }
  });

  const rank={high:3,normal:2,long:1}, map=new Map();
  out.forEach(x=>{
    const k=x.type+":"+x.id;
    if(!map.has(k)||rank[x.priority]>rank[map.get(k).priority]) map.set(k,x);
  });
  let arr=[...map.values()];
  if(weekend) arr=arr.filter(x=>x.priority==="high");
  return arr.sort((a,b)=>({high:0,normal:1,long:2}[a.priority]-{high:0,normal:1,long:2}[b.priority]));
}

// ============================================================
// 7. 渲染
// ============================================================
function renderAll(){
  renderDashboard();renderClients();renderFollowups();renderQuotes();renderOrders();
  renderTasks();renderHolidays();renderSettings();
  if(currentClientId && $("clientModal").classList.contains("show")) renderClientDetail();
}

function renderDashboard(){
  const follow=getFollowups();
  const stats=[
    ["今日待跟进",follow.length,`高优先级 ${follow.filter(x=>x.priority==="high").length}`],
    ["报价",state.quotes.length,"当前云端记录"],
    ["PI/订单",state.orders.length,`待付款 ${state.orders.filter(o=>["未付款","部分付款"].includes(o.paymentStatus)).length}`],
    ["未完成任务",state.tasks.filter(t=>!t.done).length,"实时同步"]
  ];
  $("stats").innerHTML=stats.map(s=>`<div class="stat"><div class="label">${s[0]}</div><div class="value">${s[1]}</div><div class="note">${s[2]}</div></div>`).join("");

  $("todayFollowups").innerHTML=follow.length?follow.slice(0,8).map(x=>`
    <div class="item" onclick="openLinked('${x.type}','${x.id}')"><div class="item-title">${esc(x.title)} ${badge(x.priority==="high"?"高优先级":x.priority==="long"?"长期维护":"正常",x.priority==="high"?"red":x.priority==="long"?"green":"orange")}</div><div class="item-meta">${esc(x.meta)}</div></div>`).join(""):empty("今天没有到期跟进。");

  const tasks=state.tasks.filter(t=>!t.done&&(!t.dueDate||t.dueDate<=todayISO())).slice(0,8);
  $("todayTasks").innerHTML=tasks.length?tasks.map(t=>`<div class="item"><div class="item-title">${esc(t.title)}</div><div class="item-meta">${t.dueDate?fmtDate(t.dueDate):"无日期"} · ${t.clientId?esc(clientName(t.clientId)):"未关联客户"}</div></div>`).join(""):empty("今天暂无任务。");
}

const clientStatuses=["新客户","已开发","已回复","有询价","已报价","重点跟进","PI","已成交","老客户","长期维护","沉睡客户","暂停开发","无效客户"];
function renderClients(){
  const sf=$("clientStatusFilter"), cur=sf.value;
  sf.innerHTML='<option value="">全部状态</option>'+clientStatuses.map(x=>`<option>${x}</option>`).join(""); sf.value=cur;
  const q=($("clientFilter").value||"").toLowerCase(), status=sf.value;
  const rows=state.clients.filter(c=>{
    const hay=[c.company,c.country,c.contact,c.email,c.whatsapp].join(" ").toLowerCase();
    return (!q||hay.includes(q))&&(!status||c.status===status);
  });
  $("clientTable").innerHTML=rows.length?rows.map(c=>`<tr>
    <td><b>${esc(c.company||"未命名")}</b></td><td>${esc(c.country||"—")}</td><td>${esc(c.contact||"—")}</td>
    <td>${badge(c.status||"—",["已成交","老客户"].includes(c.status)?"green":["PI","已报价","重点跟进"].includes(c.status)?"orange":"")}</td>
    <td>${esc(c.grade||"—")}</td><td>${fmtDate(c.nextFollowUp)}</td>
    <td><button class="btn small primary" onclick="openClient('${c.id}')">详情</button> <button class="btn small" onclick="openForm('client','${c.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('client','${c.id}')">删除</button></td>
  </tr>`).join(""):`<tr><td colspan="7">${empty("还没有客户。")}</td></tr>`;
}
$("clientFilter").addEventListener("input",renderClients);
$("clientStatusFilter").addEventListener("change",renderClients);

function renderFollowups(){
  const f=getFollowups();
  const html=x=>`<div class="item" onclick="openLinked('${x.type}','${x.id}')"><div class="item-title">${esc(x.title)}</div><div class="item-meta">${esc(x.meta)}</div></div>`;
  $("highFollow").innerHTML=f.filter(x=>x.priority==="high").map(html).join("")||empty("暂无");
  $("normalFollow").innerHTML=f.filter(x=>x.priority==="normal").map(html).join("")||empty("暂无");
  $("longFollow").innerHTML=f.filter(x=>x.priority==="long").map(html).join("")||empty("暂无");
}

function renderQuotes(){
  $("quoteTable").innerHTML=state.quotes.length?state.quotes.map(q=>`<tr>
    <td>${esc(clientName(q.clientId))}</td><td><b>${esc(q.partNo||"—")}</b></td><td>${esc(q.brand||"—")}</td><td>${esc(q.qty||"—")}</td>
    <td>${esc(q.quotePrice||"—")}</td><td>${badge(q.status||"—","orange")}</td><td>${fmtDate(q.nextFollowUp)}</td>
    <td><button class="btn small" onclick="openForm('quote','${q.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('quote','${q.id}')">删除</button></td>
  </tr>`).join(""):`<tr><td colspan="8">${empty("暂无报价。")}</td></tr>`;
}
function renderOrders(){
  $("orderTable").innerHTML=state.orders.length?state.orders.map(o=>`<tr>
    <td><b>${esc(o.piNo||"—")}</b></td><td>${esc(clientName(o.clientId))}</td><td>${esc(o.amount||0)} ${esc(o.currency||state.settings.currency)}</td>
    <td>${badge(o.paymentStatus||"—",["未付款","部分付款"].includes(o.paymentStatus)?"red":"green")}</td><td>${esc(o.orderStatus||"—")}</td><td>${esc(o.shipping||"—")}</td>
    <td><button class="btn small" onclick="openForm('order','${o.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('order','${o.id}')">删除</button></td>
  </tr>`).join(""):`<tr><td colspan="7">${empty("暂无PI / 订单。")}</td></tr>`;
}
function renderTasks(){
  const html=t=>`<div class="item"><div class="item-title">${esc(t.title)} ${badge(t.priority||"普通")}</div><div class="item-meta">${fmtDate(t.dueDate)} · ${t.clientId?esc(clientName(t.clientId)):"未关联客户"}</div><div style="margin-top:6px"><button class="btn small" onclick="toggleTask('${t.id}',${!t.done})">${t.done?"恢复":"完成"}</button> <button class="btn small" onclick="openForm('task','${t.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('task','${t.id}')">删除</button></div></div>`;
  $("taskOpen").innerHTML=state.tasks.filter(t=>!t.done).map(html).join("")||empty("暂无");
  $("taskDone").innerHTML=state.tasks.filter(t=>t.done).map(html).join("")||empty("暂无");
}
function renderHolidays(){
  $("holidayTable").innerHTML=state.holidays.length?state.holidays.map(h=>`<tr><td>${esc(h.country)}</td><td><b>${esc(h.name)}</b></td><td>${fmtDate(h.date)}</td><td>${esc(h.remindDays||7)}天</td><td><button class="btn small" onclick="openForm('holiday','${h.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('holiday','${h.id}')">删除</button></td></tr>`).join(""):`<tr><td colspan="5">${empty("暂无节假日。")}</td></tr>`;
}

// ============================================================
// 8. 通用新增 / 编辑
// ============================================================
const schemas={
  client:[
    ["company","公司名称","text",true],["country","国家","text"],["city","城市","text"],["website","官网","text"],
    ["grade","客户等级","select",false,["A","B","C","D"]],["status","客户状态","select",false,clientStatuses],
    ["contact","联系人","text"],["title","职位","text"],["email","Email","email"],["phone","电话","text"],["whatsapp","WhatsApp","text"],
    ["linkedin","LinkedIn","text"],["facebook","Facebook","text"],["telegram","Telegram","text"],
    ["lastContact","最后联系","date"],["nextFollowUp","下次跟进","date"],["notes","备注","textarea"]
  ],
  communication:[
    ["clientId","客户","client",true],["date","沟通日期","date",true],["channel","渠道","select",true,["Email","WhatsApp","Telegram","LinkedIn","Facebook","电话","其他"]],
    ["direction","方向","select",false,["我联系客户","客户回复","双向沟通"]],["subject","主题/简述","text"],["content","沟通内容","textarea",true],
    ["customerFeedback","客户反馈","textarea"],["nextAction","下一步","text"],["nextFollowUp","下次跟进","date"]
  ],
  quote:[
    ["clientId","客户","client",true],["partNo","型号","text",true],["brand","品牌","text"],["qty","数量","text"],["targetPrice","Target Price","text"],["quotePrice","报价","text"],
    ["status","状态","select",false,["待报价","找货中","已报价","等待回复","客户议价","重新报价","已做PI","成交","丢单","暂停"]],
    ["quoteDate","报价日期","date"],["nextFollowUp","下次跟进","date"],["notes","备注","textarea"]
  ],
  order:[
    ["clientId","客户","client",true],["piNo","PI编号","text",true],["amount","金额","number"],["currency","币种","select",false,["USD","EUR","CNY","TRY","RUB"]],
    ["paymentStatus","付款状态","select",false,["未付款","部分付款","已付款","退款/取消"]],
    ["orderStatus","订单状态","select",false,["PI待确认","PI待付款","已付款","备货中","待出货","已出货","已完成","暂停","取消"]],
    ["piDate","PI日期","date"],["deliveryDate","交期","date"],["shipping","物流","text"],["tracking","运单号","text"],["notes","备注","textarea"]
  ],
  task:[["title","任务名称","text",true],["priority","优先级","select",false,["高","普通","低"]],["dueDate","到期日期","date"],["clientId","关联客户","client"],["notes","备注","textarea"]],
  holiday:[["country","国家","text",true],["name","节日名称","text",true],["date","日期","date",true],["remindDays","提前提醒天数","number"],["notes","备注","textarea"]]
};

window.openForm = (type,id=null,preset={})=>{
  editing={type,id};
  const key=pathFor(type), existing=id?state[key].find(x=>x.id===id)||{}:{...preset};
  if(!id){
    if(type==="client"){existing.grade="C";existing.status="新客户"}
    if(type==="communication"){existing.date=todayISO();existing.channel="Email";existing.direction="我联系客户"}
    if(type==="quote"){existing.status="待报价";existing.quoteDate=todayISO();existing.nextFollowUp=addDays(todayISO(),state.settings.quoteFollowDays)}
    if(type==="order"){existing.paymentStatus="未付款";existing.orderStatus="PI待付款";existing.piDate=todayISO();existing.currency=state.settings.currency}
    if(type==="task"){existing.priority="普通";existing.dueDate=todayISO()}
    if(type==="holiday"){existing.remindDays=7}
  }
  const names={client:"客户",communication:"沟通记录",quote:"报价",order:"PI / 订单",task:"任务",holiday:"节假日"};
  $("formTitle").textContent=(id?"编辑 ":"新增 ")+names[type];
  $("formFields").innerHTML=schemas[type].map(f=>fieldHtml(f,existing[f[0]])).join("");
  $("formModal").classList.add("show");
};
function fieldHtml([key,label,type,required,opts],val){
  const req=required?"required":"";
  let c="";
  if(type==="textarea") c=`<textarea name="${key}" ${req}>${esc(val||"")}</textarea>`;
  else if(type==="select") c=`<select name="${key}" ${req}>${(opts||[]).map(o=>`<option ${String(val)===String(o)?"selected":""}>${esc(o)}</option>`).join("")}</select>`;
  else if(type==="client") c=`<select name="${key}" ${req}><option value="">请选择客户</option>${state.clients.map(x=>`<option value="${x.id}" ${val===x.id?"selected":""}>${esc(x.company)} · ${esc(x.country||"")}</option>`).join("")}</select>`;
  else c=`<input name="${key}" type="${type}" value="${esc(val??"")}" ${req}>`;
  return `<div class="field ${type==="textarea"?"full":""}"><label>${esc(label)}${required?" *":""}</label>${c}</div>`;
}
$("saveEntityBtn").addEventListener("click",saveEntity);
async function saveEntity(){
  const form=$("entityForm"); if(!form.reportValidity()) return;
  const fd=new FormData(form), obj={}; for(const [k,v] of fd.entries()) obj[k]=v;
  if(editing.type==="order") obj.amount=Number(obj.amount||0);
  if(editing.type==="holiday") obj.remindDays=Number(obj.remindDays||7);
  sync("busy","正在保存…");
  const key=pathFor(editing.type);

  if(editing.id){
    await updateDoc(doc(db,"users",currentUser.uid,key,editing.id),{...obj,updatedAt:serverTimestamp()});
  }else{
    const r=await addDoc(refCollection(key),{...obj,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    editing.id=r.id;
  }

  // 沟通记录联动客户最后联系 / 下次跟进
  if(editing.type==="communication" && obj.clientId){
    const updates={lastContact:obj.date||todayISO(),updatedAt:serverTimestamp()};
    if(obj.nextFollowUp) updates.nextFollowUp=obj.nextFollowUp;
    if(["客户回复","双向沟通"].includes(obj.direction)){
      const c=state.clients.find(x=>x.id===obj.clientId);
      if(c && ["新客户","已开发"].includes(c.status)) updates.status="已回复";
    }
    await updateDoc(doc(db,"users",currentUser.uid,"clients",obj.clientId),updates);
  }
  closeModal("formModal"); sync("ok","已自动同步");
}
window.removeEntity = async(type,id)=>{
  if(!confirm("确定删除这条记录吗？")) return;
  await deleteDoc(doc(db,"users",currentUser.uid,pathFor(type),id));
};
window.toggleTask = async(id,val)=> updateDoc(doc(db,"users",currentUser.uid,"tasks",id),{done:val,updatedAt:serverTimestamp()});

// ============================================================
// 9. 客户详情、时间轴、报价历史、附件
// ============================================================
window.openClient = id=>{
  currentClientId=id; renderClientDetail(); $("clientModal").classList.add("show");
};
window.openLinked = (type,id)=>{
  if(type==="client") return openClient(id);
  const key=pathFor(type), x=state[key].find(v=>v.id===id);
  if(x?.clientId) return openClient(x.clientId);
};

document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".pane").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");document.querySelector(`[data-pane="${b.dataset.tab}"]`)?.classList.add("active");
}));

function renderClientDetail(){
  const c=state.clients.find(x=>x.id===currentClientId); if(!c)return;
  const comms=state.communications.filter(x=>x.clientId===c.id).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const quotes=state.quotes.filter(x=>x.clientId===c.id).sort((a,b)=>(b.quoteDate||"").localeCompare(a.quoteDate||""));
  const orders=state.orders.filter(x=>x.clientId===c.id).sort((a,b)=>(b.piDate||"").localeCompare(a.piDate||""));
  const files=state.files.filter(x=>x.clientId===c.id).sort((a,b)=>(b.createdDate||"").localeCompare(a.createdDate||""));

  $("clientTitle").textContent=c.company||"客户详情";
  $("clientSub").textContent=[c.country,c.city,c.contact,c.email].filter(Boolean).join(" · ");
  $("clientOverview").innerHTML=`<div class="grid cols-2"><div class="card">
    <div class="item-meta">基本资料</div><h3>${esc(c.company||"")}</h3>
    <div class="item-meta">国家：${esc(c.country||"—")} · 等级：${esc(c.grade||"—")} · 状态：${esc(c.status||"—")}</div>
    <div class="item-meta">联系人：${esc(c.contact||"—")} · Email：${esc(c.email||"—")} · WhatsApp：${esc(c.whatsapp||"—")}</div>
  </div><div class="card"><div class="item-meta">当前状态</div><h3>下次跟进：${fmtDate(c.nextFollowUp)}</h3><div class="item-meta">最后联系：${fmtDate(c.lastContact)}</div>
    <div style="margin-top:8px"><button class="btn small primary" onclick="openForm('communication',null,{clientId:'${c.id}'})">记录沟通</button> <button class="btn small" onclick="openForm('quote',null,{clientId:'${c.id}'})">新增报价</button></div>
  </div></div>`;

  const events=[];
  comms.forEach(x=>events.push({date:x.date,kind:x.channel||"沟通",title:x.subject||x.direction||"沟通",desc:x.content||""}));
  quotes.forEach(x=>events.push({date:x.quoteDate,kind:"报价",title:`${x.partNo||"型号"} · ${x.status||""}`,desc:`数量：${x.qty||"—"}；报价：${x.quotePrice||"—"}`}));
  orders.forEach(x=>events.push({date:x.piDate,kind:"PI/订单",title:`${x.piNo||"PI"} · ${x.orderStatus||""}`,desc:`金额：${x.amount||0} ${x.currency||state.settings.currency}；付款：${x.paymentStatus||"—"}`}));
  events.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  $("clientTimeline").innerHTML=events.length?`<div class="timeline">${events.map(e=>`<div class="tl"><div class="date">${fmtDate(e.date)} · ${esc(e.kind)}</div><div class="title">${esc(e.title)}</div><div class="desc">${esc(e.desc)}</div></div>`).join("")}</div>`:empty("暂无历史。");

  $("clientComms").innerHTML=comms.length?comms.map(x=>`<div class="item"><div class="item-title">${esc(x.channel||"沟通")} · ${esc(x.direction||"")}</div><div class="item-meta">${fmtDate(x.date)} · ${esc(x.subject||"")}</div><div class="item-meta">${esc(x.content||"")}</div><div style="margin-top:6px"><button class="btn small" onclick="openForm('communication','${x.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('communication','${x.id}')">删除</button></div></div>`).join(""):empty("暂无沟通历史。");
  $("addCommBtn").onclick=()=>openForm("communication",null,{clientId:c.id});

  $("clientQuotes").innerHTML=quotes.length?`<div class="table-wrap"><table><thead><tr><th>日期</th><th>型号</th><th>数量</th><th>报价</th><th>状态</th></tr></thead><tbody>${quotes.map(q=>`<tr><td>${fmtDate(q.quoteDate)}</td><td>${esc(q.partNo||"")}</td><td>${esc(q.qty||"")}</td><td>${esc(q.quotePrice||"")}</td><td>${esc(q.status||"")}</td></tr>`).join("")}</tbody></table></div>`:empty("暂无报价。");

  $("clientFiles").innerHTML=files.length?files.map(f=>`<div class="item"><div class="item-title">${esc(f.name||"附件链接")}</div><div class="item-meta">${esc(f.category||"外部链接")} · ${esc(f.url||"")}</div><div style="margin-top:5px"><a class="btn small" href="${esc(f.url)}" target="_blank" rel="noopener">打开</a> <button class="btn small danger" onclick="removeFile('${f.id}')">删除</button></div></div>`).join(""):empty("暂无附件链接。");

  $("addFileLinkBtn").onclick=addClientFileLink;
  $("generateFollowupBtn").onclick=()=>generateFollowup(c.id);
}

async function addClientFileLink(){
  const name=$("clientFileName").value.trim();
  const url=$("clientFileUrl").value.trim();
  if(!name){alert("请填写文件名称。");return}
  if(!/^https?:\/\//i.test(url)){alert("请填写完整的网址，例如 https://drive.google.com/...");return}
  sync("busy","正在保存链接…");
  await addDoc(refCollection("files"),{
    clientId:currentClientId,name,url,category:"外部附件链接",
    createdDate:todayISO(),createdAt:serverTimestamp()
  });
  $("clientFileName").value="";
  $("clientFileUrl").value="";
  sync("ok","已自动同步");
}
window.removeFile = async id=>{
  const f=state.files.find(x=>x.id===id);if(!f||!confirm("确定删除这个附件链接吗？"))return;
  await deleteDoc(doc(db,"users",currentUser.uid,"files",id));
};

function generateFollowup(clientId){
  const c=state.clients.find(x=>x.id===clientId), comms=state.communications.filter(x=>x.clientId===clientId).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const quotes=state.quotes.filter(x=>x.clientId===clientId).sort((a,b)=>(b.quoteDate||"").localeCompare(a.quoteDate||""));
  const orders=state.orders.filter(x=>x.clientId===clientId).sort((a,b)=>(b.piDate||"").localeCompare(a.piDate||""));
  const unpaid=orders.find(o=>["未付款","部分付款"].includes(o.paymentStatus));
  const openQuote=quotes.find(q=>!["成交","丢单","暂停"].includes(q.status));
  const hello=c.contact?`Dear ${c.contact},`:"Dear Customer,", wh=c.contact?`Hi ${c.contact},`:"Hi,";
  let strategy,email,wa;

  if(unpaid){
    strategy=`高优先级：存在 ${unpaid.piNo||"PI"}，付款状态为 ${unpaid.paymentStatus}。建议先确认付款安排和是否有流程障碍，不重复介绍公司。`;
    email=`Subject: Follow-up on ${unpaid.piNo||"our PI"}\n\n${hello}\n\nJust a quick follow-up regarding ${unpaid.piNo||"the PI"} we sent earlier.\n\nPlease let me know if the payment schedule is clear or if there is anything we should clarify or adjust on our side before you proceed.\n\nBest regards`;
    wa=`${wh} just a quick follow-up regarding ${unpaid.piNo||"the PI"} we sent earlier. Please let me know if the payment arrangement is clear or if there is anything we should clarify on our side.`;
  }else if(openQuote){
    strategy=`建议跟进最近报价 ${openQuote.partNo||""}。先询问价格、交期或规格反馈；如果价格敏感，优先让客户给 target price。`;
    email=`Subject: Follow-up on quotation – ${openQuote.partNo||"your RFQ"}\n\n${hello}\n\nI’m following up on our quotation for ${openQuote.partNo||"your recent RFQ"}.\n\nPlease let me know if you have any feedback on the price, lead time or specification. If you have a target price, feel free to share it with me and I’ll check again with our team.\n\nBest regards`;
    wa=`${wh} I’m following up on our quotation for ${openQuote.partNo||"your recent RFQ"}. Do you have any feedback on the price or lead time? If you have a target price, feel free to send it to me.`;
  }else{
    strategy=`当前没有未付款 PI 或有效报价，建议做轻量关系维护。最近沟通 ${comms[0]?fmtDate(comms[0].date):"暂无"}。`;
    email=`Subject: Quick follow-up\n\n${hello}\n\nJust checking in to see how things are going on your side.\n\nIf you have any new RFQs, BOM requirements or sourcing issues recently, feel free to send them to me.\n\nBest regards`;
    wa=`${wh} just checking in. If you have any new RFQs or component sourcing requirements recently, feel free to send them to me.`;
  }
  $("followupStrategy").textContent=strategy;$("followupEmail").value=email;$("followupWA").value=wa;
}

// ============================================================
// 10. 搜索
// ============================================================
$("globalSearch").addEventListener("input",()=>{
  const q=$("globalSearch").value.trim().toLowerCase(); if(!q){$("searchResults").classList.remove("show");return}
  const items=[];
  state.clients.forEach(x=>items.push({type:"client",id:x.id,title:x.company,meta:`客户 · ${x.country||""} · ${x.contact||""}`,text:Object.values(x).join(" ")}));
  state.quotes.forEach(x=>items.push({type:"quote",id:x.id,title:x.partNo||"报价",meta:`报价 · ${clientName(x.clientId)}`,text:Object.values(x).join(" ")+" "+clientName(x.clientId)}));
  state.orders.forEach(x=>items.push({type:"order",id:x.id,title:x.piNo||"PI",meta:`订单 · ${clientName(x.clientId)}`,text:Object.values(x).join(" ")+" "+clientName(x.clientId)}));
  state.communications.forEach(x=>items.push({type:"communication",id:x.id,title:x.subject||x.content?.slice(0,28)||"沟通",meta:`沟通 · ${clientName(x.clientId)} · ${x.channel||""}`,text:Object.values(x).join(" ")+" "+clientName(x.clientId)}));
  const r=items.filter(x=>(x.title+" "+x.meta+" "+x.text).toLowerCase().includes(q)).slice(0,20);
  $("searchResults").innerHTML=r.map(x=>`<div class="search-item" onclick="openSearch('${x.type}','${x.id}')"><b>${esc(x.title)}</b><div>${esc(x.meta)}</div></div>`).join("")||`<div class="search-item"><div>没有结果</div></div>`;
  $("searchResults").classList.add("show");
});
window.openSearch=(type,id)=>{
  $("searchResults").classList.remove("show");$("globalSearch").value="";
  if(type==="client")openClient(id);
  else{
    const key=pathFor(type), x=state[key].find(v=>v.id===id);
    if(x?.clientId) openClient(x.clientId);
  }
};

// ============================================================
// 11. V2.1 JSON 一键迁移
// ============================================================
$("migrationFile").addEventListener("change",async e=>{
  const f=e.target.files[0]; if(!f)return;
  try{
    const obj=JSON.parse(await f.text());
    if(!Array.isArray(obj.clients)) throw new Error("不是有效的 V2.1 备份");
    migrationPayload=obj;
    $("migrationPreview").innerHTML=`<div class="notice">检测到：客户 ${obj.clients?.length||0}、沟通 ${obj.communications?.length||0}、报价 ${obj.quotes?.length||0}、PI/订单 ${obj.orders?.length||0}、任务 ${obj.tasks?.length||0}、节假日 ${obj.holidays?.length||0}。</div>`;
    $("migrationBtn").disabled=false;
  }catch(err){
    migrationPayload=null;$("migrationBtn").disabled=true;alert("读取失败："+err.message);
  }
});
$("migrationBtn").addEventListener("click",async()=>{
  if(!migrationPayload)return;
  if(!confirm("将旧版数据导入到当前 Google 账号云端。确认继续吗？"))return;
  sync("busy","正在迁移数据…");
  const mapping=[["clients","clients"],["communications","communications"],["quotes","quotes"],["orders","orders"],["tasks","tasks"],["holidays","holidays"]];
  for(const [source,target] of mapping){
    const arr=migrationPayload[source]||[];
    // Firestore batch 每批最多建议 400 左右，避免接近 500 上限
    for(let i=0;i<arr.length;i+=400){
      const batch=writeBatch(db);
      arr.slice(i,i+400).forEach(item=>{
        const {id,...data}=item;
        const targetRef=id?doc(db,"users",currentUser.uid,target,String(id)):doc(refCollection(target));
        batch.set(targetRef,{...data,migratedAt:serverTimestamp()},{merge:true});
      });
      await batch.commit();
    }
  }
  if(migrationPayload.settings){
    await setDoc(doc(db,"users",currentUser.uid,"settings","main"),migrationPayload.settings,{merge:true});
  }
  sync("ok","迁移完成");alert("V2.1 数据已迁移到云端。");
});

// ============================================================
// 12. 设置
// ============================================================
function renderSettings(){
  $("setQuoteDays").value=state.settings.quoteFollowDays??5;
  $("setDormantDays").value=state.settings.dormantDays??30;
  $("setWeekend").value=String(state.settings.weekendFollow??false);
  $("setCurrency").value=state.settings.currency||"USD";
}
$("saveSettingsBtn").addEventListener("click",async()=>{
  const data={
    quoteFollowDays:Number($("setQuoteDays").value||5),dormantDays:Number($("setDormantDays").value||30),
    weekendFollow:$("setWeekend").value==="true",currency:$("setCurrency").value
  };
  await setDoc(doc(db,"users",currentUser.uid,"settings","main"),data,{merge:true});
  alert("设置已同步。");
});

// ============================================================
// 13. 本地数据助手
// ============================================================
$("sendChatBtn").addEventListener("click",sendChat);
$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat()}});
function addMsg(text,role){const d=document.createElement("div");d.className="msg "+role;d.textContent=text;$("chatLog").appendChild(d);$("chatLog").scrollTop=$("chatLog").scrollHeight}
function sendChat(){
  const q=$("chatInput").value.trim();if(!q)return;addMsg(q,"user");$("chatInput").value="";
  setTimeout(()=>addMsg(localAnswer(q),"ai"),120);
}
function localAnswer(q){
  const s=q.toLowerCase(), f=getFollowups();
  if((s.includes("今天")||s.includes("先"))&&(s.includes("跟进")||s.includes("做"))){
    return f.length?"今天建议：\n"+f.slice(0,8).map((x,i)=>`${i+1}. ${x.title} — ${x.meta}`).join("\n"):"今天没有到期跟进。";
  }
  if(s.includes("pi")||s.includes("付款")){
    const a=state.orders.filter(o=>["未付款","部分付款"].includes(o.paymentStatus));
    return a.length?"待付款：\n"+a.map((o,i)=>`${i+1}. ${o.piNo||"PI"} · ${clientName(o.clientId)} · ${o.amount||0} ${o.currency||state.settings.currency}`).join("\n"):"当前没有待付款 PI。";
  }
  if(s.includes("报价")) {
    const a=f.filter(x=>x.type==="quote");
    return a.length?"需要跟进的报价：\n"+a.map((x,i)=>`${i+1}. ${x.title} · ${x.meta}`).join("\n"):"当前没有到期报价。";
  }
  return `当前云端有 ${state.clients.length} 家客户、${state.communications.length} 条沟通记录、${state.quotes.length} 条报价、${state.orders.length} 个 PI/订单。`;
}

// ============================================================
// 14. 帮助、弹窗、PWA
// ============================================================
const helpText={
  followups:"首页会综合 PI 付款状态、报价下次跟进日期和客户下次跟进日期自动排序。",
  tasks:"任务中心用于管理每日开发、WhatsApp、Facebook 和客户跟进任务。",
  files:"V3 免费版不使用 Firebase Storage。把 PI、报价、Datasheet、图片等上传到 Google Drive / OneDrive / WPS 云盘，再把共享链接保存到客户档案，链接会在电脑和手机之间自动同步。",
};
document.querySelectorAll(".help").forEach(b=>b.addEventListener("click",()=>{$("helpBody").textContent=helpText[b.dataset.help]||"暂无说明。";$("helpModal").classList.add("show")}));
window.closeModal=id=>$(id).classList.remove("show");
document.querySelectorAll(".modal-bg").forEach(x=>x.addEventListener("click",e=>{if(e.target===x)x.classList.remove("show")}));
document.addEventListener("click",e=>{if(innerWidth<=820&&!e.target.closest(".sidebar")&&!e.target.closest("#menuBtn"))$("sidebar").classList.remove("open")});

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(console.warn));
}
