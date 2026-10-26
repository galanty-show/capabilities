import React from 'react';
import {Icon, Media, clamp, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 羽见 PLUMO AI 眼镜宣传片（虚构品牌）共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx；
// 底图以 WebP data URI 内联在 MEDIA（制作任务里同名素材槽优先）。运行时无字体下载、无随机与时钟，
// 每帧只由 frame、句子时间与配乐拍点（bpm + beatOffset 参数）决定。
const MEDIA: Record<string, string> = {"hook":"release-assets/f6509e673de5720f125396dc65bc97949cf38eca31e2094e2e773ae8e9ab728a.webp"};
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

// 钩子（第一视角）：低头刷手机、消息一条条压上来；念到“答案”抬头——手机掉出画面，眼镜 HUD 开机，锁定前方路口的绿灯。
export const meta = {
  title: '钩子 · 别低头',
  params: {
    bpm: {label: '配乐速度（BPM）', type: 'number', default: 126, min: 60, max: 200},
    beatOffset: {label: '本幕第一拍（秒）', type: 'number', default: 0, step: .01, help: '拍点 = 第一拍 + n × 60/BPM；换曲后改这两项'},
    liftCue: {label: '抬头卡点词', type: 'text', default: '答案', maxLength: 12},
    notices: {label: '手机消息', type: 'list', min: 1, max: 6, maxLength: 18,
      default: ['群聊消息 99+', '限时秒杀 · 还剩 3 分钟', '你关注的博主更新了', '外卖已送达', '会议改到下午 3 点', '未读邮件 12 封']},
    hudTitle: {label: 'HUD 标题', type: 'text', default: '羽见 · 已就绪', maxLength: 14},
    hudTime: {label: '时间', type: 'text', default: '18:42', maxLength: 8},
    hudWeather: {label: '天气', type: 'text', default: '雨停了 · 19°', maxLength: 14},
    target: {label: '锁定提示（{n} 为倒数秒）', type: 'text', default: '前方绿灯 · 还剩 {n} 秒', maxLength: 24},
    countdown: {label: '倒数起点（秒）', type: 'number', default: 18, min: 0, max: 99},
  },
  slots: {hook: '第一视角街景底图（9:16）'},
};
export default function Hook(props: SceneInput) {
  const {t, dur, beat, at} = clock(props);
  const accent = props.theme.accent, fonts = props.fonts;
  const lift = at(txt(props, 'liftCue'), 1.45) - .1, k = outExpo((t - lift) / .6), boot = lift + .22;
  const bob = Math.sin(t * 2.2) * 6 * (1 - k);
  const notices = list<string>(props, 'notices').map(String);
  // 低头：画面上移放大（看见脚下的路）；抬头：回到平视。
  const plateY = mix(-400, 0, k) + bob, plateS = mix(1.42, 1.08, k);
  const phoneY = 700 + Math.sin(t * 3.1) * 8 + 1500 * outExpo((t - lift) / .4), phoneR = -3 + 10 * out3((t - lift) / .5);
  const reticle = {x: 530, y: 930};
  const n = Math.max(0, num(props, 'countdown') - Math.floor(Math.max(0, t - boot)));
  const scan = (t - boot) / .55;
  return <div style={{position: 'absolute', inset: 0, background: '#05070a', overflow: 'hidden', opacity: fadeEdges(t, dur)}}>
    <Plate asset={slot(props, 'hook')} frame={props.frame} scale={plateS} y={plateY} />
    <Fill style={{background: '#04060a', opacity: mix(.42, 0, k)}} />
    {/* 手机屏幕的冷光 */}
    <Fill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 82%, rgba(120,170,255,.35), rgba(0,0,0,0) 70%)', mixBlendMode: 'screen', opacity: 1 - k}} />
    {phoneY < H + 200 && <div style={{position: 'absolute', left: 220, top: phoneY, width: 640, height: 1200, borderRadius: 78, background: '#0b0d10',
      transform: `rotate(${phoneR}deg)`, transformOrigin: '50% 0%', boxShadow: '0 30px 80px rgba(0,0,0,.6), inset 0 0 0 3px #2a2f36'}}>
      <div style={{position: 'absolute', left: 18, top: 18, right: 18, bottom: 18, borderRadius: 62, overflow: 'hidden',
        background: 'linear-gradient(170deg, #1d2a3f 0%, #121722 55%, #0d1016 100%)'}}>
        <div style={{position: 'absolute', left: 40, right: 40, top: 26, display: 'flex', justifyContent: 'space-between', fontFamily: fonts.text, fontSize: 26, color: 'rgba(255,255,255,.75)'}}>
          <span>{txt(props, 'hudTime')}</span><span>5G ▮▮▮</span>
        </div>
        {notices.map((text, i) => {
          const appear = beat((i - 2) * .5) + .02, p = out3((t - appear) / .22);  // 前两条开场就在，其余逐半拍压上来
          if (p <= 0) return null;
          const newer = notices.filter((_, j) => j > i && t >= beat((j - 2) * .5) + .02).length;
          const top = 96 + newer * 128 - (1 - p) * 60;
          return <div key={i} style={{position: 'absolute', left: 26, right: 26, top, height: 112, borderRadius: 28, background: 'rgba(255,255,255,.13)',
            opacity: p * (top > 1000 ? 0 : 1), display: 'flex', alignItems: 'center', gap: 20, padding: '0 24px', fontFamily: fonts.text}}>
            <div style={{width: 60, height: 60, borderRadius: 16, background: ['#ff5a5f', '#ffb020', '#7c5cff', '#25c26e', '#2f8cff', '#ff7a45'][i % 6], flex: 'none'}} />
            <div style={{fontSize: 32, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden'}}>{text}</div>
          </div>;
        })}
      </div>
    </div>}
    {/* HUD 开机 */}
    {t > boot && scan < 1.2 && <Fill style={{background: `linear-gradient(180deg, rgba(0,0,0,0) ${mix(10, 92, scan) - 6}%, ${rgba(accent, .45)} ${mix(10, 92, scan)}%, rgba(0,0,0,0) ${mix(10, 92, scan) + .6}%)`,
      opacity: 1 - clamp((scan - .9) / .3)}} />}
    <Glass x={150} y={250} w={780} h={150} accent={accent} p={(t - boot - .08) / .35}>
      <div style={{position: 'absolute', left: 36, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 18, fontFamily: fonts.text, color: '#f2f6f7'}}>
        <div style={{width: 22, height: 22, borderRadius: '50%', border: `4px solid ${accent}`, boxShadow: `0 0 14px ${accent}`}} />
        <span style={{fontSize: 34, fontWeight: 600, letterSpacing: 2}}>{txt(props, 'hudTitle')}</span>
      </div>
      <div style={{position: 'absolute', right: 36, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', fontFamily: fonts.text}}>
        <span style={{fontSize: 52, fontWeight: 700, color: '#fff', lineHeight: 1}}>{txt(props, 'hudTime')}</span>
        <span style={{fontSize: 26, color: accent, marginTop: 8}}>{txt(props, 'hudWeather')}</span>
      </div>
    </Glass>
    <Svg>
      <Brackets x={reticle.x - 80} y={reticle.y - 95} w={160} h={190} color={accent} p={(t - boot - .3) / .3} len={42} thick={5} />
      {t > boot + .5 && <line x1={reticle.x} y1={reticle.y + 100} x2={reticle.x} y2={reticle.y + 100 + 70 * out3((t - boot - .5) / .25)} stroke={accent} strokeWidth={3} />}
    </Svg>
    <Chip x={reticle.x - 190} y={reticle.y + 175} icon="geo-alt-fill" text={fmtN(txt(props, 'target'), n)} accent={accent} fonts={fonts} p={(t - boot - .6) / .3} size={32} />
    <Lens accent={accent} amount={k} />
  </div>;
}
const fmtN = (template: string, n: number) => template.replace('{n}', String(n));
