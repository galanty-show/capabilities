# S125 · 栖光 2 · 发布预告 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Qiguang Teaser（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 16 秒的暗场发布预告：一只金属圆环在黑暗里慢慢转，五句短句从中间向两边逐字对焦，最后品牌落版，不要旁白。先即时播放给我看。",
  "en": "Make a 16-second dark release teaser: a metal ring turns slowly in the dark, five short lines focus in letter by letter from the center out, then the brand lockup, no voiceover. Show me a live preview first.",
  "zh-Hant": "做一支約 16 秒的暗場發布預告：金屬圓環在黑暗中慢慢轉，五句短句從中間向兩邊逐字對焦，最後品牌落版，不要旁白。先即時播放給我看。",
  "ja": "約16秒の暗いリリースティザーを作って。金属のリングが暗闇でゆっくり回り、5つの短文が中央から一文字ずつピントが合い、最後にブランドロゴ。ナレーションなし。まずライブ再生で見せて。",
  "ko": "약 16초 어두운 출시 티저를 만들어 줘. 금속 링이 어둠 속에서 천천히 돌고, 짧은 문장 다섯 개가 가운데서 바깥으로 한 글자씩 초점이 맞고, 마지막에 브랜드 로고. 내레이션 없이. 먼저 실시간 재생으로 보여 줘.",
  "es": "Haz un teaser oscuro de lanzamiento de unos 16 s: un anillo metálico gira despacio en la oscuridad, cinco frases cortas se enfocan letra a letra desde el centro y cierra con la marca, sin locución. Muéstrame primero la vista previa en vivo.",
  "de": "Erstelle einen etwa 16 Sekunden langen dunklen Release-Teaser: Ein Metallring dreht sich langsam im Dunkeln, fünf kurze Sätze werden von der Mitte aus Zeichen für Zeichen scharf, am Ende das Markenlogo, ohne Sprecher. Zeig mir zuerst die Live-Vorschau.",
  "fr": "Réalise un teaser de lancement sombre d'environ 16 s : un anneau métallique tourne lentement dans le noir, cinq phrases courtes se précisent lettre par lettre depuis le centre, puis le logo, sans voix off. Montre-moi d'abord l'aperçu en direct.",
  "pt-BR": "Faça um teaser escuro de lançamento de cerca de 16 s: um anel metálico gira devagar no escuro, cinco frases curtas entram em foco letra a letra a partir do centro e fecha com a marca, sem narração. Mostre primeiro a prévia ao vivo."
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

- 原仓库多入口、路径别名与字体加载曾阻碍直接打开，制作时抽为独立工程并去掉字体包；后续兼容修复另记。

## 依据

- 公开包内 prompt.json：S125 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：github-remotion-20261013 / README.md；组 cost-ledger.jsonl。
- 修复档案标识：1.0.1 上线后修复 / 外部 Remotion 兼容修复。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
