import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";

// Use a separate database: these tests create and delete their own tasks.
const port = 3100;
const base = `http://127.0.0.1:${port}`;
let server;
let output = "";
const createdIds = new Set();

async function api(path, options = {}) {
  const response = await fetch(`${base}${path}`, { ...options, signal: AbortSignal.timeout(10000) });
  return { status: response.status, body: await response.json(), headers: response.headers };
}
const json = (method, body) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

before(async () => {
  assert.ok(process.env.DB_NAME?.endsWith("_test"), "Use a dedicated DB_NAME ending in _test in .env.test.");
  // Refuse to accidentally test another application already running on this port.
  let occupied = false;
  try { await fetch(base, { signal: AbortSignal.timeout(1000) }); occupied = true; } catch {}
  assert.equal(occupied, false, "Port 3100 is occupied. Stop that application before running these tests.");
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    env: { ...process.env, NODE_ENV: "production" }, stdio: ["ignore", "pipe", "pipe"],
  });
  server.stdout.on("data", (data) => { output += data; });
  server.stderr.on("data", (data) => { output += data; });
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error(`Next.js exited. Run npm run build first.\n${output}`);
    try { await fetch(base, { signal: AbortSignal.timeout(1000) }); return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`API did not start.\n${output}`);
});

after(async () => {
  for (const id of createdIds) {
    try { await api(`/api/tasks/${id}`, { method: "DELETE" }); } catch {}
  }
  if (server && server.exitCode === null) {
    const stopped = once(server, "exit");
    server.kill("SIGTERM");
    const timer = setTimeout(() => server.kill("SIGKILL"), 5000);
    await stopped;
    clearTimeout(timer);
  }
});

test("health verifies real database connectivity", async () => {
  const result = await api("/api/health");
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.deepEqual(result.body, { status: "ok", database: "connected" });
});

test("create, list, read, update, repeat update, delete and not-found", async () => {
  // SQL-looking input must be stored literally, not executed.
  const title = `Training '); DROP TABLE tasks; -- ${Date.now()}`;
  const created = await api("/api/tasks", json("POST", { title }));
  assert.equal(created.status, 201, JSON.stringify(created.body));
  const id = created.body.id;
  createdIds.add(id);
  assert.ok(Number.isInteger(id));
  assert.deepEqual(created.body, { id, title, completed: false });
  assert.equal(created.headers.get("location"), `/api/tasks/${id}`);
  const listed = await api("/api/tasks");
  assert.equal(listed.status, 200);
  assert.ok(listed.body.some((task) => task.id === id && task.title === title));
  assert.deepEqual((await api(`/api/tasks/${id}`)).body, created.body);
  for (let i = 0; i < 2; i++) {
    const updated = await api(`/api/tasks/${id}`, json("PUT", { title: "Updated task", completed: true }));
    assert.equal(updated.status, 200);
    assert.deepEqual(updated.body, { id, title: "Updated task", completed: true });
  }
  assert.deepEqual((await api(`/api/tasks/${id}`)).body, { id, title: "Updated task", completed: true });
  assert.equal((await api(`/api/tasks/${id}`, { method: "DELETE" })).status, 200);
  createdIds.delete(id);
  assert.equal((await api(`/api/tasks/${id}`)).status, 404);
  assert.equal((await api(`/api/tasks/${id}`, json("PUT", { title: "Missing", completed: false }))).status, 404);
  assert.equal((await api(`/api/tasks/${id}`, { method: "DELETE" })).status, 404);
});

test("invalid payloads and ids return JSON 400 errors", async () => {
  for (const body of [{}, { title: " " }, { title: "x".repeat(256) }, { title: "x", completed: "false" }, { title: "x", id: 1 }]) {
    const result = await api("/api/tasks", json("POST", body));
    assert.equal(result.status, 400);
    assert.equal(typeof result.body.error, "string");
  }
  assert.equal((await api("/api/tasks", { method: "POST", body: "{" })).status, 400);
  assert.equal((await api("/api/tasks/1", json("PUT", { title: "Missing completed" }))).status, 400);
  for (const method of ["GET", "PUT", "DELETE"]) {
    assert.equal((await api("/api/tasks/not-a-number", { method })).status, 400);
  }
});
