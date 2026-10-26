import React from 'react';
import type {SceneInput} from '@talkframe/scene';
import {seeded, noise3d, useCanvas} from '@talkframe/scene';

// 第 3 幕（小节 6-13，Drop A）：冲击落拍出“即时预览”→ 放大成即时播放器；按 C 每两拍整幅换一套配色（圆形擦除）；
// 拖动分段进度条，示意作品真的跳到那一幕那一刻；V 关旁白（声纹归零）、] 提速（光轨变长）。
// 内嵌的示意作品《城市之光》是一支三幕的 Canvas 片段：霓虹开场 → 点阵城市与光轨 → 数据地球，全部由 (幕内秒, 配色) 决定，可任意跳帧。
export const meta = {title: 'Drop A：即时预览', description: '冲击出大字后收进左上角；播放器里示意作品《城市之光》现场播放，按 C 逐拍整幅换配色、拖进度条跳幕、V 与 ] 切配音和节奏。', params: {
  word: {label: '大字', type: 'text', default: '即时预览'},
  sub: {label: '副句', type: 'text', default: '不渲染视频，本机逐帧现画'},
  captions: {label: '分段字幕', type: 'list', item: [{key: 'text', label: '文字'}]},
  filmTitle: {label: '示意作品标题', type: 'text', default: '城市之光'},
}};

// ---- 共用小工具（每幕自带一份：幕代码不能相对导入） ----
const BEAT = 60 / 124, BAR = BEAT * 4;
const MONO = '"SF Mono", Menlo, Monaco, Consolas, monospace';
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const outExpo = (x: number) => (x = clamp(x)) >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const inExpo = (x: number) => (x = clamp(x)) <= 0 ? 0 : Math.pow(2, 10 * x - 10);
const inOut = (x: number) => (x = clamp(x)) < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hit = (b: number, at: number, len = 1) => clamp((b - at) / len);
const HEX = /^#[0-9a-f]{6}$/i;
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(lerp(v, y[i], t)).toString(16).padStart(2, '0')).join('');
};
const alpha = (hex: string, a: number) => hex + Math.round(clamp(a) * 255).toString(16).padStart(2, '0');
function kit(props: SceneInput) {
  const th = props.theme ?? ({} as SceneInput['theme']);
  const bg = HEX.test(th.background) ? th.background : '#0A0D0E';
  const ink = HEX.test(th.text) ? th.text : '#F2F3EF';
  const mute = HEX.test(th.muted) ? th.muted : '#8A9691';
  const lime = HEX.test(th.accent) ? th.accent : '#C9F65A';
  return {bg, ink, mute, lime, panel: mix(bg, ink, .045), panel2: mix(bg, ink, .085), line: mix(bg, ink, .16)};
}
type Kit = ReturnType<typeof kit>;
const beatOf = (p: SceneInput) => ((Number(p.params.f0 ?? 0) + p.frame) / p.fps - Number(p.params.bar0 ?? 0) * BAR) / BEAT;
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function Mark({h, ink, lime}: {h: number; ink: string; lime: string}) {
  const B = [[16, 20, 68], [16, 43.5, 68], [16, 67, 41.4]];
  return <svg width={h * 69 / 66} height={h} viewBox="16 20 69 66" style={{display: 'block', overflow: 'visible'}}>
    {B.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={13} rx={6.5} fill={ink} />)}
    <path d="M64.5 62.13L84.98 73.5L64.5 84.88Z" fill={lime} stroke={lime} strokeWidth={2.73} strokeLinejoin="round" />
  </svg>;
}

function Key({k, down, C, w = 62}: {k: string; down: number; C: Kit; w?: number}) {
  return <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: w, height: 62, padding: '0 12px', boxSizing: 'border-box', borderRadius: 12,
    fontFamily: MONO, fontSize: 30, fontWeight: 700, color: down > .05 ? C.bg : C.ink, background: down > .05 ? mix(C.panel2, C.lime, down) : C.panel2,
    border: `2px solid ${down > .05 ? C.lime : C.line}`, borderBottomWidth: 5 - 3 * down, transform: `translateY(${3 * down}px)`, boxShadow: down > .05 ? `0 0 ${30 * down}px ${alpha(C.lime, .5)}` : 'none'}}>{k}</span>;
}

// ================= 示意作品《城市之光》 =================
// 即时播放的配色预设（名称与主色同 scripts/live-player.mjs 的 LIVE_PALETTES；“原配色”为示意作品自己的金色夜景）。
// 每套给整幅画面用的 7 个色：天顶、地平线天色、地平线辉光、主霓虹、副霓虹、暖光、点阵。
type FP = {name: string; chip: string; sky0: string; sky1: string; hor: string; neon: string; neon2: string; warm: string; dot: string};
const FILM_PALS: FP[] = [
  {name: '原配色', chip: '#FFD58A', sky0: '#04060C', sky1: '#121B30', hor: '#E8A85A', neon: '#FFD58A', neon2: '#7FB8FF', warm: '#FFF1D6', dot: '#E9D9B8'},
  {name: '荧光绿', chip: '#C9F65A', sky0: '#020703', sky1: '#0A2412', hor: '#8FE03A', neon: '#C9F65A', neon2: '#3FD8B0', warm: '#F2FFD6', dot: '#BCE89A'},
  {name: '深海蓝', chip: '#4FA3FF', sky0: '#01040E', sky1: '#06204A', hor: '#2C78FF', neon: '#4FA3FF', neon2: '#7CF0FF', warm: '#E0F0FF', dot: '#9CC8FF'},
  {name: '琥珀橙', chip: '#FFB547', sky0: '#0A0401', sky1: '#341505', hor: '#FF7A1F', neon: '#FFB547', neon2: '#FF4F30', warm: '#FFEBD0', dot: '#FFC98A'},
  {name: '玫瑰红', chip: '#FF6B8A', sky0: '#0B0106', sky1: '#360A22', hor: '#FF2F77', neon: '#FF6B8A', neon2: '#B07BFF', warm: '#FFE0EA', dot: '#FFA8C0'},
  {name: '星云紫', chip: '#A98BFF', sky0: '#05030E', sky1: '#1E1046', hor: '#7B4DFF', neon: '#A98BFF', neon2: '#FF7BD5', warm: '#EFE6FF', dot: '#C9B6FF'},
  {name: '青玉', chip: '#3FD8B0', sky0: '#010807', sky1: '#05302A', hor: '#1FB894', neon: '#3FD8B0', neon2: '#B8FF6A', warm: '#DDFFF4', dot: '#9DEBD5'},
];
const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgba = (h: string, a: number) => {const [r, g, b] = rgb(h); return `rgba(${r},${g},${b},${clamp(a)})`;};
const frac = (x: number) => x - Math.floor(x);
const hash = (a: number, b: number, c: number) => frac(Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453);

const VW = 1600, VH = 900;
const RNG = seeded(20261005);
const STARS = Array.from({length: 180}, () => ({x: RNG() * VW, y: RNG() * 520, r: .6 + RNG() * 1.7, ph: RNG() * 6.28}));
type Bld = {x: number; w: number; h: number; seed: number; antenna: boolean};
function layer(n: number, wMin: number, wMax: number, hMin: number, hMax: number, span: number): Bld[] {
  const out: Bld[] = [];
  let x = -200;
  while (x < span && out.length < n) {
    const w = wMin + RNG() * (wMax - wMin);
    out.push({x, w, h: hMin + Math.pow(RNG(), 1.4) * (hMax - hMin), seed: RNG() * 100, antenna: RNG() < .25});
    x += w + 4 + RNG() * 18;
  }
  return out;
}
// 三层景深：远（小点、雾）、中、近（大窗、亮）
const LAYERS = [
  {b: layer(80, 34, 80, 110, 300, 2600), cell: 10, base: 700, speed: 6, dim: .38, haze: .55},
  {b: layer(50, 60, 120, 200, 430, 2600), cell: 15, base: 740, speed: 16, dim: .7, haze: .25},
  {b: layer(26, 120, 210, 300, 560, 2600), cell: 22, base: 800, speed: 34, dim: 1, haze: 0},
];
const BOKEH = Array.from({length: 18}, () => ({x: RNG() * VW, y: 560 + RNG() * 340, r: 22 + RNG() * 60, ph: RNG() * 6.28, warm: RNG() < .5, a: .1 + RNG() * .16}));
const CARS = Array.from({length: 110}, (_, i) => ({lane: i % 2, ph: RNG(), sp: .07 + RNG() * .06, len: .03 + RNG() * .05}));
const N3 = noise3d(11);
const GLOBE = Array.from({length: 1700}, (_, i) => {
  const y = 1 - (i + .5) / 1700 * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
  const x = Math.cos(th) * r, z = Math.sin(th) * r;
  return {x, y, z, land: N3(x * 1.7, y * 1.7, z * 1.7) > .08};
});
const LANDS = GLOBE.map((p, i) => p.land ? i : -1).filter(i => i >= 0);
const ARCS = Array.from({length: 11}, () => [LANDS[Math.floor(RNG() * LANDS.length)], LANDS[Math.floor(RNG() * LANDS.length)], RNG()]);
const STREAMS = Array.from({length: 150}, () => ({a: RNG() * 6.28, ph: RNG(), sp: .18 + RNG() * .16, tw: (RNG() - .5) * 1.6}));
const WARP = Array.from({length: 110}, () => ({a: RNG() * 6.28, ph: RNG(), sp: .35 + RNG() * .4}));

type Ctx = CanvasRenderingContext2D;
function glowLine(ctx: Ctx, pts: Array<[number, number]>, color: string, w: number, a: number) {
  if (pts.length < 2) return;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = rgba(color, a * .18); ctx.lineWidth = w * 4; ctx.stroke();
  ctx.strokeStyle = rgba(color, a * .45); ctx.lineWidth = w * 1.8; ctx.stroke();
  ctx.strokeStyle = rgba(mix(color, '#FFFFFF', .5), a); ctx.lineWidth = w * .7; ctx.stroke();
}
function soft(ctx: Ctx, x: number, y: number, r: number, color: string, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function sky(ctx: Ctx, P: FP, horY: number) {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, P.sky0); g.addColorStop(horY / VH, P.sky1); g.addColorStop(1, P.sky0);
  ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
}

/** 第 1 幕：霓虹开场——透视网格地面、条纹日轮、向外的光速线、标题逐字点亮。 */
function sceneOpen(ctx: Ctx, P: FP, lt: number, font: string, title: string) {
  const horY = 520, cx = 800;
  sky(ctx, P, horY);
  ctx.globalCompositeOperation = 'lighter';
  soft(ctx, cx, horY, 760, P.hor, .45);
  for (const s of STARS) {ctx.fillStyle = rgba(P.warm, .25 + .35 * Math.abs(Math.sin(lt * 1.5 + s.ph))); ctx.fillRect(s.x, s.y * .9, s.r, s.r);}
  // 条纹日轮
  const sunR = 190 + 6 * Math.sin(lt * 2);
  ctx.globalCompositeOperation = 'source-over';
  const sg = ctx.createLinearGradient(0, horY - sunR, 0, horY);
  sg.addColorStop(0, P.warm); sg.addColorStop(.55, P.neon); sg.addColorStop(1, P.hor);
  ctx.save(); ctx.beginPath(); ctx.arc(cx, horY - 30, sunR, Math.PI, 0); ctx.closePath(); ctx.clip();
  ctx.fillStyle = sg; ctx.fillRect(cx - sunR, horY - 30 - sunR, sunR * 2, sunR);
  for (let i = 0; i < 7; i++) {const y = horY - 30 - sunR * .55 + i * 22 + (lt * 18) % 22; ctx.fillStyle = P.sky1; ctx.fillRect(cx - sunR, y, sunR * 2, 4 + i * 1.6);}
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter';
  soft(ctx, cx, horY - 60, sunR * 1.9, P.neon, .35);
  // 透视网格
  ctx.lineWidth = 1.6;
  for (let k = -16; k <= 16; k++) {
    const x0 = cx + k * 10, x1 = cx + k * 150;
    ctx.strokeStyle = rgba(P.neon, .5 * (1 - Math.abs(k) / 17));
    ctx.beginPath(); ctx.moveTo(x0, horY); ctx.lineTo(x1, VH); ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const z = frac(i / 16 + lt * .32), y = horY + (VH - horY) * Math.pow(z, 2.4);
    ctx.strokeStyle = rgba(P.neon, .15 + .6 * z); ctx.lineWidth = .8 + 2.2 * z;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke();
  }
  soft(ctx, cx, horY, 900, P.neon2, .08);
  // 光速线
  for (const w of WARP) {
    const d = frac(w.ph + lt * w.sp), r0 = 30 + d * d * 1100, r1 = r0 + 20 + d * 90;
    ctx.strokeStyle = rgba(w.a % 2 < 1 ? P.warm : P.neon2, d * .8); ctx.lineWidth = .6 + d * 2.4;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(w.a) * r0, horY - 60 + Math.sin(w.a) * r0 * .6); ctx.lineTo(cx + Math.cos(w.a) * r1, horY - 60 + Math.sin(w.a) * r1 * .6); ctx.stroke();
  }
  // 标题
  ctx.globalCompositeOperation = 'source-over';
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `900 150px ${font}`;
  const chars = title.split(''), step = 170, x0 = cx - (chars.length - 1) * step / 2;
  chars.forEach((ch, i) => {
    const a = clamp((lt - .8 - i * .25) / .5);
    if (a <= 0) return;
    ctx.shadowColor = P.neon; ctx.shadowBlur = 40;
    ctx.fillStyle = rgba(P.warm, a);
    ctx.fillText(ch, x0 + i * step, 780 - (1 - a) * 30);
  });
  ctx.shadowBlur = 0;
  ctx.font = `600 30px ${MONO}`; ctx.fillStyle = rgba(P.neon, clamp((lt - 2.2) / .6) * .9);
  ctx.fillText('C I T Y   O F   L I G H T', cx, 846);
}

/** 第 2 幕：点阵城市——三层景深的楼群窗灯、高架上的光轨、前景散景。 */
function sceneCity(ctx: Ctx, P: FP, lt: number, rate: number) {
  const horY = 640;
  sky(ctx, P, horY);
  ctx.globalCompositeOperation = 'lighter';
  soft(ctx, 1220, 190, 260, P.warm, .18);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = rgba(P.warm, .9); ctx.beginPath(); ctx.arc(1220, 190, 44, 0, 6.283); ctx.fill();
  for (const s of STARS) {ctx.fillStyle = rgba(P.warm, .2 + .3 * Math.abs(Math.sin(lt * 1.3 + s.ph))); ctx.fillRect(s.x, s.y * .75, s.r, s.r);}
  ctx.globalCompositeOperation = 'lighter';
  soft(ctx, 800, horY, 900, P.hor, .4);
  // 探照光柱：从城市后方扫过天空
  for (let k = 0; k < 3; k++) {
    const bx = 300 + k * 520, ang = -Math.PI / 2 + Math.sin(lt * .5 + k * 2.1) * .45;
    const g = ctx.createLinearGradient(bx, 700, bx + Math.cos(ang) * 700, 700 + Math.sin(ang) * 700);
    g.addColorStop(0, rgba(k === 1 ? P.neon2 : P.neon, .22)); g.addColorStop(1, rgba(P.neon, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx - 6, 700);
    ctx.lineTo(bx + Math.cos(ang - .06) * 760, 700 + Math.sin(ang - .06) * 760); ctx.lineTo(bx + Math.cos(ang + .06) * 760, 700 + Math.sin(ang + .06) * 760); ctx.lineTo(bx + 6, 700); ctx.closePath(); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  LAYERS.forEach((L, d) => {
    const off = (lt * L.speed) % 2400;
    const body = mix(P.sky0, P.sky1, .55 - d * .2);
    for (const B of L.b) {
      let x = B.x - off; if (x < -260) x += 2600;
      if (x > VW + 20 || x + B.w < -20) continue;
      const top = L.base - B.h;
      ctx.fillStyle = body; ctx.fillRect(x, top, B.w, VH - top);
      if (d > 0) {ctx.fillStyle = rgba(P.neon, .55 * L.dim); ctx.fillRect(x, top, B.w, 2); ctx.fillStyle = rgba(P.hor, .18 * L.dim); ctx.fillRect(x + B.w - 3, top, 3, VH - top);}
      const cols = Math.max(1, Math.floor((B.w - 8) / L.cell)), rows = Math.floor((B.h - 10) / L.cell), s = L.cell * .46;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const v = hash(B.seed, i, j);
        const lit = v > .42 + .12 * Math.sin(lt * .8 + B.seed + j * .7);
        if (!lit && v < .2) continue;
        const wx = x + 5 + i * L.cell, wy = top + 6 + j * L.cell;
        ctx.fillStyle = lit ? rgba(v > .85 ? P.neon : mix(P.warm, P.dot, v), L.dim * (.55 + .45 * v)) : rgba(P.dot, .08 * L.dim);
        ctx.fillRect(wx, wy, s, s);
      }
      if (B.antenna && d > 0) {const on = Math.sin(lt * 4 + B.seed) > 0; ctx.fillStyle = rgba(P.neon2, on ? 1 : .25); ctx.fillRect(x + B.w / 2 - 2, top - 26, 4, 26);
        if (on) {ctx.globalCompositeOperation = 'lighter'; soft(ctx, x + B.w / 2, top - 26, 22, P.neon2, .8); ctx.globalCompositeOperation = 'source-over';}}
    }
    // 雾
    if (L.haze > 0) {const g = ctx.createLinearGradient(0, L.base - 260, 0, L.base); g.addColorStop(0, rgba(P.hor, 0)); g.addColorStop(1, rgba(P.hor, L.haze * .35)); ctx.fillStyle = g; ctx.fillRect(0, L.base - 260, VW, 260);}
  });
  // 高架与光轨
  const lanes = [[[-120, 900], [480, 760], [1040, 700], [1720, 640]], [[-120, 940], [500, 800], [1060, 735], [1720, 672]]];
  const bez = (l: number[][], u: number): [number, number] => {const k = 1 - u; return [0, 1].map(c => k * k * k * l[0][c] + 3 * k * k * u * l[1][c] + 3 * k * u * u * l[2][c] + u * u * u * l[3][c]) as [number, number];};
  ctx.fillStyle = mix(P.sky0, '#000000', .3);
  ctx.beginPath(); lanes[0].forEach(() => 0);
  {const top = Array.from({length: 21}, (_, i) => bez(lanes[0], i / 20)), bot = Array.from({length: 21}, (_, i) => bez(lanes[1], 1 - i / 20));
    ctx.moveTo(top[0][0], top[0][1] - 18); top.forEach(p => ctx.lineTo(p[0], p[1] - 18)); bot.forEach(p => ctx.lineTo(p[0], p[1] + 30)); ctx.closePath(); ctx.fill();}
  ctx.globalCompositeOperation = 'lighter';
  for (const car of CARS) {
    const dir = car.lane ? -1 : 1, u = frac(car.ph + dir * lt * car.sp * rate), len = car.len * (.8 + .6 * rate);
    const pts: Array<[number, number]> = [];
    for (let k = 0; k <= 8; k++) {const uu = u - dir * len * k / 8; if (uu < 0 || uu > 1) break; pts.push(bez(lanes[car.lane], uu));}
    glowLine(ctx, pts, car.lane ? P.warm : P.neon, lerp(4.5, 1.4, u), .9);
  }
  // 前景散景
  for (const k of BOKEH) {const x = (k.x - lt * 40 * rate + VW * 2) % (VW + 200) - 100; soft(ctx, x, k.y + Math.sin(lt + k.ph) * 8, k.r, k.warm ? P.warm : P.neon, k.a);}
  ctx.globalCompositeOperation = 'source-over';
}

/** 第 3 幕：数据地球——点阵球体自转、弧线上的光脉冲、从四周汇入的数据流与轨道环。 */
function sceneGlobe(ctx: Ctx, P: FP, lt: number) {
  const cx = 800, cy = 470, R = 270;
  sky(ctx, P, 450);
  for (const s of STARS) {ctx.fillStyle = rgba(P.dot, .2 + .3 * Math.abs(Math.sin(lt + s.ph))); ctx.fillRect(s.x, s.y * 1.6 % VH, s.r, s.r);}
  ctx.globalCompositeOperation = 'lighter';
  soft(ctx, cx, cy, R * 2.3, P.hor, .35);
  // 汇入的数据流
  for (const s of STREAMS) {
    const p = frac(s.ph + lt * s.sp), e = p * p;
    const r0 = lerp(980, R * 1.03, e), r1 = lerp(980, R * 1.03, Math.min(1, (p + .05) * (p + .05)));
    const a0 = s.a + s.tw * p, a1 = s.a + s.tw * (p + .05);
    ctx.strokeStyle = rgba(s.tw > 0 ? P.neon : P.neon2, .15 + .7 * p); ctx.lineWidth = 1 + 1.5 * p;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0 * .7); ctx.lineTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1 * .7); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  // 球体
  const rot = lt * .38, tilt = .38, cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
  const proj = (x: number, y: number, z: number) => {const x1 = x * cr + z * sr, z1 = -x * sr + z * cr; const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct; return [cx + x1 * R, cy + y2 * R, z2];};
  ctx.fillStyle = rgba(P.sky0, .85); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283); ctx.fill();
  for (const g of GLOBE) {
    const [px, py, z] = proj(g.x, g.y, g.z);
    const front = (z + 1) / 2;
    if (g.land) {ctx.fillStyle = rgba(z > 0 ? mix(P.neon, P.warm, front * .5) : P.neon, z > 0 ? .35 + .65 * front : .12); const s = z > 0 ? 2.2 + 2 * front : 1.4; ctx.fillRect(px - s / 2, py - s / 2, s, s);}
    else if (z > -.2) {ctx.fillStyle = rgba(P.dot, .1 + .2 * front); ctx.fillRect(px, py, 1.4, 1.4);}
  }
  ctx.globalCompositeOperation = 'lighter';
  // 边缘大气
  const ring = ctx.createRadialGradient(cx, cy, R * .92, cx, cy, R * 1.25);
  ring.addColorStop(0, rgba(P.neon, 0)); ring.addColorStop(.25, rgba(P.neon, .35)); ring.addColorStop(1, rgba(P.neon, 0));
  ctx.fillStyle = ring; ctx.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
  // 弧线与光脉冲
  ARCS.forEach(([ia, ib, ph], k) => {
    const A = GLOBE[ia], B = GLOBE[ib];
    const pts: Array<[number, number]> = []; let head: [number, number] | null = null;
    const hp = frac(lt * .45 + ph);
    for (let s = 0; s <= 24; s++) {
      const u = s / 24; let x = lerp(A.x, B.x, u), y = lerp(A.y, B.y, u), z = lerp(A.z, B.z, u);
      const n = Math.hypot(x, y, z) || 1, h = 1 + .28 * Math.sin(Math.PI * u);
      x = x / n * h; y = y / n * h; z = z / n * h;
      const [px, py, pz] = proj(x, y, z);
      if (pz < -.15) {if (pts.length > 1) glowLine(ctx, pts, P.neon2, 1.2, .55); pts.length = 0; continue;}
      pts.push([px, py]);
      if (Math.abs(u - hp) < 1 / 48) head = [px, py];
    }
    glowLine(ctx, pts, k % 3 ? P.neon2 : P.warm, 1.2, .55);
    if (head) soft(ctx, head[0], head[1], 26, P.warm, .95);
  });
  // 轨道环
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.22);
  ctx.strokeStyle = rgba(P.neon2, .55); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.55, R * .36, 0, 0, 6.283); ctx.stroke();
  for (let i = 0; i < 3; i++) {const a = lt * .9 + i * 2.09; soft(ctx, Math.cos(a) * R * 1.55, Math.sin(a) * R * .36, 20, P.warm, .9);}
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
}

const FILM_SECONDS = 18, SEGS = [0, 6, 12, 18], SEG_NAMES = ['开场', '光轨', '地球'];
function drawFilm(ctx: Ctx, P: FP, t: number, rate: number, font: string, title: string) {
  const seg = t < SEGS[1] ? 0 : t < SEGS[2] ? 1 : 2, lt = t - SEGS[seg];
  ctx.save();
  // 慢推镜头
  const z = 1 + .05 * lt / 6;
  ctx.translate(VW / 2, VH / 2); ctx.scale(z, z); ctx.translate(-VW / 2, -VH / 2);
  if (seg === 0) sceneOpen(ctx, P, lt, font, title); else if (seg === 1) sceneCity(ctx, P, lt, rate); else sceneGlobe(ctx, P, lt);
  ctx.restore();
  // 暗角与切幕闪白
  const v = ctx.createRadialGradient(VW / 2, VH / 2, VH * .35, VW / 2, VH / 2, VW * .65);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
  if (lt < .2) {ctx.fillStyle = rgba(P.warm, (1 - lt / .2) * .5); ctx.fillRect(0, 0, VW, VH);}
}

/** 整幅换色：新配色画满，旧配色留在圆外，交界一道亮环。 */
function filmFrame(ctx: Ctx, w: number, h: number, t: number, rate: number, pal: FP, prev: FP | null, swap: number, font: string, title: string) {
  ctx.scale(w / VW, h / VH);
  drawFilm(ctx, pal, t, rate, font, title);
  if (prev && swap < 1) {
    const r = inOut(swap) * 1000;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.arc(VW / 2, VH / 2, r, 0, 6.283, true); ctx.clip('evenodd');
    drawFilm(ctx, prev, t, rate, font, title); ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(pal.warm, .9 * (1 - swap)); ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(VW / 2, VH / 2, r, 0, 6.283); ctx.stroke();
    ctx.strokeStyle = rgba(pal.neon, .5 * (1 - swap)); ctx.lineWidth = 40; ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
}

const C_PRESSES = [12, 14, 16, 18];

export default function Scene(props: SceneInput) {
  const C = kit(props);
  const b = beatOf(props);
  const {width, fonts, frame} = props;
  const word = String(props.params.word ?? '即时预览');
  const sub = String(props.params.sub ?? '不渲染视频，本机逐帧现画');
  const filmTitle = String(props.params.filmTitle ?? '城市之光');
  const capList = ((props.params.captions as Array<{text: string}> | undefined) ?? [
    {text: '点开就播，不用等渲染'}, {text: '按 C，换一套配色'}, {text: '拖到哪，就画到哪'}, {text: '配色、配音、节奏，当场生效'}]).map(c => String(c.text ?? ''));
  const kick = Math.exp(-(b % 1) * 7);
  const flash = Math.max(0, 1 - b / .2);

  // 大字：0-4 拍居中，第 4 拍收进左上角
  const dock = outExpo(hit(b, 4, .8));
  const slam = outExpo(b / .45);
  const win = outExpo(hit(b, 0, 1.2));
  const out = inExpo(hit(b, 31.3, .7));

  // 配色：第 12/14/16/18 拍各按一次 C
  const pIdx = C_PRESSES.reduce((acc, at, i) => b >= at ? i + 1 : acc, 0);
  const lastPress = pIdx > 0 ? C_PRESSES[pIdx - 1] : -9;
  const cDown = Math.exp(-(b - lastPress) * 6) * (b >= lastPress ? 1 : 0);
  const pal = FILM_PALS[pIdx], prevPal = pIdx > 0 ? FILM_PALS[pIdx - 1] : null;
  const swap = clamp((b - lastPress) / .55);
  const winScale = lerp(.7, 1, win) * (1 + .006 * kick * (b > 4 ? 1 : 0)) * (1 + .018 * cDown);

  // 播放头：先正常播放；20-27 拍拖动；之后接着播；第 30 拍起 1.25×
  const SCRUB: Array<[number, number]> = [[21, 1.6], [22, 8.2], [23, 13.6], [24, 16.4], [25, 10.4], [26, 3.4], [27, 7.2]];
  let t = 3.2 + b * BEAT;
  if (b >= 20 && b < 27.4) {
    let prev = 3.2 + 20 * BEAT;
    t = prev;
    for (const [at, to] of SCRUB) if (b >= at) {t = lerp(prev, to, outExpo(hit(b, at, .45))); prev = to;}
  } else if (b >= 27.4) t = 7.2 + (Math.min(b, 30) - 27.4) * BEAT + Math.max(0, b - 30) * BEAT * 1.25;
  t = clamp(t, 0, FILM_SECONDS - .01);
  const dragging = b >= 20 && b < 27.4;
  const voiceOff = b >= 28;
  const vDown = Math.exp(-(b - 28) * 6) * (b >= 28 ? 1 : 0);
  const fast = b >= 30;
  const rate = fast ? 1.25 : 1;
  const rDown = Math.exp(-(b - 30) * 6) * (b >= 30 ? 1 : 0);

  const capIdx = b < 12 ? 0 : b < 20 ? 1 : b < 28 ? 2 : 3;
  const capAt = [4, 12, 20, 28][capIdx];
  const capIn = outExpo(hit(b, capAt + .05, .4));

  // 版面
  const W = {x: 110, y: 168, w: 1700, h: 812};
  const S = {x: 140, y: 252, w: 1136, h: 639};
  const bar = {x: S.x, y: 912, w: S.w, h: 50};
  const px = bar.x + bar.w * t / FILM_SECONDS;
  const draw = (ctx: CanvasRenderingContext2D) => filmFrame(ctx, S.w, S.h, t, rate, pal, prevPal, swap, fonts.text, filmTitle);
  const stageOn = win * (b < 4 ? dock : 1);
  // 旁白声纹（V 关掉后归零）
  const voiceBars = Array.from({length: 14}, (_, i) => voiceOff ? 3 : 6 + 26 * Math.abs(Math.sin(b * 3.1 + i * 1.7) * Math.sin(b * 1.3 + i * .6)));

  return <div style={{position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: fonts.text}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', opacity: 1 - out}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 42% 55%, ${alpha(pIdx > 0 ? pal.neon : C.lime, .05 + .07 * kick + .12 * cDown)}, transparent 60%)`}} />
      {/* 冲击波 */}
      {b < 2.5 ? <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <circle cx={960} cy={500} r={1500 * outExpo(b / 1.6)} fill="none" stroke={C.lime} strokeWidth={28 * (1 - b / 2.5)} opacity={1 - b / 2.5} />
        <circle cx={960} cy={500} r={900 * outExpo(b / 1.1)} fill="none" stroke={C.ink} strokeWidth={6 * (1 - b / 2.5)} opacity={.5 * (1 - b / 2.5)} />
      </svg> : null}
      {/* 播放器窗口 */}
      <div style={{position: 'absolute', left: W.x, top: W.y, width: W.w, height: W.h, transform: `scale(${winScale})`, transformOrigin: '50% 45%', opacity: win * (b < 4 ? .3 + .7 * dock : 1)}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: C.panel, border: `2px solid ${C.line}`, boxShadow: `0 40px 140px #000c, 0 0 ${50 * kick}px ${alpha(C.lime, .12)}`}} />
        <div style={{position: 'absolute', left: 30, top: 20, display: 'flex', alignItems: 'baseline', gap: 18, whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: MONO, fontSize: 22, color: C.lime, letterSpacing: 2}}>LIVE · 本机现场渲染</span>
          <span style={{fontSize: 30, fontWeight: 800, color: C.ink}}>即时播放</span>
          <span style={{fontSize: 24, color: C.mute}}>{filmTitle} · 示意作品</span>
        </div>
        <div style={{position: 'absolute', right: 30, top: 22, fontSize: 24, color: C.mute}}>关闭 ✕</div>
      </div>
      {/* 舞台：示意作品现场逐帧画 */}
      <div style={{position: 'absolute', left: S.x, top: S.y, width: S.w, height: S.h, borderRadius: 12, overflow: 'hidden', background: '#000', opacity: stageOn,
        transform: `scale(${winScale})`, transformOrigin: `${960 - S.x}px ${500 - S.y}px`, boxShadow: cDown > .05 ? `0 0 0 4px ${alpha(pal.neon, cDown)}, 0 0 ${90 * cDown}px ${alpha(pal.neon, .6 * cDown)}` : 'none'}}>
        <canvas ref={useCanvas(frame, draw)} width={S.w} height={S.h} style={{position: 'absolute', inset: 0, width: S.w, height: S.h}} />
        {/* 按 C 的提示 */}
        {pIdx > 0 && b - lastPress < 1.6 ? <div style={{position: 'absolute', left: 24, top: 22, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderRadius: 12,
          background: alpha('#000000', .55), color: '#F2F3EF', fontSize: 28, fontWeight: 700, opacity: 1 - hit(b, lastPress + 1.2, .4), transform: `translateY(${(1 - outExpo(hit(b, lastPress, .3))) * -12}px)`}}>
          <span style={{width: 22, height: 22, borderRadius: 11, background: pal.chip}} />配色：{pal.name}</div> : null}
        {fast ? <div style={{position: 'absolute', right: 24, top: 22, padding: '10px 18px', borderRadius: 12, background: alpha('#000000', .55), color: C.lime, fontFamily: MONO, fontSize: 28, fontWeight: 700,
          opacity: outExpo(hit(b, 30, .3))}}>▶▶ 1.25×</div> : null}
        {/* 旁白声纹 */}
        {b >= 4 ? <div style={{position: 'absolute', left: 24, bottom: 22, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 18px', borderRadius: 12, background: alpha('#000000', .5)}}>
          <span style={{fontSize: 24, color: voiceOff ? '#8A9691' : '#F2F3EF', textDecoration: voiceOff ? 'line-through' : 'none'}}>旁白</span>
          <span style={{display: 'flex', alignItems: 'center', gap: 4, height: 34}}>{voiceBars.map((h, i) => <span key={i} style={{width: 4, height: h, borderRadius: 2, background: voiceOff ? '#5A6460' : C.lime}} />)}</span>
          {voiceOff ? <span style={{fontSize: 24, color: '#F2F3EF', opacity: outExpo(hit(b, 28, .3))}}>已关 · 配乐和字幕保留</span> : null}
        </div> : null}
      </div>
      {/* 分段进度条 */}
      <div style={{position: 'absolute', left: bar.x, top: bar.y, width: bar.w, height: bar.h, opacity: outExpo(hit(b, 4, .6))}}>
        {[0, 1, 2].map(i => {
          const x0 = bar.w * SEGS[i] / FILM_SECONDS, x1 = bar.w * SEGS[i + 1] / FILM_SECONDS;
          const cur = t >= SEGS[i] && t < SEGS[i + 1];
          return <div key={i} style={{position: 'absolute', left: x0, width: x1 - x0 - 4, top: 0, height: bar.h, borderRadius: 9, background: cur ? mix(C.panel2, C.lime, .16) : C.panel2,
            border: `2px solid ${cur ? alpha(C.lime, .7) : C.line}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 24, color: cur ? C.ink : C.mute, whiteSpace: 'nowrap'}}>
            第 {i + 1} 幕 · {SEG_NAMES[i]}</div>;
        })}
        <div style={{position: 'absolute', left: px - bar.x - 2, top: -10, width: 4, height: bar.h + 20, borderRadius: 2, background: C.lime, boxShadow: `0 0 18px ${C.lime}`}} />
        <div style={{position: 'absolute', left: px - bar.x - 11, top: -22, width: 22, height: 22, borderRadius: 11, background: C.lime, transform: `scale(${dragging ? 1.3 : 1})`}} />
      </div>
      {dragging ? <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <g transform={`translate(${px + 6} ${bar.y - 4})`}><path d="M0 0 L0 38 L10 29 L17 45 L24 42 L17 26 L30 26 Z" fill={C.ink} stroke={C.bg} strokeWidth={2.5} strokeLinejoin="round" /></g>
      </svg> : null}
      {/* 右侧面板 */}
      <div style={{position: 'absolute', left: 1310, top: 248, width: 470, opacity: outExpo(hit(b, 4.3, .6)), transform: `translateX(${(1 - outExpo(hit(b, 4.3, .6))) * 40}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 50, fontWeight: 700, color: C.ink}}>{clock(t)} <span style={{color: C.mute, fontSize: 32}}>/ {clock(FILM_SECONDS)}</span></div>
        <div style={{marginTop: 6, fontSize: 26, color: C.mute}}>现场渲染中，不是 MP4</div>
        <div style={{marginTop: 26, fontSize: 26, color: C.mute}}>配色</div>
        <div style={{marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10}}>
          {FILM_PALS.map((p, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, fontSize: 24, whiteSpace: 'nowrap',
            border: `2px solid ${i === pIdx ? p.chip : C.line}`, background: i === pIdx ? alpha(p.chip, .16) : 'transparent', color: i === pIdx ? C.ink : C.mute,
            transform: `scale(${i === pIdx ? 1 + .1 * cDown : 1})`}}>
            <span style={{width: 20, height: 20, borderRadius: 10, background: p.chip, flex: 'none'}} />{p.name}</div>)}
        </div>
        <div style={{marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{fontSize: 26, color: C.mute}}>配音</span>
          <span style={{position: 'relative', width: 80, height: 42, borderRadius: 21, background: voiceOff ? C.panel2 : C.lime, border: `2px solid ${voiceOff ? C.line : C.lime}`}}>
            <span style={{position: 'absolute', top: 5, left: voiceOff ? 5 : 43, width: 28, height: 28, borderRadius: 14, background: voiceOff ? C.mute : C.bg}} /></span>
        </div>
        <div style={{marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{fontSize: 26, color: C.mute}}>节奏</span>
          <span style={{display: 'flex', gap: 6}}>{['0.8×', '1×', '1.25×'].map(r => <span key={r} style={{padding: '6px 14px', borderRadius: 8, fontFamily: MONO, fontSize: 24,
            background: r === (fast ? '1.25×' : '1×') ? C.lime : C.panel2, color: r === (fast ? '1.25×' : '1×') ? C.bg : C.mute, fontWeight: 700}}>{r}</span>)}</span>
        </div>
        <div style={{marginTop: 30, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, fontSize: 24, color: C.mute}}>
          <Key k="C" down={cDown} C={C} /><span style={{marginRight: 8}}>换配色</span>
          <Key k="V" down={vDown} C={C} /><span style={{marginRight: 8}}>配音</span>
          <Key k="[ ]" down={rDown} C={C} w={80} /><span>节奏</span>
        </div>
      </div>
      {/* 大字与左上角标签 */}
      <div style={{position: 'absolute', left: lerp(960, 110, dock), top: lerp(470, 84, dock), transform: `translate(${-50 * (1 - dock)}%, -50%) scale(${(1.4 - .4 * slam)})`,
        transformOrigin: dock > .5 ? '0 50%' : '50% 50%', display: 'flex', alignItems: 'center', gap: lerp(36, 16, dock), whiteSpace: 'nowrap', opacity: slam}}>
        <Mark h={lerp(170, 40, dock)} ink={C.ink} lime={C.lime} />
        <span style={{fontSize: lerp(200, 36, dock), fontWeight: 900, color: dock > .5 ? C.lime : C.ink, letterSpacing: lerp(8, 2, dock), textShadow: dock < .5 ? `0 0 60px ${alpha(C.lime, .35)}` : 'none'}}>{word}</span>
      </div>
      <div style={{position: 'absolute', left: 0, width: 1920, top: 640, textAlign: 'center', fontSize: 50, color: C.lime, letterSpacing: 8, opacity: outExpo(hit(b, .8, .5)) * (1 - dock)}}>{sub}</div>
      {/* 分段字幕（顶部右侧） */}
      {b >= 4 ? <div style={{position: 'absolute', left: 520, width: 1290, top: 84, transform: `translateY(-50%) translateY(${(1 - capIn) * 18}px)`, textAlign: 'right', fontSize: 58, fontWeight: 800,
        color: C.ink, letterSpacing: 3, opacity: capIn * (1 - hit(b, capAt + 7.8, .2) * (capIdx < 3 ? 1 : 0)), whiteSpace: 'nowrap'}}>{capList[capIdx]}</div> : null}
      <div style={{position: 'absolute', inset: 0, background: C.ink, opacity: flash, pointerEvents: 'none'}} />
    </div>
  </div>;
}
