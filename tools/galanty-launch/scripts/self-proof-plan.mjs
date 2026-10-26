// Authored editorial plan for Galanty's own film; the general starter stays neutral.
import {validateBrief, holdBudget, FPS} from './storyboard.mjs';
export const SELF_PROOF_BEATS = [0, 8, 12, 20, 28, 36, 44, 52, 56];
export function selfProofPlan(brief, grid) {
  validateBrief(brief);
  if (brief.durationSeconds !== 30 || grid.bpm !== 128) throw new Error('This authored film uses a 30-second, 128 BPM score');
  if (!['zh', 'en'].includes(brief.language) || brief.sellingPoints.length !== 9) throw new Error('Self-proof film needs zh/en and nine sourced shots');
  const starts = SELF_PROOF_BEATS.map(beat => Math.round(beat * 60 / grid.bpm * FPS));
  const scenes = starts.map((from, i) => ({id: `self-proof-${i + 1}`, primitive: 'SelfProof', ...brief.sellingPoints[i], from,
    durationInFrames: (starts[i + 1] ?? 900) - from, section: i < 2 ? 'intro' : i < 4 ? 'build' : i < 8 ? 'drop' : 'outro',
    budget: {...holdBudget(brief.sellingPoints[i].text, grid.bpm), cutSeconds: ((starts[i + 1] ?? 900) - from) / FPS}, ending: i === 8}));
  return {version: 2, fps: FPS, width: 1920, height: 1080, durationInFrames: 900, brief, music: 'generated/music.wav', grid, scenes};
}
