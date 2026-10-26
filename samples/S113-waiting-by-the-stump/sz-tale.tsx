import React from 'react';
import {Media, clamp, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《守株待兔》共用画面库（剪纸绘本风）。prepare.py 把它和 sz-tale.tsx 拼成 scenes/sz-tale.tsx，
// 并把底图与贴纸以 WebP data URI 内联进 MEDIA（成片任务用高清档，随包样片用小档）。运行时无字体下载、无随机与时钟。
const W = 1920, H = 1080;
const INK = '#3b2a1e', PAPER = '#fffaf0', CORAL = '#f2665c', SUN = '#ffc93c', SKY = '#8fd3f4', LEAF = '#7cb342', BROWN = '#8d6e63';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
/** 回弹缓出：弹出贴纸、气泡用。 */
const back = (v: number, k = 1.9) => {const p = clamp(v) - 1; return 1 + (k + 1) * p * p * p + k * p * p;};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
const lerpColor = (a: string, b: string, p: number) => {
  const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(mix(v, pb[i], clamp(p)))).join(',')})`;
};

// 随包样片没有素材 ID：prepare.py 把底图与贴纸以 data URI 内联在这里；素材槽（制作任务里可选）优先。
const MEDIA: Record<string, string> = {"farmer-aha":"release-assets/091bfe9b2952162b4d20beeca8c81e23b5a2c47dbcc745a2bbe52b85994e55b4.webp","farmer-laugh":"release-assets/e0f52efc368f1fe452446a8c7326676efdaf36560d5c3abac5ddd42076df3284.webp","farmer-sit":"release-assets/1f41bc5ed5071e396ab057559be83de659d216fe41d42541b83a6fad2f3c5b41.webp","farmer-sleep":"release-assets/273263feedb780ccd50636c8f6e3469610f0ba66702579e587c46c40e4e45f8b.webp","farmer-throw":"release-assets/eaf97e0a93d7274ccbbfc95ef3b1b571bda12d5be85993faf5e46d0b0184532b.webp","farmer-walk":"release-assets/5847451aff6b03d37ec43959e807e4dae1bc150ea8b794a6518b1fa84dc7fa86.webp","field":"release-assets/a1c28ce24f44c27f08ebe69ea4e91582adc57c07578960f0b74954d76bd380e3.webp","rabbit-daze":"release-assets/1161b69f79bd5d05d2194dfcfcbf95d9bccb9b337e22e2790e4adcfdedd88c9c.webp","rabbit-dizzy":"release-assets/773c48b08f4a293714011790def7531910bb733002d4b982df8d677c71799940.webp","rabbit-run":"release-assets/80df3facb42dd0d4ea1ddcfa97b804ec16379d7c35b621e489f7f798c2951e17.webp","stump":"release-assets/9a878de5ecf7fcdcf7a91a1e0da77c8747b2511471ed757075c48a2497e1c94f.webp","title":"release-assets/9743de1a7928e61857108905368f91da7b0a1f3b8a24a4e59360308aada80fd4.webp"};
/** 贴纸 [留边后宽高比, 左右留边占比, 上下留边占比]：投影离线烘焙在留边里（cutouts.py），排版按去掉留边的贴纸算。 */
const ART: Record<string, number[]> = {"farmer-aha":[0.8802,0.0369,0.0325],"farmer-laugh":[1.0234,0.0326,0.0334],"farmer-sit":[0.8282,0.0392,0.0325],"farmer-sleep":[1.0475,0.0325,0.034],"farmer-throw":[0.7499,0.0436,0.0327],"farmer-walk":[0.7443,0.0436,0.0325],"rabbit-daze":[0.9577,0.0343,0.0328],"rabbit-dizzy":[1.0161,0.0329,0.0335],"rabbit-run":[0.9988,0.0329,0.0329],"stump":[1.2703,0.0325,0.0413]};
function art(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}

/** 文字参数：props 里写了就用，否则用 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) ? value : (meta as any).params?.[key]?.default ?? [];
}
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

/** 句子时间：卡点词找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

/** 整版 SVG（幕坐标 1920×1080），带纸片投影滤镜。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>
    <defs>
      <filter id="paper" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#3b2a1e" floodOpacity=".28" /></filter>
    </defs>
    {children}
  </svg>;

/** 镜头：整组画面按 (s, x, y) 推拉平移（x/y 为画面中心偏移，幕坐标），shake 叠加震动。 */
function Camera({s = 1, x = 0, y = 0, shake = 'none', children}: {s?: number; x?: number; y?: number; shake?: string; children: any}) {
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', transform: shake}}>
    <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 50%', transform: `scale(${s}) translate(${-x}px, ${-y}px)`}}>{children}</div>
  </div>;
}
/** 满幅底图。 */
function Plate({props, name}: {props: SceneInput; name: string}) {
  const asset = art(props, name);
  if (!asset) return <div style={{position: 'absolute', inset: 0, background: SKY}} />;
  return <div style={{position: 'absolute', inset: 0}}><Media asset={asset} frame={props.frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>;
}
/** 剪纸贴纸：去掉留边后的脚底中心落在 (x, y)、可见高度 h；flip 左右翻转，sx/sy 以脚底为轴挤压拉伸，rot 绕脚底转（度）。 */
function Sticker({props, name, x, y, h, flip = false, rot = 0, sx = 1, sy = 1, opacity = 1}:
  {props: SceneInput; name: string; x: number; y: number; h: number; flip?: boolean; rot?: number; sx?: number; sy?: number; opacity?: number}) {
  const asset = art(props, name);
  if (!asset || opacity <= 0 || h <= 0) return null;
  const [aspect = 1, , py = 0] = ART[name] ?? [];
  const bh = h / (1 - 2 * py), bw = bh * aspect;
  return <div style={{position: 'absolute', left: x - bw / 2, top: y - h - bh * py, width: bw, height: bh, opacity, transformOrigin: `50% ${(1 - py) * 100}%`,
    transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy})`}}>
    <Media asset={asset} frame={props.frame} fit="contain" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
  </div>;
}
/** 贴纸上某点（去掉留边后宽、高的比例）在幕坐标里的位置；不含旋转与挤压。 */
const spot = (name: string, x: number, y: number, h: number, fx: number, fy: number, flip = false) => {
  const [aspect = 1, px = 0, py = 0] = ART[name] ?? [];
  const w = h * aspect * (1 - 2 * px) / (1 - 2 * py);
  return {x: x - w / 2 + w * (flip ? 1 - fx : fx), y: y - h + h * fy, w};
};

/** 震动：at 起 len 秒内衰减。 */
const shake = (t: number, at: number, power = 22, len = .45) => {
  const d = t - at;
  if (d < 0 || d > len) return 'none';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 95) * k}px, ${Math.cos(d * 73) * k * .7}px)`;
};

/** 想法 / 说话气泡：剪纸白底、珊瑚红大字；p 为弹出进度（0→1，回弹）。 */
function Bubble({x, y, text, p, size = 120, tail = 'left', fonts, color = CORAL, wobble = 0}:
  {x: number; y: number; text: string; p: number; size?: number; tail?: 'left' | 'right' | 'none'; fonts: any; color?: string; wobble?: number}) {
  if (p <= 0 || !text) return null;
  const k = back(p), chars = Array.from(text).length, w = Math.max(size * 1.25, size * .62 * chars + size * .6), h = size * 1.05;
  return <g transform={`translate(${x} ${y}) scale(${k}) rotate(${wobble})`} opacity={clamp(p * 4)} filter="url(#paper)">
    {tail !== 'none' && <g fill={PAPER}>
      <circle cx={tail === 'left' ? -w * .42 : w * .42} cy={h * .62} r={size * .13} />
      <circle cx={tail === 'left' ? -w * .58 : w * .58} cy={h * .9} r={size * .08} />
    </g>}
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={PAPER} />
    <text x={0} y={size * .3} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={size * .78} fill={color}>{text}</text>
  </g>;
}

/** 五角星（纸片）。 */
const starPath = (r: number, inner = .45) => Array.from({length: 10}, (_, i) => {
  const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * inner : r;
  return `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
}).join(' ') + 'Z';
/** 头顶转圈的小星星：椭圆轨道，近大远小。 */
function StarRing({x, y, t, n = 5, rx = 120, ry = 34, size = 26, speed = 1.4, opacity = 1}:
  {x: number; y: number; t: number; n?: number; rx?: number; ry?: number; size?: number; speed?: number; opacity?: number}) {
  if (opacity <= 0) return null;
  return <g opacity={opacity}>{Array.from({length: n}, (_, i) => {
    const a = t * speed * Math.PI * 2 + i * Math.PI * 2 / n, depth = (Math.sin(a) + 1) / 2;
    return <path key={i} d={starPath(size * (.65 + .5 * depth))} transform={`translate(${x + Math.cos(a) * rx} ${y + Math.sin(a) * ry}) rotate(${t * 220 + i * 40})`}
      fill={i % 2 ? SUN : '#ffe082'} stroke={PAPER} strokeWidth={5} strokeLinejoin="round" />;
  })}</g>;
}
/** 漫画爆炸框：参差星形 + 大字。 */
/** 西文判断与字宽估算（em，粗体无衬线）：只给不含汉字的文字排版用，汉字路径不读它。 */
const latin = (text: string) => !!text && !/[㐀-鿿]/.test(text) && /[A-Za-z]/.test(text);
const latinEm = (text: string) => Array.from(text).reduce((s, ch) => s + (/[il.,:;!|'’]/.test(ch) ? .3 : /[fjtr()-]/.test(ch) ? .4
  : /[mw]/.test(ch) ? .88 : /[MW]/.test(ch) ? .95 : /[A-Z]/.test(ch) ? .7 : /[0-9]/.test(ch) ? .6 : ch === ' ' ? .26 : /[?]/.test(ch) ? .5 : .6), 0);
function Burst({x, y, text, p, fonts, r = 170, rot = -8}: {x: number; y: number; text: string; p: number; fonts: any; r?: number; rot?: number}) {
  if (p <= 0 || !text) return null;
  const k = back(clamp(p * 1.6), 2.6), pts = Array.from({length: 22}, (_, i) => {
    const a = i * Math.PI * 2 / 22, rr = i % 2 ? r * .62 : r * (1 + .12 * Math.sin(i * 2.3));
    return `${(Math.cos(a) * rr * 1.25).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`} filter="url(#paper)">
    <polygon points={pts} fill={PAPER} transform="scale(1.1)" />
    <polygon points={pts} fill={SUN} />
    {latin(text) ? <text x={0} y={Math.min(r * .78, r * 1.6 / latinEm(text)) / 3} textAnchor="middle" fontFamily={fonts.text} fontWeight={900}
      fontSize={Math.min(r * .78, r * 1.6 / latinEm(text))} fill={CORAL} stroke={PAPER} strokeWidth={10} paintOrder="stroke">{text}</text>
      : <text x={0} y={r * .26} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={r * .78} fill={CORAL}
      stroke={PAPER} strokeWidth={10} paintOrder="stroke" letterSpacing={-4}>{text}</text>}
  </g>;
}
/** 纸花：五瓣，弹出并慢转。 */
function Flower({x, y, p, t, size = 46, color = '#ff8a80', seed = 0}: {x: number; y: number; p: number; t: number; size?: number; color?: string; seed?: number}) {
  if (p <= 0) return null;
  const k = back(p, 2.2);
  return <g transform={`translate(${x} ${y}) scale(${k}) rotate(${t * 50 + seed * 37})`} filter="url(#paper)">
    {[0, 1, 2, 3, 4].map(i => <ellipse key={i} cx={0} cy={-size * .55} rx={size * .36} ry={size * .52} fill={color} stroke={PAPER} strokeWidth={4} transform={`rotate(${i * 72})`} />)}
    <circle r={size * .3} fill={SUN} stroke={PAPER} strokeWidth={4} />
  </g>;
}
/** 尘土团：落地时扩散淡出。 */
function Puff({x, y, age, size = 40}: {x: number; y: number; age: number; size?: number}) {
  if (age < 0 || age > .6) return null;
  const k = out3(age / .6);
  return <g opacity={(1 - k) * .85}>{[-1, 0, 1].map(i => <circle key={i} cx={x + i * size * (.6 + k)} cy={y - size * .3 * k - (i === 0 ? size * .2 : 0)} r={size * (.35 + .5 * k)} fill="#efe3cf" />)}</g>;
}
/** 速度线。 */
function SpeedLines({x, y, t, amount = 1, length = 260}: {x: number; y: number; t: number; amount?: number; length?: number}) {
  if (amount <= 0) return null;
  return <g opacity={amount} stroke={PAPER} strokeLinecap="round">{[0, 1, 2, 3, 4].map(i => {
    const off = ((t * 9 + i * .37) % 1), yy = y - 90 + i * 42;
    return <line key={i} x1={x - 60 - off * length} y1={yy} x2={x - 60 - off * length - length * .55} y2={yy} strokeWidth={9 - i % 3 * 2} opacity={1 - off} />;
  })}</g>;
}
/** 汗珠（慌张）：从头顶向后甩出。 */
function Sweat({x, y, t}: {x: number; y: number; t: number}) {
  return <g>{[0, 1].map(i => {
    const q = (t * 2.2 + i * .5) % 1;
    return <path key={i} d="M0 -16 C 10 0 10 12 0 14 C -10 12 -10 0 0 -16 Z" fill="#9ad8ff" stroke={PAPER} strokeWidth={4}
      transform={`translate(${x - 30 - q * 70 - i * 30} ${y - 20 - Math.sin(q * Math.PI) * 50}) rotate(${-50 - q * 40})`} opacity={1 - q} />;
  })}</g>;
}

/** 天空：白天蓝、黄昏橘、夜里深蓝；用半透明色层盖在底图上（不用滤镜，渲染确定）。night 0→1，dusk 0→1。 */
function SkyTint({night = 0, dusk = 0, grey = 0, cold = 0}: {night?: number; dusk?: number; grey?: number; cold?: number}) {
  return <>
    {dusk > 0 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,140,80,${.35 * dusk}), rgba(255,190,120,${.18 * dusk}))`}} />}
    {grey > 0 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(92,104,120,${.55 * grey}), rgba(70,80,96,${.32 * grey}))`}} />}
    {cold > 0 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(180,200,225,${.4 * cold}), rgba(225,235,248,${.25 * cold}))`}} />}
    {night > 0 && <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(14,24,66,${.72 * night}), rgba(20,28,60,${.55 * night}))`}} />}
  </>;
}
/** 太阳：剪纸圆 + 光芒，慢转。 */
function SunDisc({x, y, r = 70, t, opacity = 1}: {x: number; y: number; r?: number; t: number; opacity?: number}) {
  if (opacity <= 0) return null;
  return <g transform={`translate(${x} ${y})`} opacity={opacity} filter="url(#paper)">
    <g transform={`rotate(${t * 25})`}>{Array.from({length: 12}, (_, i) => <path key={i} d={`M ${-r * .14} ${-r * 1.18} L 0 ${-r * 1.62} L ${r * .14} ${-r * 1.18} Z`} fill="#ffb300" transform={`rotate(${i * 30})`} />)}</g>
    <circle r={r * 1.08} fill={PAPER} /><circle r={r} fill={SUN} />
    <circle cx={-r * .32} cy={-r * .05} r={r * .09} fill={INK} /><circle cx={r * .32} cy={-r * .05} r={r * .09} fill={INK} />
    <path d={`M ${-r * .3} ${r * .28} Q 0 ${r * .52} ${r * .3} ${r * .28}`} fill="none" stroke={INK} strokeWidth={r * .07} strokeLinecap="round" />
    <circle cx={-r * .55} cy={r * .2} r={r * .13} fill="#ff8a65" opacity={.7} /><circle cx={r * .55} cy={r * .2} r={r * .13} fill="#ff8a65" opacity={.7} />
  </g>;
}
/** 弯月：睡眼。 */
function MoonDisc({x, y, r = 62, opacity = 1}: {x: number; y: number; r?: number; opacity?: number}) {
  if (opacity <= 0) return null;
  return <g transform={`translate(${x} ${y}) rotate(-18)`} opacity={opacity} filter="url(#paper)">
    <path d={`M ${r * .2} ${-r} A ${r} ${r} 0 1 0 ${r * .2} ${r} A ${r * .78} ${r * .78} 0 1 1 ${r * .2} ${-r} Z`} fill="#fff3b0" stroke={PAPER} strokeWidth={6} />
    <path d={`M ${-r * .62} ${-r * .05} q ${r * .14} ${r * .12} ${r * .28} 0`} fill="none" stroke={INK} strokeWidth={r * .07} strokeLinecap="round" />
  </g>;
}
/** 夜空星点（固定种子）。 */
function NightStars({t, opacity = 1, seed = 11}: {t: number; opacity?: number; seed?: number}) {
  if (opacity <= 0) return null;
  const r = seeded(seed), stars = Array.from({length: 46}, () => ({x: r() * W, y: r() * 380, s: r()}));
  return <g opacity={opacity}>{stars.map((s, i) => <path key={i} d={starPath(4 + 7 * s.s, .5)} transform={`translate(${s.x} ${s.y})`} fill="#fff6c8"
    opacity={.45 + .55 * Math.abs(Math.sin(t * 1.6 + i))} />)}</g>;
}
/** 纸云：横向漂移。 */
function Clouds({t, speed = 18, opacity = 1, dark = 0}: {t: number; speed?: number; opacity?: number; dark?: number}) {
  if (opacity <= 0) return null;
  const fill = lerpColor('#ffffff', '#8a95a5', dark);
  return <g opacity={opacity} filter="url(#paper)">{[[180, 120, 1], [760, 70, .8], [1380, 150, 1.15], [1900, 90, .9]].map(([x0, y0, k], i) => {
    const x = ((x0 + t * speed * (1 + i * .25)) % (W + 500)) - 250;
    return <g key={i} transform={`translate(${x} ${y0}) scale(${k})`} fill={fill}>
      <ellipse cx={0} cy={20} rx={110} ry={34} /><circle cx={-40} cy={4} r={42} /><circle cx={24} cy={-8} r={56} /><circle cx={78} cy={14} r={34} />
    </g>;
  })}</g>;
}
/** 雨丝（canvas，按帧确定）。 */
function Rain({frame, amount = 1, seed = 3}: {frame: number; amount?: number; seed?: number}) {
  const r = seeded(seed), drops = Array.from({length: 260}, () => ({x: r() * W * 1.2, y: r() * H, l: 26 + r() * 40, v: 1100 + r() * 700, z: r()}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    c.lineCap = 'round';
    drops.forEach((d, i) => {
      if (i / drops.length > amount) return;
      const y = (d.y + d.v * t) % (H + 80) - 40, x = (d.x - y * .12) % (W * 1.2) - W * .1;
      c.strokeStyle = `rgba(214,236,255,${.45 + .4 * d.z})`; c.lineWidth = 2 + 3 * d.z;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - d.l * .12, y + d.l); c.stroke();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />;
}
/** 雪花：大片、慢飘。 */
function Snow({frame, amount = 1, seed = 5}: {frame: number; amount?: number; seed?: number}) {
  const r = seeded(seed), flakes = Array.from({length: 150}, () => ({x: r() * W, y: r() * H, s: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    flakes.forEach((m, i) => {
      if (i / flakes.length > amount) return;
      const y = (m.y + (60 + 70 * m.s) * t) % H, x = (m.x + Math.sin(t * 1.4 + m.ph) * 30 + 15 * t) % W;
      c.fillStyle = `rgba(255,255,255,${.75 + .25 * m.s})`; c.beginPath(); c.arc(x, y, 3 + 6 * m.s, 0, 6.283); c.fill();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />;
}
/** 风：白色风线 + 翻飞的叶子。 */
function Wind({t, amount = 1, seed = 9}: {t: number; amount?: number; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), leaves = Array.from({length: 18}, () => ({y: 120 + r() * 700, v: .5 + r() * .7, ph: r(), c: r()}));
  return <g opacity={amount}>
    {[0, 1, 2, 3].map(i => {
      const q = (t * .9 + i * .27) % 1, x = -400 + q * (W + 800), y = 180 + i * 150;
      return <path key={`w${i}`} d={`M ${x} ${y} q 120 -40 240 0 t 240 0 q 60 30 20 60 q -30 10 -40 -20`} fill="none" stroke={PAPER} strokeWidth={8} strokeLinecap="round" opacity={.8 * Math.sin(q * Math.PI)} />;
    })}
    {leaves.map((l, i) => {
      const q = (t * l.v * .6 + l.ph) % 1, x = -80 + q * (W + 160), y = l.y + Math.sin(q * 12 + i) * 40;
      return <ellipse key={i} cx={0} cy={0} rx={16} ry={8} fill={l.c > .5 ? '#9ccc65' : '#ffb74d'} stroke={PAPER} strokeWidth={3}
        transform={`translate(${x} ${y}) rotate(${q * 900 + i * 30})`} />;
    })}
  </g>;
}

/** 野草：三层剪纸草带，growth 0→1 从地面长到快没过人头；sway 摇摆。clearFrom：x 小于它的部分被割掉（收尾锄草）。 */
function Grass({t, growth, sway = 1, clearTo = -1, seed = 21}: {t: number; growth: number; sway?: number; clearTo?: number; seed?: number}) {
  if (growth <= 0.001) return null;
  const layers = [
    {base: 900, max: 430, color: '#8bc34a', step: 46},
    {base: 985, max: 560, color: '#7cb342', step: 54},
    {base: 1100, max: 720, color: '#558b2f', step: 64},
  ];
  return <Svg><g filter="url(#paper)">{layers.map((L, li) => {
    const r = seeded(seed + li), n = Math.ceil((W + 200) / L.step) + 1;
    const base = H + 40 - (H + 40 - L.base) * Math.min(1, growth * 3.5);   // 草刚冒头时整条草带还在画面下方
    let d = `M -100 ${H + 40} `;
    for (let i = 0; i < n; i++) {
      const x0 = -100 + i * L.step, h = L.max * growth * (.62 + .38 * r()), lean = (r() - .5) * 26 + Math.sin(t * 2.1 + i * .7 + li) * 14 * sway;
      const cut = x0 + L.step / 2 < clearTo ? .08 : 1;
      d += `L ${x0} ${base} L ${x0 + L.step * .5 + lean} ${base - h * cut} L ${x0 + L.step} ${base} `;
    }
    d += `L ${W + 120} ${H + 40} Z`;
    return <path key={li} d={d} fill={L.color} stroke={lerpColor(L.color, '#ffffff', .35)} strokeWidth={3} strokeLinejoin="round" />;
  })}</g></Svg>;
}
/** 闪光小星：庄稼“绿油油”时一闪一闪。 */
function Twinkle({x, y, p, size = 22}: {x: number; y: number; p: number; size?: number}) {
  if (p <= 0 || p >= 1) return null;
  const k = Math.sin(p * Math.PI);
  return <path d={`M0 ${-size} Q 0 0 ${size} 0 Q 0 0 0 ${size} Q 0 0 ${-size} 0 Q 0 0 0 ${-size} Z`} transform={`translate(${x} ${y}) scale(${k}) rotate(${p * 90})`} fill="#fffde7" />;
}
/** 锄头（代码画，剪纸白边）：以柄中点为原点。 */
function Hoe({x, y, rot = 0, scale = 1}: {x: number; y: number; rot?: number; scale?: number}) {
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} filter="url(#paper)">
    <rect x={-150} y={-11} width={300} height={22} rx={11} fill={PAPER} />
    <rect x={-146} y={-7} width={292} height={14} rx={7} fill="#a1724e" />
    <path d="M 128 -14 L 186 -40 L 206 58 L 150 40 Z" fill={PAPER} stroke={PAPER} strokeWidth={10} strokeLinejoin="round" />
    <path d="M 128 -14 L 186 -40 L 206 58 L 150 40 Z" fill="#8f9aa3" />
  </g>;
}
/** 蝴蝶：翅膀扇动（flap 0→1 速度）。 */
function Butterfly({x, y, t, flap = 1, scale = 1, rot = 0}: {x: number; y: number; t: number; flap?: number; scale?: number; rot?: number}) {
  const k = .25 + .75 * Math.abs(Math.cos(t * (6 + 16 * flap)));
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} filter="url(#paper)">
    <g transform={`scale(${k} 1)`}>
      {[-1, 1].map(s => <g key={s} transform={`scale(${s} 1)`}>
        <path d="M 0 0 C 20 -46 66 -50 64 -16 C 62 6 30 8 0 0 Z" fill="#ffb74d" stroke={PAPER} strokeWidth={4} />
        <path d="M 0 2 C 26 8 50 26 34 44 C 20 56 4 30 0 2 Z" fill="#ff8a65" stroke={PAPER} strokeWidth={4} />
        <circle cx={38} cy={-20} r={7} fill={PAPER} opacity={.85} />
      </g>)}
    </g>
    <rect x={-4} y={-22} width={8} height={48} rx={4} fill={INK} />
    <path d="M -2 -22 q -10 -18 -18 -20 M 2 -22 q 10 -18 18 -20" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </g>;
}
/** 灯泡（想明白了）。 */
function Bulb({x, y, p, t}: {x: number; y: number; p: number; t: number}) {
  if (p <= 0) return null;
  const k = back(p, 2.4);
  return <g transform={`translate(${x} ${y}) scale(${k})`} filter="url(#paper)">
    <g opacity={.6 + .4 * Math.sin(t * 9)}>{Array.from({length: 8}, (_, i) => <rect key={i} x={-5} y={-118} width={10} height={30} rx={5} fill={SUN} transform={`rotate(${i * 45 - 90})`} />)}</g>
    <circle cx={0} cy={-20} r={56} fill={PAPER} /><circle cx={0} cy={-20} r={48} fill="#fff176" />
    <rect x={-24} y={30} width={48} height={30} rx={8} fill="#90a4ae" stroke={PAPER} strokeWidth={5} />
  </g>;
}
/** 片名纸块：每字一块彩色方纸，依次从上方掉落回弹。 */
function Tiles({text, x, y, size, t, at, fonts, gap = 1.12, stagger = .13}:
  {text: string; x: number; y: number; size: number; t: number; at: number; fonts: any; gap?: number; stagger?: number}) {
  const chars = Array.from(text), colors = [CORAL, '#ffb300', '#4fa3e0', '#66bb6a', '#ab7ad6'];
  if (latin(text)) {
    // 西文片名：每个词一块纸片（逐字一块会排成一长串），块宽按估算字宽；中文仍是下面的每字一块。
    const words = text.split(/\s+/).filter(Boolean), font = size * .6, pad = size * .42, sep = size * .16;
    const widths = words.map(w => latinEm(w) * font + pad), all = widths.reduce((a, b) => a + b, 0) + sep * (words.length - 1);
    let left = x - all / 2;
    return <g>{words.map((word, i) => {
      const w = widths[i], cx = left + w / 2;
      left += w + sep;
      const p = clamp((t - at - i * stagger * 1.5) / .5);
      if (p <= 0) return null;
      const drop = (1 - back(p, 2.2)) * -260, rot = (i % 2 ? 1 : -1) * (3 + i % 3) * (1 - .4 * p);
      return <g key={i} transform={`translate(${cx} ${y + drop}) rotate(${rot})`} filter="url(#paper)" opacity={clamp(p * 4)}>
        <rect x={-w / 2 - 7} y={-size / 2 - 7} width={w + 14} height={size + 14} rx={size * .16} fill={PAPER} />
        <rect x={-w / 2} y={-size / 2} width={w} height={size} rx={size * .13} fill={colors[i % colors.length]} />
        <text x={0} y={font * .36} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={font} fill={PAPER}>{word}</text>
      </g>;
    })}</g>;
  }
  const total = (chars.length - 1) * size * gap;
  return <g>{chars.map((ch, i) => {
    const p = clamp((t - at - i * stagger) / .5);
    if (p <= 0) return null;
    const drop = (1 - back(p, 2.2)) * -260, rot = (i % 2 ? 1 : -1) * (4 + i % 3 * 2) * (1 - .4 * p);
    return <g key={i} transform={`translate(${x - total / 2 + i * size * gap} ${y + drop}) rotate(${rot})`} filter="url(#paper)" opacity={clamp(p * 4)}>
      <rect x={-size / 2 - 7} y={-size / 2 - 7} width={size + 14} height={size + 14} rx={size * .16} fill={PAPER} />
      <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size * .13} fill={colors[i % colors.length]} />
      <text x={0} y={size * .29} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={size * .76} fill={PAPER}>{ch}</text>
    </g>;
  })}</g>;
}
/** 纸条标签（白底圆角、深色字）。 */
function Tag({x, y, text, p, fonts, size = 40, color = INK, fill = PAPER, rot = -3, anchor = 'middle'}:
  {x: number; y: number; text: string; p: number; fonts: any; size?: number; color?: string; fill?: string; rot?: number; anchor?: 'start' | 'middle'}) {
  if (p <= 0 || !text) return null;
  const w = Array.from(text).reduce((s, ch) => s + (/[\x00-\xff]/.test(ch) ? .58 : 1), 0) * size + size * .9, h = size * 1.55;
  const left = anchor === 'middle' ? -w / 2 : 0;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${back(p, 2)})`} opacity={clamp(p * 4)} filter="url(#paper)">
    <rect x={left} y={-h / 2} width={w} height={h} rx={h * .3} fill={fill} />
    <text x={left + w / 2} y={size * .36} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={size} fill={color}>{text}</text>
  </g>;
}
/** 撕页日历：大字天数；翻页时旧页向左上飞走。day 为浮点，整数部分是当前天。 */
function Calendar({day, x = 1560, y = 70, fonts, format, title, rate = 1, opacity = 1}:
  {day: number; x?: number; y?: number; fonts: any; format: string; title: string; rate?: number; opacity?: number}) {
  if (opacity <= 0) return null;
  const n = Math.max(1, Math.floor(day + 1e-6)), [pre = '', post = ''] = format.split('{n}');
  const page = (num: number, key: string, tf = '', op = 1) => <g key={key} transform={tf} opacity={op}>
    <rect x={0} y={60} width={300} height={190} rx={14} fill={PAPER} />
    <text x={150} y={190} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fill={INK}>
      <tspan fontSize={44} fill={BROWN}>{pre.trim()}</tspan><tspan fontSize={112} dx={8} dy={6} fill={CORAL}>{num}</tspan><tspan fontSize={44} dx={8} dy={-6} fill={BROWN}>{post.trim()}</tspan>
    </text>
  </g>;
  const flying = [];
  const span = Math.min(.45, .9 / Math.max(rate, .01));               // 旧页飞走时长（天越快越短）
  for (let k = 1; k <= 3; k++) {
    const prev = n - k + 1, age = (day - prev) / Math.max(rate, .01);   // 第 prev 天开始时撕下第 prev-1 页，至今的秒数
    if (prev <= 1 || age < 0 || age > span) continue;
    const q = age / span;
    flying.push(page(prev - 1, `f${k}`, `translate(${-q * 180} ${-q * 300}) rotate(${-q * 35} 150 150)`, 1 - Math.pow(q, .7)));
  }
  return <g transform={`translate(${x} ${y})`} opacity={opacity} filter="url(#paper)">
    <rect x={-8} y={-8} width={316} height={266} rx={20} fill={PAPER} />
    <rect x={0} y={0} width={300} height={250} rx={14} fill={PAPER} />
    {page(n, 'now')}
    <rect x={0} y={0} width={300} height={66} rx={14} fill={CORAL} />
    <rect x={0} y={40} width={300} height={26} fill={CORAL} />
    <text x={150} y={46} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={34} fill={PAPER} letterSpacing={6}>{title}</text>
    {[60, 150, 240].map(cx => <rect key={cx} x={cx - 7} y={-18} width={14} height={34} rx={7} fill="#6d4c41" stroke={PAPER} strokeWidth={4} />)}
    {flying}
  </g>;
}
/** 天数时间表：keys 为 [秒, 天] 递增对；段内用 ease-in（越来越快）。返回 {day, rate(天/秒)}。 */
function dayClock(t: number, keys: number[][], accel = 1.8) {
  if (!keys.length) return {day: 1, rate: 0};
  if (t <= keys[0][0]) return {day: keys[0][1], rate: 0};
  for (let i = 1; i < keys.length; i++) {
    const [t0, d0] = keys[i - 1], [t1, d1] = keys[i];
    if (t <= t1) {
      const span = Math.max(.001, t1 - t0), q = (t - t0) / span, pow = d1 - d0 > 3 ? accel : 1;
      return {day: d0 + (d1 - d0) * Math.pow(q, pow), rate: (d1 - d0) * pow * Math.pow(Math.max(q, .02), pow - 1) / span};
    }
  }
  return {day: keys[keys.length - 1][1], rate: 0};
}
/** 收尾片名之前的暗角。 */
function Vignette({amount = .35}: {amount?: number}) {
  return <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(40,26,14,${amount}) 100%)`}} />;
}
/** 幕首/幕末淡入淡出（0 表示不淡）。亮底卡通片只在全片开头和结尾用：幕间淡出会露出宿主底色，硬切与交叉淡化交给分镜转场。 */
const fadeEdges = (t: number, dur: number, inS = 0, outS = 0) => Math.min(inS > 0 ? sm(t / inS) : 1, outS > 0 ? sm((dur - t) / outS) : 1);

// 守株待兔：全片 13 幕共用这一个模块（底图与贴纸只内联一份），props.shot 选镜头。
// 画面文字与卡点词都在 meta.params（默认值是中文原文）；卡点词找不到时退回固定秒数，改文案画面不丢。
export const meta = {
  title: '守株待兔 · 剪纸绘本镜头',
  description: '一个模块画全片：shot 选镜头（open/farmer/stump/run/bonk/lucky/dream/throw/days/weather/doze/aha/back）；天气、天数、气泡字、卡点词都可改。',
  params: {
    shot: '镜头：open 开场问号与片名、farmer 农夫下地、stump 老树桩、run 兔子跑来、bonk 咚、lucky 白捡兔子、dream 美梦、throw 扔锄头坐等、days 日夜循环数天、weather 刮风下雨下雪、doze 打呼噜与长草、aha 想明白、back 回到田里与落版',
    title: {label: '片名', type: 'text', default: '守株待兔', maxLength: 24, help: '开场与结尾的彩色纸块片名，每字一块'},
    titleCue: {label: '片名卡点词', type: 'text', default: '守株待兔', maxLength: 24, help: '开场念到这个词时片名纸块落下'},
    source: {label: '出处', type: 'text', default: '出自《韩非子·五蠹》', maxLength: 32, help: '片名下的小纸条'},
    openBubble: {label: '开场气泡', type: 'text', default: '?', maxLength: 4, help: '开场农夫头上的气泡字'},
    openCue: {label: '开场气泡卡点词', type: 'text', default: '兔子吗', maxLength: 16, help: '念到这个词时冒出开场气泡'},
    farmerTag: {label: '农夫名牌', type: 'text', default: '宋国 · 农夫', maxLength: 24, help: 'farmer 镜头头顶的名牌'},
    farmerCue: {label: '名牌卡点词', type: 'text', default: '宋国', maxLength: 16, help: '念到这个词时名牌弹出'},
    greenCue: {label: '禾苗闪光卡点词', type: 'text', default: '绿油油', maxLength: 16, help: '念到这个词时禾苗一闪一闪'},
    stumpTag: {label: '树桩名牌', type: 'text', default: '老树桩', maxLength: 16, help: 'stump 镜头树桩上方的名牌'},
    stumpCue: {label: '树桩落下卡点词', type: 'text', default: '老树桩', maxLength: 16, help: '念到这个词时树桩落地'},
    squashCues: {label: '树桩挤扁/变胖卡点词', type: 'list', min: 0, max: 2, maxLength: 8, default: ['矮', '粗'], help: '依次念到时树桩先压扁、再变胖'},
    stoolTag: {label: '小板凳卡片', type: 'text', default: '小板凳', maxLength: 16, help: 'stump 镜头里小板凳卡片上的字'},
    stoolCue: {label: '小板凳卡点词', type: 'text', default: '小板凳', maxLength: 16, help: '念到这个词时弹出小板凳卡片'},
    runCues: {label: '兔子奔跑卡点词', type: 'list', min: 0, max: 3, maxLength: 12, default: ['慌慌张张', '跑呀', '一不留神'],
      help: 'run 镜头：念到第一个词甩汗珠，第二个词跑得更快，第三个词进入慢镜头'},
    bonkWord: {label: '撞树拟声字', type: 'text', default: '咚！', maxLength: 6, help: 'bonk 镜头的大爆炸框字'},
    bonkCue: {label: '撞树卡点词', type: 'text', default: '咚', maxLength: 8, help: '念到这个词时兔子撞上树桩（画面震动、冒星星）'},
    starCue: {label: '加星星卡点词', type: 'text', default: '小星星', maxLength: 12, help: '念到这个词时头顶星星变多'},
    luckyCues: {label: '白捡兔子卡点词', type: 'list', min: 0, max: 4, maxLength: 12, default: ['跑来', '乐坏了', '笑开了花', '回了家'],
      help: 'lucky 镜头依次：农夫跑来、抱起兔子大笑、身边开花、蹦回家'},
    laughText: {label: '大笑字', type: 'text', default: '哈哈！', maxLength: 8, help: 'lucky 镜头农夫头旁的大字'},
    laughCue: {label: '大笑卡点词', type: 'text', default: '哈哈', maxLength: 8, help: '念到这个词时弹出大笑字'},
    dreamCue: {label: '美梦卡点词', type: 'text', default: '美梦', maxLength: 8, help: 'dream 镜头念到这个词时升起梦泡泡'},
    dreamBonk: {label: '梦里撞树卡点词', type: 'text', default: '咚', maxLength: 8, help: '梦里第 1、2、3 次念到这个词时，排队的兔子依次撞上树桩'},
    dreamWord: {label: '梦里拟声字', type: 'text', default: '咚！', maxLength: 6, help: '梦里每次撞树的小爆炸框字'},
    snore: {label: '呼噜字', type: 'text', default: 'Z', maxLength: 3, help: '睡觉时往上飘的字母'},
    throwCues: {label: '扔锄头卡点词', type: 'list', min: 0, max: 3, maxLength: 12, default: ['一扔', '一坐', '等兔子'],
      help: 'throw 镜头依次：锄头飞走、一屁股坐上树桩、冒出等待气泡'},
    waitBubble: {label: '等待气泡', type: 'text', default: '?', maxLength: 4, help: '盼兔子来时的气泡字'},
    sighBubble: {label: '失望气泡', type: 'text', default: '…', maxLength: 4, help: '兔子没来时的气泡字'},
    calTitle: {label: '日历抬头', type: 'text', default: '等兔子', maxLength: 10, help: '右上角撕页日历的红色抬头'},
    dayFormat: {label: '天数格式', type: 'text', default: '第{n}天', maxLength: 16, help: '{n} 换成天数'},
    dayCues: {label: '日夜卡点词', type: 'list', min: 0, max: 5, maxLength: 12, default: ['没来', '月亮', '两天', '三天', '一个月'],
      help: 'days 镜头依次：第一次失望、月亮升起、第 2 天、第 3 天、加速数到第 30 天'},
    monthDay: {label: '一个月是第几天', type: 'number', default: 30, min: 4, max: 99, help: 'days 镜头加速数到的天数'},
    lastDay: {label: '最后一天', type: 'number', default: 100, min: 31, max: 999, help: 'weather 镜头一路数到的天数'},
    weathers: {label: '天气', type: 'list', min: 0, max: 4, maxLength: 8, default: ['wind', 'rain', 'snow'],
      help: 'weather 镜头依次换的天气：sun 晴、wind 刮风、rain 下雨、snow 下雪'},
    weatherCues: {label: '换天气卡点词', type: 'list', min: 0, max: 4, maxLength: 12, default: ['刮风', '下雨', '下雪'], help: '念到第几个词就换成第几种天气'},
    weatherNames: {label: '天气名', type: 'list', maxLength: 8, item: [{key: 'kind', label: '天气'}, {key: 'label', label: '名字'}],
      default: [{kind: 'sun', label: '晴天'}, {kind: 'wind', label: '刮风'}, {kind: 'rain', label: '下雨'}, {kind: 'snow', label: '下雪'}], help: '日历下方小纸条显示的天气名'},
    dozeCues: {label: '打呼噜卡点词', type: 'list', min: 0, max: 3, maxLength: 12, default: ['呼噜', '蝴蝶', '鼻子'],
      help: 'doze 镜头依次：开始打呼噜吹泡泡、蝴蝶飞来、落在鼻子上'},
    grassCues: {label: '长草卡点词', type: 'list', min: 0, max: 3, maxLength: 12, default: ['越长越高', '差点', '埋起来'],
      help: '依次：野草开始猛长、长过禾苗、快把农夫埋起来'},
    ahaCues: {label: '想明白卡点词', type: 'list', min: 0, max: 4, maxLength: 12, default: ['再也没', '钻出', '挠挠头', '想明白'],
      help: 'aha 镜头依次：草丛里冒出失望气泡、农夫钻出来、挠头、头顶亮灯泡'},
    moral: {label: '寓意', type: 'list', min: 0, max: 2, maxLength: 32, item: [{key: 'text', label: '字'}, {key: 'cue', label: '卡点词'}],
      default: [{text: '好运气，不会天天来', cue: '好运气'}, {text: '想要收获，还得自己动手！', cue: '想要收获'}], help: 'aha 镜头天空里依次弹出的两行字'},
    backCue: {label: '回田卡点词', type: 'text', default: '扛起锄头', maxLength: 24, help: 'back 镜头念到这个词时农夫扛锄头往田里走、边走边锄草'},
  },
};

const GROUND = 888;
const STUMP = {x: 1040, y: 890, h: 190};
const SIT = {x: 1144, y: 892, h: 520};
const RAB = 220;
/** 兔子贴在树桩左侧时的中心 x。 */
const HIT_X = STUMP.x - STUMP.h * 1.2 / 2 - RAB * .43;

/** 镜头对准 (qx, qy)、放大 s 倍，并夹在底图范围内（不露边）。 */
function aim(s: number, qx: number, qy: number) {
  const hw = 960 / s, hh = 540 / s;
  return {s, x: clamp(qx, hw, 1920 - hw) - 960, y: clamp(qy, hh, 1080 - hh) - 540};
}
const spring = (d: number, k = 6, w = 18) => d < 0 ? 0 : Math.exp(-d * k) * Math.cos(d * w);
/** 单调卡点：保证每个点比前一个至少晚 gap 秒。 */
function chain(values: number[], gap = .25) {
  const out: number[] = [];
  values.forEach((v, i) => out.push(i ? Math.max(v, out[i - 1] + gap) : v));
  return out;
}
const cueList = (props: SceneInput, key: string) => list<string>(props, key).map(String);

// ---------------------------------------------------------------- open：开场问号 + 片名
function Open(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const q = at(txt(props, 'openCue'), 1.6), title = at(txt(props, 'titleCue'), Math.max(q + 1, dur - 2.2));
  const cam = aim(mix(1.02, 1.1, sm(t / dur)), mix(960, 900, sm(t / dur)), mix(540, 600, sm(t / dur)));
  const ring = sm((t - q - .5) / .4) * (1 - sm((t - title + .1) / .3));
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: fadeEdges(t, dur, .2, 0)}}>
    <Camera {...cam}>
      <Plate props={props} name="title" />
      <Svg>
        <Bubble x={820} y={380} text={txt(props, 'openBubble')} p={clamp((t - q) / .45) * (1 - sm((t - title + .05) / .25))} size={170} fonts={F} wobble={Math.sin(t * 3) * 4} />
        {ring > 0 && <g opacity={ring}>
          <circle cx={1010} cy={735} r={92 + 8 * Math.sin(t * 6)} fill="none" stroke={SUN} strokeWidth={10} strokeDasharray="26 18" transform={`rotate(${t * 60} 1010 735)`} />
        </g>}
      </Svg>
    </Camera>
    <div style={{position: 'absolute', inset: 0, background: `rgba(255,250,240,${.18 * sm((t - title) / .4)})`}} />
    <Svg>
      <Tiles text={txt(props, 'title')} x={960} y={250} size={150} t={t} at={title} fonts={F} />
      <Tag x={960} y={410} text={txt(props, 'source')} p={clamp((t - title - .75) / .4)} fonts={F} size={40} rot={-2} />
    </Svg>
  </div>;
}

// ---------------------------------------------------------------- farmer：农夫扛锄头下地，禾苗绿油油
function Farmer(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const tagAt = at(txt(props, 'farmerCue'), .6), green = at(txt(props, 'greenCue'), dur - 1.6);
  const arrive = Math.min(Math.max(2.4, tagAt + 1.6), dur - 1);
  const p = clamp(t / arrive), walking = p < 1;
  const x = mix(-260, 760, 1 - Math.pow(1 - p, 1.6)), steps = t * 2.6;
  const bob = walking ? -Math.abs(Math.sin(Math.PI * steps)) * 18 : -Math.abs(Math.sin(Math.PI * (t - green) * 2.2)) * 26 * win(t, green, green + .9, .1);
  const rot = walking ? Math.sin(Math.PI * steps) * 3 : 0;
  const r = seeded(31), sparks = Array.from({length: 16}, () => ({x: 860 + r() * 1000, y: 640 + r() * 360, d: r() * 1.1}));
  const sweep = clamp((t - green) / 1.2);
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(mix(1, 1.05, sm(t / dur)), 960, 560)}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t} /><SunDisc x={1530} y={mix(420, 170, out3(t / 2.2))} t={t} /></Svg>
      {sweep > 0 && sweep < 1 && <div style={{position: 'absolute', left: -600 + sweep * 2800, top: 560, width: 420, height: 560, transform: 'skewX(-24deg)',
        background: 'linear-gradient(90deg, rgba(255,255,220,0), rgba(255,255,220,.38), rgba(255,255,220,0))'}} />}
      <Sticker props={props} name="farmer-walk" x={x} y={GROUND + bob} h={560} rot={rot} />
      <Svg>
        {sparks.map((s, i) => <Twinkle key={i} x={s.x} y={s.y} p={(t - green - s.d) / .7} size={26} />)}
        <Tag x={x + 10} y={GROUND - 640 + bob} text={txt(props, 'farmerTag')} p={clamp((t - tagAt) / .4)} fonts={F} size={44} rot={-4} />
      </Svg>
    </Camera>
  </div>;
}

// ---------------------------------------------------------------- stump：老树桩落地，又矮又粗，像个小板凳
function Stool({x, y, p, text, fonts}: {x: number; y: number; p: number; text: string; fonts: any}) {
  if (p <= 0) return null;
  return <g transform={`translate(${x} ${y}) rotate(4) scale(${back(p, 2.2)})`} filter="url(#paper)">
    <rect x={-150} y={-150} width={300} height={290} rx={30} fill={PAPER} />
    <ellipse cx={0} cy={-60} rx={92} ry={26} fill="#c58b5c" stroke="#8d5a36" strokeWidth={5} />
    {[-70, -30, 30, 70].map(lx => <rect key={lx} x={lx - 8} y={-50} width={16} height={84 - Math.abs(lx) * .3} rx={6} fill="#a8703f" />)}
    <text x={0} y={105} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={50} fill={INK}>{text}</text>
  </g>;
}
function Stump(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const land = at(txt(props, 'stumpCue'), .3) + .35;
  const [c1 = '', c2 = ''] = cueList(props, 'squashCues');
  const short = at(c1, land + 1), wide = at(c2, short + .6), stool = at(txt(props, 'stoolCue'), dur - 1.4);
  const drop = clamp((t - land + .35) / .35), y = STUMP.y - (1 - drop * drop) * 640;
  const dS = t - short, dW = t - wide;
  const sy = 1 - .22 * spring(dS, 4, 14) * (dS > 0 ? 1 : 0) - (t > land ? .16 * spring(t - land, 7, 22) : 0);
  const sx = 1 + .14 * (dS > 0 ? spring(dS, 4, 14) : 0) + (dW > 0 ? .22 * Math.min(1, dW * 6) * Math.exp(-Math.max(0, dW - .4) * 2.5) : 0);
  const hop = t > stool ? -Math.abs(Math.sin((t - stool) * Math.PI * 2.6)) * 30 * Math.exp(-(t - stool) * 1.4) : 0;
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(mix(1, 1.28, sm((t - .2) / 1.6)), mix(960, 1080, sm(t / 1.6)), mix(540, 700, sm(t / 1.6)))}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t} /><SunDisc x={1530} y={170} t={t} /></Svg>
      {drop > 0 && <Sticker props={props} name="stump" x={STUMP.x} y={y + hop} h={STUMP.h} sx={sx} sy={sy} />}
      <Svg>
        <Puff x={STUMP.x} y={STUMP.y + 6} age={t - land} size={70} />
        <Tag x={STUMP.x} y={STUMP.y - 300} text={txt(props, 'stumpTag')} p={clamp((t - land - .25) / .4)} fonts={F} size={50} rot={-5} />
        <Stool x={1390} y={660} p={clamp((t - stool) / .45)} text={txt(props, 'stoolTag')} fonts={F} />
      </Svg>
    </Camera>
  </div>;
}

// ---------------------------------------------------------------- run：兔子慌慌张张跑来，一不留神
function hopPhase(t: number, marks: number[][]) {
  // marks: [[起点秒, 每秒几跳]...]，按段积分
  let ph = 0;
  for (let i = 0; i < marks.length; i++) {
    const [a, rate] = marks[i], b = i + 1 < marks.length ? marks[i + 1][0] : Infinity;
    if (t <= a) break;
    ph += (Math.min(t, b) - a) * rate;
  }
  return ph;
}
function Run(props: SceneInput) {
  const {t, at, dur} = cues(props);
  const [cSweat = '', cFast = '', cSlow = ''] = cueList(props, 'runCues');
  const sweat = at(cSweat, .6), [fast, slow] = chain([at(cFast, dur * .5), at(cSlow, dur * .7)], .4);
  const marks = [[0, 2.3], [fast, 3.2], [slow, .9]];
  const ph = hopPhase(t, marks), rate = t < fast ? 2.3 : t < slow ? 3.2 : .9;
  const frac = ph - Math.floor(ph);
  const xSlow = HIT_X - 190;
  const x = t < slow ? mix(-320, xSlow, Math.pow(clamp(t / slow), 1.15)) : mix(xSlow, HIT_X - 26, out3((t - slow) / Math.max(.3, dur - slow)));
  const lift = Math.sin(Math.PI * frac) * (t < slow ? 80 : 110);
  const landings = [Math.floor(ph), Math.floor(ph) - 1, Math.floor(ph) - 2];
  const slowK = sm((t - slow) / .35);
  const head = spot('rabbit-run', x, GROUND - lift, RAB, .78, .2);
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(mix(1.05, 1.42, slowK), mix(900, 900, slowK), mix(560, 760, slowK))}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t} /><SunDisc x={1530} y={170} t={t} /></Svg>
      <Sticker props={props} name="stump" x={STUMP.x} y={STUMP.y} h={STUMP.h} />
      <Svg>
        {landings.map(k => k >= 1 && <Puff key={k} x={x - 40} y={GROUND} age={(ph - k) / rate * (t < slow ? 1 : .5)} size={34} />)}
        <SpeedLines x={x - 40} y={GROUND - lift - 80} t={t} amount={1 - slowK} />
      </Svg>
      <Sticker props={props} name="rabbit-run" x={x} y={GROUND - lift} h={RAB} rot={-9 * Math.cos(Math.PI * frac)} />
      <Svg>{t > sweat && <Sweat x={head.x} y={head.y} t={t} />}</Svg>
    </Camera>
    {slowK > 0 && <Svg><FocusLines t={t} amount={slowK} /></Svg>}
  </div>;
}
/** 漫画集中线（慢镜头）：四周往中心的细三角，按 1/10 秒换一次形状。 */
function FocusLines({t, amount}: {t: number; amount: number}) {
  const r = seeded(70 + Math.floor(t * 10)), n = 44;
  return <g opacity={.55 * amount} fill={PAPER}>{Array.from({length: n}, (_, i) => {
    const a = i / n * Math.PI * 2 + r() * .1, r0 = 520 + r() * 140, r1 = 1300, w = .012 + r() * .014;
    const p = (rr: number, da: number) => `${960 + Math.cos(a + da) * rr * 1.25},${540 + Math.sin(a + da) * rr}`;
    return <polygon key={i} points={`${p(r0, 0)} ${p(r1, w)} ${p(r1, -w)}`} />;
  })}</g>;
}

// ---------------------------------------------------------------- bonk：咚！晕乎乎，冒星星
function Bonk(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const hit = Math.max(.08, at(txt(props, 'bonkCue'), .08)), more = at(txt(props, 'starCue'), dur - 1.6);
  const d = t - hit, xr = HIT_X - 300;
  let rabbit;
  if (d < 0) rabbit = <Sticker props={props} name="rabbit-run" x={mix(HIT_X - 26, HIT_X, clamp(t / hit))} y={GROUND - 20} h={RAB} rot={-6} />;
  else if (d < .13) rabbit = <Sticker props={props} name="rabbit-run" x={HIT_X + 14} y={GROUND - 20} h={RAB} sx={.7} sy={1.18} />;
  else if (d < .72) {
    const q = (d - .13) / .59;
    rabbit = <Sticker props={props} name="rabbit-dizzy" x={mix(HIT_X, xr, q)} y={GROUND - Math.sin(Math.PI * q) * 210} h={RAB} rot={-50 * q} />;
  } else rabbit = <Sticker props={props} name="rabbit-daze" x={xr} y={GROUND} h={RAB * 1.05} rot={Math.sin(t * 4.2) * 7}
    sy={1 - .18 * spring(d - .72, 6, 20)} sx={1 + .12 * spring(d - .72, 6, 20)} />;
  const head = spot('rabbit-daze', xr, GROUND, RAB * 1.05, .62, .05);
  const many = t >= more, starP = sm((d - .7) / .3);
  const burstFade = 1 - sm((d - 1.4) / .35);
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(1.32 - .06 * sm(d / .5), 880, 720)} shake={shake(t, hit, 30, .55)}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t} /></Svg>
      <Sticker props={props} name="stump" x={STUMP.x} y={STUMP.y} h={STUMP.h} rot={d > 0 ? 5 * spring(d, 5, 30) : 0} />
      {rabbit}
      <Svg>
        <Puff x={xr} y={GROUND} age={d - .72} size={46} />
        <StarRing x={head.x} y={head.y - 10} t={t} n={many ? 8 : 5} rx={many ? 150 : 115} ry={many ? 42 : 32} size={many ? 30 : 24} opacity={starP} />
        {d > 0 && <g opacity={burstFade}><Burst x={STUMP.x - 70} y={STUMP.y - 360} text={txt(props, 'bonkWord')} p={d / .25} fonts={F} r={150} /></g>}
      </Svg>
    </Camera>
    {d >= 0 && d < .1 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,255,255,${.5 * (1 - d / .1)})`}} />}
  </div>;
}

// ---------------------------------------------------------------- lucky：农夫跑来、抱起兔子哈哈大笑、笑开了花、蹦回家
function Lucky(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const [cRun = '', cLaugh = '', cFlower = '', cHome = ''] = cueList(props, 'luckyCues');
  const [come, laugh, flower, home] = chain([at(cRun, .3), at(cLaugh, 2), at(cFlower, dur - 3.4), at(cHome, dur - 1.8)], .4);
  const haha = at(txt(props, 'laughCue'), laugh + 1.2);
  const xr = HIT_X - 300, xf = 820;
  const p = clamp((t - come) / 1.1), running = t < laugh;
  const xRun = mix(2150, xf + 40, out3(p)), runBob = -Math.abs(Math.sin(Math.PI * t * 3.4)) * 22 * (p < 1 ? 1 : .2);
  const e = clamp((t - home) / Math.max(.6, dur - home - .1));
  const jump = -Math.abs(Math.sin(Math.PI * (t - laugh) * 2.2)) * (e > 0 ? 50 : 34);
  const lx = mix(xf - 60, 1735, sm(e)), ly = mix(GROUND, 585, sm(e)), lh = mix(600, 170, sm(e));
  const r = seeded(44), flowers = Array.from({length: 10}, (_, i) => ({a: i / 10 * Math.PI * 2 + r() * .3, rr: 270 + r() * 90, c: ['#ff8a80', '#ffd54f', '#f48fb1', '#ffab91', '#ce93d8'][i % 5], d: r() * .5}));
  const fc = {x: lx, y: ly - lh * .55};
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(1.1, mix(900, 1150, sm(e)), mix(620, 560, sm(e)))}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t} /><SunDisc x={1530} y={170} t={t} /></Svg>
      <Sticker props={props} name="stump" x={STUMP.x} y={STUMP.y} h={STUMP.h} />
      {running && <Sticker props={props} name="rabbit-daze" x={xr} y={GROUND} h={RAB * 1.05} rot={Math.sin(t * 4.2) * 7} />}
      {running && <Svg><StarRing x={xr + 30} y={GROUND - RAB * 1.05 + 10} t={t} n={6} rx={120} ry={34} size={24} /></Svg>}
      {running && <Sticker props={props} name="farmer-walk" x={xRun} y={GROUND + runBob} h={560} flip rot={Math.sin(Math.PI * t * 3.4) * 4} />}
      {running && <Svg><Bubble x={xRun - 120} y={GROUND - 640} text="!" p={clamp((t - come - 1.1) / .35)} size={110} fonts={F} tail="right" /></Svg>}
      {!running && <Sticker props={props} name="farmer-laugh" x={lx} y={ly + jump * (1 - sm(e) * .6)} h={lh} rot={Math.sin((t - laugh) * 7) * 3} />}
      {!running && <Svg>
        {flowers.map((f, i) => <Flower key={i} x={fc.x + Math.cos(f.a) * f.rr * (1 - sm(e) * .7)} y={fc.y + Math.sin(f.a) * f.rr * .8 * (1 - sm(e) * .7)}
          p={clamp((t - flower - f.d) / .45) * (1 - sm((e - .6) / .3))} t={t} color={f.c} seed={i} size={44 * (1 - sm(e) * .5)} />)}
        <g opacity={1 - sm((t - flower - .2) / .3)}><Burst x={xf + 400} y={300} text={txt(props, 'laughText')} p={(t - haha) / .3} fonts={F} r={120} rot={8} /></g>
      </Svg>}
    </Camera>
  </div>;
}

// ---------------------------------------------------------------- dream：夜里做美梦，兔子排队咚咚咚
function Dream(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts, word = txt(props, 'dreamBonk');
  const rise = at(txt(props, 'dreamCue'), .8);
  const hits = chain([0, 1, 2].map(k => at(word, rise + 1.6 + k * .55, k)), .35);
  const bp = clamp((t - rise) / .55), bk = back(bp, 1.6);
  const cx = 900, cy = 420, ms = {x: 1190, y: 600, h: 160};
  const cloudShapes = [<ellipse key="e" cx={0} cy={30} rx={560} ry={230} />, <circle key="a" cx={-330} cy={-30} r={170} />, <circle key="b" cx={-90} cy={-120} r={210} />,
    <circle key="c" cx={200} cy={-100} r={190} />, <circle key="d" cx={420} cy={0} r={160} />];
  const cloud = (k: number) => <g transform={`translate(${cx} ${cy}) scale(${k})`}>{cloudShapes}</g>;
  const done = hits.filter(h => t >= h).length;
  return <div style={{position: 'absolute', inset: 0, background: '#1a2244', overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(1.04, 980, 540)}>
      <Plate props={props} name="field" />
      <SkyTint night={.88} />
      <Svg>
        <NightStars t={t} />
        <MoonDisc x={260} y={150} />
        {[1712, 1808].map(wx => <rect key={wx} x={wx - 22} y={500} width={44} height={70} rx={6} fill="#ffcf6b" opacity={.85 + .1 * Math.sin(t * 5)} />)}
        {[0, 1, 2].map(i => {
          const q = ((t * .6) + i / 3) % 1;
          return <text key={i} x={1760 + q * 60 + i * 10} y={440 - q * 160} fontFamily={F.text} fontWeight={900} fontSize={36 + 20 * q} fill={PAPER} opacity={Math.sin(q * Math.PI)}>{txt(props, 'snore')}</text>;
        })}
        {bp > 0 && <g>
          {[0, 1, 2].map(i => <circle key={i} cx={mix(1700, 1420, i / 2)} cy={mix(420, 560, i / 2) - i * 30} r={18 + i * 12} fill={PAPER} opacity={clamp((t - rise - i * .08) / .2)} />)}
          <defs><clipPath id="dreamclip" transform={`translate(${cx} ${cy}) scale(${bk})`}>{cloudShapes}</clipPath></defs>
          <g fill={PAPER} filter="url(#paper)">{cloud(bk * 1.03)}</g>
          <g clipPath="url(#dreamclip)">
            <rect x={0} y={0} width={1920} height={1080} fill="#bfe8fb" />
            <ellipse cx={cx} cy={cy + 330} rx={900} ry={220} fill="#9ccc65" />
            <ellipse cx={cx} cy={cy + 390} rx={900} ry={200} fill="#8bc34a" />
          </g>
        </g>}
      </Svg>
      {bp > .5 && <div style={{position: 'absolute', inset: 0, clipPath: 'url(#dreamclip)'}}>
        <Sticker props={props} name="stump" x={ms.x} y={ms.y} h={ms.h} rot={hits.reduce((s, h) => s + (t > h ? 5 * spring(t - h, 6, 30) : 0), 0)} />
        {[0, 1, 2, 3].map(k => {
          const hitAt = hits[k] ?? Infinity, slot = k - hits.filter(h => t >= h + .1).length;
          if (t >= hitAt + .1) {           // 撞完：弹到树桩右边，晕乎乎坐成一排
            const q = clamp((t - hitAt - .1) / .5), px = ms.x + 150 + k * 80;
            return <Sticker key={k} props={props} name="rabbit-daze" x={mix(ms.x - 60, px, q)} y={ms.y - Math.sin(Math.PI * q) * 140} h={128} rot={Math.sin(t * 5 + k) * 8} />;
          }
          const qx = ms.x - 175 - Math.max(0, slot) * 150, lead = clamp((t - hitAt + .28) / .28);
          const x = slot <= 0 ? mix(qx, ms.x - 92, lead) : qx, hopY = Math.abs(Math.sin((t + k * .3) * Math.PI * 2.4)) * 26;
          return <Sticker key={k} props={props} name="rabbit-run" x={x} y={ms.y - hopY} h={124} />;
        })}
      </div>}
      {bp > .5 && <Svg>
        {hits.map((h, k) => t >= h && t < h + .8 && <Burst key={k} x={ms.x - 40} y={ms.y - 190} text={txt(props, 'dreamWord')} p={(t - h) / .2} fonts={F} r={62} rot={-10 + k * 9} />)}
        {done > 0 && <StarRing x={ms.x + 210} y={ms.y - 120} t={t} n={4 + done} rx={130} ry={24} size={16} />}
      </Svg>}
    </Camera>
  </div>;
}

// ---------------------------------------------------------------- throw：锄头一扔，往树桩边一坐，等兔子
function Throw(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const [cThrow = '', cSit = '', cWait = ''] = cueList(props, 'throwCues');
  const [toss, sit, wait] = chain([at(cThrow, 1.6), at(cSit, 2.6), at(cWait, 3.4)], .45);
  const xa = 820, walkP = clamp(t / Math.max(.6, toss - .1));
  const xw = mix(-240, xa, 1 - Math.pow(1 - walkP, 1.5)), bob = walkP < 1 ? -Math.abs(Math.sin(Math.PI * t * 2.8)) * 16 : 0;
  const hq = clamp((t - toss) / 1.1), hoe = {x: mix(xa - 40, -260, hq), y: mix(560, -40, hq) - Math.sin(Math.PI * hq) * 260};
  const jump = clamp((t - sit + .3) / .3);
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(1.08, 980, 600)}>
      <Plate props={props} name="field" />
      <SkyTint dusk={.45 * (1 - sm(t / 2.5))} />
      <Svg><Clouds t={t + 40} /><SunDisc x={1530} y={mix(330, 200, sm(t / dur))} t={t} /></Svg>
      {t < sit && <Sticker props={props} name="stump" x={STUMP.x} y={STUMP.y} h={STUMP.h} />}
      {t < toss && <Sticker props={props} name="farmer-walk" x={xw} y={GROUND + bob} h={560} rot={walkP < 1 ? Math.sin(Math.PI * t * 2.8) * 3 : 0} />}
      {t >= toss && t < sit && <Sticker props={props} name="farmer-throw" x={mix(xa, SIT.x - 40, sm(jump))} y={GROUND - Math.sin(Math.PI * jump) * 90} h={560} />}
      {t >= sit && <Sticker props={props} name="farmer-sit" x={SIT.x} y={SIT.y} h={SIT.h} sy={1 - .14 * spring(t - sit, 6, 20)} sx={1 + .08 * spring(t - sit, 6, 20)} />}
      <Svg>
        {t >= toss && hq < 1 && <Hoe x={hoe.x} y={hoe.y} rot={-hq * 900} scale={.9} />}
        <Puff x={STUMP.x + 40} y={STUMP.y + 4} age={t - sit} size={60} />
        <Bubble x={SIT.x + 230} y={SIT.y - 600} text={txt(props, 'waitBubble')} p={clamp((t - wait) / .4)} size={120} fonts={F} wobble={Math.sin(t * 3) * 5} />
      </Svg>
    </Camera>
  </div>;
}

// ---------------------------------------------------------------- days / weather：日夜循环、日历越翻越快、天气随旁白换
const WEATHER_TINT: Record<string, {grey?: number; cold?: number; dusk?: number}> = {sun: {}, wind: {}, rain: {grey: 1}, snow: {grey: .35, cold: 1}};
function sky(day: number, rate: number, settle: number) {
  const frac = day - Math.floor(day);
  const nightRaw = sm((frac - .45) / .1) - sm((frac - .93) / .07);
  const duskRaw = Math.max(0, 1 - Math.abs(frac - .5) / .09) + Math.max(0, 1 - frac / .07) + Math.max(0, 1 - (1 - frac) / .07);
  const amp = Math.max(settle, clamp((1.3 - rate) / .9));   // 天数飞快时不闪：天空停在柔和的黄昏色，只有日历在翻
  return {frac, night: nightRaw * amp + .28 * (1 - amp), dusk: Math.min(1, duskRaw) * amp + .35 * (1 - amp), orbit: amp};
}
function Orbit({frac, opacity, t}: {frac: number; opacity: number; t: number}) {
  if (opacity <= 0) return null;
  const sunUp = frac < .5, q = sunUp ? frac * 2 : (frac - .5) * 2, a = Math.PI * (1 - q);
  const x = 960 + Math.cos(a) * 860, y = 720 - Math.sin(a) * 580;
  return sunUp ? <SunDisc x={x} y={y} t={t} opacity={opacity} /> : <MoonDisc x={x} y={y} opacity={opacity} />;
}
function Days(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const [cSigh = '', cMoon = '', c2 = '', c3 = '', cMonth = ''] = cueList(props, 'dayCues');
  const month = Math.max(4, Number(props.params.monthDay ?? 30) || 30);
  const [sigh, moon, two, three, end] = chain([at(cSigh, 1.4), at(cMoon, 2.6), at(c2, 4.6), at(c3, 5.4), at(cMonth, dur - 1.2)], .3);
  const {day, rate} = dayClock(t, [[0, 1], [moon, 1.5], [two, 2], [three, 3], [end, month]], 2.2);
  const settle = t > end ? sm((t - end) / .7) : 0;
  const s = sky(day, rate, settle);
  const fast = rate > 1.3 && settle < .5;
  let bubble = txt(props, 'sighBubble'), since = 1;
  if (!fast && day < 2) {const hope = t < sigh; bubble = txt(props, hope ? 'waitBubble' : 'sighBubble'); since = hope ? t - .2 : t - sigh;}
  else if (!fast) {const hope = s.frac < .3; bubble = txt(props, hope ? 'waitBubble' : 'sighBubble'); since = (s.frac - (hope ? 0 : .3)) / Math.max(rate, .01);}
  const pulse = t > end ? 1 + .14 * spring(t - end, 5, 16) : 1;
  const growth = .04 + .22 * clamp((day - 1) / (month - 1));
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(1.04, 960, 560)}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={day * 7} speed={30} /></Svg>
      <SkyTint night={s.night} dusk={s.dusk * .8} />
      <Svg><NightStars t={t} opacity={s.night * s.orbit} /><Orbit frac={s.frac} opacity={s.orbit} t={t} /></Svg>
      <Sticker props={props} name="farmer-sit" x={SIT.x} y={SIT.y} h={SIT.h} sy={1 + .012 * Math.sin(t * 2.4)} />
      <Grass t={t} growth={growth} />
      <Svg><Bubble x={SIT.x + 230} y={SIT.y - 600} text={bubble} p={clamp(since / .35)} size={110} fonts={F} wobble={Math.sin(t * 3) * 5} /></Svg>
    </Camera>
    <Svg><g transform={`translate(1710 200) scale(${pulse}) translate(-1710 -200)`}>
      <Calendar day={day} rate={Math.max(rate, .5)} fonts={F} format={txt(props, 'dayFormat')} title={txt(props, 'calTitle')} opacity={sm(t / .3)} />
    </g></Svg>
  </div>;
}
function Weather(props: SceneInput) {
  const {t, at, endAll, dur} = cues(props), F = props.fonts;
  const month = Math.max(4, Number(props.params.monthDay ?? 30) || 30), last = Math.max(month + 1, Number(props.params.lastDay ?? 100) || 100);
  const kinds = list<string>(props, 'weathers').map(String), words = cueList(props, 'weatherCues');
  const marks = chain(kinds.map((_, i) => at(words[i] ?? '', .2 + i * 1.6)), .4);
  let wi = -1; marks.forEach((m, i) => {if (t >= m - .05) wi = i;});
  const kind = wi < 0 ? 'sun' : kinds[wi] ?? 'sun', since = wi < 0 ? t : t - marks[wi];
  const prevKind = wi <= 0 ? 'sun' : kinds[wi - 1] ?? 'sun', k = sm(since / .45);
  const stop = Math.min(dur - .3, endAll(dur - .6) + .2);
  const {day, rate} = dayClock(t, [[0, month], [stop, last]], 1.25);
  const tint = (key: 'grey' | 'cold') => mix(WEATHER_TINT[prevKind]?.[key] ?? 0, WEATHER_TINT[kind]?.[key] ?? 0, k);
  const amountOf = (w: string) => (kind === w ? k : 0) + (prevKind === w && kind !== w ? 1 - k : 0);
  const snowAt = marks[kinds.indexOf('snow')] ?? Infinity, snowK = clamp((t - snowAt) / 2.2);
  const nameOf = (w: string) => list<{kind: string; label: string}>(props, 'weatherNames').find(item => item?.kind === w)?.label ?? '';
  const settle = t > stop ? sm((t - stop) / .6) : 0;
  const hat = spot('farmer-sit', SIT.x, SIT.y, SIT.h, .6, .035);
  const shiver = amountOf('snow') * Math.sin(t * 46) * 2.5;
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(1.04, 960, 560)}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={day * 7} speed={30} dark={tint('grey')} /></Svg>
      <SkyTint night={.28 * (1 - settle)} dusk={.35 * (1 - settle) * (1 - tint('grey'))} grey={tint('grey')} cold={tint('cold')} />
      {snowK > 0 && <Svg><path d={`M -40 1120 L -40 ${mix(1090, 900, snowK)} ${Array.from({length: 13}, (_, i) => `Q ${i * 160 + 80} ${mix(1090, 900, snowK) - 26} ${i * 160 + 160} ${mix(1090, 900, snowK)}`).join(' ')} L 1990 1120 Z`}
        fill="#f7fbff" opacity={.92} /></Svg>}
      <Sticker props={props} name="farmer-sit" x={SIT.x + shiver} y={SIT.y} h={SIT.h} />
      {snowK > 0 && <Svg><ellipse cx={hat.x + shiver} cy={hat.y + 34} rx={70 * snowK + 20} ry={26 * snowK + 8} fill="#ffffff" stroke="#dfe9f5" strokeWidth={3} /></Svg>}
      <Grass t={t} growth={.26 + .2 * clamp(t / dur)} sway={1 + 2.2 * amountOf('wind')} />
      <Svg><Wind t={t} amount={amountOf('wind')} /></Svg>
      {amountOf('rain') > 0 && <div style={{position: 'absolute', inset: 0, opacity: amountOf('rain')}}><Rain frame={props.frame} /></div>}
      {amountOf('snow') > 0 && <div style={{position: 'absolute', inset: 0, opacity: amountOf('snow')}}><Snow frame={props.frame} /></div>}
      <Svg><Bubble x={SIT.x + 230} y={SIT.y - 600} text={txt(props, 'sighBubble')} p={1} size={110} fonts={F} wobble={Math.sin(t * 3) * 5} /></Svg>
    </Camera>
    <Svg>
      <Calendar day={day} rate={Math.max(rate, .5)} fonts={F} format={txt(props, 'dayFormat')} title={txt(props, 'calTitle')} />
      {wi >= 0 && <Tag key={wi} x={1710} y={380} text={nameOf(kind)} p={clamp(since / .35)} fonts={F} size={44} rot={-3}
        fill={kind === 'rain' ? '#4fa3e0' : kind === 'snow' ? '#90caf9' : kind === 'wind' ? '#66bb6a' : SUN} color={PAPER} />}
    </Svg>
  </div>;
}

// ---------------------------------------------------------------- doze：打呼噜吹泡泡，蝴蝶落鼻尖，野草越长越高
const SLEEP = {x: 1110, y: 892, h: 470};
function Doze(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const [cSnore = '', cFly = '', cNose = ''] = cueList(props, 'dozeCues');
  const [g1w = '', g2w = '', g3w = ''] = cueList(props, 'grassCues');
  const [snore, fly, land] = chain([at(cSnore, .9), at(cFly, 2), at(cNose, 3)], .8);
  const [g1, g2, g3] = chain([at(g1w, land + 1.2), at(g2w, land + 2.4), at(g3w, dur - 1.4)], .5);
  const nose = spot('farmer-sleep', SLEEP.x, SLEEP.y, SLEEP.h, .665, .305);
  const cyc = (t - snore) / 2.1, breath = .5 - .5 * Math.cos(cyc * Math.PI * 2);
  const popped = t >= land, br = t > snore ? 6 + 30 * breath * sm((t - snore) / .5) : 0;
  const fq = clamp((t - fly) / Math.max(.5, land - fly));
  const bx = mix(380, nose.x + 4, fq) + Math.sin(fq * 9) * 70 * (1 - fq), by = mix(260, nose.y - 30, fq) + Math.cos(fq * 7) * 60 * (1 - fq);
  const growth = t < g1 ? .46 : t < g2 ? mix(.46, .82, sm((t - g1) / (g2 - g1))) : mix(.82, 1, sm((t - g2) / Math.max(.4, g3 - g2 + .3)));
  const covered = sm((t - g2 - .2) / .6);
  const lift = {x: bx + covered * 60, y: by - covered * 190 + Math.sin(t * 3) * 10 * covered};
  const zoom = sm((t - g1) / 1.6);
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(mix(1.34, 1.0, zoom), mix(1080, 960, zoom), mix(620, 540, zoom))}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t + 80} /><SunDisc x={1530} y={170} t={t} /></Svg>
      <Sticker props={props} name="farmer-sleep" x={SLEEP.x} y={SLEEP.y} h={SLEEP.h} sy={1 + .015 * breath} />
      <Svg>
        {!popped && br > 0 && <g>
          <circle cx={nose.x + br * .75} cy={nose.y + br * .55} r={br} fill="rgba(170,220,255,.55)" stroke={PAPER} strokeWidth={3} />
          <circle cx={nose.x + br * .5} cy={nose.y + br * .25} r={br * .22} fill={PAPER} opacity={.9} />
        </g>}
        {popped && t < land + .3 && <g stroke={PAPER} strokeWidth={5} strokeLinecap="round" opacity={1 - (t - land) / .3}>
          {[0, 1, 2, 3, 4, 5].map(i => {const a = i * Math.PI / 3, r0 = 14 + (t - land) * 80; return <line key={i} x1={nose.x + 20 + Math.cos(a) * r0} y1={nose.y + 14 + Math.sin(a) * r0} x2={nose.x + 20 + Math.cos(a) * (r0 + 16)} y2={nose.y + 14 + Math.sin(a) * (r0 + 16)} />;})}
        </g>}
        {t > snore && [0, 1, 2].map(i => {
          const q = ((t - snore) * .55 + i / 3) % 1;
          return <text key={i} x={nose.x + 40 + q * 120 + i * 12} y={nose.y - 60 - q * 220} fontFamily={F.text} fontWeight={900} fontSize={40 + 34 * q} fill="#4fa3e0"
            stroke={PAPER} strokeWidth={8} paintOrder="stroke" opacity={Math.sin(q * Math.PI) * (1 - covered)}>{txt(props, 'snore')}</text>;
        })}
      </Svg>
      <Grass t={t} growth={growth} />
      <Svg>{t > fly && <Butterfly x={lift.x} y={lift.y} t={t} flap={fq < 1 || covered > 0 ? 1 : .2} scale={.72} rot={fq < 1 ? Math.sin(t * 4) * 15 : -8} />}</Svg>
    </Camera>
  </div>;
}

// ---------------------------------------------------------------- aha：兔子再没来；农夫钻出草丛，挠头，想明白了
function Aha(props: SceneInput) {
  const {t, at, dur} = cues(props), F = props.fonts;
  const [cSigh = '', cPop = '', cScratch = '', cBulb = ''] = cueList(props, 'ahaCues');
  const [sigh, pop, scratch, bulb] = chain([at(cSigh, .5), at(cPop, 2.6), at(cScratch, 3.6), at(cBulb, 4.6)], .4);
  const morals = list<{text: string; cue: string}>(props, 'moral');
  const xa = 1120, rise = clamp((t - pop) / .55), y = mix(1500, GROUND, back(rise, 1.4));
  const ds = t - scratch, wiggle = ds > 0 ? Math.sin(ds * 16) * 5 * Math.exp(-ds * 1.2) : 0;
  const rustle = t > pop ? Math.exp(-(t - pop) * 2.5) * 3 : 0;
  const head = spot('farmer-aha', xa, y, 560, .42, 0);
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: 1}}>
    <Camera {...aim(1.02, 960, 540)}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t + 120} /><SunDisc x={1530} y={170} t={t} /></Svg>
      <Grass t={t} growth={1} sway={1 + rustle} />
      {t > pop && <Sticker props={props} name="farmer-aha" x={xa} y={y} h={560} rot={wiggle} />}
      <Svg>
        <Bubble x={xa + 90} y={430} text={txt(props, 'sighBubble')} p={clamp((t - sigh) / .4) * (1 - sm((t - pop) / .2))} size={110} fonts={F} tail="left" />
        <Bulb x={head.x + 10} y={head.y - 70} p={clamp((t - bulb) / .4)} t={t} />
        {morals.slice(0, 2).map((m, i) => <Tag key={i} x={600} y={165 + i * 175} text={String(m?.text ?? '')} p={clamp((t - at(String(m?.cue ?? ''), bulb + .8 + i * 1.4)) / .4)}
          fonts={F} size={i ? 60 : 64} rot={i ? 2 : -3} color={i ? PAPER : INK} fill={i ? CORAL : PAPER} />)}
      </Svg>
    </Camera>
  </div>;
}

// ---------------------------------------------------------------- back：扛起锄头回到田里，边走边锄草，落版
function Back(props: SceneInput) {
  const {t, at, endAll, dur} = cues(props), F = props.fonts;
  const go = at(txt(props, 'backCue'), .2), stopT = Math.min(dur - 1.2, endAll(dur - 2.4) + 1.6);
  const p = clamp((t - go) / Math.max(1, stopT - go)), x = mix(-200, 1460, p), walking = p < 1;
  const bob = walking ? -Math.abs(Math.sin(Math.PI * t * 2.6)) * 16 : 0;
  const title = endAll(dur - 2.4) + .3;
  const r = seeded(52), sparks = Array.from({length: 18}, () => ({x: 200 + r() * 1700, y: 640 + r() * 380}));
  return <div style={{position: 'absolute', inset: 0, background: SKY, overflow: 'hidden', opacity: fadeEdges(t, dur, 0, .3)}}>
    <Camera {...aim(1.02, 960, 540)}>
      <Plate props={props} name="field" />
      <Svg><Clouds t={t + 160} /><SunDisc x={1530} y={mix(260, 170, sm(t / 2))} r={78} t={t} /></Svg>
      <Grass t={t} growth={1} clearTo={x - 70} />
      <Svg>{sparks.map((s, i) => <Twinkle key={i} x={s.x} y={s.y} p={(t - go - (s.x + 70 + 200) / (1660 / Math.max(1, stopT - go))) / .7 + 0} size={24} />)}</Svg>
      <Sticker props={props} name="farmer-walk" x={x} y={GROUND + bob} h={560} rot={walking ? Math.sin(Math.PI * t * 2.6) * 3 : 0} />
    </Camera>
    <div style={{position: 'absolute', inset: 0, background: `rgba(255,250,240,${.16 * sm((t - title) / .4)})`}} />
    <Svg>
      <Tiles text={txt(props, 'title')} x={960} y={250} size={150} t={t} at={title} fonts={F} />
      <Tag x={960} y={410} text={txt(props, 'source')} p={clamp((t - title - .75) / .4)} fonts={F} size={40} rot={-2} />
    </Svg>
  </div>;
}

const SHOTS: Record<string, (props: SceneInput) => any> = {open: Open, farmer: Farmer, stump: Stump, run: Run, bonk: Bonk, lucky: Lucky, dream: Dream,
  throw: Throw, days: Days, weather: Weather, doze: Doze, aha: Aha, back: Back};
export default function Tale(props: SceneInput) {
  const shot = SHOTS[String(props.params.shot ?? 'open')] ?? Open;
  return shot(props);
}
