import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// Houyi shoots the suns: shared picture-book library. prepare.py joins it with each module into scenes/<module>.tsx,
// inlining only the Ma Shan Zheng (OFL) glyph outlines a module draws. No runtime fonts, randomness or clocks.
const GLYPHS: Record<string, string> = {"乌":"M556 798Q592 790 610 794Q628 798 640 818Q649 828 647.5 836.5Q646 845 633 858L622 870H561Q500 871 480 875Q460 879 428 885.5Q396 892 378 898L346 907Q299 920 268 936Q252 945 244.5 946.5Q237 948 217 946Q176 943 169 932.5Q162 922 185 901Q204 881 223 872Q242 863 275 858Q310 852 349 840Q388 828 424 822Q460 816 484.5 810Q509 804 520 804Q531 804 556 798ZM353 406Q367 395 370 395Q373 395 386 409L400 423L394 459Q389 494 388 528Q387 562 383 613.5Q379 665 381 671Q382 675 394 675.5Q406 676 414 672Q421 669 461 658Q506 646 571.5 644.5Q637 643 690 651Q777 666 801 693Q809 702 821.5 727Q834 752 832 755Q823 769 820 836Q818 870 814 873.5Q810 877 810 895Q810 909 805 921.5Q800 934 782 967Q772 983 762 994.5Q752 1006 748 1012Q739 1026 724.5 1043Q710 1060 705 1060Q699 1060 684 1073Q668 1086 643 1097Q618 1108 606 1108Q591 1108 577 1092.5Q563 1077 560 1064Q549 1012 489 972Q470 960 464 951Q460 944 460 942.5Q460 941 464 940Q472 936 484 942Q499 948 540 955.5Q581 963 606 965L635 966L655 935Q688 881 698 781Q701 744 695.5 736Q690 728 659 723Q603 712 532 718Q461 724 422 743Q399 754 388.5 763Q378 772 369 791Q361 808 350.5 813Q340 818 333 808Q326 799 326 794Q326 789 315 767Q308 750 307.5 744Q307 738 312 720Q323 681 331 538Q334 454 337.5 434.5Q341 415 353 406ZM536 294Q543 292 571 293Q599 294 608 297Q662 319 657 359Q655 374 651 406.5Q647 439 642.5 447.5Q638 456 638 468Q638 493 622.5 531.5Q607 570 591 585Q578 597 558 598Q537 601 517 595.5Q497 590 489 580Q481 568 465.5 561.5Q450 555 443 541.5Q436 528 431 528Q426 528 426 524Q426 520 446 517.5Q466 515 484 517Q506 521 513 516Q525 510 536.5 477Q548 444 554 398Q558 364 557.5 354.5Q557 345 550 342Q540 340 510 345.5Q480 351 464 358Q445 367 431 364Q410 359 410 353Q410 352 414 352Q419 352 417 347Q413 335 437 322Q461 309 508 300Q531 295 536 294ZM387 187Q403 180 424 190Q437 197 445.5 214Q454 231 454 253Q454 267 450.5 273.5Q447 280 428 298Q402 323 402 326Q402 331 343.5 389Q285 447 267 461Q244 479 238 481.5Q232 484 223 489Q215 494 208.5 493Q202 492 202 486.5Q202 481 228.5 446.5Q255 412 260 412Q266 412 266 406Q266 400 269.5 400Q273 400 271.5 392Q270 384 272.5 378Q275 372 280 372Q285 372 288 363.5Q291 355 294.5 355Q298 355 298 351.5Q298 348 313 324.5Q328 301 339 279.5Q350 258 359.5 240.5Q369 223 369 215Q369 207 375.5 205Q382 203 382 196Q382 189 387 187Z","太":"M328 877Q349 872 358.5 873.5Q368 875 395 887Q425 900 436 911Q447 922 447 941Q447 951 444 957Q441 963 427 976Q413 989 408 991Q403 993 393 991Q380 987 370 976L340 941Q320 918 320 914Q320 910 312 900Q304 890 307.5 885.5Q311 881 328 877ZM372 238Q376 233 394 241.5Q412 250 422 261Q430 270 431.5 279.5Q433 289 432 335Q431 397 426 421Q426 422 425 424Q421 448 428.5 452Q436 456 488 456Q493 456 495 455Q564 454 571 451Q580 445 603 446.5Q626 448 642 455Q661 465 666.5 465Q672 465 682 475.5Q692 486 692 511Q692 528 689.5 533Q687 538 677 547Q663 559 656 559Q649 559 623 546Q588 526 526 516Q491 511 462.5 517Q434 523 431.5 525Q429 527 438 534.5Q447 542 455 567Q464 594 477 620Q484 633 484 639Q484 645 487.5 646.5Q491 648 503 666.5Q515 685 554 725.5Q593 766 598 774Q609 790 679.5 828.5Q750 867 800 885Q827 894 850 905.5Q873 917 894 919Q932 925 949 945Q956 952 946.5 962.5Q937 973 921 975Q896 977 859.5 999Q823 1021 814 1040Q807 1053 798 1055.5Q789 1058 772 1050Q754 1042 739.5 1036.5Q725 1031 672 997Q585 939 527 864Q507 837 505 835Q488 820 462.5 778Q437 736 423 701Q409 668 403 662Q397 656 397 650Q397 643 393 647Q389 649 387 656Q385 666 379 671Q373 676 373 685Q373 694 367 701.5Q361 709 361 717Q361 725 340.5 764.5Q320 804 305 822Q289 846 281 857Q270 876 243 895Q225 908 200 930Q175 952 162 958.5Q149 965 108 988Q49 1022 49 1012Q49 1009 52 1007Q59 1005 90.5 971.5Q122 938 133 922Q149 899 152 898Q155 897 164 881.5Q173 866 177 861Q210 820 229 784Q242 759 252 742.5Q262 726 275 685Q288 644 293 629Q309 586 314 556Q315 544 314.5 541.5Q314 539 309 541Q301 543 284 546Q269 549 255 558.5Q241 568 237 578Q233 588 225 588Q217 588 199 578Q181 568 168 556Q153 543 150 543Q147 543 158 527Q181 492 286 477Q322 473 328.5 470Q335 467 338 457Q353 387 356 342Q361 299 365 284.5Q369 270 369 255Q369 240 372 238Z","扶":"M237 278Q252 269 268 286Q277 295 290 303Q301 310 307.5 329Q314 348 310 360Q307 371 300 402Q295 430 299 436Q303 442 324 440Q343 438 352 446Q365 459 357 483Q350 503 320 498Q299 494 295 503Q291 512 291 564Q291 622 296 622Q301 622 307 616Q309 612 319 610.5Q329 609 337 610Q345 611 345 613Q345 618 322.5 641.5Q300 665 295 671Q290 677 290.5 717Q291 757 297 873Q303 968 292 991Q285 1006 282 1006Q279 1006 279 1012Q279 1018 270.5 1031.5Q262 1045 259 1045Q256 1045 256 1051Q256 1057 243 1060Q220 1064 220 1051Q220 1045 217 1045Q214 1045 188.5 1020Q163 995 163 991Q163 989 137.5 963Q112 937 112 933Q112 929 114.5 928.5Q117 928 121 929.5Q125 931 129 934Q135 938 159 945.5Q183 953 190 953Q206 953 213 882Q215 858 216 830.5Q217 803 216 784.5Q215 766 213 766Q210 766 202 776Q194 786 169.5 806.5Q145 827 127 844.5Q109 862 99 862Q90 862 69.5 854.5Q49 847 49 842Q49 839 42 839Q36 839 31 833Q26 827 26 818Q26 792 118 743Q152 724 184 702Q216 680 217 673Q219 666 219 588L218 511L209 512Q196 514 180 523Q164 532 163 539Q159 567 117 539Q108 534 106 529Q104 524 104 514Q104 503 106 499.5Q108 496 117 492Q135 483 163 472.5Q191 462 195 462Q201 462 211 457L222 453L218 407Q213 320 226 297Q233 282 237 278ZM554 236Q559 231 563 233Q567 235 583 252Q600 270 603 277Q606 284 607 306Q610 335 607 367L605 397L639 394Q674 391 695 391Q709 390 713.5 392Q718 394 723 401Q738 420 724 452Q719 464 712.5 467Q706 470 687 465Q667 462 640 462Q616 462 611.5 469Q607 476 605 517Q603 554 598.5 555.5Q594 557 594 568V580L642 578Q690 575 729 572Q779 569 816 576Q853 583 865 598Q871 605 844 646Q834 661 827.5 663Q821 665 808 659Q797 652 767.5 644.5Q738 637 722 635Q649 629 625.5 630Q602 631 602 639Q602 644 617 667L646 711Q660 735 691 768.5Q722 802 743 816Q768 833 769.5 835.5Q771 838 786.5 845Q802 852 804 854Q806 857 836 871Q866 885 880 890Q896 895 903.5 901.5Q911 908 931.5 918.5Q952 929 952 933Q952 937 957 937Q962 937 969 942Q974 945 974 947.5Q974 950 969 959Q963 970 951 975Q939 980 911 983Q885 986 859 1000L834 1012L806 999Q785 988 754 968Q723 948 711 937Q657 890 634 861Q616 839 593.5 806Q571 773 571 769Q571 767 565 761Q560 757 555 762Q550 767 540 787L522 819Q512 837 512 840Q512 843 502 853.5Q492 864 487 877Q480 892 428 940Q407 960 384.5 972Q362 984 351 983Q327 980 356 946Q359 943 363 939Q384 917 421.5 862Q459 807 469 782Q479 764 483 754Q498 726 503 671L505 648L491 650Q475 654 452.5 662.5Q430 671 424 677Q416 685 401 682Q377 677 366 660.5Q355 644 367 632Q383 619 467 602L512 593V581Q512 569 516 528L518 486L487 482Q467 480 460 477Q453 474 445 466L434 454L445 444Q454 437 474.5 426.5Q495 416 507 413Q517 411 520 402.5Q523 394 523.5 341Q524 288 529.5 277Q535 266 535 260.5Q535 255 541 253Q547 251 547 247Q547 243 554 236Z","树":"M485 483Q508 476 547.5 484.5Q587 493 594 506Q597 513 595.5 523Q594 533 588 539Q581 549 558.5 594Q536 639 536 646Q536 650 531 655Q514 668 536 693Q562 720 551 747Q543 766 520.5 768.5Q498 771 483 756Q474 746 468 746Q463 746 424 777Q385 808 379 817Q372 828 353 841Q334 854 325 852Q316 850 315 844Q314 839 325.5 820Q337 801 353 785Q362 774 374 756.5Q386 739 406 714L425 689L403 666Q381 643 378 624.5Q375 606 377 599Q382 589 406.5 596Q431 603 443 617Q462 638 474 610Q481 594 492.5 561.5Q504 529 504 526Q502 524 492.5 524.5Q483 525 468 529Q453 533 444 537Q427 545 418 544Q409 543 403 532Q399 524 399 520Q399 516 403 509Q410 499 441.5 492.5Q473 486 485 483ZM256 283 266 272 280 287Q293 302 304 320Q312 334 312.5 344.5Q313 355 306 392Q302 414 304 417.5Q306 421 326 418Q366 414 381.5 434.5Q397 455 373 477Q364 485 355.5 486Q347 487 333 481Q319 475 309 478.5Q299 482 299 493Q299 503 302.5 505Q306 507 313 521.5Q320 536 315 552.5Q310 569 306 569Q302 569 296 589.5Q290 610 292 614Q294 618 329 629Q361 638 370 647Q379 656 377 677Q377 698 366 707Q355 717 337.5 717Q320 717 308 707Q296 698 286 693L276 687L280 855L282 1021L272 1031Q255 1048 234 1039Q222 1034 211.5 995.5Q201 957 205 930Q208 912 209 836L210 760L200 761Q193 762 177.5 771.5Q162 781 158 788Q154 792 131.5 818Q109 844 102 850Q92 859 76 871Q64 879 60.5 879.5Q57 880 53 877Q47 870 52 865Q62 855 73 836Q84 817 87 809Q90 797 101 782Q132 743 157 690Q171 659 171 657Q171 655 193 609Q207 580 214 562Q221 544 223 531.5Q225 519 222 514Q219 509 211 508Q190 506 152 540Q123 568 105 547Q86 526 101 509Q109 501 145 481.5Q181 462 189 462Q198 462 213.5 454.5Q229 447 231 443Q233 435 236 392Q242 326 245 309Q248 292 256 283ZM742 247 753 236Q754 236 763.5 244.5Q773 253 779 258Q785 263 792 274Q799 285 799.5 290Q800 295 809.5 315.5Q819 336 817.5 349Q816 362 813.5 386.5Q811 411 809.5 416Q808 421 813 431Q816 438 823.5 439.5Q831 441 870 441Q920 441 935.5 446Q951 451 951 468Q951 482 940 495Q918 518 884 497Q867 487 843.5 487Q820 487 818 491Q813 499 810.5 552Q808 605 811 643Q821 747 825.5 851.5Q830 956 826 976Q814 1031 740 1052Q724 1057 719 1057Q714 1057 706 1052Q695 1044 685.5 1033Q676 1022 676 1017Q676 1010 659 996Q642 982 634.5 975Q627 968 624 968Q621 968 614 953Q608 940 611 940Q612 940 614 941Q634 950 666 953Q698 956 705 950Q722 937 725 891Q726 867 723 804Q720 741 717 741Q714 741 701.5 754Q689 767 677 764Q668 761 657.5 753Q647 745 647 739Q647 736 634 723Q621 710 613 707Q607 705 596 688Q581 663 589 648Q597 633 626 636Q665 639 695 656Q713 665 716 662Q719 659 719.5 577.5Q720 496 717 493Q713 489 687.5 495.5Q662 502 654 509Q632 528 611 513Q598 503 598 492Q598 485 602 481Q606 477 619 472Q642 463 678.5 455.5Q715 448 717.5 444.5Q720 441 718 365Q717 303 720.5 284.5Q724 266 742 247Z","桑":"M604 877Q609 873 642 875.5Q675 878 703 886Q809 914 809 936Q809 943 815 948Q821 953 821.5 973.5Q822 994 816 1007.5Q810 1021 794 1029L778 1038L757 1028Q736 1018 736 1015Q736 1007 700 977L674 956Q651 936 625 917Q602 899 602 889.5Q602 880 604 877ZM550 194Q556 190 571 194Q586 198 601 208Q617 219 617 220Q617 228 600 255.5Q583 283 565 303Q557 314 557 318Q557 323 591 339.5Q625 356 642 361Q655 366 658.5 372Q662 378 660 393Q659 406 663.5 410.5Q668 415 682 416Q695 417 719 427.5Q743 438 745 445Q747 448 744 468Q741 488 739 489Q707 512 707 517Q707 522 701 529Q696 534 696.5 536Q697 538 705 540Q716 545 718 545Q722 545 755.5 559Q789 573 796 578Q805 583 805 591.5Q805 600 811 609Q818 617 816.5 634.5Q815 652 806 665Q800 675 795.5 677Q791 679 780 679Q767 679 755.5 673Q744 667 715 643Q692 624 668 609L642 594L618 608Q591 623 516 649Q509 652 517 656.5Q525 661 530.5 665Q536 669 539 705L542 743L567 742Q591 742 651 737Q711 732 754 732Q781 732 790 731Q799 730 803 724Q810 716 823 716Q836 716 848 724Q862 732 870 732Q889 732 899.5 762.5Q910 793 894 808Q881 821 813 810Q750 800 647 800Q556 800 551 804Q549 808 547.5 827.5Q546 847 542 940Q540 999 534.5 1019.5Q529 1040 512 1056Q498 1068 491 1084Q481 1105 468 1099Q455 1093 438 1059Q429 1040 424 1036Q419 1032 417 1015Q415 1001 418.5 997.5Q422 994 435 994Q442 994 445 971.5Q448 949 448 884Q449 858 448.5 845.5Q448 833 447.5 825Q447 817 445.5 815Q444 813 442 813Q437 814 408.5 816.5Q380 819 367.5 822.5Q355 826 345 826Q337 826 337 829Q337 832 347 845Q354 858 353.5 869Q353 880 343 916Q336 939 333.5 963Q331 987 314 1010Q289 1042 268 1042Q265 1042 259 1024.5Q253 1007 249 987Q244 966 244 958.5Q244 951 249 940Q255 924 264 914Q275 901 289 872Q297 858 308 848Q327 833 318 831Q316 831 314 832Q306 833 283.5 838.5Q261 844 257 847Q253 850 237 854Q226 858 210 868Q194 878 189 885Q187 888 166.5 886.5Q146 885 129.5 869.5Q113 854 106 849Q99 844 101 837.5Q103 831 99 829Q90 826 108 820Q128 812 162 806Q209 798 220 793Q245 785 415 760L450 756L452 723Q455 685 453 677Q451 669 436 667Q418 665 412 672Q406 679 401 679Q396 679 365 656Q343 639 337 637Q331 635 320 638Q306 644 303.5 647Q301 650 284 660L235 688Q205 704 188 711Q180 713 172 714.5Q164 716 158.5 715.5Q153 715 153 712.5Q153 710 161 703Q169 696 172 696Q177 696 219 666Q261 636 277 622L301 599L286 581Q272 562 272 549V536L300 538Q330 540 339 542Q343 543 348 537Q353 531 362 514Q377 485 377 482Q376 480 367 481Q358 482 340 487Q322 492 300 499Q263 511 249 512Q235 513 230 504Q226 496 230 496Q234 496 234 489Q234 482 245 476.5Q256 471 294 458Q323 447 341 434.5Q359 422 427 361Q446 345 436 341Q435 341 433 341Q427 340 405 324.5Q383 309 383 305Q381 293 388 291Q395 289 420 292Q452 296 465 298Q474 301 479 296.5Q484 292 499 270Q520 239 520 236Q520 230 502 229Q484 228 458 231.5Q432 235 411 241Q376 253 378 232Q381 206 507 199Q547 198 550 194ZM514 377Q498 370 497.5 370Q497 370 484 382Q471 394 468 394Q465 394 445.5 407.5Q426 421 426 423Q426 425 438.5 433Q451 441 451 454Q451 465 437.5 500Q424 535 418 536Q414 537 414 545Q414 553 408 557Q402 562 403 567.5Q404 573 414 584Q422 594 423.5 599.5Q425 605 422 624Q418 649 418 654Q418 657 451 641Q484 625 521 604Q558 583 569 573Q579 566 580 563Q581 560 576 557Q535 532 532 515Q532 507 534.5 505.5Q537 504 553 504Q575 504 591 511Q615 520 621 518.5Q627 517 640 500Q657 478 660 469Q662 462 658.5 460.5Q655 459 633 459Q581 459 572 473Q570 477 548 477Q531 478 528.5 476Q526 474 525 465Q524 455 527.5 451.5Q531 448 549 439Q575 427 580 427Q585 427 585 424Q585 421 556.5 401.5Q528 382 514 377Z","金":"M257 848Q271 835 285 845Q290 848 313 857Q336 866 344.5 875Q353 884 350 896.5Q347 909 351 918Q355 927 349 936Q340 952 314.5 958Q289 964 284 951Q283 943 277.5 943Q272 943 269 936.5Q266 930 254 910Q241 890 239 882Q237 874 242 869Q248 864 248 860.5Q248 857 257 848ZM472 557Q509 555 520.5 556Q532 557 539 563Q546 572 546 576Q546 580 549 588Q552 596 537 611L522 626L497 624Q454 618 440 627Q438 628 439 630Q441 633 444 631Q449 628 466.5 637Q484 646 488 652Q492 661 489 670Q487 680 494 682.5Q501 685 530 686Q564 688 571 690Q576 692 585 705Q594 718 594 725Q594 731 582 747Q570 763 564 763Q559 763 559 766Q559 774 580 774Q590 774 602 781Q612 785 615 790.5Q618 796 623 816Q629 843 624.5 854Q620 865 598 876Q576 886 567 892.5Q558 899 532.5 907.5Q507 916 489 925Q478 930 475 933Q472 936 472 945Q472 959 466 963Q460 967 460 970Q460 975 562 980Q643 984 662 989Q681 994 688 1010Q693 1022 686 1038Q676 1066 657 1071Q638 1076 605 1061Q527 1030 407 1039Q372 1041 348 1043Q331 1045 303.5 1052.5Q276 1060 270 1066Q266 1069 257 1069Q248 1069 248 1072Q248 1075 236 1083Q226 1088 222.5 1088Q219 1088 210 1084Q200 1076 188.5 1072Q177 1068 177 1062.5Q177 1057 173.5 1057Q170 1057 167.5 1051Q165 1045 179 1032Q202 1012 289 996Q325 990 334 984Q345 980 357 966Q369 952 371 945Q375 935 376 856.5Q377 778 375 776Q371 775 351 783L331 791L302 782Q283 775 278.5 772Q274 769 274 763Q273 749 289 737Q305 725 340 715L381 702L384 681Q386 660 388 654Q389 652 388.5 651Q388 650 386 649.5Q384 649 380.5 649Q377 649 371 649Q352 649 335 636.5Q318 624 320.5 618.5Q323 613 323 607Q323 599 342.5 591.5Q362 584 415 572Q439 566 446.5 562.5Q454 559 472 557ZM540 764Q529 759 503 759L477 758L474 771Q472 784 470 802Q462 882 470 883Q473 883 483 874Q494 860 511 833.5Q528 807 529 801Q529 792 541 781L552 769ZM412 264Q421 252 421 244.5Q421 237 425 237Q429 237 431 229Q433 221 442 220Q451 219 449.5 212Q448 205 456.5 205Q465 205 465 208.5Q465 212 488 227Q511 242 513 249Q515 256 520 256Q522 256 523 260.5Q524 265 522 272.5Q520 280 515 288Q508 301 504 311Q500 321 495 324Q487 328 496 333Q500 334 504 334Q525 334 543 361Q553 376 570 389.5Q587 403 608 431Q638 472 687.5 518.5Q737 565 779 594Q794 604 794 607Q794 610 800 610Q806 610 806 613Q806 616 817.5 622.5Q829 629 835 629Q840 629 852 640Q864 651 881 656.5Q898 662 919.5 675Q941 688 955 692Q966 693 968 695.5Q970 698 970 709Q970 723 969.5 723Q969 723 936 729Q903 735 874 753Q845 771 835 771Q826 771 802 759.5Q778 748 765 737Q753 729 741 722Q726 715 671.5 660.5Q617 606 617 598Q617 594 612 591Q607 588 597.5 574Q588 560 585 558Q582 556 559.5 524Q537 492 525 474Q490 422 455 405Q437 398 434 398Q431 398 417 418Q377 480 317.5 543Q258 606 213 637Q200 646 198 649Q196 652 191 652Q186 652 186 655.5Q186 659 172 664Q158 669 146.5 678.5Q135 688 118 695.5Q101 703 83 716Q52 737 34 730Q28 728 33 719Q47 694 71 677Q105 656 157 609Q209 562 245 521Q256 507 279.5 476Q303 445 303 442Q303 440 315 425.5Q327 411 327 407.5Q327 404 332 398Q337 392 355 359Q385 301 412 264Z","阳":"M586 380Q624 373 694 382Q741 386 786 404.5Q831 423 843 441Q851 454 851 461Q851 468 843 486Q831 511 827 524.5Q823 538 820 570Q812 646 818 798Q820 864 817.5 886Q815 908 801 923Q790 935 783 948Q777 961 765.5 973.5Q754 986 749 986Q744 986 739 991.5Q734 997 717.5 1001.5Q701 1006 686 999Q659 985 654 963Q651 950 640 939Q611 906 598 900Q578 889 593 884Q599 881 599 875Q599 869 604.5 869Q610 869 617 875Q624 881 646 884Q661 886 666 885Q671 884 674 878Q680 869 686 869Q689 869 690.5 865.5Q692 862 690 858Q688 854 684 853Q678 851 664 856Q650 861 606 864Q547 866 538 882L528 905Q522 916 518.5 918.5Q515 921 507 919Q494 916 481 905Q473 896 471 889Q469 882 469 854Q469 815 474 730.5Q479 646 480.5 570Q482 494 482.5 482.5Q483 471 482 452Q481 440 483.5 435Q486 430 496 421Q512 409 539.5 396.5Q567 384 586 380ZM680 445Q664 441 631.5 440.5Q599 440 584 444Q569 448 549.5 460Q530 472 529 480Q527 486 528.5 528Q530 570 533 577Q533 579 547.5 576Q562 573 577 567.5Q592 562 595 557Q598 551 634 550Q664 549 674.5 553.5Q685 558 688 575Q695 605 698 566Q700 551 700 526Q701 464 700 456.5Q699 449 680 445ZM695 643Q696 612 692 614Q689 616 687 623Q679 640 665.5 647.5Q652 655 619 659Q597 662 586.5 668.5Q576 675 554 675L533 676L534 734Q534 792 538 797Q545 804 609 784Q629 778 651 777.5Q673 777 680 783Q686 788 689.5 785Q693 782 693.5 724.5Q694 667 695 643ZM379 225Q386 217 392 215.5Q398 214 418 217Q452 220 473.5 232.5Q495 245 495 261Q495 275 485 294.5Q475 314 464 321Q450 329 433 354L373 435Q357 456 357 460.5Q357 465 373 482Q396 507 406 529L420 558Q426 571 426 579.5Q426 588 433 605Q444 631 429 686.5Q414 742 390 770Q382 781 375 783.5Q368 786 351 789Q327 791 327 785Q327 778 294 755Q276 742 272 733Q268 724 260.5 719.5Q253 715 249 720Q238 730 236 849.5Q234 969 244 979Q249 984 248 1004Q247 1024 239 1038Q232 1052 221 1064.5Q210 1077 204 1077Q199 1077 188 1065Q177 1053 166 1038Q157 1025 151.5 982Q146 939 154 932Q165 919 169 733Q171 628 175 607Q179 586 179 535.5Q179 485 186 445Q196 389 211.5 372Q227 355 251 376Q259 384 262 384Q265 384 274 400Q283 416 283 421Q283 428 271 441Q261 449 259.5 455.5Q258 462 258 479Q258 503 251 557Q239 653 249 659Q254 662 291.5 661Q329 660 334 657Q338 652 343.5 629.5Q349 607 342 585Q328 543 308 537Q292 533 288.5 523.5Q285 514 286 485Q288 448 298.5 432.5Q309 417 309 410Q309 403 315.5 394.5Q322 386 322 376Q322 366 327 359Q333 347 340.5 328Q348 309 348 304Q348 300 346.5 298.5Q345 297 340.5 298Q336 299 328.5 300.5Q321 302 307 307Q213 339 193 354Q175 368 164 364Q157 363 155.5 359.5Q154 356 154 343Q154 330 156 325.5Q158 321 170 313Q198 294 323 252Q370 235 379 225Z","鸟":"M536 774Q557 771 581.5 772Q606 773 618 779Q632 786 634.5 810.5Q637 835 624 850Q618 858 608.5 859Q599 860 554 857Q530 856 487.5 860.5Q445 865 414 874L366 886Q347 891 313 905Q293 913 288 913Q283 913 257 925Q231 937 216 936.5Q201 936 183 924Q171 917 167.5 912Q164 907 164 900Q164 879 194 860.5Q224 842 268 832Q299 826 314 820Q359 803 464 786Q515 779 536 774ZM349 398Q357 390 360 391Q363 392 370 406Q376 418 376.5 427.5Q377 437 375 475Q372 527 371 552Q370 577 364 610Q355 655 362 655Q363 655 365 655Q373 652 406.5 640.5Q440 629 497 618Q536 611 555 609Q574 607 622 610Q683 612 713 617.5Q743 623 773 640Q812 661 823.5 679Q835 697 835 735Q832 877 817 897Q810 907 810 914Q810 921 804 932Q798 943 798 951Q798 969 746 1024.5Q694 1080 657 1102L639 1112L633 1103Q626 1093 607 1075Q588 1057 574 1047Q525 1011 512.5 999.5Q500 988 491 968Q480 941 482 939Q488 933 532 959Q554 973 570.5 970.5Q587 968 611 976L636 982L648 970Q659 959 659 955Q659 951 667 947Q679 939 696.5 895Q714 851 719 816Q724 788 724 749.5Q724 711 719 701Q715 689 700 682.5Q685 676 653 669Q622 663 576 664Q530 665 505 673Q483 679 451 688Q415 697 384 716.5Q353 736 348 752Q346 760 336 773Q326 786 322.5 786Q319 786 312 773Q305 760 302 747Q300 738 298.5 725.5Q297 713 297 704.5Q297 696 299 695Q302 695 309 677.5Q316 660 319 643Q323 620 327 521Q329 455 330.5 437Q332 419 336 416Q343 412 343 408.5Q343 405 349 398ZM425 383Q446 375 474 383Q491 387 496.5 394.5Q502 402 500 419Q497 446 483 453.5Q469 461 449 448Q414 424 414 402Q414 392 416 389Q418 386 425 383ZM510 274Q547 266 561.5 266.5Q576 267 607 278Q669 300 643 341Q636 354 632 375.5Q628 397 622.5 408.5Q617 420 614 447Q609 497 572 543Q544 576 534 560Q532 557 522.5 557Q513 557 508 546Q503 535 490 528Q480 524 470.5 514Q461 504 461 497Q461 494 470.5 491Q480 488 500 478Q520 469 525.5 453Q531 437 541 359Q544 330 547 323Q548 317 546 316Q544 315 535 315Q522 315 498.5 321Q475 327 467 329Q452 332 446.5 315Q441 298 455 289Q465 282 510 274ZM397 187Q404 179 412.5 181Q421 183 441 197Q462 210 466.5 217.5Q471 225 462 235Q455 243 436 267Q404 308 376 329Q361 341 331 367L283 406Q266 420 249.5 435Q233 450 228 450Q217 450 231 426Q235 420 239 415Q251 400 261.5 383Q272 366 278 359Q287 350 309 323Q331 296 331 294Q331 291 346.5 270Q362 249 376.5 221.5Q391 194 397 187Z"};
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
const MEDIA: Record<string, string> = {"fusang":"release-assets/673381abb323fc2a9563a6e2bc0ba7e503271f7cfedf5364bcc1bb6bed8fb637.webp"};
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

// Fusang tree in the eastern sea: ten golden crows doze on its branches, wake on the cue word, the name is brushed in;
// on the fly cue one crow takes off, grows rays and becomes the day's sun.
export const meta = {
  params: {
    wakeCue: {label: '醒来卡点词', type: 'text', default: '太阳鸟', maxLength: 24, help: '念到这个词，树上的金乌睁开眼睛'},
    nameCue: {label: '名字卡点词', type: 'text', default: '金乌', maxLength: 24},
    name: {label: '名字', type: 'text', default: '金乌', maxLength: 12},
    nameSeal: {label: '名字朱印', type: 'text', default: '太阳鸟', maxLength: 6, help: '留空不落印'},
    treeCue: {label: '扶桑卡点词', type: 'text', default: '扶桑', maxLength: 24},
    treeName: {label: '树名', type: 'text', default: '扶桑树', maxLength: 12},
    flyCue: {label: '飞上天卡点词', type: 'text', default: '一只飞上天', maxLength: 24, help: '念到这个词，最高处的一只金乌飞上天'},
  },
  slots: {fusang: '扶桑树底图'},
};
const PERCH = [[450, 168], [840, 138], [495, 405], [645, 352], [405, 488], [1350, 105], [1290, 322], [1500, 322], [1680, 300], [1440, 450]];
const FLIER = 5;

export default function Fusang(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props);
  const wake = at(txt(props, 'wakeCue'), start(0, .3) + 1.6), named = at(txt(props, 'nameCue'), wake + 1.0);
  const tree = at(txt(props, 'treeCue'), start(1, dur * .5) + .9), fly = at(txt(props, 'flyCue'), end(1, dur) - 1.4) - .1;
  const name = txt(props, 'name'), treeName = txt(props, 'treeName');
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur)}}>
    <Plate asset={slot(props, 'fusang')} frame={props.frame} p={t / dur} from={[1.06, 30, 10]} to={[1.13, -40, 30]} origin="50% 30%">
      <Svg><Defs />
        {PERCH.map(([x, y], i) => {
          const awake = t >= wake + i * .05, r = 38;
          if (i === FLIER) {
            const k = sm((t - fly) / 1.6), px = mix(x, x + 260, k), py = mix(y - r, -260, k) - Math.sin(Math.PI * k) * 60;
            return <g key={i}>
              {k > 0 && Array.from({length: 7}, (_, j) => <Twinkle key={j} x={mix(x, px, j / 7) + Math.sin(j * 2) * 18} y={mix(y - r, py, j / 7) + 30}
                s={.5 + .1 * j} opacity={clamp(1 - (t - fly - j * .12) / 1.2) * clamp((t - fly) / .2)} />)}
              <SunBird x={px} y={py} r={mix(r, 66, k)} t={t} phase={i * .37} mood={awake ? 'happy' : 'sleepy'} rays={k} glow={.4 + .6 * k} flap={awake ? 1 + 1.5 * k : .1} />
            </g>;
          }
          const hop = win(t, named + i * .06, named + i * .06 + .3, .12) * 14;
          return <SunBird key={i} x={x} y={y - r - hop + Math.sin(t * 1.4 + i) * 2} r={r} t={t} phase={i * .37} mood={awake ? (t > fly ? 'joy' : 'happy') : 'sleepy'}
            rays={0} glow={awake ? .45 : .25} flap={awake ? .6 : .05} />;
        })}
      </Svg>
    </Plate>
    <div style={{position: 'absolute', inset: 0, opacity: .25 + .35 * sm((t - fly) / 1.2), background: 'radial-gradient(ellipse at 70% 0%, rgba(255,240,180,.9), rgba(255,220,140,0) 60%)', mixBlendMode: 'screen'}} />
    <Svg><Defs />
      <Brush id="nm" text={name} x={130} y={560} size={170} p={clamp((t - named) / .5)} fill={INK} stroke={PAPER} maxWidth={700} />
      <Seal id="ns" text={txt(props, 'nameSeal')} x={isLatin(name) ? 130 + Math.min(700, latinWidth(name, 170 * .62, 170 * .01)) + 80 : 160 + Array.from(name).length * 170 * .96 + 40} y={660} size={88} p={clamp((t - named - .45) / .3)} />
      {isLatin(treeName)
        ? <Brush id="tn" text={treeName} x={1380} y={560} size={110} p={clamp((t - tree) / .5)} fill={INK} stroke={PAPER} maxWidth={420} />
        : <Brush id="tn" text={treeName} x={1520} y={470} size={104} vertical p={clamp((t - tree) / .6)} fill={INK} stroke={PAPER} />}
    </Svg>
    <Finish vignette={.3} />
  </div>;
}
