import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  onAuthStateChanged, signOut, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, onSnapshot, query, where, orderBy, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ============================================================
// 1. Firebase 初始化
// ============================================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
try { await setPersistence(auth, browserLocalPersistence); } catch(e) { console.warn("auth persistence", e); }
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let currentClientId = null;
let editing = { type:null, id:null };
let migrationPayload = null;
let excelImportRows = [];
let excelImportFileName = "";

const state = {
  clients: [],
  communications: [],
  quotes: [],
  orders: [],
  tasks: [],
  holidays: [],
  holidayCountries: [],
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
// 全球国家 / 节假日自动同步
// 数据源：Nager.Holidays Community API v4（无需 API Key）
// ============================================================
const COUNTRY_DATA = [{"code":"AF","name":"Afghanistan"},{"code":"AL","name":"Albania"},{"code":"DZ","name":"Algeria"},{"code":"AS","name":"American Samoa"},{"code":"AD","name":"Andorra"},{"code":"AO","name":"Angola"},{"code":"AI","name":"Anguilla"},{"code":"AQ","name":"Antarctica"},{"code":"AG","name":"Antigua and Barbuda"},{"code":"AR","name":"Argentina"},{"code":"AM","name":"Armenia"},{"code":"AW","name":"Aruba"},{"code":"AU","name":"Australia"},{"code":"AT","name":"Austria"},{"code":"AZ","name":"Azerbaijan"},{"code":"BS","name":"Bahamas"},{"code":"BH","name":"Bahrain"},{"code":"BD","name":"Bangladesh"},{"code":"BB","name":"Barbados"},{"code":"BY","name":"Belarus"},{"code":"BE","name":"Belgium"},{"code":"BZ","name":"Belize"},{"code":"BJ","name":"Benin"},{"code":"BM","name":"Bermuda"},{"code":"BT","name":"Bhutan"},{"code":"BO","name":"Bolivia, Plurinational State of"},{"code":"BQ","name":"Bonaire, Sint Eustatius and Saba"},{"code":"BA","name":"Bosnia and Herzegovina"},{"code":"BW","name":"Botswana"},{"code":"BV","name":"Bouvet Island"},{"code":"BR","name":"Brazil"},{"code":"IO","name":"British Indian Ocean Territory"},{"code":"BN","name":"Brunei Darussalam"},{"code":"BG","name":"Bulgaria"},{"code":"BF","name":"Burkina Faso"},{"code":"BI","name":"Burundi"},{"code":"CV","name":"Cabo Verde"},{"code":"KH","name":"Cambodia"},{"code":"CM","name":"Cameroon"},{"code":"CA","name":"Canada"},{"code":"KY","name":"Cayman Islands"},{"code":"CF","name":"Central African Republic"},{"code":"TD","name":"Chad"},{"code":"CL","name":"Chile"},{"code":"CN","name":"China"},{"code":"CX","name":"Christmas Island"},{"code":"CC","name":"Cocos (Keeling) Islands"},{"code":"CO","name":"Colombia"},{"code":"KM","name":"Comoros"},{"code":"CG","name":"Congo"},{"code":"CD","name":"Congo, The Democratic Republic of the"},{"code":"CK","name":"Cook Islands"},{"code":"CR","name":"Costa Rica"},{"code":"HR","name":"Croatia"},{"code":"CU","name":"Cuba"},{"code":"CW","name":"Curaçao"},{"code":"CY","name":"Cyprus"},{"code":"CZ","name":"Czechia"},{"code":"CI","name":"Côte d'Ivoire"},{"code":"DK","name":"Denmark"},{"code":"DJ","name":"Djibouti"},{"code":"DM","name":"Dominica"},{"code":"DO","name":"Dominican Republic"},{"code":"EC","name":"Ecuador"},{"code":"EG","name":"Egypt"},{"code":"SV","name":"El Salvador"},{"code":"GQ","name":"Equatorial Guinea"},{"code":"ER","name":"Eritrea"},{"code":"EE","name":"Estonia"},{"code":"SZ","name":"Eswatini"},{"code":"ET","name":"Ethiopia"},{"code":"FK","name":"Falkland Islands (Malvinas)"},{"code":"FO","name":"Faroe Islands"},{"code":"FJ","name":"Fiji"},{"code":"FI","name":"Finland"},{"code":"FR","name":"France"},{"code":"GF","name":"French Guiana"},{"code":"PF","name":"French Polynesia"},{"code":"TF","name":"French Southern Territories"},{"code":"GA","name":"Gabon"},{"code":"GM","name":"Gambia"},{"code":"GE","name":"Georgia"},{"code":"DE","name":"Germany"},{"code":"GH","name":"Ghana"},{"code":"GI","name":"Gibraltar"},{"code":"GR","name":"Greece"},{"code":"GL","name":"Greenland"},{"code":"GD","name":"Grenada"},{"code":"GP","name":"Guadeloupe"},{"code":"GU","name":"Guam"},{"code":"GT","name":"Guatemala"},{"code":"GG","name":"Guernsey"},{"code":"GN","name":"Guinea"},{"code":"GW","name":"Guinea-Bissau"},{"code":"GY","name":"Guyana"},{"code":"HT","name":"Haiti"},{"code":"HM","name":"Heard Island and McDonald Islands"},{"code":"VA","name":"Holy See (Vatican City State)"},{"code":"HN","name":"Honduras"},{"code":"HK","name":"Hong Kong"},{"code":"HU","name":"Hungary"},{"code":"IS","name":"Iceland"},{"code":"IN","name":"India"},{"code":"ID","name":"Indonesia"},{"code":"IR","name":"Iran, Islamic Republic of"},{"code":"IQ","name":"Iraq"},{"code":"IE","name":"Ireland"},{"code":"IM","name":"Isle of Man"},{"code":"IL","name":"Israel"},{"code":"IT","name":"Italy"},{"code":"JM","name":"Jamaica"},{"code":"JP","name":"Japan"},{"code":"JE","name":"Jersey"},{"code":"JO","name":"Jordan"},{"code":"KZ","name":"Kazakhstan"},{"code":"KE","name":"Kenya"},{"code":"KI","name":"Kiribati"},{"code":"KP","name":"Korea, Democratic People's Republic of"},{"code":"KR","name":"Korea, Republic of"},{"code":"KW","name":"Kuwait"},{"code":"KG","name":"Kyrgyzstan"},{"code":"LA","name":"Lao People's Democratic Republic"},{"code":"LV","name":"Latvia"},{"code":"LB","name":"Lebanon"},{"code":"LS","name":"Lesotho"},{"code":"LR","name":"Liberia"},{"code":"LY","name":"Libya"},{"code":"LI","name":"Liechtenstein"},{"code":"LT","name":"Lithuania"},{"code":"LU","name":"Luxembourg"},{"code":"MO","name":"Macao"},{"code":"MG","name":"Madagascar"},{"code":"MW","name":"Malawi"},{"code":"MY","name":"Malaysia"},{"code":"MV","name":"Maldives"},{"code":"ML","name":"Mali"},{"code":"MT","name":"Malta"},{"code":"MH","name":"Marshall Islands"},{"code":"MQ","name":"Martinique"},{"code":"MR","name":"Mauritania"},{"code":"MU","name":"Mauritius"},{"code":"YT","name":"Mayotte"},{"code":"MX","name":"Mexico"},{"code":"FM","name":"Micronesia, Federated States of"},{"code":"MD","name":"Moldova, Republic of"},{"code":"MC","name":"Monaco"},{"code":"MN","name":"Mongolia"},{"code":"ME","name":"Montenegro"},{"code":"MS","name":"Montserrat"},{"code":"MA","name":"Morocco"},{"code":"MZ","name":"Mozambique"},{"code":"MM","name":"Myanmar"},{"code":"NA","name":"Namibia"},{"code":"NR","name":"Nauru"},{"code":"NP","name":"Nepal"},{"code":"NL","name":"Netherlands"},{"code":"NC","name":"New Caledonia"},{"code":"NZ","name":"New Zealand"},{"code":"NI","name":"Nicaragua"},{"code":"NE","name":"Niger"},{"code":"NG","name":"Nigeria"},{"code":"NU","name":"Niue"},{"code":"NF","name":"Norfolk Island"},{"code":"MK","name":"North Macedonia"},{"code":"MP","name":"Northern Mariana Islands"},{"code":"NO","name":"Norway"},{"code":"OM","name":"Oman"},{"code":"PK","name":"Pakistan"},{"code":"PW","name":"Palau"},{"code":"PS","name":"Palestine, State of"},{"code":"PA","name":"Panama"},{"code":"PG","name":"Papua New Guinea"},{"code":"PY","name":"Paraguay"},{"code":"PE","name":"Peru"},{"code":"PH","name":"Philippines"},{"code":"PN","name":"Pitcairn"},{"code":"PL","name":"Poland"},{"code":"PT","name":"Portugal"},{"code":"PR","name":"Puerto Rico"},{"code":"QA","name":"Qatar"},{"code":"RO","name":"Romania"},{"code":"RU","name":"Russian Federation"},{"code":"RW","name":"Rwanda"},{"code":"RE","name":"Réunion"},{"code":"BL","name":"Saint Barthélemy"},{"code":"SH","name":"Saint Helena, Ascension and Tristan da Cunha"},{"code":"KN","name":"Saint Kitts and Nevis"},{"code":"LC","name":"Saint Lucia"},{"code":"MF","name":"Saint Martin (French part)"},{"code":"PM","name":"Saint Pierre and Miquelon"},{"code":"VC","name":"Saint Vincent and the Grenadines"},{"code":"WS","name":"Samoa"},{"code":"SM","name":"San Marino"},{"code":"ST","name":"Sao Tome and Principe"},{"code":"SA","name":"Saudi Arabia"},{"code":"SN","name":"Senegal"},{"code":"RS","name":"Serbia"},{"code":"SC","name":"Seychelles"},{"code":"SL","name":"Sierra Leone"},{"code":"SG","name":"Singapore"},{"code":"SX","name":"Sint Maarten (Dutch part)"},{"code":"SK","name":"Slovakia"},{"code":"SI","name":"Slovenia"},{"code":"SB","name":"Solomon Islands"},{"code":"SO","name":"Somalia"},{"code":"ZA","name":"South Africa"},{"code":"GS","name":"South Georgia and the South Sandwich Islands"},{"code":"SS","name":"South Sudan"},{"code":"ES","name":"Spain"},{"code":"LK","name":"Sri Lanka"},{"code":"SD","name":"Sudan"},{"code":"SR","name":"Suriname"},{"code":"SJ","name":"Svalbard and Jan Mayen"},{"code":"SE","name":"Sweden"},{"code":"CH","name":"Switzerland"},{"code":"SY","name":"Syrian Arab Republic"},{"code":"TW","name":"Taiwan, Province of China"},{"code":"TJ","name":"Tajikistan"},{"code":"TZ","name":"Tanzania, United Republic of"},{"code":"TH","name":"Thailand"},{"code":"TL","name":"Timor-Leste"},{"code":"TG","name":"Togo"},{"code":"TK","name":"Tokelau"},{"code":"TO","name":"Tonga"},{"code":"TT","name":"Trinidad and Tobago"},{"code":"TN","name":"Tunisia"},{"code":"TM","name":"Turkmenistan"},{"code":"TC","name":"Turks and Caicos Islands"},{"code":"TV","name":"Tuvalu"},{"code":"TR","name":"Türkiye"},{"code":"UG","name":"Uganda"},{"code":"UA","name":"Ukraine"},{"code":"AE","name":"United Arab Emirates"},{"code":"GB","name":"United Kingdom"},{"code":"US","name":"United States"},{"code":"UM","name":"United States Minor Outlying Islands"},{"code":"UY","name":"Uruguay"},{"code":"UZ","name":"Uzbekistan"},{"code":"VU","name":"Vanuatu"},{"code":"VE","name":"Venezuela, Bolivarian Republic of"},{"code":"VN","name":"Viet Nam"},{"code":"VG","name":"Virgin Islands, British"},{"code":"VI","name":"Virgin Islands, U.S."},{"code":"WF","name":"Wallis and Futuna"},{"code":"EH","name":"Western Sahara"},{"code":"YE","name":"Yemen"},{"code":"ZM","name":"Zambia"},{"code":"ZW","name":"Zimbabwe"},{"code":"AX","name":"Åland Islands"}];

let regionNames = null;
try { regionNames = new Intl.DisplayNames(["zh-CN"], {type:"region"}); } catch(e) {}
const normalizeCountryName = v => String(v||"").trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[\s._,'’()（）\-\/]+/g,"");
const COUNTRY_ALIASES = {
  "俄国":"RU","俄罗斯":"RU","russia":"RU","russianfederation":"RU",
  "白俄罗斯":"BY","belarus":"BY","byelorussia":"BY","bielorrussia":"BY",
  "土耳其":"TR","turkiye":"TR","türkiye":"TR","turkey":"TR",
  "巴西":"BR","brazil":"BR","brasil":"BR",
  "印度尼西亚":"ID","印尼":"ID","indonesia":"ID",
  "南非":"ZA","southafrica":"ZA","africadosul":"ZA",
  "阿联酋":"AE","阿拉伯联合酋长国":"AE","uae":"AE","unitedarabemirates":"AE",
  "斯里兰卡":"LK","srilanka":"LK",
  "乌克兰":"UA","ukraine":"UA",
  "中国":"CN","中国大陆":"CN","china":"CN","prc":"CN",
  "美国":"US","美國":"US","usa":"US","us":"US","unitedstates":"US","unitedstatesofamerica":"US","estadosunidos":"US",
  "英国":"GB","英國":"GB","uk":"GB","greatbritain":"GB","unitedkingdom":"GB","reinounido":"GB",
  "德国":"DE","德國":"DE","germany":"DE","alemanha":"DE",
  "法国":"FR","法國":"FR","france":"FR","franca":"FR",
  "意大利":"IT","义大利":"IT","italy":"IT","italia":"IT",
  "西班牙":"ES","spain":"ES",
  "葡萄牙":"PT","portugal":"PT",
  "波兰":"PL","波蘭":"PL","poland":"PL","polonia":"PL",
  "荷兰":"NL","荷蘭":"NL","netherlands":"NL","holland":"NL","paisesbaixos":"NL",
  "比利时":"BE","比利時":"BE","belgium":"BE",
  "瑞典":"SE","sweden":"SE","挪威":"NO","norway":"NO","芬兰":"FI","芬蘭":"FI","finland":"FI","丹麦":"DK","丹麥":"DK","denmark":"DK","冰岛":"IS","冰島":"IS","iceland":"IS",
  "印度":"IN","india":"IN","日本":"JP","japan":"JP","韩国":"KR","韓國":"KR","southkorea":"KR","korea":"KR",
  "新加坡":"SG","singapore":"SG","马来西亚":"MY","馬來西亞":"MY","malaysia":"MY","泰国":"TH","泰國":"TH","thailand":"TH","越南":"VN","vietnam":"VN","菲律宾":"PH","菲律賓":"PH","philippines":"PH",
  "沙特":"SA","沙特阿拉伯":"SA","saudiarabia":"SA","卡塔尔":"QA","卡塔爾":"QA","qatar":"QA","科威特":"KW","kuwait":"KW","以色列":"IL","israel":"IL",
  "墨西哥":"MX","mexico":"MX","加拿大":"CA","canada":"CA","阿根廷":"AR","argentina":"AR","智利":"CL","chile":"CL","哥伦比亚":"CO","哥倫比亞":"CO","colombia":"CO",
  "澳大利亚":"AU","澳大利亞":"AU","澳洲":"AU","australia":"AU","新西兰":"NZ","新西蘭":"NZ","newzealand":"NZ"
};
function countryDisplayName(code){
  const c=COUNTRY_DATA.find(x=>x.code===code);
  try { return regionNames?.of(code)||c?.name||code; } catch(e) { return c?.name||code; }
}
function resolveCountryCode(input){
  const raw=String(input||"").trim(); if(!raw) return "";
  const up=raw.toUpperCase(); if(/^[A-Z]{2}$/.test(up) && COUNTRY_DATA.some(x=>x.code===up)) return up;
  const n=normalizeCountryName(raw);
  if(COUNTRY_ALIASES[n]) return COUNTRY_ALIASES[n];
  for(const c of COUNTRY_DATA){
    if(normalizeCountryName(c.name)===n) return c.code;
    if(normalizeCountryName(countryDisplayName(c.code))===n) return c.code;
  }
  return "";
}
function initHolidayCountrySelect(){
  const el=$("holidayCountrySelect"); if(!el) return;
  const sorted=[...COUNTRY_DATA].sort((a,b)=>countryDisplayName(a.code).localeCompare(countryDisplayName(b.code),"zh-CN"));
  el.innerHTML='<option value="">选择国家…</option>'+sorted.map(c=>`<option value="${c.code}">${esc(countryDisplayName(c.code))} (${c.code})</option>`).join("");
}
let holidayAutoSyncTimer=null, holidayAutoSyncBusy=false, clientCountryDiscoveryTimer=null, clientCountryDiscoveryBusy=false;
function scheduleHolidayAutoSync(){
  clearTimeout(holidayAutoSyncTimer);
  holidayAutoSyncTimer=setTimeout(()=>autoSyncHolidayCountries(),1000);
}
function scheduleClientCountryDiscovery(){
  clearTimeout(clientCountryDiscoveryTimer);
  clientCountryDiscoveryTimer=setTimeout(()=>autoTrackExistingClientCountries(),1200);
}
function holidayDocId(code,date,name){
  let h=2166136261; const s=`${code}|${date}|${name}`;
  for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
  return `auto_${code}_${date}_${(h>>>0).toString(36)}`;
}
async function addHolidayCountry(code,{silent=false,source="手动添加"}={}){
  if(!currentUser||!code) return false;
  code=code.toUpperCase();
  if(!COUNTRY_DATA.some(x=>x.code===code)) return false;
  const r=doc(db,"users",currentUser.uid,"holidayCountries",code);
  await setDoc(r,{code,name:countryDisplayName(code),source,enabled:true,updatedAt:serverTimestamp(),addedAt:serverTimestamp()},{merge:true});
  if(!silent) await syncHolidayCountry(code,true);
  return true;
}
async function autoTrackCountriesFromNames(names=[]){
  if(!currentUser) return [];
  const codes=[...new Set(names.map(resolveCountryCode).filter(Boolean))];
  const existing=new Set(state.holidayCountries.map(x=>x.code));
  const added=[];
  for(const code of codes){
    if(existing.has(code)) continue;
    await addHolidayCountry(code,{silent:true,source:"客户国家自动识别"});
    existing.add(code); added.push(code);
  }
  if(added.length) scheduleHolidayAutoSync();
  return added;
}
async function autoTrackExistingClientCountries(){
  if(clientCountryDiscoveryBusy||!currentUser||!state.clients.length) return;
  clientCountryDiscoveryBusy=true;
  try{ await autoTrackCountriesFromNames(state.clients.map(c=>c.country).filter(Boolean)); }
  catch(e){ console.warn("client country discovery",e); }
  finally{ clientCountryDiscoveryBusy=false; }
}
async function fetchCountryHolidays(code,year){
  const url=`https://nagerholidays.com/api/v4/Holidays/${encodeURIComponent(code)}/${year}`;
  const res=await fetch(url,{cache:"no-store",headers:{"Accept":"application/json"}});
  if(!res.ok) throw new Error(`节假日服务返回 ${res.status}`);
  const data=await res.json();
  if(!Array.isArray(data)) throw new Error("节假日数据格式异常");
  return data.filter(h=>h?.date && (h.nationalHoliday!==false) && (!Array.isArray(h.holidayTypes)||!h.holidayTypes.length||h.holidayTypes.includes("Public")));
}
async function syncHolidayCountry(code,force=false){
  if(!currentUser||!code) return;
  const tracked=state.holidayCountries.find(x=>x.code===code);
  if(!force && tracked?.lastSyncDate===todayISO()) return;
  const status=$("holidaySyncStatus"); if(status) status.textContent=`正在更新 ${countryDisplayName(code)}…`;
  try{
    const y=new Date().getFullYear(), years=[y,y+1], all=[];
    for(const year of years){
      const rows=await fetchCountryHolidays(code,year);
      rows.forEach(h=>all.push({...h,year}));
    }
    const oldSnap=await getDocs(query(refCollection("holidays"),where("countryCode","==",code)));
    const oldAuto=oldSnap.docs.filter(d=>d.data()?.auto===true && years.includes(Number(d.data()?.year)));
    const keep=new Set();
    const ops=[];
    all.forEach(h=>{
      const id=holidayDocId(code,h.date,h.name||"Holiday"); keep.add(id);
      ops.push({kind:"set",ref:doc(db,"users",currentUser.uid,"holidays",id),data:{
        country:countryDisplayName(code),countryCode:code,name:h.name||"Public Holiday",date:h.date,
        remindDays:Number(tracked?.remindDays||7),notes:"由全球节假日服务自动同步",auto:true,source:"Nager.Holidays",
        year:h.year,holidayTypes:h.holidayTypes||[],nationalHoliday:h.nationalHoliday!==false,updatedAt:serverTimestamp()
      }});
    });
    oldAuto.forEach(d=>{ if(!keep.has(d.id)) ops.push({kind:"delete",ref:d.ref}); });
    for(let i=0;i<ops.length;i+=350){
      const batch=writeBatch(db);
      ops.slice(i,i+350).forEach(op=>op.kind==="set"?batch.set(op.ref,op.data,{merge:true}):batch.delete(op.ref));
      await batch.commit();
    }
    await setDoc(doc(db,"users",currentUser.uid,"holidayCountries",code),{
      code,name:countryDisplayName(code),enabled:true,lastSyncDate:todayISO(),lastSyncAt:serverTimestamp(),lastSyncYears:years,lastError:"",updatedAt:serverTimestamp()
    },{merge:true});
    if(status) status.textContent=`${countryDisplayName(code)} 已更新 ${all.length} 个公共节假日`;
  }catch(err){
    console.error("holiday sync",code,err);
    await setDoc(doc(db,"users",currentUser.uid,"holidayCountries",code),{lastError:String(err.message||err),updatedAt:serverTimestamp()},{merge:true}).catch(()=>{});
    if(status) status.textContent=`${countryDisplayName(code)} 更新失败：${err.message||err}`;
    if(force) alert(`${countryDisplayName(code)} 节假日更新失败：${err.message||err}\n\n你仍可保留这个国家，系统下次打开时会自动重试。`);
  }
}
async function autoSyncHolidayCountries(){
  if(holidayAutoSyncBusy||!currentUser||!state.holidayCountries.length) return;
  holidayAutoSyncBusy=true;
  try{
    for(const c of state.holidayCountries.filter(x=>x.enabled!==false)){
      if(c.lastSyncDate!==todayISO()) await syncHolidayCountry(c.code,false);
    }
  }finally{ holidayAutoSyncBusy=false; renderHolidays(); }
}
window.refreshHolidayCountry=code=>syncHolidayCountry(code,true);
window.removeHolidayCountry=async code=>{
  if(!currentUser||!confirm(`停止关注 ${countryDisplayName(code)}，并删除该国家自动同步的节假日吗？`)) return;
  const snap=await getDocs(query(refCollection("holidays"),where("countryCode","==",code)));
  const refs=snap.docs.filter(d=>d.data()?.auto===true).map(d=>d.ref);
  for(let i=0;i<refs.length;i+=350){const batch=writeBatch(db);refs.slice(i,i+350).forEach(r=>batch.delete(r));await batch.commit();}
  await deleteDoc(doc(db,"users",currentUser.uid,"holidayCountries",code));
};

// ============================================================
// 3. 登录 / 登出
// ============================================================
async function doLogin(){
  const btn = $("googleLoginBtn");
  if(btn) btn.disabled = true;
  try{
    // GitHub Pages 与 Firebase Auth 域名不同。手机端不再回退到 redirect，
    // 避免 iPhone/移动浏览器停在 firebaseapp.com 空白页。
    await signInWithPopup(auth, provider);
  }catch(err){
    console.error("Google login failed", err);
    const code = err?.code || "";
    let msg = "Google 登录没有完成，请允许此网站弹出窗口后再试。";
    if(code.includes("popup-closed-by-user")) msg = "登录窗口被关闭了，请重新点击“使用 Google 登录”。";
    if(code.includes("popup-blocked")) msg = "浏览器拦截了登录窗口，请允许 miya-trade.github.io 的弹出窗口后重试。";
    if(code.includes("unauthorized-domain")) msg = "当前网站域名尚未加入 Firebase Authorized domains。";
    alert(msg);
  }finally{
    if(btn) btn.disabled = false;
  }
}
$("googleLoginBtn").addEventListener("click", doLogin);
$("logoutBtn").addEventListener("click", ()=>signOut(auth));

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
  const collections=["clients","communications","quotes","orders","tasks","holidays","holidayCountries","files"];
  collections.forEach(name=>{
    const unsub=onSnapshot(refCollection(name),snap=>{
      state[name]=snap.docs.map(d=>({id:d.id,...d.data()}));
      sync("ok","已自动同步");
      renderAll();
      if(name==="holidayCountries") scheduleHolidayAutoSync();
      if(name==="clients") scheduleClientCountryDiscovery();
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
    <td data-label="客户"><b>${esc(c.company||"未命名")}</b></td><td data-label="国家">${esc(c.country||"—")}</td><td data-label="联系人">${esc(c.contact||"—")}</td>
    <td data-label="状态">${badge(c.status||"—",["已成交","老客户"].includes(c.status)?"green":["PI","已报价","重点跟进"].includes(c.status)?"orange":"")}</td>
    <td data-label="等级">${esc(c.grade||"—")}</td><td data-label="下次跟进">${fmtDate(c.nextFollowUp)}</td>
    <td data-label="操作"><button class="btn small primary" onclick="openClient('${c.id}')">详情</button> <button class="btn small" onclick="openForm('client','${c.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('client','${c.id}')">删除</button></td>
  </tr>`).join(""):`<tr><td class="client-empty-cell" colspan="7">${empty("还没有客户。")}</td></tr>`;
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
  const chips=$("holidayCountryChips");
  if(chips){
    chips.innerHTML=state.holidayCountries.length?state.holidayCountries.slice().sort((a,b)=>countryDisplayName(a.code).localeCompare(countryDisplayName(b.code),"zh-CN")).map(c=>{
      const sub=c.lastError?`<span class="holiday-error">更新失败</span>`:(c.lastSyncDate?`<span>${esc(c.lastSyncDate)} 已更新</span>`:`<span>等待首次同步</span>`);
      return `<div class="country-chip"><b>${esc(countryDisplayName(c.code))}</b><em>${esc(c.code)}</em>${sub}<button class="chip-btn" onclick="refreshHolidayCountry('${c.code}')" title="立即更新">↻</button><button class="chip-btn danger" onclick="removeHolidayCountry('${c.code}')" title="移除">×</button></div>`;
    }).join(""):`<div class="empty" style="padding:12px">还没有关注国家。添加国家后会自动同步今年和明年的公共节假日。</div>`;
  }
  const rows=state.holidays.slice().sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.country||"").localeCompare(b.country||""));
  $("holidayTable").innerHTML=rows.length?rows.map(h=>`<tr>
    <td>${esc(h.country||countryDisplayName(h.countryCode||""))}</td><td><b>${esc(h.name)}</b>${h.auto?` <span class="badge green">自动</span>`:""}</td>
    <td>${fmtDate(h.date)}</td><td>${esc(h.remindDays||7)}天</td>
    <td>${h.auto?`<span class="item-meta">每天自动检查更新</span>`:`<button class="btn small" onclick="openForm('holiday','${h.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('holiday','${h.id}')">删除</button>`}</td>
  </tr>`).join(""):`<tr><td colspan="5">${empty("暂无节假日。先在上方添加一个国家。")}</td></tr>`;
  const s=$("holidaySyncStatus"); if(s && !s.textContent) s.textContent=`已关注 ${state.holidayCountries.length} 个国家 · 每天自动更新`;
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
  if(editing.type==="client") canonicalizeClientCountry(obj);
  sync("busy","正在保存…");
  const key=pathFor(editing.type);

  if(editing.id){
    await updateDoc(doc(db,"users",currentUser.uid,key,editing.id),{...obj,updatedAt:serverTimestamp()});
  }else{
    const r=await addDoc(refCollection(key),{...obj,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    editing.id=r.id;
  }

  if(editing.type==="client" && obj.country){
    autoTrackCountriesFromNames([obj.country]).catch(console.warn);
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
// 10. Excel / CSV 客户批量导入
// ============================================================
const excelAliases = {
  company:["公司名称","客户名称","公司","客户","company","company name","customer","customer name","client","client name"],
  country:["国家","客户国家","所在国家","国家地区","国家/地区","国家或地区","country","country name","country/region","country region","region","market","市场","país","pais","país/região","pais/regiao","região","regiao","mercado"],
  city:["城市","city","location"],
  website:["官网","网站","网址","website","web","url","homepage"],
  grade:["客户等级","等级","级别","grade","level","rating"],
  status:["客户状态","开发状态","跟进状态","状态","status","stage"],
  contact:["联系人","联系人姓名","姓名","contact","contact name","name"],
  title:["职位","职务","岗位","position","job title","title"],
  email:["邮件","邮箱","电子邮件","email","e-mail","mail"],
  phone:["电话","手机","联系电话","phone","tel","telephone","mobile"],
  whatsapp:["whatsapp","whats app","wa"],
  linkedin:["linkedin","linked in"],
  facebook:["facebook","fb"],
  telegram:["telegram","tg"],
  lastContact:["最后联系","最后联系时间","最后跟进","last contact","last contacted","last follow up"],
  nextFollowUp:["下次跟进","下次联系","跟进时间","next follow up","next follow-up","next contact"],
  notes:["备注","跟进内容","开发内容","说明","notes","note","remark","remarks","memo"]
};
const normalizeHeader = v => String(v??"").trim().toLowerCase().replace(/[\s_\-\/\\（）()：:]+/g,"");
const aliasLookup = (()=>{
  const m=new Map();
  Object.entries(excelAliases).forEach(([field,arr])=>arr.forEach(x=>m.set(normalizeHeader(x),field)));
  return m;
})();
function normalizeDateValue(v){
  if(v===null||v===undefined||v==="") return "";
  if(v instanceof Date && !isNaN(v)){ const off=v.getTimezoneOffset(); return new Date(v.getTime()-off*60000).toISOString().slice(0,10); }
  const s=String(v).trim();
  let m=s.match(/^(\d{4})[\-\/.年](\d{1,2})[\-\/.月](\d{1,2})/);
  if(m) return `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;
  m=s.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/);
  if(m) return `${m[3]}-${String(m[1]).padStart(2,"0")}-${String(m[2]).padStart(2,"0")}`;
  const d=new Date(s); if(!isNaN(d)){ const off=d.getTimezoneOffset(); return new Date(d.getTime()-off*60000).toISOString().slice(0,10); }
  return "";
}
function normalizeGrade(v){ const s=String(v||"").trim().toUpperCase(); return ["A","B","C","D"].includes(s)?s:"C"; }
function normalizeStatus(v){
  const s=String(v||"").trim(); if(!s) return "新客户";
  const map={"待开发":"新客户","未开发":"新客户","已联系":"已开发","开发中":"已开发","已询价":"有询价","询价":"有询价","报价":"已报价","成交":"已成交","老客":"老客户","沉睡":"沉睡客户","暂停":"暂停开发","无效":"无效客户"};
  return map[s]||s;
}
function normalizeLooseText(v){
  return String(v||"").trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[\u200B-\u200D\uFEFF]/g,"").replace(/&amp;/g,"&").replace(/\s+/g," ");
}
function normalizeCompanyKey(v){
  return normalizeLooseText(v).replace(/[^a-z0-9\u4e00-\u9fff]+/g,"");
}
function normalizeEmailKey(v){ return normalizeLooseText(v).replace(/\s+/g,""); }
function normalizePhoneKey(v){ return String(v||"").replace(/\D+/g,""); }
function normalizeDomain(v){
  let s=normalizeLooseText(v); if(!s) return "";
  if(s.includes("@") && !s.includes("/")) s=s.split("@").pop();
  s=s.replace(/^https?:\/\//,"").replace(/^www\./,"").split(/[\/?#]/)[0].replace(/:\d+$/,"");
  return s;
}
const CCTLD_COUNTRY=[
  [/\.(?:com\.)?br$/,"BR"],[/\.(?:com\.)?tr$/,"TR"],[/\.ru$/,"RU"],[/\.by$/,"BY"],[/\.(?:co\.)?za$/,"ZA"],[/\.(?:co\.)?id$/,"ID"],
  [/\.(?:com\.)?cn$/,"CN"],[/\.lk$/,"LK"],[/\.ua$/,"UA"],[/\.ae$/,"AE"],[/\.de$/,"DE"],[/\.fr$/,"FR"],[/\.it$/,"IT"],[/\.es$/,"ES"],[/\.pt$/,"PT"],
  [/\.pl$/,"PL"],[/\.nl$/,"NL"],[/\.se$/,"SE"],[/\.no$/,"NO"],[/\.fi$/,"FI"],[/\.dk$/,"DK"],[/\.is$/,"IS"],[/\.uk$/,"GB"],[/\.co\.uk$/,"GB"],
  [/\.jp$/,"JP"],[/\.kr$/,"KR"],[/\.sg$/,"SG"],[/\.my$/,"MY"],[/\.th$/,"TH"],[/\.vn$/,"VN"],[/\.ph$/,"PH"],[/\.in$/,"IN"]
];
const PHONE_COUNTRY_PREFIXES=[["971","AE"],["375","BY"],["380","UA"],["94","LK"],["90","TR"],["55","BR"],["27","ZA"],["62","ID"],["86","CN"],["7","RU"]];
function inferCountryCodeFromClient(c){
  let code=resolveCountryCode(c?.country); if(code) return code;
  const domain=normalizeDomain(c?.website||c?.email||"");
  for(const [re,cc] of CCTLD_COUNTRY){ if(domain && re.test(domain)) return cc; }
  let phone=String(c?.phone||c?.whatsapp||"").replace(/\D+/g,"");
  if(phone.startsWith("00")) phone=phone.slice(2);
  for(const [prefix,cc] of PHONE_COUNTRY_PREFIXES){ if(phone.startsWith(prefix)) return cc; }
  const company=normalizeCountryName(c?.company||"");
  if(company.includes("brasil")) return "BR";
  return "";
}
function canonicalizeClientCountry(c){
  const code=inferCountryCodeFromClient(c); if(code) c.country=countryDisplayName(code);
  return c;
}
function countriesCompatible(a,b){
  const ca=inferCountryCodeFromClient(a), cb=inferCountryCodeFromClient(b);
  return !ca||!cb||ca===cb;
}
function clientIdentifiers(c){
  return {
    company:normalizeCompanyKey(c?.company), email:normalizeEmailKey(c?.email), domain:normalizeDomain(c?.website),
    phone:normalizePhoneKey(c?.phone||c?.whatsapp), country:inferCountryCodeFromClient(c)
  };
}
function sameClient(a,b){
  const x=clientIdentifiers(a), y=clientIdentifiers(b);
  if(x.email&&y.email&&x.email===y.email) return true;
  if(x.domain&&y.domain&&x.domain===y.domain) return true;
  if(x.company&&y.company&&x.company===y.company&&countriesCompatible(a,b)) return true;
  if(x.company&&y.company&&x.company===y.company&&x.phone&&y.phone&&x.phone===y.phone) return true;
  return false;
}
const STATUS_RANK={"新客户":1,"已开发":2,"已回复":3,"有询价":4,"已报价":5,"重点跟进":6,"PI":7,"已成交":8,"老客户":9,"长期维护":5,"沉睡客户":2,"暂停开发":0,"无效客户":-1};
const GRADE_RANK={A:4,B:3,C:2,D:1};
function appendUniqueNote(notes,line){
  const base=String(notes||"").trim(); if(!line||base.includes(line)) return base;
  return base?`${base}\n${line}`:line;
}
function mergeClientData(base,incoming,{fromExcel=false}={}){
  const out={...base}; const src={...incoming}; canonicalizeClientCountry(src);
  const fill=["country","city","website","contact","title","email","phone","whatsapp","linkedin","facebook","telegram","lastContact","nextFollowUp"];
  fill.forEach(k=>{ if(!String(out[k]||"").trim()&&String(src[k]||"").trim()) out[k]=src[k]; });
  if((GRADE_RANK[src.grade]||0)>(GRADE_RANK[out.grade]||0)) out.grade=src.grade;
  if((STATUS_RANK[src.status]??0)>(STATUS_RANK[out.status]??0)) out.status=src.status;
  let notes=out.notes||"";
  const extras=[];
  [["联系人","contact"],["职位","title"],["Email","email"],["电话","phone"],["WhatsApp","whatsapp"]].forEach(([label,k])=>{
    const a=String(out[k]||"").trim(), b=String(src[k]||"").trim(); if(a&&b&&normalizeLooseText(a)!==normalizeLooseText(b)) extras.push(`${label}: ${b}`);
  });
  if(String(src.notes||"").trim()&&String(src.notes||"").trim()!==String(notes||"").trim()) notes=appendUniqueNote(notes,String(src.notes).trim());
  if(extras.length) notes=appendUniqueNote(notes,`${fromExcel?"Excel补充资料":"合并补充资料"}：${extras.join("；")}`);
  out.notes=notes;
  if(src.country){
    const cc=inferCountryCodeFromClient(src); if(cc) out.country=countryDisplayName(cc);
  } else canonicalizeClientCountry(out);
  return out;
}
function findClientMatch(target,list){ return list.find(x=>sameClient(target,x))||null; }
function consolidateImportedRows(rows){
  const out=[]; let merged=0;
  rows.forEach(raw=>{
    const c=canonicalizeClientCountry({...raw});
    const hit=findClientMatch(c,out);
    if(hit){ Object.assign(hit,mergeClientData(hit,c,{fromExcel:true})); merged++; }
    else out.push(c);
  });
  return {rows:out,merged};
}
function rowToClient(headers,row){
  const obj={grade:"C",status:"新客户"};
  headers.forEach((h,i)=>{ const field=aliasLookup.get(normalizeHeader(h)); if(field && row[i]!==undefined && row[i]!==null) obj[field]=String(row[i]).trim(); });
  obj.company=String(obj.company||"").trim(); obj.grade=normalizeGrade(obj.grade); obj.status=normalizeStatus(obj.status);
  obj.lastContact=normalizeDateValue(obj.lastContact); obj.nextFollowUp=normalizeDateValue(obj.nextFollowUp);
  canonicalizeClientCountry(obj);
  return obj;
}
function clientDupKey(c){
  const x=clientIdentifiers(c); return x.email?`e:${x.email}`:x.domain?`w:${x.domain}`:x.company?`c:${x.company}`:"";
}
function showExcelStatus(text,kind=""){ const el=$("excelImportStatus"); el.textContent=text; el.style.color=kind==="err"?"#a44f4f":""; }
function resetExcelImport(){ excelImportRows=[];excelImportFileName="";$("excelImportBtn").disabled=true;$("excelPreview").innerHTML="";showExcelStatus("尚未选择文件。");$("excelFileInput").value=""; }
$("openExcelImportBtn")?.addEventListener("click",()=>{resetExcelImport();$("excelImportModal").classList.add("show")});
const excelDrop=$("excelDropZone");
excelDrop?.addEventListener("click",()=>$("excelFileInput").click());
["dragenter","dragover"].forEach(evt=>excelDrop?.addEventListener(evt,e=>{e.preventDefault();e.stopPropagation();excelDrop.classList.add("dragover")}));
["dragleave","drop"].forEach(evt=>excelDrop?.addEventListener(evt,e=>{e.preventDefault();e.stopPropagation();excelDrop.classList.remove("dragover")}));
excelDrop?.addEventListener("drop",e=>{const f=e.dataTransfer?.files?.[0];if(f)readExcelFile(f)});
$("excelFileInput")?.addEventListener("change",e=>{const f=e.target.files?.[0];if(f)readExcelFile(f)});
async function readExcelFile(file){
  const name=(file.name||"").toLowerCase();
  if(!/\.(xlsx|xls|csv)$/.test(name)){showExcelStatus("不支持这个格式，请选择 .xlsx / .xls / .csv。","err");return}
  excelImportFileName=file.name||"客户表"; showExcelStatus("正在读取文件……");
  try{
    let matrix=[];
    if(name.endsWith(".csv")){
      const text=await file.text();
      if(window.XLSX){ const wb=XLSX.read(text,{type:"string"}); matrix=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:"",raw:false,blankrows:false}); }
      else { matrix=text.split(/\r?\n/).filter(Boolean).map(line=>line.split(",")); }
    }else{
      if(!window.XLSX) throw new Error("Excel解析组件没有加载。请刷新页面后重试，或先另存为 CSV 再导入。");
      const data=await file.arrayBuffer();
      const wb=XLSX.read(data,{type:"array",cellDates:true});
      const ws=wb.Sheets[wb.SheetNames[0]];
      matrix=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:false,blankrows:false});
    }
    if(!matrix.length) throw new Error("表格为空。请确认第一行是表头。");
    const headers=matrix[0].map(x=>String(x||"").trim());
    const recognized=headers.map(h=>aliasLookup.get(normalizeHeader(h))).filter(Boolean);
    if(!recognized.includes("company")) throw new Error("没有识别到“客户名称/公司名称/Company”列。请把公司名称放在第一行表头中。");
    const rows=matrix.slice(1).map(r=>rowToClient(headers,r)).filter(c=>Object.values(c).some(v=>String(v||"").trim()));
    const valid=rows.filter(c=>c.company);
    const invalid=rows.length-valid.length;
    excelImportRows=valid;
    if(!valid.length) throw new Error("没有读取到有效客户行。每一行至少需要公司名称。");
    const mapped=[...new Set(recognized)].map(f=>({company:"公司",country:"国家",city:"城市",website:"官网",grade:"等级",status:"状态",contact:"联系人",title:"职位",email:"Email",phone:"电话",whatsapp:"WhatsApp",linkedin:"LinkedIn",facebook:"Facebook",telegram:"Telegram",lastContact:"最后联系",nextFollowUp:"下次跟进",notes:"备注"}[f]||f));
    showExcelStatus(`已读取 ${file.name}：有效客户 ${valid.length} 行${invalid?`，另有 ${invalid} 行缺少公司名称将跳过`:""}。识别列：${mapped.join("、")}。`);
    $("excelImportBtn").disabled=false;
    $("excelPreview").innerHTML=`<div class="table-wrap"><table><thead><tr><th>客户</th><th>国家</th><th>联系人</th><th>Email</th><th>WhatsApp</th><th>状态</th></tr></thead><tbody>${valid.slice(0,8).map(c=>`<tr><td><b>${esc(c.company)}</b></td><td>${esc(c.country||"")}</td><td>${esc(c.contact||"")}</td><td>${esc(c.email||"")}</td><td>${esc(c.whatsapp||"")}</td><td>${esc(c.status||"")}</td></tr>`).join("")}</tbody></table></div>${valid.length>8?`<div class="item-meta" style="margin-top:6px">仅预览前 8 行，共 ${valid.length} 行。</div>`:""}`;
  }catch(err){ excelImportRows=[];$("excelImportBtn").disabled=true;$("excelPreview").innerHTML="";showExcelStatus("读取失败："+err.message,"err"); }
}
$("excelImportBtn")?.addEventListener("click",async()=>{
  if(!excelImportRows.length)return;
  const consolidated=consolidateImportedRows(excelImportRows);
  const virtualExisting=state.clients.map(c=>({...c}));
  const toCreate=[], toUpdate=new Map();
  for(const incoming of consolidated.rows){
    const hit=findClientMatch(incoming,virtualExisting);
    if(hit){
      const merged=mergeClientData(hit,incoming,{fromExcel:true}); Object.assign(hit,merged);
      if(hit.id) toUpdate.set(hit.id,merged);
    }else{
      const c={...incoming}; toCreate.push(c); virtualExisting.push(c);
    }
  }
  const msg=`准备处理 ${excelImportRows.length} 行：新增 ${toCreate.length} 家，合并/补充已有客户 ${toUpdate.size} 家${consolidated.merged?`，表内重复已合并 ${consolidated.merged} 行`:""}。确认写入云端吗？`;
  if(!confirm(msg))return;
  sync("busy","正在清洗并导入客户…"); $("excelImportBtn").disabled=true;
  try{
    const ops=[];
    toCreate.forEach(c=>ops.push({kind:"set",ref:doc(refCollection("clients")),data:{...c,source:`Excel导入：${excelImportFileName}`,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}}));
    for(const [id,c] of toUpdate) ops.push({kind:"update",ref:doc(db,"users",currentUser.uid,"clients",id),data:{...c,source:`Excel合并更新：${excelImportFileName}`,updatedAt:serverTimestamp()}});
    for(let i=0;i<ops.length;i+=350){
      const batch=writeBatch(db);
      ops.slice(i,i+350).forEach(op=>op.kind==="set"?batch.set(op.ref,op.data):batch.update(op.ref,op.data));
      await batch.commit();
    }
    const countryNames=[...toCreate,...toUpdate.values()].map(c=>c.country).filter(Boolean);
    const countryAdded=await autoTrackCountriesFromNames(countryNames);
    sync("ok","已自动同步");
    alert(`处理完成：新增 ${toCreate.length} 家；合并/补充 ${toUpdate.size} 家${consolidated.merged?`；表内重复合并 ${consolidated.merged} 行`:""}${countryAdded.length?`；新增 ${countryAdded.length} 个国家节假日同步`:""}。`);
    closeModal("excelImportModal");
  }catch(err){ console.error(err);sync("err","导入失败");$("excelImportBtn").disabled=false;alert("导入失败："+err.message); }
});

// V3.1.3：清理已经存在的重复客户，并补全可推断国家；关联记录自动改到保留客户
$("cleanClientsBtn")?.addEventListener("click",async()=>{
  if(!state.clients.length){alert("当前没有客户需要清理。");return}
  const parent={}; const byId=new Map(state.clients.map(c=>[c.id,c]));
  const find=id=>parent[id]===id?id:(parent[id]=find(parent[id]));
  const union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a};
  state.clients.forEach(c=>parent[c.id]=c.id);
  const buckets=new Map();
  for(const c of state.clients){
    const x=clientIdentifiers(c); const keys=[];
    if(x.email) keys.push(`e:${x.email}`); if(x.domain) keys.push(`w:${x.domain}`); if(x.company) keys.push(`c:${x.company}`);
    for(const key of keys){
      const ids=buckets.get(key)||[];
      for(const id of ids){ const other=byId.get(id); if(other&&sameClient(c,other)) union(c.id,id); }
      ids.push(c.id); buckets.set(key,ids);
    }
  }
  const groups=new Map(); state.clients.forEach(c=>{const r=find(c.id);(groups.get(r)||groups.set(r,[]).get(r)).push(c)});
  const dups=[...groups.values()].filter(g=>g.length>1);
  const inferable=state.clients.filter(c=>!resolveCountryCode(c.country)&&inferCountryCodeFromClient(c)).length;
  if(!dups.length&&!inferable){alert("没有发现需要合并的重复客户，也没有可自动补全的国家。");return}
  if(!confirm(`检测到 ${dups.reduce((n,g)=>n+g.length-1,0)} 条重复客户需要合并；另有约 ${inferable} 条客户可自动补全国家。\n\n系统会保留资料更完整的一条，并把报价、PI、沟通、任务、附件关联到保留客户。确认继续吗？`))return;
  sync("busy","正在清理客户数据…");
  try{
    const relationSets=[state.communications,state.quotes,state.orders,state.tasks,state.files];
    const ops=[]; const duplicateIds=new Set();
    const completeness=c=>["country","city","website","contact","title","email","phone","whatsapp","linkedin","facebook","telegram","notes","nextFollowUp","lastContact"].reduce((n,k)=>n+(String(c[k]||"").trim()?1:0),0)+relationSets.reduce((n,arr)=>n+arr.filter(x=>x.clientId===c.id).length*2,0);
    for(const group of dups){
      const sorted=[...group].sort((a,b)=>completeness(b)-completeness(a)); const keeper=sorted[0]; let merged={...keeper};
      for(const d of sorted.slice(1)){ merged=mergeClientData(merged,d); duplicateIds.add(d.id); }
      canonicalizeClientCountry(merged);
      ops.push({kind:"update",ref:doc(db,"users",currentUser.uid,"clients",keeper.id),data:{...merged,updatedAt:serverTimestamp()}});
      for(const d of sorted.slice(1)){
        for(const arr of relationSets){ for(const item of arr.filter(x=>x.clientId===d.id)){ const coll=pathFor(arr===state.communications?"communication":arr===state.quotes?"quote":arr===state.orders?"order":arr===state.tasks?"task":"file"); ops.push({kind:"update",ref:doc(db,"users",currentUser.uid,coll,item.id),data:{clientId:keeper.id,updatedAt:serverTimestamp()}}); } }
        ops.push({kind:"delete",ref:doc(db,"users",currentUser.uid,"clients",d.id)});
      }
    }
    for(const c of state.clients){
      if(duplicateIds.has(c.id)) continue; const code=inferCountryCodeFromClient(c); if(code&&resolveCountryCode(c.country)!==code) ops.push({kind:"update",ref:doc(db,"users",currentUser.uid,"clients",c.id),data:{country:countryDisplayName(code),updatedAt:serverTimestamp()}});
    }
    for(let i=0;i<ops.length;i+=300){ const batch=writeBatch(db); ops.slice(i,i+300).forEach(op=>op.kind==="update"?batch.update(op.ref,op.data):batch.delete(op.ref)); await batch.commit(); }
    await autoTrackCountriesFromNames(state.clients.map(c=>countryDisplayName(inferCountryCodeFromClient(c))).filter(Boolean));
    sync("ok","已自动同步"); alert(`清理完成：合并删除 ${duplicateIds.size} 条重复客户，并自动补全可识别国家。`);
  }catch(err){console.error(err);sync("err","清理失败");alert("清理失败："+err.message)}
});

// ============================================================
// 节假日国家管理
// ============================================================
initHolidayCountrySelect();
$("addHolidayCountryBtn")?.addEventListener("click",async()=>{
  const code=$("holidayCountrySelect").value;
  if(!code){alert("请先选择一个国家。");return}
  if(state.holidayCountries.some(x=>x.code===code)){await syncHolidayCountry(code,true);return}
  const btn=$("addHolidayCountryBtn"); btn.disabled=true;
  try{await addHolidayCountry(code,{silent:false,source:"手动添加"});$("holidayCountrySelect").value="";}
  finally{btn.disabled=false}
});
$("refreshAllHolidaysBtn")?.addEventListener("click",async()=>{
  if(!state.holidayCountries.length){alert("请先添加国家。");return}
  const btn=$("refreshAllHolidaysBtn");btn.disabled=true;
  try{for(const c of state.holidayCountries) await syncHolidayCountry(c.code,true)}finally{btn.disabled=false}
});

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
  await autoTrackCountriesFromNames((migrationPayload.clients||[]).map(c=>c.country).filter(Boolean)).catch(console.warn);
  sync("ok","迁移完成");alert("V2.1 数据已迁移到云端。客户国家可识别时，节假日会自动加入同步。");
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
