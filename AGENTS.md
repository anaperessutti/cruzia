<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Top Slider eyebrow typography and the recommended plan glow in dedicated semantic utilities/tokens, so targeted visual adjustments do not alter global text roles or other card shadows.
- Public images from the private storage bucket must go through `optimizarImagen` (src/lib/imagen.ts): the render endpoint serves compressed WebP without re-signing links.
- Motion text components combine classes with clsx, not default tailwind-merge: custom typography utilities must coexist with text color utilities without being discarded.
- Shared one-shot reveal containers must keep a stable React className across route/theme changes; apply theme-dependent spacing through ancestor selectors so React does not erase observer-added visibility classes.
- SplitWords preserves explicit editorial line breaks through its optional preservarSaltos prop while retaining one continuous word-stagger index; hero presentations reuse Secuencia rather than introducing separate motion logic.
- Public directory cards use CardReveal and CardImage in the shared motion module with strictly separate viewport entrance and image-preload observers; primeraFila derives the hero end from the CSS time variables (--m-dur, --m-word-stagger and the fixed role delays 300/400/800/1100 ms in styles.css) via heroTextDuration in motion.tsx — never measure the DOM for this — so those CSS values and the function must stay in sync; layout rechecks remain so late data cannot strand hidden content.
- Keep background viewport coverage and image-readiness shading in shared CSS; this prevents Safari toolbar resizing and unloaded images exposing solid strips without animating progressive-blur layer opacity.
- Public safe-area spacing uses shared CSS inset tokens and additive layout classes with viewport-fit=cover; use a large-viewport-sized fixed background with lower safety coverage so browser toolbar changes cannot resize its painted layers.
- Use observeStableResize for public motion/carousel resize work: ignore small height-only toolbar changes and batch meaningful updates in a frame to avoid first-scroll layout churn.
- Top Slider masks and blurred copies stay outside image transforms; animate only the sharp internal image and release its compositing hint when the transition ends to avoid repainting static effects.
- Reuse Secuencia sequenceId and collection after props for page-title choreography; the shared measured-end scheduler preserves Home behavior and filter updates switch new cards to normal entrance without replaying page titles.
