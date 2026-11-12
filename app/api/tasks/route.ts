import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getDb, databaseError } from "@/lib/db";
import { validateTask } from "@/lib/task";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [rows] = await getDb().execute<RowDataPacket[]>("SELECT id, title, completed FROM tasks ORDER BY id");
    return Response.json(rows.map((row) => ({ ...row, completed: Boolean(row.completed) })));
  } catch (error) {
    return databaseError(error);
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const task = validateTask(body);
  if (typeof task === "string") return Response.json({ error: task }, { status: 400 });
  try {
    const [result] = await getDb().execute<ResultSetHeader>(
      "INSERT INTO tasks (title, completed) VALUES (?, ?)", [task.title, task.completed],
    );
    return Response.json({ id: result.insertId, ...task }, {
      status: 201, headers: { Location: `/api/tasks/${result.insertId}` },
    });
  } catch (error) {
    return databaseError(error);
  }
}
