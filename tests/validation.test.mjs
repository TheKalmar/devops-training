import test from "node:test";
import assert from "node:assert/strict";
import { validId, validateTask } from "../lib/task.ts";

test("positive signed INT ids only", () => {
  assert.equal(validId("1"), 1);
  assert.equal(validId("2147483647"), 2147483647);
  for (const id of ["0", "-1", "1.5", "abc", "1 OR 1=1", "2147483648", "01"]) assert.equal(validId(id), null);
});
test("create defaults completed and trims title", () => {
  assert.deepEqual(validateTask({ title: "  Learn DevOps  " }), { title: "Learn DevOps", completed: false });
});
test("reject invalid payloads", () => {
  for (const body of [null, [], "x", {}, { title: " " }, { title: "a".repeat(256) }, { title: "x", completed: 1 }, { title: "x", id: 3 }]) {
    assert.equal(typeof validateTask(body), "string");
  }
});
test("PUT requires completed; boolean false stays false", () => {
  assert.equal(typeof validateTask({ title: "x" }, true), "string");
  assert.deepEqual(validateTask({ title: "x", completed: false }, true), { title: "x", completed: false });
});
test("255 Unicode characters are accepted", () => {
  assert.equal(typeof validateTask({ title: "😀".repeat(255) }), "object");
});
