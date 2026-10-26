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

// 光子统计：part=sky 阳光光子穿过大气，按 1/λ⁴ 的自由程被弹开，被弹开的光子按波长计数、实时“染”出天色，再切到整片模型天空；
// part=violet 为什么不是紫色（1/λ⁴、太阳光谱、臭氧截掉紫外、人眼色匹配函数，最后积分出天蓝色）；
// part=cloud 云为什么是白的（分子 vs 云滴两路光子对比，范德胡斯特近似算出的散射效率几乎不随波长变）。
export const meta = {
  params: {
    part: '用法：sky 染蓝天空 / violet 为什么不是紫色 / cloud 云为什么是白（改画面请改代码）',
    histTitle: {label: '计数标题', type: 'text', default: '被弹开的光子 · 按波长计数', maxLength: 48, help: '右上角直方图标题'},
    histModel: {label: '理论线说明', type: 'text', default: '虚线：太阳光谱 × 1/λ⁴ 的预期', maxLength: 56, help: '直方图下方小字'},
    lookCue: {label: '抬头卡点词', type: 'text', default: '不管', maxLength: 16, help: '念到时画出观察者的视线'},
    dyeCue: {label: '染蓝卡点词', type: 'text', default: '染蓝', maxLength: 16, help: '念到时整片天空换成模型天空'},
    sunLabel: {label: '太阳标签', type: 'text', default: '阳光', maxLength: 10, help: '左侧光源旁的标签'},
    airLabel: {label: '大气标签', type: 'text', default: '大气层（光学厚度放大示意）', maxLength: 48, help: '大气带左上角的说明'},
    curveNames: {label: '曲线名称', type: 'list', min: 4, max: 4, maxLength: 48, default: ['只看 1/λ⁴：紫光最多', '阳光光谱（5778 K 近似）', '实际散射光 = 阳光 × 1/λ⁴', '人眼三种视锥（CIE 1931）'],
      help: '依次是四条曲线的名称'},
    whyCue: {label: '提问卡点词', type: 'text', default: '紫的', maxLength: 16, help: '念到时紫色色块旁出现问号'},
    lessCue: {label: '紫光少卡点词', type: 'text', default: '本来就少', maxLength: 16, help: '念到时标出阳光光谱紫端'},
    uvCue: {label: '紫外卡点词', type: 'text', default: '紫外线', maxLength: 16, help: '念到时臭氧层截掉紫外'},
    eyeCue: {label: '人眼卡点词', type: 'text', default: '不敏感', maxLength: 16, help: '念到时画出人眼色匹配曲线'},
    mixCue: {label: '混合卡点词', type: 'text', default: '混在一起', maxLength: 16, help: '念到时积分出天空颜色'},
    uvLabel: {label: '紫外标签', type: 'text', default: '紫外 · 被臭氧层吸收', maxLength: 28, help: '图左侧紫外区的标签'},
    violetSwatch: {label: '纯紫色块名', type: 'text', default: '纯紫 400 nm', maxLength: 24, help: '右侧对比色块'},
    skySwatch: {label: '天蓝色块名', type: 'text', default: '散射光积分 = 天蓝', maxLength: 32, help: '右侧算出的颜色'},
    panelNames: {label: '对比两栏标题', type: 'list', min: 2, max: 2, maxLength: 40, default: ['空气分子 ≈ 0.3 nm · 瑞利散射', '云滴 ≈ 10–20 μm · 米氏散射'], help: '左右两栏的标题'},
    qNames: {label: '散射效率说明', type: 'list', min: 2, max: 2, maxLength: 48, default: ['散射效率 ∝ 1/λ⁴', '散射效率 ≈ 2，几乎不随波长变'], help: '两栏下方曲线的说明'},
    mieCue: {label: '米氏卡点词', type: 'text', default: '米氏散射', maxLength: 16, help: '念到时右栏亮起'},
    whiteCue: {label: '变白卡点词', type: 'text', default: '混成了白', maxLength: 16, help: '念到时两栏色块定格'},
    mixLabel: {label: '色块说明', type: 'text', default: '弹回来的光', maxLength: 24, help: '两栏色块上方的小字'},
  },
};

// ---------------------------------------------------------------- 染蓝天空
const SLAB = {x0: 0, x1: W, y0: 170, y1: 720};
const SPEED = 950, PRE = 1.6;
/** 自由程：450 nm 约 2400 像素（横穿画面的光学厚度≈0.8，约为真实整层大气的 3.6 倍，便于看清），按 λ⁴ 变长。 */
const MFP = (l: number) => 2400 * (l / 450) ** 4;
const SKY_PHOTONS = photons('sky', {seed: 7, count: 1800, rate: 110, box: SLAB, enter: r => [0, SLAB.y0 + 10 + r() * (SLAB.y1 - SLAB.y0 - 20)], dir: [1, 0], mfp: MFP, maxEvents: 9});
const BINS = Array.from({length: 17}, (_, i) => 380 + i * 20 + 10);
const binOf = (l: number) => Math.min(16, Math.max(0, Math.floor((l - 380) / 20)));
/** 预期：每个波长被弹开的比例 1 − e^{−宽度/自由程}，乘以太阳光谱。 */
const EXPECT = BINS.map(l => planck(l) / SUN_MAX * (1 - Math.exp(-W / MFP(l))));
const MOTES = (() => {const r = seeded(13); return Array.from({length: 260}, () => [r() * W, SLAB.y0 + r() * (SLAB.y1 - SLAB.y0), r()]);})();

function SkyDye(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const s0 = start(0, .1), s1 = start(1, s0 + 4), look = at(txt(props, 'lookCue'), s1), dye = at(txt(props, 'dyeCue'), s1 + 3);
  const T = t + PRE, hist = new Array(17).fill(0), spec = new Array(LAM.length).fill(0);
  let n = 0;
  for (const p of SKY_PHOTONS) if (p.hit >= 0 && p.t0 + p.hit / SPEED <= T) {hist[binOf(p.lam)]++; spec[Math.min(34, Math.round((p.lam - 380) / 10))]++; n++;}
  const dyeColor = n ? hue(specRgb(spec)) : [0, 0, 0], depth = clamp(n / 380);
  const full = easeInOut(clamp((t - dye + .2) / 1.1));
  const hmax = Math.max(1, ...hist), emax = Math.max(...EXPECT);
  const lookK = sm((t - look + .1) / .5);
  const ref = useCanvas(props.frame, ctx => {
    ctx.fillStyle = css(dyeColor, .06 + .86 * depth); ctx.fillRect(0, SLAB.y0, W, SLAB.y1 - SLAB.y0);
    for (const [x, y, s] of MOTES) {ctx.fillStyle = `rgba(200,215,255,${.12 + .2 * s})`; ctx.fillRect((x + t * 8 * s) % W, y + Math.sin(t + x) * 3, 2, 2);}
    ctx.save(); ctx.beginPath(); ctx.rect(0, SLAB.y0 - 4, W, SLAB.y1 - SLAB.y0 + 8); ctx.clip();
    drawPhotons(ctx, SKY_PHOTONS, T, SPEED, {trail: 60, size: 3.4, alpha: .95, boost: true});
    ctx.restore();
    // 视线：从各个方向射向眼睛的“被弹来的光”（波长按已计数的分布抽）
    if (lookK > 0) {
      const r = seeded(91), eye: V2 = [960, SLAB.y1 - 70];
      for (let k = 0; k < 7; k++) {
        const a = (-160 + k * 23.3) * Math.PI / 180, far: V2 = [eye[0] + Math.cos(a) * 900, eye[1] + Math.sin(a) * 900];
        ctx.strokeStyle = `rgba(238,243,255,${.28 * lookK})`; ctx.lineWidth = 2; ctx.setLineDash([8, 10]);
        ctx.beginPath(); ctx.moveTo(eye[0], eye[1]); ctx.lineTo(far[0], far[1]); ctx.stroke(); ctx.setLineDash([]);
        for (let j = 0; j < 4; j++) {
          let u = r() * n, lam = 450;
          for (let b = 0; b < 17; b++) {u -= hist[b]; if (u <= 0) {lam = BINS[b]; break;}}
          const q = ((t - look) * .7 + j / 4 + r()) % 1, x = mix(far[0], eye[0], q), y = mix(far[1], eye[1], q);
          if (y < SLAB.y0) continue;
          ctx.strokeStyle = waveCss(lam, lookK); ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 26, y - Math.sin(a) * 26); ctx.lineTo(x, y); ctx.stroke();
        }
      }
    }
  });
  const sunGlow = 'radial-gradient(circle at 0px 445px, rgba(255,250,235,1) 0px, rgba(255,246,220,.9) 90px, rgba(255,240,210,.25) 180px, rgba(255,240,210,0) 340px)';
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .3)}}>
    <div style={{position: 'absolute', inset: 0, opacity: 1 - full}}>
      <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <div style={{position: 'absolute', inset: 0, background: sunGlow}} />
      <Svg>
        <line x1={0} x2={W} y1={SLAB.y0} y2={SLAB.y0} stroke="rgba(238,243,255,.3)" strokeWidth={2} strokeDasharray="4 8" />
        <rect x={0} y={SLAB.y1} width={W} height={H - SLAB.y1} fill="#070a10" />
        <line x1={0} x2={W} y1={SLAB.y1} y2={SLAB.y1} stroke="rgba(238,243,255,.45)" strokeWidth={2} />
        <Label fonts={props.fonts} x={120} y={SLAB.y0 - 24} size={26} color={MUTED} weight={500}>{txt(props, 'airLabel')}</Label>
        <Label fonts={props.fonts} x={40} y={445 + 180} size={30} color={TEXT}>{txt(props, 'sunLabel')}</Label>
        {/* 观察者 */}
        <g transform={`translate(960 ${SLAB.y1})`}>
          <circle cx={0} cy={-62} r={14} fill={TEXT} /><path d="M -16 -44 L 16 -44 L 12 0 L -12 0 Z" fill={TEXT} />
        </g>
        {/* 直方图 */}
        <g transform="translate(1390 196)">
          <rect x={-20} y={-6} width={470} height={250} rx={12} fill="rgba(5,7,13,.72)" stroke="rgba(238,243,255,.25)" />
          <Label fonts={props.fonts} x={0} y={30} size={24} color={TEXT} weight={600}>{txt(props, 'histTitle')}</Label>
          {hist.map((c, i) => <rect key={i} x={i * 25} y={200 - c / hmax * 140} width={21} height={c / hmax * 140} fill={waveCss(BINS[i])} />)}
          <polyline points={EXPECT.map((e, i) => `${i * 25 + 10.5},${200 - e / emax * 140}`).join(' ')} fill="none" stroke={TEXT} strokeWidth={2} strokeDasharray="5 5" opacity={sm(n / 300)} />
          <Mono x={0} y={228} size={18}>380</Mono><Mono x={420} y={228} size={18} anchor="end">720 nm</Mono>
          <Mono x={210} y={228} size={18} anchor="middle" color={TEXT}>N = {n}</Mono>
        </g>
        <Label fonts={props.fonts} x={1390} y={480} size={20} color={MUTED} weight={400}>{txt(props, 'histModel')}</Label>
      </Svg>
    </div>
    <div style={{position: 'absolute', inset: 0, opacity: full}}>
      {full > 0 && <SkyCanvas frame={props.frame} o={{elev: 60, pitch: 24, horizon: .97, hfov: 90, sunX: -.15}} hills />}
    </div>
  </div>;
}

// ---------------------------------------------------------------- 为什么不是紫色
const G = {x: 160, y: 820, w: 1180, h: 520, l0: 300, l1: 760};
const gX = (l: number) => G.x + (l - G.l0) / (G.l1 - G.l0) * G.w;
const gY = (v: number) => G.y - v * G.h;
const LS = Array.from({length: 116}, (_, i) => 300 + i * 4);
/** 臭氧对紫外的截止（示意：Hartley–Huggins 带，320 nm 以下几乎全吸收，320–380 逐渐放开）。 */
const ozoneCut = (l: number) => clamp((l - 300) / 80) ** 2;
const SUN_N = (() => {const m = Math.max(...LS.map(l => planck(l))); return (l: number) => planck(l) / m;})();
const PURE = (l: number) => (380 / l) ** 4;
const SCAT_RAW = (l: number) => SUN_N(l) * (450 / l) ** 4;
const SCAT_MAX = Math.max(...LS.filter(l => l >= 380).map(SCAT_RAW));
/** 实际散射光（可见光部分）积分出来的颜色，与“纯紫”对比。 */
const SKY_BLUE = hue(specRgb(LAM.map(l => SCAT_RAW(l))));
const VIOLET = waveRgb(400);
const curvePts = (f: (l: number) => number, p: number, from = 300) => LS.filter(l => l >= from && (l - from) / (G.l1 - from) <= p).map(l => `${gX(l)},${gY(clamp(f(l), 0, 1.08))}`).join(' ');

function Violet(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const names = list(props, 'curveNames');
  const s0 = start(0, .1), why = at(txt(props, 'whyCue'), s0 + 2), s1 = start(1, why + .8), less = at(txt(props, 'lessCue'), s1 + .8), uv = at(txt(props, 'uvCue'), less + 1.4);
  const s2 = start(2, uv + 2.2), eye = at(txt(props, 'eyeCue'), s2 + .8), mixc = at(txt(props, 'mixCue'), eye + 1.4);
  const kPure = easeInOut(clamp((t - s0) / 1.4)), kWhy = out3((t - why + .1) / .4);
  const kSun = easeInOut(clamp((t - s1 + .1) / 1.2)), kLess = sm((t - less + .1) / .5), kUv = easeInOut(clamp((t - uv + .1) / 1.1));
  const kScat = easeInOut(clamp((t - uv - .9) / 1.2)), kEye = easeInOut(clamp((t - eye + .1) / 1.1)), kMix = out3((t - mixc + .1) / .7);
  const sunCurve = (l: number) => SUN_N(l) * (l < 380 ? mix(1, ozoneCut(l), kUv) : 1);
  const CM = [0, 1, 2].map(i => (l: number) => cmf(l)[i] / 1.8);
  const cmColors = ['rgba(255,110,110,.9)', 'rgba(120,230,140,.9)', 'rgba(120,160,255,.95)'];
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .2)}}>
    <Grid opacity={.6} />
    <Svg>
      {/* 可见光底色带与紫外区 */}
      {LS.filter(l => l >= 380 && l < 760).map(l => <rect key={l} x={gX(l)} y={G.y + 8} width={G.w / 115 + .5} height={14} fill={waveCss(l)} />)}
      <rect x={gX(300)} y={G.y - G.h} width={gX(380) - gX(300)} height={G.h} fill="rgba(150,120,255,.07)" />
      <rect x={gX(300)} y={G.y - G.h} width={(gX(380) - gX(300)) * kUv} height={G.h} fill="rgba(5,7,13,.55)" />
      <rect x={gX(300)} y={G.y - G.h - 28} width={(gX(380) - gX(300)) * kUv} height={16} fill="rgba(170,190,255,.55)" />
      <Label fonts={props.fonts} x={gX(340)} y={G.y - G.h - 40} size={22} anchor="middle" color={TEXT} opacity={kUv}>{txt(props, 'uvLabel')}</Label>
      <line x1={G.x} x2={G.x + G.w} y1={G.y} y2={G.y} stroke="rgba(238,243,255,.5)" strokeWidth={2} />
      {[300, 380, 450, 550, 650, 750].map(l => <Mono key={l} x={gX(l)} y={G.y + 52} size={20} anchor="middle">{l}</Mono>)}
      <Mono x={G.x + G.w + 14} y={G.y + 52} size={20}>nm</Mono>
      {/* ① 只看 1/λ⁴ */}
      <g opacity={1 - .75 * kSun}>
        <polyline points={curvePts(PURE, kPure, 380)} fill="none" stroke="rgba(200,170,255,.95)" strokeWidth={4} />
        <Label fonts={props.fonts} x={gX(470)} y={gY(.82)} size={26} color="rgba(215,195,255,1)" opacity={kPure}>{names[0] ?? ''}</Label>
      </g>
      {/* ② 阳光光谱（紫外被臭氧截掉） */}
      <g opacity={kSun * (1 - .45 * kEye)}>
        <polyline points={curvePts(sunCurve, kSun)} fill="none" stroke="#ffd27a" strokeWidth={4} />
        <Label fonts={props.fonts} x={gX(560)} y={gY(1.04)} size={26} color="#ffd27a">{names[1] ?? ''}</Label>
        <g opacity={kLess}><rect x={gX(380)} y={gY(1.02)} width={gX(450) - gX(380)} height={gY(0) - gY(1.02)} fill="rgba(255,210,122,.08)" stroke="rgba(255,210,122,.5)" strokeDasharray="6 6" /></g>
      </g>
      {/* ③ 实际散射光 */}
      <g opacity={kScat}>
        {LS.filter(l => l >= 380 && (l - 380) / 380 <= kScat).map(l => <rect key={l} x={gX(l)} y={gY(SCAT_RAW(l) / SCAT_MAX * .92)} width={G.w / 115 + .5}
          height={gY(0) - gY(SCAT_RAW(l) / SCAT_MAX * .92)} fill={waveCss(l, .45)} />)}
        <polyline points={curvePts(l => SCAT_RAW(l) / SCAT_MAX * .92, kScat, 380)} fill="none" stroke={TEXT} strokeWidth={3} />
        <Label fonts={props.fonts} x={gX(470)} y={gY(.62)} size={26} color={TEXT}>{names[2] ?? ''}</Label>
      </g>
      {/* ④ 人眼 */}
      <g opacity={kEye}>
        {CM.map((f, i) => <polyline key={i} points={curvePts(f, kEye, 380)} fill="none" stroke={cmColors[i]} strokeWidth={3} strokeDasharray="10 6" />)}
        <Label fonts={props.fonts} x={gX(600)} y={gY(.66)} size={24} color={TEXT} weight={500}>{names[3] ?? ''}</Label>
      </g>
    </Svg>
    {/* 右侧色块 */}
    <div style={{position: 'absolute', left: 1450, top: 200, width: 380, fontFamily: props.fonts.text, color: TEXT, textAlign: 'center'}}>
      <div style={{opacity: kPure * (1 - .5 * kMix)}}>
        <div style={{width: 150, height: 150, margin: '0 auto', borderRadius: 75, background: css(VIOLET), boxShadow: `0 0 50px ${css(VIOLET, .6)}`, position: 'relative'}}>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 800, opacity: kWhy, transform: `scale(${.6 + .4 * kWhy})`}}>?</div>
        </div>
        <div style={{marginTop: 14, fontSize: 26, color: MUTED}}>{txt(props, 'violetSwatch')}</div>
      </div>
      <div style={{marginTop: 40, opacity: kMix, transform: `scale(${.8 + .2 * kMix})`}}>
        <div style={{width: 230, height: 230, margin: '0 auto', borderRadius: 115, background: css(SKY_BLUE), boxShadow: `0 0 70px ${css(SKY_BLUE, .65)}`}} />
        <div style={{marginTop: 16, fontSize: 30, fontWeight: 700}}>{txt(props, 'skySwatch')}</div>
        <div style={{marginTop: 6, fontSize: 24, fontFamily: MONO, color: MUTED}}>{hex(SKY_BLUE)}</div>
      </div>
    </div>
  </div>;
}

// ---------------------------------------------------------------- 云为什么是白的
type Shot = {t0: number; lam: number; y: number; scat: boolean; a: number};
/** 一路光子：命中概率 prob（分子 ∝ 1/λ⁴；云滴只看有没有撞上、与波长无关），散射角按 angle 抽。 */
function shots(seed: number, prob: (l: number, y: number, r: () => number) => boolean, angle: (r: () => number) => number): Shot[] {
  const r = seeded(seed), out: Shot[] = [];
  for (let n = 0; n < 900; n++) {
    const lam = sampleLam(r(), r()), y = (r() - .5) * 240;
    out.push({t0: n / 70, lam, y, scat: prob(lam, y, r), a: angle(r)});
  }
  return out;
}
const MOLS: Shot[] = shots(31, (l, _y, r) => r() < .9 * (400 / l) ** 4, r => rayleighAngle(r));
// 云滴：米氏散射强烈偏前向（一半能量在 ±25° 内），其余散向各处。
const DROPS: Shot[] = shots(37, (_l, y, r) => Math.abs(y) < 110 && r() < .95, r => r() < .55 ? (r() - .5) * .9 : rayleighAngle(r));
/** 范德胡斯特反常衍射近似：Q = 2 − (4/ρ)sinρ + (4/ρ²)(1 − cosρ)，ρ = 4πr(m−1)/λ；云滴 r = 10 μm、水 m = 1.333。 */
const qAda = (l: number, r = 10, m = 1.333) => {const p = 4 * Math.PI * r * (m - 1) / (l / 1000); return 2 - 4 / p * Math.sin(p) + 4 / (p * p) * (1 - Math.cos(p));};
const PANEL = [{cx: 520, cy: 400}, {cx: 1400, cy: 400}];

function Cloud(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const s0 = start(0, .1), s1 = start(1, s0 + 1.8), mie = at(txt(props, 'mieCue'), s1 + 2), white = at(txt(props, 'whiteCue'), mie + 2.4);
  const split = easeInOut(clamp((t - s1 + .3) / .8));
  const kMie = sm((t - mie + .1) / .5), kWhite = out3((t - white + .1) / .6);
  const panelNames = list(props, 'panelNames'), qNames = list(props, 'qNames');
  const T = t - s1 + 1.2;
  const sums = [MOLS, DROPS].map((set, side) => {
    const spec = new Array(LAM.length).fill(0); let n = 0;
    for (const h of set) {
      const reach = 380 / 520;
      if (h.scat && h.t0 + reach <= T) {spec[Math.min(34, Math.max(0, Math.round((h.lam - 380) / 10)))]++; n++;}
    }
    return {rgb: n ? hue(specRgb(spec)) : [0, 0, 0], n};
  });
  const ref = useCanvas(props.frame, ctx => {
    if (split <= 0) return;
    ctx.lineCap = 'round';
    [MOLS, DROPS].forEach((set, side) => {
      const {cx, cy} = PANEL[side], x0 = cx - 380, v = 520, reach = (cx - x0) / v;
      ctx.save(); ctx.beginPath(); ctx.rect(cx - 400, cy - 300, 800, 600); ctx.clip();
      for (const h of set) {
        const age = T - h.t0;
        if (age < 0) break;
        let x: number, y: number, tx: number, ty: number;
        if (age < reach || !h.scat) {x = x0 + v * age; y = cy + h.y; tx = x - 28; ty = y;}
        else {const d = v * (age - reach); x = cx + Math.cos(h.a) * d; y = cy + h.y * .3 + Math.sin(h.a) * d; tx = cx + Math.cos(h.a) * Math.max(0, d - 28); ty = cy + h.y * .3 + Math.sin(h.a) * Math.max(0, d - 28);}
        if (x > cx + 420) continue;
        ctx.strokeStyle = waveCss(h.lam, .85 * split); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
      }
      ctx.restore();
    });
  });
  const lit = sunDisk(55).rgb, shade = tone(skyRadiance([0, .5, .87], sunDir(55, -.4, 90), {elev: 55}), 1.2).map(v => v * .85 + .1);
  const qLine = (f: (l: number) => number, x0: number, scale: number) => Array.from({length: 69}, (_, i) => 380 + i * 5).map(l => `${x0 + (l - 380) / 340 * 300},${860 - f(l) * scale}`).join(' ');
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, .3)}}>
    <div style={{position: 'absolute', inset: 0, opacity: 1 - split}}>
      <SkyCanvas frame={props.frame} o={{elev: 55, pitch: 20, horizon: .95, hfov: 90, sunX: -.4}} after={ctx => {
        drawCloud(ctx, 1080 + t * 10, 470, 230, 23, lit, shade);
        drawCloud(ctx, 420 + t * 6, 300, 110, 9, lit, shade, .95);
      }} />
    </div>
    <div style={{position: 'absolute', inset: 0, opacity: split}}>
      <Grid opacity={.5} />
      <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
      <Svg>
        {[0, 1].map(side => {
          const {cx, cy} = PANEL[side], hot = side === 1 ? kMie : 1 - .4 * kMie;
          return <g key={side}>
            <rect x={cx - 400} y={cy - 300} width={800} height={600} rx={18} fill="none" stroke={side === 1 && kMie > 0 ? `rgba(238,243,255,${.3 + .5 * kMie})` : 'rgba(238,243,255,.3)'} strokeWidth={2} />
            <Label fonts={props.fonts} x={cx - 370} y={cy - 250} size={28} color={TEXT} opacity={.55 + .45 * hot}>{panelNames[side] ?? ''}</Label>
            {side === 0
              ? Array.from({length: 9}, (_, i) => <circle key={i} cx={cx + (i % 3 - 1) * 16} cy={cy + (Math.floor(i / 3) - 1) * 16} r={3} fill="#9fb4e6" />)
              : <g><circle cx={cx} cy={cy} r={110} fill="rgba(170,200,240,.18)" stroke="rgba(220,235,255,.8)" strokeWidth={2.5} />
                <ellipse cx={cx - 38} cy={cy - 44} rx={34} ry={20} fill="rgba(255,255,255,.35)" /></g>}
            {/* 散射效率曲线 */}
            <g transform={`translate(${cx - 370} 0)`}>
              <line x1={0} x2={300} y1={860} y2={860} stroke="rgba(238,243,255,.4)" />
              <polyline points={side === 0 ? qLine(l => (380 / l) ** 4, 0, 120) : qLine(l => qAda(l) / 2, 0, 60)} fill="none" stroke={TEXT} strokeWidth={3} />
              <Label fonts={props.fonts} x={320} y={850} size={22} color={MUTED} weight={500}>{qNames[side] ?? ''}</Label>
            </g>
          </g>;
        })}
      </Svg>
      {[0, 1].map(side => <div key={side} style={{position: 'absolute', left: PANEL[side].cx + 230, top: PANEL[side].cy + 140, width: 150, textAlign: 'center', fontFamily: props.fonts.text}}>
        <div style={{fontSize: 20, color: MUTED}}>{txt(props, 'mixLabel')}</div>
        <div style={{width: 96, height: 96, margin: '8px auto 0', borderRadius: 48, background: css(sums[side].rgb), opacity: clamp(sums[side].n / 40),
          boxShadow: `0 0 ${20 + 40 * kWhite}px ${css(sums[side].rgb, .6)}`, transform: `scale(${1 + .15 * kWhite})`}} />
        <div style={{marginTop: 8, fontSize: 20, fontFamily: MONO, color: TEXT, opacity: kWhite}}>{hex(sums[side].rgb)}</div>
      </div>)}
    </div>
  </div>;
}

export default function SkyPhotons(props: SceneInput) {
  const part = props.params.part;
  return part === 'violet' ? <Violet {...props} /> : part === 'cloud' ? <Cloud {...props} /> : <SkyDye {...props} />;
}
