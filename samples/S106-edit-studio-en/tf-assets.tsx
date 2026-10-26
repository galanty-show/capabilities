import React from 'react';
import type {SceneInput} from '@talkframe/scene';
import {Icon} from '@talkframe/scene';

// 第 4 幕（小节 14-17，间奏）：项目素材库里依次叠入三类素材——网络图片、随包曲库、随包图标——每条都带来源与许可。
type Row = {k: string; v: string};
export const meta = {title: 'Break: asset tracking', description: 'Four break bars: one asset card stacks in every four beats (nothing is replaced), each with its source, author and license; a closing line says it all happens on your computer.', params: {
  label: {label: 'Corner label', type: 'text', default: 'Assets'},
  title: {label: 'Title', type: 'text', default: 'Every asset keeps its source and license'},
  footnote: {label: 'Footnote', type: 'text', default: 'Import, convert, record — all on your computer'},
}};

// ---- 共用小工具（每幕自带一份：幕代码不能相对导入） ----
const BEAT = 60 / 124, BAR = BEAT * 4;
const MONO = '"SF Mono", Menlo, Monaco, Consolas, monospace';
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const outExpo = (x: number) => (x = clamp(x)) >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const inExpo = (x: number) => (x = clamp(x)) <= 0 ? 0 : Math.pow(2, 10 * x - 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hit = (b: number, at: number, len = 1) => clamp((b - at) / len);
const HEX = /^#[0-9a-f]{6}$/i;
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(lerp(v, y[i], t)).toString(16).padStart(2, '0')).join('');
};
const alpha = (hex: string, a: number) => hex + Math.round(clamp(a) * 255).toString(16).padStart(2, '0');
function kit(props: SceneInput) {
  const th = props.theme ?? ({} as SceneInput['theme']);
  const bg = HEX.test(th.background) ? th.background : '#0A0D0E';
  const ink = HEX.test(th.text) ? th.text : '#F2F3EF';
  const mute = HEX.test(th.muted) ? th.muted : '#8A9691';
  const lime = HEX.test(th.accent) ? th.accent : '#C9F65A';
  return {bg, ink, mute, lime, panel: mix(bg, ink, .045), panel2: mix(bg, ink, .085), line: mix(bg, ink, .16)};
}
type Kit = ReturnType<typeof kit>;
const beatOf = (p: SceneInput) => ((Number(p.params.f0 ?? 0) + p.frame) / p.fps - Number(p.params.bar0 ?? 0) * BAR) / BEAT;

function Mark({h, ink, lime}: {h: number; ink: string; lime: string}) {
  const B = [[16, 20, 68], [16, 43.5, 68], [16, 67, 41.4]];
  return <svg width={h * 69 / 66} height={h} viewBox="16 20 69 66" style={{display: 'block', overflow: 'visible'}}>
    {B.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={13} rx={6.5} fill={ink} />)}
    <path d="M64.5 62.13L84.98 73.5L64.5 84.88Z" fill={lime} stroke={lime} strokeWidth={2.73} strokeLinejoin="round" />
  </svg>;
}

function Visual({kind, t, C}: {kind: number; t: number; C: Kit}) {
  if (kind === 0) return <svg viewBox="0 0 320 180" width={320} height={180} style={{display: 'block'}}>
    <rect width={320} height={180} fill={mix(C.bg, '#2F6B4F', .5)} />
    <circle cx={250} cy={52} r={26} fill="#F4E7B0" opacity={.9} />
    <path d="M0 130 L60 92 L110 118 L170 70 L230 112 L280 90 L320 108 L320 180 L0 180Z" fill="#3E8E62" />
    <path d="M0 150 L80 120 L150 146 L220 118 L320 150 L320 180 L0 180Z" fill="#2B6B49" />
    {[40, 96, 150, 210, 262].map((x, i) => <g key={i}><rect x={x - 3} y={128 - (i % 2) * 8} width={6} height={22} fill="#1E3B2C" /><circle cx={x} cy={120 - (i % 2) * 8} r={14} fill="#5DBB7E" /></g>)}
  </svg>;
  if (kind === 1) return <svg viewBox="0 0 320 180" width={320} height={180} style={{display: 'block'}}>
    <rect width={320} height={180} fill={C.panel2} />
    {Array.from({length: 40}, (_, i) => {const h = 12 + Math.abs(Math.sin(i * .9) * 50 + Math.sin(i * .37 + t * 6) * 22); const played = i / 40 < (t * .25) % 1;
      return <rect key={i} x={20 + i * 7} y={90 - h / 2} width={4} height={h} rx={2} fill={played ? C.lime : C.mute} opacity={played ? 1 : .55} />;})}
  </svg>;
  const names = ['image-fill', 'music-note-beamed', 'film', 'palette-fill', 'camera-reels-fill', 'star-fill', 'rocket', 'globe2'];
  return <div style={{width: 320, height: 180, background: C.panel2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center', justifyItems: 'center', padding: '14px 10px', boxSizing: 'border-box'}}>
    {names.map((n, i) => <div key={n} style={{opacity: clamp(t * 4 - i * .4), transform: `scale(${.6 + .4 * outExpo(clamp(t * 4 - i * .4))})`}}><Icon name={n} size={52} color={i % 3 === 0 ? C.lime : C.ink} /></div>)}
  </div>;
}

export default function Scene(props: SceneInput) {
  const C = kit(props);
  const b = beatOf(props);
  const {width, fonts} = props;
  const label = String(props.params.label ?? 'Assets');
  const title = String(props.params.title ?? 'Every asset keeps its source and license');
  const footnote = String(props.params.footnote ?? 'Import, convert, record — all on your computer');
  const cards: Array<{at: number; name: string; tag: string; rows: Row[]; chip: string; extra?: string}> = [
    {at: 1, name: 'City park illustration', tag: 'Image · from the web', rows: [{k: 'Source link', v: 'Saved ↗'}, {k: 'Author / credit', v: 'As the author asks'}, {k: 'License / terms', v: 'CC0 1.0'}], chip: 'Saved on import'},
    {at: 5, name: 'Tiny Movement', tag: 'Bundled music · 1 of 21', rows: [{k: 'Author', v: 'Scott Clarke'}, {k: 'License', v: 'CC BY 4.0'}, {k: 'Credit', v: 'Required'}], chip: 'Credit written for you',
      extra: 'Tiny Movement © 2025 Scott Clarke, licensed under CC BY 4.0'},
    {at: 9, name: 'Bundled icons', tag: '131 solid icons', rows: [{k: 'Source', v: 'Bootstrap Icons'}, {k: 'License', v: 'MIT'}, {k: 'Format', v: 'SVG'}], chip: 'License included'},
  ];
  const push = 1 + .02 * b / 16;
  const out = inExpo(hit(b, 15.4, .6));

  return <div style={{position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: fonts.text}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0', opacity: 1 - out}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 70% 60%, ${alpha(C.lime, .05)}, transparent 60%)`}} />
      <div style={{position: 'absolute', left: 110, top: 84, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 16, opacity: outExpo(hit(b, 0, .5))}}>
        <Mark h={40} ink={C.ink} lime={C.lime} /><span style={{fontSize: 36, fontWeight: 900, color: C.lime, letterSpacing: 2}}>{label}</span>
      </div>
      <div style={{position: 'absolute', left: 110, top: 128, fontSize: 64, fontWeight: 800, color: C.ink, letterSpacing: 0, whiteSpace: 'nowrap',
        clipPath: `inset(-20% ${100 - 100 * outExpo(hit(b, .2, 1.2))}% -20% 0)`}}>{title}</div>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '960px 640px'}}>
        {cards.map((c, i) => {
          const e = outExpo(hit(b, c.at, .8));
          const y = 262 + i * 248;
          const t = Math.max(0, (b - c.at) * BEAT);
          const chipIn = outExpo(hit(b, c.at + 1.2, .5));
          return <div key={i} style={{position: 'absolute', left: 110, top: y, width: 1700, height: 224, borderRadius: 20, background: C.panel, border: `2px solid ${b < c.at + 4 && b >= c.at ? alpha(C.lime, .55) : C.line}`,
            opacity: e, transform: `translateX(${(1 - e) * 140}px)`, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 22, top: 22, borderRadius: 12, overflow: 'hidden'}}><Visual kind={i} t={t} C={C} /></div>
            <div style={{position: 'absolute', left: 380, top: 30, whiteSpace: 'nowrap'}}>
              <span style={{fontSize: 44, fontWeight: 800, color: C.ink}}>{c.name}</span>
              <span style={{marginLeft: 20, fontSize: 26, color: C.mute}}>{c.tag}</span>
            </div>
            <div style={{position: 'absolute', left: 380, top: 98, display: 'flex', gap: 48}}>
              {c.rows.map((r, j) => <div key={j} style={{opacity: outExpo(hit(b, c.at + .4 + j * .25, .4))}}>
                <div style={{fontSize: 21, color: C.mute}}>{r.k}</div>
                <div style={{marginTop: 6, fontSize: 30, fontWeight: 700, color: r.k.includes('License') ? C.lime : C.ink, whiteSpace: 'nowrap'}}>{r.v}</div>
              </div>)}
            </div>
            {c.extra ? <div style={{position: 'absolute', left: 380, top: 186, fontFamily: MONO, fontSize: 18, color: C.mute, whiteSpace: 'nowrap', opacity: chipIn,
              clipPath: `inset(0 ${100 - 100 * outExpo(hit(b, c.at + 1.4, 1.2))}% 0 0)`}}>{c.extra}</div> : null}
            <div style={{position: 'absolute', right: 30, top: 80, padding: '14px 24px', borderRadius: 14, background: C.lime, color: C.bg, fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap',
              opacity: chipIn, transform: `scale(${lerp(1.25, 1, chipIn)})`}}>✓ {c.chip}</div>
          </div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 0, width: 1920, top: 1028, textAlign: 'center', fontSize: 26, color: C.mute, letterSpacing: 4, opacity: outExpo(hit(b, 12, .8))}}>{footnote}</div>
    </div>
  </div>;
}
