// 语义主体模板（钱包片骨架）：小标题、主标题、编号要点，右侧是宿主粒子字形 + 轨道光环；compare/book 用浅底。
// params: {kicker?, title, points?: string[], visual?: 粒子字形名（默认 wallet）, labels?: string[], from?: 字形名|'scatter',
//   footer?: {label?, index, total}}。compare 的前两个 labels 画成粒子文字卡标，其余 labels 作右下角标签。
// 要点第 i 条跟第 i 句；开场 1.2 秒从 from（默认散点）聚成主体。素材槽 scene（图片/SVG/视频）替换粒子主体。
// 可选 particleHandoff: 'semantic-glyph-v1'；宿主通过 particleTrack 注入跨幕粒子层时使用。
import {Media, OrbitHalo, ParticleGlyph, ParticleText, assets as slots, clamp, ease, particleGlyphs, useScene, type ParticleGlyphName, type SceneInput} from '@talkframe/scene';
export const meta = {params: {
  kicker: {label: '眉题', type: 'text', default: '', help: '可用 ==词== 标出强调色'},
  title: {label: '标题', type: 'text', default: '把复杂事情讲清楚', help: '可用 ==词== 标出强调色'},
  points: {label: '要点', type: 'list', default: [], max: 3, help: '第 i 条跟第 i 句旁白出现'},
  visual: {label: '粒子主体', type: 'select', default: 'wallet', options: [
    {value: 'wallet', label: '钱包'}, {value: 'key', label: '密钥'}, {value: 'network', label: '网络'}, {value: 'coins', label: '代币'}, {value: 'lock', label: '锁'}, {value: 'compare', label: '双向对照'},
    {value: 'shield', label: '盾牌'}, {value: 'globe', label: '地球'}, {value: 'book', label: '书本'}, {value: 'rocket', label: '火箭'}, {value: 'film', label: '胶片'}, {value: 'record', label: '唱片'},
    {value: 'note', label: '音符'}, {value: 'audio', label: '音符（同 note）'}, {value: 'play', label: '播放'}, {value: 'question', label: '问号'}, {value: 'code', label: '代码'}]},
  labels: {label: '角标', type: 'list', default: [], help: '双向对照时前两个画成卡标'},
  from: '开场从哪个字形或 scatter（散点）聚拢成主体，默认 scatter；属于入场动画',
  'footer.label': {label: '底栏文字', type: 'text', help: '填了才显示底栏进度'},
  'footer.index': {label: '底栏当前序号', type: 'number', min: 1, step: 1},
  'footer.total': {label: '底栏总数', type: 'number', min: 1, step: 1},
}};

const glyphOf = (value: unknown, fallback: ParticleGlyphName | 'scatter') =>
  value === 'scatter' || (particleGlyphs as readonly unknown[]).includes(value) ? value as ParticleGlyphName | 'scatter' : fallback;
const morph = (t: number) => {const v = clamp(t), s = v * v * (3 - 2 * v); return clamp(s + Math.sin(v * Math.PI) * (1 - v) * 0.08);};
const plain = (text: string) => text.replace(/==([^=]+)==/g, '$1');
const highlighted = (text: string, accent: string) => text.split(/(==[^=]+==)/g).map((part, i) =>
  part.startsWith('==') && part.endsWith('==') ? <span key={i} style={{color: accent}}>{part.slice(2, -2)}</span> : part);
const titleLine = (title: string, start: number, length: number, accent: string) => {
  let cursor = 0;
  return title.split(/(==[^=]+==)/g).flatMap((part, i) => {
    const marked = part.startsWith('==') && part.endsWith('=='), content = marked ? part.slice(2, -2) : part;
    const from = Math.max(0, start - cursor), to = Math.min(content.length, start + length - cursor);
    cursor += content.length;
    if (from >= to) return [];
    const text = content.slice(from, to);
    return [marked ? <span key={i} style={{color: accent}}>{text}</span> : text];
  });
};
const weight = (text: string) => [...text].reduce((sum, ch) => sum + (/[^\x00-\xff]/.test(ch) ? 1 : 0.56), 0);
const splitTitle = (title: string) => {
  const cut = Math.max(title.indexOf('，'), title.indexOf('：'), title.indexOf('？'));
  if (cut > 2 && cut < title.length - 2) return [title.slice(0, cut + 1), title.slice(cut + 1)];
  return title.length > 12 ? [title.slice(0, Math.ceil(title.length / 2)), title.slice(Math.ceil(title.length / 2))] : [title];
};

export default function SemanticCards(props: SceneInput) {
  const {frame, fps, width, height, theme, params, sentences, seed, fonts} = props;
  const subject = slots(props).scene;
  const s = useScene(props), c = s.box, wide = props.aspect === 'landscape', tall = !wide, u = width / (wide ? 1920 : 1080);
  const title = String(params.title ?? '把复杂事情讲清楚');
  const points = (Array.isArray(params.points) ? params.points : []).slice(0, 3).map(String);
  const visual = glyphOf(params.visual, 'wallet') as ParticleGlyphName;
  const labels = (Array.isArray(params.labels) ? params.labels : []).map(String);
  const compare = visual === 'compare', light = compare || visual === 'book';
  const ink = light ? {bg: '#ECEDE6', text: '#111A20', muted: '#53616A', accent: '#709B18', particle: '#78A31B', second: '#157B89'}
    : {bg: theme.background, text: theme.text, muted: theme.muted, accent: theme.accent, particle: theme.accent, second: '#57D9E8'};
  const from = glyphOf(params.from, 'scatter');
  const assemble = from === 'scatter' ? ease(s.t / 1.25) : morph(s.t / 1.15);
  const track = props.particleTrack, trackFrame = track?.frame ?? frame, trackSeed = track?.seed ?? seed;
  const glyphName = glyphOf(track?.to, visual) as ParticleGlyphName, glyphFrom = glyphOf(track?.from, from);
  const glyphProgress = track?.progress ?? (track?.settled ? 1 : assemble);
  const square = props.aspect === 'square';
  // 旧 MotionFilm 的舞台：横屏右侧、竖屏中上；方形把主体收到右下，给标题与要点留出左列。
  const cx = width * (square ? 0.66 : tall ? 0.54 : 0.7), cy = height * (square ? 0.53 : tall ? 0.42 : 0.5), size = square ? width * 0.36 : tall ? width * 0.5 : Math.min(width, height) * 0.64;
  const enter = ease(s.t / 0.6), fade = s.fadeOut(10);
  // 要点：第 i 条跟第 i 句；句子少于要点时，余下几条在最后一句内均分。
  const reveal = (i: number) => {
    const k = Math.min(i, Math.max(0, sentences.length - 1)), item = sentences[k];
    const offset = item ? (i - k) * Math.max(0, item.end - item.start - 1) / Math.max(1, points.length - k) : 0;
    return item ? s.reveal(k, {offset, seconds: 0.6}) : ease((s.t - 0.75 - i * 0.6) / 0.6);
  };
  const active = points.reduce((best, _, i) => reveal(i) > 0 ? i : best, -1);
  const chips = compare ? labels.slice(2) : labels;
  const cardLabels = compare ? labels.slice(0, 2) : [];
  const footer = params.footer && typeof params.footer === 'object' ? params.footer as {label?: unknown; index?: unknown; total?: unknown} : null;
  const pad = (n: unknown) => String(Math.max(1, Math.round(Number(n) || 1))).padStart(2, '0');
  const titleSize = Math.max(tall ? 50 : 46, Math.round((tall ? 82 : 86) * Math.max(0.62, Math.min(1, (tall ? 13 : 22) / weight(plain(title)))))) * u;
  const camera = `scale(${1 + Math.sin(trackFrame / 90) * 0.012}) rotateZ(${Math.sin(trackFrame / 145) * 0.18}deg)`;
  const particleLayer = <div style={{position: 'absolute', inset: 0, opacity: track?.hold ? 1 : fade,
    transform: camera, transformOrigin: `${cx / width * 100}% ${cy / height * 100}%`}}>
    <ParticleGlyph name={glyphName} from={glyphFrom} progress={glyphProgress} frame={trackFrame} seed={trackSeed} x={cx} y={cy} size={size}
      tone={light ? 'light' : 'dark'} accent={ink.particle} secondary={ink.second} halo={track ? {dots: 4} : true} stableYaw={Boolean(track)} />
    {cardLabels.map((label, i) => {const n = [...label].length, fontSize = Math.min(size * 0.154, size * 0.434 / (n * 0.72));
      return <ParticleText key={i} text={label} fontSize={fontSize} weight={900} frame={trackFrame} seed={trackSeed + i} density={40}
        x={cx + (i ? 0.4 : -0.4) * size} y={cy} spread={size * 0.6} progress={ease((s.t - 0.48 - i * 0.38) / 0.9)}
        color={light ? '#102A35' : '#F5F4EC'} highlight={ink.second} />;})}
  </div>;
  if (track?.layer === 'particles') return particleLayer;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: ink.bg, color: ink.text, fontFamily: fonts.text}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: light
      ? 'radial-gradient(circle at 72% 45%, rgba(87,217,232,.12), transparent 37%), linear-gradient(110deg, rgba(16,24,32,.025), transparent 60%)'
      : 'radial-gradient(circle at 70% 44%, rgba(201,246,90,.11), transparent 34%), radial-gradient(circle at 92% 70%, rgba(87,217,232,.08), transparent 30%)'}} />
    {subject ? <div style={{position: 'absolute', left: cx - size * 0.62, top: cy - size * 0.42, width: size * 1.24, height: size * 0.84,
      opacity: enter * fade, borderRadius: 18 * u, overflow: 'hidden'}}><Media asset={subject} frame={frame} /></div>
      : track?.layer === 'content' ? null : particleLayer}
    {subject ? <OrbitHalo frame={trackFrame} seed={trackSeed} x={cx} y={cy} size={size} accent={ink.particle} secondary={ink.second} opacity={0.8 * (track?.hold ? 1 : fade)} /> : null}
    <div style={{position: 'absolute', left: c.left, top: c.top, width: tall ? c.width : width * 0.43, opacity: fade}}>
      <div style={{color: ink.accent, fontSize: (tall ? 18 : 19) * u, fontWeight: 760, letterSpacing: '.22em', opacity: enter, transform: `translateX(${(1 - enter) * -26 * u}px)`}}>
        {highlighted(String(params.kicker ?? ''), theme.accent)}</div>
      <div style={{marginTop: (tall ? 26 : 30) * u}}>
        {splitTitle(plain(title)).map((line, i, lines) => {const a = ease((frame - 5 - i * 5) / (0.55 * fps));
          const start = lines.slice(0, i).reduce((sum, previous) => sum + previous.length, 0);
          return <div key={i} style={{fontSize: titleSize, fontWeight: 760, lineHeight: 0.98, letterSpacing: '-.05em', overflowWrap: 'anywhere',
            opacity: a, transform: `translate(${(1 - a) * -42 * u}px, ${(1 - a) * 30 * u}px)`}}>{titleLine(title, start, line.length, theme.accent)}</div>;})}
      </div>
      <div style={{marginTop: (tall ? 25 : 30) * u, width: (tall ? 74 : 94) * u * enter, height: 4 * u, borderRadius: 99, background: ink.accent, boxShadow: `0 0 ${24 * u}px ${ink.accent}66`}} />
    </div>
    <div style={{position: 'absolute', left: c.left, bottom: height - c.bottom + (tall ? 40 : 18) * u, width: square ? width * 0.42 : tall ? c.width * 0.95 : width * 0.39, opacity: fade}}>
      {points.map((text, i) => {const a = reveal(i), on = i === active;
        return <div key={i} style={{display: 'grid', gridTemplateColumns: `${34 * u}px 1fr`, gap: 16 * u, padding: `${(tall ? 11 : 9) * u}px 0`,
          opacity: a * (on ? 1 : 0.62), transform: `translateX(${(1 - a) * -26 * u}px)`}}>
          <div style={{fontSize: 14 * u * (tall ? 1.3 : 1), color: on ? ink.accent : ink.muted, letterSpacing: '.12em', paddingTop: 6 * u}}>{String(i + 1).padStart(2, '0')}</div>
          <div style={{borderTop: `${Math.max(1, u)}px solid ${on ? ink.accent : ink.muted + '55'}`, paddingTop: 6 * u, fontSize: 23 * u * (tall ? 1.35 : 1),
            fontWeight: on ? 660 : 520, lineHeight: 1.35}}>{highlighted(text, theme.accent)}</div>
        </div>;})}
    </div>
    {chips.length ? <div style={{position: 'absolute', right: width - c.right, bottom: height - c.bottom, maxWidth: width * (tall ? 0.84 : 0.47),
      display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 * u, opacity: fade}}>
      {chips.map((chip, i) => {const a = ease((s.t - 0.8 - i * 0.5) / 0.5), last = i === chips.length - 1;
        return <div key={i} style={{padding: `${8 * u}px ${14 * u}px`, borderRadius: 999, border: `${Math.max(1, u)}px solid ${last ? ink.accent : ink.muted + '66'}`,
          background: light ? 'rgba(255,255,255,.42)' : 'rgba(8,14,18,.55)', color: last ? ink.text : ink.muted, fontSize: 17 * u * (tall ? 1.3 : 1),
          opacity: a, transform: `translateY(${(1 - a) * 15 * u}px)`}}>{chip}</div>;})}
    </div> : null}
    {footer ? <div style={{position: 'absolute', left: c.left, right: width - c.right, bottom: 27 * u, display: 'flex', alignItems: 'center', gap: 18 * u,
      color: ink.muted, fontSize: 14 * u, letterSpacing: '.14em'}}>
      <div style={{maxWidth: '34%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{String(footer.label ?? '')}</div>
      <div style={{height: Math.max(1, u), flex: 1, background: ink.muted + '44'}}>
        <div style={{height: '100%', width: `${clamp((Number(footer.index) - 1 + frame / props.durationInFrames) / Math.max(1, Number(footer.total) || 1)) * 100}%`, background: ink.accent}} />
      </div>
      <div>{pad(footer.index)} / {pad(footer.total)}</div>
    </div> : null}
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: light ? `inset 0 0 ${140 * u}px rgba(16,24,32,.12)` : `inset 0 0 ${180 * u}px rgba(0,0,0,.44)`}} />
  </div>;
}
