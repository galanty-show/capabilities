import React, {useLayoutEffect, useRef} from 'react';
import type {SceneInput} from '@talkframe/scene';

/*
 * 改编自 remocn「ReleaseTeaser」模板（https://github.com/Remocn/remocn ，提交 fd2d3010a818，
 * registry/remocn-templates/release-teaser/），MIT License，Copyright (c) 2026 Remocn。许可原文见样片目录 LICENSE.upstream.txt。
 * 保留原作的运动设计：320° 带倒角实体圆环（画布逐面着色、主光随时间转动、边缘高光）、从中心向两侧的逐字对焦（透明度 + 模糊 + 位移）、
 * 960×540 逻辑画布、六段时间表（原作 59.94 fps 的 0/104/208/326/446/610/960 帧）与最后的品牌落版。
 * 文影的改动：文字改为中文并进 meta.params；品牌改为虚构的「栖光 2」；配色读 props.theme（播放页可换色）；
 * 去掉 @fontsource/inter（改用宿主字体）、logo 图片槽与 remotion 的 Interactive/Img；拆成六幕共用一个模块，按全片时钟连续；
 * 片中文字按 30 fps 对齐原作时间表。
 */
export const meta = {
  title: '发布预告（改编自 remocn ReleaseTeaser）',
  description: '暗场实体圆环缓慢旋转，五句短句从中心向两侧逐字对焦，最后圆环归位、品牌落版。六幕共用本模块，props.shot 选段。',
  params: {
    text: {label: '这一句（可用换行分两行）', type: 'longtext', default: '从一个念头开始'},
    brandName: {label: '品牌名', type: 'text', default: '栖光'},
    release: {label: '版本号（留空不显示）', type: 'text', default: '2'},
    tagline: {label: '落版标语', type: 'text', default: '下一章，从这里开始。'},
    lightIntensity: {label: '圆环光强（0～2）', type: 'number', default: 1},
    shot: '段号 0～5（0～4 为短句，5 为落版）；改结构时用',
    f0: '本幕在全片的起始帧（30 fps），圆环按全片时钟连续转动',
  },
};

type Vec3 = [number, number, number];
type Face = {vertices: Vec3[]; normal: Vec3; center: Vec3; bevel: boolean; edgeNormals?: [Vec3, Vec3]};

// ---- 原作 59.94 fps 时间表（motion.ts） ----
const PICTURE_FPS = 60000 / 1001;
const CUTS = [0, 104, 208, 326, 446, 610, 960];
const HEX = /^#[0-9a-f]{6}$/i;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const bezier = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  // 三次贝塞尔缓动（与 remotion Easing.bezier 同一定义），二分求 t。
  const cx = (t: number) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
  const cy = (t: number) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {const mid = (lo + hi) / 2; if (cx(mid) < x) lo = mid; else hi = mid;}
  return cy((lo + hi) / 2);
};
const curve = bezier(0.5, 0, 0.2, 1);
const ease = (f: number, from: number, to: number) => curve(clamp((f - from) / (to - from)));
const progress = (f: number, from: number, to: number) => clamp((f - from) / (to - from));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- 几何（geometry.ts 原样移植） ----
const normalize = (v: Vec3): Vec3 => {const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l];};
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function rotate(v: Vec3, rx: number, ry: number, rz: number): Vec3 {
  const y = v[1] * Math.cos(rx) - v[2] * Math.sin(rx), z = v[1] * Math.sin(rx) + v[2] * Math.cos(rx);
  const x = v[0] * Math.cos(ry) + z * Math.sin(ry), depth = -v[0] * Math.sin(ry) + z * Math.cos(ry);
  return [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz), depth];
}
function rotator(rx: number, ry: number, rz: number) {
  const x = rotate([1, 0, 0], rx, ry, rz), y = rotate([0, 1, 0], rx, ry, rz), z = rotate([0, 0, 1], rx, ry, rz);
  return (v: Vec3): Vec3 => [x[0] * v[0] + y[0] * v[1] + z[0] * v[2], x[1] * v[0] + y[1] * v[1] + z[1] * v[2], x[2] * v[0] + y[2] * v[1] + z[2] * v[2]];
}
const project = (v: Vec3, s: number, x: number, y: number): [number, number] => {
  const p = 1100 / Math.max(300, 1100 - v[2] * s);
  return [x + v[0] * s * p, y + v[1] * s * p];
};
function face(vertices: Vec3[], bevel: boolean): Face {
  return {vertices, bevel, normal: normalize(cross(sub(vertices[1], vertices[0]), sub(vertices[2], vertices[0]))),
    center: vertices.reduce<Vec3>((s, p) => [s[0] + p[0] / vertices.length, s[1] + p[1] / vertices.length, s[2] + p[2] / vertices.length], [0, 0, 0])};
}
/** 320° 实体圆环，开口 40°，八条倒角边。 */
function createRing(count = 96): Face[] {
  const profile = [[144, 32], [210, 32], [220, 22], [220, -22], [210, -32], [144, -32], [134, -22], [134, 22]];
  const section = (i: number): Vec3[] => {
    const a = ((-18 + (i / count) * 320) * Math.PI) / 180;
    return profile.map(([r, z]) => [r * Math.cos(a), r * Math.sin(a), z] as Vec3);
  };
  const faces: Face[] = [], half = ((160 / count) * Math.PI) / 180;
  for (let i = 0; i < count; i++) {
    const a = section(i), b = section(i + 1);
    for (let j = 0; j < profile.length; j++) {
      const n = (j + 1) % profile.length, q = face([a[j], a[n], b[n], b[j]], j % 2 === 1);
      q.edgeNormals = [rotate(q.normal, 0, 0, -half), rotate(q.normal, 0, 0, half)];
      faces.push(q);
    }
  }
  faces.push(face(section(0).reverse(), false), face(section(count), false));
  return faces;
}
const RING = createRing();

/** 圆环姿态（motion.ts ringPose）：前 610 帧缓慢下移、缩小，602～702 帧归位到落版位置。 */
function ringPose(f0: number) {
  const f = Math.max(0, Math.min(959, f0));
  const travel = progress(f, 0, 610), reveal = ease(f, 602, 702);
  return {
    x: 480 + (1 - reveal) * (18 - travel * 26),
    y: (-200 + travel * 100) * (1 - reveal) + 270 * reveal,
    scale: (2.78 - travel * 0.32) * (1 - reveal) + 1.08 * reveal,
    rx: (0.4 - travel * 0.1) * (1 - reveal) + 0.14 * reveal,
    ry: (-0.55 + travel * 0.12) * (1 - reveal) - 0.16 * reveal,
    rz: (-0.42 + travel * 0.22) * (1 - reveal) - 0.13 * reveal,
    lightAngle: -0.8 + (f / 960) * 1.1,
    opacity: ease(f, 0, 48) * (1 - ease(f, 858, 946)),
  };
}
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

function Ring({f, accent, surface, intensity}: {f: number; accent: string; surface: string; intensity: number}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, 1920, 1080);
    ctx.scale(2, 2);
    const A = rgb(accent), S = rgb(surface), pose = ringPose(f), turn = rotator(pose.rx, pose.ry, pose.rz);
    const key = normalize([Math.cos(pose.lightAngle) * 0.95, 0.6, 0.3]), rim = normalize([-0.8, -0.5, 0.18]);
    const half = normalize([key[0], key[1], key[2] + 1]);
    const faces = RING.map(face => ({...face, normal: turn(face.normal), edgeNormals: face.edgeNormals?.map(turn) as [Vec3, Vec3] | undefined,
      center: turn(face.center), vertices: face.vertices.map(turn)})).sort((a, b) => a.center[2] - b.center[2]);
    for (const item of faces) {
      if (dot(item.normal, normalize([-item.center[0], -item.center[1], 1100 / pose.scale - item.center[2]])) <= 0) continue;
      const shade = (n: Vec3) => {
        const diffuse = Math.max(0, dot(n, key)), rimLight = Math.max(0, dot(n, rim));
        const spec = Math.max(0, dot(n, half)) ** (item.bevel ? 26 : 48), k = intensity * pose.opacity;
        return `rgb(${S.map((c, i) => Math.round(Math.min(255, c * 0.19 + k * (A[i] * (diffuse ** 3 * 0.36 + rimLight ** 6 * 0.16) + 180 * spec * 0.68)))).join(',')})`;
      };
      const pts = item.vertices.map(v => project(v, pose.scale, pose.x, pose.y));
      ctx.beginPath(); ctx.moveTo(...pts[0]); for (const p of pts.slice(1)) ctx.lineTo(...p); ctx.closePath();
      if (item.edgeNormals) {
        const g = ctx.createLinearGradient((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2, (pts[2][0] + pts[3][0]) / 2, (pts[2][1] + pts[3][1]) / 2);
        g.addColorStop(0, shade(item.edgeNormals[0])); g.addColorStop(1, shade(item.edgeNormals[1]));
        ctx.fillStyle = g;
      } else ctx.fillStyle = shade(item.normal);
      ctx.fill();
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.45; ctx.stroke(); // 亚像素压缝，避免面与面之间的细线
    }
  }, [f, accent, surface, intensity]);
  return <canvas ref={canvas} width={1920} height={1080} style={{position: 'absolute', inset: 0, width: 960, height: 540, opacity: ringPose(f).opacity}} />;
}

// ---- 文字（motion.ts 的字宽估算、自适应字号与“中心向两侧”的逐字对焦） ----
const graphemes = (text: string) => Array.from(new Intl.Segmenter('zh', {granularity: 'grapheme'}).segment(text), p => p.segment);
const units = (text: string) => graphemes(text).reduce((s, c) => s + (/\s/.test(c) ? 0.3 : /[ilI.,'!|]/.test(c) ? 0.29 : /[MW@%]/.test(c) ? 0.98 : (c.codePointAt(0) ?? 0) > 0x024f ? 1.02 : 0.63), 0);
const fitText = (text: string, max = 48, width = 808) => {
  const lines = text.split('\n');
  return Math.min(max, width / Math.max(1, ...lines.map(units)), 220 / (Math.max(1, lines.length) * 1.15));
};
function charState(f: number, end: number, i: number, n: number) {
  const d = n <= 1 ? 0 : Math.abs(i - (n - 1) / 2) / ((n - 1) / 2);
  const enter = ease(f, d * 7, d * 7 + 18), exit = ease(f, end - 16 - d * 5, end - 1 - d * 5);
  return {opacity: enter * (1 - exit), blur: (1 - enter) * 5 + exit * 3, y: (1 - enter) * 2 - exit * 1.5};
}
const OrbitMark = ({color, size}: {color: string; size: number}) => <svg width={size} height={size} viewBox="-240 -240 480 480" fill="none">
  <path d="M209.23 -67.98 A220 220 0 1 1 116.58 -186.57 L71.01 -113.64 A134 134 0 1 0 127.44 -41.41 Z" fill={color} />
</svg>;

export default function Scene(props: SceneInput) {
  const th = props.theme ?? ({} as SceneInput['theme']);
  const bg = HEX.test(th.background) ? th.background : '#050709';
  const fg = HEX.test(th.text) ? th.text : '#F2F5F7';
  const muted = HEX.test(th.muted) ? th.muted : '#A4ADB5';
  const accent = HEX.test(th.accent) ? th.accent : '#9BC8DD';
  const surface = '#151C22';
  const p = props.params;
  const shot = Math.max(0, Math.min(5, Math.round(Number(p.shot ?? 0))));
  const intensity = Number.isFinite(Number(p.lightIntensity)) ? Math.max(0, Math.min(2, Number(p.lightIntensity))) : 1;
  // 全片时钟换算成原作 59.94 fps 的“画面帧”，圆环跨幕连续。
  const g = ((Number(p.f0 ?? 0) + props.frame) / props.fps) * PICTURE_FPS;
  const local = g - CUTS[shot], duration = CUTS[shot + 1] - CUTS[shot];
  const scale = Math.min(props.width / 960, props.height / 540);
  const font = props.fonts?.text ?? 'system-ui, sans-serif';

  let content: React.ReactNode;
  if (shot < 5) {
    const text = String(p.text ?? '从一个念头开始');
    content = <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      fontSize: fitText(text), fontWeight: 500, lineHeight: 1.13, color: fg, letterSpacing: '0.02em', transform: `scale(${lerp(0.99, 1.025, clamp(local / duration))})`}}>
      {text.split('\n').map((line, li) => {
        const chars = graphemes(line);
        return <div key={li} style={{whiteSpace: 'pre', textAlign: 'center', minHeight: '1.13em'}}>
          {chars.map((c, i) => {const s = charState(local, duration, i, chars.length);
            return <span key={i} style={{display: 'inline-block', opacity: s.opacity, filter: s.blur > 0.08 ? `blur(${s.blur}px)` : undefined, transform: `translateY(${s.y}px)`}}>{c}</span>;})}
        </div>;
      })}
    </div>;
  } else {
    const brand = String(p.brandName ?? '栖光').trim() || '栖光';
    const release = String(p.release ?? '2').trim();
    const tagline = String(p.tagline ?? '下一章，从这里开始。');
    const title = `${brand}${release ? ` ${release}` : ''}`;
    const reveal = ease(local, 0, 32);
    content = <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: reveal, filter: reveal < 0.99 ? `blur(${(1 - reveal) * 6}px)` : undefined, transform: `scale(${lerp(0.97, 1.03, clamp(local / 350))})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
        <OrbitMark size={34} color={accent} />
        <div style={{fontSize: fitText(title, 70, 750), fontWeight: 600, lineHeight: 1, color: fg, whiteSpace: 'pre', letterSpacing: '0.02em'}}>{title}</div>
      </div>
      <div style={{fontSize: fitText(tagline, 20, 740), lineHeight: 1.3, color: muted, whiteSpace: 'pre', opacity: ease(local, 8, 40), letterSpacing: '0.08em'}}>{tagline}</div>
    </div>;
  }

  return <div style={{position: 'absolute', inset: 0, background: bg, overflow: 'hidden', fontFamily: font, WebkitFontSmoothing: 'antialiased'}}>
    <div style={{position: 'absolute', left: (props.width - 960 * scale) / 2, top: (props.height - 540 * scale) / 2, width: 960, height: 540,
      transform: `scale(${scale})`, transformOrigin: '0 0', overflow: 'hidden'}}>
      <Ring f={g} accent={accent} surface={surface} intensity={intensity} />
      {content}
    </div>
  </div>;
}
