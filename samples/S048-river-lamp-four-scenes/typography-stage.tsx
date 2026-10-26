// 模板：原创诗文舞台。每句在自己的配音起点后进入；不复制宿主粒子字形。
// params: {title?: string, kicker?: string, lines?: string[]}；lines 仅在缺少 sentences 时使用。
// 素材槽：scene 替换右侧（竖屏上方）的月夜插画；background 整幅背景（压暗）。图片/SVG/视频都可以。
import {Img} from 'remotion';
import {Media, assets as slots, type SceneAsset} from '@talkframe/scene';

type Box = {left: number; top: number; right: number; bottom: number};
type Sentence = {id: string; text: string; start: number; end: number};
type Props = {
  frame: number; fps: number; durationInFrames: number;
  aspect: 'landscape' | 'portrait' | 'square';
  theme: {background: string; accent: string; text: string; muted: string};
  layout: {content: Box}; sentences: ReadonlyArray<Sentence>;
  progress: (id: string, offset?: number) => number;
  params: Readonly<Record<string, unknown>>; assets: Readonly<Record<string, SceneAsset>>;
};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const asText = (v: unknown) => typeof v === 'string' ? v : '';

export default function TypographyStage(props: Props) {
  const {frame, fps, durationInFrames, aspect, theme, layout, sentences, progress, params} = props;
  const media = slots(props as never);
  const c = layout.content, W = c.right - c.left, H = c.bottom - c.top;
  const wide = aspect === 'landscape';
  const time = frame / Math.max(1, fps);
  const active = sentences.reduce((last, s, i) => time >= s.start ? i : last, -1);
  const maxLength = Math.max(0, ...sentences.map(s => Array.from(s.text).length));
  // 长句减少每页行数，未到起点的句子不生成文字节点。
  const pageSize = maxLength > (wide ? 60 : 42) ? 1 : maxLength > (wide ? 36 : 24) ? 2 : 3;
  const page = Math.floor(Math.max(0, active) / pageSize);
  const first = page * pageSize;
  const fallback = Array.isArray(params.lines) ? params.lines.filter((v): v is string => typeof v === 'string').slice(0, 3) : [];
  const lines = sentences.length ? sentences.slice(first, first + pageSize) : fallback.length ? fallback : ['风穿过窗前，', '灯照亮未写完的路。'];
  const longest = Math.max(1, ...lines.map(s => Array.from(typeof s === 'string' ? s : s.text).length));
  const textBox = wide
    ? {left: c.left + 8, top: c.top + 18, width: W * .62, height: H - 36}
    : {left: c.left + 8, top: c.top + H * .38, width: W - 16, height: H * .6};
  const artBox = wide
    ? {left: c.left + W * .66, top: c.top + 8, width: W * .34, height: H - 16}
    : {left: c.left + 8, top: c.top + 6, width: W - 16, height: H * .37};
  const font = Math.max(26, Math.min(wide ? 64 : 54, textBox.width / Math.min(19, Math.max(9, longest)), textBox.height / (2.5 + pageSize * longest / (wide ? 24 : 18))));
  const fadeOut = clamp((durationInFrames - frame) / 10);
  // 高分辨率 SVG 图片以固定采样绘制；时间仍只影响文字揭示。
  const stars = Array.from({length:28},(_,i)=>`<circle cx="${35+(i*137)%430}" cy="${38+(i*89)%390}" r="${i%5===0?3.3:1.8}" fill="${i%4===0?theme.accent:theme.text}" opacity="${.15+(i%5)*.1}"/>`).join('');
  const artSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="2880" viewBox="0 0 500 600"><rect width="500" height="600" fill="${theme.background}"/>`
    + `<circle cx="308" cy="224" r="116" fill="${theme.accent}" opacity=".06"/>`
    + `<circle cx="308" cy="224" r="81" fill="${theme.accent}" opacity=".72"/>`
    + `<circle cx="334" cy="206" r="80" fill="${theme.background}" opacity=".88"/>`
    + `<path d="M32 488 Q146 458 251 490 T480 478 M25 525 Q161 494 278 530 T481 510" fill="none" stroke="${theme.muted}" stroke-width="3" opacity=".35"/>${stars}</svg>`;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: fadeOut,
    background: theme.background,
    color: theme.text, fontFamily: 'Noto Serif CJK SC, Songti SC, serif'}}>
    {media.background ? <div style={{position: 'absolute', inset: 0}}><Media asset={media.background} frame={frame} fit={media.background.fit ?? 'cover'} />
      <div style={{position: 'absolute', inset: 0, background: `${theme.background}b3`}} /></div> : null}
    <div style={{position: 'absolute', ...artBox, overflow: 'hidden', ...(media.scene ? {borderRadius: 24} : {})}}>
      {media.scene ? <Media asset={media.scene} frame={frame} />
        : <Img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(artSvg)}`} style={{width:'100%',height:'100%',objectFit:'contain',imageRendering:'pixelated'}} />}
    </div>
    <div style={{position: 'absolute', ...textBox, boxSizing: 'border-box', padding: '8px 10px', overflow: 'hidden'}}>
      <div style={{fontSize: 20, color: theme.accent, letterSpacing: '.25em', fontWeight: 700}}>
        {asText(params.kicker) || '诗文舞台'}
      </div>
      <div style={{fontSize: Math.min(43, font * .8), color: theme.muted, marginTop: 17, overflowWrap: 'anywhere'}}>
        {asText(params.title) || '写给夜色'}
      </div>
      <div style={{width: 68, height: 3, marginTop: 23, background: theme.accent, opacity: .7}} />
      <div key={page} style={{marginTop: 27, display: 'flex', flexDirection: 'column', gap: Math.max(10, font * .18)}}>
        {lines.map((entry, offset) => {
          const index = first + offset;
          if (sentences.length && index > active) return null;
          const text = typeof entry === 'string' ? entry : entry.text;
          const focus = sentences.length ? index === active : offset === 0;
          const amount = typeof entry === 'string' ? 1 : clamp(progress(entry.id));
          return <div key={typeof entry === 'string' ? offset : entry.id}
            style={{fontSize: font, lineHeight: 1.42, letterSpacing: '.035em', overflowWrap: 'anywhere', wordBreak: 'break-word',
              color: focus ? theme.text : theme.muted, opacity: (focus ? 1 : .62) * amount}}>{text}</div>;
        })}
      </div>
      {sentences.length > pageSize && <div style={{position: 'absolute', right: 8, bottom: 4, fontSize: 18, color: theme.muted}}>
        {page + 1} / {Math.ceil(sentences.length / pageSize)}
      </div>}
    </div>
  </div>;
}
