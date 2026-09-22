import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const scriptPath = join(import.meta.dirname, "../scripts/bump-version.sh");

describe("scripts/bump-version.sh", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "bump-version-test-"));
    execSync("git init -b main", { cwd: tempDir });
    execSync('git config user.name "Test User"', { cwd: tempDir });
    execSync('git config user.email "test@example.com"', { cwd: tempDir });
    writeFileSync(join(tempDir, "package.json"), JSON.stringify({ version: "1.0.0" }));
    execSync("git add . && git commit -m 'chore: initial commit'", { cwd: tempDir });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns nothing when only chore or docs commits are present", () => {
    execSync("git tag v1.0.0", { cwd: tempDir });
    writeFileSync(join(tempDir, "README.md"), "# Test");
    execSync("git add . && git commit -m 'docs: update readme'", { cwd: tempDir });

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("");
  });

  it("bumps patch version on fix: commit", () => {
    execSync("git tag v1.0.0", { cwd: tempDir });
    writeFileSync(join(tempDir, "fix.txt"), "fixed");
    execSync("git add . && git commit -m 'fix: resolve formatting issue'", { cwd: tempDir });

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("v1.0.1");
  });

  it("bumps minor version on feat: commit", () => {
    execSync("git tag v1.0.0", { cwd: tempDir });
    writeFileSync(join(tempDir, "feature.txt"), "new feature");
    execSync("git add . && git commit -m 'feat: add new theme layout'", { cwd: tempDir });

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("v1.1.0");
  });

  it("bumps major version on breaking change commit post-1.0", () => {
    execSync("git tag v1.0.0", { cwd: tempDir });
    writeFileSync(join(tempDir, "breaking.txt"), "breaking");
    execSync("git add . && git commit -m 'feat!: overhaul theme options API'", { cwd: tempDir });

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("v2.0.0");
  });

  it("bumps minor version on pre-1.0 breaking change", () => {
    execSync("git tag v0.1.0", { cwd: tempDir });
    writeFileSync(join(tempDir, "breaking.txt"), "pre-1.0 breaking");
    execSync("git add . && git commit -m 'feat!: early break'", { cwd: tempDir });

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("v0.2.0");
  });

  it("handles BREAKING CHANGE in commit body", () => {
    execSync("git tag v1.0.0", { cwd: tempDir });
    writeFileSync(join(tempDir, "body-break.txt"), "body break");
    execSync(
      'git add . && git commit -m "fix: adjust export format" -m "BREAKING CHANGE: changes return type"',
      { cwd: tempDir },
    );

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("v2.0.0");
  });

  it("handles scoped breaking change like fix(theme)!:", () => {
    execSync("git tag v1.0.0", { cwd: tempDir });
    writeFileSync(join(tempDir, "scope-break.txt"), "scoped break");
    execSync("git add . && git commit -m 'fix(theme)!: drop legacy theme key'", {
      cwd: tempDir,
    });

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("v2.0.0");
  });

  it("falls back to package.json version when no tags exist", () => {
    // No tags added
    writeFileSync(join(tempDir, "fix.txt"), "fix without tags");
    execSync("git add . && git commit -m 'fix: initial patch fix'", { cwd: tempDir });

    const output = execSync(`sh "${scriptPath}"`, { cwd: tempDir, encoding: "utf-8" });
    expect(output.trim()).toBe("v1.0.1");
  });
});
