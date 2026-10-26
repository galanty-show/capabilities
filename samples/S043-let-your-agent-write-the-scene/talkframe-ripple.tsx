import {clamp, ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  title: '文影涟漪宣传片',
  params: {
    mode: '原有幕阶段：idea、handoff、ripple、revise 或成片；只说明，不生成控件。',
    ideaTitle: {type: 'text', label: '想法幕标题', default: '你脑海里的那一幕', help: '输入想法幕顶部的标题。'},
    ideaLabel: {type: 'text', label: '画面描述标签', default: '画面描述', help: '输入想法卡片的标签。'},
    ideaLine1: {type: 'longtext', label: '画面描述第一行', default: '让一句话落进水里，', help: '输入画面描述换行前的文字。'},
    ideaLine2: {type: 'longtext', label: '画面描述第二行', default: '从涟漪中浮出来。', help: '输入画面描述换行后的文字。'},
    handoffTitle: {type: 'text', label: '写下画面标题', default: '把画面写下来', help: '输入交接幕顶部的标题。'},
    handoffLabel: {type: 'text', label: '想法卡片标签', default: '你的想法', help: '输入交接幕想法卡片的标签。'},
    handoffLine1: {type: 'longtext', label: '想法第一行', default: '一句话落进水里，', help: '输入想法换行前的文字。'},
    handoffLine2: {type: 'longtext', label: '想法第二行', default: '泛起涟漪。', help: '输入想法换行后的文字。'},
    previewLabel: {type: 'text', label: '预览卡片标签', default: '这一幕正在成形', help: '输入交接幕预览卡片的标签。'},
    rippleTitle: {type: 'text', label: '动画幕标题', default: '从一句话，到一幕动画', help: '输入涟漪动画幕顶部的标题。'},
    rippleText: {type: 'text', label: '涟漪画面文字', default: '让想法泛起涟漪', help: '输入涟漪动画和成片字幕共用的文字。'},
    reviseTitle: {type: 'text', label: '改稿幕标题', default: '继续改，直到更像你的想法', help: '输入改稿幕顶部的标题。'},
    reviseLabel: {type: 'text', label: '改稿说明', default: '同一幕 · 两种情绪', help: '输入两张改稿卡片上方的说明。'},
    draftLabel: {type: 'text', label: '初稿标签', default: '清凉 · 初稿', help: '输入第一张改稿卡片底部的标签。'},
    revisionLabel: {type: 'text', label: '修改稿标签', default: '暖金 · 慢一点', help: '输入第二张改稿卡片底部的标签。'},
    finalTitle: {type: 'text', label: '成片幕标题', default: '让想法进入作品', help: '输入成片幕顶部的标题。'},
    finalTagline: {type: 'text', label: '成片宣传语', default: 'Galanty 文影 · 让 agent 写画面', help: '输入成片幕底部的宣传语。'},
  },
} as const;

// 一句具体描述贯穿五幕：输入卡 → 动画草图 → 可见水波 → 改稿 → 成片。
// 所有时间仅由幕内 frame/fps 决定；SVG 圆环和光点是真实逐帧变化。
const rise = (time: number, start: number, span = 0.65) => ease(clamp((time - start) / span));

function RippleArt({time, color, slow = false, font, compact = false, text}: {time: number; color: string; slow?: boolean; font: string; compact?: boolean; text: string}) {
  const launch = slow ? 1.1 : 0.5;
  const speed = slow ? 0.47 : 0.76;
  const fall = rise(time, 0.12, 0.9);
  const textY = -120 * (1 - fall);
  const wave = Math.max(0, time - launch) * speed;
  const rings = [0, 1, 2].map(i => {
    const p = clamp(wave - i * 0.33);
    return <ellipse key={i} cx="400" cy="300" rx={70 + p * 245} ry={22 + p * 82}
      fill="none" stroke={color} strokeWidth={4 - p * 2} opacity={p === 0 ? 0 : (1 - p * 0.72) * 0.78} />;
  });
  const sparks = Array.from({length: 12}, (_, i) => {
    const p = clamp((wave - 0.22 - (i % 3) * 0.10) / 0.75);
    const angle = i * Math.PI / 6;
    return <circle key={i} cx={400 + Math.cos(angle) * (36 + p * 285)}
      cy={300 + Math.sin(angle) * (12 + p * 90)} r={3.5 + (i % 3)}
      fill={color} opacity={p === 0 ? 0 : (1 - p * 0.65) * 0.9} />;
  });
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: compact ? 24 : 36,
    background: `radial-gradient(ellipse at 50% 65%, ${color}22 0%, #0B1523 67%)`}}>
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <ellipse cx="400" cy="300" rx="340" ry="110" fill="none" stroke={`${color}24`} strokeWidth="2" />
      {rings}{sparks}
      <circle cx="400" cy="300" r={8 + 11 * rise(time, launch, 0.22)} fill={color} opacity={rise(time, launch, 0.15) * (1 - clamp((time - launch - 1) / 0.6))} />
    </svg>
    <div style={{position: 'absolute', left: '6%', right: '6%', top: '34%', textAlign: 'center',
      color: '#F5F2EA', fontFamily: font, fontWeight: 800, fontSize: compact ? 33 : 68,
      letterSpacing: '0.04em', textShadow: `0 0 28px ${color}88`,
      opacity: fall, transform: `translateY(${textY}px)`}}>{text}</div>
  </div>;
}

export default function TalkframeRipple(props: SceneInput) {
  const s = useScene(props);
  const {theme, layout, width, height, aspect, fonts} = props;
  const c = layout.content;
  const cw = c.right - c.left;
  const ch = c.bottom - c.top;
  const portrait = aspect === 'portrait';
  const mode = String(props.params.mode ?? 'idea');
  const text = (key: Exclude<keyof typeof meta.params, 'mode'>) => String(props.params[key] ?? meta.params[key].default);
  const t = s.t;
  const main = theme.accent;
  const gold = '#F4BF71';
  const stage = {position: 'absolute' as const, left: c.left, top: c.top, width: cw, height: ch};
  const title = {position: 'absolute' as const, left: 0, right: 0, top: 0, color: theme.text,
    fontFamily: fonts.text, fontSize: portrait ? 70 : 75, lineHeight: 1.12, fontWeight: 800 as const,
    letterSpacing: '-0.02em', opacity: rise(t, 0, 0.5)};
  const label = {color: main, fontFamily: fonts.text, fontSize: portrait ? 28 : 25,
    fontWeight: 700 as const, letterSpacing: '0.12em'};
  const card = {boxSizing: 'border-box' as const, border: `2px solid ${main}66`,
    borderRadius: 28, background: '#142337', boxShadow: `0 25px 80px #0005`};

  let body;
  if (mode === 'idea') {
    const reveal = rise(t, 0.55, 0.8);
    body = <>
      <div style={{...title}}>{text('ideaTitle')}</div>
      <div style={{...card, position: 'absolute', left: cw * 0.08, top: ch * (portrait ? 0.27 : 0.30),
        width: cw * 0.84, minHeight: portrait ? 260 : 205, padding: portrait ? '38px 42px' : '30px 48px',
        opacity: reveal, transform: `translateY(${35 * (1 - reveal)}px)`}}>
        <div style={label}>{text('ideaLabel')}</div>
        <div style={{fontFamily: fonts.text, color: theme.text, fontSize: portrait ? 47 : 55,
          fontWeight: 700, marginTop: 20, lineHeight: 1.25}}>{text('ideaLine1')}<br/>{text('ideaLine2')}</div>
      </div>
      <svg style={{position: 'absolute', left: cw * 0.13, top: ch * (portrait ? 0.57 : 0.66), width: cw * 0.74, height: ch * 0.19}}
        viewBox="0 0 800 160" preserveAspectRatio="xMidYMid meet">
        {[0, 1, 2].map(i => <ellipse key={i} cx="400" cy="80" rx={75 + i * 85 + rise(t, 1.7 + i * 0.2) * 25}
          ry={14 + i * 18} fill="none" stroke={main} strokeWidth="3" opacity={0.14 + rise(t, 1.4 + i * 0.2) * 0.28} />)}
      </svg>
    </>;
  } else if (mode === 'handoff') {
    const ready = rise(t, 1.2, 0.9);
    const previewTop = portrait ? ch * 0.50 : ch * 0.33;
    body = <>
      <div style={{...title}}>{text('handoffTitle')}</div>
      <div style={{...card, position: 'absolute', left: portrait ? cw * 0.06 : 0,
        top: ch * (portrait ? 0.18 : 0.29), width: portrait ? cw * 0.88 : cw * 0.42,
        padding: portrait ? 36 : 32, opacity: rise(t, 0.2)}}>
        <div style={label}>{text('handoffLabel')}</div>
        <div style={{fontFamily: fonts.text, color: theme.text, fontSize: portrait ? 43 : 48,
          lineHeight: 1.25, fontWeight: 700, marginTop: 18}}>{text('handoffLine1')}<br/>{text('handoffLine2')}</div>
      </div>
      <div style={{position: 'absolute', left: portrait ? cw * 0.49 : cw * 0.43,
        top: portrait ? ch * 0.40 : ch * 0.48, width: portrait ? 3 : cw * 0.10,
        height: portrait ? ch * 0.09 : 3, background: main,
        opacity: ready, transform: portrait ? `scaleY(${ready})` : `scaleX(${ready})`, transformOrigin: 'top left'}} />
      <div style={{...card, position: 'absolute', left: portrait ? cw * 0.06 : cw * 0.55,
        top: previewTop, width: portrait ? cw * 0.88 : cw * 0.45, height: portrait ? ch * 0.36 : ch * 0.52,
        padding: portrait ? 28 : 24, opacity: ready}}>
        <div style={label}>{text('previewLabel')}</div>
        <div style={{position: 'relative', height: '77%', marginTop: 12}}>
          <RippleArt time={Math.max(0, t - 1.3)} color={main} font={fonts.text} compact text={text('rippleText')} />
        </div>
      </div>
    </>;
  } else if (mode === 'ripple') {
    body = <>
      <div style={{...title}}>{text('rippleTitle')}</div>
      <div style={{...card, position: 'absolute', left: 0, top: ch * (portrait ? 0.16 : 0.20),
        width: cw, height: ch * (portrait ? 0.67 : 0.72), overflow: 'hidden', opacity: rise(t, 0.15)}}>
        <RippleArt time={t} color={main} font={fonts.text} text={text('rippleText')} />
      </div>
    </>;
  } else if (mode === 'revise') {
    const changed = rise(t, 1.7, 1.2);
    const gap = portrait ? 24 : 32;
    const smallW = portrait ? cw : (cw - gap) / 2;
    const smallH = portrait ? ch * 0.33 : ch * 0.65;
    body = <>
      <div style={{...title}}>{text('reviseTitle')}</div>
      <div style={{position: 'absolute', left: 0, top: ch * (portrait ? 0.15 : 0.19), ...label}}>{text('reviseLabel')}</div>
      <div style={{...card, position: 'absolute', left: 0, top: ch * (portrait ? 0.24 : 0.31),
        width: smallW, height: smallH, overflow: 'hidden', opacity: 1 - changed * 0.30}}>
        <RippleArt time={t} color={main} font={fonts.text} compact text={text('rippleText')} />
        <div style={{position: 'absolute', left: 24, bottom: 18, color: main, fontFamily: fonts.text, fontSize: 25}}>{text('draftLabel')}</div>
      </div>
      <div style={{...card, position: 'absolute', left: portrait ? 0 : smallW + gap,
        top: ch * (portrait ? 0.59 : 0.31), width: smallW, height: smallH,
        overflow: 'hidden', borderColor: `${gold}88`, opacity: changed,
        transform: `scale(${0.93 + changed * 0.07})`}}>
        <RippleArt time={Math.max(0, t - 1.7)} color={gold} slow font={fonts.text} compact text={text('rippleText')} />
        <div style={{position: 'absolute', left: 24, bottom: 18, color: gold, fontFamily: fonts.text, fontSize: 25}}>{text('revisionLabel')}</div>
      </div>
    </>;
  } else {
    const assemble = rise(t, 1.3, 1.1);
    const screenW = portrait ? cw * 0.94 : cw * 0.71;
    const screenH = portrait ? ch * 0.49 : ch * 0.65;
    body = <>
      <div style={{...title}}>{text('finalTitle')}</div>
      <div style={{position: 'absolute', left: (cw - screenW) / 2, top: ch * (portrait ? 0.22 : 0.20),
        width: screenW, height: screenH, ...card, overflow: 'hidden', opacity: rise(t, 0.15)}}>
        <div style={{position: 'absolute', inset: 14, bottom: portrait ? 125 : 95}}>
          <RippleArt time={t} color={gold} font={fonts.text} compact text={text('rippleText')} />
        </div>
        <div style={{position: 'absolute', left: 30, right: 30, bottom: portrait ? 66 : 45,
          display: 'flex', gap: 7, height: 30, alignItems: 'center', opacity: assemble}}>
          {Array.from({length: 26}, (_, i) => <div key={i} style={{flex: 1, height: `${8 + (i * 17 % 22)}px`,
            borderRadius: 4, background: `${gold}99`}} />)}
        </div>
        <div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center',
          fontFamily: fonts.text, fontSize: portrait ? 25 : 23, color: theme.text, opacity: assemble}}>{text('rippleText')}</div>
      </div>
      <div style={{position: 'absolute', top: ch * (portrait ? 0.78 : 0.90), width: cw,
        fontFamily: fonts.text, textAlign: 'center', color: theme.text,
        fontSize: portrait ? 40 : 35, fontWeight: 700, opacity: assemble}}>{text('finalTagline')}</div>
    </>;
  }

  return <div style={{position: 'absolute', inset: 0, background: theme.background,
    opacity: s.fadeOut(10)}}><div style={stage}>{body}</div></div>;
}
