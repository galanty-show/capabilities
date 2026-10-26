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
const MEDIA: Record<string, string> = {"bridge":"release-assets/567d674372cacba6c48d394c730bd3bc5c1dddb41ca40d22daa9446ef88bca40.webp","chase":"release-assets/5a048e5cc1840b8cc6a22d6976a6ba5be18844822680f74e180794c2ccf66d06.webp"};
// 矢量剪影（trace.py 从 Gemini 黑剪影描出，高 1000、底边居中锚点）：horseman 无头骑士、ichabod 伊卡博德、throw 立镫掷物。
const SIL: Record<string, {w: number; h: number; d: string}> = {"horseman":{"w":1405,"h":1000,"d":"M869 1 872 0 901 16 932 42 906 63 927 86 907 110 908 119 904 154 908 166 906 174 913 181 921 183 940 196 946 195 963 205 965 209 979 193 964 186 973 186 983 171 998 158 1030 147 1004 149 1018 143 999 133 1022 137 1064 111 1068 108 1066 105 1057 110 1066 101 1086 92 1101 90 1150 96 1131 81 1126 73 1142 83 1167 92 1198 86 1216 88 1231 96 1239 105 1253 87 1274 67 1277 69 1274 105 1286 96 1305 75 1302 104 1291 135 1302 145 1308 162 1333 191 1340 215 1363 254 1372 261 1375 273 1403 323 1405 337 1385 374 1377 379 1358 381 1338 380 1327 377 1322 372 1319 358 1307 348 1278 359 1249 365 1208 369 1175 366 1173 368 1140 436 1141 502 1122 551 1108 572 1152 603 1206 637 1214 652 1220 675 1219 689 1194 731 1163 810 1130 832 1105 860 1093 863 1064 879 1056 877 1054 860 1063 809 1074 805 1082 797 1099 802 1103 800 1108 790 1102 784 1107 783 1104 780 1114 774 1109 772 1132 759 1140 749 1164 700 1166 685 1164 677 1160 671 1142 663 1062 646 1061 648 1077 677 1109 722 1111 733 1104 764 1093 777 1037 800 985 833 975 836 965 835 940 826 897 822 893 818 858 806 854 801 856 797 882 773 913 756 932 764 938 782 944 784 944 772 950 776 952 771 979 776 1012 767 1048 747 1052 737 1045 727 994 689 954 653 919 632 914 626 913 617 888 617 881 623 862 626 847 625 841 617 831 618 818 623 802 623 794 621 790 612 748 606 701 593 681 646 658 683 652 702 652 720 659 731 676 743 757 783 768 792 780 817 797 838 809 863 807 871 811 900 811 910 804 913 787 907 761 893 744 879 745 873 741 863 748 848 738 849 732 855 726 840 724 845 721 842 712 823 706 817 668 791 645 780 630 776 637 805 656 832 688 871 715 895 732 921 769 947 772 955 797 988 796 994 779 1000 724 998 719 996 708 980 710 963 707 957 697 952 690 957 672 946 663 933 651 904 628 871 573 810 545 784 542 772 538 698 527 660 511 634 472 593 435 551 419 527 409 504 403 483 402 463 414 406 406 404 392 410 373 426 350 464 348 458 339 479 331 491 301 518 282 528 262 533 233 550 198 557 193 553 214 547 233 537 231 536 188 552 157 555 128 553 103 545 145 549 107 538 68 516 61 510 66 511 68 507 78 515 84 516 62 501 42 475 87 501 113 506 70 484 43 450 20 446 26 444 24 442 0 444 23 436 48 435 80 443 81 442 78 440 91 439 113 441 146 451 149 449 169 453 186 452 193 450 159 442 138 428 159 437 173 439 196 439 214 435 237 423 285 383 318 367 344 360 367 356 419 363 437 359 472 335 501 319 522 309 546 304 579 302 647 310 654 297 674 299 668 281 668 269 674 264 684 264 702 277 698 246 719 209 722 193 726 186 676 217 660 225 637 230 594 254 476 290 456 283 435 267 402 268 383 262 352 226 354 222 334 218 283 234 262 243 231 259 210 275 225 226 240 195 266 165 291 148 307 142 367 134 381 123 396 100 406 89 433 72 559 93 631 92 670 77 767 30 806 22 868 22 869 1ZM1087 100 1093 99 1120 108 1090 106 1070 110 1069 108 1076 102 1087 100ZM854 228 860 227 895 240 897 244 901 246 934 253 940 250 946 254 930 261 911 259 917 264 926 267 910 273 926 275 913 278 905 283 897 283 894 279 899 269 904 265 904 261 897 258 888 261 879 267 872 282 848 255 850 238 854 228ZM1222 302 1257 316 1274 326 1280 336 1292 338 1243 346 1187 341 1184 339 1198 314 1206 307 1222 302ZM1180 349 1214 353 1254 355 1200 358 1179 356 1180 349ZM315 487 318 487 315 491 303 504 280 521 278 520 315 487Z"},"ichabod":{"w":1316,"h":1000,"d":"M821 0 830 1 842 15 848 6 853 5 873 17 877 25 844 64 850 72 843 85 851 95 860 113 860 118 853 121 838 118 834 128 830 130 833 134 824 154 816 154 803 148 796 151 798 159 793 169 809 190 810 198 789 243 782 268 783 277 793 284 807 279 820 290 836 295 840 300 847 299 847 304 877 298 892 314 890 322 892 328 883 345 890 355 905 349 904 347 896 348 898 345 927 343 936 340 919 337 906 338 908 335 927 330 910 319 899 311 900 307 917 315 935 317 946 317 970 309 968 306 956 304 923 308 971 283 964 283 954 286 966 279 1009 275 1030 276 1016 262 1010 252 1012 251 1022 261 1034 267 1063 272 1064 270 1061 267 1048 264 1063 262 1073 265 1086 275 1088 274 1078 248 1076 232 1080 232 1102 251 1127 259 1129 258 1113 248 1132 252 1131 231 1135 228 1151 246 1166 257 1175 273 1178 272 1176 264 1170 256 1179 260 1186 270 1186 287 1197 293 1200 303 1206 309 1234 328 1243 359 1276 404 1288 412 1289 421 1316 454 1305 503 1296 513 1284 512 1278 519 1272 522 1245 519 1237 514 1231 497 1228 496 1205 521 1185 536 1152 554 1117 567 1080 569 1049 565 999 547 987 563 983 573 980 619 964 660 952 677 1010 741 1030 755 1061 772 1079 794 1088 817 1109 844 1133 870 1166 893 1172 902 1177 918 1185 927 1197 935 1217 945 1223 959 1248 986 1247 992 1239 996 1222 1000 1170 995 1164 984 1153 974 1159 959 1157 949 1152 943 1140 938 1139 943 1135 940 1131 942 1125 937 1117 922 1115 927 1113 926 1104 895 1082 866 1059 840 1049 832 1030 824 999 790 935 756 948 784 971 813 970 827 960 858 927 871 900 887 861 919 853 923 845 923 818 913 801 913 783 916 776 910 745 899 741 895 741 891 750 879 774 863 795 854 812 860 818 877 822 882 830 881 828 871 830 870 836 873 840 868 865 870 884 861 919 832 922 821 914 807 871 770 842 737 816 719 807 709 785 714 760 714 748 708 712 706 714 732 723 736 745 737 749 739 753 749 750 754 739 758 714 761 706 768 669 761 664 757 663 749 653 752 632 746 629 743 631 718 639 703 644 700 647 693 615 681 572 660 567 664 559 683 538 706 522 732 482 763 468 780 466 790 470 804 496 833 527 862 557 885 564 914 584 949 586 996 583 1000 568 998 556 992 523 967 520 963 522 953 520 945 534 930 531 924 525 921 519 924 510 918 505 908 500 906 495 885 489 875 451 840 409 809 395 792 396 780 419 753 442 714 444 693 440 680 417 697 384 708 345 726 292 738 285 743 249 772 224 819 206 868 198 881 168 894 141 921 131 921 102 932 91 932 87 924 88 904 105 864 108 861 116 862 127 856 141 868 147 868 151 865 154 854 148 850 157 842 151 840 162 837 160 833 176 826 185 817 206 776 214 743 230 699 273 688 300 672 314 656 323 637 323 602 331 512 339 493 366 456 356 454 337 457 329 455 320 458 298 472 281 498 282 487 288 471 236 517 209 529 184 531 177 530 178 528 195 527 208 520 170 513 131 517 104 511 89 503 69 489 98 501 118 505 127 505 108 497 73 477 54 473 38 474 50 469 69 468 56 456 32 444 0 441 23 435 48 436 94 453 131 459 133 458 106 443 91 429 122 443 149 447 178 447 224 423 287 410 271 405 255 405 228 414 242 403 267 397 296 399 335 413 337 411 326 400 327 399 353 416 385 422 488 395 550 409 556 401 560 401 582 410 577 390 578 378 589 372 599 374 610 380 610 369 615 352 574 367 523 370 512 367 492 352 486 344 473 337 455 333 428 333 401 337 400 332 432 295 465 279 477 279 512 290 547 295 553 293 547 284 515 274 525 267 549 260 568 257 578 259 609 277 622 278 634 274 640 269 642 261 658 248 677 177 671 170 632 157 622 154 615 158 607 155 580 170 580 180 578 183 556 191 543 202 535 202 531 209 527 204 530 221 525 239 526 250 521 252 515 246 516 231 510 220 488 225 479 232 474 245 467 250 463 248 463 243 470 225 480 217 479 215 465 218 453 233 446 236 444 231 454 213 444 222 438 220 437 217 448 204 455 199 467 198 459 194 448 199 443 194 453 187 463 185 481 190 504 185 507 182 502 175 512 174 512 166 525 153 537 134 543 133 560 142 603 115 671 131 682 129 690 133 706 126 733 138 745 137 758 123 764 124 766 120 750 121 743 129 733 133 719 125 711 116 714 114 719 117 725 112 733 111 734 109 730 103 739 97 743 98 748 107 750 103 746 83 719 74 704 66 703 62 707 54 717 42 721 40 731 41 754 19 768 11 793 3 821 0ZM746 285 749 301 781 316 783 326 787 333 809 333 822 339 826 337 832 344 840 337 853 347 858 363 841 361 859 370 863 377 842 374 828 376 822 381 828 380 842 382 837 386 849 390 847 392 828 389 820 394 812 384 797 380 801 369 811 364 814 359 809 354 797 353 781 359 774 382 764 391 760 390 735 361 738 351 734 332 734 314 746 285ZM1105 437 1107 436 1117 445 1123 441 1148 451 1172 452 1191 467 1206 474 1210 481 1215 483 1205 493 1177 511 1137 529 1109 533 1073 533 1040 521 1028 514 1066 458 1088 442 1105 437ZM1202 505 1206 505 1191 519 1164 538 1137 551 1109 559 1055 558 1032 550 1008 536 1022 522 1043 532 1067 538 1113 540 1160 528 1202 505ZM179 510 201 513 223 510 215 516 203 517 176 513 179 510Z"},"throw":{"w":1002,"h":1000,"d":"M685 0 689 0 694 6 686 10 684 16 701 24 707 33 710 50 713 56 711 72 703 87 681 107 685 114 675 145 667 151 645 196 641 201 608 218 641 239 689 256 730 255 786 236 837 229 862 232 934 252 951 261 963 273 964 283 971 291 979 310 985 363 972 349 963 333 922 304 910 306 897 315 893 320 894 332 905 343 908 343 915 369 914 380 905 394 883 404 856 397 845 401 832 411 831 425 834 440 832 444 815 455 806 469 794 470 775 465 765 467 759 471 769 478 817 491 860 488 859 491 829 512 813 520 779 513 753 519 734 517 707 503 678 475 641 455 625 455 618 460 618 465 590 455 557 459 535 442 521 419 509 408 497 423 476 436 503 431 518 434 522 440 522 446 507 466 526 471 530 482 565 492 583 502 621 534 637 554 670 567 720 570 744 576 755 584 771 600 802 619 831 656 854 663 881 661 870 666 848 668 819 660 825 666 846 674 866 676 877 674 895 663 893 669 912 662 937 665 912 667 881 681 858 687 887 694 916 709 924 722 912 711 908 710 926 733 936 758 955 753 967 743 955 757 941 763 928 765 897 758 916 775 932 779 953 778 973 768 971 774 957 784 934 789 947 792 965 788 982 778 996 766 987 780 966 797 984 808 997 820 1002 832 993 820 974 812 943 812 934 815 949 820 961 828 946 824 961 844 961 846 956 842 957 853 953 844 940 833 928 828 914 826 899 826 872 834 851 832 876 846 891 850 906 850 893 853 872 852 843 841 825 828 808 827 792 821 763 797 749 780 759 801 785 826 763 813 762 815 769 821 786 832 765 823 749 805 735 778 719 768 710 758 689 723 681 700 682 656 673 632 656 613 658 642 648 706 650 722 670 753 703 784 708 799 702 820 691 886 694 943 691 945 685 959 684 956 680 963 674 957 671 960 670 964 674 976 668 994 647 999 625 1000 614 997 612 993 622 962 635 952 643 941 646 923 653 912 659 867 659 838 651 819 637 799 606 780 563 742 565 749 576 766 600 790 606 801 605 813 586 853 572 894 568 931 567 933 565 931 558 948 554 952 548 954 544 946 540 948 540 960 532 976 507 980 480 978 477 976 479 970 492 945 515 930 531 904 548 859 552 842 552 826 536 803 492 774 444 722 435 698 434 673 421 656 369 647 362 662 348 660 335 654 331 646 321 649 298 643 293 638 296 632 278 617 232 592 197 565 119 562 109 574 107 584 113 621 131 642 131 644 127 642 136 652 136 656 140 658 127 665 131 670 146 669 158 681 160 698 158 716 154 729 148 731 116 710 106 689 88 672 83 663 79 605 66 561 74 535 84 525 90 524 89 522 67 511 55 509 45 518 41 530 39 566 50 588 46 590 52 601 47 606 42 605 41 609 45 613 57 617 68 628 65 656 55 673 47 677 23 650 17 625 4 607 0 594 9 547 11 518 8 497 12 487 20 475 36 463 73 468 121 467 117 450 119 415 130 394 153 367 167 322 146 304 133 286 130 287 125 299 117 303 102 305 80 299 73 293 65 270 66 256 112 186 114 169 132 151 131 150 117 158 99 161 115 153 117 143 108 142 119 138 129 125 141 118 136 95 139 84 160 109 171 105 169 78 171 76 185 91 195 107 203 97 214 93 247 96 263 93 257 97 241 101 255 106 294 100 317 105 294 104 279 111 305 116 315 124 329 142 342 150 363 153 360 156 377 155 356 161 335 159 362 170 393 208 393 211 387 204 387 215 383 224 381 209 371 197 356 192 342 192 356 206 364 223 381 244 385 272 407 244 409 237 415 231 424 203 452 188 440 175 451 166 482 154 515 148 531 151 530 169 532 170 554 165 561 167 567 173 577 175 596 170 604 164 610 165 634 132 634 124 647 99 654 96 657 89 639 82 627 74 621 66 616 47 619 31 627 18 639 9 651 6 670 11 685 0ZM357 248 371 257 377 270 379 266 380 273 371 277 357 248ZM184 256 186 258 186 272 175 297 149 273 170 258 184 256ZM139 281 142 280 171 305 170 312 154 302 139 281ZM424 293 427 293 426 308 419 332 410 340 381 355 379 339 371 333 362 330 393 333 400 332 387 328 372 318 408 309 424 293ZM797 625 812 637 824 652 823 654 807 642 797 625ZM848 710 883 713 901 719 921 737 934 758 924 759 909 753 885 731 848 710ZM711 743 713 741 730 759 732 771 720 758 711 743Z"}};
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
/** 镜头震动（秒内衰减）。 */
const shake = (t: number, at: number, power = 18, len = .5) => {
  const d = t - at;
  if (d < 0 || d > len) return 'translate(0px, 0px)';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 90) * k}px, ${Math.cos(d * 70) * k * .7}px)`;
};
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

/** 代码画的南瓜灯：棱瓣、瓜蒂、刻出的脸透出烛光；carved=false 是没刻的南瓜。 */
function Pumpkin({x, y, r, t, rot = 0, light = 1, carved = true, opacity = 1, id = 'pk'}:
  {x: number; y: number; r: number; t: number; rot?: number; light?: number; carved?: boolean; opacity?: number; id?: string}) {
  const f = flicker(t, 5) * light;
  return <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`} opacity={opacity}>
    <defs><radialGradient id={`${id}-skin`} cx=".4" cy=".35"><stop offset="0" stopColor="#ffb347" /><stop offset=".55" stopColor="#e2701c" /><stop offset="1" stopColor="#8a3409" /></radialGradient>
      <radialGradient id={`${id}-halo`}><stop offset="0" stopColor="#ffb45a" stopOpacity={.55 * f} /><stop offset="1" stopColor="#ff8a2a" stopOpacity="0" /></radialGradient>
      <radialGradient id={`${id}-fire`}><stop offset="0" stopColor="#fff3b0" /><stop offset=".6" stopColor="#ffc244" /><stop offset="1" stopColor="#ff7a18" /></radialGradient></defs>
    {light > 0 && <circle r={r * 3.2} fill={`url(#${id}-halo)`} />}
    {[[-.62, .42], [.62, .42], [-.33, .55], [.33, .55], [0, .6]].map(([dx, rx], i) =>
      <ellipse key={i} cx={dx * r} cy={0} rx={rx * r} ry={r * .86} fill={`url(#${id}-skin)`} stroke="#6b2806" strokeWidth={r * .025} />)}
    <path d={`M${-r * .06} ${-r * .8} q${r * .02} ${-r * .3} ${r * .2} ${-r * .38} l${r * .06} ${r * .08} q${-r * .12} ${r * .1} ${-r * .12} ${r * .32} z`} fill="#4a5a22" />
    {carved && <g fill={`url(#${id}-fire)`} opacity={.55 + .45 * clamp(f)}>
      <path d={`M${-r * .5} ${-r * .12} l${r * .18} ${-r * .3} l${r * .18} ${r * .3} z`} />
      <path d={`M${r * .14} ${-r * .12} l${r * .18} ${-r * .3} l${r * .18} ${r * .3} z`} />
      <path d={`M${-r * .07} ${r * .02} l${r * .07} ${-r * .14} l${r * .07} ${r * .14} z`} />
      <path d={`M${-r * .56} ${r * .2} q${r * .56} ${r * .5} ${r * 1.12} 0 l${-r * .12} ${r * .1} l${-r * .1} ${-r * .07} l${-r * .12} ${r * .12} l${-r * .12} ${-r * .1}
        l${-r * .12} ${r * .12} l${-r * .12} ${-r * .1} l${-r * .12} ${r * .12} l${-r * .1} ${-r * .1} z`} />
    </g>}
  </g>;
}
/** 南瓜碎片：at 起炸开的瓜皮、瓜瓤与瓜子（canvas，带重力与旋转），seed 决定每片的形状与方向。 */
function Shards({frame, at, x, y, seed = 9, n = 54, power = 1, scale = 1}: {frame: number; at: number; x: number; y: number; seed?: number; n?: number; power?: number; scale?: number}) {
  const r = seeded(seed), pieces = Array.from({length: n}, (_, i) => {
    const a = r() * 6.283, v = (500 + r() * 1500) * power, size = (8 + Math.pow(r(), 1.8) * 40) * scale, sides = 4 + Math.floor(r() * 3), stretch = .35 + r() * .5;
    return {vx: Math.cos(a) * v, vy: Math.sin(a) * v * .8 - 280 * power, size, spin: (r() - .5) * 14, kind: i % 9 === 0 ? 'seed' : i % 4 === 0 ? 'pulp' : 'skin',
      pts: Array.from({length: sides}, (_, k) => [Math.cos(k / sides * 6.283 + r() * .5) * (.6 + r() * .45), Math.sin(k / sides * 6.283 + r() * .5) * (.6 + r() * .45) * stretch])};
  });
  const ref = useCanvas(frame, (c, f) => {
    const d = f / 30 - at;
    if (d < 0 || d > 2.2) return;
    pieces.forEach(p => {
      const px = x + p.vx * d, py = y + p.vy * d + 1600 * d * d, fade = clamp(1.6 - d);
      c.save(); c.translate(px, py); c.rotate(p.spin * d); c.globalAlpha = fade;
      if (p.kind === 'seed') {c.fillStyle = '#f3e7c4'; c.beginPath(); c.ellipse(0, 0, p.size * .14, p.size * .07, 0, 0, 6.283); c.fill(); c.restore(); return;}
      c.fillStyle = p.kind === 'pulp' ? '#f2b153' : '#cf5f17'; c.strokeStyle = p.kind === 'pulp' ? '#d0862e' : '#5e2205'; c.lineWidth = Math.max(1.5, p.size * .12);
      c.beginPath(); p.pts.forEach(([u, v], k) => k ? c.lineTo(u * p.size, v * p.size) : c.moveTo(u * p.size, v * p.size)); c.closePath(); c.fill(); c.stroke();
      c.restore();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'}} />;
}


// 追逐与南瓜（chase / throw 两幕共用，共用桥的底图）。
// chase：按卡点词切镜——追逐底图 → 代码画的多层视差奔跑（远山、三层枯树、近处树干呼啸而过，两个骑手剪影，骑士越追越近）
// → Ichabod 特写 → 越来越近的桥；念到那句原文引语起，三种镜头轮切，间隔每次乘 0.8，越切越快。
// throw：桥上过河、回头；反打——巨大的月亮前，无头骑士在马镫上立起；念到 hurlCue 掷出燃烧的南瓜，
// 南瓜迎着镜头越飞越大，念到 pumpkinCue 正中镜头：闪白、碎片四溅、黑场。
export const meta = {
  title: 'The chase / The pumpkin',
  params: {
    mode: {label: 'Mode', type: 'select', default: 'chase', options: [{value: 'chase', label: 'Chase'}, {value: 'throw', label: 'Pumpkin throw'}]},
    fasterCue: {label: 'Cut to the gallop on', type: 'text', default: 'Faster', maxLength: 24},
    saddleCue: {label: 'Close-up on', type: 'text', default: 'saddle', maxLength: 24},
    bridgeCue: {label: 'Bridge appears on', type: 'text', default: 'bridge', maxLength: 24},
    backCue: {label: 'Ichabod looks back on', type: 'text', default: 'back', maxLength: 24},
    riseCue: {label: 'Rider rears up on', type: 'text', default: 'rose', maxLength: 24},
    hurlCue: {label: 'Pumpkin thrown on', type: 'text', default: 'hurled', maxLength: 24},
    pumpkinCue: {label: 'Impact on', type: 'text', default: 'pumpkin', maxLength: 24},
    cutFactor: {label: 'Cut speed-up', type: 'number', default: .8, min: .5, max: 1, step: .05, help: 'Each cut in the final line is this times the previous one'},
  },
};

/** 多层视差奔跑：远山、三层枯树、近景树干，骑士 gain（0～1）越大越近。 */
function Track({t, frame, gain, tilt = 0}: {t: number; frame: number; gain: number; tilt?: number}) {
  const gi = gallop(t, 2.9, 1.1), gh = gallop(t + .17, 2.5, 1.2);
  return <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #1a2c48 0%, #233a58 50%, #0d1522 78%, #05070b 100%)', transform: `rotate(${tilt}deg) scale(1.06)`}}>
    <Svg>
      <Moon x={1480} y={210} r={78} id="tm" />
      <Clouds t={t} seed={21} count={7} y={80} h={260} speed={-140} color="16,22,34" opacity={.8} light={.6} id="tc" />
      <Ridge y={700} amp={60} seed={3} color="#0e1622" shift={t * 60} />
      <TreeRow t={t} speed={180} y={790} seed={41} count={9} height={380} color="#0b121c" />
      <Ridge y={840} amp={40} seed={5} color="#0d1420" shift={t * 260} />
      <TreeRow t={t} speed={560} y={930} seed={57} count={6} height={640} color="#0a0f18" />
    </Svg>
    <Fog t={t} amount={.85} y0={760} y1={960} layers={2} speed={-420} tint="150,168,195" seed={12} id="tb" />
    <Svg>
      <Sil name="horseman" x={mix(330, 860, gain) + Math.sin(t * .9) * 20} y={985 + gh.dy} h={440} rot={gh.rot} fill="#030407" />
      <Sil name="ichabod" x={1210 + Math.sin(t * .7) * 26} y={980 + gi.dy} h={340} rot={gi.rot} fill="#030407" />
      <Ridge y={985} amp={10} seed={8} color="#020304" shift={t * 900} />
    </Svg>
    <Fog t={t} amount={.7} y0={860} y1={1080} layers={2} speed={-700} tint="140,155,175" seed={4} id="tf" />
    <Svg><TreeRow t={t} speed={1700} y={1120} seed={73} count={3} height={1500} color="#010102" spread={1.8} /></Svg>
    <Leaves frame={frame} amount={.9} wind={-5} seed={31} n={70} fall={.4} />
  </div>;
}

/** 速度线：一组横向的淡亮线条，向左飞掠。 */
function Streaks({t, amount = 1, seed = 2}: {t: number; amount?: number; seed?: number}) {
  const r = seeded(seed), lines = Array.from({length: 26}, () => ({y: r() * H, x: r() * W * 2, l: 160 + r() * 420, v: 2400 + r() * 2200, a: r()}));
  return <Svg><g opacity={amount}>{lines.map((l, i) => {
    const x = ((((l.x - l.v * t) % (W * 2)) + W * 2) % (W * 2)) - W * .4;
    return <line key={i} x1={x} y1={l.y} x2={x + l.l} y2={l.y} stroke="#d8e2f0" strokeWidth={1.5 + 2 * l.a} opacity={.08 + .14 * l.a} strokeLinecap="round" />;
  })}</g></Svg>;
}

function Chase(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const faster = at(txt(props, 'fasterCue'), start(1, 2)), saddle = at(txt(props, 'saddleCue'), start(2, 3)), bridge = at(txt(props, 'bridgeCue'), start(3, 4.5));
  const quote = start(4, bridge + 2);
  const factor = typeof props.params.cutFactor === 'number' ? props.params.cutFactor : .8;
  const shots: Array<{at: number; kind: string; v: number}> = [{at: 0, kind: 'plate', v: 0}, {at: faster - .05, kind: 'track', v: 0},
    {at: saddle - .05, kind: 'close', v: 0}, {at: bridge - .1, kind: 'bridge', v: 0}];
  const cycle = ['track', 'close', 'bridge', 'plate', 'track', 'bridge'];
  for (let s = quote - .05, gap = .62, i = 0; s < dur - .1 && i < 40; s += gap, gap = Math.max(.15, gap * factor), i++) shots.push({at: s, kind: cycle[i % cycle.length], v: i + 1});
  const shot = shots.filter(s => s.at <= t).at(-1) ?? shots[0], lt = t - shot.at;
  const gain = clamp(t / dur), jolt = Math.abs(Math.sin(t * Math.PI * 2.7)) * 9, sway = Math.sin(t * Math.PI * 2.7) * 4;
  let view: any;
  if (shot.kind === 'track') view = <Track t={t} frame={props.frame} gain={gain} tilt={shot.v % 2 ? -1.5 : 0} />;
  else if (shot.kind === 'bridge') {
    const k = clamp((t - bridge) / Math.max(1, dur - bridge));
    view = <Plate asset={slot(props, 'bridge')} frame={props.frame} cam={camera(k, [1.02, 0, 0], [1.42, 140, -215], (v: number) => v)} />;
  } else if (shot.kind === 'close') {
    const cam = camera(lt / 1.5, [1.75 + .08 * (shot.v % 3), -500, 330], [1.9, -540, 350]);
    view = <div style={{position: 'absolute', inset: 0, transform: `rotate(${Math.sin(t * 5) * 2.5 + (shot.v % 2 ? 2 : -2)}deg) scale(1.05)`}}>
      <Plate asset={slot(props, 'chase')} frame={props.frame} cam={cam} /></div>;
  } else view = <Plate asset={slot(props, 'chase')} frame={props.frame} cam={camera(t / Math.max(1, faster), [1.05, 0, 10], [1.2, -60, 40])} />;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sway}px, ${-jolt}px)`}}>{view}</div>
    {shot.kind !== 'track' && <Streaks t={t} amount={.7} seed={shot.v + 2} />}
    {shot.kind !== 'track' && <Leaves frame={props.frame} amount={.7} wind={-4} seed={33} n={50} fall={.5} size={1.3} />}
    <Flash t={t} at={shot.at} len={.12} peak={shot.v ? .28 : 0} color="230,236,255" />
    <Finish vignette={.75} />
  </div>;
}

function Throw(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const back = at(txt(props, 'backCue'), start(0, 1.5)), rise = at(txt(props, 'riseCue'), start(1, 2.7));
  const hurl = at(txt(props, 'hurlCue'), start(2, 5.6)), impact = at(txt(props, 'pumpkinCue'), start(3, 8)) + .12;
  const pov = t >= start(1, 2.7) - .05;
  // 第一镜：桥上过河、回头（底图 + 剪影）。
  const cam = camera(t / Math.max(1, rise), [1.04, 0, 0], [1.12, -30, -16]);
  const cross = clamp(t / 2.1), [ax, ay] = cam.pt(.22, .735), [bx, by] = cam.pt(.7, .6), [hx, hy] = cam.pt(.11, .9);
  const ich = gallop(t, 2.6), hor = gallop(t + .3, 2.2);
  const enter = out3((t - .8) / 1.4);
  // 反打：月亮前立镫的骑士，南瓜从他高举的手里飞出。
  const rear = out3((t - rise) / 1.2), k = .74, sx = 1010, sy = 1010 - 40 * rear;
  const handX = sx + 164 * k * (1 + .05 * rear), handY = sy - 950 * k;
  const u = clamp((t - hurl) / Math.max(.4, impact - hurl)), flying = t >= hurl && t < impact;
  const ease = u * u, px = mix(handX, 960, ease), py = mix(handY, 560, ease) - Math.sin(Math.PI * u) * 120, pr = 40 / (1 - .955 * u);
  const ignite = sm((t - rise - .6) / .8);
  const black = sm((t - impact - .25) / .45);
  return <div style={{position: 'absolute', inset: 0, background: '#000', overflow: 'hidden', transform: shake(t, impact, 34, .6)}}>
    {!pov ? <>
      <Plate asset={slot(props, 'bridge')} frame={props.frame} cam={cam} />
      <Glow x={cam.pt(.36, .17)[0]} y={cam.pt(.36, .17)[1]} r={260} t={t} seed={1} color="215,225,240" strength={.3} />
      <Fog t={t} amount={.7} y0={620} y1={1080} layers={2} speed={24} tint="150,165,185" seed={3} id="bf" />
      <Svg>
        <Sil name="ichabod" x={mix(ax, bx, cross) + (t > 2.1 ? (t - 2.1) * 30 : 0)} y={mix(ay, by, cross) + ich.dy * (1 - .7 * clamp((t - 2.1) / .4))}
          h={mix(170, 115, cross)} rot={ich.rot} flip={t >= back} fill="#05070b" />
        <Sil name="horseman" x={mix(-300, hx, enter)} y={hy + hor.dy * (1 - enter * .8)} h={360} rot={hor.rot * (1 - enter)} fill="#030407" opacity={sm((t - .8) / .3)} />
      </Svg>
      <Fog t={t} amount={.5} y0={860} y1={1080} layers={2} speed={34} tint="160,175,195" seed={6} id="bf2" />
    </> : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #08101e 0%, #0d1830 55%, #04060a 100%)'}}>
      <Svg>
        <Moon x={1000} y={470} r={270} glow={.55} id="pm" />
        <Clouds t={t} seed={29} count={5} y={160} h={200} speed={30} color="14,20,32" opacity={.7} light={.8} id="pc" />
        <Ridge y={890} amp={30} seed={12} color="#05070c" />
        <TreeRow t={t} speed={0} y={930} seed={88} count={5} height={760} color="#030509" spread={1.1} />
        <g transform={`rotate(${(1 - rear) * 6 - 4 * rear} ${sx} ${sy})`}>
          <Sil name="throw" x={sx} y={sy} h={1000 * k * (1 + .05 * rear)} fill="#020305" />
        </g>
        {t < hurl && ignite > 0 && <Pumpkin x={handX} y={handY} r={44} t={t} light={ignite} opacity={ignite} id="hp" />}
        {flying && Array.from({length: 9}, (_, i) => {
          const uu = clamp(u - (i + 1) * .035), e = uu * uu, r = 40 / (1 - .955 * uu);
          return <circle key={i} cx={mix(handX, 960, e)} cy={mix(handY, 560, e) - Math.sin(Math.PI * uu) * 120} r={r * .55} fill="#ff9a3c" opacity={.35 * (1 - i / 9)} />;
        })}
        {flying && <Pumpkin x={px} y={py} r={pr} t={t} rot={u * 540} light={1.4} id="fp" />}
        <rect x={0} y={960} width={W} height={34} fill="#020203" />
        {[180, 760, 1340, 1780].map(x => <rect key={x} x={x} y={900} width={40} height={180} fill="#020203" />)}
        <rect x={0} y={1010} width={W} height={70} fill="#010101" />
      </Svg>
      <Fog t={t} amount={.6} y0={780} y1={1000} layers={2} speed={20} tint="150,165,190" seed={9} id="pf" />
    </div>}
    <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${black})`}} />
    <Shards frame={props.frame} at={impact} x={960} y={560} seed={13} n={90} power={1.5} scale={1.5} />
    <Flash t={t} at={impact} len={.55} peak={1} />
    <Flash t={t} at={impact + .02} len={.3} peak={.5} color="255,150,50" />
    {!pov && <Finish vignette={.7} />}
  </div>;
}

export default function ChaseScene(props: SceneInput) {
  return txt(props, 'mode') === 'throw' ? <Throw {...props} /> : <Chase {...props} />;
}
