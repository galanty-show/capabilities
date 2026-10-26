import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {"b":{" ":[235,""],"A":[738,"m224 0l-222 0l0-38q27 0 44-9q16-8 31-31q14-24 33-69l215-515l81 0l224 531q21 48 42 71q22 22 58 22l0 38l-301 0l0-38q13 0 28-2q14-2 24-9q10-7 10-23q0-11-5-30q-5-20-14-41l-33-83l-8-24l-101-272l-4 0l-110 272l-7 24l-40 97q-4 13-8 27q-5 15-5 28q0 23 16 29q15 7 52 7zm232-214l-265 0l17-48l231 0z"],"C":[679,"m362 12q-107 0-177-44q-70-43-104-119q-34-76-34-173q0-112 42-189q43-77 119-117q75-39 174-39q53 0 84 8q31 9 49 17q18 9 32 9q15 0 21-11q6-11 12-23l38 0l0 240l-43 0q-19-96-68-143q-49-47-126-47q-97 0-147 72q-50 71-50 203q0 96 26 156q25 60 74 87q50 28 120 28q72 0 120-26q49-25 92-73l29 26q-31 44-68 80q-37 36-88 57q-52 21-127 21z"],"E":[647,"m594 0l-559 0l0-38q37 0 57-6q21-5 29-23q9-18 9-56l0-404q0-38-7-58q-6-19-26-26q-21-7-62-7l0-39l549 0l6 175l-44 0q-7-47-20-73q-14-26-43-36q-30-10-88-10l-138 0l0 239l100 0q48 0 71-6q24-6 31-25q8-20 8-59l41 0l0 231l-41 0q0-42-8-61q-7-20-31-26q-23-5-71-5l-100 0l0 258l122 0q53 0 86-6q33-5 53-20q20-15 33-42q13-27 26-70l42 0z"],"H":[819,"m351 0l-316 0l0-38q44 0 64-7q20-7 25-29q6-22 6-65l0-377q0-39-5-62q-5-22-24-31q-20-10-66-10l0-38l318 0l0 38q-45 0-65 10q-21 9-25 31q-5 22-5 62l0 157l304 0l0-157q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l319 0l0 38q-46 0-67 10q-20 9-25 31q-5 22-5 62l0 377q0 43 6 65q6 22 26 29q21 7 65 7l0 38l-319 0l0-38q44 0 64-7q20-7 26-29q5-22 5-65l0-171l-304 0l0 171q0 44 5 65q5 22 25 29q20 7 63 7z"],"I":[387,"m350 0l-315 0l0-38q44 0 64-8q20-7 25-29q6-21 6-64l0-377q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l317 0l0 38q-45 0-65 10q-21 9-25 31q-5 23-5 62l0 377q0 42 6 64q5 22 24 29q20 8 63 8z"],"R":[703,"m357 0l-319 0l0-38q38 0 58-6q19-6 26-26q7-20 7-62l0-410q0-30-6-46q-6-17-25-24q-20-7-60-7l0-38l296 0q72 0 131 15q60 15 95 51q35 37 35 101q0 55-23 89q-24 35-60 54q-37 19-79 29l0 5q16 10 36 33q19 23 51 68q32 46 86 123q24 33 48 42q23 9 57 9l0 38l-204 0q-36-61-60-101q-24-40-41-66q-17-27-30-48q-14-22-29-45q-14-23-27-28q-13-6-39-6l-23 0l0 163q0 40 7 61q7 20 28 26q21 6 64 6zm-99-339 38 1q52-3 88-17q37-14 56-45q20-31 20-85q0-58-33-92q-33-35-107-35q-16 0-32 1q-15 0-30 2z"],"T":[638,"m480 0l-323 0l0-38q43 0 64-7q21-6 27-28q7-22 7-67l0-465l-52 0q-55 0-82 12q-28 12-40 43q-12 30-23 84l-43 0l11-191l588 0l9 191l-43 0q-11-54-23-84q-13-31-40-43q-27-12-83-12l-51 0l0 465q0 45 7 67q7 22 27 28q21 7 63 7z"],"V":[699,"m387 5l-65 0l-236-534q-14-33-28-53q-13-19-30-28q-18-9-47-9l0-38l309 0l0 38q-17 0-32 3q-16 2-26 10q-10 8-10 26q0 24 14 57l116 270l38 100l7 0l37-100l114-287q3-7 6-19q3-12 3-25q0-20-15-27q-16-8-49-8l0-38l221 0l0 38q-22 0-37 5q-15 5-27 19q-13 15-27 44q-14 29-35 78z"],"W":[1008,"m732 7l-69 0l-151-402l-13-34l-33-94q-15-44-27-64q-12-20-28-26q-16-6-44-6l0-38l293 0l0 38q-75 0-75 37q0 12 5 26q6 15 11 31l98 261l28 88l6 0l107-321q2-6 6-18q4-13 7-28q3-15 3-28q0-30-19-39q-18-9-49-9l0-38l218 0l0 38q-35 1-52 16q-17 16-31 54zm-360 0l-65 0l-211-524q-22-57-43-78q-20-21-57-24l0-38l291 0l0 38q-38 0-51 8q-14 8-14 24q0 19 12 51l113 280l28 81l6 0l116-291l45 99l-25 0z"],"X":[687,"m686 0l-322 0l0-38l8 0q32 0 45-6q12-5 12-22q0-16-6-32q-5-16-25-46l-56-86l-36-63l-18-20l-165-231q-20-28-34-44q-14-17-32-23q-18-7-53-7l0-39l316 0l0 39l-10 0q-28 0-40 6q-13 6-13 24q0 13 10 32q10 18 23 36q12 19 21 35l59 99l19 19l192 267q26 36 47 48q22 13 58 14zm-447 0l-239 0l0-38q24 0 40-6q15-7 31-22q15-15 36-41l181-227l39 53l-17 0l-112 152q-9 12-19 27q-9 16-9 34q0 15 14 22q14 8 55 8zm291-525-142 178-37-50l16 0l96-134q13-19 21-33q7-13 7-29q0-13-13-19q-13-6-50-6l0-39l240 0l0 39q-31 1-51 9q-20 8-39 28q-19 19-48 56z"],"a":[510,"m158 10q-56 0-90-29q-33-29-33-85q0-41 18-69q18-28 48-47q29-19 64-32q36-13 70-22q35-9 62-17l0-46q0-65-16-87q-17-22-56-22q-35 0-46 15q-11 16-11 59q0 30-17 44q-17 14-41 14q-19 0-37-15q-17-15-17-45q0-30 23-55q22-25 63-41q42-16 98-16q90 0 134 37q44 37 44 118l0 221q0 30 7 39q8 9 24 9q12 0 25-8q12-7 22-18l20 20q-25 36-53 56q-27 20-77 20q-47 0-62-18q-16-18-21-58l-6-17l0-169q-41 12-72 26q-32 14-50 37q-17 22-17 61q0 37 14 56q15 18 41 18q24 0 46-11q21-11 48-38l7 49l-14 0q-23 20-43 35q-20 15-42 23q-23 8-57 8z"],"d":[572,"m203 9q-56 0-94-31q-39-31-58-83q-19-52-19-116q0-89 31-147q31-59 83-88q51-29 114-29q24 0 48 5q24 6 48 18l3 0l0-121q0-33-7-42q-8-10-37-10q-7 0-17 1q-11 0-11 0l0-37l148-35l45 0l0 595q0 38 12 49q12 12 40 12l21 0l0 36l-161 19l-30 0l0-66l-4 0q-28 25-66 48q-39 22-89 22zm58-79q31 0 52-9q21-10 46-27l0-250q-6-29-28-53q-22-24-65-24q-47 0-75 43q-29 44-29 136q0 97 25 141q25 43 74 43z"],"e":[496,"m255 11q-69 0-118-29q-50-28-77-83q-27-55-27-134q0-86 31-141q31-55 84-82q52-27 114-27q90 0 145 57q55 58 57 168l-319 0l-1-44l186 0q0-39-9-71q-8-31-25-49q-18-18-48-18q-51 0-72 42q-22 42-22 128q0 67 18 108q18 41 50 60q32 19 75 19q40 0 66-9q27-9 47-26q19-16 35-36l24 16q-15 29-32 56q-18 27-41 48q-24 21-58 34q-34 13-83 13z"],"f":[342,"m320 0l-310 0l0-36q38 0 56-6q18-6 25-26q6-20 6-60l0-316q0-51 2-86q3-36 13-63q10-27 32-53q28-35 64-52q35-18 92-18q35 0 64 8q29 8 46 26q17 17 17 47q0 27-16 39q-17 12-36 12q-21 0-34-11q-12-12-25-36q-12-23-22-31q-11-9-26-9q-29 0-40 25q-10 25-10 85l0 433q0 39 8 59q8 19 30 26q22 7 64 7zm22-414l-324 0l0-54l324 0z"],"g":[513,"m195 235q-67 0-106-14q-38-15-54-39q-15-25-15-54q0-27 19-51q19-24 58-57l0-13l39 11q-11 19-18 40q-8 20-8 40q0 37 35 55q36 19 114 19q58 0 90-12q32-11 45-30q13-18 13-38q0-23-14-36q-13-13-36-19q-23-6-50-7q-27-2-54-2q-44-1-69-1q-24 0-36-1q-13 0-20 0l-25-8q-10-3-26-11q-17-8-30-25q-13-16-13-43q0-26 11-47q12-20 31-38q20-18 43-37l0-14l41 20q-8 10-14 21q-7 12-10 23q-3 11-3 21q0 13 9 20q8 8 35 11q27 4 82 4q76 1 128 10q52 9 79 36q26 26 26 79q0 53-28 89q-28 36-73 57q-45 22-97 32q-52 9-99 9zm51-387q-28 0-53-5q-25-5-49-15l-19-12q-19-11-38-27q-19-15-31-41q-13-26-13-67q0-56 28-92q28-36 73-54q46-18 97-18q29 0 60 4q32 5 61 14q29 9 48 22l0 39q10 14 20 37q11 23 11 62q0 53-28 87q-27 34-71 50q-44 16-96 16zm0-43q33 0 54-25q22-24 22-93q0-63-22-94q-23-31-63-31q-34 0-56 26q-21 26-21 89q0 65 23 97q23 31 63 31zm258-271l0 59l-109-1l-33-55z"],"h":[617,"m598 0l-260 0l0-36q32 0 47-7q14-7 17-22q4-15 4-40l0-150q0-40-5-73q-5-33-22-53q-17-20-56-20q-29 0-56 14q-27 14-66 49l2-64l16 0q44-43 79-63q35-20 79-20q41 0 69 14q28 14 46 39q18 25 26 60q9 34 9 75l0 189q0 40 13 56q13 16 58 16zm-309 0l-264 0l0-36q40 0 55-11q15-12 15-53l0-500q0-26-14-33q-14-7-34-7q-12 0-21 1q-8 2-8 2l0-37l149-32l49 0l0 602q0 25 4 40q4 15 19 21q16 7 50 7z"],"i":[313,"m293 0l-270 0l0-36q34 0 49-5q15-6 20-22q5-16 5-44l0-264q0-33-13-40q-13-8-35-8q-10 0-18 1q-8 1-8 1l0-37l141-28l54 0l0 373q0 29 5 45q5 16 21 22q16 6 49 6zm-137-551q-33 0-52-19q-20-20-20-51q0-30 19-50q19-20 53-20q35 0 53 20q19 19 19 50q0 31-19 51q-18 19-53 19z"],"n":[620,"m601 0l-261 0l0-36q33 0 47-6q15-7 19-22q3-16 3-44l0-165q0-52-10-80q-11-28-30-38q-19-10-45-10q-25 0-45 9q-20 9-36 22q-17 13-34 27l-6-57l16 0q40-38 75-61q36-24 82-24q75 0 115 47q39 48 39 142l0 188q0 27 5 43q5 16 20 23q16 6 46 6zm-310 0l-263 0l0-36q33 0 47-6q15-7 18-23q4-16 4-43l0-266q0-27-10-36q-11-8-31-8q-13 0-20 1q-7 1-7 1l0-37l144-29l43 0l-1 95l3 24l0 255q0 27 4 43q4 16 20 23q15 6 49 6z"],"r":[424,"m314 0l-291 0l0-36q33 0 49-5q15-6 20-21q5-15 5-43l0-256q0-27-7-41q-6-14-33-14q-15 0-23 1q-8 1-8 1l0-37l145-31l45 0l0 104l3 0q27-36 45-60q18-25 38-37q19-13 48-13q35 0 52 19q18 20 18 53q0 38-17 55q-17 16-38 16q-20 0-34-9q-15-10-25-20q-10-10-17-10q-17 0-35 18q-19 17-36 41l0 214q0 32 9 48q9 16 30 22q21 5 57 5z"],"s":[423,"m41 11-4-183l37 0q15 72 44 106q29 33 84 33q36 0 59-15q23-14 23-45q0-19-9-33q-9-14-33-30q-24-16-71-38q-44-22-74-42q-29-21-44-48q-15-27-15-69q0-62 45-97q45-35 119-35q42 0 69 11q26 12 42 20l2 0l16-23l33 0l3 159l-37 0q-19-72-48-98q-29-27-72-27q-34 0-53 16q-19 16-19 42q0 31 28 49q29 18 85 47q44 21 76 42q33 22 51 49q18 28 18 70q0 53-26 84q-27 30-69 43q-42 13-92 13q-44 0-70-9q-25-9-45-19l-4 0l-21 27z"],"t":[357,"m333-104 23 24q-19 27-39 48q-20 21-48 33q-28 12-73 12q-55 0-82-32q-27-31-27-110l0-285l-60 0l0-35q39-25 72-63q33-38 62-101l47 0l0 145l120 0l0 54l-120 0l0 253q0 54 10 74q11 19 39 19q27 0 43-9q15-10 33-27z"],"\u00b7":[301,"m150-198q-35 0-53-17q-18-18-18-49q0-32 18-51q18-20 53-20q35 0 53 20q18 20 18 52q-1 31-18 48q-18 17-53 17z"],"\u2019":[248,"m62-455-13-28q20-9 38-22q18-12 30-34q12-21 12-57q-7 3-13 4q-6 1-12 1q-26 0-42-16q-16-16-16-41q0-26 18-45q17-19 50-19q33 0 57 21q24 22 24 71q0 40-14 68q-14 29-35 48q-22 19-44 31q-22 11-40 18z"]},"i":{" ":[225,""],"A":[690,"m154 0l-213 0l7-34q27 0 46-9q19-8 40-34q22-25 55-77l344-507l58 0l80 536q9 49 26 70q18 21 59 21l-6 34l-282 0l8-34q21 0 38-4q17-3 27-16q11-12 11-38q0-12-1-23q0-12-1-21l-11-91l-2-22l-32-288l-3 0l-190 288l-12 22l-70 106q-10 14-18 30q-8 16-8 30q0 16 13 22q12 5 45 5zm297-216l-271 0l26-44l241 0z"],"C":[667,"m309 11q-90 0-145-33q-55-33-79-89q-25-56-25-124q0-104 32-185q31-81 87-137q56-55 128-84q72-29 153-29q51 0 79 9q28 9 44 18q16 9 29 9q13 0 22-10q8-11 18-25l34 0l-49 234l-37 0q2-98-37-143q-40-45-114-45q-60 0-110 27q-50 27-87 76q-37 49-57 115q-20 66-20 145q0 100 46 148q47 48 141 48q42 0 79-10q37-11 71-32q34-21 68-52l20 22q-35 41-77 74q-41 34-94 54q-52 19-120 19z"],"E":[624,"m517 0l-532 0l7-34q34 0 55-6q21-6 33-23q12-18 19-53l86-415q8-38 6-58q-2-20-21-27q-19-7-59-7l7-34l524 0l-29 169l-37 0q3-48-6-75q-9-26-38-37q-29-10-88-10l-136 0l-116 564l119 0q55 0 89-6q34-6 57-22q22-15 40-44q18-28 40-71l38 0zm-39-223l-36 0q8-42 4-62q-4-20-26-26q-23-6-70-6l-114 0l8-43l115 0q47 0 72-7q26-7 38-28q12-20 20-60l36 0z"],"H":[776,"m275 0l-290 0l7-34q40 0 61-7q20-6 31-28q10-22 19-66l80-386q9-39 8-61q-1-23-19-32q-17-9-61-9l7-34l292 0l-6 34q-46 0-66 9q-21 9-30 32q-9 22-18 61l-79 386q-9 44-7 65q1 22 19 29q18 7 59 7zm295-314l-333 0l8-44l334 0zm125 314l-285 0l6-34q40 0 60-7q19-7 28-29q8-22 17-65l81-386q9-39 9-61q0-23-17-32q-17-9-61-9l7-34l287 0l-7 34q-44 0-64 9q-21 9-30 31q-8 22-17 62l-80 386q-9 43-8 65q1 21 20 29q18 7 60 7z"],"I":[358,"m274 0l-289 0l7-34q42 0 62-7q21-7 31-29q9-21 18-65l80-386q9-39 9-61q-1-23-19-32q-17-9-62-9l7-34l293 0l-7 34q-44 0-66 9q-22 9-31 32q-9 22-17 61l-80 389q-8 42-7 64q1 21 20 27q18 7 58 7z"],"R":[643,"m282 0l-294 0l7-34q37 0 57-6q20-6 31-26q11-20 19-62l86-420q6-28 3-45q-3-16-20-23q-18-7-58-7l7-34l262 0q67 0 117 14q50 14 78 44q28 30 28 80q0 52-19 87q-19 35-49 59q-30 23-66 36q-36 13-71 20l0 5q16 11 31 35q15 24 38 69q23 46 63 123q17 31 37 41q21 10 55 10l-7 34l-173 0q-26-61-43-102q-17-40-30-68q-12-27-22-49q-10-22-21-45q-10-22-23-28q-12-6-39-6l-31 0l7-41l43 1q62-3 108-20q46-18 71-55q25-37 25-99q0-29-11-52q-12-23-38-37q-27-14-73-14q-18 0-30 1q-13 0-29 2l-99 485q-8 40-6 61q3 20 23 26q19 6 62 6z"],"T":[627,"m413 0l-301 0l7-34q43 0 65-7q22-6 33-28q11-21 20-66l100-494l108 0l-101 494q-9 45-7 66q2 22 22 28q20 7 61 7zm-299-476l-38 0l45-181l555 0l-30 181l-37 0q0-55-6-84q-5-29-29-41q-24-12-80-12l-213 0q-41 0-67 7q-25 6-41 21q-17 15-30 42q-12 26-29 67z"],"V":[658,"m250 5l-44 0l-62-538q-5-33-12-53q-7-19-22-28q-16-9-44-9l5-34l268 0l-5 34q-37 0-60 15q-23 14-21 54q0 5 1 17q1 11 2 17l30 270l7 111l6 0l61-91l205-306q12-16 20-32q9-17 9-29q0-15-13-20q-13-6-45-6l5-34l218 0l-5 34q-20 0-36 4q-16 5-31 17q-15 13-34 37q-19 24-47 64z"],"W":[940,"m576 7l-47 0l-30-397l-4-47l-7-91q-4-43-10-63q-6-21-20-26q-14-6-42-6l6-34l269 0l-7 34q-47 0-68 15q-20 14-20 56q0 5 0 11q0 6 0 11l22 266l3 95l6 0l207-328q7-12 17-29q10-16 17-34q8-19 8-33q0-17-13-24q-13-6-42-6l7-34l209 0l-5 34q-35 1-57 16q-22 15-47 53zm-335 0l-44 0l-50-537q-4-51-20-72q-16-21-59-21l6-34l269 0l-6 34q-30 0-47 6q-17 6-24 16q-7 10-8 24q0 6 0 16q0 11 2 23l26 280l4 90l7 0l206-298l13 92l-21 0z"],"X":[642,"m601 0l-289 0l7-33l9 0q32 0 48-10q17-9 17-29q0-12-5-29q-5-16-15-42l-40-92l-23-63l-14-19l-106-226q-15-31-27-49q-11-17-29-24q-17-7-51-7l7-34l284 0l-7 34l-11 0q-30 0-45 8q-14 7-14 27q0 17 12 44q12 27 24 57l39 102l13 18l133 273q17 35 36 47q18 12 54 14zm-429 0l-228 0l6-33q25-1 42-7q18-7 37-23q19-16 47-44l224-229l26 50l-15 0l-150 161q-8 8-18 20q-11 12-18 24q-8 12-8 22q0 13 13 19q12 7 49 7zm388-532-178 182-25-46l14 0l128-141q18-21 29-36q12-15 12-28q0-11-11-16q-11-6-45-6l7-34l232 0l-6 34q-32 2-53 9q-22 8-45 27q-22 18-59 55z"],"a":[550,"m160 13q-35 0-64-17q-30-18-48-56q-17-38-17-99q0-68 21-127q21-58 57-102q37-43 83-67q45-25 94-25q42 0 64 16q23 16 39 38l4 0l37-46l61 0l-73 349q0 0-3 13q-2 13-2 24q0 10 4 16q4 7 16 7q16 0 29-9q13-8 23-20q11-12 18-20l23 18q-16 26-37 50q-20 24-48 39q-28 16-66 16q-29 0-45-12q-16-12-16-40q0-9 2-19q1-10 2-21l-6 0q-35 46-72 70q-37 24-80 24zm43-71q29 0 54-16q25-16 44-44q18-28 28-65q5-20 12-51q7-30 12-61q5-31 5-52q0-36-18-64q-19-28-57-28q-32 0-60 22q-27 23-46 62q-20 39-30 87q-10 47-10 97q0 66 18 89q18 24 48 24z"],"d":[552,"m166 13q-57 0-95-42q-38-41-38-133q0-65 20-123q20-57 55-101q35-44 81-69q46-25 97-25q32 0 57 10q25 10 43 28l3 0l31-160q0 0 1-11q2-11 2-21q0-13-6-22q-6-9-29-9q-9 0-20 1q-10 1-10 1l0-31l148-11l30 0l-113 584q0 0-2 15q-2 16-2 25q0 10 5 15q6 4 15 4q23 0 43-18q19-18 29-32l23 18q-16 23-36 48q-19 24-46 40q-27 17-65 17q-33 0-49-16q-16-15-16-40q0-8 1-18q2-10 3-18l-9 0q-34 45-71 69q-36 25-80 25zm41-71q30 0 56-17q26-16 44-42q18-27 26-57q14-59 22-105q7-46 7-69q0-26-9-46q-9-21-26-33q-18-12-42-12q-34 0-60 23q-27 24-46 62q-19 39-29 87q-10 47-10 95q0 67 18 90q19 24 49 24z"],"e":[428,"m189 13q-58 0-93-25q-35-25-50-66q-16-41-16-88q0-55 19-111q19-55 55-101q35-47 86-74q50-28 114-28q24 0 51 7q26 6 45 26q19 20 19 61q0 48-29 83q-29 34-74 56q-46 22-97 34q-50 11-94 14l0-32q54-2 97-22q42-20 68-55q26-35 26-82q0-26-9-39q-9-14-30-14q-30 0-56 25q-26 26-46 65q-20 39-31 83q-11 45-11 84q0 72 27 99q27 27 74 27q39 0 73-16q33-15 62-51l22 17q-45 69-97 96q-52 27-105 27z"],"f":[307,"m-33 227q-51 0-77-23q-27-22-27-56q0-22 12-37q12-16 34-16q25 0 34 14q10 14 13 33q3 18 8 32q4 14 18 14q16 0 29-17q12-17 22-45q10-28 17-59q7-32 12-60q6-28 8-47l66-403q8-52 19-97q11-45 30-78q14-24 34-45q20-21 52-35q31-13 79-13q32 0 56 9q24 10 38 27q13 18 13 43q0 24-14 36q-14 12-33 12q-23 0-32-13q-10-13-13-31q-3-19-8-35q-5-16-22-16q-33 0-54 39q-20 38-31 101l-72 456q-4 27-13 67q-9 40-25 82q-15 42-38 78q-24 37-57 60q-33 23-78 23zm363-648l-283 0l6-46l284 0z"],"g":[462,"m178 227q-75 0-121-16q-46-16-65-44q-20-28-20-63q0-30 17-53q17-24 46-40q29-17 66-25l25 12q-24 14-45 37q-20 22-20 59q0 25 13 46q13 21 41 34q28 13 73 13q67 0 100-22q32-21 32-54q0-27-21-45q-21-19-55-31q-34-13-74-22q-39-10-78-17l0-13q-14-8-26-23q-12-16-12-38q0-33 25-55q25-23 57-33l0-6q-20-9-42-25q-21-15-35-42q-14-26-14-68q0-50 25-89q25-39 70-61q45-22 104-22q33 0 56 4q23 4 42 11q18 6 37 14l0 33q11 13 22 38q12 25 12 60q0 43-23 79q-23 36-68 58q-45 23-110 26q-33 2-48 18q-15 16-15 32q0 15 19 23q19 9 49 16q30 7 63 16q34 9 63 23q30 15 49 39q19 24 19 62q0 66-58 110q-59 44-175 44zm39-418q34 0 54-20q21-20 30-53q9-32 9-69q0-51-18-82q-18-31-54-31q-41 0-66 36q-25 36-25 100q0 58 15 89q16 30 55 30zm253-276-6 58-99-14-47-44z"],"h":[566,"m392 11q-30 0-45-9q-16-8-22-22q-6-14-6-28q0-13 2-25q2-12 3-16l58-230q0 0 4-16q3-15 3-30q0-15-5-26q-6-10-22-10q-20 0-45 20q-25 20-49 52q-25 31-47 66q-22 35-38 66q-16 31-23 48l18-112q14-27 37-63q22-37 53-73q30-35 69-59q38-24 85-24q29 0 45 11q15 10 22 27q6 17 6 36q0 19-4 41q-3 22-6 33l-55 227q0 0-2 8q-2 7-2 16q0 19 19 19q27 0 45-18q18-19 29-32l24 18q-13 17-32 42q-18 25-47 44q-29 19-72 19zm-263-11l-101 0l126-605q0 0 2-12q2-11 2-22q0-12-8-19q-9-7-25-7q-9 0-21 1q-11 1-11 1l0-31l146-11l33 0l-69 308l-29 126l15 0z"],"i":[294,"m119 10q-34 0-51-15q-18-15-18-41q0-13 4-32q3-20 13-64l50-233q0 0 1-9q2-10 2-22q0-10-6-20q-6-9-26-9q-13 0-23 1q-11 1-11 1l0-32l151-11l31 0l-75 354q0 0-2 16q-3 15-3 26q0 19 18 19q26 0 45-19q19-18 31-31l24 17q-17 24-38 48q-20 24-48 40q-27 16-69 16zm78-562q-26 0-43-16q-17-16-17-45q0-29 17-46q16-16 46-16q29 0 45 16q16 17 16 46q0 28-18 45q-17 16-46 16z"],"n":[581,"m407 11q-41 0-57-19q-16-18-16-43q0-12 2-22q3-11 4-16l59-224q0 0 3-17q4-16 4-32q0-17-6-28q-5-11-21-11q-20 0-44 20q-25 21-49 53q-25 32-46 68q-22 36-39 68q-16 33-24 53l21-119q13-25 35-62q22-37 52-73q30-37 69-62q38-25 86-25q42 0 56 23q15 22 15 51q0 23-4 41q-3 19-6 31l-57 229q0 0-1 8q-2 7-2 16q0 19 20 19q25 0 43-18q18-18 29-32l24 18q-8 11-20 28q-12 18-30 36q-18 17-42 29q-25 12-58 12zm-259-11l-101 0l80-375q0 0 2-11q2-11 2-22q0-13-8-20q-8-7-25-7q-10 0-21 1q-11 1-11 1l0-32l147-11l30 0l-50 208l17 0z"],"r":[402,"m160-88 41-172q9-19 21-46q12-28 27-58q15-30 34-56q19-27 42-43q23-16 51-16q26 0 43 15q17 16 17 48q0 34-18 51q-18 16-40 16q-18 0-28-9q-9-10-13-20q-4-10-6-10q-16 0-36 24q-20 24-41 62q-20 38-38 79q-19 42-33 79q-15 36-23 56zm-10 88l-104 0l74-343q3-15 6-32q3-17 3-30q0-14-6-22q-6-8-27-8q-8 0-19 1q-12 1-12 1l0-32l146-11l31 0l-47 205l14 0z"],"s":[384,"m167 13q-43 0-72-11q-28-10-44-17l-4 0l-22 26l-27 0l30-173l30 0q8 66 29 101q20 35 71 35q35 0 55-16q21-17 21-52q0-37-21-64q-21-27-52-57q-22-22-42-42q-21-21-34-44q-12-24-12-55q0-54 37-89q37-35 106-35q37 0 66 10q28 10 41 19l4 0l26-28l23 0l-23 158l-29 0q-3-58-26-91q-23-33-67-33q-36 0-52 18q-16 19-16 41q0 19 12 37q12 18 32 38q20 19 43 43q34 37 59 70q25 34 25 81q0 35-19 64q-19 29-56 48q-37 18-92 18z"],"t":[313,"m122 11q-33 0-51-16q-18-16-18-45q0-13 3-31q2-17 4-28l67-315l-58 0l5-28q34-17 57-33q23-15 43-41q21-25 48-67l40 0l-96 461q0 0-4 19q-3 18-3 31q0 9 3 15q4 6 15 6q20 0 38-12q17-12 42-44l23 18q-14 19-34 45q-21 26-51 45q-30 20-73 20zm203-435l-110 0l8-43l111 0z"],"\u00b7":[286,"m144-198q-32 0-48-16q-15-17-15-44q0-28 16-46q16-18 47-18q31 0 47 19q16 18 16 45q0 27-16 43q-16 17-47 17z"],"\u2019":[240,"m109-460-12-24q28-13 58-36q30-23 44-72l-26-43l61 26q-10 7-23 12q-14 5-25 5q-20 0-38-13q-18-12-18-40q0-26 18-45q18-18 50-18q31 0 51 20q19 20 19 58q0 38-18 67q-18 29-44 50q-26 21-53 34q-26 13-44 19z"]}};
const KERN: Record<string, Record<string, number>> = {"b":{" T":-20," V":-20," W":-20," X":-10,"Eg":-10,"Ta":-60,"Tg":-60,"V ":-20,"Va":-60,"Vg":-55,"W ":-20,"Wa":-60,"Wg":-55,"X ":-10,"f ":50,"fi":10,"ga":-10,"ra":-15,"\u2019a":-60,"\u2019g":-60,"\u2019i":-20,"AC":-40,"AT":-60,"AV":-100,"AW":-100,"Ad":-10,"Ae":-10,"At":-15,"A\u2019":-70,"CC":-10,"CT":-5,"EC":-20,"ET":-15,"RC":-20,"RT":-30,"RV":-50,"RW":-50,"Rd":-15,"Re":-15,"R\u2019":-30,"TA":-60,"TC":-10,"Td":-70,"Te":-70,"Tn":-30,"Tr":-30,"Ts":-35,"Tt":-20,"T\u2019":20,"VA":-105,"VC":-35,"Vd":-65,"Ve":-65,"Vf":-25,"Vn":-35,"Vr":-35,"Vs":-45,"Vt":-20,"V\u2019":40,"WA":-105,"WC":-35,"Wd":-65,"We":-65,"Wf":-25,"Wn":-35,"Wr":-35,"Ws":-45,"Wt":-20,"W\u2019":40,"XC":-40,"Xd":-20,"Xe":-20,"a\u2019":-30,"e\u2019":-20,"f\u2019":80,"gd":5,"ge":5,"g\u2019":10,"h\u2019":-30,"n\u2019":-30,"rd":-10,"re":-10,"r\u2019":20,"td":-5,"te":-5,"tt":-15,"\u2019A":-100,"\u2019C":-40,"\u2019T":10,"\u2019V":15,"\u2019W":15,"\u2019d":-80,"\u2019e":-80,"\u2019n":-20,"\u2019r":-20,"\u2019s":-40,"\u2019t":-25},"i":{" T":-20," V":-20," W":-20," X":-10,"Aa":-10,"Ag":-10,"Ra":-15,"Rg":-15,"Ta":-70,"Tg":-40,"V ":-20,"Va":-65,"Vg":-65,"W ":-20,"Wa":-65,"Wg":-65,"X ":-10,"Xa":-20,"Xg":-20,"a\u2019":-30,"d\u2019":-30,"f ":51,"fi":30,"ga":-5,"gg":-5,"i\u2019":-30,"ra":-10,"tg":-5,"\u2019a":-60,"\u2019g":-30,"AC":-40,"AT":-60,"AV":-85,"AW":-85,"Ad":-10,"Ae":-10,"At":-15,"A\u2019":-70,"CC":-10,"CT":-10,"EC":-10,"ET":-20,"RC":-20,"RT":-30,"RV":-40,"RW":-40,"Rd":-15,"Re":-15,"R\u2019":-20,"TA":-60,"TC":-10,"Td":-70,"Te":-70,"Tn":-30,"Tr":-30,"Ts":-35,"Tt":-20,"T\u2019":20,"VA":-120,"VC":-15,"Vd":-65,"Ve":-65,"Vf":-25,"Vn":-30,"Vr":-30,"Vs":-40,"Vt":-20,"V\u2019":40,"WA":-120,"WC":-15,"Wd":-65,"We":-65,"Wf":-25,"Wn":-30,"Wr":-30,"Ws":-40,"Wt":-20,"W\u2019":40,"XC":-40,"Xd":-20,"Xe":-20,"e\u2019":-10,"f\u2019":80,"gd":-5,"ge":-5,"gf":10,"g\u2019":10,"h\u2019":-30,"n\u2019":-30,"rd":-5,"re":-5,"r\u2019":10,"s\u2019":-20,"tt":-15,"\u2019A":-80,"\u2019C":-10,"\u2019V":20,"\u2019W":20,"\u2019d":-60,"\u2019e":-60,"\u2019n":-20,"\u2019r":-20,"\u2019s":-30,"\u2019t":-20}};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"hair":"release-assets/dcc9ea59df9d4d6e039eb799ec13f3f5a4fa106ddf7f2df5ee2afc0230366d91.webp","watch":"release-assets/70e2735835531a842313e63c8be87a42d8030a532bf24db3ef63f6969d84f697.webp"};
const W = 1920, H = 1080;
const INK = '#0e0b09', GOLD = '#e8c27a', CREAM = '#f6ecd9', EMBER = '#ffb45a', SILVER = '#dfe6ee', NIGHT = '#141b33', COPPER = '#c27a4a';
const SERIF = '"STIX Two Text", Georgia, "Times New Roman", "Songti SC", "STSong", serif';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .25) => sm((t - a) / f) * (1 - sm((t - b) / f));
/** 幕首/幕末淡入淡出系数。 */
const fadeEdges = (t: number, dur: number, inS = .2, outS = .18) => Math.min(sm(t / inS), sm((dur - t) / outS));

/** 素材：先用素材槽（制作任务），再用内联底图（样片）。 */
function slot(props: SceneInput, name: string): any {
  return props.assets[name] ?? (MEDIA[name] ? {src: MEDIA[name], kind: 'image'} : undefined);
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
/** 句子时间：cue 找不到时退回给定秒数，保证改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => (phrase ? s.cue(phrase) : undefined) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const endAll = (fallback = s.seconds) => s.sentence(Number.MAX_SAFE_INTEGER)?.end ?? fallback;
  return {s, t: s.t, at, start, end, endAll, dur: s.seconds};
}

// ---------- 排印：内联 STIX Two 字形，按字距排；缺字整串退回 <text> ----------
const latinWidth = (text: string) => Array.from(text).reduce((w, ch) => w + (/[⺀-鿿豈-﫿＀-￯]/.test(ch) ? 1000 : ch === ' ' ? 250 : /[A-Z]/.test(ch) ? 690 : /[il.,'’:;!|]/.test(ch) ? 280 : /[mwMW]/.test(ch) ? 800 : /[0-9]/.test(ch) ? 500 : 480), 0);
function layout(text: string, face: string, tracking: number, mono: boolean) {
  const g = GLYPHS[face] ?? {}, k = KERN[face] ?? {}, chars = Array.from(text);
  const ok = chars.every(ch => g[ch] || ch === ' ');
  if (!ok) return {ok, chars, xs: [] as number[], width: latinWidth(text) + tracking * chars.length};
  const digit = mono ? Math.max(...'0123456789'.split('').map(d => g[d]?.[0] ?? 0)) : 0;
  const xs: number[] = [];
  let x = 0;
  chars.forEach((ch, i) => {
    const adv = mono && /[0-9]/.test(ch) ? digit : g[ch]?.[0] ?? 250;
    const off = mono && /[0-9]/.test(ch) ? (digit - (g[ch]?.[0] ?? 0)) / 2 : 0;
    xs.push(x + off);
    x += adv + tracking + (i < chars.length - 1 ? k[ch + chars[i + 1]] ?? 0 : 0);
  });
  return {ok, chars, xs, width: x - tracking};
}
/** 一行字。p：揭示进度（rise 逐字升起淡入、wipe 横扫、fade 整体淡入）；size 是字号像素；tracking 是字距（1/1000 em）。 */
function Type({text, x, y, size, face = 'b', fill = CREAM, align = 'start', tracking = 0, p = 1, mode = 'rise', maxWidth = 0, opacity = 1, shadow = true, mono = false, id, stroke}:
  {text: string; x: number; y: number; size: number; face?: 'b' | 'i'; fill?: string; align?: 'start' | 'middle' | 'end'; tracking?: number; p?: number;
    mode?: 'rise' | 'wipe' | 'fade'; maxWidth?: number; opacity?: number; shadow?: boolean; mono?: boolean; id: string; stroke?: string}) {
  if (!text || p <= 0 || opacity <= 0) return null;
  const L = layout(text, face, tracking, mono);
  let k = size / 1000;
  if (maxWidth && L.width * k > maxWidth) k = maxWidth / L.width;
  const width = L.width * k, left = align === 'middle' ? x - width / 2 : align === 'end' ? x - width : x;
  const style = shadow ? {filter: 'drop-shadow(0 4px 14px rgba(0,0,0,.7))'} : undefined;
  if (!L.ok) {
    return <g style={style} opacity={opacity * (mode === 'fade' || mode === 'rise' ? sm(p) : 1)}>
      {mode === 'wipe' && <defs><clipPath id={`${id}-w`}><rect x={left - 20} y={y - size * 1.2} width={(width + 40) * clamp(p)} height={size * 1.6} /></clipPath></defs>}
      <text x={left} y={y} fontFamily={SERIF} fontSize={size * k * 1000 / size} fontWeight={face === 'b' ? 600 : 400} fontStyle={face === 'i' ? 'italic' : undefined}
        letterSpacing={tracking * k} fill={fill} stroke={stroke} clipPath={mode === 'wipe' ? `url(#${id}-w)` : undefined}>{text}</text>
    </g>;
  }
  const g = GLYPHS[face], n = L.chars.length, S = 5;
  return <g style={style} opacity={opacity * (mode === 'fade' ? sm(p) : 1)}>
    {mode === 'wipe' && <defs><clipPath id={`${id}-w`}><rect x={left - 20} y={y - size * 1.2} width={(width + 40) * clamp(p)} height={size * 1.7} /></clipPath></defs>}
    <g clipPath={mode === 'wipe' ? `url(#${id}-w)` : undefined}>
      {L.chars.map((ch, i) => {
        if (ch === ' ' || !g[ch]) return null;
        const q = mode === 'rise' ? clamp((p * (n + S) - i) / S) : 1;
        if (q <= 0) return null;
        const e = out3(q);
        return <path key={i} d={g[ch][1]} fill={fill} stroke={stroke} strokeWidth={stroke ? 10 : undefined} opacity={mode === 'rise' ? e : 1}
          transform={`translate(${left + L.xs[i] * k} ${y + (1 - e) * size * .22}) scale(${k})`} />;
      })}
    </g>
  </g>;
}
/** 小字说明（系统衬线：macOS 上就是 STIX Two Text）。 */
const Label = ({children, x, y, size = 26, color = 'rgba(246,236,217,.82)', opacity = 1, align = 'left', italic = false, caps = false, spacing = 0}: any) =>
  !children || opacity <= 0 ? null : <div style={{position: 'absolute', left: align === 'center' ? x - 800 : align === 'right' ? undefined : x, right: align === 'right' ? W - x : undefined,
    width: align === 'center' ? 1600 : undefined, top: y, fontFamily: SERIF, fontStyle: italic ? 'italic' : undefined, textAlign: align,
    fontSize: size, letterSpacing: caps ? size * .16 : spacing, textTransform: caps ? 'uppercase' : undefined, color, opacity,
    textShadow: '0 2px 12px rgba(0,0,0,.85)', whiteSpace: 'nowrap'}}>{children}</div>;
/** 整版 SVG 画布（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible', ...style}}>{children}</svg>;
/** 竖幅底图放进半屏（960 宽），按 y0→y1 纵向摇镜（图在 960 宽时高 1707）。dx 是整块横移（滑入）。 */
function Panel({asset, frame, side, y0, y1, p, dx = 0, opacity = 1, zoom = [1, 1]}:
  {asset: any; frame: number; side: 'left' | 'right'; y0: number; y1: number; p: number; dx?: number; opacity?: number; zoom?: number[]}) {
  if (!asset || opacity <= 0) return null;
  const k = easeInOut(clamp(p)), y = mix(y0, y1, k), z = mix(zoom[0], zoom[1], k);
  return <div style={{position: 'absolute', top: 0, left: side === 'left' ? 0 : 960, width: 960, height: H, overflow: 'hidden', opacity, transform: `translateX(${dx}px)`}}>
    <div style={{position: 'absolute', left: 0, top: -y, width: 960, height: 1707, transform: `scale(${z})`, transformOrigin: `50% ${y + 540}px`}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 暗角。 */
const Finish = ({vignette = .55}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 46%, rgba(0,0,0,${vignette}) 100%)`}} />;
/** 镜头震动（秒内衰减）。 */
const shake = (t: number, at: number, power = 12, len = .45) => {
  const d = t - at;
  if (d < 0 || d > len) return 'none';
  const k = (1 - d / len) * power;
  return `translate(${Math.sin(d * 90) * k}px, ${Math.cos(d * 70) * k * .7}px)`;
};

// ---------- 道具：硬币、钟表、表链、剪刀、发丝 ----------
const Defs = () => <defs>
  <radialGradient id="cu" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#f0b27c" /><stop offset=".45" stopColor="#b86a3c" /><stop offset="1" stopColor="#5e2f17" /></radialGradient>
  <radialGradient id="ag" cx="36%" cy="30%" r="78%"><stop offset="0" stopColor="#ffffff" /><stop offset=".4" stopColor="#c9ccd2" /><stop offset="1" stopColor="#62666e" /></radialGradient>
  <radialGradient id="au" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#fff3c4" /><stop offset=".35" stopColor="#e2ad4c" /><stop offset=".75" stopColor="#9a6420" /><stop offset="1" stopColor="#5a3510" /></radialGradient>
  <radialGradient id="dial" cx="45%" cy="40%" r="70%"><stop offset="0" stopColor="#fdf8ec" /><stop offset=".8" stopColor="#efe2c6" /><stop offset="1" stopColor="#cdb98f" /></radialGradient>
  <radialGradient id="wood" cx="40%" cy="35%" r="80%"><stop offset="0" stopColor="#7a4a2a" /><stop offset=".7" stopColor="#3e2412" /><stop offset="1" stopColor="#1e1008" /></radialGradient>
  <linearGradient id="pt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#b9c2cc" /><stop offset="1" stopColor="#6d7682" /></linearGradient>
  <linearGradient id="blade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f6f8" /><stop offset=".5" stopColor="#9aa3ad" /><stop offset="1" stopColor="#4c535c" /></linearGradient>
</defs>;
/** 表盘：pocket 金壳怀表 / wall 胡桃木挂钟。h,m,s 为时间；ghost 只画虚线轮廓。 */
function Clock({cx, cy, r, h, m, s, kind = 'pocket', opacity = 1, ghost = false, open = 1}:
  {cx: number; cy: number; r: number; h: number; m: number; s: number; kind?: 'pocket' | 'wall'; opacity?: number; ghost?: boolean; open?: number}) {
  if (opacity <= 0) return null;
  const ha = ((h % 12) + m / 60) * 30, ma = (m + s / 60) * 6, sa = s * 6;
  const numerals = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  if (ghost) return <g opacity={opacity} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="10 9">
    <circle cx={cx} cy={cy} r={r * 1.12} /><circle cx={cx} cy={cy - r * 1.3} r={r * .16} /><circle cx={cx} cy={cy} r={r * .9} strokeDasharray="3 10" />
  </g>;
  return <g opacity={opacity}>
    <ellipse cx={cx + r * .08} cy={cy + r * .14} rx={r * 1.2} ry={r * 1.2} fill="rgba(0,0,0,.45)" />
    {kind === 'pocket' ? <>
      <circle cx={cx} cy={cy - r * 1.32} r={r * .17} fill="none" stroke="url(#au)" strokeWidth={r * .07} />
      <rect x={cx - r * .1} y={cy - r * 1.22} width={r * .2} height={r * .16} rx={r * .04} fill="url(#au)" />
      <circle cx={cx} cy={cy} r={r * 1.13} fill="url(#au)" stroke="#5a3510" strokeWidth={r * .02} />
      <circle cx={cx} cy={cy} r={r * 1.0} fill="none" stroke="rgba(255,240,200,.6)" strokeWidth={r * .025} />
    </> : <>
      <circle cx={cx} cy={cy} r={r * 1.16} fill="url(#wood)" stroke="#120904" strokeWidth={r * .02} />
      <circle cx={cx} cy={cy} r={r * 1.02} fill="none" stroke="url(#au)" strokeWidth={r * .06} />
    </>}
    <circle cx={cx} cy={cy} r={r * .97} fill="url(#dial)" />
    {Array.from({length: 60}, (_, i) => {
      const a = i * 6 * Math.PI / 180, long = i % 5 === 0, r0 = r * (long ? .8 : .86);
      return <line key={i} x1={cx + Math.sin(a) * r0} y1={cy - Math.cos(a) * r0} x2={cx + Math.sin(a) * r * .92} y2={cy - Math.cos(a) * r * .92}
        stroke="#2a2018" strokeWidth={long ? r * .018 : r * .007} />;
    })}
    {numerals.map((label, i) => {
      const a = i * 30 * Math.PI / 180, rr = r * .66;
      return <Type key={i} id={`n${i}`} text={label} x={cx + Math.sin(a) * rr} y={cy - Math.cos(a) * rr + r * .065} size={r * .17} align="middle" fill="#231a12" shadow={false} maxWidth={r * .3} />;
    })}
    <g stroke="#1c2740" strokeLinecap="round">
      <line x1={cx} y1={cy} x2={cx + Math.sin(ha * Math.PI / 180) * r * .46} y2={cy - Math.cos(ha * Math.PI / 180) * r * .46} strokeWidth={r * .05} />
      <line x1={cx} y1={cy} x2={cx + Math.sin(ma * Math.PI / 180) * r * .72} y2={cy - Math.cos(ma * Math.PI / 180) * r * .72} strokeWidth={r * .032} />
    </g>
    <line x1={cx - Math.sin(sa * Math.PI / 180) * r * .16} y1={cy + Math.cos(sa * Math.PI / 180) * r * .16}
      x2={cx + Math.sin(sa * Math.PI / 180) * r * .8} y2={cy - Math.cos(sa * Math.PI / 180) * r * .8} stroke="#9b2c1e" strokeWidth={r * .012} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={r * .04} fill="#1c2740" /><circle cx={cx} cy={cy} r={r * .018} fill="#e8c27a" />
    <path d={`M${cx - r * .7} ${cy - r * .55} A ${r * .95} ${r * .95} 0 0 1 ${cx + r * .35} ${cy - r * .88}`} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth={r * .05} strokeLinecap="round" opacity={.5 * open} />
  </g>;
}

// 两件珍宝，左右分屏（结尾反转时同一位置再分屏一次）：左边 Jim 与金表，右半先是代码画的大怀表（秒针一秒一跳）；
// 念到“other”右半换成 Della 的长发，镜头顺着长发一路往下摇到膝下，一道光沿发丝流下去。
export const meta = {
  title: 'Two treasures',
  params: {
    watchLabel: {label: '左屏标签', type: 'text', default: 'I · THE WATCH', maxLength: 28},
    hairLabel: {label: '右屏标签', type: 'text', default: 'II · THE HAIR', maxLength: 28},
    heirloom: {label: '金表注记', type: 'text', default: 'his grandfather’s', maxLength: 40},
    heirloomCue: {label: '注记卡点词', type: 'text', default: 'grandfather', maxLength: 24},
    hairCue: {label: '换到长发的卡点词', type: 'text', default: 'other', maxLength: 24},
    kneeCue: {label: '摇到膝下的卡点词', type: 'text', default: 'knees', maxLength: 24},
  },
  slots: {watch: '竖幅：Jim 捧着打开的金怀表', hair: '竖幅：Della 的背影，长发垂过膝盖'},
};
export default function Treasures(props: SceneInput) {
  const {t, at, start, endAll, dur} = cues(props);
  const t0 = start(0, .1), hairT = at(txt(props, 'hairCue'), start(1, 3)) - .15, knee = at(txt(props, 'kneeCue'), start(2, hairT + 2.5));
  const heir = at(txt(props, 'heirloomCue'), t0 + 1.6);
  const left = out3((t - t0 + .1) / .55), right = out3((t - hairT) / .6);
  const watchOut = sm((t - hairT) / .45);
  const sec = Math.floor(t * 1) + 36;               // 一秒一跳的秒针
  const tilt = clamp((t - hairT - .3) / Math.max(1, knee + .6 - hairT - .3));
  const panY = mix(0, 600, easeInOut(tilt));
  const shimmer = ((t - hairT) * .32) % 1.1;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .12)}}>
    <Panel asset={slot(props, 'watch')} frame={props.frame} side="left" y0={360} y1={520} p={t / dur} dx={-960 * (1 - left)} />
    {right > 0 && <div style={{position: 'absolute', inset: 0, opacity: 1}}>
      <Panel asset={slot(props, 'hair')} frame={props.frame} side="right" y0={panY} y1={panY} p={0} dx={960 * (1 - right)} />
      <div style={{position: 'absolute', left: 960 + 300 + 960 * (1 - right), top: 340 - panY, width: 420, height: 1320, mixBlendMode: 'screen', opacity: .9 * right,
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 30%, #000 70%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 30%, #000 70%, transparent)',
        background: `linear-gradient(180deg, rgba(255,200,130,0) ${shimmer * 100 - 14}%, rgba(255,214,150,.42) ${shimmer * 100}%, rgba(255,200,130,0) ${shimmer * 100 + 14}%)`}} />
    </div>}
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,5,4,.7) 0%, rgba(6,5,4,0) 22%)'}} />
    {watchOut < 1 && <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: H, opacity: left * (1 - watchOut),
      background: 'radial-gradient(ellipse at 50% 52%, #2a1c10 0%, #0e0b09 70%)'}} />}
    <Svg><Defs />
      {watchOut < 1 && <g opacity={left * (1 - watchOut)} transform={`translate(${1440} ${560}) scale(${mix(1, .7, watchOut)}) translate(-1440 -560)`}>
        <Clock cx={1440} cy={540} r={240} h={10} m={9} s={sec} kind="pocket" />
        <path d="M1440 236 C 1520 140 1640 130 1700 50" fill="none" stroke="#7a4a22" strokeWidth={22} strokeLinecap="round" opacity={.9} />
        <path d="M1440 236 C 1520 140 1640 130 1700 50" fill="none" stroke="rgba(255,220,170,.25)" strokeWidth={4} strokeLinecap="round" />
      </g>}
      <Type id="hh" text={txt(props, 'heirloom')} x={1440} y={885} size={46} face="i" align="middle" fill={GOLD} p={(t - heir) / .5} opacity={1 - watchOut} />
      <Type id="wl" text={txt(props, 'watchLabel')} x={480} y={92} size={30} align="middle" fill={GOLD} tracking={200} p={(t - t0 - .2) / .6} mode="fade" />
      <Type id="hl" text={txt(props, 'hairLabel')} x={1440} y={92} size={30} align="middle" fill={GOLD} tracking={200} p={(t - hairT - .2) / .6} mode="fade" />
      {right > 0 && <line x1={960} y1={0} x2={960} y2={H * right} stroke={GOLD} strokeWidth={2.5} opacity={.85} />}
    </Svg>
    <Finish vignette={.45} />
  </div>;
}
