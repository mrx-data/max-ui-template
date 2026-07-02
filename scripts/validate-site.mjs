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
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "README.md",
  "AGENTS.md",
  "src/main.ts",
  "src/dom.ts",
  "src/canvas.ts",
  "src/interactions/common.ts",
  "src/interactions/portfolio-motion.ts",
  "src/interactions/templates.ts",
  "templates/modern-minimal.html",
  "templates/cyber-future.html",
  "templates/trend-culture.html",
  "templates/personal-portfolio.html"
];

requiredFiles.forEach((file) => {
  assert(statSync(join(root, file)).isFile(), `Missing required file: ${file}`);
});

const htmlFiles = [
  "index.html",
  "templates/modern-minimal.html",
  "templates/cyber-future.html",
  "templates/trend-culture.html",
  "templates/personal-portfolio.html"
];

const css = read("styles.css");
const packageJson = JSON.parse(read("package.json"));
const sourceFiles = [
  "src/main.ts",
  "src/dom.ts",
  "src/canvas.ts",
  "src/interactions/common.ts",
  "src/interactions/portfolio-motion.ts",
  "src/interactions/templates.ts",
  "vite.config.ts"
];
const ts = sourceFiles.map((file) => read(file)).join("\n");
const agents = read("AGENTS.md");
const pages = Object.fromEntries(htmlFiles.map((file) => [file, read(file)]));
const allHtml = Object.values(pages).join("\n");

htmlFiles.forEach((file) => {
  const html = pages[file];
  assert(html.includes('id="atmosphere"'), `${file}: canvas #atmosphere is missing`);
  assert(html.includes('type="module" src="/src/main.ts"'), `${file}: Vite TypeScript entry script is missing`);
  assert(!html.includes("main.js"), `${file}: legacy main.js reference must be removed`);
  assert(!/(?:src|href)="https?:\/\//.test(html), `${file}: external runtime references are not allowed`);
});

assert(packageJson.scripts?.dev?.includes("vite"), "npm run dev must use Vite");
assert(packageJson.scripts?.build?.includes("vite build"), "npm run build must run Vite build");
assert(packageJson.scripts?.typecheck?.includes("tsc --noEmit"), "typecheck script must run TypeScript");
assert(packageJson.devDependencies?.vite, "Vite devDependency is missing");
assert(packageJson.devDependencies?.typescript, "TypeScript devDependency is missing");
assert(packageJson.dependencies?.gsap, "GSAP dependency is missing for portfolio motion");
assert(read("vite.config.ts").includes("templates/modern-minimal.html"), "Vite config must include modern detail page input");
assert(read("vite.config.ts").includes("templates/cyber-future.html"), "Vite config must include cyber detail page input");
assert(read("vite.config.ts").includes("templates/trend-culture.html"), "Vite config must include trend detail page input");
assert(read("vite.config.ts").includes("templates/personal-portfolio.html"), "Vite config must include portfolio detail page input");

assert((pages["index.html"].match(/data-template-link/g) || []).length >= 4, "Homepage must link to four template detail pages");
assert(pages["index.html"].includes("templates/modern-minimal.html"), "Homepage missing modern detail link");
assert(pages["index.html"].includes("templates/cyber-future.html"), "Homepage missing cyber detail link");
assert(pages["index.html"].includes("templates/trend-culture.html"), "Homepage missing trend detail link");
assert(pages["index.html"].includes("templates/personal-portfolio.html"), "Homepage missing portfolio detail link");

[
  "templates/modern-minimal.html",
  "templates/cyber-future.html",
  "templates/trend-culture.html",
  "templates/personal-portfolio.html"
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
  ],
  "templates/personal-portfolio.html": [
    "data-portfolio-reel",
    "data-portfolio-reel-toggle",
    "data-portfolio-filter",
    "data-portfolio-card",
    "data-portfolio-opening",
    "data-motion-section",
    "data-motion-title",
    "data-motion-image",
    "data-motion-parallax",
    "data-form-demo",
    "data-modal=\"portfolio-case\""
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
assert(homeCards >= 4, `Expected at least 4 homepage template cards, found ${homeCards}`);
assert(promptCount >= 8, `Expected at least 8 prompt blocks across pages, found ${promptCount}`);
assert(copyCount >= 8, `Expected at least 8 copy buttons across pages, found ${copyCount}`);

[
  "homeScene",
  "modernScene",
  "cyberScene",
  "trendScene",
  "portfolioScene",
  "transitionScene"
].forEach((scene) => {
  assert(ts.includes(scene), `src canvas module missing scene registry entry: ${scene}`);
});

assert(ts.includes("data-theme-option"), "Theme switch interaction is missing");
assert(ts.includes("data-cyber-node"), "Cyber node interaction is missing");
assert(ts.includes("data-trend-cycle"), "Trend cycle interaction is missing");
assert(ts.includes("data-portfolio-filter"), "Portfolio filter interaction is missing");
assert(ts.includes("ScrollTrigger"), "Portfolio ScrollTrigger motion is missing");
assert(ts.includes("data-portfolio-opening"), "Portfolio opening animation is missing");
assert(ts.includes("data-motion-section"), "Portfolio scroll motion sections are missing");
assert(ts.includes("data-template-link"), "Template transition interaction is missing");
assert(ts.includes("navigator.clipboard"), "Clipboard copy path is missing");

[
  "initTabs",
  "initAccordions",
  "initModals",
  "initDemoForms",
  "initCarousels",
  "initPriceToggles",
  "initVariantSelectors",
  "initDragCards",
  "initPortfolioDemo",
  "initPortfolioMotion"
].forEach((initializer) => {
  assert(ts.includes(initializer), `src interaction modules missing initializer: ${initializer}`);
});

[
  "src/canvas.ts",
  "src/interactions/common.ts",
  "src/interactions/portfolio-motion.ts",
  "src/interactions/templates.ts"
].forEach((modulePath) => {
  assert(read("src/main.ts").includes(modulePath.replace("src/", "./").replace(".ts", "")), `src/main.ts must import ${modulePath}`);
});

assert(css.includes("@media"), "Responsive media queries are missing");
assert(css.includes("prefers-reduced-motion"), "Reduced-motion handling is missing");
assert(css.includes("[data-modern-theme=\"dark\"]"), "Modern dark theme styles are missing");
assert(css.includes("[data-scene=\"cyber\"]"), "Cyber scene styles are missing");
assert(css.includes("[data-scene=\"trend\"]"), "Trend scene styles are missing");
assert(css.includes("[data-scene=\"portfolio\"]"), "Portfolio scene styles are missing");
assert(css.includes(".portfolio-opening"), "Portfolio opening styles are missing");
assert(css.includes(".portfolio-display-title"), "Portfolio display title styles are missing");
assert(css.includes(".interaction-lab"), "Interaction lab styles are missing");
assert(css.includes(".modal-backdrop"), "Modal styles are missing");
assert(css.includes(".portfolio-case-grid"), "Portfolio case grid styles are missing");
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
