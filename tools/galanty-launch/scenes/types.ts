export type Metric = {value: number; label: string; source: string; items?: string[]};
export type Milestone = {date: string; label: string; source: string};
export type Point = {text: string; source: string; detail?: string; command?: string; metric?: Metric; scale?: {count: number; label: string}};
export type Brief = {
  language?: 'zh' | 'en'; onScreenCopy?: string[];
  productName: string; tagline: string; installCommand?: string; sellingPoints: Point[];
  milestones?: Milestone[]; demoLabel?: string; terminalLines?: string[]; codeCaption?: string; gridItemLabel?: string; revealCaption?: string; timelineCaption?: string;
  palette: {background: string; foreground: string; accent: string};
  musicStyle: string; seed: number; durationSeconds: number;
};
export type Scene = {id: string; primitive: string; text: string; source: string | null; from: number; durationInFrames: number; section: string; detail?: string; command?: string; metric?: Metric; scale?: {count: number; label: string}; ending?: boolean};
export type Project = {version: number; fps: number; width: number; height: number; durationInFrames: number; brief: Brief; music: string; grid: {bpm: number}; scenes: Scene[]};
