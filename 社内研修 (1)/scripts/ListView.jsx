/* ============================================================
   ListView.jsx — 研修一覧（カード / リスト切替・検索・絞り込み）
   ============================================================ */
function ListView(props) {
  var Store = useStore();
  var go = props.go;
  var search = React.useState("");
  var cat = React.useState("すべて");
  var when = React.useState("upcoming"); // upcoming | all | past
  var mode = React.useState(props.compact ? "list" : "card");

  var all = Store.getTrainings();

  var filtered = all.filter(function (t) {
    if (when[0] === "upcoming" && isPast(t.date)) return false;
    if (when[0] === "past" && !isPast(t.date)) return false;
    if (cat[0] !== "すべて" && t.category !== cat[0]) return false;
    if (search[0]) {
      var q = search[0].toLowerCase();
      var hay = (t.title + " " + t.titleEn + " " + t.instructor.name + " " + t.category).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });

  return (
    <div className="page" data-screen-label="研修一覧">
      <div className="wrap">
        <div className="page-head">
          <span className="label-en">Training Programs</span>
          <h1>研修一覧<em>Catalogue</em></h1>
          <p className="lead">受講できる社内研修の一覧です。内容や講師を確認し、各研修から参加を表明できます。</p>
        </div>

        <div className="toolbar">
          <div className="search">
            <Icon name="search" className="sico" />
            <input type="text" placeholder="研修名・講師・キーワードで検索" value={search[0]}
              onChange={function (e) { search[1](e.target.value); }} />
          </div>
          <div className="seg">
            {[["upcoming", "今後"], ["all", "すべて"], ["past", "終了"]].map(function (o) {
              return <button key={o[0]} className={when[0] === o[0] ? "active" : ""} onClick={function () { when[1](o[0]); }}>{o[1]}</button>;
            })}
          </div>
          <div className="seg">
            <button className={mode[0] === "card" ? "active" : ""} onClick={function () { mode[1]("card"); }} aria-label="カード表示"><Icon name="tag" size={15} /></button>
            <button className={mode[0] === "list" ? "active" : ""} onClick={function () { mode[1]("list"); }} aria-label="リスト表示"><Icon name="list" size={15} /></button>
          </div>
        </div>

        <div className="chips" style={{ marginBottom: 24 }}>
          {["すべて"].concat(Store.CATEGORIES).map(function (c) {
            return <button key={c} className={"chip" + (cat[0] === c ? " active" : "")} onClick={function () { cat[1](c); }}>{c}</button>;
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="empty"><Icon name="search" /><p>条件に合う研修が見つかりませんでした。</p></div>
        ) : mode[0] === "card" ? (
          <div className="card-grid">
            {filtered.map(function (t) { return <TrainingCard key={t.id} t={t} go={go} tally={Store.tally(t.id)} />; })}
          </div>
        ) : (
          <div className="tlist">
            {filtered.map(function (t) { return <TrainingRow key={t.id} t={t} go={go} tally={Store.tally(t.id)} />; })}
          </div>
        )}
      </div>
    </div>
  );
}

function TrainingCard(props) {
  var t = props.t, tally = props.tally;
  return (
    <button className="tcard" onClick={function () { props.go("training/" + t.id); }}>
      <div className="tcard-top">
        <div className="tcard-date">
          <span className="d-day">{fmtDay(t.date)}</span>
          <span className="d-mon">{fmtMonEn(t.date)}</span>
          <span className="d-dow">{fmtDow(t.date)}</span>
        </div>
        <FormatBadge format={t.format} />
      </div>
      <div className="tcard-body">
        <div className="tcard-cat"><span className="label-en">{Store.CATEGORY_EN[t.category] || t.category}</span></div>
        <h3>{t.title}</h3>
        <div className="tcard-meta">
          <div className="tcard-row"><Icon name="user" /><strong>{t.instructor.name}</strong></div>
          <div className="tcard-row"><Icon name="clock" />{t.start}–{t.end}</div>
          <div className="tcard-row"><Icon name="pin" />{t.location}</div>
        </div>
      </div>
      <div className="tcard-foot">
        <span className="tcard-count"><b>{tally.参加}</b> 名が参加予定</span>
        <span className="tcard-go">詳細<Icon name="arrowR" size={14} /></span>
      </div>
    </button>
  );
}

function TrainingRow(props) {
  var t = props.t, tally = props.tally;
  return (
    <button className="trow" onClick={function () { props.go("training/" + t.id); }}>
      <div className="trow-date">
        <span className="d-day">{fmtDay(t.date)}</span>
        <span className="d-mon">{fmtMonEn(t.date)} {fmtDow(t.date)}</span>
      </div>
      <div className="trow-main">
        <span className="label-en">{Store.CATEGORY_EN[t.category] || t.category}</span>
        <h3>{t.title}</h3>
        <div className="trow-sub">
          <span><Icon name="user" />{t.instructor.name}</span>
          <span><Icon name="clock" />{t.start}–{t.end}</span>
          <FormatBadge format={t.format} />
          <span><Icon name="pin" />{t.location}</span>
        </div>
      </div>
      <div className="trow-aside">
        <span className="tcard-count"><b>{tally.参加}</b> 名参加予定</span>
        <span className="tcard-go">詳細<Icon name="arrowR" size={14} /></span>
      </div>
    </button>
  );
}

Object.assign(window, { ListView: ListView, TrainingCard: TrainingCard, TrainingRow: TrainingRow });
