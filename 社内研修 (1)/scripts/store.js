/* ============================================================
   store.js — データ層（localStorage 永続化 / 購読 / シード）
   ※ 本番で全員同期するにはサーバー連携が別途必要です。
     データはこのブラウザ内に保存されます。
   ============================================================ */
(function () {
  "use strict";

  // ---- Google Sheets API 設定 ----
  // ユーザーが設定する項目（初期設定手順書で案内）
  var SHEETS_API_KEY = ""; // 手順書で取得したAPI Key
  var SHEETS_ID = ""; // スプレッドシートのID
  var SHEETS_RANGE_TRAININGS = "研修!A:H"; // 研修データの範囲
  var SHEETS_RANGE_ATTENDANCE = "参加表明!A:G"; // 参加データの範囲

  function setGoogleSheetsConfig(apiKey, sheetId) {
    SHEETS_API_KEY = apiKey;
    SHEETS_ID = sheetId;
    localStorage.setItem("kenshu.sheets.api", apiKey);
    localStorage.setItem("kenshu.sheets.id", sheetId);
  }

  function getGoogleSheetsConfig() {
    return {
      apiKey: localStorage.getItem("kenshu.sheets.api") || SHEETS_API_KEY,
      sheetId: localStorage.getItem("kenshu.sheets.id") || SHEETS_ID
    };
  }

  // スプレッドシートへ書き込み（Google Sheets API v4 append）
  function appendToSheet(range, values) {
    var cfg = getGoogleSheetsConfig();
    if (!cfg.apiKey || !cfg.sheetId) {
      console.warn("Google Sheets API not configured");
      return Promise.resolve();
    }
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + cfg.sheetId + "/values/" + encodeURIComponent(range) + ":append?key=" + cfg.apiKey;
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] })
    }).catch(function (e) { console.error("Sheets API error:", e); });
  }

  // スプレッドシートから読み込み
  function readFromSheet(range) {
    var cfg = getGoogleSheetsConfig();
    if (!cfg.apiKey || !cfg.sheetId) return Promise.resolve([]);
    var url = "https://sheets.googleapis.com/v4/spreadsheets/" + cfg.sheetId + "/values/" + encodeURIComponent(range) + "?key=" + cfg.apiKey;
    return fetch(url).then(function (r) { return r.json(); })
      .then(function (data) { return (data.values || []).slice(1); }) // ヘッダ行をスキップ
      .catch(function (e) { console.error("Sheets read error:", e); return []; });
  }

  var KEYS = {
    trainings: "kenshu.trainings.v2",
    attendance: "kenshu.attendance.v2",
    me: "kenshu.me.v2",
    seeded: "kenshu.seeded.v2"
  };

  // 合言葉（パスコード）— 変更する場合はここを書き換えてください
  var PASSCODE = "1234";

  var CATEGORIES = ["業務品質", "倫理品質", "エンジニア", "ビジネス基礎", "DX/AX", "コンプライアンス", "AO校", "営業/接客"];
  var BASES = ["日吉BASE", "港北BASE", "十日市場BASE", "他BASE"];
  var CATEGORY_EN = {
    "業務品質": "Service Quality",
    "倫理品質": "Ethics & Integrity",
    "エンジニア": "Engineering",
    "ビジネス基礎": "Business Basics",
    "DX/AX": "DX / AX",
    "コンプライアンス": "Compliance",
    "AO校": "AO School",
    "営業/接客": "Sales & CS"
  };

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // ---- Sample data (差し替え前提の仮データ) ----
  function seed() {
    if (localStorage.getItem(KEYS.seeded)) return;

    var trainings = [
      {
        id: uid("t"), category: "ビジネス基礎",
        title: "新入社員ビジネスマナー研修",
        titleEn: "Business Manners",
        instructor: { name: "田中 美咲", title: "人事教育担当 / 外部講師" },
        format: "対面", location: "日吉BASE 3F 大会議室", capacity: 30,
        date: "2026-06-15", start: "10:00", end: "17:00",
        desc: "社会人としての基本動作を一日で身につけます。\n挨拶・名刺交換・電話応対・ビジネスメール・来客応対までをロールプレイ中心に実践。配属前に必ず受講してください。"
      },
      {
        id: uid("t"), category: "DX/AX",
        title: "生成AI業務活用ハンズオン",
        titleEn: "Generative AI Workshop",
        instructor: { name: "佐藤 健", title: "DX推進室 室長" },
        format: "オンライン", location: "オンライン（Teams）", capacity: 100,
        date: "2026-06-19", start: "14:00", end: "16:00",
        desc: "日々の業務に生成AIをどう取り入れるかを実演します。\n議事録作成・資料下書き・データ整理など、すぐ使える活用例を中心に。事前知識は不要です。"
      },
      {
        id: uid("t"), category: "コンプライアンス",
        title: "情報セキュリティ基礎研修",
        titleEn: "Security Fundamentals",
        instructor: { name: "鈴木 一郎", title: "情報システム課" },
        format: "オンライン", location: "オンライン（オンデマンド）", capacity: 200,
        date: "2026-06-24", start: "13:00", end: "14:30",
        desc: "標的型メール・パスワード管理・情報持ち出しルールなど、全社員が守るべき基本を確認します。\n受講後に確認テストがあります。"
      },
      {
        id: uid("t"), category: "業務品質",
        title: "新任管理職マネジメント研修",
        titleEn: "New Manager Program",
        instructor: { name: "高橋 直子", title: "外部講師（組織開発コンサルタント）" },
        format: "対面", location: "港北BASE 5F 研修室A", capacity: 20,
        date: "2026-07-02", start: "09:30", end: "17:30",
        desc: "チームを率いる立場として必要な考え方とスキルを学びます。\n目標設定・1on1・フィードバック・労務基礎をケーススタディで習得。今期昇格者は必須です。"
      },
      {
        id: uid("t"), category: "営業/接客",
        title: "店頭接客力向上トレーニング",
        titleEn: "Customer Service",
        instructor: { name: "渡辺 翔", title: "店舗運営 トレーナー" },
        format: "対面", location: "十日市場BASE 研修センター", capacity: 24,
        date: "2026-07-08", start: "10:00", end: "16:00",
        desc: "お客様満足を高める接客の基本と応用を実演します。\nヒアリング・提案・クレーム対応をロールプレイで体得。"
      },
      {
        id: uid("t"), category: "ビジネス基礎",
        title: "ロジカルシンキング入門",
        titleEn: "Logical Thinking",
        instructor: { name: "中村 彩", title: "外部講師" },
        format: "オンライン", location: "オンライン（Zoom）", capacity: 40,
        date: "2026-07-15", start: "14:00", end: "17:00",
        desc: "考えを構造化し、わかりやすく伝える技術を学びます。\nMECE・ピラミッド構造・課題設定の演習を通じて、提案書や報告の質を高めます。"
      },
      {
        id: uid("t"), category: "倫理品質",
        title: "メンタルヘルス・セルフケア研修",
        titleEn: "Mental Health Care",
        instructor: { name: "小林 由美", title: "産業カウンセラー" },
        format: "オンライン", location: "オンライン（Teams）", capacity: 150,
        date: "2026-07-22", start: "15:00", end: "16:30",
        desc: "ストレスとの向き合い方とセルフケアの方法を学びます。\nラインケアの基礎にも触れ、働きやすい職場づくりを考えます。"
      },
      {
        id: uid("t"), category: "エンジニア",
        title: "データ分析の基礎（表計算）",
        titleEn: "Data Analysis Basics",
        instructor: { name: "佐藤 健", title: "DX推進室 室長" },
        format: "対面", location: "日吉BASE 4F PCルーム", capacity: 18,
        date: "2026-08-05", start: "13:00", end: "17:00",
        desc: "業務データを集計・可視化する基礎技術を手を動かして学びます。\n関数・ピボット・グラフ作成を実データで演習します。"
      }
    ];

    // 参加表明のサンプル
    var names = [
      ["山田 太郎", "日吉BASE"], ["伊藤 花子", "港北BASE"], ["加藤 大輔", "十日市場BASE"],
      ["松本 さくら", "他BASE"], ["井上 涼", "港北BASE"], ["木村 拓也", "日吉BASE"],
      ["林 美穂", "十日市場BASE"], ["清水 健太", "日吉BASE"], ["森 あおい", "港北BASE"],
      ["池田 翼", "他BASE"], ["橋本 結衣", "十日市場BASE"], ["山口 蓮", "日吉BASE"]
    ];
    var statuses = ["参加", "参加", "参加", "未定", "不参加", "参加", "未定", "参加"];
    var prefs = ["対面", "オンライン"];
    var attendance = [];
    trainings.forEach(function (t, ti) {
      var n = 3 + (ti % 5);
      for (var i = 0; i < n; i++) {
        var person = names[(ti * 3 + i) % names.length];
        attendance.push({
          id: uid("a"),
          trainingId: t.id,
          name: person[0],
          dept: person[1],
          status: statuses[(ti + i) % statuses.length],
          pref: t.format === "対面" ? prefs[(i) % 2] : "オンライン",
          memo: i === 0 && ti % 3 === 0 ? "当日は少し遅れて参加します" : "",
          createdAt: Date.now() - (ti * 86400000) - i * 3600000
        });
      }
    });

    write(KEYS.trainings, trainings);
    write(KEYS.attendance, attendance);
    localStorage.setItem(KEYS.seeded, "1");
  }

  // スプレッドシートから初期読み込み
  function initFromSheets() {
    var cfg = getGoogleSheetsConfig();
    if (!cfg.apiKey || !cfg.sheetId) return Promise.resolve();
    
    return readFromSheet(SHEETS_RANGE_TRAININGS).then(function (rows) {
      if (rows.length === 0) return;
      var list = [];
      rows.forEach(function (row) {
        if (!row[0]) return; // ID がなければスキップ
        list.push({
          id: row[0],
          date: row[1] || "2026-06-15",
          start: row[2] || "10:00",
          end: row[3] || "12:00",
          title: row[4] || "（タイトルなし）",
          category: row[5] || CATEGORIES[0],
          instructor: { name: row[6] || "未定", title: row[7] || "" },
          format: "対面",
          location: row[8] || "",
          capacity: 20,
          desc: ""
        });
      });
      if (list.length > 0) {
        write(KEYS.trainings, list);
        localStorage.setItem(KEYS.seeded, "1");
      }
    }).catch(function (e) { console.error("Sheet init error:", e); });
  }

  // ---- pub/sub ----
  var subs = [];
  function notify() { subs.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  seed();
  initFromSheets();

  var Store = {
    PASSCODE: PASSCODE,
    CATEGORIES: CATEGORIES,
    CATEGORY_EN: CATEGORY_EN,
    BASES: BASES,
    STATUSES: ["参加", "未定", "不参加"],

    subscribe: function (fn) { subs.push(fn); return function () { subs = subs.filter(function (f) { return f !== fn; }); }; },
    setGoogleSheetsConfig: setGoogleSheetsConfig,
    getGoogleSheetsConfig: getGoogleSheetsConfig,
    initFromSheets: initFromSheets,
    appendToSheet: appendToSheet,
    readFromSheet: readFromSheet,

    getTrainings: function () {
      var list = read(KEYS.trainings, []);
      list.sort(function (a, b) { return (a.date + a.start).localeCompare(b.date + b.start); });
      return list;
    },
    getTraining: function (id) {
      return this.getTrainings().filter(function (t) { return t.id === id; })[0] || null;
    },
    saveTraining: function (obj) {
      var list = read(KEYS.trainings, []);
      if (obj.id) {
        var found = false;
        list = list.map(function (t) { if (t.id === obj.id) { found = true; return Object.assign({}, t, obj); } return t; });
        if (!found) list.push(obj);
      } else {
        obj.id = uid("t");
        list.push(obj);
      }
      write(KEYS.trainings, list);
      notify();
      return obj.id;
    },
    deleteTraining: function (id) {
      write(KEYS.trainings, read(KEYS.trainings, []).filter(function (t) { return t.id !== id; }));
      write(KEYS.attendance, read(KEYS.attendance, []).filter(function (a) { return a.trainingId !== id; }));
      notify();
    },

    getAttendance: function (trainingId) {
      var list = read(KEYS.attendance, []);
      if (trainingId) list = list.filter(function (a) { return a.trainingId === trainingId; });
      list.sort(function (a, b) { return b.createdAt - a.createdAt; });
      return list;
    },
    addAttendance: function (obj) {
      var list = read(KEYS.attendance, []);
      obj.id = uid("a");
      obj.createdAt = Date.now();
      list.push(obj);
      write(KEYS.attendance, list);
      // スプレッドシートにも書き込み
      var row = [obj.id, obj.trainingId, obj.name, obj.dept || "", obj.status, obj.pref, obj.memo];
      appendToSheet(SHEETS_RANGE_ATTENDANCE, row).catch(function () {});
      notify();
      return obj.id;
    },
    removeAttendance: function (id) {
      write(KEYS.attendance, read(KEYS.attendance, []).filter(function (a) { return a.id !== id; }));
      notify();
    },

    // 集計ヘルパ
    tally: function (trainingId) {
      var list = this.getAttendance(trainingId);
      var t = { total: list.length, 参加: 0, 未定: 0, 不参加: 0, 対面: 0, オンライン: 0 };
      list.forEach(function (a) {
        if (t[a.status] != null) t[a.status]++;
        if (t[a.pref] != null) t[a.pref]++;
      });
      return t;
    },

    getMe: function () { return read(KEYS.me, { name: "", dept: "" }); },
    setMe: function (me) { write(KEYS.me, me); notify(); },

    resetAll: function () {
      localStorage.removeItem(KEYS.trainings);
      localStorage.removeItem(KEYS.attendance);
      localStorage.removeItem(KEYS.seeded);
      seed();
      notify();
    }
  };

  window.Store = Store;
})();
