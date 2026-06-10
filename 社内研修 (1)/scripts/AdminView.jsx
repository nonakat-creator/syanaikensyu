/* ============================================================
   AdminView.jsx — 管理画面（合言葉ゲート + 研修の追加/編集/削除）
   ============================================================ */
function AdminView(props) {
  var Store = useStore();
  var authed = React.useState(sessionStorage.getItem("kenshu.admin") === "1");
  var pass = React.useState("");
  var err = React.useState("");
  var editing = React.useState(null); // training obj or {} for new
  var confirmDel = React.useState(null);
  var showSheetsConfig = React.useState(false);

  function tryAuth() {
    if (pass[0] === Store.PASSCODE) { sessionStorage.setItem("kenshu.admin", "1"); authed[1](true); err[1](""); }
    else { err[1]("合言葉が違います"); }
  }

  if (!authed[0]) {
    return (
      <div className="page" data-screen-label="管理ログイン">
        <div className="wrap">
          <div className="gate">
            <Icon name="lock" className="glock" size={46} />
            <h2>管理画面</h2>
            <p>研修の追加・編集には合言葉が必要です。</p>
            <input type="password" value={pass[0]} placeholder="••••"
              onChange={function (e) { pass[1](e.target.value); err[1](""); }}
              onKeyDown={function (e) { if (e.key === "Enter") tryAuth(); }} />
            <div className="gerr">{err[0]}</div>
            <button className="btn btn-dark" onClick={tryAuth}>ログイン</button>
            <p style={{ marginTop: 16, marginBottom: 0, fontSize: "11px" }}>初期合言葉は <b>1234</b>（scripts/store.js で変更可）</p>
          </div>
        </div>
      </div>
    );
  }

  var trainings = Store.getTrainings();
  var cfg = Store.getGoogleSheetsConfig();

  return (
    <div className="page" data-screen-label="管理画面">
      <div className="wrap">
        <div className="page-head">
          <span className="label-en">Admin</span>
          <h1>研修の管理<em>Manage</em></h1>
          <p className="lead">研修の追加・内容の編集・削除ができます。変更はすぐに一覧・カレンダー・集計へ反映されます。</p>
        </div>

        <div className="admin-bar">
          <div style={{ color: "var(--ink-mute)", fontSize: "var(--step--1)" }}>登録済みの研修：<b className="serif-num" style={{ color: "var(--ink)", fontSize: 18 }}>{trainings.length}</b> 件</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={function () { showSheetsConfig[1](true); }}><Icon name="link" size={15} />スプレッドシート設定</button>
            <button className="btn btn-ghost btn-sm" onClick={function () { sessionStorage.removeItem("kenshu.admin"); authed[1](false); }}>ログアウト</button>
            <button className="btn btn-primary btn-sm" onClick={function () { editing[1]({}); }}><Icon name="plus" size={15} />研修を追加</button>
          </div>
        </div>

        <div className="admin-table">
          {trainings.map(function (t) {
            return (
              <div className="admin-row" key={t.id}>
                <div className="admin-date">
                  <span className="d-day">{fmtDay(t.date)}</span>
                  <span className="d-mon">{fmtMonEn(t.date)}</span>
                </div>
                <div className="admin-info">
                  <h3>{t.title}</h3>
                  <div className="am">
                    <span>{t.category}</span>
                    <span>講師：{t.instructor.name}</span>
                    <span>{t.format}</span>
                    <span>{Store.tally(t.id).参加}名参加予定</span>
                  </div>
                </div>
                <div className="admin-acts">
                  <button className="icon-btn" title="編集" onClick={function () { editing[1](t); }}><Icon name="edit" size={16} /></button>
                  <button className="icon-btn del" title="削除" onClick={function () { confirmDel[1](t); }}><Icon name="trash" size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 22, color: "var(--ink-faint)", fontSize: "var(--step--1)" }}>
          ※ データはこのブラウザ内に保存されています。サンプルに戻すには
          <button onClick={function () { if (confirm("すべての研修と参加表明をサンプルに戻します。よろしいですか？")) { Store.resetAll(); props.toast("サンプルデータに戻しました"); } }}
            style={{ background: "none", border: "none", color: "var(--accent-deep)", textDecoration: "underline", cursor: "pointer", font: "inherit" }}>初期化</button>
          できます。
        </p>
      </div>

      {editing[0] ? <TrainingForm training={editing[0]} onClose={function () { editing[1](null); }} toast={props.toast} /> : null}

      {showSheetsConfig[0] ? <GoogleSheetsConfigModal onClose={function () { showSheetsConfig[1](false); }} toast={props.toast} /> : null}

      {confirmDel[0] ? (
        <div className="modal-scrim" onMouseDown={function (e) { if (e.target === e.currentTarget) confirmDel[1](null); }}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-head"><div><span className="label-en">Delete</span><h2>研修を削除</h2></div>
              <button className="modal-x" onClick={function () { confirmDel[1](null); }}><Icon name="x" /></button></div>
            <div className="modal-body"><p style={{ color: "var(--ink-soft)", lineHeight: 1.9 }}>「{confirmDel[0].title}」と、この研修への参加表明をすべて削除します。この操作は取り消せません。</p></div>
            <div className="modal-foot">
              <button className="btn btn-ghost btn-sm" onClick={function () { confirmDel[1](null); }}>キャンセル</button>
              <button className="btn btn-danger btn-sm" onClick={function () { Store.deleteTraining(confirmDel[0].id); props.toast("研修を削除しました"); confirmDel[1](null); }}><Icon name="trash" size={15} />削除する</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GoogleSheetsConfigModal(props) {
  var Store = window.Store;
  var cfg = Store.getGoogleSheetsConfig();
  var apiKey = React.useState(cfg.apiKey || "");
  var sheetId = React.useState(cfg.sheetId || "");
  var err = React.useState("");

  function save() {
    if (!apiKey[0].trim()) { err[1]("API Key を入力してください"); return; }
    if (!sheetId[0].trim()) { err[1]("Sheet ID を入力してください"); return; }
    Store.setGoogleSheetsConfig(apiKey[0].trim(), sheetId[0].trim());
    props.toast("Googleスプレッドシート設定を保存しました");
    props.onClose();
  }

  return (
    <div className="modal-scrim" onMouseDown={function (e) { if (e.target === e.currentTarget) props.onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div><span className="label-en">Google Sheets</span><h2>スプレッドシート設定</h2></div>
          <button className="modal-x" onClick={props.onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: "var(--ink-mute)", fontSize: "var(--step--1)", marginBottom: 18, lineHeight: 1.8 }}>
            研修データと参加表明をGoogleスプレッドシートに自動保存します。<br />
            <b>初期設定手順書</b>に従って、API KeyとSheet IDを取得してください。
          </p>
          <div className="field">
            <label>API Key<span className="req">*</span></label>
            <input type="text" value={apiKey[0]} placeholder="AIzaXxxx..." onChange={function (e) { apiKey[1](e.target.value); err[1](""); }} />
          </div>
          <div className="field">
            <label>Sheet ID<span className="req">*</span></label>
            <input type="text" value={sheetId[0]} placeholder="1a2b3c4d5e..." onChange={function (e) { sheetId[1](e.target.value); err[1](""); }} />
          </div>
          {err[0] ? <div style={{ color: "var(--accent-deep)", fontSize: "var(--step--1)" }}>{err[0]}</div> : null}
          {cfg.apiKey ? <div style={{ color: "var(--accent)", fontSize: "var(--step--1)", marginTop: 12 }}>✓ 設定済み</div> : null}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={props.onClose}>キャンセル</button>
          <button className="btn btn-primary btn-sm" onClick={save}><Icon name="check" size={15} />保存</button>
        </div>
      </div>
    </div>
  );
}

function TrainingForm(props) {
  var Store = window.Store;
  var t = props.training || {};
  var isNew = !t.id;
  var f = React.useState({
    title: t.title || "", titleEn: t.titleEn || "", category: t.category || Store.CATEGORIES[0],
    instructorName: (t.instructor || {}).name || "", instructorTitle: (t.instructor || {}).title || "",
    format: t.format || "対面",
    location: t.location || "", capacity: t.capacity || 20,
    date: t.date || todayISO(), start: t.start || "10:00", end: t.end || "12:00",
    desc: t.desc || ""
  });
  var err = React.useState("");
  function set(k, v) { var n = Object.assign({}, f[0]); n[k] = v; f[1](n); }
  function save() {
    var v = f[0];
    if (!v.title.trim()) { err[1]("研修名を入力してください"); return; }
    Store.saveTraining({
      id: t.id, title: v.title.trim(), titleEn: v.titleEn.trim(), category: v.category,
      instructor: { name: v.instructorName.trim() || "未定", title: v.instructorTitle.trim() },
      format: v.format, location: v.location.trim(),
      capacity: parseInt(v.capacity, 10) || 0, date: v.date, start: v.start, end: v.end, desc: v.desc.trim()
    });
    props.toast(isNew ? "研修を追加しました" : "研修を更新しました");
    props.onClose();
  }

  return (
    <div className="modal-scrim" onMouseDown={function (e) { if (e.target === e.currentTarget) props.onClose(); }}>
      <div className="modal wide">
        <div className="modal-head">
          <div><span className="label-en">{isNew ? "New program" : "Edit program"}</span><h2>{isNew ? "研修を追加" : "研修を編集"}</h2></div>
          <button className="modal-x" onClick={props.onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>研修名<span className="req">*</span></label>
            <input type="text" value={f[0].title} placeholder="例）新入社員ビジネスマナー研修" onChange={function (e) { set("title", e.target.value); err[1](""); }} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>英語タイトル<span className="hint">任意</span></label>
              <input type="text" value={f[0].titleEn} placeholder="Business Manners" onChange={function (e) { set("titleEn", e.target.value); }} />
            </div>
            <div className="field">
              <label>カテゴリ</label>
              <select value={f[0].category} onChange={function (e) { set("category", e.target.value); }}>
                {Store.CATEGORIES.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>講師名</label>
              <input type="text" value={f[0].instructorName} placeholder="田中 美咲" onChange={function (e) { set("instructorName", e.target.value); }} />
            </div>
            <div className="field">
              <label>講師の所属・肩書<span className="hint">任意</span></label>
              <input type="text" value={f[0].instructorTitle} placeholder="人事総務部 / 外部講師" onChange={function (e) { set("instructorTitle", e.target.value); }} />
            </div>
          </div>

          <div className="field">
            <label>開催形式</label>
            <div className="choice">
              {["対面", "オンライン"].map(function (p) {
                return <button key={p} className={f[0].format === p ? "on" : ""} onClick={function () { set("format", p); }}><Icon name={p === "オンライン" ? "video" : "pin"} size={14} />{p}</button>;
              })}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>場所 / 接続先</label>
              <input type="text" value={f[0].location} placeholder="本社 3F 大会議室 / オンライン（Teams）" onChange={function (e) { set("location", e.target.value); }} />
            </div>
            <div className="field">
              <label>定員<span className="hint">名</span></label>
              <input type="number" min="1" value={f[0].capacity} onChange={function (e) { set("capacity", e.target.value); }} />
            </div>
          </div>

          <div className="field-row-3">
            <div className="field">
              <label>開催日<span className="req">*</span></label>
              <input type="date" value={f[0].date} onChange={function (e) { set("date", e.target.value); }} />
            </div>
            <div className="field">
              <label>開始</label>
              <input type="time" value={f[0].start} onChange={function (e) { set("start", e.target.value); }} />
            </div>
            <div className="field">
              <label>終了</label>
              <input type="time" value={f[0].end} onChange={function (e) { set("end", e.target.value); }} />
            </div>
          </div>

          <div className="field">
            <label>研修内容</label>
            <textarea value={f[0].desc} placeholder="研修の概要・到達目標・受講にあたっての注意などを記入" style={{ minHeight: 110 }} onChange={function (e) { set("desc", e.target.value); }}></textarea>
          </div>

          {err[0] ? <div style={{ color: "var(--accent-deep)", fontSize: "var(--step--1)" }}>{err[0]}</div> : null}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={props.onClose}>キャンセル</button>
          <button className="btn btn-primary btn-sm" onClick={save}><Icon name="check" size={15} />{isNew ? "追加する" : "保存する"}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminView: AdminView, TrainingForm: TrainingForm, GoogleSheetsConfigModal: GoogleSheetsConfigModal });
