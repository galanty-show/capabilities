import React from 'react';
import {clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《为什么天空是蓝的》共用库：光谱、色度、散射模型、光子与排版。prepare.py 把它和每个模块拼成 scenes/<module>.tsx。
// 画面里没有任何图片：天空、日面、光谱与光子的颜色都由下面的物理模型按帧算出来；随机只用固定种子，不读上一帧。
const W = 1920, H = 1080;
const INK = '#05070d', TEXT = '#eef3ff', MUTED = '#8a96ad', GRID = 'rgba(150,180,255,.13)', WARM = '#ffb35c';
const MONO = '"SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace';
const SERIF = '"Times New Roman", Times, "Noto Serif", Georgia, serif';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .3) => sm((t - a) / f) * (1 - sm((t - b) / f));

// ---------------------------------------------------------------- 参数与卡点
/** 文字参数：props 里写了就用，否则用本模块 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function list(props: SceneInput, key: string): string[] {
  const value = props.params[key];
  return (Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? []).map(String);
}
/** 句子与卡点：cue 找不到词时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback: number) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback: number) => s.sentence(i) && i < props.sentences.length ? s.sentence(i)!.start : fallback;
  const end = (i: number, fallback: number) => s.sentence(i) && i < props.sentences.length ? s.sentence(i)!.end : fallback;
  return {s, t: s.t, at, start, end, dur: s.seconds};
}
const fadeEdges = (t: number, dur: number, a = .25, b = .3) => Math.min(sm(t / a), sm((dur - t) / b));

// ---------------------------------------------------------------- 光谱与颜色
/** 波长采样 380–720 nm，步长 10 nm。 */
const LAM = Array.from({length: 35}, (_, i) => 380 + 10 * i);
const lobe = (x: number, mu: number, s1: number, s2: number) => {const s = x < mu ? s1 : s2; return Math.exp(-.5 * ((x - mu) / s) ** 2);};
/** CIE 1931 2° 色匹配函数（Wyman、Sloan、Shirley 2013 多瓣解析拟合）。 */
function cmf(l: number): number[] {
  return [1.056 * lobe(l, 599.8, 37.9, 31.0) + .362 * lobe(l, 442.0, 16.0, 26.7) - .065 * lobe(l, 501.1, 20.4, 26.2),
    .821 * lobe(l, 568.8, 46.9, 40.5) + .286 * lobe(l, 530.9, 16.3, 31.1),
    1.217 * lobe(l, 437.0, 11.8, 36.0) + .681 * lobe(l, 459.0, 26.0, 13.8)];
}
const CMF = LAM.map(cmf);
/** 普朗克黑体（相对值）：太阳光谱近似为 5778 K 黑体。 */
const planck = (l: number, T = 5778) => {const m = l * 1e-9; return 1 / m ** 5 / (Math.exp(.014388 / (m * T)) - 1);};
const SUN_RAW = LAM.map(l => planck(l));
const SUN_MAX = Math.max(...SUN_RAW);
const SUN = SUN_RAW.map(v => v / SUN_MAX);
/** XYZ → 线性 sRGB（D65）。 */
const toRgb = (x: number, y: number, z: number) => [3.2406 * x - 1.5372 * y - .4986 * z, -.9689 * x + 1.8758 * y + .0415 * z, .0557 * x - .2040 * y + 1.0570 * z];
function spectrumXyz(spec: ArrayLike<number>, lams = LAM, cm = CMF) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < lams.length; i++) {x += spec[i] * cm[i][0]; y += spec[i] * cm[i][1]; z += spec[i] * cm[i][2];}
  return [x, y, z];
}
// 白点：大气层外的阳光算作白色（人眼对日光的适应），其余颜色都相对它。
const SUN_RGB = (() => {const [x, y, z] = spectrumXyz(SUN); return toRgb(x, y, z);})();
const WB = SUN_RGB.map(v => Math.max(...SUN_RGB) / v);
/** 光谱 → 白平衡后的线性 RGB（相对亮度）。 */
function specRgb(spec: ArrayLike<number>, lams = LAM, cm = CMF): number[] {
  const [x, y, z] = spectrumXyz(spec, lams, cm);
  return toRgb(x, y, z).map((v, i) => v * WB[i]);
}
const enc = (v: number) => {const x = clamp(v); return x <= .0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - .055;};
const lum = (c: number[]) => .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
/** 线性 RGB → 显示色：亮度按 Reinhard 压缩、超出色域时先少量向灰靠再按最大通道归一（保留色相）。 */
function tone(c: number[], exposure: number): number[] {
  const x = c.map(v => Math.max(0, v) * exposure), Y = lum(x);
  if (Y <= 1e-9) return [0, 0, 0];
  const Yt = Y / (1 + Y) * 1.15, k = Yt / Y;
  let o = x.map(v => v * k);
  const m = Math.max(...o);
  if (m > 1) {const d = clamp((m - 1) / Math.max(1e-6, m - Yt)) * .1; o = o.map(v => v + (Yt - v) * d);}
  const n = Math.max(1, ...o);
  return o.map(v => v / n);
}
/** 按最大通道归一，只留色相与饱和度（日面、光子这类“看颜色”的东西）。 */
const hue = (c: number[]) => {const m = Math.max(1e-9, ...c); return c.map(v => Math.max(0, v) / m);};
const css = (c: number[], a = 1) => `rgba(${Math.round(enc(c[0]) * 255)},${Math.round(enc(c[1]) * 255)},${Math.round(enc(c[2]) * 255)},${a})`;
const hex = (c: number[]) => '#' + c.map(v => Math.round(enc(v) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
/** 单色光的显示色：色匹配函数 → RGB；超出 sRGB 的负分量截掉（加白会把紫端染成青色），再按最大通道归一，两端按人眼灵敏度压暗。 */
function waveRgb(l: number): number[] {
  const [x, y, z] = cmf(l);
  const c = toRgb(x, y, z).map(v => Math.max(0, v));
  const m = Math.max(1e-9, ...c), edge = clamp((l - 375) / 45) * clamp((735 - l) / 55);
  return c.map(v => v / m * (.25 + .75 * edge));
}
const waveCss = (l: number, a = 1) => css(waveRgb(l), a);

// ---------------------------------------------------------------- 大气
/** 瑞利光学厚度：严格按 1/λ⁴，550 nm 处取 0.0975（海平面整层大气）。 */
const tauR = (l: number) => .0975 * (550 / l) ** 4;
/** 气溶胶（薄霾）：光学厚度 0.04、Ångström 指数 1.3，单次散射反照率 0.9。 */
const tauA = (l: number) => .04 * (550 / l) ** 1.3;
const OMEGA_A = .9, G_A = .76;
/** 臭氧 Chappuis 吸收带（≈300 DU）：让黄昏的天顶保持蓝色。 */
const tauO = (l: number) => .038 * Math.exp(-.5 * ((l - 602) / (l < 602 ? 62 : 58)) ** 2);
/** Kasten–Young 1989 相对大气质量：太阳高度 sinE → 光程相对头顶直射的倍数（地平线≈38）。 */
function airmass(sinE: number): number {
  const z = Math.acos(clamp(sinE, -1, 1)) * 180 / Math.PI;
  return 1 / (Math.max(0, sinE) + .50572 * Math.max(96.07995 - z, 1e-3) ** -1.6364);
}
/** 22 km 高的臭氧薄层的光程倍数（球面几何，地平线≈12）。 */
const mO3 = (sinE: number) => {const k = 6371 / 6393; return 1 / Math.sqrt(1 - k * k * (1 - clamp(sinE) ** 2));};
const phaseR = (c: number) => 3 / (16 * Math.PI) * (1 + c * c);
const phaseHG = (c: number, g: number) => (1 - g * g) / (4 * Math.PI * (1 + g * g - 2 * g * c) ** 1.5);
/** 平行平面单次散射层：顶部入射、底部观看，光程倍数 m（视线）与 m0（太阳）。 */
function slab(tau: number, m: number, m0: number) {
  const den = tau * (m0 - m);
  return Math.abs(den) > 1e-6 ? (Math.exp(-tau * m) - Math.exp(-tau * m0)) / den : Math.exp(-tau * m);
}
// 天空用 20 nm 步长积分（18 个波长），每帧几千个方向也够快。
const SKY_LAM = LAM.filter((_, i) => i % 2 === 0);
const SKY_CMF = SKY_LAM.map(cmf);
const SKY_SUN = SKY_LAM.map(l => planck(l) / SUN_MAX);
const SKY_TR = SKY_LAM.map(tauR), SKY_TA = SKY_LAM.map(l => tauA(l) / OMEGA_A), SKY_TO = SKY_LAM.map(tauO);

type SkyOptions = {
  /** 太阳高度（度）。 */ elev: number;
  /** 太阳方位：画面水平位置（-1..1，0 为正中）。 */ sunX?: number;
  /** 水平视场（度）、地平线在画面里的高度比例、相机仰角（度）。 */ hfov?: number; horizon?: number; pitch?: number;
  /** 'earth'（瑞利 + 薄霾 + 臭氧）或 'mars'（尘埃：衍射峰宽 ∝ λ/d、尘埃吸收蓝光）。 */ planet?: 'earth' | 'mars';
  /** 只算大气里的某一部分：'all' | 'rayleigh'。 */ only?: 'all' | 'rayleigh';
  exposure?: number;
};
/** 画面里一个方向的天空亮度（线性 RGB）。dir 为单位向量（x 右、y 上、z 前）。 */
function skyRadiance(dir: number[], sun: number[], o: SkyOptions): number[] {
  const mu = dir[1];
  if (mu < 0) return [0, 0, 0];
  const c = dir[0] * sun[0] + dir[1] * sun[1] + dir[2] * sun[2];
  const m = airmass(mu), m0 = airmass(sun[1]);
  const spec = new Array(SKY_LAM.length);
  if (o.planet === 'mars') {
    // 火星：整层尘埃 τ≈0.5（与波长基本无关）；30% 能量进衍射前向峰（宽度 ∝ λ/d，d≈3 μm），其余为宽散射且蓝光被尘埃吸收。
    const th = Math.acos(clamp(c, -1, 1)), tau = .5, F = slab(tau, m, m0) * m * tau;
    const pb = phaseHG(c, .2);
    for (let i = 0; i < SKY_LAM.length; i++) {
      const lam = SKY_LAM[i] / 1000, sig = .9 * lam / 3, pd = Math.exp(-((th / sig) ** 2)) / (Math.PI * sig * sig);
      const albedo = .38 + .6 * clamp((SKY_LAM[i] - 420) / 280);
      spec[i] = SKY_SUN[i] * (.3 * pd + .7 * albedo * pb) * F;
    }
    return specRgb(spec, SKY_LAM, SKY_CMF);
  }
  const pr = phaseR(c), pa = phaseHG(c, G_A), oz = mO3(sun[1]) + mO3(mu), rayOnly = o.only === 'rayleigh';
  for (let i = 0; i < SKY_LAM.length; i++) {
    const tr = SKY_TR[i], ta = rayOnly ? 0 : SKY_TA[i];
    // 上层：空气分子（瑞利），再穿过下层薄霾到眼睛；下层：薄霾，接收的是已被上层削掉蓝光的阳光。
    const upper = tr * pr * m * slab(tr, m, m0) * Math.exp(-ta * m);
    const lower = rayOnly ? 0 : OMEGA_A * ta * pa * m * slab(ta, m, m0) * Math.exp(-tr * m0);
    spec[i] = SKY_SUN[i] * (upper + lower) * Math.exp(-SKY_TO[i] * oz);
  }
  return specRgb(spec, SKY_LAM, SKY_CMF);
}
/** 太阳方向单位向量。 */
function sunDir(elev: number, sunX = 0, hfov = 90) {
  const e = elev * Math.PI / 180, az = sunX * hfov / 2 * Math.PI / 180;
  return [Math.cos(e) * Math.sin(az), Math.sin(e), Math.cos(e) * Math.cos(az)];
}
/** 画面像素 → 视线方向（针孔相机，pitch 抬头）。 */
function camDir(px: number, py: number, w: number, h: number, o: SkyOptions) {
  const f = (w / 2) / Math.tan((o.hfov ?? 90) / 2 * Math.PI / 180);
  // horizon 是真实地平线所在的行；抬头 pitch 后光轴中心在它上方 f·tan(pitch)。
  const p = (o.pitch ?? 0) * Math.PI / 180, x = px - w / 2, y = (o.horizon ?? .72) * h - f * Math.tan(p) - py;
  const yy = y * Math.cos(p) + f * Math.sin(p), zz = -y * Math.sin(p) + f * Math.cos(p);
  const n = Math.hypot(x, yy, zz);
  return [x / n, yy / n, zz / n];
}
/** 曝光：像相机自动曝光一样随天空亮度变（用一个固定参考方向的亮度，逐帧平滑、可复现）。 */
function autoExposure(sun: number[], o: SkyOptions) {
  if (o.exposure) return o.exposure;
  const ref = lum(skyRadiance([.62, .5, .6].map(v => v / Math.hypot(.62, .5, .6)), sun, o));
  return o.planet === 'mars' ? .45 / Math.max(ref, 1e-9) ** .45 : 1.4 / Math.max(ref, 1e-9) ** .55;
}
/** 日面颜色：大气层外阳光乘以沿途透射 e^{−τ·m}，只取色相（亮度另行压缩显示）。 */
function sunDisk(elev: number, planet: 'earth' | 'mars' = 'earth'): {rgb: number[]; trans: number[]} {
  const s = Math.sin(elev * Math.PI / 180), m0 = airmass(s);
  const trans = LAM.map(l => planet === 'mars' ? Math.exp(-.5 * m0) : Math.exp(-(tauR(l) + tauA(l) / OMEGA_A) * m0 - tauO(l) * mO3(s)));
  return {rgb: hue(specRgb(SUN.map((v, i) => v * trans[i]))), trans};
}

/** 把天空模型画进 canvas 的一个矩形：每 step 像素算一个方向，再在 CPU 上双线性插值逐像素写入（不用 GPU 缩放，渲染可复现）。 */
function paintSky(ctx: CanvasRenderingContext2D, rect: {x: number; y: number; w: number; h: number}, o: SkyOptions, step = 16) {
  const w = Math.round(rect.w), h = Math.round(rect.h);
  const sun = sunDir(o.elev, o.sunX ?? 0, o.hfov ?? 90), ex = autoExposure(sun, o);
  const gw = Math.ceil(w / step) + 1, gh = Math.ceil(h / step) + 1, grid = new Float32Array(gw * gh * 3);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    const d = camDir(Math.min(w, i * step), Math.min(h, j * step), w, h, o);
    const c = tone(skyRadiance(d, sun, o), ex), k = (j * gw + i) * 3;
    grid[k] = enc(c[0]) * 255; grid[k + 1] = enc(c[1]) * 255; grid[k + 2] = enc(c[2]) * 255;
  }
  const img = ctx.createImageData(w, h), data = img.data;
  for (let y = 0; y < h; y++) {
    const gy = y / step, j = Math.min(gh - 2, Math.floor(gy)), fy = gy - j;
    for (let x = 0; x < w; x++) {
      const gx = x / step, i = Math.min(gw - 2, Math.floor(gx)), fx = gx - i;
      const a = (j * gw + i) * 3, b = a + 3, c = a + gw * 3, d = c + 3, p = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        const top = grid[a + ch] + (grid[b + ch] - grid[a + ch]) * fx, bot = grid[c + ch] + (grid[d + ch] - grid[c + ch]) * fx;
        data[p + ch] = top + (bot - top) * fy;
      }
      data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, Math.round(rect.x), Math.round(rect.y));
  return {sun, exposure: ex};
}
/** 太阳在画面里的位置（像素）；在相机背后时 visible 为 false。 */
function projectSun(o: SkyOptions, rect = {x: 0, y: 0, w: W, h: H}) {
  const sun = sunDir(o.elev, o.sunX ?? 0, o.hfov ?? 90), f = (rect.w / 2) / Math.tan((o.hfov ?? 90) / 2 * Math.PI / 180), p = (o.pitch ?? 0) * Math.PI / 180;
  const yy = sun[1] * Math.cos(p) - sun[2] * Math.sin(p), zz = sun[1] * Math.sin(p) + sun[2] * Math.cos(p);
  return {x: rect.x + rect.w / 2 + f * sun[0] / Math.max(zz, 1e-3), y: rect.y + (o.horizon ?? .72) * rect.h - f * Math.tan(p) - f * yy / Math.max(zz, 1e-3), visible: zz > .05};
}
/** 海面：地平线以下用近地平线的天色压暗做渐变，太阳低时画一条按帧闪动的日光倒影（颜色取日面色）。 */
function drawSea(ctx: CanvasRenderingContext2D, rect: {x: number; y: number; w: number; h: number}, o: SkyOptions, ps: {x: number; y: number; visible: boolean}, t: number) {
  const hy = rect.y + (o.horizon ?? .72) * rect.h, depth = rect.y + rect.h - hy;
  const sun = sunDir(o.elev, o.sunX ?? 0, o.hfov ?? 90), ex = autoExposure(sun, o);
  const near = tone(skyRadiance(norm3([sun[0], .03, sun[2]]), sun, o), ex), far = tone(skyRadiance(norm3([-sun[0] - .4, .03, .9]), sun, o), ex);
  const g = ctx.createLinearGradient(0, hy, 0, rect.y + rect.h);
  g.addColorStop(0, css(near.map((v, i) => (v * .55 + far[i] * .45) * .5))); g.addColorStop(1, css(far.map(v => v * .08)));
  ctx.fillStyle = g; ctx.fillRect(rect.x, hy, rect.w, depth);
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(rect.x, hy, rect.w, 1.5);
  if (!ps.visible || o.elev > 35) return;
  const disk = sunDisk(o.elev, o.planet).rgb, r = seeded(71), fade = clamp((35 - o.elev) / 20);
  for (let i = 0; i < 170; i++) {
    const q = r() ** 1.5, y = hy + 2 + q * (depth - 4), spread = 10 + q * depth * .55, w = 8 + q * 46;
    const x = ps.x + (r() - .5) * 2 * spread * (.35 + .65 * r()), a = (1 - q) * (.25 + .75 * Math.abs(Math.sin(t * (2 + r() * 3) + i)));
    ctx.fillStyle = css(disk, a * .8 * fade); ctx.fillRect(x - w / 2, y, w, 1.5 + q * 2.5);
  }
}
const norm3 = (v: number[]) => {const n = Math.hypot(v[0], v[1], v[2]); return v.map(x => x / n);};
/** 天空画布：整幅（或给定矩形）按模型画天，再画日面与远山剪影。 */
function SkyCanvas({frame, o, rect = {x: 0, y: 0, w: W, h: H}, hills = true, sea = false, sunSize = 26, opacity = 1, step = 16, after}:
  {frame: number; o: SkyOptions; rect?: {x: number; y: number; w: number; h: number}; hills?: boolean; sea?: boolean; sunSize?: number; opacity?: number; step?: number;
    after?: (ctx: CanvasRenderingContext2D) => void}) {
  const ref = useCanvas(frame, ctx => {
    paintSky(ctx, rect, o, step);
    ctx.save(); ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
    // 日面投影到画面（在视野里才画）
    const ps = projectSun(o, rect);
    if (ps.visible) {
      const sx = ps.x, sy = ps.y;
      const disk = sunDisk(o.elev, o.planet), core = css(disk.rgb), r = sunSize;
      const glow = ctx.createRadialGradient(sx, sy, r * .6, sx, sy, r * 5);
      glow.addColorStop(0, css(disk.rgb, o.planet === 'mars' ? .5 : .55)); glow.addColorStop(1, css(disk.rgb, 0));
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(sx, sy, r * 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = o.planet === 'mars' ? 'rgba(240,246,255,1)' : core; ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
    }
    after?.(ctx);
    if (sea) drawSea(ctx, rect, o, ps, frame / 30);
    else if (hills) {
      const base = rect.y + (o.horizon ?? .72) * rect.h, r = seeded(o.planet === 'mars' ? 41 : 17);
      const layers = o.planet === 'mars' ? [[18, '#2a1a12'], [40, '#140c08']] : [[14, '#0d1420'], [34, '#070b12']];
      layers.forEach(([amp, color], li) => {
        const ph = r() * 10, k = r() * 3 + 2;
        ctx.fillStyle = color as string; ctx.beginPath(); ctx.moveTo(rect.x, rect.y + rect.h);
        for (let x = 0; x <= rect.w; x += 12) {
          const u = x / rect.w;
          const yv = base - (amp as number) * (.55 + .45 * Math.sin(u * k * 6.283 + ph) * Math.sin(u * 2.3 * 6.283 + ph * 2)) - li * 6;
          ctx.lineTo(rect.x + x, yv);
        }
        ctx.lineTo(rect.x + rect.w, rect.y + rect.h); ctx.closePath(); ctx.fill();
      });
    }
    ctx.restore();
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}} />;
}

/** 云：按固定种子摆放的一团“云泡”；顶部是直射阳光的颜色（lit），底部是天光的颜色（shade）。 */
function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, seed: number, lit: number[], shade: number[], alpha = 1) {
  const r = seeded(seed), puffs: number[][] = [];
  for (let i = 0; i < 26; i++) {
    const u = r() * 2 - 1, rad = (.34 + .3 * r()) * (1 - .55 * Math.abs(u));
    puffs.push([cx + u * s * 1.15, cy - (r() * .55 + .1) * s * (1 - Math.abs(u) * .6), rad * s]);
  }
  puffs.sort((a, b) => a[1] - b[1]);
  ctx.save(); ctx.globalAlpha = alpha;
  // 底部扁平的云底
  ctx.fillStyle = css(shade); ctx.beginPath(); ctx.ellipse(cx, cy + s * .05, s * 1.25, s * .2, 0, 0, Math.PI * 2); ctx.fill();
  for (const [x, y, rad] of puffs) {
    const gr = ctx.createRadialGradient(x - rad * .3, y - rad * .45, rad * .1, x, y, rad);
    gr.addColorStop(0, css(lit)); gr.addColorStop(.55, css(lit.map((v, i) => mix(v, shade[i], .35))));
    gr.addColorStop(1, css(shade));
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- 光子
type V2 = [number, number];
type Photon = {t0: number; lam: number; xs: number[]; ys: number[]; cum: number[]; hit: number};
/** 按太阳光谱抽一个波长（逆累积分布，固定种子）。 */
const SUN_CDF = (() => {let s = 0; const c = SUN.map(v => (s += v)); return c.map(v => v / s);})();
function sampleLam(u: number, jitter: number) {
  let i = 0;
  while (i < SUN_CDF.length - 1 && SUN_CDF[i] < u) i++;
  return clamp(LAM[i] - 5 + 10 * jitter, 380, 720);
}
/** 二维瑞利相函数抽散射角：p(θ) ∝ 1 + cos²θ（拒绝采样）。 */
function rayleighAngle(r: () => number) {
  for (let k = 0; k < 20; k++) {const a = r() * Math.PI * 2, c = Math.cos(a); if (r() * 2 < 1 + c * c) return a;}
  return r() * Math.PI * 2;
}
type PhotonOptions = {
  seed: number; count: number; rate: number; box: {x0: number; x1: number; y0: number; y1: number};
  /** 入射：从 box 左侧（或给定点）沿 dir 方向射入。 */ enter?: (r: () => number) => [number, number]; dir?: [number, number];
  /** 平均自由程（像素）：瑞利 ∝ λ⁴；米氏给常数。 */ mfp: (lam: number) => number; maxEvents?: number;
  /** 只要某个波长段。 */ lams?: (r: () => number) => number;
};
const PHOTON_CACHE = new Map<string, Photon[]>();
/** 生成整幕光子：出生时刻、波长与整条折线轨迹都在开头用固定种子算好，第 n 帧只按“年龄”取位置。 */
function photons(key: string, o: PhotonOptions): Photon[] {
  const hit = PHOTON_CACHE.get(key);
  if (hit) return hit;
  const r = seeded(o.seed), list: Photon[] = [], {x0, x1, y0, y1} = o.box;
  for (let n = 0; n < o.count; n++) {
    const lam = o.lams ? o.lams(r) : sampleLam(r(), r());
    let [x, y] = o.enter ? o.enter(r) : [x0, y0 + r() * (y1 - y0)];
    let [dx, dy] = o.dir ?? [1, 0];
    const xs = [x], ys = [y], cum = [0];
    let hitAt = -1, total = 0;
    for (let e = 0; e < (o.maxEvents ?? 6); e++) {
      const s = -Math.log(1 - r() * .999999) * o.mfp(lam);
      // 走到盒子边界为止
      let exit = Infinity;
      if (dx > 0) exit = Math.min(exit, (x1 - x) / dx); if (dx < 0) exit = Math.min(exit, (x0 - x) / dx);
      if (dy > 0) exit = Math.min(exit, (y1 - y) / dy); if (dy < 0) exit = Math.min(exit, (y0 - y) / dy);
      const go = Math.min(s, Math.max(0, exit));
      x += dx * go; y += dy * go; total += go; xs.push(x); ys.push(y); cum.push(total);
      if (s >= exit) break;
      if (hitAt < 0) hitAt = total;
      const a = rayleighAngle(r), c = Math.cos(a), sn = Math.sin(a);
      [dx, dy] = [dx * c - dy * sn, dx * sn + dy * c];
    }
    // 离开盒子后继续沿最后方向飞出画面
    x += dx * 2400; y += dy * 2400; total += 2400; xs.push(x); ys.push(y); cum.push(total);
    list.push({t0: n / o.rate, lam, xs, ys, cum, hit: hitAt});
  }
  PHOTON_CACHE.set(key, list);
  return list;
}
/** 光子在“已飞行距离 d”处的位置。 */
function photonAt(p: Photon, d: number): [number, number] {
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i] < d) i++;
  const a = p.cum[i - 1], b = p.cum[i], k = b > a ? clamp((d - a) / (b - a)) : 0;
  return [mix(p.xs[i - 1], p.xs[i], k), mix(p.ys[i - 1], p.ys[i], k)];
}
/** 画一批光子：每个光子一段短拖尾，颜色是它波长的显示色。 */
function drawPhotons(ctx: CanvasRenderingContext2D, list: Photon[], t: number, speed: number, o: {trail?: number; size?: number; alpha?: number; until?: number; boost?: boolean} = {}) {
  ctx.lineCap = 'round';
  for (const p of list) {
    const age = t - p.t0;
    if (age < 0 || (o.until !== undefined && p.t0 > o.until)) continue;
    const d = age * speed;
    if (d > p.cum[p.cum.length - 1]) continue;
    const [x, y] = photonAt(p, d), [tx, ty] = photonAt(p, Math.max(0, d - (o.trail ?? 36)));
    if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
    // boost：已经被弹开过的光子画粗、画亮，还在直走的画细、画淡（只是强调，轨迹本身不变）
    const bounced = p.hit >= 0 && d > p.hit, k = o.boost ? (bounced ? 1.25 : .6) : 1;
    ctx.strokeStyle = waveCss(p.lam, (o.alpha ?? .9) * (o.boost && !bounced ? .55 : 1)); ctx.lineWidth = (o.size ?? 3) * k;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
  }
}

// ---------------------------------------------------------------- 排版
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
/** 小号等宽读数（仪表风格）。 */
const Mono = ({x, y, size = 24, color = MUTED, opacity = 1, anchor = 'start', children, weight = 500}: any) =>
  <text x={x} y={y} fontFamily={MONO} fontSize={size} fill={color} opacity={opacity} textAnchor={anchor} fontWeight={weight}>{children}</text>;
/** 中文标签（宿主正文字体）。 */
const Label = ({x, y, size = 30, color = TEXT, opacity = 1, anchor = 'start', fonts, weight = 600, children, spacing = 2}: any) =>
  <text x={x} y={y} fontFamily={fonts?.text} fontSize={size} fill={color} opacity={opacity} textAnchor={anchor} fontWeight={weight} letterSpacing={spacing}>{children}</text>;
/** 逐字显现的标题（HTML，宿主字体）。p 为 0→1。 */
function Reveal({text, p, style}: {text: string; p: number; style?: any}) {
  const chars = Array.from(text);
  return <span style={style}>{chars.map((ch, i) => {
    const q = clamp(p * (chars.length + 3) - i);
    return <span key={i} style={{display: 'inline-block', opacity: sm(q), transform: `translateY(${(1 - out3(q)) * 18}px)`, filter: q < 1 ? `blur(${(1 - q) * 6}px)` : undefined}}>{ch === ' ' ? '\u00a0' : ch}</span>;
  })}</span>;
}
/** 数学字母（斜体衬线）。 */
const MathText = ({x, y, size, children, color = TEXT, opacity = 1, italic = true, anchor = 'start'}: any) =>
  <text x={x} y={y} fontFamily={SERIF} fontStyle={italic ? 'italic' : 'normal'} fontSize={size} fill={color} opacity={opacity} textAnchor={anchor}>{children}</text>;
/** 光谱条：380–720 nm 按 waveRgb 着色。 */
function SpectrumBar({x, y, w, h, p = 1, id, opacity = 1}: {x: number; y: number; w: number; h: number; p?: number; id: string; opacity?: number}) {
  const stops = LAM.map((l, i) => <stop key={i} offset={i / (LAM.length - 1)} stopColor={waveCss(l)} />);
  return <g opacity={opacity}>
    <defs><linearGradient id={`${id}-g`} x1="0" x2="1" y1="0" y2="0">{stops}</linearGradient>
      <clipPath id={`${id}-c`}><rect x={x} y={y - 2} width={w * clamp(p)} height={h + 4} /></clipPath></defs>
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={`url(#${id}-g)`} clipPath={`url(#${id}-c)`} />
  </g>;
}
const nmX = (l: number, x0: number, w: number) => x0 + (l - 380) / 340 * w;
/** 细网格背景（实验记录本风格）。 */
const Grid = ({opacity = 1, step = 60}: {opacity?: number; step?: number}) => <Svg style={{opacity}}>
  {Array.from({length: Math.ceil(W / step) + 1}, (_, i) => <line key={'v' + i} x1={i * step} x2={i * step} y1={0} y2={H} stroke={GRID} strokeWidth={1} />)}
  {Array.from({length: Math.ceil(H / step) + 1}, (_, i) => <line key={'h' + i} x1={0} x2={W} y1={i * step} y2={i * step} stroke={GRID} strokeWidth={1} />)}
</Svg>;
const Vignette = ({k = .55}: {k?: number}) => <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${k}) 100%)`}} />;

// 光与散射：part=prism 白光过棱镜（斯涅尔定律 + 柯西色散逐波长折射，光谱条与纳米标尺）；
// part=scatter 分子与波长的尺度对比、光子撞上分子按 1/λ⁴ 的概率弹开（方向按 1+cos²θ）；
// part=formula 1/λ⁴ 逐项排版、强度曲线、(700/450)⁴≈5.86 的逐步代入。
export const meta = {
  params: {
    part: '用法：prism 棱镜 / scatter 瑞利散射 / formula 四次方公式（改画面请改代码）',
    colorNames: {label: '光谱色名', type: 'list', min: 7, max: 7, maxLength: 6, default: ['紫', '蓝', '青', '绿', '黄', '橙', '红'], help: '依次标在 410、460、490、530、575、605、660 nm 处'},
    rainbowCue: {label: '彩虹卡点词', type: 'text', default: '彩虹', maxLength: 16, help: '念到这个词时光线展开成光谱'},
    violetCue: {label: '紫光卡点词', type: 'text', default: '四百', maxLength: 16, help: '念到时标出 400 nm'},
    redCue: {label: '红光卡点词', type: 'text', default: '七百', maxLength: 16, help: '念到时标出 700 nm'},
    prismLabel: {label: '棱镜说明', type: 'text', default: '玻璃棱镜 · 折射率随波长变化', maxLength: 48, help: '棱镜下方的小字'},
    whiteLabel: {label: '白光标签', type: 'text', default: '白光', maxLength: 16, help: '入射光束旁的标签'},
    waveLabel: {label: '光波标签', type: 'text', default: '蓝光的一个波长 · 450 nm', maxLength: 48, help: '尺度图里正弦波的说明'},
    moleculeLabel: {label: '分子标签', type: 'text', default: '氮分子 N₂ ≈ 0.3 nm（放大 300 倍）', maxLength: 48, help: '放大镜里分子的说明'},
    ratioCue: {label: '倍数卡点词', type: 'text', default: '上千倍', maxLength: 16, help: '念到时亮出倍数'},
    ratioText: {label: '倍数文字', type: 'text', default: '波长 ÷ 分子 ≈ 1500 倍', maxLength: 30, help: '尺度对比的结论'},
    bounceCue: {label: '弹开卡点词', type: 'text', default: '四面八方', maxLength: 16, help: '念到时画出散射方向图'},
    nameCue: {label: '名称卡点词', type: 'text', default: '瑞利散射', maxLength: 24, help: '念到时亮出名称'},
    scatterName: {label: '散射名称', type: 'text', default: '瑞利散射', maxLength: 24, help: '右侧大字'},
    patternLabel: {label: '方向图说明', type: 'text', default: '散射方向：∝ 1 + cos²θ', maxLength: 30, help: '方向图旁的小字'},
    terms: {label: '公式各项说明', type: 'list', min: 3, max: 3, maxLength: 10, default: ['散射强度', '波长', '四次方'], help: '依次标在 I、λ、指数 4 下面'},
    termCues: {label: '公式卡点词', type: 'list', min: 4, max: 4, maxLength: 12, default: ['强度', '波长', '四次方', '反比'], help: '念到时依次亮出 I、λ、4、∝ 1/'},
    blueCue: {label: '蓝光卡点词', type: 'text', default: '四百五十', maxLength: 16, help: '念到时在曲线上标出 450 nm'},
    redCue2: {label: '红光卡点词（公式）', type: 'text', default: '七百', maxLength: 16, help: '念到时在曲线上标出 700 nm'},
    stepCue: {label: '代入卡点词', type: 'text', default: '算下来', maxLength: 16, help: '念到时逐步代入'},
    resultCue: {label: '结果卡点词', type: 'text', default: '五点九', maxLength: 16, help: '念到时亮出 5.86'},
    blueName: {label: '蓝光名', type: 'text', default: '蓝光', maxLength: 8, help: '曲线与方块旁的标签'},
    redName: {label: '红光名', type: 'text', default: '红光', maxLength: 8, help: '曲线与方块旁的标签'},
    curveLabel: {label: '曲线标题', type: 'text', default: '散射强度（以 700 nm 为 1）', maxLength: 48, help: '左下曲线的标题'},
  },
};

// ---------------------------------------------------------------- 棱镜
/** 柯西色散 n(λ) = A + B/λ²（λ 单位 μm）；B 比真实冕牌玻璃放大约 6 倍，好让色散在画面上看得清。 */
const nGlass = (l: number) => 1.46 + .025 / (l / 1000) ** 2;
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
const norm = (a: V2): V2 => {const n = Math.hypot(a[0], a[1]); return [a[0] / n, a[1] / n];};
/** 斯涅尔定律（向量形式）：d 入射方向，nr 指向入射介质一侧的法线。 */
function refract(d: V2, nr: V2, n1: number, n2: number): V2 {
  const r = n1 / n2, ci = -dot(nr, d), st2 = r * r * (1 - ci * ci);
  const ct = Math.sqrt(Math.max(0, 1 - st2));
  return norm([r * d[0] + (r * ci - ct) * nr[0], r * d[1] + (r * ci - ct) * nr[1]]);
}
function hitLine(p: V2, d: V2, a: V2, b: V2): V2 {
  const e: V2 = [b[0] - a[0], b[1] - a[1]], den = d[0] * e[1] - d[1] * e[0];
  const s = ((a[0] - p[0]) * e[1] - (a[1] - p[1]) * e[0]) / den;
  return [p[0] + d[0] * s, p[1] + d[1] * s];
}
const PA: V2 = [700, 110], PB: V2 = [480, 491], PC: V2 = [920, 491];
const ENTRY: V2 = [PA[0] + (PB[0] - PA[0]) * .52, PA[1] + (PB[1] - PA[1]) * .52];
const N_LEFT: V2 = norm([-(PB[1] - PA[1]), PB[0] - PA[0]]);                       // 左面外法线（指向左上，朝向空气）
const N_RIGHT_IN: V2 = norm([-(PC[1] - PA[1]), PC[0] - PA[0]]);                  // 右面法线（指向玻璃内）
const INC: V2 = (() => {const i = Math.asin(nGlass(550) * Math.sin(Math.PI / 6)), a = Math.atan2(-N_LEFT[1], -N_LEFT[0]) - i; return [Math.cos(a), Math.sin(a)];})();
const SOURCE: V2 = [ENTRY[0] - INC[0] * 700, ENTRY[1] - INC[1] * 700];
const SCREEN_X = 1600;
/** 每个波长的整条光路：光源 → 入射点 → 出射点 → 屏幕。 */
const RAYS = LAM.map(l => {
  const n = nGlass(l), t1 = refract(INC, N_LEFT, 1, n), exit = hitLine(ENTRY, t1, PA, PC);
  const t2 = refract(t1, N_RIGHT_IN, n, 1);
  const k = (SCREEN_X - exit[0]) / t2[0], hit: V2 = [SCREEN_X, exit[1] + t2[1] * k];
  return {l, pts: [SOURCE, ENTRY, exit, hit] as V2[]};
});
const segLen = (pts: V2[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
function partial(pts: V2[], d: number): V2[] {
  const lens = segLen(pts), out: V2[] = [pts[0]];
  for (let i = 0; i < lens.length; i++) {
    if (d >= lens[i]) {out.push(pts[i + 1]); d -= lens[i]; continue;}
    const k = Math.max(0, d) / lens[i]; out.push([mix(pts[i][0], pts[i + 1][0], k), mix(pts[i][1], pts[i + 1][1], k)]); break;
  }
  return out;
}
const BAR = {x: 360, y: 790, w: 1200, h: 26};
const NAME_AT = [410, 460, 490, 530, 575, 605, 660];

function Prism(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const s0 = start(0, .1), rainbow = at(txt(props, 'rainbowCue'), s0 + 2.2), s1 = start(1, rainbow + .6);
  const violet = at(txt(props, 'violetCue'), s1 + 2.6), red = at(txt(props, 'redCue'), violet + 1.4);
  // 光前沿：先到棱镜，“彩虹”时铺满屏幕
  const total = segLen(RAYS[17].pts).reduce((a, b) => a + b, 0), toEntry = segLen(RAYS[17].pts)[0];
  const front = t < rainbow - .2 ? mix(0, toEntry + 120, out3((t - s0 + .2) / Math.max(.6, rainbow - .2 - s0 + .2))) : mix(toEntry + 120, total, out3((t - rainbow + .2) / .9));
  const morph = easeInOut(clamp((t - s1) / 1.4)), rays = 1 - .65 * morph;
  const names = list(props, 'colorNames'), latinNames = !/[㐀-鿿]/.test(names.join('')); // 西文色名较长：隔一个抬高一行，避免相邻挤叠
  const ref = useCanvas(props.frame, ctx => {
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    // 入射白光（各波长叠加即白）：画成一束白
    const inc = partial(RAYS[0].pts, Math.min(front, toEntry));
    ctx.globalAlpha = rays;
    for (const w of [26, 12, 5]) {ctx.strokeStyle = `rgba(255,255,255,${w === 5 ? .95 : .12})`; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(inc[0][0], inc[0][1]); ctx.lineTo(inc[1][0], inc[1][1]); ctx.stroke();}
    if (front > toEntry) for (const ray of RAYS) {
      const p = partial(ray.pts, front).slice(1);
      ctx.strokeStyle = waveCss(ray.l, .32); ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (const q of p.slice(1)) ctx.lineTo(q[0], q[1]); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 屏幕上的光谱 → 变形成下方的横条
    if (front >= total - 1) for (let i = 0; i < RAYS.length - 1; i++) {
      const a = RAYS[i], b = RAYS[i + 1];
      const ax = mix(SCREEN_X, nmX(a.l, BAR.x, BAR.w), morph), ay = mix(a.pts[3][1], BAR.y + BAR.h / 2, morph);
      const bx = mix(SCREEN_X, nmX(b.l, BAR.x, BAR.w), morph), by = mix(b.pts[3][1], BAR.y + BAR.h / 2, morph);
      ctx.strokeStyle = waveCss(a.l, .9); ctx.lineWidth = mix(14, BAR.h, morph); ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx + (bx - ax) * .1, by + (by - ay) * .1); ctx.stroke();
    }
  });
  const flag = (l: number, k: number, label: string) => k > 0 && <g opacity={k} transform={`translate(${nmX(l, BAR.x, BAR.w)} 0)`}>
    <line x1={0} x2={0} y1={BAR.y - 70} y2={BAR.y + BAR.h + 8} stroke={waveCss(l)} strokeWidth={3} />
    <rect x={-92} y={BAR.y - 128} width={184} height={54} rx={27} fill="rgba(5,7,13,.85)" stroke={waveCss(l)} strokeWidth={2} />
    <Mono x={0} y={BAR.y - 92} size={30} anchor="middle" color={TEXT} weight={700}>{label}</Mono>
  </g>;
  const vk = out3((t - violet + .1) / .4), rk = out3((t - red + .1) / .4);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .3, .15)}}>
    <Grid opacity={.6} />
    <Svg>
      <defs><linearGradient id="glass" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="rgba(190,215,255,.16)" /><stop offset="1" stopColor="rgba(120,150,210,.05)" /></linearGradient></defs>
      <g opacity={1 - .45 * morph}>
        <polygon points={`${PA.join(',')} ${PB.join(',')} ${PC.join(',')}`} fill="url(#glass)" stroke="rgba(210,228,255,.7)" strokeWidth={2.5} />
        <Label fonts={props.fonts} x={700} y={548} size={24} anchor="middle" color={MUTED} weight={500}>{txt(props, 'prismLabel')}</Label>
        <line x1={SCREEN_X} x2={SCREEN_X} y1={520} y2={790} stroke="rgba(238,243,255,.25)" strokeWidth={2} strokeDasharray="6 8" />
        <Label fonts={props.fonts} x={170} y={SOURCE[1] + (170 - SOURCE[0]) * INC[1] / INC[0] - 40} size={30} color={TEXT} opacity={sm((t - s0) / .5)}>{txt(props, 'whiteLabel')}</Label>
      </g>
    </Svg>
    <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    <Svg>
      <g opacity={morph}>
        {[400, 450, 500, 550, 600, 650, 700].map(l => <g key={l}>
          <line x1={nmX(l, BAR.x, BAR.w)} x2={nmX(l, BAR.x, BAR.w)} y1={BAR.y + BAR.h + 6} y2={BAR.y + BAR.h + 20} stroke="rgba(238,243,255,.6)" strokeWidth={2} />
          <Mono x={nmX(l, BAR.x, BAR.w)} y={BAR.y + BAR.h + 50} size={22} anchor="middle">{l}</Mono>
        </g>)}
        <Mono x={BAR.x + BAR.w + 30} y={BAR.y + BAR.h + 50} size={22}>nm</Mono>
        {NAME_AT.map((l, i) => <Label key={i} fonts={props.fonts} x={nmX(l, BAR.x, BAR.w)} y={BAR.y - 18 - (latinNames && i % 2 ? 34 : 0)} size={latinNames ? 24 : 28} anchor="middle" color={waveCss(l)}
          opacity={sm((t - s1 - .6 - i * .08) / .3) * (1 - .6 * Math.max(vk, rk) * (l === 410 || l === 660 ? 0 : 1))}>{names[i] ?? ''}</Label>)}
      </g>
      {flag(400, vk, '≈400 nm')}
      {flag(700, rk, '≈700 nm')}
    </Svg>
  </div>;
}

// ---------------------------------------------------------------- 分子与瑞利散射
const MOL: V2 = [1400, 420];
type Hit = {t0: number; lam: number; y: number; scat: boolean; a: number};
const HITS: Hit[] = (() => {
  const r = seeded(29), out: Hit[] = [];
  for (let n = 0; n < 700; n++) {
    const lam = sampleLam(r(), r());
    out.push({t0: n / 80, lam, y: (r() - .5) * 26, scat: r() < .8 * (400 / lam) ** 4, a: rayleighAngle(r)});
  }
  return out;
})();

function Scatter(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const s0 = start(0, .1), ratio = at(txt(props, 'ratioCue'), s0 + 1.6), s1 = start(1, ratio + 1.2);
  const bounce = at(txt(props, 'bounceCue'), s1 + 1.3), name = at(txt(props, 'nameCue'), bounce + 1.2);
  const focus = sm((t - s1 + .2) / .6);
  const flowFrom = s1 - .9;
  const ref = useCanvas(props.frame, ctx => {
    // 左：一个蓝光波长（450 nm = 720 px）
    const ph = t * 2.2;
    ctx.globalAlpha = 1 - .55 * focus;
    ctx.strokeStyle = waveCss(450); ctx.lineWidth = 4; ctx.beginPath();
    for (let x = 0; x <= 760; x += 4) {const y = 420 + 80 * Math.sin((x / 720) * Math.PI * 2 - ph); x === 0 ? ctx.moveTo(140 + x, y) : ctx.lineTo(140 + x, y);}
    ctx.stroke(); ctx.globalAlpha = 1;
    // 右：光子撞上分子
    if (t > flowFrom) {
      ctx.lineCap = 'round';
      for (const h of HITS) {
        const age = t - flowFrom - h.t0;
        if (age < 0) break;
        const x0 = 980, v = 520, reach = (MOL[0] - x0) / v;
        let x: number, y: number, tx: number, ty: number;
        if (age < reach || !h.scat) {x = x0 + v * age; y = MOL[1] + h.y; tx = x - 30; ty = y;}
        else {const d = v * (age - reach); x = MOL[0] + Math.cos(h.a) * d; y = MOL[1] + Math.sin(h.a) * d; tx = MOL[0] + Math.cos(h.a) * Math.max(0, d - 30); ty = MOL[1] + Math.sin(h.a) * Math.max(0, d - 30);}
        if (x > W + 40 || x < 900 || y < 60 || y > 900) continue;
        ctx.strokeStyle = waveCss(h.lam, .9); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      }
    }
  });
  const rk = out3((t - ratio + .1) / .5), pk = out3((t - bounce + .1) / .6), nk = out3((t - name + .1) / .45);
  // 1 + cos²θ 极坐标图
  const pattern = Array.from({length: 73}, (_, i) => {const a = i / 72 * Math.PI * 2, r = 120 * (1 + Math.cos(a) ** 2) / 2 * pk; return `${MOL[0] + Math.cos(a) * r},${MOL[1] + Math.sin(a) * r}`;}).join(' ');
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .15, .15)}}>
    <Grid opacity={.6} />
    <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    <Svg>
      <g opacity={1 - .55 * focus}>
        <Label fonts={props.fonts} x={140} y={250} size={30} color={TEXT}>{txt(props, 'waveLabel')}</Label>
        <line x1={140} x2={860} y1={290} y2={290} stroke="rgba(238,243,255,.5)" strokeWidth={2} />
        <line x1={140} x2={140} y1={280} y2={300} stroke="rgba(238,243,255,.5)" strokeWidth={2} /><line x1={860} x2={860} y1={280} y2={300} stroke="rgba(238,243,255,.5)" strokeWidth={2} />
        {/* 0.3 nm 的分子按同一比例只有 0.5 像素：画一个点，再用放大镜放大 300 倍 */}
        <circle cx={500} cy={420} r={1.2} fill={TEXT} />
        <circle cx={500} cy={420} r={22} fill="none" stroke="rgba(238,243,255,.7)" strokeWidth={2} />
        <line x1={515} y1={437} x2={600} y2={560} stroke="rgba(238,243,255,.5)" strokeWidth={2} />
        <circle cx={660} cy={650} r={110} fill="rgba(10,16,30,.85)" stroke="rgba(238,243,255,.7)" strokeWidth={2.5} />
        <g transform={`translate(660 650) rotate(${-20 + 8 * Math.sin(t * 1.5)})`}>
          <circle cx={-34} cy={0} r={42} fill="#7d93c9" /><circle cx={34} cy={0} r={42} fill="#8fa6dc" />
          <circle cx={-46} cy={-14} r={12} fill="rgba(255,255,255,.35)" /><circle cx={22} cy={-14} r={12} fill="rgba(255,255,255,.35)" />
        </g>
        <Label fonts={props.fonts} x={790} y={660} size={26} color={TEXT} weight={500}>{txt(props, 'moleculeLabel')}</Label>
        <g opacity={rk} transform={`translate(140 860) scale(${.9 + .1 * rk})`}>
          <Label fonts={props.fonts} x={0} y={0} size={44} color={WARM} weight={800}>{txt(props, 'ratioText')}</Label>
        </g>
      </g>
      <g opacity={.25 + .75 * focus}>
        <circle cx={MOL[0]} cy={MOL[1]} r={16} fill="#9fb4e6" style={{filter: 'drop-shadow(0 0 14px rgba(160,190,255,.9))'}} />
        <polyline points={pattern} fill="rgba(140,180,255,.08)" stroke="rgba(190,210,255,.8)" strokeWidth={2.5} opacity={pk} />
        <Label fonts={props.fonts} x={MOL[0] + 150} y={MOL[1] - 150} size={26} color={TEXT} opacity={pk} weight={500}>{txt(props, 'patternLabel')}</Label>
      </g>
      <g opacity={nk} transform={`translate(1400 800) scale(${.85 + .15 * nk})`}>
        <Label fonts={props.fonts} x={0} y={0} size={76} anchor="middle" color={TEXT} weight={800} spacing={8}>{txt(props, 'scatterName')}</Label>
      </g>
    </Svg>
  </div>;
}

// ---------------------------------------------------------------- 1/λ⁴
const PLOT = {x: 150, y: 880, w: 860, h: 330, max: 8};
const pX = (l: number) => nmX(l, PLOT.x, PLOT.w);
const pY = (v: number) => PLOT.y - Math.min(v, PLOT.max) / PLOT.max * PLOT.h;
const rel = (l: number) => (700 / l) ** 4;

function Formula(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const s0 = start(0, .1), marks = list(props, 'termCues'), terms = list(props, 'terms');
  const cI = at(marks[0] ?? '', s0 + .3), cL = at(marks[1] ?? '', cI + .6), c4 = at(marks[2] ?? '', cL + .5), cP = at(marks[3] ?? '', c4 + .6);
  const s1 = start(1, cP + 1), cb = at(txt(props, 'blueCue'), s1 + .2), cr = at(txt(props, 'redCue2'), cb + 1.2);
  const cs = at(txt(props, 'stepCue'), cr + 1.2), cx = at(txt(props, 'resultCue'), cs + 2);
  const pop = (c: number) => out3((t - c + .05) / .35);
  const kI = pop(cI), kL = pop(cL), k4 = pop(c4), kP = pop(cP);
  const curve = easeInOut(clamp((t - c4) / 1.4));
  const kb = pop(cb), kr = pop(cr), kx = pop(cx);
  const steps = [0, 1, 2].map(i => out3((t - cs - i * .45) / .4));
  const strips = [];
  for (let l = 380; l <= 720; l += 4) if ((l - 380) / 340 <= curve) strips.push(<rect key={l} x={pX(l)} y={pY(rel(l))} width={PLOT.w / 85 + .6} height={PLOT.y - pY(rel(l))} fill={waveCss(l, .75)} />);
  const line = Array.from({length: 171}, (_, i) => 380 + i * 2).filter(l => (l - 380) / 340 <= curve).map(l => `${pX(l)},${pY(rel(l))}`).join(' ');
  const blue = waveCss(450), redc = waveCss(700);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .15, .2)}}>
    <Grid opacity={.6} />
    <Svg>
      {/* I ∝ 1/λ⁴ */}
      <g transform="translate(960 250)" style={{filter: 'drop-shadow(0 0 22px rgba(140,180,255,.45))'}}>
        <g opacity={kI} transform={`translate(-250 0) scale(${.7 + .3 * kI})`}><MathText x={0} y={40} size={150} anchor="middle">I</MathText></g>
        <g opacity={kP}><MathText x={-110} y={36} size={120} anchor="middle" italic={false}>∝</MathText>
          <MathText x={70} y={-40} size={110} anchor="middle" italic={false}>1</MathText>
          <rect x={-10} y={-4} width={190} height={7} rx={3} fill={TEXT} /></g>
        <g opacity={kL} transform={`translate(55 110) scale(${.7 + .3 * kL})`}><MathText x={0} y={0} size={120} anchor="middle">λ</MathText></g>
        <g opacity={k4} transform={`translate(112 50) scale(${.4 + .6 * k4})`}><MathText x={0} y={0} size={72} italic={false} color={WARM}>4</MathText></g>
      </g>
      <Label fonts={props.fonts} x={710} y={340} size={26} anchor="middle" color={MUTED} opacity={kI}>{terms[0] ?? ''}</Label>
      <Label fonts={props.fonts} x={1015} y={410} size={26} anchor="middle" color={MUTED} opacity={kL}>{terms[1] ?? ''}</Label>
      <Label fonts={props.fonts} x={1150} y={250} size={26} color={WARM} opacity={k4}>{terms[2] ?? ''}</Label>
      {/* 强度曲线（以 700 nm 为 1） */}
      <g opacity={sm((t - c4 + .2) / .4)}>
        <Label fonts={props.fonts} x={PLOT.x} y={PLOT.y - PLOT.h - 26} size={26} color={TEXT} weight={500}>{txt(props, 'curveLabel')}</Label>
        <line x1={PLOT.x} x2={PLOT.x + PLOT.w} y1={PLOT.y} y2={PLOT.y} stroke="rgba(238,243,255,.5)" strokeWidth={2} />
        {[400, 500, 600, 700].map(l => <Mono key={l} x={pX(l)} y={PLOT.y + 34} size={22} anchor="middle">{l} nm</Mono>)}
        {strips}
        <polyline points={line} fill="none" stroke={TEXT} strokeWidth={3} />
        <g opacity={kb}><line x1={pX(450)} x2={pX(450)} y1={PLOT.y} y2={pY(rel(450)) - 10} stroke={TEXT} strokeWidth={2} strokeDasharray="5 6" />
          <circle cx={pX(450)} cy={pY(rel(450))} r={9} fill={blue} stroke={TEXT} strokeWidth={2} />
          <Label fonts={props.fonts} x={pX(450) + 18} y={pY(rel(450)) - 14} size={28} color={TEXT} weight={700}>{txt(props, 'blueName')} 450 nm</Label></g>
        <g opacity={kr}><circle cx={pX(700)} cy={pY(1)} r={9} fill={redc} stroke={TEXT} strokeWidth={2} />
          <Label fonts={props.fonts} x={pX(700)} y={pY(1) - 22} size={28} anchor="middle" color={TEXT} weight={700}>{txt(props, 'redName')} 700 nm</Label></g>
      </g>
      {/* 代入 */}
      <g transform="translate(1180 560)">
        <g opacity={steps[0]}><MathText x={0} y={0} size={54}>I</MathText><Mono x={26} y={10} size={22} color={blue}>450</Mono>
          <MathText x={90} y={0} size={54} italic={false}>/</MathText><MathText x={118} y={0} size={54}>I</MathText><Mono x={144} y={10} size={22} color={redc}>700</Mono>
          <MathText x={212} y={0} size={54} italic={false}>= (700 ÷ 450)<tspan dy={-24} fontSize={32}>4</tspan></MathText></g>
        <g opacity={steps[1]}><MathText x={212} y={84} size={54} italic={false}>= 1.556<tspan dy={-24} fontSize={32}>4</tspan></MathText></g>
        <g opacity={steps[2] * (1 - kx) + kx}><MathText x={212} y={184} size={kx > 0 ? 54 + 34 * kx : 54} italic={false} color={kx > 0 ? blue : TEXT}>≈ 5.86</MathText></g>
      </g>
      {/* 5.86 个蓝方块 对 1 个红方块 */}
      <g transform="translate(1180 820)" opacity={kx}>
        {Array.from({length: 6}, (_, i) => {const f = clamp(5.86 - i); return <g key={i}><rect x={i * 64} y={-50} width={56} height={56} fill="none" stroke={blue} strokeWidth={2} />
          <rect x={i * 64} y={-50} width={56 * f * out3((t - cx - i * .08) / .3)} height={56} fill={blue} /></g>;})}
        <rect x={6 * 64 + 40} y={-50} width={56} height={56} fill={redc} />
        <Mono x={0} y={44} size={22} color={MUTED}>{txt(props, 'blueName')} 5.86</Mono>
        <Mono x={6 * 64 + 40} y={44} size={22} color={MUTED}>{txt(props, 'redName')} 1</Mono>
      </g>
    </Svg>
  </div>;
}

export default function SkyLight(props: SceneInput) {
  const part = props.params.part;
  return part === 'scatter' ? <Scatter {...props} /> : part === 'formula' ? <Formula {...props} /> : <Prism {...props} />;
}
