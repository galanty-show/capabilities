// Galanty mark: three caption bars (文) and a play key closing the last line (影).
// Geometry lives on a 100-unit grid and is shared by the outro, the watermark and
// the app-icon generator (scripts/brand-icons.mjs), so every surface draws the same mark.

export const BRAND_ACCENT = '#C9F65A';
export const BRAND_PAPER = '#F2F3EF';
export const MARK_STROKE = 13;
/** [x, y, width] of each bar; the third bar stops short so the play key sits flush right. */
export const MARK_BARS = [[16, 20, 68], [16, 43.5, 68], [16, 67, 41.4]] as const;
/** Play key: left edge, vertical centre and height; its tip overshoots the bars by one unit. */
export const MARK_PLAY = {x: 64.5, cy: 73.5, h: 22.75} as const;
/** Visible bounds of the mark inside the grid (used to lay it out tightly beside text). */
export const MARK_BOUNDS = {x: 16, y: 20, width: 69, height: 66} as const;
/** Scale origin of the play key (its optical centre), for pop-in animations. */
export const MARK_PLAY_ORIGIN = {x: MARK_PLAY.x + MARK_PLAY.h * .9 * .35, y: MARK_PLAY.cy} as const;

const n = (v: number) => Number(v.toFixed(2));
export const roundedRect = (x: number, y: number, w: number, h: number, r: number) => {
  r = Math.min(r, w / 2, h / 2);
  return `M${n(x + r)} ${n(y)}H${n(x + w - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}V${n(y + h - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h)}H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + h - r)}V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`;
};
export const playPath = () => {
  const {x, cy, h} = MARK_PLAY;
  return `M${n(x)} ${n(cy - h / 2)}L${n(x + h * .9)} ${n(cy)}L${n(x)} ${n(cy + h / 2)}Z`;
};
/** Stroke that rounds the play key's corners to match the bars' round caps. */
export const PLAY_ROUNDING = n(MARK_PLAY.h * .12);

export type AppIconOptions = {platform: 'mac' | 'win'; flat?: boolean};

/**
 * Glass app icon on a 1024 canvas. macOS follows Apple's template (824 body, 100
 * transparent margin, baked shadow); Windows fills the canvas. `flat` drops the
 * gradients, highlights and glow, which smear at 32 px and below.
 */
export function appIconSVG({platform, flat = false}: AppIconOptions): string {
  const mac = platform === 'mac';
  const x = mac ? 100 : 16, s = mac ? 824 : 992, r = s * .225, u = s / 100;
  const body = roundedRect(x, x, s, s, r);
  const bars = MARK_BARS.map(([bx, by, bw]) => roundedRect(bx, by, bw, MARK_STROKE, MARK_STROKE / 2));
  const play = `<path d="${playPath()}" fill="${BRAND_ACCENT}" stroke="${BRAND_ACCENT}" stroke-width="${PLAY_ROUNDING}" stroke-linejoin="round"/>`;
  const shadow = mac && !flat ? '<filter id="sh" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity=".32"/></filter>' : '';
  if (flat) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path d="${body}" fill="#1C3134"/>
<g transform="translate(${n(x + 10.5 * u)} ${n(x + 8.2 * u)}) scale(${n(.78 * u)})">${bars.map(d => `<path d="${d}" fill="${BRAND_PAPER}"/>`).join('')}${play}</g></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><defs>${shadow}
<radialGradient id="bg" cx=".3" cy=".18" r="1.05"><stop offset="0" stop-color="#2C4841"/><stop offset=".5" stop-color="#142523"/><stop offset="1" stop-color="#090F0E"/></radialGradient>
<radialGradient id="gl" cx=".72" cy=".7" r=".38"><stop offset="0" stop-color="${BRAND_ACCENT}" stop-opacity=".16"/><stop offset="1" stop-color="${BRAND_ACCENT}" stop-opacity="0"/></radialGradient>
<linearGradient id="bar" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".96"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".62"/></linearGradient>
<linearGradient id="sheen" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".16"/><stop offset=".5" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter></defs>
<g${shadow ? ' filter="url(#sh)"' : ''}><path d="${body}" fill="url(#bg)"/></g><path d="${body}" fill="url(#gl)"/>
<g transform="translate(${n(x + 13.6 * u)} ${n(x + 10.8 * u)}) scale(${n(.72 * u)})">
<path d="${playPath()}" fill="${BRAND_ACCENT}" filter="url(#glow)" opacity=".95"/>
${MARK_BARS.map(([bx, by, bw], i) => `<path d="${bars[i]}" fill="url(#bar)"/><path d="${roundedRect(bx + 3, by + 1.6, bw - 6, 2.6, 1.3)}" fill="#FFFFFF" opacity=".55"/>`).join('')}
${play}</g>
<path d="${body}" fill="url(#sheen)"/><path d="${roundedRect(x + u * .5, x + u * .5, s - u, s - u, r - u * .5)}" fill="none" stroke="#FFFFFF" stroke-opacity=".12" stroke-width="${n(u * .8)}"/></svg>`;
}
