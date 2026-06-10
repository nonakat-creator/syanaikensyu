/* ============================================================
   StatsView.jsx — 参加集計ダッシュボード
   ============================================================ */
function StatsView(props) {
  var Store = useStore();
  var scope = React.useState("upcoming"); // upcoming | all

  var trainings = Store.getTrainings().filter(function (t) { return scope[0] === "all" ? true : !isPast(t.date); });
  var allAtt = Store.getAttendance();

  // overall totals
  var totals = { 参加: 0, 未定: 0, 不参加: 0 };
  var deptCount = {};
  var scopeIds = {};
  trainings.forEach(function (t) { scopeIds[t.id] = true; });
  allAtt.forEach(function (a) {
    if (!scopeIds[a.trainingId]) return;
    if (totals[a.status] != null) totals[a.status]++;
    if (a.status === "参加") deptCount[a.dept || "未設定"] = (deptCount[a.dept || "未設定"] || 0) + 1;
  });
  var grand = totals.参加 + totals.未定 + totals.不参加;

  // per training rows
  var rows = trainings.map(function (t) { return { t: t, tally: Store.tally(t.id) }; })
    .sort(function (a, b) { return b.tally.参加 - a.tally.参加; });

  var deptRows = Object.keys(deptCount).map(function (d) { return { d: d, n: deptCount[d] }; }).sort(function (a, b) { return b.n - a.n; });
  var deptMax = Math.max.apply(null, [1].concat(deptRows.map(function (r) { return r.n; })));

  return (
    <div className="page" data-screen-label="集計">
      <div className="wrap">
        <div className="page-head">
          <span className="label-en">Aggregate</span>
          <h1>参加集計<em>Insights</em></h1>
          <p className="lead">研修ごとの参加人数と、出欠ステータス別の内訳をまとめて確認できます。</p>
        </div>

        <div className="toolbar">
          <div className="seg">
            {[["upcoming", "今後の研修"], ["all", "すべての研修"]].map(function (o) {
              return <button key={o[0]} className={scope[0] === o[0] ? "active" : ""} onClick={function () { scope[1](o[0]); }}>{o[1]}</button>;
            })}
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-card"><div className="sk">Programs</div><div className="sv">{trainings.length}</div><div className="su">対象の研修数</div></div>
          <div className="stat-card"><div className="sk">Responses</div><div className="sv">{grand}</div><div className="su">参加表明の総数</div></div>
          <div className="stat-card"><div className="sk">Attending</div><div className="sv acc">{totals.参加}</div><div className="su">「参加」の合計</div></div>
          <div className="stat-card"><div className="sk">Undecided</div><div className="sv">{totals.未定}</div><div className="su">「未定」の合計</div></div>
        </div>

        <div className="divider">
          <span className="dnum serif-num">01</span>
          <h2>研修ごとの参加状況</h2>
          <span className="dline"></span>
          <span className="dcount">{rows.length}件</span>
        </div>

        <div className="legend" style={{ marginBottom: 12 }}>
          <span><i className="sb-ok" style={{ background: "var(--accent)" }}></i>参加</span>
          <span><i style={{ background: "var(--maybe)" }}></i>未定</span>
          <span><i style={{ background: "var(--no)" }}></i>不参加</span>
        </div>

        {rows.length === 0 ? (
          <div className="empty"><Icon name="chart" /><p>対象の研修がありません。</p></div>
        ) : (
          <div className="stat-table">
            {rows.map(function (r) {
              var ta = r.tally, tot = ta.total || 1;
              return (
                <div className="stat-trow" key={r.t.id} onClick={function () { props.go("training/" + r.t.id); }} style={{ cursor: "pointer" }}>
                  <div className="stat-tinfo">
                    <h3>{r.t.title}</h3>
                    <div className="stm">
                      <span>{fmtFull(r.t.date)}</span>
                      <span>講師：{r.t.instructor.name}</span>
                      <span>{r.t.format}</span>
                    </div>
                  </div>
                  <div className="stat-tbar">
                    <div className="stackbar" title={"参加 " + ta.参加 + " / 未定 " + ta.未定 + " / 不参加 " + ta.不参加}>
                      <span className="sb-ok" style={{ width: (ta.参加 / tot * 100) + "%" }}></span>
                      <span className="sb-maybe" style={{ width: (ta.未定 / tot * 100) + "%" }}></span>
                      <span className="sb-no" style={{ width: (ta.不参加 / tot * 100) + "%" }}></span>
                    </div>
                    <div className="stat-tnum">{ta.参加}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="divider">
          <span className="dnum serif-num">02</span>
          <h2>BASE別の参加者数</h2>
          <span className="dline"></span>
          <span className="dcount">「参加」のみ集計</span>
        </div>

        {deptRows.length === 0 ? (
          <div className="empty"><Icon name="users" /><p>まだ参加表明がありません。</p></div>
        ) : (
          <div className="dept-grid">
            {deptRows.map(function (r) {
              return (
                <div className="dept-card" key={r.d}>
                  <h4>{r.d}<b className="serif-num">{r.n}</b></h4>
                  <div className="dept-bar"><span style={{ width: (r.n / deptMax * 100) + "%" }}></span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { StatsView: StatsView });
