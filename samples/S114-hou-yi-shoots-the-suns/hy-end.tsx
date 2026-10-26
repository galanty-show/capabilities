import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// Houyi shoots the suns: shared picture-book library. prepare.py joins it with each module into scenes/<module>.tsx,
// inlining only the Ma Shan Zheng (OFL) glyph outlines a module draws. No runtime fonts, randomness or clocks.
const GLYPHS: Record<string, string> = {"后":"M594 749Q671 744 715 756Q740 763 758 766Q772 767 797 779.5Q822 792 833 801Q843 809 828 837Q825 845 818.5 868Q812 891 809 894Q806 897 806 907Q806 916 790 942Q774 968 765 977Q761 979 759 988Q757 993 761 996Q765 999 779 1006Q798 1015 800.5 1021.5Q803 1028 794 1048Q782 1074 764 1082.5Q746 1091 726 1081Q690 1063 602 1064Q560 1064 543.5 1069Q527 1074 511 1087Q500 1098 491 1098Q484 1098 479 1091Q474 1084 462 1056Q452 1030 446 990Q444 974 438.5 963.5Q433 953 433 940.5Q433 928 426 907Q419 886 418.5 870Q418 854 412 841Q407 826 408 821Q409 816 419 805Q460 760 594 749ZM670 821Q628 813 571 816.5Q514 820 487 832Q467 841 467 845Q467 856 479 882Q491 912 501 966Q508 1005 519 1005Q525 1005 553 999Q581 993 616 990L650 988L657 964Q680 902 687 865Q693 834 691 829Q689 824 670 821ZM705 536Q731 530 761.5 539.5Q792 549 804 564Q812 576 810 592Q808 608 797 623Q768 657 738 640Q724 633 683 632Q644 631 588.5 637.5Q533 644 502 652Q463 663 442 651Q405 631 401 623Q399 618 401 610Q403 602 408 602Q410 602 436 591Q501 562 656 548Q679 546 683 543Q687 540 705 536ZM301 580Q301 538 305 512Q309 486 305 478.5Q301 471 309.5 467.5Q318 464 323.5 470.5Q329 477 341 482Q350 488 358 498Q366 508 379 535Q389 554 390.5 567Q392 580 386 596Q380 609 380 633Q380 657 374.5 664.5Q369 672 369 680Q369 688 365.5 690Q362 692 358 708.5Q354 725 350 736Q346 747 345.5 750.5Q345 754 338 769Q331 784 331 785Q331 786 326 801L314 827Q309 840 309 845Q309 852 299.5 872.5Q290 893 280 906Q248 956 232 976.5Q216 997 185 1026Q144 1065 136 1072.5Q128 1080 125 1080Q121 1080 120 1085Q118 1087 114 1086.5Q110 1086 106 1083Q102 1080 102 1077Q102 1070 123 1038.5Q144 1007 144 1005.5Q144 1004 154 990Q167 974 193 924Q199 913 209 891L233 837Q253 795 277 731Q301 663 301 580ZM565 278Q570 267 575.5 265.5Q581 264 599 264Q627 264 653.5 285.5Q680 307 687 337Q689 348 679 360.5Q669 373 656 373Q646 373 629 383Q612 393 592 401Q574 409 537 419Q500 429 490 429Q482 429 436.5 440Q391 451 386 455Q376 459 351 459.5Q326 460 326 457Q325 455 329.5 450.5Q334 446 340 442Q358 432 358 429.5Q358 427 394.5 406.5Q431 386 459 367Q489 348 524.5 318Q560 288 565 278Z","射":"M729 290Q729 286 735.5 285Q742 284 751.5 286.5Q761 289 768 292Q779 299 779 303Q779 307 794 326L806 345L803 389Q796 459 809 462Q816 463 836 459Q876 451 901 464Q917 475 924 475Q932 475 939.5 482.5Q947 490 945 494.5Q943 499 937 497Q934 496 933 497Q932 498 933 503Q935 511 925 519Q919 525 908.5 526Q898 527 863 528Q809 528 807.5 530Q806 532 805.5 602.5Q805 673 801 683.5Q797 694 801.5 708.5Q806 723 802 728Q799 731 798 749Q797 767 797.5 783Q798 799 802 799Q805 799 805 871Q805 943 797 967Q788 990 775 1006.5Q762 1023 753 1023Q745 1023 733 1034Q721 1045 704 1050Q687 1055 674 1060Q659 1066 644.5 1061.5Q630 1057 630 1046Q630 1036 626 1033.5Q622 1031 613.5 1012.5Q605 994 591 981Q542 935 526 903Q509 872 521 873Q526 873 537 884Q550 895 555 895Q560 895 570 903Q597 928 627 935Q647 939 663 931Q677 925 684.5 915Q692 905 700 884Q708 862 711 809.5Q714 757 711 716Q703 619 703 559V543L674 545Q613 552 587 575Q565 592 565 581Q565 578 560.5 578Q556 578 542 564Q512 535 563 510Q574 505 627 492Q680 479 690 479Q699 479 699.5 478Q700 477 702 394Q704 332 708 312.5Q712 293 721 293Q729 293 729 290ZM373 217Q386 199 393.5 198Q401 197 424 214Q450 230 451 241.5Q452 253 429 267Q406 281 404 281Q402 281 381.5 295Q361 309 357.5 313.5Q354 318 342 326Q333 330 340 331Q344 331 365 329Q407 326 461 337Q515 348 532 361Q538 368 538 371Q538 374 534 379Q527 387 527 396Q527 405 520.5 407.5Q514 410 514 433.5Q514 457 510.5 458.5Q507 460 504 503L498 565Q497 588 496 627L494 667L528 666Q591 666 602 667.5Q613 669 629 683Q675 720 686 742Q695 761 691 766Q687 771 686 785Q685 797 678.5 807Q672 817 664 817Q656 817 647.5 821Q639 825 630.5 815Q622 805 619 796Q616 787 612 787Q608 787 588 760Q572 740 566 735.5Q560 731 545 729Q525 725 509 725H495L494 753Q490 830 493 934Q494 971 485 987Q476 1003 471 1021L465 1047Q462 1058 456 1058Q450 1058 450 1061.5Q450 1065 434.5 1080.5Q419 1096 402.5 1096Q386 1096 385 1093Q383 1067 376 1053.5Q369 1040 349 1019Q321 992 272 965Q255 956 276 954Q295 953 323 959Q340 963 366 956Q385 949 393.5 941.5Q402 934 409 918Q419 892 423 789L425 730L402 733Q377 735 376 739Q376 741 379 744Q386 750 385.5 761Q385 772 378 781Q373 789 373 795Q373 800 352.5 826Q332 852 322 859Q310 865 305.5 869.5Q301 874 265.5 900.5Q230 927 214 940Q193 956 148.5 977Q104 998 89 998Q78 998 84 990Q86 986 92 982Q99 977 108 970Q117 963 120.5 963Q124 963 156 941.5Q188 920 196 912Q202 905 217 886Q232 867 237 862Q242 858 268.5 823Q295 788 295 786Q295 784 306.5 766Q318 748 316 746Q314 744 291 751L257 760Q247 763 243 777Q238 804 225 804Q215 804 215 784Q215 778 214 776.5Q213 775 207.5 775Q202 775 195 777Q188 779 173 786Q145 796 133 809Q121 826 114.5 826.5Q108 827 93 817Q74 804 67.5 804Q61 804 56 800Q52 798 58.5 790.5Q65 783 75 774.5Q85 766 92 763Q103 761 125.5 751Q148 741 170 734Q192 727 192 718.5Q192 710 198.5 707.5Q205 705 205 676.5Q205 648 211.5 611.5Q218 575 220.5 530Q223 485 226 436Q229 395 235 385Q241 375 297 314Q331 276 341 261.5Q351 247 355 247Q359 247 359 243Q359 239 373 217ZM420 363Q398 356 365.5 363Q333 370 309 386Q295 395 275 393L255 391L266 406Q279 421 275 442L273 461L288 459Q391 436 402 460Q405 467 400.5 479.5Q396 492 387 499Q378 507 339 513.5Q300 520 285 529Q274 535 272 540Q270 545 270 556Q270 572 271.5 572Q273 572 307 559Q360 537 389 556Q398 562 397 567.5Q396 573 383 589Q367 607 356 607Q344 607 316 616Q288 625 285 628.5Q282 632 272 632Q266 632 263.5 635Q261 638 260 649Q257 665 257 686Q257 703 262 704Q267 705 308 695Q336 688 376.5 683.5Q417 679 420 674Q423 669 423 600.5Q423 532 431 463Q437 404 435 385.5Q433 367 420 363Z","日":"M472 237Q522 229 571.5 231.5Q621 234 643 244Q658 252 678 258.5Q698 265 714 283Q726 298 728.5 310Q731 322 725 346Q713 393 709 523Q706 617 705 679Q703 741 698.5 752.5Q694 764 694 822Q693 924 683 930Q679 932 679 943.5Q679 955 674.5 957.5Q670 960 665.5 977Q661 994 641 1014Q623 1033 613.5 1039.5Q604 1046 584 1056Q566 1064 560 1059.5Q554 1055 538 1024Q525 998 503.5 975.5Q482 953 482 949.5Q482 946 468.5 946Q455 946 455 942.5Q455 939 445 928.5Q435 918 440.5 914Q446 910 442 904Q440 900 444 900Q445 900 447 901Q463 908 487.5 908Q512 908 524 901Q558 885 560 870Q561 862 544 865Q528 868 494.5 871.5Q461 875 430 887.5Q399 900 388 900Q372 900 353 913Q334 926 337 936Q339 944 330.5 956Q322 968 315 968Q298 968 284 934.5Q270 901 270 860Q269 784 280 735Q285 714 287 543Q289 372 284 342Q280 316 283.5 305Q287 294 300 294Q311 294 316 282.5Q321 271 345.5 264Q370 257 380 257Q390 257 407.5 250Q425 243 472 237ZM590 426V300H560Q451 300 416 320Q404 327 366.5 321.5Q329 316 327.5 318Q326 320 342 338L359 356L357 418Q354 480 358 486Q362 492 385.5 484Q409 476 412.5 468.5Q416 461 455 462Q487 464 502 470Q517 476 528 493Q537 507 537 517Q537 527 530 544Q524 558 508.5 566.5Q493 575 478 573Q462 569 396 599Q382 606 374 606Q368 606 363 616Q358 626 359 636Q359 645 355 663.5Q351 682 349 739Q348 794 353 794Q354 794 357 792Q364 790 410.5 778Q457 766 465 761Q476 755 509 757.5Q542 760 558 767Q579 777 580 775Q584 772 587 653Q590 534 590 426Z","神":"M367 386Q375 382 377.5 382.5Q380 383 389 389Q398 396 403.5 396Q409 396 423 405Q432 410 433 413.5Q434 417 433 431Q430 448 418 458Q392 480 383 495Q379 506 360 535Q350 550 350 552Q350 554 342 563Q333 571 334.5 574.5Q336 578 347 576Q359 574 360.5 570Q362 566 368.5 571Q375 576 396 584Q412 589 418.5 594Q425 599 432 613Q441 626 431.5 649Q422 672 407 674Q398 675 391.5 672Q385 669 372 656Q353 640 346 640Q339 640 337 657Q332 683 334 719Q334 737 330 786.5Q326 836 330 842Q334 848 337 872Q339 888 337.5 893.5Q336 899 329 905Q298 934 291 906Q288 893 280.5 891Q273 889 271 881.5Q269 874 269 849Q269 806 274 797Q278 792 279 743.5Q280 695 284 675.5Q288 656 287 656Q286 655 278.5 664.5Q271 674 264.5 684Q258 694 258 695Q258 697 237 719.5Q216 742 200 760Q156 817 132 832Q113 845 100 838Q96 836 97 833Q98 826 98.5 823.5Q99 821 105 821Q110 821 142.5 777.5Q175 734 208 688L245 629Q263 603 286 549L297 522Q319 475 313 474Q311 474 306 475Q298 479 280 482Q262 485 248 497.5Q234 510 217.5 519Q201 528 198 534Q194 542 166 529Q149 521 149 516Q149 514 152 513Q157 512 157 502Q157 497 162.5 492.5Q168 488 187 479Q217 463 232 453.5Q247 444 280 434Q332 416 350 399Q358 391 367 386ZM325 200Q350 197 383 235Q408 264 414.5 277Q421 290 420 311Q419 328 417 333.5Q415 339 406 346Q379 372 353 347Q328 325 315 268Q305 231 310 223Q315 215 315 208Q315 201 325 200ZM589 193Q600 189 605 181Q610 173 617 173Q628 173 647.5 184.5Q667 196 681 208L697 224L694 248Q690 281 686 345L684 373H698Q714 373 728 378Q749 385 818 385Q830 385 859 404Q888 423 895 436Q902 446 902.5 450Q903 454 898 463Q892 475 885 501.5Q878 528 874 532.5Q870 537 870 554.5Q870 572 852 608.5Q834 645 831 651Q816 675 799 694Q792 703 787 705.5Q782 708 771 708Q755 708 753.5 713.5Q752 719 745.5 713.5Q739 708 739 703.5Q739 699 728 677Q720 661 716.5 657.5Q713 654 704 654Q687 654 682.5 662.5Q678 671 677 696Q677 726 678 735Q680 755 676 835Q672 915 667 961L663 995Q662 1014 659.5 1021Q657 1028 661 1030Q665 1032 659.5 1053.5Q654 1075 643 1095Q638 1106 638 1111Q638 1121 620 1121Q615 1121 615 1117Q615 1113 609.5 1107Q604 1101 604 1086.5Q604 1072 600 1055Q596 1038 594 986Q592 934 589 887Q585 822 590 723L593 667H582Q563 667 557 687Q554 693 548 693Q541 693 526 677Q511 661 511 654Q511 648 507 644Q503 640 500 627Q497 614 477 563Q459 517 455 495.5Q451 474 457 459Q458 457 457 454L460 451Q462 451 464 453Q471 456 480 458Q486 459 493.5 467.5Q501 476 502 485Q503 508 516 515Q522 518 525 513Q530 505 574 495Q581 493 583 488Q585 483 587 458Q589 421 590 419Q590 417 584 416.5Q578 416 569.5 417.5Q561 419 556 421Q542 428 539.5 428Q537 428 518 439Q499 450 488 448Q475 445 471 438Q469 435 473 435Q477 435 477 426.5Q477 418 489 409Q501 402 526.5 393Q552 384 571 382L589 380L590 341Q592 259 583 210Q581 201 582 198.5Q583 196 589 193ZM752 414Q735 409 711.5 407Q688 405 687 409.5Q686 414 683 442L681 470H692Q709 470 722 480Q735 490 735 502Q735 509 725.5 516Q716 523 708 523Q698 523 688 528Q682 532 680.5 537Q679 542 678 558Q677 577 681.5 583.5Q686 590 704 592Q717 593 729 595Q746 599 755 579Q758 572 762 566Q779 539 795 465Q800 443 799.5 438Q799 433 795 428Q788 419 777.5 419Q767 419 752 414ZM592 579V547H582Q571 548 552.5 553.5Q534 559 534 563Q534 566 542.5 581.5Q551 597 554 599Q558 601 558 609Q558 615 562 616Q566 617 580 614L592 612Z","羿":"M266 320Q288 310 299 314Q310 318 320 340Q323 349 322.5 352Q322 355 316 360Q307 367 272 367.5Q237 368 228 361Q222 357 223 354.5Q224 352 235 341Q250 328 266 320ZM515 275Q526 273 528 269.5Q530 266 551 266Q592 266 592 299Q592 315 582.5 324Q573 333 560 330Q551 327 539 327Q528 328 509.5 314.5Q491 301 494 293Q498 280 515 275ZM611 177Q652 173 658 172.5Q664 172 679.5 180Q695 188 699.5 188Q704 188 716 201Q724 209 726 214.5Q728 220 727 236Q726 260 727 308.5Q728 357 726 377Q721 443 714 457Q708 467 708 475Q708 483 703.5 486.5Q699 490 692 500Q677 522 660 532Q652 536 636 548Q624 557 622 561.5Q620 566 619 582Q619 597 620 600.5Q621 604 625 604Q728 601 751 591Q782 578 812 590Q822 593 842.5 608.5Q863 624 867 631Q871 638 866 658Q861 676 857.5 681Q854 686 841 695L825 707L803 698Q744 677 676 672Q638 669 626.5 666Q615 663 612.5 667.5Q610 672 605 825.5Q600 979 592 1026Q579 1099 572 1099Q569 1099 569 1103Q569 1107 559.5 1114Q550 1121 544 1121Q535 1121 528 1110Q522 1103 521 1082Q520 1061 520 958Q523 706 528 685Q531 670 519 669Q509 667 465 672Q407 679 404 681Q401 683 401 693.5Q401 704 395.5 711.5Q390 719 388 731Q380 775 371 784Q366 789 366 794Q366 799 360 812L347 836Q336 858 305 895Q274 932 252 949Q229 967 226 969Q220 977 197 991Q174 1005 169 1005Q161 1005 165 1000Q167 996 177 982Q195 959 195 956Q195 950 221 921Q229 914 236 899Q243 884 258 864Q281 832 306 775Q331 718 331 698Q331 691 323.5 690Q316 689 296 693L257 702Q236 707 216 716Q192 730 170 726Q148 722 137 701Q127 682 136.5 673Q146 664 179 659Q201 654 251.5 642.5Q302 631 314 631Q334 631 338 625.5Q342 620 344 591Q347 556 348 549Q349 542 351 542Q355 542 355 537Q355 532 352 525Q349 518 345 513Q335 501 325 480L316 459L305 466Q295 474 290 478Q285 482 265.5 494.5Q246 507 240 516.5Q234 526 220 526Q209 526 194 520Q179 514 179 508Q179 495 256 436L316 391Q323 385 331 338Q339 291 339 274V257L310 260Q268 264 245 276Q226 286 218 275Q215 271 216 268.5Q217 266 224 260Q244 244 274 233.5Q304 223 330 223Q350 223 350 220Q350 206 388 223Q419 235 423 249Q425 257 423 270Q421 283 415 289Q410 295 403 341.5Q396 388 390 443Q387 470 384.5 479Q382 488 372 503L358 524L376 528Q392 533 400 540.5Q408 548 412 565Q417 585 411 599Q405 614 417 617Q426 619 469 613Q523 608 526.5 606Q530 604 530 589Q530 574 533.5 563.5Q537 553 533.5 549Q530 545 532 530Q534 515 526 506Q518 497 516 488Q514 481 516 480.5Q518 480 534 482Q556 484 570.5 479Q585 474 602 457Q629 432 637 386Q639 372 635 371Q633 370 631 374Q630 376 630 378Q628 386 613 393Q581 407 572.5 411.5Q564 416 561 422Q555 437 497 466Q487 473 473 470Q459 467 457 460Q455 453 452.5 453Q450 453 441 445L431 438L440 424Q449 410 451.5 410Q454 410 487 390Q540 357 554 351Q568 345 585 341Q602 339 607 345.5Q612 352 620 352Q628 352 630 358Q632 364 635 364Q637 364 638 342Q639 320 637.5 292.5Q636 265 634 248Q630 219 621 215Q613 212 577 216Q541 220 531 225Q511 235 504 226Q490 210 535 193Q568 180 611 177Z","话":"M239 366Q221 336 222.5 321Q224 306 234.5 298Q245 290 257 290Q270 290 293.5 303Q317 316 329 330Q338 342 340 349Q342 356 342 376Q342 403 332 411.5Q322 420 300 420Q281 419 271.5 411Q262 403 239 366ZM602 281Q614 262 631 265.5Q648 269 673 294Q691 310 694 328Q697 351 683 366Q669 381 641 387Q617 391 599 400L582 407L591 418Q622 451 627 458.5Q632 466 630 478Q626 493 625 510V526L657 527Q690 528 728 522Q792 512 841 510Q872 508 890.5 506Q909 504 918 508Q927 512 940 529Q970 569 951 587Q944 595 940 601Q934 620 891.5 620.5Q849 621 754 605Q734 601 676 600H619V636Q619 671 615 691Q611 711 614.5 714.5Q618 718 675 723Q748 731 776 745Q804 759 804 790Q804 807 794 817Q784 827 788.5 832.5Q793 838 784 841Q777 843 768.5 851.5Q760 860 760 865Q760 869 734 897Q708 925 708 928.5Q708 932 720 938Q735 946 739.5 952Q744 958 744 972Q744 989 730 1002Q719 1014 708.5 1015.5Q698 1017 675 1009Q654 1002 595 1002H535L521 1015Q505 1029 501 1029Q488 1029 466.5 1003Q445 977 445 962Q445 951 439 937Q433 923 433 915.5Q433 908 423 885Q407 850 402 808Q400 791 409 776Q418 761 429 764Q439 765 455.5 756Q472 747 497 739L521 729L525 684Q533 609 525 609Q520 609 477 616Q406 630 377 650Q360 662 347 662.5Q334 663 310 654Q283 640 282 642Q278 648 272.5 679Q267 710 266 733Q262 772 259 790Q256 808 260 811.5Q264 815 274 802L315 756Q365 698 370 698Q373 698 365 726Q355 758 335 788Q310 827 296 858L262 932Q248 962 243 975Q238 988 219.5 1006.5Q201 1025 191 1022Q183 1020 175 1011Q167 1002 164.5 991.5Q162 981 156 976Q150 971 145 957Q140 946 140 941Q140 936 145 924Q151 906 149 904Q147 902 153 894Q159 886 167 881Q176 877 181 843Q186 809 195 672Q199 621 203.5 590Q208 559 206 557Q202 554 168.5 572Q135 590 124 600Q112 611 109 619Q105 628 86 631.5Q67 635 52 628Q42 623 42 614Q42 605 52 592Q62 579 79 570Q146 529 197 514Q221 506 225.5 503.5Q230 501 249 500.5Q268 500 279 511Q290 523 292.5 532.5Q295 542 293 565L292 591L319 584Q414 555 469 548Q476 548 487 547Q522 542 528 538.5Q534 535 535 517Q536 512 536 509Q538 477 542 456Q548 430 543 427.5Q538 425 509 438Q412 479 399 473Q396 470 395.5 469Q395 468 397.5 465Q400 462 403.5 457Q407 452 416 444Q439 420 497 377Q581 313 602 281ZM657 778Q653 775 609.5 773Q566 771 548 773Q529 777 508.5 784.5Q488 792 475 800.5Q462 809 464 815Q466 820 469.5 837Q473 854 476.5 859.5Q480 865 486.5 885.5Q493 906 493 914Q493 930 514 934Q535 938 553 926Q567 917 584 911Q595 908 601 900.5Q607 893 620 867Q661 783 657 778Z"};
const W = 1920, H = 1080;
const RED = '#e8402c', GOLD = '#ffc93c', AMBER = '#ff9f1c', INK = '#2a1a10', PAPER = '#fff4e0', JADE = '#3fa58a', SKY = '#8fd3e8';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
/** Overshoot ease for pops (0 -> ~1.1 -> 1). */
const outBack = (v: number) => {const p = clamp(v), c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);};
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** Window: fade in from a, fade out from b (seconds). */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));

// Bundled sample: no asset ids, so prepare.py --sample inlines the plates this module uses here; empty in production jobs.
const MEDIA: Record<string, string> = {"ending":"release-assets/d6043521b9a03da483a1ef6c4a47ef85a1934421e85640fb790bad88c53951c6.webp"};
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}

// On-screen words are content params declared in each module's meta.params (defaults are the Chinese original).
const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
const isLatin = (text: string) => !/[㐀-鿿]/.test(text);
const latinWidth = (text: string, size: number, spacing = 0) => Array.from(text).reduce((w, ch) => w + spacing + size *
  (ch === ' ' ? .25 : /[MW]/.test(ch) ? .95 : /[A-Z]/.test(ch) ? .74 : /[il.,'’:;!|·]/.test(ch) ? .3 : /[mw]/.test(ch) ? .86 : /[0-9]/.test(ch) ? .62 : .58), 0);
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
function list<T = any>(props: SceneInput, key: string): T[] {
  const value = props.params[key];
  return Array.isArray(value) && value.length ? value : (meta as any).params?.[key]?.default ?? [];
}
const mode = (props: SceneInput, fallback: string) => typeof props.params.mode === 'string' ? props.params.mode as string : fallback;

/** Sentence timing with fallbacks, so edited narration never drops a beat. */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

/** Full-frame plate with a camera move; children share the plate's frame (overlay in plate pixels, 1920x1080).
 * The move is laid out as left/top/width/height instead of a CSS transform: a transformed image layer was re-rastered at
 * slightly different quality run to run (CODE_NONDETERMINISTIC), a plainly painted, resized box is not.
 * origin is "x% y%"; shift adds a pixel offset (camera tremble). */
function Plate({asset, frame, p, from = [1.03, 0, 0], to = [1.1, -20, -10], opacity = 1, origin = '50% 50%', shift = [0, 0], children}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string; shift?: number[]; children?: any}) {
  const k = easeInOut(p);
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k) + shift[0], y = mix(from[2], to[2], k) + shift[1];
  if (opacity <= 0) return null;
  const [px, py] = origin.split(' ').map(v => parseFloat(v) / 100), ox = px * W, oy = py * H;
  const box = {left: ox * (1 - s) + x, top: oy * (1 - s) + y, width: W * s, height: H * s};
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', left: box.left, top: box.top, width: box.width, height: box.height}}>
      {asset ? <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        : <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #ffd9a0, #f4b36b 60%, #d9a066)'}} />}
      {children}
    </div>
  </div>;
}
/** SVG canvas in scene coordinates. */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;

/** Brush lettering: each glyph wipes in stroke-wise; p is the whole line's progress 0->1. Latin text falls back to a serif line. */
function Brush({text, x, y, size, fill = PAPER, p = 1, vertical = false, id, gap = .96, shadow = true, align = 'start', maxWidth = 0, stroke = ''}:
  {text: string; x: number; y: number; size: number; fill?: string; p?: number; vertical?: boolean; id: string; gap?: number; shadow?: boolean;
    align?: 'start' | 'middle' | 'end'; maxWidth?: number; stroke?: string}) {
  if (!text || p <= 0) return null;
  const filter = shadow ? {filter: 'drop-shadow(0 5px 12px rgba(60,20,0,.45))'} : undefined;
  if (isLatin(text)) {
    const scale = .62, natural = latinWidth(text, size * scale, size * .01), k = maxWidth && natural > maxWidth ? maxWidth / natural : 1;
    const font = size * scale * k, width = natural * k, left = align === 'middle' ? x - width / 2 : align === 'end' ? x - width : x;
    const baseline = y + size * .5 + font * .36;
    return <g style={filter}>
      <defs><clipPath id={`${id}-l`}><rect x={left - font * .3} y={baseline - font * 1.1} width={(width + font * .6) * clamp(p)} height={font * 1.5} /></clipPath></defs>
      <text x={left} y={baseline} fontFamily={SERIF} fontWeight={700} fontSize={font} fill={fill} stroke={stroke || undefined} strokeWidth={stroke ? font * .06 : undefined}
        paintOrder="stroke" clipPath={`url(#${id}-l)`}>{text}</text>
    </g>;
  }
  const chars = Array.from(text);
  const total = (vertical ? chars.length * 1.06 : (chars.length - 1) * gap + 1) * size;
  const ox0 = !vertical && align === 'middle' ? x - total / 2 : !vertical && align === 'end' ? x - total : x;
  return <g style={filter}>{chars.map((ch, i) => {
    const q = clamp(p * chars.length - i);
    if (q <= 0 || !GLYPHS[ch]) return null;
    const ox = ox0 + (vertical ? 0 : i * size * gap), oy = y + (vertical ? i * size * 1.06 : 0);
    return <g key={i} transform={`translate(${ox} ${oy}) scale(${size / 1000})`}>
      <defs><mask id={`${id}-${i}`} maskUnits="userSpaceOnUse" x="-150" y="-150" width="1300" height="1300">
        <path d="M-80 80 L1040 80 L-80 320 L1040 320 L-80 550 L1040 550 L-80 790 L1040 790 L-80 1030 L1040 1030"
          fill="none" stroke="white" strokeWidth="255" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - q)} />
      </mask></defs>
      {stroke && <path d={GLYPHS[ch]} fill="none" stroke={stroke} strokeWidth={60} strokeLinejoin="round" mask={`url(#${id}-${i})`} />}
      <path d={GLYPHS[ch]} fill={fill} mask={`url(#${id}-${i})`} />
    </g>;
  })}</g>;
}
/** Vermilion seal that stamps down from large to small. */
function Seal({x, y, text, size = 110, p, id, color = RED}: {x: number; y: number; text: string; size?: number; p: number; id: string; color?: string}) {
  if (p <= 0 || !text) return null;
  const k = out3(p), sc = 1 + 1.4 * (1 - k), chars = Array.from(text);
  if (isLatin(text)) {
    const label = text.toUpperCase(), font = Math.min(size * .34, size * .82 / Math.max(.01, latinWidth(label, 1, .02)));
    return <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${-5 + 5 * k})`} opacity={clamp(p * 3)}>
      <rect x={-size / 2} y={-size * .32} width={size} height={size * .64} rx={size * .1} fill={color} style={{filter: 'url(#rough)'}} />
      <text x={0} y={font * .36} textAnchor="middle" fontFamily={SERIF} fontWeight={700} fontSize={font} fill={PAPER}>{label}</text>
    </g>;
  }
  const cols = chars.length > 2 ? 2 : 1, rows = Math.ceil(chars.length / cols), cell = size / Math.max(cols, rows);
  return <g transform={`translate(${x} ${y}) scale(${sc}) rotate(${-5 + 5 * k})`} opacity={clamp(p * 3)}>
    <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size * .12} fill={color} style={{filter: 'url(#rough)'}} />
    <rect x={-size / 2 + 6} y={-size / 2 + 6} width={size - 12} height={size - 12} rx={size * .09} fill="none" stroke={PAPER} strokeWidth={3} opacity={.75} />
    {chars.map((ch, i) => {
      const col = cols - 1 - Math.floor(i / rows), row = i % rows;
      return <Brush key={i} text={ch} id={`${id}-${i}`} size={cell * .78} fill={PAPER} shadow={false}
        x={-size / 2 + col * cell + cell * .11} y={-size / 2 + row * cell + cell * .1} />;
    })}
  </g>;
}
/** Shared SVG defs: rough seal edge and the sun glow gradients. */
const Defs = () => <defs>
  <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" />
    <feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G" /></filter>
  <radialGradient id="sunGlow"><stop offset="0" stopColor="#fff6c8" stopOpacity=".95" /><stop offset=".35" stopColor="#ffd45c" stopOpacity=".55" />
    <stop offset=".7" stopColor="#ff9f1c" stopOpacity=".16" /><stop offset="1" stopColor="#ff8a00" stopOpacity="0" /></radialGradient>
  <radialGradient id="sunBody" cx=".42" cy=".38" r=".7"><stop offset="0" stopColor="#fffbe0" /><stop offset=".45" stopColor="#ffd84a" />
    <stop offset="1" stopColor="#ffa21f" /></radialGradient>
  <radialGradient id="flash"><stop offset="0" stopColor="#ffffff" stopOpacity="1" /><stop offset=".3" stopColor="#fff2b0" stopOpacity=".9" />
    <stop offset="1" stopColor="#ffc93c" stopOpacity="0" /></radialGradient>
  <linearGradient id="feather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3b0" /><stop offset=".5" stopColor="#ffcf3a" />
    <stop offset="1" stopColor="#f08a12" /></linearGradient>
</defs>;

/** The Golden Crow (jinwu): a round, friendly sun-bird with three little legs, flapping wings and rays.
 * mood: happy / sleepy / worried / joy (eyes closed in a smile). */
function SunBird({x, y, r = 56, t, phase = 0, mood = 'happy', glow = 1, rays = 1, flap = 1, opacity = 1, tilt = 0, squash = 0}:
  {x: number; y: number; r?: number; t: number; phase?: number; mood?: string; glow?: number; rays?: number; flap?: number; opacity?: number; tilt?: number; squash?: number}) {
  if (opacity <= 0 || r <= 0) return null;
  const wing = Math.sin(t * 11 + phase * 7) * 22 * flap;
  const blinkT = (t + phase * 2.3) % 3.1, blink = mood === 'sleepy' || mood === 'joy' ? 0 : blinkT < .12 ? .15 : 1;
  const spin = t * 18 + phase * 40, pulse = 1 + .05 * Math.sin(t * 3 + phase * 5);
  const eyeY = -r * .12, eyeX = r * .3, brow = mood === 'worried' ? 1 : 0;
  return <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${1 + squash * .12} ${1 - squash * .12})`} opacity={opacity}>
    {glow > 0 && <circle r={r * 2.6 * pulse} fill="url(#sunGlow)" opacity={glow} />}
    {rays > 0 && <g transform={`rotate(${spin}) scale(${rays})`}>{Array.from({length: 12}, (_, i) =>
      <path key={i} transform={`rotate(${i * 30})`} d={`M ${-r * .22} ${-r * 1.02} Q 0 ${-r * (1.62 + (i % 2) * .22)} ${r * .22} ${-r * 1.02} Z`}
        fill={i % 2 ? '#ffd45c' : AMBER} stroke="#c8641a" strokeWidth={r * .03} strokeLinejoin="round" />)}</g>}
    {[-1, 0, 1].map(k => <path key={k} d={`M ${k * r * .22} ${r * .86} l ${k * r * .06} ${r * .3} m ${-r * .09} 0 l ${r * .18} 0`}
      stroke="#d9661a" strokeWidth={r * .07} strokeLinecap="round" fill="none" />)}
    <g transform={`translate(${-r * .86} ${r * .05}) rotate(${-20 - wing})`}><path d={`M 0 0 C ${-r * .55} ${-r * .35} ${-r * .75} ${r * .25} ${-r * .2} ${r * .38} Z`}
      fill="#ffbe2e" stroke="#c8641a" strokeWidth={r * .04} strokeLinejoin="round" /></g>
    <g transform={`translate(${r * .86} ${r * .05}) rotate(${20 + wing})`}><path d={`M 0 0 C ${r * .55} ${-r * .35} ${r * .75} ${r * .25} ${r * .2} ${r * .38} Z`}
      fill="#ffbe2e" stroke="#c8641a" strokeWidth={r * .04} strokeLinejoin="round" /></g>
    {[-1, 0, 1].map(k => <path key={`c${k}`} d={`M ${k * r * .14} ${-r * .9} q ${k * r * .12 - r * .08} ${-r * .38} ${k * r * .2} ${-r * .42}`}
      stroke="#f08a12" strokeWidth={r * .09} strokeLinecap="round" fill="none" />)}
    <circle r={r} fill="url(#sunBody)" stroke="#c8641a" strokeWidth={r * .05} />
    <ellipse cx={-r * .52} cy={r * .2} rx={r * .16} ry={r * .1} fill="#ff7a6a" opacity={.55} />
    <ellipse cx={r * .52} cy={r * .2} rx={r * .16} ry={r * .1} fill="#ff7a6a" opacity={.55} />
    {mood === 'joy' || mood === 'sleepy'
      ? [-1, 1].map(k => <path key={`e${k}`} d={mood === 'joy' ? `M ${k * eyeX - r * .12} ${eyeY + r * .02} Q ${k * eyeX} ${eyeY - r * .16} ${k * eyeX + r * .12} ${eyeY + r * .02}`
        : `M ${k * eyeX - r * .12} ${eyeY} Q ${k * eyeX} ${eyeY + r * .1} ${k * eyeX + r * .12} ${eyeY}`} stroke={INK} strokeWidth={r * .06} strokeLinecap="round" fill="none" />)
      : [-1, 1].map(k => <g key={`e${k}`} transform={`translate(${k * eyeX} ${eyeY}) scale(1 ${blink})`}>
        <ellipse rx={r * .12} ry={r * .16} fill={INK} /><circle cx={r * .04} cy={-r * .06} r={r * .045} fill="#fff" /></g>)}
    {brow > 0 && [-1, 1].map(k => <path key={`b${k}`} d={`M ${k * (eyeX + r * .15)} ${eyeY - r * .22} L ${k * (eyeX - r * .13)} ${eyeY - r * .34}`}
      stroke={INK} strokeWidth={r * .05} strokeLinecap="round" />)}
    <path d={`M ${-r * .13} ${r * .08} L ${r * .13} ${r * .08} L 0 ${r * .3} Z`} fill="#ff7b1c" stroke="#c8641a" strokeWidth={r * .03} strokeLinejoin="round" />
    {mood === 'worried' && <ellipse cx={0} cy={r * .44} rx={r * .07} ry={r * .09} fill={INK} opacity={.8} />}
  </g>;
}

/** A golden feather (quill + vane), pointing down. */
const Feather = ({x, y, s = 1, rot = 0, opacity = 1}: {x: number; y: number; s?: number; rot?: number; opacity?: number}) => opacity <= 0 ? null :
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <path d="M 0 -26 C 13 -16 12 10 0 26 C -12 10 -13 -16 0 -26 Z" fill="url(#feather)" stroke="#c8641a" strokeWidth={1.4} />
    <path d="M 0 -30 L 0 28" stroke="#b5560f" strokeWidth={1.6} strokeLinecap="round" />
    {[-14, -5, 4, 13].map(v => <path key={v} d={`M 0 ${v} l 8 6 M 0 ${v} l -8 6`} stroke="#e08a1a" strokeWidth={1} opacity={.8} />)}
  </g>;

/** Burst of golden feathers from a hit at time `at`, drifting down with a sway to `floor` (sea or ground). */
function FeatherBurst({t, at, x, y, floor = 960, seed = 1, n = 16, fall = 3.6, scale = 1}: {t: number; at: number; x: number; y: number; floor?: number; seed?: number; n?: number; fall?: number; scale?: number}) {
  const d = t - at;
  if (d < 0 || d > fall + 1.2) return null;
  const r = seeded(seed * 97 + 13), items = Array.from({length: n}, () => ({a: r() * Math.PI * 2, v: 120 + r() * 260, sw: 20 + r() * 50, ph: r() * 6, s: .7 + r() * .7, k: .75 + r() * .5}));
  return <g>{items.map((f, i) => {
    const burst = out3(d / .35), dx = Math.cos(f.a) * f.v * burst, dy0 = Math.sin(f.a) * f.v * .6 * burst;
    const T = fall * f.k, q = clamp((d - .2) / T), drop = sm(q) * (floor - y - dy0);
    const sway = Math.sin(d * 2.4 + f.ph) * f.sw * clamp(d / .6);
    const fx = x + dx + sway, fy = y + dy0 + drop, landed = q >= 1;
    const op = landed ? clamp(1 - (d - .2 - T) / .5) : clamp(d / .08);
    return <Feather key={i} x={fx} y={fy} s={f.s * scale} rot={Math.sin(d * 2.4 + f.ph) * 35 + f.a * 20} opacity={op} />;
  })}</g>;
}
/** Ripples where feathers touch the sea. */
function Ripples({t, at, x, floor, seed = 1, fall = 3.6, n = 6}: {t: number; at: number; x: number; floor: number; seed?: number; fall?: number; n?: number}) {
  const r = seeded(seed * 31 + 7);
  return <g>{Array.from({length: n}, (_, i) => {
    const lt = at + .2 + fall * (.75 + r() * .5), rx = x + (r() - .5) * 360, d = t - lt;
    if (d < 0 || d > 1.4) return null;
    const k = out3(d / 1.4);
    return <ellipse key={i} cx={rx} cy={floor + 8} rx={10 + 70 * k} ry={3 + 14 * k} fill="none" stroke="#fffbe6" strokeWidth={3 * (1 - k)} opacity={(1 - k) * .9} />;
  })}</g>;
}

/** Arrow on a quadratic arc from (x0,y0) to (x1,y1), launched at `from` and landing at `hit`. Trail glows white-gold. */
function Arrow({t, from, hit, x0, y0, x1, y1, lift = 140}: {t: number; from: number; hit: number; x0: number; y0: number; x1: number; y1: number; lift?: number}) {
  const d = (t - from) / Math.max(.05, hit - from);
  if (d < 0 || d > 1.25) return null;
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - lift;
  const pt = (u: number) => [(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1];
  const u = clamp(d), [ax, ay] = pt(u), [bx, by] = pt(Math.max(0, u - .02));
  const ang = Math.atan2(ay - by, ax - bx) * 180 / Math.PI;
  const tail = Math.max(0, u - .45), steps = 14, trail = Array.from({length: steps + 1}, (_, i) => pt(tail + (u - tail) * i / steps));
  const fade = d > 1 ? 1 - (d - 1) / .25 : 1;
  return <g opacity={fade}>
    <polyline points={trail.map(p => p.join(',')).join(' ')} fill="none" stroke="#fffbe0" strokeWidth={10} strokeLinecap="round" opacity={.35} />
    <polyline points={trail.map(p => p.join(',')).join(' ')} fill="none" stroke="#ffe27a" strokeWidth={4} strokeLinecap="round" opacity={.9} />
    {d <= 1 && <g transform={`translate(${ax} ${ay}) rotate(${ang})`}>
      <line x1={-86} y1={0} x2={0} y2={0} stroke="#8a5a2b" strokeWidth={5} strokeLinecap="round" />
      <path d="M 0 -9 L 24 0 L 0 9 Z" fill="#e9eef2" stroke="#5a6470" strokeWidth={2} />
      <path d="M -86 0 l -16 -12 l 22 0 Z M -86 0 l -16 12 l 22 0 Z" fill="#ffffff" stroke="#9aa5ae" strokeWidth={1.5} />
    </g>}
  </g>;
}
/** Hit flash: white-gold burst, ring and sparkle rays. */
function HitFlash({t, at, x, y, r = 70}: {t: number; at: number; x: number; y: number; r?: number}) {
  const d = t - at;
  if (d < 0 || d > .9) return null;
  const k = out3(d / .9), a = 1 - k;
  return <g>
    <circle cx={x} cy={y} r={r * (1 + 3 * k)} fill="url(#flash)" opacity={a} />
    <circle cx={x} cy={y} r={r * (.8 + 2.6 * k)} fill="none" stroke="#fffbe0" strokeWidth={8 * a} opacity={a} />
    {Array.from({length: 8}, (_, i) => {const ang = i * Math.PI / 4 + .3, l0 = r * (.9 + 1.2 * k), l1 = r * (1.4 + 2.6 * k);
      return <line key={i} x1={x + Math.cos(ang) * l0} y1={y + Math.sin(ang) * l0} x2={x + Math.cos(ang) * l1} y2={y + Math.sin(ang) * l1}
        stroke="#fff6c8" strokeWidth={6 * a} strokeLinecap="round" />;})}
  </g>;
}
/** Small twinkle star. */
const Twinkle = ({x, y, s = 1, opacity = 1, color = '#fffbe0'}: {x: number; y: number; s?: number; opacity?: number; color?: string}) => opacity <= 0 ? null :
  <path transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill={color}
    d="M 0 -22 C 3 -6 6 -3 22 0 C 6 3 3 6 0 22 C -3 6 -6 3 -22 0 C -6 -3 -3 -6 0 -22 Z" />;

/** Sun counter: label, ten little suns (lit or spent) and a big brush numeral in a vermilion badge. */
const NUMERALS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
function SunCounter({count, t, changedAt = -9, x = 70, y = 64, opacity = 1, label, numerals}: {count: number; t: number; changedAt?: number; x?: number; y?: number; opacity?: number; label: string; numerals: string[]}) {
  if (opacity <= 0) return null;
  const bump = 1 + .35 * Math.max(0, 1 - (t - changedAt) / .35) * (t >= changedAt ? 1 : 0);
  const numeral = numerals[count] ?? String(count);
  return <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-20} y={-16} width={640} height={156} rx={34} fill="rgba(255,248,230,.82)" stroke="#e7b36a" strokeWidth={3} />
    <g transform={`translate(66 62) scale(${bump})`}>
      <circle r={54} fill={RED} stroke="#9e2414" strokeWidth={4} />
      <Brush id="cnt" text={numeral} x={0} y={-44} size={88} fill={PAPER} shadow={false} align="middle" />
    </g>
    <text x={150} y={34} fontSize={30} fontWeight={700} fill="#8a4a1a" fontFamily='"PingFang SC", "Noto Sans SC", sans-serif' letterSpacing={4}>{label}</text>
    {Array.from({length: 10}, (_, i) => {
      const lit = i < count;
      return <g key={i} transform={`translate(${170 + i * 44} 90)`}>
        <circle r={17} fill={lit ? GOLD : 'rgba(150,120,90,.25)'} stroke={lit ? '#d9661a' : 'rgba(150,120,90,.45)'} strokeWidth={2.5} />
        {lit && Array.from({length: 8}, (_, j) => <line key={j} x1={0} y1={-20} x2={0} y2={-25} transform={`rotate(${j * 45 + t * 30})`} stroke={AMBER} strokeWidth={3} strokeLinecap="round" />)}
      </g>;
    })}
  </g>;
}

/** Dried-mud crack network in a trapezoid field (seeded jittered grid, perspective rows), spreading out from the centre.
 * Each edge has an `at` (0..1 order) so p=0 shows nothing and p=1 the whole network. */
function crackPaths(seed: number, box: [number, number, number, number], cols = 13, rows = 6) {
  const r = seeded(seed), [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, pts: number[][][] = [];
  for (let j = 0; j <= rows; j++) {
    const v = j / rows, y = y0 + (y1 - y0) * (v * v * .45 + v * .55), half = mix(.34, .52, v) * (x1 - x0);
    pts.push(Array.from({length: cols + 1}, (_, i) => [cx + (i / cols - .5) * 2 * half + (r() - .5) * (x1 - x0) / cols * .75, y + (j && j < rows ? (r() - .5) * (y1 - y0) / rows * .7 : 0)]));
  }
  const out: {d: string; w: number; at: number; o: number}[] = [], far = Math.hypot((x1 - x0) / 2, (y1 - y0) / 2);
  const edge = (a: number[], b: number[], v: number, border: boolean) => {
    if (r() < .14) return;
    const mx = (a[0] + b[0]) / 2 + (r() - .5) * 14, my = (a[1] + b[1]) / 2 + (r() - .5) * 8;
    const dist = Math.hypot(mx - cx, (my - (y0 + y1) / 2) * 1.6) / far;
    out.push({d: `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${mx.toFixed(1)} ${my.toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)}`,
      w: mix(1.6, 4.4, v), at: clamp(dist * .75 + (r() - .5) * .12), o: border ? .35 : .9});
  };
  for (let j = 0; j <= rows; j++) for (let i = 0; i < cols; i++) edge(pts[j][i], pts[j][i + 1], j / rows, j === 0 || j === rows);
  for (let j = 0; j < rows; j++) for (let i = 0; i <= cols; i++) edge(pts[j][i], pts[j + 1][i], (j + .5) / rows, i === 0 || i === cols);
  return out;
}
function Cracks({paths, p, opacity = 1}: {paths: {d: string; w: number; at: number; o: number}[]; p: number; opacity?: number}) {
  if (p <= 0 || opacity <= 0) return null;
  return <g opacity={opacity} strokeLinecap="round" strokeLinejoin="round" fill="none">{paths.map((c, i) => {
    const q = clamp((p * 1.25 - c.at) / .25);
    if (q <= 0) return null;
    return <g key={i} opacity={c.o}>
      <path d={c.d} stroke="rgba(255,240,205,.7)" strokeWidth={c.w + 3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} transform="translate(0 1.5)" />
      <path d={c.d} stroke="#6b4423" strokeWidth={c.w} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />
    </g>;
  })}</g>;
}
/** Picture-book cloud (cream puffs with a soft brown outline). */
const Cloud = ({x, y, s = 1, opacity = 1}: {x: number; y: number; s?: number; opacity?: number}) => opacity <= 0 ? null :
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <path d="M -130 30 C -150 30 -160 0 -132 -8 C -140 -40 -96 -56 -72 -36 C -64 -76 -4 -84 12 -46 C 30 -74 84 -66 88 -30 C 120 -40 150 -10 132 18 C 150 30 140 40 120 40 L -120 40 Z"
      fill="#fff8ec" stroke="#d9b58a" strokeWidth={3} strokeLinejoin="round" />
    <path d="M -100 22 C -60 30 20 30 100 22" stroke="#f1dcc0" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>;

/** Heat shimmer drawn as vector bands: translucent wavy ribbons drifting up and wobbling over the hot horizon.
 * (Copies of the plate, as strips or as a masked layer, looked more like real refraction but rendered differently
 * run to run on the GPU path and failed the delivery check with CODE_NONDETERMINISTIC.) */
function HeatHaze({t, y0, y1, amount = 1, n = 9}: {asset?: any; frame?: number; t: number; y0: number; y1: number; amp?: number; amount?: number; n?: number}) {
  if (amount <= 0) return null;
  const band = (y1 - y0) / n;
  return <Svg><g fill="none" strokeLinecap="round">{Array.from({length: n}, (_, i) => {
    const k = ((t * .22 + i / n) % 1), y = y1 - k * (y1 - y0), op = Math.sin(Math.PI * k) * .22 * amount;
    const pts = Array.from({length: 25}, (_, j) => {const x = j * 80; return `${x},${(y + Math.sin(j * .9 + t * 4.2 + i * 1.7) * band * .18).toFixed(1)}`;});
    return <polyline key={i} points={pts.join(' ')} stroke="#fff3dc" strokeWidth={band * .32} opacity={op} />;
  })}</g></Svg>;
}
/** Rising heat lines (wavy, translucent). */
function HeatLines({t, x0, x1, y, n = 9, amount = 1, seed = 4}: {t: number; x0: number; x1: number; y: number; n?: number; amount?: number; seed?: number}) {
  if (amount <= 0) return null;
  const r = seeded(seed), items = Array.from({length: n}, () => ({x: x0 + r() * (x1 - x0), ph: r(), h: 90 + r() * 90}));
  return <g fill="none" strokeLinecap="round">{items.map((it, i) => {
    const k = (t * .55 + it.ph) % 1, yy = y - k * 160, op = Math.sin(Math.PI * k) * .55 * amount;
    const path = `M ${it.x} ${yy} q 12 ${-it.h / 4} 0 ${-it.h / 2} q -12 ${-it.h / 4} 0 ${-it.h / 2}`;
    return <path key={i} d={path} stroke="#fff3d6" strokeWidth={5} opacity={op} />;
  })}</g>;
}
/** Rain streaks (canvas, frame-deterministic). */
function Rain({frame, amount = 1, angle = .16, seed = 3, opacity = 1}: {frame: number; amount?: number; angle?: number; seed?: number; opacity?: number}) {
  const r = seeded(seed), drops = Array.from({length: 420}, () => ({x: r() * W * 1.3, y: r() * H, l: 26 + r() * 50, v: 1300 + r() * 1100, z: r()}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    c.lineCap = 'round';
    drops.forEach((d, i) => {
      if (i / drops.length > amount) return;
      const y = (d.y + d.v * t) % (H + 120) - 60, x = (d.x - y * angle) % (W * 1.3) - W * .15;
      c.strokeStyle = `rgba(225,240,255,${.25 + .45 * d.z})`; c.lineWidth = 1 + 2 * d.z;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - d.l * angle, y + d.l); c.stroke();
    });
  });
  if (opacity <= 0) return null;
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity}} />;
}
/** Night stars and a friendly moon. */
function NightSky({t, amount = 1, moonX = 1560, moonY = 170}: {t: number; amount?: number; moonX?: number; moonY?: number}) {
  if (amount <= 0) return null;
  const r = seeded(91), stars = Array.from({length: 60}, () => ({x: r() * W, y: r() * 420, s: r()}));
  return <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <div style={{position: 'absolute', inset: 0, opacity: amount, background: 'linear-gradient(180deg, rgba(20,34,90,.88), rgba(30,40,90,.62) 55%, rgba(20,24,60,.55))', mixBlendMode: 'multiply'}} />
    <Svg style={{opacity: amount}}>{stars.map((s, i) => <Twinkle key={i} x={s.x} y={s.y} s={.18 + .3 * s.s} opacity={.35 + .6 * Math.abs(Math.sin(t * 2 + i))} />)}
      <circle cx={moonX} cy={moonY} r={120} fill="#fdf3c8" opacity={.18} /><circle cx={moonX} cy={moonY} r={90} fill="#fdf3c8" opacity={.25} />
      <circle cx={moonX} cy={moonY} r={70} fill="#fdf3c8" />
      <circle cx={moonX + 30} cy={moonY - 18} r={60} fill="rgba(30,40,90,.0)" /></Svg>
  </div>;
}
/** Warm sky tint (multiply + screen layers), amount 0..1. */
function Heat({amount = 1, t = 0}: {amount?: number; t?: number}) {
  if (amount <= 0) return null;
  const pulse = 1 + .05 * Math.sin(t * 3);
  return <>
    <div style={{position: 'absolute', inset: 0, opacity: amount, background: 'linear-gradient(180deg, rgba(255,120,40,.55), rgba(255,170,60,.25) 60%, rgba(255,140,40,.2))', mixBlendMode: 'multiply'}} />
    <div style={{position: 'absolute', inset: 0, opacity: amount * .5 * pulse, background: 'radial-gradient(ellipse at 50% 10%, rgba(255,236,170,.75), rgba(255,200,90,0) 65%)', mixBlendMode: 'screen'}} />
  </>;
}
/** Soft vignette. */
const Finish = ({vignette = .38}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(40,15,0,0) 52%, rgba(40,15,0,${vignette}) 100%)`}} />;
/** Decaying camera shake. */
const shake = (t: number, at: number, power = 14, len = .45) => {
  const d = t - at;
  if (d < 0 || d > len) return '';
  const k = (1 - d / len) * power;
  return `translate(${(Math.sin(d * 90) * k).toFixed(2)}px, ${(Math.cos(d * 70) * k * .7).toFixed(2)}px)`;
};
const fadeEdges = (t: number, dur: number, inS = .15, outS = .15) => Math.min(sm(t / inS), sm((dur - t) / outS));
/** Small caption-like note in the host text font. */
const Note = ({children, x, y, size = 30, color = 'rgba(255,244,224,.92)', opacity = 1, align = 'left', fonts}: any) =>
  !children || opacity <= 0 ? null : <div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y,
    textAlign: align === 'center' ? 'center' : 'left', fontFamily: fonts?.text, fontSize: size, letterSpacing: typeof children === 'string' && isLatin(children) ? 1 : 4,
    color, opacity, textShadow: '0 2px 10px rgba(60,20,0,.85)', whiteSpace: 'nowrap', fontWeight: 600}}>{children}</div>;

// Ending: Hou Yi with the children on the green hill, one friendly sun; warm light spreads on the cue word,
// then the title and the source line settle in while the scene holds.
export const meta = {
  params: {
    warmCue: {label: '暖光卡点词', type: 'text', default: '保护大家', maxLength: 24, help: '念到这个词，暖光铺开'},
    title: {label: '片名', type: 'text', default: '后羿射日', maxLength: 24},
    seal: {label: '朱印', type: 'text', default: '神话', maxLength: 6, help: '留空不落印'},
    source: {label: '出处', type: 'text', default: '故事出自《淮南子》《山海经》《楚辞》', maxLength: 60},
  },
  slots: {ending: '后羿和孩子们在绿色山坡上'},
};
export default function End(props: SceneInput) {
  const {t, at, endAll, dur} = cues(props);
  const warm = at(txt(props, 'warmCue'), endAll(dur - 2.6) - 1.2), done = endAll(dur - 2.6);
  const title = txt(props, 'title'), tp = clamp((t - done - .1) / .9), sp = sm((t - done - .9) / .5);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .1, .35)}}>
    <Plate asset={slot(props, 'ending')} frame={props.frame} p={t / dur} from={[1.1, -60, 30]} to={[1.02, 0, 0]} origin="30% 50%">
      <Svg><Defs />
        <SunBird x={1500} y={210 + Math.sin(t * 1.4) * 8} r={66} t={t} phase={.2} mood="joy" glow={.8 + .2 * sm((t - warm) / .8)} />
        {Array.from({length: 6}, (_, i) => <Twinkle key={i} x={1200 + (i * 173) % 640} y={120 + (i * 97) % 300} s={.6 + .2 * (i % 3)}
          opacity={sm((t - warm - i * .15) / .4) * (.4 + .5 * Math.abs(Math.sin(t * 2.5 + i)))} />)}
      </Svg>
    </Plate>
    <div style={{position: 'absolute', inset: 0, opacity: .55 * sm((t - warm) / 1.2), background: 'radial-gradient(ellipse at 76% 22%, rgba(255,226,150,.85), rgba(255,200,110,0) 62%)', mixBlendMode: 'screen'}} />
    <div style={{position: 'absolute', inset: 0, opacity: tp, background: 'radial-gradient(ellipse 560px 260px at 1340px 560px, rgba(255,249,236,.88), rgba(255,249,236,.55) 55%, rgba(255,249,236,0) 100%)'}} />
    <Svg><Defs />
      <Brush id="et" text={title} x={1340} y={440} size={150} p={tp} align="middle" maxWidth={900} fill="#5a2a10" stroke="#fff6e4" />
      <Seal id="es" text={txt(props, 'seal')} x={isLatin(title) ? Math.min(1860, 1340 + Math.min(900, latinWidth(title, 150 * .62, 150 * .01)) / 2 + 60) : 1340 + Array.from(title).length * 150 * .96 / 2 + 70} y={isLatin(title) ? 505 : 540} size={80} p={clamp((t - done - .9) / .3)} />
    </Svg>
    <div style={{position: 'absolute', left: 1340 - 420, width: 840, top: 640, textAlign: 'center', fontFamily: props.fonts.text, fontSize: 30, fontWeight: 600,
      letterSpacing: isLatin(txt(props, 'source')) ? 1 : 3, color: '#6b3a18', opacity: sp, whiteSpace: 'nowrap'}}>{txt(props, 'source')}</div>
    <Finish vignette={.3} />
  </div>;
}
