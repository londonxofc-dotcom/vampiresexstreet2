# Graph Report - vampire-sex-street-main  (2026-05-05)

## Corpus Check
- 37 files · ~581,776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 118 nodes · 127 edges · 6 communities detected
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 7|Community 7]]

## God Nodes (most connected - your core abstractions)
1. `initScrollAnimations()` - 13 edges
2. `POST()` - 8 edges
3. `tick()` - 6 edges
4. `isHeroActive()` - 4 edges
5. `updateTarget()` - 4 edges
6. `requestRender()` - 4 edges
7. `drawLattice()` - 4 edges
8. `getResend()` - 3 edges
9. `escapeHtml()` - 3 edges
10. `getClientKey()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `useScrollAnimations()`  [INFERRED]
  app/page.tsx → hooks/useScrollAnimations.ts
- `POST()` --calls--> `getBoundedText()`  [EXTRACTED]
  app/api/registry/route.ts → app/api/offer/route.ts
- `POST()` --calls--> `parseOfferAmount()`  [EXTRACTED]
  app/api/registry/route.ts → app/api/offer/route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (11): drawLattice(), go(), hueAt(), onKey(), playKeyboardStroke(), primeAudioContext(), pushBoot(), pushStat() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.25
Nodes (13): initAboutSection(), initBlobScroll(), initEditorialFlipOut(), initHeroFade(), initHorizontalParallax(), initProductCards(), initResizeHandler(), initScrollAnimations() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (9): hideOnForwardScroll(), hideOnTouchScroll(), isHeroActive(), onPointerLeave(), onPointerMove(), onScroll(), requestRender(), updateContactVisibility() (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.5
Nodes (7): escapeHtml(), getBoundedText(), getClientKey(), getResend(), isRateLimited(), parseOfferAmount(), POST()

### Community 4 - "Community 4"
Cohesion: 0.38
Nodes (3): buildTexture(), createNormalizeTexture(), drawTrackedText()

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (2): Home(), useScrollAnimations()

## Knowledge Gaps
- **Thin community `Community 7`** (4 nodes): `page.tsx`, `useScrollAnimations.ts`, `Home()`, `useScrollAnimations()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._