import { type Component, createMemo } from "solid-js";
import { type CellData, SCHOOLS, ALL_LEVELS } from "./simulation";

interface Props {
  data: CellData[];
  title: string;
}

const SCHOOL_COLORS: Record<string, string> = {
  Abjuration:    "#4f9cf9",
  Conjuration:   "#a78bfa",
  Divination:    "#34d399",
  Enchantment:   "#f472b6",
  Evocation:     "#fb923c",
  Illusion:      "#e879f9",
  Necromancy:    "#94a3b8",
  Transmutation: "#fbbf24",
};

const Heatmap: Component<Props> = (props) => {
  const max = createMemo(() =>
    Math.max(...props.data.map(d => d.probability))
  );

  const cellMap = createMemo(() => {
    const m = new Map<string, number>();
    for (const d of props.data) m.set(`${d.level}-${d.school}`, d.probability);
    return m;
  });

  function getColor(prob: number): string {
    const t = prob / max();
    // deep navy → amber → crimson
    if (t < 0.33) {
      const r = Math.round(10 + t * 3 * 120);
      const g = Math.round(15 + t * 3 * 80);
      const b = Math.round(40 + t * 3 * 100);
      return `rgb(${r},${g},${b})`;
    } else if (t < 0.66) {
      const s = (t - 0.33) * 3;
      const r = Math.round(130 + s * 125);
      const g = Math.round(95 + s * 60);
      const b = Math.round(140 - s * 100);
      return `rgb(${r},${g},${b})`;
    } else {
      const s = (t - 0.66) * 3;
      const r = Math.round(255);
      const g = Math.round(155 - s * 130);
      const b = Math.round(40 - s * 35);
      return `rgb(${r},${g},${b})`;
    }
  }

  function textColor(prob: number): string {
    return prob / max() > 0.45 ? "rgba(255,255,255,0.95)" : "rgba(180,190,210,0.85)";
  }

  return (
    <div class="heatmap-wrap">
      <div class="heatmap-title">{props.title}</div>
      <div class="heatmap-scroll">
        <table class="heatmap-table">
          <thead>
            <tr>
              <th class="level-header">Level</th>
              {SCHOOLS.map(s => (
                <th class="school-header">
                  <span class="school-dot" style={{ background: SCHOOL_COLORS[s] }} />
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_LEVELS.map(level => (
              <tr>
                <td class="level-label">{level}</td>
                {SCHOOLS.map(school => {
                  const prob = cellMap().get(`${level}-${school}`) ?? 0;
                  return (
                    <td
                      class="heat-cell"
                      style={{
                        background: getColor(prob),
                        color: textColor(prob),
                      }}
                      title={`${level} ${school}: ${prob.toFixed(3)}%`}
                    >
                      {prob.toFixed(3)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Heatmap;
