/**
 * The Đông Sơn star, as geometry.
 *
 * Eight points, concave sides, the same shape as `src-tauri/app-icon.svg`. Eight rather
 * than the drum's fourteen so it still reads at 16 px in the tray; the numbers live here
 * so the icon, the rail mark and the countdown ring are one shape and not three drawings.
 */
const POINTS = 8;
/** How deep the valleys cut in, as a fraction of the outer radius. */
const INNER_RATIO = 0.42;

/** An SVG path for a star of radius `r` centred on (0, 0), meant to be transformed. */
export function starPath(r: number): string {
  const step = (Math.PI * 2) / POINTS;
  const start = -Math.PI / 2;
  const parts: string[] = [];
  for (let i = 0; i < POINTS; i += 1) {
    const outer = start + i * step;
    const inner = outer + step / 2;
    parts.push(
      `${i === 0 ? "M" : "L"}${(Math.cos(outer) * r).toFixed(2)} ${(Math.sin(outer) * r).toFixed(2)}`
    );
    parts.push(
      `L${(Math.cos(inner) * r * INNER_RATIO).toFixed(2)} ${(Math.sin(inner) * r * INNER_RATIO).toFixed(2)}`
    );
  }
  return `${parts.join(" ")} Z`;
}
