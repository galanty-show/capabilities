import {clamp, ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  title: '推理动态宣传片',
  params: {
    phase: '原有幕阶段：now、signals、question、next、flow 或片尾；只说明，不生成控件。',
    nowLabel: {type: 'text', label: '实时智能标签', default: 'INTELLIGENCE / IN REAL TIME', help: '输入实时智能幕顶部的标签。'},
    nowTitle: {type: 'text', label: '此刻标题', default: 'NOW', help: '输入此刻幕的大标题文字。'},
    nowMark: {type: 'text', label: '此刻标题标点', default: '.', help: '输入此刻标题的着色标点。'},
    nowSubtitle: {type: 'longtext', label: '此刻副标题', default: 'The moment is already moving.', help: '输入此刻幕底部的副标题。'},
    signalsLabel: {type: 'text', label: '实时信号标签', default: '01 / LIVE SIGNALS', help: '输入信号幕顶部的标签。'},
    signalTitle: {type: 'text', label: '信号标题', default: 'SIGNAL', help: '输入信号幕第一行标题的主文字。'},
    signalAccent: {type: 'text', label: '信号着色文字', default: ' IN.', help: '输入信号幕第一行的着色文字，开头空格保留间距。'},
    responseTitle: {type: 'text', label: '响应标题', default: 'RESPONSE', help: '输入信号幕第二行标题的主文字。'},
    responseAccent: {type: 'text', label: '响应着色文字', default: ' OUT.', help: '输入信号幕第二行的着色文字，开头空格保留间距。'},
    questionLabel: {type: 'text', label: '可能性标签', default: '02 / POSSIBILITIES', help: '输入可能性幕顶部的标签。'},
    questionTitle: {type: 'text', label: '提问标题', default: "WHAT'S NEXT", help: '输入可能性幕中央的提问标题。'},
    questionMark: {type: 'text', label: '提问标题标点', default: '?', help: '输入提问标题的着色标点。'},
    nextLabel: {type: 'text', label: '下一步标签', default: '03 / THE NEXT STEP', help: '输入下一步幕顶部的标签。'},
    nextTitle: {type: 'text', label: '成形标题', default: 'TAKES', help: '输入下一步幕标题的主文字。'},
    nextAccent: {type: 'text', label: '成形着色文字', default: ' SHAPE.', help: '输入下一步幕标题的着色文字，开头空格保留间距。'},
    nextSubtitle: {type: 'longtext', label: '下一步副标题', default: 'The answer becomes action.', help: '输入下一步幕的副标题。'},
    flowLabel: {type: 'text', label: '动势标签', default: '04 / MOMENTUM', help: '输入流动幕顶部的标签。'},
    flowTitle: {type: 'text', label: '流动标题第一行', default: 'STAY IN', help: '输入流动幕标题的第一行。'},
    flowAccent: {type: 'text', label: '流动标题第二行', default: 'FLOW.', help: '输入流动幕标题的着色第二行。'},
    finalTitle: {type: 'text', label: '片尾标题', default: 'INFERENCE', help: '输入片尾中央的标题。'},
    finalMark: {type: 'text', label: '片尾标题标点', default: '.', help: '输入片尾标题的着色标点。'},
    finalSubtitle: {type: 'text', label: '片尾副标题', default: 'IN MOTION', help: '输入片尾标题下方的副标题。'},
  },
} as const;

const LIME = '#C8FF4D';
const VIOLET = '#A48BFF';
const WHITE = '#F6F7F4';
const MUTED = '#9CA4AF';
const up = (t: number, delay = 0, span = 0.45) => ease(clamp((t - delay) / span));

export default function InferenceFilm(p: SceneInput) {
  const s = useScene(p);
  const t = s.t;
  const phase = String(p.params.phase ?? 'now');
  const text = (key: Exclude<keyof typeof meta.params, 'phase'>) => String(p.params[key] ?? meta.params[key].default);
  const c = p.layout.content;
  const w = c.right - c.left;
  const h = c.bottom - c.top;
  const font = p.fonts.text;
  const enter = up(t, 0.05, 0.44);
  const stage = {position: 'absolute' as const, left: c.left, top: c.top, width: w, height: h};
  const kick = {fontFamily: font, color: LIME, fontSize: 18, fontWeight: 800 as const,
    letterSpacing: '0.20em', textTransform: 'uppercase' as const};
  const headline = {fontFamily: font, color: WHITE, fontWeight: 900 as const,
    letterSpacing: '-0.065em', lineHeight: 0.94};

  let body;
  if (phase === 'now') {
    const pulse = Math.sin(t * 5) * 5;
    body = <>
      <div style={{position: 'absolute', top: 24, left: 8, ...kick, opacity: enter}}>{text('nowLabel')}</div>
      <div style={{position: 'absolute', left: 0, top: h * 0.24, ...headline,
        fontSize: 220, opacity: enter, transform: `translateY(${60 * (1 - enter)}px)`}}>{text('nowTitle')}<span style={{color: LIME}}>{text('nowMark')}</span></div>
      <div style={{position: 'absolute', left: 8, top: h * 0.72, color: MUTED,
        fontFamily: font, fontSize: 30, fontWeight: 500, opacity: up(t, 0.55)}}>{text('nowSubtitle')}</div>
      <svg viewBox="0 0 440 440" style={{position: 'absolute', right: -35, top: h * 0.04, width: 440, height: 440}}>
        {[0, 1, 2, 3].map(i => <circle key={i} cx="220" cy="220" r={48 + i * 49 + pulse}
          fill="none" stroke={i === 0 ? LIME : VIOLET} strokeWidth={i === 0 ? 4 : 1.4}
          opacity={up(t, 0.10 + i * 0.10) * (0.8 - i * 0.14)} />)}
        <circle cx="220" cy="220" r={18 + pulse * 0.2} fill={LIME} opacity={enter} />
        {Array.from({length: 15}, (_, i) => {
          const a = i * 2.399 + t * (i % 2 ? 0.35 : -0.28);
          const r = 77 + (i * 29 % 133);
          return <circle key={i} cx={220 + Math.cos(a) * r} cy={220 + Math.sin(a) * r}
            r={i % 3 === 0 ? 4 : 2} fill={i % 3 === 0 ? LIME : VIOLET} opacity={enter * 0.9} />;
        })}
      </svg>
    </>;
  } else if (phase === 'signals') {
    const travel = up(t, 0.20, 0.45);
    body = <>
      <div style={{position: 'absolute', top: 22, left: 8, ...kick, opacity: enter}}>{text('signalsLabel')}</div>
      <div style={{position: 'absolute', left: 0, top: h * 0.16, ...headline, fontSize: 111,
        opacity: enter}}>{text('signalTitle')}<span style={{color: LIME}}>{text('signalAccent')}</span></div>
      <div style={{position: 'absolute', left: 0, top: h * 0.39, ...headline, fontSize: 111,
        opacity: up(t, 0.34), transform: `translateX(${40 * (1 - up(t, 0.34))}px)`}}>{text('responseTitle')}<span style={{color: VIOLET}}>{text('responseAccent')}</span></div>
      <svg viewBox="0 0 1100 150" style={{position: 'absolute', left: 0, bottom: 16, width: w, height: 150}}>
        {[0, 1, 2, 3].map(i => <g key={i}>
          <path d={`M20 ${28 + i * 30} C320 ${15 + i * 35}, 550 ${105 - i * 20}, 1080 ${75}`}
            fill="none" stroke={i % 2 ? VIOLET : LIME} strokeWidth={i === 0 ? 4 : 2}
            opacity={0.32 + i * 0.12} />
          <circle cx={50 + ((t * 270 + i * 130) % 970)} cy={28 + i * 30 + Math.sin(t * 2.4 + i) * (14 - i * 2)}
            r={7 - i * 0.7} fill={i % 2 ? VIOLET : LIME} opacity={travel * 0.9} />
        </g>)}
      </svg>
    </>;
  } else if (phase === 'question') {
    const reveal = up(t, 0.60, 1.25);
    body = <>
      <div style={{position: 'absolute', top: 22, left: 8, ...kick, opacity: enter}}>{text('questionLabel')}</div>
      <div style={{position: 'absolute', top: h * 0.15, width: w, textAlign: 'center', ...headline,
        fontSize: 120, opacity: enter}}>{text('questionTitle')}<span style={{color: LIME}}>{text('questionMark')}</span></div>
      <svg viewBox="0 0 1100 320" style={{position: 'absolute', top: h * 0.44, left: 0, width: w, height: h * 0.56}}>
        <circle cx="550" cy="40" r="18" fill={LIME} />
        {Array.from({length: 19}, (_, i) => {
          const x = 70 + i * 53;
          const endY = 200 + (i * 43 % 92);
          const v = clamp(reveal * 1.4 - Math.abs(i - 9) * 0.035);
          return <g key={i} opacity={v}>
            <path d={`M550 45 Q${550 + (x - 550) * 0.18} 170 ${x} ${endY}`}
              stroke={i % 4 === 0 ? LIME : VIOLET} strokeWidth={i % 4 === 0 ? 3 : 1.2} fill="none" opacity="0.55" />
            <circle cx={x} cy={endY + Math.sin(t * 2.7 + i) * 4} r={(i % 4 === 0 ? 7 : 3.5) + Math.sin(t * 3 + i) * 1.2} fill={i % 4 === 0 ? LIME : VIOLET} />
          </g>;
        })}
      </svg>
    </>;
  } else if (phase === 'next') {
    const grow = up(t, 0.35, 1.2);
    body = <>
      <div style={{position: 'absolute', top: 22, left: 8, ...kick, opacity: enter}}>{text('nextLabel')}</div>
      <div style={{position: 'absolute', top: h * 0.17, left: 0, ...headline,
        fontSize: 119, opacity: enter}}>{text('nextTitle')}<span style={{color: LIME}}>{text('nextAccent')}</span></div>
      <div style={{position: 'absolute', left: 8, top: h * 0.43, color: MUTED,
        fontFamily: font, fontSize: 30, opacity: up(t, 0.5)}}>{text('nextSubtitle')}</div>
      <svg viewBox="0 0 1100 230" style={{position: 'absolute', left: 0, bottom: 0, width: w, height: h * 0.38}}>
        {Array.from({length: 22}, (_, i) => {
          const x = 20 + i * 49;
          const amount = clamp(grow * 1.35 - i * 0.027);
          const bars = (22 + ((i * 31) % 120)) * (0.84 + Math.sin(t * 3.4 + i * 0.8) * 0.16);
          return <rect key={i} x={x} y={170 - bars * amount} width="30" height={bars * amount}
            rx="6" fill={i > 15 ? LIME : i % 3 === 0 ? VIOLET : '#495169'} opacity={0.64 + amount * 0.32} />;
        })}
        <path d={`M15 195 L${15 + grow * 1065} 195`} stroke={LIME} strokeWidth="3" />
      </svg>
    </>;
  } else if (phase === 'flow') {
    const flow = up(t, 0.2, 1.6);
    body = <>
      <svg viewBox="0 0 1100 460" style={{position: 'absolute', inset: 0, width: w, height: h}}>
        {Array.from({length: 11}, (_, i) => <path key={i}
          d={`M${-200 + flow * 180} ${360 + i * 14} C330 ${155 + i * 8 + Math.sin(t * 2 + i * 0.4) * 20}, 600 ${525 - i * 16 + Math.sin(t * 2.3 + i * 0.3) * 24}, 1300 ${155 + i * 9}`}
          fill="none" stroke={i % 3 === 0 ? LIME : VIOLET} strokeWidth={i % 3 === 0 ? 3 : 1.4}
          opacity={(0.10 + flow * 0.13) * (1 - i * 0.025)} />)}
      </svg>
      <div style={{position: 'absolute', top: 22, left: 8, ...kick, opacity: enter}}>{text('flowLabel')}</div>
      <div style={{position: 'absolute', top: h * 0.10, left: 0, ...headline, fontSize: 155,
        opacity: enter}}>{text('flowTitle')}</div>
      <div style={{position: 'absolute', top: h * 0.43, left: 0, ...headline, fontSize: 155,
        color: LIME, opacity: up(t, 0.40), transform: `translateX(${60 * (1 - up(t, 0.40))}px)`}}>{text('flowAccent')}</div>
    </>;
  } else {
    const reveal = up(t, 0.18, 0.85);
    body = <>
      <svg viewBox="0 0 150 150" style={{position: 'absolute', top: h * 0.06, left: (w - 150) / 2, width: 150, height: 150, opacity: reveal}}>
        <circle cx="75" cy="75" r="48" stroke={LIME} strokeWidth="6" fill="none" />
        <path d="M34 88 L69 56 L92 82 L120 47" fill="none" stroke={VIOLET} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="120" cy="47" r="8" fill={LIME} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.46, textAlign: 'center',
        ...headline, fontSize: 111, opacity: reveal, transform: `scale(${0.93 + reveal * 0.07})`}}>{text('finalTitle')}<span style={{color: LIME}}>{text('finalMark')}</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.70, textAlign: 'center',
        color: MUTED, fontFamily: font, fontSize: 34, letterSpacing: '0.16em', fontWeight: 700,
        opacity: up(t, 0.75)}}>{text('finalSubtitle')}</div>
    </>;
  }

  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden',
    background: 'radial-gradient(ellipse at 70% 48%, #151932 0%, #080B13 66%)',
    opacity: s.fadeOut(9)}}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.17,
      backgroundImage: 'linear-gradient(#66708033 1px, transparent 1px), linear-gradient(90deg, #66708033 1px, transparent 1px)',
      backgroundSize: '54px 54px'}} />
    <div style={stage}>{body}</div>
    <div style={{position: 'absolute', left: c.left, right: p.width - c.right,
      bottom: 15, height: 3, background: '#FFFFFF18'}}>
      <div style={{height: '100%', width: `${Math.min(100, (t / 6) * 100)}%`, background: LIME}} />
    </div>
  </div>;
}
