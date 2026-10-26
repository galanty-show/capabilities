import React from 'react';
import type {Brief, Scene} from './types';

export type LaunchProps = {frame: number; durationInFrames: number; fps: number; bpm: number; brief: Brief; scene: Scene};
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - (1 - clamp(x)) ** 3;
const pixelLetters: Record<string, string[]> = {
  A: ['01110','11011','11011','11111','11011','11011','11011'],
  B: ['111110','110011','110011','111110','110011','110011','111110'],
  C: ['01111','11000','11000','11000','11000','11000','01111'],
  D: ['11110','11011','11011','11011','11011','11011','11110'],
  E: ['11111','11000','11000','11110','11000','11000','11111'],
  F: ['11111','11000','11000','11110','11000','11000','11000'],
  G: ['01111','11000','11000','11011','11011','11011','01111'],
  H: ['11011','11011','11011','11111','11011','11011','11011'],
  I: ['11111','00100','00100','00100','00100','00100','11111'],
  J: ['00111','00011','00011','00011','11011','11011','01110'],
  K: ['11011','11011','11110','11100','11110','11011','11011'],
  L: ['11000','11000','11000','11000','11000','11000','11111'],
  M: ['11011','11111','11111','11011','11011','11011','11011'],
  N: ['11001','11101','11101','11011','11011','11011','11001'],
  O: ['01110','11011','11011','11011','11011','11011','01110'],
  P: ['11110','11011','11011','11110','11000','11000','11000'],
  Q: ['01110','11011','11011','11011','11111','01110','00011'],
  R: ['11110','11011','11011','11110','11110','11011','11011'],
  S: ['01111','11000','11000','01110','00011','00011','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['11011','11011','11011','11011','11011','11011','01110'],
  V: ['11011','11011','11011','11011','11011','01110','00100'],
  W: ['11011','11011','11011','11011','11111','11111','11011'],
  X: ['11011','11011','01110','00100','01110','11011','11011'],
  Y: ['11011','11011','01110','00100','00100','00100','00100'],
  Z: ['111111','000011','000110','001100','011000','110000','111111'],
};
const geometricMark = ['00100','01110','11111','11011','11111','01110','00100'];
const ink = '#fff5e6', muted = '#b4b0bc';
const box: React.CSSProperties = {position: 'absolute', inset: 0, overflow: 'hidden'};
const loud: React.CSSProperties = {fontWeight: 900, letterSpacing: -10, lineHeight: .96};
const beat = (p: LaunchProps) => p.frame / p.fps * p.bpm / 60;
const hit = (p: LaunchProps) => Math.exp(-(beat(p) % 1) * 8);
const a = (p: LaunchProps) => p.brief.palette.accent;

/** Full 1080p stage. Camera pushes and background parallax share the composed beat. */
function Stage({p, children, light = false}: {p: LaunchProps; children: React.ReactNode; light?: boolean}) {
  const b = beat(p), push = p.scene.section === 'drop' ? .035 : .012;
  return <div style={{...box, background: light ? a(p) : p.brief.palette.background, color: light ? '#16151b' : ink}}>
    <div style={{...box, transform: `scale(${1.015 + push * Math.min(b / 4, 1)}) translateX(${Math.sin(b * Math.PI / 8) * 8}px)`}}>{children}</div>
  </div>;
}
function CodeField({p, blur = false}: {p: LaunchProps; blur?: boolean}) {
  const b = beat(p);
  return <div style={{...box, opacity: blur ? .48 : 1, filter: blur ? 'blur(3px)' : undefined, transform: `translateY(${-b * 12}px) rotate(-5deg) scale(1.13)`, padding: '20px 70px'}}>
    {Array.from({length: 18}, (_, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 38, height: 75, opacity: i % 4 === 0 ? .8 : .45}}>
      <span style={{fontSize: 25, color: muted, width: 38}}>{String(i + 1).padStart(2, '0')}</span>
      {Array.from({length: 5}, (_, j) => <div key={j} style={{height: 15, width: 90 + (i * 67 + j * 113) % 280, background: j === i % 5 ? a(p) : '#5c6473', borderRadius: 3}} />)}
    </div>)}
  </div>;
}
function Caption({children, top = 90}: {children: React.ReactNode; top?: number}) {
  return <div style={{position: 'absolute', top, left: 110, right: 110, fontSize: 96, fontWeight: 850, letterSpacing: -4, lineHeight: 1.1}}>{children}</div>;
}

export function LaunchTerminal(p: LaunchProps) {
  const cmd = p.scene.command ?? p.brief.productName.toLowerCase();
  const typed = cmd.slice(0, Math.ceil(clamp(beat(p) / 2) * cmd.length));
  return <Stage p={p}>
    <div style={{...box, background: `linear-gradient(130deg, #28242f, ${p.brief.palette.background} 75%)`}} />
    <div style={{position: 'absolute', left: 100, top: 100, color: a(p), fontSize: 38, letterSpacing: 8}}>FROM ONE COMMAND</div>
    <div style={{position: 'absolute', left: 90, top: 190, fontSize: Math.min(280, 1680 / (p.brief.productName.length * .62)), ...loud}}>{p.brief.productName}<span style={{color: a(p)}}>_</span></div>
    <div style={{position: 'absolute', left: 100, right: -80, top: 530, padding: '50px 65px', background: '#252730', border: '3px solid #56505c', borderRadius: 28, transform: `perspective(1400px) rotateY(-6deg) translateX(${-beat(p) * 5}px)`}}>
      <div style={{fontSize: 68, whiteSpace: 'nowrap'}}><span style={{color: a(p)}}>$ </span>{typed}<span style={{display: 'inline-block', width: 22, height: 64, background: a(p), verticalAlign: 'middle', opacity: Math.floor(p.frame / 12) % 2 ? 0 : 1}} /></div>
      <div style={{marginTop: 48, fontSize: 64, color: muted}}>{p.brief.terminalLines?.[0] ?? p.brief.tagline}</div>
      <div style={{marginTop: 28, fontSize: 64, color: a(p)}}>{p.brief.terminalLines?.[1] ?? p.brief.sellingPoints[0].detail ?? p.brief.sellingPoints[0].text}</div>
    </div>
  </Stage>;
}

export function ImpactWord(p: LaunchProps) {
  const text = p.scene.text;
  const short = text; // Preserve authored claims; condense in the brief rather than silently truncating.
  const e = ease(p.frame / 7), light = p.scene.section === 'drop' && Number(p.scene.id.split('-').at(-1)) % 3 === 1;
  return <Stage p={p} light={light}>
    <CodeField p={p} blur />
    <div style={{...box, background: light ? `${a(p)}aa` : '#11121855'}} />
    <div style={{position: 'absolute', inset: '180px 130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', transform: `scale(${1.06 - .06 * e + hit(p) * .012})`}}>
      <div style={{fontSize: short.length > 15 ? 190 : 245, ...loud, maxWidth: 1700, color: light ? '#111218' : a(p), overflowWrap: 'anywhere'}}>{short}</div>
      <div style={{fontSize: 96, lineHeight: 1.05, fontWeight: 750, letterSpacing: -3, marginTop: 65}}>{p.scene.detail ?? p.brief.productName}</div>
    </div>
    <div style={{position: 'absolute', left: 100, right: 100, bottom: 110, height: 9, background: a(p), transform: `scaleX(${.35 + .65 * e})`, transformOrigin: 'left'}} />
  </Stage>;
}

export function ToolCounter(p: LaunchProps) {
  const m = p.scene.metric;
  if (!m?.source) return <ImpactWord {...p} />;
  const count = Math.min(m.value, Math.max(1, Math.ceil(ease(p.frame / (p.fps * .8)) * m.value)));
  return <Stage p={p}>
    <div style={{position: 'absolute', top: 20, left: 80, fontSize: 650, ...loud, color: a(p), fontVariantNumeric: 'tabular-nums'}}>{count}<span style={{fontSize: 220}}>in 1</span></div>
    <div style={{position: 'absolute', top: 715, left: 100, right: 100, fontSize: 96, fontWeight: 850, letterSpacing: -4}}>{m.label}</div>
    <div style={{position: 'absolute', left: 100, right: 100, bottom: 70, display: 'flex', gap: 18}}>{(m.items ?? []).map((item, i) => <div key={i} style={{flex: 1, padding: '20px 24px', background: i < count ? a(p) : '#292c34', color: i < count ? '#15151b' : muted, fontWeight: 850, fontSize: 42}}>{item}</div>)}</div>
  </Stage>;
}

export function MilestoneTimeline(p: LaunchProps) {
  const milestones = p.brief.milestones ?? [];
  const e = ease(p.frame / 25);
  return <Stage p={p}>
    <Caption>{p.brief.timelineCaption ?? "Built over time."}</Caption>
    <div style={{position: 'absolute', top: 260, left: 75, fontSize: 315, ...loud, color: 'transparent', WebkitTextStroke: `2px ${a(p)}77`}}>{milestones.at(-1)?.date}</div>
    <div style={{position: 'absolute', left: 0, top: 610, height: 5, width: 1920 * e, background: a(p)}} />
    {milestones.slice(0, 3).map((m, i) => <div key={i} style={{position: 'absolute', left: 100 + i * 600, top: 580, width: 580, transform: `translateX(${(1 - e) * 90}px)`}}>
      <div style={{height: 60, width: 60, borderRadius: '50%', background: a(p), border: '12px solid #111218'}} />
      <div style={{fontSize: 72, color: a(p), marginTop: 38, fontWeight: 750}}>{m.date}</div>
      <div style={{fontSize: 108, fontWeight: 900, letterSpacing: -4, marginTop: 22}}>{m.label}</div>
    </div>)}
  </Stage>;
}

export function FullCode(p: LaunchProps) {
  return <Stage p={p}>
    <CodeField p={p} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg,#111218 12%,#11121844 85%)'}} />
    <div style={{position: 'absolute', left: 100, top: 300, right: 100, padding: 55, borderLeft: `12px solid ${a(p)}`, background: '#20232dee', transform: `translateX(${(1 - ease(p.frame / 12)) * 70}px)`}}>
      <div style={{fontSize: 66, color: a(p)}}>$ {p.scene.command ?? `${p.brief.productName.toLowerCase()} build`}</div>
      <div style={{fontSize: 140, ...loud, marginTop: 65}}>{p.scene.text}</div>
    </div>
    <div style={{position: 'absolute', bottom: 105, left: 110, fontSize: 96, fontWeight: 800}}>{p.brief.codeCaption ?? p.scene.detail ?? p.brief.tagline}</div>
  </Stage>;
}

export function ScaleGrid(p: LaunchProps) {
  const count = p.scene.scale?.count ?? 16;
  const cols = Math.ceil(Math.sqrt(count)), rows = Math.ceil(count / cols), w = 1810 / cols, h = 900 / rows;
  return <Stage p={p}>
    {Array.from({length: count}, (_, i) => <div key={i} style={{position: 'absolute', left: 55 + (i % cols) * w, top: 65 + Math.floor(i / cols) * h, width: w - 16, height: h - 16, padding: 22, boxSizing: 'border-box', border: `2px solid ${i % 4 === Math.floor(beat(p)) % 4 ? a(p) : '#51505d'}`, borderRadius: 12, background: '#252631', transform: `translateY(${Math.sin(beat(p) * .4 + i) * 7}px)`}}>
      <div style={{fontSize: 22, color: muted}}><span style={{display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: a(p), marginRight: 9}} />{p.brief.gridItemLabel ?? "item"}-{String(i + 1).padStart(2, '0')}</div>
      {Array.from({length: 4}, (_, j) => <div key={j} style={{height: 8, marginTop: 20, width: `${40 + (i * 7 + j * 11) % 50}%`, background: j === i % 4 ? a(p) : '#727383'}} />)}
    </div>)}
    <div style={{position: 'absolute', left: 170, right: 170, top: 380, padding: '50px 35px', background: '#111218ee', border: `3px solid ${a(p)}`, textAlign: 'center', boxShadow: '0 20px 80px #0009'}}>
      <div style={{fontSize: 150, ...loud}}>{p.scene.text}</div>
    </div>
    <div style={{position: 'absolute', left: 65, bottom: 38, fontSize: 26, color: a(p), letterSpacing: 2}}>{p.scene.scale?.label}</div>
  </Stage>;
}

/** Original geometric marks. Scattered pixels lock on beat; no third-party artwork. */
export function PixelLogo(p: LaunchProps) {
  const e = ease(p.frame / Math.min(16, p.durationInFrames / 3)), ending = p.scene.ending;
  const letter = p.brief.productName[0]?.toUpperCase() ?? 'P';
  const monogram = pixelLetters[letter] ?? geometricMark;
  return <Stage p={p}>
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <defs><pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse"><rect x="3" y="3" width="47" height="47" rx="4" fill="#252631" /></pattern></defs>
      <rect width={1920} height={1080} fill="url(#grid)" opacity={.7} />
      <circle cx={960} cy={540} r={350 + 160 * e + hit(p) * 25} fill="none" stroke={a(p)} strokeWidth={3} opacity={.4} />
      {monogram.flatMap((row, y) => [...row].map((v, x) => v === '1' ? <rect key={`${x}-${y}`} x={270 + x * 70 + (1 - e) * Math.sin(x * 9 + y * 7) * 1000} y={270 + y * 70 + (1 - e) * Math.cos(x * 7 + y * 3) * 700} width={61} height={61} rx={6} fill={a(p)} /> : null))}
    </svg>
    <div style={{position: 'absolute', left: 820, top: ending ? 245 : 330, right: 90}}>
      <div style={{fontSize: Math.min(245, 1010 / (p.brief.productName.length * .62)), ...loud}}>{p.brief.productName}</div>
      <div style={{fontSize: 96, fontWeight: 850, lineHeight: 1.1, letterSpacing: -4, marginTop: 45}}>{ending ? p.brief.tagline : p.brief.revealCaption ?? p.brief.tagline}</div>
      {ending && p.brief.installCommand ? <div style={{fontSize: 52, whiteSpace: 'nowrap', color: a(p), marginTop: 65, borderTop: `3px solid ${a(p)}`, paddingTop: 35}}>$ {p.brief.installCommand}</div> : null}
    </div>
  </Stage>;
}
