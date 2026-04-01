export const RACES = [
  "Dragonborn","Dwarf","Elf","Gnome",
  "Half-Elf","Half-Orc","Halfling","Human","Tiefling",
] as const;
export type Race = typeof RACES[number];

export const SCHOOLS = [
  "Abjuration","Conjuration","Divination","Enchantment",
  "Evocation","Illusion","Necromancy","Transmutation",
] as const;
export type School = typeof SCHOOLS[number];

export const ALL_LEVELS = ["Cantrip",1,2,3,4,5,6,7,8,9] as const;
export type SpellLevel = typeof ALL_LEVELS[number];

export const MAGIC_POTENTIAL: Record<Race, number> = {
  Dragonborn: 0.20,
  Dwarf:      0.20,
  Elf:        0.22,
  Gnome:      0.22,
  "Half-Elf": 0.20,
  "Half-Orc": 0.15,
  Halfling:   0.12,
  Human:      0.18,
  Tiefling:   0.22,
};

export const RACE_POPULATION: Record<Race, number> = {
  Human:      0.40,
  Dwarf:      0.10,
  Halfling:   0.10,
  "Half-Elf": 0.08,
  Elf:        0.07,
  Gnome:      0.05,
  Dragonborn: 0.05,
  "Half-Orc": 0.03,
  Tiefling:   0.02,
};

export const SCHOOL_INTENSITY: Record<School, number> = {
  Abjuration:    4,
  Conjuration:   7,
  Divination:    8,
  Enchantment:   6,
  Evocation:     10,
  Illusion:      10,
  Necromancy:    9,
  Transmutation: 5,
};

export const RACE_LORE: Partial<Record<Race, Partial<Record<School, number>>>> = {
  Dragonborn: {
    Evocation:    2.5,
    Transmutation:1.8,
    Abjuration:   1.4,
    Necromancy:   0.4,
  },
  Dwarf: {
    Abjuration:   2.8,
    Transmutation:2.0,
    Divination:   0.5,
    Illusion:     0.3,
    Necromancy:   0.3,
  },
  Elf: {
    Divination:   2.5,
    Illusion:     2.2,
    Enchantment:  1.8,
    Abjuration:   1.5,
    Necromancy:   0.6,
  },
  Gnome: {
    Illusion:     3.0,
    Transmutation:2.2,
    Conjuration:  1.6,
    Divination:   1.4,
    Necromancy:   0.4,
  },
  "Half-Elf": {
    Enchantment:  2.0,
    Divination:   1.6,
    Illusion:     1.4,
    Abjuration:   1.2,
  },
  "Half-Orc": {
    Evocation:    2.2,
    Necromancy:   1.8,
    Transmutation:1.5,
    Conjuration:  1.3,
    Divination:   0.5,
    Enchantment:  0.6,
  },
  Halfling: {
    Abjuration:   2.0,
    Enchantment:  1.8,
    Illusion:     1.5,
    Divination:   1.3,
    Evocation:    0.4,
    Necromancy:   0.3,
  },
  Human: {
    Evocation:    1.4,
    Conjuration:  1.3,
    Transmutation:1.3,
    Enchantment:  1.2,
    Abjuration:   1.2,
    Divination:   1.1,
    Illusion:     1.0,
    Necromancy:   0.9,
  },
  Tiefling: {
    Necromancy:   2.8,
    Enchantment:  2.2,
    Illusion:     1.8,
    Evocation:    1.6,
    Abjuration:   0.6,
    Divination:   0.8,
  },
};

export const LEVEL_FRACTION: Record<SpellLevel, number> = {
  Cantrip: 1.00,
  1:       0.60,
  2:       0.45,
  3:       0.33,
  4:       0.24,
  5:       0.17,
  6:       0.11,
  7:       0.07,
  8:       0.04,
  9:       0.02,
};

// ── School weights per race ────────────────────────────────────────────────

export function schoolWeights(race: Race): Record<School, number> {
  const lore = RACE_LORE[race] ?? {};
  const mp = MAGIC_POTENTIAL[race];
  const raw: Partial<Record<School, number>> = {};
  for (const school of SCHOOLS) {
    const intensityW = Math.pow(1 / SCHOOL_INTENSITY[school], 1 + mp * 1.5);
    const loreM = lore[school] ?? 1.0;
    raw[school] = intensityW * loreM;
  }
  const total = Object.values(raw).reduce((a, b) => a + b!, 0);
  const result = {} as Record<School, number>;
  for (const school of SCHOOLS) result[school] = raw[school]! / total;
  return result;
}

// ── Single school probability ──────────────────────────────────────────────

export interface CellData {
  level: SpellLevel;
  school: School;
  probability: number; // % of world pop
}

export function computeWorldTable(): CellData[] {
  const rows: CellData[] = [];
  for (const level of ALL_LEVELS) {
    for (const school of SCHOOLS) {
      let prob = 0;
      for (const race of RACES) {
        const w = schoolWeights(race);
        prob += RACE_POPULATION[race] * MAGIC_POTENTIAL[race] * LEVEL_FRACTION[level] * w[school];
      }
      rows.push({ level, school, probability: prob * 100 });
    }
  }
  return rows;
}

export function computeRaceTable(race: Race): CellData[] {
  const w = schoolWeights(race);
  const rows: CellData[] = [];
  for (const level of ALL_LEVELS) {
    for (const school of SCHOOLS) {
      const prob = RACE_POPULATION[race] * MAGIC_POTENTIAL[race] * LEVEL_FRACTION[level] * w[school];
      rows.push({ level, school, probability: prob * 100 });
    }
  }
  return rows;
}

// ── Combo probabilities ────────────────────────────────────────────────────

export interface ComboRow {
  schools: School[];
  level: SpellLevel;
  probability: number;
  label: string;
}

function loreSimilarity(race: Race, a: School, b: School): number {
  const lore = RACE_LORE[race] ?? {};
  const wa = lore[a] ?? 1.0;
  const wb = lore[b] ?? 1.0;
  const avg = Object.values({ ...Object.fromEntries(SCHOOLS.map(s => [s, 1.0])), ...lore })
    .reduce((x, y) => x + y, 0) / SCHOOLS.length;
  // Both above average → correlated, diverging → anti-correlated
  const corr = ((wa - avg) * (wb - avg)) / (avg * avg);
  return Math.max(0.5, Math.min(2.0, 1 + corr * 0.4));
}

export function computeCombos(size: 2 | 3): ComboRow[] {
  const schoolList = [...SCHOOLS];
  const combos: School[][] = [];

  if (size === 2) {
    for (let i = 0; i < schoolList.length; i++)
      for (let j = i + 1; j < schoolList.length; j++)
        combos.push([schoolList[i], schoolList[j]]);
  } else {
    for (let i = 0; i < schoolList.length; i++)
      for (let j = i + 1; j < schoolList.length; j++)
        for (let k = j + 1; k < schoolList.length; k++)
          combos.push([schoolList[i], schoolList[j], schoolList[k]]);
  }

  const rows: ComboRow[] = [];

  for (const level of ALL_LEVELS) {
    for (const combo of combos) {
      let worldProb = 0;

      for (const race of RACES) {
        const w = schoolWeights(race);
        const pop = RACE_POPULATION[race];
        const mp = MAGIC_POTENTIAL[race];
        const lf = LEVEL_FRACTION[level];

        // Base: geometric mean of individual school probs in this race
        const individualProbs = combo.map(s => w[s]);
        const geoMean = Math.pow(individualProbs.reduce((a, b) => a * b, 1), 1 / combo.length);

        // Lore correlation bonus/penalty for all pairs in combo
        let corrFactor = 1;
        for (let i = 0; i < combo.length; i++)
          for (let j = i + 1; j < combo.length; j++)
            corrFactor *= loreSimilarity(race, combo[i], combo[j]);
        corrFactor = Math.pow(corrFactor, 1 / (combo.length - 1));

        worldProb += pop * mp * lf * geoMean * corrFactor;
      }

      rows.push({
        schools: combo,
        level,
        probability: worldProb * 100,
        label: combo.join(" + "),
      });
    }
  }

  return rows.sort((a, b) => {
    const la = ALL_LEVELS.indexOf(a.level);
    const lb = ALL_LEVELS.indexOf(b.level);
    if (la !== lb) return la - lb;
    return b.probability - a.probability;
  });
}

// ── Summary stats ──────────────────────────────────────────────────────────

export function totalMagicUsers(): number {
  return RACES.reduce((sum, race) =>
    sum + RACE_POPULATION[race] * MAGIC_POTENTIAL[race], 0) * 100;
}
