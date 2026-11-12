export function GET() {
  return Response.json({ name: "Task Management API", health: "/api/health", tasks: "/api/tasks" });
}
