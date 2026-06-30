# ui-template Agent Notes

## Project Snapshot

ui-template is a static frontend UI prompt gallery at `/Users/echo/Documents/work_develop/ui-template`.

The current version shows three different UI styles on the homepage and opens each style in a dedicated interactive detail page. Each template includes a visual demo, interaction logic, canvas scene, and reusable prompt. The site uses HTML, CSS, vanilla JavaScript, and Canvas. It has no backend, database, external scripts, or runtime dependencies.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Serve the static site with `python3 -m http.server 4173` |
| `npm run lint` | Run the static structure validator |
| `npm run build` | Run the same validator as the static build gate |

The site can also be opened directly from `index.html`.

## Environment Variables

No environment variables are required in the first phase.

Do not create `.env`, `.env.local`, tokens, cookies, or secret-bearing files unless a future task explicitly introduces a backend or deployment workflow.

## Important Implementation Details

- `index.html` owns the current template content and prompt text.
- `templates/modern-minimal.html`, `templates/cyber-future.html`, and `templates/trend-culture.html` own the interactive detail pages.
- `styles.css` owns the visual system, preview compositions, and responsive behavior.
- `main.js` owns the canvas scene registry, page transitions, theme switching, copy behavior, and detail interactions.
- `scripts/validate-site.mjs` is the local Sensor for required multi-page static structure.
- Canvas effects must remain decorative and must not reduce text readability.
- Template cards should remain visible on the homepage without requiring navigation to another route.

## Editing Guidelines

- Keep the site dependency-free unless the user explicitly asks for framework migration or richer app behavior.
- Keep cards at 8px radius or less.
- Preserve three clearly distinct styles unless the task is specifically about replacing or expanding them: modern website, cyber future, and trend culture.
- Keep dedicated detail pages linked from the homepage with `data-template-link`.
- Keep `body[data-page]` and `body[data-scene]` markers aligned with the scene registry in `main.js`.
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

- Open `index.html` or run `npm run dev`.
- Confirm the canvas background renders.
- Confirm all three template cards are visible.
- Confirm all three detail pages open.
- Confirm modern theme switching, cyber node/range controls, and trend visual-cycle controls work.
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
- Do not add external scripts, CDNs, npm dependencies, a backend, storage, or deployment config without explicit approval.
- Do not treat `npm run build` as a visual smoke test; it only validates static structure.
- Do not hide the template previews behind a landing page or secondary route.
- Do not make production deployments unless the user explicitly requests release work.
