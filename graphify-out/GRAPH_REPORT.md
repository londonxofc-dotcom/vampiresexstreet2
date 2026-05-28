# Graph Report - vampire-sex-street-main  (2026-05-28)

## Corpus Check
- 40 files · ~803,611 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 131 nodes · 134 edges · 6 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]

## God Nodes (most connected - your core abstractions)
1. `initScrollAnimations()` - 14 edges
2. `POST()` - 8 edges
3. `tick()` - 6 edges
4. `isHeroActive()` - 4 edges
5. `drawLattice()` - 4 edges
6. `scheduleIdleReveal()` - 4 edges
7. `getResend()` - 3 edges
8. `escapeHtml()` - 3 edges
9. `getClientKey()` - 3 edges
10. `isRateLimited()` - 3 edges

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

### Community 3 - "Community 3"
Cohesion: 0.5
Nodes (7): escapeHtml(), getBoundedText(), getClientKey(), getResend(), isRateLimited(), parseOfferAmount(), POST()

### Community 4 - "Community 4"
Cohesion: 0.43
Nodes (4): hideOnForwardScroll(), hideOnTouchScroll(), isHeroActive(), updateContactVisibility()

### Community 5 - "Community 5"
Cohesion: 0.38
Nodes (3): buildTexture(), createNormalizeTexture(), drawTrackedText()

### Community 6 - "Community 6"
Cohesion: 0.43
Nodes (4): clearIdleReveal(), handleScroll(), registerActivity(), scheduleIdleReveal()

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._