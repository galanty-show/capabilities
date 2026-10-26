import React from 'react';
import {Media, clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 《The Gift of the Magi》共用画面库。prepare.py 把它和每幕正文拼成 scenes/<module>.tsx，
// 只内联该幕要画的 STIX Two Text 字形（SIL OFL 1.1）与字距；运行时无字体下载、无随机与时钟。
// 字形表：face → 字 → [前进宽度, SVG 路径]（1000 单位/em，基线在 0、y 向下）；缺字时整串退回系统衬线字。
const GLYPHS: Record<string, Record<string, [number, string]>> = {"b":{" ":[235,""],"$":[495,"m233 6q-43 0-76-4q-33-4-62-15q-29-10-62-27l0-161l40 0q21 90 55 125q34 35 92 35q68 0 101-24q33-24 33-70q0-44-29-73q-28-29-78-52q-78-36-125-69q-47-33-68-70q-21-37-21-85q0-74 58-115q58-41 155-41q32 0 68 7q36 7 68 19q33 12 51 26l0 141l-39 0q-18-80-53-115q-36-36-94-36q-53 0-83 19q-29 19-29 61q0 28 14 48q13 20 41 37q27 17 70 39q35 16 72 36q37 19 68 44q31 25 50 60q19 34 19 82q0 58-29 98q-29 40-82 60q-53 20-125 20zm38 87l-50 0l0-799l50 0z"],".":[265,"m132 9q-35 0-53-19q-18-20-18-50q0-32 19-51q18-20 53-20q34 0 53 20q18 20 18 51q0 30-19 50q-18 19-53 19z"],"0":[495,"m248 11q-61 0-103-26q-43-25-69-70q-26-46-38-106q-12-60-12-129q0-99 26-172q25-72 75-111q50-39 123-39q65 0 115 37q49 37 76 110q28 72 28 178q0 67-13 126q-12 60-39 105q-26 46-68 71q-42 26-101 26zm-1-42q43 0 67-70q24-69 24-210q0-149-23-220q-23-71-69-71q-43 0-66 71q-24 71-24 216q0 142 24 213q23 71 67 71z"],"1":[495,"m448 0l-391 0l0-37q71 0 102-15q30-15 30-52l0-401q0-26-7-38q-7-11-26-11q-10 0-28 1q-19 2-40 5q-21 3-37 7l0-43l212-55l52 0l0 535q0 37 32 52q32 15 101 15z"],"2":[495,"m431 0l-400 0l0-55l138-139q48-49 79-89q31-41 47-83q16-42 16-96q0-50-26-80q-26-30-79-30q-45 0-77 18q-32 19-59 73l-37-14q26-73 81-113q54-39 132-39q58 0 102 21q44 21 69 59q25 39 25 90q0 47-19 89q-19 41-58 83q-39 42-96 93l-122 107l0 7l66-6l124 0q40 0 56-18q16-18 33-63l37 0z"],"3":[495,"m166 14q-47 0-73-8q-26-8-37-22q-12-14-12-32q0-21 13-37q12-17 36-17q18 0 35 10q17 9 34 22q17 12 35 22q18 9 38 9q27 0 49-12q22-12 36-40q13-28 13-77q0-44-20-76q-21-31-58-48q-37-17-89-17l-20 0l0-54l21 0q32 0 62-16q29-15 47-43q18-28 18-65q0-40-25-63q-25-22-68-22q-44 0-73 19q-29 18-53 55l-31-17q31-65 80-100q49-35 115-35q83 0 129 40q47 39 47 98q0 57-33 87q-32 30-85 56l0 6q48 16 83 41q35 24 54 57q19 33 19 75q0 68-39 114q-40 46-105 68q-65 22-143 22z"],"4":[495,"m393 0l-124 0l0-135l-255 0l0-93l283-417l96 0l0 410l89 0l0 100l-89 0zm-308-239l0 4l184 0l0-273l-4 0z"],"5":[495,"m158 15q-67 0-95-15q-27-16-27-46q0-21 12-38q12-18 36-18q19 0 35 10q16 9 32 21q15 13 34 22q19 9 42 9q37 0 64-12q27-13 42-43q16-29 16-80q0-47-20-75q-19-28-55-43q-35-15-82-21q-48-6-104-6l-15-22l68-288l299 0l-17 100l-254 0l-23 101q42 2 86 8q44 6 84 20q41 13 73 37q32 23 51 59q19 35 19 86q0 62-24 107q-24 44-66 72q-41 28-95 42q-55 13-116 13z"],"6":[495,"m260 13q-79 0-129-35q-50-35-74-95q-24-61-24-136q0-93 32-165q31-72 87-121q55-50 128-77q74-27 156-30l4 40q-70 10-127 43q-57 32-96 84q-39 52-54 123l10 1q30-29 57-44q27-15 65-15q79 0 125 54q47 53 47 151q0 109-53 166q-53 56-154 56zm4-42q38 0 58-37q20-37 20-129q0-64-24-107q-24-44-73-44q-23 0-41 11q-19 11-31 35q-11 24-11 64q0 60 11 107q11 47 33 73q23 27 58 27z"],"7":[494,"m232 8l-109 0l256-532l-218 0q-28 0-43 5q-15 5-24 21q-10 16-24 49l-37-3l40-178l395 0l0 56z"],"8":[495,"m240 13q-60 0-107-17q-48-17-75-52q-27-35-27-86q0-39 17-67q16-27 47-51q32-24 78-52l0-13l41 25q-21 25-39 46q-19 21-29 45q-11 24-11 59q0 64 30 94q30 31 79 31q24 0 47-11q23-11 38-32q14-22 14-53q0-32-13-58q-13-25-46-53q-33-29-92-70l-5-4q-57-38-88-68q-31-30-42-59q-11-29-11-63q0-48 27-82q26-34 73-52q46-18 106-18q53 0 95 17q42 18 66 49q24 30 24 70q0 35-13 61q-12 26-40 47q-28 22-75 46l0 14l-47-27q38-30 56-62q19-32 19-79q0-46-23-71q-23-25-60-25q-42 0-68 24q-26 24-26 67q0 42 30 74q29 32 97 73l7 6q64 39 101 70q37 31 53 63q15 31 15 75q0 55-29 93q-29 38-80 57q-50 19-114 19z"],"9":[495,"m70 13-2-38q68-8 124-37q56-28 95-80q38-53 49-135l-8-1q-30 28-58 42q-28 15-64 15q-80 0-127-56q-48-56-48-155q0-101 54-158q54-56 154-56q79 0 128 37q49 37 72 99q23 62 23 136q0 100-30 172q-30 73-83 120q-53 48-124 71q-72 23-155 24zm183-303q34 0 57-25q24-24 24-83q0-61-10-108q-9-46-31-72q-21-26-56-26q-38 0-60 36q-21 37-21 130q0 66 24 107q24 41 73 41z"],"I":[387,"m350 0l-315 0l0-38q44 0 64-8q20-7 25-29q6-21 6-64l0-377q0-40-5-62q-6-22-26-31q-20-10-64-10l0-38l317 0l0 38q-45 0-65 10q-21 9-25 31q-5 23-5 62l0 377q0 42 6 64q5 22 24 29q20 8 63 8z"],"V":[699,"m387 5l-65 0l-236-534q-14-33-28-53q-13-19-30-28q-18-9-47-9l0-38l309 0l0 38q-17 0-32 3q-16 2-26 10q-10 8-10 26q0 24 14 57l116 270l38 100l7 0l37-100l114-287q3-7 6-19q3-12 3-25q0-20-15-27q-16-8-49-8l0-38l221 0l0 38q-22 0-37 5q-15 5-27 19q-13 15-27 44q-14 29-35 78z"],"X":[687,"m686 0l-322 0l0-38l8 0q32 0 45-6q12-5 12-22q0-16-6-32q-5-16-25-46l-56-86l-36-63l-18-20l-165-231q-20-28-34-44q-14-17-32-23q-18-7-53-7l0-39l316 0l0 39l-10 0q-28 0-40 6q-13 6-13 24q0 13 10 32q10 18 23 36q12 19 21 35l59 99l19 19l192 267q26 36 47 48q22 13 58 14zm-447 0l-239 0l0-38q24 0 40-6q15-7 31-22q15-15 36-41l181-227l39 53l-17 0l-112 152q-9 12-19 27q-9 16-9 34q0 15 14 22q14 8 55 8zm291-525-142 178-37-50l16 0l96-134q13-19 21-33q7-13 7-29q0-13-13-19q-13-6-50-6l0-39l240 0l0 39q-31 1-51 9q-20 8-39 28q-19 19-48 56z"]},"i":{" ":[225,""],"$":[495,"m184 6q-47 0-80-6q-32-6-56-17q-24-10-45-24l33-156l34 0q0 61 12 97q12 35 40 50q27 15 69 15q74 0 117-32q43-32 43-94q0-35-24-62q-24-27-68-53l28-111q43 24 81 49q38 25 62 57q24 32 24 81q0 58-24 97q-24 40-63 64q-40 23-88 34q-47 11-95 11zm18 86l-44 0l169-797l44 0zm80-479-26 113q-52-30-88-56q-37-26-56-56q-19-31-19-71q0-61 32-101q32-40 86-60q55-21 119-21q42-1 77 7q36 9 62 21q26 12 39 23l-28 135l-34 0q0-77-29-113q-29-36-91-36q-40 0-72 12q-32 11-50 34q-19 23-19 58q0 31 25 57q25 26 72 54z"],".":[253,"m85 9q-31 0-47-18q-17-18-17-45q0-29 17-47q18-19 49-19q31 0 47 19q17 19 17 46q0 27-17 45q-17 19-49 19z"],"0":[495,"m198 11q-59 0-96-30q-36-29-53-80q-17-51-17-114q0-88 19-165q20-78 56-137q37-59 91-93q53-34 120-34q78 0 122 59q44 59 44 167q0 57-11 117q-10 60-32 115q-21 55-55 100q-34 44-81 69q-46 26-107 26zm9-40q35 0 63-25q27-25 47-68q21-44 34-99q14-55 20-116q7-61 7-121q0-146-70-146q-36 0-63 26q-28 26-48 70q-21 45-34 100q-13 55-19 115q-6 60-6 117q0 72 17 110q18 37 52 37z"],"1":[495,"m384 0l-350 0l7-33q47 0 75-6q27-7 41-21q13-15 18-40l88-412q2-7 3-13q1-6 1-11q0-25-26-25q-10 0-27 2q-16 2-35 5q-18 3-35 8l8-38l205-55l40 0l-115 539q-1 5-1 9q-1 5-1 9q0 26 26 38q26 11 85 11z"],"2":[495,"m377 0l-395 0l10-44l175-143q58-49 97-87q40-38 64-71q24-33 34-66q11-34 11-73q0-42-23-68q-24-26-70-26q-47 0-84 21q-38 21-79 76l-26-12q42-72 100-112q58-41 137-41q73 0 115 39q41 38 41 101q0 53-24 97q-24 44-74 91q-50 47-129 109l-149 116l-1 6l68-4l133 0q27 0 44-8q16-8 30-26q14-18 32-48l32 0z"],"3":[495,"m118 14q-42 0-64-8q-23-7-32-19q-9-13-9-28q0-18 13-36q13-17 39-17q17 0 30 9q14 8 28 19q14 11 32 20q18 9 44 9q36 0 69-16q33-16 54-50q21-33 21-86q0-39-19-66q-19-27-52-41q-34-15-78-15l-19 0l9-45l18 0q39 0 77-19q39-20 65-54q26-34 26-76q0-37-23-55q-22-18-60-18q-47 0-80 21q-32 21-66 59l-22-15q44-65 96-99q52-35 121-35q68 0 103 32q36 32 36 81q0 43-18 73q-18 30-50 53q-33 22-78 45l0 4q53 19 85 53q33 34 33 86q0 57-27 101q-27 43-74 73q-47 29-105 44q-59 16-123 16z"],"4":[495,"m338 0l-105 0l110-518l-3 0l-245 283l-1 4l388 0l-16 83l-452 0l16-76l368-421l77 0z"],"5":[495,"m119 14q-56 0-80-15q-24-15-24-39q0-22 14-38q14-16 39-16q16 0 30 9q13 8 27 19q13 11 30 20q17 8 41 8q46 0 81-17q35-18 56-55q20-37 20-93q0-49-22-77q-23-28-64-41q-41-13-100-16q-19-2-30-2q-11 0-14 0l-10-18l86-273l303 0l-26 89l-255 0l-34 112q41 0 87 8q46 8 87 27q40 19 65 54q25 35 25 92q0 64-25 113q-26 48-71 82q-46 33-106 50q-60 17-130 17z"],"6":[494,"m210 13q-61 0-100-26q-38-26-56-70q-19-44-19-99q0-106 38-189q37-84 102-144q65-60 151-94q85-33 182-37l0 31q-72 10-140 45q-69 35-122 90q-54 55-83 129l8 1q36-30 70-46q34-17 81-17q63 0 101 42q37 43 37 121q0 77-29 136q-29 60-85 93q-56 34-136 34zm10-39q45 0 75-27q31-27 46-74q14-47 14-108q0-50-21-83q-21-32-65-32q-31 0-62 17q-31 17-52 58q-20 41-20 115q0 59 21 96q20 38 64 38z"],"7":[495,"m163 8l-97 0l363-547l-230 0q-25 0-38 5q-13 5-24 21q-12 16-32 49l-34-5l62-161l396 0l-9 43z"],"8":[495,"m193 13q-77 0-123-31q-47-32-47-93q0-45 17-79q17-33 55-63q38-30 101-63l4-12l37 25q-43 29-71 53q-27 25-41 55q-13 29-13 73q0 53 25 76q24 24 68 24q33 0 63-13q30-13 48-39q18-27 18-66q0-46-30-83q-30-38-95-87q-57-44-80-80q-22-36-22-78q0-56 31-96q31-40 83-62q51-22 115-22q67 0 108 31q41 31 41 83q0 30-13 60q-13 30-48 60q-35 30-100 63l-4 12l-38-25q55-32 87-75q31-44 31-95q0-38-19-58q-18-20-55-20q-53 0-87 31q-33 31-33 81q0 37 23 70q23 32 75 69q51 36 80 65q29 29 41 57q13 27 13 59q0 62-33 105q-32 43-88 65q-55 23-124 23z"],"9":[495,"m20 13l0-32q70-6 137-37q68-30 121-88q54-58 82-145l-7-1q-37 34-71 51q-34 16-80 16q-66 0-103-44q-37-44-37-117q0-80 29-139q29-58 85-91q55-32 134-32q60 0 98 27q37 26 54 71q17 44 17 100q0 113-33 199q-34 87-96 145q-62 59-146 88q-84 29-184 29zm231-299q33 0 62-17q30-17 49-59q20-43 20-119q0-55-20-90q-19-36-61-36q-41 0-72 25q-31 24-48 70q-18 47-18 112q0 50 23 82q22 32 65 32z"],"I":[358,"m274 0l-289 0l7-34q42 0 62-7q21-7 31-29q9-21 18-65l80-386q9-39 9-61q-1-23-19-32q-17-9-62-9l7-34l293 0l-7 34q-44 0-66 9q-22 9-31 32q-9 22-17 61l-80 389q-8 42-7 64q1 21 20 27q18 7 58 7z"],"V":[658,"m250 5l-44 0l-62-538q-5-33-12-53q-7-19-22-28q-16-9-44-9l5-34l268 0l-5 34q-37 0-60 15q-23 14-21 54q0 5 1 17q1 11 2 17l30 270l7 111l6 0l61-91l205-306q12-16 20-32q9-17 9-29q0-15-13-20q-13-6-45-6l5-34l218 0l-5 34q-20 0-36 4q-16 5-31 17q-15 13-34 37q-19 24-47 64z"],"X":[642,"m601 0l-289 0l7-33l9 0q32 0 48-10q17-9 17-29q0-12-5-29q-5-16-15-42l-40-92l-23-63l-14-19l-106-226q-15-31-27-49q-11-17-29-24q-17-7-51-7l7-34l284 0l-7 34l-11 0q-30 0-45 8q-14 7-14 27q0 17 12 44q12 27 24 57l39 102l13 18l133 273q17 35 36 47q18 12 54 14zm-429 0l-228 0l6-33q25-1 42-7q18-7 37-23q19-16 47-44l224-229l26 50l-15 0l-150 161q-8 8-18 20q-11 12-18 24q-8 12-8 22q0 13 13 19q12 7 49 7zm388-532-178 182-25-46l14 0l128-141q18-21 29-36q12-15 12-28q0-11-11-16q-11-6-45-6l7-34l232 0l-6 34q-32 2-53 9q-22 8-45 27q-22 18-59 55z"]}};
const KERN: Record<string, Record<string, number>> = {"b":{" V":-20," X":-10,"V ":-20,"X ":-10,"V.":-100},"i":{" V":-20," X":-10,"V ":-20,"V.":-90,"X ":-10}};
// 随包样片（S110）没有素材 ID：prepare.py --sample 把本幕用到的底图以 data URI 内联在这里；制作任务里为空。
const MEDIA: Record<string, string> = {"broadway":"release-assets/1b5c22eaa7432401794b8156846257f96f68e7b4a1ae1ebc28b2409b115bb5cb.webp","jeweler":"release-assets/38fac18bf9cb05988d0af58ad81295b77904d4aa56bb929902ac2f079bc8518f.webp"};
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
/** 闪光：四角星，at 起亮 len 秒（twinkle）。 */
function Sparkle({x, y, size, t, at, len = .7, color = '#fffbe8'}: {x: number; y: number; size: number; t: number; at: number; len?: number; color?: string}) {
  const d = (t - at) / len;
  if (d <= 0 || d >= 1) return null;
  const e = Math.sin(Math.PI * d), s = size * (.3 + .7 * e), a = s * .16;
  return <g transform={`translate(${x} ${y}) rotate(${d * 40})`} opacity={e} style={{filter: 'drop-shadow(0 0 8px rgba(255,240,200,.9))'}}>
    <path d={`M0 ${-s} L${a} ${-a} L${s} 0 L${a} ${a} L0 ${s} L${-a} ${a} L${-s} 0 L${-a} ${-a} Z`} fill={color} />
    <circle r={a * 1.6} fill={color} />
  </g>;
}
/** 一串闪光点：pts 上按 period 轮流闪，seed 错开相位。 */
function Glints({pts, t, from, size = 26, period = 1.6, seed = 1}: {pts: number[][]; t: number; from: number; size?: number; period?: number; seed?: number}) {
  const r = seeded(seed), phase = pts.map(() => r() * period);
  return <>{pts.map((p, i) => {
    if (t < from + phase[i] * .4) return null;
    const local = ((t - from - phase[i]) % period + period) % period;
    return <Sparkle key={i} x={p[0]} y={p[1]} size={size * (.7 + .5 * ((i * 37) % 10) / 10)} t={local} at={0} len={.6} />;
  })}</>;
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
/** 沿折线排表链环：pts 为控制点；p 揭示进度（从头到尾）；shine 为高光沿链跑到的位置 0→1。 */
function ChainLinks({pts, link = 28, p = 1, shine = -1, opacity = 1, width = 5}: {pts: number[][]; link?: number; p?: number; shine?: number; opacity?: number; width?: number}) {
  if (p <= 0 || opacity <= 0) return null;
  const seg: number[] = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = seg[seg.length - 1], count = Math.floor(total / link), links: any[] = [];
  for (let k = 0; k <= count * clamp(p); k++) {
    const d = k * link;
    let j = 1; while (j < seg.length - 1 && seg[j] < d) j++;
    const q = (d - seg[j - 1]) / Math.max(1e-6, seg[j] - seg[j - 1]);
    const x = mix(pts[j - 1][0], pts[j][0], q), y = mix(pts[j - 1][1], pts[j][1], q);
    const ang = Math.atan2(pts[j][1] - pts[j - 1][1], pts[j][0] - pts[j - 1][0]) * 180 / Math.PI;
    const lit = shine >= 0 ? Math.exp(-Math.pow((k / Math.max(1, count) - shine) * 9, 2)) : 0;
    links.push(<g key={k} transform={`translate(${x} ${y}) rotate(${ang})`}>
      {k % 2 === 0 ? <ellipse rx={link * .62} ry={link * .34} fill="none" stroke="url(#pt)" strokeWidth={width} />
        : <rect x={-link * .6} y={-width * .55} width={link * 1.2} height={width * 1.1} rx={width * .55} fill="url(#pt)" />}
      {lit > .05 && <ellipse rx={link * .5} ry={link * .3} fill={`rgba(255,255,255,${.85 * lit})`} style={{filter: 'blur(3px)'}} />}
    </g>);
  }
  return <g opacity={opacity} style={{filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.6))'}}>{links}</g>;
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


// 两小时找礼物：百老汇街景横摇，左上角怀表两小时飞转；念到“found”切到珠宝店橱窗，白金表链一节节亮起；
// “Twenty-one dollars”价卡写上 $21，右上角钱数从 $21.87 落到 $0.87。
export const meta = {
  title: 'The platinum chain',
  params: {
    foundCue: {label: '切到橱窗的卡点词', type: 'text', default: 'found', maxLength: 24},
    price: {label: '价卡', type: 'text', default: '$21', maxLength: 8},
    priceCue: {label: '价卡卡点词', type: 'text', default: 'twenty-one', maxLength: 24},
    before: {label: '买前金额', type: 'number', default: 21.87, min: 0, max: 999, step: .01},
    after: {label: '买后金额', type: 'number', default: 0.87, min: 0, max: 999, step: .01},
    leftCue: {label: '余额卡点词', type: 'text', default: 'eighty-seven', maxLength: 24},
    hours: {label: '怀表转过的小时数', type: 'number', default: 2, min: 0, max: 12, step: 1},
  },
  slots: {broadway: '圣诞前夜的购物街，Della 在右边赶路', jeweler: '珠宝店橱窗里的白金表链，右侧有一张空白价卡'},
};
const CHAIN = [[742, 520], [790, 528], [810, 570], [770, 610], [742, 650], [770, 690], [850, 705], [930, 690], [1000, 660], [1040, 610], [1000, 560], [960, 530], [1010, 515], [1100, 530], [1180, 540], [1260, 530], [1320, 520]];
export default function Search(props: SceneInput) {
  const {t, at, start, dur} = cues(props);
  const found = at(txt(props, 'foundCue'), start(1, 3)) - .1, priceT = at(txt(props, 'priceCue'), start(2, found + 2.5)), left = at(txt(props, 'leftCue'), start(3, priceT + 1.4));
  const hours = Number(props.params.hours ?? 2);
  const spin = clamp(t / Math.max(.5, found - .1)), clockM = 60 * hours * easeInOut(spin);
  const inWindow = t >= found;
  const money = t < priceT + .2 ? Number(props.params.before ?? 21.87) : mix(Number(props.params.before ?? 21.87), Number(props.params.after ?? .87), out3((t - priceT - .2) / .8));
  const shine = inWindow ? clamp((t - found - .2) / 1.4) : -1;
  return <div style={{position: 'absolute', inset: 0, background: INK, overflow: 'hidden', opacity: fadeEdges(t, dur, .05, .15)}}>
    {!inWindow ? <>
      <Stage k={t / found} from={[1.14, 150, 10]} to={[1.14, -150, 0]}>
        <Plate asset={slot(props, 'broadway')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
        <Glow x={935} y={150} r={170} t={t} amount={.6} seed={4} />
        <Glow x={535} y={350} r={90} t={t} amount={.5} seed={6} />
      </Stage>
      <Snow frame={props.frame} amount={1} wind={-90} seed={14} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,16,.7) 0%, rgba(8,8,16,0) 26%)'}} />
      <Svg><Defs /><Clock cx={210} cy={250} r={120} h={2 + Math.floor(clockM / 60)} m={clockM % 60} s={(clockM * 60) % 60} kind="pocket" opacity={sm(t / .3)} /></Svg>
    </> : <>
      <Stage k={(t - found) / (dur - found)} from={[1.0, 0, 0]} to={[1.16, -40, -40]} origin="55% 58%">
        <Plate asset={slot(props, 'jeweler')} frame={props.frame} p={0} from={[1, 0, 0]} to={[1, 0, 0]} />
        <Glow x={392} y={300} r={210} t={t} amount={.7} seed={7} />
        <Glow x={1030} y={600} r={420} t={t} amount={.35 * sm((t - found) / .6)} color="235,240,255" seed={9} />
        <Svg><Defs />
          <ChainLinks pts={CHAIN} link={30} p={1} shine={shine} opacity={.0001 + .55 * win(t, found + .1, found + 1.8, .4)} width={4} />
          <Glints pts={[[770, 560], [930, 690], [1040, 610], [1200, 540], [800, 700], [1310, 520]]} t={t} from={found + .2} size={34} period={1.4} seed={3} />
          <g transform="translate(1320 676) rotate(-2)">
            <Type id="pc" text={txt(props, 'price')} x={0} y={18} size={64} align="middle" fill="#2a1a10" face="i" shadow={false} p={(t - priceT) / .55} mode="wipe" maxWidth={240} />
          </g>
        </Svg>
      </Stage>
      <Snow frame={props.frame} amount={.35} wind={-20} seed={15} />
    </>}
    {inWindow && t - found < .12 && <div style={{position: 'absolute', inset: 0, background: `rgba(255,248,230,${.7 * (1 - (t - found) / .12)})`}} />}
    <Svg><Defs /><Money id="ms" value={money} x={1820} y={150} size={92} t={t} bumpAt={left} align="end" /></Svg>
    <Finish vignette={.5} />
  </div>;
}
