import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// The Boy Who Cried Wolf: shared cinematic library. prepare.py joins it with each module into scenes/<module>.tsx and inlines
// only the Ma Shan Zheng (OFL) glyph outlines a module draws. No runtime fonts, randomness or clocks: everything is a function of t.
const GLYPHS: Record<string, string> = {"了":"M545 219Q597 214 613.5 215Q630 216 662 227Q723 249 723 261Q723 275 713 291.5Q703 308 687 318Q668 331 662 337Q656 343 646.5 347Q637 351 630.5 355Q624 359 607 367.5Q590 376 581.5 380.5Q573 385 556 392L539 399L556 417Q606 466 618 544Q622 565 629 589Q635 611 635.5 666Q636 721 630 763Q625 800 624 813Q620 860 600 886Q588 901 588 907.5Q588 914 584 917Q580 920 573 933.5Q566 947 555 960Q544 973 538.5 979.5Q533 986 511.5 1003Q490 1020 469 1041Q445 1065 431.5 1072Q418 1079 398 1079Q384 1079 379.5 1077Q375 1075 372 1068Q367 1057 367 1045Q367 1017 349 993Q341 983 341 973Q341 963 334.5 957.5Q328 952 328 946.5Q328 941 324 941Q320 941 310 923.5Q300 906 294 906Q291 906 283.5 897Q276 888 276 883Q277 883 280.5 883Q284 883 294.5 885Q305 887 321.5 890Q338 893 363 897Q407 906 422.5 902.5Q438 899 460 874Q494 835 506.5 796Q519 757 524 669Q528 581 524 539Q518 502 509 471Q500 440 494 436Q489 433 489 426Q489 419 480 413Q471 407 466.5 395.5Q462 384 466 380Q470 377 487 377Q504 377 515 379Q523 381 527.5 371.5Q532 362 540 349Q548 336 553 328Q567 301 574 294Q580 288 578.5 281Q577 274 570 271Q553 266 474 281.5Q395 297 365 312Q338 325 333.5 325Q329 325 315 311.5Q301 298 303.5 284.5Q306 271 316 265Q326 259 363 247Q415 232 545 219Z","来":"M407 188Q412 182 419 183.5Q426 185 435 194.5Q444 204 453 220Q463 235 463 259.5Q463 284 461 293Q457 304 464.5 307.5Q472 311 497 312Q530 313 534 314Q539 314 548 327Q557 340 559 348Q565 377 543 385Q530 389 522.5 388.5Q515 388 500 382Q481 373 473 374Q465 375 460 387Q456 399 453.5 452.5Q451 506 456 507Q460 508 478.5 482.5Q497 457 507 435Q517 416 522.5 412Q528 408 543 411Q559 414 586.5 444Q614 474 611 484Q607 493 604 493Q601 493 583 509.5Q565 526 550 534.5Q535 543 534 549Q533 553 548 555.5Q563 558 586.5 558.5Q610 559 637 558Q709 553 731.5 553.5Q754 554 763 559Q772 567 784 573Q792 577 793.5 582.5Q795 588 795 606Q794 633 787 642Q778 652 760 650Q742 648 733 635Q728 629 710.5 629Q693 629 638 625Q583 621 530 621Q481 621 479 628Q477 635 514 675Q524 686 565 714Q606 742 612 742Q615 742 635 756Q660 773 787 828Q809 836 838.5 843Q868 850 877.5 857.5Q887 865 892 865Q897 865 908 871.5Q919 878 924 885Q934 896 927 911.5Q920 927 905 930Q809 944 789 953Q771 961 771 964.5Q771 968 763.5 968.5Q756 969 746 966Q736 963 729 958Q714 948 709 948Q704 948 702 944Q700 940 691.5 940Q683 940 678.5 935Q674 930 648 912.5Q622 895 601 878Q580 861 576 861Q572 861 540.5 829.5Q509 798 497 782Q484 764 479.5 760Q475 756 466 741Q452 718 443 724Q438 726 436 869Q433 1049 419 1070Q414 1078 414 1083.5Q414 1089 403.5 1099.5Q393 1110 389 1110Q384 1110 375.5 1101.5Q367 1093 360 1047Q355 1016 355 1003Q355 990 360 963Q364 942 365.5 902Q367 862 366.5 830Q366 798 364 798Q359 798 283 872Q257 896 252.5 896Q248 896 248 900Q248 904 231 912Q205 925 182 947Q171 957 125 980Q111 986 93 987Q75 988 72 983Q70 978 89 966Q106 954 129 932Q152 910 165 893Q177 875 181.5 871Q186 867 202 849Q248 796 270 771Q283 758 283 756Q283 754 312 716Q366 644 358 637Q356 635 322 641Q288 647 263 655L222 666Q201 673 178 684.5Q155 696 145 706Q123 729 99 717Q81 707 76.5 701Q72 695 71 679Q70 665 72 660.5Q74 656 81 650Q102 635 167 614Q191 605 230 594.5Q269 584 275 584Q281 584 276 574Q274 571 269 565Q260 550 260 545Q260 540 253.5 520Q247 500 251 489Q262 463 291 460Q304 459 308 468Q314 481 322.5 479Q331 477 350 458Q372 433 380 433Q385 433 386 428.5Q387 424 385 407Q383 381 382 380Q379 376 351.5 383.5Q324 391 315 398Q308 403 303.5 403.5Q299 404 290 401Q276 397 267 383.5Q258 370 263 360Q267 350 293.5 338.5Q320 327 351 322L388 315L390 268Q393 209 407 188ZM359 569Q375 567 379 556.5Q383 546 382 504Q381 464 377 464Q376 464 374 467Q368 475 366 491Q362 511 356.5 534Q351 557 346 562Q340 570 347 570Q351 570 359 569Z","狼":"M304 257 317 252Q317 252 333 260.5Q349 269 352 271Q358 276 358 284.5Q358 293 364 303Q373 321 350 345L314 382Q301 395 286 407Q277 416 275 419.5Q273 423 274.5 432Q276 441 283.5 456Q291 471 294 471Q295 471 302 457.5Q309 444 313 441Q318 439 332.5 449.5Q347 460 350.5 468.5Q354 477 363.5 493Q373 509 373 519Q373 527 367.5 536.5Q362 546 356 546Q351 546 335 562Q323 575 321 581Q319 587 319 606Q319 631 324.5 664.5Q330 698 330.5 768.5Q331 839 322.5 870Q314 901 310.5 916Q307 931 303 936Q299 941 299 949.5Q299 958 293 962.5Q287 967 287 974Q287 981 245.5 1020.5Q204 1060 196 1060Q188 1060 164 1037.5Q140 1015 132 1009Q112 995 98 969Q94 962 97 962Q102 962 103 956.5Q104 951 99 950Q95 948 92 935Q90 924 94 924Q98 924 126 934Q148 942 164 943Q175 943 180 940Q185 937 192 928Q212 903 221 883.5Q230 864 241 826Q246 805 252 738.5Q258 672 253 668Q252 665 250 664.5Q248 664 243 667.5Q238 671 230 677.5Q222 684 208 698Q160 742 138.5 759Q117 776 93 789Q77 798 54.5 811Q32 824 32 821.5Q32 819 47 803L82 764L112 729L133 707Q141 697 159 673.5Q177 650 187 640Q217 606 240 570Q247 557 245 542Q244 532 236.5 506Q229 480 227 475Q223 469 174 518Q156 536 126.5 556.5Q97 577 90 577Q85 577 80 582Q75 587 75 582.5Q75 578 69 576.5Q63 575 77 560Q191 441 196 424Q198 419 182 404Q161 384 156.5 372.5Q152 361 160 353Q178 338 183 345Q186 348 200 350.5Q214 353 229 362L244 369L259 347Q286 305 289 281Q292 270 294.5 265Q297 260 304 257ZM516 283Q510 261 506.5 253.5Q503 246 507.5 237Q512 228 527 228Q540 228 559.5 234Q579 240 585.5 245.5Q592 251 604 257Q621 265 624.5 293.5Q628 322 615 341Q605 354 612 357Q622 361 655 345L672 338L697 348Q721 359 738 368Q750 375 752.5 378.5Q755 382 755 393Q755 406 745 426Q729 457 723 491Q721 509 712.5 540.5Q704 572 699.5 593.5Q695 615 678 634Q666 648 661 650Q656 652 642 650Q603 645 580 651Q557 657 531 678Q518 689 509.5 691.5Q501 694 490 688Q481 684 480 688Q478 693 477 745Q477 795 474.5 845Q472 895 476 895Q479 895 526.5 864.5Q574 834 581 826L591 818L578 800Q566 782 557.5 779Q549 776 554 773.5Q559 771 544.5 752Q530 733 527 731Q512 720 521 699Q524 691 526.5 689Q529 687 538 688Q549 691 571 701Q593 711 598 716Q603 721 613 728Q619 732 622 732Q625 732 634 727Q647 719 658 709Q729 647 740 628Q745 616 748.5 614.5Q752 613 764 614Q781 617 795.5 634Q810 651 811 670Q812 687 803 698.5Q794 710 778 712Q760 714 733 725L683 747Q660 755 660 759.5Q660 764 680.5 779.5Q701 795 705 800Q712 807 751.5 831.5Q791 856 797 858Q807 861 830.5 872.5Q854 884 864 891Q883 904 938 918Q955 924 957 930Q959 936 965 948Q976 975 953 980Q941 983 937.5 982Q934 981 918 987Q902 993 876 999.5Q850 1006 844.5 1011.5Q839 1017 823 1019Q812 1021 806.5 1019.5Q801 1018 791 1009Q776 995 739 970Q702 945 700 943Q698 941 689.5 934.5Q681 928 652 893Q623 858 621 856Q619 854 610 841L600 828L588 841Q577 854 559.5 881.5Q542 909 539 911Q536 913 521 933.5Q506 954 502.5 954Q499 954 499 958.5Q499 963 476.5 986.5Q454 1010 442 1031.5Q430 1053 415 1059Q399 1067 390.5 1062.5Q382 1058 371 1036Q359 1012 356 981.5Q353 951 363 946Q370 942 370 936.5Q370 931 375 931Q383 930 393 919Q403 908 406 897Q425 824 424 652Q424 458 436 447Q440 442 433 433Q427 427 427 424Q427 421 432 415Q439 405 446.5 403Q454 401 478 392L526 374Q543 366 546 363.5Q549 361 548 352Q545 340 541 336Q531 328 516 283ZM632 410 634 389H611Q587 389 570 394Q547 398 517.5 408.5Q488 419 482 424Q477 430 474.5 440.5Q472 451 476 454Q480 456 479.5 472Q479 488 475 501Q469 517 470 575.5Q471 634 472 640Q473 651 525 622Q564 599 580 592Q592 587 595 583Q598 579 599 568Q602 550 606 547.5Q610 545 610 536Q610 529 608 527.5Q606 526 600 528Q592 530 568.5 533.5Q545 537 535 541Q515 553 499 536Q493 529 492.5 526.5Q492 524 497 518Q504 511 528 499Q552 487 560 487Q566 487 574.5 483Q583 479 593 476Q612 474 616 470.5Q620 467 624 451Q630 430 632 410Z"};
const W = 1920, H = 1080;
const GOLD = '#ffd27a', EMBER = '#ff9c4a', MOON = '#dfe9ff', INK = '#05070d', PAPER = '#fff4e0', WOLF = '#9dff7a';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const in2 = (v: number) => {const p = clamp(v); return p * p;};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** Window: fade in from a, fade out from b (seconds). */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
/** 0 before a, 1 after a (soft edge f). */
const after = (t: number, a: number, f = .2) => sm((t - a) / f);

const MEDIA: Record<string, string> = {"boy-night-cry":"release-assets/7f9cbc7c9956d15ed5760e9f457dd3f3d6ede98c322ce1e02542a063d49ad915.webp","night-lamb":"release-assets/0dbf3fe9aa5595c3254a4d4b9ca9805d8426185a2096a5dad11e4b33f660609e.webp","night-ridge":"release-assets/703ecf3ea8697368432de7ace8c4d39b806860e13f913d87314deb64e8b1986c.webp"};
const VIDEO_URLS = new Map<string, string>();
function slot(props: SceneInput, name: string): any {
  if (props.assets[name]) return props.assets[name];
  const media = MEDIA[name];
  if (!media) return undefined;
  if (!media.startsWith('data:video/')) return {src: media, kind: 'image'};
  let url = VIDEO_URLS.get(name);
  if (!url) {
    const raw = atob(media.slice(media.indexOf(',') + 1));
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    url = URL.createObjectURL(new Blob([bytes], {type: 'video/mp4'}));
    VIDEO_URLS.set(name, url);
  }
  return {src: url, kind: 'video'};
}
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
const mode = (props: SceneInput, fallback: string) => typeof props.params.mode === 'string' ? props.params.mode as string : fallback;
const isLatin = (text: string) => !/[㐀-鿿]/.test(text);

/** Sentence timing with fallbacks, so edited narration never drops a beat. */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  return {s, t: s.t, at, start, end, dur: s.seconds};
}

/** Full-frame plate with a camera move (zoom s, offset x/y in px) laid out as a plain box, not a CSS transform:
 * transformed image layers re-raster differently run to run (CODE_NONDETERMINISTIC). Children share the plate frame (1920x1080). */
function Plate({asset, frame, p, from = [1.04, 0, 0], to = [1.12, -20, -10], opacity = 1, origin = '50% 50%', shift = [0, 0], ease = easeInOut, children}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string; shift?: number[]; ease?: (v: number) => number; children?: any}) {
  if (opacity <= 0) return null;
  const k = ease(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k) + shift[0], y = mix(from[2], to[2], k) + shift[1];
  const [px, py] = origin.split(' ').map(v => parseFloat(v) / 100), ox = px * W, oy = py * H;
  const box = {left: ox * (1 - s) + x, top: oy * (1 - s) + y, width: W * s, height: H * s};
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height}}>
      {asset ? <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1b2440, #3a3050 60%, #20283a)'}} />}
      {children}
    </div>
  </div>;
}
/** Where a plate point (1920x1080 plate pixels) lands on screen for the same camera move as Plate. */
function camPoint(pt: number[], p: number, from = [1.04, 0, 0], to = [1.12, -20, -10], origin = '50% 50%', shift = [0, 0], ease = easeInOut) {
  const k = ease(clamp(p)), s = mix(from[0], to[0], k), x = mix(from[1], to[1], k) + shift[0], y = mix(from[2], to[2], k) + shift[1];
  const [px, py] = origin.split(' ').map(v => parseFloat(v) / 100), ox = px * W, oy = py * H;
  return [ox * (1 - s) + x + pt[0] * s, oy * (1 - s) + y + pt[1] * s, s];
}
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** Brush lettering: each glyph wipes in stroke-wise; p is the line's progress 0->1. Latin text falls back to a serif line. */
function Brush({text, x, y, size, fill = PAPER, p = 1, id, gap = .98, align = 'start', glow = ''}:
  {text: string; x: number; y: number; size: number; fill?: string; p?: number; id: string; gap?: number; align?: 'start' | 'middle' | 'end'; glow?: string}) {
  if (!text || p <= 0) return null;
  const filter = glow ? {filter: `drop-shadow(0 0 3px rgba(30,15,5,.85)) drop-shadow(0 0 18px ${glow}) drop-shadow(0 6px 16px rgba(0,0,0,.6))`} : {filter: 'drop-shadow(0 6px 16px rgba(0,0,0,.55))'};
  if (isLatin(text)) {
    const k = Math.min(1, 1680 / (text.length * size * .62 * .56)), font = size * .62 * k, width = text.length * font * .56, left = align === 'middle' ? x - width / 2 : align === 'end' ? x - width : x;
    return <g style={filter} opacity={clamp(p * 1.4)}>
      <text x={left} y={y + size * .62} fontFamily='Georgia, "Times New Roman", serif' fontWeight={700} fontSize={font} letterSpacing={font * .08} fill={fill}>{text}</text>
    </g>;
  }
  const chars = Array.from(text), total = ((chars.length - 1) * gap + 1) * size;
  const ox0 = align === 'middle' ? x - total / 2 : align === 'end' ? x - total : x;
  return <g style={filter}>{chars.map((ch, i) => {
    const q = clamp(p * chars.length - i);
    if (q <= 0 || !GLYPHS[ch]) return null;
    return <g key={i} transform={`translate(${ox0 + i * size * gap} ${y}) scale(${size / 1000})`}>
      <defs><mask id={`${id}-${i}`} maskUnits="userSpaceOnUse" x="-150" y="-150" width="1300" height="1300">
        <path d="M-80 80 L1040 80 L-80 320 L1040 320 L-80 550 L1040 550 L-80 790 L1040 790 L-80 1030 L1040 1030"
          fill="none" stroke="white" strokeWidth="255" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - q)} />
      </mask></defs>
      <path d={GLYPHS[ch]} fill={fill} mask={`url(#${id}-${i})`} />
    </g>;
  })}</g>;
}

/** The film's motif: a shout turned into rings rolling out from (x, y) toward `dir` degrees.
 * strength scales brightness/width/count; breakAt (px radius) makes rings shatter into falling fragments past that radius. */
function Echo({t, at, x, y, dir = 0, spread = 38, strength = 1, n = 5, gap = .26, speed = 900, maxR = 1500, color = GOLD, breakAt = 0, seed = 1, day = false}:
  {t: number; at: number; x: number; y: number; dir?: number; spread?: number; strength?: number; n?: number; gap?: number; speed?: number; maxR?: number; color?: string; breakAt?: number; seed?: number; day?: boolean}) {
  if (t < at || strength <= 0) return null;
  const rings = [];
  for (let i = 0; i < n; i++) {
    const d = t - at - i * gap;
    if (d <= 0) continue;
    const r = 40 + speed * d * (1 - .25 * clamp(d / 3));
    if (r > maxR) continue;
    let alpha = Math.min(1, strength * 1.15) * (1 - Math.pow(r / maxR, 1.6)) * clamp(d / .1) * (1 - i * .07);
    const width = (34 - i * 3) * (.45 + .55 * strength) * (1 - .5 * r / maxR);
    const broken = breakAt > 0 && r > breakAt, k = broken ? clamp((r - breakAt) / 260) : 0;
    if (broken) alpha *= 1 - k;
    if (alpha <= .01) continue;
    const a0 = (dir - spread) * Math.PI / 180, a1 = (dir + spread) * Math.PI / 180;
    if (!broken) {
      const dpath = `M ${x + Math.cos(a0) * r} ${y + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${x + Math.cos(a1) * r} ${y + Math.sin(a1) * r}`;
      const dust = seeded(seed * 53 + i * 11);
      for (let j = 0; j < 22; j++) {
        const u = dust(), ang = (dir - spread + 2 * spread * u) * Math.PI / 180, rr = r + (dust() - .5) * width * 3, tw = .4 + .6 * Math.abs(Math.sin(d * 9 + j));
        rings.push(<circle key={`${i}d${j}`} cx={x + Math.cos(ang) * rr} cy={y + Math.sin(ang) * rr} r={1.2 + dust() * width * .16} fill="#fffbe8" opacity={alpha * tw * .8} />);
      }
      rings.push(<g key={i} opacity={alpha}>
        {day && <path d={dpath} fill="none" stroke="#7a3a08" strokeWidth={width * 1.25} strokeLinecap="round" opacity={.35} />}
        <path d={dpath} fill="none" stroke={color} strokeWidth={width * 4.5} strokeLinecap="round" opacity={.14} />
        <path d={dpath} fill="none" stroke={color} strokeWidth={width * 2.2} strokeLinecap="round" opacity={.3} />
        <path d={dpath} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity={.75} />
        <path d={dpath} fill="none" stroke="#fffaf0" strokeWidth={Math.max(2, width * .32)} strokeLinecap="round" />
      </g>);
    } else {
      // shatter: the arc splits into shards that drift apart, tumble and drop
      const rnd = seeded(seed * 31 + i * 7), shards = 9;
      for (let j = 0; j < shards; j++) {
        const u0 = j / shards, u1 = u0 + .7 / shards, jit = (rnd() - .5) * 2;
        const aa = a0 + (a1 - a0) * u0, ab = a0 + (a1 - a0) * u1, rr = r + jit * 40 * k;
        const fall = 140 * k * k * (.6 + rnd()), sx = Math.cos((aa + ab) / 2) * 40 * k * jit;
        const p0 = [x + Math.cos(aa) * rr + sx, y + Math.sin(aa) * rr + fall], p1 = [x + Math.cos(ab) * rr + sx, y + Math.sin(ab) * rr + fall];
        rings.push(<g key={`${i}-${j}`} opacity={alpha}><line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke={color} strokeWidth={width * 2 * (1 - .4 * k)} strokeLinecap="round" opacity={.3} />
          <line x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke="#fffaf0" strokeWidth={width * .45 * (1 - .4 * k)} strokeLinecap="round" /></g>);
      }
    }
  }
  return <g style={day ? undefined : {mixBlendMode: 'screen'}}>{rings}</g>;
}

/** Foreground grass silhouettes swaying in the wind; `drift` moves them faster than the plate for parallax depth. */
function Grass({t, side = 'both', color = '#0d140c', height = 260, wind = 1, n = 34, seed = 3, drift = 0, opacity = 1, rim = ''}:
  {t: number; side?: 'left' | 'right' | 'both' | 'bottom'; color?: string; height?: number; wind?: number; n?: number; seed?: number; drift?: number; opacity?: number; rim?: string}) {
  if (opacity <= 0) return null;
  const r = seeded(seed), blades = Array.from({length: n}, () => ({u: r(), h: .45 + r() * .7, w: 10 + r() * 22, ph: r() * 6, lean: (r() - .5) * .5}));
  const place = (u: number) => side === 'left' ? u * 520 : side === 'right' ? W - u * 520 : u * W;
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity}}>
    {blades.map((b, i) => {
      const x = place(b.u) + drift * (.6 + b.h), hgt = height * b.h * (side === 'bottom' ? .7 : 1);
      const sway = (Math.sin(t * 1.7 * wind + b.ph) * .6 + Math.sin(t * 3.1 * wind + b.ph * 2) * .25) * 70 * wind + b.lean * 120;
      const tipX = x + sway, tipY = H - hgt, cx = x + sway * .35, cy = H - hgt * .55;
      const d = `M ${x - b.w} ${H + 10} Q ${cx - b.w * .4} ${cy} ${tipX} ${tipY} Q ${cx + b.w * .4} ${cy} ${x + b.w} ${H + 10} Z`;
      return <g key={i}><path d={d} fill={color} />{rim && <path d={`M ${tipX} ${tipY} Q ${cx + b.w * .4} ${cy} ${x + b.w} ${H + 10}`} fill="none" stroke={rim} strokeWidth={2} opacity={.55} />}</g>;
    })}
  </svg>;
}

/** Drifting mist banks (soft ellipses) across a band of the frame. */
function Mist({t, y0 = 500, y1 = 800, color = '255,255,255', amount = .35, n = 7, speed = 18, seed = 5}:
  {t: number; y0?: number; y1?: number; color?: string; amount?: number; n?: number; speed?: number; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), banks = Array.from({length: n}, () => ({x: r() * (W + 800) - 400, y: y0 + r() * (y1 - y0), rx: 300 + r() * 420, ry: 40 + r() * 70, v: .5 + r(), ph: r() * 6}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
    <defs><radialGradient id={`mist${seed}`}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity="1" /><stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient></defs>
    {banks.map((b, i) => {
      const x = ((b.x + t * speed * b.v) % (W + 1000)) - 500;
      return <ellipse key={i} cx={x} cy={b.y + Math.sin(t * .3 + b.ph) * 10} rx={b.rx} ry={b.ry} fill={`url(#mist${seed})`} opacity={amount * (.5 + .5 * Math.sin(t * .4 + b.ph) ** 2)} />;
    })}
  </svg>;
}

/** Volumetric light shafts from a source point (screen blend, outside the plate box). */
function Rays({t, x, y, color = '255,226,160', amount = .5, n = 7, spread = 70, dir = 120, length = 2200, seed = 2}:
  {t: number; x: number; y: number; color?: string; amount?: number; n?: number; spread?: number; dir?: number; length?: number; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), rays = Array.from({length: n}, () => ({a: dir + (r() - .5) * spread, w: 2 + r() * 5, ph: r() * 6}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    <defs><linearGradient id={`ray${seed}`} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={x + Math.cos(dir * Math.PI / 180) * length} y2={y + Math.sin(dir * Math.PI / 180) * length}>
      <stop offset="0" stopColor={`rgb(${color})`} stopOpacity=".9" /><stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></linearGradient>
      <radialGradient id={`raysrc${seed}`}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity=".9" /><stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient></defs>
    <circle cx={x} cy={y} r={340} fill={`url(#raysrc${seed})`} opacity={amount * .7} />
    {rays.map((ray, i) => {
      const a = (ray.a + Math.sin(t * .25 + ray.ph) * 2.5) * Math.PI / 180, wa = ray.w * Math.PI / 180;
      const p1 = [x + Math.cos(a - wa) * length, y + Math.sin(a - wa) * length], p2 = [x + Math.cos(a + wa) * length, y + Math.sin(a + wa) * length];
      return <polygon key={i} points={`${x},${y} ${p1.join(',')} ${p2.join(',')}`} fill={`url(#ray${seed})`} opacity={amount * (.25 + .2 * Math.sin(t * .7 + ray.ph))} />;
    })}
  </svg>;
}

/** Floating specks: pollen/dust by day, fireflies or embers at night (twinkling glow). */
function Motes({t, n = 40, color = '255,236,180', size = 3, amount = 1, area = [0, 0, W, H], rise = 12, glow = false, seed = 9}:
  {t: number; n?: number; color?: string; size?: number; amount?: number; area?: number[]; rise?: number; glow?: boolean; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), [ax, ay, bx, by] = area, pts = Array.from({length: n}, () => ({x: ax + r() * (bx - ax), y: ay + r() * (by - ay), s: .5 + r(), ph: r() * 6, v: .5 + r()}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    {pts.map((m, i) => {
      const x = m.x + Math.sin(t * .6 * m.v + m.ph) * 40, y = ay + ((m.y - ay - t * rise * m.v) % (by - ay) + (by - ay)) % (by - ay);
      const tw = glow ? Math.max(0, Math.sin(t * 1.3 * m.v + m.ph * 3)) : .6 + .4 * Math.sin(t * 2 + m.ph);
      return <g key={i} opacity={amount * tw}>
        {glow && <circle cx={x} cy={y} r={size * m.s * 6} fill={`rgba(${color},.18)`} />}
        <circle cx={x} cy={y} r={size * m.s} fill={`rgb(${color})`} />
      </g>;
    })}
  </svg>;
}

/** Soft warm/cool glow blob (window light, lantern, sun) — screen blend. */
const Glow = ({x, y, r, color = '255,190,110', amount = 1}: {x: number; y: number; r: number; color?: string; amount?: number}) => amount <= 0 ? null :
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', opacity: amount, mixBlendMode: 'screen',
    background: `radial-gradient(circle, rgba(${color},.95) 0%, rgba(${color},.45) 25%, rgba(${color},.12) 55%, rgba(${color},0) 72%)`}} />;

/** Predator eyes: two glints that ignite at `at`, breathe, and blink once. */
function Eyes({t, at, x, y, gap = 70, size = 16, color = WOLF, tilt = 6}: {t: number; at: number; x: number; y: number; gap?: number; size?: number; color?: string; tilt?: number}) {
  const on = sm((t - at) / .35);
  if (on <= 0) return null;
  const blinkT = (t - at - 1.9), blink = blinkT > 0 && blinkT < .16 ? .12 : 1;
  const breathe = .85 + .15 * Math.sin((t - at) * 3.2);
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
    <defs><radialGradient id="eyeglow"><stop offset="0" stopColor={color} stopOpacity=".9" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient></defs>
    {[-1, 1].map(k => <g key={k} transform={`translate(${x + k * gap / 2} ${y + k * tilt}) scale(1 ${blink})`} opacity={on * breathe}>
      <circle r={size * 7} fill="url(#eyeglow)" opacity={.35} />
      <ellipse rx={size * 1.25} ry={size * .62} fill={color} transform={`rotate(${k * -12})`} />
      <ellipse rx={size * .5} ry={size * .3} fill="#f6ffe8" transform={`rotate(${k * -12})`} />
    </g>)}
  </svg>;
}

/** Small birds bursting up out of the trees when the shout lands. */
function Birds({t, at, x, y, n = 9, spread = 220, seed = 4, color = '#1d2318', scale = 1}: {t: number; at: number; x: number; y: number; n?: number; spread?: number; seed?: number; color?: string; scale?: number}) {
  const d = t - at;
  if (d < 0 || n <= 0) return null;
  const r = seeded(seed), birds = Array.from({length: n}, () => ({dx: (r() - .5) * spread, vx: (r() - .3) * 160, vy: 120 + r() * 140, ph: r() * 6, s: .7 + r() * .6}));
  return <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
    {birds.map((b, i) => {
      const bx = x + b.dx + b.vx * d, by = y - b.vy * d + 18 * d * d, flap = Math.sin(d * 22 + b.ph) * 9 * b.s * scale, s = 9 * b.s * scale;
      return <path key={i} d={`M ${bx - s} ${by - flap} Q ${bx - s * .4} ${by - 2} ${bx} ${by} Q ${bx + s * .4} ${by - 2} ${bx + s} ${by - flap}`}
        fill="none" stroke={color} strokeWidth={2.4 * scale} strokeLinecap="round" opacity={clamp(1 - (d - 3) / 1)} />;
    })}
  </svg>;
}

/** Colour grade wash over the frame (outside the plate box): multiply tint + optional screen lift. */
const Grade = ({tint, amount = 1, lift = '', liftAmount = 0}: {tint: string; amount?: number; lift?: string; liftAmount?: number}) => <>
  {amount > 0 && <div style={{position: 'absolute', inset: 0, background: tint, mixBlendMode: 'multiply', opacity: amount}} />}
  {lift && liftAmount > 0 && <div style={{position: 'absolute', inset: 0, background: lift, mixBlendMode: 'screen', opacity: liftAmount}} />}
</>;

/** Film finish: vignette, deterministic grain and thin letterbox bars. */
function Film({frame, vignette = .45, grain = .07, bars = 54, black = 0}: {frame: number; vignette?: number; grain?: number; bars?: number; black?: number}) {
  const ref = useCanvas(frame, (c, f) => {
    const r = seeded(f * 7919 + 17), img = c.createImageData(480, 270);
    for (let i = 0; i < img.data.length; i += 4) {const v = r() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;}
    c.putImageData(img, 0, 0);
  });
  return <>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 48%, rgba(0,0,0,${vignette}) 100%)`}} />
    <canvas ref={ref} width={480} height={270} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: grain, mixBlendMode: 'overlay', imageRendering: 'auto'}} />
    {bars > 0 && <><div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bars, background: INK}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bars, background: INK}} /></>}
    {black > 0 && <div style={{position: 'absolute', inset: 0, background: INK, opacity: black}} />}
  </>;
}
/** Decaying camera shake offset [x, y] in px. */
const shake = (t: number, at: number, power = 14, len = .5) => {
  const d = t - at;
  if (d < 0 || d > len) return [0, 0];
  const k = (1 - d / len) * power;
  return [Math.sin(d * 83) * k, Math.cos(d * 67) * k * .7];
};
/** Handheld drift: tiny slow wobble for living frames. */
const handheld = (t: number, amp = 4, seed = 1) => [Math.sin(t * .9 + seed) * amp + Math.sin(t * 2.3 + seed * 2) * amp * .35, Math.cos(t * .7 + seed * 3) * amp * .7];
const fadeEdges = (t: number, dur: number, inS = .2, outS = .2) => Math.min(sm(t / inS), sm((dur - t) / outS));

/** Camera by keyframes [time, zoom, focusX, focusY] in plate pixels: the focus point is centred, clamped so the plate always covers the frame.
 * Between keys the move eases (easeInOut). Returns [scale, left, top]. */
type Key = [number, number, number, number];
function cam(t: number, keys: Key[], shift = [0, 0]): number[] {
  let k0 = keys[0], k1 = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t <= keys[i + 1][0]) {k0 = keys[i]; k1 = keys[i + 1]; break;}
  if (t < keys[0][0]) k1 = k0;
  if (t > keys[keys.length - 1][0]) k0 = k1;
  const u = k1[0] > k0[0] ? easeInOut(clamp((t - k0[0]) / (k1[0] - k0[0]))) : 1;
  const s = mix(k0[1], k1[1], u), fx = mix(k0[2], k1[2], u), fy = mix(k0[3], k1[3], u);
  const left = Math.min(0, Math.max(W - W * s, W / 2 - fx * s)) + shift[0], top = Math.min(0, Math.max(H - H * s, H / 2 - fy * s)) + shift[1];
  return [s, left, top];
}
/** Plate point -> screen point for a camera from cam(). */
const sp = (c: number[], x: number, y: number) => [c[1] + x * c[0], c[2] + y * c[0]];
/** A plate shown through a cam() camera; children are drawn in plate pixels. */
function Shot({asset, frame, c, opacity = 1, children}: {asset: any; frame: number; c: number[]; opacity?: number; children?: any}) {
  if (opacity <= 0) return null;
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: c[1], top: c[2], width: W * c[0], height: H * c[0]}}>
      {asset ? <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1b2440, #3a3050 60%, #20283a)'}} />}
      {children}
    </div>
  </div>;
}
/** Rising chimney smoke wisps (plate pixels). */
function Smoke({t, x, y, n = 6, color = '235,235,240', amount = .5, height = 240, seed = 8, lean = 40}: {t: number; x: number; y: number; n?: number; color?: string; amount?: number; height?: number; seed?: number; lean?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), puffs = Array.from({length: n}, () => ({ph: r(), s: .7 + r() * .6}));
  const id = `smk${seed}-${Math.round(x)}`;
  return <g><defs><radialGradient id={id}><stop offset="0" stopColor={`rgb(${color})`} stopOpacity=".7" /><stop offset=".6" stopColor={`rgb(${color})`} stopOpacity=".25" />
    <stop offset="1" stopColor={`rgb(${color})`} stopOpacity="0" /></radialGradient></defs>{puffs.map((p, i) => {
    const k = (t * .16 + p.ph) % 1, px = x + Math.sin(k * 5 + i) * 14 + lean * k * k, py = y - k * height, rr = (16 + 50 * k) * p.s;
    return <ellipse key={i} cx={px} cy={py} rx={rr} ry={rr * .8} fill={`url(#${id})`} opacity={amount * Math.sin(Math.PI * k)} />;
  })}</g>;
}
/** Twinkle star glint. */
const Glint = ({x, y, s = 1, opacity = 1, color = '#fffbe8'}: {x: number; y: number; s?: number; opacity?: number; color?: string}) => opacity <= 0 ? null :
  <g opacity={opacity} style={{mixBlendMode: 'screen'}}>
    <defs><radialGradient id={`gl${Math.round(x)}${Math.round(y)}`}><stop offset="0" stopColor={color} stopOpacity=".5" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient></defs>
    <circle cx={x} cy={y} r={34 * s} fill={`url(#gl${Math.round(x)}${Math.round(y)})`} />
    <path transform={`translate(${x} ${y}) scale(${s})`} fill={color} d="M 0 -30 C 3 -7 7 -3 30 0 C 7 3 3 7 0 30 C -3 7 -7 3 -30 0 C -7 -3 -3 -7 0 -30 Z" />
  </g>;

// Night: cold open (the third cry, told first), the title, and the night after.
// cold: moonlit ridge -> the boy screams, pale rings roll out -> the village far below stays dark, the rings thin out and die.
// title: brush title over the dimmed ridge, wolf eyes open in the grass. lamb: slow pull-back on the boy hugging a lamb.
export const meta = {
  params: {
    mode: {label: '模式', type: 'select', default: 'cold', options: [{value: 'cold', label: '冷开场'}, {value: 'title', label: '片名'}, {value: 'lamb', label: '那一晚'}]},
    title: {label: '片名', type: 'text', default: '狼来了', maxLength: 8},
    subtitle: {label: '副标题', type: 'text', default: '一个关于回声的故事', maxLength: 24},
    lampCue: {label: '“没亮灯”卡点词', type: 'text', default: '一盏灯', maxLength: 24},
    cryCue: {label: '哭的卡点词', type: 'text', default: '哭了', maxLength: 24},
  },
  slots: {'night-ridge': '月夜山脊', 'boy-night-cry': '月下呼救', 'night-lamb': '抱着小羊'},
};
const MOUTH = [629, 210], VILLAGE = [1330, 770], ROCK = [420, 520];

export default function Night(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props);
  const m = mode(props, 'cold');

  if (m === 'cold') {
    const shout = start(1, 2.6), quiet = start(2, shout + 2.2), lamp = at(txt(props, 'lampCue'), quiet + 1.2);
    const A = t < shout - .04, B = !A && t < quiet - .08, C = !A && !B;
    const [kx, ky] = shake(t, shout + .05, 12, .7), [hx, hy] = handheld(t, 3, 2);
    const cA = cam(t, [[0, 1.22, 520, 560], [shout, 1.06, 700, 520]], [hx, hy]);
    const cB = cam(t, [[shout, 1.05, 700, 380], [quiet, 1.16, 640, 300]], [kx + hx, ky + hy]);
    const cC = cam(t, [[quiet - .1, 1.75, VILLAGE[0], VILLAGE[1] - 40], [dur, 1.95, VILLAGE[0], VILLAGE[1] - 20]], [hx * .5, hy * .5]);
    const mouth = sp(cB, MOUTH[0], MOUTH[1]);
    const far = sp(cC, ROCK[0] - 300, ROCK[1] - 700);
    return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden'}}>
      {A && <Shot asset={slot(props, 'night-ridge')} frame={props.frame} c={cA} />}
      {B && <Shot asset={slot(props, 'boy-night-cry')} frame={props.frame} c={cB} />}
      {C && <Shot asset={slot(props, 'night-ridge')} frame={props.frame} c={cC} />}
      <Mist t={t} y0={A ? 520 : 300} y1={A ? 760 : 900} color="170,190,235" amount={C ? .32 : .22} speed={22} seed={3} />
      {B && <Svg><Echo t={t} at={shout + .08} x={mouth[0]} y={mouth[1]} dir={18} spread={34} strength={.95} n={6} gap={.22} speed={1150} maxR={1900} color={MOON} /></Svg>}
      {C && <Svg><Echo t={t} at={quiet - 1.1} x={far[0]} y={far[1]} dir={37} spread={22} strength={.5} n={4} gap={.3} speed={1300} maxR={3400} color={MOON} seed={5} /></Svg>}
      {A && <Grass t={t} side="left" color="#060b10" height={360} wind={1.4} n={26} seed={11} rim="#9fb6e8" drift={-40 * clamp(t / shout)} />}
      <Motes t={t} n={22} color="210,225,255" size={2} amount={.5} rise={-18} seed={4} />
      <Grade tint="linear-gradient(180deg, #8ea6e0, #5a6aa0)" amount={.25} />
      <Film frame={props.frame} vignette={.6} grain={.08} black={Math.max(1 - sm(t / 1.6), C ? sm((t - lamp - .8) / 1.2) * .25 : 0, 1 - sm((dur - t) / .5))} />
    </div>;
  }

  if (m === 'title') {
    const p = clamp((t - .5) / 1.5), eyes = 2.1, [hx, hy] = handheld(t, 2, 5);
    const c = cam(t, [[0, 1.06, 960, 560], [dur, 1.1, 960, 600]], [hx, hy]);
    const title = txt(props, 'title'), sub = txt(props, 'subtitle');
    return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .4, .5)}}>
      <Shot asset={slot(props, 'night-ridge')} frame={props.frame} c={c} />
      <Grade tint="linear-gradient(180deg, #2c3a66, #10162a)" amount={.7} />
      <Mist t={t} y0={560} y1={860} color="150,170,220" amount={.3} speed={30} seed={8} />
      <Svg>
        <Echo t={t} at={.35} x={960} y={420} dir={0} spread={180} strength={.35} n={2} gap={.5} speed={520} maxR={1300} color={MOON} />
        <Brush id="tt" text={title} x={960} y={300} size={250} p={p} align="middle" fill="#f4f1ea" glow="rgba(170,200,255,.55)" />
      </Svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center', fontFamily: props.fonts.text, fontSize: 34, letterSpacing: 18,
        color: 'rgba(220,230,255,.85)', opacity: sm((t - 1.6) / .8), textShadow: '0 2px 14px rgba(0,0,0,.8)'}}>{sub}</div>
      <Eyes t={t} at={eyes} x={360} y={900} gap={46} size={7} />
      <Film frame={props.frame} vignette={.65} grain={.08} />
    </div>;
  }

  // lamb: the night after; slow pull-back, wool tufts trembling on the thorns, cold fireflies, a tear glint.
  const cry = at(txt(props, 'cryCue'), start(1, dur * .5) + 1.2), [hx, hy] = handheld(t, 2.5, 7);
  const c = cam(t, [[0, 1.2, 760, 460], [dur, 1.02, 900, 520]], [hx, hy]);
  const tufts = [[207, 173], [93, 400], [213, 693], [413, 920], [330, 470]];
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden'}}>
    <Shot asset={slot(props, 'night-lamb')} frame={props.frame} c={c}>
      <Svg>
        <defs><radialGradient id="tuft"><stop offset="0" stopColor="#f2f5ff" stopOpacity=".55" /><stop offset="1" stopColor="#f2f5ff" stopOpacity="0" /></radialGradient></defs>
        {tufts.map(([x, y], i) => <ellipse key={i} cx={x + Math.sin(t * 2.2 + i) * 6} cy={y + Math.cos(t * 1.7 + i) * 4} rx={40} ry={26} fill="url(#tuft)" opacity={.45 + .2 * Math.sin(t * 3 + i)} />)}
        <Glint x={742} y={478} s={.55} opacity={win(t, cry, cry + 2.4, .5) * (.6 + .4 * Math.sin(t * 5))} color="#e8f0ff" />
      </Svg>
    </Shot>
    <Glow x={sp(c, 1600, 60)[0]} y={sp(c, 1600, 60)[1]} r={260} color="200,215,255" amount={.35 + .05 * Math.sin(t * 1.3)} />
    <Mist t={t} y0={380} y1={700} color="150,170,220" amount={.3} speed={14} seed={12} />
    <Motes t={t} n={14} color="190,255,220" size={2.4} amount={.8} area={[900, 500, 1900, 1000]} rise={8} glow seed={13} />
    <Grade tint="linear-gradient(180deg, #9db0e6, #6a78b0)" amount={.22} />
    <Film frame={props.frame} vignette={.62} grain={.08} />
  </div>;
}
