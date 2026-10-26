# S124 · 书架小程序 · 第 12 周迭代回顾 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 配乐/音效：随包曲库 · Minimal Electronic 100（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 33 秒的横版迭代回顾讲解片：标题、本周三件事、手机界面演示、三个数字滚动、深色致谢，界面全部用代码画，按配乐小节切换，不要旁白。先即时播放给我看。",
  "en": "Make a 33-second landscape sprint-review explainer: title, three things done this week, a phone UI demo, three counting numbers and dark credits, all drawn in code and cut on the music's bars, no voiceover. Show me a live preview first.",
  "zh-Hant": "做一支約 33 秒的橫版迭代回顧講解片：標題、本週三件事、手機介面示範、三個數字滾動、深色致謝，介面全用程式碼畫，按配樂小節切換，不要旁白。先即時播放給我看。",
  "ja": "約33秒・横長のスプリントレビュー解説動画を作って。タイトル、今週の3項目、スマホ画面のデモ、3つの数字カウント、ダークなクレジットをコードで描き、曲の小節で切り替え、ナレーションなし。まずライブ再生で見せて。",
  "ko": "약 33초 가로형 스프린트 회고 설명 영상을 만들어 줘. 제목, 이번 주 세 가지, 휴대폰 화면 데모, 숫자 세 개 카운트, 어두운 크레딧을 코드로 그리고 음악 마디에 맞춰 전환, 내레이션 없이. 먼저 실시간 재생으로 보여 줘.",
  "es": "Haz un video explicativo horizontal de unos 33 s de revisión de sprint: título, tres logros de la semana, demo de una app móvil, tres cifras que cuentan y créditos oscuros, todo en código y cortado a los compases, sin locución. Muéstrame primero la vista previa en vivo.",
  "de": "Erstelle ein etwa 33 Sekunden langes Sprint-Review-Erklärvideo im Querformat: Titel, drei Punkte der Woche, Handy-Demo, drei hochzählende Zahlen und dunkler Abspann, alles in Code, auf die Takte geschnitten, ohne Sprecher. Zeig mir zuerst die Live-Vorschau.",
  "fr": "Réalise une vidéo explicative horizontale d'environ 33 s de revue de sprint : titre, trois points de la semaine, démo d'appli mobile, trois chiffres qui défilent et générique sombre, tout en code, coupé sur les mesures, sans voix off. Montre-moi d'abord l'aperçu en direct.",
  "pt-BR": "Faça um vídeo explicativo horizontal de cerca de 33 s de revisão de sprint: título, três entregas da semana, demo de app no celular, três números contando e créditos escuros, tudo em código e cortado nos compassos, sem narração. Mostre primeiro a prévia ao vivo."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 先原地打开上游工程，走播放、批注、交给 Agent 修改、回到原秒数的回路。
- 保留上游许可与运动设计来源，将主题改为虚构产品或团队界面，替换不宜再分发的素材。
- 编写可随样片分发的幕代码，按对应音乐与帧表编译、抽帧、导出。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：S123/S124/S125 共用配乐账本 6 条，账面合计 US$0.48（Lyria，含一次无输出仍计费）；未按单片拆分，不将组费用重复当作单片费用。S123、S125 用原创曲，S124 用既有随包曲；Agent 创作费用与完整 token 总账未记录。

## 踩坑与验证边界

- 上游导入引用越出子工程根，最初复制共享库才能打开；后续应用增加了仓库根识别，历史步骤不应当作当前通用要求。

## 依据

- 公开包内 prompt.json：S124 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：github-remotion-20261013 / README.md；组 cost-ledger.jsonl。
- 修复档案标识：1.0.1 上线后修复 / 外部 Remotion 兼容修复。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
