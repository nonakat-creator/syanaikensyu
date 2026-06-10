/* ============================================================
   app.jsx — ルーティング / ナビゲーション / ルート
   ============================================================ */
function useHashRoute() {
  function parse() {
    var h = location.hash.replace(/^#\/?/, "");
    var parts = h.split("/").filter(Boolean);
    return { view: parts[0] || "list", id: parts[1] || null };
  }
  var route = React.useState(parse());
  React.useEffect(function () {
    function on() { route[1](parse()); window.scrollTo(0, 0); }
    window.addEventListener("hashchange", on);
    return function () { window.removeEventListener("hashchange", on); };
  }, []);
  return route[0];
}

var NAV = [
  { key: "list", ja: "一覧", en: "List", icon: "list" },
  { key: "calendar", ja: "カレンダー", en: "Calendar", icon: "calendar" },
  { key: "stats", ja: "集計", en: "Insights", icon: "chart" },
  { key: "admin", ja: "管理", en: "Admin", icon: "gear" }
];

function App() {
  var Store = useStore();
  var route = useHashRoute();
  var toastMsg = React.useState(null);
  var meOpen = React.useState(false);
  var me = Store.getMe();

  function go(path) { location.hash = "#/" + path; }
  function toast(msg) { toastMsg[1](msg); }

  var active = route.view;
  var view;
  if (active === "calendar") view = <CalendarView go={go} />;
  else if (active === "stats") view = <StatsView go={go} />;
  else if (active === "admin") view = <AdminView go={go} toast={toast} />;
  else if (active === "training") view = <DetailView id={route.id} go={go} toast={toast} />;
  else view = <ListView go={go} />;

  var navActiveKey = active === "training" ? "list" : active;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" onClick={function () { go("list"); }} style={{ cursor: "pointer" }}>
          <span className="brand-mark">SLMC<span className="dot">.</span></span>
          <span className="brand-sub hide-sm">日吉港北十日市場地域</span>
        </div>

        <nav className="nav-desktop">
          {NAV.map(function (n) {
            return (
              <a key={n.key} className={"nav-link" + (navActiveKey === n.key ? " active" : "")} onClick={function () { go(n.key); }}>
                <Icon name={n.icon} className="nico" />{n.ja}<span className="nlabel-en">{n.en}</span>
              </a>
            );
          })}
        </nav>

        <div className="topbar-right">
          <button className="me-chip" onClick={function () { meOpen[1](true); }}>
            {me.name ? <span className="me-avatar">{me.name.charAt(0)}</span> : <Icon name="user" size={16} />}
            {me.name ? <span>{me.name}</span> : <span className="me-empty">名前を設定</span>}
          </button>
        </div>
      </header>

      {view}

      <div className="foot-note">
        <span className="label-en">Internal Training Schedule</span>
        社内研修スケジュール · データはお使いのブラウザに保存されます · URLで画面を共有できます
      </div>

      <nav className="nav-mobile">
        <div className="nav-mobile-inner">
          {NAV.map(function (n) {
            return (
              <button key={n.key} className={"mtab" + (navActiveKey === n.key ? " active" : "")} onClick={function () { go(n.key); }}>
                <Icon name={n.icon} className="nico" /><span>{n.ja}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {meOpen[0] ? <MeModal onClose={function () { meOpen[1](false); }} toast={toast} /> : null}
      {toastMsg[0] ? <Toast msg={toastMsg[0]} onDone={function () { toastMsg[1](null); }} /> : null}
    </div>
  );
}

function MeModal(props) {
  var Store = window.Store;
  var me = Store.getMe();
  var name = React.useState(me.name || "");
  var dept = React.useState(me.dept || "");
  function save() {
    Store.setMe({ name: name[0].trim(), dept: dept[0] });
    props.toast(name[0].trim() ? "プロフィールを保存しました" : "プロフィールをクリアしました");
    props.onClose();
  }
  return (
    <div className="modal-scrim" onMouseDown={function (e) { if (e.target === e.currentTarget) props.onClose(); }}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-head">
          <div><span className="label-en">Your profile</span><h2>あなたの情報</h2></div>
          <button className="modal-x" onClick={props.onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--ink-mute)", fontSize: "var(--step--1)", marginBottom: 18, lineHeight: 1.8 }}>
            登録しておくと、参加表明のときに氏名・部署が自動で入ります。
          </p>
          <div className="field">
            <label>氏名</label>
            <input type="text" value={name[0]} placeholder="山田 太郎" onChange={function (e) { name[1](e.target.value); }} />
          </div>
          <div className="field">
            <label>所属BASE</label>
            <select value={dept[0]} onChange={function (e) { dept[1](e.target.value); }}>
              <option value="">選択してください</option>
              {Store.BASES.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
            </select>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={props.onClose}>キャンセル</button>
          <button className="btn btn-dark btn-sm" onClick={save}><Icon name="check" size={15} />保存</button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
