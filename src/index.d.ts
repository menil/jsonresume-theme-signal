import type { ResumeData, ThemeOptions } from "./types.ts";

export * from "./types.ts";

/**
 * Default Puppeteer PDF rendering options for the resumed CLI.
 */
export declare const pdfRenderOptions: {
  readonly format: "Letter";
  readonly printBackground: true;
  readonly preferCSSPageSize: true;
};

/**
 * Renders a JSON Resume object to an HTML string.
 */
export declare function render(resume?: ResumeData, options?: ThemeOptions): string;

/**
 * Builds an HTML file from a JSON Resume JSON file on disk.
 */
export declare function buildHtml(
  inputJsonPath: string,
  outputPath?: string,
  options?: ThemeOptions,
): string;
