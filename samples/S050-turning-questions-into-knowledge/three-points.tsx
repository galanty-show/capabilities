// 模板：三要点逐句出现。第 i 个要点跟第 i 句旁白；句子少于要点时，后面的要点在最后一句内错峰 0.8 秒。
// params: {heading: string, points: string[]}（建议 3 条，每条 ≤ 14 字）
// 素材槽：point-1..point-3 每个要点一张图（卡片上部/右侧）；background（或 scene）整幅背景。
import {Media, assets as slots, type SceneAsset, type SceneInput} from '@talkframe/scene';
export const meta = {params: {
  heading: {label: '标题', type: 'text', default: '', help: '可用 ==词== 标出强调色'},
  points: {label: '要点', type: 'list', default: [], max: 3, maxLength: 14, help: '第 i 条跟第 i 句旁白出现，可用 ==词== 标出强调色'},
}};
// 背景槽：整幅铺满（cover）后压一层主题底色渐变，文字始终可读；图片、SVG、视频都可以。
const Backdrop = ({asset, frame, background, strength = .62}: {asset?: SceneAsset; frame: number; background: string; strength?: number}) => asset
  ? <div style={{position: 'absolute', inset: 0}}><Media asset={asset} frame={frame} fit={asset.fit ?? 'cover'} />
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, ${background} 0%, ${background}${Math.round(strength * 255).toString(16).padStart(2, '0')} 48%, ${background}88 100%)`}} /></div>
  : null;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const highlighted = (text: string, accent: string) => text.split(/(==[^=]+==)/g).map((part, i) =>
  part.startsWith('==') && part.endsWith('==') ? <span key={i} style={{color: accent}}>{part.slice(2, -2)}</span> : part);

export default function ThreePoints(props: SceneInput) {
  const {frame, fps, durationInFrames, aspect, theme, layout, sentences, progress, params} = props;
  const c = layout.content, media = slots(props);
  const points = Array.isArray(params.points) ? params.points.map(String) : [];
  const last = Math.max(0, sentences.length - 1);
  // 每个要点对应的句子与偏移秒数。
  const reveal = (i: number) => {
    const index = Math.min(i, last);
    return ease(progress(sentences[index]?.id ?? '', Math.max(0, i - last) * 0.8));
  };
  const heading = ease(frame / (0.6 * fps));
  const fadeOut = 1 - ease((frame - (durationInFrames - 10)) / 10);
  const portrait = aspect === 'portrait';
  const W = c.right - c.left, gap = 36;
  const cardW = portrait ? W : (W - gap * 2) / 3;
  const cardH = portrait ? 200 : Math.min(c.bottom - c.top - 240, 460);
  return <div style={{position: 'absolute', inset: 0, opacity: fadeOut, background: theme.background}}>
    <Backdrop asset={media.background ?? media.scene} frame={frame} background={theme.background} />
    <div style={{position: 'absolute', left: c.left, top: c.top, fontSize: portrait ? 64 : 76, fontWeight: 800, color: theme.text,
      opacity: heading, transform: `translateY(${(1 - heading) * 24}px)`}}>{highlighted(String(params.heading ?? ''), theme.accent)}</div>
    {points.map((text, i) => {
      const show = reveal(i);
      const x = portrait ? c.left : c.left + i * (cardW + gap);
      const y = portrait ? c.top + 200 + i * 230 : c.top + 220;
      // 当前正在讲的要点加亮边框。
      const active = show > 0 && (i === points.length - 1 || reveal(i + 1) === 0);
      const picture = media[`point-${i + 1}`];
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: cardW, height: cardH, boxSizing: 'border-box',
        padding: 40, borderRadius: 28, background: '#ffffff08', border: `2px solid ${active ? theme.accent : theme.muted + '44'}`,
        opacity: 0.15 + 0.85 * show, transform: `translateY(${(1 - show) * 50}px)`, ...(picture ? {overflow: 'hidden'} : {})}}>
        {picture ? <div style={portrait ? {position: 'absolute', right: 30, top: 30, width: cardH - 60, height: cardH - 60, borderRadius: 16, overflow: 'hidden'}
          : {height: cardH * .34, marginBottom: 22, borderRadius: 16, overflow: 'hidden'}}><Media asset={picture} frame={frame} fit={picture.fit ?? 'cover'} /></div> : null}
        <div style={{fontSize: picture && !portrait ? 56 : 72, fontWeight: 900, color: theme.accent, lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div>
        <div style={{fontSize: portrait ? 44 : 48, fontWeight: 800, color: theme.text, marginTop: portrait ? 14 : picture ? 18 : 60, lineHeight: 1.3,
          ...(picture && portrait ? {marginRight: cardH - 40} : {})}}>{highlighted(text, theme.accent)}</div>
      </div>;
    })}
  </div>;
}
