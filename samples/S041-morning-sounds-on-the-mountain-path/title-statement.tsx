// 模板：大字陈述 + 副标题。第 1 句落下标题，第 2 句（没有就 1.2 秒后）浮出副标题。
// params: {kicker?: string, title: string, subtitle?: string}
import {spring} from 'remotion';
import type {SceneInput} from '@talkframe/scene';


// 缓出：把 progress 的线性 0→1 变成先快后慢。
const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export default function TitleStatement({frame, fps, durationInFrames, aspect, theme, layout, sentences, progress, params}: SceneInput) {
  const c = layout.content;
  const first = sentences[0]?.id ?? '';
  const second = sentences[1]?.id;
  const title = ease(progress(first));
  const subtitle = ease(second ? progress(second) : progress(first, 1.2));
  // 标题弹性放大：spring 只依赖 frame/fps，逐帧确定。
  const pop = spring({frame: frame - Math.round((sentences[0]?.start ?? 0) * fps), fps, config: {damping: 14}});
  const fadeOut = 1 - ease((frame - (durationInFrames - 10)) / 10);
  const size = aspect === 'portrait' ? 104 : 132;
  return <div style={{position: 'absolute', inset: 0, opacity: fadeOut,
    background: `radial-gradient(circle at 70% 35%, ${theme.accent}26, transparent 45%), ${theme.background}`}}>
    <div style={{position: 'absolute', left: c.left, top: c.top, height: c.bottom - c.top,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', width: c.right - c.left}}>
      {params.kicker ? <div style={{fontSize: 30, color: theme.accent, letterSpacing: '.2em', fontWeight: 700, opacity: title}}>{String(params.kicker)}</div> : null}
      <div style={{fontSize: size, lineHeight: 1.1, fontWeight: 900, color: theme.text, marginTop: 18,
        opacity: title, transform: `translateY(${(1 - title) * 40}px) scale(${0.94 + 0.06 * Math.min(1, pop)})`, transformOrigin: 'left center'}}>
        {String(params.title ?? '')}
      </div>
      <div style={{width: 120 * title, height: 8, borderRadius: 4, background: theme.accent, marginTop: 34}} />
      {params.subtitle ? <div style={{fontSize: aspect === 'portrait' ? 40 : 46, color: theme.muted, marginTop: 30, lineHeight: 1.4,
        opacity: subtitle, transform: `translateY(${(1 - subtitle) * 24}px)`}}>{String(params.subtitle)}</div> : null}
    </div>
  </div>;
}
