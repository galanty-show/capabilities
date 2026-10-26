# S119 · 人类走到 80 亿 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Charon（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Eight Billion（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "用约两分钟做一支横版数据新闻短片《人类走到 80 亿》：画面全部用代码绘制（点阵人口场、滚动计数器、每多十亿越来越短的柱子、增长率峰值、预测区间扇形），数据取自联合国《世界人口展望 2024》并写清出处，从一个点讲到八十亿再回到“你”。配沉稳的云端配音和极简电子配乐，在增长率下降处转折；先即时播放，满意再导出 MP4。",
  "en": "Make a two-minute 16:9 data-journalism short, “Humanity Reaches 8 Billion”, drawn entirely in code (a dot field of people, rolling counters, ever-shorter bars for each new billion, the growth-rate peak and a projection fan), with sourced UN World Population Prospects 2024 figures, going from one dot to eight billion and back to “you”. Use a calm cloud voice and minimal electronic music that turns where growth slows; show a live preview first and export the MP4 once I'm happy.",
  "zh-Hant": "用約兩分鐘做一支橫版數據新聞短片《人類走到 80 億》：畫面全部用程式碼繪製（點陣人口場、滾動計數器、每多十億越來越短的柱子、成長率峰值、預測區間扇形），數據取自聯合國《世界人口展望 2024》並寫清出處，從一個點講到八十億再回到「你」。配沉穩的雲端配音與極簡電子配樂，在成長率下降處轉折；先即時播放，滿意再匯出 MP4。",
  "ja": "約2分の横長データジャーナリズム短編『人類は80億人へ』を、映像はすべてコードで描き（人口の点の場、回るカウンター、10億ごとに短くなる棒、増加率のピーク、予測幅の扇形）、国連『世界人口推計2024』の数字に出典を付けて、1つの点から80億、そして「あなた」へ戻る構成で作ってください。落ち着いたクラウド音声と、増加率が下がるところで転じるミニマルな電子音楽を使い、まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 2분짜리 가로형 데이터 저널리즘 숏폼 「인류, 80억에 이르다」를 화면 전부 코드로 그려 만들어 주세요(인구 점 필드, 굴러가는 카운터, 10억마다 짧아지는 막대, 증가율 정점, 예측 범위 부채꼴). 유엔 「세계 인구 전망 2024」 수치를 출처와 함께 쓰고, 점 하나에서 80억, 다시 ‘당신’으로 돌아오게 해 주세요. 차분한 클라우드 음성과 증가율이 꺾이는 곳에서 전환되는 미니멀 전자음악을 쓰고, 먼저 실시간 미리보기로 보여 준 뒤 마음에 들면 MP4로 내보내 주세요.",
  "es": "Haz un corto horizontal de periodismo de datos de unos dos minutos, «La humanidad llega a 8000 millones», dibujado todo en código (campo de puntos de población, contadores que ruedan, barras cada vez más cortas por cada mil millones, el pico del crecimiento y un abanico de proyección), con cifras de las Perspectivas de la Población Mundial 2024 de la ONU y sus fuentes, de un punto a ocho mil millones y de vuelta a «ti». Usa una voz en la nube serena y música electrónica mínima que gire donde cae el crecimiento; muéstramelo primero en vista previa y exporta el MP4 cuando me guste.",
  "de": "Mach einen etwa zweiminütigen Datenjournalismus-Kurzfilm im Querformat, „Die Menschheit erreicht 8 Milliarden“, komplett in Code gezeichnet (Punktfeld der Bevölkerung, rollende Zähler, immer kürzere Balken pro Milliarde, der Gipfel der Wachstumsrate und ein Prognosefächer), mit belegten Zahlen aus den UN World Population Prospects 2024, vom einzelnen Punkt zu acht Milliarden und zurück zu „dir“. Nutze eine ruhige Cloud-Stimme und minimalistische Elektronik, die dort umschlägt, wo das Wachstum sinkt; zeig mir zuerst die Live-Vorschau und exportiere die MP4 erst, wenn ich zufrieden bin.",
  "fr": "Réalisez un court métrage de journalisme de données d'environ deux minutes au format paysage, « L'humanité atteint 8 milliards », entièrement dessiné en code (champ de points de population, compteurs défilants, barres de plus en plus courtes pour chaque milliard, pic du taux de croissance, éventail de projection), avec des chiffres sourcés des Perspectives de la population mondiale 2024 de l'ONU, d'un point à huit milliards puis retour à « vous ». Utilisez une voix cloud posée et une musique électronique minimale qui bascule quand la croissance ralentit ; montrez-moi d'abord l'aperçu en direct, puis exportez le MP4.",
  "pt-BR": "Faça um curta horizontal de jornalismo de dados de cerca de dois minutos, “A humanidade chega a 8 bilhões”, todo desenhado em código (campo de pontos da população, contadores rolando, barras cada vez mais curtas a cada bilhão, o pico do crescimento e um leque de projeção), com números das Perspectivas da População Mundial 2024 da ONU e suas fontes, de um ponto a oito bilhões e de volta a “você”. Use uma voz na nuvem calma e trilha eletrônica mínima que vira quando o crescimento cai; mostre uma prévia ao vivo e exporte o MP4 quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 联网核对联合国人口数据，编写 10 个 SVG/Canvas 幕模块，没有生成图片。
- 试听后选 Charon，逐句转拼音校验，并以听评代理检查音色与混音。
- Lyria 三版选一版，按实测 104 BPM 小节剪辑，NumPy 合成音效。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 175 条，账面合计 US$0.4330；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 另一语言配音与校验另有 168 条账面 US$0.1005，与原制作分开记。

## 踩坑与验证边界

- 整片约 −18.6 LUFS；盲目提高配乐会遮住旁白，因此没有仅为响度目标继续加音乐。

## 依据

- 公开包内 prompt.json：S119 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：code-population-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 另一语言保留档案标识：code-population-20261013-i18n / cost-ledger.jsonl。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
