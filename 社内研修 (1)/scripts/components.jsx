/* ============================================================
   components.jsx — アイコン / 共通アトム / ヘルパ
   ============================================================ */

/* ---- Inline SVG icons (line, currentColor) ---- */
function Icon(props) {
  var paths = {
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.4"/><circle cx="3.5" cy="12" r="1.4"/><circle cx="3.5" cy="18" r="1.4"/></>,
    calendar: <><rect x="3" y="4.5" width="18" height="16" rx="1.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/></>,
    chart: <><line x1="4" y1="20" x2="20" y2="20"/><rect x="5.5" y="11" width="3.2" height="7"/><rect x="10.4" y="6.5" width="3.2" height="11.5"/><rect x="15.3" y="13.5" width="3.2" height="4.5"/></>,
    gear: <><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.4M12 19.1v2.4M21.5 12h-2.4M4.9 12H2.5M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7L17 17M7 7L5.3 5.3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></>,
    user: <><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/></>,
    users: <><circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.2 2.7-5.4 6-5.4s6 2.2 6 5.4"/><path d="M16 5.2a3.2 3.2 0 0 1 0 6.1M18 13.6c2.4.4 4 2.3 4 5.4"/></>,
    pin: <><path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></>,
    clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/></>,
    video: <><rect x="2.5" y="6" width="13" height="12" rx="1.6"/><path d="M15.5 10.5 21.5 7v10l-6-3.5z"/></>,
    arrowR: <><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></>,
    arrowL: <><line x1="20" y1="12" x2="5" y2="12"/><polyline points="11 6 5 12 11 18"/></>,
    chevL: <polyline points="15 5 8 12 15 19"/>,
    chevR: <polyline points="9 5 16 12 9 19"/>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x: <><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>,
    edit: <><path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"/><line x1="13.5" y1="6.5" x2="17.5" y2="10.5"/></>,
    trash: <><polyline points="4 7 20 7"/><path d="M9 7V4.5h6V7M6 7l1 13h10l1-13"/></>,
    check: <polyline points="4 12.5 9.5 18 20 6.5"/>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><polyline points="8 12.2 11 15 16 9"/></>,
    lock: <><rect x="5" y="10.5" width="14" height="10" rx="1.6"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></>,
    link: <><path d="M9.5 14.5 14.5 9.5M8 11l-2 2a3.5 3.5 0 0 0 5 5l2-2M16 13l2-2a3.5 3.5 0 0 0-5-5l-2 2"/></>,
    cal2: <><rect x="3" y="4.5" width="18" height="16" rx="1.5"/><line x1="3" y1="9" x2="21" y2="9"/></>,
    tag: <><path d="M3.5 12.5 11 5h7.5v7.5L11 20z"/><circle cx="15.5" cy="8.5" r="1.3"/></>,
    download: <><path d="M12 4v11"/><polyline points="7 11 12 16 17 11"/><line x1="5" y1="20" x2="19" y2="20"/></>
  };
  var size = props.size || 24;
  return (
    <svg className={"nico " + (props.className || "")} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={props.weight || 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[props.name]}
    </svg>
  );
}

/* ---- Store subscription hook: re-render on any data change ---- */
function useStore() {
  var tick = React.useState(0);
  React.useEffect(function () {
    return window.Store.subscribe(function () { tick[1](function (n) { return n + 1; }); });
  }, []);
  return window.Store;
}

/* ---- Date helpers ---- */
var DOW = ["日", "月", "火", "水", "木", "金", "土"];
var MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDate(s) {
  // "2026-06-15" -> Date (local)
  var p = (s || "").split("-");
  return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
}
function fmtDay(s) { return parseDate(s).getDate(); }
function fmtMonEn(s) { return MON_EN[parseDate(s).getMonth()]; }
function fmtDow(s) { return DOW[parseDate(s).getDay()]; }
function fmtFull(s) {
  var d = parseDate(s);
  return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日（" + DOW[d.getDay()] + "）";
}
function isPast(s, end) {
  var d = parseDate(s);
  var now = new Date();
  // 当日は終了時刻まで未来扱い（簡易に翌0時で判定）
  return d.setHours(23, 59) < now.getTime();
}
function todayISO() {
  var d = new Date();
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

/* ---- Atoms ---- */
function FormatBadge(props) {
  var online = props.format === "オンライン";
  return (
    <span className={"fmt" + (online ? " online" : "")}>
      <Icon name={online ? "video" : "pin"} />
      {props.format}
    </span>
  );
}

function StatusPill(props) {
  var map = { "参加": "pill-ok", "未定": "pill-maybe", "不参加": "pill-no" };
  return <span className={"pill " + (map[props.status] || "pill-no")}><span className="pdot"></span>{props.status}</span>;
}

function AudienceTags(props) {
  return (
    <div className="tcard-auds" style={props.style}>
      {(props.audiences || []).map(function (a, i) {
        return <span className="tag tag-aud" key={i}><Icon name="tag" size={11} weight={1.8} />{a}</span>;
      })}
    </div>
  );
}

function Avatar(props) {
  var ch = (props.name || "?").trim().charAt(0);
  return <div className={props.cls || "att-av"} style={props.style}>{ch}</div>;
}

function Toast(props) {
  React.useEffect(function () {
    var t = setTimeout(props.onDone, 2400);
    return function () { clearTimeout(t); };
  }, []);
  return <div className="toast"><Icon name="checkCircle" />{props.msg}</div>;
}

/* expose */
Object.assign(window, {
  Icon: Icon, FormatBadge: FormatBadge, StatusPill: StatusPill,
  AudienceTags: AudienceTags, Avatar: Avatar, Toast: Toast, useStore: useStore,
  DOW: DOW, MON_EN: MON_EN, parseDate: parseDate, fmtDay: fmtDay,
  fmtMonEn: fmtMonEn, fmtDow: fmtDow, fmtFull: fmtFull, isPast: isPast, todayISO: todayISO
});
