import React from 'react';
import {Icon, Media, clamp, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 羽见 PLUMO AI 眼镜宣传片（虚构品牌）共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 底图以 WebP data URI 内联在 MEDIA（制作任务里同名素材槽优先）。运行时无字体下载、无随机与时钟，
// 每帧只由 frame、句子时间与配乐拍点（bpm + beatOffset 参数）决定。
const MEDIA: Record<string, string> = {"subway":"release-assets/d2162db521699f546a4bc3de7456db8facac27f67c88dfc6c8e3b8813a681272.webp"};
const W = 1080, H = 1920;
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const outExpo = (v: number) => {const p = clamp(v); return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);};
/** 带回弹的 0→1（文字弹跳）。 */
const outBack = (v: number, s = 1.9) => {const p = clamp(v) - 1; return 1 + (s + 1) * p * p * p + s * p * p;};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .2) => sm((t - a) / f) * (1 - sm((t - b) / f));
/** 拍点冲击：at 时刻为 1，之后按 len 秒指数衰减。 */
const hit = (t: number, at: number, len = .3) => t < at ? 0 : Math.exp(-3 * (t - at) / len);
const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function num(props: SceneInput, key: string): number {
  const value = Number(props.params[key] ?? (meta as any).params?.[key]?.default);
  return Number.isFinite(value) ? value : 0;
}
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value as T[] : (meta as any).params?.[key]?.default ?? [];
}

/** 时钟：句子时间、卡点词与配乐拍点。beat(k) 是本幕第 k 拍的幕内秒数（bpm/beatOffset 由分镜按配乐网格写入）。 */
function clock(props: SceneInput) {
  const s = useScene(props);
  const bpm = num(props, 'bpm') || 126, B = 60 / bpm, offset = num(props, 'beatOffset');
  const beat = (k: number) => offset + k * B;
  const at = (phrase: string, fallback: number, occurrence = 0) => (phrase ? s.cue(phrase, occurrence) : undefined) ?? fallback;
  const start = (i: number, fallback: number) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback: number) => s.sentence(i)?.end ?? fallback;
  /** 最近一个已过去的拍（用于逐拍微动）。 */
  const lastBeat = (t: number) => beat(Math.max(0, Math.floor((t - offset) / B)));
  return {s, t: s.t, dur: s.seconds, B, beat, at, start, end, lastBeat};
}

/** 满幅底图：x/y 位移（像素）、scale 缩放，origin 变换中心；children 跟随同一变换（贴在画面里的东西）。 */
function Plate({asset, frame, scale = 1, x = 0, y = 0, rotate = 0, origin = '50% 50%', opacity = 1, children}:
  {asset: any; frame: number; scale?: number; x?: number; y?: number; rotate?: number; origin?: string; opacity?: number; children?: any}) {
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`, transformOrigin: origin}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {children}
    </div>
  </div>;
}
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
const Fill = ({style}: {style: any}) => <div style={{position: 'absolute', inset: 0, ...style}} />;

/** 第一视角镜片感：四角压暗 + 左上一道很淡的镜片反光。 */
function Lens({accent, amount = 1}: {accent: string; amount?: number}) {
  return <>
    <Fill style={{background: 'radial-gradient(ellipse 75% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)', opacity: amount}} />
    <Fill style={{background: `linear-gradient(128deg, ${rgba('#ffffff', .07)} 0%, rgba(255,255,255,0) 22%, rgba(0,0,0,0) 70%, ${rgba(accent, .05)} 100%)`, opacity: amount}} />
  </>;
}

/** 玻璃拟态面板（不用 backdrop-filter：它在两次渲染间不稳定）。 */
function Glass({x, y, w, h, accent, p = 1, radius = 30, children, tint = '#0b1418', style}:
  {x: number; y: number; w: number; h: number; accent: string; p?: number; radius?: number; children?: any; tint?: string; style?: any}) {
  if (p <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, opacity: clamp(p * 1.4),
    transform: `translateY(${(1 - out3(p)) * 26}px) scale(${mix(.94, 1, out3(p))})`, transformOrigin: '50% 50%',
    background: `linear-gradient(160deg, ${rgba(tint, .62)} 0%, ${rgba(tint, .42)} 60%, ${rgba(accent, .10)} 100%)`,
    border: `2px solid ${rgba(accent, .55)}`, boxShadow: `0 0 36px ${rgba(accent, .22)}, inset 0 1px 0 rgba(255,255,255,.18), 0 18px 40px rgba(0,0,0,.35)`,
    overflow: 'hidden', ...style}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '45%', background: 'linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,0))'}} />
    {children}
  </div>;
}

/** HUD 小标签：图标 + 文字，pop 弹入。 */
function Chip({x, y, icon, text, accent, color = '#f2f6f7', p = 1, size = 32, dot, fonts}:
  {x: number; y: number; icon?: string; text: string; accent: string; color?: string; p?: number; size?: number; dot?: string; fonts: any}) {
  if (p <= 0 || !text) return null;
  const k = outBack(p);
  return <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: size * .4, padding: `${size * .34}px ${size * .62}px`,
    borderRadius: size, background: rgba('#081013', .58), border: `2px solid ${rgba(accent, .6)}`, boxShadow: `0 0 24px ${rgba(accent, .25)}`,
    transform: `scale(${k})`, transformOrigin: '0% 50%', opacity: clamp(p * 3), fontFamily: fonts.text, fontSize: size, fontWeight: 600, color, whiteSpace: 'nowrap', letterSpacing: 1}}>
    {dot && <div style={{width: size * .42, height: size * .42, borderRadius: '50%', background: dot, boxShadow: `0 0 ${size * .6}px ${dot}`}} />}
    {icon && <Icon name={icon} size={size * 1.05} color={accent} />}
    <span>{text}</span>
  </div>;
}

/** 取景框四角：p 从外框收拢到目标框。 */
function Brackets({x, y, w, h, color, p = 1, len = 70, thick = 6, opacity = 1}:
  {x: number; y: number; w: number; h: number; color: string; p?: number; len?: number; thick?: number; opacity?: number}) {
  if (p <= 0) return null;
  const k = outExpo(p), bx = mix(x - 140, x, k), by = mix(y - 140, y, k), bw = mix(w + 280, w, k), bh = mix(h + 280, h, k);
  const corners = [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]];
  return <g opacity={clamp(p * 2) * opacity} style={{filter: `drop-shadow(0 0 10px ${color})`}}>
    {corners.map(([cx, cy, sx, sy], i) => <path key={i} d={`M ${cx} ${cy + sy * len} L ${cx} ${cy} L ${cx + sx * len} ${cy}`}
      fill="none" stroke={color} strokeWidth={thick} strokeLinecap="round" strokeLinejoin="round" />)}
  </g>;
}

/** 麦克风波形条（按帧确定的正弦叠加）。 */
function Wave({t, x, y, w, h, color, bars = 18, level = 1}: {t: number; x: number; y: number; w: number; h: number; color: string; bars?: number; level?: number}) {
  return <g>{Array.from({length: bars}, (_, i) => {
    const a = .25 + .75 * Math.abs(Math.sin(t * 7.3 + i * 1.7) * Math.sin(t * 3.1 + i * .9 + 1.3));
    const bh = Math.max(4, h * a * level), bx = x + i * (w / bars);
    return <rect key={i} x={bx} y={y + (h - bh) / 2} width={w / bars * .55} height={bh} rx={w / bars * .27} fill={color} />;
  })}</g>;
}

/** 斜向光扫：在 at 秒起 len 秒内扫过整幅；overlay 混合只提亮有内容的地方（黑底仍是黑）。 */
function Sweep({t, at, len = .7, color = '#ffffff', strength = .85, angle = 115}: {t: number; at: number; len?: number; color?: string; strength?: number; angle?: number}) {
  const p = (t - at) / len;
  if (p < 0 || p > 1) return null;
  const pos = mix(-30, 130, out3(p));
  return <Fill style={{mixBlendMode: 'overlay', opacity: strength * Math.sin(Math.PI * p),
    background: `linear-gradient(${angle}deg, rgba(0,0,0,0) ${pos - 14}%, ${color} ${pos}%, rgba(0,0,0,0) ${pos + 14}%)`}} />;
}

/** 粒子：drift 漂浮 / burst 自中心炸开 / gather 向中心收拢（canvas，按帧确定）。 */
function Particles({frame, seed = 1, count = 160, color = '#9ff5dc', mode = 'drift', cx = W / 2, cy = H / 2, p = 0, opacity = 1}:
  {frame: number; seed?: number; count?: number; color?: string; mode?: 'drift' | 'burst' | 'gather'; cx?: number; cy?: number; p?: number; opacity?: number}) {
  const r = seeded(seed), parts = Array.from({length: count}, () => ({a: r() * Math.PI * 2, d: .3 + r() * .9, s: r(), x: r() * W, y: r() * H, ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    c.fillStyle = color;
    parts.forEach(q => {
      let x, y, size = 1.5 + 3.5 * q.s, alpha = .35 + .6 * q.s;
      if (mode === 'drift') {x = (q.x + Math.sin(t * .7 + q.ph) * 30 + t * 12 * (q.s - .5)) % W; y = ((q.y - t * (20 + 50 * q.s)) % H + H) % H;}
      else {
        const k = mode === 'burst' ? out3(p) : 1 - out3(p), dist = k * q.d * 900;
        x = cx + Math.cos(q.a) * dist; y = cy + Math.sin(q.a) * dist * 1.1;
        alpha *= mode === 'burst' ? 1 - clamp(p) * .85 : clamp(p * 2) * (1 - clamp(p - .85) * 6);
        size *= mode === 'burst' ? 1.3 - clamp(p) * .7 : 1;
      }
      c.globalAlpha = clamp(alpha); c.beginPath(); c.arc(x, y, size, 0, 6.283); c.fill();
    });
    c.globalAlpha = 1;
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}} />;
}

/** 打字：按进度截取，未完时带光标。 */
const typed = (text: string, p: number) => {const chars = Array.from(text), n = Math.floor(clamp(p) * chars.length); return chars.slice(0, n).join('');};
const Caret = ({on, color, h}: {on: boolean; color: string; h: number}) =>
  on ? <span style={{display: 'inline-block', width: 4, height: h, marginLeft: 4, background: color, verticalAlign: 'middle'}} /> : null;

/** 品牌标：镜片圆环 + 一枚羽毛（原创图形），字标“羽见 / PLUMO”。p 为揭示进度。 */
function Logo({x, y, size, accent, text = '#f3f6f7', p = 1, name, latin, fonts}:
  {x: number; y: number; size: number; accent: string; text?: string; p?: number; name: string; latin: string; fonts: any}) {
  if (p <= 0) return null;
  const ring = clamp(p / .6), feather = out3((p - .25) / .5), word = outBack((p - .4) / .6);
  const r = size * .46;
  return <div style={{position: 'absolute', left: x - size * 1.42, top: y - size / 2, width: size * 3.2, height: size * 1.9}}>
    <svg viewBox={`${-size * 1.6} ${-size / 2} ${size * 3.2} ${size}`} width={size * 3.2} height={size} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <g transform={`translate(${-size * 1.05} 0)`} style={{filter: `drop-shadow(0 0 ${size * .12}px ${rgba(accent, .7)})`}}>
        <circle r={r} fill="none" stroke={accent} strokeWidth={size * .06} pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - ring)}
          transform="rotate(-210)" strokeLinecap="round" />
        <g opacity={feather} transform={`scale(${mix(.6, 1, feather)}) rotate(${mix(-30, 0, feather)})`}>
          <path d={`M ${-r * .62} ${r * .62} C ${-r * .5} ${-r * .05}, ${-r * .05} ${-r * .55}, ${r * .62} ${-r * .66} C ${r * .55} ${-r * .05}, ${r * .1} ${r * .45}, ${-r * .62} ${r * .62} Z`}
            fill={text} opacity={.95} />
          <path d={`M ${-r * .78} ${r * .78} L ${r * .5} ${-r * .52}`} stroke={accent} strokeWidth={size * .035} strokeLinecap="round" />
        </g>
      </g>
    </svg>
    <div style={{position: 'absolute', left: size * 1.2, top: 0, height: size, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      opacity: clamp(word * 1.5), transform: `translateX(${(1 - clamp(word)) * -30}px)`}}>
      <div style={{fontFamily: fonts.text, fontSize: size * .62, fontWeight: 800, color: text, letterSpacing: size * .06, lineHeight: 1}}>{name}</div>
      <div style={{fontFamily: fonts.text, fontSize: size * .22, fontWeight: 600, color: accent, letterSpacing: size * .16, marginTop: size * .1, lineHeight: 1}}>{latin}</div>
    </div>
  </div>;
}

/** 切点冲击变焦：每幕第 0 帧放大 4.5%，0.35 秒内落回（切点就是强拍）。 */
const punch = (t: number) => 1 + .045 * (1 - outExpo(t / .35));
/** 幕首/幕末淡入淡出（秒；0 = 硬切，卡点片默认硬切）。 */
const fadeEdges = (t: number, dur: number, inS = 0, outS = 0) => Math.min(inS > 0 ? sm(t / inS) : 1, outS > 0 ? sm((dur - t) / outS) : 1);
/** 镜头震动（衰减）。 */
const shake = (t: number, at: number, power = 14, len = .35) => {
  const d = t - at;
  if (d < 0 || d > len) return '';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 95) * k}px, ${Math.cos(d * 70) * k * .7}px)`;
};

// 消息与来电轻提示（第三人称，地铁里别人都在低头）：她抬着头，镜片上的消息卡轻轻一闪、语音回复、来电小胶囊逐拍浮出。
export const meta = {
  title: '卖点 · 消息与来电轻提示',
  params: {
    bpm: {label: '配乐速度（BPM）', type: 'number', default: 126, min: 60, max: 200},
    beatOffset: {label: '本幕第一拍（秒）', type: 'number', default: 0, step: .01},
    cue: {label: '消息卡点词', type: 'text', default: '消息', maxLength: 12},
    callCue: {label: '来电卡点词', type: 'text', default: '手机', maxLength: 12},
    from: {label: '发消息的人', type: 'text', default: '妈妈', maxLength: 8},
    message: {label: '消息内容', type: 'text', default: '晚上回家吃饭吗？', maxLength: 16},
    reply: {label: '语音回复', type: 'text', default: '语音回复：好，七点到', maxLength: 16},
    call: {label: '来电', type: 'text', default: '来电 · 小林', maxLength: 12},
    callHint: {label: '来电操作', type: 'text', default: '轻点镜腿接听', maxLength: 12},
  },
  slots: {subway: '地铁里戴眼镜抬头的人（9:16）'},
};
export default function Notify(props: SceneInput) {
  const {t, dur, beat, at} = clock(props);
  const accent = props.theme.accent, fonts = props.fonts;
  const msg = at(txt(props, 'cue'), .45) - .08, reply = Math.max(msg + .6, beat(4)), call = Math.max(reply + .5, at(txt(props, 'callCue'), 2.1) - .05);
  const eye = {x: 515, y: 850};
  const from = txt(props, 'from');
  return <div style={{position: 'absolute', inset: 0, background: '#05070a', overflow: 'hidden', opacity: fadeEdges(t, dur)}}>
    <Plate asset={slot(props, 'subway')} frame={props.frame} scale={mix(1.04, 1.12, sm(t / dur)) * punch(t)} origin="48% 44%" />
    <Fill style={{background: 'linear-gradient(180deg, rgba(4,8,12,.55) 0%, rgba(4,8,12,.15) 34%, rgba(0,0,0,0) 50%)'}} />
    <Svg>
      {t > msg && <path d={`M ${eye.x} ${eye.y - 30} C ${eye.x - 10} ${eye.y - 120}, ${eye.x + 40} ${eye.y - 160}, ${eye.x} ${mix(eye.y - 30, 430, out3((t - msg) / .35))}`}
        fill="none" stroke={accent} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-t * 60} opacity={.75} style={{filter: `drop-shadow(0 0 6px ${accent})`}} />}
      {t > msg && <circle cx={eye.x} cy={eye.y - 30} r={10 + 6 * hit(t, msg, .4)} fill={accent} opacity={.9} style={{filter: `drop-shadow(0 0 12px ${accent})`}} />}
    </Svg>
    <Glass x={150} y={262} w={720} h={160} accent={accent} p={(t - msg) / .28}>
      <div style={{position: 'absolute', left: 30, top: 30, width: 100, height: 100, borderRadius: '50%', background: `linear-gradient(140deg, ${accent}, #1d6f5c)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.text, fontSize: 44, fontWeight: 800, color: '#06110e'}}>{Array.from(from)[0] ?? ''}</div>
      <div style={{position: 'absolute', left: 156, top: 30, fontFamily: fonts.text}}>
        <div style={{fontSize: 28, color: accent}}>{from}</div>
        <div style={{fontSize: 46, fontWeight: 700, color: '#fff', marginTop: 6, whiteSpace: 'nowrap'}}>{txt(props, 'message')}</div>
      </div>
    </Glass>
    <Chip x={300} y={450} icon="mic-fill" text={txt(props, 'reply')} accent={accent} fonts={fonts} p={(t - reply) / .3} size={32} />
    <Chip x={180} y={548} icon="phone-fill" text={txt(props, 'call')} accent={accent} fonts={fonts} p={(t - call) / .3} size={32} />
    <Chip x={520} y={556} text={txt(props, 'callHint')} accent={accent} color="rgba(236,244,245,.8)" fonts={fonts} p={(t - call - .25) / .3} size={24} />
    <Fill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)'}} />
  </div>;
}
