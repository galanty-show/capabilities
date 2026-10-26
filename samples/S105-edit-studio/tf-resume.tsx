import React from 'react';
import type {SceneInput} from '@talkframe/scene';

// 第 6 幕（小节 22-25，Drop B 前半）：冲击落拍，画面已更新——还是 0:23.4 这一秒，接着往下播；高亮从周一跳到周三。
export const meta = {title: 'Drop B：同一秒，接着播', description: '冲击出“同一秒，接着播”，随后收进左上角；放大的播放器停在改动前的同一秒、显示改后的字并接着播。', params: {
  headline: {label: '大字', type: 'text', default: '同一秒，接着播'},
  caption: {label: '字幕', type: 'text', default: '不用从头看，也不用等导出'},
  before: {label: '改前句', type: 'text', default: '下周一前提交报告'},
  after: {label: '改后句', type: 'text', default: '下周三前提交报告'},
  sceneTitle: {label: '幕标题', type: 'text', default: '下周的安排'},
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
const beatOf = (p: SceneInput) => ((Number(p.params.f0 ?? 0) + p.frame) / p.fps - Number(p.params.bar0 ?? 0) * BAR) / BEAT;

function Mark({h, ink, lime}: {h: number; ink: string; lime: string}) {
  const B = [[16, 20, 68], [16, 43.5, 68], [16, 67, 41.4]];
  return <svg width={h * 69 / 66} height={h} viewBox="16 20 69 66" style={{display: 'block', overflow: 'visible'}}>
    {B.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={13} rx={6.5} fill={ink} />)}
    <path d="M64.5 62.13L84.98 73.5L64.5 84.88Z" fill={lime} stroke={lime} strokeWidth={2.73} strokeLinejoin="round" />
  </svg>;
}

const DAYS = ['一', '二', '三', '四', '五'];
/** 与第 5 幕同一张示意画面；highlight 在旧日与新日之间滑动（0→1）。 */
function PlanFilm({text, oldDay, t, slide, accent, font, title}: {text: string; oldDay: number; t: number; slide: number; accent: string; font: string; title: string}) {
  const day = DAYS.findIndex(d => text.includes(`周${d}`));
  const bg = mix('#0B1012', accent, .08);
  const hx = 150 + lerp(oldDay, day, slide) * 262;
  const at = text.indexOf(`周${DAYS[day]}`) + 1;
  return <svg viewBox="0 0 1600 900" width="100%" height="100%" style={{display: 'block'}}>
    <rect width={1600} height={900} fill={bg} />
    <text x={150} y={170} fill="#8A9691" fontSize={44} fontFamily={font}>{title}</text>
    <text x={150} y={400} fontSize={124} fontWeight={800} fontFamily={font}>
      {text.split('').map((ch, i) => <tspan key={i} fill={i === at ? accent : '#F2F3EF'}>{ch}</tspan>)}
    </text>
    {/* 改动的字下面一道光 */}
    <rect x={150 + at * 124 - 6} y={424} width={136} height={12} rx={6} fill={accent} opacity={.5 + .5 * Math.abs(Math.sin(t * 4))} />
    {DAYS.map((d, i) => <g key={d}><rect x={150 + i * 262} y={520} width={232} height={250} rx={22} fill="#1A2426" stroke="#2C383A" strokeWidth={3} />
      <text x={150 + i * 262 + 116} y={610} fill="#8A9691" fontSize={48} fontWeight={700} textAnchor="middle" fontFamily={font}>周{d}</text></g>)}
    <rect x={hx} y={520} width={232} height={250} rx={22} fill={accent} />
    <text x={hx + 116} y={610} fill="#0B1012" fontSize={48} fontWeight={700} textAnchor="middle" fontFamily={font}>周{DAYS[slide > .5 ? day : oldDay]}</text>
    <text x={hx + 116} y={700} fill="#0B1012" fontSize={40} fontWeight={800} textAnchor="middle" fontFamily={font}>提交</text>
  </svg>;
}

export default function Scene(props: SceneInput) {
  const C = kit(props);
  const b = beatOf(props);
  const {width, fonts} = props;
  const headline = String(props.params.headline ?? '同一秒，接着播');
  const caption = String(props.params.caption ?? '不用从头看，也不用等导出');
  const before = String(props.params.before ?? '下周一前提交报告');
  const after = String(props.params.after ?? '下周三前提交报告');
  const sceneTitle = String(props.params.sceneTitle ?? '下周的安排');
  const oldDay = Math.max(0, DAYS.findIndex(d => before.includes(`周${d}`)));

  const kick = Math.exp(-(b % 1) * 7);
  const flash = Math.max(0, 1 - b / .2);
  const slam = outExpo(b / .45);
  const dock = outExpo(hit(b, 4, .8));
  const slide = outExpo(hit(b, 1, .8));
  const time = 23.4 + Math.max(0, b - 2) * BEAT;
  const playing = b >= 2;
  const capIn = outExpo(hit(b, 4.6, .5));
  const out = inExpo(hit(b, 15.4, .6));
  const P = {x: 300, y: 150, w: 1320, h: 742};
  const strip = {x: P.x, y: 920, w: P.w, h: 40};
  const px = strip.x + strip.w * time / 48;
  const SEG = [0, 9, 17, 27, 37, 48];

  return <div style={{position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: fonts.text}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - .05 * out})`, opacity: 1 - .6 * out}}>
        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, ${alpha(C.lime, .06 + .08 * kick)}, transparent 62%)`}} />
        {b < 2.5 ? <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
          <circle cx={960} cy={520} r={1500 * outExpo(b / 1.6)} fill="none" stroke={C.lime} strokeWidth={28 * (1 - b / 2.5)} opacity={1 - b / 2.5} />
        </svg> : null}
        {/* 播放器 */}
        <div style={{position: 'absolute', left: P.x, top: P.y, width: P.w, height: P.h, borderRadius: 18, overflow: 'hidden', border: `2px solid ${C.lime}`,
          boxShadow: `0 40px 140px #000c, 0 0 ${40 + 50 * kick}px ${alpha(C.lime, .25)}`, transform: `scale(${lerp(1.08, 1, outExpo(b / .8))})`}}>
          <PlanFilm text={after} oldDay={oldDay} t={time} slide={slide} accent={C.lime} font={fonts.text} title={sceneTitle} />
          <div style={{position: 'absolute', right: 24, top: 22, padding: '8px 16px', borderRadius: 10, background: alpha('#000000', .6), color: playing ? C.lime : '#F2F3EF', fontFamily: MONO, fontSize: 24}}>
            {playing ? `▶ 0:${time.toFixed(1).padStart(4, '0')}` : '✓ 已更新 · 0:23.4'}</div>
        </div>
        {/* 大字：先压在画面上，第 4 拍收进左上角 */}
        <div style={{position: 'absolute', inset: 0, background: alpha(C.bg, .84 * (1 - dock)), pointerEvents: 'none'}} />
        <div style={{position: 'absolute', left: lerp(960, 110, dock), top: lerp(500, 76, dock), transform: `translate(${-50 * (1 - dock)}%, -50%) scale(${1.4 - .4 * slam})`,
          transformOrigin: dock > .5 ? '0 50%' : '50% 50%', display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap', opacity: slam}}>
          {dock > .5 ? <Mark h={40} ink={C.ink} lime={C.lime} /> : null}
          <span style={{fontSize: lerp(176, 36, dock), fontWeight: 900, color: dock > .5 ? C.lime : C.ink, letterSpacing: lerp(10, 2, dock), textShadow: dock < .5 ? `0 0 70px ${alpha(C.lime, .45)}` : 'none'}}>{headline}</span>
        </div>
        <div style={{position: 'absolute', left: 620, width: 1190, top: 76, transform: `translateY(-50%) translateY(${(1 - capIn) * 18}px)`, textAlign: 'right', fontSize: 58, fontWeight: 800,
          color: C.ink, letterSpacing: 3, opacity: capIn, whiteSpace: 'nowrap'}}>{caption}</div>
        {/* 时间条与时间码 */}
        <div style={{position: 'absolute', left: strip.x, top: strip.y, width: strip.w, height: strip.h, opacity: outExpo(hit(b, .5, .5))}}>
          {SEG.slice(0, -1).map((s, i) => {
            const x0 = strip.w * s / 48, x1 = strip.w * SEG[i + 1] / 48, cur = time >= s && time < SEG[i + 1];
            return <div key={i} style={{position: 'absolute', left: x0, width: x1 - x0 - 4, height: strip.h, borderRadius: 8, background: cur ? mix(C.panel2, C.lime, .16) : C.panel2,
              border: `2px solid ${cur ? alpha(C.lime, .7) : C.line}`, boxSizing: 'border-box'}} />;
          })}
          <div style={{position: 'absolute', left: (strip.w * 23.4 / 48) - 1, top: -8, width: 2, height: strip.h + 16, background: C.mute, opacity: .8}} />
          <div style={{position: 'absolute', left: px - strip.x - 2, top: -10, width: 4, height: strip.h + 20, borderRadius: 2, background: C.lime, boxShadow: `0 0 18px ${C.lime}`}} />
        </div>
        <div style={{position: 'absolute', left: 0, width: 1920, top: 984, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 26, whiteSpace: 'nowrap', opacity: outExpo(hit(b, .8, .5))}}>
          <span style={{fontSize: 28, color: C.mute}}>改之前停在</span>
          <span style={{fontFamily: MONO, fontSize: 40, fontWeight: 700, color: C.mute}}>0:23.4</span>
          <span style={{fontSize: 28, color: C.mute}}>→ 更新后从</span>
          <span style={{fontFamily: MONO, fontSize: 40, fontWeight: 700, color: C.lime}}>0:23.4</span>
          <span style={{fontSize: 28, color: C.mute}}>接着播</span>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: C.ink, opacity: flash, pointerEvents: 'none'}} />
    </div>
  </div>;
}
