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
- Public directory cards use CardReveal and CardImage with separate entrance and image-preload observers; recover missed entrances through one frame-batched global scroll listener for pending cards to avoid per-card scroll work.
- Keep background viewport coverage and image-readiness shading in shared CSS; this prevents Safari toolbar resizing and unloaded images exposing solid strips without animating progressive-blur layer opacity.
- Public safe-area spacing uses shared CSS inset tokens and additive layout classes with viewport-fit=cover; use a large-viewport-sized fixed background with lower safety coverage so browser toolbar changes cannot resize its painted layers.
- Use observeStableResize for public motion/carousel resize work: ignore small height-only toolbar changes and batch meaningful updates in a frame to avoid first-scroll layout churn.
- Top Slider masks and blurred copies stay outside image transforms; animate only the sharp internal image and release its compositing hint when the transition ends to avoid repainting static effects.
- Shared motion blocks enter independently through their own observers; Secuencia starts two frames after mounting, with optional pagina styling and no cross-block scheduling, so late data and filters cannot wait for another block.
