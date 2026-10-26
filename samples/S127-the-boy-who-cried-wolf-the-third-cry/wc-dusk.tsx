import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// The Boy Who Cried Wolf: shared cinematic library. prepare.py joins it with each module into scenes/<module>.tsx and inlines
// only the Ma Shan Zheng (OFL) glyph outlines a module draws. No runtime fonts, randomness or clocks: everything is a function of t.
const GLYPHS: Record<string, string> = {"三":"M798 785Q805 779 811.5 779Q818 779 832 788Q850 796 866 798Q903 804 918 817Q933 830 933 855Q933 869 921.5 887.5Q910 906 899 909Q891 913 859.5 908.5Q828 904 820 900Q817 897 740 888.5Q663 880 627 884.5Q591 889 540 893Q450 900 293 936Q258 946 252.5 946Q247 946 225 959.5Q203 973 170 974Q146 974 138.5 972.5Q131 971 112 958Q87 941 83 941Q79 941 74.5 931.5Q70 922 67 910Q65 900 80 884Q92 873 102 869.5Q112 866 147 858Q386 814 602 805Q786 798 798 785ZM407 580Q473 569 483.5 565Q494 561 522.5 563Q551 565 564.5 565Q578 565 598 583Q617 601 619 614.5Q621 628 606 644Q595 657 589 664Q576 679 539 661Q520 652 484 654Q444 658 401.5 667Q359 676 352 681Q346 687 340.5 686Q335 685 314 673Q295 664 288.5 657.5Q282 651 277 638Q268 617 277 609Q289 601 407 580ZM477 333Q517 329 527.5 322.5Q538 316 547 319Q556 322 590.5 327.5Q625 333 635 340Q650 350 649 379.5Q648 409 631 423Q621 432 612 433Q603 434 582 428Q549 417 491 422.5Q433 428 387 444Q345 460 334 460Q328 460 308.5 445Q289 430 286 430Q273 430 270 401L269 384L324 366Q404 343 477 333Z","天":"M454 398Q458 388 462.5 387.5Q467 387 484 397Q501 405 506 411.5Q511 418 517 439Q524 464 523 496L522 513L569 511Q600 509 610 506.5Q620 504 624 500Q629 494 632.5 494Q636 494 653 498Q676 505 698 503Q717 501 726 505Q735 509 741 519Q756 544 740 559Q731 568 727 577Q724 582 715 582.5Q706 583 667 582Q610 580 565 580Q526 580 517 585Q508 590 507 612Q507 627 527.5 669.5Q548 712 570 741Q589 766 629 805Q669 844 706 872Q745 902 776 922Q805 942 817 953Q829 964 846 972Q862 981 881 998Q900 1015 900 1022Q900 1037 875 1042Q826 1052 787 1077L771 1088L749 1076Q728 1066 708 1049Q647 993 635 979L602 944Q580 920 575.5 912Q571 904 547.5 872Q524 840 520 827Q489 763 489 757Q489 752 483.5 744.5Q478 737 475 737Q473 737 473 742.5Q473 748 465 764Q457 780 453 789Q438 822 397 863Q380 880 380 883Q380 885 364.5 899.5Q349 914 344 915.5Q339 917 320 936Q303 952 272 974Q241 996 222 1002Q179 1021 144 1021Q110 1021 143 999Q144 998 145 997Q165 987 169 982.5Q173 978 175 978Q177 978 197.5 965Q218 952 228 946Q250 936 282 899.5Q314 863 343 812Q384 743 384 728Q384 724 386 720Q390 718 405.5 672.5Q421 627 423 612Q425 604 423.5 603Q422 602 413 604Q391 607 346 623.5Q301 640 292 646Q283 655 274 655Q265 655 248 645Q237 637 234 632.5Q231 628 233 618Q234 606 236.5 601.5Q239 597 250 590Q288 571 351 552Q420 533 430 527Q435 525 437 513.5Q439 502 446 449Q450 409 454 398ZM524 276Q573 257 585.5 257Q598 257 613 279L625 299L614 331Q602 361 599.5 363.5Q597 366 589 363Q571 355 524 376Q504 384 473 380Q400 373 390 369Q382 365 357 363Q329 361 315 358Q301 355 292 352.5Q283 350 282 348.5Q281 347 282 343Q284 334 343 326Q395 318 431.5 308.5Q468 299 524 276Z","第":"M587 430Q602 415 664 442Q688 452 693 458.5Q698 465 696 484Q694 504 685 514Q679 520 677 527.5Q675 535 673 557Q671 591 665.5 596Q660 601 607 600L554 598L552 607Q549 616 551 633L552 649H613Q674 650 724 660Q791 673 810 694Q816 701 818.5 730.5Q821 760 816 778L798 851Q795 864 789 877.5Q783 891 780 891Q777 891 774.5 900.5Q772 910 768.5 910Q765 910 765 913.5Q765 917 758.5 924Q752 931 740.5 944.5Q729 958 721.5 958Q714 958 698 966Q687 971 683 971.5Q679 972 672 968Q662 962 654 962Q642 962 642 943Q642 936 633 930Q623 923 605 905.5Q587 888 587 886Q587 883 582 877Q579 874 576.5 865.5Q574 857 574 850.5Q574 844 576 843Q579 843 606 850Q668 867 680 856Q687 850 687 845.5Q687 841 698 819Q709 797 709 789Q709 781 714.5 760Q720 739 718 734Q715 728 694 720.5Q673 713 649 710Q620 707 591.5 706.5Q563 706 558 709.5Q553 713 554 786Q557 1048 548 1058Q543 1064 537 1078.5Q531 1093 531 1101Q531 1109 524.5 1123.5Q518 1138 511 1143Q506 1147 494 1146Q486 1145 482 1141Q478 1137 475.5 1118.5Q473 1100 472.5 1072.5Q472 1045 472 989Q473 870 470 866Q468 865 467 864Q466 863 460.5 867Q455 871 448 877.5Q441 884 427 898Q396 928 363.5 947Q331 966 331 969.5Q331 973 327 973Q323 973 309 984Q295 995 293 995Q291 995 267 1009Q208 1046 203 1030Q201 1026 223 1008Q274 964 369 838Q419 771 421.5 765.5Q424 760 431 749Q444 729 441 726Q439 724 403.5 734Q368 744 360 748Q339 760 324 787Q314 802 307 808Q300 814 289 814Q282 814 275 805.5Q268 797 268 789Q268 782 263 772Q258 762 261 760Q264 758 266.5 746Q269 734 273 727L280 713Q284 706 291 666Q299 620 303 606Q307 592 314 585Q323 577 332 580Q341 583 342.5 583Q344 583 353 587Q363 593 464 560Q468 558 468 527V495L451 497Q433 500 416 506.5Q399 513 386 511Q372 509 368 504Q364 499 370 488Q374 480 383.5 476Q393 472 422 466L468 456Q492 451 536.5 443.5Q581 436 587 430ZM579 508V480H565Q550 480 548.5 483Q547 486 544 515L541 543H551Q561 543 570 540Q577 537 578 532.5Q579 528 579 508ZM471 635 472 610H462Q450 611 427 617.5Q404 624 398 629Q391 636 387.5 636Q384 636 382 642.5Q380 649 372.5 668.5Q365 688 369 688Q373 688 408.5 678.5Q444 669 457 664Q467 661 469 657Q471 653 471 635ZM364 341Q374 331 383 333.5Q392 336 414 339Q434 342 439 346Q444 350 452 367Q469 403 450 421Q439 432 427 430Q410 426 395.5 414.5Q381 403 358 375Q346 360 364 341ZM653 329Q661 323 677 321.5Q693 320 696 325Q698 328 718 338Q735 346 742.5 357Q750 368 750 386Q750 403 739 414Q731 422 726 423.5Q721 425 707 424Q694 423 687.5 420Q681 417 669 406Q652 390 649.5 384Q647 378 637.5 367.5Q628 357 630 351Q637 337 642 334Q642 337 653 329ZM357 191Q365 184 370.5 185Q376 186 388 197Q402 210 406 210Q407 210 408 210.5Q409 211 409 213Q408 216 411 228L414 240L440 238Q460 236 464.5 237Q469 238 477 247Q490 263 486.5 278.5Q483 294 465 299Q422 310 402 295L389 285L363 313Q313 367 291 382Q271 395 204 455Q197 461 190 462.5Q183 464 181 460Q178 452 213 408Q233 382 235.5 378.5Q238 375 248 364Q258 352 268.5 336.5Q279 321 279 317.5Q279 314 285 310Q296 301 323 256.5Q350 212 350 203Q350 199 357 191ZM601 149Q615 146 624.5 149Q634 152 647 163Q660 174 663 179Q666 184 666 197Q667 216 658 228Q649 240 652 240Q659 239 692 233.5Q725 228 727 227Q731 224 749 227Q773 230 782.5 245Q792 260 783 282Q779 294 764.5 298Q750 302 716 300Q677 298 668 304Q651 316 629 301Q615 292 612.5 293.5Q610 295 602 311Q588 341 551 369Q538 378 521.5 392Q505 406 502 406Q489 406 510 370Q526 341 533 326.5Q540 312 544 304.5Q548 297 568 239Q588 181 591 167Q595 151 601 149Z"};
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

const MEDIA: Record<string, string> = {"dusk-grass":"release-assets/a408a842fbb69fa5b02796e0cc3722d4acc9b58bb791186608d85e296c8b8f88.webp","dusk-hill":"release-assets/e44c0057ade29f042886bfe1b353631ab530cee74266e335b26ca7661e11f2ab.webp","wolf":"release-assets/30e14800abb1a2928d0511ae299ee1a9bd50fa362e964667e598345517f35a14.webp","wolf-v":"release-assets/5aec6817e5acc7a6a9072336d5c82f5503bb590eb7019ad4fc83d59d8b59bf33.mp4"};
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

// Dusk: a time-lapse sunset on the hill (the light drains, the purple rises), then a low push into the dark grass where
// two green eyes ignite on the cue word; then the wolf itself, a slow menacing push with a pulsing rim light.
export const meta = {
  params: {
    mode: {label: '模式', type: 'select', default: 'dusk', options: [{value: 'dusk', label: '两点绿光'}, {value: 'wolf', label: '狼'}]},
    when: {label: '时间字', type: 'text', default: '第三天', maxLength: 8},
    eyesCue: {label: '绿光卡点词', type: 'text', default: '绿光', maxLength: 24},
    hungryCue: {label: '饿狼卡点词', type: 'text', default: '饿极了', maxLength: 24},
  },
  slots: {'dusk-hill': '傍晚山坡', 'dusk-grass': '暗草丛', wolf: '饿狼', 'wolf-v': '饿狼（视频，可缺）'},
};
const SUN = [1472, 203], DARK = [1050, 640], WOLF_HEAD = [960, 560], WOLF_EYE = [892, 548];

export default function Dusk(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const m = mode(props, 'dusk');

  if (m === 'dusk') {
    const grassAt = start(1, dur * .5) - .05, eyes = at(txt(props, 'eyesCue'), grassAt + 1.6), A = t < grassAt, [hx, hy] = handheld(t, 2, 4);
    const sink = clamp(t / grassAt);
    const cA = cam(t, [[0, 1.08, 1200, 420], [grassAt, 1.16, 1300, 380]], [hx, hy]);
    const cB = cam(t, [[grassAt, 1.04, 960, 560], [eyes, 1.16, DARK[0], DARK[1]], [dur, 1.24, DARK[0], DARK[1]]], [hx * .6, hy * .6]);
    const sun = sp(cA, SUN[0], SUN[1] + 40 * sink), eyePt = sp(cB, DARK[0], DARK[1]);
    return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden'}}>
      {A ? <Shot asset={slot(props, 'dusk-hill')} frame={props.frame} c={cA}>
        <Svg><Smoke t={t} x={1325} y={500} seed={11} n={5} color="230,200,210" /></Svg></Shot>
        : <Shot asset={slot(props, 'dusk-grass')} frame={props.frame} c={cB} />}
      {A && <Glow x={sun[0]} y={sun[1]} r={300 * (1 - .4 * sink)} color="255,170,90" amount={.7 * (1 - .6 * sink)} />}
      {A && <Rays t={t} x={sun[0]} y={sun[1]} dir={185} spread={70} amount={.4 * (1 - sink)} n={7} color="255,170,110" seed={6} />}
      {A && <Grade tint="linear-gradient(180deg, #6a4c9a, #3a2a5a)" amount={.5 * sm(sink)} />}
      {!A && <Grade tint="linear-gradient(180deg, #6a4c9a, #2a1e44)" amount={.35 + .25 * sm((t - eyes) / 1.2)} />}
      {!A && <Eyes t={t} at={eyes} x={eyePt[0]} y={eyePt[1]} gap={86} size={10} />}
      <Grass t={t} side={A ? 'bottom' : 'both'} color={A ? '#1a1424' : '#07060c'} height={A ? 170 : 360} wind={A ? 1.2 : .7} n={A ? 40 : 30} seed={31} rim={A ? '#ffb48a' : '#c49ad8'} />
      <Motes t={t} n={18} color="255,200,150" size={2.2} amount={A ? .5 : .2} rise={6} seed={19} />
      {A && <Svg><Brush id="when" text={txt(props, 'when')} x={140} y={120} size={110} p={clamp((t - .15) / .7) * (1 - sm((t - grassAt + .5) / .4))} glow="rgba(255,170,120,.5)" /></Svg>}
      <Film frame={props.frame} vignette={A ? .5 : .7} grain={.08} />
    </div>;
  }

  // wolf
  const hungry = at(txt(props, 'hungryCue'), dur * .55), [hx, hy] = handheld(t, 2.5, 6), [kx, ky] = shake(t, hungry, 8, .6);
  const wolfClip = slot(props, 'wolf-v');
  const c = wolfClip ? cam(t, [[0, 1.0, 960, 540], [dur, 1.05, 940, 540]], [hx * .5 + kx, hy * .5 + ky]) : cam(t, [[0, 1.06, 900, 520], [dur, 1.3, WOLF_HEAD[0], WOLF_HEAD[1]]], [hx + kx, hy + ky]);
  const eye = sp(c, WOLF_EYE[0], WOLF_EYE[1]), back = sp(c, 760, 330);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden'}}>
    <Shot asset={wolfClip ?? slot(props, 'wolf')} frame={props.frame} c={c} />
    <Glow x={back[0]} y={back[1]} r={420} color="255,110,60" amount={.25 + .12 * Math.sin(t * 2.4)} />
    {!wolfClip && <Glow x={eye[0]} y={eye[1]} r={30 * c[0]} color="190,255,140" amount={.35 + .3 * sm((t - hungry) / .3)} />}
    <Grade tint="linear-gradient(180deg, #8a4a6a, #3a2240)" amount={.22 + .1 * sm(t / dur)} />
    <Grass t={t} side="bottom" color="#120a12" height={230} wind={1.6} n={36} seed={33} rim="#ff9a6a" />
    <Film frame={props.frame} vignette={.68} grain={.09} />
  </div>;
}
