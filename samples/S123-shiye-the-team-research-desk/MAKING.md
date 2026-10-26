# S123 · 拾页 · 团队研究台 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Ink Press Morning（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 36 秒的横版纸墨风产品宣传片，介绍一个团队研究台：字标压印开场、项目卡飞入网格、搜索打开详情、论文雷达和周报，界面全部用代码画，不要旁白。先即时播放给我看，满意再导出。",
  "en": "Make a 36-second landscape paper-and-ink product promo for a team research desk: a stamped wordmark, project cards dealt into a grid, search into a detail page, a paper radar and a weekly brief, all UI drawn in code, no voiceover. Preview live first; export once I'm happy.",
  "zh-Hant": "做一支約 36 秒的橫版紙墨風產品宣傳片，介紹一個團隊研究台：字標壓印開場、專案卡飛入網格、搜尋開啟詳情、論文雷達與週報，介面全用程式碼畫，不要旁白。先即時播放，滿意再匯出。",
  "ja": "チーム研究ツールを紹介する約36秒・横長の紙とインク調プロモを作って。ロゴの刻印、カードの整列、検索と詳細、論文レーダーと週報をすべてコードで描き、ナレーションなし。まずライブ再生で確認し、納得したら書き出して。",
  "ko": "팀 연구 도구를 소개하는 약 36초 가로형 종이·잉크 스타일 홍보 영상을 만들어 줘. 로고 각인, 카드가 그리드로 날아드는 장면, 검색과 상세, 논문 레이더와 주간 보고를 모두 코드로 그리고 내레이션은 없이. 먼저 실시간 재생으로 보고 마음에 들면 내보내 줘.",
  "es": "Haz un promo horizontal de unos 36 s en estilo papel y tinta para un espacio de investigación en equipo: logotipo estampado, tarjetas que vuelan a una cuadrícula, búsqueda y detalle, radar de artículos e informe semanal, todo dibujado con código y sin locución. Primero vista previa en vivo; exporta cuando me guste.",
  "de": "Erstelle einen etwa 36 Sekunden langen Querformat-Promo im Papier-und-Tinte-Stil für einen Team-Forschungsarbeitsplatz: gestempeltes Logo, Karten fliegen ins Raster, Suche und Detailseite, Paper-Radar und Wochenbericht – alles in Code gezeichnet, ohne Sprecher. Erst live ansehen, dann exportieren.",
  "fr": "Réalise une promo horizontale d'environ 36 s, style papier et encre, pour un bureau de recherche d'équipe : logo estampé, cartes qui se posent en grille, recherche et page détail, radar d'articles et rapport hebdo, tout dessiné en code, sans voix off. Aperçu en direct d'abord, export ensuite.",
  "pt-BR": "Faça um promo horizontal de cerca de 36 s, estilo papel e tinta, para uma mesa de pesquisa em equipe: logo carimbado, cartões voando para a grade, busca e detalhe, radar de artigos e relatório semanal, tudo desenhado em código, sem narração. Primeiro prévia ao vivo; exporte quando eu aprovar."
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

- 制作时发现播放器音轨池不足、静态资源加载等兼容问题，后续应用修复另记。
- 未带上游来源不能逐项反查的音效与界面截图，改为代码现画与合成音效。

## 依据

- 公开包内 prompt.json：S123 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：github-remotion-20261013 / README.md；组 cost-ledger.jsonl。
- 修复档案标识：1.0.1 上线后修复 / 外部 Remotion 兼容修复。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
