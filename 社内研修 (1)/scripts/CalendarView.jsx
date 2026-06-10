/* ============================================================
   CalendarView.jsx — 月カレンダー表示
   ============================================================ */
function CalendarView(props) {
  var Store = useStore();
  var today = new Date();
  var view = React.useState({ y: today.getFullYear(), m: today.getMonth() }); // m: 0-11
  var selected = React.useState(null); // ISO date string

  var all = Store.getTrainings();
  var byDate = {};
  all.forEach(function (t) { (byDate[t.date] = byDate[t.date] || []).push(t); });

  var y = view[0].y, m = view[0].m;
  var first = new Date(y, m, 1);
  var startDow = first.getDay();
  var daysInMonth = new Date(y, m + 1, 0).getDate();
  var tISO = todayISO();

  // build 6x7 grid
  var cells = [];
  for (var i = 0; i < startDow; i++) {
    var d = new Date(y, m, 1 - (startDow - i));
    cells.push({ date: d, other: true });
  }
  for (var day = 1; day <= daysInMonth; day++) cells.push({ date: new Date(y, m, day), other: false });
  while (cells.length % 7 !== 0) {
    var last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), other: true });
  }

  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function shift(delta) {
    var nm = m + delta, ny = y;
    if (nm < 0) { nm = 11; ny--; } else if (nm > 11) { nm = 0; ny++; }
    view[1]({ y: ny, m: nm }); selected[1](null);
  }
  function goToday() { view[1]({ y: today.getFullYear(), m: today.getMonth() }); selected[1](tISO); }

  var selList = selected[0] ? (byDate[selected[0]] || []).slice().sort(function (a, b) { return a.start.localeCompare(b.start); }) : null;

  return (
    <div className="page" data-screen-label="カレンダー">
      <div className="wrap">
        <div className="page-head">
          <span className="label-en">Schedule</span>
          <h1>スケジュール<em>Calendar</em></h1>
          <p className="lead">研修の開催日を月単位で確認できます。日付をタップすると、その日の研修と参加状況を表示します。</p>
        </div>

        <div className="cal-head">
          <div className="cal-title">{y}<span className="y"> · </span>{m + 1}月<span className="y">{MON_EN[m]}</span></div>
          <div className="cal-nav">
            <button onClick={function () { shift(-1); }} aria-label="前の月"><Icon name="chevL" size={16} /></button>
            <button className="cal-today" onClick={goToday}>今日</button>
            <button onClick={function () { shift(1); }} aria-label="次の月"><Icon name="chevR" size={16} /></button>
          </div>
        </div>

        <div className="cal-grid">
          <div className="cal-dows">
            {DOW.map(function (d, i) { return <div key={d} className={i === 0 ? "sun" : i === 6 ? "sat" : ""}>{d}</div>; })}
          </div>
          <div className="cal-cells">
            {cells.map(function (c, idx) {
              var ci = iso(c.date);
              var evs = byDate[ci] || [];
              var dow = c.date.getDay();
              var cls = "cal-cell";
              if (c.other) cls += " other";
              if (ci === tISO) cls += " today";
              if (dow === 0) cls += " sun";
              if (evs.length) cls += " has";
              return (
                <div key={idx} className={cls} onClick={evs.length ? function () { selected[1](ci); } : null}>
                  <span className="cnum">{c.date.getDate()}</span>
                  {evs.slice(0, 3).map(function (e) {
                    return <span key={e.id} className={"cevent" + (e.format === "対面" ? " acc" : "")} title={e.title}>{e.title}</span>;
                  })}
                  {evs.length > 3 ? <span className="cevent-more">+{evs.length - 3}件</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="legend">
          <span><i style={{ background: "var(--accent)" }}></i>対面</span>
          <span><i style={{ background: "var(--ink-faint)" }}></i>オンライン</span>
          <span><i style={{ background: "var(--accent)", borderRadius: "50%" }}></i>本日</span>
        </div>

        {selList ? (
          <div className="cal-daylist">
            <div className="divider">
              <span className="dnum serif-num">{fmtDay(selected[0])}</span>
              <h2>{fmtFull(selected[0])}</h2>
              <span className="dline"></span>
              <span className="dcount">{selList.length}件</span>
            </div>
            <div className="tlist">
              {selList.map(function (t) { return <TrainingRow key={t.id} t={t} go={props.go} tally={Store.tally(t.id)} />; })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

Object.assign(window, { CalendarView: CalendarView });
