# S048 · 江灯四景 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：自动配乐（本地）
- 配乐/音效：随包曲库 · Chinese Classical 72（本地）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 32 秒的横版（16:9）诗词文字短片：原创四段短诗，分别写傍晚的渡口、月下的河岸、夜里读书和清晨归人，贯穿其中的是江上的一盏灯。每段一幕，文字逐句浮现，留白多、节奏慢，女声吟读，配乐按“诗词”自动挑选。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 32-second 16:9 landscape poetry-in-type short: write four original short verses — a ferry crossing at dusk, a riverbank under the moon, reading late at night, a traveler coming home at dawn — tied together by a single lamp on the river. One verse per scene, lines surfacing one at a time with lots of empty space and a slow pace, a female reading, and music picked automatically for poetry. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 32 秒的橫版（16:9）詩詞文字短片：原創四段短詩，分別寫傍晚的渡口、月下的河岸、夜裡讀書和清晨歸人，貫穿其中的是江上的一盞燈。每段一幕，文字逐句浮現，留白多、節奏慢，女聲吟讀，配樂依「詩詞」自動挑選。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約32秒の横長（16:9）の、文字で見せる詩の動画を作ってください。夕暮れの渡し場、月下の川岸、夜の読書、明け方に帰ってくる旅人を詠んだオリジナルの短い詩を4編書き、そのすべてを川に灯る一つの明かりでつないでください。1編につき1シーンで、文字は1行ずつ浮かび上がらせ、余白を多く、テンポはゆっくりにし、女性の声で朗読、BGMは「詩」として自動で選ばせてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 32초 길이의 가로형(16:9) 시 글자 영상을 만들어 주세요. 해 질 녘 나루터, 달빛 아래 강둑, 밤에 책 읽기, 새벽에 돌아오는 나그네를 담은 짧은 창작시 네 편을 쓰고, 강 위의 등불 하나가 네 편을 하나로 이어 주게 해 주세요. 한 편에 한 장면씩, 글자는 한 줄씩 떠오르게 하고 여백은 넉넉히, 템포는 느리게 해 주세요. 여성 목소리로 읊고, 배경 음악은 ‘시’에 맞춰 자동으로 고르게 해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo corto de poesía tipográfica de unos 32 segundos en formato horizontal 16:9: escribe cuatro poemas breves originales —un embarcadero al atardecer, una orilla bajo la luna, leer de noche, un viajero que vuelve al amanecer— unidos por un solo farol sobre el río. Un poema por escena, con los versos apareciendo uno a uno, mucho espacio vacío y un ritmo lento, una lectura con voz femenina y música elegida automáticamente para poesía. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 32 Sekunden langes Kurzvideo im Querformat (16:9) mit Poesie in Schrift: Schreib vier kurze, eigene Strophen – eine Fähre in der Abenddämmerung, ein Flussufer im Mondlicht, Lesen spät in der Nacht, ein Reisender, der im Morgengrauen heimkehrt –, verbunden durch eine einzige Lampe auf dem Fluss. Eine Strophe pro Szene, die Zeilen tauchen einzeln auf, mit viel Leerraum und langsamem Tempo, eine Sprecherin liest, und die Musik wird automatisch passend für Poesie ausgewählt. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une courte vidéo d'environ 32 secondes au format paysage (16:9) de poésie en typographie : écrivez quatre courtes strophes originales – un bac au crépuscule, une berge sous la lune, une lecture tard dans la nuit, un voyageur qui rentre à l'aube –, reliées par une seule lampe sur le fleuve. Une strophe par scène, les vers apparaissent un à un, avec beaucoup d'espace vide et un rythme lent, une lecture par une voix féminine, et une musique choisie automatiquement pour de la poésie. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo curto de poesia em letras de cerca de 32 segundos na horizontal (16:9): escreva quatro estrofes curtas e originais — uma travessia de balsa ao entardecer, a margem de um rio sob a lua, uma leitura tarde da noite, um viajante voltando para casa ao amanhecer — ligadas por uma única lamparina no rio. Uma estrofe por cena, versos surgindo um de cada vez, com muito espaço vazio e ritmo lento, leitura em voz feminina e música escolhida automaticamente para poesia. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 公开包内 prompt.json：S048 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
