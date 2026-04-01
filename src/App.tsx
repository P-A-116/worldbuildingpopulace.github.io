import { type Component, createMemo, createSignal, For, Show } from "solid-js";
import Heatmap from "./Heatmap";
import ComboTable from "./ComboTable";
import {
  RACES, type Race,
  computeWorldTable,
  computeRaceTable,
  computeCombos,
  totalMagicUsers,
  MAGIC_POTENTIAL,
  RACE_POPULATION,
} from "./simulation";

type Tab = "world" | "race" | "pairs" | "triples";

const App: Component = () => {
  const [tab, setTab] = createSignal<Tab>("world");
  const [race, setRace] = createSignal<Race>("Human");

  const worldData   = createMemo(() => computeWorldTable());
  const raceData    = createMemo(() => computeRaceTable(race()));
  const pairsData   = createMemo(() => computeCombos(2));
  const triplesData = createMemo(() => computeCombos(3));
  const magicPct    = totalMagicUsers();

  const raceStats = createMemo(() =>
    [...RACES]
      .map(r => ({
        race: r,
        pop: RACE_POPULATION[r] * 100,
        potential: MAGIC_POTENTIAL[r] * 100,
        mages: RACE_POPULATION[r] * MAGIC_POTENTIAL[r] * 100,
      }))
      .sort((a, b) => b.mages - a.mages)
  );

  return (
    <div class="app">
      <header class="site-header">
        <div class="header-inner">
          <div class="logo">
            <span class="logo-rune">⬡</span>
            <div>
              <div class="logo-title">Arcane Census</div>
              <div class="logo-sub">Spellcasting Prevalence Simulator</div>
            </div>
          </div>
          <div class="header-stats">
            <div class="stat-chip">
              <span class="stat-value">{magicPct.toFixed(2)}%</span>
              <span class="stat-label">magic users</span>
            </div>
            <div class="stat-chip">
              <span class="stat-value">{(100 - magicPct).toFixed(2)}%</span>
              <span class="stat-label">nulls</span>
            </div>
            <div class="stat-chip">
              <span class="stat-value">9</span>
              <span class="stat-label">races</span>
            </div>
            <div class="stat-chip">
              <span class="stat-value">8</span>
              <span class="stat-label">schools</span>
            </div>
          </div>
        </div>
      </header>

      <nav class="main-nav">
        <For each={[
          { id: "world",   label: "World Heatmap" },
          { id: "race",    label: "By Race" },
          { id: "pairs",   label: "Dual-School" },
          { id: "triples", label: "Triple-School" },
        ] as { id: Tab; label: string }[]}>
          {(t) => (
            <button
              class={`nav-tab ${tab() === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          )}
        </For>
      </nav>

      <main class="main-content">
        <Show when={tab() === "world"}>
          <section class="section">
            <div class="section-header">
              <h2>World Population</h2>
              <p class="section-desc">
                Probability that a random person belongs to each school/level combination,
                weighted by race population and magical potential.
              </p>
            </div>
            <Heatmap data={worldData()} title="World — Spellcasting Prevalence (% of total population)" />
            <div class="race-grid">
              <For each={raceStats()}>
                {(r) => (
                  <div class="race-card">
                    <div class="race-name">{r.race}</div>
                    <div class="race-row">
                      <span class="rc-label">Population</span>
                      <span class="rc-val">{r.pop.toFixed(0)}%</span>
                    </div>
                    <div class="race-row">
                      <span class="rc-label">Magic potential</span>
                      <span class="rc-val">{r.potential.toFixed(0)}%</span>
                    </div>
                    <div class="race-row">
                      <span class="rc-label">World mages</span>
                      <span class="rc-val highlight">{r.mages.toFixed(2)}%</span>
                    </div>
                    <div class="race-bar-track">
                      <div class="race-bar-fill" style={{ width: `${(r.mages / magicPct) * 100}%` }} />
                    </div>
                  </div>
                )}
              </For>
            </div>
          </section>
        </Show>

        <Show when={tab() === "race"}>
          <section class="section">
            <div class="section-header">
              <h2>Race Breakdown</h2>
              <div class="race-picker">
                <For each={[...RACES]}>
                  {(r) => (
                    <button
                      class={`race-btn ${race() === r ? "active" : ""}`}
                      onClick={() => setRace(r)}
                    >
                      {r}
                    </button>
                  )}
                </For>
              </div>
            </div>
            <Heatmap
              data={raceData()}
              title={`${race()} — Spellcasting Prevalence (% of total population)`}
            />
          </section>
        </Show>

        <Show when={tab() === "pairs"}>
          <section class="section">
            <div class="section-header">
              <h2>Dual-School Combinations</h2>
              <p class="section-desc">
                All 28 school pairs ranked by co-occurrence probability per spell level.
                Weighted by race lore affinity.
              </p>
            </div>
            <ComboTable data={pairsData()} size={2} />
          </section>
        </Show>

        <Show when={tab() === "triples"}>
          <section class="section">
            <div class="section-header">
              <h2>Triple-School Combinations</h2>
              <p class="section-desc">
                All 56 school triples ranked by co-occurrence probability per spell level.
              </p>
            </div>
            <ComboTable data={triplesData()} size={3} />
          </section>
        </Show>
      </main>

      <footer class="site-footer">
        Arcane Census · Spellcasting prevalence simulation · D&amp;D 5e
      </footer>
    </div>
  );
};

export default App;
