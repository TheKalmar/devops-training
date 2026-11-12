export type TaskInput = { title: string; completed: boolean };

export function validId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

export function validateTask(body: unknown, updating = false): TaskInput | string {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "Expected a JSON object.";
  const value = body as Record<string, unknown>;
  if (Object.keys(value).some((key) => key !== "title" && key !== "completed")) return "Only title and completed are allowed.";
  if (typeof value.title !== "string" || !value.title.trim() || [...value.title.trim()].length > 255) {
    return "title must contain between 1 and 255 characters.";
  }
  if ((updating || value.completed !== undefined) && typeof value.completed !== "boolean") {
    return "completed must be a boolean.";
  }
  return { title: value.title.trim(), completed: value.completed === true };
}
