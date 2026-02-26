import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseAsync("healthcare.db");

export async function initDB() {
  const database = await db;

  // bật foreign key cho SQLite
  await database.execAsync(`
    PRAGMA foreign_keys = ON;
  `);

  // bảng user (test)
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ SQLite DB initialized");
}
