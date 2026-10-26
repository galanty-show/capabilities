import React from 'react';
import {interpolate, spring} from 'remotion';

/** Original, brand-neutral UI illustrations. Coordinates use a 1120 × 510 stage.
 * Pass a scene-local frame; every motion and cursor is derived from that value.
 * No remote assets, runtime clock, CSS animations, or application-specific data.
 */
export type PrimitiveProps = {
  frame: number;
  durationInFrames: number;
  accent?: string;
  text?: string;
  productName?: string;
  items?: string[];
  fps?: number;
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const W = 1120;
const H = 510;
const C = {ink: '#F6F5F1', muted: '#A6ABB7', line: '#303642', panel: '#151A24', raised: '#1E2531', dark: '#0D1119'};
const MONO = '"Launch Sans", "Launch CJK"';
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const accentOf = (p: PrimitiveProps) => p.accent ?? '#B1F280';
const tint = (color: string, opacity: number) => `color-mix(in srgb, ${color} ${clamp(opacity) * 100}%, transparent)`;
const duration = (p: PrimitiveProps) => Math.max(1, Number.isFinite(p.durationInFrames) ? p.durationInFrames : 1);
const sceneFrame = (p: PrimitiveProps) => clamp(Number.isFinite(p.frame) ? p.frame : 0, 0, duration(p));
const phase = (p: PrimitiveProps, at = 0, span = .2) => interpolate(sceneFrame(p) / duration(p), [at, at + span], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const enter = (p: PrimitiveProps, at = 0, span = .2) => {
  const localFrame = sceneFrame(p) - duration(p) * at;
  if (localFrame < 0 || p.frame < 0) return 0;
  return spring({frame: localFrame, fps: p.fps && p.fps > 0 ? p.fps : 30, durationInFrames: Math.max(1, Math.round(duration(p) * span)), config: {damping: 22, stiffness: 140, mass: .8, overshootClamping: true}});
};
const crop: React.CSSProperties = {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'};

function Stage({p, children}: {p: PrimitiveProps; children: React.ReactNode}) {
  const scale = 470 / H;
  return <div style={{position: 'relative', width: W, height: 470, flexShrink: 0, overflow: 'hidden', color: C.ink, boxSizing: 'border-box', ...p.style}}>
    <div style={{position: 'absolute', left: (W - W * scale) / 2, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
    <div style={{position: 'absolute', left: 150, right: 150, top: 60, bottom: 20, background: `radial-gradient(ellipse, ${tint(accentOf(p), .09)}, transparent 68%)`, pointerEvents: 'none'}} />
    {children}
    </div>
  </div>;
}

function Chrome({label, accent, right}: {label: string; accent: string; right?: string}) {
  return <div style={{height: 46, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8, background: '#181E28', boxSizing: 'border-box'}}>
    {[0, 1, 2].map(i => <span key={i} style={{width: 9, height: 9, borderRadius: '50%', background: i === 0 ? tint(accent, .8) : C.line}} />)}
    <span style={{marginLeft: 18, fontSize: 15, color: C.muted, fontFamily: MONO, ...crop}}>{label}</span>
    {right ? <span style={{marginLeft: 'auto', fontSize: 13, letterSpacing: 1.5, color: accent}}>{right}</span> : null}
  </div>;
}

function Panel({p, children, style}: {p: PrimitiveProps; children: React.ReactNode; style?: React.CSSProperties}) {
  const e = enter(p);
  return <div style={{position: 'absolute', left: 56, top: 25, width: 1008, height: 460, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 18, boxShadow: '0 24px 50px #0006', opacity: e, transform: `translateY(${(1 - e) * 26}px) scale(${.97 + .03 * e})`, overflow: 'hidden', boxSizing: 'border-box', ...style}}>{children}</div>;
}

/** Type a command, then reveal up to five output lines. text is the command. */
export function Terminal(p: PrimitiveProps) {
  const a = accentOf(p);
  const command = p.text ?? `${(p.productName ?? 'product').toLowerCase()} build`;
  const typed = Array.from(command).slice(0, Math.floor(phase(p, .1, .3) * Array.from(command).length)).join('');
  const lines = (p.items ?? ['Load project', 'Prepare workspace', 'Build something great']).slice(0, 5);
  const blink = Math.floor(sceneFrame(p) / Math.max(1, Math.round((p.fps ?? 30) * .45))) % 2 === 0;
  return <Stage p={p}><Panel p={p}>
    <Chrome label={p.title ?? `${p.productName ?? 'workspace'} / terminal`} accent={a} right="SHELL" />
    <div style={{padding: '32px 40px', fontFamily: MONO}}>
      <div style={{fontSize: 30, display: 'flex', alignItems: 'center', gap: 17, minHeight: 42, ...crop}}><span style={{color: a}}>›</span><span>{typed}</span><span style={{display: 'inline-block', width: 13, height: 30, background: a, opacity: blink ? 1 : 0, flexShrink: 0}} /></div>
      <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 17}}>
        {lines.map((line, i) => {
          const e = enter(p, .43 + i * .065, .14);
          return <div key={i} style={{display: 'flex', gap: 18, fontSize: 23, opacity: e, transform: `translateY(${(1 - e) * 10}px)`}}><span style={{color: a}}>+</span><span style={{color: i === lines.length - 1 ? C.ink : C.muted, ...crop}}>{line}</span></div>;
        })}
      </div>
    </div>
    <div style={{position: 'absolute', bottom: 18, left: 40, right: 40, color: C.muted, fontSize: 14, display: 'flex', justifyContent: 'space-between'}}><span>{p.subtitle ?? 'One command. A clear next step.'}</span><span style={{color: a, opacity: phase(p, .8, .1)}}>READY *</span></div>
  </Panel></Stage>;
}

export type CodeEditorProps = PrimitiveProps & {code?: string | string[]; filename?: string; highlightLine?: number};

function Syntax({line, accent}: {line: string; accent: string}) {
  // Lightweight illustrative highlighting; it is deliberately not a parser.
  const tokens = line.split(/("[^"\n]*"|'[^'\n]*'|\b(?:export|const|return|async|await|function|import|from|true|false|type)\b|\b\d+\b|\/\/.*$)/g);
  return <>{tokens.map((token, i) => <span key={i} style={{color: /^['"]/.test(token) ? '#E7CE95' : /^(export|const|return|async|await|function|import|from|true|false|type)$/.test(token) ? accent : /^\d+$/.test(token) ? '#B5C8FF' : token.startsWith('//') ? C.muted : C.ink}}>{token}</span>)}</>;
}

/** Highlight and scroll supplied code, with a moving active-line treatment. */
export function CodeEditor(p: CodeEditorProps) {
  const a = accentOf(p);
  const source = p.code ?? ['export const create = async () => {', '  const project = await open("workspace");', '  const idea = project.next();', '', '  return {', '    title: "A fresh start",', '    ready: true,', '    steps: 3,', '  };', '};', '', '// Keep the next idea moving.'];
  const lines = (typeof source === 'string' ? source.split('\n') : source).slice(0, 120);
  const focusPosition = clamp(p.highlightLine ?? phase(p, .22, .58) * Math.max(0, lines.length - 1), 0, Math.max(0, lines.length - 1));
  const focus = Math.floor(focusPosition);
  const scroll = clamp(focusPosition - 4, 0, Math.max(0, lines.length - 9)) * 34;
  return <Stage p={p}><Panel p={p}>
    <Chrome label={p.title ?? `${p.productName ?? 'Project'} / editor`} accent={a} />
    <div style={{position: 'absolute', left: 0, top: 46, bottom: 27, width: 176, borderRight: `1px solid ${C.line}`, background: '#111620', padding: '25px 18px', boxSizing: 'border-box'}}>
      <div style={{fontSize: 12, color: C.muted, letterSpacing: 2, marginBottom: 23}}>EXPLORER</div>
      {['workspace', '  scenes', `  ${p.filename ?? 'main.tsx'}`, '  package.json'].map((name, i) => <div key={i} style={{fontSize: 16, fontFamily: MONO, padding: '9px 6px', margin: '0 -6px', color: i === 2 ? a : C.muted, background: i === 2 ? tint(a, .08) : 'transparent', ...crop}}>{name}</div>)}
    </div>
    <div style={{position: 'absolute', left: 176, right: 0, top: 46, height: 43, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', paddingLeft: 25, fontSize: 16, fontFamily: MONO, color: a}}>{p.filename ?? 'main.tsx'}</div>
    <div style={{position: 'absolute', left: 176, top: 104, right: 0, bottom: 35, overflow: 'hidden'}}>
      <div style={{transform: `translateY(${-scroll}px)`, fontFamily: MONO, fontSize: 21, lineHeight: '34px'}}>
        {lines.map((line, i) => <div key={i} style={{display: 'flex', background: i === focus ? tint(a, .1) : 'transparent', borderLeft: `3px solid ${i === focus ? a : 'transparent'}`, opacity: enter(p, .12 + Math.min(i, 8) * .025, .15)}}><span style={{width: 55, flexShrink: 0, textAlign: 'right', paddingRight: 22, color: i === focus ? a : '#5B6576', fontSize: 16, userSelect: 'none'}}>{i + 1}</span><span style={{whiteSpace: 'pre'}}><Syntax line={line} accent={a} /></span></div>)}
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 27, background: tint(a, .13), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontSize: 12, color: C.muted}}><span>{p.subtitle ?? 'main / workspace'}</span><span>Ln {focus + 1} · TSX</span></div>
  </Panel></Stage>;
}

export type BrowserWindowProps = PrimitiveProps & {url?: string};

/** Browser chrome and a progressive three-card product page, or custom children. */
export function BrowserWindow(p: BrowserWindowProps) {
  const a = accentOf(p);
  const items = (p.items ?? ['Create', 'Connect', 'Deliver']).slice(0, 3);
  return <Stage p={p}><Panel p={p}>
    <Chrome label={p.url ?? 'workspace.local'} accent={a} right=">" />
    {p.children ?? <div style={{padding: '24px 35px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 20, fontWeight: 750}}>{p.productName ?? 'Your product'}</span><span style={{fontSize: 13, padding: '6px 11px', borderRadius: 20, border: `1px solid ${C.line}`, color: C.muted}}>WORKSPACE</span></div>
      <div style={{marginTop: 24, fontSize: 43, lineHeight: 1.15, fontWeight: 750, letterSpacing: -1, ...crop}}>{p.text ?? p.title ?? 'Make room for your next idea.'}</div>
      <div style={{marginTop: 12, fontSize: 19, color: C.muted, ...crop}}>{p.subtitle ?? 'A focused place to build and share.'}</div>
      <div style={{display: 'flex', gap: 18, marginTop: 27}}>{items.map((item, i) => {
        const e = enter(p, .23 + i * .14, .22);
        return <div key={i} style={{flex: 1, minWidth: 0, height: 143, borderRadius: 12, border: `1px solid ${C.line}`, background: C.raised, padding: '20px 22px', boxSizing: 'border-box', opacity: e, transform: `translateY(${(1 - e) * 22}px)`}}><span style={{color: a, fontSize: 14, fontFamily: MONO}}>0{i + 1}</span><div style={{marginTop: 10, fontSize: 25, fontWeight: 650, ...crop}}>{item}</div><div style={{height: 5, borderRadius: 5, background: C.line, marginTop: 20}}><div style={{width: `${phase(p, .3 + i * .12, .25) * 100}%`, height: '100%', borderRadius: 5, background: a}} /></div></div>;
      })}</div>
    </div>}
  </Panel></Stage>;
}

/** Generic mobile hardware with a notification stack and room for a caption. */
export function PhoneFrame(p: PrimitiveProps) {
  const a = accentOf(p), e = enter(p);
  const items = (p.items ?? ['Your workspace, ready.', 'Keep the next step close.']).slice(0, 3);
  return <Stage p={p}>
    <div style={{position: 'absolute', left: 145, top: 17, width: 260, height: 476, padding: 8, borderRadius: 40, background: '#343B49', border: '1px solid #566072', boxShadow: '0 24px 50px #0008', transform: `translateY(${(1 - e) * 45}px) rotate(${(1 - e) * -6}deg)`, opacity: e, boxSizing: 'border-box'}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 32, background: C.dark, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 79, top: 12, width: 86, height: 21, borderRadius: 15, background: '#030509'}} />
        <div style={{position: 'absolute', left: 24, right: 24, top: 57, bottom: 25}}>{p.children ?? <>
          <div style={{fontSize: 13, color: a, letterSpacing: 1.5, ...crop}}>{p.productName ?? 'WORKSPACE'}</div>
          <div style={{fontSize: 29, fontWeight: 700, lineHeight: 1.2, marginTop: 15}}>Ready when<br />you are.</div>
          {items.map((item, i) => <div key={i} style={{padding: '16px 14px', borderRadius: 13, background: C.raised, border: `1px solid ${C.line}`, marginTop: 18, fontSize: 17, lineHeight: 1.35, opacity: enter(p, .23 + i * .16, .2), transform: `translateY(${(1 - enter(p, .23 + i * .16, .2)) * 14}px)`}}><div style={{height: 4, width: 26, background: a, borderRadius: 4, marginBottom: 10}} />{item}</div>)}
        </>}</div>
        <div style={{position: 'absolute', left: 87, bottom: 9, height: 4, width: 70, borderRadius: 4, background: '#87909E'}} />
      </div>
    </div>
    <div style={{position: 'absolute', left: 485, top: 148, width: 540, opacity: enter(p, .22, .23), transform: `translateX(${(1 - enter(p, .22, .23)) * 25}px)`}}>
      <div style={{fontSize: 15, color: a, letterSpacing: 3, marginBottom: 19}}>ON THE MOVE</div><div style={{fontSize: 49, fontWeight: 750, lineHeight: 1.13, letterSpacing: -1, whiteSpace: 'pre-line'}}>{p.text ?? p.title ?? 'A small screen.\nA big next step.'}</div><div style={{fontSize: 23, lineHeight: 1.5, color: C.muted, marginTop: 23}}>{p.subtitle ?? 'Stay close to what you are making.'}</div>
    </div>
  </Stage>;
}

/** File cards arrive one by one; earlier cards remain visible in the stack. */
export function CardStack(p: PrimitiveProps) {
  const a = accentOf(p), items = (p.items ?? ['Brief.md', 'Design.tsx', 'Launch.mp4']).slice(0, 5);
  const gap = items.length > 3 ? 62 : 94;
  return <Stage p={p}>
    <div style={{position: 'absolute', left: 38, top: 53, width: 230, opacity: enter(p)}}><div style={{fontSize: 15, color: a, letterSpacing: 2}}>YOUR FILES</div><div style={{fontSize: 37, fontWeight: 750, lineHeight: 1.2, marginTop: 15, whiteSpace: 'pre-line'}}>{p.title ?? p.text ?? 'Every piece,\nin place.'}</div><div style={{fontSize: 18, color: C.muted, marginTop: 17, lineHeight: 1.5}}>{p.subtitle ?? 'Bring your ideas together.'}</div></div>
    {items.map((item, i) => {
      const e = enter(p, .12 + i * .13, .22);
      const y = 45 + i * gap;
      return <div key={i} style={{position: 'absolute', left: 310 + i * 12, top: y, width: 700 - i * 12, height: 134, borderRadius: 15, border: `1px solid ${i === items.length - 1 ? tint(a, .6) : C.line}`, background: i % 2 ? '#1B222E' : C.panel, boxShadow: '0 13px 23px #0005', display: 'flex', alignItems: 'center', padding: '0 29px', gap: 23, boxSizing: 'border-box', opacity: e, transform: `translateX(${(1 - e) * 100}px) rotate(${(1 - e) * 3}deg)`}}>
        <div style={{width: 54, height: 65, borderRadius: '7px 16px 7px 7px', border: `1px solid ${tint(a, .65)}`, background: tint(a, .08), display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 7, padding: 11, boxSizing: 'border-box'}}>{[25, 21, 14].map((width, k) => <div key={k} style={{width, height: 3, borderRadius: 2, background: a, opacity: .9 - k * .2}} />)}</div>
        <div style={{flex: 1, minWidth: 0}}><div style={{fontSize: 28, fontWeight: 650, ...crop}}>{item}</div><div style={{fontFamily: MONO, color: C.muted, fontSize: 14, marginTop: 9}}>FILE / {String(i + 1).padStart(2, '0')}</div></div><span style={{fontSize: 24, color: a, opacity: phase(p, .27 + i * .13, .1)}}>&gt;</span>
      </div>;
    })}
  </Stage>;
}

export type GrowthChartProps = PrimitiveProps & {value?: number; prefix?: string; suffix?: string; decimals?: number; points?: number[]; labels?: [string, string]};

/** Illustrative numerical growth; callers supply values and any factual caption. */
export function GrowthChart(p: GrowthChartProps) {
  const a = accentOf(p), progress = phase(p, .12, .65);
  const values = (p.points ?? [4, 8, 15, 22, 38, 58, 86, 120]).filter(Number.isFinite);
  const data = values.length >= 2 ? values : [0, 1];
  const min = Math.min(0, ...data), max = Math.max(min + 1, ...data);
  const all = data.map((v, i) => ({x: 450 + i / (data.length - 1) * 580, y: 405 - (v - min) / (max - min) * 310}));
  const position = progress * (all.length - 1), index = Math.min(all.length - 2, Math.floor(position)), fraction = position - index;
  const head = {x: all[index].x + (all[index + 1].x - all[index].x) * fraction, y: all[index].y + (all[index + 1].y - all[index].y) * fraction};
  const drawn = [...all.slice(0, index + 1), head];
  const path = drawn.map((point, i) => `${i ? 'L' : 'M'}${point.x} ${point.y}`).join(' ');
  const value = Number.isFinite(p.value) ? p.value! : 120;
  const digits = (value * progress).toLocaleString('en-US', {minimumFractionDigits: clamp(p.decimals ?? 0, 0, 6), maximumFractionDigits: clamp(p.decimals ?? 0, 0, 6)});
  return <Stage p={p}>
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: enter(p)}}>
      {[0, 1, 2, 3, 4].map(i => <line key={i} x1={450} x2={1030} y1={95 + i * 77.5} y2={95 + i * 77.5} stroke={C.line} strokeDasharray="3 9" />)}
      <path d={`${path} L${head.x} 405 L450 405 Z`} fill={tint(a, .07)} />
      <path d={path} stroke={a} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={head.x} cy={head.y} r={19} fill={tint(a, .13)} /><circle cx={head.x} cy={head.y} r={6} fill={a} />
      <line x1={450} x2={1030} y1={405} y2={405} stroke={C.line} />
      <text x={450} y={441} fill={C.muted} fontSize={17}>{p.labels?.[0] ?? 'START'}</text><text x={1030} y={441} fill={C.muted} fontSize={17} textAnchor="end">{p.labels?.[1] ?? 'NEXT'}</text>
    </svg>
    <div style={{position: 'absolute', left: 38, top: 120, width: 380, opacity: enter(p, .08)}}><div style={{fontSize: 16, color: a, letterSpacing: 2}}>{p.title ?? 'MOMENTUM'}</div><div style={{fontSize: 78, fontWeight: 750, fontVariantNumeric: 'tabular-nums', letterSpacing: -3, lineHeight: 1.25, marginTop: 17, ...crop}}>{p.prefix ?? ''}{digits}<span style={{fontSize: 39, color: a, letterSpacing: -1}}>{p.suffix ?? '+'}</span></div><div style={{fontSize: 29, fontWeight: 650, marginTop: 12}}>{p.text ?? 'Keep moving forward.'}</div><div style={{fontSize: 17, lineHeight: 1.5, color: C.muted, marginTop: 22}}>{p.subtitle ?? 'Illustrative data'}</div></div>
  </Stage>;
}

export type FeatureTrioProps = PrimitiveProps & {descriptions?: string[]};

function FeatureGlyph({index, accent}: {index: number; accent: string}) {
  return <svg width={70} height={70} viewBox="0 0 70 70" fill="none" stroke={accent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    {index === 0 ? <><path d="M16 21h38v34H16z" /><path d="M24 14v14m22-14v14M16 33h38" /><path d="m27 44 6 6 12-12" /></> : index === 1 ? <><path d="m22 17-13 18 13 18m26-36 13 18-13 18M41 13 29 57" /></> : <><path d="M14 52h42M20 44V30m15 14V19m15 25V10" /><path d="m15 22 17-10 11 4 13-9" /></>}
  </svg>;
}

/** Three concise features enter in sequence, each with an original line glyph. */
export function FeatureTrio(p: FeatureTrioProps) {
  const a = accentOf(p), items = (p.items ?? ['Start simply', 'Make it yours', 'Move forward']).slice(0, 3);
  return <Stage p={p}>
    <div style={{position: 'absolute', left: 44, right: 44, top: 27, fontSize: 33, fontWeight: 700, opacity: enter(p), ...crop}}>{p.title ?? p.text ?? 'Three ways to make it happen.'}</div>
    <div style={{position: 'absolute', left: 44, right: 44, top: 111, display: 'flex', gap: 24}}>{items.map((item, i) => {
      const e = enter(p, .1 + i * .18, .24);
      return <div key={i} style={{flex: 1, minWidth: 0, height: 312, border: `1px solid ${C.line}`, borderRadius: 17, padding: '27px 28px', boxSizing: 'border-box', background: `linear-gradient(155deg, ${C.raised}, ${C.panel})`, opacity: e, transform: `translateY(${(1 - e) * 45}px) scale(${.94 + .06 * e})`}}><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}><FeatureGlyph index={i} accent={a} /><span style={{fontSize: 13, fontFamily: MONO, color: C.muted}}>0{i + 1}</span></div><div style={{fontSize: 30, fontWeight: 750, lineHeight: 1.16, marginTop: 26, overflowWrap: 'anywhere'}}>{item}</div><div style={{fontSize: 18, lineHeight: 1.5, color: C.muted, marginTop: 15}}>{p.descriptions?.[i] ?? ['A clear place to begin.', 'Details that fit your flow.', 'Ready for the next step.'][i]}</div></div>;
    })}</div>
    {p.subtitle ? <div style={{position: 'absolute', left: 44, right: 44, bottom: 30, fontSize: 18, textAlign: 'center', color: C.muted, opacity: phase(p, .72, .12)}}>{p.subtitle}</div> : null}
  </Stage>;
}

/** Brand-neutral geometric mark, product name and slogan. children replaces mark. */
export function LogoReveal(p: PrimitiveProps) {
  const a = accentOf(p), mark = enter(p, .04, .26), word = enter(p, .2, .25), slogan = enter(p, .43, .24);
  return <Stage p={p}>
    <div style={{position: 'absolute', left: 480, top: 40, width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${.7 + mark * .3}) rotate(${(1 - mark) * -12}deg)`, opacity: mark}}>{p.children ?? <svg width={138} height={138} viewBox="0 0 138 138" fill="none"><rect x={17} y={17} width={104} height={104} rx={29} stroke={tint(a, .4)} strokeWidth={2} /><path d="M43 82V43h26a20 20 0 0 1 0 40H54" stroke={a} strokeWidth={10} strokeLinecap="round" /><circle cx={92} cy={96} r={6} fill={a} /></svg>}</div>
    <div style={{position: 'absolute', left: 60, right: 60, top: 222, textAlign: 'center', fontSize: 76, lineHeight: 1.15, fontWeight: 750, letterSpacing: -2, opacity: word, transform: `translateY(${(1 - word) * 24}px)`, ...crop}}>{p.productName ?? p.title ?? 'Your product'}</div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 331, fontSize: 31, lineHeight: 1.3, textAlign: 'center', color: C.muted, opacity: slogan, transform: `translateY(${(1 - slogan) * 16}px)`}}>{p.text ?? 'Make your next idea happen.'}</div>
    <div style={{position: 'absolute', left: 516, width: 88, height: 3, top: 411, borderRadius: 2, background: a, transform: `scaleX(${phase(p, .55, .2)})`}} />
    {p.subtitle ? <div style={{position: 'absolute', left: 60, right: 60, bottom: 28, fontSize: 17, color: C.muted, textAlign: 'center', opacity: phase(p, .65, .2)}}>{p.subtitle}</div> : null}
  </Stage>;
}

// Full-frame launch-film compositions. Legacy UI illustrations above remain reusable.
export {LaunchTerminal, ImpactWord, ToolCounter, MilestoneTimeline, FullCode, ScaleGrid, PixelLogo} from './launch';
export type {LaunchProps} from './launch';

// Authored, sourced Galanty self-proof film (not the neutral starter default).
export {SelfProof} from './self-proof';
