import React from 'react';
import type {SceneInput} from '@talkframe/scene';

// 第 5 幕（小节 18-21，铺垫二）：暂停 → 定位这一秒（第几幕、在说哪句、哪个画面文件）→ 改一个字 → 保存并更新画面，随军鼓滚奏蓄力，末拍定格。
export const meta = {title: '铺垫二：定位这一秒，改一个字', description: '暂停后“这一秒”卡片列出幕、句与画面文件；逐幕编辑里把“一”改成“三”；第 12 拍按“保存并更新画面”，进度随滚奏走满，末拍定格。', params: {
  label: {label: '左上标签', type: 'text', default: '精确修改'},
  before: {label: '改前句', type: 'text', default: '下周一前提交报告'},
  after: {label: '改后句', type: 'text', default: '下周三前提交报告'},
  sceneTitle: {label: '幕标题', type: 'text', default: '下周的安排'},
  file: {label: '画面文件', type: 'text', default: 'scenes/plan.tsx'},
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

const DAYS = ['一', '二', '三', '四', '五'];
/** 示意作品“下周的安排”第 3 幕：一句话 + 五个工作日，句里是周几就点亮哪一格。 */
function PlanFilm({text, t, accent, font, title}: {text: string; t: number; accent: string; font: string; title: string}) {
  const day = DAYS.findIndex(d => text.includes(`周${d}`));
  const bg = mix('#0B1012', accent, .08);
  return <svg viewBox="0 0 1600 900" width="100%" height="100%" style={{display: 'block'}}>
    <rect width={1600} height={900} fill={bg} />
    <text x={150} y={170} fill="#8A9691" fontSize={44} fontFamily={font}>{title}</text>
    <text x={150} y={400} fontSize={124} fontWeight={800} fontFamily={font}>
      {text.split('').map((ch, i) => <tspan key={i} fill={i === text.indexOf(`周${DAYS[day]}`) + 1 ? accent : '#F2F3EF'}>{ch}</tspan>)}
    </text>
    {DAYS.map((d, i) => {
      const on = i === day;
      const x = 150 + i * 262;
      return <g key={d}>
        <rect x={x} y={520} width={232} height={250} rx={22} fill={on ? accent : '#1A2426'} stroke={on ? accent : '#2C383A'} strokeWidth={3} />
        <text x={x + 116} y={610} fill={on ? '#0B1012' : '#8A9691'} fontSize={48} fontWeight={700} textAnchor="middle" fontFamily={font}>周{d}</text>
        {on ? <text x={x + 116} y={700} fill="#0B1012" fontSize={40} fontWeight={800} textAnchor="middle" fontFamily={font}>提交</text> : null}
        {!on ? <rect x={x + 56} y={680} width={120 * clamp(t / 2 - i * .1)} height={10} rx={5} fill="#2C383A" /> : null}
      </g>;
    })}
  </svg>;
}

export default function Scene(props: SceneInput) {
  const C = kit(props);
  const b = beatOf(props);
  const {width, fonts} = props;
  const label = String(props.params.label ?? '精确修改');
  const before = String(props.params.before ?? '下周一前提交报告');
  const after = String(props.params.after ?? '下周三前提交报告');
  const sceneTitle = String(props.params.sceneTitle ?? '下周的安排');
  const file = String(props.params.file ?? 'scenes/plan.tsx');
  // 改动位置：两句第一处不同的字
  const at = Math.max(0, before.split('').findIndex((ch, i) => ch !== after[i]));

  const paused = b >= 1;
  const time = paused ? 23.4 : 23.4 - (1 - b) * BEAT;
  const locate = outExpo(hit(b, 1.6, .5));
  const btnDown = Math.exp(-(b - 1.5) * 7) * (b >= 1.5 ? 1 : 0);
  const editIn = outExpo(hit(b, 5, .7));
  const select = b >= 7 && b < 8;
  const typed = b >= 8;
  const line = typed ? after : before;
  const dirty = b >= 8.4;
  const saveDown = Math.exp(-(b - 12) * 7) * (b >= 12 ? 1 : 0);
  const saving = b >= 12;
  const prog = clamp((b - 12) / 3);
  const freeze = b >= 15;
  const zoom = inExpo(hit(b, 15, 1));
  const capIdx = b < 6 ? 0 : b < 12 ? 1 : 2;
  const caps = ['暂停，就知道这一秒是哪儿', '只改一个字', '保存，本机更新画面'];
  const capAt = [0, 6, 12][capIdx];
  const capIn = outExpo(hit(b, capAt + .05, .4));
  const roll = b >= 12 ? (b - 12) / 3 : 0;
  const shake = freeze ? 0 : roll * 2 * Math.sin(b * 40);

  const P = {x: 110, y: 172, w: 1000, h: 562};
  const SEG = [0, 9, 17, 27, 37, 48];
  const strip = {x: P.x, y: 768, w: P.w, h: 56};
  const px = strip.x + strip.w * time / 48;
  const caretOn = (b * 2) % 1 < .6;

  return <div style={{position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: fonts.text}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 45%, ${alpha(C.lime, .04 + .08 * roll)}, transparent 60%)`}} />
      <div style={{position: 'absolute', inset: 0, transform: `translate(${shake}px, 0) scale(${1 + .9 * zoom})`, transformOrigin: `${P.x + P.w / 2}px ${P.y + P.h / 2}px`}}>
        <div style={{position: 'absolute', left: 110, top: 84, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 16, opacity: outExpo(hit(b, 0, .4)) * (1 - zoom)}}>
          <Mark h={40} ink={C.ink} lime={C.lime} /><span style={{fontSize: 36, fontWeight: 900, color: C.lime, letterSpacing: 2}}>{label}</span>
        </div>
        <div style={{position: 'absolute', left: 520, width: 1290, top: 84, transform: `translateY(-50%) translateY(${(1 - capIn) * 18}px)`, textAlign: 'right', fontSize: 58, fontWeight: 800,
          color: C.ink, letterSpacing: 3, opacity: capIn * (1 - zoom), whiteSpace: 'nowrap'}}>{caps[capIdx]}</div>
        {/* 播放器 */}
        <div style={{position: 'absolute', left: P.x, top: P.y, width: P.w, height: P.h, borderRadius: 16, overflow: 'hidden', border: `2px solid ${freeze ? C.lime : C.line}`,
          boxShadow: `0 30px 100px #000a${freeze ? `, 0 0 60px ${alpha(C.lime, .35)}` : ''}`}}>
          <PlanFilm text={before} t={time - 17} accent={C.lime} font={fonts.text} title={sceneTitle} />
          {saving ? <div style={{position: 'absolute', inset: 0, background: alpha(C.bg, .25 + .25 * prog)}}>
            <div style={{position: 'absolute', top: 0, bottom: 0, left: `${-20 + 120 * ((b - 12) % 1)}%`, width: '18%', background: `linear-gradient(90deg, transparent, ${alpha(C.lime, .18)}, transparent)`}} />
          </div> : null}
          {paused && !saving ? <div style={{position: 'absolute', right: 24, top: 22, padding: '8px 16px', borderRadius: 10, background: alpha('#000000', .6), color: '#F2F3EF', fontFamily: MONO, fontSize: 24}}>❚❚ 已暂停</div> : null}
        </div>
        {/* 时间条 */}
        <div style={{position: 'absolute', left: strip.x, top: strip.y, width: strip.w, height: strip.h}}>
          {SEG.slice(0, -1).map((s, i) => {
            const x0 = strip.w * s / 48, x1 = strip.w * SEG[i + 1] / 48;
            const cur = time >= s && time < SEG[i + 1];
            return <div key={i} style={{position: 'absolute', left: x0, width: x1 - x0 - 4, height: strip.h, borderRadius: 9, boxSizing: 'border-box', padding: '0 14px', display: 'flex', alignItems: 'center',
              background: cur ? mix(C.panel2, C.lime, .16) : C.panel2, border: `2px solid ${cur ? alpha(C.lime, .7) : C.line}`, fontSize: 20, color: cur ? C.ink : C.mute, whiteSpace: 'nowrap'}}>第 {i + 1} 幕</div>;
          })}
          <div style={{position: 'absolute', left: px - strip.x - 2, top: -10, width: 4, height: strip.h + 20, borderRadius: 2, background: C.lime, boxShadow: `0 0 18px ${C.lime}`}} />
        </div>
        <div style={{position: 'absolute', left: P.x, top: 856, display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap', opacity: 1 - zoom}}>
          <span style={{fontFamily: MONO, fontSize: 40, fontWeight: 700, color: C.ink}}>0:{time.toFixed(1).padStart(4, '0')} <span style={{fontSize: 26, color: C.mute}}>/ 0:48</span></span>
          <span style={{padding: '12px 24px', borderRadius: 12, fontSize: 28, fontWeight: 800, background: btnDown > .05 ? C.lime : C.panel2, color: btnDown > .05 ? C.bg : C.ink,
            border: `2px solid ${b >= 1.2 ? C.lime : C.line}`, transform: `scale(${1 - .06 * btnDown})`}}>定位这一秒</span>
        </div>
        {/* 这一秒 卡片 */}
        <div style={{position: 'absolute', left: 1160, top: P.y, width: 650, padding: '26px 32px', boxSizing: 'border-box', borderRadius: 18, background: C.panel, border: `2px solid ${C.line}`,
          opacity: locate * (1 - zoom), transform: `translateX(${(1 - locate) * 60}px)`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <span style={{fontSize: 34, fontWeight: 800, color: C.ink}}>这一秒</span><span style={{fontFamily: MONO, fontSize: 26, color: C.lime}}>第 23.4 秒</span></div>
          {[['画面', `第 3 幕《${sceneTitle}》`], ['正在说', `「${before}」`], ['画面文件', file]].map(([k, v], i) => <div key={k} style={{display: 'flex', gap: 22, marginTop: 20,
            opacity: outExpo(hit(b, 2 + i * .35, .4))}}>
            <span style={{width: 108, flex: 'none', fontSize: 24, color: C.mute}}>{k}</span>
            <span style={{fontSize: 28, color: C.ink, fontFamily: k === '画面文件' ? MONO : fonts.text, whiteSpace: 'nowrap'}}>{v}</span></div>)}
        </div>
        {/* 逐幕编辑 */}
        <div style={{position: 'absolute', left: 1160, top: 500, width: 650, height: 418, padding: '26px 32px', boxSizing: 'border-box', borderRadius: 18, background: C.panel,
          border: `2px solid ${b >= 6 && b < 12 ? alpha(C.lime, .7) : C.line}`, opacity: editIn * (1 - zoom), transform: `translateY(${(1 - editIn) * 50}px)`}}>
          <div style={{fontSize: 24, color: C.mute}}>逐幕编辑 · 第 3 幕 · 旁白</div>
          <div style={{marginTop: 18, padding: '18px 22px', borderRadius: 12, background: C.bg, border: `2px solid ${b >= 6.5 && b < 12 ? C.lime : C.line}`, fontSize: 52, fontWeight: 700, color: C.ink, whiteSpace: 'nowrap', position: 'relative'}}>
            {line.split('').map((ch, i) => <span key={i} style={{background: select && i === at ? alpha(C.lime, .45) : 'transparent', color: typed && i === at ? C.lime : C.ink, borderRadius: 6}}>{ch}</span>)}
            {b >= 6.5 && b < 12 && caretOn ? <span style={{position: 'absolute', top: 22, left: 22 + (typed ? at + 1 : select ? at + 1 : line.length) * 52 + 2, width: 4, height: 60, background: C.lime}} /> : null}
          </div>
          <div style={{marginTop: 16, fontSize: 24, color: dirty && !saving ? '#E8B860' : C.mute, minHeight: 34}}>{saving ? (prog >= 1 ? '✓ 画面已更新，回到同一秒' : '正在本机更新画面…') : dirty ? '有修改还没保存' : ' '}</div>
          <div style={{position: 'absolute', left: 32, right: 32, bottom: 28, display: 'flex', alignItems: 'center', gap: 20}}>
            <span style={{padding: '16px 28px', borderRadius: 12, fontSize: 30, fontWeight: 800, background: dirty ? C.lime : C.panel2, color: dirty ? C.bg : C.mute,
              transform: `scale(${1 - .07 * saveDown})`, boxShadow: saveDown > .05 ? `0 0 ${40 * saveDown}px ${alpha(C.lime, .7)}` : 'none', whiteSpace: 'nowrap'}}>保存并更新画面</span>
            {saving ? <span style={{flex: 1, height: 12, borderRadius: 6, background: C.panel2, overflow: 'hidden'}}><span style={{display: 'block', width: `${prog * 100}%`, height: '100%', background: C.lime}} /></span> : null}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: C.bg, opacity: freeze ? .15 * (1 - zoom) : 0, pointerEvents: 'none'}} />
    </div>
  </div>;
}
