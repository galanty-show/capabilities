import React from 'react';
import {Media, clamp, easeInOut, seeded, useScene, type SceneInput} from '@talkframe/scene';

// 《曹冲称象》共用画面库（绘本风）。prepare.py 把它和每个模块正文拼成 scenes/<module>.tsx，
// 并把该模块用到的底图/贴纸以 WebP data URI 内联进 MEDIA；运行时无随机、无时钟、无网络。
const W = 1920, H = 1080;
const INK = '#5b3a24', CREAM = '#fff7e8', SUN = '#ffc93c', PEACH = '#ff9f6b', SKY = '#4fb3e8', LEAF = '#7cc66b',
  ROSE = '#ff6f91', BERRY = '#e8475f', GOLD = '#ffb627', WATER = '#5cc3e6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
/** 回弹入场：0→1 略冲过头再落定。 */
const pop = (v: number) => {const p = clamp(v), c = 1.9; return p >= 1 ? 1 : 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);};
/** 弹簧：从 0 到 1，带两三下衰减晃动。 */
const spring = (v: number, k = 9, damp = 4.5) => v <= 0 ? 0 : 1 - Math.exp(-damp * v) * Math.cos(k * v);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// 制作任务与随包样片都把底图内联在这里（prepare.py 按模块只放用到的）；分镜里同名素材槽优先。
const MEDIA: Record<string, string> = /* MEDIA */ {"moral":"release-assets/d444534a5e78e5abea338eed9a33eb18aaa3cb4bee58b15c6fc9fc6e4622f2c9.webp","praise":"release-assets/56de890e58e75ef6317977d85c1658704614042d196b3292f9d45724bd13b1d6.webp"};
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}

/** 文字参数：props 里写了就用，否则用本模块 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value as T[] : (meta as any).params?.[key]?.default ?? [];
}
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

/** 满幅底图 + 运镜（scale/位移随整幕缓动）。 */
function Plate({asset, frame, p, from = [1.03, 0, 0], to = [1.1, -20, -8], origin = '50% 50%', opacity = 1}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; origin?: string; opacity?: number}) {
  const k = easeInOut(p);
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: origin}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 贴纸（透明底角色图）：左上角 x,y、宽 w（高按图比例 ratio = 高/宽），可翻转、旋转（绕底边中点）。 */
function Sticker({asset, frame, x, y, w, ratio, flip = false, rotate = 0, opacity = 1, origin = '50% 100%', scale = 1}:
  {asset: any; frame: number; x: number; y: number; w: number; ratio: number; flip?: boolean; rotate?: number; opacity?: number; origin?: string; scale?: number}) {
  if (!asset || opacity <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: w * ratio, opacity,
    transform: `rotate(${rotate}deg) scale(${scale}) scaleX(${flip ? -1 : 1})`, transformOrigin: origin}}>
    <Media asset={asset} frame={frame} fit="contain" style={{width: '100%', height: '100%'}} />
  </div>;
}
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** 贴纸字：粗体、白色厚描边、彩色填充、柔和投影；逐字弹出（p 为整句进度 0→1）。 */
/** 西文字宽估算（em，粗体无衬线）：只给不含汉字的文字排版用，汉字路径不读它。 */
const latinWidth = (ch: string) => /[il.,:;!|'’]/.test(ch) ? .3 : /[fjtr()]/.test(ch) ? .4 : /[mw]/.test(ch) ? .88 : /[MW]/.test(ch) ? .95
  : /[A-Z]/.test(ch) ? .7 : /[0-9]/.test(ch) ? .6 : ch === ' ' ? .26 : /[?]/.test(ch) ? .5 : /[—–]/.test(ch) ? .7 : .6;
const latinEm = (text: string) => Array.from(text).reduce((s, ch) => s + latinWidth(ch), 0);
/** 含汉字原样返回字号；纯西文按估算字宽把字号收进 maxWidth。 */
const fitSize = (text: string, size: number, maxWidth: number) => /[㐀-鿿]/.test(text) || !text ? size : Math.min(size, maxWidth / Math.max(1, latinEm(text)));
function Sticky({text, x, y, size, fill = SUN, stroke = '#fff', p = 1, fonts, anchor = 'middle', spacing = .04, outline = INK, tilt = 0, maxWidth = Infinity}:
  {text: string; x: number; y: number; size: number; fill?: string; stroke?: string; p?: number; fonts: any; anchor?: 'start' | 'middle' | 'end';
    spacing?: number; outline?: string; tilt?: number; maxWidth?: number}) {
  if (!text) return null;
  if (!/[㐀-鿿]/.test(text)) {
    // 西文：整行一个 text（字距、词距交给字体），整行弹出；超出 maxWidth 时按估算字宽缩字号。逐字摆放会因字宽不等挤叠。
    const sz = Math.min(size, maxWidth / Math.max(.1, latinEm(text))), q = clamp(p * 1.25);
    if (q <= 0) return null;
    const sc = pop(q / .85), rot = -(tilt * .4 + 3 * (1 - out3(q)));
    return <g style={{filter: 'drop-shadow(0 8px 10px rgba(91,58,36,.28))'}} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      <text x={0} y={sz * .36} textAnchor={anchor} fontFamily={fonts?.text} fontWeight={900} fontSize={sz} letterSpacing={sz * spacing * .5}
        stroke={outline} strokeWidth={sz * .2} strokeLinejoin="round" paintOrder="stroke" fill={outline}>{text}</text>
      <text x={0} y={sz * .36} textAnchor={anchor} fontFamily={fonts?.text} fontWeight={900} fontSize={sz} letterSpacing={sz * spacing * .5}
        stroke={stroke} strokeWidth={sz * .12} strokeLinejoin="round" paintOrder="stroke" fill={fill}>{text}</text>
    </g>;
  }
  const chars = Array.from(text), adv = size * (1 + spacing);
  const width = chars.reduce((w, ch) => w + (/[㐀-鿿！-～，。！？：、]/.test(ch) ? adv : adv * .58), 0);
  let cx = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  return <g style={{filter: 'drop-shadow(0 8px 10px rgba(91,58,36,.28))'}}>{chars.map((ch, i) => {
    const w = /[㐀-鿿！-～，。！？：、]/.test(ch) ? adv : adv * .58, left = cx;
    cx += w;
    const q = clamp(p * chars.length * 1.25 - i * 1.0);
    if (q <= 0) return null;
    const sc = pop(q / .85), rot = (i % 2 ? 1 : -1) * (tilt + 4 * (1 - out3(q)));
    return <g key={i} transform={`translate(${left + w / 2} ${y}) rotate(${rot}) scale(${sc})`}>
      <text x={0} y={size * .36} textAnchor="middle" fontFamily={fonts?.text} fontWeight={900} fontSize={size}
        stroke={outline} strokeWidth={size * .2} strokeLinejoin="round" paintOrder="stroke" fill={outline}>{ch}</text>
      <text x={0} y={size * .36} textAnchor="middle" fontFamily={fonts?.text} fontWeight={900} fontSize={size}
        stroke={stroke} strokeWidth={size * .12} strokeLinejoin="round" paintOrder="stroke" fill={fill}>{ch}</text>
    </g>;
  })}</g>;
}
/** 说话/想法气泡：圆角框 + 尾巴（tail 指向的点），thought 为一串小圆。p 为弹出进度。 */
function Bubble({x, y, w, h, tail, p, thought = false, fill = CREAM, children}:
  {x: number; y: number; w: number; h: number; tail?: [number, number]; p: number; thought?: boolean; fill?: string; children?: any}) {
  if (p <= 0) return null;
  const cx = x + w / 2, cy = y + h / 2, sc = pop(p);
  const r = Math.min(h / 2, 70);
  let tailPath = '';
  if (tail && !thought) {
    const bx = clamp(tail[0], x + r, x + w - r), by = tail[1] > cy ? y + h - 4 : y + 4, half = 34;
    tailPath = `M ${bx - half} ${by} Q ${(bx + tail[0]) / 2} ${(by + tail[1]) / 2} ${tail[0]} ${tail[1]} Q ${bx + 10} ${(by + tail[1]) / 2} ${bx + half} ${by} Z`;
  }
  return <g transform={`translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`} opacity={clamp(p * 4)}>
    {thought && tail && [0, 1, 2].map(i => {
      const k = .25 + i * .28, px = mix(tail[0], cx, 1 - k), py = mix(tail[1], y + h, 1 - k);
      return <circle key={i} cx={px} cy={py} r={10 + i * 8} fill={fill} stroke={INK} strokeWidth={5} />;
    })}
    {tailPath && <path d={tailPath} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />}
    <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={INK} strokeWidth={6} />
    {tailPath && <path d={tailPath} fill={fill} stroke="none" transform="translate(0 -3)" />}
    {children}
  </g>;
}
/** 四角星闪光。 */
const Star = ({x, y, r, fill = '#fff6c9', rot = 0, opacity = 1}: {x: number; y: number; r: number; fill?: string; rot?: number; opacity?: number}) =>
  r <= 0 ? null : <path transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity} fill={fill}
    d={`M 0 ${-r} Q ${r * .16} ${-r * .16} ${r} 0 Q ${r * .16} ${r * .16} 0 ${r} Q ${-r * .16} ${r * .16} ${-r} 0 Q ${-r * .16} ${-r * .16} 0 ${-r} Z`} />;
/** 一圈闪光：at 秒起向外散开再消失。 */
function Burst({t, at, x, y, n = 10, radius = 160, seed = 1, colors = ['#fff6c9', SUN, ROSE, SKY, LEAF]}:
  {t: number; at: number; x: number; y: number; n?: number; radius?: number; seed?: number; colors?: string[]}) {
  const d = t - at;
  if (d < 0 || d > 1.2) return null;
  const r = seeded(seed), k = out3(d / .9), fade = 1 - sm((d - .6) / .6);
  return <g>{Array.from({length: n}, (_, i) => {
    const a = i / n * Math.PI * 2 + r() * .5, dist = radius * (.55 + .6 * r()) * k, size = (14 + 16 * r()) * (1 - .4 * k);
    return <Star key={i} x={x + Math.cos(a) * dist} y={y + Math.sin(a) * dist} r={size} fill={colors[i % colors.length]} rot={d * 200 + i * 20} opacity={fade} />;
  })}</g>;
}
/** 慢慢闪烁的小星点（seeded 位置）。 */
function Twinkles({t, n = 18, seed = 3, box = [0, 0, W, H], color = '#fffbe6', amount = 1}:
  {t: number; n?: number; seed?: number; box?: number[]; color?: string; amount?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed);
  return <g opacity={amount}>{Array.from({length: n}, (_, i) => {
    const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), ph = r() * 6.28, sz = 6 + r() * 12;
    const tw = Math.pow(Math.max(0, Math.sin(t * 2.2 + ph)), 3);
    return <Star key={i} x={x} y={y} r={sz * (.4 + .6 * tw)} fill={color} rot={20} opacity={.25 + .75 * tw} />;
  })}</g>;
}
/** 五彩纸屑：at 秒起从上方飘落。 */
function Confetti({t, at, n = 70, seed = 9}: {t: number; at: number; n?: number; seed?: number}) {
  const d = t - at;
  if (d < 0) return null;
  const r = seeded(seed), colors = [SUN, ROSE, SKY, LEAF, PEACH, '#b28dff'];
  return <g>{Array.from({length: n}, (_, i) => {
    const x0 = r() * W, delay = r() * .8, v = 260 + r() * 260, sway = 30 + r() * 50, ph = r() * 6.28, w = 14 + r() * 12, c = colors[i % colors.length];
    const k = d - delay;
    if (k < 0) return null;
    const y = -40 + v * k, x = x0 + Math.sin(k * 3 + ph) * sway;
    if (y > H + 40) return null;
    return <rect key={i} x={-w / 2} y={-w * .3} width={w} height={w * .6} rx={3} fill={c}
      transform={`translate(${x} ${y}) rotate(${k * 260 + ph * 40})`} />;
  })}</g>;
}
/** 卡通手指（指尖在 x,y，朝 angle 度方向指）：点两下的动作 p∈[0,1] 循环。 */
function Pointer({x, y, angle = 0, p = 1, tap = 0, scale = 1}: {x: number; y: number; angle?: number; p?: number; tap?: number; scale?: number}) {
  if (p <= 0) return null;
  const push = Math.sin(tap * Math.PI * 2) * 14;
  return <g transform={`translate(${x} ${y}) rotate(${angle}) translate(${-push - 6} 0) scale(${pop(p) * scale})`} opacity={clamp(p * 3)}>
    <g transform="translate(-200 -46)" stroke={INK} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
      <path d="M 196 32 C 210 30 214 54 198 58 L 120 60 L 120 34 Z" fill="#ffd9b8" />
      <path d="M 40 22 C 60 6 96 18 122 24 L 122 108 C 98 118 58 112 40 100 C 22 90 18 40 40 22 Z" fill="#ffd9b8" />
      <path d="M 104 60 C 132 58 140 82 108 84" fill="#ffd9b8" />
      <path d="M 104 84 C 128 84 132 104 104 106" fill="#ffd9b8" />
      <path d="M 18 34 L -40 30 L -40 104 L 22 100" fill={SKY} />
    </g>
  </g>;
}
/** 灯泡（想到办法）：on 0→1 亮起，带光芒。 */
function Bulb({x, y, size = 1, on = 1, p = 1}: {x: number; y: number; size?: number; on?: number; p?: number}) {
  if (p <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${pop(p) * size})`} opacity={clamp(p * 3)}>
    {Array.from({length: 8}, (_, i) => {const a = i * Math.PI / 4 - Math.PI / 2; return <line key={i} x1={Math.cos(a) * 78} y1={Math.sin(a) * 78 - 10}
      x2={Math.cos(a) * (96 + 14 * on)} y2={Math.sin(a) * (96 + 14 * on) - 10} stroke={GOLD} strokeWidth={10} strokeLinecap="round" opacity={on} />;})}
    <circle cx={0} cy={-10} r={74} fill={GOLD} opacity={.35 * on} />
    <path d="M -46 -10 C -46 -78 46 -78 46 -10 C 46 16 26 26 22 46 L -22 46 C -26 26 -46 16 -46 -10 Z" fill={on > .5 ? '#fff3a6' : '#f4efe2'} stroke={INK} strokeWidth={7} />
    <rect x={-24} y={48} width={48} height={22} rx={6} fill="#b9c4cf" stroke={INK} strokeWidth={6} />
    <path d="M -12 30 L -6 4 L 0 22 L 6 4 L 12 30" fill="none" stroke={INK} strokeWidth={4} opacity={.6} />
  </g>;
}
/** 浮起的问号（seeded 的摇摆）。 */
const QMark = ({x, y, size = 80, p = 1, color = ROSE, fonts, rot = 0}: any) => p <= 0 ? null :
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${pop(p)})`} opacity={clamp(p * 3)}>
    <text x={0} y={size * .36} textAnchor="middle" fontFamily={fonts?.text} fontWeight={900} fontSize={size}
      stroke={INK} strokeWidth={size * .2} strokeLinejoin="round" paintOrder="stroke" fill={INK}>？</text>
    <text x={0} y={size * .36} textAnchor="middle" fontFamily={fonts?.text} fontWeight={900} fontSize={size}
      stroke="#fff" strokeWidth={size * .1} strokeLinejoin="round" paintOrder="stroke" fill={color}>？</text>
  </g>;
/** 杆秤：提绳在 (x,y)；beam 长 len，tilt 为秤杆倾角（度），sag 为秤杆被压弯程度 0～1。 */
function Steelyard({x, y, len = 260, tilt = 0, sag = 0, scale = 1}: {x: number; y: number; len?: number; tilt?: number; sag?: number; scale?: number}) {
  const bend = sag * len * .22;
  return <g transform={`translate(${x} ${y}) scale(${scale})`} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
    <line x1={0} y1={-60} x2={0} y2={0} strokeWidth={5} />
    <g transform={`rotate(${tilt})`}>
      <path d={`M ${-len * .28} 0 Q ${len * .2} ${bend} ${len * .72} ${bend * 1.6}`} fill="none" stroke={INK} strokeWidth={16} />
      <path d={`M ${-len * .28} 0 Q ${len * .2} ${bend} ${len * .72} ${bend * 1.6}`} fill="none" stroke="#d99a4e" strokeWidth={9} />
      {[.1, .25, .4, .55].map((k, i) => <circle key={i} cx={mix(-len * .28, len * .72, k + .2)} cy={bend * (k + .2) * 1.2} r={2.5} fill={INK} stroke="none" />)}
      <line x1={len * .5} y1={bend * 1.1} x2={len * .5} y2={bend * 1.1 + 46} strokeWidth={4} />
      <path d={`M ${len * .5 - 20} ${bend * 1.1 + 46} L ${len * .5 + 20} ${bend * 1.1 + 46} L ${len * .5 + 14} ${bend * 1.1 + 82} L ${len * .5 - 14} ${bend * 1.1 + 82} Z`} fill="#6d7b8a" strokeWidth={5} />
      <line x1={-len * .2} y1={0} x2={-len * .2} y2={40} strokeWidth={4} />
      <path d={`M ${-len * .2} 40 q -14 10 -6 24 q 10 10 18 -2`} fill="none" strokeWidth={5} />
    </g>
  </g>;
}
/** 鹅卵石：seeded 的圆润外形。 */
function Stone({x, y, r, seed, tone = 0}: {x: number; y: number; r: number; seed: number; tone?: number}) {
  const g = seeded(seed), n = 9, pts: string[] = [];
  const squash = .72 + .12 * g();
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, rr = r * (.88 + .16 * g());
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr * squash).toFixed(1)}`);
  }
  const d = `M ${pts[0]} ` + pts.map((p, i) => {
    const [x1, y1] = p.split(',').map(Number), [x2, y2] = pts[(i + 1) % n].split(',').map(Number);
    return `Q ${x1} ${y1} ${(x1 + x2) / 2} ${(y1 + y2) / 2}`;
  }).join(' ') + ' Z';
  const greys = ['#a9b4be', '#b8b0a6', '#9fb0b3', '#c2bcb2'];
  return <g transform={`translate(${x} ${y})`}>
    <path d={d} fill={greys[(seed + tone) % greys.length]} stroke={INK} strokeWidth={4.5} />
    <ellipse cx={-r * .3} cy={-r * .28 * squash} rx={r * .34} ry={r * .16} fill="#fff" opacity={.45} />
  </g>;
}
/** 竹筐。 */
function Basket({x, y, w = 150, h = 92}: {x: number; y: number; w?: number; h?: number}) {
  return <g transform={`translate(${x} ${y})`} stroke={INK} strokeLinejoin="round">
    <path d={`M ${-w / 2} ${-h / 2} L ${w / 2} ${-h / 2} L ${w * .4} ${h / 2} L ${-w * .4} ${h / 2} Z`} fill="#e7b96a" strokeWidth={5} />
    {[-.3, -.1, .1, .3].map((k, i) => <line key={i} x1={w * k} y1={-h / 2} x2={w * k * .82} y2={h / 2} stroke="#b07a33" strokeWidth={3} />)}
    {[-.2, .1, .35].map((k, i) => <line key={i} x1={-w * (.5 - .05 * (k + .5))} y1={h * k} x2={w * (.5 - .05 * (k + .5))} y2={h * k} stroke="#b07a33" strokeWidth={3} />)}
    <rect x={-w / 2 - 6} y={-h / 2 - 10} width={w + 12} height={16} rx={8} fill="#d29b4c" strokeWidth={5} />
  </g>;
}
/** 步骤徽章：圆角药丸“第一步 · 大象上船”，从左滑入弹出。 */
function Badge({label, x = 90, y = 70, p, fonts, color = SKY}: {label: string; x?: number; y?: number; p: number; fonts: any; color?: string}) {
  if (p <= 0 || !label) return null;
  const size = 50, width = Array.from(label).reduce((w, ch) => w + (/[㐀-鿿]/.test(ch) ? size : size * .55), 0) + 90;
  const k = pop(p);
  return <g transform={`translate(${x - 60 * (1 - out3(p))} ${y}) scale(${k})`} opacity={clamp(p * 3)}>
    <rect x={0} y={0} width={width} height={92} rx={46} fill={color} stroke={INK} strokeWidth={7} />
    <rect x={10} y={8} width={width - 20} height={30} rx={15} fill="#fff" opacity={.25} />
    <text x={width / 2} y={64} textAnchor="middle" fontFamily={fonts?.text} fontWeight={900} fontSize={size} fill="#fff"
      stroke={INK} strokeWidth={9} strokeLinejoin="round" paintOrder="stroke">{label}</text>
  </g>;
}
/** 幕首/幕末淡入淡出系数。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(sm(t / inS), sm((dur - t) / outS));
/** 暖色暗角，压住四角，突出中间。 */
const Vignette = ({amount = .35}: {amount?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(80,40,10,0) 55%, rgba(80,40,10,${amount}) 100%)`}} />;
/** 镜头：看向底图上的点 (cx, cy)、放大 s 倍。返回给底图层的 CSS transform 与给叠加层的 SVG transform（两者一致）。
 * 底图按 cover 铺满 1920×1080，点坐标就是幕坐标。镜头不出画：自动把焦点夹在可视范围内。 */
function camera(cx: number, cy: number, s: number) {
  const x = clamp(W / 2 - cx * s, W - W * s, 0), y = clamp(H / 2 - cy * s, H - H * s, 0);
  return {css: `translate(${x}px, ${y}px) scale(${s})`, svg: `translate(${x} ${y}) scale(${s})`};
}
/** 按关键帧插值镜头：keys = [[秒, cx, cy, s], …]，区间内缓入缓出。 */
function camAt(t: number, keys: number[][]) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i], k = easeInOut((t - a[0]) / Math.max(.001, b[0] - a[0]));
      return [mix(a[1], b[1], k), mix(a[2], b[2], k), mix(a[3], b[3], k)];
    }
  }
  return keys[keys.length - 1].slice(1);
}
/** 跟镜头走的满幅底图（origin 0 0，与 camera() 配套）。 */
function CamPlate({asset, frame, cam}: {asset: any; frame: number; cam: {css: string}}) {
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: cam.css, transformOrigin: '0 0'}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 汗珠：at 秒起从 (x, y) 往两边甩出。 */
function Sweat({t, at, x, y, n = 3, seed = 2}: {t: number; at: number; x: number; y: number; n?: number; seed?: number}) {
  const d = t - at;
  if (d < 0 || d > 1.1) return null;
  const r = seeded(seed);
  return <g>{Array.from({length: n}, (_, i) => {
    const dir = i % 2 ? 1 : -1, vx = dir * (120 + 90 * r()), vy = -(160 + 120 * r());
    const px = x + vx * d, py = y + vy * d + 420 * d * d;
    return <path key={i} transform={`translate(${px} ${py}) rotate(${dir * 30}) scale(${1 - .3 * d})`} opacity={1 - sm((d - .7) / .4)}
      d="M 0 -22 C 10 -6 16 2 16 10 C 16 20 8 26 0 26 C -8 26 -16 20 -16 10 C -16 2 -10 -6 0 -22 Z" fill="#a8e0ff" stroke={INK} strokeWidth={4} />;
  })}</g>;
}

// 结尾两段：praise（曹操高兴，大家夸曹冲：彩纸 + “真聪明！”）/ moral（夕阳河边，温和的一句道理：卡片逐行出现，灯泡亮起）。
export const meta = {
  title: '曹冲称象 · 结尾',
  description: '欢呼彩纸与夸奖贴纸；夕阳河边的道理卡片，按旁白逐行出现。',
  params: {
    stage: {label: '段落', type: 'select', default: 'praise', options: [{value: 'praise', label: '大家夸他'}, {value: 'moral', label: '道理'}]},
    praise: {label: '夸奖', type: 'text', default: '真聪明！', maxLength: 16},
    moralLines: {label: '道理卡片', type: 'list', default: ['遇到难题别着急', '换个办法想一想'], min: 1, max: 3, maxLength: 28},
    moralCues: {label: '卡点：每行出现', type: 'list', default: ['难题', '换个办法'], min: 1, max: 3, maxLength: 16},
    cuePraise: {label: '卡点：夸奖', type: 'text', default: '聪明', maxLength: 16},
    cueBulb: {label: '卡点：灯泡亮', type: 'text', default: '答案', maxLength: 16},
  },
  slots: {praise: '曹操举起曹冲，大家欢呼', moral: '夕阳河边，曹冲和大象'},
};

export default function End(props: SceneInput) {
  const {t, at, start, end, endAll, dur} = cues(props);
  const stage = txt(props, 'stage') || 'praise';
  const fonts = props.fonts;
  if (stage === 'moral') {
    const cam = camera(...(camAt(t, [[0, 980, 560, 1.12], [dur, 960, 540, 1.02]]) as [number, number, number]));
    const lines = list<string>(props, 'moralLines').map(String), marks = list<string>(props, 'moralCues').map(String);
    const bulb = at(txt(props, 'cueBulb'), start(1, dur - 2.5)) - .1;
    const cardP = clamp((t - start(0, .2) + .2) / .5);
    return <div style={{position: 'absolute', inset: 0, background: '#ffe2b8', overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .6)}}>
      <CamPlate asset={slot(props, 'moral')} frame={props.frame} cam={cam} />
      <Svg>
        <g transform={cam.svg}>
          <Twinkles t={t} n={26} seed={17} box={[260, 520, 1200, 720]} color="#fff3c4" />
          <Twinkles t={t * .7} n={14} seed={18} box={[900, 200, 1900, 620]} color="#fff8d6" amount={.8} />
        </g>
        <g transform={`translate(1360 250) scale(${pop(cardP)})`} opacity={clamp(cardP * 3)}>
          <rect x={-470} y={-170} width={940} height={110 + lines.length * 104} rx={46} fill="rgba(255,250,238,.92)" stroke={INK} strokeWidth={7} />
          {lines.map((line, i) => <Sticky key={i} text={line} x={0} y={-96 + i * 108} size={76} maxWidth={860} fill={[SUN, SKY, ROSE][i % 3]}
            p={clamp((t - at(marks[i] ?? '', start(0, .2) + i * 2) + .1) / .9)} fonts={fonts} />)}
        </g>
        <Bulb x={770} y={190} size={.8} p={clamp((t - bulb + .4) / .35)} on={sm((t - bulb) / .25)} />
        <Burst t={t} at={bulb + .1} x={770} y={180} n={10} radius={170} seed={19} />
      </Svg>
    </div>;
  }
  const cheer = at(txt(props, 'cuePraise'), end(0, dur - 1) - .8) - .1;
  const cam = camera(...(camAt(t, [[0, 1000, 520, 1.14], [dur, 960, 540, 1.04]]) as [number, number, number]));
  return <div style={{position: 'absolute', inset: 0, background: CREAM, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .05)}}>
    <CamPlate asset={slot(props, 'praise')} frame={props.frame} cam={cam} />
    <Svg>
      <g transform={cam.svg}>
        <Burst t={t} at={.25} x={1010} y={260} n={14} radius={300} seed={21} />
        <Twinkles t={t} n={12} seed={22} box={[820, 120, 1220, 460]} />
      </g>
      <Confetti t={t} at={.1} n={80} seed={23} />
      <Sticky text={txt(props, 'praise')} x={430} y={190 - 8 * Math.sin(t * 4)} size={130} fill={SUN} p={clamp((t - cheer) / .5)} fonts={fonts} tilt={5} />
      <Burst t={t} at={cheer + .2} x={430} y={190} n={12} radius={320} seed={24} />
    </Svg>
    <Vignette amount={.14} />
  </div>;
}
