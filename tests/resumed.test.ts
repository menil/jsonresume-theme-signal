import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

describe("Resumed CLI Integration", () => {
  let tmpDir: string;
  const bundlePath = join(import.meta.dir, "..", "index.js");
  const fixturePath = join(import.meta.dir, "fixtures", "sample_resume.json");

  beforeAll(async () => {
    tmpDir = mkdtempSync(join(tmpdir(), "resumed-test-"));
    // Ensure index.js is built
    const proc = Bun.spawnSync([
      "bun",
      "build",
      join(import.meta.dir, "..", "index.ts"),
      "--outfile",
      bundlePath,
      "--target",
      "node",
      "--format",
      "esm",
      "--packages=bundle",
    ]);
    expect(proc.exitCode).toBe(0);
  });

  afterAll(() => {
    if (existsSync(tmpDir)) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("renders sample resume with resumed CLI", async () => {
    const outputHtml = join(tmpDir, "rendered.html");
    const themeUrl = pathToFileURL(bundlePath).href;

    const proc = Bun.spawnSync([
      "bunx",
      "resumed",
      "render",
      "--theme",
      themeUrl,
      fixturePath,
      "-o",
      outputHtml,
    ]);

    expect(proc.exitCode).toBe(0);
    expect(existsSync(outputHtml)).toBe(true);

    const content = readFileSync(outputHtml, "utf-8");
    expect(content).toContain("Jane Doe");
    expect(content).toContain("Principal Software Architect");
    expect(content).toContain("Acme Cloud Infrastructure");
    expect(content).toContain("DataFlow Networks");
  });
});
