# Arcane Census

A spellcasting prevalence simulator for D&D 5e worldbuilding.

## Features

- **World heatmap** — school × level prevalence across the entire population
- **Per-race heatmaps** — breakdown for each of the 9 races
- **Dual-school combos** — all 28 pairs ranked by co-occurrence probability
- **Triple-school combos** — all 56 triples ranked by co-occurrence probability
- CSV export for all combo tables

## Stack

- [SolidJS](https://solidjs.com) + TypeScript
- [Vite](https://vitejs.dev)

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
# output in dist/
```

## Deploy to GitHub Pages

1. Push to GitHub
2. Add to `vite.config.ts`: `base: '/<repo-name>/'`
3. Run `npm run build` and push `dist/` to `gh-pages` branch,  
   or use the [vite-plugin-gh-pages](https://github.com/craftzdog/vite-plugin-gh-pages) package.

## Tuning the simulation

All parameters live in `src/simulation.ts`:

- `MAGIC_POTENTIAL` — fraction of each race with any magical ability
- `RACE_POPULATION` — world population share per race
- `SCHOOL_INTENSITY` — how powerful/rare each school is (higher = rarer)
- `RACE_LORE` — per-race cultural/biological affinity multipliers per school
- `LEVEL_FRACTION` — attrition curve from cantrip down to level 9
