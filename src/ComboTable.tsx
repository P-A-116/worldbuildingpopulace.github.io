import { type Component, createMemo, createSignal, For } from "solid-js";
import { type ComboRow, ALL_LEVELS, type SpellLevel } from "./simulation";

interface Props {
  data: ComboRow[];
  size: 2 | 3;
}

const SCHOOL_PILL: Record<string, string> = {
  Abjuration:    "#1e3a5f",
  Conjuration:   "#2e1f5e",
  Divination:    "#0f3d2e",
  Enchantment:   "#4a1040",
  Evocation:     "#4a1f06",
  Illusion:      "#3b0d5e",
  Necromancy:    "#1e2535",
  Transmutation: "#3d2a00",
};
const SCHOOL_TEXT: Record<string, string> = {
  Abjuration:    "#4f9cf9",
  Conjuration:   "#a78bfa",
  Divination:    "#34d399",
  Enchantment:   "#f472b6",
  Evocation:     "#fb923c",
  Illusion:      "#e879f9",
  Necromancy:    "#94a3b8",
  Transmutation: "#fbbf24",
};

function downloadCSV(data: ComboRow[], size: 2 | 3) {
  const header = `Schools,Level,Probability (%)\n`;
  const rows = data.map(r => `"${r.label}",${r.level},${r.probability.toFixed(4)}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `combos_${size === 2 ? "pairs" : "triples"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ComboTable: Component<Props> = (props) => {
  const [level, setLevel] = createSignal<SpellLevel>("Cantrip");
  const [search, setSearch] = createSignal("");
  const [page, setPage] = createSignal(0);
  const PAGE_SIZE = 20;

  const filtered = createMemo(() => {
    const s = search().toLowerCase();
    return props.data.filter(r =>
      r.level === level() &&
      (s === "" || r.label.toLowerCase().includes(s))
    );
  });

  const paged = createMemo(() => {
    const start = page() * PAGE_SIZE;
    return filtered().slice(start, start + PAGE_SIZE);
  });

  const pageCount = createMemo(() => Math.ceil(filtered().length / PAGE_SIZE));

  return (
    <div class="combo-wrap">
      <div class="combo-controls">
        <div class="level-tabs">
          <For each={[...ALL_LEVELS]}>
            {(l) => (
              <button
                class={`level-tab ${level() === l ? "active" : ""}`}
                onClick={() => { setLevel(l as SpellLevel); setPage(0); }}
              >
                {l}
              </button>
            )}
          </For>
        </div>
        <div class="combo-actions">
          <input
            class="search-input"
            placeholder="Filter schools…"
            value={search()}
            onInput={e => { setSearch(e.currentTarget.value); setPage(0); }}
          />
          <button class="dl-btn" onClick={() => downloadCSV(props.data, props.size)}>
            ↓ CSV
          </button>
        </div>
      </div>

      <div class="combo-table-wrap">
        <table class="combo-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Schools</th>
              <th>Probability</th>
              <th>Bar</th>
            </tr>
          </thead>
          <tbody>
            <For each={paged()}>
              {(row, i) => {
                const rank = page() * PAGE_SIZE + i() + 1;
                const maxP = filtered()[0]?.probability ?? 1;
                return (
                  <tr class="combo-row">
                    <td class="rank-cell">{rank}</td>
                    <td class="schools-cell">
                      <For each={row.schools}>
                        {s => (
                          <span
                            class="school-pill"
                            style={{
                              background: SCHOOL_PILL[s],
                              color: SCHOOL_TEXT[s],
                            }}
                          >
                            {s}
                          </span>
                        )}
                      </For>
                    </td>
                    <td class="prob-cell">{row.probability.toFixed(4)}%</td>
                    <td class="bar-cell">
                      <div class="bar-track">
                        <div
                          class="bar-fill"
                          style={{ width: `${(row.probability / maxP) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>

      {pageCount() > 1 && (
        <div class="pagination">
          <button disabled={page() === 0} onClick={() => setPage(p => p - 1)}>←</button>
          <span>{page() + 1} / {pageCount()}</span>
          <button disabled={page() === pageCount() - 1} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}
    </div>
  );
};

export default ComboTable;
