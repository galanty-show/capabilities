import React from 'react';
import {Media, clamp, easeInOut, seeded, noise2d, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Legend of Sleepy Hollow》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx：
// 只带上该幕真正用到的函数，并内联该幕用到的矢量剪影（SIL）；样片版另把底图内联进 MEDIA。
// 画面只由帧号决定：随机感全用 seeded()/noise2d()，不读时钟、不用 CSS filter（滤镜在缩放运镜下两次渲染不一致）。

const W = 1920, H = 1080;
const INK = '#07090d', PAPER = '#efe6d2', AMBER = '#e8862a', EMBER = '#ffb45a', MOON = '#ebe8d8', FROST = '#cfdbe6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// 随包样片（S109）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"night-road":"release-assets/5d85f5c45676d8d091e251db0c6686085873ac41ca20c55a13077828d59acec9.webp"};
// 矢量剪影（trace.py 从 Gemini 黑剪影描出，高 1000、底边居中锚点）：horseman 无头骑士、ichabod 伊卡博德、throw 立镫掷物。
const SIL: Record<string, {w: number; h: number; d: string}> = {"horseman":{"w":1405,"h":1000,"d":"M869 1 872 0 901 16 932 42 906 63 927 86 907 110 908 119 904 154 908 166 906 174 913 181 921 183 940 196 946 195 963 205 965 209 979 193 964 186 973 186 983 171 998 158 1030 147 1004 149 1018 143 999 133 1022 137 1064 111 1068 108 1066 105 1057 110 1066 101 1086 92 1101 90 1150 96 1131 81 1126 73 1142 83 1167 92 1198 86 1216 88 1231 96 1239 105 1253 87 1274 67 1277 69 1274 105 1286 96 1305 75 1302 104 1291 135 1302 145 1308 162 1333 191 1340 215 1363 254 1372 261 1375 273 1403 323 1405 337 1385 374 1377 379 1358 381 1338 380 1327 377 1322 372 1319 358 1307 348 1278 359 1249 365 1208 369 1175 366 1173 368 1140 436 1141 502 1122 551 1108 572 1152 603 1206 637 1214 652 1220 675 1219 689 1194 731 1163 810 1130 832 1105 860 1093 863 1064 879 1056 877 1054 860 1063 809 1074 805 1082 797 1099 802 1103 800 1108 790 1102 784 1107 783 1104 780 1114 774 1109 772 1132 759 1140 749 1164 700 1166 685 1164 677 1160 671 1142 663 1062 646 1061 648 1077 677 1109 722 1111 733 1104 764 1093 777 1037 800 985 833 975 836 965 835 940 826 897 822 893 818 858 806 854 801 856 797 882 773 913 756 932 764 938 782 944 784 944 772 950 776 952 771 979 776 1012 767 1048 747 1052 737 1045 727 994 689 954 653 919 632 914 626 913 617 888 617 881 623 862 626 847 625 841 617 831 618 818 623 802 623 794 621 790 612 748 606 701 593 681 646 658 683 652 702 652 720 659 731 676 743 757 783 768 792 780 817 797 838 809 863 807 871 811 900 811 910 804 913 787 907 761 893 744 879 745 873 741 863 748 848 738 849 732 855 726 840 724 845 721 842 712 823 706 817 668 791 645 780 630 776 637 805 656 832 688 871 715 895 732 921 769 947 772 955 797 988 796 994 779 1000 724 998 719 996 708 980 710 963 707 957 697 952 690 957 672 946 663 933 651 904 628 871 573 810 545 784 542 772 538 698 527 660 511 634 472 593 435 551 419 527 409 504 403 483 402 463 414 406 406 404 392 410 373 426 350 464 348 458 339 479 331 491 301 518 282 528 262 533 233 550 198 557 193 553 214 547 233 537 231 536 188 552 157 555 128 553 103 545 145 549 107 538 68 516 61 510 66 511 68 507 78 515 84 516 62 501 42 475 87 501 113 506 70 484 43 450 20 446 26 444 24 442 0 444 23 436 48 435 80 443 81 442 78 440 91 439 113 441 146 451 149 449 169 453 186 452 193 450 159 442 138 428 159 437 173 439 196 439 214 435 237 423 285 383 318 367 344 360 367 356 419 363 437 359 472 335 501 319 522 309 546 304 579 302 647 310 654 297 674 299 668 281 668 269 674 264 684 264 702 277 698 246 719 209 722 193 726 186 676 217 660 225 637 230 594 254 476 290 456 283 435 267 402 268 383 262 352 226 354 222 334 218 283 234 262 243 231 259 210 275 225 226 240 195 266 165 291 148 307 142 367 134 381 123 396 100 406 89 433 72 559 93 631 92 670 77 767 30 806 22 868 22 869 1ZM1087 100 1093 99 1120 108 1090 106 1070 110 1069 108 1076 102 1087 100ZM854 228 860 227 895 240 897 244 901 246 934 253 940 250 946 254 930 261 911 259 917 264 926 267 910 273 926 275 913 278 905 283 897 283 894 279 899 269 904 265 904 261 897 258 888 261 879 267 872 282 848 255 850 238 854 228ZM1222 302 1257 316 1274 326 1280 336 1292 338 1243 346 1187 341 1184 339 1198 314 1206 307 1222 302ZM1180 349 1214 353 1254 355 1200 358 1179 356 1180 349ZM315 487 318 487 315 491 303 504 280 521 278 520 315 487Z"}};
/** 素材：先用素材槽（制作任务，高清图），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}

// 画面文字都是各幕 meta.params 声明的内容参数（默认值是英文原文），换语言只换参数、不换代码。
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
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

/** 镜头：从 from 到 to 的 [缩放, x 位移, y 位移]，按 p 缓动；pt(fx, fy) 把底图上的相对位置换成屏幕坐标，给叠加层对位。 */
function camera(p: number, from: number[], to: number[], ease = easeInOut) {
  const k = ease(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return {s, x, y, pt: (fx: number, fy: number) => [(fx * W - W / 2) * s + W / 2 + x, (fy * H - H / 2) * s + H / 2 + y] as [number, number]};
}
/** 满幅底图 + 镜头。用布局尺寸（left/top/width/height）放大，不用 CSS transform 缩放：
 * transform 缩放的图层在两次渲染里光栅化结果会差几个色阶（交付检查判 CODE_NONDETERMINISTIC，10-13 Katrina 一幕实测）。 */
function Plate({asset, frame, cam, opacity = 1}: {asset: any; frame: number; cam: {s: number; x: number; y: number}; opacity?: number}) {
  if (!asset) return null;
  const w = W * cam.s, h = H * cam.s;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: (W - w) / 2 + cam.x, top: (H - h) / 2 + cam.y, width: w, height: h}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
/** 暗角。 */
const Finish = ({vignette = .6}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,${vignette}) 100%)`}} />;
/** 幕首/幕末黑场（只在幕自己的时间里起作用：交叉淡化的重叠段 t<0 或 t>dur 时保持不透明，免得叠出黑帧）。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(t < 0 ? 1 : sm(t / inS), t > dur ? 1 : sm((dur - t) / outS));
/** 烛火 / 灯笼的闪烁系数（约 0.8～1.1），同一 seed 每帧确定。 */
const flicker = (t: number, seed = 0) => {
  const n = noise2d(97 + seed);
  return .93 + .09 * n(t * 5.5, seed) + .05 * Math.sin(t * 19 + seed * 3) * Math.sin(t * 7.3 + seed);
};
/** 暖光：屏幕叠加的柔光团（烛火、灯笼、炉火），随 flicker 呼吸。 */
function Glow({x, y, r, t, seed = 0, color = '255,170,80', strength = .55}: {x: number; y: number; r: number; t: number; seed?: number; color?: string; strength?: number}) {
  const f = flicker(t, seed), rr = r * (.94 + .1 * f);
  return <div style={{position: 'absolute', left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: '50%', mixBlendMode: 'screen', pointerEvents: 'none',
    background: `radial-gradient(circle, rgba(${color},${strength * f}) 0%, rgba(${color},${strength * f * .35}) 30%, rgba(${color},0) 70%)`}} />;
}

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
/** 闪白：at 起 len 秒从 peak 衰减（南瓜爆裂、雷击）。 */
function Flash({t, at, len = .35, peak = 1, color = '255,248,232'}: {t: number; at: number; len?: number; peak?: number; color?: string}) {
  const d = t - at;
  if (d < 0 || d > len) return null;
  return <div style={{position: 'absolute', inset: 0, background: `rgba(${color},${peak * Math.pow(1 - d / len, 2)})`}} />;
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


// 冷开场 / 结尾钩子：午夜林间路（底图）+ 代码画的月晕、流云、三层流雾、风卷落叶。
// open：念到 riderCue，无头骑士的剪影从路尽头的雾里一点点显形；念到 headCue，云散月亮一亮。
// hook：雾更浓；念到 listenCue，骑士贴着镜头横扫而过，画面随即黑下去。
export const meta = {
  title: 'Midnight road',
  params: {
    mode: {label: 'Mode', type: 'select', default: 'open', options: [{value: 'open', label: 'Cold open'}, {value: 'hook', label: 'Closing hook'}]},
    riderCue: {label: 'Rider appears on', type: 'text', default: 'rider', maxLength: 24, help: 'The rider starts to show through the fog on this word'},
    headCue: {label: 'Moon flares on', type: 'text', default: 'head', maxLength: 24},
    listenCue: {label: 'Rider sweeps past on', type: 'text', default: 'listen', maxLength: 24, help: 'Closing hook only'},
    fog: {label: 'Fog', type: 'number', default: 1, min: 0, max: 1.6, step: .1},
  },
};
export default function Road(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const hook = txt(props, 'mode') === 'hook';
  const fog = typeof props.params.fog === 'number' ? props.params.fog : 1;
  const cam = hook ? camera(t / dur, [1.16, -40, -20], [1.05, 0, 0]) : camera(t / dur, [1.03, 0, 0], [1.16, -60, -30]);
  const [mx, my] = cam.pt(.35, .17), [rx, ry] = cam.pt(.6, .58);
  const rider = at(txt(props, 'riderCue'), start(2, 3.5)), head = at(txt(props, 'headCue'), start(3, 5));
  const listen = at(txt(props, 'listenCue'), dur - 1.6);
  // open：剪影在路尽头从左往右走，雾薄的地方先露出来；hook：离开时贴镜头横扫。
  // hook：骑士先静静立在路尽头的雾里，念到 listenCue 才冲过来。
  const show = hook ? sm((t - .3) / 1.5) * .6 * (1 - sm((t - listen) / .3)) : sm((t - rider + .2) / 1.8) * .9;
  const g = hook ? {dy: 0, rot: Math.sin(t * 1.3) * .8} : gallop(t, 1.6, .5), drift = hook ? 60 : (t - rider) * 22;
  const sweep = clamp((t - listen - .15) / .75);
  const moonUp = hook ? .6 : .55 + .6 * win(t, head - .1, head + 1.2, .3);
  const dark = hook ? sm((t - listen - .7) / .35) : 0;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, hook ? .01 : 1.2, .08)}}>
    <Plate asset={slot(props, 'night-road')} frame={props.frame} cam={cam} />
    <Glow x={mx} y={my} r={260 * cam.s} t={t} seed={1} color="215,225,240" strength={.35 * moonUp} />
    <Svg><Clouds t={t} seed={hook ? 7 : 3} count={7} y={60} h={260} speed={26} color="18,24,36" opacity={.7} light={moonUp * .8} id="rc" /></Svg>
    <Fog t={t} amount={.42 * fog} y0={480} y1={760} layers={2} speed={18} tint="120,134,155" seed={5} id="rf1" />
    {show > 0 && <Svg><Sil name="horseman" x={rx - 120 + drift} y={ry + 8 + g.dy * .3} h={170 * cam.s} rot={g.rot * .4} fill="#06080c" opacity={show} /></Svg>}
    <Fog t={t} amount={(hook ? .75 : .6) * fog} y0={640} y1={1080} layers={3} speed={34} tint="130,145,168" seed={9} id="rf2" />
    <Leaves frame={props.frame} amount={hook ? .8 : .6} wind={1.2} seed={hook ? 21 : 12} n={50} />
    {!hook && <Flash t={t} at={head} len={.5} peak={.18} color="200,220,255" />}
    {hook && sweep > 0 && sweep < 1 && <Svg><Sil name="horseman" x={mix(-700, W + 900, sweep)} y={1180} h={1150} rot={gallop(t, 3).rot} fill="#020305" /></Svg>}
    <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${dark})`}} />
    <Finish vignette={.72} />
  </div>;
}
