import React from 'react';
import {Media, clamp, easeInOut, seeded, noise2d, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Legend of Sleepy Hollow》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx：
// 只带上该幕真正用到的函数，并内联该幕用到的矢量剪影（SIL）；样片版另把底图内联进 MEDIA。
// 画面只由帧号决定：随机感全用 seeded()/noise2d()，不读时钟、不用 CSS filter（滤镜在缩放运镜下两次渲染不一致）。

const W = 1920, H = 1080;
const INK = '#07090d', PAPER = '#efe6d2', AMBER = '#e8862a', EMBER = '#ffb45a', MOON = '#ebe8d8', FROST = '#cfdbe6';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const MEDIA: Record<string, string> = {"party":"release-assets/9c3dc6608422db395c17eb92bf7382d746f3121bd8c869fa6cbff84fac3505ed.webp"};
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
/** 两个镜头之间按 w 过渡（甩镜头、切换焦点）。 */
function blendCam(a: {s: number; x: number; y: number}, b: {s: number; x: number; y: number}, w: number) {
  const s = mix(a.s, b.s, w), x = mix(a.x, b.x, w), y = mix(a.y, b.y, w);
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


// 秋收聚会：炉火、灯笼一直在跳，火星往上飘。念到 storyCue，屋里暗下来、镜头推向炉边；
// 念到 soldierCue，炉膛上方的墙上出现火光投出的“皮影”骑兵；念到 shotCue，一颗炮弹的影子飞来，打飞他头上的帽与头（只是影子）；
// 念到 rideCue，无头的影子骑兵沿着墙一圈圈地跑。
export const meta = {
  title: 'Ghost stories by the fire',
  params: {
    storyCue: {label: 'Room darkens on', type: 'text', default: 'ghost', maxLength: 24},
    soldierCue: {label: 'Shadow rider appears on', type: 'text', default: 'soldier', maxLength: 24},
    shotCue: {label: 'Cannonball on', type: 'text', default: 'shot', maxLength: 24},
    rideCue: {label: 'Shadow rides on', type: 'text', default: 'rides', maxLength: 24},
  },
};
export default function Party(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const story = at(txt(props, 'storyCue'), start(0, 1.5)), soldier = at(txt(props, 'soldierCue'), start(1, 3.5));
  const shot = at(txt(props, 'shotCue'), soldier + 1.3), ride = at(txt(props, 'rideCue'), start(2, 6));
  const push = sm((t - story) / 2.2);
  const cam = blendCam(camera(t / dur, [1.04, 20, 0], [1.08, 40, 10]), {s: 1.32, x: 330, y: 150}, push);
  const [fx, fy] = cam.pt(.23, .62), dim = sm((t - story) / 1.5) * .7;
  const f = flicker(t, 7);
  // 墙上的影子：锚在炉罩下沿，影子会随火苗轻轻放大缩小。
  const [wx0, wy] = cam.pt(.04, .31), [wx1] = cam.pt(.34, .31);
  const shadowOn = sm((t - soldier + .1) / .6) * (.72 + .12 * f);
  const lap = Math.max(0, t - ride) / 2.4, ridePos = t < ride ? .32 : (.32 + lap) % 1;
  const sx = mix(wx0, wx1, ridePos), sh = .21 * H * cam.s * (1 + .03 * f), g = gallop(t, t < ride ? .6 : 1.8, t < ride ? .3 : .8);
  const hit = t - shot, ball = clamp((t - shot + .45) / .45);
  const k = sh / 1000, headX = sx + 151 * k, headY = wy - 1055 * k;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .01, .01)}}>
    <Plate asset={slot(props, 'party')} frame={props.frame} cam={cam} />
    <Glow x={fx} y={fy} r={420 * cam.s} t={t} seed={7} strength={.55} color="255,150,60" />
    {/* 炉罩上的火光：影子要投在亮处才看得见 */}
    <Glow x={mix(wx0, wx1, .5)} y={wy - .1 * H * cam.s} r={330 * cam.s} t={t} seed={8} color="255,170,90" strength={.5 * sm((t - soldier + .6) / .8)} />
    {[[.76, .22], [.84, .22], [.62, .37], [.91, .37]].map(([x, y], i) => {
      const [gx, gy] = cam.pt(x, y);
      return <Glow key={i} x={gx} y={gy} r={110 * cam.s} t={t} seed={10 + i} strength={.4} />;
    })}
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${fx}px ${fy}px, rgba(0,0,0,0) 0px, rgba(3,3,6,${.72 * dim}) ${520 * (1.05 - .05 * f)}px)`}} />
    {shadowOn > 0 && <Svg>
      <g opacity={shadowOn}>
        <Sil name="horseman" x={sx} y={wy + g.dy * .4} h={sh} rot={g.rot * .6} fill="#0a0503" />
        {hit < 0 && <g transform={`translate(${headX} ${headY})`}><circle r={sh * .055} fill="#120a05" />
          <path d={`M${-sh * .1} ${-sh * .03} L${sh * .1} ${-sh * .03} L0 ${-sh * .1} Z`} fill="#120a05" /></g>}
        {hit >= 0 && hit < 1.2 && <g transform={`translate(${headX - hit * 260} ${headY - 220 * hit + 380 * hit * hit}) rotate(${-hit * 400})`} opacity={1 - hit / 1.2}>
          <circle r={sh * .055} fill="#120a05" /><path d={`M${-sh * .1} ${-sh * .03} L${sh * .1} ${-sh * .03} L0 ${-sh * .1} Z`} fill="#120a05" /></g>}
        {ball > 0 && ball < 1 && <circle cx={mix(headX + 700, headX, ball)} cy={headY - 120 * Math.sin(Math.PI * ball)} r={sh * .045} fill="#120a05" />}
        {hit >= 0 && hit < .6 && [0, 1, 2, 3].map(i => <circle key={i} cx={headX + (i - 1.5) * 26 * (1 + hit * 4)} cy={headY - hit * 60 * (i % 2 + 1)}
          r={sh * (.05 + .1 * hit)} fill="#120a05" opacity={.5 * (1 - hit / .6)} />)}
      </g>
    </Svg>}
    <Motes frame={props.frame} kind="ember" amount={.7} n={90} seed={12} x0={fx - 260} x1={fx + 260} y0={0} y1={fy} />
    <Finish vignette={.55 + .2 * dim} />
  </div>;
}
