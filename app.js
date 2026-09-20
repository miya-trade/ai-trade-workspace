import { firebaseConfig } from "./firebase-config.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup,
  onAuthStateChanged, signOut, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc,
  getDoc, getDocs, onSnapshot, query, where, orderBy, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
let quoteImportRows = [];
let quoteImportFileName = "";
let clientPage = 1;
let quotePage = 1;
const PAGE_SIZE = 100;

const state = {
  clients: [],
  communications: [],
  quotes: [],
  orders: [],
  tasks: [],
  holidays: [],
  holidayCountries: [],
  files: [],
  samples: [],
  rfqs: [],
  exportLogs: [],
  settings: { quoteFollowDays:5, rfqFollowDays:2, dormantDays:30, weekendFollow:false, currency:"USD", backupReminderDays:7, lastBackupAt:"", contactNoReplyLimit:3, contactFollowDays:3, salesProfilesText:"" }
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
function parseSalesProfileLine(line){
  const p=String(line||"").split("|").map(x=>x.trim());
  return {salesperson:p[0]||"",company:p[1]||"",email:p.slice(2).join("|").trim()||""};
}
function salesProfiles(){
  return String(state.settings.salesProfilesText||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(parseSalesProfileLine).filter(x=>x.salesperson||x.company||x.email);
}
function clientAssignment(c){return {salesperson:String(c?.ownerSalesperson||"").trim(),company:String(c?.ownerCompany||"").trim(),email:String(c?.ownerEmail||"").trim()};}
function assignmentLabel(c,{email=true}={}){const a=clientAssignment(c),p=[];if(a.salesperson)p.push(a.salesperson);if(a.company)p.push(a.company);if(email&&a.email)p.push(a.email);return p.join(" · ")||"未分配";}
function assignmentForClientId(id){return clientAssignment(state.clients.find(x=>x.id===id)||{});}
const sync = (status,text) => {
  $("syncDot").className="sync-dot "+status;
  $("syncText").textContent=text;
};
const pathFor = type => ({
  client:"clients",communication:"communications",quote:"quotes",order:"orders",
  task:"tasks",holiday:"holidays",file:"files",sample:"samples",rfq:"rfqs"
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
document.documentElement.dataset.appReady="1";
if($("googleLoginBtn")){ $("googleLoginBtn").disabled=false; $("googleLoginBtn").textContent="使用 Google 登录"; }
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
  const collections=["clients","communications","rfqs","quotes","orders","tasks","holidays","holidayCountries","files","samples","exportLogs"];
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
    renderSettings();renderAll();checkBackupReminder();
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

  state.rfqs.forEach(r=>{
    const due=r.nextFollowUp || (r.requestDate?addDays(r.requestDate,state.settings.rfqFollowDays||2):"");
    if(due && due<=todayISO() && !["已全部报价","客户取消","已结束"].includes(r.status||"")){
      const overdue=Math.max(0,daysBetween(due,todayISO())||0);
      out.push({type:"rfq",id:r.id,priority:overdue>=2?"high":"normal",title:`${clientName(r.clientId)} · RFQ ${r.rfqNo||r.subject||"询价"}`,meta:`${r.status||"待处理"} · ${r.itemCount||0}项 · ${overdue?`逾期${overdue}天`:"今天到期"}`});
    }
  });

  state.samples.forEach(s=>{
    const due=s.nextFollowUp||s.feedbackDueDate||s.expectedArrival||"";
    const active=!['测试通过','测试未通过','已结束','取消'].includes(s.status||'');
    if(active && due && due<=todayISO()){
      const overdue=Math.max(0,daysBetween(due,todayISO())||0);
      const what=s.partNo||s.itemName||'样品';
      const meta=`${s.status||'样品跟进'} · ${overdue?`逾期${overdue}天`:'今天到期'}${s.tracking?` · ${s.tracking}`:''}`;
      out.push({type:'sample',id:s.id,priority:['已签收待测试','测试中'].includes(s.status)?'high':'normal',title:`${clientName(s.clientId)} · 样品 ${what}`,meta});
    }
  });

  state.quotes.forEach(q=>{
    const due=q.nextFollowUp || (q.quoteDate?addDays(q.quoteDate,state.settings.quoteFollowDays):"");
    if(due && due<=todayISO() && !["成交","丢单","暂停"].includes(q.status)){
      const overdue=Math.max(0,daysBetween(due,todayISO())||0);
      out.push({type:"quote",id:q.id,priority:overdue>=5?"high":"normal",title:`${clientName(q.clientId)} · ${q.partNo||"报价"}`,meta:`${q.status||"已报价"} · ${overdue?`逾期${overdue}天`:"今天到期"}`});
    }
  });

  state.clients.forEach(c=>{const rot=currentContactInfo(c);if(rot.pending){const meta0=rot.next?`${rot.reason} · 建议切换至 ${contactLabel(rot.next)}`:`${rot.reason} · 已无更多联系人，建议转沉睡客户`;const meta=`${meta0} · ${assignmentLabel(c,{email:false})}`;out.push({type:"client",id:c.id,priority:"high",title:c.company,meta});}else if(c.nextFollowUp&&c.nextFollowUp<=todayISO()){const long=["长期维护","沉睡客户"].includes(c.status);const current=rot.current?` · 当前 ${contactLabel(rot.current)} · ${rot.current.touchCount||0}/${rot.limit}次`:"";out.push({type:"client",id:c.id,priority:long?"long":c.grade==="A"?"high":"normal",title:c.company,meta:`${c.country||""} · ${c.status||""}${current} · ${assignmentLabel(c,{email:false})}`});}});

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
  renderDashboard();renderClients();renderFollowups();renderRFQs();renderQuotes();renderOrders();
  renderTasks();renderReview();renderHolidays();renderSettings();
  if(currentClientId && $("clientModal").classList.contains("show")) renderClientDetail();
}

function renderDashboard(){
  const follow=getFollowups();
  const stats=[
    ["今日待跟进",follow.length,`高优先级 ${follow.filter(x=>x.priority==="high").length}`],
    ["RFQ / 报价",`${state.rfqs.length} / ${state.quotes.length}`,"询价 / 报价单"],
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
  const ownerSel=$("clientOwnerFilter"),companySel=$("clientOurCompanyFilter");
  const oldOwner=ownerSel?.value||"",oldCompany=companySel?.value||"";
  const owners=[...new Set(state.clients.map(c=>c.ownerSalesperson).filter(Boolean))].sort();
  const companies=[...new Set(state.clients.map(c=>c.ownerCompany).filter(Boolean))].sort();
  if(ownerSel){ownerSel.innerHTML='<option value="">全部业务员</option>'+owners.map(x=>`<option>${esc(x)}</option>`).join("");ownerSel.value=owners.includes(oldOwner)?oldOwner:"";}
  if(companySel){companySel.innerHTML='<option value="">全部我方公司</option>'+companies.map(x=>`<option>${esc(x)}</option>`).join("");companySel.value=companies.includes(oldCompany)?oldCompany:"";}
  const q=($("clientFilter").value||"").toLowerCase(), status=sf.value, owner=ownerSel?.value||"", ourCompany=companySel?.value||"";
  const allRows=state.clients.filter(c=>{
    const hay=[c.company,c.country,c.contact,getClientEmails(c,{includeNotes:true}).join(" "),c.whatsapp,c.ownerSalesperson,c.ownerCompany,c.ownerEmail].join(" ").toLowerCase();
    return (!q||hay.includes(q))&&(!status||c.status===status)&&(!owner||c.ownerSalesperson===owner)&&(!ourCompany||c.ownerCompany===ourCompany);
  }).sort((a,b)=>(a.company||"").localeCompare(b.company||"","zh-CN"));
  const pages=Math.max(1,Math.ceil(allRows.length/PAGE_SIZE)); if(clientPage>pages)clientPage=pages;
  const rows=allRows.slice((clientPage-1)*PAGE_SIZE,clientPage*PAGE_SIZE);
  $("clientTable").innerHTML=rows.length?rows.map(c=>{const rot=currentContactInfo(c),ct=rot.current,ctHtml=ct?`<b>${esc(ct.name||ct.email)}</b><div class="item-meta">${ct.name?esc(ct.email):""} · ${ct.touchCount||0}/${rot.limit}次${rot.pending?" · 待切换":""}</div>`:"—";const a=clientAssignment(c),assignHtml=(a.salesperson||a.company||a.email)?`<b>${esc(a.salesperson||"未填业务员")}</b><div class="item-meta">${esc(a.company||"未填公司")}${a.email?` · ${esc(a.email)}`:""}</div>`:"—";return `<tr><td data-label="客户"><b>${esc(c.company||"未命名")}</b></td><td data-label="国家">${esc(c.country||"—")}</td><td data-label="跟进归属">${assignHtml}</td><td data-label="联系人">${ctHtml}</td><td data-label="状态">${badge(c.status||"—",["已成交","老客户","已回复"].includes(c.status)?"green":["PI","已报价","重点跟进"].includes(c.status)?"orange":"")}${rot.pending?` ${badge("建议换联系人","red")}`:""}</td><td data-label="等级">${esc(c.grade||"—")}</td><td data-label="下次跟进">${fmtDate(c.nextFollowUp)}</td><td data-label="操作"><button class="btn small primary" onclick="openClient('${c.id}')">详情</button> <button class="btn small" onclick="openForm('client','${c.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('client','${c.id}')">删除</button></td></tr>`}).join(""):`<tr><td class="client-empty-cell" colspan="8">${empty("还没有客户。")}</td></tr>`;
  const pg=$("clientPager"); if(pg)pg.innerHTML=allRows.length>PAGE_SIZE?`<span>共 ${allRows.length} 家 · 第 ${clientPage}/${pages} 页</span><button class="btn small" onclick="changeClientPage(-1)" ${clientPage<=1?"disabled":""}>上一页</button><button class="btn small" onclick="changeClientPage(1)" ${clientPage>=pages?"disabled":""}>下一页</button>`:`<span>共 ${allRows.length} 家</span>`;
}
window.changeClientPage=d=>{clientPage=Math.max(1,clientPage+Number(d||0));renderClients();};
$("clientFilter").addEventListener("input",()=>{clientPage=1;renderClients()});
$("clientStatusFilter").addEventListener("change",()=>{clientPage=1;renderClients()});
$("clientOwnerFilter")?.addEventListener("change",()=>{clientPage=1;renderClients()});
$("clientOurCompanyFilter")?.addEventListener("change",()=>{clientPage=1;renderClients()});

function renderFollowups(){
  const f=getFollowups();
  const html=x=>`<div class="item" onclick="openLinked('${x.type}','${x.id}')"><div class="item-title">${esc(x.title)}</div><div class="item-meta">${esc(x.meta)}</div></div>`;
  $("highFollow").innerHTML=f.filter(x=>x.priority==="high").map(html).join("")||empty("暂无");
  $("normalFollow").innerHTML=f.filter(x=>x.priority==="normal").map(html).join("")||empty("暂无");
  $("longFollow").innerHTML=f.filter(x=>x.priority==="long").map(html).join("")||empty("暂无");
}

function renderRFQs(){
  const rows=state.rfqs.slice().sort((a,b)=>(b.requestDate||"").localeCompare(a.requestDate||""));
  const el=$("rfqTable"); if(!el)return;
  el.innerHTML=rows.length?rows.map(r=>`<tr><td>${esc(clientName(r.clientId))}</td><td><b>${esc(r.rfqNo||r.subject||"RFQ")}</b><div class="item-meta">${esc(r.sourceFile||"")}</div></td><td>${fmtDate(r.requestDate)}</td><td>${esc(r.itemCount||0)}</td><td>${badge(r.status||"待处理",["已全部报价","已结束"].includes(r.status)?"green":["待报价","部分报价"].includes(r.status)?"orange":"")}</td><td>${esc(r.customerNeed||r.notes||"—")}</td><td>${fmtDate(r.nextFollowUp)}</td><td><button class="btn small" onclick="openForm('rfq','${r.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('rfq','${r.id}')">删除</button></td></tr>`).join(""):`<tr><td colspan="8">${empty("暂无 RFQ。收到客户询价后先登记 RFQ，再录入报价。")}</td></tr>`;
}
function inRange(date,days){ if(!date)return false; const d=parseDate(date); if(!d)return false; return d>=new Date(Date.now()-Number(days||30)*86400000); }
function renderReview(){
  const el=$("reviewStats"); if(!el)return; const days=Number($("reviewRange")?.value||30);
  const clients=state.clients.filter(x=>inRange(x.createdDate||x.firstContact||x.createdAt?.toDate?.()?.toISOString?.().slice(0,10),days));
  const comms=state.communications.filter(x=>inRange(x.date,days));
  const rfqs=state.rfqs.filter(x=>inRange(x.requestDate,days));
  const quotes=state.quotes.filter(x=>inRange(x.quoteDate,days));
  const samples=state.samples.filter(x=>inRange(x.requestDate||x.sentDate,days));
  const orders=state.orders.filter(x=>inRange(x.piDate,days));
  const wins=state.clients.filter(x=>["已成交","老客户"].includes(x.status));
  const unpaid=state.orders.filter(x=>["未付款","部分付款"].includes(x.paymentStatus));
  const replied=new Set(comms.filter(x=>["客户回复","双向沟通"].includes(x.direction)).map(x=>x.clientId));
  const cards=[["新增客户",clients.length],["有回复客户",replied.size],["RFQ",rfqs.length],["报价单",quotes.length],["样品",samples.length],["PI/订单",orders.length],["累计成交客户",wins.length],["待付款PI",unpaid.length]];
  el.innerHTML=cards.map(([a,b])=>`<div class="report-card"><div class="lbl">${a}</div><div class="num">${b}</div></div>`).join("");
  const feed={}; comms.forEach(x=>{const k=x.feedbackType||inferFeedbackType(x.customerFeedback||x.content||""); if(k&&k!=="其他")feed[k]=(feed[k]||0)+1}); state.quotes.filter(q=>q.lossReason).forEach(q=>feed[q.lossReason]=(feed[q.lossReason]||0)+1);
  const total=Object.values(feed).reduce((a,b)=>a+b,0)||1; $("reviewFeedback").innerHTML=Object.entries(feed).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`<div class="item"><div class="item-title">${esc(k)} · ${v}</div><div class="progress"><i style="width:${Math.round(v/total*100)}%"></i></div></div>`).join("")||empty("暂无结构化反馈。");
  const countries={}; state.clients.forEach(c=>{const k=c.country||"未填写";countries[k]=(countries[k]||0)+1}); const ct=Object.values(countries).reduce((a,b)=>a+b,0)||1; $("reviewCountries").innerHTML=Object.entries(countries).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`<div class="item"><div class="item-title">${esc(k)} · ${v}</div><div class="progress"><i style="width:${Math.round(v/ct*100)}%"></i></div></div>`).join("")||empty("暂无客户国家数据。");
}
$("reviewRange")?.addEventListener("change",renderReview);

function renderQuotes(){
  const all=state.quotes.slice().sort((a,b)=>(b.quoteDate||"").localeCompare(a.quoteDate||""));
  const pages=Math.max(1,Math.ceil(all.length/PAGE_SIZE)); if(quotePage>pages)quotePage=pages;
  const rows=all.slice((quotePage-1)*PAGE_SIZE,quotePage*PAGE_SIZE);
  $("quoteTable").innerHTML=rows.length?rows.map(q=>{
    const isBatch=Array.isArray(q.items)&&q.items.length;
    const title=isBatch?(q.batchName||`${q.items[0]?.partNo||"批量报价"} 等 ${q.itemCount||q.items.length} 项`):(q.partNo||"—");
    const brand=isBatch?(q.brand||"多品牌"):(q.brand||"—");
    const qty=isBatch?`${q.itemCount||q.items.length} 项`:(q.qty||"—");
    const price=isBatch?(q.priceSummary||"批量报价"):(q.quotePrice||"—");
    const actions=isBatch?`<button class="btn small primary" onclick="openQuoteBatch('${q.id}')">查看明细</button> <button class="btn small danger" onclick="removeEntity('quote','${q.id}')">删除</button>`:`<button class="btn small" onclick="openForm('quote','${q.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('quote','${q.id}')">删除</button>`;
    return `<tr><td>${esc(clientName(q.clientId))}</td><td><b>${esc(title)}</b>${isBatch?`<div class="quote-batch">Excel批量报价</div>`:""}</td><td>${esc(brand)}</td><td>${esc(qty)}</td><td>${esc(price)}</td><td>${badge(q.status||"—","orange")}</td><td>${fmtDate(q.nextFollowUp)}</td><td>${actions}</td></tr>`;
  }).join(""):`<tr><td colspan="8">${empty("暂无报价。")}</td></tr>`;
  const pg=$("quotePager"); if(pg)pg.innerHTML=all.length>PAGE_SIZE?`<span>共 ${all.length} 份报价 · 第 ${quotePage}/${pages} 页</span><button class="btn small" onclick="changeQuotePage(-1)" ${quotePage<=1?"disabled":""}>上一页</button><button class="btn small" onclick="changeQuotePage(1)" ${quotePage>=pages?"disabled":""}>下一页</button>`:`<span>共 ${all.length} 份报价</span>`;
}
window.changeQuotePage=d=>{quotePage=Math.max(1,quotePage+Number(d||0));renderQuotes();};
function renderOrders(){
  $("orderTable").innerHTML=state.orders.length?state.orders.map(o=>`<tr>
    <td><b>${esc(o.piNo||"—")}</b></td><td>${esc(clientName(o.clientId))}</td><td>${esc(o.amount||0)} ${esc(o.currency||state.settings.currency)}</td>
    <td>${badge(o.paymentStatus||"—",["未付款","部分付款"].includes(o.paymentStatus)?"red":"green")}<div class="item-meta">已付 ${esc(o.paidAmount||0)} · 余额 ${esc(o.balanceDue||0)}</div></td><td>${esc(o.orderStatus||"—")}</td><td>${esc(o.shippingMode||o.shipping||"—")}<div class="item-meta">${esc(o.tracking||"")}</div></td>
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
    ["salesProfile","跟进归属（业务员 / 我方公司 / 邮箱）","salesProfile",false],
    ["grade","客户等级","select",false,["A","B","C","D"]],["status","客户状态","select",false,clientStatuses],
    ["contact","联系人","text"],["title","职位","text"],["email","Email（可填多个，用逗号/分号/换行分隔）","textarea"],["phone","电话","text"],["whatsapp","WhatsApp","text"],
    ["linkedin","LinkedIn","text"],["facebook","Facebook","text"],["telegram","Telegram","text"],
    ["customerType","客户类型","select",false,["终端工厂","EMS/PCBA","贸易商/分销商","维修/工程公司","其他"]],["industry","应用行业","text"],["source","开发来源","select",false,["Google","外贸通","LinkedIn","Facebook","展会","转介绍","网站询盘","老客户","其他"]],
    ["procurementPain","采购特点/痛点","textarea"],["paymentHabit","付款习惯","text"],["logisticsHabit","物流习惯","text"],["priceSensitivity","价格敏感度","select",false,["高","中","低","未知"]],
    ["lastContact","最后联系","date"],["nextFollowUp","下次跟进","date"],["notes","备注","textarea"]
  ],
  communication:[
    ["clientId","客户","client",true],["contactEmail","本次联系邮箱","clientEmail",false],["date","沟通日期","date",true],["channel","渠道","select",true,["Email","WhatsApp","Telegram","LinkedIn","Facebook","电话","其他"]],
    ["direction","方向","select",false,["我联系客户","客户回复","双向沟通","邮件退信"]],["subject","主题/简述","text"],["content","沟通内容","textarea",true],
    ["feedbackType","反馈类型","select",false,["无回复","价格高/目标价","交期问题","无库存","品牌不接受","需要样品","样品测试","等待项目","已有供应商","付款条件","物流问题","暂时无需求","拒绝","成交信号","其他"]],["customerFeedback","客户反馈","textarea"],["nextAction","下一步","text"],["nextFollowUp","下次跟进","date"]
  ],
  rfq:[
    ["clientId","客户","client",true],["rfqNo","RFQ编号/主题","text",true],["requestDate","收到询价日期","date",true],["itemCount","型号/项目数量","number"],["parts","主要型号（可多行/逗号分隔）","textarea"],["sourceFile","原始RFQ文件名/链接","text"],["status","状态","select",false,["待报价","找货中","部分报价","已全部报价","等待客户反馈","客户取消","已结束"]],["customerNeed","客户需求/重点","textarea"],["nextFollowUp","下次跟进","date"],["notes","备注","textarea"]
  ],
  quote:[
    ["clientId","客户","client",true],["partNo","型号","text",true],["brand","品牌","text"],["qty","数量","text"],["targetPrice","Target Price","text"],["quotePrice","报价","text"],
    ["status","状态","select",false,["待报价","找货中","已报价","等待回复","客户议价","重新报价","已做PI","成交","丢单","暂停"]],
    ["rfqNo","关联RFQ编号","text"],["feedbackType","客户反馈类型","select",false,["无回复","价格高/目标价","交期问题","无库存","品牌不接受","等待项目","已有供应商","付款条件","物流问题","暂时无需求","成交信号","其他"]],["lossReason","丢单/未成交原因","select",false,["","价格","交期","品牌/规格","无货","付款条件","物流","客户取消","已有供应商","项目暂停","失联","其他"]],["quoteDate","报价日期","date"],["nextFollowUp","下次跟进","date"],["notes","备注","textarea"]
  ],
  order:[
    ["clientId","客户","client",true],["piNo","PI编号","text",true],["amount","金额","number"],["currency","币种","select",false,["USD","EUR","CNY","TRY","RUB"]],
    ["paymentTerms","付款方式","text"],["depositDue","定金/首付款应付","number"],["paidAmount","已付金额","number"],["balanceDue","待付余额","number"],["promisedPayDate","承诺付款日期","date"],
    ["paymentStatus","付款状态","select",false,["未付款","部分付款","已付款","退款/取消"]],
    ["orderStatus","订单状态","select",false,["PI待确认","PI待付款","已付款","备货中","待出货","已出货","已完成","暂停","取消"]],
    ["piDate","PI日期","date"],["deliveryDate","交期","date"],["shippingMode","运输方式","select",false,["DHL/UPS/FedEx","客户货代/中国仓","俄罗斯专线/货代","空运","海运","客户自提","其他"]],["forwarder","货代/承运商","text"],["chinaWarehouseDate","交中国仓日期","date"],["internationalShipDate","国际出运日期","date"],["shipping","物流/渠道","text"],["tracking","运单号","text"],["customsStatus","清关状态","text"],["expectedArrival","预计到达","date"],["receivedDate","实际签收","date"],["notes","备注","textarea"]
  ],
  sample:[
    ["clientId","客户","client",true],["partNo","样品型号/名称","text",true],["qty","样品数量","text"],
    ["requestDate","客户提出样品日期","date"],["deliveryMode","交付方式","select",false,["直接寄客户","寄客户货代/中国仓","客户自提/其他"]],
    ["sentDate","我司寄出日期","date"],["carrier","国内物流/快递","text"],["tracking","国内运单号","text"],
    ["forwarderName","客户货代/仓库名称","text"],["forwarderArrivalDate","货代收货日期","date"],["consolidationDueDate","预计集货/出运日期","date"],
    ["internationalShipDate","国际出运日期","date"],["internationalCarrier","国际物流/渠道","text"],["internationalTracking","国际运单号","text"],
    ["status","样品状态","select",false,["待确认","待寄出","已寄出","运输中","已交客户货代","货代待集货","等待客户安排出运","已国际出运","国际运输中","已签收待测试","测试中","测试通过","测试未通过","已结束","取消"]],
    ["expectedArrival","预计客户收货日期","date"],["feedbackDueDate","预计反馈日期","date"],["feedbackDate","实际反馈日期","date"],
    ["feedbackResult","反馈结论","select",false,["待反馈","满意/通过","需改进","失败/不通过","暂无结论"]],["feedback","客户样品反馈","textarea"],
    ["nextAction","下一步","text"],["nextFollowUp","下次跟进","date"],["notes","备注","textarea"]
  ],
  task:[["title","任务名称","text",true],["priority","优先级","select",false,["高","普通","低"]],["dueDate","到期日期","date"],["clientId","关联客户","client"],["notes","备注","textarea"]],
  holiday:[["country","国家","text",true],["name","节日名称","text",true],["date","日期","date",true],["remindDays","提前提醒天数","number"],["notes","备注","textarea"]]
};

window.openForm = (type,id=null,preset={})=>{
  editing={type,id};
  const key=pathFor(type), existing=id?state[key].find(x=>x.id===id)||{}:{...preset};
  if(!id){
    if(type==="client"){existing.grade="C";existing.status="新客户"}
    if(type==="communication"){existing.date=todayISO();existing.channel="Email";existing.direction="我联系客户";if(existing.clientId&&!existing.contactEmail){const cc=state.clients.find(x=>x.id===existing.clientId);existing.contactEmail=currentContactInfo(cc||{}).current?.email||""}}
    if(type==="rfq"){existing.requestDate=todayISO();existing.status="待报价";existing.nextFollowUp=addDays(todayISO(),state.settings.rfqFollowDays||2)}
    if(type==="quote"){existing.status="待报价";existing.quoteDate=todayISO();existing.nextFollowUp=addDays(todayISO(),state.settings.quoteFollowDays)}
    if(type==="order"){existing.paymentStatus="未付款";existing.orderStatus="PI待付款";existing.piDate=todayISO();existing.currency=state.settings.currency}
    if(type==="sample"){existing.requestDate=todayISO();existing.status="待确认";existing.feedbackResult="待反馈";existing.nextFollowUp=addDays(todayISO(),3)}
    if(type==="task"){existing.priority="普通";existing.dueDate=todayISO()}
    if(type==="holiday"){existing.remindDays=7}
  }
  if(type==="client"){
    existing.email=getClientEmails(existing,{includeNotes:true}).join("; ");
    const a=clientAssignment(existing); existing.salesProfile=[a.salesperson,a.company,a.email].filter(Boolean).join(" | ");
  }
  const names={client:"客户",communication:"沟通记录",rfq:"RFQ/询价",quote:"报价",order:"PI / 订单",sample:"样品记录",task:"任务",holiday:"节假日"};
  $("formTitle").textContent=(id?"编辑 ":"新增 ")+names[type];
  $("formFields").innerHTML=schemas[type].map(f=>fieldHtml(f,existing[f[0]],existing)).join("");
  $("formModal").classList.add("show");
  if(type==="communication"){const clientSel=$("entityForm").querySelector('[name="clientId"]'),emailSel=$("entityForm").querySelector('[name="contactEmail"]');const refreshEmails=()=>{if(!emailSel)return;const cc=state.clients.find(x=>x.id===clientSel?.value),list=cc?getClientContacts(cc,{includeNotes:true}):[],cur=emailSel.value;emailSel.innerHTML='<option value="">请选择邮箱</option>'+list.map(x=>`<option value="${esc(x.email)}" ${cur.toLowerCase()===x.email.toLowerCase()?"selected":""}>${esc(contactLabel(x))}</option>`).join("");if(!emailSel.value&&cc)emailSel.value=currentContactInfo(cc).current?.email||"";};clientSel?.addEventListener("change",refreshEmails);refreshEmails();}
};
function fieldHtml([key,label,type,required,opts],val,context={}){
  const req=required?"required":"";
  let c="";
  if(type==="textarea") c=`<textarea name="${key}" ${req}>${esc(val||"")}</textarea>`;
  else if(type==="select") c=`<select name="${key}" ${req}>${(opts||[]).map(o=>`<option ${String(val)===String(o)?"selected":""}>${esc(o)}</option>`).join("")}</select>`;
  else if(type==="salesProfile"){
    const profiles=salesProfiles(),cur=String(val||"").trim();
    const values=profiles.map(p=>[p.salesperson,p.company,p.email].filter(Boolean).join(" | "));
    const custom=cur&&!values.includes(cur)?`<option value="${esc(cur)}" selected>${esc(cur)}（现有）</option>`:"";
    c=`<select name="${key}" ${req}><option value="">未分配</option>${custom}${values.map(v=>`<option value="${esc(v)}" ${cur===v?"selected":""}>${esc(v)}</option>`).join("")}</select><div class="item-meta" style="margin-top:4px">没有选项时，请先到“设置 → 跟进业务员 / 我方公司”配置。</div>`;
  }
  else if(type==="client") c=`<select name="${key}" ${req}><option value="">请选择客户</option>${state.clients.map(x=>`<option value="${x.id}" ${val===x.id?"selected":""}>${esc(x.company)} · ${esc(x.country||"")}</option>`).join("")}</select>`;
  else if(type==="clientEmail"){const cc=state.clients.find(x=>x.id===context.clientId),emails=cc?getClientContacts(cc,{includeNotes:true}):[];c=`<select name="${key}" ${req}><option value="">请选择邮箱</option>${emails.map(x=>`<option value="${esc(x.email)}" ${String(val).toLowerCase()===x.email.toLowerCase()?"selected":""}>${esc(contactLabel(x))}</option>`).join("")}</select>`;}
  else c=`<input name="${key}" type="${type}" value="${esc(val??"")}" ${req}>`;
  return `<div class="field ${type==="textarea"?"full":""}"><label>${esc(label)}${required?" *":""}</label>${c}</div>`;
}
$("saveEntityBtn").addEventListener("click",saveEntity);
async function saveEntity(){
  const form=$("entityForm");if(!form.reportValidity())return;const wasEditing=Boolean(editing.id),original=(editing.type&&editing.id)?state[pathFor(editing.type)]?.find(x=>x.id===editing.id)||{}:{};const fd=new FormData(form),obj={};for(const[k,v]of fd.entries())obj[k]=v;
  if(editing.type==="order"){obj.amount=Number(obj.amount||0);obj.depositDue=Number(obj.depositDue||0);obj.paidAmount=Number(obj.paidAmount||0);obj.balanceDue=Number(obj.balanceDue||0);}if(editing.type==="rfq")obj.itemCount=Number(obj.itemCount||0);if(editing.type==="holiday")obj.remindDays=Number(obj.remindDays||7);if(editing.type==="client"){const p=parseSalesProfileLine(obj.salesProfile||"");obj.ownerSalesperson=p.salesperson;obj.ownerCompany=p.company;obj.ownerEmail=p.email;delete obj.salesProfile;buildContactsFromEditedClient(obj,original);canonicalizeClientCountry(obj);}if(editing.type!=="client"&&obj.clientId){const a=assignmentForClientId(obj.clientId);obj.ownerSalesperson=obj.ownerSalesperson||a.salesperson;obj.ownerCompany=obj.ownerCompany||a.company;obj.ownerEmail=obj.ownerEmail||a.email;}if(editing.type==="communication"){if(!obj.feedbackType)obj.feedbackType=inferFeedbackType(obj.customerFeedback||obj.content||"");const inf=inferCommunicationNextStep(obj);if(!String(obj.nextAction||"").trim())obj.nextAction=inf.nextAction;if(!String(obj.nextFollowUp||"").trim())obj.nextFollowUp=inf.nextFollowUp;}if(editing.type==="sample"){const base=obj.internationalShipDate||obj.forwarderArrivalDate||obj.sentDate||obj.requestDate||todayISO();if(!String(obj.nextAction||"").trim()){if(["已交客户货代","货代待集货","等待客户安排出运"].includes(obj.status))obj.nextAction="确认货代已收货，并等待客户集货/国际出运安排";else if(["已国际出运","国际运输中"].includes(obj.status))obj.nextAction="跟踪国际物流并确认客户签收";else if(["已寄出","运输中"].includes(obj.status)){obj.nextAction=obj.deliveryMode==="寄客户货代/中国仓"?"确认客户货代是否已收货":"确认样品是否签收";}else if(["已签收待测试","测试中"].includes(obj.status))obj.nextAction="跟进样品测试结果";else if(obj.status==="测试通过")obj.nextAction="询问批量需求并推进正式订单";else if(obj.status==="测试未通过")obj.nextAction="确认失败原因并提供替代/改进方案";else obj.nextAction="推进样品安排";}if(!String(obj.nextFollowUp||"").trim()){if(obj.feedbackDueDate)obj.nextFollowUp=obj.feedbackDueDate;else if(obj.expectedArrival)obj.nextFollowUp=obj.expectedArrival;else if(obj.consolidationDueDate)obj.nextFollowUp=obj.consolidationDueDate;else if(["已交客户货代","货代待集货","等待客户安排出运"].includes(obj.status))obj.nextFollowUp=addDays(base,7);else obj.nextFollowUp=addDays(base,3);}}sync("busy","正在保存…");const key=pathFor(editing.type);
  if(editing.id)await updateDoc(doc(db,"users",currentUser.uid,key,editing.id),{...obj,updatedAt:serverTimestamp()});else{const r=await addDoc(refCollection(key),{...obj,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});editing.id=r.id;}
  if(editing.type==="client"&&obj.country)autoTrackCountriesFromNames([obj.country]).catch(console.warn);if(editing.type==="communication"&&obj.clientId)await updateClientOutreachFromCommunication(obj,{isNew:!wasEditing});closeModal("formModal");sync("ok","已自动同步");
}
async function updateClientOutreachFromCommunication(obj,{isNew=true}={}){
  const c=state.clients.find(x=>x.id===obj.clientId);if(!c)return;const info=currentContactInfo(c);let contacts=info.contacts.map(x=>({...x}));const wanted=(extractEmails(obj.contactEmail||"")[0]||info.current?.email||"").toLowerCase();let idx=contacts.findIndex(x=>x.email.toLowerCase()===wanted);if(idx<0&&wanted){contacts.push(normalizeContactRecord({email:wanted}));idx=contacts.length-1;}if(idx<0&&contacts.length)idx=0;const updates={lastContact:obj.date||todayISO(),updatedAt:serverTimestamp()};if(obj.nextFollowUp)updates.nextFollowUp=obj.nextFollowUp;const limit=Math.max(1,Number(state.settings.contactNoReplyLimit||3)),gap=Math.max(1,Number(state.settings.contactFollowDays||3));
  if(idx>=0){let ct={...contacts[idx]};if(isNew&&obj.direction==="我联系客户"){ct.touchCount=(ct.touchCount||0)+1;ct.noReplyCount=(ct.noReplyCount||0)+1;ct.lastContact=obj.date||todayISO();ct.nextFollowUp=obj.nextFollowUp||addDays(ct.lastContact,gap);ct.status=ct.noReplyCount>=limit?`${limit}次未回复`:"开发中";contacts[idx]=ct;updates.contacts=contacts;updates.currentContactEmail=ct.email;updates.contactRotationStatus=ct.noReplyCount>=limit?"waiting_switch":"active";updates.nextFollowUp=ct.noReplyCount>=limit?(obj.date||todayISO()):ct.nextFollowUp;if(["新客户",""].includes(c.status||""))updates.status="已开发";}
    else if(isNew&&["客户回复","双向沟通"].includes(obj.direction)){contacts=contacts.map((x,i)=>({...x,isPrimary:i===idx}));ct={...contacts[idx],replied:true,invalid:false,isPrimary:true,status:"已回复",lastContact:obj.date||todayISO(),noReplyCount:0};contacts[idx]=ct;updates.contacts=contacts;updates.currentContactEmail=ct.email;updates.contactRotationStatus="replied";updates.status="已回复";if(!obj.nextFollowUp)delete updates.nextFollowUp;if(ct.name)updates.contact=ct.name;if(ct.title)updates.title=ct.title;if(ct.phone)updates.phone=ct.phone;if(ct.whatsapp)updates.whatsapp=ct.whatsapp;}
    else if(isNew&&obj.direction==="邮件退信"){ct={...ct,invalid:true,replied:false,status:"无效",lastContact:obj.date||todayISO()};contacts[idx]=ct;updates.contacts=contacts;updates.currentContactEmail=ct.email;updates.contactRotationStatus="waiting_switch";updates.nextFollowUp=obj.date||todayISO();}}
  await updateDoc(doc(db,"users",currentUser.uid,"clients",obj.clientId),updates);
}
window.recordOutreachTouch=async clientId=>{const c=state.clients.find(x=>x.id===clientId);if(!c)return;const info=currentContactInfo(c);if(!info.current){alert("这个客户还没有可开发邮箱，请先编辑客户并添加邮箱。");return}const n=(info.current.touchCount||0)+1,next=addDays(todayISO(),Math.max(1,Number(state.settings.contactFollowDays||3)));if(!confirm(`记录一次开发邮件？\n\n当前联系人：${contactLabel(info.current)}\n本次将记为第 ${n} 次联系。`))return;sync("busy","正在记录开发…");const a=clientAssignment(c),obj={clientId,date:todayISO(),channel:"Email",direction:"我联系客户",contactEmail:info.current.email,ownerSalesperson:a.salesperson,ownerCompany:a.company,ownerEmail:a.email,subject:`开发邮件 · 第${n}次`,content:`已向 ${info.current.email} 发送第 ${n} 次开发/跟进邮件，暂未收到回复。`,nextAction:"等待回复",nextFollowUp:next};await addDoc(refCollection("communications"),{...obj,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});await updateClientOutreachFromCommunication(obj,{isNew:true});sync("ok","已自动同步");};
window.switchToNextContact=async clientId=>{const c=state.clients.find(x=>x.id===clientId);if(!c)return;const info=currentContactInfo(c);if(!info.current){alert("没有可切换的联系人。");return}if(!info.next){if(!confirm(`这家公司没有更多可用联系人了。\n\n是否标记为“沉睡客户”，并在 ${state.settings.dormantDays||30} 天后重新提醒？`))return;await updateDoc(doc(db,"users",currentUser.uid,"clients",clientId),{contactRotationStatus:"completed",status:"沉睡客户",nextFollowUp:addDays(todayISO(),Number(state.settings.dormantDays||30)),updatedAt:serverTimestamp()});return}if(!confirm(`切换开发联系人？\n\n当前：${contactLabel(info.current)}\n下一位：${contactLabel(info.next)}`))return;const contacts=info.contacts.map(x=>({...x})),oldIdx=info.index,nextIdx=contacts.findIndex(x=>x.email.toLowerCase()===info.next.email.toLowerCase());if(oldIdx>=0&&!contacts[oldIdx].replied&&!contacts[oldIdx].invalid&&contacts[oldIdx].status!==`${info.limit}次未回复`)contacts[oldIdx].status="已切换";if(nextIdx>=0&&contacts[nextIdx].status==="未开始")contacts[nextIdx].status="开发中";const patch={contacts,currentContactEmail:info.next.email,contactRotationStatus:"active",nextFollowUp:todayISO(),updatedAt:serverTimestamp()};if(info.next.name)patch.contact=info.next.name;if(info.next.title)patch.title=info.next.title;if(info.next.phone)patch.phone=info.next.phone;if(info.next.whatsapp)patch.whatsapp=info.next.whatsapp;await updateDoc(doc(db,"users",currentUser.uid,"clients",clientId),patch);};
window.setCurrentContact=async(clientId,encodedEmail)=>{const email=decodeURIComponent(encodedEmail||""),c=state.clients.find(x=>x.id===clientId);if(!c)return;const contacts=getClientContacts(c,{includeNotes:true}),ct=contacts.find(x=>x.email.toLowerCase()===email.toLowerCase());if(!ct)return;const patch={contacts,currentContactEmail:ct.email,contactRotationStatus:ct.replied?"replied":"active",nextFollowUp:c.nextFollowUp||todayISO(),updatedAt:serverTimestamp()};if(ct.name)patch.contact=ct.name;if(ct.title)patch.title=ct.title;if(ct.phone)patch.phone=ct.phone;if(ct.whatsapp)patch.whatsapp=ct.whatsapp;await updateDoc(doc(db,"users",currentUser.uid,"clients",clientId),patch);};
window.markContactInvalid=async(clientId,encodedEmail)=>{const email=decodeURIComponent(encodedEmail||""),c=state.clients.find(x=>x.id===clientId);if(!c)return;if(!confirm(`把 ${email} 标记为无效/退信，并提示切换下一联系人吗？`))return;const contacts=getClientContacts(c,{includeNotes:true}).map(x=>x.email.toLowerCase()===email.toLowerCase()?{...x,invalid:true,replied:false,status:"无效",lastContact:todayISO()}:x);await updateDoc(doc(db,"users",currentUser.uid,"clients",clientId),{contacts,currentContactEmail:email,contactRotationStatus:"waiting_switch",nextFollowUp:todayISO(),updatedAt:serverTimestamp()});};
window.openContactCommunication=(clientId,encodedEmail,direction="我联系客户")=>{const email=decodeURIComponent(encodedEmail||"");openForm("communication",null,{clientId,contactEmail:email,direction});};

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

function clientQuoteGroups(quotes){
  const groups=new Map();
  quotes.forEach(q=>{
    const batch=Array.isArray(q.items)&&q.items.length;
    const source=batch?(q.sourceFile||q.batchName||'批量报价'):(q.partNo||q.id);
    const key=`${q.quoteDate||''}||${source}`;
    if(!groups.has(key))groups.set(key,{key,date:q.quoteDate||'',source,quotes:[],items:[],status:[],priced:0});
    const g=groups.get(key);g.quotes.push(q);g.status.push(q.status||'');
    if(batch){g.items.push(...q.items);g.priced+=q.items.filter(i=>i.quotePrice).length;}else{g.items.push({partNo:q.partNo,brand:q.brand,qty:q.qty,targetPrice:q.targetPrice,quotePrice:q.quotePrice,currency:q.currency,dc:q.dc,leadTime:q.leadTime,notes:q.notes});if(q.quotePrice)g.priced++;}
  });
  return [...groups.values()].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
}
window.openClientQuoteGroup=(clientId,encodedKey)=>{
  const key=decodeURIComponent(encodedKey||'');
  const quotes=state.quotes.filter(x=>x.clientId===clientId);
  const g=clientQuoteGroups(quotes).find(x=>x.key===key);if(!g)return;
  $('quoteBatchTitle').textContent=g.source||'报价明细';$('quoteBatchSub').textContent=`${clientName(clientId)} · ${fmtDate(g.date)} · ${g.items.length} 个型号`;
  $('quoteBatchBody').innerHTML=`<div class="notice">客户详情只显示报价摘要；这里按需要查看型号明细。</div><div class="table-wrap"><table><thead><tr><th>#</th><th>型号</th><th>品牌</th><th>数量</th><th>Target Price</th><th>报价</th><th>币种</th><th>DC</th><th>交期</th><th>备注</th></tr></thead><tbody>${g.items.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.partNo||'')}</b></td><td>${esc(x.brand||'')}</td><td>${esc(x.qty||'')}</td><td>${esc(x.targetPrice||'')}</td><td>${esc(x.quotePrice||'')}</td><td>${esc(x.currency||'')}</td><td>${esc(x.dc||'')}</td><td>${esc(x.leadTime||'')}</td><td>${esc(x.notes||'')}</td></tr>`).join('')}</tbody></table></div>`;
  $('quoteBatchModal').classList.add('show');
};

function renderClientDetail(){
  const c=state.clients.find(x=>x.id===currentClientId); if(!c)return;
  const rfqs=state.rfqs.filter(x=>x.clientId===c.id).sort((a,b)=>(b.requestDate||"").localeCompare(a.requestDate||""));
  const comms=state.communications.filter(x=>x.clientId===c.id).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const quotes=state.quotes.filter(x=>x.clientId===c.id).sort((a,b)=>(b.quoteDate||"").localeCompare(a.quoteDate||""));
  const orders=state.orders.filter(x=>x.clientId===c.id).sort((a,b)=>(b.piDate||"").localeCompare(a.piDate||""));
  const samples=state.samples.filter(x=>x.clientId===c.id).sort((a,b)=>(b.sentDate||b.requestDate||"").localeCompare(a.sentDate||a.requestDate||""));
  const files=state.files.filter(x=>x.clientId===c.id).sort((a,b)=>(b.createdDate||"").localeCompare(a.createdDate||""));

  $("clientTitle").textContent=c.company||"客户详情";
  const clientEmails=getClientEmails(c,{includeNotes:true}),rot=currentContactInfo(c),current=rot.current;
  $("clientSub").textContent=[c.country,c.city,current?.name||c.contact,current?.email||clientEmails[0]].filter(Boolean).join(" · ");
  const rotationText=rot.pending?(rot.next?`建议切换到：${contactLabel(rot.next)}`:"所有联系人已开发完，建议转沉睡客户"):(current?`当前：${contactLabel(current)} · 已联系 ${current.touchCount||0}/${rot.limit} 次`:"尚未设置开发联系人");
  const currentStage=orders.find(x=>!["已完成","取消"].includes(x.orderStatus))?"PI/订单":samples.find(x=>!["测试通过","测试未通过","已结束","取消"].includes(x.status))?"样品":quotes.find(x=>!["成交","丢单","暂停"].includes(x.status))?"报价后跟进":rfqs.find(x=>!["已全部报价","客户取消","已结束"].includes(x.status))?"RFQ处理":comms.length?"开发/沟通":"新客户";
  const nextRec=recommendNextStep(c.id);
  $("clientOverview").innerHTML=`<div class="summary-box"><div class="card-head"><h3>客户当前状态摘要</h3>${badge(c.grade?`${c.grade}级客户`:"未评级",c.grade==="A"?"red":c.grade==="B"?"orange":"green")}</div><div class="summary-grid"><div class="summary-kpi"><div class="k">当前阶段</div><div class="v">${esc(currentStage)}</div></div><div class="summary-kpi"><div class="k">当前联系人</div><div class="v">${esc(contactLabel(current)||"—")}</div></div><div class="summary-kpi"><div class="k">最近动作</div><div class="v">${esc((comms[0]?.subject||quotes[0]?.batchName||quotes[0]?.partNo||rfqs[0]?.rfqNo||samples[0]?.partNo||"暂无").slice(0,60))}</div></div><div class="summary-kpi"><div class="k">下一步</div><div class="v">${esc(nextRec.title)}</div></div></div></div><div class="grid cols-2"><div class="card"><div class="item-meta">基本资料</div><h3>${esc(c.company||"")}</h3><div class="item-meta">国家：${esc(c.country||"—")} · 等级：${esc(c.grade||"—")} · 状态：${esc(c.status||"—")}</div><div class="item-meta"><b>跟进归属：</b>${esc(assignmentLabel(c))}</div><div class="item-meta">邮箱：${clientEmails.length?clientEmails.map(e=>esc(e)).join("；"):"—"} · WhatsApp：${esc(c.whatsapp||"—")}</div></div><div class="card"><div class="item-meta">联系人开发状态</div><h3>${esc(rotationText)}</h3><div class="item-meta">最后联系：${fmtDate(c.lastContact)} · 下次跟进：${fmtDate(c.nextFollowUp)}</div><div style="margin-top:8px;display:flex;gap:7px;flex-wrap:wrap"><button class="btn small primary" onclick="openForm('communication',null,{clientId:'${c.id}'})">记录沟通</button>${current&&!current.replied&&!current.invalid?` <button class="btn small" onclick="recordOutreachTouch('${c.id}')">＋记录一次开发</button>`:""}${rot.pending?` <button class="btn small danger" onclick="switchToNextContact('${c.id}')">➡ 切换下一联系人</button>`:""} <button class="btn small" onclick="openForm('rfq',null,{clientId:'${c.id}'})">新增RFQ</button> <button class="btn small" onclick="openForm('quote',null,{clientId:'${c.id}'})">新增报价</button></div></div></div>`;
  const contactRows=rot.contacts.map((ct,i)=>{const currentFlag=i===rot.index,cls=currentFlag?"current":ct.replied?"replied":ct.invalid?"invalid":"",st=ct.replied?"已回复":ct.invalid?"无效":ct.status||"未开始",encoded=encodeURIComponent(ct.email);return `<div class="contact-row ${cls}"><div class="contact-row-head"><div><div class="contact-email">${esc(ct.email)} ${currentFlag?badge("当前","green"):""} ${ct.isPrimary?badge("主要联系人","green"):""}</div><div class="contact-meta">${esc([ct.name,ct.title].filter(Boolean).join(" · ")||"未填写姓名/职位")}<br>已联系 ${ct.touchCount||0} 次 · 连续未回复 ${ct.noReplyCount||0} 次 · 最后联系 ${fmtDate(ct.lastContact)}</div></div><div>${badge(st,ct.replied?"green":ct.invalid||ct.noReplyCount>=rot.limit?"red":"orange")}</div></div><div class="contact-actions">${!currentFlag&&!ct.invalid&&!ct.replied?`<button class="btn small" onclick="setCurrentContact('${c.id}','${encoded}')">设为当前</button>`:""}<button class="btn small" onclick="openContactCommunication('${c.id}','${encoded}','我联系客户')">记录沟通</button>${!ct.replied?`<button class="btn small" onclick="openContactCommunication('${c.id}','${encoded}','客户回复')">记录回复</button>`:""}${!ct.invalid&&!ct.replied?`<button class="btn small danger" onclick="markContactInvalid('${c.id}','${encoded}')">退信/无效</button>`:""}</div></div>`;}).join("");
  $("clientContacts").innerHTML=`<div class="contact-workflow"><div class="contact-summary"><div class="contact-kpi"><div class="k">当前开发联系人</div><div class="v">${rot.current?`${rot.index+1}/${rot.contacts.length}`:"0/0"}</div></div><div class="contact-kpi"><div class="k">当前邮箱</div><div class="v">${esc(rot.current?.email||"—")}</div></div><div class="contact-kpi"><div class="k">当前联系次数</div><div class="v">${rot.current?`${rot.current.touchCount||0}/${rot.limit}`:"—"}</div></div><div class="contact-kpi"><div class="k">下一联系人</div><div class="v">${esc(rot.next?contactLabel(rot.next):"—")}</div></div></div>${rot.pending?`<div class="rotation-alert high">⚠️ ${esc(rot.reason)}。${rot.next?`建议切换到下一联系人：${esc(contactLabel(rot.next))}`:`该公司全部可用联系人已开发完，建议进入沉睡客户，稍后再次开发。`}<div style="margin-top:8px"><button class="btn small primary" onclick="switchToNextContact('${c.id}')">${rot.next?"切换下一联系人":"转为沉睡客户"}</button></div></div>`:`<div class="rotation-alert">开发规则：同一联系人连续联系 ${rot.limit} 次仍无回复时，首页和跟进中心会提醒你切换下一联系人；任何联系人回复后，停止轮换并把回复人设为主要联系人。</div>`}<div>${contactRows||empty("暂无邮箱。请编辑客户添加多个邮箱，或从 Excel 导入联系人。")}</div></div>`;

  const events=[];
  rfqs.forEach(x=>events.push({date:x.requestDate,kind:"RFQ",title:`${x.rfqNo||"询价"} · ${x.status||""}`,desc:`${x.itemCount||0}项；${x.customerNeed||x.notes||""}`}));
  comms.forEach(x=>events.push({date:x.date,kind:x.channel||"沟通",title:x.subject||x.direction||"沟通",desc:x.content||""}));
  quotes.forEach(x=>{const batch=Array.isArray(x.items)&&x.items.length;events.push({date:x.quoteDate,kind:"报价",title:batch?`${x.batchName||"批量报价"} · ${x.itemCount||x.items.length}项 · ${x.status||""}`:`${x.partNo||"型号"} · ${x.status||""}`,desc:batch?`Excel批量报价，共 ${x.itemCount||x.items.length} 个型号；${x.priceSummary||x.quotePrice||""}`:`数量：${x.qty||"—"}；报价：${x.quotePrice||"—"}`})});
  orders.forEach(x=>events.push({date:x.piDate,kind:"PI/订单",title:`${x.piNo||"PI"} · ${x.orderStatus||""}`,desc:`金额：${x.amount||0} ${x.currency||state.settings.currency}；付款：${x.paymentStatus||"—"}`}));
  samples.forEach(x=>events.push({date:x.feedbackDate||x.internationalShipDate||x.forwarderArrivalDate||x.sentDate||x.requestDate,kind:"样品",title:`${x.partNo||x.itemName||"样品"} · ${x.status||""}`,desc:`数量：${x.qty||"—"}；方式：${x.deliveryMode||"—"}；我司寄出：${fmtDate(x.sentDate)}${x.forwarderArrivalDate?`；货代收货：${fmtDate(x.forwarderArrivalDate)}`:""}${x.internationalShipDate?`；国际出运：${fmtDate(x.internationalShipDate)}`:""}；反馈：${x.feedbackResult||"待反馈"}${x.feedback?`；${x.feedback}`:""}`}));
  events.sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  $("clientTimeline").innerHTML=events.length?`<div class="timeline">${events.map(e=>`<div class="tl"><div class="date">${fmtDate(e.date)} · ${esc(e.kind)}</div><div class="title">${esc(e.title)}</div><div class="desc">${esc(e.desc)}</div></div>`).join("")}</div>`:empty("暂无历史。");

  $("clientComms").innerHTML=comms.length?comms.map(x=>`<div class="item"><div class="item-title">${esc(x.channel||"沟通")} · ${esc(x.direction||"")}</div><div class="item-meta">${fmtDate(x.date)} · ${esc(x.contactEmail||"")} · ${esc(x.subject||"")}${x.feedbackType?` · ${esc(x.feedbackType)}`:""}</div><div class="item-meta">${esc(x.content||"")}</div><div style="margin-top:6px"><button class="btn small" onclick="openForm('communication','${x.id}')">编辑</button> <button class="btn small danger" onclick="removeEntity('communication','${x.id}')">删除</button></div></div>`).join(""):empty("暂无沟通历史。");
  $("addCommBtn").onclick=()=>openForm("communication",null,{clientId:c.id,contactEmail:currentContactInfo(c).current?.email||""});

  $("clientRfqs").innerHTML=rfqs.length?`<div class="card-head"><h3>RFQ / 询价记录</h3><div class="item-meta">只显示摘要，避免几百个型号把客户详情铺满。</div></div>${rfqs.map(r=>`<div class="item"><div class="item-title">${esc(r.rfqNo||r.subject||"RFQ")} ${badge(r.status||"待处理","orange")}</div><div class="item-meta">${fmtDate(r.requestDate)} · ${r.itemCount||0} 项 · ${esc(r.sourceFile||"")}</div><div class="item-meta">${esc(r.customerNeed||r.notes||"")}</div><div style="margin-top:6px"><button class="btn small" onclick="openForm('rfq','${r.id}')">编辑</button></div></div>`).join("") : empty("暂无 RFQ 记录。");

  const quoteGroups=clientQuoteGroups(quotes);
  $("clientQuotes").innerHTML=quoteGroups.length?`<div class="card-head"><h3>报价记录</h3><div class="item-meta">客户详情只按“哪天报价了什么”显示摘要，型号明细需要时再展开。</div></div><div>${quoteGroups.map(g=>{const parts=g.items.map(i=>i.partNo).filter(Boolean);const preview=parts.slice(0,4).join("、")+(parts.length>4?` 等 ${parts.length} 个型号`:parts.length?"":"报价");const st=[...new Set(g.status.filter(Boolean))].join(" / ")||"—";return `<div class="item"><div class="item-title">${fmtDate(g.date)} · ${esc(g.source||"报价")}</div><div class="item-meta">${esc(preview)} · 共 ${g.items.length} 项 · ${g.priced}/${g.items.length} 项已有报价 · ${esc(st)}</div><div style="margin-top:6px"><button class="btn small" onclick="openClientQuoteGroup('${c.id}','${encodeURIComponent(g.key).replace(/'/g,'%27')}')">查看型号明细</button></div></div>`}).join("")}</div>`:empty("暂无报价。");

  $("clientSamples").innerHTML=`<div class="card-head"><h3>样品跟进</h3><button class="btn small primary" onclick="openForm('sample',null,{clientId:'${c.id}'})">＋ 新增样品</button></div>${samples.length?samples.map(x=>`<div class="item"><div class="item-title">${esc(x.partNo||x.itemName||"样品")} · ${badge(x.status||"待确认",["测试通过","已结束"].includes(x.status)?"green":["测试未通过","取消"].includes(x.status)?"red":"orange")}</div><div class="item-meta">数量：${esc(x.qty||"—")} · 交付方式：${esc(x.deliveryMode||"—")} · 客户提出：${fmtDate(x.requestDate)}</div><div class="item-meta">我司寄出：${fmtDate(x.sentDate)} · 国内物流：${esc(x.carrier||"—")} ${esc(x.tracking||"")}</div>${x.deliveryMode==="寄客户货代/中国仓"||x.forwarderName||x.forwarderArrivalDate?`<div class="item-meta">客户货代：${esc(x.forwarderName||"—")} · 货代收货：${fmtDate(x.forwarderArrivalDate)} · 预计集货/出运：${fmtDate(x.consolidationDueDate)}</div>`:""}${x.internationalShipDate||x.internationalCarrier||x.internationalTracking?`<div class="item-meta">国际出运：${fmtDate(x.internationalShipDate)} · 国际物流：${esc(x.internationalCarrier||"—")} ${esc(x.internationalTracking||"")}</div>`:""}<div class="item-meta">预计客户收货：${fmtDate(x.expectedArrival)} · 预计反馈：${fmtDate(x.feedbackDueDate)} · 结果：${esc(x.feedbackResult||"待反馈")}</div>${x.feedback?`<div class="item-meta" style="margin-top:4px">客户反馈：${esc(x.feedback)}</div>`:""}${x.nextAction?`<div class="item-meta" style="margin-top:4px"><b>下一步：</b>${esc(x.nextAction)}${x.nextFollowUp?` · ${fmtDate(x.nextFollowUp)}`:""}</div>`:""}<div style="margin-top:6px"><button class="btn small" onclick="openForm('sample','${x.id}')">编辑/记录反馈</button> <button class="btn small danger" onclick="removeEntity('sample','${x.id}')">删除</button></div></div>`).join(""):empty("暂无样品记录。可区分直接寄客户、寄客户货代/中国仓、集货等待、国际出运和测试反馈。")}`;

  $("clientFiles").innerHTML=files.length?files.map(f=>`<div class="item"><div class="item-title">${esc(f.name||"附件链接")}</div><div class="item-meta">${esc(f.category||"外部链接")} · ${esc(f.url||"")}</div><div style="margin-top:5px"><a class="btn small" href="${esc(f.url)}" target="_blank" rel="noopener">打开</a> <button class="btn small danger" onclick="removeFile('${f.id}')">删除</button></div></div>`).join(""):empty("暂无附件链接。");

  $("addFileLinkBtn").onclick=addClientFileLink;
  const smart=renderSmartNextStep(c.id);
  $("saveSmartTaskBtn").onclick=()=>saveSmartNextAsTask(c.id);
  $("generateFollowupBtn").onclick=()=>generateFollowup(c.id);
  generateFollowup(c.id);
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


function feedbackSignals(text=""){
  const s=normalizeLooseText(text);
  const has=(arr)=>arr.some(x=>s.includes(normalizeLooseText(x)));
  return {
    price:has(["target price","price","expensive","high price","preço","preco","fiyat","pahalı","pahali","цена","дорого","目标价","价格","太贵"]),
    later:has(["later","next week","next month","contact later","depois","mais tarde","sonra","gelecek hafta","позже","потом","следующей неделе","以后","下周","下个月","晚点","稍后"]),
    noNeed:has(["no need","not interested","no demand","não precisa","nao precisa","sem interesse","ihtiyaç yok","ihtiyac yok","не нужно","не интересно","нет потребности","不需要","没需求","暂时不需要"]),
    sample:has(["sample","test","testing","trial","amostra","teste","numune","test etmek","образец","тест","测试","样品"]),
    payment:has(["payment","pay","transfer","invoice","ödeme","odeme","оплата","платеж","付款","汇款"]),
    delivery:has(["lead time","delivery","stock","shipment","teslimat","stok","срок","доставка","налич","交期","库存","物流","发货"])
  };
}
function inferFeedbackType(text){
  const s=String(text||"").toLowerCase();
  if(!s.trim())return "其他";
  if(/target|price|价格|贵|expensive/.test(s))return "价格高/目标价";
  if(/lead time|交期|delivery time|交货/.test(s))return "交期问题";
  if(/no stock|out of stock|无货|缺货/.test(s))return "无库存";
  if(/sample|样品|test|测试/.test(s))return "需要样品";
  if(/payment|付款|账期|deposit/.test(s))return "付款条件";
  if(/shipping|logistics|物流|货代|customs/.test(s))return "物流问题";
  if(/supplier|已有供应商|regular supplier/.test(s))return "已有供应商";
  if(/project.*pause|暂停|later|以后|稍后|next month/.test(s))return "等待项目";
  if(/no need|not needed|暂时不需要|没有需求/.test(s))return "暂时无需求";
  if(/order|po|pi|下单|采购|purchase/.test(s))return "成交信号";
  return "其他";
}

function inferCommunicationNextStep(obj){
  const text=[obj.customerFeedback,obj.content,obj.subject].filter(Boolean).join(" ");
  const sig=feedbackSignals(text), base=obj.date||todayISO();
  if(obj.direction==="邮件退信")return{nextAction:"切换下一联系人",nextFollowUp:base};
  if(["客户回复","双向沟通"].includes(obj.direction)){
    if(sig.price)return{nextAction:"重新核价，并向客户确认目标价/可接受区间",nextFollowUp:addDays(base,1)};
    if(sig.sample)return{nextAction:"跟进样品测试结果，并询问下一步批量需求",nextFollowUp:addDays(base,3)};
    if(sig.payment)return{nextAction:"确认付款安排、付款凭证或内部审批进度",nextFollowUp:addDays(base,1)};
    if(sig.delivery)return{nextAction:"核实库存/交期/物流后回复客户",nextFollowUp:addDays(base,1)};
    if(sig.noNeed)return{nextAction:"转长期维护，避免频繁打扰",nextFollowUp:addDays(base,state.settings.dormantDays||30)};
    if(sig.later)return{nextAction:"按客户要求稍后再联系",nextFollowUp:addDays(base,7)};
    return{nextAction:"根据客户回复继续推进，确认具体需求/数量/目标价格",nextFollowUp:addDays(base,2)};
  }
  return{nextAction:"等待回复；若无回复继续下一次开发",nextFollowUp:addDays(base,state.settings.contactFollowDays||3)};
}
function recommendNextStep(clientId){
  const c=state.clients.find(x=>x.id===clientId);if(!c)return{title:"暂无建议",reason:"没有找到客户资料。",dueDate:todayISO(),priority:"普通"};
  const comms=state.communications.filter(x=>x.clientId===clientId).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const quotes=state.quotes.filter(x=>x.clientId===clientId).sort((a,b)=>(b.quoteDate||"").localeCompare(a.quoteDate||""));
  const orders=state.orders.filter(x=>x.clientId===clientId).sort((a,b)=>(b.piDate||"").localeCompare(a.piDate||""));
  const unpaid=orders.find(o=>["未付款","部分付款"].includes(o.paymentStatus));
  if(unpaid)return{title:`跟进付款：${unpaid.piNo||"PI"}`,reason:`付款状态为“${unpaid.paymentStatus}”。先确认付款计划、审批障碍或是否需要补充文件。`,dueDate:todayISO(),priority:"高"};
  const samples=state.samples.filter(x=>x.clientId===clientId).sort((a,b)=>(b.sentDate||b.requestDate||"").localeCompare(a.sentDate||a.requestDate||""));
  const activeSample=samples.find(x=>!["测试通过","测试未通过","已结束","取消"].includes(x.status||""));
  if(activeSample){const due=activeSample.nextFollowUp||activeSample.feedbackDueDate||activeSample.expectedArrival||activeSample.consolidationDueDate||todayISO();const what=activeSample.partNo||activeSample.itemName||"样品";let title=`跟进样品：${what}`,reason=`当前样品状态：${activeSample.status||"待确认"}。`;if(["待确认","待寄出"].includes(activeSample.status))reason+=" 先确认样品数量、交付方式和寄出安排。";else if(["已寄出","运输中"].includes(activeSample.status))reason+=activeSample.deliveryMode==="寄客户货代/中国仓"?" 先确认客户货代是否已收货，不要过早询问客户测试结果。":" 查看物流并确认客户是否签收。";else if(["已交客户货代","货代待集货","等待客户安排出运"].includes(activeSample.status))reason+=` 样品目前在客户货代/中国仓${activeSample.forwarderName?`（${activeSample.forwarderName}）`:""}等待与其他货物集货。此阶段重点确认货代收货和出运计划，不应询问客户是否收到样品。`;else if(["已国际出运","国际运输中"].includes(activeSample.status))reason+=" 已进入国际运输，跟踪国际物流并确认最终签收。";else if(["已签收待测试","测试中"].includes(activeSample.status))reason+=" 客户已收到样品，到期后询问测试结果、问题点以及批量需求。";return{title,reason,dueDate:due,priority:due<=todayISO()?"高":"普通"};}
  const latestFinishedSample=samples.find(x=>["测试通过","测试未通过"].includes(x.status||""));
  if(latestFinishedSample&&latestFinishedSample.feedbackDate){if(latestFinishedSample.status==="测试通过")return{title:`样品通过，推进批量订单：${latestFinishedSample.partNo||"样品"}`,reason:`客户反馈：${latestFinishedSample.feedback||latestFinishedSample.feedbackResult||"测试通过"}。建议确认正式数量、目标价和交期。`,dueDate:addDays(latestFinishedSample.feedbackDate,1),priority:"高"};if(latestFinishedSample.status==="测试未通过")return{title:`处理样品问题：${latestFinishedSample.partNo||"样品"}`,reason:`客户反馈：${latestFinishedSample.feedback||latestFinishedSample.feedbackResult||"测试未通过"}。先确认失败现象、测试条件，再评估替代或重新送样。`,dueDate:addDays(latestFinishedSample.feedbackDate,1),priority:"高"};}
  const rot=currentContactInfo(c);
  if(rot.pending)return{title:rot.next?`切换下一联系人：${contactLabel(rot.next)}`:"转为沉睡客户",reason:rot.next?`${contactLabel(rot.current)} 已${rot.reason}，继续发同一邮箱意义不大。`:`现有可用联系人均已开发完成，建议 ${state.settings.dormantDays||30} 天后重新检查。`,dueDate:todayISO(),priority:"高"};
  const last=comms[0];
  if(last&&["客户回复","双向沟通"].includes(last.direction)){
    const inf=inferCommunicationNextStep(last);
    return{title:inf.nextAction,reason:`依据最近客户反馈：${(last.customerFeedback||last.content||last.subject||"客户已回复").slice(0,160)}`,dueDate:inf.nextFollowUp,priority:feedbackSignals([last.customerFeedback,last.content].join(" ")).noNeed?"普通":"高"};
  }
  const openRfq=state.rfqs.filter(x=>x.clientId===clientId).sort((a,b)=>(b.requestDate||"").localeCompare(a.requestDate||""))[0];
  if(openRfq && !["已全部报价","客户取消","已结束"].includes(openRfq.status||"")) return {title:`处理RFQ：${openRfq.rfqNo||"客户询价"}`,reason:`当前状态：${openRfq.status||"待报价"}，共 ${openRfq.itemCount||0} 项。先完成找货/报价，并记录无法报价的项目原因。`,dueDate:openRfq.nextFollowUp||todayISO(),priority:"高"};
  const openQuote=quotes.find(q=>!["成交","丢单","暂停"].includes(q.status));
  if(openQuote){
    const due=openQuote.nextFollowUp||(openQuote.quoteDate?addDays(openQuote.quoteDate,state.settings.quoteFollowDays||5):todayISO());
    const desc=Array.isArray(openQuote.items)?`${openQuote.itemCount||openQuote.items.length} 个型号的批量报价`:(openQuote.partNo||"最近报价");
    return{title:`跟进报价：${desc}`,reason:"先问客户对价格、交期、规格是否有反馈；如果价格敏感，优先索取 Target Price。",dueDate:due||todayISO(),priority:due&&due<=todayISO()?"高":"普通"};
  }
  if(rot.current&&(rot.current.touchCount||0)>0){
    return{title:`继续第 ${(rot.current.touchCount||0)+1} 次开发：${contactLabel(rot.current)}`,reason:`当前联系人已联系 ${rot.current.touchCount||0}/${rot.limit} 次且暂无回复。`,dueDate:rot.current.nextFollowUp||c.nextFollowUp||addDays(rot.current.lastContact||todayISO(),state.settings.contactFollowDays||3),priority:"普通"};
  }
  return{title:`首次开发：${contactLabel(rot.current)||c.company}`,reason:"暂无历史沟通，建议先做第一封简短开发邮件，并记录本次联系。",dueDate:todayISO(),priority:c.grade==="A"?"高":"普通"};
}
function renderSmartNextStep(clientId){
  const n=recommendNextStep(clientId),box=$("smartNextAction");if(!box)return n;
  box.className="smart-next "+(n.priority==="高"?"high":"");
  box.innerHTML=`<div class="title">${esc(n.title)}</div><div class="reason">${esc(n.reason)}<br><b>建议日期：</b>${fmtDate(n.dueDate)} · <b>优先级：</b>${esc(n.priority)}</div>`;
  return n;
}
async function saveSmartNextAsTask(clientId){
  const n=recommendNextStep(clientId);
  const exists=state.tasks.some(t=>!t.done&&t.clientId===clientId&&t.title===n.title&&t.dueDate===n.dueDate);
  if(exists)return alert("这条下一步任务已经存在，不重复创建。");
  await addDoc(refCollection("tasks"),{title:n.title,priority:n.priority==="高"?"高":"普通",dueDate:n.dueDate||todayISO(),clientId,notes:n.reason,source:"智能下一步",done:false,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
  alert("已把建议保存到任务中心。");
}

function generateFollowup(clientId){
  const c=state.clients.find(x=>x.id===clientId), comms=state.communications.filter(x=>x.clientId===clientId).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  const quotes=state.quotes.filter(x=>x.clientId===clientId).sort((a,b)=>(b.quoteDate||"").localeCompare(a.quoteDate||""));
  const orders=state.orders.filter(x=>x.clientId===clientId).sort((a,b)=>(b.piDate||"").localeCompare(a.piDate||""));
  const unpaid=orders.find(o=>["未付款","部分付款"].includes(o.paymentStatus));
  const openQuote=quotes.find(q=>!["成交","丢单","暂停"].includes(q.status));
  const samples=state.samples.filter(x=>x.clientId===clientId).sort((a,b)=>(b.sentDate||b.requestDate||"").localeCompare(a.sentDate||a.requestDate||""));
  const activeSample=samples.find(x=>!["测试通过","测试未通过","已结束","取消"].includes(x.status||""));
  const rot=currentContactInfo(c),ct=rot.current,person=ct?.name||c.contact||"";
  const hello=person?`Dear ${person},`:"Dear Customer,",wh=person?`Hi ${person},`:"Hi,";
  let strategy,email,wa;

  if(activeSample){
    const what=activeSample.partNo||activeSample.itemName||"sample";
    if(["已交客户货代","货代待集货","等待客户安排出运"].includes(activeSample.status)){strategy=`当前样品 ${what} 已到客户货代/中国仓，正在等待与客户其他货物集货。此阶段不要询问客户测试结果，重点确认货代收货及预计国际出运时间。`;email=`Subject: Sample shipment status – ${what}\n\n${hello}\n\nThe sample ${what} has been delivered to your forwarder / China warehouse${activeSample.forwarderName?` (${activeSample.forwarderName})`:""}.\n\nPlease let me know when it is planned to be consolidated with your other goods and shipped internationally. We will keep following the shipment status from our side.\n\nBest regards`;wa=`${wh} The sample ${what} has already been delivered to your forwarder / China warehouse${activeSample.forwarderName?` (${activeSample.forwarderName})`:""}. Please let me know when it is planned to be consolidated and shipped with your other goods.`;}else if(["已国际出运","国际运输中"].includes(activeSample.status)){strategy=`当前样品 ${what} 已国际出运。现在重点跟踪国际物流和最终签收，签收后再安排测试反馈跟进。`;email=`Subject: Sample shipment follow-up – ${what}\n\n${hello}\n\nThe sample ${what} is now in international transit${activeSample.internationalTracking?` (tracking: ${activeSample.internationalTracking})`:""}.\n\nPlease let me know once it arrives. After receipt, I’ll follow up with you regarding the testing result.\n\nBest regards`;wa=`${wh} The sample ${what} is now in international transit${activeSample.internationalTracking?` (${activeSample.internationalTracking})`:""}. Please let me know once it arrives.`;}else{strategy=`当前有样品在跟进：${what}，状态 ${activeSample.status||"待确认"}。优先确认签收/测试结果，不要同时发送普通开发邮件。`;email=`Subject: Follow-up on sample – ${what}\n\n${hello}\n\nI’m following up on the sample ${what}${activeSample.tracking?` (tracking: ${activeSample.tracking})`:""}.\n\nCould you please let me know whether it has arrived and, if testing has started, whether you have any initial feedback?\n\nIf there is any issue during testing, please send me the details and we will check it immediately.\n\nBest regards`;wa=`${wh} I’m following up on the sample ${what}${activeSample.tracking?` (${activeSample.tracking})`:""}. Has it arrived, and have you had a chance to test it? Any feedback is welcome.`;}
  }else if(unpaid){
    strategy=`高优先级：存在 ${unpaid.piNo||"PI"}，付款状态为 ${unpaid.paymentStatus}。建议先确认付款安排和是否有流程障碍，不重复介绍公司。`;
    email=`Subject: Follow-up on ${unpaid.piNo||"our PI"}\n\n${hello}\n\nJust a quick follow-up regarding ${unpaid.piNo||"the PI"} we sent earlier.\n\nPlease let me know if the payment schedule is clear or if there is anything we should clarify or adjust on our side before you proceed.\n\nBest regards`;
    wa=`${wh} just a quick follow-up regarding ${unpaid.piNo||"the PI"} we sent earlier. Please let me know if the payment arrangement is clear or if there is anything we should clarify on our side.`;
  }else if(openQuote){
    strategy=`建议跟进最近报价 ${openQuote.partNo||""}。先询问价格、交期或规格反馈；如果价格敏感，优先让客户给 target price。`;
    email=`Subject: Follow-up on quotation – ${openQuote.partNo||"your RFQ"}\n\n${hello}\n\nI’m following up on our quotation for ${openQuote.partNo||"your recent RFQ"}.\n\nPlease let me know if you have any feedback on the price, lead time or specification. If you have a target price, feel free to share it with me and I’ll check again with our team.\n\nBest regards`;
    wa=`${wh} I’m following up on our quotation for ${openQuote.partNo||"your recent RFQ"}. Do you have any feedback on the price or lead time? If you have a target price, feel free to send it to me.`;
  }else{
    strategy=rot.pending?(rot.next?`当前联系人 ${contactLabel(ct)} 已${rot.reason}。不要继续重复发给同一个邮箱，建议切换到 ${contactLabel(rot.next)} 后重新从第 1 次开发开始。`:`当前联系人已${rot.reason}，并且没有更多可用联系人。建议转为沉睡客户，${state.settings.dormantDays||30} 天后重新检查。`):`当前开发联系人：${contactLabel(ct)}，已联系 ${ct?.touchCount||0}/${rot.limit} 次。最近沟通 ${comms[0]?fmtDate(comms[0].date):"暂无"}。`;
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
  ownerSalesperson:["跟进业务员","业务员","销售","负责人","客户负责人","salesperson","sales person","sales rep","sales representative","account manager","owner"],
  ownerCompany:["我方公司","跟进公司","销售公司","供应商公司","our company","seller company","sales company","supplier company"],
  ownerEmail:["跟进邮箱","业务员邮箱","销售邮箱","我方邮箱","sales email","seller email","owner email"],
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
function fieldForHeader(h){
  const n=normalizeHeader(h), direct=aliasLookup.get(n); if(direct) return direct;
  if(/^(email|mail|邮箱|邮件)\d+$/.test(n)||/^email(?:address)?\d+$/.test(n)) return "email";
  return null;
}
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
function extractEmails(...values){
  const out=[], seen=new Set();
  const add=v=>{
    if(Array.isArray(v)){v.forEach(add);return}
    const text=String(v||"");
    const found=text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)||[];
    found.forEach(raw=>{const e=raw.trim().replace(/[),.;:]+$/g,"");const k=e.toLowerCase();if(e&&!seen.has(k)){seen.add(k);out.push(e)}});
  };
  values.forEach(add); return out;
}
function rawClientEmails(c,{includeNotes=false}={}){
  return extractEmails(c?.emails||[],c?.email||"",includeNotes?(c?.notes||""):"");
}
const CONTACT_STATUS_RANK={"未开始":0,"开发中":1,"已切换":1,"3次未回复":2,"无效":3,"已回复":4};
function normalizeContactRecord(x={},fallback={}){
  const email=extractEmails(x.email||fallback.email||"")[0]||"";
  return {email,name:String(x.name??fallback.name??"").trim(),title:String(x.title??fallback.title??"").trim(),phone:String(x.phone??fallback.phone??"").trim(),whatsapp:String(x.whatsapp??fallback.whatsapp??"").trim(),status:String(x.status||fallback.status||"未开始"),touchCount:Number(x.touchCount??fallback.touchCount??0)||0,noReplyCount:Number(x.noReplyCount??fallback.noReplyCount??0)||0,lastContact:String(x.lastContact||fallback.lastContact||""),nextFollowUp:String(x.nextFollowUp||fallback.nextFollowUp||""),isPrimary:Boolean(x.isPrimary??fallback.isPrimary??false),invalid:Boolean(x.invalid??fallback.invalid??false),replied:Boolean(x.replied??fallback.replied??false)};
}
function mergeContactRecord(a,b){
  const x=normalizeContactRecord(a), y=normalizeContactRecord(b), out={...x};
  ["name","title","phone","whatsapp","lastContact","nextFollowUp"].forEach(k=>{if(!out[k]&&y[k])out[k]=y[k]});
  out.touchCount=Math.max(x.touchCount||0,y.touchCount||0); out.noReplyCount=Math.max(x.noReplyCount||0,y.noReplyCount||0); out.invalid=x.invalid||y.invalid; out.replied=x.replied||y.replied; out.isPrimary=x.isPrimary||y.isPrimary; out.status=(CONTACT_STATUS_RANK[y.status]||0)>(CONTACT_STATUS_RANK[x.status]||0)?y.status:x.status; if(out.replied)out.status="已回复"; else if(out.invalid)out.status="无效"; return out;
}
function getClientContacts(c,{includeNotes=false}={}){
  const map=new Map(),order=[]; const add=(item,fallback={})=>{const r=normalizeContactRecord(item,fallback);if(!r.email)return;const k=r.email.toLowerCase();if(!map.has(k)){map.set(k,r);order.push(k)}else map.set(k,mergeContactRecord(map.get(k),r));};
  (Array.isArray(c?.contacts)?c.contacts:[]).forEach(x=>add(x));
  rawClientEmails(c,{includeNotes}).forEach((email,i)=>add({email},{name:i===0?String(c?.contact||"").trim():"",title:i===0?String(c?.title||"").trim():"",phone:i===0?String(c?.phone||"").trim():"",whatsapp:i===0?String(c?.whatsapp||"").trim():""}));
  return order.map(k=>map.get(k));
}
function getClientEmails(c,{includeNotes=false}={}){ const contacts=getClientContacts(c,{includeNotes}); return contacts.length?contacts.map(x=>x.email):rawClientEmails(c,{includeNotes}); }
function normalizeClientEmails(c,{includeNotes=false}={}){ const contacts=getClientContacts(c,{includeNotes}); const emails=contacts.map(x=>x.email); c.contacts=contacts;c.emails=emails;c.email=emails[0]||""; if(!c.currentContactEmail||!emails.some(e=>e.toLowerCase()===String(c.currentContactEmail).toLowerCase())){const preferred=contacts.find(x=>x.isPrimary||x.replied)||contacts.find(x=>!x.invalid)||contacts[0];c.currentContactEmail=preferred?.email||"";} return c; }
function sameEmailList(a,b){ const x=getClientEmails(a,{includeNotes:true}).map(e=>e.toLowerCase()).sort(); const y=getClientEmails(b,{includeNotes:true}).map(e=>e.toLowerCase()).sort(); return JSON.stringify(x)===JSON.stringify(y); }
function currentContactInfo(c){
  const contacts=getClientContacts(c,{includeNotes:true}); if(!contacts.length)return{contacts:[],current:null,index:-1,next:null,pending:false,reason:"",allDone:false,limit:Math.max(1,Number(state.settings.contactNoReplyLimit||3))};
  let idx=contacts.findIndex(x=>x.email.toLowerCase()===String(c?.currentContactEmail||"").toLowerCase()); if(idx<0)idx=contacts.findIndex(x=>x.isPrimary||x.replied); if(idx<0)idx=0; const current=contacts[idx],limit=Math.max(1,Number(state.settings.contactNoReplyLimit||3));
  const candidates=contacts.map((x,i)=>({x,i})).filter(({x,i})=>i!==idx&&!x.invalid&&!x.replied&&(x.noReplyCount||0)<limit); const next=(candidates.find(z=>z.i>idx)||candidates[0]||{}).x||null; const pending=!current.replied&&(current.invalid||(current.noReplyCount||0)>=limit); const allDone=pending&&!next; const reason=current.invalid?"邮箱无效/退信":((current.noReplyCount||0)>=limit?`连续 ${limit} 次未回复`:""); return{contacts,current,index:idx,next,pending,reason,allDone,limit};
}
function contactLabel(x){return x?(x.name?`${x.name} · ${x.email}`:x.email):"—";}
function buildContactsFromEditedClient(obj,existing={}){
  const emails=extractEmails(obj.email),oldMap=new Map(getClientContacts(existing,{includeNotes:true}).map(x=>[x.email.toLowerCase(),x])),activeKey=String(existing.currentContactEmail||"").toLowerCase();
  const contacts=emails.map((email,i)=>{const old=oldMap.get(email.toLowerCase())||{},r=normalizeContactRecord(old,{email});if((activeKey&&email.toLowerCase()===activeKey)||(!activeKey&&i===0)){if(obj.contact)r.name=String(obj.contact).trim();if(obj.title)r.title=String(obj.title).trim();if(obj.phone)r.phone=String(obj.phone).trim();if(obj.whatsapp)r.whatsapp=String(obj.whatsapp).trim();}return r;});
  obj.contacts=contacts;obj.emails=emails;obj.email=emails[0]||"";obj.currentContactEmail=(existing.currentContactEmail&&emails.some(e=>e.toLowerCase()===activeKey))?existing.currentContactEmail:(contacts.find(x=>x.isPrimary||x.replied)||contacts.find(x=>!x.invalid)||contacts[0])?.email||"";obj.contactRotationStatus=existing.contactRotationStatus||(contacts.length?"active":"");return obj;
}
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
  const domains=[normalizeDomain(c?.website||""),...getClientEmails(c,{includeNotes:true}).map(normalizeDomain)].filter(Boolean);
  for(const domain of domains){ for(const [re,cc] of CCTLD_COUNTRY){ if(re.test(domain)) return cc; } }
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
  const emails=getClientEmails(c,{includeNotes:true}).map(normalizeEmailKey).filter(Boolean);
  return {
    company:normalizeCompanyKey(c?.company), emails, email:emails[0]||"", domain:normalizeDomain(c?.website),
    phone:normalizePhoneKey(c?.phone||c?.whatsapp), country:inferCountryCodeFromClient(c)
  };
}
function sameClient(a,b){
  const x=clientIdentifiers(a), y=clientIdentifiers(b);
  if(x.emails.length&&y.emails.length&&x.emails.some(e=>y.emails.includes(e))) return true;
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
  const out={...base},src={...incoming};normalizeClientEmails(out,{includeNotes:true});normalizeClientEmails(src,{includeNotes:true});canonicalizeClientCountry(src);
  const contactMap=new Map();[...getClientContacts(out,{includeNotes:true}),...getClientContacts(src,{includeNotes:true})].forEach(c=>{const k=c.email.toLowerCase();contactMap.set(k,contactMap.has(k)?mergeContactRecord(contactMap.get(k),c):normalizeContactRecord(c));});out.contacts=[...contactMap.values()];
  const baseEmails=getClientEmails(out,{includeNotes:true}),incomingEmails=getClientEmails(src,{includeNotes:true});const allEmails=extractEmails(baseEmails,incomingEmails);out.emails=allEmails;out.email=allEmails[0]||"";const activeCandidate=String(out.currentContactEmail||src.currentContactEmail||"");out.currentContactEmail=allEmails.find(e=>e.toLowerCase()===activeCandidate.toLowerCase())||(out.contacts.find(x=>x.isPrimary||x.replied)||out.contacts.find(x=>!x.invalid)||out.contacts[0])?.email||"";out.contactRotationStatus=out.contactRotationStatus||src.contactRotationStatus||(allEmails.length?"active":"");
  const fill=["country","city","website","ownerSalesperson","ownerCompany","ownerEmail","contact","title","phone","whatsapp","linkedin","facebook","telegram","lastContact","nextFollowUp"];
  fill.forEach(k=>{ if(!String(out[k]||"").trim()&&String(src[k]||"").trim()) out[k]=src[k]; });
  if((GRADE_RANK[src.grade]||0)>(GRADE_RANK[out.grade]||0)) out.grade=src.grade;
  if((STATUS_RANK[src.status]??0)>(STATUS_RANK[out.status]??0)) out.status=src.status;
  let notes=out.notes||"";
  const extras=[];
  [["联系人","contact"],["职位","title"],["电话","phone"],["WhatsApp","whatsapp"]].forEach(([label,k])=>{
    const a=String(out[k]||"").trim(), b=String(src[k]||"").trim(); if(a&&b&&normalizeLooseText(a)!==normalizeLooseText(b)) extras.push(`${label}: ${b}`);
  });
  if(String(src.notes||"").trim()&&String(src.notes||"").trim()!==String(notes||"").trim()) notes=appendUniqueNote(notes,String(src.notes).trim());
  if(extras.length) notes=appendUniqueNote(notes,`${fromExcel?"Excel补充资料":"合并补充资料"}：${extras.join("；")}`);
  out.notes=notes; normalizeClientEmails(out,{includeNotes:true});
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
  const obj={grade:"C",status:"新客户"}, emailValues=[];
  headers.forEach((h,i)=>{
    const field=fieldForHeader(h);
    if(field && row[i]!==undefined && row[i]!==null){
      if(field==="email") emailValues.push(row[i]); else obj[field]=String(row[i]).trim();
    }
  });
  const emails=extractEmails(emailValues);obj.emails=emails;obj.email=emails[0]||"";obj.contacts=emails.map(email=>normalizeContactRecord({email,name:obj.contact||"",title:obj.title||"",phone:obj.phone||"",whatsapp:obj.whatsapp||""}));obj.currentContactEmail=emails[0]||"";obj.contactRotationStatus=emails.length?"active":"";
  obj.company=String(obj.company||"").trim(); obj.grade=normalizeGrade(obj.grade); obj.status=normalizeStatus(obj.status);
  obj.lastContact=normalizeDateValue(obj.lastContact); obj.nextFollowUp=normalizeDateValue(obj.nextFollowUp);
  canonicalizeClientCountry(obj);
  return obj;
}
function clientDupKey(c){
  const x=clientIdentifiers(c); return x.emails[0]?`e:${x.emails[0]}`:x.domain?`w:${x.domain}`:x.company?`c:${x.company}`:"";
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
    const recognized=headers.map(fieldForHeader).filter(Boolean);
    if(!recognized.includes("company")) throw new Error("没有识别到“客户名称/公司名称/Company”列。请把公司名称放在第一行表头中。");
    const rows=matrix.slice(1).map(r=>rowToClient(headers,r)).filter(c=>Object.values(c).some(v=>String(v||"").trim()));
    const valid=rows.filter(c=>c.company);
    const invalid=rows.length-valid.length;
    excelImportRows=valid;
    if(!valid.length) throw new Error("没有读取到有效客户行。每一行至少需要公司名称。");
    const mapped=[...new Set(recognized)].map(f=>({company:"公司",country:"国家",city:"城市",website:"官网",ownerSalesperson:"跟进业务员",ownerCompany:"我方公司",ownerEmail:"跟进邮箱",grade:"等级",status:"状态",contact:"联系人",title:"职位",email:"Email",phone:"电话",whatsapp:"WhatsApp",linkedin:"LinkedIn",facebook:"Facebook",telegram:"Telegram",lastContact:"最后联系",nextFollowUp:"下次跟进",notes:"备注"}[f]||f));
    showExcelStatus(`已读取 ${file.name}：有效客户 ${valid.length} 行${invalid?`，另有 ${invalid} 行缺少公司名称将跳过`:""}。识别列：${mapped.join("、")}。`);
    $("excelImportBtn").disabled=false;
    $("excelPreview").innerHTML=`<div class="table-wrap"><table><thead><tr><th>客户</th><th>国家</th><th>跟进归属</th><th>联系人</th><th>Email</th><th>WhatsApp</th><th>状态</th></tr></thead><tbody>${valid.slice(0,8).map(c=>`<tr><td><b>${esc(c.company)}</b></td><td>${esc(c.country||"")}</td><td>${esc([c.ownerSalesperson,c.ownerCompany,c.ownerEmail].filter(Boolean).join(" · ")||"")}</td><td>${esc(c.contact||"")}</td><td>${esc(getClientEmails(c,{includeNotes:true}).join("; "))}</td><td>${esc(c.whatsapp||"")}</td><td>${esc(c.status||"")}</td></tr>`).join("")}</tbody></table></div>${valid.length>8?`<div class="item-meta" style="margin-top:6px">仅预览前 8 行，共 ${valid.length} 行。</div>`:""}`;
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


// ============================================================
// 10.1 Excel / CSV 报价批量导入
// ============================================================
const quoteAliases={
  company:["公司名称","客户名称","公司","客户","company","customer","client","buyer"],
  email:["客户邮箱","邮箱","email","e-mail","mail"],
  partNo:["型号","料号","型号规格","part no","part number","partno","p/n","pn","mpn","model","item"],
  brand:["品牌","brand","manufacturer","mfr","maker"],
  qty:["数量","需求数量","qty","quantity","q'ty"],
  targetPrice:["目标价","target price","target","tp","targetprice"],
  quotePrice:["报价","单价","价格","price","unit price","quoted price","usd","报价单价"],
  currency:["币种","currency","curr"],
  dc:["dc","date code","datecode","批次"],
  leadTime:["交期","货期","lead time","leadtime","lt"],
  status:["状态","status"],
  quoteDate:["报价日期","日期","date","quote date","quotation date"],
  notes:["备注","说明","notes","note","remark","remarks"]
};
const quoteAliasLookup=(()=>{const m=new Map();Object.entries(quoteAliases).forEach(([f,a])=>a.forEach(x=>m.set(normalizeHeader(x),f)));return m;})();
function quoteFieldForHeader(h){return quoteAliasLookup.get(normalizeHeader(h))||null}
function detectQuoteHeaderRow(matrix){
  let best={idx:0,score:-1,fields:[]};
  for(let i=0;i<Math.min(matrix.length,15);i++){
    const fields=(matrix[i]||[]).map(quoteFieldForHeader).filter(Boolean);
    const score=fields.length+(fields.includes("partNo")?4:0)+(fields.includes("qty")?1:0)+(fields.includes("quotePrice")?1:0);
    if(score>best.score)best={idx:i,score,fields};
  }
  return best;
}
function rowToQuoteItem(headers,row){
  const o={currency:state.settings.currency||"USD",status:"已报价"};
  headers.forEach((h,i)=>{const f=quoteFieldForHeader(h);if(f&&row[i]!==undefined&&row[i]!==null&&String(row[i]).trim()!=="")o[f]=String(row[i]).trim()});
  o.partNo=String(o.partNo||"").trim();o.brand=String(o.brand||"").trim();o.qty=String(o.qty||"").trim();o.quoteDate=normalizeDateValue(o.quoteDate);
  if(!o.quotePrice)o.status=o.status==="已报价"?"待报价":o.status;
  return o;
}
function resetQuoteImport(){
  quoteImportRows=[];quoteImportFileName="";
  $("quoteImportBtn").disabled=true;$("quoteImportPreview").innerHTML="";$("quoteImportSummary").innerHTML="";
  $("quoteImportStatus").textContent="尚未选择文件。";$("quoteFileInput").value="";
  const sel=$("quoteImportDefaultClient");
  sel.innerHTML='<option value="">请选择客户</option>'+state.clients.slice().sort((a,b)=>(a.company||"").localeCompare(b.company||"")).map(c=>`<option value="${c.id}">${esc(c.company)} · ${esc(c.country||"")}</option>`).join("");
  $("quoteImportDate").value=todayISO();
}
$("openQuoteImportBtn")?.addEventListener("click",()=>{resetQuoteImport();$("quoteImportModal").classList.add("show")});
const quoteDrop=$("quoteDropZone");
quoteDrop?.addEventListener("click",()=>$("quoteFileInput").click());
["dragenter","dragover"].forEach(evt=>quoteDrop?.addEventListener(evt,e=>{e.preventDefault();e.stopPropagation();quoteDrop.classList.add("dragover")}));
["dragleave","drop"].forEach(evt=>quoteDrop?.addEventListener(evt,e=>{e.preventDefault();e.stopPropagation();quoteDrop.classList.remove("dragover")}));
quoteDrop?.addEventListener("drop",e=>{const f=e.dataTransfer?.files?.[0];if(f)readQuoteExcelFile(f)});
$("quoteFileInput")?.addEventListener("change",e=>{const f=e.target.files?.[0];if(f)readQuoteExcelFile(f)});
async function readQuoteExcelFile(file){
  const name=(file.name||"").toLowerCase();if(!/\.(xlsx|xls|csv)$/.test(name)){ $("quoteImportStatus").textContent="不支持这个格式，请选择 .xlsx / .xls / .csv。";return}
  quoteImportFileName=file.name||"报价表";$("quoteImportStatus").textContent="正在读取报价表……";
  try{
    let matrix=[];
    if(name.endsWith(".csv")){
      const text=await file.text();
      if(window.XLSX){const wb=XLSX.read(text,{type:"string"});matrix=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:"",raw:false,blankrows:false})}
      else matrix=text.split(/\r?\n/).filter(Boolean).map(line=>line.split(","));
    }else{
      if(!window.XLSX)throw new Error("Excel解析组件没有加载。请刷新页面后重试。");
      const data=await file.arrayBuffer(),wb=XLSX.read(data,{type:"array",cellDates:true}),ws=wb.Sheets[wb.SheetNames[0]];
      matrix=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:false,blankrows:false});
    }
    if(!matrix.length)throw new Error("报价表为空。");
    const detected=detectQuoteHeaderRow(matrix),headers=(matrix[detected.idx]||[]).map(x=>String(x||"").trim());
    const fields=headers.map(quoteFieldForHeader).filter(Boolean);
    if(!fields.includes("partNo"))throw new Error("没有识别到“型号/料号/Part No/MPN”列。");
    const rows=matrix.slice(detected.idx+1).map(r=>rowToQuoteItem(headers,r)).filter(x=>x.partNo||x.notes);
    if(!rows.length)throw new Error("没有读取到有效报价行。");
    quoteImportRows=rows;
    const withPrice=rows.filter(x=>x.quotePrice).length,clients=new Set(rows.map(x=>x.company).filter(Boolean));
    $("quoteImportStatus").textContent=`已读取 ${file.name}：识别表头在第 ${detected.idx+1} 行，共 ${rows.length} 个型号。`;
    $("quoteImportSummary").innerHTML=`<div><b>${rows.length}</b><br><span class="item-meta">型号行数</span></div><div><b>${withPrice}</b><br><span class="item-meta">已有报价</span></div><div><b>${clients.size||"—"}</b><br><span class="item-meta">表内客户数</span></div><div><b>${fields.length}</b><br><span class="item-meta">识别字段</span></div>`;
    $("quoteImportPreview").innerHTML=`<div class="table-wrap"><table><thead><tr><th>型号</th><th>品牌</th><th>数量</th><th>目标价</th><th>报价</th><th>DC</th><th>交期</th></tr></thead><tbody>${rows.slice(0,10).map(x=>`<tr><td><b>${esc(x.partNo)}</b></td><td>${esc(x.brand||"")}</td><td>${esc(x.qty||"")}</td><td>${esc(x.targetPrice||"")}</td><td>${esc(x.quotePrice||"")}</td><td>${esc(x.dc||"")}</td><td>${esc(x.leadTime||"")}</td></tr>`).join("")}</tbody></table></div>${rows.length>10?`<div class="item-meta" style="margin-top:6px">仅预览前 10 行，共 ${rows.length} 行。</div>`:""}`;
    $("quoteImportBtn").disabled=false;
  }catch(err){quoteImportRows=[];$("quoteImportBtn").disabled=true;$("quoteImportPreview").innerHTML="";$("quoteImportStatus").textContent="读取失败："+err.message}
}
function resolveQuoteClient(row,defaultId){
  if(row.email){
    const e=extractEmails(row.email)[0]?.toLowerCase();
    if(e){const hit=state.clients.find(c=>getClientEmails(c,{includeNotes:true}).some(x=>x.toLowerCase()===e));if(hit)return hit}
  }
  if(row.company){
    const key=normalizeCompanyKey(row.company),hit=state.clients.find(c=>normalizeCompanyKey(c.company)===key);if(hit)return hit;
  }
  return state.clients.find(c=>c.id===defaultId)||null;
}
function packQuoteItems(items,maxItems=500,maxBytes=700000){
  const chunks=[];let cur=[];
  for(const item of items){
    const trial=[...cur,item],size=new Blob([JSON.stringify(trial)]).size;
    if(cur.length&&(trial.length>maxItems||size>maxBytes)){chunks.push(cur);cur=[item]}else cur=trial;
  }
  if(cur.length)chunks.push(cur);return chunks;
}
$("quoteImportBtn")?.addEventListener("click",async()=>{
  if(!quoteImportRows.length)return;
  const defaultId=$("quoteImportDefaultClient").value,defaultDate=$("quoteImportDate").value||todayISO();
  const groups=new Map();let skipped=0;
  quoteImportRows.forEach(row=>{const c=resolveQuoteClient(row,defaultId);if(!c){skipped++;return}if(!groups.has(c.id))groups.set(c.id,[]);groups.get(c.id).push(row)});
  if(!groups.size)return alert("没有匹配到客户。请选择“默认客户”，或在报价表中加入客户名称/邮箱。");
  const total=[...groups.values()].reduce((n,a)=>n+a.length,0);
  if(!confirm(`准备导入 ${total} 个型号，匹配 ${groups.size} 家客户${skipped?`，另有 ${skipped} 行因找不到客户将跳过`:""}。继续吗？`))return;
  sync("busy","正在导入批量报价…");$("quoteImportBtn").disabled=true;
  try{
    let docs=0;
    for(const [clientId,items] of groups){
      const chunks=packQuoteItems(items);
      for(let i=0;i<chunks.length;i++){
        const part=chunks[i],priced=part.filter(x=>x.quotePrice).length,currencies=[...new Set(part.map(x=>x.currency).filter(Boolean))];
        const brands=[...new Set(part.map(x=>x.brand).filter(Boolean))];
        const quoteDate=part.map(x=>x.quoteDate).filter(Boolean).sort()[0]||defaultDate;
        await addDoc(refCollection("quotes"),{
          clientId,batchImport:true,batchName:`${quoteImportFileName}${chunks.length>1?` · 第${i+1}/${chunks.length}部分`:""}`,
          sourceFile:quoteImportFileName,itemCount:part.length,items:part,
          partNo:`${part[0]?.partNo||"批量报价"} 等 ${part.length} 项`,
          brand:brands.length===1?brands[0]:"多品牌",qty:`${part.length}项`,
          quotePrice:priced?`${priced}/${part.length}项已报价`:"待报价",priceSummary:priced?`${priced}/${part.length} 项已有价格`:"待报价",
          currency:currencies.length===1?currencies[0]:(state.settings.currency||"USD"),
          status:priced===part.length?"已报价":priced?"报价中":"待报价",quoteDate,nextFollowUp:addDays(quoteDate,state.settings.quoteFollowDays||5),
          notes:`Excel批量导入：${quoteImportFileName}`,createdAt:serverTimestamp(),updatedAt:serverTimestamp()
        });docs++;
      }
    }
    sync("ok","已自动同步");alert(`报价导入完成：${total} 个型号，保存为 ${docs} 份批量报价记录${skipped?`；跳过 ${skipped} 行`:""}。`);closeModal("quoteImportModal");
  }catch(err){console.error(err);sync("err","导入失败");$("quoteImportBtn").disabled=false;alert("报价导入失败："+err.message)}
});
window.openQuoteBatch=id=>{
  const q=state.quotes.find(x=>x.id===id);if(!q||!Array.isArray(q.items))return;
  $("quoteBatchTitle").textContent=q.batchName||"批量报价明细";$("quoteBatchSub").textContent=`${clientName(q.clientId)} · ${fmtDate(q.quoteDate)} · ${q.items.length} 项`;
  $("quoteBatchBody").innerHTML=`<div class="table-wrap"><table><thead><tr><th>#</th><th>型号</th><th>品牌</th><th>数量</th><th>Target Price</th><th>报价</th><th>币种</th><th>DC</th><th>交期</th><th>备注</th></tr></thead><tbody>${q.items.map((x,i)=>`<tr><td>${i+1}</td><td><b>${esc(x.partNo||"")}</b></td><td>${esc(x.brand||"")}</td><td>${esc(x.qty||"")}</td><td>${esc(x.targetPrice||"")}</td><td>${esc(x.quotePrice||"")}</td><td>${esc(x.currency||"")}</td><td>${esc(x.dc||"")}</td><td>${esc(x.leadTime||"")}</td><td>${esc(x.notes||"")}</td></tr>`).join("")}</tbody></table></div>`;
  $("quoteBatchModal").classList.add("show");
};


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
    x.emails.forEach(e=>keys.push(`e:${e}`)); if(x.domain) keys.push(`w:${x.domain}`); if(x.company) keys.push(`c:${x.company}`);
    for(const key of keys){
      const ids=buckets.get(key)||[];
      for(const id of ids){ const other=byId.get(id); if(other&&sameClient(c,other)) union(c.id,id); }
      ids.push(c.id); buckets.set(key,ids);
    }
  }
  const groups=new Map(); state.clients.forEach(c=>{const r=find(c.id);(groups.get(r)||groups.set(r,[]).get(r)).push(c)});
  const dups=[...groups.values()].filter(g=>g.length>1);
  const inferable=state.clients.filter(c=>!resolveCountryCode(c.country)&&inferCountryCodeFromClient(c)).length;
  const emailRepairable=state.clients.filter(c=>{
    const stored=extractEmails(c?.emails||[],c?.email||"").map(e=>e.toLowerCase()).sort();
    const repaired=getClientEmails(c,{includeNotes:true}).map(e=>e.toLowerCase()).sort();
    return JSON.stringify(stored)!==JSON.stringify(repaired);
  }).length;
  if(!dups.length&&!inferable&&!emailRepairable){alert("没有发现需要合并的重复客户，也没有需要修复的多邮箱或可自动补全的国家。");return}
  if(!confirm(`检测到 ${dups.reduce((n,g)=>n+g.length-1,0)} 条重复客户需要合并；约 ${emailRepairable} 家客户可修复/补全多邮箱；另有约 ${inferable} 条客户可自动补全国家。\n\n系统会保留资料更完整的一条，并把同一公司的所有邮箱合并保留。报价、PI、沟通、任务、附件也会关联到保留客户。确认继续吗？`))return;
  sync("busy","正在清理客户数据…");
  try{
    const relationSets=[state.communications,state.quotes,state.orders,state.samples,state.tasks,state.files];
    const ops=[]; const duplicateIds=new Set(); let repairedEmails=0;
    const completeness=c=>["country","city","website","contact","title","phone","whatsapp","linkedin","facebook","telegram","notes","nextFollowUp","lastContact"].reduce((n,k)=>n+(String(c[k]||"").trim()?1:0),0)+getClientEmails(c,{includeNotes:true}).length+relationSets.reduce((n,arr)=>n+arr.filter(x=>x.clientId===c.id).length*2,0);
    for(const group of dups){
      const sorted=[...group].sort((a,b)=>completeness(b)-completeness(a)); const keeper=sorted[0]; let merged={...keeper};
      for(const d of sorted.slice(1)){ merged=mergeClientData(merged,d); duplicateIds.add(d.id); }
      canonicalizeClientCountry(merged);
      ops.push({kind:"update",ref:doc(db,"users",currentUser.uid,"clients",keeper.id),data:{...merged,updatedAt:serverTimestamp()}});
      for(const d of sorted.slice(1)){
        for(const arr of relationSets){ for(const item of arr.filter(x=>x.clientId===d.id)){ const coll=pathFor(arr===state.communications?"communication":arr===state.quotes?"quote":arr===state.orders?"order":arr===state.samples?"sample":arr===state.tasks?"task":"file"); ops.push({kind:"update",ref:doc(db,"users",currentUser.uid,coll,item.id),data:{clientId:keeper.id,updatedAt:serverTimestamp()}}); } }
        ops.push({kind:"delete",ref:doc(db,"users",currentUser.uid,"clients",d.id)});
      }
    }
    for(const c of state.clients){
      if(duplicateIds.has(c.id)) continue;
      const patch={};
      const emails=getClientEmails(c,{includeNotes:true});
      const stored=extractEmails(c?.emails||[],c?.email||"");
      if(JSON.stringify(emails.map(e=>e.toLowerCase()).sort())!==JSON.stringify(stored.map(e=>e.toLowerCase()).sort())){ patch.emails=emails; patch.email=emails[0]||""; repairedEmails++; }
      const code=inferCountryCodeFromClient(c); if(code&&resolveCountryCode(c.country)!==code) patch.country=countryDisplayName(code);
      if(Object.keys(patch).length) ops.push({kind:"update",ref:doc(db,"users",currentUser.uid,"clients",c.id),data:{...patch,updatedAt:serverTimestamp()}});
    }
    for(let i=0;i<ops.length;i+=300){ const batch=writeBatch(db); ops.slice(i,i+300).forEach(op=>op.kind==="update"?batch.update(op.ref,op.data):batch.delete(op.ref)); await batch.commit(); }
    await autoTrackCountriesFromNames(state.clients.map(c=>countryDisplayName(inferCountryCodeFromClient(c))).filter(Boolean));
    sync("ok","已自动同步"); alert(`清理完成：合并删除 ${duplicateIds.size} 条重复客户；修复/补全 ${repairedEmails} 家客户的多邮箱；并自动补全可识别国家。`);
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
  state.rfqs.forEach(x=>items.push({type:"rfq",id:x.id,title:x.rfqNo||"RFQ",meta:`RFQ · ${clientName(x.clientId)} · ${x.status||""}`,text:[x.parts,x.customerNeed,x.notes,x.sourceFile,clientName(x.clientId)].join(" ")}));
  state.samples.forEach(x=>items.push({type:"sample",id:x.id,title:x.partNo||"样品",meta:`样品 · ${clientName(x.clientId)} · ${x.status||""}`,text:[x.tracking,x.internationalTracking,x.forwarderName,x.feedback,x.notes,clientName(x.clientId)].join(" ")}));
  state.quotes.forEach(x=>{const detail=Array.isArray(x.items)?x.items.map(i=>[i.partNo,i.brand,i.qty,i.quotePrice,i.targetPrice,i.notes].filter(Boolean).join(" ")).join(" "):"";items.push({type:"quote",id:x.id,title:x.batchName||x.partNo||"报价",meta:`报价 · ${clientName(x.clientId)}`,text:Object.values(x).filter(v=>typeof v!=="object").join(" ")+" "+detail+" "+clientName(x.clientId)})});
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
    $("migrationPreview").innerHTML=`<div class="notice">检测到：客户 ${obj.clients?.length||0}、沟通 ${obj.communications?.length||0}、RFQ ${obj.rfqs?.length||0}、报价 ${obj.quotes?.length||0}、PI/订单 ${obj.orders?.length||0}、样品 ${obj.samples?.length||0}、任务 ${obj.tasks?.length||0}、节假日 ${obj.holidays?.length||0}。</div>`;
    $("migrationBtn").disabled=false;
  }catch(err){
    migrationPayload=null;$("migrationBtn").disabled=true;alert("读取失败："+err.message);
  }
});
$("migrationBtn").addEventListener("click",async()=>{
  if(!migrationPayload)return;
  if(!confirm("将旧版数据导入到当前 Google 账号云端。确认继续吗？"))return;
  sync("busy","正在迁移数据…");
  const mapping=[["clients","clients"],["communications","communications"],["rfqs","rfqs"],["quotes","quotes"],["orders","orders"],["samples","samples"],["tasks","tasks"],["holidays","holidays"]];
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
  if($("setRfqDays")) $("setRfqDays").value=state.settings.rfqFollowDays??2;
  $("setDormantDays").value=state.settings.dormantDays??30;
  if($("setContactNoReplyLimit")) $("setContactNoReplyLimit").value=state.settings.contactNoReplyLimit??3;
  if($("setContactFollowDays")) $("setContactFollowDays").value=state.settings.contactFollowDays??3;
  $("setWeekend").value=String(state.settings.weekendFollow??false);
  $("setCurrency").value=state.settings.currency||"USD";
  if($("setBackupReminderDays")) $("setBackupReminderDays").value=String(state.settings.backupReminderDays??7);
  if($("setSalesProfiles")) $("setSalesProfiles").value=state.settings.salesProfilesText||"";
  renderBackupStatus();
  renderExportLogs();
}
$("saveSettingsBtn").addEventListener("click",async()=>{
  const data={
    quoteFollowDays:Number($("setQuoteDays").value||5),rfqFollowDays:Number($("setRfqDays")?.value||2),dormantDays:Number($("setDormantDays").value||30),
    contactNoReplyLimit:Number($("setContactNoReplyLimit")?.value||3),contactFollowDays:Number($("setContactFollowDays")?.value||3),
    weekendFollow:$("setWeekend").value==="true",currency:$("setCurrency").value,
    backupReminderDays:Number($("setBackupReminderDays")?.value||7),salesProfilesText:String($("setSalesProfiles")?.value||"").trim()
  };
  await setDoc(doc(db,"users",currentUser.uid,"settings","main"),data,{merge:true});
  alert("设置已同步。");
});

// ============================================================
// 12.1 全量本地备份 + 周期提醒
// ============================================================
function backupPlain(value){
  if(value===null||value===undefined) return value;
  if(Array.isArray(value)) return value.map(backupPlain);
  if(typeof value==="object"){
    if(typeof value.toDate==="function"){
      try{return value.toDate().toISOString()}catch(_){return String(value)}
    }
    const out={};
    Object.entries(value).forEach(([k,v])=>out[k]=backupPlain(v));
    return out;
  }
  return value;
}
function backupFileName(){
  const d=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return `AI外贸工作台_全量备份_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.json`;
}
function buildBackupPayload(){
  return backupPlain({
    backupFormat:"AI-Trade-Workspace-Full-Backup",
    version:"V3.2.2",
    exportedAt:new Date().toISOString(),
    account:{email:currentUser?.email||"",uid:currentUser?.uid||""},
    clients:state.clients,
    communications:state.communications,
    rfqs:state.rfqs,
    quotes:state.quotes,
    orders:state.orders,
    tasks:state.tasks,
    holidays:state.holidays,
    holidayCountries:state.holidayCountries,
    files:state.files,
    samples:state.samples,
    exportLogs:state.exportLogs,
    settings:state.settings
  });
}

function exportCountSummary(){
  const quoteItems=state.quotes.reduce((n,q)=>n+(Array.isArray(q.items)?q.items.length:1),0);
  return `客户${state.clients.length} · 沟通${state.communications.length} · RFQ${state.rfqs.length} · 报价型号${quoteItems} · PI/订单${state.orders.length} · 样品${state.samples.length} · 任务${state.tasks.length}`;
}
async function recordExportLog(type,fileName){
  try{
    await addDoc(refCollection("exportLogs"),{type,fileName,summary:exportCountSummary(),exportedAt:new Date().toISOString(),createdAt:serverTimestamp()});
  }catch(e){console.warn("export log",e)}
}
function renderExportLogs(){
  const el=$("exportLogList");if(!el)return;
  const rows=state.exportLogs.slice().sort((a,b)=>String(b.exportedAt||"").localeCompare(String(a.exportedAt||""))).slice(0,20);
  el.innerHTML=rows.length?rows.map(x=>{const d=new Date(x.exportedAt||"");const when=Number.isNaN(d.getTime())?(x.exportedAt||""):`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;return `<div class="export-log"><div><b>${esc(x.type||"导出")}</b><div class="item-meta">${esc(x.fileName||"")}</div></div><div style="text-align:right"><div>${esc(when)}</div><div class="item-meta">${esc(x.summary||"")}</div></div></div>`}).join(""):"暂无导出记录。";
}
function downloadBlob(blob,fileName){
  const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=fileName;a.style.display="none";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
}
function businessExcelFileName(){
  const d=new Date(),pad=n=>String(n).padStart(2,"0");
  return `AI外贸工作台_业务数据_${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.xlsx`;
}
function exportBusinessExcel(){
  if(!currentUser)return alert("请先登录。");
  if(!window.XLSX)return alert("Excel组件没有加载，请刷新页面后重试。");
  try{
    const wb=XLSX.utils.book_new();
    const clients=state.clients.map(c=>({客户:c.company||"",国家:c.country||"",城市:c.city||"",跟进业务员:c.ownerSalesperson||"",我方公司:c.ownerCompany||"",跟进邮箱:c.ownerEmail||"",等级:c.grade||"",状态:c.status||"",客户类型:c.customerType||"",行业:c.industry||"",开发来源:c.source||"",联系人:c.contact||"",邮箱:getClientEmails(c,{includeNotes:true}).join("; "),电话:c.phone||"",WhatsApp:c.whatsapp||"",官网:c.website||"",采购特点痛点:c.procurementPain||"",付款习惯:c.paymentHabit||"",物流习惯:c.logisticsHabit||"",价格敏感度:c.priceSensitivity||"",最后联系:c.lastContact||"",下次跟进:c.nextFollowUp||"",备注:c.notes||""}));
    const rfqs=state.rfqs.map(r=>({日期:r.requestDate||"",客户:clientName(r.clientId),RFQ:r.rfqNo||"",型号数:r.itemCount||0,主要型号:r.parts||"",状态:r.status||"",客户需求:r.customerNeed||"",原始文件:r.sourceFile||"",下次跟进:r.nextFollowUp||"",备注:r.notes||""}));
    const comms=state.communications.map(x=>({日期:x.date||"",客户:clientName(x.clientId),邮箱:x.contactEmail||"",渠道:x.channel||"",方向:x.direction||"",主题:x.subject||"",沟通内容:x.content||"",反馈类型:x.feedbackType||"",客户反馈:x.customerFeedback||"",下一步:x.nextAction||"",下次跟进:x.nextFollowUp||""}));
    const quotes=[];
    state.quotes.forEach(q=>{
      if(Array.isArray(q.items)&&q.items.length)q.items.forEach((i,idx)=>quotes.push({报价日期:q.quoteDate||"",客户:clientName(q.clientId),报价单:q.batchName||"",序号:idx+1,型号:i.partNo||"",品牌:i.brand||"",数量:i.qty||"",目标价:i.targetPrice||"",报价:i.quotePrice||"",币种:i.currency||q.currency||"",DC:i.dc||"",交期:i.leadTime||"",状态:i.status||q.status||"",备注:i.notes||""}));
      else quotes.push({报价日期:q.quoteDate||"",客户:clientName(q.clientId),报价单:"",序号:1,型号:q.partNo||"",品牌:q.brand||"",数量:q.qty||"",目标价:q.targetPrice||"",报价:q.quotePrice||"",币种:q.currency||"",DC:q.dc||"",交期:q.leadTime||"",状态:q.status||"",备注:q.notes||""});
    });
    const orders=state.orders.map(o=>({PI:o.piNo||"",客户:clientName(o.clientId),金额:o.amount||0,币种:o.currency||"",付款方式:o.paymentTerms||"",应付首款:o.depositDue||0,已付:o.paidAmount||0,待付余额:o.balanceDue||0,承诺付款:o.promisedPayDate||"",付款状态:o.paymentStatus||"",订单状态:o.orderStatus||"",PI日期:o.piDate||"",交期:o.deliveryDate||"",运输方式:o.shippingMode||"",货代:o.forwarder||"",交中国仓:o.chinaWarehouseDate||"",国际出运:o.internationalShipDate||"",物流:o.shipping||"",运单号:o.tracking||"",清关状态:o.customsStatus||"",预计到达:o.expectedArrival||"",实际签收:o.receivedDate||"",备注:o.notes||""}));
    const samples=state.samples.map(x=>({客户:clientName(x.clientId),样品型号:x.partNo||x.itemName||"",数量:x.qty||"",交付方式:x.deliveryMode||"",客户提出日期:x.requestDate||"",我司寄出日期:x.sentDate||"",国内物流:x.carrier||"",国内运单号:x.tracking||"",客户货代:x.forwarderName||"",货代收货日期:x.forwarderArrivalDate||"",预计集货出运日期:x.consolidationDueDate||"",国际出运日期:x.internationalShipDate||"",国际物流:x.internationalCarrier||"",国际运单号:x.internationalTracking||"",状态:x.status||"",预计客户收货:x.expectedArrival||"",预计反馈:x.feedbackDueDate||"",实际反馈日期:x.feedbackDate||"",反馈结论:x.feedbackResult||"",客户反馈:x.feedback||"",下一步:x.nextAction||"",下次跟进:x.nextFollowUp||"",备注:x.notes||""}));
    const tasks=state.tasks.map(t=>({任务:t.title||"",优先级:t.priority||"",到期日期:t.dueDate||"",客户:t.clientId?clientName(t.clientId):"",完成:t.done?"是":"否",备注:t.notes||""}));
    [["客户",clients],["沟通",comms],["RFQ询价",rfqs],["报价明细",quotes],["PI订单",orders],["样品跟进",samples],["任务",tasks]].forEach(([name,rows])=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),name));
    const fileName=businessExcelFileName();XLSX.writeFile(wb,fileName);
    recordExportLog("业务数据 Excel",fileName);
    alert("业务数据 Excel 已导出。浏览器通常会保存到“下载”文件夹；导出记录已写入设置页。");
  }catch(err){console.error(err);alert("导出 Excel 失败："+(err?.message||err))}
}

async function exportFullBackup(){
  if(!currentUser) return alert("请先登录后再备份。");
  try{
    const payload=buildBackupPayload();
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
    const fileName=backupFileName();
    downloadBlob(blob,fileName);
    const now=new Date().toISOString();
    await setDoc(doc(db,"users",currentUser.uid,"settings","main"),{lastBackupAt:now},{merge:true});
    state.settings.lastBackupAt=now;
    await recordExportLog("JSON全量备份",fileName);
    sessionStorage.setItem("backupBannerDismissed","");
    renderBackupStatus();
    alert("全量备份已生成。请把下载的 JSON 文件保存在电脑，并建议再复制一份到网盘。");
  }catch(err){
    console.error("backup failed",err);
    alert("备份失败："+(err?.message||err));
  }
}
function backupAgeDays(){
  const last=state.settings.lastBackupAt;
  if(!last) return Infinity;
  const t=new Date(last).getTime();
  if(!Number.isFinite(t)) return Infinity;
  return Math.floor((Date.now()-t)/86400000);
}
function renderBackupStatus(){
  const last=state.settings.lastBackupAt;
  if($("lastBackupText")){
    if(!last) $("lastBackupText").textContent="尚未做过本地全量备份";
    else{
      const d=new Date(last);
      $("lastBackupText").textContent=Number.isNaN(d.getTime())?"已备份":`${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
    }
  }
  const banner=$("backupReminderBanner"), text=$("backupReminderText");
  if(!banner||!text) return;
  const days=Number(state.settings.backupReminderDays||7);
  const age=backupAgeDays();
  const dismissed=sessionStorage.getItem("backupBannerDismissed")==="1";
  const due=age>=days;
  banner.style.display=due&&!dismissed?"flex":"none";
  if(age===Infinity) text.textContent=`当前账号还没有本地全量备份。建议现在备份，以后每 ${days} 天提醒一次。`;
  else text.textContent=`距离上次本地备份已经 ${age} 天，已达到 ${days} 天提醒周期。`;
}
function checkBackupReminder(){renderBackupStatus()}
$("exportFullBackupBtn")?.addEventListener("click",exportFullBackup);
$("exportBusinessExcelBtn")?.addEventListener("click",exportBusinessExcel);
$("backupNowBannerBtn")?.addEventListener("click",exportFullBackup);
$("dismissBackupBannerBtn")?.addEventListener("click",()=>{sessionStorage.setItem("backupBannerDismissed","1");renderBackupStatus()});

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
  return `当前云端有 ${state.clients.length} 家客户、${state.communications.length} 条沟通记录、${state.rfqs.length} 个 RFQ、${state.quotes.length} 份报价、${state.orders.length} 个 PI/订单。`;
}

// ============================================================
// 14. 帮助、弹窗、PWA
// ============================================================
const helpText={
  followups:"首页会综合 RFQ、报价、样品、PI付款状态、联系人轮换和客户下次跟进日期自动排序。",
  tasks:"任务中心用于管理每日开发、WhatsApp、Facebook 和客户跟进任务。",
  files:"V3 免费版不使用 Firebase Storage。把 PI、报价、Datasheet、图片等上传到 Google Drive / OneDrive / WPS 云盘，再把共享链接保存到客户档案，链接会在电脑和手机之间自动同步。",
};
document.querySelectorAll(".help").forEach(b=>b.addEventListener("click",()=>{$("helpBody").textContent=helpText[b.dataset.help]||"暂无说明。";$("helpModal").classList.add("show")}));
window.closeModal=id=>$(id).classList.remove("show");
document.querySelectorAll(".modal-bg").forEach(x=>x.addEventListener("click",e=>{if(e.target===x)x.classList.remove("show")}));
document.addEventListener("click",e=>{if(innerWidth<=820&&!e.target.closest(".sidebar")&&!e.target.closest("#menuBtn"))$("sidebar").classList.remove("open")});

// V3.2.4 老电脑兼容版：暂不注册 Service Worker，避免旧缓存影响登录与升级。
