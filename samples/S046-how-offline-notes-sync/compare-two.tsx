// 模板：左右对比。左卡跟第 1 句，右卡跟第 2 句（没有就 1.5 秒后）；每卡要点在该句内错峰 0.4 秒。
// params: {heading: string, left: {label, title, items[]}, right: {label, title, items[]}, leftColor?, rightColor?}
// 素材槽：left / right 两卡各一张图（标题下方）；background（或 scene）整幅背景。
import {Media, assets as slots, type SceneAsset, type SceneInput} from '@talkframe/scene';
// 背景槽：整幅铺满（cover）后压一层主题底色渐变，文字始终可读；图片、SVG、视频都可以。
const Backdrop = ({asset, frame, background, strength = .62}: {asset?: SceneAsset; frame: number; background: string; strength?: number}) => asset
  ? <div style={{position: 'absolute', inset: 0}}><Media asset={asset} frame={frame} fit={asset.fit ?? 'cover'} />
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, ${background} 0%, ${background}${Math.round(strength * 255).toString(16).padStart(2, '0')} 48%, ${background}88 100%)`}} /></div>
  : null;
type Side = {label?: string; title?: string; items?: string[]};

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export default function CompareTwo(props: SceneInput) {
  const {frame, fps, durationInFrames, aspect, theme, layout, sentences, progress, params} = props;
  const c = layout.content, media = slots(props);
  const portrait = aspect === 'portrait';
  const W = c.right - c.left, H = c.bottom - c.top, gap = 48;
  const sides = [params.left as Side ?? {}, params.right as Side ?? {}];
  const colors = [String(params.leftColor ?? theme.muted), String(params.rightColor ?? theme.accent)];
  // 第 k 张卡的揭示：有第 2 句就跟句子，否则从第 1 句推迟 1.5 秒。
  const cardAt = (k: number, offset = 0) => ease(k === 0 || sentences[1]
    ? progress(sentences[k]?.id ?? '', offset) : progress(sentences[0]?.id ?? '', 1.5 + offset));
  const heading = ease(frame / (0.6 * fps));
  const fadeOut = 1 - ease((frame - (durationInFrames - 10)) / 10);
  const cardW = portrait ? W : (W - gap) / 2;
  const cardH = portrait ? (H - 180 - gap) / 2 : H - 190;
  return <div style={{position: 'absolute', inset: 0, opacity: fadeOut, background: theme.background}}>
    <Backdrop asset={media.background ?? media.scene} frame={frame} background={theme.background} />
    <div style={{position: 'absolute', left: c.left, top: c.top, fontSize: portrait ? 64 : 76, fontWeight: 800, color: theme.text, opacity: heading}}>
      {String(params.heading ?? '')}</div>
    {sides.map((side, k) => {
      const show = cardAt(k);
      const x = portrait ? c.left : c.left + k * (cardW + gap);
      const y = portrait ? c.top + 180 + k * (cardH + gap) : c.top + 190;
      return <div key={k} style={{position: 'absolute', left: x, top: y, width: cardW, height: cardH, boxSizing: 'border-box', padding: 44,
        borderRadius: 30, background: '#ffffff08', border: `2px solid ${colors[k]}99`, opacity: 0.1 + 0.9 * show, transform: `translateY(${(1 - show) * 40}px)`}}>
        <div style={{fontSize: 28, color: colors[k], letterSpacing: '.16em', fontWeight: 700}}>{side.label ?? ''}</div>
        <div style={{fontSize: portrait ? 52 : 60, color: theme.text, fontWeight: 900, marginTop: 12}}>{side.title ?? ''}</div>
        {media[k ? 'right' : 'left'] ? <div style={{height: cardH * (portrait ? .34 : .3), marginTop: 24, borderRadius: 18, overflow: 'hidden'}}>
          <Media asset={media[k ? 'right' : 'left']} frame={frame} /></div> : null}
        {(side.items ?? []).map((item, i) => {
          const line = cardAt(k, 0.3 + i * 0.4);
          return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: i ? 20 : 40, opacity: line, transform: `translateX(${(1 - line) * -20}px)`}}>
            <div style={{width: 14, height: 14, borderRadius: 7, background: colors[k]}} />
            <div style={{fontSize: 38, color: theme.text}}>{item}</div>
          </div>;
        })}
      </div>;
    })}
  </div>;
}
