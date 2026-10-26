# S040 · 虚构阅读角周报 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：随包曲库 · Calm Current 78（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 49 秒的横版（16:9）数据周报：用一组虚构的阅读角数据，对比本周和前周的到访、借出和活动参与，再用柱状图展示七天的到访分布（合计 84 次）。先讲清统计口径，单位不同的指标分开比较，不从数据里推断原因。大字标题、指标卡和柱状图交替出现，女声旁白，配一段平稳的底乐。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 49-second 16:9 landscape weekly data report from a made-up reading corner: compare this week with last week on visits, loans and event attendance, then show the daily visits across seven days in a bar chart (84 in total). State how things were counted first, compare metrics with different units separately, and don't read causes into the numbers. Alternate big headlines, metric cards and the bar chart, with female voiceover over a steady bed. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 49 秒的橫版（16:9）數據週報：用一組虛構的閱讀角數據，對比本週和上週的到訪、借出和活動參與，再用長條圖呈現七天的到訪分布（合計 84 次）。先講清楚統計方式，單位不同的指標分開比較，不從數據裡推斷原因。大字標題、指標卡和長條圖交替出現，女聲旁白，配一段平穩的背景音樂。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約49秒の横長（16:9）のデータ週報動画を作ってください。架空の読書コーナーのデータを使い、来訪数・貸出数・イベント参加数を今週と先週で比べたうえで、7日間の来訪数の内訳を棒グラフで見せてください（合計84回）。最初に集計方法をはっきり説明し、単位の違う指標は別々に比べ、データから原因を推測しないでください。大見出し、指標カード、棒グラフを交互に見せ、女性のナレーションに落ち着いたBGMを合わせてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 49초 길이의 가로형(16:9) 주간 데이터 리포트 영상을 만들어 주세요. 가상의 독서 코너 데이터로 이번 주와 지난주의 방문, 대출, 행사 참여를 비교하고, 7일간의 방문 분포를 막대그래프로 보여 주세요(합계 84회). 먼저 집계 기준을 밝히고, 단위가 다른 지표는 따로 비교하며, 숫자에서 원인을 추측하지 마세요. 큰 제목, 지표 카드, 막대그래프를 번갈아 보여 주고, 차분한 배경 음악 위에 여성 내레이션을 깔아 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un informe semanal de datos de unos 49 segundos en formato horizontal 16:9 a partir de un rincón de lectura inventado: compara esta semana con la anterior en visitas, préstamos y asistencia a actividades, y luego muestra en un gráfico de barras las visitas diarias de los siete días (84 en total). Explica primero cómo se contó todo, compara por separado las métricas con unidades distintas y no deduzcas causas de las cifras. Alterna titulares grandes, tarjetas de métricas y el gráfico de barras, con narración femenina sobre una base estable. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 49 Sekunden langes Wochen-Datenvideo im Querformat (16:9) über eine erfundene Leseecke: Vergleiche diese Woche mit der letzten bei Besuchen, Ausleihen und Teilnahme an Veranstaltungen und zeig dann die täglichen Besuche über sieben Tage als Balkendiagramm (insgesamt 84). Erkläre zuerst, wie gezählt wurde, vergleiche Kennzahlen mit unterschiedlichen Einheiten getrennt und lies keine Ursachen in die Zahlen hinein. Wechsle zwischen großen Schlagzeilen, Kennzahlenkarten und dem Balkendiagramm, mit einer Sprecherin und gleichmäßiger Hintergrundmusik. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez un bilan hebdomadaire en données d'environ 49 secondes au format paysage (16:9) pour un coin lecture imaginaire : comparez cette semaine à la précédente pour les visites, les prêts et la participation aux animations, puis montrez les visites quotidiennes sur sept jours dans un diagramme en barres (84 au total). Expliquez d'abord comment les données ont été comptées, comparez séparément les indicateurs d'unités différentes, et ne tirez aucune cause des chiffres. Alternez grands titres, cartes de chiffres clés et diagramme en barres, avec une voix off féminine sur un fond musical régulier. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um relatório semanal de dados de cerca de 49 segundos na horizontal (16:9) sobre um cantinho de leitura inventado: compare esta semana com a anterior em visitas, empréstimos e participação em atividades, e depois mostre as visitas de cada um dos sete dias num gráfico de barras (84 no total). Explique primeiro como os dados foram contados, compare separadamente as métricas com unidades diferentes e não tire conclusões sobre causas a partir dos números. Alterne títulos em letras grandes, cartões de métricas e o gráfico de barras, com narração em voz feminina sobre uma música de fundo constante. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

逐轮原话：未记录。

## 步骤

- Agent 直接撰写文案、分镜与原创幕代码，没有调用工作台内置编稿。
- 手选随包底乐，以 macOS Tingting 生成原版旁白，本地渲染并查看抽帧后返工。
- 历史元数据记载 10-05 起样片库改用本地 Qwen3-TTS 0.6B 预生成旁白；这次更换与当前公开包种子需分开核对。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 样片目录原有的时长估计偏短；后续旁白实测片长约 61.5 秒，这不是制作耗时。

## 依据

- 公开包内 prompt.json：S040 的 tools 与 basis 制作来历元数据。
- 修复档案标识：1.0.1 上线后修复 / 样片时长校正。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
