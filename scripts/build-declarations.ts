import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = join(import.meta.dirname, "..");
const srcPath = join(rootDir, "src", "index.d.ts");
const targetPath = join(rootDir, "index.d.ts");

const srcDeclaration = readFileSync(srcPath, "utf-8");
// Adjust relative imports from src-relative to root-relative for the root index.d.ts
const rootDeclaration = srcDeclaration.replaceAll('"./types.ts"', '"./src/types.ts"');

writeFileSync(targetPath, rootDeclaration, "utf-8");
