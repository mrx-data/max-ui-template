# ui-template

一个静态前端 UI 模板展示站。当前版本把三套不同风格的 UI 模板做成可独立打开的交互样板，提供可复制给 AI 使用的提示词，并用轻量 canvas 视觉让网站本身保持高级、简约、大气。

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Homepage, template cards, prompt content |
| `templates/modern-minimal.html` | Modern website template with theme switching |
| `templates/cyber-future.html` | Cyber future HUD template |
| `templates/trend-culture.html` | Trend culture template |
| `styles.css` | Visual system, responsive layout, template previews |
| `src/main.ts` | Vite TypeScript entry that initializes scenes and interactions |
| `src/canvas.ts` | Canvas scene registry and motion state |
| `src/interactions/` | Modular interaction initializers for copy, tabs, modals, forms, carousel, and template demos |
| `vite.config.ts` | Vite multi-page build inputs |
| `scripts/validate-site.mjs` | Static validation for required structure |
| `AGENTS.md` | Agent workflow, boundaries, verification, write-back |

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Use `npm run dev` for local development. Production output is generated into `dist/` by `npm run build`.

## First Phase Scope

- Three visible UI template styles on the homepage.
- Each template opens into a dedicated interactive detail page.
- Each template includes a preview, motion tags, interaction logic, and reusable prompt.
- Prompt copy buttons work without a backend.
- Canvas scenes are decorative, lightweight, and non-blocking.
- Vite and TypeScript are development/build-time tools only; the site still has no backend, secrets, or external runtime services.
