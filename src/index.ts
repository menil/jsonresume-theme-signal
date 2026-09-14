import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Handlebars from "handlebars";
import { prepareResume, registerHelpers } from "./helpers.ts";
import styleCss from "./style.css" with { type: "text" };
import templateSource from "./template.hbs" with { type: "text" };
import type { ResumeData, ThemeOptions } from "./types.ts";

const hbs = Handlebars.create();
registerHelpers(hbs);

const compiledTemplate = hbs.compile(templateSource);

/**
 * Renders a JSON Resume object to an HTML string.
 */
export function render(resume: ResumeData = {}, options: ThemeOptions = {}): string {
  const prepared = prepareResume(resume, options.asOfYear);
  prepared.is_pdf = options.is_pdf ?? false;

  return compiledTemplate({
    ...prepared,
    css: styleCss,
  });
}

/**
 * Builds an HTML file from a JSON Resume JSON file on disk.
 */
export function buildHtml(
  inputJsonPath: string,
  outputPath?: string,
  options: ThemeOptions = {},
): string {
  let data: ResumeData;
  try {
    const raw = readFileSync(inputJsonPath, "utf-8");
    data = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Failed to read or parse JSON Resume file at "${inputJsonPath}": ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let targetPath = outputPath;
  if (!targetPath) {
    const name = data.basics?.name || "resume";
    const slug = name.toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
    targetPath = join(dirname(inputJsonPath), `${slug}_resume.html`);
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  const html = render(data, options);
  writeFileSync(targetPath, html, "utf-8");
  return targetPath;
}

// CLI usage: bun src/index.ts <input.json> [output.html]
const isCliEntrypoint =
  typeof process !== "undefined" &&
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCliEntrypoint) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: bun src/index.ts <input.json> [output.html]");
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];

  try {
    const createdPath = buildHtml(inputFile, outputFile);
    console.log(`Success! Created ${createdPath}`);
  } catch (err) {
    console.error("Error generating HTML:", err);
    process.exit(1);
  }
}
