// 模板：流程四步。步骤按句子均分（4 步 2 句 → 每句两步，句内错峰 1 秒）；进度线平滑追到当前步。
// params: {heading: string, steps: string[]}（建议 4 步，每步 ≤ 8 字）
import type {SceneInput} from '@talkframe/scene';

const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export default function ProcessSteps({frame, fps, durationInFrames, aspect, theme, layout, sentences, progress, params}: SceneInput) {
  const c = layout.content;
  const steps = Array.isArray(params.steps) ? params.steps.map(String) : [];
  const perSentence = Math.max(1, Math.ceil(steps.length / Math.max(1, sentences.length)));
  // 第 i 步属于第 floor(i / perSentence) 句，句内第 (i % perSentence) 个，间隔 1 秒。
  const shown = steps.map((_, i) => ease(progress(sentences[Math.floor(i / perSentence)]?.id ?? '', (i % perSentence) * 1)));
  const heading = ease(frame / (0.6 * fps));
  const fadeOut = 1 - ease((frame - (durationInFrames - 10)) / 10);
  const portrait = aspect === 'portrait';
  const W = c.right - c.left;
  const n = Math.max(1, steps.length);
  const pos = (i: number) => portrait ? {x: c.left + 70, y: c.top + 240 + i * 190} : {x: c.left + (W / n) * (i + 0.5), y: c.top + 380};
  const reached = shown.reduce((sum, value) => sum + value, 0) - 1;
  const end = pos(n - 1), start = pos(0);
  return <div style={{position: 'absolute', inset: 0, opacity: fadeOut, background: theme.background}}>
    <div style={{position: 'absolute', left: c.left, top: c.top, fontSize: portrait ? 64 : 76, fontWeight: 800, color: theme.text, opacity: heading}}>
      {String(params.heading ?? '')}</div>
    {/* 底轨与进度线：横屏走 x，竖屏走 y */}
    <div style={{position: 'absolute', left: start.x - 3, top: start.y - 3, width: portrait ? 6 : end.x - start.x, height: portrait ? end.y - start.y : 6, background: `${theme.muted}33`, borderRadius: 3}} />
    <div style={{position: 'absolute', left: start.x - 3, top: start.y - 3, borderRadius: 3, background: theme.accent,
      width: portrait ? 6 : Math.max(0, reached) / Math.max(1, n - 1) * (end.x - start.x), height: portrait ? Math.max(0, reached) / Math.max(1, n - 1) * (end.y - start.y) : 6}} />
    {steps.map((text, i) => {
      const {x, y} = pos(i);
      const on = shown[i];
      return <div key={i}>
        <div style={{position: 'absolute', left: x - 54, top: y - 54, width: 108, height: 108, borderRadius: 54, boxSizing: 'border-box',
          background: on > 0.5 ? theme.accent : theme.background, border: `4px solid ${on > 0 ? theme.accent : theme.muted + '66'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, fontWeight: 900,
          color: on > 0.5 ? theme.background : theme.muted, transform: `scale(${0.75 + 0.25 * on})`}}>{i + 1}</div>
        <div style={{position: 'absolute', left: portrait ? x + 90 : x - W / n / 2, top: portrait ? y - 30 : y + 90, width: portrait ? W - 160 : W / n,
          textAlign: portrait ? 'left' : 'center', fontSize: 42, fontWeight: 800, color: theme.text, opacity: 0.2 + 0.8 * on}}>{text}</div>
      </div>;
    })}
  </div>;
}
