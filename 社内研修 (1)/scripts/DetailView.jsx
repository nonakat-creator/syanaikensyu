/* ============================================================
   DetailView.jsx — 研修詳細 + 参加表明フォーム + 参加者一覧
   ============================================================ */
function DetailView(props) {
  var Store = useStore();
  var t = Store.getTraining(props.id);
  var showForm = React.useState(false);

  if (!t) {
    return (
      <div className="page"><div className="wrap">
        <button className="detail-back" onClick={function () { props.go("list"); }}><Icon name="arrowL" />一覧へ戻る</button>
        <div className="empty"><Icon name="search" /><p>この研修は見つかりませんでした。削除された可能性があります。</p></div>
      </div></div>
    );
  }

  var tally = Store.tally(t.id);
  var attendees = Store.getAttendance(t.id);
  var statusBars = [
    { k: "参加", v: tally.参加, color: "var(--accent)" },
    { k: "未定", v: tally.未定, color: "var(--maybe)" },
    { k: "不参加", v: tally.不参加, color: "var(--no)" }
  ];
  var maxv = Math.max(1, tally.参加, tally.未定, tally.不参加);

  function share() {
    var url = location.origin + location.pathname + "#/training/" + t.id;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { props.toast("研修ページのURLをコピーしました"); });
    } else { props.toast(url); }
  }

  return (
    <div className="page" data-screen-label={"研修詳細：" + t.title}>
      <div className="wrap">
        <button className="detail-back" onClick={function () { props.go("list"); }}><Icon name="arrowL" />研修一覧へ戻る</button>

        <div className="detail-grid">
          {/* ---- main ---- */}
          <div className="detail-main">
            <div className="detail-hero">
              <div className="detail-cat">
                <span className="label-en">{Store.CATEGORY_EN[t.category] || ""}</span>
                <span className="tag tag-line">{t.category}</span>
                {isPast(t.date) ? <span className="tag tag-line">終了</span> : null}
              </div>
              <h1>{t.title}</h1>
              <div className="title-en">{t.titleEn}</div>
            </div>

            <div className="detail-facts">
              <div className="fact">
                <div className="fk"><Icon name="cal2" />開催日</div>
                <div className="fv"><span className="big">{fmtDay(t.date)}</span> {fmtMonEn(t.date)} <small>（{fmtDow(t.date)}）</small></div>
              </div>
              <div className="fact">
                <div className="fk"><Icon name="clock" />時間</div>
                <div className="fv">{t.start} – {t.end}</div>
              </div>
              <div className="fact">
                <div className="fk"><Icon name={t.format === "オンライン" ? "video" : "pin"} />形式・場所</div>
                <div className="fv">{t.format}<br /><small>{t.location}</small></div>
              </div>
              <div className="fact">
                <div className="fk"><Icon name="users" />定員</div>
                <div className="fv"><span className="big">{t.capacity}</span> <small>名</small></div>
              </div>
            </div>

            <div className="detail-sec">
              <h2><span className="label-en">About</span>研修内容</h2>
              <div className="detail-desc">{t.desc}</div>
            </div>

            <div className="detail-sec">
              <h2><span className="label-en">Instructor</span>講師</h2>
              <div className="instructor">
                <div className="iav">{(t.instructor.name || "?").charAt(0)}</div>
                <div>
                  <div className="iname">{t.instructor.name}</div>
                  <div className="ititle">{t.instructor.title}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ---- aside ---- */}
          <div className="detail-aside">
            <div className="aside-card">
              <div className="aside-head">
                <span className="label-en">Participation</span>
                <div className="aside-count"><b>{tally.参加}</b><span>名が参加予定 / 定員 {t.capacity}名</span></div>
              </div>
              <div className="aside-bars">
                {statusBars.map(function (b) {
                  return (
                    <div className="minibar" key={b.k}>
                      <div className="minibar-top"><span>{b.k}</span><span className="mb-n">{b.v}</span></div>
                      <div className="minibar-track"><div className="minibar-fill" style={{ width: (b.v / maxv * 100) + "%", background: b.color }}></div></div>
                    </div>
                  );
                })}
              </div>
              <div className="aside-cta">
                <button className="btn btn-primary" onClick={function () { showForm[1](true); }}><Icon name="check" />参加を表明する</button>
                <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={share}><Icon name="link" />この研修のURLを共有</button>
              </div>
            </div>

            <div className="aside-card" style={{ marginTop: 18 }}>
              <div className="aside-head" style={{ background: "var(--paper-2)", color: "var(--ink)", borderBottom: "1px solid var(--line)" }}>
                <span className="label-en" style={{ color: "var(--ink-mute)" }}>Attendees</span>
                <div style={{ fontFamily: "var(--mincho)", fontWeight: 600, fontSize: "var(--step-0)", marginTop: 4 }}>参加表明した人（{attendees.length}）</div>
              </div>
              <div className="attendees">
                {attendees.length === 0 ? (
                  <div style={{ padding: "22px 20px", color: "var(--ink-faint)", fontSize: "var(--step--1)" }}>まだ表明がありません。最初の一人になりましょう。</div>
                ) : attendees.slice(0, 12).map(function (a) {
                  return (
                    <div className="att-row" key={a.id}>
                      <Avatar name={a.name} />
                      <div className="att-info"><div className="an">{a.name}</div><div className="ad">{a.dept}・{a.pref}</div></div>
                      <StatusPill status={a.status} />
                    </div>
                  );
                })}
                {attendees.length > 12 ? <div style={{ padding: "12px 20px", color: "var(--ink-mute)", fontSize: "var(--step--1)" }}>ほか {attendees.length - 12} 名</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm[0] ? <ParticipationModal t={t} onClose={function () { showForm[1](false); }} toast={props.toast} /> : null}
    </div>
  );
}

function ParticipationModal(props) {
  var Store = window.Store;
  var me = Store.getMe();
  var t = props.t;
  var name = React.useState(me.name || "");
  var dept = React.useState(me.dept || "");
  var status = React.useState("参加");
  var pref = React.useState(t.format === "対面" ? "対面" : "オンライン");
  var memo = React.useState("");
  var err = React.useState("");

  function submit() {
    if (!name[0].trim()) { err[1]("お名前を入力してください"); return; }
    Store.addAttendance({ trainingId: t.id, name: name[0].trim(), dept: dept[0], status: status[0], pref: pref[0], memo: memo[0].trim() });
    Store.setMe({ name: name[0].trim(), dept: dept[0] });
    props.toast("参加表明を受け付けました（" + status[0] + "）");
    props.onClose();
  }

  return (
    <div className="modal-scrim" onMouseDown={function (e) { if (e.target === e.currentTarget) props.onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="label-en">Join this session</span>
            <h2>{t.title}</h2>
          </div>
          <button className="modal-x" onClick={props.onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="field-row">
            <div className="field">
              <label>氏名<span className="req">*</span></label>
              <input type="text" value={name[0]} placeholder="山田 太郎" onChange={function (e) { name[1](e.target.value); err[1](""); }} />
            </div>
            <div className="field">
              <label>所属BASE</label>
              <select value={dept[0]} onChange={function (e) { dept[1](e.target.value); }}>
                <option value="">選択してください</option>
                {Store.BASES.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
              </select>
            </div>
          </div>

          <div className="field">
            <label>出欠</label>
            <div className="choice">
              {Store.STATUSES.map(function (s) {
                return <button key={s} className={status[0] === s ? "on" : ""} onClick={function () { status[1](s); }}><span className="pdot"></span>{s}</button>;
              })}
            </div>
          </div>

          <div className="field">
            <label>参加形式の希望<span className="hint">{t.format === "オンライン" ? "（本研修はオンライン開催）" : t.format === "対面" ? "（本研修は対面開催）" : ""}</span></label>
            <div className="choice">
              {["対面", "オンライン"].map(function (p) {
                return <button key={p} className={pref[0] === p ? "on" : ""} onClick={function () { pref[1](p); }}><Icon name={p === "オンライン" ? "video" : "pin"} size={14} />{p}</button>;
              })}
            </div>
          </div>

          <div className="field">
            <label>ひとことメモ<span className="hint">任意</span></label>
            <textarea value={memo[0]} placeholder="例）途中参加します／質問があります 等" onChange={function (e) { memo[1](e.target.value); }}></textarea>
          </div>
          {err[0] ? <div style={{ color: "var(--accent-deep)", fontSize: "var(--step--1)" }}>{err[0]}</div> : null}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm" onClick={props.onClose}>キャンセル</button>
          <button className="btn btn-primary btn-sm" onClick={submit}><Icon name="check" size={15} />この内容で表明する</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DetailView: DetailView, ParticipationModal: ParticipationModal });
