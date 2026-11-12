import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getDb, databaseError } from "@/lib/db";
import { validId, validateTask } from "@/lib/task";

type Context = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const invalidId = () => Response.json({ error: "id must be a positive integer." }, { status: 400 });
const notFound = () => Response.json({ error: "Task not found." }, { status: 404 });

export async function GET(_request: Request, context: Context) {
  const id = validId((await context.params).id);
  if (id === null) return invalidId();
  try {
    const [rows] = await getDb().execute<RowDataPacket[]>(
      "SELECT id, title, completed FROM tasks WHERE id = ?", [id],
    );
    if (!rows.length) return notFound();
    return Response.json({ ...rows[0], completed: Boolean(rows[0].completed) });
  } catch (error) { return databaseError(error); }
}

export async function PUT(request: Request, context: Context) {
  const id = validId((await context.params).id);
  if (id === null) return invalidId();
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const task = validateTask(body, true);
  if (typeof task === "string") return Response.json({ error: task }, { status: 400 });
  try {
    // mysql2 enables FOUND_ROWS by default, so unchanged existing rows also count.
    const [result] = await getDb().execute<ResultSetHeader>(
      "UPDATE tasks SET title = ?, completed = ? WHERE id = ?", [task.title, task.completed, id],
    );
    if (!result.affectedRows) return notFound();
    return Response.json({ id, ...task });
  } catch (error) { return databaseError(error); }
}

export async function DELETE(_request: Request, context: Context) {
  const id = validId((await context.params).id);
  if (id === null) return invalidId();
  try {
    const [result] = await getDb().execute<ResultSetHeader>("DELETE FROM tasks WHERE id = ?", [id]);
    if (!result.affectedRows) return notFound();
    return Response.json({ message: "Task deleted." });
  } catch (error) { return databaseError(error); }
}
