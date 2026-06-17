// ═══════════════════════════════════════════════════════════
//  config.js  ―  バックエンド設定ファイル
//
//  ⚠️  ACCESS KEY はサーバーサイドに移すまでの暫定管理です。
//      本番運用では GitHub Pages の Secret や Firebase
//      Environment Variables に移行してください。
//
//  バックエンド切り替え方法:
//    BACKEND = 'local'    → localStorage のみ（オフライン可）
//    BACKEND = 'jsonbin'  → JSONBin.io（現在の設定）
//    BACKEND = 'firebase' → Firebase Realtime Database（将来）
// ═══════════════════════════════════════════════════════════

const APP_CONFIG = {

  // ── アクティブなバックエンド ──────────────────────────────
  BACKEND: 'jsonbin',   // 'local' | 'jsonbin' | 'firebase'

  // ── localStorage キー ────────────────────────────────────
  LOCAL_KEY: 'ys_cat3_db_v1',

  // ── JSONBin 設定 ─────────────────────────────────────────
  JSONBIN: {
    BIN_ID:     '6a2f80c5da38895dfec17816',
    ACCESS_KEY: '$2a$10$gVqE3KMsOWy6SvbciiqvfO9BUIBGUJ4l3LzNb3OtaubQAliL/D8f6',
    BASE_URL:   'https://api.jsonbin.io/v3/b',
  },

  // ── Firebase 設定（将来用・現在は未使用）────────────────
  FIREBASE: {
    apiKey:            '',
    authDomain:        '',
    databaseURL:       '',
    projectId:         '',
    storageBucket:     '',
    messagingSenderId: '',
    appId:             '',
    dbPath:            '/ys_cat3',  // Realtime Database のパス
  },

};
