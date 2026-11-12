import mysql, { type Pool } from "mysql2/promise";

// Lazily create one connection pool. Building the app does not require MySQL.
const globalDb = globalThis as typeof globalThis & { taskPool?: Pool };

export function getDb(): Pool {
  if (!globalDb.taskPool) {
    const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
    for (const name of required) {
      if (!process.env[name]) throw new Error(`Missing environment variable: ${name}`);
    }
    const port = Number(process.env.DB_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("DB_PORT must be a valid port number");
    }
    globalDb.taskPool = mysql.createPool({
      host: process.env.DB_HOST,
      port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectionLimit: 5,
      connectTimeout: 5000,
      charset: "utf8mb4",
    });
  }
  return globalDb.taskPool;
}

export function databaseError(error: unknown): Response {
  // Log only the error code, never connection credentials or SQL values.
  const code = error && typeof error === "object" && "code" in error ? error.code : "DB_ERROR";
  console.error("Database request failed:", code);
  return Response.json({ error: "Database request failed. Check database configuration and availability." }, { status: 503 });
}
