import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const requiredFiles = [
  "index.html",
  "styles.css",
  "main.js",
  "package.json",
  "README.md",
  "AGENTS.md",
  "templates/modern-minimal.html",
  "templates/cyber-future.html",
  "templates/trend-culture.html"
];

requiredFiles.forEach((file) => {
  assert(statSync(join(root, file)).isFile(), `Missing required file: ${file}`);
});

const htmlFiles = [
  "index.html",
  "templates/modern-minimal.html",
  "templates/cyber-future.html",
  "templates/trend-culture.html"
];

const css = read("styles.css");
const js = read("main.js");
const agents = read("AGENTS.md");
const pages = Object.fromEntries(htmlFiles.map((file) => [file, read(file)]));
const allHtml = Object.values(pages).join("\n");

htmlFiles.forEach((file) => {
  const html = pages[file];
  assert(html.includes('id="atmosphere"'), `${file}: canvas #atmosphere is missing`);
  assert(html.includes("main.js"), `${file}: script reference is missing`);
  assert(!/(?:src|href)="https?:\/\//.test(html), `${file}: external runtime references are not allowed`);
});

assert((pages["index.html"].match(/data-template-link/g) || []).length >= 3, "Homepage must link to three template detail pages");
assert(pages["index.html"].includes("templates/modern-minimal.html"), "Homepage missing modern detail link");
assert(pages["index.html"].includes("templates/cyber-future.html"), "Homepage missing cyber detail link");
assert(pages["index.html"].includes("templates/trend-culture.html"), "Homepage missing trend detail link");

[
  "templates/modern-minimal.html",
  "templates/cyber-future.html",
  "templates/trend-culture.html"
].forEach((file) => {
  const html = pages[file];
  assert(html.includes('data-page="detail"'), `${file}: detail page marker missing`);
  assert(html.includes("data-interaction-logic"), `${file}: interaction logic section missing`);
  assert(/id="prompt-[^"]+detail"/.test(html), `${file}: detail prompt block missing`);
  assert(html.includes("../index.html"), `${file}: return home link missing`);
  assert(html.includes("data-template-link"), `${file}: transition links missing`);
});

const interactionRequirements = {
  "templates/modern-minimal.html": [
    "data-tab-group",
    "data-price-toggle",
    "data-form-demo",
    "data-accordion",
    "data-modal-trigger",
    "data-modal=\"modern-preview\""
  ],
  "templates/cyber-future.html": [
    "data-tab-group",
    "data-form-demo",
    "data-accordion",
    "data-modal-trigger",
    "data-modal=\"cyber-alert\"",
    "data-signal-preset"
  ],
  "templates/trend-culture.html": [
    "data-carousel",
    "data-variant-selector",
    "data-form-demo",
    "data-accordion",
    "data-modal=\"trend-lookbook\"",
    "data-drag-card"
  ]
};

Object.entries(interactionRequirements).forEach(([file, markers]) => {
  markers.forEach((marker) => {
    assert(pages[file].includes(marker), `${file}: missing interaction marker ${marker}`);
  });
});

const homeCards = (pages["index.html"].match(/class="[^"]*\btemplate-card\b[^"]*"/g) || []).length;
const promptCount = (allHtml.match(/id="prompt-[^"]+"/g) || []).length;
const copyCount = (allHtml.match(/data-copy="prompt-[^"]+"/g) || []).length;
assert(homeCards >= 3, `Expected at least 3 homepage template cards, found ${homeCards}`);
assert(promptCount >= 6, `Expected at least 6 prompt blocks across pages, found ${promptCount}`);
assert(copyCount >= 6, `Expected at least 6 copy buttons across pages, found ${copyCount}`);

[
  "homeScene",
  "modernScene",
  "cyberScene",
  "trendScene",
  "transitionScene"
].forEach((scene) => {
  assert(js.includes(scene), `main.js missing scene registry entry: ${scene}`);
});

assert(js.includes("data-theme-option"), "Theme switch interaction is missing");
assert(js.includes("data-cyber-node"), "Cyber node interaction is missing");
assert(js.includes("data-trend-cycle"), "Trend cycle interaction is missing");
assert(js.includes("data-template-link"), "Template transition interaction is missing");
assert(js.includes("navigator.clipboard"), "Clipboard copy path is missing");

[
  "initTabs",
  "initAccordions",
  "initModals",
  "initDemoForms",
  "initCarousels",
  "initPriceToggles",
  "initVariantSelectors",
  "initDragCards"
].forEach((initializer) => {
  assert(js.includes(initializer), `main.js missing interaction initializer: ${initializer}`);
});

assert(css.includes("@media"), "Responsive media queries are missing");
assert(css.includes("prefers-reduced-motion"), "Reduced-motion handling is missing");
assert(css.includes("[data-modern-theme=\"dark\"]"), "Modern dark theme styles are missing");
assert(css.includes("[data-scene=\"cyber\"]"), "Cyber scene styles are missing");
assert(css.includes("[data-scene=\"trend\"]"), "Trend scene styles are missing");
assert(css.includes(".interaction-lab"), "Interaction lab styles are missing");
assert(css.includes(".modal-backdrop"), "Modal styles are missing");
assert(!css.includes("letter-spacing: -"), "Negative letter spacing is not allowed");

[
  "## Project Snapshot",
  "## Commands",
  "## Environment Variables",
  "## Important Implementation Details",
  "## Editing Guidelines",
  "## Verification",
  "## Knowledge Write-Back",
  "## Do Not"
].forEach((section) => {
  assert(agents.includes(section), `AGENTS.md missing section: ${section}`);
});

console.log(`ui-template validation passed (${homeCards} cards, ${htmlFiles.length} pages, ${promptCount} prompts).`);
