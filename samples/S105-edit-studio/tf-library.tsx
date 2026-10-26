import React from 'react';
import type {SceneInput} from '@talkframe/scene';

// 第 2 幕（小节 2-5，铺垫）：一句回答 → 样片库网格落下 → 光标随拍在封面间跳，停到哪张哪张就现场播放；末拍选中一张放大。
type Card = {no: string; title: string; tag: string};
// 从现行目录挑选七支中文样片；代码绘制封面示意，第八格为显示全部。
const DEFAULT_CARDS: Card[] = [
  {no: 'S095', title: '一段文字，现场成片', tag: '文影介绍 · 横版'},
  {no: 'S096', title: '把讲义，讲成一节课', tag: '文影介绍 · 横版'},
  {no: 'S097', title: '给开发者：让 agent 写画面', tag: '文影介绍 · 横版'},
  {no: 'S098', title: '一句话，现场成片', tag: '文影介绍 · 竖版'},
  {no: 'S099', title: '一点光', tag: '文影介绍 · 横版'},
  {no: 'S031', title: '一分钟认识区块链钱包', tag: '知识讲解 · 横版'},
  {no: 'S105', title: '改一个字，接着播', tag: '文影介绍 · 横版'},
];
export const meta = {title: '铺垫：样片库悬停即播', description: '样片库精选示意；光标按拍在封面间跳，最后选中第一张。', params: {
  answer: {label: '回答句', type: 'text', default: '在文影里，不用等。'},
  title: {label: '标题', type: 'text', default: '停在封面上，就现场播放'},
  count: {label: '样片说明', type: 'text', default: '精选样片，停在封面上就播放'},
  showAll: {label: '显示全部卡片', type: 'text', default: '显示全部'},
  cards: {label: '卡片', type: 'list', item: [{key: 'no', label: '编号'}, {key: 'title', label: '标题'}, {key: 'tag', label: '分类'}]},
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
type Kit = ReturnType<typeof kit>;
const beatOf = (p: SceneInput) => ((Number(p.params.f0 ?? 0) + p.frame) / p.fps - Number(p.params.bar0 ?? 0) * BAR) / BEAT;

function Mark({h, ink, lime}: {h: number; ink: string; lime: string}) {
  const B = [[16, 20, 68], [16, 43.5, 68], [16, 67, 41.4]];
  return <svg width={h * 69 / 66} height={h} viewBox="16 20 69 66" style={{display: 'block', overflow: 'visible'}}>
    {B.map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={13} rx={6.5} fill={ink} />)}
    <path d="M64.5 62.13L84.98 73.5L64.5 84.88Z" fill={lime} stroke={lime} strokeWidth={2.73} strokeLinejoin="round" />
  </svg>;
}

/** 封面示意（英文样片）：160×90 画布里的迷你成片画面；t 是现场播放的秒数（未悬停时停在海报帧）。 */
const COVER_LOOK: Array<[string, string, string]> = [
  ['#050912', '#162544', '#FFD58A'], ['#0B1410', '#1F3A2C', '#C9F65A'], ['#07090C', '#1A2230', '#7CF0FF'],
  ['#0C0716', '#2E1A50', '#B79CFF'], ['#0A0604', '#2A160A', '#FFB547'], ['#04101A', '#0E3550', '#58C8FF'], ['#071008', '#12301A', '#C9F65A'],
];
const COVER_TITLE = ['文字成片', '讲义成课', 'Agent 画面', '一句话', '一点光', '区块链钱包', '改字接着播'];
function Cover({v, t, C, font}: {v: number; t: number; C: Kit; font: string}) {
  const k = v % 7, [c0, c1, a] = COVER_LOOK[k], id = `cv${k}`;
  const g = (x: number) => clamp(x);
  const w = '#F4F1EA';
  const art = (() => {
    switch (k) {
      case 0: return <>{Array.from({length: 11}, (_, i) => {const x = 6 + i * 14, h = 18 + ((i * 37) % 34); return <g key={i}><rect x={x} y={90 - h} width={12} height={h} fill="#0B1222" />
        {Array.from({length: Math.floor(h / 6)}, (_, j) => <rect key={j} x={x + 3} y={92 - h + j * 6} width={2} height={2} fill={a} opacity={((i * 7 + j * 3) % 5) < g(t * 2) * 4 ? .95 : .15} />)}</g>;})}
        <circle cx={128} cy={22} r={7} fill={w} opacity={.9} /><circle cx={80} cy={70} r={60} fill={`url(#${id}g)`} /></>;
      case 1: return <><rect x={22} y={26} width={58} height={44} rx={3} fill="#E9E4D6" opacity={.92} />{[0, 1, 2, 3].map(i => <rect key={i} x={28} y={34 + i * 8} width={44 - (i % 2) * 12} height={2.5} fill="#5A6157" />)}
        <path d="M86 48 L100 48" stroke={a} strokeWidth={2.5} /><path d="M98 43 L104 48 L98 53" fill="none" stroke={a} strokeWidth={2.5} />
        <rect x={108} y={28} width={40} height={40} rx={4} fill="#13261C" stroke={a} strokeWidth={1.5} /><path d={`M123 ${40 + 2 * Math.sin(t * 3)} L135 48 L123 ${56 - 2 * Math.sin(t * 3)}Z`} fill={a} />
        <circle cx={128} cy={48} r={30} fill={`url(#${id}g)`} /></>;
      case 2: return <><rect x={16} y={24} width={80} height={56} rx={4} fill="#0A0E14" stroke="#2A3442" strokeWidth={1.5} />
        {[0, 1, 2, 3, 4].map(i => <rect key={i} x={22 + (i % 2) * 8} y={34 + i * 8} width={(30 + (i * 13) % 34) * g(t * 2 - i * .2)} height={3} rx={1.5} fill={i === 2 ? a : '#6C7A8C'} />)}
        <rect x={104} y={30} width={44} height={44} rx={3} fill="none" stroke={a} strokeWidth={1.5} strokeDasharray="4 3" /><circle cx={126} cy={52} r={10 + 2 * Math.sin(t * 4)} fill={a} opacity={.85} />
        <circle cx={126} cy={52} r={28} fill={`url(#${id}g)`} /></>;
      case 3: return <><rect x={62} y={8} width={36} height={74} rx={6} fill="#120A22" stroke="#4A3A70" strokeWidth={1.5} />
        <rect x={68} y={40} width={24 * g(t * 1.5)} height={3} rx={1.5} fill={a} /><circle cx={80} cy={44} r={26} fill={`url(#${id}g)`} />
        {[0, 1, 2].map(i => <rect key={i} x={68} y={52 + i * 7} width={18 - i * 4} height={2.5} fill={w} opacity={.5} />)}</>;
      case 4: return <><path d="M0 64 Q 40 50 80 60 T 160 56 L160 90 L0 90Z" fill="#140B05" /><circle cx={92} cy={58} r={4} fill={a} />
        <circle cx={92} cy={58} r={24 + 3 * Math.sin(t * 2)} fill={`url(#${id}g)`} /><rect x={91} y={62} width={2} height={14} fill="#3A2A1A" />
        {Array.from({length: 14}, (_, i) => <circle key={i} cx={(i * 23) % 160} cy={8 + (i * 13) % 40} r={.8} fill={w} opacity={.6} />)}</>;
      case 5: return <>{[[30, 30], [30, 60], [80, 20], [80, 45], [80, 70], [130, 45]].map(([x, y], i, all) => <g key={i}>
        {i < 2 ? [2, 3, 4].map(j => <line key={j} x1={x} y1={y} x2={all[j][0]} y2={all[j][1]} stroke="#2E6A90" strokeWidth={1} />) : i < 5 ? <line x1={x} y1={y} x2={130} y2={45} stroke="#2E6A90" strokeWidth={1} /> : null}
        <circle cx={x} cy={y} r={5} fill={(Math.floor(t * 4) + i) % 3 === 0 ? a : '#1C4A66'} /></g>)}<circle cx={130} cy={45} r={24} fill={`url(#${id}g)`} /></>;
      default: return <><text x={14} y={52} fontSize={14} fontWeight={800} fill={w} fontFamily={font}>提交报告</text>
        <text x={98} y={52} fontSize={14} fontWeight={800} fill={a} fontFamily={font}>{g(t) > .5 ? '周三' : '周一'}</text>
        <rect x={98} y={56} width={30} height={2.5} fill={a} opacity={.8} /><path d="M130 62 L142 70 L130 78Z" fill={a} /><circle cx={112} cy={52} r={28} fill={`url(#${id}g)`} /></>;
    }
  })();
  const title = COVER_TITLE[k];
  return <svg viewBox="0 0 160 90" width="100%" height="100%" style={{display: 'block'}}>
    <defs>
      <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c0} /><stop offset="1" stopColor={c1} /></linearGradient>
      <radialGradient id={`${id}g`}><stop offset="0" stopColor={a} stopOpacity={.55} /><stop offset="1" stopColor={a} stopOpacity={0} /></radialGradient>
      <radialGradient id={`${id}v`} cx=".5" cy=".5" r=".75"><stop offset=".6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={.55} /></radialGradient>
    </defs>
    <rect width={160} height={90} fill={`url(#${id}s)`} />
    <circle cx={80 + 30 * Math.sin(k)} cy={40} r={70} fill={`url(#${id}g)`} opacity={.45} />
    {art}
    <text x={10} y={16} fontSize={10} fontWeight={800} fill={w} fontFamily={font} opacity={.92}>{title}</text>
    <rect width={160} height={90} fill={`url(#${id}v)`} />
  </svg>;
}

// 网格：4 列 × 2 行（7 支英文样片 + “显示全部”）
const COLS = 4, CW = 420, CH = 236, BODY = 76, GAP = 18, GX = (1920 - (COLS * CW + (COLS - 1) * GAP)) / 2, GY = 290, PICK = 0;
const cardPos = (i: number) => ({x: GX + (i % COLS) * (CW + GAP), y: GY + Math.floor(i / COLS) * (CH + BODY + GAP)});
// 光标落点（拍 → 卡片序号）：四分 → 八分 → 十六分，第 15 拍停在第 1 张（序号 0）
const HOPS: Array<[number, number]> = [[5, 1], [6, 5], [7, 2], [8, 6], [9, 3], [9.5, 4], [10, 0], [10.5, 5], [11, 2], [11.5, 6], [12, 1], [12.25, 4], [12.5, 3],
  [12.75, 5], [13, 2], [13.25, 6], [13.5, 1], [13.75, 4], [14, 3], [14.25, 5], [14.5, 2], [14.75, 6], [15, 0]];

export default function Scene(props: SceneInput) {
  const C = kit(props);
  const b = beatOf(props);
  const {width, fonts} = props;
  const answer = String(props.params.answer ?? '在文影里，不用等。');
  const title = String(props.params.title ?? '停在封面上，就现场播放');
  const count = String(props.params.count ?? '精选样片，停在封面上就播放');
  const showAll = String(props.params.showAll ?? '显示全部');
  const cards = ((props.params.cards as Card[] | undefined) ?? DEFAULT_CARDS).slice(0, 7);

  // 0-3 拍：回答句居中；第 3 拍上移成标题区，网格落下
  const lift = outExpo(hit(b, 3, .9));
  const ansIn = outExpo(hit(b, 0, .6));
  const hopIdx = HOPS.reduce((acc, h, i) => b >= h[0] ? i : acc, -1);
  const hovered = hopIdx >= 0 ? HOPS[hopIdx][1] : -1;
  const hopAt = hopIdx >= 0 ? HOPS[hopIdx][0] : 0;
  const prevCard = hopIdx > 0 ? HOPS[hopIdx - 1][1] : hovered;
  const move = outExpo(hit(b, hopAt, Math.min(.22, hopIdx > 0 ? (hopAt - HOPS[hopIdx - 1][0]) * .9 : .3)));
  const pc = cardPos(Math.max(0, prevCard)), nc = cardPos(Math.max(0, hovered));
  const cx = lerp(pc.x, nc.x, move) + CW * .62, cy = lerp(pc.y, nc.y, move) + CH * .58;
  const pick = b >= 15;
  const grow = inOut(hit(b, 15, 1));
  const flash = inExpo(hit(b, 15.55, .45));
  const kick = Math.exp(-(b % 1) * 7) * (b < 15 ? 1 : 0);

  return <div style={{position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: fonts.text}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 60%, ${alpha(C.lime, .04 + .05 * kick)}, transparent 62%)`}} />
      {/* 回答句：先居中，再上移缩小成左上角品牌行 */}
      <div style={{position: 'absolute', left: lerp(960, GX, lift), top: lerp(470, 80, lift), transform: `translate(${-50 * (1 - lift)}%, -50%)`, display: 'flex', alignItems: 'center', gap: lerp(28, 16, lift),
        opacity: ansIn, whiteSpace: 'nowrap'}}>
        <Mark h={lerp(110, 40, lift)} ink={C.ink} lime={C.lime} />
        <span style={{fontSize: lerp(120, 36, lift), fontWeight: 800, color: C.ink, letterSpacing: lerp(4, 1, lift)}}>{answer}</span>
      </div>
      {/* 标题与样片数 */}
      <div style={{position: 'absolute', left: GX, top: 126, fontSize: 64, fontWeight: 800, color: C.ink, letterSpacing: 2, whiteSpace: 'nowrap',
        clipPath: `inset(-20% ${100 - 100 * outExpo(hit(b, 3.6, 1))}% -20% 0)`}}>{title}</div>
      <div style={{position: 'absolute', right: GX, top: 146, display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, color: C.mute, opacity: outExpo(hit(b, 4.2, .6)), whiteSpace: 'nowrap'}}>
        <span style={{fontFamily: MONO, fontSize: 40, fontWeight: 700, color: C.lime}}>{count.match(/^\d+/)?.[0] ?? ''}</span>{count.replace(/^\d+\s*/, '')}
      </div>
      {/* 网格 */}
      {cards.map((card, i) => {
        const p = cardPos(i);
        const enter = outExpo(hit(b, 3 + (i % COLS) * .12 + Math.floor(i / COLS) * .2, .7));
        const on = i === hovered && b >= 5;
        const chosen = pick && i === PICK;
        const t = on ? (b - hopAt) * BEAT : 1.2;
        const sc = chosen ? 1 + .22 * grow : on ? 1.045 : 1;
        const dim = pick && !chosen ? 1 - .75 * grow : 1;
        return <div key={i} style={{position: 'absolute', left: p.x, top: p.y, width: CW, height: CH + BODY, borderRadius: 14, overflow: 'hidden', background: C.panel,
          border: `2px solid ${on || chosen ? C.lime : C.line}`, boxShadow: on || chosen ? `0 18px 60px #0009, 0 0 ${24 + 30 * kick}px ${alpha(C.lime, .25)}` : 'none',
          transform: `translateY(${(1 - enter) * 60}px) scale(${sc})`, opacity: enter * dim, zIndex: on || chosen ? 2 : 1}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: CW, height: CH, filter: on || chosen ? 'none' : 'saturate(.8) brightness(.78)'}}><Cover v={i} t={chosen ? 1.2 + (b - 15) * BEAT : t} C={C} font={fonts.text} /></div>
          {on || chosen ? <div style={{position: 'absolute', right: 12, top: 12, padding: '5px 12px', borderRadius: 8, background: alpha(C.bg, .82), color: C.lime, fontFamily: MONO, fontSize: 19, fontWeight: 700, letterSpacing: 1}}>▶ 现场播放</div> : null}
          {on ? <div style={{position: 'absolute', left: 0, top: CH - 4, height: 4, width: CW * clamp(t / 2), background: C.lime}} /> : null}
          <div style={{position: 'absolute', left: 16, right: 16, top: CH + 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap'}}>
            <span style={{fontSize: 25, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis'}}>{card.title}</span>
            <span style={{fontFamily: MONO, fontSize: 18, color: C.mute, flex: 'none'}}>{card.no}</span>
          </div>
          <div style={{position: 'absolute', left: 16, top: CH + 42, fontSize: 17, color: C.mute, whiteSpace: 'nowrap'}}>{card.tag}</div>
        </div>;
      })}
      {/* 第 8 格：显示全部（样片库的“显示全部”开关） */}
      {(() => {const p = cardPos(7), enter = outExpo(hit(b, 3 + 3 * .12 + .2, .7)), dim = pick ? 1 - .75 * grow : 1;
        return <div style={{position: 'absolute', left: p.x, top: p.y, width: CW, height: CH + BODY, borderRadius: 14, border: `2px dashed ${C.line}`, boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: enter * dim, transform: `translateY(${(1 - enter) * 60}px)`}}>
          <span style={{fontFamily: MONO, fontSize: 64, fontWeight: 700, color: C.lime}}>{count.match(/^\d+/)?.[0] ?? ''}</span>
          <span style={{fontSize: 28, fontWeight: 700, color: C.ink}}>{showAll} →</span>
        </div>;})()}
      {/* 光标 */}
      {b >= 4.6 ? <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', opacity: 1 - grow}}>
        <g transform={`translate(${b < 5 ? lerp(1500, cx, outExpo(hit(b, 4.6, .4))) : cx} ${b < 5 ? lerp(1000, cy, outExpo(hit(b, 4.6, .4))) : cy}) scale(${1 - .12 * (pick ? Math.exp(-(b - 15) * 8) : 0)})`}>
          <path d="M0 0 L0 38 L10 29 L17 45 L24 42 L17 26 L30 26 Z" fill={C.ink} stroke={C.bg} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      </svg> : null}
      <div style={{position: 'absolute', inset: 0, background: C.ink, opacity: flash, pointerEvents: 'none', zIndex: 9}} />
    </div>
  </div>;
}
