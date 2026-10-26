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

// 开场、片名与收尾：part=hook 实时日落（太阳 62°→0°，天空按模型逐帧算）；part=title 片名（两行字的颜色由模型算出）；
// part=recap 四格回顾（正午、日落、白云、火星）加“每一种颜色都是算出来的”收束卡。
export const meta = {
  params: {
    part: '用法：hook 开场日落 / title 片名 / recap 四格回顾（改画面请改代码）',
    hud: {label: '左上角说明', type: 'text', default: '实时计算 · 单次散射天空模型', maxLength: 48, help: '开场画面左上角的小字'},
    elevLabel: {label: '太阳高度读数', type: 'text', default: '太阳高度', maxLength: 20, help: '开场左下角读数的名称'},
    pathLabel: {label: '光程读数', type: 'text', default: '大气光程', maxLength: 12, help: '开场左下角第二个读数的名称'},
    duskCue: {label: '日落卡点词', type: 'text', default: '傍晚', maxLength: 16, help: '念到这个词时太阳开始下落'},
    redCue: {label: '落定卡点词', type: 'text', default: '橙红', maxLength: 16, help: '念到这个词时太阳落到地平线'},
    title1: {label: '片名第一行', type: 'text', default: '为什么天空是蓝的', maxLength: 28, help: '颜色取模型算出的正午天色'},
    title2: {label: '片名第二行', type: 'text', default: '夕阳是红的', maxLength: 28, help: '颜色取模型算出的落日日面色'},
    subtitle: {label: '片名副标题', type: 'text', default: '一道关于 1/λ⁴ 的物理题 · 画面全部由代码实时计算', maxLength: 72, help: '片名下方的小字'},
    panels: {label: '四格标题', type: 'list', min: 4, max: 4, maxLength: 16, default: ['地球 · 正午', '地球 · 日落', '白云', '火星 · 日落'], help: '依次是正午、日落、白云、火星四格的标题'},
    panelCues: {label: '四格卡点词', type: 'list', min: 4, max: 4, maxLength: 16, default: ['蓝天', '红日', '白云', '火星'], help: '念到这些词时对应的一格亮起'},
    closing: {label: '收束大字', type: 'text', default: '每一种颜色，都是算出来的', maxLength: 40, help: '第二句旁白开始时出现在画面中央'},
    equations: {label: '收束小字', type: 'text', default: 'CIE 1931 色匹配 · 5778 K 黑体 · τ ∝ λ⁻⁴ · Kasten–Young 光程 · 米氏衍射峰', maxLength: 120, help: '收束卡下方列出用到的模型'},
  },
};

const NOON_DIR = (() => {const e = 40 * Math.PI / 180, a = 70 * Math.PI / 180; return [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)];})();
/** 正午天色（只取色相）与落日日面色：片名两行字的颜色。 */
const NOON = hue(skyRadiance(NOON_DIR, sunDir(60), {elev: 60}));
const DUSK = sunDisk(.3).rgb;

function Hook(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const s0 = start(0, .1), dusk = at(txt(props, 'duskCue'), s0 + 1.6), red = Math.max(dusk + 1.2, at(txt(props, 'redCue'), dusk + 1.9) + .5);
  const k = easeInOut(clamp((t - dusk + .15) / (red - dusk + .15)));
  const elev = mix(62 - t * .6, .4, k), pitch = mix(20, 4, k), horizon = mix(.92, .83, k);
  const o: SkyOptions = {elev, pitch, horizon, hfov: 90, sunX: mix(.3, .08, k)};
  const s1 = start(1, red + .3), formula = sm((t - s1 + .1) / .7);
  const am = airmass(Math.sin(elev * Math.PI / 180));
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .12, .08)}}>
    <SkyCanvas frame={props.frame} o={o} sunSize={24} sea />
    <Vignette k={.35 + .25 * formula} />
    <div style={{position: 'absolute', inset: 0, background: `rgba(3,5,10,${.45 * formula})`}} />
    <Svg>
      <g opacity={1 - .7 * formula}>
        <Label fonts={props.fonts} x={96} y={110} size={26} color="rgba(238,243,255,.82)" weight={500}>{txt(props, 'hud')}</Label>
        <line x1={96} x2={96 + 330} y1={128} y2={128} stroke="rgba(238,243,255,.35)" strokeWidth={1.5} />
        <Label fonts={props.fonts} x={96} y={808} size={26} color="rgba(238,243,255,.8)" weight={500}>{txt(props, 'elevLabel')}</Label>
        <Mono x={96} y={862} size={52} color={TEXT} weight={600}>{elev.toFixed(1)}°</Mono>
        <Label fonts={props.fonts} x={420} y={808} size={26} color="rgba(238,243,255,.8)" weight={500}>{txt(props, 'pathLabel')}</Label>
        <Mono x={420} y={862} size={52} color={k > .5 ? WARM : TEXT} weight={600}>×{am.toFixed(1)}</Mono>
      </g>
      <g opacity={formula} transform={`translate(960 470) scale(${.92 + .08 * out3((t - s1) / .8)})`} style={{filter: 'drop-shadow(0 0 28px rgba(140,180,255,.55))'}}>
        <MathText x={0} y={-30} size={150} anchor="middle" italic={false}>1</MathText>
        <rect x={-130} y={0} width={260} height={8} rx={4} fill={TEXT} />
        <MathText x={-12} y={150} size={150} anchor="middle">λ</MathText>
        <MathText x={58} y={78} size={78} italic={false}>4</MathText>
      </g>
    </Svg>
  </div>;
}

function Title(props: SceneInput) {
  const {t, dur} = cues(props);
  const line = out3(t / 1.1), a = sm((t - .25) / .5), b = sm((t - .85) / .5), c = sm((t - 1.4) / .6);
  const r = seeded(3), dust = Array.from({length: 90}, () => [r() * W, r() * H, r(), 380 + r() * 340]);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .35)}}>
    <Grid opacity={.5} />
    <Svg>
      {dust.map(([x, y, s, l], i) => <circle key={i} cx={(x + t * (30 + 50 * s)) % W} cy={y - t * 12 * s} r={1.2 + 2 * s} fill={waveCss(l, .35 + .4 * s)} />)}
      <SpectrumBar id="tl" x={360} y={640} w={1200} h={6} p={line} />
    </Svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: props.fonts.text, fontWeight: 800, letterSpacing: 8}}>
      <div style={{fontSize: 108, color: css(NOON), textShadow: `0 0 40px ${css(NOON, .55)}`}}><Reveal text={txt(props, 'title1')} p={a} /></div>
      <div style={{fontSize: 108, marginTop: 16, color: css(DUSK), textShadow: `0 0 40px ${css(DUSK, .55)}`}}><Reveal text={txt(props, 'title2')} p={b} /></div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: props.fonts.text, fontSize: 30, letterSpacing: 4, color: MUTED, opacity: c}}>{txt(props, 'subtitle')}</div>
  </div>;
}

const PANELS = [
  {o: {elev: 58, pitch: 16, horizon: .9, hfov: 80, sunX: .2} as SkyOptions},
  {o: {elev: .4, pitch: 3, horizon: .84, hfov: 80, sunX: 0} as SkyOptions},
  {o: {elev: 50, pitch: 12, horizon: .92, hfov: 80, sunX: -.3} as SkyOptions, cloud: true},
  {o: {elev: 2.4, pitch: 4, horizon: .86, hfov: 60, sunX: 0, planet: 'mars'} as SkyOptions},
];
const RECTS = [{x: 120, y: 96, w: 820, h: 380}, {x: 980, y: 96, w: 820, h: 380}, {x: 120, y: 516, w: 820, h: 380}, {x: 980, y: 516, w: 820, h: 380}];
/** 每格一个由模型算出的“代表色”：正午天色、落日日面、云顶受光、火星日落的日旁蓝光。 */
const KEY_COLORS = [hue(skyRadiance(NOON_DIR, sunDir(58, .2, 80), {elev: 58})), sunDisk(.4).rgb, sunDisk(50).rgb,
  hue(skyRadiance(sunDir(4.4, 0, 60), sunDir(2.4, 0, 60), {elev: 2.4, planet: 'mars'}))];

function Recap(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const s0 = start(0, .1), s1 = start(1, s0 + 5.5), names = list(props, 'panels'), marks = list(props, 'panelCues');
  const on = [0, 1, 2, 3].map(i => sm((t - at(marks[i] ?? '', s0 + .3 + i * 1.1) + .15) / .45));
  const close = sm((t - s1 + .1) / .8);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .6)}}>
    <Grid opacity={.35} />
    {PANELS.map((panel, i) => {
      const r = RECTS[i], light = on[i];
      return <div key={i} style={{position: 'absolute', inset: 0, opacity: (.12 + .88 * light) * (1 - .72 * close)}}>
        <SkyCanvas frame={props.frame} o={{...panel.o, elev: panel.o.elev + (panel.o.planet ? 0 : .3 * Math.sin(t * .4 + i))}} rect={r} sunSize={14} sea={i === 1}
          after={panel.cloud ? ctx => {
            const lit = sunDisk(50).rgb, shade = tone(skyRadiance([0, .5, .87], sunDir(50, -.3, 80), {elev: 50}), 1.3);
            drawCloud(ctx, r.x + r.w * .62 + t * 6, r.y + r.h * .55, 120, 11, lit, shade.map(v => v * .9 + .08));
            drawCloud(ctx, r.x + r.w * .24 + t * 4, r.y + r.h * .34, 70, 5, lit, shade.map(v => v * .9 + .08), .95);
          } : undefined} />
      </div>;
    })}
    <Svg>
      {RECTS.map((r, i) => <g key={i} opacity={on[i] * (1 - .8 * close)}>
        <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke="rgba(238,243,255,.5)" strokeWidth={2} />
        <rect x={r.x + 18} y={r.y + 18} width={36} height={36} fill={css(KEY_COLORS[i])} stroke="rgba(255,255,255,.7)" strokeWidth={1.5} />
        <Label fonts={props.fonts} x={r.x + 70} y={r.y + 48} size={30} color={TEXT} weight={700}>{names[i] ?? ''}</Label>
        <Mono x={r.x + r.w - 20} y={r.y + 46} size={22} anchor="end" color="rgba(238,243,255,.85)">{hex(KEY_COLORS[i])}</Mono>
      </g>)}
    </Svg>
    <div style={{position: 'absolute', left: 0, right: 0, top: 370, height: 260, opacity: close, background: 'linear-gradient(180deg, rgba(5,7,13,0), rgba(5,7,13,.82) 22%, rgba(5,7,13,.82) 78%, rgba(5,7,13,0))'}} />
    <div style={{position: 'absolute', inset: 0, opacity: close, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 120}}>
      <div style={{fontFamily: props.fonts.text, fontSize: 84, fontWeight: 800, letterSpacing: 6, color: TEXT, textShadow: '0 6px 40px rgba(0,0,0,.9)'}}>
        <Reveal text={txt(props, 'closing')} p={sm((t - s1) / 1.4)} /></div>
      <div style={{marginTop: 26, fontFamily: MONO, fontSize: 24, color: 'rgba(238,243,255,.78)', letterSpacing: 1, textShadow: '0 2px 12px rgba(0,0,0,.9)', opacity: sm((t - s1 - .9) / .8)}}>{txt(props, 'equations')}</div>
    </div>
  </div>;
}

export default function SkyOpen(props: SceneInput) {
  const part = props.params.part;
  return part === 'title' ? <Title {...props} /> : part === 'recap' ? <Recap {...props} /> : <Hook {...props} />;
}
