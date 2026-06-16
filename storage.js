// ═══════════════════════════════════════════════════════════
//  storage.js  ―  共通ストレージ抽象レイヤー
//
//  使い方（各HTMLで config.js → storage.js の順に読み込む）:
//    <script src="config.js"></script>
//    <script src="storage.js"></script>
//
//  全ファイル共通インターフェース:
//    await Storage.load()       → DB オブジェクト | null
//    await Storage.save(db)     → true | false
//    await Storage.clear()      → void
//
//  バックエンド追加方法:
//    1. APP_CONFIG.BACKEND に新しい値を追加
//    2. 下の backends オブジェクトに実装を追加
//    3. APP_CONFIG.FIREBASE 等に接続情報を記入
// ═══════════════════════════════════════════════════════════

const Storage = (() => {

  const KEY   = APP_CONFIG.LOCAL_KEY;
  const BIN   = APP_CONFIG.JSONBIN;

  // ─────────────────────────────────────────────────────────
  //  バックエンド実装群
  // ─────────────────────────────────────────────────────────
  const backends = {

    // ── ① localStorage（オフライン・デバッグ用）────────────
    local: {
      async load() {
        try {
          const d = localStorage.getItem(KEY);
          return d ? JSON.parse(d) : null;
        } catch(e) { console.warn('[Storage/local] load error', e); return null; }
      },
      async save(db) {
        try {
          localStorage.setItem(KEY, JSON.stringify(db));
          return true;
        } catch(e) { console.warn('[Storage/local] save error', e); return false; }
      },
      async clear() {
        localStorage.removeItem(KEY);
      },
    },

    // ── ② JSONBin.io ────────────────────────────────────────
    jsonbin: {
      _headers() {
        return {
          'Content-Type':  'application/json',
          'X-Master-Key':  BIN.ACCESS_KEY,
          'X-Bin-Versioning': 'false',   // 最新のみ保持（バージョン無制限にしない）
        };
      },

      async load() {
        try {
          const res = await fetch(
            `${BIN.BASE_URL}/${BIN.BIN_ID}/latest`,
            { headers: this._headers() }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const db = json.record ?? json;
          // ローカルにもキャッシュ（オフライン時のフォールバック）
          try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(_) {}
          return db;
        } catch(e) {
          console.warn('[Storage/jsonbin] load error, falling back to local', e);
          // フォールバック: localStorage
          try { const d = localStorage.getItem(KEY); return d ? JSON.parse(d) : null; }
          catch(_) { return null; }
        }
      },

      async save(db) {
        // まずローカルに即時保存（UX向上・オフライン保険）
        try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(_) {}
        try {
          const res = await fetch(
            `${BIN.BASE_URL}/${BIN.BIN_ID}`,
            {
              method:  'PUT',
              headers: this._headers(),
              body:    JSON.stringify(db),
            }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return true;
        } catch(e) {
          console.warn('[Storage/jsonbin] save error (local copy kept)', e);
          return false;
        }
      },

      async clear() {
        // JSONBin のデータを空オブジェクトにリセット
        await this.save({});
        try { localStorage.removeItem(KEY); } catch(_) {}
      },
    },

    // ── ③ Firebase Realtime Database（将来用スタブ）────────
    firebase: {
      _db() {
        // Firebase SDK がロードされている前提
        if (typeof firebase === 'undefined') throw new Error('Firebase SDK not loaded');
        return firebase.database().ref(APP_CONFIG.FIREBASE.dbPath);
      },
      async load() {
        const snap = await this._db().once('value');
        return snap.val();
      },
      async save(db) {
        await this._db().set(db);
        try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(_) {}
        return true;
      },
      async clear() {
        await this._db().remove();
        try { localStorage.removeItem(KEY); } catch(_) {}
      },
    },

  };

  // ─────────────────────────────────────────────────────────
  //  アクティブなバックエンドを選択して公開
  // ─────────────────────────────────────────────────────────
  const backend = backends[APP_CONFIG.BACKEND] || backends.local;

  if (APP_CONFIG.BACKEND !== 'local') {
    console.info(`[Storage] backend = ${APP_CONFIG.BACKEND}`);
  }

  return {
    load:  (...args) => backend.load(...args),
    save:  (...args) => backend.save(...args),
    clear: (...args) => backend.clear(...args),

    // 便利メソッド: 現在のバックエンド名を返す
    get backend() { return APP_CONFIG.BACKEND; },
  };

})();
