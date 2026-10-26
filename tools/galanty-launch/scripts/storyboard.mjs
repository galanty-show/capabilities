const STYLES = new Set(['electronic', 'lofi', 'epic']);
export const FPS = 30;
export const PRIMITIVES = ['LaunchTerminal', 'ImpactWord', 'ToolCounter', 'MilestoneTimeline', 'FullCode', 'ScaleGrid', 'PixelLogo'];
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;

export function validateBrief(value) {
  if (!value || typeof value !== 'object') throw new Error('brief must be an object');
  for (const key of ['productName', 'tagline']) if (!nonempty(value[key])) throw new Error(`${key} is required`);
  if (!Array.isArray(value.sellingPoints) || value.sellingPoints.length === 0) throw new Error('sellingPoints must contain at least one sourced claim');
  value.sellingPoints.forEach((point, index) => {
    if (!nonempty(point?.text)) throw new Error(`sellingPoints[${index}].text is required`);
    if (!nonempty(point?.source)) throw new Error(`sellingPoints[${index}].source is required: cite a document section, repository file or URL; do not invent claims`);
  });
  for (const key of ['demoLabel', 'codeCaption', 'gridItemLabel', 'revealCaption', 'timelineCaption']) {
    if (value[key] !== undefined && !nonempty(value[key])) throw new Error(`${key} must be a nonempty string when supplied`);
  }
  if (value.terminalLines !== undefined && (!Array.isArray(value.terminalLines) || value.terminalLines.length > 2 || value.terminalLines.some(line => !nonempty(line)))) throw new Error('terminalLines must contain up to two nonempty strings');
  for (const [i, point] of value.sellingPoints.entries()) {
    if (point.metric && (!Number.isFinite(point.metric.value) || point.metric.value <= 0 || !nonempty(point.metric.label) || !nonempty(point.metric.source))) throw new Error(`sellingPoints[${i}].metric needs a positive value, label and source`);
    if (point.scale && (!Number.isInteger(point.scale.count) || point.scale.count < 2 || point.scale.count > 36 || !nonempty(point.scale.label))) throw new Error(`sellingPoints[${i}].scale needs 2–36 windows and a label identifying illustrative workloads`);
  }
  if (value.milestones !== undefined && (!Array.isArray(value.milestones) || value.milestones.some(m => !nonempty(m.date) || !nonempty(m.label) || !nonempty(m.source)))) throw new Error('milestones require date, label and source');
  for (const key of ['background', 'foreground', 'accent']) {
    if (!/^#[\da-f]{6}$/i.test(value.palette?.[key] ?? '')) throw new Error(`palette.${key} must be a six-digit hex color`);
  }
  if (!STYLES.has(value.musicStyle)) throw new Error('musicStyle must be electronic, lofi or epic');
  if (!Number.isFinite(value.durationSeconds) || value.durationSeconds < 4 || value.durationSeconds > 300) throw new Error('durationSeconds must be 4–300 (audio analysis needs at least 4 seconds)');
  if (!Number.isSafeInteger(value.seed)) throw new Error('seed must be a safe integer');
  return value;
}

// Han characters, digit groups and Latin words each count as one readable unit.
export function readingUnits(text) { return (text.match(/\p{Script=Han}|\p{N}+|[\p{L}\p{M}]+/gu) ?? []).length; }
export function holdBudget(text, bpm) {
  return {cutSeconds: 4 * 60 / bpm, swapSeconds: 2 * 60 / bpm, readSeconds: .25 + .1 * readingUnits(text), revealSeconds: .45};
}

export function planStoryboard(input, grid) {
  const brief = validateBrief(input);
  if (!Number.isFinite(grid?.bpm) || grid.bpm <= 0 || !Array.isArray(grid.beats) || !grid.beats.length || !Array.isArray(grid.sections)) throw new Error('Invalid music grid');
  const durationInFrames = Math.round(brief.durationSeconds * FPS);
  const points = brief.sellingPoints;
  const pick = (i) => points[i % points.length];
  const metric = points.find(p => p.metric);
  const scale = points.find(p => p.scale);
  const intro = [{primitive: 'LaunchTerminal', text: brief.productName, source: null, command: brief.installCommand}, {primitive: 'ImpactWord', ...pick(0)}];
  const build = [
    ...(metric ? [{primitive: 'ToolCounter', ...metric}] : [{primitive: 'ImpactWord', ...pick(0)}]),
    ...(brief.milestones?.length ? [{primitive: 'MilestoneTimeline', text: 'Built over time', source: brief.milestones[0].source}] : [{primitive: 'FullCode', ...pick(0)}]),
    {primitive: 'FullCode', ...pick(points.length - 1)},
  ];
  // The strongest three compositions repeat on TWO beats, versus FOUR in build.
  // No numeric/scale/history scene is inferred from an unsourced sentence.
  const drop = [{primitive: 'PixelLogo', text: brief.productName, source: null},
    scale ? {primitive: 'ScaleGrid', ...scale} : {primitive: 'FullCode', ...pick(1)},
    ...points.map(p => ({primitive: 'ImpactWord', ...p}))];
  const scenes = [];
  const rawSections = grid.sections.filter(s => Number.isFinite(s.start) && s.start < brief.durationSeconds);
  // A very short film cannot sustain four musical sections. Condense to one
  // claim and a closing mark on a representable beat instead of unreadable cuts.
  const validBeats = grid.beats.filter(t => t > 0 && t < brief.durationSeconds && Math.abs(Math.round(t * FPS) / FPS - t) <= .0100001);
  const closingBeat = [...validBeats].sort((a, b) => Math.abs(a - brief.durationSeconds * .75) - Math.abs(b - brief.durationSeconds * .75))[0];
  const sections = brief.durationSeconds < 8 && closingBeat ? [{name: 'build', start: 0}, {name: 'outro', start: closingBeat}] : rawSections;
  if (brief.durationSeconds < 8) build.splice(0, build.length, {primitive: 'ImpactWord', ...pick(0)});
  for (const [sectionIndex, section] of sections.entries()) {
    const from = sectionIndex === 0 ? 0 : Math.round(section.start * FPS);
    const end = Math.min(durationInFrames, Math.round((sections[sectionIndex + 1]?.start ?? brief.durationSeconds) * FPS));
    if (end <= from) continue;
    const strong = ['drop', 'climax'].includes(section.name);
    const ending = section.name === 'outro';
    const opening = section.name === 'intro';
    const cadence = strong ? 2 : opening ? 8 : 4;
    const pool = ending ? [{primitive: 'PixelLogo', text: brief.tagline, source: null, ending: true}] : strong ? drop : opening ? intro : build;
    const beats = grid.beats.filter(t => t > from / FPS + .01 && t < end / FPS - .01);
    // Use section-relative beats; preserve the last phrase rather than create a tiny cut.
    const boundaries = [from];
    if (!ending) for (let i = cadence - 1; i < beats.length; i += cadence) {
      const frame = Math.round(beats[i] * FPS);
      if (end - frame >= cadence * 60 / grid.bpm * FPS * .6) boundaries.push(frame);
    }
    boundaries.push(end);
    for (let i = 0; i < boundaries.length - 1; i++) {
      const shot = pool[i % pool.length];
      scenes.push({id: `scene-${scenes.length + 1}`, ...shot, from: boundaries[i], durationInFrames: boundaries[i + 1] - boundaries[i], section: section.name,
        budget: {...holdBudget(shot.text, grid.bpm), cutSeconds: cadence * 60 / grid.bpm}, cadenceBeats: ending ? null : cadence});
    }
  }
  if (!scenes.length || scenes[0].from !== 0 || scenes.at(-1).from + scenes.at(-1).durationInFrames !== durationInFrames) throw new Error('Music sections must cover the movie');
  return {version: 2, fps: FPS, width: 1920, height: 1080, durationInFrames, brief, music: 'generated/music.wav', grid, scenes};
}

export function pacingAdvice(plan) {
  const warnings = [];
  if (plan.brief.durationSeconds < 20 || plan.brief.durationSeconds > 45) warnings.push({code: 'DURATION_RECOMMENDATION', message: 'Launch films usually fit 20–45 seconds; keep your chosen duration if intentional.'});
  for (const s of plan.scenes) {
    const actual = s.durationInFrames / plan.fps;
    const recommended = Math.max(s.budget.cutSeconds, s.budget.readSeconds + s.budget.revealSeconds);
    if (actual < recommended) warnings.push({scene: s.id, code: 'HOLD_BUDGET', actualSeconds: actual, recommendedSeconds: recommended, message: 'Section cadence and readable-copy budget are recommendations; shorten copy or lengthen this scene if needed.'});
  }
  return warnings;
}

export function beatResiduals(plan) {
  const values = plan.scenes.slice(1).map((s) => Math.min(...plan.grid.beats.map((b) => Math.abs(s.from / plan.fps - b))) * 1000).sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  return {milliseconds: values, medianMs: values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2};
}
