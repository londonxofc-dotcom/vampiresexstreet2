# Graph Report - vampire-sex-street-main  (2026-05-12)

## Corpus Check
- 39 files · ~768,327 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 128 nodes · 135 edges · 5 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `initScrollAnimations()` - 14 edges
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
- `POST()` --calls--> `getBoundedText()`  [EXTRACTED]
  app/api/registry/route.ts → app/api/offer/route.ts
- `POST()` --calls--> `parseOfferAmount()`  [EXTRACTED]
  app/api/registry/route.ts → app/api/offer/route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.2
Nodes (11): drawLattice(), go(), hueAt(), onKey(), playKeyboardStroke(), primeAudioContext(), pushBoot(), pushStat() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.23
Nodes (14): initAboutSection(), initBlobScroll(), initEditorialFlipOut(), initHeroFade(), initHorizontalParallax(), initProductCards(), initResizeHandler(), initScrollAnimations() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.27
Nodes (9): hideOnForwardScroll(), hideOnTouchScroll(), isHeroActive(), onPointerLeave(), onPointerMove(), onScroll(), requestRender(), updateContactVisibility() (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.5
Nodes (7): escapeHtml(), getBoundedText(), getClientKey(), getResend(), isRateLimited(), parseOfferAmount(), POST()

### Community 5 - "Community 5"
Cohesion: 0.38
Nodes (3): buildTexture(), createNormalizeTexture(), drawTrackedText()

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._