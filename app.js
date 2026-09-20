var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, onSnapshot, query, where, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// ============================================================
// 1. Firebase 初始化
// ============================================================
var app = initializeApp(firebaseConfig);
var auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(function (e) { console.warn("auth persistence", e); });
var db = getFirestore(app);
var provider = new GoogleAuthProvider();
var currentUser = null;
var currentClientId = null;
var editing = { type: null, id: null };
var migrationPayload = null;
var excelImportRows = [];
var excelImportFileName = "";
var quoteImportRows = [];
var quoteImportFileName = "";
var clientPage = 1;
var quotePage = 1;
var PAGE_SIZE = 100;
var state = {
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
    settings: { quoteFollowDays: 5, rfqFollowDays: 2, dormantDays: 30, weekendFollow: false, currency: "USD", backupReminderDays: 7, lastBackupAt: "", contactNoReplyLimit: 3, contactFollowDays: 3, salesProfilesText: "" }
};
var unsubscribers = [];
// ============================================================
// 2. 工具函数
// ============================================================
var $ = function (id) { return document.getElementById(id); };
var esc = function (v) {
    if (v === void 0) { v = ""; }
    return String(v).replace(/[&<>"']/g, function (s) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]); });
};
var todayISO = function () {
    var d = new Date(), off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};
var parseDate = function (s) { return s ? new Date(s + "T00:00:00") : null; };
var fmtDate = function (s) {
    var d = parseDate(s);
    if (!d)
        return "—";
    return "".concat(d.getFullYear(), "/").concat(d.getMonth() + 1, "/").concat(d.getDate());
};
var addDays = function (s, n) {
    var d = parseDate(s);
    if (!d)
        return "";
    d.setDate(d.getDate() + Number(n || 0));
    var off = d.getTimezoneOffset();
    return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};
var daysBetween = function (a, b) {
    var x = parseDate(a), y = parseDate(b);
    if (!x || !y)
        return null;
    return Math.round((y - x) / 86400000);
};
var isWeekend = function () { return [0, 6].includes(new Date().getDay()); };
var badge = function (text, cls) {
    if (cls === void 0) { cls = ""; }
    return "<span class=\"badge ".concat(cls, "\">").concat(esc(text || "未设置"), "</span>");
};
var empty = function (text) { return "<div class=\"empty\">".concat(esc(text), "</div>"); };
var clientName = function (id) { var _a; return ((_a = state.clients.find(function (x) { return x.id === id; })) === null || _a === void 0 ? void 0 : _a.company) || "未关联客户"; };
function parseSalesProfileLine(line) {
    var p = String(line || "").split("|").map(function (x) { return x.trim(); });
    return { salesperson: p[0] || "", company: p[1] || "", email: p.slice(2).join("|").trim() || "" };
}
function salesProfiles() {
    return String(state.settings.salesProfilesText || "").split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean).map(parseSalesProfileLine).filter(function (x) { return x.salesperson || x.company || x.email; });
}
function clientAssignment(c) { return { salesperson: String((c === null || c === void 0 ? void 0 : c.ownerSalesperson) || "").trim(), company: String((c === null || c === void 0 ? void 0 : c.ownerCompany) || "").trim(), email: String((c === null || c === void 0 ? void 0 : c.ownerEmail) || "").trim() }; }
function assignmentLabel(c, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.email, email = _c === void 0 ? true : _c;
    var a = clientAssignment(c), p = [];
    if (a.salesperson)
        p.push(a.salesperson);
    if (a.company)
        p.push(a.company);
    if (email && a.email)
        p.push(a.email);
    return p.join(" · ") || "未分配";
}
function assignmentForClientId(id) { return clientAssignment(state.clients.find(function (x) { return x.id === id; }) || {}); }
var sync = function (status, text) {
    $("syncDot").className = "sync-dot " + status;
    $("syncText").textContent = text;
};
var pathFor = function (type) { return ({
    client: "clients", communication: "communications", quote: "quotes", order: "orders",
    task: "tasks", holiday: "holidays", file: "files", sample: "samples", rfq: "rfqs"
})[type]; };
var refCollection = function (name) { return collection(db, "users", currentUser.uid, name); };
// ============================================================
// 全球国家 / 节假日自动同步
// 数据源：Nager.Holidays Community API v4（无需 API Key）
// ============================================================
var COUNTRY_DATA = [{ "code": "AF", "name": "Afghanistan" }, { "code": "AL", "name": "Albania" }, { "code": "DZ", "name": "Algeria" }, { "code": "AS", "name": "American Samoa" }, { "code": "AD", "name": "Andorra" }, { "code": "AO", "name": "Angola" }, { "code": "AI", "name": "Anguilla" }, { "code": "AQ", "name": "Antarctica" }, { "code": "AG", "name": "Antigua and Barbuda" }, { "code": "AR", "name": "Argentina" }, { "code": "AM", "name": "Armenia" }, { "code": "AW", "name": "Aruba" }, { "code": "AU", "name": "Australia" }, { "code": "AT", "name": "Austria" }, { "code": "AZ", "name": "Azerbaijan" }, { "code": "BS", "name": "Bahamas" }, { "code": "BH", "name": "Bahrain" }, { "code": "BD", "name": "Bangladesh" }, { "code": "BB", "name": "Barbados" }, { "code": "BY", "name": "Belarus" }, { "code": "BE", "name": "Belgium" }, { "code": "BZ", "name": "Belize" }, { "code": "BJ", "name": "Benin" }, { "code": "BM", "name": "Bermuda" }, { "code": "BT", "name": "Bhutan" }, { "code": "BO", "name": "Bolivia, Plurinational State of" }, { "code": "BQ", "name": "Bonaire, Sint Eustatius and Saba" }, { "code": "BA", "name": "Bosnia and Herzegovina" }, { "code": "BW", "name": "Botswana" }, { "code": "BV", "name": "Bouvet Island" }, { "code": "BR", "name": "Brazil" }, { "code": "IO", "name": "British Indian Ocean Territory" }, { "code": "BN", "name": "Brunei Darussalam" }, { "code": "BG", "name": "Bulgaria" }, { "code": "BF", "name": "Burkina Faso" }, { "code": "BI", "name": "Burundi" }, { "code": "CV", "name": "Cabo Verde" }, { "code": "KH", "name": "Cambodia" }, { "code": "CM", "name": "Cameroon" }, { "code": "CA", "name": "Canada" }, { "code": "KY", "name": "Cayman Islands" }, { "code": "CF", "name": "Central African Republic" }, { "code": "TD", "name": "Chad" }, { "code": "CL", "name": "Chile" }, { "code": "CN", "name": "China" }, { "code": "CX", "name": "Christmas Island" }, { "code": "CC", "name": "Cocos (Keeling) Islands" }, { "code": "CO", "name": "Colombia" }, { "code": "KM", "name": "Comoros" }, { "code": "CG", "name": "Congo" }, { "code": "CD", "name": "Congo, The Democratic Republic of the" }, { "code": "CK", "name": "Cook Islands" }, { "code": "CR", "name": "Costa Rica" }, { "code": "HR", "name": "Croatia" }, { "code": "CU", "name": "Cuba" }, { "code": "CW", "name": "Curaçao" }, { "code": "CY", "name": "Cyprus" }, { "code": "CZ", "name": "Czechia" }, { "code": "CI", "name": "Côte d'Ivoire" }, { "code": "DK", "name": "Denmark" }, { "code": "DJ", "name": "Djibouti" }, { "code": "DM", "name": "Dominica" }, { "code": "DO", "name": "Dominican Republic" }, { "code": "EC", "name": "Ecuador" }, { "code": "EG", "name": "Egypt" }, { "code": "SV", "name": "El Salvador" }, { "code": "GQ", "name": "Equatorial Guinea" }, { "code": "ER", "name": "Eritrea" }, { "code": "EE", "name": "Estonia" }, { "code": "SZ", "name": "Eswatini" }, { "code": "ET", "name": "Ethiopia" }, { "code": "FK", "name": "Falkland Islands (Malvinas)" }, { "code": "FO", "name": "Faroe Islands" }, { "code": "FJ", "name": "Fiji" }, { "code": "FI", "name": "Finland" }, { "code": "FR", "name": "France" }, { "code": "GF", "name": "French Guiana" }, { "code": "PF", "name": "French Polynesia" }, { "code": "TF", "name": "French Southern Territories" }, { "code": "GA", "name": "Gabon" }, { "code": "GM", "name": "Gambia" }, { "code": "GE", "name": "Georgia" }, { "code": "DE", "name": "Germany" }, { "code": "GH", "name": "Ghana" }, { "code": "GI", "name": "Gibraltar" }, { "code": "GR", "name": "Greece" }, { "code": "GL", "name": "Greenland" }, { "code": "GD", "name": "Grenada" }, { "code": "GP", "name": "Guadeloupe" }, { "code": "GU", "name": "Guam" }, { "code": "GT", "name": "Guatemala" }, { "code": "GG", "name": "Guernsey" }, { "code": "GN", "name": "Guinea" }, { "code": "GW", "name": "Guinea-Bissau" }, { "code": "GY", "name": "Guyana" }, { "code": "HT", "name": "Haiti" }, { "code": "HM", "name": "Heard Island and McDonald Islands" }, { "code": "VA", "name": "Holy See (Vatican City State)" }, { "code": "HN", "name": "Honduras" }, { "code": "HK", "name": "Hong Kong" }, { "code": "HU", "name": "Hungary" }, { "code": "IS", "name": "Iceland" }, { "code": "IN", "name": "India" }, { "code": "ID", "name": "Indonesia" }, { "code": "IR", "name": "Iran, Islamic Republic of" }, { "code": "IQ", "name": "Iraq" }, { "code": "IE", "name": "Ireland" }, { "code": "IM", "name": "Isle of Man" }, { "code": "IL", "name": "Israel" }, { "code": "IT", "name": "Italy" }, { "code": "JM", "name": "Jamaica" }, { "code": "JP", "name": "Japan" }, { "code": "JE", "name": "Jersey" }, { "code": "JO", "name": "Jordan" }, { "code": "KZ", "name": "Kazakhstan" }, { "code": "KE", "name": "Kenya" }, { "code": "KI", "name": "Kiribati" }, { "code": "KP", "name": "Korea, Democratic People's Republic of" }, { "code": "KR", "name": "Korea, Republic of" }, { "code": "KW", "name": "Kuwait" }, { "code": "KG", "name": "Kyrgyzstan" }, { "code": "LA", "name": "Lao People's Democratic Republic" }, { "code": "LV", "name": "Latvia" }, { "code": "LB", "name": "Lebanon" }, { "code": "LS", "name": "Lesotho" }, { "code": "LR", "name": "Liberia" }, { "code": "LY", "name": "Libya" }, { "code": "LI", "name": "Liechtenstein" }, { "code": "LT", "name": "Lithuania" }, { "code": "LU", "name": "Luxembourg" }, { "code": "MO", "name": "Macao" }, { "code": "MG", "name": "Madagascar" }, { "code": "MW", "name": "Malawi" }, { "code": "MY", "name": "Malaysia" }, { "code": "MV", "name": "Maldives" }, { "code": "ML", "name": "Mali" }, { "code": "MT", "name": "Malta" }, { "code": "MH", "name": "Marshall Islands" }, { "code": "MQ", "name": "Martinique" }, { "code": "MR", "name": "Mauritania" }, { "code": "MU", "name": "Mauritius" }, { "code": "YT", "name": "Mayotte" }, { "code": "MX", "name": "Mexico" }, { "code": "FM", "name": "Micronesia, Federated States of" }, { "code": "MD", "name": "Moldova, Republic of" }, { "code": "MC", "name": "Monaco" }, { "code": "MN", "name": "Mongolia" }, { "code": "ME", "name": "Montenegro" }, { "code": "MS", "name": "Montserrat" }, { "code": "MA", "name": "Morocco" }, { "code": "MZ", "name": "Mozambique" }, { "code": "MM", "name": "Myanmar" }, { "code": "NA", "name": "Namibia" }, { "code": "NR", "name": "Nauru" }, { "code": "NP", "name": "Nepal" }, { "code": "NL", "name": "Netherlands" }, { "code": "NC", "name": "New Caledonia" }, { "code": "NZ", "name": "New Zealand" }, { "code": "NI", "name": "Nicaragua" }, { "code": "NE", "name": "Niger" }, { "code": "NG", "name": "Nigeria" }, { "code": "NU", "name": "Niue" }, { "code": "NF", "name": "Norfolk Island" }, { "code": "MK", "name": "North Macedonia" }, { "code": "MP", "name": "Northern Mariana Islands" }, { "code": "NO", "name": "Norway" }, { "code": "OM", "name": "Oman" }, { "code": "PK", "name": "Pakistan" }, { "code": "PW", "name": "Palau" }, { "code": "PS", "name": "Palestine, State of" }, { "code": "PA", "name": "Panama" }, { "code": "PG", "name": "Papua New Guinea" }, { "code": "PY", "name": "Paraguay" }, { "code": "PE", "name": "Peru" }, { "code": "PH", "name": "Philippines" }, { "code": "PN", "name": "Pitcairn" }, { "code": "PL", "name": "Poland" }, { "code": "PT", "name": "Portugal" }, { "code": "PR", "name": "Puerto Rico" }, { "code": "QA", "name": "Qatar" }, { "code": "RO", "name": "Romania" }, { "code": "RU", "name": "Russian Federation" }, { "code": "RW", "name": "Rwanda" }, { "code": "RE", "name": "Réunion" }, { "code": "BL", "name": "Saint Barthélemy" }, { "code": "SH", "name": "Saint Helena, Ascension and Tristan da Cunha" }, { "code": "KN", "name": "Saint Kitts and Nevis" }, { "code": "LC", "name": "Saint Lucia" }, { "code": "MF", "name": "Saint Martin (French part)" }, { "code": "PM", "name": "Saint Pierre and Miquelon" }, { "code": "VC", "name": "Saint Vincent and the Grenadines" }, { "code": "WS", "name": "Samoa" }, { "code": "SM", "name": "San Marino" }, { "code": "ST", "name": "Sao Tome and Principe" }, { "code": "SA", "name": "Saudi Arabia" }, { "code": "SN", "name": "Senegal" }, { "code": "RS", "name": "Serbia" }, { "code": "SC", "name": "Seychelles" }, { "code": "SL", "name": "Sierra Leone" }, { "code": "SG", "name": "Singapore" }, { "code": "SX", "name": "Sint Maarten (Dutch part)" }, { "code": "SK", "name": "Slovakia" }, { "code": "SI", "name": "Slovenia" }, { "code": "SB", "name": "Solomon Islands" }, { "code": "SO", "name": "Somalia" }, { "code": "ZA", "name": "South Africa" }, { "code": "GS", "name": "South Georgia and the South Sandwich Islands" }, { "code": "SS", "name": "South Sudan" }, { "code": "ES", "name": "Spain" }, { "code": "LK", "name": "Sri Lanka" }, { "code": "SD", "name": "Sudan" }, { "code": "SR", "name": "Suriname" }, { "code": "SJ", "name": "Svalbard and Jan Mayen" }, { "code": "SE", "name": "Sweden" }, { "code": "CH", "name": "Switzerland" }, { "code": "SY", "name": "Syrian Arab Republic" }, { "code": "TW", "name": "Taiwan, Province of China" }, { "code": "TJ", "name": "Tajikistan" }, { "code": "TZ", "name": "Tanzania, United Republic of" }, { "code": "TH", "name": "Thailand" }, { "code": "TL", "name": "Timor-Leste" }, { "code": "TG", "name": "Togo" }, { "code": "TK", "name": "Tokelau" }, { "code": "TO", "name": "Tonga" }, { "code": "TT", "name": "Trinidad and Tobago" }, { "code": "TN", "name": "Tunisia" }, { "code": "TM", "name": "Turkmenistan" }, { "code": "TC", "name": "Turks and Caicos Islands" }, { "code": "TV", "name": "Tuvalu" }, { "code": "TR", "name": "Türkiye" }, { "code": "UG", "name": "Uganda" }, { "code": "UA", "name": "Ukraine" }, { "code": "AE", "name": "United Arab Emirates" }, { "code": "GB", "name": "United Kingdom" }, { "code": "US", "name": "United States" }, { "code": "UM", "name": "United States Minor Outlying Islands" }, { "code": "UY", "name": "Uruguay" }, { "code": "UZ", "name": "Uzbekistan" }, { "code": "VU", "name": "Vanuatu" }, { "code": "VE", "name": "Venezuela, Bolivarian Republic of" }, { "code": "VN", "name": "Viet Nam" }, { "code": "VG", "name": "Virgin Islands, British" }, { "code": "VI", "name": "Virgin Islands, U.S." }, { "code": "WF", "name": "Wallis and Futuna" }, { "code": "EH", "name": "Western Sahara" }, { "code": "YE", "name": "Yemen" }, { "code": "ZM", "name": "Zambia" }, { "code": "ZW", "name": "Zimbabwe" }, { "code": "AX", "name": "Åland Islands" }];
var regionNames = null;
try {
    regionNames = new Intl.DisplayNames(["zh-CN"], { type: "region" });
}
catch (e) { }
var normalizeCountryName = function (v) { return String(v || "").trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[\s._,'’()（）\-\/]+/g, ""); };
var COUNTRY_ALIASES = {
    "俄国": "RU", "俄罗斯": "RU", "russia": "RU", "russianfederation": "RU",
    "白俄罗斯": "BY", "belarus": "BY", "byelorussia": "BY", "bielorrussia": "BY",
    "土耳其": "TR", "turkiye": "TR", "türkiye": "TR", "turkey": "TR",
    "巴西": "BR", "brazil": "BR", "brasil": "BR",
    "印度尼西亚": "ID", "印尼": "ID", "indonesia": "ID",
    "南非": "ZA", "southafrica": "ZA", "africadosul": "ZA",
    "阿联酋": "AE", "阿拉伯联合酋长国": "AE", "uae": "AE", "unitedarabemirates": "AE",
    "斯里兰卡": "LK", "srilanka": "LK",
    "乌克兰": "UA", "ukraine": "UA",
    "中国": "CN", "中国大陆": "CN", "china": "CN", "prc": "CN",
    "美国": "US", "美國": "US", "usa": "US", "us": "US", "unitedstates": "US", "unitedstatesofamerica": "US", "estadosunidos": "US",
    "英国": "GB", "英國": "GB", "uk": "GB", "greatbritain": "GB", "unitedkingdom": "GB", "reinounido": "GB",
    "德国": "DE", "德國": "DE", "germany": "DE", "alemanha": "DE",
    "法国": "FR", "法國": "FR", "france": "FR", "franca": "FR",
    "意大利": "IT", "义大利": "IT", "italy": "IT", "italia": "IT",
    "西班牙": "ES", "spain": "ES",
    "葡萄牙": "PT", "portugal": "PT",
    "波兰": "PL", "波蘭": "PL", "poland": "PL", "polonia": "PL",
    "荷兰": "NL", "荷蘭": "NL", "netherlands": "NL", "holland": "NL", "paisesbaixos": "NL",
    "比利时": "BE", "比利時": "BE", "belgium": "BE",
    "瑞典": "SE", "sweden": "SE", "挪威": "NO", "norway": "NO", "芬兰": "FI", "芬蘭": "FI", "finland": "FI", "丹麦": "DK", "丹麥": "DK", "denmark": "DK", "冰岛": "IS", "冰島": "IS", "iceland": "IS",
    "印度": "IN", "india": "IN", "日本": "JP", "japan": "JP", "韩国": "KR", "韓國": "KR", "southkorea": "KR", "korea": "KR",
    "新加坡": "SG", "singapore": "SG", "马来西亚": "MY", "馬來西亞": "MY", "malaysia": "MY", "泰国": "TH", "泰國": "TH", "thailand": "TH", "越南": "VN", "vietnam": "VN", "菲律宾": "PH", "菲律賓": "PH", "philippines": "PH",
    "沙特": "SA", "沙特阿拉伯": "SA", "saudiarabia": "SA", "卡塔尔": "QA", "卡塔爾": "QA", "qatar": "QA", "科威特": "KW", "kuwait": "KW", "以色列": "IL", "israel": "IL",
    "墨西哥": "MX", "mexico": "MX", "加拿大": "CA", "canada": "CA", "阿根廷": "AR", "argentina": "AR", "智利": "CL", "chile": "CL", "哥伦比亚": "CO", "哥倫比亞": "CO", "colombia": "CO",
    "澳大利亚": "AU", "澳大利亞": "AU", "澳洲": "AU", "australia": "AU", "新西兰": "NZ", "新西蘭": "NZ", "newzealand": "NZ"
};
function countryDisplayName(code) {
    var c = COUNTRY_DATA.find(function (x) { return x.code === code; });
    try {
        return (regionNames === null || regionNames === void 0 ? void 0 : regionNames.of(code)) || (c === null || c === void 0 ? void 0 : c.name) || code;
    }
    catch (e) {
        return (c === null || c === void 0 ? void 0 : c.name) || code;
    }
}
function resolveCountryCode(input) {
    var e_1, _a;
    var raw = String(input || "").trim();
    if (!raw)
        return "";
    var up = raw.toUpperCase();
    if (/^[A-Z]{2}$/.test(up) && COUNTRY_DATA.some(function (x) { return x.code === up; }))
        return up;
    var n = normalizeCountryName(raw);
    if (COUNTRY_ALIASES[n])
        return COUNTRY_ALIASES[n];
    try {
        for (var COUNTRY_DATA_1 = __values(COUNTRY_DATA), COUNTRY_DATA_1_1 = COUNTRY_DATA_1.next(); !COUNTRY_DATA_1_1.done; COUNTRY_DATA_1_1 = COUNTRY_DATA_1.next()) {
            var c = COUNTRY_DATA_1_1.value;
            if (normalizeCountryName(c.name) === n)
                return c.code;
            if (normalizeCountryName(countryDisplayName(c.code)) === n)
                return c.code;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (COUNTRY_DATA_1_1 && !COUNTRY_DATA_1_1.done && (_a = COUNTRY_DATA_1.return)) _a.call(COUNTRY_DATA_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return "";
}
function initHolidayCountrySelect() {
    var el = $("holidayCountrySelect");
    if (!el)
        return;
    var sorted = __spreadArray([], __read(COUNTRY_DATA), false).sort(function (a, b) { return countryDisplayName(a.code).localeCompare(countryDisplayName(b.code), "zh-CN"); });
    el.innerHTML = '<option value="">选择国家…</option>' + sorted.map(function (c) { return "<option value=\"".concat(c.code, "\">").concat(esc(countryDisplayName(c.code)), " (").concat(c.code, ")</option>"); }).join("");
}
var holidayAutoSyncTimer = null, holidayAutoSyncBusy = false, clientCountryDiscoveryTimer = null, clientCountryDiscoveryBusy = false;
function scheduleHolidayAutoSync() {
    clearTimeout(holidayAutoSyncTimer);
    holidayAutoSyncTimer = setTimeout(function () { return autoSyncHolidayCountries(); }, 1000);
}
function scheduleClientCountryDiscovery() {
    clearTimeout(clientCountryDiscoveryTimer);
    clientCountryDiscoveryTimer = setTimeout(function () { return autoTrackExistingClientCountries(); }, 1200);
}
function holidayDocId(code, date, name) {
    var h = 2166136261;
    var s = "".concat(code, "|").concat(date, "|").concat(name);
    for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return "auto_".concat(code, "_").concat(date, "_").concat((h >>> 0).toString(36));
}
function addHolidayCountry(code_1) {
    return __awaiter(this, arguments, void 0, function (code, _a) {
        var r;
        var _b = _a === void 0 ? {} : _a, _c = _b.silent, silent = _c === void 0 ? false : _c, _d = _b.source, source = _d === void 0 ? "手动添加" : _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (!currentUser || !code)
                        return [2 /*return*/, false];
                    code = code.toUpperCase();
                    if (!COUNTRY_DATA.some(function (x) { return x.code === code; }))
                        return [2 /*return*/, false];
                    r = doc(db, "users", currentUser.uid, "holidayCountries", code);
                    return [4 /*yield*/, setDoc(r, { code: code, name: countryDisplayName(code), source: source, enabled: true, updatedAt: serverTimestamp(), addedAt: serverTimestamp() }, { merge: true })];
                case 1:
                    _e.sent();
                    if (!!silent) return [3 /*break*/, 3];
                    return [4 /*yield*/, syncHolidayCountry(code, true)];
                case 2:
                    _e.sent();
                    _e.label = 3;
                case 3: return [2 /*return*/, true];
            }
        });
    });
}
function autoTrackCountriesFromNames() {
    return __awaiter(this, arguments, void 0, function (names) {
        var codes, existing, added, codes_1, codes_1_1, code, e_2_1;
        var e_2, _a;
        if (names === void 0) { names = []; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!currentUser)
                        return [2 /*return*/, []];
                    codes = __spreadArray([], __read(new Set(names.map(resolveCountryCode).filter(Boolean))), false);
                    existing = new Set(state.holidayCountries.map(function (x) { return x.code; }));
                    added = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    codes_1 = __values(codes), codes_1_1 = codes_1.next();
                    _b.label = 2;
                case 2:
                    if (!!codes_1_1.done) return [3 /*break*/, 5];
                    code = codes_1_1.value;
                    if (existing.has(code))
                        return [3 /*break*/, 4];
                    return [4 /*yield*/, addHolidayCountry(code, { silent: true, source: "客户国家自动识别" })];
                case 3:
                    _b.sent();
                    existing.add(code);
                    added.push(code);
                    _b.label = 4;
                case 4:
                    codes_1_1 = codes_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (codes_1_1 && !codes_1_1.done && (_a = codes_1.return)) _a.call(codes_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 8:
                    if (added.length)
                        scheduleHolidayAutoSync();
                    return [2 /*return*/, added];
            }
        });
    });
}
function autoTrackExistingClientCountries() {
    return __awaiter(this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (clientCountryDiscoveryBusy || !currentUser || !state.clients.length)
                        return [2 /*return*/];
                    clientCountryDiscoveryBusy = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, autoTrackCountriesFromNames(state.clients.map(function (c) { return c.country; }).filter(Boolean))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    e_3 = _a.sent();
                    console.warn("client country discovery", e_3);
                    return [3 /*break*/, 5];
                case 4:
                    clientCountryDiscoveryBusy = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function fetchCountryHolidays(code, year) {
    return __awaiter(this, void 0, void 0, function () {
        var url, res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://nagerholidays.com/api/v4/Holidays/".concat(encodeURIComponent(code), "/").concat(year);
                    return [4 /*yield*/, fetch(url, { cache: "no-store", headers: { "Accept": "application/json" } })];
                case 1:
                    res = _a.sent();
                    if (!res.ok)
                        throw new Error("\u8282\u5047\u65E5\u670D\u52A1\u8FD4\u56DE ".concat(res.status));
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (!Array.isArray(data))
                        throw new Error("节假日数据格式异常");
                    return [2 /*return*/, data.filter(function (h) { return (h === null || h === void 0 ? void 0 : h.date) && (h.nationalHoliday !== false) && (!Array.isArray(h.holidayTypes) || !h.holidayTypes.length || h.holidayTypes.includes("Public")); })];
            }
        });
    });
}
function syncHolidayCountry(code_1) {
    return __awaiter(this, arguments, void 0, function (code, force) {
        var tracked, status, y, years_2, all_1, _loop_1, years_1, years_1_1, year, e_4_1, oldSnap, oldAuto, keep_1, ops_1, _loop_2, i, err_1;
        var e_4, _a;
        if (force === void 0) { force = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!currentUser || !code)
                        return [2 /*return*/];
                    tracked = state.holidayCountries.find(function (x) { return x.code === code; });
                    if (!force && (tracked === null || tracked === void 0 ? void 0 : tracked.lastSyncDate) === todayISO())
                        return [2 /*return*/];
                    status = $("holidaySyncStatus");
                    if (status)
                        status.textContent = "\u6B63\u5728\u66F4\u65B0 ".concat(countryDisplayName(code), "\u2026");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 16, , 18]);
                    y = new Date().getFullYear(), years_2 = [y, y + 1], all_1 = [];
                    _loop_1 = function (year) {
                        var rows;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, fetchCountryHolidays(code, year)];
                                case 1:
                                    rows = _c.sent();
                                    rows.forEach(function (h) { return all_1.push(__assign(__assign({}, h), { year: year })); });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, 8, 9]);
                    years_1 = __values(years_2), years_1_1 = years_1.next();
                    _b.label = 3;
                case 3:
                    if (!!years_1_1.done) return [3 /*break*/, 6];
                    year = years_1_1.value;
                    return [5 /*yield**/, _loop_1(year)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    years_1_1 = years_1.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_4_1 = _b.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (years_1_1 && !years_1_1.done && (_a = years_1.return)) _a.call(years_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 9: return [4 /*yield*/, getDocs(query(refCollection("holidays"), where("countryCode", "==", code)))];
                case 10:
                    oldSnap = _b.sent();
                    oldAuto = oldSnap.docs.filter(function (d) { var _a, _b; return ((_a = d.data()) === null || _a === void 0 ? void 0 : _a.auto) === true && years_2.includes(Number((_b = d.data()) === null || _b === void 0 ? void 0 : _b.year)); });
                    keep_1 = new Set();
                    ops_1 = [];
                    all_1.forEach(function (h) {
                        var id = holidayDocId(code, h.date, h.name || "Holiday");
                        keep_1.add(id);
                        ops_1.push({ kind: "set", ref: doc(db, "users", currentUser.uid, "holidays", id), data: {
                                country: countryDisplayName(code), countryCode: code, name: h.name || "Public Holiday", date: h.date,
                                remindDays: Number((tracked === null || tracked === void 0 ? void 0 : tracked.remindDays) || 7), notes: "由全球节假日服务自动同步", auto: true, source: "Nager.Holidays",
                                year: h.year, holidayTypes: h.holidayTypes || [], nationalHoliday: h.nationalHoliday !== false, updatedAt: serverTimestamp()
                            } });
                    });
                    oldAuto.forEach(function (d) { if (!keep_1.has(d.id))
                        ops_1.push({ kind: "delete", ref: d.ref }); });
                    _loop_2 = function (i) {
                        var batch;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    batch = writeBatch(db);
                                    ops_1.slice(i, i + 350).forEach(function (op) { return op.kind === "set" ? batch.set(op.ref, op.data, { merge: true }) : batch.delete(op.ref); });
                                    return [4 /*yield*/, batch.commit()];
                                case 1:
                                    _d.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _b.label = 11;
                case 11:
                    if (!(i < ops_1.length)) return [3 /*break*/, 14];
                    return [5 /*yield**/, _loop_2(i)];
                case 12:
                    _b.sent();
                    _b.label = 13;
                case 13:
                    i += 350;
                    return [3 /*break*/, 11];
                case 14: return [4 /*yield*/, setDoc(doc(db, "users", currentUser.uid, "holidayCountries", code), {
                        code: code,
                        name: countryDisplayName(code), enabled: true, lastSyncDate: todayISO(), lastSyncAt: serverTimestamp(), lastSyncYears: years_2, lastError: "", updatedAt: serverTimestamp()
                    }, { merge: true })];
                case 15:
                    _b.sent();
                    if (status)
                        status.textContent = "".concat(countryDisplayName(code), " \u5DF2\u66F4\u65B0 ").concat(all_1.length, " \u4E2A\u516C\u5171\u8282\u5047\u65E5");
                    return [3 /*break*/, 18];
                case 16:
                    err_1 = _b.sent();
                    console.error("holiday sync", code, err_1);
                    return [4 /*yield*/, setDoc(doc(db, "users", currentUser.uid, "holidayCountries", code), { lastError: String(err_1.message || err_1), updatedAt: serverTimestamp() }, { merge: true }).catch(function () { })];
                case 17:
                    _b.sent();
                    if (status)
                        status.textContent = "".concat(countryDisplayName(code), " \u66F4\u65B0\u5931\u8D25\uFF1A").concat(err_1.message || err_1);
                    if (force)
                        alert("".concat(countryDisplayName(code), " \u8282\u5047\u65E5\u66F4\u65B0\u5931\u8D25\uFF1A").concat(err_1.message || err_1, "\n\n\u4F60\u4ECD\u53EF\u4FDD\u7559\u8FD9\u4E2A\u56FD\u5BB6\uFF0C\u7CFB\u7EDF\u4E0B\u6B21\u6253\u5F00\u65F6\u4F1A\u81EA\u52A8\u91CD\u8BD5\u3002"));
                    return [3 /*break*/, 18];
                case 18: return [2 /*return*/];
            }
        });
    });
}
function autoSyncHolidayCountries() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, c, e_5_1;
        var e_5, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (holidayAutoSyncBusy || !currentUser || !state.holidayCountries.length)
                        return [2 /*return*/];
                    holidayAutoSyncBusy = true;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, , 10, 11]);
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 7, 8, 9]);
                    _a = __values(state.holidayCountries.filter(function (x) { return x.enabled !== false; })), _b = _a.next();
                    _d.label = 3;
                case 3:
                    if (!!_b.done) return [3 /*break*/, 6];
                    c = _b.value;
                    if (!(c.lastSyncDate !== todayISO())) return [3 /*break*/, 5];
                    return [4 /*yield*/, syncHolidayCountry(c.code, false)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _b = _a.next();
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_5_1 = _d.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_5) throw e_5.error; }
                    return [7 /*endfinally*/];
                case 9: return [3 /*break*/, 11];
                case 10:
                    holidayAutoSyncBusy = false;
                    renderHolidays();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
window.refreshHolidayCountry = function (code) { return syncHolidayCountry(code, true); };
window.removeHolidayCountry = function (code) { return __awaiter(void 0, void 0, void 0, function () {
    var snap, refs, _loop_3, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!currentUser || !confirm("\u505C\u6B62\u5173\u6CE8 ".concat(countryDisplayName(code), "\uFF0C\u5E76\u5220\u9664\u8BE5\u56FD\u5BB6\u81EA\u52A8\u540C\u6B65\u7684\u8282\u5047\u65E5\u5417\uFF1F")))
                    return [2 /*return*/];
                return [4 /*yield*/, getDocs(query(refCollection("holidays"), where("countryCode", "==", code)))];
            case 1:
                snap = _a.sent();
                refs = snap.docs.filter(function (d) { var _a; return ((_a = d.data()) === null || _a === void 0 ? void 0 : _a.auto) === true; }).map(function (d) { return d.ref; });
                _loop_3 = function (i) {
                    var batch;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                batch = writeBatch(db);
                                refs.slice(i, i + 350).forEach(function (r) { return batch.delete(r); });
                                return [4 /*yield*/, batch.commit()];
                            case 1:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < refs.length)) return [3 /*break*/, 5];
                return [5 /*yield**/, _loop_3(i)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                i += 350;
                return [3 /*break*/, 2];
            case 5: return [4 /*yield*/, deleteDoc(doc(db, "users", currentUser.uid, "holidayCountries", code))];
            case 6:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// ============================================================
// 3. 登录 / 登出
// ============================================================
function doLogin() {
    return __awaiter(this, void 0, void 0, function () {
        var btn, err_2, code, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    btn = $("googleLoginBtn");
                    if (btn)
                        btn.disabled = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    // GitHub Pages 与 Firebase Auth 域名不同。手机端不再回退到 redirect，
                    // 避免 iPhone/移动浏览器停在 firebaseapp.com 空白页。
                    return [4 /*yield*/, signInWithPopup(auth, provider)];
                case 2:
                    // GitHub Pages 与 Firebase Auth 域名不同。手机端不再回退到 redirect，
                    // 避免 iPhone/移动浏览器停在 firebaseapp.com 空白页。
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    err_2 = _a.sent();
                    console.error("Google login failed", err_2);
                    code = (err_2 === null || err_2 === void 0 ? void 0 : err_2.code) || "";
                    msg = "Google 登录没有完成，请允许此网站弹出窗口后再试。";
                    if (code.includes("popup-closed-by-user"))
                        msg = "登录窗口被关闭了，请重新点击“使用 Google 登录”。";
                    if (code.includes("popup-blocked"))
                        msg = "浏览器拦截了登录窗口，请允许 miya-trade.github.io 的弹出窗口后重试。";
                    if (code.includes("unauthorized-domain"))
                        msg = "当前网站域名尚未加入 Firebase Authorized domains。";
                    alert(msg);
                    return [3 /*break*/, 5];
                case 4:
                    if (btn)
                        btn.disabled = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
$("googleLoginBtn").addEventListener("click", doLogin);
document.documentElement.dataset.appReady = "1";
if ($("googleLoginBtn")) {
    $("googleLoginBtn").disabled = false;
    $("googleLoginBtn").textContent = "使用 Google 登录";
}
$("logoutBtn").addEventListener("click", function () { return signOut(auth); });
onAuthStateChanged(auth, function (user) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                currentUser = user;
                if (!user) {
                    $("loginScreen").style.display = "grid";
                    $("workspaceApp").style.display = "none";
                    unsubscribers.splice(0).forEach(function (fn) { return fn(); });
                    return [2 /*return*/];
                }
                $("loginScreen").style.display = "none";
                $("workspaceApp").style.display = "grid";
                $("userName").textContent = user.displayName || user.email || "Google用户";
                $("userAvatar").src = user.photoURL || "";
                return [4 /*yield*/, ensureProfileAndSettings()];
            case 1:
                _a.sent();
                bindRealtimeData();
                return [2 /*return*/];
        }
    });
}); });
// ============================================================
// 4. 用户初始化与实时同步
// ============================================================
function ensureProfileAndSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var profileRef, settingsRef, snap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sync("busy", "正在连接云端…");
                    profileRef = doc(db, "users", currentUser.uid);
                    return [4 /*yield*/, setDoc(profileRef, {
                            displayName: currentUser.displayName || "",
                            email: currentUser.email || "",
                            photoURL: currentUser.photoURL || "",
                            updatedAt: serverTimestamp()
                        }, { merge: true })];
                case 1:
                    _a.sent();
                    settingsRef = doc(db, "users", currentUser.uid, "settings", "main");
                    return [4 /*yield*/, getDoc(settingsRef)];
                case 2:
                    snap = _a.sent();
                    if (!!snap.exists()) return [3 /*break*/, 4];
                    return [4 /*yield*/, setDoc(settingsRef, state.settings)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function bindRealtimeData() {
    unsubscribers.splice(0).forEach(function (fn) { return fn(); });
    var collections = ["clients", "communications", "rfqs", "quotes", "orders", "tasks", "holidays", "holidayCountries", "files", "samples", "exportLogs"];
    collections.forEach(function (name) {
        var unsub = onSnapshot(refCollection(name), function (snap) {
            state[name] = snap.docs.map(function (d) { return (__assign({ id: d.id }, d.data())); });
            sync("ok", "已自动同步");
            renderAll();
            if (name === "holidayCountries")
                scheduleHolidayAutoSync();
            if (name === "clients")
                scheduleClientCountryDiscovery();
        }, function (err) {
            console.error(err);
            sync("err", "同步失败");
        });
        unsubscribers.push(unsub);
    });
    var settingsUnsub = onSnapshot(doc(db, "users", currentUser.uid, "settings", "main"), function (snap) {
        if (snap.exists())
            state.settings = __assign(__assign({}, state.settings), snap.data());
        renderSettings();
        renderAll();
        checkBackupReminder();
    });
    unsubscribers.push(settingsUnsub);
}
// ============================================================
// 5. 页面切换
// ============================================================
document.querySelectorAll(".nav button").forEach(function (btn) {
    btn.addEventListener("click", function () { return showPage(btn.dataset.page); });
});
window.showPage = function (name) {
    var _a, _b;
    document.querySelectorAll(".page").forEach(function (p) { return p.classList.remove("active"); });
    document.querySelectorAll(".nav button").forEach(function (b) { return b.classList.remove("active"); });
    (_a = $("page-" + name)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
    (_b = document.querySelector(".nav button[data-page=\"".concat(name, "\"]"))) === null || _b === void 0 ? void 0 : _b.classList.add("active");
    $("sidebar").classList.remove("open");
};
$("menuBtn").addEventListener("click", function () { return $("sidebar").classList.toggle("open"); });
// ============================================================
// 6. 自动跟进逻辑
// ============================================================
function outreachStepLabel(nextNumber, limit) {
    nextNumber = Math.max(1, Number(nextNumber || 1));
    limit = Math.max(1, Number(limit || 3));
    if (nextNumber >= limit)
        return "最后一次开发";
    return "第" + nextNumber + "次开发";
}
function clientDevelopmentInfo(c) {
    var rot = currentContactInfo(c), ct = rot.current, limit = rot.limit;
    var status = String((c && c.status) || "");
    var stopped = ["已回复", "有询价", "已报价", "重点跟进", "PI", "已成交", "老客户", "长期维护", "沉睡客户", "暂停开发", "无效客户"].includes(status);
    if (stopped)
        return { active: false, rot: rot, stage: status || "业务跟进", action: "none", actionLabel: "", dueDate: c.nextFollowUp || "" };
    if (!ct)
        return { active: true, rot: rot, stage: "缺少可开发邮箱", action: "edit", actionLabel: "补充邮箱", dueDate: c.nextFollowUp || todayISO(), priority: "high", note: "客户还没有可用邮箱，先补充联系人后再开始开发。" };
    if (ct.replied)
        return { active: false, rot: rot, stage: "客户已回复", action: "none", actionLabel: "", dueDate: c.nextFollowUp || "" };
    if (rot.pending)
        return { active: true, rot: rot, stage: ct.invalid ? "退信/邮箱无效" : "3次开发后仍无回复", action: "switch", actionLabel: rot.next ? "切换下一联系人" : "转沉睡客户", dueDate: todayISO(), priority: "high", note: rot.next ? (rot.reason + "，建议切换至 " + contactLabel(rot.next)) : (rot.reason + "，该公司已无更多可用联系人。") };
    var touches = Number(ct.touchCount || 0), nextNumber = touches + 1;
    if (touches >= limit) {
        var waitDue = ct.nextFollowUp || c.nextFollowUp || todayISO();
        return { active: true, rot: rot, stage: "最后一次已发送，等待回复", action: "wait", actionLabel: "等待回复", dueDate: waitDue, priority: "normal", note: "最后一次开发已发送，先等到跟进日期；届时仍无回复再切换下一联系人。" };
    }
    var label = outreachStepLabel(nextNumber, limit);
    var due = touches === 0 ? (c.nextFollowUp || todayISO()) : (ct.nextFollowUp || c.nextFollowUp || addDays(ct.lastContact || todayISO(), state.settings.contactFollowDays || 3));
    var stage = touches === 0 ? "待开发" : ("待" + label);
    return { active: true, rot: rot, stage: stage, action: "outreach", actionLabel: label, dueDate: due, priority: (nextNumber >= limit || c.grade === "A") ? "high" : "normal", note: "当前联系人：" + contactLabel(ct) + " · 已联系 " + touches + "/" + limit + " 次" };
}
function getFollowups() {
    var out = [];
    var weekend = isWeekend() && !state.settings.weekendFollow;
    state.orders.forEach(function (o) {
        if (["未付款", "部分付款"].includes(o.paymentStatus))
            out.push({ type: "order", id: o.id, priority: "high", category: "business", title: clientName(o.clientId) + " · " + (o.piNo || "PI"), meta: (o.paymentStatus || "待付款") + " · " + (o.amount || 0) + " " + (o.currency || state.settings.currency), stage: "PI付款" });
    });
    state.rfqs.forEach(function (r) {
        var due = r.nextFollowUp || (r.requestDate ? addDays(r.requestDate, state.settings.rfqFollowDays || 2) : "");
        if (due && due <= todayISO() && !["已全部报价", "客户取消", "已结束"].includes(r.status || "")) {
            var overdue = Math.max(0, daysBetween(due, todayISO()) || 0);
            out.push({ type: "rfq", id: r.id, priority: overdue >= 2 ? "high" : "normal", category: "business", title: clientName(r.clientId) + " · RFQ " + (r.rfqNo || r.subject || "询价"), meta: (r.status || "待处理") + " · " + (r.itemCount || 0) + "项 · " + (overdue ? "逾期" + overdue + "天" : "今天到期"), stage: "RFQ处理", dueDate: due });
        }
    });
    state.samples.forEach(function (smp) {
        var due = smp.nextFollowUp || smp.feedbackDueDate || smp.expectedArrival || "";
        var active = !["测试通过", "测试未通过", "已结束", "取消"].includes(smp.status || "");
        if (active && due && due <= todayISO()) {
            var overdue = Math.max(0, daysBetween(due, todayISO()) || 0);
            var what = smp.partNo || smp.itemName || "样品";
            var meta = (smp.status || "样品跟进") + " · " + (overdue ? "逾期" + overdue + "天" : "今天到期") + (smp.tracking ? " · " + smp.tracking : "");
            out.push({ type: "sample", id: smp.id, priority: ["已签收待测试", "测试中"].includes(smp.status) ? "high" : "normal", category: "business", title: clientName(smp.clientId) + " · 样品 " + what, meta: meta, stage: "样品跟进", dueDate: due });
        }
    });
    state.quotes.forEach(function (q) {
        var due = q.nextFollowUp || (q.quoteDate ? addDays(q.quoteDate, state.settings.quoteFollowDays) : "");
        if (due && due <= todayISO() && !["成交", "丢单", "暂停"].includes(q.status)) {
            var overdue = Math.max(0, daysBetween(due, todayISO()) || 0);
            out.push({ type: "quote", id: q.id, priority: overdue >= 5 ? "high" : "normal", category: "business", title: clientName(q.clientId) + " · " + (q.partNo || q.batchName || "报价"), meta: (q.status || "已报价") + " · " + (overdue ? "逾期" + overdue + "天" : "今天到期"), stage: "报价跟进", dueDate: due });
        }
    });
    state.clients.forEach(function (c) {
        if (!c || c.status === "无效客户") return;
        var dev = clientDevelopmentInfo(c);
        if (dev.active) {
            var due = dev.dueDate || todayISO();
            if (due <= todayISO()) {
                var overdue = Math.max(0, daysBetween(due, todayISO()) || 0);
                var owner = assignmentLabel(c, { email: false });
                var meta = dev.note || "";
                if (overdue) meta += " · 逾期" + overdue + "天";
                if (owner) meta += " · " + owner;
                out.push({ type: "client", id: c.id, priority: dev.priority || "normal", category: "development", title: c.company, meta: meta, stage: dev.stage, action: dev.action, actionLabel: dev.actionLabel, dueDate: due });
            }
            return;
        }
        if (c.nextFollowUp && c.nextFollowUp <= todayISO()) {
            var long = ["长期维护", "沉睡客户"].includes(c.status), rot = currentContactInfo(c);
            var current = rot.current ? " · 当前 " + contactLabel(rot.current) : "";
            out.push({ type: "client", id: c.id, priority: long ? "long" : c.grade === "A" ? "high" : "normal", category: long ? "long" : "business", title: c.company, meta: (c.country || "") + " · " + (c.status || "") + current + " · " + assignmentLabel(c, { email: false }), stage: long ? "长期维护" : "客户跟进", dueDate: c.nextFollowUp });
        }
    });
    var rank = { high: 3, normal: 2, long: 1 }, map = new Map();
    out.forEach(function (x) { var k = x.type + ":" + x.id; if (!map.has(k) || rank[x.priority] > rank[map.get(k).priority]) map.set(k, x); });
    var arr = Array.from(map.values());
    if (weekend) arr = arr.filter(function (x) { return x.priority === "high" || x.category === "development"; });
    return arr.sort(function (a, b) { var pa = { high: 0, normal: 1, long: 2 }[a.priority], pb = { high: 0, normal: 1, long: 2 }[b.priority]; if (pa !== pb) return pa - pb; return String(a.dueDate || "").localeCompare(String(b.dueDate || "")); });
}
// ============================================================
// 7. 渲染
// ============================================================
function renderAll() {
    renderDashboard();
    renderClients();
    renderFollowups();
    renderRFQs();
    renderQuotes();
    renderOrders();
    renderTasks();
    renderReview();
    renderHolidays();
    renderSettings();
    if (currentClientId && $("clientModal").classList.contains("show"))
        renderClientDetail();
}
function renderDashboard() {
    var follow = getFollowups();
    var stats = [
        ["今日待跟进", follow.length, "待开发 " + follow.filter(function (x) { return x.category === "development"; }).length + " · 高优先 " + follow.filter(function (x) { return x.priority === "high"; }).length],
        ["RFQ / 报价", "".concat(state.rfqs.length, " / ").concat(state.quotes.length), "询价 / 报价单"],
        ["PI/订单", state.orders.length, "\u5F85\u4ED8\u6B3E ".concat(state.orders.filter(function (o) { return ["未付款", "部分付款"].includes(o.paymentStatus); }).length)],
        ["未完成任务", state.tasks.filter(function (t) { return !t.done; }).length, "实时同步"]
    ];
    $("stats").innerHTML = stats.map(function (s) { return "<div class=\"stat\"><div class=\"label\">".concat(s[0], "</div><div class=\"value\">").concat(s[1], "</div><div class=\"note\">").concat(s[2], "</div></div>"); }).join("");
    $("todayFollowups").innerHTML = follow.length ? follow.slice(0, 8).map(function (x) { return "<div class=\"item\" onclick=\"openLinked('" + x.type + "','" + x.id + "')\"><div class=\"item-title\">" + esc(x.title) + " " + badge(x.stage || (x.priority === "high" ? "高优先级" : x.priority === "long" ? "长期维护" : "正常"), x.priority === "high" ? "red" : x.priority === "long" ? "green" : "orange") + "</div><div class=\"item-meta\">" + esc(x.meta) + "</div></div>"; }).join("") : empty("今天没有到期跟进。");
    var tasks = state.tasks.filter(function (t) { return !t.done && (!t.dueDate || t.dueDate <= todayISO()); }).slice(0, 8);
    $("todayTasks").innerHTML = tasks.length ? tasks.map(function (t) { return "<div class=\"item\"><div class=\"item-title\">".concat(esc(t.title), "</div><div class=\"item-meta\">").concat(t.dueDate ? fmtDate(t.dueDate) : "无日期", " \u00B7 ").concat(t.clientId ? esc(clientName(t.clientId)) : "未关联客户", "</div></div>"); }).join("") : empty("今天暂无任务。");
}
var clientStatuses = ["新客户", "已开发", "已回复", "有询价", "已报价", "重点跟进", "PI", "已成交", "老客户", "长期维护", "沉睡客户", "暂停开发", "无效客户"];
function renderClients() {
    var sf = $("clientStatusFilter"), cur = sf.value;
    sf.innerHTML = '<option value="">全部状态</option>' + clientStatuses.map(function (x) { return "<option>".concat(x, "</option>"); }).join("");
    sf.value = cur;
    var ownerSel = $("clientOwnerFilter"), companySel = $("clientOurCompanyFilter");
    var oldOwner = (ownerSel === null || ownerSel === void 0 ? void 0 : ownerSel.value) || "", oldCompany = (companySel === null || companySel === void 0 ? void 0 : companySel.value) || "";
    var owners = __spreadArray([], __read(new Set(state.clients.map(function (c) { return c.ownerSalesperson; }).filter(Boolean))), false).sort();
    var companies = __spreadArray([], __read(new Set(state.clients.map(function (c) { return c.ownerCompany; }).filter(Boolean))), false).sort();
    if (ownerSel) {
        ownerSel.innerHTML = '<option value="">全部业务员</option>' + owners.map(function (x) { return "<option>".concat(esc(x), "</option>"); }).join("");
        ownerSel.value = owners.includes(oldOwner) ? oldOwner : "";
    }
    if (companySel) {
        companySel.innerHTML = '<option value="">全部我方公司</option>' + companies.map(function (x) { return "<option>".concat(esc(x), "</option>"); }).join("");
        companySel.value = companies.includes(oldCompany) ? oldCompany : "";
    }
    var q = ($("clientFilter").value || "").toLowerCase(), status = sf.value, owner = (ownerSel === null || ownerSel === void 0 ? void 0 : ownerSel.value) || "", ourCompany = (companySel === null || companySel === void 0 ? void 0 : companySel.value) || "";
    var allRows = state.clients.filter(function (c) {
        var hay = [c.company, c.country, c.contact, getClientEmails(c, { includeNotes: true }).join(" "), c.whatsapp, c.ownerSalesperson, c.ownerCompany, c.ownerEmail].join(" ").toLowerCase();
        return (!q || hay.includes(q)) && (!status || c.status === status) && (!owner || c.ownerSalesperson === owner) && (!ourCompany || c.ownerCompany === ourCompany);
    }).sort(function (a, b) { return (a.company || "").localeCompare(b.company || "", "zh-CN"); });
    var pages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
    if (clientPage > pages)
        clientPage = pages;
    var rows = allRows.slice((clientPage - 1) * PAGE_SIZE, clientPage * PAGE_SIZE);
    $("clientTable").innerHTML = rows.length ? rows.map(function (c) { var rot = currentContactInfo(c), ct = rot.current, ctHtml = ct ? "<b>".concat(esc(ct.name || ct.email), "</b><div class=\"item-meta\">").concat(ct.name ? esc(ct.email) : "", " \u00B7 ").concat(ct.touchCount || 0, "/").concat(rot.limit, "\u6B21").concat(rot.pending ? " · 待切换" : "", "</div>") : "—"; var a = clientAssignment(c), assignHtml = (a.salesperson || a.company || a.email) ? "<b>".concat(esc(a.salesperson || "未填业务员"), "</b><div class=\"item-meta\">").concat(esc(a.company || "未填公司")).concat(a.email ? " \u00B7 ".concat(esc(a.email)) : "", "</div>") : "—"; return "<tr><td data-label=\"\u5BA2\u6237\"><b>".concat(esc(c.company || "未命名"), "</b></td><td data-label=\"\u56FD\u5BB6\">").concat(esc(c.country || "—"), "</td><td data-label=\"\u8DDF\u8FDB\u5F52\u5C5E\">").concat(assignHtml, "</td><td data-label=\"\u8054\u7CFB\u4EBA\">").concat(ctHtml, "</td><td data-label=\"\u72B6\u6001\">").concat(badge(c.status || "—", ["已成交", "老客户", "已回复"].includes(c.status) ? "green" : ["PI", "已报价", "重点跟进"].includes(c.status) ? "orange" : "")).concat(rot.pending ? " ".concat(badge("建议换联系人", "red")) : "", "</td><td data-label=\"\u7B49\u7EA7\">").concat(esc(c.grade || "—"), "</td><td data-label=\"\u4E0B\u6B21\u8DDF\u8FDB\">").concat(fmtDate(c.nextFollowUp), "</td><td data-label=\"\u64CD\u4F5C\"><button class=\"btn small primary\" onclick=\"openClient('").concat(c.id, "')\">\u8BE6\u60C5</button> <button class=\"btn small\" onclick=\"openForm('client','").concat(c.id, "')\">\u7F16\u8F91</button> <button class=\"btn small danger\" onclick=\"removeEntity('client','").concat(c.id, "')\">\u5220\u9664</button></td></tr>"); }).join("") : "<tr><td class=\"client-empty-cell\" colspan=\"8\">".concat(empty("还没有客户。"), "</td></tr>");
    var pg = $("clientPager");
    if (pg)
        pg.innerHTML = allRows.length > PAGE_SIZE ? "<span>\u5171 ".concat(allRows.length, " \u5BB6 \u00B7 \u7B2C ").concat(clientPage, "/").concat(pages, " \u9875</span><button class=\"btn small\" onclick=\"changeClientPage(-1)\" ").concat(clientPage <= 1 ? "disabled" : "", ">\u4E0A\u4E00\u9875</button><button class=\"btn small\" onclick=\"changeClientPage(1)\" ").concat(clientPage >= pages ? "disabled" : "", ">\u4E0B\u4E00\u9875</button>") : "<span>\u5171 ".concat(allRows.length, " \u5BB6</span>");
}
window.changeClientPage = function (d) { clientPage = Math.max(1, clientPage + Number(d || 0)); renderClients(); };
$("clientFilter").addEventListener("input", function () { clientPage = 1; renderClients(); });
$("clientStatusFilter").addEventListener("change", function () { clientPage = 1; renderClients(); });
(_a = $("clientOwnerFilter")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", function () { clientPage = 1; renderClients(); });
(_b = $("clientOurCompanyFilter")) === null || _b === void 0 ? void 0 : _b.addEventListener("change", function () { clientPage = 1; renderClients(); });
function followupActionHtml(x) {
    if (x.type !== "client" || x.category !== "development") return "";
    var c = state.clients.find(function (z) { return z.id === x.id; });
    if (!c) return "";
    var dev = clientDevelopmentInfo(c), rot = dev.rot || currentContactInfo(c), ct = rot.current, btns = [];
    if (dev.action === "outreach") btns.push("<button class=\"btn small primary\" onclick=\"event.stopPropagation();recordOutreachTouch('" + c.id + "')\">" + esc(dev.actionLabel) + "</button>");
    if (dev.action === "switch") btns.push("<button class=\"btn small danger\" onclick=\"event.stopPropagation();switchToNextContact('" + c.id + "')\">" + esc(dev.actionLabel) + "</button>");
    if (dev.action === "edit") btns.push("<button class=\"btn small primary\" onclick=\"event.stopPropagation();openForm('client','" + c.id + "')\">补充邮箱</button>");
    if (ct && !ct.replied && !ct.invalid) {
        btns.push("<button class=\"btn small\" onclick=\"event.stopPropagation();recordCurrentContactReply('" + c.id + "')\">客户已回复</button>");
        btns.push("<button class=\"btn small danger\" onclick=\"event.stopPropagation();markCurrentContactInvalid('" + c.id + "')\">退信/不存在</button>");
    }
    if (dev.action !== "edit" && dev.action !== "switch") btns.push("<button class=\"btn small\" onclick=\"event.stopPropagation();postponeClientFollowup('" + c.id + "')\">延后</button>");
    return btns.length ? "<div class=\"follow-actions\">" + btns.join("") + "</div>" : "";
}
function renderFollowupItem(x) {
    var stage = x.stage ? " <span class=\"badge follow-stage " + (x.priority === "high" ? "red" : x.priority === "long" ? "green" : "orange") + "\">" + esc(x.stage) + "</span>" : "";
    return "<div class=\"item follow-item\"><div class=\"follow-main\" onclick=\"openLinked('" + x.type + "','" + x.id + "')\"><div class=\"item-title\">" + esc(x.title) + stage + "</div><div class=\"item-meta\">" + esc(x.meta) + "</div></div>" + followupActionHtml(x) + "</div>";
}
function renderFollowups() {
    var f = getFollowups();
    var dev = f.filter(function (x) { return x.category === "development"; });
    var high = f.filter(function (x) { return x.category !== "development" && x.priority === "high"; });
    var normal = f.filter(function (x) { return x.category !== "development" && x.priority === "normal"; });
    var long = f.filter(function (x) { return x.priority === "long"; });
    var renderGroup = function (arr, id, emptyText) { var limit = 100, shown = arr.slice(0, limit); $(id).innerHTML = shown.length ? shown.map(renderFollowupItem).join("") + (arr.length > limit ? "<div class=\"follow-limit-note\">当前显示前 " + limit + " 条，共 " + arr.length + " 条。</div>" : "") : empty(emptyText); };
    renderGroup(dev, "devFollow", "暂无到期开发提醒。");
    renderGroup(high, "highFollow", "暂无高优先级业务跟进。");
    renderGroup(normal, "normalFollow", "暂无正常业务跟进。");
    renderGroup(long, "longFollow", "暂无长期维护提醒。");
    if ($("devFollowCount")) $("devFollowCount").textContent = dev.length;
    if ($("highFollowCount")) $("highFollowCount").textContent = high.length;
    if ($("normalFollowCount")) $("normalFollowCount").textContent = normal.length;
    if ($("longFollowCount")) $("longFollowCount").textContent = long.length;
}
function renderRFQs() {
    var rows = state.rfqs.slice().sort(function (a, b) { return (b.requestDate || "").localeCompare(a.requestDate || ""); });
    var el = $("rfqTable");
    if (!el)
        return;
    el.innerHTML = rows.length ? rows.map(function (r) { return "<tr><td>".concat(esc(clientName(r.clientId)), "</td><td><b>").concat(esc(r.rfqNo || r.subject || "RFQ"), "</b><div class=\"item-meta\">").concat(esc(r.sourceFile || ""), "</div></td><td>").concat(fmtDate(r.requestDate), "</td><td>").concat(esc(r.itemCount || 0), "</td><td>").concat(badge(r.status || "待处理", ["已全部报价", "已结束"].includes(r.status) ? "green" : ["待报价", "部分报价"].includes(r.status) ? "orange" : ""), "</td><td>").concat(esc(r.customerNeed || r.notes || "—"), "</td><td>").concat(fmtDate(r.nextFollowUp), "</td><td><button class=\"btn small\" onclick=\"openForm('rfq','").concat(r.id, "')\">\u7F16\u8F91</button> <button class=\"btn small danger\" onclick=\"removeEntity('rfq','").concat(r.id, "')\">\u5220\u9664</button></td></tr>"); }).join("") : "<tr><td colspan=\"8\">".concat(empty("暂无 RFQ。收到客户询价后先登记 RFQ，再录入报价。"), "</td></tr>");
}
function inRange(date, days) { if (!date)
    return false; var d = parseDate(date); if (!d)
    return false; return d >= new Date(Date.now() - Number(days || 30) * 86400000); }
function renderReview() {
    var _a;
    var el = $("reviewStats");
    if (!el)
        return;
    var days = Number(((_a = $("reviewRange")) === null || _a === void 0 ? void 0 : _a.value) || 30);
    var clients = state.clients.filter(function (x) { var _a, _b, _c, _d; return inRange(x.createdDate || x.firstContact || ((_d = (_c = (_b = (_a = x.createdAt) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c.toISOString) === null || _d === void 0 ? void 0 : _d.call(_c).slice(0, 10)), days); });
    var comms = state.communications.filter(function (x) { return inRange(x.date, days); });
    var rfqs = state.rfqs.filter(function (x) { return inRange(x.requestDate, days); });
    var quotes = state.quotes.filter(function (x) { return inRange(x.quoteDate, days); });
    var samples = state.samples.filter(function (x) { return inRange(x.requestDate || x.sentDate, days); });
    var orders = state.orders.filter(function (x) { return inRange(x.piDate, days); });
    var wins = state.clients.filter(function (x) { return ["已成交", "老客户"].includes(x.status); });
    var unpaid = state.orders.filter(function (x) { return ["未付款", "部分付款"].includes(x.paymentStatus); });
    var replied = new Set(comms.filter(function (x) { return ["客户回复", "双向沟通"].includes(x.direction); }).map(function (x) { return x.clientId; }));
    var cards = [["新增客户", clients.length], ["有回复客户", replied.size], ["RFQ", rfqs.length], ["报价单", quotes.length], ["样品", samples.length], ["PI/订单", orders.length], ["累计成交客户", wins.length], ["待付款PI", unpaid.length]];
    el.innerHTML = cards.map(function (_a) {
        var _b = __read(_a, 2), a = _b[0], b = _b[1];
        return "<div class=\"report-card\"><div class=\"lbl\">".concat(a, "</div><div class=\"num\">").concat(b, "</div></div>");
    }).join("");
    var feed = {};
    comms.forEach(function (x) { var k = x.feedbackType || inferFeedbackType(x.customerFeedback || x.content || ""); if (k && k !== "其他")
        feed[k] = (feed[k] || 0) + 1; });
    state.quotes.filter(function (q) { return q.lossReason; }).forEach(function (q) { return feed[q.lossReason] = (feed[q.lossReason] || 0) + 1; });
    var total = Object.values(feed).reduce(function (a, b) { return a + b; }, 0) || 1;
    $("reviewFeedback").innerHTML = Object.entries(feed).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8).map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return "<div class=\"item\"><div class=\"item-title\">".concat(esc(k), " \u00B7 ").concat(v, "</div><div class=\"progress\"><i style=\"width:").concat(Math.round(v / total * 100), "%\"></i></div></div>");
    }).join("") || empty("暂无结构化反馈。");
    var countries = {};
    state.clients.forEach(function (c) { var k = c.country || "未填写"; countries[k] = (countries[k] || 0) + 1; });
    var ct = Object.values(countries).reduce(function (a, b) { return a + b; }, 0) || 1;
    $("reviewCountries").innerHTML = Object.entries(countries).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10).map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return "<div class=\"item\"><div class=\"item-title\">".concat(esc(k), " \u00B7 ").concat(v, "</div><div class=\"progress\"><i style=\"width:").concat(Math.round(v / ct * 100), "%\"></i></div></div>");
    }).join("") || empty("暂无客户国家数据。");
}
(_c = $("reviewRange")) === null || _c === void 0 ? void 0 : _c.addEventListener("change", renderReview);
function renderQuotes() {
    var all = state.quotes.slice().sort(function (a, b) { return (b.quoteDate || "").localeCompare(a.quoteDate || ""); });
    var pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    if (quotePage > pages)
        quotePage = pages;
    var rows = all.slice((quotePage - 1) * PAGE_SIZE, quotePage * PAGE_SIZE);
    $("quoteTable").innerHTML = rows.length ? rows.map(function (q) {
        var _a;
        var isBatch = Array.isArray(q.items) && q.items.length;
        var title = isBatch ? (q.batchName || "".concat(((_a = q.items[0]) === null || _a === void 0 ? void 0 : _a.partNo) || "批量报价", " \u7B49 ").concat(q.itemCount || q.items.length, " \u9879")) : (q.partNo || "—");
        var brand = isBatch ? (q.brand || "多品牌") : (q.brand || "—");
        var qty = isBatch ? "".concat(q.itemCount || q.items.length, " \u9879") : (q.qty || "—");
        var price = isBatch ? (q.priceSummary || "批量报价") : (q.quotePrice || "—");
        var actions = isBatch ? "<button class=\"btn small primary\" onclick=\"openQuoteBatch('".concat(q.id, "')\">\u67E5\u770B\u660E\u7EC6</button> <button class=\"btn small danger\" onclick=\"removeEntity('quote','").concat(q.id, "')\">\u5220\u9664</button>") : "<button class=\"btn small\" onclick=\"openForm('quote','".concat(q.id, "')\">\u7F16\u8F91</button> <button class=\"btn small danger\" onclick=\"removeEntity('quote','").concat(q.id, "')\">\u5220\u9664</button>");
        return "<tr><td>".concat(esc(clientName(q.clientId)), "</td><td><b>").concat(esc(title), "</b>").concat(isBatch ? "<div class=\"quote-batch\">Excel\u6279\u91CF\u62A5\u4EF7</div>" : "", "</td><td>").concat(esc(brand), "</td><td>").concat(esc(qty), "</td><td>").concat(esc(price), "</td><td>").concat(badge(q.status || "—", "orange"), "</td><td>").concat(fmtDate(q.nextFollowUp), "</td><td>").concat(actions, "</td></tr>");
    }).join("") : "<tr><td colspan=\"8\">".concat(empty("暂无报价。"), "</td></tr>");
    var pg = $("quotePager");
    if (pg)
        pg.innerHTML = all.length > PAGE_SIZE ? "<span>\u5171 ".concat(all.length, " \u4EFD\u62A5\u4EF7 \u00B7 \u7B2C ").concat(quotePage, "/").concat(pages, " \u9875</span><button class=\"btn small\" onclick=\"changeQuotePage(-1)\" ").concat(quotePage <= 1 ? "disabled" : "", ">\u4E0A\u4E00\u9875</button><button class=\"btn small\" onclick=\"changeQuotePage(1)\" ").concat(quotePage >= pages ? "disabled" : "", ">\u4E0B\u4E00\u9875</button>") : "<span>\u5171 ".concat(all.length, " \u4EFD\u62A5\u4EF7</span>");
}
window.changeQuotePage = function (d) { quotePage = Math.max(1, quotePage + Number(d || 0)); renderQuotes(); };
function renderOrders() {
    $("orderTable").innerHTML = state.orders.length ? state.orders.map(function (o) { return "<tr>\n    <td><b>".concat(esc(o.piNo || "—"), "</b></td><td>").concat(esc(clientName(o.clientId)), "</td><td>").concat(esc(o.amount || 0), " ").concat(esc(o.currency || state.settings.currency), "</td>\n    <td>").concat(badge(o.paymentStatus || "—", ["未付款", "部分付款"].includes(o.paymentStatus) ? "red" : "green"), "<div class=\"item-meta\">\u5DF2\u4ED8 ").concat(esc(o.paidAmount || 0), " \u00B7 \u4F59\u989D ").concat(esc(o.balanceDue || 0), "</div></td><td>").concat(esc(o.orderStatus || "—"), "</td><td>").concat(esc(o.shippingMode || o.shipping || "—"), "<div class=\"item-meta\">").concat(esc(o.tracking || ""), "</div></td>\n    <td><button class=\"btn small\" onclick=\"openForm('order','").concat(o.id, "')\">\u7F16\u8F91</button> <button class=\"btn small danger\" onclick=\"removeEntity('order','").concat(o.id, "')\">\u5220\u9664</button></td>\n  </tr>"); }).join("") : "<tr><td colspan=\"7\">".concat(empty("暂无PI / 订单。"), "</td></tr>");
}
function renderTasks() {
    var html = function (t) { return "<div class=\"item\"><div class=\"item-title\">".concat(esc(t.title), " ").concat(badge(t.priority || "普通"), "</div><div class=\"item-meta\">").concat(fmtDate(t.dueDate), " \u00B7 ").concat(t.clientId ? esc(clientName(t.clientId)) : "未关联客户", "</div><div style=\"margin-top:6px\"><button class=\"btn small\" onclick=\"toggleTask('").concat(t.id, "',").concat(!t.done, ")\">").concat(t.done ? "恢复" : "完成", "</button> <button class=\"btn small\" onclick=\"openForm('task','").concat(t.id, "')\">\u7F16\u8F91</button> <button class=\"btn small danger\" onclick=\"removeEntity('task','").concat(t.id, "')\">\u5220\u9664</button></div></div>"); };
    $("taskOpen").innerHTML = state.tasks.filter(function (t) { return !t.done; }).map(html).join("") || empty("暂无");
    $("taskDone").innerHTML = state.tasks.filter(function (t) { return t.done; }).map(html).join("") || empty("暂无");
}
function renderHolidays() {
    var chips = $("holidayCountryChips");
    if (chips) {
        chips.innerHTML = state.holidayCountries.length ? state.holidayCountries.slice().sort(function (a, b) { return countryDisplayName(a.code).localeCompare(countryDisplayName(b.code), "zh-CN"); }).map(function (c) {
            var sub = c.lastError ? "<span class=\"holiday-error\">\u66F4\u65B0\u5931\u8D25</span>" : (c.lastSyncDate ? "<span>".concat(esc(c.lastSyncDate), " \u5DF2\u66F4\u65B0</span>") : "<span>\u7B49\u5F85\u9996\u6B21\u540C\u6B65</span>");
            return "<div class=\"country-chip\"><b>".concat(esc(countryDisplayName(c.code)), "</b><em>").concat(esc(c.code), "</em>").concat(sub, "<button class=\"chip-btn\" onclick=\"refreshHolidayCountry('").concat(c.code, "')\" title=\"\u7ACB\u5373\u66F4\u65B0\">\u21BB</button><button class=\"chip-btn danger\" onclick=\"removeHolidayCountry('").concat(c.code, "')\" title=\"\u79FB\u9664\">\u00D7</button></div>");
        }).join("") : "<div class=\"empty\" style=\"padding:12px\">\u8FD8\u6CA1\u6709\u5173\u6CE8\u56FD\u5BB6\u3002\u6DFB\u52A0\u56FD\u5BB6\u540E\u4F1A\u81EA\u52A8\u540C\u6B65\u4ECA\u5E74\u548C\u660E\u5E74\u7684\u516C\u5171\u8282\u5047\u65E5\u3002</div>";
    }
    var rows = state.holidays.slice().sort(function (a, b) { return (a.date || "").localeCompare(b.date || "") || (a.country || "").localeCompare(b.country || ""); });
    $("holidayTable").innerHTML = rows.length ? rows.map(function (h) { return "<tr>\n    <td>".concat(esc(h.country || countryDisplayName(h.countryCode || "")), "</td><td><b>").concat(esc(h.name), "</b>").concat(h.auto ? " <span class=\"badge green\">\u81EA\u52A8</span>" : "", "</td>\n    <td>").concat(fmtDate(h.date), "</td><td>").concat(esc(h.remindDays || 7), "\u5929</td>\n    <td>").concat(h.auto ? "<span class=\"item-meta\">\u6BCF\u5929\u81EA\u52A8\u68C0\u67E5\u66F4\u65B0</span>" : "<button class=\"btn small\" onclick=\"openForm('holiday','".concat(h.id, "')\">\u7F16\u8F91</button> <button class=\"btn small danger\" onclick=\"removeEntity('holiday','").concat(h.id, "')\">\u5220\u9664</button>"), "</td>\n  </tr>"); }).join("") : "<tr><td colspan=\"5\">".concat(empty("暂无节假日。先在上方添加一个国家。"), "</td></tr>");
    var s = $("holidaySyncStatus");
    if (s && !s.textContent)
        s.textContent = "\u5DF2\u5173\u6CE8 ".concat(state.holidayCountries.length, " \u4E2A\u56FD\u5BB6 \u00B7 \u6BCF\u5929\u81EA\u52A8\u66F4\u65B0");
}
// ============================================================
// 8. 通用新增 / 编辑
// ============================================================
var schemas = {
    client: [
        ["company", "公司名称", "text", true], ["country", "国家", "text"], ["city", "城市", "text"], ["website", "官网", "text"],
        ["salesProfile", "跟进归属（业务员 / 我方公司 / 邮箱）", "salesProfile", false],
        ["grade", "客户等级", "select", false, ["A", "B", "C", "D"]], ["status", "客户状态", "select", false, clientStatuses],
        ["contact", "联系人", "text"], ["title", "职位", "text"], ["email", "Email（可填多个，用逗号/分号/换行分隔）", "textarea"], ["phone", "电话", "text"], ["whatsapp", "WhatsApp", "text"],
        ["linkedin", "LinkedIn", "text"], ["facebook", "Facebook", "text"], ["telegram", "Telegram", "text"],
        ["customerType", "客户类型", "select", false, ["终端工厂", "EMS/PCBA", "贸易商/分销商", "维修/工程公司", "其他"]], ["industry", "应用行业", "text"], ["source", "开发来源", "select", false, ["Google", "外贸通", "LinkedIn", "Facebook", "展会", "转介绍", "网站询盘", "老客户", "其他"]],
        ["procurementPain", "采购特点/痛点", "textarea"], ["paymentHabit", "付款习惯", "text"], ["logisticsHabit", "物流习惯", "text"], ["priceSensitivity", "价格敏感度", "select", false, ["高", "中", "低", "未知"]],
        ["lastContact", "最后联系", "date"], ["nextFollowUp", "下次跟进", "date"], ["notes", "备注", "textarea"]
    ],
    communication: [
        ["clientId", "客户", "client", true], ["contactEmail", "本次联系邮箱", "clientEmail", false], ["date", "沟通日期", "date", true], ["channel", "渠道", "select", true, ["Email", "WhatsApp", "Telegram", "LinkedIn", "Facebook", "电话", "其他"]],
        ["direction", "方向", "select", false, ["我联系客户", "客户回复", "双向沟通", "邮件退信"]], ["subject", "主题/简述", "text"], ["content", "沟通内容", "textarea", true],
        ["feedbackType", "反馈类型", "select", false, ["无回复", "价格高/目标价", "交期问题", "无库存", "品牌不接受", "需要样品", "样品测试", "等待项目", "已有供应商", "付款条件", "物流问题", "暂时无需求", "拒绝", "成交信号", "其他"]], ["customerFeedback", "客户反馈", "textarea"], ["nextAction", "下一步", "text"], ["nextFollowUp", "下次跟进", "date"]
    ],
    rfq: [
        ["clientId", "客户", "client", true], ["rfqNo", "RFQ编号/主题", "text", true], ["requestDate", "收到询价日期", "date", true], ["itemCount", "型号/项目数量", "number"], ["parts", "主要型号（可多行/逗号分隔）", "textarea"], ["sourceFile", "原始RFQ文件名/链接", "text"], ["status", "状态", "select", false, ["待报价", "找货中", "部分报价", "已全部报价", "等待客户反馈", "客户取消", "已结束"]], ["customerNeed", "客户需求/重点", "textarea"], ["nextFollowUp", "下次跟进", "date"], ["notes", "备注", "textarea"]
    ],
    quote: [
        ["clientId", "客户", "client", true], ["partNo", "型号", "text", true], ["brand", "品牌", "text"], ["qty", "数量", "text"], ["targetPrice", "Target Price", "text"], ["quotePrice", "报价", "text"],
        ["status", "状态", "select", false, ["待报价", "找货中", "已报价", "等待回复", "客户议价", "重新报价", "已做PI", "成交", "丢单", "暂停"]],
        ["rfqNo", "关联RFQ编号", "text"], ["feedbackType", "客户反馈类型", "select", false, ["无回复", "价格高/目标价", "交期问题", "无库存", "品牌不接受", "等待项目", "已有供应商", "付款条件", "物流问题", "暂时无需求", "成交信号", "其他"]], ["lossReason", "丢单/未成交原因", "select", false, ["", "价格", "交期", "品牌/规格", "无货", "付款条件", "物流", "客户取消", "已有供应商", "项目暂停", "失联", "其他"]], ["quoteDate", "报价日期", "date"], ["nextFollowUp", "下次跟进", "date"], ["notes", "备注", "textarea"]
    ],
    order: [
        ["clientId", "客户", "client", true], ["piNo", "PI编号", "text", true], ["amount", "金额", "number"], ["currency", "币种", "select", false, ["USD", "EUR", "CNY", "TRY", "RUB"]],
        ["paymentTerms", "付款方式", "text"], ["depositDue", "定金/首付款应付", "number"], ["paidAmount", "已付金额", "number"], ["balanceDue", "待付余额", "number"], ["promisedPayDate", "承诺付款日期", "date"],
        ["paymentStatus", "付款状态", "select", false, ["未付款", "部分付款", "已付款", "退款/取消"]],
        ["orderStatus", "订单状态", "select", false, ["PI待确认", "PI待付款", "已付款", "备货中", "待出货", "已出货", "已完成", "暂停", "取消"]],
        ["piDate", "PI日期", "date"], ["deliveryDate", "交期", "date"], ["shippingMode", "运输方式", "select", false, ["DHL/UPS/FedEx", "客户货代/中国仓", "俄罗斯专线/货代", "空运", "海运", "客户自提", "其他"]], ["forwarder", "货代/承运商", "text"], ["chinaWarehouseDate", "交中国仓日期", "date"], ["internationalShipDate", "国际出运日期", "date"], ["shipping", "物流/渠道", "text"], ["tracking", "运单号", "text"], ["customsStatus", "清关状态", "text"], ["expectedArrival", "预计到达", "date"], ["receivedDate", "实际签收", "date"], ["notes", "备注", "textarea"]
    ],
    sample: [
        ["clientId", "客户", "client", true], ["partNo", "样品型号/名称", "text", true], ["qty", "样品数量", "text"],
        ["requestDate", "客户提出样品日期", "date"], ["deliveryMode", "交付方式", "select", false, ["直接寄客户", "寄客户货代/中国仓", "客户自提/其他"]],
        ["sentDate", "我司寄出日期", "date"], ["carrier", "国内物流/快递", "text"], ["tracking", "国内运单号", "text"],
        ["forwarderName", "客户货代/仓库名称", "text"], ["forwarderArrivalDate", "货代收货日期", "date"], ["consolidationDueDate", "预计集货/出运日期", "date"],
        ["internationalShipDate", "国际出运日期", "date"], ["internationalCarrier", "国际物流/渠道", "text"], ["internationalTracking", "国际运单号", "text"],
        ["status", "样品状态", "select", false, ["待确认", "待寄出", "已寄出", "运输中", "已交客户货代", "货代待集货", "等待客户安排出运", "已国际出运", "国际运输中", "已签收待测试", "测试中", "测试通过", "测试未通过", "已结束", "取消"]],
        ["expectedArrival", "预计客户收货日期", "date"], ["feedbackDueDate", "预计反馈日期", "date"], ["feedbackDate", "实际反馈日期", "date"],
        ["feedbackResult", "反馈结论", "select", false, ["待反馈", "满意/通过", "需改进", "失败/不通过", "暂无结论"]], ["feedback", "客户样品反馈", "textarea"],
        ["nextAction", "下一步", "text"], ["nextFollowUp", "下次跟进", "date"], ["notes", "备注", "textarea"]
    ],
    task: [["title", "任务名称", "text", true], ["priority", "优先级", "select", false, ["高", "普通", "低"]], ["dueDate", "到期日期", "date"], ["clientId", "关联客户", "client"], ["notes", "备注", "textarea"]],
    holiday: [["country", "国家", "text", true], ["name", "节日名称", "text", true], ["date", "日期", "date", true], ["remindDays", "提前提醒天数", "number"], ["notes", "备注", "textarea"]]
};
window.openForm = function (type, id, preset) {
    var _a;
    if (id === void 0) { id = null; }
    if (preset === void 0) { preset = {}; }
    editing = { type: type, id: id };
    var key = pathFor(type), existing = id ? state[key].find(function (x) { return x.id === id; }) || {} : __assign({}, preset);
    if (!id) {
        if (type === "client") {
            existing.grade = "C";
            existing.status = "新客户";
        }
        if (type === "communication") {
            existing.date = todayISO();
            existing.channel = "Email";
            existing.direction = "我联系客户";
            if (existing.clientId && !existing.contactEmail) {
                var cc = state.clients.find(function (x) { return x.id === existing.clientId; });
                existing.contactEmail = ((_a = currentContactInfo(cc || {}).current) === null || _a === void 0 ? void 0 : _a.email) || "";
            }
        }
        if (type === "rfq") {
            existing.requestDate = todayISO();
            existing.status = "待报价";
            existing.nextFollowUp = addDays(todayISO(), state.settings.rfqFollowDays || 2);
        }
        if (type === "quote") {
            existing.status = "待报价";
            existing.quoteDate = todayISO();
            existing.nextFollowUp = addDays(todayISO(), state.settings.quoteFollowDays);
        }
        if (type === "order") {
            existing.paymentStatus = "未付款";
            existing.orderStatus = "PI待付款";
            existing.piDate = todayISO();
            existing.currency = state.settings.currency;
        }
        if (type === "sample") {
            existing.requestDate = todayISO();
            existing.status = "待确认";
            existing.feedbackResult = "待反馈";
            existing.nextFollowUp = addDays(todayISO(), 3);
        }
        if (type === "task") {
            existing.priority = "普通";
            existing.dueDate = todayISO();
        }
        if (type === "holiday") {
            existing.remindDays = 7;
        }
    }
    if (type === "client") {
        existing.email = getClientEmails(existing, { includeNotes: true }).join("; ");
        var a = clientAssignment(existing);
        existing.salesProfile = [a.salesperson, a.company, a.email].filter(Boolean).join(" | ");
    }
    var names = { client: "客户", communication: "沟通记录", rfq: "RFQ/询价", quote: "报价", order: "PI / 订单", sample: "样品记录", task: "任务", holiday: "节假日" };
    $("formTitle").textContent = (id ? "编辑 " : "新增 ") + names[type];
    $("formFields").innerHTML = schemas[type].map(function (f) { return fieldHtml(f, existing[f[0]], existing); }).join("");
    $("formModal").classList.add("show");
    if (type === "communication") {
        var clientSel_1 = $("entityForm").querySelector('[name="clientId"]'), emailSel_1 = $("entityForm").querySelector('[name="contactEmail"]');
        var refreshEmails = function () { var _a; if (!emailSel_1)
            return; var cc = state.clients.find(function (x) { return x.id === (clientSel_1 === null || clientSel_1 === void 0 ? void 0 : clientSel_1.value); }), list = cc ? getClientContacts(cc, { includeNotes: true }) : [], cur = emailSel_1.value; emailSel_1.innerHTML = '<option value="">请选择邮箱</option>' + list.map(function (x) { return "<option value=\"".concat(esc(x.email), "\" ").concat(cur.toLowerCase() === x.email.toLowerCase() ? "selected" : "", ">").concat(esc(contactLabel(x)), "</option>"); }).join(""); if (!emailSel_1.value && cc)
            emailSel_1.value = ((_a = currentContactInfo(cc).current) === null || _a === void 0 ? void 0 : _a.email) || ""; };
        clientSel_1 === null || clientSel_1 === void 0 ? void 0 : clientSel_1.addEventListener("change", refreshEmails);
        refreshEmails();
    }
};
function fieldHtml(_a, val, context) {
    var _b = __read(_a, 5), key = _b[0], label = _b[1], type = _b[2], required = _b[3], opts = _b[4];
    if (context === void 0) { context = {}; }
    var req = required ? "required" : "";
    var c = "";
    if (type === "textarea")
        c = "<textarea name=\"".concat(key, "\" ").concat(req, ">").concat(esc(val || ""), "</textarea>");
    else if (type === "select")
        c = "<select name=\"".concat(key, "\" ").concat(req, ">").concat((opts || []).map(function (o) { return "<option ".concat(String(val) === String(o) ? "selected" : "", ">").concat(esc(o), "</option>"); }).join(""), "</select>");
    else if (type === "salesProfile") {
        var profiles = salesProfiles(), cur_1 = String(val || "").trim();
        var values = profiles.map(function (p) { return [p.salesperson, p.company, p.email].filter(Boolean).join(" | "); });
        var custom = cur_1 && !values.includes(cur_1) ? "<option value=\"".concat(esc(cur_1), "\" selected>").concat(esc(cur_1), "\uFF08\u73B0\u6709\uFF09</option>") : "";
        c = "<select name=\"".concat(key, "\" ").concat(req, "><option value=\"\">\u672A\u5206\u914D</option>").concat(custom).concat(values.map(function (v) { return "<option value=\"".concat(esc(v), "\" ").concat(cur_1 === v ? "selected" : "", ">").concat(esc(v), "</option>"); }).join(""), "</select><div class=\"item-meta\" style=\"margin-top:4px\">\u6CA1\u6709\u9009\u9879\u65F6\uFF0C\u8BF7\u5148\u5230\u201C\u8BBE\u7F6E \u2192 \u8DDF\u8FDB\u4E1A\u52A1\u5458 / \u6211\u65B9\u516C\u53F8\u201D\u914D\u7F6E\u3002</div>");
    }
    else if (type === "client")
        c = "<select name=\"".concat(key, "\" ").concat(req, "><option value=\"\">\u8BF7\u9009\u62E9\u5BA2\u6237</option>").concat(state.clients.map(function (x) { return "<option value=\"".concat(x.id, "\" ").concat(val === x.id ? "selected" : "", ">").concat(esc(x.company), " \u00B7 ").concat(esc(x.country || ""), "</option>"); }).join(""), "</select>");
    else if (type === "clientEmail") {
        var cc = state.clients.find(function (x) { return x.id === context.clientId; }), emails = cc ? getClientContacts(cc, { includeNotes: true }) : [];
        c = "<select name=\"".concat(key, "\" ").concat(req, "><option value=\"\">\u8BF7\u9009\u62E9\u90AE\u7BB1</option>").concat(emails.map(function (x) { return "<option value=\"".concat(esc(x.email), "\" ").concat(String(val).toLowerCase() === x.email.toLowerCase() ? "selected" : "", ">").concat(esc(contactLabel(x)), "</option>"); }).join(""), "</select>");
    }
    else
        c = "<input name=\"".concat(key, "\" type=\"").concat(type, "\" value=\"").concat(esc(val !== null && val !== void 0 ? val : ""), "\" ").concat(req, ">");
    return "<div class=\"field ".concat(type === "textarea" ? "full" : "", "\"><label>").concat(esc(label)).concat(required ? " *" : "", "</label>").concat(c, "</div>");
}
$("saveEntityBtn").addEventListener("click", saveEntity);
function saveEntity() {
    return __awaiter(this, void 0, void 0, function () {
        var form, wasEditing, original, fd, obj, _a, _b, _c, k, v, p, a, inf, base, key, r;
        var e_6, _d;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    form = $("entityForm");
                    if (!form.reportValidity())
                        return [2 /*return*/];
                    wasEditing = Boolean(editing.id), original = (editing.type && editing.id) ? ((_e = state[pathFor(editing.type)]) === null || _e === void 0 ? void 0 : _e.find(function (x) { return x.id === editing.id; })) || {} : {};
                    fd = new FormData(form), obj = {};
                    try {
                        for (_a = __values(fd.entries()), _b = _a.next(); !_b.done; _b = _a.next()) {
                            _c = __read(_b.value, 2), k = _c[0], v = _c[1];
                            obj[k] = v;
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                    if (editing.type === "order") {
                        obj.amount = Number(obj.amount || 0);
                        obj.depositDue = Number(obj.depositDue || 0);
                        obj.paidAmount = Number(obj.paidAmount || 0);
                        obj.balanceDue = Number(obj.balanceDue || 0);
                    }
                    if (editing.type === "rfq")
                        obj.itemCount = Number(obj.itemCount || 0);
                    if (editing.type === "holiday")
                        obj.remindDays = Number(obj.remindDays || 7);
                    if (editing.type === "client") {
                        p = parseSalesProfileLine(obj.salesProfile || "");
                        obj.ownerSalesperson = p.salesperson;
                        obj.ownerCompany = p.company;
                        obj.ownerEmail = p.email;
                        delete obj.salesProfile;
                        buildContactsFromEditedClient(obj, original);
                        canonicalizeClientCountry(obj);
                    }
                    if (editing.type !== "client" && obj.clientId) {
                        a = assignmentForClientId(obj.clientId);
                        obj.ownerSalesperson = obj.ownerSalesperson || a.salesperson;
                        obj.ownerCompany = obj.ownerCompany || a.company;
                        obj.ownerEmail = obj.ownerEmail || a.email;
                    }
                    if (editing.type === "communication") {
                        if (!obj.feedbackType)
                            obj.feedbackType = inferFeedbackType(obj.customerFeedback || obj.content || "");
                        inf = inferCommunicationNextStep(obj);
                        if (!String(obj.nextAction || "").trim())
                            obj.nextAction = inf.nextAction;
                        if (!String(obj.nextFollowUp || "").trim())
                            obj.nextFollowUp = inf.nextFollowUp;
                    }
                    if (editing.type === "sample") {
                        base = obj.internationalShipDate || obj.forwarderArrivalDate || obj.sentDate || obj.requestDate || todayISO();
                        if (!String(obj.nextAction || "").trim()) {
                            if (["已交客户货代", "货代待集货", "等待客户安排出运"].includes(obj.status))
                                obj.nextAction = "确认货代已收货，并等待客户集货/国际出运安排";
                            else if (["已国际出运", "国际运输中"].includes(obj.status))
                                obj.nextAction = "跟踪国际物流并确认客户签收";
                            else if (["已寄出", "运输中"].includes(obj.status)) {
                                obj.nextAction = obj.deliveryMode === "寄客户货代/中国仓" ? "确认客户货代是否已收货" : "确认样品是否签收";
                            }
                            else if (["已签收待测试", "测试中"].includes(obj.status))
                                obj.nextAction = "跟进样品测试结果";
                            else if (obj.status === "测试通过")
                                obj.nextAction = "询问批量需求并推进正式订单";
                            else if (obj.status === "测试未通过")
                                obj.nextAction = "确认失败原因并提供替代/改进方案";
                            else
                                obj.nextAction = "推进样品安排";
                        }
                        if (!String(obj.nextFollowUp || "").trim()) {
                            if (obj.feedbackDueDate)
                                obj.nextFollowUp = obj.feedbackDueDate;
                            else if (obj.expectedArrival)
                                obj.nextFollowUp = obj.expectedArrival;
                            else if (obj.consolidationDueDate)
                                obj.nextFollowUp = obj.consolidationDueDate;
                            else if (["已交客户货代", "货代待集货", "等待客户安排出运"].includes(obj.status))
                                obj.nextFollowUp = addDays(base, 7);
                            else
                                obj.nextFollowUp = addDays(base, 3);
                        }
                    }
                    sync("busy", "正在保存…");
                    key = pathFor(editing.type);
                    if (!editing.id) return [3 /*break*/, 2];
                    return [4 /*yield*/, updateDoc(doc(db, "users", currentUser.uid, key, editing.id), __assign(__assign({}, obj), { updatedAt: serverTimestamp() }))];
                case 1:
                    _f.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, addDoc(refCollection(key), __assign(__assign({}, obj), { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))];
                case 3:
                    r = _f.sent();
                    editing.id = r.id;
                    _f.label = 4;
                case 4:
                    if (editing.type === "client" && obj.country)
                        autoTrackCountriesFromNames([obj.country]).catch(console.warn);
                    if (!(editing.type === "communication" && obj.clientId)) return [3 /*break*/, 6];
                    return [4 /*yield*/, updateClientOutreachFromCommunication(obj, { isNew: !wasEditing })];
                case 5:
                    _f.sent();
                    _f.label = 6;
                case 6:
                    closeModal("formModal");
                    sync("ok", "已自动同步");
                    return [2 /*return*/];
            }
        });
    });
}
function updateClientOutreachFromCommunication(obj_1) {
    return __awaiter(this, arguments, void 0, function (obj, _a) {
        var c, info, contacts, wanted, idx, updates, limit, gap, ct;
        var _b;
        var _c = _a === void 0 ? {} : _a, _d = _c.isNew, isNew = _d === void 0 ? true : _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    c = state.clients.find(function (x) { return x.id === obj.clientId; });
                    if (!c)
                        return [2 /*return*/];
                    info = currentContactInfo(c);
                    contacts = info.contacts.map(function (x) { return (__assign({}, x)); });
                    wanted = (extractEmails(obj.contactEmail || "")[0] || ((_b = info.current) === null || _b === void 0 ? void 0 : _b.email) || "").toLowerCase();
                    idx = contacts.findIndex(function (x) { return x.email.toLowerCase() === wanted; });
                    if (idx < 0 && wanted) {
                        contacts.push(normalizeContactRecord({ email: wanted }));
                        idx = contacts.length - 1;
                    }
                    if (idx < 0 && contacts.length)
                        idx = 0;
                    updates = { lastContact: obj.date || todayISO(), updatedAt: serverTimestamp() };
                    if (obj.nextFollowUp)
                        updates.nextFollowUp = obj.nextFollowUp;
                    limit = Math.max(1, Number(state.settings.contactNoReplyLimit || 3)), gap = Math.max(1, Number(state.settings.contactFollowDays || 3));
                    if (idx >= 0) {
                        ct = __assign({}, contacts[idx]);
                        if (isNew && obj.direction === "我联系客户") {
                            ct.touchCount = (ct.touchCount || 0) + 1;
                            ct.noReplyCount = (ct.noReplyCount || 0) + 1;
                            ct.lastContact = obj.date || todayISO();
                            ct.nextFollowUp = obj.nextFollowUp || addDays(ct.lastContact, gap);
                            ct.status = ct.noReplyCount >= limit ? "最后一次已发送" : "开发中";
                            contacts[idx] = ct;
                            updates.contacts = contacts;
                            updates.currentContactEmail = ct.email;
                            updates.contactRotationStatus = "active";
                            updates.nextFollowUp = ct.nextFollowUp;
                            if (["新客户", ""].includes(c.status || ""))
                                updates.status = "已开发";
                        }
                        else if (isNew && ["客户回复", "双向沟通"].includes(obj.direction)) {
                            contacts = contacts.map(function (x, i) { return (__assign(__assign({}, x), { isPrimary: i === idx })); });
                            ct = __assign(__assign({}, contacts[idx]), { replied: true, invalid: false, isPrimary: true, status: "已回复", lastContact: obj.date || todayISO(), noReplyCount: 0 });
                            contacts[idx] = ct;
                            updates.contacts = contacts;
                            updates.currentContactEmail = ct.email;
                            updates.contactRotationStatus = "replied";
                            updates.status = "已回复";
                            if (!obj.nextFollowUp)
                                delete updates.nextFollowUp;
                            if (ct.name)
                                updates.contact = ct.name;
                            if (ct.title)
                                updates.title = ct.title;
                            if (ct.phone)
                                updates.phone = ct.phone;
                            if (ct.whatsapp)
                                updates.whatsapp = ct.whatsapp;
                        }
                        else if (isNew && obj.direction === "邮件退信") {
                            ct = __assign(__assign({}, ct), { invalid: true, replied: false, status: "无效", lastContact: obj.date || todayISO() });
                            contacts[idx] = ct;
                            updates.contacts = contacts;
                            updates.currentContactEmail = ct.email;
                            updates.contactRotationStatus = "waiting_switch";
                            updates.nextFollowUp = obj.date || todayISO();
                        }
                    }
                    return [4 /*yield*/, updateDoc(doc(db, "users", currentUser.uid, "clients", obj.clientId), updates)];
                case 1:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
}
window.recordOutreachTouch = function (clientId) { return __awaiter(void 0, void 0, void 0, function () { var c, info, n, next, a, obj; return __generator(this, function (_a) {
    switch (_a.label) {
        case 0:
            c = state.clients.find(function (x) { return x.id === clientId; });
            if (!c)
                return [2 /*return*/];
            info = currentContactInfo(c);
            if (!info.current) {
                alert("这个客户还没有可开发邮箱，请先编辑客户并添加邮箱。");
                return [2 /*return*/];
            }
            n = (info.current.touchCount || 0) + 1, next = addDays(todayISO(), Math.max(1, Number(state.settings.contactFollowDays || 3)));
            if (!confirm("记录" + outreachStepLabel(n, info.limit) + "？\n\n当前联系人：" + contactLabel(info.current) + "\n发送后系统将在 " + (state.settings.contactFollowDays || 3) + " 天后继续提醒；最后一次发送后也会先等待回复，不会立即切换联系人。"))
                return [2 /*return*/];
            sync("busy", "正在记录开发…");
            a = clientAssignment(c), obj = { clientId: clientId, date: todayISO(), channel: "Email", direction: "我联系客户", contactEmail: info.current.email, ownerSalesperson: a.salesperson, ownerCompany: a.company, ownerEmail: a.email, subject: outreachStepLabel(n, info.limit), content: "已向 " + info.current.email + " 发送" + outreachStepLabel(n, info.limit) + "邮件，等待客户回复。", nextAction: n >= info.limit ? "等待最后一次开发回复；到期仍无回复则切换下一联系人" : outreachStepLabel(n + 1, info.limit), nextFollowUp: next };
            return [4 /*yield*/, addDoc(refCollection("communications"), __assign(__assign({}, obj), { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }))];
        case 1:
            _a.sent();
            return [4 /*yield*/, updateClientOutreachFromCommunication(obj, { isNew: true })];
        case 2:
            _a.sent();
            sync("ok", "已自动同步");
            return [2 /*return*/];
    }
}); }); };
window.switchToNextContact = function (clientId) { return __awaiter(void 0, void 0, void 0, function () { var c, info, contacts, oldIdx, nextIdx, patch; return __generator(this, function (_a) {
    switch (_a.label) {
        case 0:
            c = state.clients.find(function (x) { return x.id === clientId; });
            if (!c)
                return [2 /*return*/];
            info = currentContactInfo(c);
            if (!info.current) {
                alert("没有可切换的联系人。");
                return [2 /*return*/];
            }
            if (!!info.next) return [3 /*break*/, 2];
            if (!confirm("\u8FD9\u5BB6\u516C\u53F8\u6CA1\u6709\u66F4\u591A\u53EF\u7528\u8054\u7CFB\u4EBA\u4E86\u3002\n\n\u662F\u5426\u6807\u8BB0\u4E3A\u201C\u6C89\u7761\u5BA2\u6237\u201D\uFF0C\u5E76\u5728 ".concat(state.settings.dormantDays || 30, " \u5929\u540E\u91CD\u65B0\u63D0\u9192\uFF1F")))
                return [2 /*return*/];
            return [4 /*yield*/, updateDoc(doc(db, "users", currentUser.uid, "clients", clientId), { contactRotationStatus: "completed", status: "沉睡客户", nextFollowUp: addDays(todayISO(), Number(state.settings.dormantDays || 30)), updatedAt: serverTimestamp() })];
        case 1:
            _a.sent();
            return [2 /*return*/];
        case 2:
            if (!confirm("\u5207\u6362\u5F00\u53D1\u8054\u7CFB\u4EBA\uFF1F\n\n\u5F53\u524D\uFF1A".concat(contactLabel(info.current), "\n\u4E0B\u4E00\u4F4D\uFF1A").concat(contactLabel(info.next))))
                return [2 /*return*/];
            contacts = info.contacts.map(function (x) { return (__assign({}, x)); }), oldIdx = info.index, nextIdx = contacts.findIndex(function (x) { return x.email.toLowerCase() === info.next.email.toLowerCase(); });
            if (oldIdx >= 0 && !contacts[oldIdx].replied && !contacts[oldIdx].invalid && contacts[oldIdx].status !== "".concat(info.limit, "\u6B21\u672A\u56DE\u590D"))
                contacts[oldIdx].status = "已切换";
            if (nextIdx >= 0 && contacts[nextIdx].status === "未开始")
                contacts[nextIdx].status = "开发中";
            patch = { contacts: contacts, currentContactEmail: info.next.email, contactRotationStatus: "active", nextFollowUp: todayISO(), updatedAt: serverTimestamp() };
            if (info.next.name)
                patch.contact = info.next.name;
            if (info.next.title)
                patch.title = info.next.title;
            if (info.next.phone)
                patch.phone = info.next.phone;
            if (info.next.whatsapp)
                patch.whatsapp = info.next.whatsapp;
            return [4 /*yield*/, updateDoc(doc(db, "users", currentUser.uid, "clients", clientId), patch)];
        case 3:
            _a.sent();
            return [2 /*return*/];
    }
}); }); };
window.setCurrentContact = function (clientId, encodedEmail) { return __awaiter(void 0, void 0, void 0, function () { var email, c, contacts, ct, patch; return __generator(this, function (_a) {
    switch (_a.label) {
        case 0:
            email = decodeURIComponent(encodedEmail || ""), c = state.clients.find(function (x) { return x.id === clientId; });
            if (!c)
                return [2 /*return*/];
            contacts = getClientContacts(c, { includeNotes: true }), ct = contacts.find(function (x) { return x.email.toLowerCase() === email.toLowerCase(); });
            if (!ct)
                return [2 /*return*/];
            patch = { contacts: contacts, currentContactEmail: ct.email, contactRotationStatus: ct.replied ? "replied" : "active", nextFollowUp: c.nextFollowUp || todayISO(), updatedAt: serverTimestamp() };
            if (ct.name)
                patch.contact = ct.name;
            if (ct.title)
                patch.title = ct.title;
            if (ct.phone)
                patch.phone = ct.phone;
            if (ct.whatsapp)
                patch.whatsapp = ct.whatsapp;
            return [4 /*yield*/, updateDoc(doc(db, "users", currentUser.uid, "clients", clientId), patch)];
        case 1:
            _a.sent();
            return [2 /*return*/];
    }
}); }); };
window.markContactInvalid = function (clientId, encodedEmail) { return __awaiter(void 0, void 0, void 0, function () { var email, c, contacts; return __generator(this, function (_a) {
    switch (_a.label) {
        case 0:
            email = decodeURIComponent(encodedEmail || ""), c = state.clients.find(function (x) { return x.id === clientId; });
            if (!c)
                return [2 /*return*/];
            if (!confirm("\u628A ".concat(email, " \u6807\u8BB0\u4E3A\u65E0\u6548/\u9000\u4FE1\uFF0C\u5E76\u63D0\u793A\u5207\u6362\u4E0B\u4E00\u8054\u7CFB\u4EBA\u5417\uFF1F")))
                return [2 /*return*/];
            contacts = getClientContacts(c, { includeNotes: true }).map(function (x) { return x.email.toLowerCase() === email.toLowerCase() ? __assign(__assign({}, x), { invalid: true, replied: false, status: "无效", lastContact: todayISO() }) : x; });
            return [4 /*yield*/, updateDoc(doc(db, "users", currentUser.uid, "clients", clientId), { contacts: contacts, currentContactEmail: email, contactRotationStatus: "waiting_switch", nextFollowUp: todayISO(), updatedAt: serverTimestamp() })];
        case 1:
            _a.sent();
            return [2 /*return*/];
    }
}); }); };
window.markCurrentContactInvalid = function (clientId) {
    var c = state.clients.find(function (x) { return x.id === clientId; });
    if (!c) return;
    var rot = currentContactInfo(c);
    if (!rot.current) { alert("这个客户没有可标记的当前邮箱。"); return; }
    return markContactInvalid(clientId, encodeURIComponent(rot.current.email));
};
window.recordCurrentContactReply = function (clientId) {
    var c = state.clients.find(function (x) { return x.id === clientId; });
    if (!c) return;
    var rot = currentContactInfo(c);
    if (!rot.current) { alert("这个客户没有当前联系人。"); return; }
    openContactCommunication(clientId, encodeURIComponent(rot.current.email), "客户回复");
};
window.postponeClientFollowup = function (clientId) { return __awaiter(void 0, void 0, void 0, function () {
    var c, days, due, contacts, rot, idx;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                c = state.clients.find(function (x) { return x.id === clientId; });
                if (!c) return [2 /*return*/];
                days = Number(prompt("延后几天提醒？\n\n例如输入 3，表示 3 天后重新出现在跟进中心。", "3"));
                if (!Number.isFinite(days) || days < 1 || days > 365) return [2 /*return*/];
                due = addDays(todayISO(), Math.floor(days));
                contacts = getClientContacts(c, { includeNotes: true }).map(function (x) { return (__assign({}, x)); });
                rot = currentContactInfo(c);
                idx = rot.current ? contacts.findIndex(function (x) { return x.email.toLowerCase() === rot.current.email.toLowerCase(); }) : -1;
                if (idx >= 0) contacts[idx].nextFollowUp = due;
                return [4 /*yield*/, updateDoc(doc(db, "users", currentUser.uid, "clients", clientId), { contacts: contacts, nextFollowUp: due, updatedAt: serverTimestamp() })];
            case 1:
                _a.sent(); sync("ok", "已延后到 " + due); return [2 /*return*/];
        }
    });
}); };
window.openContactCommunication = function (clientId, encodedEmail, direction) {
    if (direction === void 0) { direction = "我联系客户"; }
    var email = decodeURIComponent(encodedEmail || "");
    openForm("communication", null, { clientId: clientId, contactEmail: email, direction: direction });
};
window.removeEntity = function (type, id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!confirm("确定删除这条记录吗？"))
                    return [2 /*return*/];
                return [4 /*yield*/, deleteDoc(doc(db, "users", currentUser.uid, pathFor(type), id))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
window.toggleTask = function (id, val) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, updateDoc(doc(db, "users", currentUser.uid, "tasks", id), { done: val, updatedAt: serverTimestamp() })];
}); }); };
// ============================================================
// 9. 客户详情、时间轴、报价历史、附件
// ============================================================
window.openClient = function (id) {
    currentClientId = id;
    renderClientDetail();
    $("clientModal").classList.add("show");
};
window.openLinked = function (type, id) {
    if (type === "client")
        return openClient(id);
    var key = pathFor(type), x = state[key].find(function (v) { return v.id === id; });
    if (x === null || x === void 0 ? void 0 : x.clientId)
        return openClient(x.clientId);
};
document.querySelectorAll(".tab").forEach(function (b) { return b.addEventListener("click", function () {
    var _a;
    document.querySelectorAll(".tab").forEach(function (x) { return x.classList.remove("active"); });
    document.querySelectorAll(".pane").forEach(function (x) { return x.classList.remove("active"); });
    b.classList.add("active");
    (_a = document.querySelector("[data-pane=\"".concat(b.dataset.tab, "\"]"))) === null || _a === void 0 ? void 0 : _a.classList.add("active");
}); });
function clientQuoteGroups(quotes) {
    var groups = new Map();
    quotes.forEach(function (q) {
        var _a;
        var batch = Array.isArray(q.items) && q.items.length;
        var source = batch ? (q.sourceFile || q.batchName || '批量报价') : (q.partNo || q.id);
        var key = "".concat(q.quoteDate || '', "||").concat(source);
        if (!groups.has(key))
            groups.set(key, { key: key, date: q.quoteDate || '', source: source, quotes: [], items: [], status: [], priced: 0 });
        var g = groups.get(key);
        g.quotes.push(q);
        g.status.push(q.status || '');
        if (batch) {
            (_a = g.items).push.apply(_a, __spreadArray([], __read(q.items), false));
            g.priced += q.items.filter(function (i) { return i.quotePrice; }).length;
        }
        else {
            g.items.push({ partNo: q.partNo, brand: q.brand, qty: q.qty, targetPrice: q.targetPrice, quotePrice: q.quotePrice, currency: q.currency, dc: q.dc, leadTime: q.leadTime, notes: q.notes });
            if (q.quotePrice)
                g.priced++;
        }
    });
    return __spreadArray([], __read(groups.values()), false).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
}
window.openClientQuoteGroup = function (clientId, encodedKey) {
    var key = decodeURIComponent(encodedKey || '');
    var quotes = state.quotes.filter(function (x) { return x.clientId === clientId; });
    var g = clientQuoteGroups(quotes).find(function (x) { return x.key === key; });
    if (!g)
        return;
    $('quoteBatchTitle').textContent = g.source || '报价明细';
    $('quoteBatchSub').textContent = "".concat(clientName(clientId), " \u00B7 ").concat(fmtDate(g.date), " \u00B7 ").concat(g.items.length, " \u4E2A\u578B\u53F7");
    $('quoteBatchBody').innerHTML = "<div class=\"notice\">\u5BA2\u6237\u8BE6\u60C5\u53EA\u663E\u793A\u62A5\u4EF7\u6458\u8981\uFF1B\u8FD9\u91CC\u6309\u9700\u8981\u67E5\u770B\u578B\u53F7\u660E\u7EC6\u3002</div><div class=\"table-wrap\"><table><thead><tr><th>#</th><th>\u578B\u53F7</th><th>\u54C1\u724C</th><th>\u6570\u91CF</th><th>Target Price</th><th>\u62A5\u4EF7</th><th>\u5E01\u79CD</th><th>DC</th><th>\u4EA4\u671F</th><th>\u5907\u6CE8</th></tr></thead><tbody>".concat(g.items.map(function (x, i) { return "<tr><td>".concat(i + 1, "</td><td><b>").concat(esc(x.partNo || ''), "</b></td><td>").concat(esc(x.brand || ''), "</td><td>").concat(esc(x.qty || ''), "</td><td>").concat(esc(x.targetPrice || ''), "</td><td>").concat(esc(x.quotePrice || ''), "</td><td>").concat(esc(x.currency || ''), "</td><td>").concat(esc(x.dc || ''), "</td><td>").concat(esc(x.leadTime || ''), "</td><td>").concat(esc(x.notes || ''), "</td></tr>"); }).join(''), "</tbody></table></div>");
    $('quoteBatchModal').classList.add('show');
};
function renderClientDetail() {
    var _a, _b, _c, _d, _e, _f;
    var c = state.clients.find(function (x) { return x.id === currentClientId; });
    if (!c)
        return;
    var rfqs = state.rfqs.filter(function (x) { return x.clientId === c.id; }).sort(function (a, b) { return (b.requestDate || "").localeCompare(a.requestDate || ""); });
    var comms = state.communications.filter(function (x) { return x.clientId === c.id; }).sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    var quotes = state.quotes.filter(function (x) { return x.clientId === c.id; }).sort(function (a, b) { return (b.quoteDate || "").localeCompare(a.quoteDate || ""); });
    var orders = state.orders.filter(function (x) { return x.clientId === c.id; }).sort(function (a, b) { return (b.piDate || "").localeCompare(a.piDate || ""); });
    var samples = state.samples.filter(function (x) { return x.clientId === c.id; }).sort(function (a, b) { return (b.sentDate || b.requestDate || "").localeCompare(a.sentDate || a.requestDate || ""); });
    var files = state.files.filter(function (x) { return x.clientId === c.id; }).sort(function (a, b) { return (b.createdDate || "").localeCompare(a.createdDate || ""); });
    $("clientTitle").textContent = c.company || "客户详情";
    var clientEmails = getClientEmails(c, { includeNotes: true }), rot = currentContactInfo(c), current = rot.current;
    $("clientSub").textContent = [c.country, c.city, (current === null || current === void 0 ? void 0 : current.name) || c.contact, (current === null || current === void 0 ? void 0 : current.email) || clientEmails[0]].filter(Boolean).join(" · ");
    var rotationText = rot.pending ? (rot.next ? "\u5EFA\u8BAE\u5207\u6362\u5230\uFF1A".concat(contactLabel(rot.next)) : "所有联系人已开发完，建议转沉睡客户") : (current ? "\u5F53\u524D\uFF1A".concat(contactLabel(current), " \u00B7 \u5DF2\u8054\u7CFB ").concat(current.touchCount || 0, "/").concat(rot.limit, " \u6B21") : "尚未设置开发联系人");
    var currentStage = orders.find(function (x) { return !["已完成", "取消"].includes(x.orderStatus); }) ? "PI/订单" : samples.find(function (x) { return !["测试通过", "测试未通过", "已结束", "取消"].includes(x.status); }) ? "样品" : quotes.find(function (x) { return !["成交", "丢单", "暂停"].includes(x.status); }) ? "报价后跟进" : rfqs.find(function (x) { return !["已全部报价", "客户取消", "已结束"].includes(x.status); }) ? "RFQ处理" : comms.length ? "开发/沟通" : "新客户";
    var nextRec = recommendNextStep(c.id);
    $("clientOverview").innerHTML = "<div class=\"summary-box\"><div class=\"card-head\"><h3>\u5BA2\u6237\u5F53\u524D\u72B6\u6001\u6458\u8981</h3>".concat(badge(c.grade ? "".concat(c.grade, "\u7EA7\u5BA2\u6237") : "未评级", c.grade === "A" ? "red" : c.grade === "B" ? "orange" : "green"), "</div><div class=\"summary-grid\"><div class=\"summary-kpi\"><div class=\"k\">\u5F53\u524D\u9636\u6BB5</div><div class=\"v\">").concat(esc(currentStage), "</div></div><div class=\"summary-kpi\"><div class=\"k\">\u5F53\u524D\u8054\u7CFB\u4EBA</div><div class=\"v\">").concat(esc(contactLabel(current) || "—"), "</div></div><div class=\"summary-kpi\"><div class=\"k\">\u6700\u8FD1\u52A8\u4F5C</div><div class=\"v\">").concat(esc((((_a = comms[0]) === null || _a === void 0 ? void 0 : _a.subject) || ((_b = quotes[0]) === null || _b === void 0 ? void 0 : _b.batchName) || ((_c = quotes[0]) === null || _c === void 0 ? void 0 : _c.partNo) || ((_d = rfqs[0]) === null || _d === void 0 ? void 0 : _d.rfqNo) || ((_e = samples[0]) === null || _e === void 0 ? void 0 : _e.partNo) || "暂无").slice(0, 60)), "</div></div><div class=\"summary-kpi\"><div class=\"k\">\u4E0B\u4E00\u6B65</div><div class=\"v\">").concat(esc(nextRec.title), "</div></div></div></div><div class=\"grid cols-2\"><div class=\"card\"><div class=\"item-meta\">\u57FA\u672C\u8D44\u6599</div><h3>").concat(esc(c.company || ""), "</h3><div class=\"item-meta\">\u56FD\u5BB6\uFF1A").concat(esc(c.country || "—"), " \u00B7 \u7B49\u7EA7\uFF1A").concat(esc(c.grade || "—"), " \u00B7 \u72B6\u6001\uFF1A").concat(esc(c.status || "—"), "</div><div class=\"item-meta\"><b>\u8DDF\u8FDB\u5F52\u5C5E\uFF1A</b>").concat(esc(assignmentLabel(c)), "</div><div class=\"item-meta\">\u90AE\u7BB1\uFF1A").concat(clientEmails.length ? clientEmails.map(function (e) { return esc(e); }).join("；") : "—", " \u00B7 WhatsApp\uFF1A").concat(esc(c.whatsapp || "—"), "</div></div><div class=\"card\"><div class=\"item-meta\">\u8054\u7CFB\u4EBA\u5F00\u53D1\u72B6\u6001</div><h3>").concat(esc(rotationText), "</h3><div class=\"item-meta\">\u6700\u540E\u8054\u7CFB\uFF1A").concat(fmtDate(c.lastContact), " \u00B7 \u4E0B\u6B21\u8DDF\u8FDB\uFF1A").concat(fmtDate(c.nextFollowUp), "</div><div style=\"margin-top:8px;display:flex;gap:7px;flex-wrap:wrap\"><button class=\"btn small primary\" onclick=\"openForm('communication',null,{clientId:'").concat(c.id, "'})\">\u8BB0\u5F55\u6C9F\u901A</button>").concat(current && !current.replied && !current.invalid ? " <button class=\"btn small\" onclick=\"recordOutreachTouch('".concat(c.id, "')\">\uFF0B\u8BB0\u5F55\u4E00\u6B21\u5F00\u53D1</button>") : "").concat(rot.pending ? " <button class=\"btn small danger\" onclick=\"switchToNextContact('".concat(c.id, "')\">\u27A1 \u5207\u6362\u4E0B\u4E00\u8054\u7CFB\u4EBA</button>") : "", " <button class=\"btn small\" onclick=\"openForm('rfq',null,{clientId:'").concat(c.id, "'})\">\u65B0\u589ERFQ</button> <button class=\"btn small\" onclick=\"openForm('quote',null,{clientId:'").concat(c.id, "'})\">\u65B0\u589E\u62A5\u4EF7</button></div></div></div>");
    var contactRows = rot.contacts.map(function (ct, i) { var currentFlag = i === rot.index, cls = currentFlag ? "current" : ct.replied ? "replied" : ct.invalid ? "invalid" : "", st = ct.replied ? "已回复" : ct.invalid ? "无效" : ct.status || "未开始", encoded = encodeURIComponent(ct.email); return "<div class=\"contact-row ".concat(cls, "\"><div class=\"contact-row-head\"><div><div class=\"contact-email\">").concat(esc(ct.email), " ").concat(currentFlag ? badge("当前", "green") : "", " ").concat(ct.isPrimary ? badge("主要联系人", "green") : "", "</div><div class=\"contact-meta\">").concat(esc([ct.name, ct.title].filter(Boolean).join(" · ") || "未填写姓名/职位"), "<br>\u5DF2\u8054\u7CFB ").concat(ct.touchCount || 0, " \u6B21 \u00B7 \u8FDE\u7EED\u672A\u56DE\u590D ").concat(ct.noReplyCount || 0, " \u6B21 \u00B7 \u6700\u540E\u8054\u7CFB ").concat(fmtDate(ct.lastContact), "</div></div><div>").concat(badge(st, ct.replied ? "green" : ct.invalid || ct.noReplyCount >= rot.limit ? "red" : "orange"), "</div></div><div class=\"contact-actions\">").concat(!currentFlag && !ct.invalid && !ct.replied ? "<button class=\"btn small\" onclick=\"setCurrentContact('".concat(c.id, "','").concat(encoded, "')\">\u8BBE\u4E3A\u5F53\u524D</button>") : "", "<button class=\"btn small\" onclick=\"openContactCommunication('").concat(c.id, "','").concat(encoded, "','\u6211\u8054\u7CFB\u5BA2\u6237')\">\u8BB0\u5F55\u6C9F\u901A</button>").concat(!ct.replied ? "<button class=\"btn small\" onclick=\"openContactCommunication('".concat(c.id, "','").concat(encoded, "','\u5BA2\u6237\u56DE\u590D')\">\u8BB0\u5F55\u56DE\u590D</button>") : "").concat(!ct.invalid && !ct.replied ? "<button class=\"btn small danger\" onclick=\"markContactInvalid('".concat(c.id, "','").concat(encoded, "')\">\u9000\u4FE1/\u65E0\u6548</button>") : "", "</div></div>"); }).join("");
    $("clientContacts").innerHTML = "<div class=\"contact-workflow\"><div class=\"contact-summary\"><div class=\"contact-kpi\"><div class=\"k\">\u5F53\u524D\u5F00\u53D1\u8054\u7CFB\u4EBA</div><div class=\"v\">".concat(rot.current ? "".concat(rot.index + 1, "/").concat(rot.contacts.length) : "0/0", "</div></div><div class=\"contact-kpi\"><div class=\"k\">\u5F53\u524D\u90AE\u7BB1</div><div class=\"v\">").concat(esc(((_f = rot.current) === null || _f === void 0 ? void 0 : _f.email) || "—"), "</div></div><div class=\"contact-kpi\"><div class=\"k\">\u5F53\u524D\u8054\u7CFB\u6B21\u6570</div><div class=\"v\">").concat(rot.current ? "".concat(rot.current.touchCount || 0, "/").concat(rot.limit) : "—", "</div></div><div class=\"contact-kpi\"><div class=\"k\">\u4E0B\u4E00\u8054\u7CFB\u4EBA</div><div class=\"v\">").concat(esc(rot.next ? contactLabel(rot.next) : "—"), "</div></div></div>").concat(rot.pending ? "<div class=\"rotation-alert high\">\u26A0\uFE0F ".concat(esc(rot.reason), "\u3002").concat(rot.next ? "\u5EFA\u8BAE\u5207\u6362\u5230\u4E0B\u4E00\u8054\u7CFB\u4EBA\uFF1A".concat(esc(contactLabel(rot.next))) : "\u8BE5\u516C\u53F8\u5168\u90E8\u53EF\u7528\u8054\u7CFB\u4EBA\u5DF2\u5F00\u53D1\u5B8C\uFF0C\u5EFA\u8BAE\u8FDB\u5165\u6C89\u7761\u5BA2\u6237\uFF0C\u7A0D\u540E\u518D\u6B21\u5F00\u53D1\u3002", "<div style=\"margin-top:8px\"><button class=\"btn small primary\" onclick=\"switchToNextContact('").concat(c.id, "')\">").concat(rot.next ? "切换下一联系人" : "转为沉睡客户", "</button></div></div>") : "<div class=\"rotation-alert\">\u5F00\u53D1\u89C4\u5219\uFF1A\u540C\u4E00\u8054\u7CFB\u4EBA\u8FDE\u7EED\u8054\u7CFB ".concat(rot.limit, " \u6B21\u4ECD\u65E0\u56DE\u590D\u65F6\uFF0C\u9996\u9875\u548C\u8DDF\u8FDB\u4E2D\u5FC3\u4F1A\u63D0\u9192\u4F60\u5207\u6362\u4E0B\u4E00\u8054\u7CFB\u4EBA\uFF1B\u4EFB\u4F55\u8054\u7CFB\u4EBA\u56DE\u590D\u540E\uFF0C\u505C\u6B62\u8F6E\u6362\u5E76\u628A\u56DE\u590D\u4EBA\u8BBE\u4E3A\u4E3B\u8981\u8054\u7CFB\u4EBA\u3002</div>"), "<div>").concat(contactRows || empty("暂无邮箱。请编辑客户添加多个邮箱，或从 Excel 导入联系人。"), "</div></div>");
    var events = [];
    rfqs.forEach(function (x) { return events.push({ date: x.requestDate, kind: "RFQ", title: "".concat(x.rfqNo || "询价", " \u00B7 ").concat(x.status || ""), desc: "".concat(x.itemCount || 0, "\u9879\uFF1B").concat(x.customerNeed || x.notes || "") }); });
    comms.forEach(function (x) { return events.push({ date: x.date, kind: x.channel || "沟通", title: x.subject || x.direction || "沟通", desc: x.content || "" }); });
    quotes.forEach(function (x) { var batch = Array.isArray(x.items) && x.items.length; events.push({ date: x.quoteDate, kind: "报价", title: batch ? "".concat(x.batchName || "批量报价", " \u00B7 ").concat(x.itemCount || x.items.length, "\u9879 \u00B7 ").concat(x.status || "") : "".concat(x.partNo || "型号", " \u00B7 ").concat(x.status || ""), desc: batch ? "Excel\u6279\u91CF\u62A5\u4EF7\uFF0C\u5171 ".concat(x.itemCount || x.items.length, " \u4E2A\u578B\u53F7\uFF1B").concat(x.priceSummary || x.quotePrice || "") : "\u6570\u91CF\uFF1A".concat(x.qty || "—", "\uFF1B\u62A5\u4EF7\uFF1A").concat(x.quotePrice || "—") }); });
    orders.forEach(function (x) { return events.push({ date: x.piDate, kind: "PI/订单", title: "".concat(x.piNo || "PI", " \u00B7 ").concat(x.orderStatus || ""), desc: "\u91D1\u989D\uFF1A".concat(x.amount || 0, " ").concat(x.currency || state.settings.currency, "\uFF1B\u4ED8\u6B3E\uFF1A").concat(x.paymentStatus || "—") }); });
    samples.forEach(function (x) { return events.push({ date: x.feedbackDate || x.internationalShipDate || x.forwarderArrivalDate || x.sentDate || x.requestDate, kind: "样品", title: "".concat(x.partNo || x.itemName || "样品", " \u00B7 ").concat(x.status || ""), desc: "\u6570\u91CF\uFF1A".concat(x.qty || "—", "\uFF1B\u65B9\u5F0F\uFF1A").concat(x.deliveryMode || "—", "\uFF1B\u6211\u53F8\u5BC4\u51FA\uFF1A").concat(fmtDate(x.sentDate)).concat(x.forwarderArrivalDate ? "\uFF1B\u8D27\u4EE3\u6536\u8D27\uFF1A".concat(fmtDate(x.forwarderArrivalDate)) : "").concat(x.internationalShipDate ? "\uFF1B\u56FD\u9645\u51FA\u8FD0\uFF1A".concat(fmtDate(x.internationalShipDate)) : "", "\uFF1B\u53CD\u9988\uFF1A").concat(x.feedbackResult || "待反馈").concat(x.feedback ? "\uFF1B".concat(x.feedback) : "") }); });
    events.sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    $("clientTimeline").innerHTML = events.length ? "<div class=\"timeline\">".concat(events.map(function (e) { return "<div class=\"tl\"><div class=\"date\">".concat(fmtDate(e.date), " \u00B7 ").concat(esc(e.kind), "</div><div class=\"title\">").concat(esc(e.title), "</div><div class=\"desc\">").concat(esc(e.desc), "</div></div>"); }).join(""), "</div>") : empty("暂无历史。");
    $("clientComms").innerHTML = comms.length ? comms.map(function (x) { return "<div class=\"item\"><div class=\"item-title\">".concat(esc(x.channel || "沟通"), " \u00B7 ").concat(esc(x.direction || ""), "</div><div class=\"item-meta\">").concat(fmtDate(x.date), " \u00B7 ").concat(esc(x.contactEmail || ""), " \u00B7 ").concat(esc(x.subject || "")).concat(x.feedbackType ? " \u00B7 ".concat(esc(x.feedbackType)) : "", "</div><div class=\"item-meta\">").concat(esc(x.content || ""), "</div><div style=\"margin-top:6px\"><button class=\"btn small\" onclick=\"openForm('communication','").concat(x.id, "')\">\u7F16\u8F91</button> <button class=\"btn small danger\" onclick=\"removeEntity('communication','").concat(x.id, "')\">\u5220\u9664</button></div></div>"); }).join("") : empty("暂无沟通历史。");
    $("addCommBtn").onclick = function () { var _a; return openForm("communication", null, { clientId: c.id, contactEmail: ((_a = currentContactInfo(c).current) === null || _a === void 0 ? void 0 : _a.email) || "" }); };
    $("clientRfqs").innerHTML = rfqs.length ? "<div class=\"card-head\"><h3>RFQ / \u8BE2\u4EF7\u8BB0\u5F55</h3><div class=\"item-meta\">\u53EA\u663E\u793A\u6458\u8981\uFF0C\u907F\u514D\u51E0\u767E\u4E2A\u578B\u53F7\u628A\u5BA2\u6237\u8BE6\u60C5\u94FA\u6EE1\u3002</div></div>".concat(rfqs.map(function (r) { return "<div class=\"item\"><div class=\"item-title\">".concat(esc(r.rfqNo || r.subject || "RFQ"), " ").concat(badge(r.status || "待处理", "orange"), "</div><div class=\"item-meta\">").concat(fmtDate(r.requestDate), " \u00B7 ").concat(r.itemCount || 0, " \u9879 \u00B7 ").concat(esc(r.sourceFile || ""), "</div><div class=\"item-meta\">").concat(esc(r.customerNeed || r.notes || ""), "</div><div style=\"margin-top:6px\"><button class=\"btn small\" onclick=\"openForm('rfq','").concat(r.id, "')\">\u7F16\u8F91</button></div></div>"); }).join("")) : empty("暂无 RFQ 记录。");
    var quoteGroups = clientQuoteGroups(quotes);
    $("clientQuotes").innerHTML = quoteGroups.length ? "<div class=\"card-head\"><h3>\u62A5\u4EF7\u8BB0\u5F55</h3><div class=\"item-meta\">\u5BA2\u6237\u8BE6\u60C5\u53EA\u6309\u201C\u54EA\u5929\u62A5\u4EF7\u4E86\u4EC0\u4E48\u201D\u663E\u793A\u6458\u8981\uFF0C\u578B\u53F7\u660E\u7EC6\u9700\u8981\u65F6\u518D\u5C55\u5F00\u3002</div></div><div>".concat(quoteGroups.map(function (g) { var parts = g.items.map(function (i) { return i.partNo; }).filter(Boolean); var preview = parts.slice(0, 4).join("、") + (parts.length > 4 ? " \u7B49 ".concat(parts.length, " \u4E2A\u578B\u53F7") : parts.length ? "" : "报价"); var st = __spreadArray([], __read(new Set(g.status.filter(Boolean))), false).join(" / ") || "—"; return "<div class=\"item\"><div class=\"item-title\">".concat(fmtDate(g.date), " \u00B7 ").concat(esc(g.source || "报价"), "</div><div class=\"item-meta\">").concat(esc(preview), " \u00B7 \u5171 ").concat(g.items.length, " \u9879 \u00B7 ").concat(g.priced, "/").concat(g.items.length, " \u9879\u5DF2\u6709\u62A5\u4EF7 \u00B7 ").concat(esc(st), "</div><div style=\"margin-top:6px\"><button class=\"btn small\" onclick=\"openClientQuoteGroup('").concat(c.id, "','").concat(encodeURIComponent(g.key).replace(/'/g, '%27'), "')\">\u67E5\u770B\u578B\u53F7\u660E\u7EC6</button></div></div>"); }).join(""), "</div>") : empty("暂无报价。");
    $("clientSamples").innerHTML = "<div class=\"card-head\"><h3>\u6837\u54C1\u8DDF\u8FDB</h3><button class=\"btn small primary\" onclick=\"openForm('sample',null,{clientId:'".concat(c.id, "'})\">\uFF0B \u65B0\u589E\u6837\u54C1</button></div>").concat(samples.length ? samples.map(function (x) { return "<div class=\"item\"><div class=\"item-title\">".concat(esc(x.partNo || x.itemName || "样品"), " \u00B7 ").concat(badge(x.status || "待确认", ["测试通过", "已结束"].includes(x.status) ? "green" : ["测试未通过", "取消"].includes(x.status) ? "red" : "orange"), "</div><div class=\"item-meta\">\u6570\u91CF\uFF1A").concat(esc(x.qty || "—"), " \u00B7 \u4EA4\u4ED8\u65B9\u5F0F\uFF1A").concat(esc(x.deliveryMode || "—"), " \u00B7 \u5BA2\u6237\u63D0\u51FA\uFF1A").concat(fmtDate(x.requestDate), "</div><div class=\"item-meta\">\u6211\u53F8\u5BC4\u51FA\uFF1A").concat(fmtDate(x.sentDate), " \u00B7 \u56FD\u5185\u7269\u6D41\uFF1A").concat(esc(x.carrier || "—"), " ").concat(esc(x.tracking || ""), "</div>").concat(x.deliveryMode === "寄客户货代/中国仓" || x.forwarderName || x.forwarderArrivalDate ? "<div class=\"item-meta\">\u5BA2\u6237\u8D27\u4EE3\uFF1A".concat(esc(x.forwarderName || "—"), " \u00B7 \u8D27\u4EE3\u6536\u8D27\uFF1A").concat(fmtDate(x.forwarderArrivalDate), " \u00B7 \u9884\u8BA1\u96C6\u8D27/\u51FA\u8FD0\uFF1A").concat(fmtDate(x.consolidationDueDate), "</div>") : "").concat(x.internationalShipDate || x.internationalCarrier || x.internationalTracking ? "<div class=\"item-meta\">\u56FD\u9645\u51FA\u8FD0\uFF1A".concat(fmtDate(x.internationalShipDate), " \u00B7 \u56FD\u9645\u7269\u6D41\uFF1A").concat(esc(x.internationalCarrier || "—"), " ").concat(esc(x.internationalTracking || ""), "</div>") : "", "<div class=\"item-meta\">\u9884\u8BA1\u5BA2\u6237\u6536\u8D27\uFF1A").concat(fmtDate(x.expectedArrival), " \u00B7 \u9884\u8BA1\u53CD\u9988\uFF1A").concat(fmtDate(x.feedbackDueDate), " \u00B7 \u7ED3\u679C\uFF1A").concat(esc(x.feedbackResult || "待反馈"), "</div>").concat(x.feedback ? "<div class=\"item-meta\" style=\"margin-top:4px\">\u5BA2\u6237\u53CD\u9988\uFF1A".concat(esc(x.feedback), "</div>") : "").concat(x.nextAction ? "<div class=\"item-meta\" style=\"margin-top:4px\"><b>\u4E0B\u4E00\u6B65\uFF1A</b>".concat(esc(x.nextAction)).concat(x.nextFollowUp ? " \u00B7 ".concat(fmtDate(x.nextFollowUp)) : "", "</div>") : "", "<div style=\"margin-top:6px\"><button class=\"btn small\" onclick=\"openForm('sample','").concat(x.id, "')\">\u7F16\u8F91/\u8BB0\u5F55\u53CD\u9988</button> <button class=\"btn small danger\" onclick=\"removeEntity('sample','").concat(x.id, "')\">\u5220\u9664</button></div></div>"); }).join("") : empty("暂无样品记录。可区分直接寄客户、寄客户货代/中国仓、集货等待、国际出运和测试反馈。"));
    $("clientFiles").innerHTML = files.length ? files.map(function (f) { return "<div class=\"item\"><div class=\"item-title\">".concat(esc(f.name || "附件链接"), "</div><div class=\"item-meta\">").concat(esc(f.category || "外部链接"), " \u00B7 ").concat(esc(f.url || ""), "</div><div style=\"margin-top:5px\"><a class=\"btn small\" href=\"").concat(esc(f.url), "\" target=\"_blank\" rel=\"noopener\">\u6253\u5F00</a> <button class=\"btn small danger\" onclick=\"removeFile('").concat(f.id, "')\">\u5220\u9664</button></div></div>"); }).join("") : empty("暂无附件链接。");
    $("addFileLinkBtn").onclick = addClientFileLink;
    var smart = renderSmartNextStep(c.id);
    $("saveSmartTaskBtn").onclick = function () { return saveSmartNextAsTask(c.id); };
    $("generateFollowupBtn").onclick = function () { return generateFollowup(c.id); };
    generateFollowup(c.id);
}
function addClientFileLink() {
    return __awaiter(this, void 0, void 0, function () {
        var name, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = $("clientFileName").value.trim();
                    url = $("clientFileUrl").value.trim();
                    if (!name) {
                        alert("请填写文件名称。");
                        return [2 /*return*/];
                    }
                    if (!/^https?:\/\//i.test(url)) {
                        alert("请填写完整的网址，例如 https://drive.google.com/...");
                        return [2 /*return*/];
                    }
                    sync("busy", "正在保存链接…");
                    return [4 /*yield*/, addDoc(refCollection("files"), {
                            clientId: currentClientId,
                            name: name,
                            url: url,
                            category: "外部附件链接",
                            createdDate: todayISO(), createdAt: serverTimestamp()
                        })];
                case 1:
                    _a.sent();
                    $("clientFileName").value = "";
                    $("clientFileUrl").value = "";
                    sync("ok", "已自动同步");
                    return [2 /*return*/];
            }
        });
    });
}
window.removeFile = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var f;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                f = state.files.find(function (x) { return x.id === id; });
                if (!f || !confirm("确定删除这个附件链接吗？"))
                    return [2 /*return*/];
                return [4 /*yield*/, deleteDoc(doc(db, "users", currentUser.uid, "files", id))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
function feedbackSignals(text) {
    if (text === void 0) { text = ""; }
    var s = normalizeLooseText(text);
    var has = function (arr) { return arr.some(function (x) { return s.includes(normalizeLooseText(x)); }); };
    return {
        price: has(["target price", "price", "expensive", "high price", "preço", "preco", "fiyat", "pahalı", "pahali", "цена", "дорого", "目标价", "价格", "太贵"]),
        later: has(["later", "next week", "next month", "contact later", "depois", "mais tarde", "sonra", "gelecek hafta", "позже", "потом", "следующей неделе", "以后", "下周", "下个月", "晚点", "稍后"]),
        noNeed: has(["no need", "not interested", "no demand", "não precisa", "nao precisa", "sem interesse", "ihtiyaç yok", "ihtiyac yok", "не нужно", "не интересно", "нет потребности", "不需要", "没需求", "暂时不需要"]),
        sample: has(["sample", "test", "testing", "trial", "amostra", "teste", "numune", "test etmek", "образец", "тест", "测试", "样品"]),
        payment: has(["payment", "pay", "transfer", "invoice", "ödeme", "odeme", "оплата", "платеж", "付款", "汇款"]),
        delivery: has(["lead time", "delivery", "stock", "shipment", "teslimat", "stok", "срок", "доставка", "налич", "交期", "库存", "物流", "发货"])
    };
}
function inferFeedbackType(text) {
    var s = String(text || "").toLowerCase();
    if (!s.trim())
        return "其他";
    if (/target|price|价格|贵|expensive/.test(s))
        return "价格高/目标价";
    if (/lead time|交期|delivery time|交货/.test(s))
        return "交期问题";
    if (/no stock|out of stock|无货|缺货/.test(s))
        return "无库存";
    if (/sample|样品|test|测试/.test(s))
        return "需要样品";
    if (/payment|付款|账期|deposit/.test(s))
        return "付款条件";
    if (/shipping|logistics|物流|货代|customs/.test(s))
        return "物流问题";
    if (/supplier|已有供应商|regular supplier/.test(s))
        return "已有供应商";
    if (/project.*pause|暂停|later|以后|稍后|next month/.test(s))
        return "等待项目";
    if (/no need|not needed|暂时不需要|没有需求/.test(s))
        return "暂时无需求";
    if (/order|po|pi|下单|采购|purchase/.test(s))
        return "成交信号";
    return "其他";
}
function inferCommunicationNextStep(obj) {
    var text = [obj.customerFeedback, obj.content, obj.subject].filter(Boolean).join(" ");
    var sig = feedbackSignals(text), base = obj.date || todayISO();
    if (obj.direction === "邮件退信")
        return { nextAction: "切换下一联系人", nextFollowUp: base };
    if (["客户回复", "双向沟通"].includes(obj.direction)) {
        if (sig.price)
            return { nextAction: "重新核价，并向客户确认目标价/可接受区间", nextFollowUp: addDays(base, 1) };
        if (sig.sample)
            return { nextAction: "跟进样品测试结果，并询问下一步批量需求", nextFollowUp: addDays(base, 3) };
        if (sig.payment)
            return { nextAction: "确认付款安排、付款凭证或内部审批进度", nextFollowUp: addDays(base, 1) };
        if (sig.delivery)
            return { nextAction: "核实库存/交期/物流后回复客户", nextFollowUp: addDays(base, 1) };
        if (sig.noNeed)
            return { nextAction: "转长期维护，避免频繁打扰", nextFollowUp: addDays(base, state.settings.dormantDays || 30) };
        if (sig.later)
            return { nextAction: "按客户要求稍后再联系", nextFollowUp: addDays(base, 7) };
        return { nextAction: "根据客户回复继续推进，确认具体需求/数量/目标价格", nextFollowUp: addDays(base, 2) };
    }
    return { nextAction: "等待回复；若无回复继续下一次开发", nextFollowUp: addDays(base, state.settings.contactFollowDays || 3) };
}
function recommendNextStep(clientId) {
    var c = state.clients.find(function (x) { return x.id === clientId; });
    if (!c)
        return { title: "暂无建议", reason: "没有找到客户资料。", dueDate: todayISO(), priority: "普通" };
    var comms = state.communications.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    var quotes = state.quotes.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.quoteDate || "").localeCompare(a.quoteDate || ""); });
    var orders = state.orders.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.piDate || "").localeCompare(a.piDate || ""); });
    var unpaid = orders.find(function (o) { return ["未付款", "部分付款"].includes(o.paymentStatus); });
    if (unpaid)
        return { title: "\u8DDF\u8FDB\u4ED8\u6B3E\uFF1A".concat(unpaid.piNo || "PI"), reason: "\u4ED8\u6B3E\u72B6\u6001\u4E3A\u201C".concat(unpaid.paymentStatus, "\u201D\u3002\u5148\u786E\u8BA4\u4ED8\u6B3E\u8BA1\u5212\u3001\u5BA1\u6279\u969C\u788D\u6216\u662F\u5426\u9700\u8981\u8865\u5145\u6587\u4EF6\u3002"), dueDate: todayISO(), priority: "高" };
    var samples = state.samples.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.sentDate || b.requestDate || "").localeCompare(a.sentDate || a.requestDate || ""); });
    var activeSample = samples.find(function (x) { return !["测试通过", "测试未通过", "已结束", "取消"].includes(x.status || ""); });
    if (activeSample) {
        var due = activeSample.nextFollowUp || activeSample.feedbackDueDate || activeSample.expectedArrival || activeSample.consolidationDueDate || todayISO();
        var what = activeSample.partNo || activeSample.itemName || "样品";
        var title = "\u8DDF\u8FDB\u6837\u54C1\uFF1A".concat(what), reason = "\u5F53\u524D\u6837\u54C1\u72B6\u6001\uFF1A".concat(activeSample.status || "待确认", "\u3002");
        if (["待确认", "待寄出"].includes(activeSample.status))
            reason += " 先确认样品数量、交付方式和寄出安排。";
        else if (["已寄出", "运输中"].includes(activeSample.status))
            reason += activeSample.deliveryMode === "寄客户货代/中国仓" ? " 先确认客户货代是否已收货，不要过早询问客户测试结果。" : " 查看物流并确认客户是否签收。";
        else if (["已交客户货代", "货代待集货", "等待客户安排出运"].includes(activeSample.status))
            reason += " \u6837\u54C1\u76EE\u524D\u5728\u5BA2\u6237\u8D27\u4EE3/\u4E2D\u56FD\u4ED3".concat(activeSample.forwarderName ? "\uFF08".concat(activeSample.forwarderName, "\uFF09") : "", "\u7B49\u5F85\u4E0E\u5176\u4ED6\u8D27\u7269\u96C6\u8D27\u3002\u6B64\u9636\u6BB5\u91CD\u70B9\u786E\u8BA4\u8D27\u4EE3\u6536\u8D27\u548C\u51FA\u8FD0\u8BA1\u5212\uFF0C\u4E0D\u5E94\u8BE2\u95EE\u5BA2\u6237\u662F\u5426\u6536\u5230\u6837\u54C1\u3002");
        else if (["已国际出运", "国际运输中"].includes(activeSample.status))
            reason += " 已进入国际运输，跟踪国际物流并确认最终签收。";
        else if (["已签收待测试", "测试中"].includes(activeSample.status))
            reason += " 客户已收到样品，到期后询问测试结果、问题点以及批量需求。";
        return { title: title, reason: reason, dueDate: due, priority: due <= todayISO() ? "高" : "普通" };
    }
    var latestFinishedSample = samples.find(function (x) { return ["测试通过", "测试未通过"].includes(x.status || ""); });
    if (latestFinishedSample && latestFinishedSample.feedbackDate) {
        if (latestFinishedSample.status === "测试通过")
            return { title: "\u6837\u54C1\u901A\u8FC7\uFF0C\u63A8\u8FDB\u6279\u91CF\u8BA2\u5355\uFF1A".concat(latestFinishedSample.partNo || "样品"), reason: "\u5BA2\u6237\u53CD\u9988\uFF1A".concat(latestFinishedSample.feedback || latestFinishedSample.feedbackResult || "测试通过", "\u3002\u5EFA\u8BAE\u786E\u8BA4\u6B63\u5F0F\u6570\u91CF\u3001\u76EE\u6807\u4EF7\u548C\u4EA4\u671F\u3002"), dueDate: addDays(latestFinishedSample.feedbackDate, 1), priority: "高" };
        if (latestFinishedSample.status === "测试未通过")
            return { title: "\u5904\u7406\u6837\u54C1\u95EE\u9898\uFF1A".concat(latestFinishedSample.partNo || "样品"), reason: "\u5BA2\u6237\u53CD\u9988\uFF1A".concat(latestFinishedSample.feedback || latestFinishedSample.feedbackResult || "测试未通过", "\u3002\u5148\u786E\u8BA4\u5931\u8D25\u73B0\u8C61\u3001\u6D4B\u8BD5\u6761\u4EF6\uFF0C\u518D\u8BC4\u4F30\u66FF\u4EE3\u6216\u91CD\u65B0\u9001\u6837\u3002"), dueDate: addDays(latestFinishedSample.feedbackDate, 1), priority: "高" };
    }
    var rot = currentContactInfo(c);
    if (rot.pending)
        return { title: rot.next ? "\u5207\u6362\u4E0B\u4E00\u8054\u7CFB\u4EBA\uFF1A".concat(contactLabel(rot.next)) : "转为沉睡客户", reason: rot.next ? "".concat(contactLabel(rot.current), " \u5DF2").concat(rot.reason, "\uFF0C\u7EE7\u7EED\u53D1\u540C\u4E00\u90AE\u7BB1\u610F\u4E49\u4E0D\u5927\u3002") : "\u73B0\u6709\u53EF\u7528\u8054\u7CFB\u4EBA\u5747\u5DF2\u5F00\u53D1\u5B8C\u6210\uFF0C\u5EFA\u8BAE ".concat(state.settings.dormantDays || 30, " \u5929\u540E\u91CD\u65B0\u68C0\u67E5\u3002"), dueDate: todayISO(), priority: "高" };
    var last = comms[0];
    if (last && ["客户回复", "双向沟通"].includes(last.direction)) {
        var inf = inferCommunicationNextStep(last);
        return { title: inf.nextAction, reason: "\u4F9D\u636E\u6700\u8FD1\u5BA2\u6237\u53CD\u9988\uFF1A".concat((last.customerFeedback || last.content || last.subject || "客户已回复").slice(0, 160)), dueDate: inf.nextFollowUp, priority: feedbackSignals([last.customerFeedback, last.content].join(" ")).noNeed ? "普通" : "高" };
    }
    var openRfq = state.rfqs.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.requestDate || "").localeCompare(a.requestDate || ""); })[0];
    if (openRfq && !["已全部报价", "客户取消", "已结束"].includes(openRfq.status || ""))
        return { title: "\u5904\u7406RFQ\uFF1A".concat(openRfq.rfqNo || "客户询价"), reason: "\u5F53\u524D\u72B6\u6001\uFF1A".concat(openRfq.status || "待报价", "\uFF0C\u5171 ").concat(openRfq.itemCount || 0, " \u9879\u3002\u5148\u5B8C\u6210\u627E\u8D27/\u62A5\u4EF7\uFF0C\u5E76\u8BB0\u5F55\u65E0\u6CD5\u62A5\u4EF7\u7684\u9879\u76EE\u539F\u56E0\u3002"), dueDate: openRfq.nextFollowUp || todayISO(), priority: "高" };
    var openQuote = quotes.find(function (q) { return !["成交", "丢单", "暂停"].includes(q.status); });
    if (openQuote) {
        var due = openQuote.nextFollowUp || (openQuote.quoteDate ? addDays(openQuote.quoteDate, state.settings.quoteFollowDays || 5) : todayISO());
        var desc = Array.isArray(openQuote.items) ? "".concat(openQuote.itemCount || openQuote.items.length, " \u4E2A\u578B\u53F7\u7684\u6279\u91CF\u62A5\u4EF7") : (openQuote.partNo || "最近报价");
        return { title: "\u8DDF\u8FDB\u62A5\u4EF7\uFF1A".concat(desc), reason: "先问客户对价格、交期、规格是否有反馈；如果价格敏感，优先索取 Target Price。", dueDate: due || todayISO(), priority: due && due <= todayISO() ? "高" : "普通" };
    }
    if (rot.current && (rot.current.touchCount || 0) > 0) {
        return { title: "\u7EE7\u7EED\u7B2C ".concat((rot.current.touchCount || 0) + 1, " \u6B21\u5F00\u53D1\uFF1A").concat(contactLabel(rot.current)), reason: "\u5F53\u524D\u8054\u7CFB\u4EBA\u5DF2\u8054\u7CFB ".concat(rot.current.touchCount || 0, "/").concat(rot.limit, " \u6B21\u4E14\u6682\u65E0\u56DE\u590D\u3002"), dueDate: rot.current.nextFollowUp || c.nextFollowUp || addDays(rot.current.lastContact || todayISO(), state.settings.contactFollowDays || 3), priority: "普通" };
    }
    return { title: "\u9996\u6B21\u5F00\u53D1\uFF1A".concat(contactLabel(rot.current) || c.company), reason: "暂无历史沟通，建议先做第一封简短开发邮件，并记录本次联系。", dueDate: todayISO(), priority: c.grade === "A" ? "高" : "普通" };
}
function renderSmartNextStep(clientId) {
    var n = recommendNextStep(clientId), box = $("smartNextAction");
    if (!box)
        return n;
    box.className = "smart-next " + (n.priority === "高" ? "high" : "");
    box.innerHTML = "<div class=\"title\">".concat(esc(n.title), "</div><div class=\"reason\">").concat(esc(n.reason), "<br><b>\u5EFA\u8BAE\u65E5\u671F\uFF1A</b>").concat(fmtDate(n.dueDate), " \u00B7 <b>\u4F18\u5148\u7EA7\uFF1A</b>").concat(esc(n.priority), "</div>");
    return n;
}
function saveSmartNextAsTask(clientId) {
    return __awaiter(this, void 0, void 0, function () {
        var n, exists;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    n = recommendNextStep(clientId);
                    exists = state.tasks.some(function (t) { return !t.done && t.clientId === clientId && t.title === n.title && t.dueDate === n.dueDate; });
                    if (exists)
                        return [2 /*return*/, alert("这条下一步任务已经存在，不重复创建。")];
                    return [4 /*yield*/, addDoc(refCollection("tasks"), { title: n.title, priority: n.priority === "高" ? "高" : "普通", dueDate: n.dueDate || todayISO(), clientId: clientId, notes: n.reason, source: "智能下一步", done: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })];
                case 1:
                    _a.sent();
                    alert("已把建议保存到任务中心。");
                    return [2 /*return*/];
            }
        });
    });
}
function generateFollowup(clientId) {
    var c = state.clients.find(function (x) { return x.id === clientId; }), comms = state.communications.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    var quotes = state.quotes.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.quoteDate || "").localeCompare(a.quoteDate || ""); });
    var orders = state.orders.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.piDate || "").localeCompare(a.piDate || ""); });
    var unpaid = orders.find(function (o) { return ["未付款", "部分付款"].includes(o.paymentStatus); });
    var openQuote = quotes.find(function (q) { return !["成交", "丢单", "暂停"].includes(q.status); });
    var samples = state.samples.filter(function (x) { return x.clientId === clientId; }).sort(function (a, b) { return (b.sentDate || b.requestDate || "").localeCompare(a.sentDate || a.requestDate || ""); });
    var activeSample = samples.find(function (x) { return !["测试通过", "测试未通过", "已结束", "取消"].includes(x.status || ""); });
    var rot = currentContactInfo(c), ct = rot.current, person = (ct === null || ct === void 0 ? void 0 : ct.name) || c.contact || "";
    var hello = person ? "Dear ".concat(person, ",") : "Dear Customer,", wh = person ? "Hi ".concat(person, ",") : "Hi,";
    var strategy, email, wa;
    if (activeSample) {
        var what = activeSample.partNo || activeSample.itemName || "sample";
        if (["已交客户货代", "货代待集货", "等待客户安排出运"].includes(activeSample.status)) {
            strategy = "\u5F53\u524D\u6837\u54C1 ".concat(what, " \u5DF2\u5230\u5BA2\u6237\u8D27\u4EE3/\u4E2D\u56FD\u4ED3\uFF0C\u6B63\u5728\u7B49\u5F85\u4E0E\u5BA2\u6237\u5176\u4ED6\u8D27\u7269\u96C6\u8D27\u3002\u6B64\u9636\u6BB5\u4E0D\u8981\u8BE2\u95EE\u5BA2\u6237\u6D4B\u8BD5\u7ED3\u679C\uFF0C\u91CD\u70B9\u786E\u8BA4\u8D27\u4EE3\u6536\u8D27\u53CA\u9884\u8BA1\u56FD\u9645\u51FA\u8FD0\u65F6\u95F4\u3002");
            email = "Subject: Sample shipment status \u2013 ".concat(what, "\n\n").concat(hello, "\n\nThe sample ").concat(what, " has been delivered to your forwarder / China warehouse").concat(activeSample.forwarderName ? " (".concat(activeSample.forwarderName, ")") : "", ".\n\nPlease let me know when it is planned to be consolidated with your other goods and shipped internationally. We will keep following the shipment status from our side.\n\nBest regards");
            wa = "".concat(wh, " The sample ").concat(what, " has already been delivered to your forwarder / China warehouse").concat(activeSample.forwarderName ? " (".concat(activeSample.forwarderName, ")") : "", ". Please let me know when it is planned to be consolidated and shipped with your other goods.");
        }
        else if (["已国际出运", "国际运输中"].includes(activeSample.status)) {
            strategy = "\u5F53\u524D\u6837\u54C1 ".concat(what, " \u5DF2\u56FD\u9645\u51FA\u8FD0\u3002\u73B0\u5728\u91CD\u70B9\u8DDF\u8E2A\u56FD\u9645\u7269\u6D41\u548C\u6700\u7EC8\u7B7E\u6536\uFF0C\u7B7E\u6536\u540E\u518D\u5B89\u6392\u6D4B\u8BD5\u53CD\u9988\u8DDF\u8FDB\u3002");
            email = "Subject: Sample shipment follow-up \u2013 ".concat(what, "\n\n").concat(hello, "\n\nThe sample ").concat(what, " is now in international transit").concat(activeSample.internationalTracking ? " (tracking: ".concat(activeSample.internationalTracking, ")") : "", ".\n\nPlease let me know once it arrives. After receipt, I\u2019ll follow up with you regarding the testing result.\n\nBest regards");
            wa = "".concat(wh, " The sample ").concat(what, " is now in international transit").concat(activeSample.internationalTracking ? " (".concat(activeSample.internationalTracking, ")") : "", ". Please let me know once it arrives.");
        }
        else {
            strategy = "\u5F53\u524D\u6709\u6837\u54C1\u5728\u8DDF\u8FDB\uFF1A".concat(what, "\uFF0C\u72B6\u6001 ").concat(activeSample.status || "待确认", "\u3002\u4F18\u5148\u786E\u8BA4\u7B7E\u6536/\u6D4B\u8BD5\u7ED3\u679C\uFF0C\u4E0D\u8981\u540C\u65F6\u53D1\u9001\u666E\u901A\u5F00\u53D1\u90AE\u4EF6\u3002");
            email = "Subject: Follow-up on sample \u2013 ".concat(what, "\n\n").concat(hello, "\n\nI\u2019m following up on the sample ").concat(what).concat(activeSample.tracking ? " (tracking: ".concat(activeSample.tracking, ")") : "", ".\n\nCould you please let me know whether it has arrived and, if testing has started, whether you have any initial feedback?\n\nIf there is any issue during testing, please send me the details and we will check it immediately.\n\nBest regards");
            wa = "".concat(wh, " I\u2019m following up on the sample ").concat(what).concat(activeSample.tracking ? " (".concat(activeSample.tracking, ")") : "", ". Has it arrived, and have you had a chance to test it? Any feedback is welcome.");
        }
    }
    else if (unpaid) {
        strategy = "\u9AD8\u4F18\u5148\u7EA7\uFF1A\u5B58\u5728 ".concat(unpaid.piNo || "PI", "\uFF0C\u4ED8\u6B3E\u72B6\u6001\u4E3A ").concat(unpaid.paymentStatus, "\u3002\u5EFA\u8BAE\u5148\u786E\u8BA4\u4ED8\u6B3E\u5B89\u6392\u548C\u662F\u5426\u6709\u6D41\u7A0B\u969C\u788D\uFF0C\u4E0D\u91CD\u590D\u4ECB\u7ECD\u516C\u53F8\u3002");
        email = "Subject: Follow-up on ".concat(unpaid.piNo || "our PI", "\n\n").concat(hello, "\n\nJust a quick follow-up regarding ").concat(unpaid.piNo || "the PI", " we sent earlier.\n\nPlease let me know if the payment schedule is clear or if there is anything we should clarify or adjust on our side before you proceed.\n\nBest regards");
        wa = "".concat(wh, " just a quick follow-up regarding ").concat(unpaid.piNo || "the PI", " we sent earlier. Please let me know if the payment arrangement is clear or if there is anything we should clarify on our side.");
    }
    else if (openQuote) {
        strategy = "\u5EFA\u8BAE\u8DDF\u8FDB\u6700\u8FD1\u62A5\u4EF7 ".concat(openQuote.partNo || "", "\u3002\u5148\u8BE2\u95EE\u4EF7\u683C\u3001\u4EA4\u671F\u6216\u89C4\u683C\u53CD\u9988\uFF1B\u5982\u679C\u4EF7\u683C\u654F\u611F\uFF0C\u4F18\u5148\u8BA9\u5BA2\u6237\u7ED9 target price\u3002");
        email = "Subject: Follow-up on quotation \u2013 ".concat(openQuote.partNo || "your RFQ", "\n\n").concat(hello, "\n\nI\u2019m following up on our quotation for ").concat(openQuote.partNo || "your recent RFQ", ".\n\nPlease let me know if you have any feedback on the price, lead time or specification. If you have a target price, feel free to share it with me and I\u2019ll check again with our team.\n\nBest regards");
        wa = "".concat(wh, " I\u2019m following up on our quotation for ").concat(openQuote.partNo || "your recent RFQ", ". Do you have any feedback on the price or lead time? If you have a target price, feel free to send it to me.");
    }
    else {
        strategy = rot.pending ? (rot.next ? "\u5F53\u524D\u8054\u7CFB\u4EBA ".concat(contactLabel(ct), " \u5DF2").concat(rot.reason, "\u3002\u4E0D\u8981\u7EE7\u7EED\u91CD\u590D\u53D1\u7ED9\u540C\u4E00\u4E2A\u90AE\u7BB1\uFF0C\u5EFA\u8BAE\u5207\u6362\u5230 ").concat(contactLabel(rot.next), " \u540E\u91CD\u65B0\u4ECE\u7B2C 1 \u6B21\u5F00\u53D1\u5F00\u59CB\u3002") : "\u5F53\u524D\u8054\u7CFB\u4EBA\u5DF2".concat(rot.reason, "\uFF0C\u5E76\u4E14\u6CA1\u6709\u66F4\u591A\u53EF\u7528\u8054\u7CFB\u4EBA\u3002\u5EFA\u8BAE\u8F6C\u4E3A\u6C89\u7761\u5BA2\u6237\uFF0C").concat(state.settings.dormantDays || 30, " \u5929\u540E\u91CD\u65B0\u68C0\u67E5\u3002")) : "\u5F53\u524D\u5F00\u53D1\u8054\u7CFB\u4EBA\uFF1A".concat(contactLabel(ct), "\uFF0C\u5DF2\u8054\u7CFB ").concat((ct === null || ct === void 0 ? void 0 : ct.touchCount) || 0, "/").concat(rot.limit, " \u6B21\u3002\u6700\u8FD1\u6C9F\u901A ").concat(comms[0] ? fmtDate(comms[0].date) : "暂无", "\u3002");
        email = "Subject: Quick follow-up\n\n".concat(hello, "\n\nJust checking in to see how things are going on your side.\n\nIf you have any new RFQs, BOM requirements or sourcing issues recently, feel free to send them to me.\n\nBest regards");
        wa = "".concat(wh, " just checking in. If you have any new RFQs or component sourcing requirements recently, feel free to send them to me.");
    }
    $("followupStrategy").textContent = strategy;
    $("followupEmail").value = email;
    $("followupWA").value = wa;
}
// ============================================================
// 10. Excel / CSV 客户批量导入
// ============================================================
var excelAliases = {
    company: ["公司名称", "客户名称", "公司", "客户", "company", "company name", "customer", "customer name", "client", "client name"],
    country: ["国家", "客户国家", "所在国家", "国家地区", "国家/地区", "国家或地区", "country", "country name", "country/region", "country region", "region", "market", "市场", "país", "pais", "país/região", "pais/regiao", "região", "regiao", "mercado"],
    city: ["城市", "city", "location"],
    website: ["官网", "网站", "网址", "website", "web", "url", "homepage"],
    ownerSalesperson: ["跟进业务员", "业务员", "销售", "负责人", "客户负责人", "salesperson", "sales person", "sales rep", "sales representative", "account manager", "owner"],
    ownerCompany: ["我方公司", "跟进公司", "销售公司", "供应商公司", "our company", "seller company", "sales company", "supplier company"],
    ownerEmail: ["跟进邮箱", "业务员邮箱", "销售邮箱", "我方邮箱", "sales email", "seller email", "owner email"],
    grade: ["客户等级", "等级", "级别", "grade", "level", "rating"],
    status: ["客户状态", "开发状态", "跟进状态", "状态", "status", "stage"],
    contact: ["联系人", "联系人姓名", "姓名", "contact", "contact name", "name"],
    title: ["职位", "职务", "岗位", "position", "job title", "title"],
    email: ["邮件", "邮箱", "电子邮件", "email", "e-mail", "mail"],
    phone: ["电话", "手机", "联系电话", "phone", "tel", "telephone", "mobile"],
    whatsapp: ["whatsapp", "whats app", "wa"],
    linkedin: ["linkedin", "linked in"],
    facebook: ["facebook", "fb"],
    telegram: ["telegram", "tg"],
    lastContact: ["最后联系", "最后联系时间", "最后跟进", "last contact", "last contacted", "last follow up"],
    nextFollowUp: ["下次跟进", "下次联系", "跟进时间", "next follow up", "next follow-up", "next contact"],
    notes: ["备注", "跟进内容", "开发内容", "说明", "notes", "note", "remark", "remarks", "memo"]
};
var normalizeHeader = function (v) { return String(v !== null && v !== void 0 ? v : "").trim().toLowerCase().replace(/[\s_\-\/\\（）()：:]+/g, ""); };
var aliasLookup = (function () {
    var m = new Map();
    Object.entries(excelAliases).forEach(function (_a) {
        var _b = __read(_a, 2), field = _b[0], arr = _b[1];
        return arr.forEach(function (x) { return m.set(normalizeHeader(x), field); });
    });
    return m;
})();
function fieldForHeader(h) {
    var n = normalizeHeader(h), direct = aliasLookup.get(n);
    if (direct)
        return direct;
    if (/^(email|mail|邮箱|邮件)\d+$/.test(n) || /^email(?:address)?\d+$/.test(n))
        return "email";
    return null;
}
function normalizeDateValue(v) {
    if (v === null || v === undefined || v === "")
        return "";
    if (v instanceof Date && !isNaN(v)) {
        var off = v.getTimezoneOffset();
        return new Date(v.getTime() - off * 60000).toISOString().slice(0, 10);
    }
    var s = String(v).trim();
    var m = s.match(/^(\d{4})[\-\/.年](\d{1,2})[\-\/.月](\d{1,2})/);
    if (m)
        return "".concat(m[1], "-").concat(String(m[2]).padStart(2, "0"), "-").concat(String(m[3]).padStart(2, "0"));
    m = s.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/);
    if (m)
        return "".concat(m[3], "-").concat(String(m[1]).padStart(2, "0"), "-").concat(String(m[2]).padStart(2, "0"));
    var d = new Date(s);
    if (!isNaN(d)) {
        var off = d.getTimezoneOffset();
        return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
    }
    return "";
}
function normalizeGrade(v) { var s = String(v || "").trim().toUpperCase(); return ["A", "B", "C", "D"].includes(s) ? s : "C"; }
function normalizeStatus(v) {
    var s = String(v || "").trim();
    if (!s)
        return "新客户";
    var map = { "待开发": "新客户", "未开发": "新客户", "已联系": "已开发", "开发中": "已开发", "已询价": "有询价", "询价": "有询价", "报价": "已报价", "成交": "已成交", "老客": "老客户", "沉睡": "沉睡客户", "暂停": "暂停开发", "无效": "无效客户" };
    return map[s] || s;
}
function normalizeLooseText(v) {
    return String(v || "").trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ");
}
function normalizeCompanyKey(v) {
    return normalizeLooseText(v).replace(/[^a-z0-9\u4e00-\u9fff]+/g, "");
}
function normalizeEmailKey(v) { return normalizeLooseText(v).replace(/\s+/g, ""); }
function extractEmails() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var out = [], seen = new Set();
    var add = function (v) {
        if (Array.isArray(v)) {
            v.forEach(add);
            return;
        }
        var text = String(v || "");
        var found = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
        found.forEach(function (raw) { var e = raw.trim().replace(/[),.;:]+$/g, ""); var k = e.toLowerCase(); if (e && !seen.has(k)) {
            seen.add(k);
            out.push(e);
        } });
    };
    values.forEach(add);
    return out;
}
function rawClientEmails(c, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.includeNotes, includeNotes = _c === void 0 ? false : _c;
    return extractEmails((c === null || c === void 0 ? void 0 : c.emails) || [], (c === null || c === void 0 ? void 0 : c.email) || "", includeNotes ? ((c === null || c === void 0 ? void 0 : c.notes) || "") : "");
}
var CONTACT_STATUS_RANK = { "未开始": 0, "开发中": 1, "已切换": 1, "3次未回复": 2, "无效": 3, "已回复": 4 };
function normalizeContactRecord(x, fallback) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    if (x === void 0) { x = {}; }
    if (fallback === void 0) { fallback = {}; }
    var email = extractEmails(x.email || fallback.email || "")[0] || "";
    return { email: email, name: String((_b = (_a = x.name) !== null && _a !== void 0 ? _a : fallback.name) !== null && _b !== void 0 ? _b : "").trim(), title: String((_d = (_c = x.title) !== null && _c !== void 0 ? _c : fallback.title) !== null && _d !== void 0 ? _d : "").trim(), phone: String((_f = (_e = x.phone) !== null && _e !== void 0 ? _e : fallback.phone) !== null && _f !== void 0 ? _f : "").trim(), whatsapp: String((_h = (_g = x.whatsapp) !== null && _g !== void 0 ? _g : fallback.whatsapp) !== null && _h !== void 0 ? _h : "").trim(), status: String(x.status || fallback.status || "未开始"), touchCount: Number((_k = (_j = x.touchCount) !== null && _j !== void 0 ? _j : fallback.touchCount) !== null && _k !== void 0 ? _k : 0) || 0, noReplyCount: Number((_m = (_l = x.noReplyCount) !== null && _l !== void 0 ? _l : fallback.noReplyCount) !== null && _m !== void 0 ? _m : 0) || 0, lastContact: String(x.lastContact || fallback.lastContact || ""), nextFollowUp: String(x.nextFollowUp || fallback.nextFollowUp || ""), isPrimary: Boolean((_p = (_o = x.isPrimary) !== null && _o !== void 0 ? _o : fallback.isPrimary) !== null && _p !== void 0 ? _p : false), invalid: Boolean((_r = (_q = x.invalid) !== null && _q !== void 0 ? _q : fallback.invalid) !== null && _r !== void 0 ? _r : false), replied: Boolean((_t = (_s = x.replied) !== null && _s !== void 0 ? _s : fallback.replied) !== null && _t !== void 0 ? _t : false) };
}
function mergeContactRecord(a, b) {
    var x = normalizeContactRecord(a), y = normalizeContactRecord(b), out = __assign({}, x);
    ["name", "title", "phone", "whatsapp", "lastContact", "nextFollowUp"].forEach(function (k) { if (!out[k] && y[k])
        out[k] = y[k]; });
    out.touchCount = Math.max(x.touchCount || 0, y.touchCount || 0);
    out.noReplyCount = Math.max(x.noReplyCount || 0, y.noReplyCount || 0);
    out.invalid = x.invalid || y.invalid;
    out.replied = x.replied || y.replied;
    out.isPrimary = x.isPrimary || y.isPrimary;
    out.status = (CONTACT_STATUS_RANK[y.status] || 0) > (CONTACT_STATUS_RANK[x.status] || 0) ? y.status : x.status;
    if (out.replied)
        out.status = "已回复";
    else if (out.invalid)
        out.status = "无效";
    return out;
}
function getClientContacts(c, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.includeNotes, includeNotes = _c === void 0 ? false : _c;
    var map = new Map(), order = [];
    var add = function (item, fallback) {
        if (fallback === void 0) { fallback = {}; }
        var r = normalizeContactRecord(item, fallback);
        if (!r.email)
            return;
        var k = r.email.toLowerCase();
        if (!map.has(k)) {
            map.set(k, r);
            order.push(k);
        }
        else
            map.set(k, mergeContactRecord(map.get(k), r));
    };
    (Array.isArray(c === null || c === void 0 ? void 0 : c.contacts) ? c.contacts : []).forEach(function (x) { return add(x); });
    rawClientEmails(c, { includeNotes: includeNotes }).forEach(function (email, i) { return add({ email: email }, { name: i === 0 ? String((c === null || c === void 0 ? void 0 : c.contact) || "").trim() : "", title: i === 0 ? String((c === null || c === void 0 ? void 0 : c.title) || "").trim() : "", phone: i === 0 ? String((c === null || c === void 0 ? void 0 : c.phone) || "").trim() : "", whatsapp: i === 0 ? String((c === null || c === void 0 ? void 0 : c.whatsapp) || "").trim() : "" }); });
    return order.map(function (k) { return map.get(k); });
}
function getClientEmails(c, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.includeNotes, includeNotes = _c === void 0 ? false : _c;
    var contacts = getClientContacts(c, { includeNotes: includeNotes });
    return contacts.length ? contacts.map(function (x) { return x.email; }) : rawClientEmails(c, { includeNotes: includeNotes });
}
function normalizeClientEmails(c, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.includeNotes, includeNotes = _c === void 0 ? false : _c;
    var contacts = getClientContacts(c, { includeNotes: includeNotes });
    var emails = contacts.map(function (x) { return x.email; });
    c.contacts = contacts;
    c.emails = emails;
    c.email = emails[0] || "";
    if (!c.currentContactEmail || !emails.some(function (e) { return e.toLowerCase() === String(c.currentContactEmail).toLowerCase(); })) {
        var preferred = contacts.find(function (x) { return x.isPrimary || x.replied; }) || contacts.find(function (x) { return !x.invalid; }) || contacts[0];
        c.currentContactEmail = (preferred === null || preferred === void 0 ? void 0 : preferred.email) || "";
    }
    return c;
}
function sameEmailList(a, b) { var x = getClientEmails(a, { includeNotes: true }).map(function (e) { return e.toLowerCase(); }).sort(); var y = getClientEmails(b, { includeNotes: true }).map(function (e) { return e.toLowerCase(); }).sort(); return JSON.stringify(x) === JSON.stringify(y); }
function currentContactInfo(c) {
    var contacts = getClientContacts(c, { includeNotes: true });
    if (!contacts.length)
        return { contacts: [], current: null, index: -1, next: null, pending: false, reason: "", allDone: false, limit: Math.max(1, Number(state.settings.contactNoReplyLimit || 3)) };
    var idx = contacts.findIndex(function (x) { return x.email.toLowerCase() === String((c === null || c === void 0 ? void 0 : c.currentContactEmail) || "").toLowerCase(); });
    if (idx < 0)
        idx = contacts.findIndex(function (x) { return x.isPrimary || x.replied; });
    if (idx < 0)
        idx = 0;
    var current = contacts[idx], limit = Math.max(1, Number(state.settings.contactNoReplyLimit || 3));
    var candidates = contacts.map(function (x, i) { return ({ x: x, i: i }); }).filter(function (_a) {
        var x = _a.x, i = _a.i;
        return i !== idx && !x.invalid && !x.replied && (x.noReplyCount || 0) < limit;
    });
    var next = (candidates.find(function (z) { return z.i > idx; }) || candidates[0] || {}).x || null;
    var finalDue = current.nextFollowUp || c.nextFollowUp || "";
    var finalWaitDone = !finalDue || finalDue <= todayISO();
    var pending = !current.replied && (current.invalid || ((current.noReplyCount || 0) >= limit && finalWaitDone));
    var allDone = pending && !next;
    var reason = current.invalid ? "邮箱无效/退信" : ((current.noReplyCount || 0) >= limit ? "连续 ".concat(limit, " 次开发后仍无回复") : "");
    return { contacts: contacts, current: current, index: idx, next: next, pending: pending, reason: reason, allDone: allDone, limit: limit };
}
function contactLabel(x) { return x ? (x.name ? "".concat(x.name, " \u00B7 ").concat(x.email) : x.email) : "—"; }
function buildContactsFromEditedClient(obj, existing) {
    var _a;
    if (existing === void 0) { existing = {}; }
    var emails = extractEmails(obj.email), oldMap = new Map(getClientContacts(existing, { includeNotes: true }).map(function (x) { return [x.email.toLowerCase(), x]; })), activeKey = String(existing.currentContactEmail || "").toLowerCase();
    var contacts = emails.map(function (email, i) { var old = oldMap.get(email.toLowerCase()) || {}, r = normalizeContactRecord(old, { email: email }); if ((activeKey && email.toLowerCase() === activeKey) || (!activeKey && i === 0)) {
        if (obj.contact)
            r.name = String(obj.contact).trim();
        if (obj.title)
            r.title = String(obj.title).trim();
        if (obj.phone)
            r.phone = String(obj.phone).trim();
        if (obj.whatsapp)
            r.whatsapp = String(obj.whatsapp).trim();
    } return r; });
    obj.contacts = contacts;
    obj.emails = emails;
    obj.email = emails[0] || "";
    obj.currentContactEmail = (existing.currentContactEmail && emails.some(function (e) { return e.toLowerCase() === activeKey; })) ? existing.currentContactEmail : ((_a = (contacts.find(function (x) { return x.isPrimary || x.replied; }) || contacts.find(function (x) { return !x.invalid; }) || contacts[0])) === null || _a === void 0 ? void 0 : _a.email) || "";
    obj.contactRotationStatus = existing.contactRotationStatus || (contacts.length ? "active" : "");
    return obj;
}
function normalizePhoneKey(v) { return String(v || "").replace(/\D+/g, ""); }
function normalizeDomain(v) {
    var s = normalizeLooseText(v);
    if (!s)
        return "";
    if (s.includes("@") && !s.includes("/"))
        s = s.split("@").pop();
    s = s.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[\/?#]/)[0].replace(/:\d+$/, "");
    return s;
}
var CCTLD_COUNTRY = [
    [/\.(?:com\.)?br$/, "BR"], [/\.(?:com\.)?tr$/, "TR"], [/\.ru$/, "RU"], [/\.by$/, "BY"], [/\.(?:co\.)?za$/, "ZA"], [/\.(?:co\.)?id$/, "ID"],
    [/\.(?:com\.)?cn$/, "CN"], [/\.lk$/, "LK"], [/\.ua$/, "UA"], [/\.ae$/, "AE"], [/\.de$/, "DE"], [/\.fr$/, "FR"], [/\.it$/, "IT"], [/\.es$/, "ES"], [/\.pt$/, "PT"],
    [/\.pl$/, "PL"], [/\.nl$/, "NL"], [/\.se$/, "SE"], [/\.no$/, "NO"], [/\.fi$/, "FI"], [/\.dk$/, "DK"], [/\.is$/, "IS"], [/\.uk$/, "GB"], [/\.co\.uk$/, "GB"],
    [/\.jp$/, "JP"], [/\.kr$/, "KR"], [/\.sg$/, "SG"], [/\.my$/, "MY"], [/\.th$/, "TH"], [/\.vn$/, "VN"], [/\.ph$/, "PH"], [/\.in$/, "IN"]
];
var PHONE_COUNTRY_PREFIXES = [["971", "AE"], ["375", "BY"], ["380", "UA"], ["94", "LK"], ["90", "TR"], ["55", "BR"], ["27", "ZA"], ["62", "ID"], ["86", "CN"], ["7", "RU"]];
function inferCountryCodeFromClient(c) {
    var e_7, _a, e_8, _b, e_9, _c;
    var code = resolveCountryCode(c === null || c === void 0 ? void 0 : c.country);
    if (code)
        return code;
    var domains = __spreadArray([normalizeDomain((c === null || c === void 0 ? void 0 : c.website) || "")], __read(getClientEmails(c, { includeNotes: true }).map(normalizeDomain)), false).filter(Boolean);
    try {
        for (var domains_1 = __values(domains), domains_1_1 = domains_1.next(); !domains_1_1.done; domains_1_1 = domains_1.next()) {
            var domain = domains_1_1.value;
            try {
                for (var CCTLD_COUNTRY_1 = (e_8 = void 0, __values(CCTLD_COUNTRY)), CCTLD_COUNTRY_1_1 = CCTLD_COUNTRY_1.next(); !CCTLD_COUNTRY_1_1.done; CCTLD_COUNTRY_1_1 = CCTLD_COUNTRY_1.next()) {
                    var _d = __read(CCTLD_COUNTRY_1_1.value, 2), re = _d[0], cc = _d[1];
                    if (re.test(domain))
                        return cc;
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (CCTLD_COUNTRY_1_1 && !CCTLD_COUNTRY_1_1.done && (_b = CCTLD_COUNTRY_1.return)) _b.call(CCTLD_COUNTRY_1);
                }
                finally { if (e_8) throw e_8.error; }
            }
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (domains_1_1 && !domains_1_1.done && (_a = domains_1.return)) _a.call(domains_1);
        }
        finally { if (e_7) throw e_7.error; }
    }
    var phone = String((c === null || c === void 0 ? void 0 : c.phone) || (c === null || c === void 0 ? void 0 : c.whatsapp) || "").replace(/\D+/g, "");
    if (phone.startsWith("00"))
        phone = phone.slice(2);
    try {
        for (var PHONE_COUNTRY_PREFIXES_1 = __values(PHONE_COUNTRY_PREFIXES), PHONE_COUNTRY_PREFIXES_1_1 = PHONE_COUNTRY_PREFIXES_1.next(); !PHONE_COUNTRY_PREFIXES_1_1.done; PHONE_COUNTRY_PREFIXES_1_1 = PHONE_COUNTRY_PREFIXES_1.next()) {
            var _e = __read(PHONE_COUNTRY_PREFIXES_1_1.value, 2), prefix = _e[0], cc = _e[1];
            if (phone.startsWith(prefix))
                return cc;
        }
    }
    catch (e_9_1) { e_9 = { error: e_9_1 }; }
    finally {
        try {
            if (PHONE_COUNTRY_PREFIXES_1_1 && !PHONE_COUNTRY_PREFIXES_1_1.done && (_c = PHONE_COUNTRY_PREFIXES_1.return)) _c.call(PHONE_COUNTRY_PREFIXES_1);
        }
        finally { if (e_9) throw e_9.error; }
    }
    var company = normalizeCountryName((c === null || c === void 0 ? void 0 : c.company) || "");
    if (company.includes("brasil"))
        return "BR";
    return "";
}
function canonicalizeClientCountry(c) {
    var code = inferCountryCodeFromClient(c);
    if (code)
        c.country = countryDisplayName(code);
    return c;
}
function countriesCompatible(a, b) {
    var ca = inferCountryCodeFromClient(a), cb = inferCountryCodeFromClient(b);
    return !ca || !cb || ca === cb;
}
function clientIdentifiers(c) {
    var emails = getClientEmails(c, { includeNotes: true }).map(normalizeEmailKey).filter(Boolean);
    return {
        company: normalizeCompanyKey(c === null || c === void 0 ? void 0 : c.company),
        emails: emails,
        email: emails[0] || "", domain: normalizeDomain(c === null || c === void 0 ? void 0 : c.website),
        phone: normalizePhoneKey((c === null || c === void 0 ? void 0 : c.phone) || (c === null || c === void 0 ? void 0 : c.whatsapp)), country: inferCountryCodeFromClient(c)
    };
}
function sameClient(a, b) {
    var x = clientIdentifiers(a), y = clientIdentifiers(b);
    if (x.emails.length && y.emails.length && x.emails.some(function (e) { return y.emails.includes(e); }))
        return true;
    if (x.domain && y.domain && x.domain === y.domain)
        return true;
    if (x.company && y.company && x.company === y.company && countriesCompatible(a, b))
        return true;
    if (x.company && y.company && x.company === y.company && x.phone && y.phone && x.phone === y.phone)
        return true;
    return false;
}
var STATUS_RANK = { "新客户": 1, "已开发": 2, "已回复": 3, "有询价": 4, "已报价": 5, "重点跟进": 6, "PI": 7, "已成交": 8, "老客户": 9, "长期维护": 5, "沉睡客户": 2, "暂停开发": 0, "无效客户": -1 };
var GRADE_RANK = { A: 4, B: 3, C: 2, D: 1 };
function appendUniqueNote(notes, line) {
    var base = String(notes || "").trim();
    if (!line || base.includes(line))
        return base;
    return base ? "".concat(base, "\n").concat(line) : line;
}
function mergeClientData(base, incoming, _a) {
    var _b, _c, _d;
    var _e = _a === void 0 ? {} : _a, _f = _e.fromExcel, fromExcel = _f === void 0 ? false : _f;
    var out = __assign({}, base), src = __assign({}, incoming);
    normalizeClientEmails(out, { includeNotes: true });
    normalizeClientEmails(src, { includeNotes: true });
    canonicalizeClientCountry(src);
    var contactMap = new Map();
    __spreadArray(__spreadArray([], __read(getClientContacts(out, { includeNotes: true })), false), __read(getClientContacts(src, { includeNotes: true })), false).forEach(function (c) { var k = c.email.toLowerCase(); contactMap.set(k, contactMap.has(k) ? mergeContactRecord(contactMap.get(k), c) : normalizeContactRecord(c)); });
    out.contacts = __spreadArray([], __read(contactMap.values()), false);
    var baseEmails = getClientEmails(out, { includeNotes: true }), incomingEmails = getClientEmails(src, { includeNotes: true });
    var allEmails = extractEmails(baseEmails, incomingEmails);
    out.emails = allEmails;
    out.email = allEmails[0] || "";
    var activeCandidate = String(out.currentContactEmail || src.currentContactEmail || "");
    out.currentContactEmail = allEmails.find(function (e) { return e.toLowerCase() === activeCandidate.toLowerCase(); }) || ((_b = (out.contacts.find(function (x) { return x.isPrimary || x.replied; }) || out.contacts.find(function (x) { return !x.invalid; }) || out.contacts[0])) === null || _b === void 0 ? void 0 : _b.email) || "";
    out.contactRotationStatus = out.contactRotationStatus || src.contactRotationStatus || (allEmails.length ? "active" : "");
    var fill = ["country", "city", "website", "ownerSalesperson", "ownerCompany", "ownerEmail", "contact", "title", "phone", "whatsapp", "linkedin", "facebook", "telegram", "lastContact", "nextFollowUp"];
    fill.forEach(function (k) { if (!String(out[k] || "").trim() && String(src[k] || "").trim())
        out[k] = src[k]; });
    if ((GRADE_RANK[src.grade] || 0) > (GRADE_RANK[out.grade] || 0))
        out.grade = src.grade;
    if (((_c = STATUS_RANK[src.status]) !== null && _c !== void 0 ? _c : 0) > ((_d = STATUS_RANK[out.status]) !== null && _d !== void 0 ? _d : 0))
        out.status = src.status;
    var notes = out.notes || "";
    var extras = [];
    [["联系人", "contact"], ["职位", "title"], ["电话", "phone"], ["WhatsApp", "whatsapp"]].forEach(function (_a) {
        var _b = __read(_a, 2), label = _b[0], k = _b[1];
        var a = String(out[k] || "").trim(), b = String(src[k] || "").trim();
        if (a && b && normalizeLooseText(a) !== normalizeLooseText(b))
            extras.push("".concat(label, ": ").concat(b));
    });
    if (String(src.notes || "").trim() && String(src.notes || "").trim() !== String(notes || "").trim())
        notes = appendUniqueNote(notes, String(src.notes).trim());
    if (extras.length)
        notes = appendUniqueNote(notes, "".concat(fromExcel ? "Excel补充资料" : "合并补充资料", "\uFF1A").concat(extras.join("；")));
    out.notes = notes;
    normalizeClientEmails(out, { includeNotes: true });
    if (src.country) {
        var cc = inferCountryCodeFromClient(src);
        if (cc)
            out.country = countryDisplayName(cc);
    }
    else
        canonicalizeClientCountry(out);
    return out;
}
function findClientMatch(target, list) { return list.find(function (x) { return sameClient(target, x); }) || null; }
function consolidateImportedRows(rows) {
    var out = [];
    var merged = 0;
    rows.forEach(function (raw) {
        var c = canonicalizeClientCountry(__assign({}, raw));
        var hit = findClientMatch(c, out);
        if (hit) {
            Object.assign(hit, mergeClientData(hit, c, { fromExcel: true }));
            merged++;
        }
        else
            out.push(c);
    });
    return { rows: out, merged: merged };
}
function rowToClient(headers, row) {
    var obj = { grade: "C", status: "新客户" }, emailValues = [];
    headers.forEach(function (h, i) {
        var field = fieldForHeader(h);
        if (field && row[i] !== undefined && row[i] !== null) {
            if (field === "email")
                emailValues.push(row[i]);
            else
                obj[field] = String(row[i]).trim();
        }
    });
    var emails = extractEmails(emailValues);
    obj.emails = emails;
    obj.email = emails[0] || "";
    obj.contacts = emails.map(function (email) { return normalizeContactRecord({ email: email, name: obj.contact || "", title: obj.title || "", phone: obj.phone || "", whatsapp: obj.whatsapp || "" }); });
    obj.currentContactEmail = emails[0] || "";
    obj.contactRotationStatus = emails.length ? "active" : "";
    obj.company = String(obj.company || "").trim();
    obj.grade = normalizeGrade(obj.grade);
    obj.status = normalizeStatus(obj.status);
    obj.lastContact = normalizeDateValue(obj.lastContact);
    obj.nextFollowUp = normalizeDateValue(obj.nextFollowUp);
    canonicalizeClientCountry(obj);
    return obj;
}
function clientDupKey(c) {
    var x = clientIdentifiers(c);
    return x.emails[0] ? "e:".concat(x.emails[0]) : x.domain ? "w:".concat(x.domain) : x.company ? "c:".concat(x.company) : "";
}
function showExcelStatus(text, kind) {
    if (kind === void 0) { kind = ""; }
    var el = $("excelImportStatus");
    el.textContent = text;
    el.style.color = kind === "err" ? "#a44f4f" : "";
}
function resetExcelImport() { excelImportRows = []; excelImportFileName = ""; $("excelImportBtn").disabled = true; $("excelPreview").innerHTML = ""; showExcelStatus("尚未选择文件。"); $("excelFileInput").value = ""; }
(_d = $("openExcelImportBtn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () { resetExcelImport(); $("excelImportModal").classList.add("show"); });
var excelDrop = $("excelDropZone");
excelDrop === null || excelDrop === void 0 ? void 0 : excelDrop.addEventListener("click", function () { return $("excelFileInput").click(); });
["dragenter", "dragover"].forEach(function (evt) { return excelDrop === null || excelDrop === void 0 ? void 0 : excelDrop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); excelDrop.classList.add("dragover"); }); });
["dragleave", "drop"].forEach(function (evt) { return excelDrop === null || excelDrop === void 0 ? void 0 : excelDrop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); excelDrop.classList.remove("dragover"); }); });
excelDrop === null || excelDrop === void 0 ? void 0 : excelDrop.addEventListener("drop", function (e) { var _a, _b; var f = (_b = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0]; if (f)
    readExcelFile(f); });
(_e = $("excelFileInput")) === null || _e === void 0 ? void 0 : _e.addEventListener("change", function (e) { var _a; var f = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]; if (f)
    readExcelFile(f); });
function readExcelFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        var name, matrix, text, wb, data, wb, ws, headers_1, recognized, rows, valid, invalid, mapped, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = (file.name || "").toLowerCase();
                    if (!/\.(xlsx|xls|csv)$/.test(name)) {
                        showExcelStatus("不支持这个格式，请选择 .xlsx / .xls / .csv。", "err");
                        return [2 /*return*/];
                    }
                    excelImportFileName = file.name || "客户表";
                    showExcelStatus("正在读取文件……");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    matrix = [];
                    if (!name.endsWith(".csv")) return [3 /*break*/, 3];
                    return [4 /*yield*/, file.text()];
                case 2:
                    text = _a.sent();
                    if (window.XLSX) {
                        wb = XLSX.read(text, { type: "string" });
                        matrix = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "", raw: false, blankrows: false });
                    }
                    else {
                        matrix = text.split(/\r?\n/).filter(Boolean).map(function (line) { return line.split(","); });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    if (!window.XLSX)
                        throw new Error("Excel解析组件没有加载。请刷新页面后重试，或先另存为 CSV 再导入。");
                    return [4 /*yield*/, file.arrayBuffer()];
                case 4:
                    data = _a.sent();
                    wb = XLSX.read(data, { type: "array", cellDates: true });
                    ws = wb.Sheets[wb.SheetNames[0]];
                    matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false, blankrows: false });
                    _a.label = 5;
                case 5:
                    if (!matrix.length)
                        throw new Error("表格为空。请确认第一行是表头。");
                    headers_1 = matrix[0].map(function (x) { return String(x || "").trim(); });
                    recognized = headers_1.map(fieldForHeader).filter(Boolean);
                    if (!recognized.includes("company"))
                        throw new Error("没有识别到“客户名称/公司名称/Company”列。请把公司名称放在第一行表头中。");
                    rows = matrix.slice(1).map(function (r) { return rowToClient(headers_1, r); }).filter(function (c) { return Object.values(c).some(function (v) { return String(v || "").trim(); }); });
                    valid = rows.filter(function (c) { return c.company; });
                    invalid = rows.length - valid.length;
                    excelImportRows = valid;
                    if (!valid.length)
                        throw new Error("没有读取到有效客户行。每一行至少需要公司名称。");
                    mapped = __spreadArray([], __read(new Set(recognized)), false).map(function (f) { return ({ company: "公司", country: "国家", city: "城市", website: "官网", ownerSalesperson: "跟进业务员", ownerCompany: "我方公司", ownerEmail: "跟进邮箱", grade: "等级", status: "状态", contact: "联系人", title: "职位", email: "Email", phone: "电话", whatsapp: "WhatsApp", linkedin: "LinkedIn", facebook: "Facebook", telegram: "Telegram", lastContact: "最后联系", nextFollowUp: "下次跟进", notes: "备注" }[f] || f); });
                    showExcelStatus("\u5DF2\u8BFB\u53D6 ".concat(file.name, "\uFF1A\u6709\u6548\u5BA2\u6237 ").concat(valid.length, " \u884C").concat(invalid ? "\uFF0C\u53E6\u6709 ".concat(invalid, " \u884C\u7F3A\u5C11\u516C\u53F8\u540D\u79F0\u5C06\u8DF3\u8FC7") : "", "\u3002\u8BC6\u522B\u5217\uFF1A").concat(mapped.join("、"), "\u3002"));
                    $("excelImportBtn").disabled = false;
                    $("excelPreview").innerHTML = "<div class=\"table-wrap\"><table><thead><tr><th>\u5BA2\u6237</th><th>\u56FD\u5BB6</th><th>\u8DDF\u8FDB\u5F52\u5C5E</th><th>\u8054\u7CFB\u4EBA</th><th>Email</th><th>WhatsApp</th><th>\u72B6\u6001</th></tr></thead><tbody>".concat(valid.slice(0, 8).map(function (c) { return "<tr><td><b>".concat(esc(c.company), "</b></td><td>").concat(esc(c.country || ""), "</td><td>").concat(esc([c.ownerSalesperson, c.ownerCompany, c.ownerEmail].filter(Boolean).join(" · ") || ""), "</td><td>").concat(esc(c.contact || ""), "</td><td>").concat(esc(getClientEmails(c, { includeNotes: true }).join("; ")), "</td><td>").concat(esc(c.whatsapp || ""), "</td><td>").concat(esc(c.status || ""), "</td></tr>"); }).join(""), "</tbody></table></div>").concat(valid.length > 8 ? "<div class=\"item-meta\" style=\"margin-top:6px\">\u4EC5\u9884\u89C8\u524D 8 \u884C\uFF0C\u5171 ".concat(valid.length, " \u884C\u3002</div>") : "");
                    return [3 /*break*/, 7];
                case 6:
                    err_3 = _a.sent();
                    excelImportRows = [];
                    $("excelImportBtn").disabled = true;
                    $("excelPreview").innerHTML = "";
                    showExcelStatus("读取失败：" + err_3.message, "err");
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
(_f = $("excelImportBtn")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    var consolidated, virtualExisting, toCreate, toUpdate, _a, _b, incoming, hit, merged, c, msg, ops_2, toUpdate_1, toUpdate_1_1, _c, id, c, _loop_4, i, countryNames, countryAdded, err_4;
    var e_10, _d, e_11, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                if (!excelImportRows.length)
                    return [2 /*return*/];
                consolidated = consolidateImportedRows(excelImportRows);
                virtualExisting = state.clients.map(function (c) { return (__assign({}, c)); });
                toCreate = [], toUpdate = new Map();
                try {
                    for (_a = __values(consolidated.rows), _b = _a.next(); !_b.done; _b = _a.next()) {
                        incoming = _b.value;
                        hit = findClientMatch(incoming, virtualExisting);
                        if (hit) {
                            merged = mergeClientData(hit, incoming, { fromExcel: true });
                            Object.assign(hit, merged);
                            if (hit.id)
                                toUpdate.set(hit.id, merged);
                        }
                        else {
                            c = __assign({}, incoming);
                            toCreate.push(c);
                            virtualExisting.push(c);
                        }
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
                msg = "\u51C6\u5907\u5904\u7406 ".concat(excelImportRows.length, " \u884C\uFF1A\u65B0\u589E ").concat(toCreate.length, " \u5BB6\uFF0C\u5408\u5E76/\u8865\u5145\u5DF2\u6709\u5BA2\u6237 ").concat(toUpdate.size, " \u5BB6").concat(consolidated.merged ? "\uFF0C\u8868\u5185\u91CD\u590D\u5DF2\u5408\u5E76 ".concat(consolidated.merged, " \u884C") : "", "\u3002\u786E\u8BA4\u5199\u5165\u4E91\u7AEF\u5417\uFF1F");
                if (!confirm(msg))
                    return [2 /*return*/];
                sync("busy", "正在清洗并导入客户…");
                $("excelImportBtn").disabled = true;
                _f.label = 1;
            case 1:
                _f.trys.push([1, 7, , 8]);
                ops_2 = [];
                toCreate.forEach(function (c) { return ops_2.push({ kind: "set", ref: doc(refCollection("clients")), data: __assign(__assign({}, c), { source: "Excel\u5BFC\u5165\uFF1A".concat(excelImportFileName), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }) }); });
                try {
                    for (toUpdate_1 = __values(toUpdate), toUpdate_1_1 = toUpdate_1.next(); !toUpdate_1_1.done; toUpdate_1_1 = toUpdate_1.next()) {
                        _c = __read(toUpdate_1_1.value, 2), id = _c[0], c = _c[1];
                        ops_2.push({ kind: "update", ref: doc(db, "users", currentUser.uid, "clients", id), data: __assign(__assign({}, c), { source: "Excel\u5408\u5E76\u66F4\u65B0\uFF1A".concat(excelImportFileName), updatedAt: serverTimestamp() }) });
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (toUpdate_1_1 && !toUpdate_1_1.done && (_e = toUpdate_1.return)) _e.call(toUpdate_1);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
                _loop_4 = function (i) {
                    var batch;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                batch = writeBatch(db);
                                ops_2.slice(i, i + 350).forEach(function (op) { return op.kind === "set" ? batch.set(op.ref, op.data) : batch.update(op.ref, op.data); });
                                return [4 /*yield*/, batch.commit()];
                            case 1:
                                _g.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _f.label = 2;
            case 2:
                if (!(i < ops_2.length)) return [3 /*break*/, 5];
                return [5 /*yield**/, _loop_4(i)];
            case 3:
                _f.sent();
                _f.label = 4;
            case 4:
                i += 350;
                return [3 /*break*/, 2];
            case 5:
                countryNames = __spreadArray(__spreadArray([], __read(toCreate), false), __read(toUpdate.values()), false).map(function (c) { return c.country; }).filter(Boolean);
                return [4 /*yield*/, autoTrackCountriesFromNames(countryNames)];
            case 6:
                countryAdded = _f.sent();
                sync("ok", "已自动同步");
                alert("\u5904\u7406\u5B8C\u6210\uFF1A\u65B0\u589E ".concat(toCreate.length, " \u5BB6\uFF1B\u5408\u5E76/\u8865\u5145 ").concat(toUpdate.size, " \u5BB6").concat(consolidated.merged ? "\uFF1B\u8868\u5185\u91CD\u590D\u5408\u5E76 ".concat(consolidated.merged, " \u884C") : "").concat(countryAdded.length ? "\uFF1B\u65B0\u589E ".concat(countryAdded.length, " \u4E2A\u56FD\u5BB6\u8282\u5047\u65E5\u540C\u6B65") : "", "\u3002"));
                closeModal("excelImportModal");
                return [3 /*break*/, 8];
            case 7:
                err_4 = _f.sent();
                console.error(err_4);
                sync("err", "导入失败");
                $("excelImportBtn").disabled = false;
                alert("导入失败：" + err_4.message);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// ============================================================
// 10.1 Excel / CSV 报价批量导入
// ============================================================
var quoteAliases = {
    company: ["公司名称", "客户名称", "公司", "客户", "company", "customer", "client", "buyer"],
    email: ["客户邮箱", "邮箱", "email", "e-mail", "mail"],
    partNo: ["型号", "料号", "型号规格", "part no", "part number", "partno", "p/n", "pn", "mpn", "model", "item"],
    brand: ["品牌", "brand", "manufacturer", "mfr", "maker"],
    qty: ["数量", "需求数量", "qty", "quantity", "q'ty"],
    targetPrice: ["目标价", "target price", "target", "tp", "targetprice"],
    quotePrice: ["报价", "单价", "价格", "price", "unit price", "quoted price", "usd", "报价单价"],
    currency: ["币种", "currency", "curr"],
    dc: ["dc", "date code", "datecode", "批次"],
    leadTime: ["交期", "货期", "lead time", "leadtime", "lt"],
    status: ["状态", "status"],
    quoteDate: ["报价日期", "日期", "date", "quote date", "quotation date"],
    notes: ["备注", "说明", "notes", "note", "remark", "remarks"]
};
var quoteAliasLookup = (function () { var m = new Map(); Object.entries(quoteAliases).forEach(function (_a) {
    var _b = __read(_a, 2), f = _b[0], a = _b[1];
    return a.forEach(function (x) { return m.set(normalizeHeader(x), f); });
}); return m; })();
function quoteFieldForHeader(h) { return quoteAliasLookup.get(normalizeHeader(h)) || null; }
function detectQuoteHeaderRow(matrix) {
    var best = { idx: 0, score: -1, fields: [] };
    for (var i = 0; i < Math.min(matrix.length, 15); i++) {
        var fields = (matrix[i] || []).map(quoteFieldForHeader).filter(Boolean);
        var score = fields.length + (fields.includes("partNo") ? 4 : 0) + (fields.includes("qty") ? 1 : 0) + (fields.includes("quotePrice") ? 1 : 0);
        if (score > best.score)
            best = { idx: i, score: score, fields: fields };
    }
    return best;
}
function rowToQuoteItem(headers, row) {
    var o = { currency: state.settings.currency || "USD", status: "已报价" };
    headers.forEach(function (h, i) { var f = quoteFieldForHeader(h); if (f && row[i] !== undefined && row[i] !== null && String(row[i]).trim() !== "")
        o[f] = String(row[i]).trim(); });
    o.partNo = String(o.partNo || "").trim();
    o.brand = String(o.brand || "").trim();
    o.qty = String(o.qty || "").trim();
    o.quoteDate = normalizeDateValue(o.quoteDate);
    if (!o.quotePrice)
        o.status = o.status === "已报价" ? "待报价" : o.status;
    return o;
}
function resetQuoteImport() {
    quoteImportRows = [];
    quoteImportFileName = "";
    $("quoteImportBtn").disabled = true;
    $("quoteImportPreview").innerHTML = "";
    $("quoteImportSummary").innerHTML = "";
    $("quoteImportStatus").textContent = "尚未选择文件。";
    $("quoteFileInput").value = "";
    var sel = $("quoteImportDefaultClient");
    sel.innerHTML = '<option value="">请选择客户</option>' + state.clients.slice().sort(function (a, b) { return (a.company || "").localeCompare(b.company || ""); }).map(function (c) { return "<option value=\"".concat(c.id, "\">").concat(esc(c.company), " \u00B7 ").concat(esc(c.country || ""), "</option>"); }).join("");
    $("quoteImportDate").value = todayISO();
}
(_g = $("openQuoteImportBtn")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", function () { resetQuoteImport(); $("quoteImportModal").classList.add("show"); });
var quoteDrop = $("quoteDropZone");
quoteDrop === null || quoteDrop === void 0 ? void 0 : quoteDrop.addEventListener("click", function () { return $("quoteFileInput").click(); });
["dragenter", "dragover"].forEach(function (evt) { return quoteDrop === null || quoteDrop === void 0 ? void 0 : quoteDrop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); quoteDrop.classList.add("dragover"); }); });
["dragleave", "drop"].forEach(function (evt) { return quoteDrop === null || quoteDrop === void 0 ? void 0 : quoteDrop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); quoteDrop.classList.remove("dragover"); }); });
quoteDrop === null || quoteDrop === void 0 ? void 0 : quoteDrop.addEventListener("drop", function (e) { var _a, _b; var f = (_b = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0]; if (f)
    readQuoteExcelFile(f); });
(_h = $("quoteFileInput")) === null || _h === void 0 ? void 0 : _h.addEventListener("change", function (e) { var _a; var f = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0]; if (f)
    readQuoteExcelFile(f); });
function readQuoteExcelFile(file) {
    return __awaiter(this, void 0, void 0, function () {
        var name, matrix, text, wb, data, wb, ws, detected, headers_2, fields, rows, withPrice, clients, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = (file.name || "").toLowerCase();
                    if (!/\.(xlsx|xls|csv)$/.test(name)) {
                        $("quoteImportStatus").textContent = "不支持这个格式，请选择 .xlsx / .xls / .csv。";
                        return [2 /*return*/];
                    }
                    quoteImportFileName = file.name || "报价表";
                    $("quoteImportStatus").textContent = "正在读取报价表……";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    matrix = [];
                    if (!name.endsWith(".csv")) return [3 /*break*/, 3];
                    return [4 /*yield*/, file.text()];
                case 2:
                    text = _a.sent();
                    if (window.XLSX) {
                        wb = XLSX.read(text, { type: "string" });
                        matrix = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "", raw: false, blankrows: false });
                    }
                    else
                        matrix = text.split(/\r?\n/).filter(Boolean).map(function (line) { return line.split(","); });
                    return [3 /*break*/, 5];
                case 3:
                    if (!window.XLSX)
                        throw new Error("Excel解析组件没有加载。请刷新页面后重试。");
                    return [4 /*yield*/, file.arrayBuffer()];
                case 4:
                    data = _a.sent(), wb = XLSX.read(data, { type: "array", cellDates: true }), ws = wb.Sheets[wb.SheetNames[0]];
                    matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false, blankrows: false });
                    _a.label = 5;
                case 5:
                    if (!matrix.length)
                        throw new Error("报价表为空。");
                    detected = detectQuoteHeaderRow(matrix), headers_2 = (matrix[detected.idx] || []).map(function (x) { return String(x || "").trim(); });
                    fields = headers_2.map(quoteFieldForHeader).filter(Boolean);
                    if (!fields.includes("partNo"))
                        throw new Error("没有识别到“型号/料号/Part No/MPN”列。");
                    rows = matrix.slice(detected.idx + 1).map(function (r) { return rowToQuoteItem(headers_2, r); }).filter(function (x) { return x.partNo || x.notes; });
                    if (!rows.length)
                        throw new Error("没有读取到有效报价行。");
                    quoteImportRows = rows;
                    withPrice = rows.filter(function (x) { return x.quotePrice; }).length, clients = new Set(rows.map(function (x) { return x.company; }).filter(Boolean));
                    $("quoteImportStatus").textContent = "\u5DF2\u8BFB\u53D6 ".concat(file.name, "\uFF1A\u8BC6\u522B\u8868\u5934\u5728\u7B2C ").concat(detected.idx + 1, " \u884C\uFF0C\u5171 ").concat(rows.length, " \u4E2A\u578B\u53F7\u3002");
                    $("quoteImportSummary").innerHTML = "<div><b>".concat(rows.length, "</b><br><span class=\"item-meta\">\u578B\u53F7\u884C\u6570</span></div><div><b>").concat(withPrice, "</b><br><span class=\"item-meta\">\u5DF2\u6709\u62A5\u4EF7</span></div><div><b>").concat(clients.size || "—", "</b><br><span class=\"item-meta\">\u8868\u5185\u5BA2\u6237\u6570</span></div><div><b>").concat(fields.length, "</b><br><span class=\"item-meta\">\u8BC6\u522B\u5B57\u6BB5</span></div>");
                    $("quoteImportPreview").innerHTML = "<div class=\"table-wrap\"><table><thead><tr><th>\u578B\u53F7</th><th>\u54C1\u724C</th><th>\u6570\u91CF</th><th>\u76EE\u6807\u4EF7</th><th>\u62A5\u4EF7</th><th>DC</th><th>\u4EA4\u671F</th></tr></thead><tbody>".concat(rows.slice(0, 10).map(function (x) { return "<tr><td><b>".concat(esc(x.partNo), "</b></td><td>").concat(esc(x.brand || ""), "</td><td>").concat(esc(x.qty || ""), "</td><td>").concat(esc(x.targetPrice || ""), "</td><td>").concat(esc(x.quotePrice || ""), "</td><td>").concat(esc(x.dc || ""), "</td><td>").concat(esc(x.leadTime || ""), "</td></tr>"); }).join(""), "</tbody></table></div>").concat(rows.length > 10 ? "<div class=\"item-meta\" style=\"margin-top:6px\">\u4EC5\u9884\u89C8\u524D 10 \u884C\uFF0C\u5171 ".concat(rows.length, " \u884C\u3002</div>") : "");
                    $("quoteImportBtn").disabled = false;
                    return [3 /*break*/, 7];
                case 6:
                    err_5 = _a.sent();
                    quoteImportRows = [];
                    $("quoteImportBtn").disabled = true;
                    $("quoteImportPreview").innerHTML = "";
                    $("quoteImportStatus").textContent = "读取失败：" + err_5.message;
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function resolveQuoteClient(row, defaultId) {
    var _a;
    if (row.email) {
        var e_12 = (_a = extractEmails(row.email)[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (e_12) {
            var hit = state.clients.find(function (c) { return getClientEmails(c, { includeNotes: true }).some(function (x) { return x.toLowerCase() === e_12; }); });
            if (hit)
                return hit;
        }
    }
    if (row.company) {
        var key_1 = normalizeCompanyKey(row.company), hit = state.clients.find(function (c) { return normalizeCompanyKey(c.company) === key_1; });
        if (hit)
            return hit;
    }
    return state.clients.find(function (c) { return c.id === defaultId; }) || null;
}
function packQuoteItems(items, maxItems, maxBytes) {
    var e_13, _a;
    if (maxItems === void 0) { maxItems = 500; }
    if (maxBytes === void 0) { maxBytes = 700000; }
    var chunks = [];
    var cur = [];
    try {
        for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;
            var trial = __spreadArray(__spreadArray([], __read(cur), false), [item], false), size = new Blob([JSON.stringify(trial)]).size;
            if (cur.length && (trial.length > maxItems || size > maxBytes)) {
                chunks.push(cur);
                cur = [item];
            }
            else
                cur = trial;
        }
    }
    catch (e_13_1) { e_13 = { error: e_13_1 }; }
    finally {
        try {
            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
        }
        finally { if (e_13) throw e_13.error; }
    }
    if (cur.length)
        chunks.push(cur);
    return chunks;
}
(_j = $("quoteImportBtn")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    var defaultId, defaultDate, groups, skipped, total, docs, groups_1, groups_1_1, _a, clientId, items, chunks, i, part, priced, currencies, brands, quoteDate, e_14_1, err_6;
    var e_14, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!quoteImportRows.length)
                    return [2 /*return*/];
                defaultId = $("quoteImportDefaultClient").value, defaultDate = $("quoteImportDate").value || todayISO();
                groups = new Map();
                skipped = 0;
                quoteImportRows.forEach(function (row) { var c = resolveQuoteClient(row, defaultId); if (!c) {
                    skipped++;
                    return;
                } if (!groups.has(c.id))
                    groups.set(c.id, []); groups.get(c.id).push(row); });
                if (!groups.size)
                    return [2 /*return*/, alert("没有匹配到客户。请选择“默认客户”，或在报价表中加入客户名称/邮箱。")];
                total = __spreadArray([], __read(groups.values()), false).reduce(function (n, a) { return n + a.length; }, 0);
                if (!confirm("\u51C6\u5907\u5BFC\u5165 ".concat(total, " \u4E2A\u578B\u53F7\uFF0C\u5339\u914D ").concat(groups.size, " \u5BB6\u5BA2\u6237").concat(skipped ? "\uFF0C\u53E6\u6709 ".concat(skipped, " \u884C\u56E0\u627E\u4E0D\u5230\u5BA2\u6237\u5C06\u8DF3\u8FC7") : "", "\u3002\u7EE7\u7EED\u5417\uFF1F")))
                    return [2 /*return*/];
                sync("busy", "正在导入批量报价…");
                $("quoteImportBtn").disabled = true;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 12, , 13]);
                docs = 0;
                _d.label = 2;
            case 2:
                _d.trys.push([2, 9, 10, 11]);
                groups_1 = __values(groups), groups_1_1 = groups_1.next();
                _d.label = 3;
            case 3:
                if (!!groups_1_1.done) return [3 /*break*/, 8];
                _a = __read(groups_1_1.value, 2), clientId = _a[0], items = _a[1];
                chunks = packQuoteItems(items);
                i = 0;
                _d.label = 4;
            case 4:
                if (!(i < chunks.length)) return [3 /*break*/, 7];
                part = chunks[i], priced = part.filter(function (x) { return x.quotePrice; }).length, currencies = __spreadArray([], __read(new Set(part.map(function (x) { return x.currency; }).filter(Boolean))), false);
                brands = __spreadArray([], __read(new Set(part.map(function (x) { return x.brand; }).filter(Boolean))), false);
                quoteDate = part.map(function (x) { return x.quoteDate; }).filter(Boolean).sort()[0] || defaultDate;
                return [4 /*yield*/, addDoc(refCollection("quotes"), {
                        clientId: clientId,
                        batchImport: true, batchName: "".concat(quoteImportFileName).concat(chunks.length > 1 ? " \u00B7 \u7B2C".concat(i + 1, "/").concat(chunks.length, "\u90E8\u5206") : ""),
                        sourceFile: quoteImportFileName, itemCount: part.length, items: part,
                        partNo: "".concat(((_c = part[0]) === null || _c === void 0 ? void 0 : _c.partNo) || "批量报价", " \u7B49 ").concat(part.length, " \u9879"),
                        brand: brands.length === 1 ? brands[0] : "多品牌", qty: "".concat(part.length, "\u9879"),
                        quotePrice: priced ? "".concat(priced, "/").concat(part.length, "\u9879\u5DF2\u62A5\u4EF7") : "待报价", priceSummary: priced ? "".concat(priced, "/").concat(part.length, " \u9879\u5DF2\u6709\u4EF7\u683C") : "待报价",
                        currency: currencies.length === 1 ? currencies[0] : (state.settings.currency || "USD"),
                        status: priced === part.length ? "已报价" : priced ? "报价中" : "待报价",
                        quoteDate: quoteDate,
                        nextFollowUp: addDays(quoteDate, state.settings.quoteFollowDays || 5),
                        notes: "Excel\u6279\u91CF\u5BFC\u5165\uFF1A".concat(quoteImportFileName), createdAt: serverTimestamp(), updatedAt: serverTimestamp()
                    })];
            case 5:
                _d.sent();
                docs++;
                _d.label = 6;
            case 6:
                i++;
                return [3 /*break*/, 4];
            case 7:
                groups_1_1 = groups_1.next();
                return [3 /*break*/, 3];
            case 8: return [3 /*break*/, 11];
            case 9:
                e_14_1 = _d.sent();
                e_14 = { error: e_14_1 };
                return [3 /*break*/, 11];
            case 10:
                try {
                    if (groups_1_1 && !groups_1_1.done && (_b = groups_1.return)) _b.call(groups_1);
                }
                finally { if (e_14) throw e_14.error; }
                return [7 /*endfinally*/];
            case 11:
                sync("ok", "已自动同步");
                alert("\u62A5\u4EF7\u5BFC\u5165\u5B8C\u6210\uFF1A".concat(total, " \u4E2A\u578B\u53F7\uFF0C\u4FDD\u5B58\u4E3A ").concat(docs, " \u4EFD\u6279\u91CF\u62A5\u4EF7\u8BB0\u5F55").concat(skipped ? "\uFF1B\u8DF3\u8FC7 ".concat(skipped, " \u884C") : "", "\u3002"));
                closeModal("quoteImportModal");
                return [3 /*break*/, 13];
            case 12:
                err_6 = _d.sent();
                console.error(err_6);
                sync("err", "导入失败");
                $("quoteImportBtn").disabled = false;
                alert("报价导入失败：" + err_6.message);
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
window.openQuoteBatch = function (id) {
    var q = state.quotes.find(function (x) { return x.id === id; });
    if (!q || !Array.isArray(q.items))
        return;
    $("quoteBatchTitle").textContent = q.batchName || "批量报价明细";
    $("quoteBatchSub").textContent = "".concat(clientName(q.clientId), " \u00B7 ").concat(fmtDate(q.quoteDate), " \u00B7 ").concat(q.items.length, " \u9879");
    $("quoteBatchBody").innerHTML = "<div class=\"table-wrap\"><table><thead><tr><th>#</th><th>\u578B\u53F7</th><th>\u54C1\u724C</th><th>\u6570\u91CF</th><th>Target Price</th><th>\u62A5\u4EF7</th><th>\u5E01\u79CD</th><th>DC</th><th>\u4EA4\u671F</th><th>\u5907\u6CE8</th></tr></thead><tbody>".concat(q.items.map(function (x, i) { return "<tr><td>".concat(i + 1, "</td><td><b>").concat(esc(x.partNo || ""), "</b></td><td>").concat(esc(x.brand || ""), "</td><td>").concat(esc(x.qty || ""), "</td><td>").concat(esc(x.targetPrice || ""), "</td><td>").concat(esc(x.quotePrice || ""), "</td><td>").concat(esc(x.currency || ""), "</td><td>").concat(esc(x.dc || ""), "</td><td>").concat(esc(x.leadTime || ""), "</td><td>").concat(esc(x.notes || ""), "</td></tr>"); }).join(""), "</tbody></table></div>");
    $("quoteBatchModal").classList.add("show");
};
// V3.1.3：清理已经存在的重复客户，并补全可推断国家；关联记录自动改到保留客户
(_k = $("cleanClientsBtn")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    var parent, byId, find, union, buckets, _loop_5, _a, _b, c, groups, dups, inferable, emailRepairable, relationSets_1, ops, duplicateIds, repairedEmails, completeness_1, dups_1, dups_1_1, group, sorted, keeper, merged, _c, _d, d, _loop_6, _e, _f, d, _g, _h, c, patch, emails, stored, code, _loop_7, i, err_7;
    var e_15, _j, e_16, _k, e_17, _l, e_18, _m, e_19, _o;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                if (!state.clients.length) {
                    alert("当前没有客户需要清理。");
                    return [2 /*return*/];
                }
                parent = {};
                byId = new Map(state.clients.map(function (c) { return [c.id, c]; }));
                find = function (id) { return parent[id] === id ? id : (parent[id] = find(parent[id])); };
                union = function (a, b) { a = find(a); b = find(b); if (a !== b)
                    parent[b] = a; };
                state.clients.forEach(function (c) { return parent[c.id] = c.id; });
                buckets = new Map();
                _loop_5 = function (c) {
                    var e_20, _q, e_21, _r;
                    var x = clientIdentifiers(c);
                    var keys = [];
                    x.emails.forEach(function (e) { return keys.push("e:".concat(e)); });
                    if (x.domain)
                        keys.push("w:".concat(x.domain));
                    if (x.company)
                        keys.push("c:".concat(x.company));
                    try {
                        for (var keys_1 = (e_20 = void 0, __values(keys)), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                            var key = keys_1_1.value;
                            var ids = buckets.get(key) || [];
                            try {
                                for (var ids_1 = (e_21 = void 0, __values(ids)), ids_1_1 = ids_1.next(); !ids_1_1.done; ids_1_1 = ids_1.next()) {
                                    var id = ids_1_1.value;
                                    var other = byId.get(id);
                                    if (other && sameClient(c, other))
                                        union(c.id, id);
                                }
                            }
                            catch (e_21_1) { e_21 = { error: e_21_1 }; }
                            finally {
                                try {
                                    if (ids_1_1 && !ids_1_1.done && (_r = ids_1.return)) _r.call(ids_1);
                                }
                                finally { if (e_21) throw e_21.error; }
                            }
                            ids.push(c.id);
                            buckets.set(key, ids);
                        }
                    }
                    catch (e_20_1) { e_20 = { error: e_20_1 }; }
                    finally {
                        try {
                            if (keys_1_1 && !keys_1_1.done && (_q = keys_1.return)) _q.call(keys_1);
                        }
                        finally { if (e_20) throw e_20.error; }
                    }
                };
                try {
                    for (_a = __values(state.clients), _b = _a.next(); !_b.done; _b = _a.next()) {
                        c = _b.value;
                        _loop_5(c);
                    }
                }
                catch (e_15_1) { e_15 = { error: e_15_1 }; }
                finally {
                    try {
                        if (_b && !_b.done && (_j = _a.return)) _j.call(_a);
                    }
                    finally { if (e_15) throw e_15.error; }
                }
                groups = new Map();
                state.clients.forEach(function (c) { var r = find(c.id); (groups.get(r) || groups.set(r, []).get(r)).push(c); });
                dups = __spreadArray([], __read(groups.values()), false).filter(function (g) { return g.length > 1; });
                inferable = state.clients.filter(function (c) { return !resolveCountryCode(c.country) && inferCountryCodeFromClient(c); }).length;
                emailRepairable = state.clients.filter(function (c) {
                    var stored = extractEmails((c === null || c === void 0 ? void 0 : c.emails) || [], (c === null || c === void 0 ? void 0 : c.email) || "").map(function (e) { return e.toLowerCase(); }).sort();
                    var repaired = getClientEmails(c, { includeNotes: true }).map(function (e) { return e.toLowerCase(); }).sort();
                    return JSON.stringify(stored) !== JSON.stringify(repaired);
                }).length;
                if (!dups.length && !inferable && !emailRepairable) {
                    alert("没有发现需要合并的重复客户，也没有需要修复的多邮箱或可自动补全的国家。");
                    return [2 /*return*/];
                }
                if (!confirm("\u68C0\u6D4B\u5230 ".concat(dups.reduce(function (n, g) { return n + g.length - 1; }, 0), " \u6761\u91CD\u590D\u5BA2\u6237\u9700\u8981\u5408\u5E76\uFF1B\u7EA6 ").concat(emailRepairable, " \u5BB6\u5BA2\u6237\u53EF\u4FEE\u590D/\u8865\u5168\u591A\u90AE\u7BB1\uFF1B\u53E6\u6709\u7EA6 ").concat(inferable, " \u6761\u5BA2\u6237\u53EF\u81EA\u52A8\u8865\u5168\u56FD\u5BB6\u3002\n\n\u7CFB\u7EDF\u4F1A\u4FDD\u7559\u8D44\u6599\u66F4\u5B8C\u6574\u7684\u4E00\u6761\uFF0C\u5E76\u628A\u540C\u4E00\u516C\u53F8\u7684\u6240\u6709\u90AE\u7BB1\u5408\u5E76\u4FDD\u7559\u3002\u62A5\u4EF7\u3001PI\u3001\u6C9F\u901A\u3001\u4EFB\u52A1\u3001\u9644\u4EF6\u4E5F\u4F1A\u5173\u8054\u5230\u4FDD\u7559\u5BA2\u6237\u3002\u786E\u8BA4\u7EE7\u7EED\u5417\uFF1F")))
                    return [2 /*return*/];
                sync("busy", "正在清理客户数据…");
                _p.label = 1;
            case 1:
                _p.trys.push([1, 7, , 8]);
                relationSets_1 = [state.communications, state.quotes, state.orders, state.samples, state.tasks, state.files];
                ops = [];
                duplicateIds = new Set();
                repairedEmails = 0;
                completeness_1 = function (c) { return ["country", "city", "website", "contact", "title", "phone", "whatsapp", "linkedin", "facebook", "telegram", "notes", "nextFollowUp", "lastContact"].reduce(function (n, k) { return n + (String(c[k] || "").trim() ? 1 : 0); }, 0) + getClientEmails(c, { includeNotes: true }).length + relationSets_1.reduce(function (n, arr) { return n + arr.filter(function (x) { return x.clientId === c.id; }).length * 2; }, 0); };
                try {
                    for (dups_1 = __values(dups), dups_1_1 = dups_1.next(); !dups_1_1.done; dups_1_1 = dups_1.next()) {
                        group = dups_1_1.value;
                        sorted = __spreadArray([], __read(group), false).sort(function (a, b) { return completeness_1(b) - completeness_1(a); });
                        keeper = sorted[0];
                        merged = __assign({}, keeper);
                        try {
                            for (_c = (e_17 = void 0, __values(sorted.slice(1))), _d = _c.next(); !_d.done; _d = _c.next()) {
                                d = _d.value;
                                merged = mergeClientData(merged, d);
                                duplicateIds.add(d.id);
                            }
                        }
                        catch (e_17_1) { e_17 = { error: e_17_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_l = _c.return)) _l.call(_c);
                            }
                            finally { if (e_17) throw e_17.error; }
                        }
                        canonicalizeClientCountry(merged);
                        ops.push({ kind: "update", ref: doc(db, "users", currentUser.uid, "clients", keeper.id), data: __assign(__assign({}, merged), { updatedAt: serverTimestamp() }) });
                        _loop_6 = function (d) {
                            var e_22, _s, e_23, _t;
                            try {
                                for (var relationSets_2 = (e_22 = void 0, __values(relationSets_1)), relationSets_2_1 = relationSets_2.next(); !relationSets_2_1.done; relationSets_2_1 = relationSets_2.next()) {
                                    var arr = relationSets_2_1.value;
                                    try {
                                        for (var _u = (e_23 = void 0, __values(arr.filter(function (x) { return x.clientId === d.id; }))), _v = _u.next(); !_v.done; _v = _u.next()) {
                                            var item = _v.value;
                                            var coll = pathFor(arr === state.communications ? "communication" : arr === state.quotes ? "quote" : arr === state.orders ? "order" : arr === state.samples ? "sample" : arr === state.tasks ? "task" : "file");
                                            ops.push({ kind: "update", ref: doc(db, "users", currentUser.uid, coll, item.id), data: { clientId: keeper.id, updatedAt: serverTimestamp() } });
                                        }
                                    }
                                    catch (e_23_1) { e_23 = { error: e_23_1 }; }
                                    finally {
                                        try {
                                            if (_v && !_v.done && (_t = _u.return)) _t.call(_u);
                                        }
                                        finally { if (e_23) throw e_23.error; }
                                    }
                                }
                            }
                            catch (e_22_1) { e_22 = { error: e_22_1 }; }
                            finally {
                                try {
                                    if (relationSets_2_1 && !relationSets_2_1.done && (_s = relationSets_2.return)) _s.call(relationSets_2);
                                }
                                finally { if (e_22) throw e_22.error; }
                            }
                            ops.push({ kind: "delete", ref: doc(db, "users", currentUser.uid, "clients", d.id) });
                        };
                        try {
                            for (_e = (e_18 = void 0, __values(sorted.slice(1))), _f = _e.next(); !_f.done; _f = _e.next()) {
                                d = _f.value;
                                _loop_6(d);
                            }
                        }
                        catch (e_18_1) { e_18 = { error: e_18_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_m = _e.return)) _m.call(_e);
                            }
                            finally { if (e_18) throw e_18.error; }
                        }
                    }
                }
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (dups_1_1 && !dups_1_1.done && (_k = dups_1.return)) _k.call(dups_1);
                    }
                    finally { if (e_16) throw e_16.error; }
                }
                try {
                    for (_g = __values(state.clients), _h = _g.next(); !_h.done; _h = _g.next()) {
                        c = _h.value;
                        if (duplicateIds.has(c.id))
                            continue;
                        patch = {};
                        emails = getClientEmails(c, { includeNotes: true });
                        stored = extractEmails((c === null || c === void 0 ? void 0 : c.emails) || [], (c === null || c === void 0 ? void 0 : c.email) || "");
                        if (JSON.stringify(emails.map(function (e) { return e.toLowerCase(); }).sort()) !== JSON.stringify(stored.map(function (e) { return e.toLowerCase(); }).sort())) {
                            patch.emails = emails;
                            patch.email = emails[0] || "";
                            repairedEmails++;
                        }
                        code = inferCountryCodeFromClient(c);
                        if (code && resolveCountryCode(c.country) !== code)
                            patch.country = countryDisplayName(code);
                        if (Object.keys(patch).length)
                            ops.push({ kind: "update", ref: doc(db, "users", currentUser.uid, "clients", c.id), data: __assign(__assign({}, patch), { updatedAt: serverTimestamp() }) });
                    }
                }
                catch (e_19_1) { e_19 = { error: e_19_1 }; }
                finally {
                    try {
                        if (_h && !_h.done && (_o = _g.return)) _o.call(_g);
                    }
                    finally { if (e_19) throw e_19.error; }
                }
                _loop_7 = function (i) {
                    var batch;
                    return __generator(this, function (_w) {
                        switch (_w.label) {
                            case 0:
                                batch = writeBatch(db);
                                ops.slice(i, i + 300).forEach(function (op) { return op.kind === "update" ? batch.update(op.ref, op.data) : batch.delete(op.ref); });
                                return [4 /*yield*/, batch.commit()];
                            case 1:
                                _w.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                i = 0;
                _p.label = 2;
            case 2:
                if (!(i < ops.length)) return [3 /*break*/, 5];
                return [5 /*yield**/, _loop_7(i)];
            case 3:
                _p.sent();
                _p.label = 4;
            case 4:
                i += 300;
                return [3 /*break*/, 2];
            case 5: return [4 /*yield*/, autoTrackCountriesFromNames(state.clients.map(function (c) { return countryDisplayName(inferCountryCodeFromClient(c)); }).filter(Boolean))];
            case 6:
                _p.sent();
                sync("ok", "已自动同步");
                alert("\u6E05\u7406\u5B8C\u6210\uFF1A\u5408\u5E76\u5220\u9664 ".concat(duplicateIds.size, " \u6761\u91CD\u590D\u5BA2\u6237\uFF1B\u4FEE\u590D/\u8865\u5168 ").concat(repairedEmails, " \u5BB6\u5BA2\u6237\u7684\u591A\u90AE\u7BB1\uFF1B\u5E76\u81EA\u52A8\u8865\u5168\u53EF\u8BC6\u522B\u56FD\u5BB6\u3002"));
                return [3 /*break*/, 8];
            case 7:
                err_7 = _p.sent();
                console.error(err_7);
                sync("err", "清理失败");
                alert("清理失败：" + err_7.message);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// ============================================================
// 节假日国家管理
// ============================================================
initHolidayCountrySelect();
(_l = $("addHolidayCountryBtn")) === null || _l === void 0 ? void 0 : _l.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    var code, btn;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                code = $("holidayCountrySelect").value;
                if (!code) {
                    alert("请先选择一个国家。");
                    return [2 /*return*/];
                }
                if (!state.holidayCountries.some(function (x) { return x.code === code; })) return [3 /*break*/, 2];
                return [4 /*yield*/, syncHolidayCountry(code, true)];
            case 1:
                _a.sent();
                return [2 /*return*/];
            case 2:
                btn = $("addHolidayCountryBtn");
                btn.disabled = true;
                _a.label = 3;
            case 3:
                _a.trys.push([3, , 5, 6]);
                return [4 /*yield*/, addHolidayCountry(code, { silent: false, source: "手动添加" })];
            case 4:
                _a.sent();
                $("holidayCountrySelect").value = "";
                return [3 /*break*/, 6];
            case 5:
                btn.disabled = false;
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); });
(_m = $("refreshAllHolidaysBtn")) === null || _m === void 0 ? void 0 : _m.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    var btn, _a, _b, c, e_24_1;
    var e_24, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!state.holidayCountries.length) {
                    alert("请先添加国家。");
                    return [2 /*return*/];
                }
                btn = $("refreshAllHolidaysBtn");
                btn.disabled = true;
                _d.label = 1;
            case 1:
                _d.trys.push([1, , 10, 11]);
                _d.label = 2;
            case 2:
                _d.trys.push([2, 7, 8, 9]);
                _a = __values(state.holidayCountries), _b = _a.next();
                _d.label = 3;
            case 3:
                if (!!_b.done) return [3 /*break*/, 6];
                c = _b.value;
                return [4 /*yield*/, syncHolidayCountry(c.code, true)];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5:
                _b = _a.next();
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 9];
            case 7:
                e_24_1 = _d.sent();
                e_24 = { error: e_24_1 };
                return [3 /*break*/, 9];
            case 8:
                try {
                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                }
                finally { if (e_24) throw e_24.error; }
                return [7 /*endfinally*/];
            case 9: return [3 /*break*/, 11];
            case 10:
                btn.disabled = false;
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/];
        }
    });
}); });
// ============================================================
// 10. 搜索
// ============================================================
$("globalSearch").addEventListener("input", function () {
    var q = $("globalSearch").value.trim().toLowerCase();
    if (!q) {
        $("searchResults").classList.remove("show");
        return;
    }
    var items = [];
    state.clients.forEach(function (x) { return items.push({ type: "client", id: x.id, title: x.company, meta: "\u5BA2\u6237 \u00B7 ".concat(x.country || "", " \u00B7 ").concat(x.contact || ""), text: Object.values(x).join(" ") }); });
    state.rfqs.forEach(function (x) { return items.push({ type: "rfq", id: x.id, title: x.rfqNo || "RFQ", meta: "RFQ \u00B7 ".concat(clientName(x.clientId), " \u00B7 ").concat(x.status || ""), text: [x.parts, x.customerNeed, x.notes, x.sourceFile, clientName(x.clientId)].join(" ") }); });
    state.samples.forEach(function (x) { return items.push({ type: "sample", id: x.id, title: x.partNo || "样品", meta: "\u6837\u54C1 \u00B7 ".concat(clientName(x.clientId), " \u00B7 ").concat(x.status || ""), text: [x.tracking, x.internationalTracking, x.forwarderName, x.feedback, x.notes, clientName(x.clientId)].join(" ") }); });
    state.quotes.forEach(function (x) { var detail = Array.isArray(x.items) ? x.items.map(function (i) { return [i.partNo, i.brand, i.qty, i.quotePrice, i.targetPrice, i.notes].filter(Boolean).join(" "); }).join(" ") : ""; items.push({ type: "quote", id: x.id, title: x.batchName || x.partNo || "报价", meta: "\u62A5\u4EF7 \u00B7 ".concat(clientName(x.clientId)), text: Object.values(x).filter(function (v) { return typeof v !== "object"; }).join(" ") + " " + detail + " " + clientName(x.clientId) }); });
    state.orders.forEach(function (x) { return items.push({ type: "order", id: x.id, title: x.piNo || "PI", meta: "\u8BA2\u5355 \u00B7 ".concat(clientName(x.clientId)), text: Object.values(x).join(" ") + " " + clientName(x.clientId) }); });
    state.communications.forEach(function (x) { var _a; return items.push({ type: "communication", id: x.id, title: x.subject || ((_a = x.content) === null || _a === void 0 ? void 0 : _a.slice(0, 28)) || "沟通", meta: "\u6C9F\u901A \u00B7 ".concat(clientName(x.clientId), " \u00B7 ").concat(x.channel || ""), text: Object.values(x).join(" ") + " " + clientName(x.clientId) }); });
    var r = items.filter(function (x) { return (x.title + " " + x.meta + " " + x.text).toLowerCase().includes(q); }).slice(0, 20);
    $("searchResults").innerHTML = r.map(function (x) { return "<div class=\"search-item\" onclick=\"openSearch('".concat(x.type, "','").concat(x.id, "')\"><b>").concat(esc(x.title), "</b><div>").concat(esc(x.meta), "</div></div>"); }).join("") || "<div class=\"search-item\"><div>\u6CA1\u6709\u7ED3\u679C</div></div>";
    $("searchResults").classList.add("show");
});
window.openSearch = function (type, id) {
    $("searchResults").classList.remove("show");
    $("globalSearch").value = "";
    if (type === "client")
        openClient(id);
    else {
        var key = pathFor(type), x = state[key].find(function (v) { return v.id === id; });
        if (x === null || x === void 0 ? void 0 : x.clientId)
            openClient(x.clientId);
    }
};
// ============================================================
// 11. V2.1 JSON 一键迁移
// ============================================================
$("migrationFile").addEventListener("change", function (e) { return __awaiter(void 0, void 0, void 0, function () {
    var f, obj, _a, _b, err_8;
    var _c, _d, _e, _f, _g, _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                f = e.target.files[0];
                if (!f)
                    return [2 /*return*/];
                _l.label = 1;
            case 1:
                _l.trys.push([1, 3, , 4]);
                _b = (_a = JSON).parse;
                return [4 /*yield*/, f.text()];
            case 2:
                obj = _b.apply(_a, [_l.sent()]);
                if (!Array.isArray(obj.clients))
                    throw new Error("不是有效的 V2.1 备份");
                migrationPayload = obj;
                $("migrationPreview").innerHTML = "<div class=\"notice\">\u68C0\u6D4B\u5230\uFF1A\u5BA2\u6237 ".concat(((_c = obj.clients) === null || _c === void 0 ? void 0 : _c.length) || 0, "\u3001\u6C9F\u901A ").concat(((_d = obj.communications) === null || _d === void 0 ? void 0 : _d.length) || 0, "\u3001RFQ ").concat(((_e = obj.rfqs) === null || _e === void 0 ? void 0 : _e.length) || 0, "\u3001\u62A5\u4EF7 ").concat(((_f = obj.quotes) === null || _f === void 0 ? void 0 : _f.length) || 0, "\u3001PI/\u8BA2\u5355 ").concat(((_g = obj.orders) === null || _g === void 0 ? void 0 : _g.length) || 0, "\u3001\u6837\u54C1 ").concat(((_h = obj.samples) === null || _h === void 0 ? void 0 : _h.length) || 0, "\u3001\u4EFB\u52A1 ").concat(((_j = obj.tasks) === null || _j === void 0 ? void 0 : _j.length) || 0, "\u3001\u8282\u5047\u65E5 ").concat(((_k = obj.holidays) === null || _k === void 0 ? void 0 : _k.length) || 0, "\u3002</div>");
                $("migrationBtn").disabled = false;
                return [3 /*break*/, 4];
            case 3:
                err_8 = _l.sent();
                migrationPayload = null;
                $("migrationBtn").disabled = true;
                alert("读取失败：" + err_8.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
$("migrationBtn").addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    var mapping, _loop_8, mapping_1, mapping_1_1, _a, source, target, e_25_1;
    var e_25, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!migrationPayload)
                    return [2 /*return*/];
                if (!confirm("将旧版数据导入到当前 Google 账号云端。确认继续吗？"))
                    return [2 /*return*/];
                sync("busy", "正在迁移数据…");
                mapping = [["clients", "clients"], ["communications", "communications"], ["rfqs", "rfqs"], ["quotes", "quotes"], ["orders", "orders"], ["samples", "samples"], ["tasks", "tasks"], ["holidays", "holidays"]];
                _loop_8 = function (source, target) {
                    var arr, _loop_9, i;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                arr = migrationPayload[source] || [];
                                _loop_9 = function (i) {
                                    var batch;
                                    return __generator(this, function (_e) {
                                        switch (_e.label) {
                                            case 0:
                                                batch = writeBatch(db);
                                                arr.slice(i, i + 400).forEach(function (item) {
                                                    var id = item.id, data = __rest(item, ["id"]);
                                                    var targetRef = id ? doc(db, "users", currentUser.uid, target, String(id)) : doc(refCollection(target));
                                                    batch.set(targetRef, __assign(__assign({}, data), { migratedAt: serverTimestamp() }), { merge: true });
                                                });
                                                return [4 /*yield*/, batch.commit()];
                                            case 1:
                                                _e.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                };
                                i = 0;
                                _d.label = 1;
                            case 1:
                                if (!(i < arr.length)) return [3 /*break*/, 4];
                                return [5 /*yield**/, _loop_9(i)];
                            case 2:
                                _d.sent();
                                _d.label = 3;
                            case 3:
                                i += 400;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                };
                _c.label = 1;
            case 1:
                _c.trys.push([1, 6, 7, 8]);
                mapping_1 = __values(mapping), mapping_1_1 = mapping_1.next();
                _c.label = 2;
            case 2:
                if (!!mapping_1_1.done) return [3 /*break*/, 5];
                _a = __read(mapping_1_1.value, 2), source = _a[0], target = _a[1];
                return [5 /*yield**/, _loop_8(source, target)];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4:
                mapping_1_1 = mapping_1.next();
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 8];
            case 6:
                e_25_1 = _c.sent();
                e_25 = { error: e_25_1 };
                return [3 /*break*/, 8];
            case 7:
                try {
                    if (mapping_1_1 && !mapping_1_1.done && (_b = mapping_1.return)) _b.call(mapping_1);
                }
                finally { if (e_25) throw e_25.error; }
                return [7 /*endfinally*/];
            case 8:
                if (!migrationPayload.settings) return [3 /*break*/, 10];
                return [4 /*yield*/, setDoc(doc(db, "users", currentUser.uid, "settings", "main"), migrationPayload.settings, { merge: true })];
            case 9:
                _c.sent();
                _c.label = 10;
            case 10: return [4 /*yield*/, autoTrackCountriesFromNames((migrationPayload.clients || []).map(function (c) { return c.country; }).filter(Boolean)).catch(console.warn)];
            case 11:
                _c.sent();
                sync("ok", "迁移完成");
                alert("V2.1 数据已迁移到云端。客户国家可识别时，节假日会自动加入同步。");
                return [2 /*return*/];
        }
    });
}); });
// ============================================================
// 12. 设置
// ============================================================
function renderSettings() {
    var _a, _b, _c, _d, _e, _f, _g;
    $("setQuoteDays").value = (_a = state.settings.quoteFollowDays) !== null && _a !== void 0 ? _a : 5;
    if ($("setRfqDays"))
        $("setRfqDays").value = (_b = state.settings.rfqFollowDays) !== null && _b !== void 0 ? _b : 2;
    $("setDormantDays").value = (_c = state.settings.dormantDays) !== null && _c !== void 0 ? _c : 30;
    if ($("setContactNoReplyLimit"))
        $("setContactNoReplyLimit").value = (_d = state.settings.contactNoReplyLimit) !== null && _d !== void 0 ? _d : 3;
    if ($("setContactFollowDays"))
        $("setContactFollowDays").value = (_e = state.settings.contactFollowDays) !== null && _e !== void 0 ? _e : 3;
    $("setWeekend").value = String((_f = state.settings.weekendFollow) !== null && _f !== void 0 ? _f : false);
    $("setCurrency").value = state.settings.currency || "USD";
    if ($("setBackupReminderDays"))
        $("setBackupReminderDays").value = String((_g = state.settings.backupReminderDays) !== null && _g !== void 0 ? _g : 7);
    if ($("setSalesProfiles"))
        $("setSalesProfiles").value = state.settings.salesProfilesText || "";
    renderBackupStatus();
    renderExportLogs();
}
$("saveSettingsBtn").addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                data = {
                    quoteFollowDays: Number($("setQuoteDays").value || 5), rfqFollowDays: Number(((_a = $("setRfqDays")) === null || _a === void 0 ? void 0 : _a.value) || 2), dormantDays: Number($("setDormantDays").value || 30),
                    contactNoReplyLimit: Number(((_b = $("setContactNoReplyLimit")) === null || _b === void 0 ? void 0 : _b.value) || 3), contactFollowDays: Number(((_c = $("setContactFollowDays")) === null || _c === void 0 ? void 0 : _c.value) || 3),
                    weekendFollow: $("setWeekend").value === "true", currency: $("setCurrency").value,
                    backupReminderDays: Number(((_d = $("setBackupReminderDays")) === null || _d === void 0 ? void 0 : _d.value) || 7), salesProfilesText: String(((_e = $("setSalesProfiles")) === null || _e === void 0 ? void 0 : _e.value) || "").trim()
                };
                return [4 /*yield*/, setDoc(doc(db, "users", currentUser.uid, "settings", "main"), data, { merge: true })];
            case 1:
                _f.sent();
                alert("设置已同步。");
                return [2 /*return*/];
        }
    });
}); });
// ============================================================
// 12.1 全量本地备份 + 周期提醒
// ============================================================
function backupPlain(value) {
    if (value === null || value === undefined)
        return value;
    if (Array.isArray(value))
        return value.map(backupPlain);
    if (typeof value === "object") {
        if (typeof value.toDate === "function") {
            try {
                return value.toDate().toISOString();
            }
            catch (_) {
                return String(value);
            }
        }
        var out_1 = {};
        Object.entries(value).forEach(function (_a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            return out_1[k] = backupPlain(v);
        });
        return out_1;
    }
    return value;
}
function backupFileName() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    return "AI\u5916\u8D38\u5DE5\u4F5C\u53F0_\u5168\u91CF\u5907\u4EFD_".concat(d.getFullYear(), "-").concat(pad(d.getMonth() + 1), "-").concat(pad(d.getDate()), "_").concat(pad(d.getHours())).concat(pad(d.getMinutes()), ".json");
}
function buildBackupPayload() {
    return backupPlain({
        backupFormat: "AI-Trade-Workspace-Full-Backup",
        version: "V3.2.2",
        exportedAt: new Date().toISOString(),
        account: { email: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.email) || "", uid: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.uid) || "" },
        clients: state.clients,
        communications: state.communications,
        rfqs: state.rfqs,
        quotes: state.quotes,
        orders: state.orders,
        tasks: state.tasks,
        holidays: state.holidays,
        holidayCountries: state.holidayCountries,
        files: state.files,
        samples: state.samples,
        exportLogs: state.exportLogs,
        settings: state.settings
    });
}
function exportCountSummary() {
    var quoteItems = state.quotes.reduce(function (n, q) { return n + (Array.isArray(q.items) ? q.items.length : 1); }, 0);
    return "\u5BA2\u6237".concat(state.clients.length, " \u00B7 \u6C9F\u901A").concat(state.communications.length, " \u00B7 RFQ").concat(state.rfqs.length, " \u00B7 \u62A5\u4EF7\u578B\u53F7").concat(quoteItems, " \u00B7 PI/\u8BA2\u5355").concat(state.orders.length, " \u00B7 \u6837\u54C1").concat(state.samples.length, " \u00B7 \u4EFB\u52A1").concat(state.tasks.length);
}
function recordExportLog(type, fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var e_26;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, addDoc(refCollection("exportLogs"), { type: type, fileName: fileName, summary: exportCountSummary(), exportedAt: new Date().toISOString(), createdAt: serverTimestamp() })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_26 = _a.sent();
                    console.warn("export log", e_26);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function renderExportLogs() {
    var el = $("exportLogList");
    if (!el)
        return;
    var rows = state.exportLogs.slice().sort(function (a, b) { return String(b.exportedAt || "").localeCompare(String(a.exportedAt || "")); }).slice(0, 20);
    el.innerHTML = rows.length ? rows.map(function (x) { var d = new Date(x.exportedAt || ""); var when = Number.isNaN(d.getTime()) ? (x.exportedAt || "") : "".concat(d.getFullYear(), "/").concat(d.getMonth() + 1, "/").concat(d.getDate(), " ").concat(String(d.getHours()).padStart(2, "0"), ":").concat(String(d.getMinutes()).padStart(2, "0")); return "<div class=\"export-log\"><div><b>".concat(esc(x.type || "导出"), "</b><div class=\"item-meta\">").concat(esc(x.fileName || ""), "</div></div><div style=\"text-align:right\"><div>").concat(esc(when), "</div><div class=\"item-meta\">").concat(esc(x.summary || ""), "</div></div></div>"); }).join("") : "暂无导出记录。";
}
function downloadBlob(blob, fileName) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { return URL.revokeObjectURL(url); }, 3000);
}
function businessExcelFileName() {
    var d = new Date(), pad = function (n) { return String(n).padStart(2, "0"); };
    return "AI\u5916\u8D38\u5DE5\u4F5C\u53F0_\u4E1A\u52A1\u6570\u636E_".concat(d.getFullYear(), "-").concat(pad(d.getMonth() + 1), "-").concat(pad(d.getDate()), "_").concat(pad(d.getHours())).concat(pad(d.getMinutes()), ".xlsx");
}
function exportBusinessExcel() {
    if (!currentUser)
        return alert("请先登录。");
    if (!window.XLSX)
        return alert("Excel组件没有加载，请刷新页面后重试。");
    try {
        var wb_1 = XLSX.utils.book_new();
        var clients = state.clients.map(function (c) { return ({ 客户: c.company || "", 国家: c.country || "", 城市: c.city || "", 跟进业务员: c.ownerSalesperson || "", 我方公司: c.ownerCompany || "", 跟进邮箱: c.ownerEmail || "", 等级: c.grade || "", 状态: c.status || "", 客户类型: c.customerType || "", 行业: c.industry || "", 开发来源: c.source || "", 联系人: c.contact || "", 邮箱: getClientEmails(c, { includeNotes: true }).join("; "), 电话: c.phone || "", WhatsApp: c.whatsapp || "", 官网: c.website || "", 采购特点痛点: c.procurementPain || "", 付款习惯: c.paymentHabit || "", 物流习惯: c.logisticsHabit || "", 价格敏感度: c.priceSensitivity || "", 最后联系: c.lastContact || "", 下次跟进: c.nextFollowUp || "", 备注: c.notes || "" }); });
        var rfqs = state.rfqs.map(function (r) { return ({ 日期: r.requestDate || "", 客户: clientName(r.clientId), RFQ: r.rfqNo || "", 型号数: r.itemCount || 0, 主要型号: r.parts || "", 状态: r.status || "", 客户需求: r.customerNeed || "", 原始文件: r.sourceFile || "", 下次跟进: r.nextFollowUp || "", 备注: r.notes || "" }); });
        var comms = state.communications.map(function (x) { return ({ 日期: x.date || "", 客户: clientName(x.clientId), 邮箱: x.contactEmail || "", 渠道: x.channel || "", 方向: x.direction || "", 主题: x.subject || "", 沟通内容: x.content || "", 反馈类型: x.feedbackType || "", 客户反馈: x.customerFeedback || "", 下一步: x.nextAction || "", 下次跟进: x.nextFollowUp || "" }); });
        var quotes_1 = [];
        state.quotes.forEach(function (q) {
            if (Array.isArray(q.items) && q.items.length)
                q.items.forEach(function (i, idx) { return quotes_1.push({ 报价日期: q.quoteDate || "", 客户: clientName(q.clientId), 报价单: q.batchName || "", 序号: idx + 1, 型号: i.partNo || "", 品牌: i.brand || "", 数量: i.qty || "", 目标价: i.targetPrice || "", 报价: i.quotePrice || "", 币种: i.currency || q.currency || "", DC: i.dc || "", 交期: i.leadTime || "", 状态: i.status || q.status || "", 备注: i.notes || "" }); });
            else
                quotes_1.push({ 报价日期: q.quoteDate || "", 客户: clientName(q.clientId), 报价单: "", 序号: 1, 型号: q.partNo || "", 品牌: q.brand || "", 数量: q.qty || "", 目标价: q.targetPrice || "", 报价: q.quotePrice || "", 币种: q.currency || "", DC: q.dc || "", 交期: q.leadTime || "", 状态: q.status || "", 备注: q.notes || "" });
        });
        var orders = state.orders.map(function (o) { return ({ PI: o.piNo || "", 客户: clientName(o.clientId), 金额: o.amount || 0, 币种: o.currency || "", 付款方式: o.paymentTerms || "", 应付首款: o.depositDue || 0, 已付: o.paidAmount || 0, 待付余额: o.balanceDue || 0, 承诺付款: o.promisedPayDate || "", 付款状态: o.paymentStatus || "", 订单状态: o.orderStatus || "", PI日期: o.piDate || "", 交期: o.deliveryDate || "", 运输方式: o.shippingMode || "", 货代: o.forwarder || "", 交中国仓: o.chinaWarehouseDate || "", 国际出运: o.internationalShipDate || "", 物流: o.shipping || "", 运单号: o.tracking || "", 清关状态: o.customsStatus || "", 预计到达: o.expectedArrival || "", 实际签收: o.receivedDate || "", 备注: o.notes || "" }); });
        var samples = state.samples.map(function (x) { return ({ 客户: clientName(x.clientId), 样品型号: x.partNo || x.itemName || "", 数量: x.qty || "", 交付方式: x.deliveryMode || "", 客户提出日期: x.requestDate || "", 我司寄出日期: x.sentDate || "", 国内物流: x.carrier || "", 国内运单号: x.tracking || "", 客户货代: x.forwarderName || "", 货代收货日期: x.forwarderArrivalDate || "", 预计集货出运日期: x.consolidationDueDate || "", 国际出运日期: x.internationalShipDate || "", 国际物流: x.internationalCarrier || "", 国际运单号: x.internationalTracking || "", 状态: x.status || "", 预计客户收货: x.expectedArrival || "", 预计反馈: x.feedbackDueDate || "", 实际反馈日期: x.feedbackDate || "", 反馈结论: x.feedbackResult || "", 客户反馈: x.feedback || "", 下一步: x.nextAction || "", 下次跟进: x.nextFollowUp || "", 备注: x.notes || "" }); });
        var tasks = state.tasks.map(function (t) { return ({ 任务: t.title || "", 优先级: t.priority || "", 到期日期: t.dueDate || "", 客户: t.clientId ? clientName(t.clientId) : "", 完成: t.done ? "是" : "否", 备注: t.notes || "" }); });
        [["客户", clients], ["沟通", comms], ["RFQ询价", rfqs], ["报价明细", quotes_1], ["PI订单", orders], ["样品跟进", samples], ["任务", tasks]].forEach(function (_a) {
            var _b = __read(_a, 2), name = _b[0], rows = _b[1];
            return XLSX.utils.book_append_sheet(wb_1, XLSX.utils.json_to_sheet(rows), name);
        });
        var fileName = businessExcelFileName();
        XLSX.writeFile(wb_1, fileName);
        recordExportLog("业务数据 Excel", fileName);
        alert("业务数据 Excel 已导出。浏览器通常会保存到“下载”文件夹；导出记录已写入设置页。");
    }
    catch (err) {
        console.error(err);
        alert("导出 Excel 失败：" + ((err === null || err === void 0 ? void 0 : err.message) || err));
    }
}
function exportFullBackup() {
    return __awaiter(this, void 0, void 0, function () {
        var payload, blob, fileName, now, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentUser)
                        return [2 /*return*/, alert("请先登录后再备份。")];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    payload = buildBackupPayload();
                    blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
                    fileName = backupFileName();
                    downloadBlob(blob, fileName);
                    now = new Date().toISOString();
                    return [4 /*yield*/, setDoc(doc(db, "users", currentUser.uid, "settings", "main"), { lastBackupAt: now }, { merge: true })];
                case 2:
                    _a.sent();
                    state.settings.lastBackupAt = now;
                    return [4 /*yield*/, recordExportLog("JSON全量备份", fileName)];
                case 3:
                    _a.sent();
                    sessionStorage.setItem("backupBannerDismissed", "");
                    renderBackupStatus();
                    alert("全量备份已生成。请把下载的 JSON 文件保存在电脑，并建议再复制一份到网盘。");
                    return [3 /*break*/, 5];
                case 4:
                    err_9 = _a.sent();
                    console.error("backup failed", err_9);
                    alert("备份失败：" + ((err_9 === null || err_9 === void 0 ? void 0 : err_9.message) || err_9));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function backupAgeDays() {
    var last = state.settings.lastBackupAt;
    if (!last)
        return Infinity;
    var t = new Date(last).getTime();
    if (!Number.isFinite(t))
        return Infinity;
    return Math.floor((Date.now() - t) / 86400000);
}
function renderBackupStatus() {
    var last = state.settings.lastBackupAt;
    if ($("lastBackupText")) {
        if (!last)
            $("lastBackupText").textContent = "尚未做过本地全量备份";
        else {
            var d = new Date(last);
            $("lastBackupText").textContent = Number.isNaN(d.getTime()) ? "已备份" : "".concat(d.getFullYear(), "/").concat(d.getMonth() + 1, "/").concat(d.getDate(), " ").concat(String(d.getHours()).padStart(2, "0"), ":").concat(String(d.getMinutes()).padStart(2, "0"));
        }
    }
    var banner = $("backupReminderBanner"), text = $("backupReminderText");
    if (!banner || !text)
        return;
    var days = Number(state.settings.backupReminderDays || 7);
    var age = backupAgeDays();
    var dismissed = sessionStorage.getItem("backupBannerDismissed") === "1";
    var due = age >= days;
    banner.style.display = due && !dismissed ? "flex" : "none";
    if (age === Infinity)
        text.textContent = "\u5F53\u524D\u8D26\u53F7\u8FD8\u6CA1\u6709\u672C\u5730\u5168\u91CF\u5907\u4EFD\u3002\u5EFA\u8BAE\u73B0\u5728\u5907\u4EFD\uFF0C\u4EE5\u540E\u6BCF ".concat(days, " \u5929\u63D0\u9192\u4E00\u6B21\u3002");
    else
        text.textContent = "\u8DDD\u79BB\u4E0A\u6B21\u672C\u5730\u5907\u4EFD\u5DF2\u7ECF ".concat(age, " \u5929\uFF0C\u5DF2\u8FBE\u5230 ").concat(days, " \u5929\u63D0\u9192\u5468\u671F\u3002");
}
function checkBackupReminder() { renderBackupStatus(); }
(_o = $("exportFullBackupBtn")) === null || _o === void 0 ? void 0 : _o.addEventListener("click", exportFullBackup);
(_p = $("exportBusinessExcelBtn")) === null || _p === void 0 ? void 0 : _p.addEventListener("click", exportBusinessExcel);
(_q = $("backupNowBannerBtn")) === null || _q === void 0 ? void 0 : _q.addEventListener("click", exportFullBackup);
(_r = $("dismissBackupBannerBtn")) === null || _r === void 0 ? void 0 : _r.addEventListener("click", function () { sessionStorage.setItem("backupBannerDismissed", "1"); renderBackupStatus(); });
// ============================================================
// 13. 本地数据助手
// ============================================================
$("sendChatBtn").addEventListener("click", sendChat);
$("chatInput").addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChat();
} });
function addMsg(text, role) { var d = document.createElement("div"); d.className = "msg " + role; d.textContent = text; $("chatLog").appendChild(d); $("chatLog").scrollTop = $("chatLog").scrollHeight; }
function sendChat() {
    var q = $("chatInput").value.trim();
    if (!q)
        return;
    addMsg(q, "user");
    $("chatInput").value = "";
    setTimeout(function () { return addMsg(localAnswer(q), "ai"); }, 120);
}
function localAnswer(q) {
    var s = q.toLowerCase(), f = getFollowups();
    if ((s.includes("今天") || s.includes("先")) && (s.includes("跟进") || s.includes("做"))) {
        return f.length ? "今天建议：\n" + f.slice(0, 8).map(function (x, i) { return "".concat(i + 1, ". ").concat(x.title, " \u2014 ").concat(x.meta); }).join("\n") : "今天没有到期跟进。";
    }
    if (s.includes("pi") || s.includes("付款")) {
        var a = state.orders.filter(function (o) { return ["未付款", "部分付款"].includes(o.paymentStatus); });
        return a.length ? "待付款：\n" + a.map(function (o, i) { return "".concat(i + 1, ". ").concat(o.piNo || "PI", " \u00B7 ").concat(clientName(o.clientId), " \u00B7 ").concat(o.amount || 0, " ").concat(o.currency || state.settings.currency); }).join("\n") : "当前没有待付款 PI。";
    }
    if (s.includes("报价")) {
        var a = f.filter(function (x) { return x.type === "quote"; });
        return a.length ? "需要跟进的报价：\n" + a.map(function (x, i) { return "".concat(i + 1, ". ").concat(x.title, " \u00B7 ").concat(x.meta); }).join("\n") : "当前没有到期报价。";
    }
    return "\u5F53\u524D\u4E91\u7AEF\u6709 ".concat(state.clients.length, " \u5BB6\u5BA2\u6237\u3001").concat(state.communications.length, " \u6761\u6C9F\u901A\u8BB0\u5F55\u3001").concat(state.rfqs.length, " \u4E2A RFQ\u3001").concat(state.quotes.length, " \u4EFD\u62A5\u4EF7\u3001").concat(state.orders.length, " \u4E2A PI/\u8BA2\u5355\u3002");
}
// ============================================================
// 14. 帮助、弹窗、PWA
// ============================================================
var helpText = {
    followups: "跟进中心会单独提示待开发、第1次/第2次/最后一次开发、退信无效、3次无回复换联系人，以及 RFQ、报价、样品、PI付款等到期事项。",
    tasks: "任务中心用于管理每日开发、WhatsApp、Facebook 和客户跟进任务。",
    files: "V3 免费版不使用 Firebase Storage。把 PI、报价、Datasheet、图片等上传到 Google Drive / OneDrive / WPS 云盘，再把共享链接保存到客户档案，链接会在电脑和手机之间自动同步。",
};
document.querySelectorAll(".help").forEach(function (b) { return b.addEventListener("click", function () { $("helpBody").textContent = helpText[b.dataset.help] || "暂无说明。"; $("helpModal").classList.add("show"); }); });
window.closeModal = function (id) { return $(id).classList.remove("show"); };
document.querySelectorAll(".modal-bg").forEach(function (x) { return x.addEventListener("click", function (e) { if (e.target === x)
    x.classList.remove("show"); }); });
document.addEventListener("click", function (e) { if (innerWidth <= 820 && !e.target.closest(".sidebar") && !e.target.closest("#menuBtn"))
    $("sidebar").classList.remove("open"); });
// V3.2.4 老电脑兼容版：暂不注册 Service Worker，避免旧缓存影响登录与升级。


// ============================================================
// V3.2.7：原生文件选择 + RFQ Excel 批量导入
// ============================================================
var rfqImportRows = [];
var rfqImportFileName = "";

var rfqAliases326 = {
    company: ["客户", "客户名称", "公司", "公司名称", "customer", "client", "company", "company name"],
    email: ["邮箱", "电子邮箱", "email", "e-mail"],
    partNo: ["型号", "料号", "物料号", "产品型号", "part no", "part no.", "part number", "mpn", "pn", "p/n", "model"],
    brand: ["品牌", "厂家", "制造商", "brand", "manufacturer", "mfr"],
    qty: ["数量", "需求数量", "采购数量", "qty", "quantity", "q'ty"],
    targetPrice: ["目标价", "目标价格", "target price", "target", "tp"],
    requiredDate: ["要求日期", "需求日期", "交期要求", "要求交期", "need date", "required date", "delivery date", "required delivery"],
    description: ["描述", "规格", "品名", "产品描述", "description", "desc", "spec", "specification"],
    notes: ["备注", "说明", "note", "notes", "remark", "remarks"]
};
var rfqAliasLookup326 = (function () {
    var m = new Map();
    Object.keys(rfqAliases326).forEach(function (f) {
        rfqAliases326[f].forEach(function (x) { m.set(normalizeHeader(x), f); });
    });
    return m;
})();
function rfqFieldForHeader326(h) { return rfqAliasLookup326.get(normalizeHeader(h)) || null; }
function detectRfqHeaderRow326(matrix) {
    var best = { idx: 0, score: -1, fields: [] };
    for (var i = 0; i < Math.min(matrix.length, 20); i++) {
        var fields = (matrix[i] || []).map(rfqFieldForHeader326).filter(Boolean);
        var score = fields.length + (fields.indexOf("partNo") >= 0 ? 6 : 0) + (fields.indexOf("qty") >= 0 ? 2 : 0) + (fields.indexOf("brand") >= 0 ? 1 : 0);
        if (score > best.score) best = { idx: i, score: score, fields: fields };
    }
    return best;
}
function rowToRfqItem326(headers, row) {
    var o = {};
    headers.forEach(function (h, i) {
        var f = rfqFieldForHeader326(h);
        if (f && row[i] !== undefined && row[i] !== null && String(row[i]).trim() !== "") o[f] = String(row[i]).trim();
    });
    o.partNo = String(o.partNo || "").trim();
    o.brand = String(o.brand || "").trim();
    o.qty = String(o.qty || "").trim();
    return o;
}
function fillRfqClientOptions326() {
    var sel = $("rfqImportClient");
    if (!sel) return;
    sel.innerHTML = '<option value="">请选择客户</option>' + state.clients.slice().sort(function (a, b) { return (a.company || "").localeCompare(b.company || ""); }).map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.company) + (c.country ? ' · ' + esc(c.country) : '') + '</option>';
    }).join("");
}
function resetRfqImport326() {
    rfqImportRows = [];
    rfqImportFileName = "";
    fillRfqClientOptions326();
    if ($("rfqImportDate")) $("rfqImportDate").value = todayISO();
    if ($("rfqImportNo")) $("rfqImportNo").value = "";
    if ($("rfqFileInput")) $("rfqFileInput").value = "";
    if ($("rfqImportStatus")) $("rfqImportStatus").textContent = "尚未选择文件。";
    if ($("rfqImportSummary")) $("rfqImportSummary").innerHTML = "";
    if ($("rfqImportPreview")) $("rfqImportPreview").innerHTML = "";
    if ($("rfqImportBtn")) $("rfqImportBtn").disabled = true;
}
function waitForXlsx326(timeoutMs) {
    return new Promise(function (resolve, reject) {
        if (window.XLSX) { resolve(window.XLSX); return; }
        var started = Date.now();
        var timer = setInterval(function () {
            if (window.XLSX) { clearInterval(timer); resolve(window.XLSX); return; }
            if (Date.now() - started >= timeoutMs) { clearInterval(timer); reject(new Error("Excel解析组件尚未加载完成。请保持联网，等待几秒后重新选择文件；也可以把 Excel 另存为 CSV 后导入。")); }
        }, 250);
    });
}
async function readRfqExcelFile326(file) {
    var status = $("rfqImportStatus");
    try {
        var name = (file.name || "").toLowerCase();
        if (!/\.(xlsx|xls|csv)$/.test(name)) throw new Error("只支持 .xlsx / .xls / .csv 文件。");
        rfqImportFileName = file.name || "询价表";
        status.textContent = "正在读取询价表……";
        var matrix = [];
        if (name.endsWith(".csv")) {
            var text = await file.text();
            if (window.XLSX) {
                var wb0 = XLSX.read(text, { type: "string" });
                matrix = XLSX.utils.sheet_to_json(wb0.Sheets[wb0.SheetNames[0]], { header: 1, defval: "", raw: false, blankrows: false });
            } else {
                matrix = text.split(/\r?\n/).filter(Boolean).map(function (line) { return line.split(","); });
            }
        } else {
            await waitForXlsx326(8000);
            var data = await file.arrayBuffer();
            var wb = XLSX.read(data, { type: "array", cellDates: true });
            var ws = wb.Sheets[wb.SheetNames[0]];
            matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false, blankrows: false });
        }
        if (!matrix.length) throw new Error("询价表为空。");
        var detected = detectRfqHeaderRow326(matrix);
        var headers = (matrix[detected.idx] || []).map(function (x) { return String(x || "").trim(); });
        var fields = headers.map(rfqFieldForHeader326).filter(Boolean);
        if (fields.indexOf("partNo") < 0) throw new Error("没有识别到“型号 / 料号 / Part No / MPN”列。");
        var rows = matrix.slice(detected.idx + 1).map(function (r) { return rowToRfqItem326(headers, r); }).filter(function (x) { return x.partNo || x.notes || x.description; });
        if (!rows.length) throw new Error("没有读取到有效询价行。");
        var bytes = new Blob([JSON.stringify(rows)]).size;
        if (rows.length > 800 || bytes > 700000) throw new Error("这张询价表数据较大（" + rows.length + " 行）。为了避免超过云端单条记录限制，请拆成两张 Excel 再导入。");
        rfqImportRows = rows;
        status.textContent = "已读取 " + file.name + "：识别表头在第 " + (detected.idx + 1) + " 行，共 " + rows.length + " 个型号。";
        var brands = {};
        var withQty = 0;
        rows.forEach(function (x) { if (x.brand) brands[x.brand] = 1; if (x.qty) withQty++; });
        $("rfqImportSummary").innerHTML = '<div><b>' + rows.length + '</b><br><span class="item-meta">询价型号数</span></div><div><b>' + withQty + '</b><br><span class="item-meta">有数量</span></div><div><b>' + Object.keys(brands).length + '</b><br><span class="item-meta">品牌数</span></div><div><b>' + fields.length + '</b><br><span class="item-meta">识别字段</span></div>';
        $("rfqImportPreview").innerHTML = '<div class="table-wrap"><table><thead><tr><th>型号</th><th>品牌</th><th>数量</th><th>目标价</th><th>需求日期</th><th>描述/备注</th></tr></thead><tbody>' + rows.slice(0, 10).map(function (x) {
            return '<tr><td><b>' + esc(x.partNo || '') + '</b></td><td>' + esc(x.brand || '') + '</td><td>' + esc(x.qty || '') + '</td><td>' + esc(x.targetPrice || '') + '</td><td>' + esc(x.requiredDate || '') + '</td><td>' + esc(x.description || x.notes || '') + '</td></tr>';
        }).join('') + '</tbody></table></div>' + (rows.length > 10 ? '<div class="item-meta" style="margin-top:6px">仅预览前 10 行，共 ' + rows.length + ' 行。</div>' : '');
        $("rfqImportBtn").disabled = false;
    } catch (err) {
        rfqImportRows = [];
        $("rfqImportBtn").disabled = true;
        $("rfqImportPreview").innerHTML = "";
        $("rfqImportSummary").innerHTML = "";
        status.textContent = "读取失败：" + (err && err.message ? err.message : String(err));
    }
}

(function initV326Imports() {
    var openBtn = $("openRfqImportBtn");
    if (openBtn) openBtn.addEventListener("click", function () { resetRfqImport326(); $("rfqImportModal").classList.add("show"); });
    var input = $("rfqFileInput");
    if (input) input.addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; if (f) readRfqExcelFile326(f); });
    var drop = $("rfqDropZone");
    if (drop) {
        ["dragenter", "dragover"].forEach(function (evt) { drop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); drop.classList.add("dragover"); }); });
        ["dragleave", "drop"].forEach(function (evt) { drop.addEventListener(evt, function (e) { e.preventDefault(); e.stopPropagation(); drop.classList.remove("dragover"); }); });
        drop.addEventListener("drop", function (e) { var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) readRfqExcelFile326(f); });
    }
    var importBtn = $("rfqImportBtn");
    if (importBtn) importBtn.addEventListener("click", async function () {
        try {
            if (!rfqImportRows.length) return;
            var clientId = $("rfqImportClient").value;
            if (!clientId) { alert("请先选择这张询价表属于哪个客户。"); return; }
            var requestDate = $("rfqImportDate").value || todayISO();
            var title = String($("rfqImportNo").value || "").trim();
            if (!title) title = rfqImportFileName.replace(/\.(xlsx|xls|csv)$/i, "") || ("RFQ " + requestDate);
            importBtn.disabled = true;
            importBtn.textContent = "正在导入……";
            var parts = rfqImportRows.slice(0, 30).map(function (x) { return x.partNo; }).filter(Boolean).join(", ");
            await addDoc(refCollection("rfqs"), {
                clientId: clientId,
                rfqNo: title,
                subject: title,
                requestDate: requestDate,
                itemCount: rfqImportRows.length,
                items: rfqImportRows,
                parts: parts,
                sourceFile: rfqImportFileName,
                status: "待报价",
                customerNeed: "Excel批量导入，共 " + rfqImportRows.length + " 个型号",
                nextFollowUp: addDays(requestDate, state.settings.rfqFollowDays || 2),
                notes: "Excel批量导入询价：" + rfqImportFileName,
                batchImport: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            closeModal("rfqImportModal");
            alert("询价导入成功：" + rfqImportRows.length + " 个型号已保存为 1 个 RFQ。客户页面只显示摘要，不会铺满几百行。");
        } catch (err) {
            alert("询价导入失败：" + (err && err.message ? err.message : String(err)));
        } finally {
            if (importBtn) { importBtn.disabled = false; importBtn.textContent = "导入询价到云端"; }
        }
    });

    // 老电脑提示：实际文件选择使用浏览器原生 input，不再依赖点击白框。
    var qInput = $("quoteFileInput");
    if (qInput) qInput.title = "点击浏览电脑并选择报价 Excel";
    var cInput = $("excelFileInput");
    if (cInput) cInput.title = "点击浏览电脑并选择客户 Excel";
})();
