# S049 · 桥边书屋模拟周报 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：自动配乐（本地）
- 配乐/音效：随包曲库 · Minimal Electronic 100（本地）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 29 秒的横版（16:9）模拟数据周报：用虚构的书屋借阅数据，先给结论和统计口径（本周借出 84 本），再看到访、借书、归还三个维度，指出周三的峰值但不乱猜原因，最后写清限制和下一步。指标卡和要点交替出现，女声旁白，配乐按“周报数据”自动挑选。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 29-second 16:9 landscape mock weekly data report from a fictional community reading room: open with the headline and how it was counted (84 books lent this week), then look at visitors, borrowers and returns, point out the Wednesday peak without guessing at causes, and close with the limits and next step. Alternate metric cards and key points, female voiceover, and music picked automatically for a weekly data report. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 29 秒的橫版（16:9）模擬數據週報：用虛構的書屋借閱數據，先給結論和統計方式（本週借出 84 本），再看到訪、借書、還書三個面向，指出週三的高峰但不亂猜原因，最後寫清楚限制和下一步。指標卡和重點交替出現，女聲旁白，配樂依「週報數據」自動挑選。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "架空の小さな図書館の貸出データを使った、約29秒の横長（16:9）の模擬データ週報動画を作ってください。最初に結論と集計方法（今週の貸出は84冊）を示し、次に来訪・貸出・返却の3つの観点で見て、水曜日のピークを指摘しつつ原因を勝手に推測せず、最後に限界と次のステップをはっきり書いてください。指標カードと要点を交互に見せ、女性のナレーションで、BGMは「データ週報」として自動で選ばせてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 29초 길이의 가로형(16:9) 모의 주간 데이터 리포트 영상을 만들어 주세요. 가상의 동네 독서 공간 대출 데이터로, 먼저 결론과 집계 기준(이번 주 대출 84권)을 밝히고, 이어서 방문, 대출, 반납 세 가지 측면을 살펴본 뒤, 수요일에 정점이 있었다는 점을 짚되 원인은 함부로 추측하지 말고, 마지막에 한계와 다음 단계를 정리해 주세요. 지표 카드와 핵심 포인트를 번갈아 보여 주고, 여성 내레이션에 배경 음악은 ‘주간 데이터’에 맞춰 자동으로 고르게 해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un informe semanal de datos simulado de unos 29 segundos en formato horizontal 16:9 a partir de una biblioteca vecinal ficticia: abre con la conclusión y cómo se contó (84 libros prestados esta semana), luego revisa visitas, préstamos y devoluciones, señala el pico del miércoles sin especular sobre las causas y cierra con las limitaciones y el siguiente paso. Alterna tarjetas de métricas y puntos clave, con narración de voz femenina y música elegida automáticamente para un informe semanal de datos. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 29 Sekunden langes simuliertes Wochen-Datenvideo im Querformat (16:9) über einen fiktiven Leseraum: Beginne mit der Kernaussage und der Zählweise (84 verliehene Bücher diese Woche), schau dir dann Besucher, Ausleihen und Rückgaben an, zeig die Spitze am Mittwoch, ohne über Ursachen zu spekulieren, und schließe mit den Grenzen und dem nächsten Schritt. Wechsle zwischen Kennzahlenkarten und Kernpunkten, mit einer Sprecherin und automatisch passend für einen Daten-Wochenbericht ausgewählter Musik. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez un faux bilan hebdomadaire en données d'environ 29 secondes au format paysage (16:9) pour un espace de lecture fictif : ouvrez sur le chiffre clé et la méthode de comptage (84 livres prêtés cette semaine), puis examinez les visiteurs, les emprunts et les retours, signalez le pic du mercredi sans spéculer sur ses causes, et terminez par les limites et la prochaine étape. Alternez cartes de chiffres clés et points clés, avec une voix off féminine et une musique choisie automatiquement pour un bilan hebdomadaire en données. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um relatório semanal de dados simulado de cerca de 29 segundos na horizontal (16:9) para uma pequena biblioteca de bairro fictícia: abra com a conclusão e com a forma de contagem (84 livros emprestados nesta semana), depois olhe para visitantes, empréstimos e devoluções, aponte o pico de quarta-feira sem chutar as causas e feche com os limites e o próximo passo. Alterne cartões de métricas e pontos-chave, narração com voz feminina e música escolhida automaticamente para relatório semanal de dados. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

逐轮原话：未记录。

## 步骤

- Agent 撰写原创短文、分镜以及情绪、能量、速度等配乐意图，画面代码复用随包模板。
- 工作台根据配乐意图与题材自动选择随包曲目，原版旁白使用 macOS Tingting。
- 历史元数据记载 10-05 起改用本地 Qwen3-TTS 0.6B 预生成旁白；当前公开包的种子另见 CREDITS.md。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 未找到可归属本片的独立踩坑记录。

## 依据

- 公开包内 prompt.json：S049 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
