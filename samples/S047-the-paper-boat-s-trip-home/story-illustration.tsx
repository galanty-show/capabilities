// 模板：故事插画跟读。正文以配音句子为准；没有句子时用 params.text 展示静态样张。
// params: {title?: string, kicker?: string, text?: string}；assets.scene 可替换原创种子插画。
// 素材槽：scene（或 illustration）替换插画，可用图片/SVG/视频。
import {Media, assets as slots, type SceneAsset} from '@talkframe/scene';
type Box = {left: number; top: number; right: number; bottom: number};
type Sentence = {id: string; text: string; start: number; end: number};
type Props = {
  frame: number; fps: number; durationInFrames: number;
  aspect: 'landscape' | 'portrait' | 'square';
  theme: {background: string; accent: string; text: string; muted: string};
  layout: {content: Box}; sentences: ReadonlyArray<Sentence>;
  progress: (id: string, offset?: number) => number;
  assets: Readonly<Record<string, SceneAsset>>; params: Readonly<Record<string, unknown>>;
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const asText = (value: unknown) => typeof value === 'string' ? value : '';

export default function StoryIllustration(props: Props) {
  const {frame, fps, durationInFrames, aspect, theme, layout, sentences, progress, params} = props;
  const art0 = slots(props as never), picture = art0.scene ?? art0.illustration;
  const c = layout.content, W = c.right - c.left, H = c.bottom - c.top;
  const wide = aspect === 'landscape';
  const art = wide
    ? {left: c.left + W * .53, top: c.top + 8, width: W * .47, height: H - 16}
    : {left: c.left + 8, top: c.top + 4, width: W - 16, height: H * (aspect === 'square' ? .43 : .46)};
  const body = wide
    ? {left: c.left + 4, top: c.top + 8, width: W * .48, height: H - 16}
    : {left: c.left + 4, top: art.top + art.height + 14, width: W - 8, height: c.bottom - art.top - art.height - 18};
  const time = frame / Math.max(1, fps);
  const active = sentences.reduce((last, sentence, index) => time >= sentence.start ? index : last, -1);
  const maxLength = Math.max(0, ...sentences.map(s => Array.from(s.text).length));
  // 长句单独成页；页号只随当前已讲的句子前进，下一句永不预先入画。
  const pageSize = maxLength > (wide ? 64 : aspect === 'square' ? 30 : 60) ? 1 : 2;
  const page = Math.floor(Math.max(0, active) / pageSize);
  const pageStart = page * pageSize;
  const visible = sentences.length ? sentences.slice(pageStart, pageStart + pageSize) : [];
  const fallback = asText(params.text) || '小小的种子，等一阵温柔的风。';
  const longest = Math.max(1, ...visible.map(s => Array.from(s.text).length), sentences.length ? 1 : Array.from(fallback).length);
  const titleSize = Math.min(wide ? 52 : 48, body.width / 11);
  const readingHeight = Math.max(100, body.height - titleSize * 1.6 - 58);
  const font = Math.max(26, Math.min(wide ? 45 : 42, body.width / Math.min(15, Math.max(7, longest)), readingHeight / (1.6 + pageSize * longest / (wide ? 23 : 17))));
  const spoken = Math.max(0, active + 1) / Math.max(1, sentences.length);
  const grow = sentences.length ? spoken : .34;
  const fadeOut = clamp((durationInFrames - frame) / 10);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: theme.background,
    color: theme.text, fontFamily: 'Noto Sans CJK SC, PingFang SC, sans-serif', opacity: fadeOut}}>
    <div style={{position: 'absolute', ...art, borderRadius: 30, overflow: 'hidden', background: theme.background}}>
      {picture ? <Media asset={picture} frame={frame} />
        : <svg viewBox="0 0 800 620" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="小纸船在水面上">
          <circle cx="622" cy="138" r="62" fill={theme.accent} opacity=".14" />
          <path d="M40 390 Q240 330 440 400 T770 385 V620 H40Z" fill={theme.accent} opacity=".12" />
          {[410,470,530].map((y,i)=><path key={y} d={`M60 ${y} Q240 ${y-35} 410 ${y} T750 ${y}`} fill="none" stroke={theme.accent} strokeWidth="4" opacity={.25+i*.12} />)}
          <ellipse cx="590" cy="385" rx="66" ry="36" fill={theme.muted} opacity=".65" />
          <g transform={`translate(${110 + grow*80},${230 + Math.sin(time*1.8)*5})`}>
            <path d="M30 100 L150 10 L160 100Z" fill={theme.text} opacity=".9" />
            <path d="M160 100 L150 10 L270 100Z" fill={theme.accent} />
            <path d="M0 100 L300 100 L245 160 L55 160Z" fill={theme.text} opacity=".82" />
            <path d="M0 100 L150 135 L300 100 M150 135 L150 10" fill="none" stroke={theme.background} strokeWidth="5" />
          </g>
        </svg>}
    </div>
    <div style={{position: 'absolute', ...body, boxSizing: 'border-box', padding: wide ? '14px 18px 12px 4px' : '2px 8px', overflow: 'hidden'}}>
      <div style={{color: theme.accent, fontSize: Math.max(17, titleSize * .42), letterSpacing: '.18em', fontWeight: 700}}>
        {asText(params.kicker) || '故事时光'}
      </div>
      <div style={{fontSize: titleSize, lineHeight: 1.2, fontWeight: 750, marginTop: 12, overflowWrap: 'anywhere'}}>
        {asText(params.title) || '一颗种子的旅程'}
      </div>
      <div style={{height: 4, width: 76, borderRadius: 3, background: theme.accent, margin: '20px 0'}} />
      <div key={page} style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        {sentences.length ? visible.map((sentence, offset) => {
          const index = pageStart + offset;
          if (index > active) return null;
          const current = index === active;
          const reveal = clamp(progress(sentence.id));
          return <div key={sentence.id} style={{fontSize: font * (current ? 1 : .88), lineHeight: 1.38,
            padding: '8px 14px', borderRadius: 12, borderLeft: `4px solid ${current ? theme.accent : 'transparent'}`,
            background: current ? `${theme.accent}20` : 'transparent', color: current ? theme.text : theme.muted,
            opacity: current ? reveal : .68, overflowWrap: 'anywhere', wordBreak: 'break-word'}}>{sentence.text}</div>;
        }) : <div style={{fontSize: font, lineHeight: 1.38, overflowWrap: 'anywhere'}}>{fallback}</div>}
      </div>
      {sentences.length > pageSize && <div style={{position: 'absolute', bottom: 4, right: 8, color: theme.muted, fontSize: 18}}>
        {page + 1} / {Math.ceil(sentences.length / pageSize)}
      </div>}
    </div>
  </div>;
}
