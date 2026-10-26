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
const MEDIA: Record<string, string> = /* MEDIA */ {"side-bg":"release-assets/0dce7c9d049e0f1784878d8e19019c528a6c449ec245bebf4851c2f7c2f769c3.webp","st-caochong":"release-assets/f170dcb8798a1a6d92dbe852a7f6e58347a37ed2444266db0ab7b65502d9758e.webp","st-elephant":"release-assets/d47fecc5473cb0ada12dd88c14788404c37df3b1e273a0acf5eb44038265b0c0.webp"};
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

// 称象四步 + 称石头 + 等式：河边侧视图。水面随船起伏，船身刻线发光，石头一筐筐落船、水位逼近刻线，到线“叮”。
// 同一模块按 props.stage 分段（load 上船 / mark 画线 / unload 下船 / stones 搬石头 / weigh 称石头 / equal 等式），
// 相邻两段的交界状态一致（硬切看不出跳变）：船在幕首幕尾都静止，吃水深度按段落固定。
export const meta = {
  title: '曹冲称象 · 河边四步',
  description: '侧视河面：大象上船、沿水面画线、大象下船、一筐筐搬石头到线、称石头加起来、石头=大象。',
  params: {
    stage: {label: '段落', type: 'select', default: 'load', options: [
      {value: 'load', label: '大象上船'}, {value: 'mark', label: '画线'}, {value: 'unload', label: '大象下船'},
      {value: 'stones', label: '搬石头'}, {value: 'weigh', label: '称石头'}, {value: 'equal', label: '等式'}]},
    badgeLoad: {label: '第一步徽章', type: 'text', default: '第一步 · 大象上船', maxLength: 32},
    badgeMark: {label: '第二步徽章', type: 'text', default: '第二步 · 画一条线', maxLength: 32},
    badgeUnload: {label: '第三步徽章', type: 'text', default: '第三步 · 大象下船', maxLength: 32},
    badgeStones: {label: '第四步徽章', type: 'text', default: '第四步 · 搬石头', maxLength: 32},
    badgeWeigh: {label: '最后一步徽章', type: 'text', default: '最后 · 称一称', maxLength: 32},
    markLabel: {label: '刻线标签', type: 'text', default: '记号', maxLength: 12},
    counter: {label: '筐数', type: 'text', default: '第{n}筐', maxLength: 16, help: '{n} 换成筐数'},
    reached: {label: '到线提示', type: 'text', default: '到线啦！', maxLength: 16},
    stop: {label: '停', type: 'text', default: '停', maxLength: 6},
    sumLabel: {label: '石头总重标签', type: 'text', default: '石头一共多重', maxLength: 24},
    stoneWord: {label: '等式左边', type: 'text', default: '石头的重量', maxLength: 16},
    elephantWord: {label: '等式右边', type: 'text', default: '大象的重量', maxLength: 16},
    baskets: {label: '石头筐数', type: 'number', default: 10, min: 4, max: 16, step: 1},
    cueSink: {label: '卡点：船下沉', type: 'text', default: '沉', maxLength: 16},
    cueLook: {label: '卡点：手指提示', type: 'text', default: '你看', maxLength: 16},
    cueDraw: {label: '卡点：开始画线', type: 'text', default: '画', maxLength: 16},
    cueFloat: {label: '卡点：船浮起', type: 'text', default: '浮', maxLength: 16},
    cueStones: {label: '卡点：头三筐', type: 'list', default: ['石头', '一筐', '又一筐'], min: 3, max: 3, maxLength: 16},
    cueReach: {label: '卡点：到线', type: 'text', default: '到线', maxLength: 16},
    cueStop: {label: '卡点：停', type: 'text', default: '停', maxLength: 16},
    cueWeigh: {label: '卡点：开始称', type: 'text', default: '一筐一筐', maxLength: 16},
    cueSum: {label: '卡点：加起来', type: 'text', default: '加起来', maxLength: 16},
    cueStoneSide: {label: '卡点：石头', type: 'text', default: '石头', maxLength: 16},
    cueElephantSide: {label: '卡点：大象', type: 'text', default: '大象', maxLength: 16},
  },
  slots: {'side-bg': '河边侧视底图', 'st-elephant': '大象贴纸（透明底，朝右）', 'st-caochong': '曹冲拿毛笔贴纸（透明底，朝右）'},
};

const YW = 790, BOAT_CX = 1200, L = 940, HH = 160, EMPTY = 45, FULL = 115;
const EW = 520, ER = 1276 / 1839, CW = 300, CR = 1256 / 1262;
const DECK_FEET = 40;  // 象脚藏在船舷后面的深度

/** 船身（局部坐标：船底中心为原点）。mark 为刻线进度 0～1，glow 为刻线发光强度。 */
function Hull() {
  const top = `M ${-L / 2 - 46} ${-HH - 44} Q 0 ${-HH + 34} ${L / 2 + 56} ${-HH - 54}`;
  const body = `M ${-L / 2 - 46} ${-HH - 44} Q ${-L / 2 - 14} -4 ${-L / 2 + 96} 0 L ${L / 2 - 104} 0 Q ${L / 2 + 46} -4 ${L / 2 + 56} ${-HH - 54} Q 0 ${-HH + 34} ${-L / 2 - 46} ${-HH - 44} Z`;
  return <g>
    <defs>
      <linearGradient id="hullwood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d9955a" /><stop offset=".6" stopColor="#b8703b" /><stop offset="1" stopColor="#8f5329" />
      </linearGradient>
      <clipPath id="hullclip"><path d={body} /></clipPath>
    </defs>
    <path d={body} fill="url(#hullwood)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <g clipPath="url(#hullclip)" stroke="#7a4421" strokeWidth={3.5} opacity={.55} fill="none">
      {[-40, -80, -120].map(y => <path key={y} d={`M ${-L / 2 - 60} ${y} Q 0 ${y + 10} ${L / 2 + 60} ${y - 6}`} />)}
      {[-300, -60, 200, 400].map(x => <line key={x} x1={x} y1={-HH - 30} x2={x + 4} y2={0} strokeWidth={2.5} opacity={.6} />)}
    </g>
    <path d={top} fill="none" stroke="#7d4520" strokeWidth={20} strokeLinecap="round" />
    <path d={top} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" transform="translate(0 -10)" />
    <path d={top} fill="none" stroke="#e8a96a" strokeWidth={5} strokeLinecap="round" opacity={.8} transform="translate(0 2)" />
  </g>;
}

/** 船边刻线（局部坐标同 Hull）：画在水面层之上，贴着水面也看得清；mark 为画线进度，glow 常亮，flash 为到线时的金光。 */
function MarkLine({mark = 0, glow = 0, flash = 0}: {mark?: number; glow?: number; flash?: number}) {
  if (mark <= 0) return null;
  const lineY = -FULL, x0 = -L / 2 + 6, x1 = L / 2 - 10, xm = mix(x0, x1, clamp(mark));
  return <g>
    <line x1={x0} y1={lineY} x2={xm} y2={lineY} stroke={GOLD} strokeWidth={30 + 30 * flash} strokeLinecap="round" opacity={.22 + .3 * glow + .45 * flash} />
    <line x1={x0} y1={lineY} x2={xm} y2={lineY} stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <line x1={x0} y1={lineY} x2={xm} y2={lineY} stroke={flash > .05 ? '#fff3b0' : BERRY} strokeWidth={10} strokeLinecap="round" />
    <line x1={x0} y1={lineY - 2} x2={xm} y2={lineY - 2} stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={.6} />
  </g>;
}

/** 前景水面：波浪起伏，半透明（看得见船吃水多深），浪花线。lift 为局部水花高度。 */
function Water({t, amp = 1}: {t: number; amp?: number}) {
  const pts: string[] = [];
  for (let x = -40; x <= W + 40; x += 30) {
    const y = YW + amp * (6 * Math.sin(x * .012 - t * 1.9) + 3.5 * Math.sin(x * .031 + t * 2.7));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  const surface = 'M ' + pts.join(' L ');
  return <g>
    <defs><linearGradient id="waterfront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7fd3f0" stopOpacity=".74" /><stop offset=".35" stopColor="#4fb3e0" stopOpacity=".84" /><stop offset="1" stopColor="#2f86c4" stopOpacity=".95" />
    </linearGradient></defs>
    <path d={`${surface} L ${W + 40} ${H + 20} L -40 ${H + 20} Z`} fill="url(#waterfront)" />
    <path d={surface} fill="none" stroke="#e9fbff" strokeWidth={6} strokeLinecap="round" opacity={.9} />
    {[34, 78, 140, 210].map((dy, i) => <path key={i} d={surface} fill="none" stroke="#fff" strokeWidth={4 - i * .6} opacity={.35 - i * .06}
      strokeDasharray={`${70 + i * 30} ${120 + i * 40}`} strokeDashoffset={-t * (40 + i * 12) + i * 90} transform={`translate(0 ${dy})`} strokeLinecap="round" />)}
  </g>;
}
/** 水花：at 秒在 (x, y) 溅起一圈水滴 + 涟漪。 */
function Splash({t, at, x, size = 1, seed = 1}: {t: number; at: number; x: number; size?: number; seed?: number}) {
  const d = t - at;
  if (d < 0 || d > 1.4) return null;
  const r = seeded(seed);
  return <g>
    {[0, .25].map((lag, i) => {const k = clamp((d - lag) / 1.1); return k <= 0 ? null :
      <ellipse key={i} cx={x} cy={YW + 6} rx={40 + 220 * size * out3(k)} ry={8 + 26 * size * out3(k)} fill="none" stroke="#fff" strokeWidth={5 * (1 - k)} opacity={1 - k} />;})}
    {Array.from({length: 12}, (_, i) => {
      const vx = (r() - .5) * 520 * size, vy = -(380 + 380 * r()) * size, k = d;
      const px = x + vx * k, py = YW + vy * k + 1100 * k * k;
      if (py > YW + 10) return null;
      return <circle key={i} cx={px} cy={py} r={7 + 7 * r()} fill="#e9fbff" stroke="#2f86c4" strokeWidth={3} opacity={.95} />;
    })}
  </g>;
}

/** 船在全幕的状态：船底 y、刻线、象的位置。 */
type Boat = {draft: number; tilt: number};
const bob = (t: number, dur: number, amp = 4) => amp * Math.sin(t * 2.1) * sm(t / .6) * sm((dur - t) / .6);

function boatFrame(draft: number, tilt: number, t: number, dur: number) {
  const bottom = YW + draft + bob(t, dur);
  const gunwale = bottom - HH - 4;
  return {bottom, gunwale, transform: `translate(${BOAT_CX} ${bottom}) rotate(${tilt})`};
}
/** 走路：x 位移带上下颠簸与左右摇摆。 */
const gait = (dist: number) => ({dy: -Math.abs(Math.sin(dist / 55)) * 12, rot: Math.sin(dist / 55) * 2.2});

/** 石头堆：第 k 筐的第 j 块石头在船里的位置（按筐叠高，seeded 散布）。 */
function pileStone(k: number, j: number) {
  const r = seeded(1000 + k * 17 + j);
  const layer = Math.floor(k / 3), slotX = (k % 3) - 1;
  return {x: slotX * 200 + (j - 1.5) * 50 + (r() - .5) * 24, y: -HH - 24 - layer * 30 - (j % 2) * 14 - r() * 6, r: 30 + r() * 9, seed: k * 7 + j};
}
function StonesInBoat({count, dropT, t}: {count: number; dropT: number[]; t: number}) {
  return <g>{Array.from({length: count}, (_, k) => {
    const d = t - dropT[k];
    if (d < 0) return null;
    const fall = clamp(d / .32), bounce = d > .32 ? Math.max(0, Math.sin((d - .32) * 18) * 14 * Math.exp(-(d - .32) * 9)) : 0;
    return <g key={k}>{[0, 1, 2, 3].map(j => {
      const s = pileStone(k, j), y0 = s.y - 520 - j * 40;
      const y = d < .32 ? mix(y0, s.y, fall * fall) : s.y - bounce;
      return <Stone key={j} x={s.x} y={y} r={s.r} seed={s.seed} />;
    })}</g>;
  })}</g>;
}

export default function River(props: SceneInput) {
  const {t, at, start, end, endAll, dur} = cues(props);
  const stage = txt(props, 'stage') || 'load';
  const fonts = props.fonts;
  const elephant = slot(props, 'st-elephant'), boy = slot(props, 'st-caochong');
  const N = Math.max(4, Math.min(16, Math.round(Number(props.params.baskets ?? meta.params.baskets.default))));

  let draft = EMPTY, tilt = 0, markP = 0, glow = 0, flash = 0;
  let elX: number | null = null, elFlip = false, elFeet = 0, elRot = 0, elDy = 0;
  let boyP = 0, boyRot = 0, badge = '', badgeP = sm((t - .1) / .4);
  let pointer = 0, tap = 0, splashAt = -9, splashSize = 1, gapP = 0, stonesShown = 0, counterN = 0, counterPop = 0;
  let reachedAt = 99, stopAt = 99, drops: number[] = [];
  const deckFeet = (d: number) => YW + d - HH - 4 + DECK_FEET;

  if (stage === 'load') {
    badge = txt(props, 'badgeLoad');
    const walkA = start(0, .2) + .2, walkB = Math.max(walkA + 1.6, end(0, 2.6) - .1);
    const sink = at(txt(props, 'cueSink'), end(0, 2.6) + 1.2) - .1;
    const k = easeInOut(clamp((t - walkA) / (walkB - walkA)));
    const x = mix(-EW - 40, BOAT_CX - EW / 2 - 20, k), center = x + EW / 2;
    const g = gait(x + EW);
    const sinkK = spring(Math.max(0, t - sink) * 1.2, 8, 3.5);
    draft = mix(EMPTY, FULL, Math.min(1.08, sinkK));
    tilt = -1.6 * sm((center - 500) / 300) * (1 - sm((t - sink) / .5));
    elX = x; elFeet = mix(705, deckFeet(draft), sm((center - 640) / 260)); elDy = k < 1 ? g.dy : 0; elRot = k < 1 ? g.rot : 0;
    splashAt = sink + .08; splashSize = 1.1;
    const look = at(txt(props, 'cueLook'), sink - .5);
    pointer = sm((t - look + .15) / .35) * (1 - sm((t - dur + .5) / .4));
    tap = clamp((t - look) / .9) * 2;
  } else if (stage === 'mark') {
    badge = txt(props, 'badgeMark');
    draft = FULL; elX = BOAT_CX - EW / 2 - 20; elFeet = deckFeet(FULL);
    boyP = sm((t - .25) / .5);
    const draw = at(txt(props, 'cueDraw'), start(0, .2) + 1.6) - .1;
    markP = easeInOut(clamp((t - draw) / 1.5));
    glow = sm((t - draw - 1.5) / .4) * (.6 + .4 * Math.sin(t * 5));
    boyRot = markP > 0 && markP < 1 ? Math.sin(t * 14) * 2 : 0;
  } else if (stage === 'unload') {
    badge = txt(props, 'badgeUnload');
    markP = 1; glow = .5 + .3 * Math.sin(t * 5);
    boyP = 1 - sm(t / .45);
    const walkA = start(0, .2) + .3, walkB = Math.max(walkA + 1.8, at(txt(props, 'cueFloat'), end(0, 3) - 1) + .2);
    const k = easeInOut(clamp((t - walkA) / (walkB - walkA)));
    const x = mix(BOAT_CX - EW / 2 - 20, -EW - 60, k), center = x + EW / 2;
    const leave = walkA + (walkB - walkA) * .42;  // 象走到船尾附近时开始上浮
    const riseK = spring(Math.max(0, t - leave) * 1.1, 8, 3.5);
    draft = mix(FULL, EMPTY, Math.min(1.08, riseK));
    tilt = 1.4 * sm((t - walkA) / .5) * (1 - sm((t - leave) / .6));
    elX = x; elFlip = true; elFeet = mix(705, deckFeet(draft), sm((center - 640) / 260)); elDy = k > 0 && k < 1 ? gait(x).dy : 0; elRot = k > 0 && k < 1 ? -gait(x).rot : 0;
    if (k >= 1) elX = null;
    gapP = sm((t - leave - .8) / .4);
  } else if (stage === 'stones') {
    badge = txt(props, 'badgeStones');
    markP = 1; glow = .5 + .3 * Math.sin(t * 5);
    const c = list<string>(props, 'cueStones').map(String);
    const d1 = at(c[0] ?? '', start(0, .2) + 1.2) - .05, d2 = Math.max(d1 + .6, at(c[1] ?? '', d1 + .9) - .05), d3 = Math.max(d2 + .6, at(c[2] ?? '', d2 + .9) - .05);
    const reach = at(txt(props, 'cueReach'), start(2, dur - 2)) - .05;
    drops = [d1, d2, d3];
    // 剩下的筐越搬越快，最后一筐正好在“到线”前落下（每次间隔乘 0.85）。
    const rest = N - 3, last = reach - .32, ratio = .85, span = Math.max(.6, last - d3);
    const g0 = span / ((1 - Math.pow(ratio, rest)) / (1 - ratio));
    let s = d3;
    for (let i = 0; i < rest; i++) {s += g0 * Math.pow(ratio, i); drops.push(s);}
    let landed = 0, wobble = 0;
    drops.forEach(dt => {if (t >= dt + .3) {landed++; wobble = t - dt - .3;}});
    const inc = (FULL - EMPTY) / N;
    draft = EMPTY + inc * landed + (landed ? -inc * .6 * Math.exp(-wobble * 5) * Math.cos(wobble * 14) * (1 - sm((t - reach - .2) / .3)) : 0);
    stonesShown = N; counterN = drops.filter(dt => t >= dt).length;
    const lastDrop = drops[counterN - 1] ?? -9; counterPop = counterN ? clamp((t - lastDrop) / .3) : 0;
    reachedAt = reach; stopAt = at(txt(props, 'cueStop'), reach + .9);
    flash = Math.exp(-Math.max(0, t - reachedAt) * 2.4) * (t >= reachedAt ? 1 : 0);
    glow = t >= reachedAt ? 1 : glow;
    gapP = 1 - sm((t - reachedAt) / .3);
  } else {
    draft = FULL; markP = 1; glow = .8; stonesShown = N; drops = Array.from({length: N}, () => -9);
  }

  const boat = boatFrame(draft, tilt, t, dur);
  const lineY = boat.bottom - FULL;
  const card = stage === 'weigh' || stage === 'equal';

  return <div style={{position: 'absolute', inset: 0, background: '#bfe6f4', overflow: 'hidden', opacity: fadeEdges(t, dur, .04, .04)}}>
    <Plate asset={slot(props, 'side-bg')} frame={props.frame} p={0} from={[1.02, 0, 0]} to={[1.02, 0, 0]} />
    <Svg><g transform={boat.transform}><StonesInBoat count={stonesShown} dropT={drops} t={t} /></g></Svg>
    {elX !== null && <Sticker asset={elephant} frame={props.frame} x={elX} y={elFeet - EW * ER + 4 + elDy} w={EW} ratio={ER} flip={elFlip} rotate={elRot} />}
    <Svg>
      <g transform={boat.transform}><Hull /></g>
      <Water t={t} />
      <g transform={boat.transform}><MarkLine mark={markP} glow={glow} flash={flash} /></g>
      <Splash t={t} at={splashAt} x={BOAT_CX - 380} size={splashSize} seed={3} />
      <Splash t={t} at={splashAt + .05} x={BOAT_CX + 420} size={splashSize} seed={4} />
      {stage === 'stones' && drops.map((dt, i) => <Splash key={i} t={t} at={dt + .3} x={BOAT_CX + (i % 3 - 1) * 260} size={.35} seed={20 + i} />)}
      {stage === 'unload' && <Splash t={t} at={start(0, .2) + 1.6} x={BOAT_CX} size={.5} seed={7} />}
    </Svg>
    {boyP > 0 && <Sticker asset={boy} frame={props.frame} x={424 - 120 * (1 - out3(boyP))} y={496} w={CW} ratio={CR} rotate={boyRot} opacity={clamp(boyP * 2)} origin="20% 90%" />}
    <Svg>
      {/* 刻线标签与“到线”提示 */}
      {markP >= 1 && !card && <g transform={`translate(${BOAT_CX + L / 2 + 34} ${lineY})`} opacity={sm((t - (stage === 'mark' ? at(txt(props, 'cueDraw'), 1.8) + 1.4 : 0)) / .3)}>
        <path d="M 0 0 L 34 -26 L 34 26 Z" fill={BERRY} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <rect x={30} y={-36} width={Array.from(txt(props, 'markLabel')).length * 46 + 40} height={72} rx={20} fill={CREAM} stroke={INK} strokeWidth={6} />
        <text x={50} y={16} fontFamily={fonts.text} fontWeight={900} fontSize={44} fill={BERRY}>{txt(props, 'markLabel')}</text>
      </g>}
      {/* 刻线与水面之间的差距（双箭头），搬石头时越缩越短 */}
      {gapP > 0 && lineY < YW - 14 && <g opacity={gapP} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
        <line x1={BOAT_CX + 330} y1={lineY + 10} x2={BOAT_CX + 330} y2={YW - 8} stroke={stage === 'stones' && t > reachedAt - 1.2 ? GOLD : SKY} strokeWidth={9} />
        <path d={`M ${BOAT_CX + 314} ${lineY + 24} L ${BOAT_CX + 330} ${lineY + 6} L ${BOAT_CX + 346} ${lineY + 24}`} fill="none" strokeWidth={6} />
        <path d={`M ${BOAT_CX + 314} ${YW - 22} L ${BOAT_CX + 330} ${YW - 4} L ${BOAT_CX + 346} ${YW - 22}`} fill="none" strokeWidth={6} />
      </g>}
      {pointer > 0 && <g>
        <circle cx={BOAT_CX + 300} cy={YW} r={40 + 18 * Math.sin(t * 7)} fill="none" stroke={SUN} strokeWidth={7} opacity={pointer * .9} />
        <Pointer x={BOAT_CX + 300 + 30} y={YW - 30} angle={135} p={pointer} tap={tap} scale={1.05} />
      </g>}
      {stage === 'stones' && counterN > 0 && <g>
        <g transform={`translate(1560 118) scale(${1 + .25 * (1 - pop(counterPop))})`}>
          <Basket x={-170} y={0} w={120} h={74} />
          <Sticky text={fmt(txt(props, 'counter'), {n: counterN})} x={40} y={0} size={76} fill={SUN} fonts={fonts} />
        </g>
      </g>}
      {stage === 'stones' && t >= reachedAt && <g>
        <Burst t={t} at={reachedAt} x={BOAT_CX - 100} y={lineY} n={14} radius={360} seed={5} />
        <Burst t={t} at={reachedAt + .1} x={BOAT_CX + 300} y={lineY} n={10} radius={260} seed={6} />
        <Sticky text={txt(props, 'reached')} x={960} y={380} size={120} fill={GOLD} p={clamp((t - reachedAt) / .5)} fonts={fonts} />
      </g>}
      {stage === 'stones' && t >= stopAt && <g transform={`translate(1640 560) scale(${pop((t - stopAt) / .35)}) rotate(${-8 + 8 * out3((t - stopAt) / .35)})`}>
        <circle r={92} fill={BERRY} stroke={INK} strokeWidth={8} />
        <circle r={74} fill="none" stroke="#fff" strokeWidth={6} />
        <text x={0} y={30} textAnchor="middle" fontFamily={fonts.text} fontWeight={900} fontSize={88} fill="#fff">{txt(props, 'stop')}</text>
      </g>}
      {!card && <Badge label={badge} p={badgeP} fonts={fonts} color={stage === 'stones' ? LEAF : stage === 'mark' ? ROSE : stage === 'unload' ? PEACH : SKY} />}
    </Svg>
    {card && <WeighCard props={props} t={t} at={at} start={start} end={end} endAll={endAll} dur={dur} N={N} stage={stage} elephant={elephant} />}
  </div>;
}

/** 称石头与等式：河面上铺一张绘本纸卡片。 */
function WeighCard({props, t, at, start, end, dur, N, stage, elephant}: any) {
  const fonts = props.fonts;
  const cardIn = stage === 'weigh' ? out3(t / .45) : 1;
  const panel = <div style={{position: 'absolute', left: 90, top: 60 + 40 * (1 - cardIn), width: W - 180, height: 830, borderRadius: 48,
    background: 'radial-gradient(ellipse at 20% 15%, #fffdf6 0%, #fff4dc 55%, #ffe9c4 100%)', border: `7px solid ${INK}`,
    boxShadow: '0 18px 0 rgba(91,58,36,.18)', opacity: cardIn}} />;
  if (stage === 'weigh') {
    const w0 = at(txt(props, 'cueWeigh'), start(0, .2) + 1.2) - .25, sum = at(txt(props, 'cueSum'), end(0, dur - 1.2) - .9);
    // 一筐筐称：前两筐慢（看清指针），后面越来越快，最后一筐在“加起来”之前称完。
    const times: number[] = [w0, w0 + .75];
    const rest = N - 2, span = Math.max(.8, sum - .3 - times[1]), ratio = .82;
    const g0 = span / ((1 - Math.pow(ratio, rest)) / (1 - ratio));
    let s = times[1];
    for (let i = 0; i < rest; i++) {s += g0 * Math.pow(ratio, i); times.push(s);}
    const cur = times.filter(x => t >= x).length - 1;
    const since = cur >= 0 ? t - times[cur] : -1, gap = cur >= 0 && cur + 1 < times.length ? times[cur + 1] - times[cur] : 1.2;
    const leaving = cur >= 0 ? sm((since - gap * .7) / (gap * .3)) : 0;
    const needle = cur < 0 ? -64 : -64 + 128 * clamp(spring(since * 1.5, 10, 4)) * (1 - leaving);
    // 第 i 筐称完、指针稳住后飞到右边，叠成一块（落下时刻 = 称的时刻 + 整个间隔）。
    const blockAt = times.map((x, i) => x + ((times[i + 1] ?? x + .9) - x));
    const total = blockAt.filter(x => t >= x).length;
    const merged = sm((t - sum) / .6);
    const DX = 600, DY = 640, colX = 1240, colBase = 830, blockH = 48;
    const flyX = mix(DX, colX, out3(leaving)), flyY = DY - 300 - 90 * Math.sin(Math.PI * leaving) + (colBase - (total + 1) * blockH - (DY - 300)) * sm(leaving);
    return <>
      {panel}
      <Svg>
        <Badge label={txt(props, 'badgeWeigh')} p={sm((t - .1) / .4)} fonts={fonts} color={GOLD} x={150} y={96} />
        {/* 大秤盘：托盘 + 表盘 + 指针（表盘不写数字：只看指针摆多少） */}
        <g transform={`translate(${DX} ${DY})`}>
          <rect x={-170} y={-292} width={340} height={26} rx={13} fill="#c9d3dc" stroke={INK} strokeWidth={6} />
          <rect x={-20} y={-268} width={40} height={60} fill="#aab6c2" stroke={INK} strokeWidth={6} />
          <circle r={220} fill="#ff9fb2" stroke={INK} strokeWidth={8} />
          <circle r={184} fill="#fffaf0" stroke={INK} strokeWidth={6} />
          {Array.from({length: 13}, (_, i) => {const ang = (-64 + i * 128 / 12 - 90) * Math.PI / 180; return <line key={i} x1={Math.cos(ang) * 150} y1={Math.sin(ang) * 150}
            x2={Math.cos(ang) * (i % 3 === 0 ? 118 : 132)} y2={Math.sin(ang) * (i % 3 === 0 ? 118 : 132)} stroke={INK} strokeWidth={i % 3 === 0 ? 7 : 4} strokeLinecap="round" />;})}
          <path d={`M ${Math.cos(-154 * Math.PI / 180) * 168} ${Math.sin(-154 * Math.PI / 180) * 168} A 168 168 0 0 1 ${Math.cos(-26 * Math.PI / 180) * 168} ${Math.sin(-26 * Math.PI / 180) * 168}`}
            fill="none" stroke={LEAF} strokeWidth={12} strokeLinecap="round" opacity={.6} />
          <g transform={`rotate(${needle})`}>
            <path d="M -10 20 L 0 -160 L 10 20 Z" fill={BERRY} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          </g>
          <circle r={24} fill={SUN} stroke={INK} strokeWidth={6} />
          <ellipse cx={-76} cy={-118} rx={52} ry={18} fill="#fff" opacity={.5} transform="rotate(-32 -76 -118)" />
        </g>
        {/* 这一筐：落到秤盘上，称完飞去右边叠起来 */}
        {cur >= 0 && cur < N && <g transform={`translate(${flyX} ${flyY - 70 * (1 - out3(clamp(since / .25)))}) scale(${1 - .45 * sm(leaving)})`} opacity={1 - sm((leaving - .85) / .15)}>
          <Basket x={0} y={-44} w={180} h={100} />
          {[0, 1, 2].map(j => <Stone key={j} x={-48 + j * 48} y={-104 - (j % 2) * 12} r={30} seed={cur * 5 + j} />)}
        </g>}
        {/* 右边：每称完一筐，叠上一块“石头砖”；念到“加起来”合成一整根 */}
        {Array.from({length: total}, (_, i) => {
          const y = colBase - (i + 1) * blockH, land = clamp((t - blockAt[i]) / .2);
          return <g key={i} opacity={1 - merged} transform={`translate(0 ${-24 * (1 - out3(land))})`}>
            <rect x={colX - 110} y={y} width={220} height={blockH - 6} rx={14} fill={['#b9c2ca', '#c7bfb4', '#b2c1c3', '#cdc7bd'][i % 4]} stroke={INK} strokeWidth={5} />
            {[0, 1, 2].map(j => <ellipse key={j} cx={colX - 60 + j * 60} cy={y + blockH / 2 - 3} rx={20} ry={11} fill="#fff" opacity={.35} />)}
          </g>;
        })}
        {total > 0 && total < N + 1 && merged < .5 && <Sticky text="+1" x={colX + 170} y={colBase - total * blockH - 10 - 30 * clamp((t - blockAt[total - 1]) / .5)} size={56} fill={LEAF}
          p={1 - sm((t - blockAt[total - 1] - .35) / .25)} fonts={fonts} />}
        {merged > 0 && <g opacity={merged}>
          <rect x={colX - 124} y={colBase - N * blockH - 4} width={248} height={N * blockH + 4} rx={30} fill="#b9c2ca" stroke={INK} strokeWidth={8} />
          {Array.from({length: 8}, (_, i) => <Stone key={i} x={colX - 64 + (i % 3) * 64} y={colBase - 60 - Math.floor(i / 3) * 120 - (i % 2) * 20} r={32} seed={300 + i} />)}
          <rect x={colX - 124} y={colBase - N * blockH - 4} width={248} height={N * blockH + 4} rx={30} fill="none" stroke={GOLD} strokeWidth={14 + 6 * Math.sin(t * 6)} opacity={.6} />
        </g>}
        <line x1={colX - 180} y1={colBase + 6} x2={colX + 180} y2={colBase + 6} stroke={INK} strokeWidth={8} strokeLinecap="round" />
        <rect x={colX - 124} y={colBase - N * blockH - 4} width={248} height={N * blockH + 4} rx={30} fill="none" stroke={INK} strokeWidth={5}
          strokeDasharray="18 14" opacity={.35 * sm(t / .5) * (1 - merged)} />
        <g transform={`translate(${colX + 160} ${colBase - N * blockH / 2})`}>
          <Sticky text={txt(props, 'sumLabel')} x={0} y={0} size={54} fill={SKY} p={merged} fonts={fonts} anchor="start" />
        </g>
        {merged > 0 && <Burst t={t} at={sum + .3} x={colX} y={colBase - N * blockH / 2} n={12} radius={260} seed={11} />}
      </Svg>
    </>;
  }
  // equal：石头 = 大象
  const left = at(txt(props, 'cueStoneSide'), start(0, .1) + .2) - .1, right = at(txt(props, 'cueElephantSide'), start(0, .1) + 1.6) - .1;
  const eq = right + .55, words = eq + .35;
  const happy = t > eq + .4 ? Math.abs(Math.sin((t - eq - .4) * 5)) * 18 : 0;
  return <>
    {panel}
    <Svg>
      <g transform={`translate(520 ${560 - happy}) scale(${pop((t - left) / .45)})`} opacity={clamp((t - left) * 5)}>
        <ellipse cx={0} cy={140} rx={250} ry={30} fill="rgba(91,58,36,.12)" />
        {Array.from({length: 12}, (_, i) => {const row = i < 5 ? 0 : i < 9 ? 1 : i < 11 ? 2 : 3, n = [5, 4, 2, 1][row], j = i - [0, 5, 9, 11][row];
          return <Stone key={i} x={(j - (n - 1) / 2) * 92} y={110 - row * 72} r={48} seed={500 + i} />;})}
      </g>
      <g transform={`translate(960 520) scale(${pop((t - eq) / .4)}) rotate(${-10 * (1 - out3((t - eq) / .4))})`} opacity={clamp((t - eq) * 5)}>
        <rect x={-90} y={-70} width={180} height={44} rx={22} fill={GOLD} stroke={INK} strokeWidth={8} />
        <rect x={-90} y={26} width={180} height={44} rx={22} fill={GOLD} stroke={INK} strokeWidth={8} />
      </g>
      <Burst t={t} at={eq + .05} x={960} y={520} n={12} radius={220} seed={13} />
      <Sticky text={txt(props, 'stoneWord')} x={520} y={790} size={66} fill={SKY} p={clamp((t - words) / .7)} fonts={fonts} />
      <Sticky text={txt(props, 'elephantWord')} x={1420} y={790} size={66} fill={ROSE} p={clamp((t - words - .3) / .7)} fonts={fonts} />
      <Twinkles t={t} n={16} seed={21} box={[160, 140, 1760, 860]} amount={sm((t - eq) / .5)} />
    </Svg>
    <Sticker asset={elephant} frame={props.frame} x={1420 - 210} y={400 - happy} w={420} ratio={ER} scale={pop((t - right) / .45)}
      opacity={clamp((t - right) * 5)} origin="50% 100%" />
  </>;
}
