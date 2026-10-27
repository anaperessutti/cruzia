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

- Keep flexible search normalization, stemming and editable synonyms in the pure browser-safe `src/lib/busqueda.ts`; build commerce search fields from the existing public directory only to avoid additional requests.

- Keep Top Slider eyebrow typography and the recommended plan glow in dedicated semantic utilities/tokens, so targeted visual adjustments do not alter global text roles or other card shadows.
- Public images from the private storage bucket must go through `optimizarImagen` (src/lib/imagen.ts): the render endpoint serves compressed WebP without re-signing links.
- Motion text components combine classes with clsx, not default tailwind-merge: custom typography utilities must coexist with text color utilities without being discarded.
- Shared one-shot reveal containers must keep a stable React className across route/theme changes; apply theme-dependent spacing through ancestor selectors so React does not erase observer-added visibility classes.
- SplitWords preserves explicit editorial line breaks through its optional preservarSaltos prop while retaining one continuous word-stagger index; hero presentations reuse Secuencia rather than introducing separate motion logic.
- Public directory entries share one passive frame-batched global scroll listener for adaptive velocity and missed-card recovery; anticipate only pending Home rows and headers, never scan individual cards during fast scroll. CardImage readiness is decode-gated and never gates the neutral card entrance; preserve static progressive-blur effects.
- Section pages retain motion.tsx primitives unless explicitly requested; Home carousels use useFilaReveal and hr- CSS with separately observed header/card-strip markers, importing only shared motion timing and speed helpers, because independent visibility must not depend on another block or another card's photo readiness. Preserve the CSS-only first row and existing diagnostics.
- Carousel image requests use shared near-row and visible-row observers plus the existing horizontal handler; carousel images skip the clipped per-image observer and accept m-preload events, keeping far-row images unrequested.
- Keep background viewport coverage and image-readiness shading in shared CSS; this prevents Safari toolbar resizing and unloaded images exposing solid strips without animating progressive-blur layer opacity.
- Public safe-area spacing uses shared CSS inset tokens and additive layout classes with viewport-fit=cover; use a large-viewport-sized fixed background with lower safety coverage so browser toolbar changes cannot resize its painted layers.
- Use observeStableResize for public motion/carousel resize work: ignore small height-only toolbar changes and batch meaningful updates in a frame to avoid first-scroll layout churn.
- Top Slider masks and blurred copies stay outside image transforms; animate only the sharp internal image and release its compositing hint when the transition ends to avoid repainting static effects.
- Shared motion blocks enter independently through their own observers; Secuencia starts two frames after mounting, with optional pagina styling and no cross-block scheduling, so late data and filters cannot wait for another block.
- Use usePathnameRenderizado for shared chrome and keyed route content; resolvedLocation keeps them aligned with committed content, and only the router owns scroll restoration.
- Mount idle public-route preloading inside the public provider, not the document shell; save-data connections skip preloading and mounting does not navigate or apply route filters.
- Card progressive blur uses exactly two elements; keep neutral card backgrounds grain-free and final carousel cards on their dedicated non-backdrop-filter surface to reduce drawing cost independently of motion.
- Diagnóstico: ?x=noblur|nofx|noanim|cv|hrseguro|hrsinblur|fps.
- Fichas compactas (prop `compacta`): solo celular (<640 px) y solo en las filas de colección de Inicio posteriores a Favoritos; ancho 2.2 por pantalla, insignia a tamaño completo, textos 14/12/9 px y espacio entre filas compactas a 2/3. Foto 480×600 y sin botón, píldora de rubro ni 'Vence en'; Favoritos y los demás anchos no cambian.
- Keep compact-card presentation scoped to mobile data-compacta selectors, with data-promo controlling only the existing shade; preserve the 3/4 ratio and scroller padding for shadows. Share one mobile Home spacing token between rows, after Favoritos and before the footer; scope footer compensation through the Home content so other routes remain unchanged. Focus and short-offer fields remain admin-editable so content and presentation stay independent.
- Gift Box experience cards keep one full-card toggle as an absolutely positioned button under a pointer-events-none content layer, so the "Ver más" link can sit inside the card without nesting inside the button (invalid HTML) and without inheriting the selection click.
