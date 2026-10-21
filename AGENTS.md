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
- Public directory cards use CardReveal and CardImage in the shared motion module with strictly separate viewport entrance and image-preload observers; primeraFila uses the measured hero text transition end and rechecks layout, so late data cannot strand hidden content and card tuning cannot change hero or other reveals.
- Keep background viewport coverage and image-readiness shading in shared CSS; this prevents Safari toolbar resizing and unloaded images exposing solid strips without animating progressive-blur layer opacity.
- Public safe-area spacing uses shared CSS inset tokens and additive layout classes with viewport-fit=cover; keep the fixed background inset-based without explicit viewport-unit dimensions so embedded iPhone browsers cover the bottom edge without changing zero-inset spacing.
- Reuse Secuencia sequenceId and collection after props for page-title choreography; the shared measured-end scheduler preserves Home behavior and filter updates switch new cards to normal entrance without replaying page titles.
