# jsonresume-theme-signal

> High-signal, print-ready [JSON Resume](https://jsonresume.org) theme with multi-role company grouping, early career partitioning, and pristine typography.

[![Validate](https://github.com/menil/jsonresume-theme-signal/actions/workflows/validate.yml/badge.svg)](https://github.com/menil/jsonresume-theme-signal/actions/workflows/validate.yml)
[![npm version](https://img.shields.io/npm/v/jsonresume-theme-signal.svg)](https://www.npmjs.com/package/jsonresume-theme-signal)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## Features

- 🎯 **High Signal-to-Noise Ratio**: Designed specifically for senior engineers, tech leads, and executives. Focuses strictly on impact, architecture, and career progression.
- 🏢 **Multi-Role Company Grouping**: Promoted or transitioned roles at the same organization? Consecutive roles under the same company are grouped under a unified company header instead of duplicating company names.
- ⏳ **Intelligent Career Partitioning**: Positions older than 10 years are automatically partitioned into a clean, condensed "Early Career History" summary table to preserve page space.
- 📐 **Dynamic PDF Page-Fitting**: Automatically detects trailing page overflow (e.g. 1.1 or 2.1 pages) and optimizes typography/margins in real time so your resume fits cleanly into an exact number of pages without trailing orphan lines.
- 📄 **1:1 Print & PDF Optimization**: Uses CSS `@page` and `@media print` rules with strict `break-after: avoid` and `break-inside: avoid` controls to prevent orphaned headers and split roles.
- 🌐 **Dual Web / PDF Rendering**:
  - **Web view**: Renders clean interactive SVG icon badges for LinkedIn, GitHub, Email, and PDF downloads.
  - **PDF / Print view**: Replaces interactive buttons with clean inline contact text (`phone`, `linkedin.com/in/...`).

---

<p align="center">
  <img width="50%" alt="resume_preview-1" src="https://github.com/user-attachments/assets/ff1cd91e-87d0-4216-8d60-13dd2acab749" />
</p>

---

## Installation & Usage

### 1. Using with [`resumed`](https://github.com/rbardini/resumed) (Recommended)

Render to standalone HTML:
```bash
npx resumed render --theme jsonresume-theme-signal resume.json -o resume.html
```

Export directly to PDF (via Puppeteer):
```bash
npx resumed export --theme jsonresume-theme-signal resume.json -o resume.pdf
```

### 2. Using with `resume-cli`

```bash
npx resume-cli export --theme jsonresume-theme-signal resume.pdf
```

### 3. Programmatic API (ESM / TypeScript)

Install as a dependency:
```bash
npm install jsonresume-theme-signal
```

Render HTML programmatically:
```ts
import { render, buildHtml } from "jsonresume-theme-signal";

// Render HTML string from JSON Resume object
const html = render(resumeData, {
  asOfYear: 2026,     // optional: custom reference year for 10-year early career cutoff
  is_pdf: true,       // optional: format header with textual contact info for PDF generation
  fitPages: "auto",   // optional: "auto" | 1 | 2 | 3 | "off"
  density: "normal",  // optional: "compact" | "normal" | "spacious"
});

// Or compile directly from a JSON file on disk
const outputPath = buildHtml("resume.json", "dist/resume.html");
```

---

## Theme Options

Options can be passed programmatically to `render()` or configured directly inside `resume.json` under `meta.themeOptions`:

```json
{
  "basics": { ... },
  "meta": {
    "themeOptions": {
      "fitPages": "auto",
      "fitTolerance": 0.28,
      "density": "normal"
    }
  }
}
```

| Option | Type | Default | Description |
|---|---|---|---|
| `fitPages` | `number \| "auto" \| "off"` | `"off"` | Target page count. When `"auto"` (or an integer such as `1` or `2`), dynamically condenses borderline overflow into the target page count. When `"off"`, preserves default static layout. |
| `fitTolerance` | `number` | `0.28` | Overflow fraction threshold (e.g. `0.28` = up to 28% spill over a page boundary is compressed to fit). |
| `density` | `"compact" \| "normal" \| "spacious"` | `"normal"` | Baseline layout density preset. |
| `asOfYear` | `number` | Current Year | Reference year used to calculate the 10-year cutoff for partitioning early career roles. |
| `is_pdf` | `boolean` | `false` | When `true`, hides interactive web action icons and renders textual contact info in the header. |

---

## Development & Contributing

This project uses [Bun](https://bun.sh) and [Nix](https://nixos.org) for fast, reproducible development.

### Setup

```bash
# Enter development shell
nix-shell

# Install dependencies
bun install
```

### Commands

```bash
# Run test suite
just test

# Typecheck TypeScript
just typecheck

# Lint & check formatting
just lint
just check-format

# Format code
just format

# Build bundle and type declarations
just build

# Run full project validation
just validate
```

---

## License

[MIT](LICENSE) © Meni Livne
