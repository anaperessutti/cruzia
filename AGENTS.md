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
- Public directory entries share one passive frame-batched global scroll listener for adaptive velocity and missed-card recovery; anticipate only pending Home rows and headers, never scan individual cards during fast scroll. CardImage readiness is decode-gated and never gates the neutral card entrance; preserve static progressive-blur effects.
- Home row/header arrival prediction shares the existing scroll frame and signed displacement; its dedicated ahead/late states bypass adaptive m-fast only after initial load, keeping general entries and image preloading independent.
- Home carousel rows reveal as one unit through useRevealFila on the shared edge observer (threshold 0): only the first 4 cards cascade via --i, the rest and "Ver todo" stay static (data-m-static), and card wrappers use the child element's own key so GPS reordering never reuses a revealed node.
- Carousel image requests use shared near-row and visible-row observers plus the existing horizontal handler; carousel images skip the clipped per-image observer and accept m-preload events, keeping far-row images unrequested.
- Load-time delay is opt-in via the alCargar prop (Reveal, RevealGroup, CardReveal, SplitWords, useRevealCabecera, useRevealFila): it sets --m-base (450–750 ms by viewport height) only when scrollY < 40 and the element is in view, and removes it when the entrance ends; never add it to sumate-a-cruzia.tsx or page-intro.tsx, whose pacing is the untouched reference.
- Keep background viewport coverage and image-readiness shading in shared CSS; this prevents Safari toolbar resizing and unloaded images exposing solid strips without animating progressive-blur layer opacity.
- Public safe-area spacing uses shared CSS inset tokens and additive layout classes with viewport-fit=cover; use a large-viewport-sized fixed background with lower safety coverage so browser toolbar changes cannot resize its painted layers.
- Use observeStableResize for public motion/carousel resize work: ignore small height-only toolbar changes and batch meaningful updates in a frame to avoid first-scroll layout churn.
- Top Slider masks and blurred copies stay outside image transforms; animate only the sharp internal image and release its compositing hint when the transition ends to avoid repainting static effects.
- Shared motion blocks enter independently through their own observers; Secuencia starts two frames after mounting, with optional pagina styling and no cross-block scheduling, so late data and filters cannot wait for another block.
- Use usePathnameRenderizado for shared chrome and keyed route content; resolvedLocation keeps them aligned with committed content, and only the router owns scroll restoration.
- Mount idle public-route preloading inside the public provider, not the document shell; save-data connections skip preloading and mounting does not navigate or apply route filters.
