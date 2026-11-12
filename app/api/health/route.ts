import { getDb, databaseError } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().execute("SELECT 1");
    return Response.json({ status: "ok", database: "connected" });
  } catch (error) {
    return databaseError(error);
  }
}
