import React from 'react';
import {Media, clamp, easeInOut, seeded, noise2d, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Legend of Sleepy Hollow》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx：
// 只带上该幕真正用到的函数，并内联该幕用到的矢量剪影（SIL）；样片版另把底图内联进 MEDIA。
// 画面只由帧号决定：随机感全用 seeded()/noise2d()，不读时钟、不用 CSS filter（滤镜在缩放运镜下两次渲染不一致）。

const W = 1920, H = 1080;
const INK = '#07090d', PAPER = '#efe6d2', AMBER = '#e8862a', EMBER = '#ffb45a', MOON = '#ebe8d8', FROST = '#cfdbe6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// 随包样片（S109）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const SIL: Record<string, {w: number; h: number; d: string}> = {"horseman":{"w":1405,"h":1000,"d":"M869 1 872 0 901 16 932 42 906 63 927 86 907 110 908 119 904 154 908 166 906 174 913 181 921 183 940 196 946 195 963 205 965 209 979 193 964 186 973 186 983 171 998 158 1030 147 1004 149 1018 143 999 133 1022 137 1064 111 1068 108 1066 105 1057 110 1066 101 1086 92 1101 90 1150 96 1131 81 1126 73 1142 83 1167 92 1198 86 1216 88 1231 96 1239 105 1253 87 1274 67 1277 69 1274 105 1286 96 1305 75 1302 104 1291 135 1302 145 1308 162 1333 191 1340 215 1363 254 1372 261 1375 273 1403 323 1405 337 1385 374 1377 379 1358 381 1338 380 1327 377 1322 372 1319 358 1307 348 1278 359 1249 365 1208 369 1175 366 1173 368 1140 436 1141 502 1122 551 1108 572 1152 603 1206 637 1214 652 1220 675 1219 689 1194 731 1163 810 1130 832 1105 860 1093 863 1064 879 1056 877 1054 860 1063 809 1074 805 1082 797 1099 802 1103 800 1108 790 1102 784 1107 783 1104 780 1114 774 1109 772 1132 759 1140 749 1164 700 1166 685 1164 677 1160 671 1142 663 1062 646 1061 648 1077 677 1109 722 1111 733 1104 764 1093 777 1037 800 985 833 975 836 965 835 940 826 897 822 893 818 858 806 854 801 856 797 882 773 913 756 932 764 938 782 944 784 944 772 950 776 952 771 979 776 1012 767 1048 747 1052 737 1045 727 994 689 954 653 919 632 914 626 913 617 888 617 881 623 862 626 847 625 841 617 831 618 818 623 802 623 794 621 790 612 748 606 701 593 681 646 658 683 652 702 652 720 659 731 676 743 757 783 768 792 780 817 797 838 809 863 807 871 811 900 811 910 804 913 787 907 761 893 744 879 745 873 741 863 748 848 738 849 732 855 726 840 724 845 721 842 712 823 706 817 668 791 645 780 630 776 637 805 656 832 688 871 715 895 732 921 769 947 772 955 797 988 796 994 779 1000 724 998 719 996 708 980 710 963 707 957 697 952 690 957 672 946 663 933 651 904 628 871 573 810 545 784 542 772 538 698 527 660 511 634 472 593 435 551 419 527 409 504 403 483 402 463 414 406 406 404 392 410 373 426 350 464 348 458 339 479 331 491 301 518 282 528 262 533 233 550 198 557 193 553 214 547 233 537 231 536 188 552 157 555 128 553 103 545 145 549 107 538 68 516 61 510 66 511 68 507 78 515 84 516 62 501 42 475 87 501 113 506 70 484 43 450 20 446 26 444 24 442 0 444 23 436 48 435 80 443 81 442 78 440 91 439 113 441 146 451 149 449 169 453 186 452 193 450 159 442 138 428 159 437 173 439 196 439 214 435 237 423 285 383 318 367 344 360 367 356 419 363 437 359 472 335 501 319 522 309 546 304 579 302 647 310 654 297 674 299 668 281 668 269 674 264 684 264 702 277 698 246 719 209 722 193 726 186 676 217 660 225 637 230 594 254 476 290 456 283 435 267 402 268 383 262 352 226 354 222 334 218 283 234 262 243 231 259 210 275 225 226 240 195 266 165 291 148 307 142 367 134 381 123 396 100 406 89 433 72 559 93 631 92 670 77 767 30 806 22 868 22 869 1ZM1087 100 1093 99 1120 108 1090 106 1070 110 1069 108 1076 102 1087 100ZM854 228 860 227 895 240 897 244 901 246 934 253 940 250 946 254 930 261 911 259 917 264 926 267 910 273 926 275 913 278 905 283 897 283 894 279 899 269 904 265 904 261 897 258 888 261 879 267 872 282 848 255 850 238 854 228ZM1222 302 1257 316 1274 326 1280 336 1292 338 1243 346 1187 341 1184 339 1198 314 1206 307 1222 302ZM1180 349 1214 353 1254 355 1200 358 1179 356 1180 349ZM315 487 318 487 315 491 303 504 280 521 278 520 315 487Z"}};
const SERIF = 'Baskerville, "Big Caslon", "Hoefler Text", Georgia, "Times New Roman", "Songti SC", "STSong", serif';
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 列表参数（文字或 {label, cue} 对象）。 */
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? [];
}
/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
/** 暗角。 */
const Finish = ({vignette = .6}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,${vignette}) 100%)`}} />;
/** 幕首/幕末黑场（只在幕自己的时间里起作用：交叉淡化的重叠段 t<0 或 t>dur 时保持不透明，免得叠出黑帧）。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(t < 0 ? 1 : sm(t / inS), t > dur ? 1 : sm((dur - t) / outS));
/** 月亮：光晕 + 月面（淡淡的月海）。tint 可换成血月、霜月。 */
function Moon({x, y, r = 70, opacity = 1, glow = 1, tint = MOON, id = 'moon'}: {x: number; y: number; r?: number; opacity?: number; glow?: number; tint?: string; id?: string}) {
  return <g opacity={opacity}>
    <defs><radialGradient id={`${id}-halo`}><stop offset="0" stopColor={tint} stopOpacity={.55 * glow} /><stop offset=".25" stopColor={tint} stopOpacity={.18 * glow} />
      <stop offset="1" stopColor={tint} stopOpacity={0} /></radialGradient>
      <radialGradient id={`${id}-disc`} cx=".42" cy=".4"><stop offset="0" stopColor="#ffffff" /><stop offset=".7" stopColor={tint} /><stop offset="1" stopColor={tint} stopOpacity=".9" /></radialGradient></defs>
    <circle cx={x} cy={y} r={r * 7} fill={`url(#${id}-halo)`} />
    <circle cx={x} cy={y} r={r} fill={`url(#${id}-disc)`} />
    {[[-.3, -.2, .28], [.25, .1, .22], [-.05, .35, .18], [.3, -.32, .12]].map(([dx, dy, rr], i) =>
      <circle key={i} cx={x + dx * r} cy={y + dy * r} r={rr * r} fill="#8d8a7c" opacity={.16} />)}
  </g>;
}
/** 夜云：一缕缕横向漂移的云（SVG 椭圆 + 径向渐变），可以从月亮前面飘过。 */
function Clouds({t, seed = 1, count = 8, y = 40, h = 360, speed = 14, color = '24,30,44', opacity = .85, light = 0, id = 'cl'}:
  {t: number; seed?: number; count?: number; y?: number; h?: number; speed?: number; color?: string; opacity?: number; light?: number; id?: string}) {
  const r = seeded(seed), span = W * 1.6;
  const clouds = Array.from({length: count}, () => ({x: r() * span, y: y + r() * h, w: 360 + r() * 700, hh: 36 + r() * 70, v: speed * (.6 + .8 * r()), a: .45 + .5 * r()}));
  return <g opacity={opacity}>
    <defs><radialGradient id={`${id}-g`}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity="1" /><stop offset=".6" stopColor={`rgb(${color})`} stopOpacity=".55" />
      <stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-l`}><stop offset="0" stopColor="#b9c6d8" stopOpacity=".5" /><stop offset="1" stopColor="#b9c6d8" stopOpacity="0" /></radialGradient></defs>
    {clouds.map((c, i) => {
      const x = (((c.x + c.v * t) % span) + span) % span - W * .3;
      return <g key={i} opacity={c.a}>
        {[[0, 0, 1, 1], [-.32, .25, .6, .8], [.3, .18, .55, .9], [.05, -.3, .5, .7]].map(([dx, dy, sw, sh], k) =>
          <ellipse key={k} cx={x + dx * c.w} cy={c.y + dy * c.hh} rx={c.w * .5 * sw} ry={c.hh * sh} fill={`url(#${id}-g)`} />)}
        {light > 0 && <ellipse cx={x} cy={c.y - c.hh * .45} rx={c.w * .42} ry={c.hh * .35} fill={`url(#${id}-l)`} opacity={light} />}
      </g>;
    })}
  </g>;
}
/** 流动的雾：几层不同深度的柔雾带，各自按速度横移并缓缓起伏；y0～y1 是雾带所在的高度范围。 */
function Fog({t, amount = 1, y0 = 620, y1 = 1080, layers = 3, speed = 30, tint = '200,210,222', seed = 2, id = 'fog'}:
  {t: number; amount?: number; y0?: number; y1?: number; layers?: number; speed?: number; tint?: string; seed?: number; id?: string}) {
  if (amount <= 0) return null;
  const r = seeded(seed * 7 + 1), span = W * 1.8;
  const blobs = Array.from({length: layers * 7}, (_, i) => ({layer: i % layers, x: r() * span, y: r(), w: 520 + r() * 680, h: 90 + r() * 120, ph: r() * 6.28, a: .25 + .4 * r()}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: amount}}>
    <defs><radialGradient id={`${id}-b`}><stop offset="0" stopColor={`rgb(${tint})`} stopOpacity=".6" /><stop offset=".55" stopColor={`rgb(${tint})`} stopOpacity=".22" />
      <stop offset="1" stopColor={`rgb(${tint})`} stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={`rgb(${tint})`} stopOpacity="0" />
        <stop offset="1" stopColor={`rgb(${tint})`} stopOpacity=".22" /></linearGradient></defs>
    <rect x={0} y={y0} width={W} height={y1 - y0} fill={`url(#${id}-v)`} />
    {blobs.map((b, i) => {
      const depth = (b.layer + 1) / layers, v = speed * (.5 + depth);
      const x = (((b.x + v * t) % span) + span) % span - W * .4, y = mix(y0, y1, b.y) + Math.sin(t * .4 + b.ph) * 18;
      return <ellipse key={i} cx={x} cy={y} rx={b.w * (.7 + .5 * depth)} ry={b.h * (.7 + .5 * depth)} fill={`url(#${id}-b)`} opacity={b.a} />;
    })}
  </svg>;
}
/** 风卷落叶（canvas）：叶片翻转、打旋，wind 控制风向与风力。 */
function Leaves({frame, amount = 1, wind = 1, seed = 3, n = 60, opacity = 1, size = 1, fall = 1}:
  {frame: number; amount?: number; wind?: number; seed?: number; n?: number; opacity?: number; size?: number; fall?: number}) {
  const r = seeded(seed), colors = ['#a8471c', '#c9741f', '#7a2f17', '#d79a2c', '#5e3a1c'];
  const leaves = Array.from({length: n}, () => ({x: r() * (W + 400), y: r() * H, s: r(), ph: r() * 6.28, spin: (r() - .5) * 6, c: colors[Math.floor(r() * colors.length)]}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    leaves.forEach((l, i) => {
      if (i / n > amount) return;
      const span = W + 400;
      const x = (((l.x + wind * (180 + 260 * l.s) * t + Math.sin(t * 1.7 + l.ph) * 50) % span) + span) % span - 200;
      const y = (((l.y + fall * (50 + 70 * l.s) * t + Math.sin(t * 2.3 + l.ph) * 34) % (H + 120)) + H + 120) % (H + 120) - 60;
      const len = (10 + 16 * l.s) * size;
      c.save(); c.translate(x, y); c.rotate(l.ph + l.spin * t); c.scale(1, .25 + .75 * Math.abs(Math.cos(t * 3.1 + l.ph)));
      c.fillStyle = l.c; c.globalAlpha = .55 + .45 * l.s;
      c.beginPath(); c.moveTo(-len, 0); c.quadraticCurveTo(0, -len * .55, len, 0); c.quadraticCurveTo(0, len * .55, -len, 0); c.fill();
      c.restore();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
/** 火星 / 萤火 / 雪：缓慢上扬或飘落的小光点（canvas）。 */
function Motes({frame, kind = 'ember', amount = 1, seed = 5, opacity = 1, x0 = 0, x1 = W, y0 = 0, y1 = H, n = 140}:
  {frame: number; kind?: 'ember' | 'wisp' | 'snow'; amount?: number; seed?: number; opacity?: number; x0?: number; x1?: number; y0?: number; y1?: number; n?: number}) {
  const r = seeded(seed + kind.length), motes = Array.from({length: n}, () => ({x: r(), y: r(), s: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30, hh = y1 - y0, ww = x1 - x0;
    motes.forEach((m, i) => {
      if (i / n > amount) return;
      const up = kind === 'snow' ? 1 : -1, speed = kind === 'snow' ? 60 + 80 * m.s : kind === 'wisp' ? 12 + 14 * m.s : 50 + 70 * m.s;
      const y = y0 + (((m.y * hh + up * speed * t) % hh) + hh) % hh;
      const x = x0 + (((m.x * ww + Math.sin(t * (kind === 'wisp' ? .7 : 1.4) + m.ph) * (kind === 'wisp' ? 60 : 24) + (kind === 'snow' ? 30 * t : 0)) % ww) + ww) % ww;
      const pulse = kind === 'wisp' ? .5 + .5 * Math.sin(t * 2.2 + m.ph * 3) : 1;
      const size = kind === 'snow' ? 1.6 + 3.2 * m.s : kind === 'wisp' ? 2 + 3 * m.s : 1.2 + 2.2 * m.s;
      if (kind === 'wisp') {
        const g = c.createRadialGradient(x, y, 0, x, y, size * 6);
        g.addColorStop(0, `rgba(190,255,220,${.75 * pulse})`); g.addColorStop(1, 'rgba(120,220,200,0)');
        c.fillStyle = g; c.beginPath(); c.arc(x, y, size * 6, 0, 6.283); c.fill();
        return;
      }
      c.fillStyle = kind === 'snow' ? `rgba(240,246,255,${.5 + .45 * m.s})` : `rgba(255,${130 + 90 * m.s},60,${.45 + .5 * Math.sin(t * 6 + m.ph) ** 2})`;
      c.beginPath(); c.arc(x, y, size, 0, 6.283); c.fill();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
/** 雨丝（canvas）。 */
function Rain({frame, amount = 1, angle = .18, seed = 3, opacity = 1}: {frame: number; amount?: number; angle?: number; seed?: number; opacity?: number}) {
  const r = seeded(seed), drops = Array.from({length: 480}, () => ({x: r() * W * 1.3, y: r() * H, l: 30 + r() * 70, v: 1500 + r() * 1300, z: r()}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    c.lineCap = 'round';
    drops.forEach((d, i) => {
      if (i / drops.length > amount) return;
      const y = (d.y + d.v * t) % (H + 120) - 60, x = (d.x - y * angle) % (W * 1.3) - W * .15;
      c.strokeStyle = `rgba(200,214,232,${.16 + .38 * d.z})`; c.lineWidth = .8 + 1.6 * d.z;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - d.l * angle, y + d.l); c.stroke();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}} />;
}
/** 闪电：at 起 0.45 秒的双闪 + 折线电光。 */
function Lightning({t, at, x = 1200, strength = 1}: {t: number; at: number; x?: number; strength?: number}) {
  const d = t - at;
  if (d < 0 || d > .45) return null;
  const flash = (d < .08 ? 1 : d < .16 ? .25 : d < .24 ? .8 : Math.max(0, 1 - (d - .24) / .2) * .5) * strength;
  const r = seeded(Math.round(at * 100)), pts: string[] = [];
  let px = x, py = 0;
  while (py < 620) {pts.push(`${px},${py}`); px += (r() - .5) * 120; py += 40 + r() * 60;}
  return <>
    <div style={{position: 'absolute', inset: 0, background: `rgba(215,228,255,${.5 * flash})`, mixBlendMode: 'screen'}} />
    <Svg><polyline points={pts.join(' ')} fill="none" stroke="#f4f7ff" strokeWidth={4} opacity={flash} /></Svg>
  </>;
}
/** 枯树剪影：种子决定枝杈（递归分叉、逐级变细），返回按粗细分组的折线路径，缓存后每帧复用。 */
const TREE_CACHE = new Map<string, Array<{w: number; d: string}>>();
function treePaths(seed: number, height: number) {
  const key = `${seed}:${height}`;
  const hit = TREE_CACHE.get(key);
  if (hit) return hit;
  const r = seeded(seed), groups: string[][] = Array.from({length: 7}, () => []);
  const grow = (x: number, y: number, angle: number, len: number, depth: number) => {
    if (depth > 6 || len < 6) return;
    let px = x, py = y, a = angle;
    const steps = 3, parts = [`M${x.toFixed(0)} ${y.toFixed(0)}`];
    for (let i = 0; i < steps; i++) {a += (r() - .5) * .5; px += Math.cos(a) * len / steps; py += Math.sin(a) * len / steps; parts.push(`L${px.toFixed(0)} ${py.toFixed(0)}`);}
    groups[depth].push(parts.join(''));
    const kids = depth < 2 ? 2 + (r() > .5 ? 1 : 0) : 2;
    for (let k = 0; k < kids; k++) grow(px, py, a + (k - (kids - 1) / 2) * (.45 + r() * .5) + (r() - .5) * .3, len * (.64 + r() * .16), depth + 1);
  };
  grow(0, 0, -Math.PI / 2 + (r() - .5) * .2, height * .34, 0);
  const result = groups.map((g, i) => ({w: height * .045 * Math.pow(.62, i), d: g.join('')})).filter(g => g.d);
  TREE_CACHE.set(key, result);
  return result;
}
/** 一排枯树（视差层）：按 speed 向左滚动，循环铺满。 */
function TreeRow({t, speed = 60, y = 1000, seed = 11, count = 7, height = 520, color = '#05070b', opacity = 1, spread = 1}:
  {t: number; speed?: number; y?: number; seed?: number; count?: number; height?: number; color?: string; opacity?: number; spread?: number}) {
  const r = seeded(seed), span = W * 1.5 * spread;
  const trees = Array.from({length: count}, (_, i) => ({x: (i + r() * .6) * span / count, h: height * (.7 + .5 * r()), s: Math.floor(r() * 1000)}));
  return <g opacity={opacity}>{trees.map((tr, i) => {
    const x = ((((tr.x - speed * t) % span) + span) % span) - W * .2;
    return <g key={i} transform={`translate(${x.toFixed(1)} ${y})`}>
      {treePaths(seed * 100 + tr.s, Math.round(tr.h)).map((g, k) => <path key={k} d={g.d} fill="none" stroke={color} strokeWidth={g.w} strokeLinecap="round" strokeLinejoin="round" />)}
    </g>;
  })}</g>;
}
/** 起伏的地平线剪影（噪声山脊），填到画面底边。 */
function Ridge({y = 820, amp = 60, seed = 4, color = '#04060a', rough = 1, opacity = 1, shift = 0}: {y?: number; amp?: number; seed?: number; color?: string; rough?: number; opacity?: number; shift?: number}) {
  const n = noise2d(seed), pts: string[] = [];
  for (let x = -40; x <= W + 40; x += 24) pts.push(`${x},${(y + n((x + shift) / 520 * rough, 0) * amp + n((x + shift) / 140 * rough, 3) * amp * .18).toFixed(1)}`);
  return <polygon points={`-40,${H + 10} ${pts.join(' ')} ${W + 40},${H + 10}`} fill={color} opacity={opacity} />;
}
/** 矢量剪影：底边中点锚在 (x, y)，高 h 像素；flip 左右翻转；rot 绕锚点旋转（度）。 */
function Sil({name, x, y, h, flip = false, rot = 0, fill = '#040508', opacity = 1}: {name: string; x: number; y: number; h: number; flip?: boolean; rot?: number; fill?: string; opacity?: number}) {
  const s = SIL[name];
  if (!s || opacity <= 0) return null;
  const k = h / 1000;
  return <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${flip ? -k : k} ${k}) translate(${-s.w / 2} -1000)`} opacity={opacity}>
    <path d={s.d} fill={fill} fillRule="evenodd" />
  </g>;
}
/** 奔马起伏：上下颠 + 前后摇（让单张剪影读起来像在跑）。 */
const gallop = (t: number, rate = 2.6, amp = 1) => ({dy: -Math.abs(Math.sin(Math.PI * rate * t)) * 14 * amp, rot: Math.sin(2 * Math.PI * rate * t + .6) * 3.2 * amp});


// 落版：整幕纯代码。先把一个夜晚一层层“写”出来（每层旁边标出画它的组件名）；念到 changeCue，分成四格，
// 每格同一个场景、不同的 night 参数；念到 cycleCue 合回一格、夜色快速轮换；最后落片名与署名。
// nights 可改：moonlit 月夜、storm 雷雨、harvest 橙色满月、frost 初雪。
export const meta = {
  title: 'Change the night',
  params: {
    nights: {label: 'Nights', type: 'list', min: 1, max: 4, default: ['moonlit', 'storm', 'harvest', 'frost'], help: 'moonlit, storm, harvest, frost'},
    changeCue: {label: 'Split into four on', type: 'text', default: 'setting', maxLength: 24},
    cycleCue: {label: 'Nights cycle on', type: 'text', default: 'night', maxLength: 24},
    title: {label: 'Title', type: 'text', default: 'The Legend of Sleepy Hollow', maxLength: 40},
    brand: {label: 'Made with', type: 'text', default: 'Galanty', maxLength: 24},
    line1: {label: 'Credit line 1', type: 'text', default: 'After Washington Irving’s tale of 1820, retold', maxLength: 70},
    line2: {label: 'Credit line 2', type: 'text', default: 'Drawn live in code · Gemini narration · Lyria score', maxLength: 90},
  },
};
const SKY: Record<string, [string, string]> = {moonlit: ['#13233d', '#070b14'], storm: ['#0d1118', '#040507'], harvest: ['#3b1b0c', '#0e0605'], frost: ['#2a3b50', '#0d141d']};

/** 同一个代码画的夜：天、月、云、山脊、枯树、桥与教堂、骑士、天气。build（0～1）控制按层出现，用来演示“一层层写出来”。 */
function NightScene({kind, t, frame, build = 1, tags = false}: {kind: string; t: number; frame: number; build?: number; tags?: boolean}) {
  const layer = (i: number) => sm((build * 7 - i) / .8);
  const [top, bottom] = SKY[kind] ?? SKY.moonlit;
  const moon = kind === 'harvest' ? {x: 1330, y: 430, r: 150, tint: '#ffae55'} : kind === 'frost' ? {x: 1460, y: 240, r: 72, tint: '#e2ecf7'} : {x: 1450, y: 235, r: 92, tint: MOON};
  const g = gallop(t, 2.4), rx = ((t * 260) % 2600) - 340;
  const fogTint = kind === 'harvest' ? '220,150,95' : kind === 'frost' ? '225,232,240' : '150,165,190';
  const strike = kind === 'storm' ? Math.floor(t / 1.7) * 1.7 + .3 : -9;
  const tag = (i: number, label: string, x: number, y: number) => tags && <text x={x} y={y} fontFamily="Menlo, monospace" fontSize={30} fill={EMBER}
    opacity={win(build * 7, i, i + 2.2, .5)}>{label}</text>;
  return <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`}}>
    <Svg>
      <g opacity={kind === 'storm' ? 0 : layer(1)}><Moon x={moon.x} y={moon.y} r={moon.r} tint={moon.tint} id={`m-${kind}`} /></g>
      <g opacity={layer(1.5)}><Clouds t={t} seed={kind.length} count={kind === 'storm' ? 10 : 5} y={60} h={kind === 'storm' ? 380 : 240} speed={kind === 'storm' ? 60 : 20}
        color={kind === 'storm' ? '10,12,16' : '18,24,36'} opacity={kind === 'storm' ? .95 : .6} light={kind === 'storm' ? 0 : .6} id={`c-${kind}`} /></g>
      <g opacity={layer(2)}><Ridge y={760} amp={70} seed={6} color={kind === 'harvest' ? '#1c0d07' : '#0b111b'} /></g>
      <g opacity={layer(3)}><TreeRow t={0} speed={0} y={900} seed={52} count={7} height={520} color="#06080d" /></g>
      <g opacity={layer(4)}>
        <path d="M640 912 Q 960 820 1280 912" fill="none" stroke="#030407" strokeWidth={18} />
        <path d="M640 880 Q 960 790 1280 880" fill="none" stroke="#030407" strokeWidth={7} />
        {[700, 800, 900, 1020, 1120, 1220].map(x => <line key={x} x1={x} y1={x < 960 ? 905 - (x - 640) * .25 : 905 - (1280 - x) * .25} x2={x} y2={x < 960 ? 875 - (x - 640) * .25 : 875 - (1280 - x) * .25}
          stroke="#030407" strokeWidth={6} />)}
        <g transform="translate(1540 860)"><rect x={-80} y={-110} width={160} height={110} fill="#05070b" /><path d="M-95 -110 L0 -175 L95 -110Z" fill="#05070b" />
          <rect x={-22} y={-250} width={44} height={90} fill="#05070b" /><path d="M-28 -250 L0 -330 L28 -250Z" fill="#05070b" />
          {[-50, -14, 22].map(x => <rect key={x} x={x} y={-80} width={22} height={34} fill="#ffb24f" opacity={.85} />)}</g>
      </g>
      <g opacity={layer(5)}><Sil name="horseman" x={rx} y={905 + g.dy} h={230} rot={g.rot} fill="#020305" /></g>
      <Ridge y={1000} amp={18} seed={10} color="#020304" />
      {tag(1, '<Moon />', moon.x - 300, moon.y + 10)}
      {tag(2, '<Ridge />', 160, 700)}
      {tag(3, '<TreeRow seed={52} />', 150, 560)}
      {tag(4, '<Bridge /> <Church />', 760, 760)}
      {tag(5, '<Sil name="horseman" />', 700, 640)}
      {tag(6, '<Fog /> <Leaves />', 1240, 860)}
    </Svg>
    <div style={{opacity: layer(6)}}>
      <Fog t={t} amount={kind === 'frost' ? .9 : .7} y0={760} y1={1080} layers={3} speed={30} tint={fogTint} seed={5} id={`f-${kind}`} />
      {kind === 'storm' && <><Rain frame={frame} amount={.9} seed={4} /><Lightning t={t} at={strike} x={1200} strength={.9} /></>}
      {kind === 'frost' && <Motes frame={frame} kind="snow" amount={1} n={220} seed={6} />}
      {(kind === 'harvest' || kind === 'moonlit') && <Leaves frame={frame} amount={kind === 'harvest' ? 1 : .4} wind={1.4} seed={9} n={60} />}
    </div>
  </div>;
}

export default function Credit(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props);
  const nights = list<string>(props, 'nights').map(String).slice(0, 4);
  const change = at(txt(props, 'changeCue'), start(1, 3)), cycleAt = at(txt(props, 'cycleCue'), change + 1.2);
  const build = clamp(t / Math.max(.8, change - .3));
  const split = sm((t - change + .05) / .35), merge = sm((t - cycleAt - .6) / .45);
  const titleAt = Math.min(dur - 2.2, end(1, cycleAt + 1) + .1), title = sm((t - titleAt) / .5);
  const cycle = nights[Math.floor(Math.max(0, t - cycleAt - .6) / .32) % Math.max(1, nights.length)] ?? 'moonlit';
  const flip = (i: number) => clamp((t - change - .15 - i * .18) / .22);
  const chip = (label: string, size: number, lit: boolean) => <div style={{display: 'inline-block', padding: '8px 16px', borderRadius: 10, background: 'rgba(8,8,10,.8)',
    border: `2px solid ${lit ? AMBER : 'rgba(239,230,210,.3)'}`, fontFamily: 'Menlo, monospace', fontSize: size, color: PAPER}}>night: <span style={{color: EMBER}}>"{label}"</span></div>;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .25, .01)}}>
    {split <= 0 ? <NightScene kind={nights[0] ?? 'moonlit'} t={t} frame={props.frame} build={build} tags /> :
      nights.map((kind, i) => {
        const cx = (i % 2) * 960, cy = Math.floor(i / 2) * 540, s = mix(1, .5, split * (1 - merge));
        const x = mix(0, cx, split * (1 - merge)), y = mix(0, cy, split * (1 - merge));
        if (merge >= 1 && i > 0) return null;
        return <div key={i} style={{position: 'absolute', left: x + 2 * split, top: y + 2 * split, width: 1920 * s - 4 * split, height: 1080 * s - 4 * split, overflow: 'hidden',
          opacity: i > 0 ? 1 - merge : 1, zIndex: i === 0 ? 2 : 1}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>
            <NightScene kind={merge > .5 && i === 0 ? cycle : kind} t={t} frame={props.frame} />
          </div>
          {merge < .5 && <div style={{position: 'absolute', left: 22, top: 18, transform: `rotateX(${(1 - Math.abs(flip(i) * 2 - 1)) * 80}deg)`}}>{chip(kind, 24, flip(i) > .5)}</div>}
        </div>;
      })}
    {merge > .5 && <div style={{position: 'absolute', left: 60, top: 50}}>{chip(cycle, 30, true)}</div>}
    <div style={{position: 'absolute', inset: 0, background: `rgba(4,4,6,${.66 * title})`}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: SERIF, color: PAPER, opacity: title, textShadow: '0 4px 20px rgba(0,0,0,.9)'}}>
      <div style={{fontSize: 96, letterSpacing: 3}}>{txt(props, 'title')}</div>
      <div style={{width: 420 * out3((t - titleAt - .2) / .6), height: 2, background: AMBER, margin: '20px auto 22px'}} />
      <div style={{fontSize: 30, letterSpacing: 2, fontStyle: 'italic', opacity: .9}}>{txt(props, 'line1')}</div>
      <div style={{fontSize: 24, letterSpacing: 2, marginTop: 14, opacity: .75}}>{txt(props, 'line2')}</div>
      <div style={{display: 'inline-block', marginTop: 34, padding: '10px 26px', border: `2px solid ${AMBER}`, borderRadius: 8, fontSize: 30, letterSpacing: 8,
        textTransform: 'uppercase', color: EMBER, transform: `scale(${1 + .5 * (1 - out3((t - titleAt - .5) / .3))})`, opacity: clamp((t - titleAt - .5) * 4)}}>{txt(props, 'brand')}</div>
    </div>
    <Finish vignette={.55} />
  </div>;
}
