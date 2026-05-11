import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("Next.js scaffold exposes expected scripts and app entry points", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));

  assert.equal(pkg.scripts.dev, "next dev");
  assert.equal(pkg.scripts.build, "next build");
  assert.equal(pkg.scripts.test, "node --test tests/*.test.mjs");
  assert.ok(pkg.dependencies.next);
  assert.ok(pkg.dependencies["@openai/agents"]);

  await access("src/app/page.jsx");
  await access("src/app/layout.jsx");
  await access("src/app/api/realtime/session/route.js");
  await access("src/app/api/sessions/route.js");
});
