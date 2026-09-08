/**
 * Design-token compliance check.
 *
 * Scans src/**\/*.{ts,tsx} for two classes of "style from nowhere" instead
 * of the design system's tokens (see docs/design-system.md):
 *
 * 1. Raw arbitrary color values — Tailwind bracket syntax like bg-[#6fbfbf],
 *    or literal hex/rgb(a) inside an inline style={{...}} — instead of the
 *    tokens defined in src/app/globals.css's @theme block.
 * 2. Invalid Tailwind color-scale steps — e.g. text-zinc-450, hover:bg-zinc-750.
 *    Tailwind's real palette only has 50/100/200/.../900/950; any other
 *    number generates no CSS at all, so the class silently does nothing.
 *
 * Usage: npx tsx scripts/check-design-tokens.ts
 * Exits 1 if any arbitrary value exactly duplicates an existing token (should
 * use the token's utility class instead) or any invalid color step is found.
 * Arbitrary values with no matching token are warnings only — could be a
 * legitimate one-off (chart SVG colors, etc.) or could mean a new token is
 * missing.
 */
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const GLOBALS_CSS = path.join(ROOT, "src/app/globals.css");

// Files/dirs where raw colors are an accepted exception (chart SVG stroke/fill
// needs literal color values; add more globs here as legitimate cases surface).
const IGNORE_GLOBS = [/\/charts\//, /\/generated\//];

interface Token {
  name: string; // e.g. "accent-life"
  value: string; // normalized, e.g. "#6fbfbf"
}

function normalizeColor(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

function loadTokens(): Token[] {
  const css = readFileSync(GLOBALS_CSS, "utf8");
  const tokens: Token[] = [];
  const re = /--color-([a-z0-9-]+):\s*([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const name = m[1];
    const value = m[2].trim();
    // skip self-referencing aliases like --color-accent: var(--color-accent);
    if (value.startsWith("var(")) continue;
    tokens.push({ name, value: normalizeColor(value) });
  }
  return tokens;
}

function findToken(tokens: Token[], value: string): Token | undefined {
  const normalized = normalizeColor(value);
  return tokens.find((t) => t.value === normalized);
}

const COLOR_UTILITY_PREFIXES =
  "bg|text|border|ring|shadow|outline|divide|from|to|via|fill|stroke|decoration|caret|accent|placeholder";

// Tailwind arbitrary-value color utility: bg-[#6fbfbf], text-[rgba(0,0,0,0.5)], shadow-[0_0_15px_rgba(37,99,235,0.08)]
const ARBITRARY_CLASS_RE = new RegExp(
  `\\b(${COLOR_UTILITY_PREFIXES})-\\[([^\\]]*(?:#[0-9a-fA-F]{3,8}|rgba?\\([^)]*\\))[^\\]]*)\\]`,
  "g",
);

const HEX_OR_RGBA_RE = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g;

// Tailwind's real palette step scale — any color-family-NNN utility using a
// number outside this set (e.g. text-zinc-450, hover:bg-zinc-750) generates
// no CSS at all and silently does nothing. These are almost always typos.
const VALID_PALETTE_STEPS = new Set([
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
]);
const COLOR_FAMILIES =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const INVALID_STEP_RE = new RegExp(
  `\\b((?:${COLOR_UTILITY_PREFIXES})-(?:${COLOR_FAMILIES})-)(\\d{2,3})\\b`,
  "g",
);

interface Finding {
  file: string;
  line: number;
  snippet: string;
  matchedValue: string;
  token?: Token;
  kind: "arbitrary-class" | "inline-style" | "invalid-step";
}

function isIgnored(file: string): boolean {
  return IGNORE_GLOBS.some((re) => re.test(file));
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "generated" || entry === "node_modules") continue;
      walkTsFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

function scanFile(file: string, tokens: Token[]): Finding[] {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  const findings: Finding[] = [];

  lines.forEach((line, idx) => {
    let m: RegExpExecArray | null;
    ARBITRARY_CLASS_RE.lastIndex = 0;
    while ((m = ARBITRARY_CLASS_RE.exec(line))) {
      const inner = m[2];
      const colorMatch = inner.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/);
      if (!colorMatch) continue;
      const value = colorMatch[0];
      findings.push({
        file,
        line: idx + 1,
        snippet: line.trim(),
        matchedValue: value,
        token: findToken(tokens, value),
        kind: "arbitrary-class",
      });
    }
  });

  lines.forEach((line, idx) => {
    let m: RegExpExecArray | null;
    INVALID_STEP_RE.lastIndex = 0;
    while ((m = INVALID_STEP_RE.exec(line))) {
      const step = m[2];
      if (VALID_PALETTE_STEPS.has(step)) continue;
      findings.push({
        file,
        line: idx + 1,
        snippet: line.trim(),
        matchedValue: m[0],
        kind: "invalid-step",
      });
    }
  });

  // Inline style={{ ... }} blocks may span multiple lines — scan the whole
  // file for style={{...}} and look for literal color values inside.
  const styleRe = /style=\{\{([\s\S]*?)\}\}/g;
  let sm: RegExpExecArray | null;
  while ((sm = styleRe.exec(content))) {
    const block = sm[1];
    let cm: RegExpExecArray | null;
    HEX_OR_RGBA_RE.lastIndex = 0;
    while ((cm = HEX_OR_RGBA_RE.exec(block))) {
      const value = cm[0];
      const upToMatch = content.slice(0, sm.index + cm.index);
      const line = upToMatch.split("\n").length;
      findings.push({
        file,
        line,
        snippet: block.trim().replace(/\s+/g, " ").slice(0, 100),
        matchedValue: value,
        token: findToken(tokens, value),
        kind: "inline-style",
      });
    }
  }

  return findings;
}

function main() {
  const tokens = loadTokens();
  if (tokens.length === 0) {
    console.error(`No --color-* tokens found in ${GLOBALS_CSS} — check the file/regex.`);
    process.exit(2);
  }

  const files = walkTsFiles(path.join(ROOT, "src"));

  const errors: Finding[] = [];
  const warnings: Finding[] = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (isIgnored(rel)) continue;
    if (rel === "src/app/globals.css") continue;
    for (const finding of scanFile(file, tokens)) {
      if (finding.kind === "invalid-step" || finding.token) errors.push(finding);
      else warnings.push(finding);
    }
  }

  console.log(`Design tokens loaded from globals.css: ${tokens.map((t) => t.name).join(", ")}\n`);

  const dupErrors = errors.filter((f) => f.kind !== "invalid-step");
  const stepErrors = errors.filter((f) => f.kind === "invalid-step");

  if (dupErrors.length > 0) {
    console.log(
      `✖ ${dupErrors.length} value(s) duplicate an existing token — use the token class:\n`,
    );
    for (const f of dupErrors) {
      const rel = path.relative(ROOT, f.file);
      console.log(`  ${rel}:${f.line}`);
      console.log(
        `    "${f.matchedValue}" matches token --color-${f.token!.name} -> use a "*-${f.token!.name}" class`,
      );
      console.log(`    ${f.snippet}\n`);
    }
  }

  if (stepErrors.length > 0) {
    console.log(
      `✖ ${stepErrors.length} invalid Tailwind color step(s) — not in the real palette scale (50/100/200/.../900/950), so they generate no CSS at all:\n`,
    );
    for (const f of stepErrors) {
      const rel = path.relative(ROOT, f.file);
      console.log(`  ${rel}:${f.line}  "${f.matchedValue}"`);
      console.log(`    ${f.snippet}\n`);
    }
  }

  if (warnings.length > 0) {
    console.log(
      `⚠ ${warnings.length} arbitrary color value(s) with no matching token (review — may be fine, e.g. chart colors, or may need a new token):\n`,
    );
    for (const f of warnings) {
      const rel = path.relative(ROOT, f.file);
      console.log(`  ${rel}:${f.line}  "${f.matchedValue}"  (${f.kind})`);
    }
    console.log("");
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("✓ No raw color values found outside the design system tokens.");
  }

  if (errors.length > 0) {
    process.exit(1);
  }
}

main();
