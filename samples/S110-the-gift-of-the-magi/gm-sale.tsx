import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {"b":{" ":[235,""],"$":[495,"m233 6q-43 0-76-4q-33-4-62-15q-29-10-62-27l0-161l40 0q21 90 55 125q34 35 92 35q68 0 101-24q33-24 33-70q0-44-29-73q-28-29-78-52q-78-36-125-69q-47-33-68-70q-21-37-21-85q0-74 58-115q58-41 155-41q32 0 68 7q36 7 68 19q33 12 51 26l0 141l-39 0q-18-80-53-115q-36-36-94-36q-53 0-83 19q-29 19-29 61q0 28 14 48q13 20 41 37q27 17 70 39q35 16 72 36q37 19 68 44q31 25 50 60q19 34 19 82q0 58-29 98q-29 40-82 60q-53 20-125 20zm38 87l-50 0l0-799l50 0z"],".":[265,"m132 9q-35 0-53-19q-18-20-18-50q0-32 19-51q18-20 53-20q34 0 53 20q18 20 18 51q0 30-19 50q-18 19-53 19z"],"0":[495,"m248 11q-61 0-103-26q-43-25-69-70q-26-46-38-106q-12-60-12-129q0-99 26-172q25-72 75-111q50-39 123-39q65 0 115 37q49 37 76 110q28 72 28 178q0 67-13 126q-12 60-39 105q-26 46-68 71q-42 26-101 26zm-1-42q43 0 67-70q24-69 24-210q0-149-23-220q-23-71-69-71q-43 0-66 71q-24 71-24 216q0 142 24 213q23 71 67 71z"],"1":[495,"m448 0l-391 0l0-37q71 0 102-15q30-15 30-52l0-401q0-26-7-38q-7-11-26-11q-10 0-28 1q-19 2-40 5q-21 3-37 7l0-43l212-55l52 0l0 535q0 37 32 52q32 15 101 15z"],"2":[495,"m431 0l-400 0l0-55l138-139q48-49 79-89q31-41 47-83q16-42 16-96q0-50-26-80q-26-30-79-30q-45 0-77 18q-32 19-59 73l-37-14q26-73 81-113q54-39 132-39q58 0 102 21q44 21 69 59q25 39 25 90q0 47-19 89q-19 41-58 83q-39 42-96 93l-122 107l0 7l66-6l124 0q40 0 56-18q16-18 33-63l37 0z"],"3":[495,"m166 14q-47 0-73-8q-26-8-37-22q-12-14-12-32q0-21 13-37q12-17 36-17q18 0 35 10q17 9 34 22q17 12 35 22q18 9 38 9q27 0 49-12q22-12 36-40q13-28 13-77q0-44-20-76q-21-31-58-48q-37-17-89-17l-20 0l0-54l21 0q32 0 62-16q29-15 47-43q18-28 18-65q0-40-25-63q-25-22-68-22q-44 0-73 19q-29 18-53 55l-31-17q31-65 80-100q49-35 115-35q83 0 129 40q47 39 47 98q0 57-33 87q-32 30-85 56l0 6q48 16 83 41q35 24 54 57q19 33 19 75q0 68-39 114q-40 46-105 68q-65 22-143 22z"],"4":[495,"m393 0l-124 0l0-135l-255 0l0-93l283-417l96 0l0 410l89 0l0 100l-89 0zm-308-239l0 4l184 0l0-273l-4 0z"],"5":[495,"m158 15q-67 0-95-15q-27-16-27-46q0-21 12-38q12-18 36-18q19 0 35 10q16 9 32 21q15 13 34 22q19 9 42 9q37 0 64-12q27-13 42-43q16-29 16-80q0-47-20-75q-19-28-55-43q-35-15-82-21q-48-6-104-6l-15-22l68-288l299 0l-17 100l-254 0l-23 101q42 2 86 8q44 6 84 20q41 13 73 37q32 23 51 59q19 35 19 86q0 62-24 107q-24 44-66 72q-41 28-95 42q-55 13-116 13z"],"6":[495,"m260 13q-79 0-129-35q-50-35-74-95q-24-61-24-136q0-93 32-165q31-72 87-121q55-50 128-77q74-27 156-30l4 40q-70 10-127 43q-57 32-96 84q-39 52-54 123l10 1q30-29 57-44q27-15 65-15q79 0 125 54q47 53 47 151q0 109-53 166q-53 56-154 56zm4-42q38 0 58-37q20-37 20-129q0-64-24-107q-24-44-73-44q-23 0-41 11q-19 11-31 35q-11 24-11 64q0 60 11 107q11 47 33 73q23 27 58 27z"],"7":[494,"m232 8l-109 0l256-532l-218 0q-28 0-43 5q-15 5-24 21q-10 16-24 49l-37-3l40-178l395 0l0 56z"],"8":[495,"m240 13q-60 0-107-17q-48-17-75-52q-27-35-27-86q0-39 17-67q16-27 47-51q32-24 78-52l0-13l41 25q-21 25-39 46q-19 21-29 45q-11 24-11 59q0 64 30 94q30 31 79 31q24 0 47-11q23-11 38-32q14-22 14-53q0-32-13-58q-13-25-46-53q-33-29-92-70l-5-4q-57-38-88-68q-31-30-42-59q-11-29-11-63q0-48 27-82q26-34 73-52q46-18 106-18q53 0 95 17q42 18 66 49q24 30 24 70q0 35-13 61q-12 26-40 47q-28 22-75 46l0 14l-47-27q38-30 56-62q19-32 19-79q0-46-23-71q-23-25-60-25q-42 0-68 24q-26 24-26 67q0 42 30 74q29 32 97 73l7 6q64 39 101 70q37 31 53 63q15 31 15 75q0 55-29 93q-29 38-80 57q-50 19-114 19z"],"9":[495,"m70 13-2-38q68-8 124-37q56-28 95-80q38-53 49-135l-8-1q-30 28-58 42q-28 15-64 15q-80 0-127-56q-48-56-48-155q0-101 54-158q54-56 154-56q79 0 128 37q49 37 72 99q23 62 23 136q0 100-30 172q-30 73-83 120q-53 48-124 71q-72 23-155 24zm183-303q34 0 57-25q24-24 24-83q0-61-10-108q-9-46-31-72q-21-26-56-26q-38 0-60 36q-21 37-21 130q0 66 24 107q24 41 73 41z"],"A":[738,"m224 0l-222 0l0-38q27 0 44-9q16-8 31-31q14-24 33-69l215-515l81 0l224 531q21 48 42 71q22 22 58 22l0 38l-301 0l0-38q13 0 28-2q14-2 24-9q10-7 10-23q0-11-5-30q-5-20-14-41l-33-83l-8-24l-101-272l-4 0l-110 272l-7 24l-40 97q-4 13-8 27q-5 15-5 28q0 23 16 29q15 7 52 7zm232-214l-265 0l17-48l231 0z"],"D":[753,"m325 0l-290 0l0-38q42 0 62-7q21-6 27-26q6-21 6-61l0-402q0-37-9-55q-9-17-29-23q-21-5-57-5l0-40l283 0q76 0 146 14q70 15 124 50q55 36 86 98q32 62 32 158q0 94-29 158q-28 65-80 104q-52 40-122 57q-69 18-150 18zm-17-50q81 0 139-23q58-23 89-83q31-59 31-171q0-135-65-207q-65-72-202-72q-10 0-20 0q-9 0-23 1l0 553q13 1 26 2q13 0 25 0z"],"E":[647,"m594 0l-559 0l0-38q37 0 57-6q21-5 29-23q9-18 9-56l0-404q0-38-7-58q-6-19-26-26q-21-7-62-7l0-39l549 0l6 175l-44 0q-7-47-20-73q-14-26-43-36q-30-10-88-10l-138 0l0 239l100 0q48 0 71-6q24-6 31-25q8-20 8-59l41 0l0 231l-41 0q0-42-8-61q-7-20-31-26q-23-5-71-5l-100 0l0 258l122 0q53 0 86-6q33-5 53-20q20-15 33-42q13-27 26-70l42 0z"],"F":[607,"m361 0l-326 0l0-38q39 0 60-7q20-6 27-24q8-19 8-56l0-410q0-35-8-53q-8-18-29-24q-20-6-58-6l0-39l551 0l7 177l-45 0q-6-36-14-60q-7-23-22-36q-15-13-44-19q-28-6-77-6l-134 0l0 242l92 0q43 0 68-7q24-7 35-28q10-20 10-60l42 0l0 233l-42 0q0-41-10-60q-11-18-35-24q-25-6-68-6l-92 0l0 193q0 34 10 51q9 17 32 23q23 6 62 6z"],"G":[732,"m376 11q-166 0-248-89q-81-88-81-249q0-115 43-191q44-76 119-113q75-38 170-38q54 0 86 9q32 9 50 18q19 10 32 10q15 0 21-11q7-11 13-26l38 0l0 237l-43 0q-18-100-68-143q-50-44-129-44q-98 0-146 72q-49 72-49 205q0 149 49 224q48 75 148 75q45 0 75-12q31-11 59-34l0-95q0-36-6-55q-6-18-24-25q-19-6-57-6l0-40l270 0l0 40q-42 0-55 14q-12 15-12 62l0 137q-55 31-114 49q-58 19-141 19z"],"H":[819,"m351 0l-316 0l0-38q44 0 64-7q20-7 25-29q6-22 6-65l0-377q0-39-5-62q-5-22-24-31q-20-10-66-10l0-38l318 0l0 38q-45 0-65 10q-21 9-25 31q-5 22-5 62l0 157l304 0l0-157q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l319 0l0 38q-46 0-67 10q-20 9-25 31q-5 22-5 62l0 377q0 43 6 65q6 22 26 29q21 7 65 7l0 38l-319 0l0-38q44 0 64-7q20-7 26-29q5-22 5-65l0-171l-304 0l0 171q0 44 5 65q5 22 25 29q20 7 63 7z"],"I":[387,"m350 0l-315 0l0-38q44 0 64-8q20-7 25-29q6-21 6-64l0-377q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l317 0l0 38q-45 0-65 10q-21 9-25 31q-5 23-5 62l0 377q0 42 6 64q5 22 24 29q20 8 63 8z"],"K":[755,"m350 0l-315 0l0-38q44 0 64-8q20-7 25-28q6-22 6-65l0-377q0-40-5-62q-5-22-25-31q-20-10-65-10l0-38l318 0l0 38q-46 0-66 10q-21 9-25 31q-5 23-5 62l0 178l5 0l168-158q33-30 47-49q15-20 15-42q0-16-8-24q-9-7-29-7l-17 0l0-39l262 0l0 39q-28 1-48 7q-20 7-39 20q-19 14-47 40l-198 181l283 288q23 24 45 34q21 10 56 10l0 38l-328 0l0-38l18 0q17 0 28-5q10-5 10-16q0-16-12-34q-12-17-41-47q-28-30-78-79l-83-87l-9 0l0 167q0 42 6 64q5 21 25 29q20 8 62 8z"],"L":[625,"m579 0l-542 0l0-38q41 0 61-7q20-7 26-27q6-20 6-59l0-391q0-38-6-59q-6-21-25-29q-20-9-61-9l0-38l318 0l0 38q-42 0-63 9q-21 8-28 29q-7 21-7 60l0 410q0 36 16 46q15 11 59 11l56 0q45 0 73-7q29-7 47-25q18-17 30-46q12-29 25-73l44 0z"],"M":[959,"m274 0l-247 0l0-38q40 0 60-7q19-6 26-30q7-24 7-75l0-376q0-38-7-58q-7-20-26-27q-20-8-58-8l0-38l252 0l197 478l6 0l196-478l235 0l0 38q-34 0-53 8q-19 7-26 27q-7 20-7 57l0 405q0 34 7 52q8 18 27 25q19 7 53 7l0 38l-302 0l0-38q39 0 58-7q19-7 25-25q6-18 6-52l0-410l-6 0l-222 532l-59 0l-226-532l-5 0l0 382q0 51 6 75q7 24 26 30q19 7 57 7z"],"N":[775,"m664 7l-85 0l-394-523l-33 0l-26-45q-18-25-32-37q-15-12-31-17q-15-4-37-4l0-38l214 0l358 475l5 0l0-308q0-42-5-70q-5-29-25-44q-19-15-65-15l0-38l246 0l0 38q-41 0-60 15q-20 15-25 45q-5 29-5 71zm-393-7l-245 0l0-38q40 0 60-20q20-21 27-58q7-37 7-87l0-384l60 0l0 430q0 50 7 75q7 26 27 35q20 9 57 9z"],"O":[744,"m372 13q-103 0-175-40q-73-40-112-117q-38-77-38-185q0-104 39-180q38-76 112-118q73-42 174-42q103 0 176 40q72 40 111 115q38 74 38 176q0 108-38 186q-39 79-111 122q-73 43-176 43zm1-48q95 0 141-74q46-73 46-226q0-92-24-156q-23-64-66-97q-43-34-101-34q-85 0-135 75q-50 74-50 212q0 141 47 220q47 80 142 80z"],"R":[703,"m357 0l-319 0l0-38q38 0 58-6q19-6 26-26q7-20 7-62l0-410q0-30-6-46q-6-17-25-24q-20-7-60-7l0-38l296 0q72 0 131 15q60 15 95 51q35 37 35 101q0 55-23 89q-24 35-60 54q-37 19-79 29l0 5q16 10 36 33q19 23 51 68q32 46 86 123q24 33 48 42q23 9 57 9l0 38l-204 0q-36-61-60-101q-24-40-41-66q-17-27-30-48q-14-22-29-45q-14-23-27-28q-13-6-39-6l-23 0l0 163q0 40 7 61q7 20 28 26q21 6 64 6zm-99-339 38 1q52-3 88-17q37-14 56-45q20-31 20-85q0-58-33-92q-33-35-107-35q-16 0-32 1q-15 0-30 2z"],"S":[520,"m81 14l-39 0l-9-216l43 0q17 66 38 101q21 35 52 48q31 13 75 13q34 0 62-9q28-9 45-30q17-21 17-56q0-43-23-71q-22-28-57-49q-35-21-75-40q-44-23-83-49q-39-26-62-63q-24-38-24-96q0-54 26-91q27-36 74-55q48-19 110-19q41 0 66 6q24 7 40 13q15 7 27 7q10 0 19-5q8-5 12-21l33 0l7 207l-41 0q-22-88-58-126q-36-37-99-37q-52 0-80 21q-27 20-27 63q0 37 21 62q21 24 56 43q34 19 73 39q35 18 68 37q34 19 61 44q27 26 44 60q16 34 16 80q0 61-30 103q-30 41-82 63q-53 21-122 21q-49 0-78-8q-28-7-43-14q-16-8-27-8q-11 0-18 9q-8 8-8 23z"]},"i":{" ":[225,""],"$":[495,"m184 6q-47 0-80-6q-32-6-56-17q-24-10-45-24l33-156l34 0q0 61 12 97q12 35 40 50q27 15 69 15q74 0 117-32q43-32 43-94q0-35-24-62q-24-27-68-53l28-111q43 24 81 49q38 25 62 57q24 32 24 81q0 58-24 97q-24 40-63 64q-40 23-88 34q-47 11-95 11zm18 86l-44 0l169-797l44 0zm80-479-26 113q-52-30-88-56q-37-26-56-56q-19-31-19-71q0-61 32-101q32-40 86-60q55-21 119-21q42-1 77 7q36 9 62 21q26 12 39 23l-28 135l-34 0q0-77-29-113q-29-36-91-36q-40 0-72 12q-32 11-50 34q-19 23-19 58q0 31 25 57q25 26 72 54z"],".":[253,"m85 9q-31 0-47-18q-17-18-17-45q0-29 17-47q18-19 49-19q31 0 47 19q17 19 17 46q0 27-17 45q-17 19-49 19z"],"0":[495,"m198 11q-59 0-96-30q-36-29-53-80q-17-51-17-114q0-88 19-165q20-78 56-137q37-59 91-93q53-34 120-34q78 0 122 59q44 59 44 167q0 57-11 117q-10 60-32 115q-21 55-55 100q-34 44-81 69q-46 26-107 26zm9-40q35 0 63-25q27-25 47-68q21-44 34-99q14-55 20-116q7-61 7-121q0-146-70-146q-36 0-63 26q-28 26-48 70q-21 45-34 100q-13 55-19 115q-6 60-6 117q0 72 17 110q18 37 52 37z"],"1":[495,"m384 0l-350 0l7-33q47 0 75-6q27-7 41-21q13-15 18-40l88-412q2-7 3-13q1-6 1-11q0-25-26-25q-10 0-27 2q-16 2-35 5q-18 3-35 8l8-38l205-55l40 0l-115 539q-1 5-1 9q-1 5-1 9q0 26 26 38q26 11 85 11z"],"2":[495,"m377 0l-395 0l10-44l175-143q58-49 97-87q40-38 64-71q24-33 34-66q11-34 11-73q0-42-23-68q-24-26-70-26q-47 0-84 21q-38 21-79 76l-26-12q42-72 100-112q58-41 137-41q73 0 115 39q41 38 41 101q0 53-24 97q-24 44-74 91q-50 47-129 109l-149 116l-1 6l68-4l133 0q27 0 44-8q16-8 30-26q14-18 32-48l32 0z"],"3":[495,"m118 14q-42 0-64-8q-23-7-32-19q-9-13-9-28q0-18 13-36q13-17 39-17q17 0 30 9q14 8 28 19q14 11 32 20q18 9 44 9q36 0 69-16q33-16 54-50q21-33 21-86q0-39-19-66q-19-27-52-41q-34-15-78-15l-19 0l9-45l18 0q39 0 77-19q39-20 65-54q26-34 26-76q0-37-23-55q-22-18-60-18q-47 0-80 21q-32 21-66 59l-22-15q44-65 96-99q52-35 121-35q68 0 103 32q36 32 36 81q0 43-18 73q-18 30-50 53q-33 22-78 45l0 4q53 19 85 53q33 34 33 86q0 57-27 101q-27 43-74 73q-47 29-105 44q-59 16-123 16z"],"4":[495,"m338 0l-105 0l110-518l-3 0l-245 283l-1 4l388 0l-16 83l-452 0l16-76l368-421l77 0z"],"5":[495,"m119 14q-56 0-80-15q-24-15-24-39q0-22 14-38q14-16 39-16q16 0 30 9q13 8 27 19q13 11 30 20q17 8 41 8q46 0 81-17q35-18 56-55q20-37 20-93q0-49-22-77q-23-28-64-41q-41-13-100-16q-19-2-30-2q-11 0-14 0l-10-18l86-273l303 0l-26 89l-255 0l-34 112q41 0 87 8q46 8 87 27q40 19 65 54q25 35 25 92q0 64-25 113q-26 48-71 82q-46 33-106 50q-60 17-130 17z"],"6":[494,"m210 13q-61 0-100-26q-38-26-56-70q-19-44-19-99q0-106 38-189q37-84 102-144q65-60 151-94q85-33 182-37l0 31q-72 10-140 45q-69 35-122 90q-54 55-83 129l8 1q36-30 70-46q34-17 81-17q63 0 101 42q37 43 37 121q0 77-29 136q-29 60-85 93q-56 34-136 34zm10-39q45 0 75-27q31-27 46-74q14-47 14-108q0-50-21-83q-21-32-65-32q-31 0-62 17q-31 17-52 58q-20 41-20 115q0 59 21 96q20 38 64 38z"],"7":[495,"m163 8l-97 0l363-547l-230 0q-25 0-38 5q-13 5-24 21q-12 16-32 49l-34-5l62-161l396 0l-9 43z"],"8":[495,"m193 13q-77 0-123-31q-47-32-47-93q0-45 17-79q17-33 55-63q38-30 101-63l4-12l37 25q-43 29-71 53q-27 25-41 55q-13 29-13 73q0 53 25 76q24 24 68 24q33 0 63-13q30-13 48-39q18-27 18-66q0-46-30-83q-30-38-95-87q-57-44-80-80q-22-36-22-78q0-56 31-96q31-40 83-62q51-22 115-22q67 0 108 31q41 31 41 83q0 30-13 60q-13 30-48 60q-35 30-100 63l-4 12l-38-25q55-32 87-75q31-44 31-95q0-38-19-58q-18-20-55-20q-53 0-87 31q-33 31-33 81q0 37 23 70q23 32 75 69q51 36 80 65q29 29 41 57q13 27 13 59q0 62-33 105q-32 43-88 65q-55 23-124 23z"],"9":[495,"m20 13l0-32q70-6 137-37q68-30 121-88q54-58 82-145l-7-1q-37 34-71 51q-34 16-80 16q-66 0-103-44q-37-44-37-117q0-80 29-139q29-58 85-91q55-32 134-32q60 0 98 27q37 26 54 71q17 44 17 100q0 113-33 199q-34 87-96 145q-62 59-146 88q-84 29-184 29zm231-299q33 0 62-17q30-17 49-59q20-43 20-119q0-55-20-90q-19-36-61-36q-41 0-72 25q-31 24-48 70q-18 47-18 112q0 50 23 82q22 32 65 32z"],"A":[690,"m154 0l-213 0l7-34q27 0 46-9q19-8 40-34q22-25 55-77l344-507l58 0l80 536q9 49 26 70q18 21 59 21l-6 34l-282 0l8-34q21 0 38-4q17-3 27-16q11-12 11-38q0-12-1-23q0-12-1-21l-11-91l-2-22l-32-288l-3 0l-190 288l-12 22l-70 106q-10 14-18 30q-8 16-8 30q0 16 13 22q12 5 45 5zm297-216l-271 0l26-44l241 0z"],"D":[718,"m249 0l-264 0l7-34q39 0 60-7q21-6 32-26q10-21 18-61l85-411q8-37 3-54q-5-18-24-23q-19-6-55-6l8-35l266 0q74 0 132 16q57 16 97 48q40 32 61 80q21 48 21 113q0 108-33 184q-34 77-95 124q-61 48-142 70q-81 22-177 22zm2-45q107 0 180-35q73-34 111-110q37-76 37-198q0-49-11-89q-11-41-36-71q-26-30-70-47q-44-17-111-17q-11 0-20 1q-8 0-22 2l-116 562q13 2 28 2q14 0 30 0z"],"E":[624,"m517 0l-532 0l7-34q34 0 55-6q21-6 33-23q12-18 19-53l86-415q8-38 6-58q-2-20-21-27q-19-7-59-7l7-34l524 0l-29 169l-37 0q3-48-6-75q-9-26-38-37q-29-10-88-10l-136 0l-116 564l119 0q55 0 89-6q34-6 57-22q22-15 40-44q18-28 40-71l38 0zm-39-223l-36 0q8-42 4-62q-4-20-26-26q-23-6-70-6l-114 0l8-43l115 0q47 0 72-7q26-7 38-28q12-20 20-60l36 0z"],"F":[592,"m289 0l-304 0l7-34q36 0 56-6q21-6 33-25q12-18 19-55l87-420q7-35 4-53q-3-17-22-23q-18-7-58-7l7-34l526 0l-28 170l-36 0q1-48-5-75q-7-27-35-38q-28-10-92-10l-139 0l-103 499q-2 10-3 18q-1 8-1 15q0 27 23 36q23 8 70 8zm182-222l-37 0q8-42 3-62q-4-19-26-25q-22-6-66-6l-108 0l8-43l111 0q42 0 67-8q24-7 38-28q13-21 21-61l36 0z"],"G":[706,"m318 11q-71 0-120-19q-49-19-79-53q-30-34-44-79q-13-44-13-96q0-108 33-189q33-82 89-136q57-54 129-81q72-28 150-28q53 0 82 9q30 9 46 19q16 9 29 9q12 0 21-10q9-11 19-26l34 0l-48 233l-37 0q2-100-38-144q-41-43-118-43q-61 0-112 27q-51 28-87 79q-36 51-56 119q-20 69-20 149q0 104 39 158q38 53 122 53q45 0 78-13q34-13 67-35l20-102q8-36 5-55q-2-18-19-25q-17-6-55-6l7-35l252 0l-6 35q-28 0-44 6q-16 6-24 22q-8 17-14 48l-29 141q-61 31-120 49q-58 19-139 19z"],"H":[776,"m275 0l-290 0l7-34q40 0 61-7q20-6 31-28q10-22 19-66l80-386q9-39 8-61q-1-23-19-32q-17-9-61-9l7-34l292 0l-6 34q-46 0-66 9q-21 9-30 32q-9 22-18 61l-79 386q-9 44-7 65q1 22 19 29q18 7 59 7zm295-314l-333 0l8-44l334 0zm125 314l-285 0l6-34q40 0 60-7q19-7 28-29q8-22 17-65l81-386q9-39 9-61q0-23-17-32q-17-9-61-9l7-34l287 0l-7 34q-44 0-64 9q-21 9-30 31q-8 22-17 62l-80 386q-9 43-8 65q1 21 20 29q18 7 60 7z"],"I":[358,"m274 0l-289 0l7-34q42 0 62-7q21-7 31-29q9-21 18-65l80-386q9-39 9-61q-1-23-19-32q-17-9-62-9l7-34l293 0l-7 34q-44 0-66 9q-22 9-31 32q-9 22-17 61l-80 389q-8 42-7 64q1 21 20 27q18 7 58 7z"],"K":[678,"m278 0l-293 0l7-34q42 0 63-8q20-7 30-29q9-21 18-64l80-386q8-39 8-61q-1-23-19-32q-17-9-61-9l7-34l297 0l-6 34q-47 0-69 9q-23 9-32 32q-10 22-18 62l-79 385q-8 43-7 64q1 22 20 29q18 8 61 8zm380 0l-302 0l6-34l14 0q21 0 34-6q12-7 12-23q0-15-9-34q-9-19-32-50q-22-32-61-81l-73-91l88-53l229 295q19 24 42 33q22 10 58 10zm-379-307l-40 0l6-31l12 0l194-157q30-25 50-42q20-18 30-33q10-14 10-29q0-24-35-24l-17 0l8-34l244 0l-6 34q-28 2-48 8q-20 7-41 20q-20 13-51 38z"],"L":[590,"m499 0l-515 0l8-34q39 0 60-7q21-7 31-27q11-20 19-60l84-405q7-35 5-55q-1-19-19-27q-18-8-61-8l7-34l299 0l-6 34q-38 0-61 7q-23 7-36 27q-13 20-21 57l-88 431q-7 34 6 45q14 11 57 11l52 0q45 0 75-8q29-8 50-26q21-18 39-48q18-30 40-73l38 0z"],"M":[900,"m212 0l-237 0l7-34q40 0 61-7q20-7 32-32q12-24 22-75l78-383q8-38 5-57q-3-20-21-27q-18-8-57-8l7-34l224 0l101 492l5 0l297-492l211 0l-7 34q-35 0-55 8q-20 7-31 27q-11 19-20 56l-84 411q-11 54 5 70q16 17 68 17l-7 34l-282 0l6-34q37 0 57-7q19-7 29-26q10-19 17-54l88-421l-5 0l-332 542l-39 0l-116-541l-5 0l-81 393q-10 51-9 75q2 25 20 32q17 7 55 7z"],"N":[729,"m573 8l-55 0l-293-545l-29-18q-14-28-26-43q-12-15-27-20q-15-5-41-5l7-34l179 0l262 485l5 0l67-322q9-46 8-74q0-28-17-42q-17-13-60-13l7-34l239 0l-7 34q-37 0-60 14q-22 15-35 44q-13 29-22 75zm-362-8l-235 0l7-34q39 0 61-9q21-8 32-34q11-26 21-76l92-444l93 74l-54 0l-77 370q-10 50-8 75q2 26 20 35q18 9 55 9z"],"O":[720,"m316 13q-90 0-146-34q-57-33-83-92q-27-59-27-134q0-91 28-168q28-77 79-134q50-57 120-88q70-32 154-32q89 0 146 35q57 34 84 92q28 59 28 130q0 95-28 173q-28 78-79 134q-52 56-122 87q-70 31-154 31zm12-46q53 0 93-21q41-21 71-57q31-37 51-86q20-49 29-105q9-57 9-117q0-101-40-153q-40-52-112-52q-57 0-103 30q-47 29-80 82q-33 53-51 123q-17 70-17 152q0 58 14 105q14 46 47 73q33 26 89 26z"],"R":[643,"m282 0l-294 0l7-34q37 0 57-6q20-6 31-26q11-20 19-62l86-420q6-28 3-45q-3-16-20-23q-18-7-58-7l7-34l262 0q67 0 117 14q50 14 78 44q28 30 28 80q0 52-19 87q-19 35-49 59q-30 23-66 36q-36 13-71 20l0 5q16 11 31 35q15 24 38 69q23 46 63 123q17 31 37 41q21 10 55 10l-7 34l-173 0q-26-61-43-102q-17-40-30-68q-12-27-22-49q-10-22-21-45q-10-22-23-28q-12-6-39-6l-31 0l7-41l43 1q62-3 108-20q46-18 71-55q25-37 25-99q0-29-11-52q-12-23-38-37q-27-14-73-14q-18 0-30 1q-13 0-29 2l-99 485q-8 40-6 61q3 20 23 26q19 6 62 6z"],"S":[543,"m57 14l-34 0l40-216l35 0q4 68 18 104q13 36 42 50q28 14 74 14q41 0 73-12q33-12 53-37q20-26 20-65q0-40-18-68q-19-28-49-50q-29-22-63-42q-34-20-62-42q-29-22-46-53q-17-30-17-76q0-62 32-104q31-41 83-63q53-21 115-21q41 0 66 6q24 7 38 14q15 7 26 7q12 0 21-6q10-6 17-21l28 0l-36 199l-34 0q-3-86-30-123q-27-37-97-37q-62 0-96 28q-34 28-34 80q0 30 17 54q17 24 45 44q28 19 60 38q37 23 70 47q32 24 53 57q21 32 21 81q0 67-34 114q-33 46-90 72q-57 25-126 25q-51 0-79-8q-28-7-43-14q-15-8-26-8q-11 0-20 9q-10 9-13 23z"]}};
const KERN: Record<string, Record<string, number>> = {"b":{"AG":-40,"AO":-40,"D.":-40,"DA":-40,"EG":-20,"EO":-20,"F.":-60,"FA":-65,"FG":-15,"FO":-15,"G.":-20,"GA":-10,"KG":-40,"KO":-40,"LG":-10,"LO":-10,"N.":-20,"NA":-15,"O.":-40,"OA":-40,"RG":-20,"RO":-20,"SA":-20},"i":{"D.":-40,"F.":-50,"G.":-20,"N.":-20,"O.":-40,"AG":-40,"AO":-40,"DA":-30,"EG":-10,"EO":-10,"FA":-70,"FG":-10,"FO":-10,"GA":-10,"KG":-35,"KO":-35,"LG":-10,"LO":-10,"NA":-15,"OA":-30,"RG":-20,"RO":-20,"SA":-10}};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"sofronie":"release-assets/20bd470f8a3c3b8f0f9c29b928ce7b8dff73b34cc706fa73d2ecabe80785a646.webp"};
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
/** 细金线装饰：从中点向两边画开，中间一颗菱形。 */
function Rule({x, y, w, p, color = GOLD}: {x: number; y: number; w: number; p: number; color?: string}) {
  if (p <= 0) return null;
  const e = out3(p), half = w / 2 * e;
  return <g opacity={clamp(p * 2)}>
    <line x1={x - half} y1={y} x2={x - 14} y2={y} stroke={color} strokeWidth={1.6} />
    <line x1={x + 14} y1={y} x2={x + half} y2={y} stroke={color} strokeWidth={1.6} />
    <path d={`M${x} ${y - 7} L${x + 7} ${y} L${x} ${y + 7} L${x - 7} ${y} Z`} fill={color} />
  </g>;
}

// ---------- 底图 ----------
/** 满幅底图 + 运镜（scale/位移随进度缓动）。不用 CSS filter：调色一律用叠色层，保证两次渲染逐像素一致。 */
function Plate({asset, frame, p, from = [1.04, 0, 0], to = [1.12, -20, -10], opacity = 1, origin = '50% 50%'}:
  {asset: any; frame: number; p: number; from?: number[]; to?: number[]; opacity?: number; origin?: string}) {
  if (!asset || opacity <= 0) return null;
  const k = easeInOut(clamp(p));
  const s = mix(from[0], to[0], k), x = mix(from[1], to[1], k), y = mix(from[2], to[2], k);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s})`, transformOrigin: origin}}>
      <Media asset={asset} frame={frame} fit="cover" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
  </div>;
}
/** 运镜舞台：底图与贴在画里的道具（雪、灯光、表盘、价签）一起缩放平移；k 为 0→1 的运镜进度。 */
function Stage({k, from = [1, 0, 0], to = [1.08, 0, 0], origin = '50% 50%', children, extra = ''}:
  {k: number; from?: number[]; to?: number[]; origin?: string; children: any; extra?: string}) {
  const e = easeInOut(clamp(k)), s = mix(from[0], to[0], e), x = mix(from[1], to[1], e), y = mix(from[2], to[2], e);
  return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, transform: `translate(${x}px, ${y}px) scale(${s}) ${extra}`, transformOrigin: origin}}>{children}</div>
  </div>;
}
/** 叠色层（替代 CSS filter 调色）。 */
const Wash = ({color, opacity, blend = 'normal'}: {color: string; opacity: number; blend?: string}) =>
  opacity <= 0 ? null : <div style={{position: 'absolute', inset: 0, background: color, opacity, mixBlendMode: blend as any}} />;
/** 暗角。 */
const Finish = ({vignette = .55}: {vignette?: number}) =>
  <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 46%, rgba(0,0,0,${vignette}) 100%)`}} />;
/** 煤气灯/烛光：带闪烁的暖光晕（screen 叠加）。 */
function Glow({x, y, r, t, amount = 1, color = '255,186,96', seed = 1}: {x: number; y: number; r: number; t: number; amount?: number; color?: string; seed?: number}) {
  if (amount <= 0) return null;
  const f = .86 + .1 * Math.sin(t * 9.1 + seed * 1.7) * Math.sin(t * 5.3 + seed) + .04 * Math.sin(t * 23 + seed * 3);
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', mixBlendMode: 'screen', opacity: amount * f,
    background: `radial-gradient(circle, rgba(${color},.75) 0%, rgba(${color},.28) 22%, rgba(${color},.08) 48%, rgba(${color},0) 70%)`}} />;
}
/** 雪：三层景深，随风斜飘、轻摆；region 限定在窗玻璃等区域。 */
function Snow({frame, amount = 1, wind = 40, seed = 3, region, opacity = 1, size = 1}:
  {frame: number; amount?: number; wind?: number; seed?: number; region?: number[]; opacity?: number; size?: number}) {
  const r = seeded(seed), n = 340, flakes = Array.from({length: n}, () => ({x: r() * W, y: r() * H, z: r(), ph: r() * 6.28}));
  const ref = useCanvas(frame, (c, f) => {
    const t = f / 30;
    if (region) {c.beginPath(); c.rect(region[0], region[1], region[2], region[3]); c.clip();}
    flakes.forEach((m, i) => {
      if (i / n > amount) return;
      const speed = 40 + 110 * m.z * m.z, y = ((m.y + speed * t) % (H + 40) + H + 40) % (H + 40) - 20;
      const x = (((m.x + wind * (.4 + m.z) * t + Math.sin(t * (.6 + m.z) + m.ph) * (10 + 26 * m.z)) % (W + 40)) + W + 40) % (W + 40) - 20;
      const rad = (.8 + 3.2 * m.z * m.z) * size;
      c.fillStyle = `rgba(240,245,255,${.25 + .55 * m.z})`; c.beginPath(); c.arc(x, y, rad, 0, 6.283); c.fill();
      if (m.z > .8) {c.fillStyle = `rgba(240,245,255,.12)`; c.beginPath(); c.arc(x, y, rad * 2.4, 0, 6.283); c.fill();}
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
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
/** 剪刀：open 0 合拢 → 1 张开；绕支点转。 */
function Scissors({x, y, size, open, rot = 0, opacity = 1}: {x: number; y: number; size: number; open: number; rot?: number; opacity?: number}) {
  if (opacity <= 0) return null;
  const a = 4 + 22 * clamp(open);
  const blade = (sign: number) => <g transform={`rotate(${sign * a})`}>
    <path d={`M0 ${-size * .035} L${size * .95} ${-size * .005} L${size * .95} ${size * .012} L0 ${size * .04} Z`} fill="url(#blade)" stroke="#3a4048" strokeWidth={1.5} />
    <ellipse cx={-size * .3} cy={sign * size * .09} rx={size * .14} ry={size * .085} fill="none" stroke="#2c2622" strokeWidth={size * .035} />
    <path d={`M0 0 L${-size * .2} ${sign * size * .07}`} stroke="#2c2622" strokeWidth={size * .04} />
  </g>;
  return <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity} style={{filter: 'drop-shadow(0 8px 16px rgba(0,0,0,.6))'}}>
    {blade(-1)}{blade(1)}<circle r={size * .028} fill="#c9ced6" stroke="#3a4048" strokeWidth={2} />
  </g>;
}
/** 剪落的发丝：t0 起从 (x,y) 一带散落，打着旋飘落。 */
function Strands({frame, t0, x, y, w = 260, count = 70, seed = 9, opacity = 1}: {frame: number; t0: number; x: number; y: number; w?: number; count?: number; seed?: number; opacity?: number}) {
  const r = seeded(seed), hairs = Array.from({length: count}, () => ({dx: (r() - .5) * w, dy: (r() - .5) * 80, l: 60 + r() * 170, a: r() * 6.28, v: 120 + r() * 260, sp: (r() - .5) * 3, c: r()}));
  const ref = useCanvas(frame, (c, f) => {
    const d = f / 30 - t0;
    if (d < 0) return;
    hairs.forEach(h => {
      const yy = y + h.dy + h.v * d + 200 * d * d, xx = x + h.dx + Math.sin(d * 2 + h.a) * 40 * d, ang = h.a + h.sp * d;
      const ex = Math.cos(ang) * h.l, ey = Math.sin(ang) * h.l * .5;
      c.strokeStyle = `rgba(${110 + 60 * h.c},${62 + 30 * h.c},${32 + 14 * h.c},${.85 * Math.max(0, 1 - d / 2.4)})`;
      c.lineWidth = 1.2 + 1.6 * h.c; c.beginPath(); c.moveTo(xx, yy);
      c.quadraticCurveTo(xx + ex * .5 + Math.sin(d * 3 + h.a) * 30, yy + ey * .5 - 30, xx + ex, yy + ey); c.stroke();
    });
  });
  return <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none'}} />;
}
/** 金额计数：$0.00 等宽数字，数字跳动时轻弹。 */
function Money({value, x, y, size, t, bumpAt = -9, fill = GOLD, align = 'start', opacity = 1, id}:
  {value: number; x: number; y: number; size: number; t: number; bumpAt?: number; fill?: string; align?: 'start' | 'middle' | 'end'; opacity?: number; id: string}) {
  const cents = Math.max(0, Math.round(value * 100)), text = `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
  const bump = 1 + .08 * Math.max(0, 1 - Math.abs(t - bumpAt) / .25);
  return <g transform={`translate(${x} ${y}) scale(${bump}) translate(${-x} ${-y})`}>
    <Type id={id} text={text} x={x} y={y} size={size} fill={fill} align={align} mono opacity={opacity} />
  </g>;
}


// 卖发：两句 “On went …” 两下推镜；念到“Sofronie”金字招牌一笔笔亮起；“Twenty dollars”价签荡进来；
// “Give it to me quick”剪刀张开，句尾一剪：白闪、发丝飘落，右上角的钱数从 $1.87 跳到 $21.87。
export const meta = {
  title: 'Hair Goods of All Kinds',
  params: {
    shop: {label: '招牌第一行', type: 'text', default: 'MME. SOFRONIE', maxLength: 24},
    goods: {label: '招牌第二行', type: 'text', default: 'HAIR GOODS', maxLength: 24},
    goods2: {label: '招牌第三行', type: 'text', default: 'OF ALL KINDS', maxLength: 24},
    shopCue: {label: '招牌卡点词', type: 'text', default: 'Sofronie', maxLength: 24},
    goodsCue: {label: '招牌下两行卡点词', type: 'text', default: 'Hair', maxLength: 24},
    price: {label: '价签', type: 'text', default: '$20', maxLength: 8},
    priceCue: {label: '价签卡点词', type: 'text', default: 'Twenty', maxLength: 24},
    before: {label: '剪前金额', type: 'number', default: 1.87, min: 0, max: 999, step: .01},
    after: {label: '剪后金额', type: 'number', default: 21.87, min: 0, max: 999, step: .01},
    snipCue: {label: '一剪卡点词', type: 'text', default: 'quick', maxLength: 24, help: '剪刀在这个词之后约半秒合上'},
  },
  slots: {sofronie: '假发店：左边是窗，右边 Madame 托起 Della 的长发'},
};
export default function Sale(props: SceneInput) {
  const {s: scene, t, at, start, endAll, dur} = cues(props);
  const p0 = start(0, .1), p1 = start(1, 1.6), shopT = at(txt(props, 'shopCue'), start(2, 3.2)) - .2, goodsT = at(txt(props, 'goodsCue'), shopT + 1.2);
  const priceT = at(txt(props, 'priceCue'), start(3, 6)), quickT = at(txt(props, 'snipCue'), endAll(dur - 1.4) - .4);
  const snip = Math.max(quickT + .45, endAll(quickT + .6) - .05), lastStart = scene.sentence(Number.MAX_SAFE_INTEGER)?.start ?? snip - 1.6;
  const lit = sm((t - shopT + .3) / .8);
  const punch = 1 + .05 * Math.exp(-Math.max(0, t - p0) * 4) * (t > p0 ? 1 : 0) + .05 * Math.exp(-Math.max(0, t - p1) * 4) * (t > p1 ? 1 : 0);
  const sw = t > priceT ? Math.sin((t - priceT) * 6.5) * Math.exp(-(t - priceT) * 2.2) * 16 : 0, tag = out3((t - priceT) / .4);
  const sc = lastStart, open = t < snip ? sm((t - sc) / .4) : 0, scissorsIn = sm((t - sc) / .35) * (1 - sm((t - snip - .5) / .4));
  const money = t < snip ? Number(props.params.before ?? 1.87) : mix(Number(props.params.before ?? 1.87), Number(props.params.after ?? 21.87), out3((t - snip - .15) / .7));
  const moneyIn = sm((t - snip + .6) / .4);
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .15), transform: shake(t, snip, 9, .35)}}>
    <Stage k={t / dur} from={[1.04, 30, 0]} to={[1.16, -60, 20]} extra={`scale(${punch})`} origin="62% 40%">
      <Plate asset={slot(props, 'sofronie')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
      <Glow x={1745} y={505} r={160} t={t} amount={.6} seed={3} />
      <Svg><Defs />
        <g transform={`translate(1560 300) rotate(${sw})`} opacity={clamp(tag * 2)}>
          <line x1={0} y1={-300} x2={0} y2={-40} stroke="#d8c7a0" strokeWidth={2} />
          <g transform={`translate(0 ${-60 * (1 - tag)})`}>
            <path d="M-70 -40 L70 -40 L70 80 L0 120 L-70 80 Z" fill="#e9d9b2" stroke="#7a5a30" strokeWidth={2.5} style={{filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.55))'}} />
            <circle cx={0} cy={-20} r={8} fill="#3a2a1a" />
            <Type id="pr" text={txt(props, 'price')} x={0} y={62} size={66} align="middle" fill="#2a1a10" face="i" shadow={false} maxWidth={124} />
          </g>
        </g>
        <Scissors x={1330} y={450} size={420} open={open} rot={-24} opacity={scissorsIn} />
      </Svg>
      <Strands frame={props.frame} t0={snip} x={1250} y={470} w={300} count={80} seed={21} />
    </Stage>
    <Wash color="#0b0d18" opacity={.62 * (1 - lit)} />
    <Snow frame={props.frame} amount={.7 * (1 - lit)} wind={40} seed={8} />
    <Svg><Defs />
      <g opacity={lit}>
        <rect x={70} y={130} width={560} height={360} rx={10} fill="rgba(10,10,12,.86)" stroke={GOLD} strokeWidth={3} />
        <rect x={86} y={146} width={528} height={328} rx={6} fill="none" stroke={GOLD} strokeWidth={1.2} opacity={.7} />
        <Type id="s1" text={txt(props, 'shop')} x={350} y={250} size={62} align="middle" fill={GOLD} tracking={60} p={(t - shopT) / .9} mode="wipe" maxWidth={500} />
        <Rule x={350} y={292} w={380} p={(t - shopT - .5) / .6} />
        <Type id="s2" text={txt(props, 'goods')} x={350} y={370} size={44} align="middle" fill={CREAM} tracking={160} p={(t - goodsT) / .6} mode="wipe" maxWidth={480} />
        <Type id="s3" text={txt(props, 'goods2')} x={350} y={432} size={34} align="middle" fill={CREAM} tracking={200} p={(t - goodsT - .35) / .6} mode="wipe" maxWidth={460} />
        <rect x={70} y={130} width={560} height={360} rx={10} fill="url(#sheen)" opacity={win(t, shopT + .3, shopT + 1.3, .3)} />
        <defs><linearGradient id="sheen" x1="0" y1="0" x2="1" y2=".3">
          <stop offset={clamp((t - shopT - .3) / 1.2) - .15} stopColor="#fff" stopOpacity="0" />
          <stop offset={clamp((t - shopT - .3) / 1.2)} stopColor="#fff6dc" stopOpacity=".35" />
          <stop offset={clamp((t - shopT - .3) / 1.2) + .15} stopColor="#fff" stopOpacity="0" />
        </linearGradient></defs>
      </g>
      <Money id="mn" value={money} x={1820} y={150} size={92} t={t} bumpAt={snip + .85} align="end" opacity={moneyIn} />
    </Svg>
    {t > snip && t - snip < .14 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,252,240,${.85 * (1 - (t - snip) / .14)})`}} />}
    <Finish vignette={.5} />
  </div>;
}
