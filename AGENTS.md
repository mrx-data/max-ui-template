# ui-template Agent Notes

## Project Snapshot

ui-template is a static frontend UI prompt gallery at `/Users/echo/Documents/work_develop/ui-template`.

The current version shows four different UI styles on the homepage and opens each style in a dedicated interactive detail page. Each template includes a visual demo, interaction logic, canvas scene, and reusable prompt. The site uses HTML, CSS, TypeScript modules, Vite, Canvas, and a locally bundled GSAP dependency for the personal portfolio motion system. It has no backend, database, CDN scripts, or external runtime service dependencies.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server on `127.0.0.1:4173` |
| `npm run lint` | Run the static structure validator and TypeScript typecheck |
| `npm run build` | Run lint/typecheck, then build the Vite multi-page site into `dist/` |
| `npm run preview` | Preview the built Vite output on `127.0.0.1:4173` |

Use `npm run dev` or `npm run preview` for browser checks. Do not rely on opening `index.html` directly now that the browser entry is `/src/main.ts`.

## Environment Variables

No environment variables are required in the first phase.

Do not create `.env`, `.env.local`, tokens, cookies, or secret-bearing files unless a future task explicitly introduces a backend or deployment workflow.

## Important Implementation Details

- `index.html` owns the current template content and prompt text.
- `templates/modern-minimal.html`, `templates/cyber-future.html`, and `templates/trend-culture.html` own the interactive detail pages.
- `styles.css` owns the visual system, preview compositions, and responsive behavior.
- `src/main.ts` is the Vite TypeScript entry and only wires initializers together.
- `src/canvas.ts` owns the canvas scene registry and trail state.
- `src/interactions/common.ts` owns shared copy, transition, tabs, accordion, modal, form, carousel, and pricing interactions.
- `src/interactions/templates.ts` owns modern theme, cyber HUD, trend variant, drag-card, and detail-demo behavior.
- `src/interactions/portfolio-motion.ts` owns the GSAP + ScrollTrigger opening animation, scroll choreography, stagger, reveal, and parallax behavior for the personal portfolio page.
- `vite.config.ts` must keep all four HTML files registered as build inputs.
- `scripts/validate-site.mjs` is the local Sensor for required multi-page Vite/TypeScript structure.
- Canvas effects must remain decorative and must not reduce text readability.
- Template cards should remain visible on the homepage without requiring navigation to another route.

## Editing Guidelines

- Keep Vite and TypeScript as build-time tooling. GSAP is an approved local dependency for the personal portfolio motion system; do not add more npm dependencies unless the user explicitly asks for a new capability.
- Keep cards at 8px radius or less.
- Preserve four clearly distinct styles unless the task is specifically about replacing or expanding them: modern website, cyber future, trend culture, and personal portfolio.
- Keep dedicated detail pages linked from the homepage with `data-template-link`.
- Keep `body[data-page]` and `body[data-scene]` markers aligned with the scene registry in `src/canvas.ts`.
- Treat prompt text as product content. If prompt structure changes, update validation and the KB project pages.
- Prefer restrained visual details, crisp spacing, and readable contrast over heavy decoration.
- Avoid external images, CDN scripts, analytics, or third-party embeds in the first phase.

## Verification

Run these after code changes:

```bash
npm run lint
npm run build
```

For UI changes, also perform a manual smoke check:

- Run `npm run dev`.
- Confirm the canvas background renders.
- Confirm all four template cards are visible.
- Confirm all four detail pages open.
- Confirm modern theme switching, cyber node/range controls, and trend visual-cycle controls work.
- Confirm portfolio showreel toggle, case filtering, modal, and contact form work.
- Confirm portfolio opening animation, scroll-triggered English display titles, staggered cards, reveal images, and light parallax work without jank.
- Confirm prompt copy buttons show success feedback.
- Check mobile-width layout for overflow or clipped text.

## Knowledge Write-Back

Write updates back to Echo Link KB:

- Requirements or template scope changes: `wiki/projects/ui-template/需求说明.md` and `wiki/projects/ui-template/任务拆解.md`
- Architecture or visual-system decisions: `wiki/projects/ui-template/技术方案.md` and `wiki/projects/ui-template/决策记录.md`
- Validation results, failures, and unverified items: `wiki/projects/ui-template/测试与验收.md`
- Lessons learned and reusable failure patterns: `wiki/projects/ui-template/复盘.md`
- Command, path, or safety-boundary changes: `sources/code/codebase-index.md` and this `AGENTS.md`

## Do Not

- Do not read, create, copy, or store real secrets.
- Do not add external scripts, CDNs, additional npm dependencies beyond the approved local GSAP package, a backend, storage, or deployment config without explicit approval.
- Do not treat `npm run build` as a visual smoke test; it validates structure/types and produces static output, but still needs browser smoke checks for UI changes.
- Do not hide the template previews behind a landing page or secondary route.
- Do not make production deployments unless the user explicitly requests release work.
