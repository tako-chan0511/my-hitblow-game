// src/lib/db.ts
import initSqlJs, { Database } from 'sql.js';

let db: Database;

/** DB を初期化（既存データがあれば復元） */
export async function getDb(): Promise<Database> {
  if (db) return db;
  const SQL = await initSqlJs({
     locateFile: file =>
      // 開発・本番問わずルート直下の sql-wasm.wasm を参照
      `${window.location.origin}${import.meta.env.BASE_URL}${file}`
  });

  // localStorage から復元
  const saved = localStorage.getItem('hitblow-results-db');
  db = saved
    ? new SQL.Database(new Uint8Array(JSON.parse(saved)))
    : new SQL.Database();

  // 結果テーブルを作成
  db.run(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      digit_count INTEGER,
      attempts INTEGER,
      elapsed_ms INTEGER,
      played_at TEXT
    );
  `);

  return db;
}

/** DB を localStorage に保存 */
export function persistDb() {
  const data = db!.export();
  localStorage.setItem('hitblow-results-db', JSON.stringify(Array.from(data)));
}

/** 結果を追加 */
export async function addResult(
  digitCount: number,
  attempts: number,
  elapsedMs: number
) {
  const database = await getDb();
  const stmt = database.prepare(
    `INSERT INTO results (digit_count, attempts, elapsed_ms, played_at)
     VALUES (?, ?, ?, ?);`
  );
  stmt.run([digitCount, attempts, elapsedMs, new Date().toISOString()]);
  stmt.free();
  persistDb();
}
/** 指定ID のレコードを削除 */
export async function deleteResult(id: number) {
  const database = await getDb();
  database.run(
    `DELETE FROM results WHERE id = ?;`,
    [id]
  );
  // 変更をストレージに書き戻し
  persistDb();
}
/** 結果一覧を取得 */
export async function fetchResults() {
  const database = await getDb();
  const stmt = database.prepare(`SELECT * FROM results ORDER BY id DESC;`);
  const rows: Array<{
    id: number;
    digit_count: number;
    attempts: number;
    elapsed_ms: number;
    played_at: string;
  }> = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as any);
  }
  stmt.free();
  return rows;
}
