import React from 'react';
import type {SceneInput} from '@talkframe/scene';

// 第 7 幕（小节 26-29，Drop B 后半）：导出按钮提醒“有新改动，重新导出”→ 三件事逐拍砸下 → 末拍停顿，淡进品牌片尾的底色。
type Pillar = {title: string; sub: string};
const DEFAULT_PILLARS: Pillar[] = [
  {title: 'Live preview', sub: 'No render wait'},
  {title: 'Precise edits', sub: 'Find it, fix it, play on'},
  {title: 'Asset tracking', sub: 'Source & license on record'},
];
export const meta = {title: 'Drop B: deliver, and the three things', description: 'The export button turns into "New changes — export again"; from beat 8 the three pillars land one per beat, then the brand and "Watching, playing and editing are free." with a small credit line saying this film can be copied from the sample gallery (empty hides it); the last beat fades into the outro background.', params: {
  caption: {label: 'Caption', type: 'text', default: 'Changed something? Export reminds you.'},
  pillars: {label: 'Pillars', type: 'list', item: [{key: 'title', label: 'Title'}, {key: 'sub', label: 'Line'}]},
  free: {label: 'Free line', type: 'text', default: 'Watching, playing and editing are free.'},
  workTitle: {label: 'Project name', type: 'text', default: 'Next week'},
  credit: {label: 'Credit line', type: 'text', default: 'Made with Galanty · copy it from the sample gallery: S106'},
}};

// ---- 共用小工具（每幕自带一份：幕代码不能相对导入） ----
const BEAT = 60 / 124, BAR = BEAT * 4;
const MONO = '"SF Mono", Menlo, Monaco, Consolas, monospace';
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const outExpo = (x: number) => (x = clamp(x)) >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const inExpo = (x: number) => (x = clamp(x)) <= 0 ? 0 : Math.pow(2, 10 * x - 10);
const inOut = (x: number) => (x = clamp(x)) < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
const beatOf = (p: SceneInput) => ((Number(p.params.f0 ?? 0) + p.frame) / p.fps - Number(p.params.bar0 ?? 0) * BAR) / BEAT;

function Mark({h, ink, lime}: {h: number; ink: string; lime: string}) {
  const B = [[16, 20, 68], [16, 43.5, 68], [16, 67, 41.4]];
  return <svg width={h * 69 / 66} height={h} viewBox="16 20 69 66" style={{display: 'block', overflow: 'visible'}}>
    {B.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={13} rx={6.5} fill={ink} />)}
    <path d="M64.5 62.13L84.98 73.5L64.5 84.88Z" fill={lime} stroke={lime} strokeWidth={2.73} strokeLinejoin="round" />
  </svg>;
}

export default function Scene(props: SceneInput) {
  const C = kit(props);
  const b = beatOf(props);
  const {width, fonts} = props;
  const caption = String(props.params.caption ?? 'Changed something? Export reminds you.');
  const pillars = ((props.params.pillars as Pillar[] | undefined) ?? DEFAULT_PILLARS).slice(0, 3);
  const free = String(props.params.free ?? 'Watching, playing and editing are free.');
  const workTitle = String(props.params.workTitle ?? 'Next week');
  const credit = String(props.params.credit ?? 'Made with Galanty · copy it from the sample gallery: S106');

  const kick = Math.exp(-(b % 1) * 7) * (b < 15 ? 1 : 0);
  const panelIn = outExpo(hit(b, 0, .6));
  const stale = b >= 2;
  const flip = outExpo(hit(b, 2, .4));
  const pulse = stale ? Math.exp(-((b - 2) % 2) * 3) : 0;
  const panelOut = inExpo(hit(b, 7.4, .6));
  const capIn = outExpo(hit(b, .4, .5));
  // 第 8 拍起三件事；第 15 拍（音乐停顿）起用一拍淡到片尾底色
  const fade = inOut(hit(b, 15, 1));
  // 片尾底色（src/brand/MadeWithOutro.tsx 同款径向渐变），最后一拍完全交给它
  const outroBg = 'radial-gradient(ellipse at 50% 45%, #121A1B 0%, #0A0D0E 70%)';

  return <div style={{position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: fonts.text}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 52%, ${alpha(C.lime, .05 + .08 * kick)}, transparent 62%)`}} />
      {/* 导出区 */}
      {b < 8.2 ? <div style={{position: 'absolute', inset: 0, opacity: panelIn * (1 - panelOut), transform: `translateY(${-80 * panelOut}px)`}}>
        <div style={{position: 'absolute', left: 110, top: 76, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 16}}>
          <Mark h={40} ink={C.ink} lime={C.lime} /><span style={{fontSize: 36, fontWeight: 900, color: C.lime, letterSpacing: 2}}>Deliver</span>
        </div>
        <div style={{position: 'absolute', left: 620, width: 1190, top: 76, transform: `translateY(-50%) translateY(${(1 - capIn) * 18}px)`, textAlign: 'right', fontSize: 52, fontWeight: 800,
          color: C.ink, letterSpacing: 0, opacity: capIn, whiteSpace: 'nowrap'}}>{caption}</div>
        <div style={{position: 'absolute', left: 260, top: 210, width: 1400, height: 700, borderRadius: 24, background: C.panel, border: `2px solid ${C.line}`, boxShadow: '0 40px 140px #000c'}}>
          {/* 缩略画面 */}
          <div style={{position: 'absolute', left: 50, top: 50, width: 560, height: 315, borderRadius: 14, overflow: 'hidden', background: mix('#0B1012', C.lime, .08)}}>
            <div style={{position: 'absolute', left: 50, top: 70, fontSize: 22, color: '#8A9691'}}>{workTitle}</div>
            <div style={{position: 'absolute', left: 50, top: 110, fontSize: 40, fontWeight: 800, color: '#F2F3EF', whiteSpace: 'nowrap'}}>Report due <span style={{color: C.lime}}>Wednesday</span></div>
            <div style={{position: 'absolute', left: 50, top: 200, display: 'flex', gap: 12}}>{[0, 1, 2, 3, 4].map(i => <div key={i} style={{width: 76, height: 70, borderRadius: 10, background: i === 2 ? C.lime : '#1A2426'}} />)}</div>
          </div>
          <div style={{position: 'absolute', left: 660, top: 54}}>
            <div style={{fontSize: 46, fontWeight: 800, color: C.ink}}>{workTitle}</div>
            <div style={{marginTop: 12, fontFamily: MONO, fontSize: 26, color: C.mute}}>0:48 · 1920×1080 · MP4</div>
            <div style={{marginTop: 30, display: 'inline-flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderRadius: 10, background: alpha('#E8B860', .14 * flip), color: stale ? '#E8B860' : C.mute, fontSize: 26}}>
              {stale ? '● Scene 3 changed' : '✓ Exported'}</div>
          </div>
          {/* 按钮行 */}
          <div style={{position: 'absolute', left: 50, top: 420, right: 50, display: 'flex', gap: 24, alignItems: 'center'}}>
            <div style={{position: 'relative', padding: '24px 36px', borderRadius: 16, fontSize: 36, fontWeight: 900, whiteSpace: 'nowrap', background: C.lime, color: C.bg,
              transform: `scale(${1 + .06 * pulse})`, boxShadow: `0 0 ${20 + 50 * pulse}px ${alpha(C.lime, .3 + .4 * pulse)}`}}>
              <span style={{opacity: 1 - flip, position: stale ? 'absolute' : 'static', left: 36}}>Export MP4</span>
              {stale ? <span style={{opacity: flip, display: 'inline-block', transform: `translateY(${(1 - flip) * 16}px)`}}>New changes — export again</span> : null}
            </div>
            <div style={{padding: '24px 30px', borderRadius: 16, fontSize: 30, whiteSpace: 'nowrap', border: `2px solid ${C.line}`, color: stale ? C.mute : C.ink}}>
              {stale ? 'Download (exported before changes)' : 'Download video'}</div>
          </div>
          <div style={{position: 'absolute', left: 50, top: 560, right: 50, fontSize: 28, color: C.mute, lineHeight: 1.6, opacity: outExpo(hit(b, 2.6, .5))}}>
            This file was exported before your changes. Press Play live to see the current version; export again to deliver it.</div>
        </div>
      </div> : null}
      {/* 三件事 */}
      {b >= 7.8 ? <div style={{position: 'absolute', inset: 0, opacity: 1 - fade}}>
        {pillars.map((p, i) => {
          const at = 8 + i;
          const e = outExpo(hit(b, at, .45));
          const x = 960 + (i - 1) * 600;
          const glow = Math.exp(-Math.max(0, b - at) * 4) * (b >= at ? 1 : 0);
          return <div key={i} style={{position: 'absolute', left: x, top: 420, width: 580, transform: `translate(-50%, -50%) scale(${lerp(1.5, 1, e)})`, opacity: e, textAlign: 'center'}}>
            <div style={{width: 14, height: 14, borderRadius: 7, margin: '0 auto 30px', background: C.lime, boxShadow: `0 0 ${20 + 40 * glow}px ${C.lime}`}} />
            <div style={{fontSize: 72, fontWeight: 900, color: glow > .3 ? mix(C.ink, C.lime, glow) : C.ink, letterSpacing: 0, whiteSpace: 'nowrap'}}>{p.title}</div>
            <div style={{marginTop: 20, fontSize: 30, color: C.mute, whiteSpace: 'nowrap', opacity: outExpo(hit(b, at + .4, .5))}}>{p.sub}</div>
          </div>;
        })}
        <div style={{position: 'absolute', left: 0, width: 1920, top: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: outExpo(hit(b, 10.8, .6)),
          transform: `translateY(${(1 - outExpo(hit(b, 10.8, .6))) * 20}px)`}}>
          <Mark h={64} ink={C.ink} lime={C.lime} />
          <span style={{fontSize: 60, fontWeight: 800, color: C.ink, letterSpacing: 2}}>Galanty</span>
        </div>
        <div style={{position: 'absolute', left: 0, width: 1920, top: 810, textAlign: 'center', fontSize: 34, color: C.lime, letterSpacing: 1, opacity: outExpo(hit(b, 11.4, .6))}}>{free}</div>
        {/* Credit line: added right after the free line (no new beat action), fades with the scene from beat 15 */}
        {credit ? <div style={{position: 'absolute', left: 0, width: 1920, top: 890, textAlign: 'center', fontSize: 28, color: C.mute, letterSpacing: 1, whiteSpace: 'nowrap',
          opacity: outExpo(hit(b, 11.8, .6)), transform: `translateY(${(1 - outExpo(hit(b, 11.8, .6))) * 12}px)`}}>{credit}</div> : null}
      </div> : null}
      <div style={{position: 'absolute', inset: 0, background: outroBg, opacity: fade, pointerEvents: 'none'}} />
    </div>
  </div>;
}
