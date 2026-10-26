import React from 'react';
import type {SceneInput} from '@talkframe/scene';

// Scene 1 (bars 0-1, intro): a stalled render bar and the pain point; a flash on the last beat cuts to the sample library.
export const meta = {title: 'Opening: render again?', description: 'Two intro bars at 124 BPM: the progress bar stalls in the low teens, the pain point is revealed on the beat, then a flash.', params: {
  hook: {label: 'Hook', type: 'text', default: 'Fix one word, render it all again?'},
  progressLabel: {label: 'Progress label', type: 'text', default: 'Rendering'},
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
/** 全片节拍：f0 是本幕起始帧，bar0 是本幕起始小节（分镜 props 里给），与配乐网格对齐到帧。 */
const beatOf = (p: SceneInput) => ((Number(p.params.f0 ?? 0) + p.frame) / p.fps - Number(p.params.bar0 ?? 0) * BAR) / BEAT;

export default function Scene(props: SceneInput) {
  const C = kit(props);
  const b = beatOf(props);
  const {width, fonts} = props;
  const hook = String(props.params.hook ?? 'Fix one word, render it all again?');
  const label = String(props.params.progressLabel ?? 'Rendering');

  // 进度条：从 11% 慢慢爬到 13%，卡住不动
  const pct = 11 + clamp(b / 7) * 2.2;
  const spin = ['◐', '◓', '◑', '◒'][Math.floor(b * 2) % 4];
  const appear = outExpo(hit(b, 0, .8));
  const reveal = outExpo(hit(b, 1.5, 1.1));
  const kick = b >= 4 ? Math.exp(-(b % 1) * 7) : 0;
  const end = hit(b, 7.25, .75);
  const flash = inExpo(hit(b, 7.4, .6));
  const caretOn = (b % 1) < .55;

  return <div style={{position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: fonts.text}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + .04 * b / 8 + .12 * inExpo(end)})`, transformOrigin: '960px 560px', opacity: 1 - end * .6}}>
        {/* 背景网格 */}
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: .45 * appear}}>
          <defs>
            <pattern id="g" width={60} height={60} patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke={C.line} strokeWidth={1} /></pattern>
            <radialGradient id="v" cx="50%" cy="48%" r="58%"><stop offset="0" stopColor={C.bg} stopOpacity="0" /><stop offset="1" stopColor={C.bg} stopOpacity="1" /></radialGradient>
          </defs>
          <rect width={1920} height={1080} fill="url(#g)" />
          <rect width={1920} height={1080} fill="url(#v)" />
        </svg>
        {/* 痛点句 */}
        <div style={{position: 'absolute', left: 0, width: 1920, top: 372, textAlign: 'center', fontSize: 92, fontWeight: 800, color: C.ink, letterSpacing: 0,
          clipPath: `inset(-20% ${100 - 100 * reveal}% -20% 0)`, transform: `translateY(${(1 - reveal) * 24}px)`}}>
          {hook}<span style={{display: 'inline-block', width: 10, height: 86, marginLeft: 14, verticalAlign: '-10px', background: C.lime, opacity: caretOn && reveal > .9 ? 1 : 0}} />
        </div>
        {/* 卡住的进度条 */}
        <div style={{position: 'absolute', left: 560, top: 640, width: 800, opacity: appear * (1 - .35 * reveal), transform: `translateY(${(1 - appear) * 20}px)`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 30, color: C.mute}}>
            <span><span style={{color: C.ink, marginRight: 14}}>{spin}</span>{label}…</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div style={{marginTop: 18, height: 14, borderRadius: 7, background: C.panel2, overflow: 'hidden'}}>
            <div style={{width: `${pct}%`, height: '100%', borderRadius: 7, background: C.mute}} />
          </div>
        </div>
      </div>
      {/* 第 2 小节起闷底鼓：画面边缘轻轻呼吸 */}
      <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${160 + 120 * kick}px ${alpha(C.lime, .05 + .07 * kick)}`, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', inset: 0, background: C.lime, opacity: flash * .9, pointerEvents: 'none'}} />
    </div>
  </div>;
}
