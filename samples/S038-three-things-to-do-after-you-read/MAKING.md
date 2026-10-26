# S038 · 读完之后，留下三个动作 · 制作记录

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
  "zh-CN": "做一支约 44 秒的横版（16:9）读书笔记短片：读完一段内容后留下三个动作——写下真正想追问的问题、比较两条线索、选一件明天就能做的小事。画面像便签一张张贴上来，女声旁白，节奏从容，配一段平稳的底乐。内容全部原创，不引用真实书名和原文。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 44-second 16:9 landscape reading-notes short: after finishing a passage, leave yourself three actions — write down the question you really want to ask, compare two threads, and pick one small thing you can try tomorrow. Stick the notes on screen one by one like sticky notes, with an unhurried female voiceover over a steady bed. Keep it fully original, with no real book titles or quotations. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 44 秒的橫版（16:9）讀書筆記短片：讀完一段內容後留下三個動作——寫下真正想追問的問題、比較兩條線索、選一件明天就能做的小事。畫面像便利貼一張張貼上來，女聲旁白，節奏從容，配一段平穩的背景音樂。內容全部原創，不引用真實書名和原文。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約44秒の横長（16:9）の読書メモのショート動画を作ってください。ある一節を読み終えたあとに残す3つのアクション、「本当に聞きたい問いを書き出す」「2つの手がかりを比べる」「明日すぐできる小さなことを1つ選ぶ」を紹介します。付箋を1枚ずつ貼っていくような画面にし、女性のナレーションでゆったりと、落ち着いたBGMを合わせてください。内容はすべてオリジナルにして、実在の書名や本文は引用しないでください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 44초 길이의 가로형(16:9) 독서 노트 영상을 만들어 주세요. 한 대목을 다 읽은 뒤 스스로에게 남기는 세 가지 행동, 정말 묻고 싶은 질문 적기, 두 가지 실마리 비교하기, 내일 바로 해 볼 작은 일 하나 고르기를 다뤄요. 메모가 포스트잇처럼 한 장씩 화면에 붙게 하고, 차분한 배경 음악 위에 여유 있는 여성 내레이션을 깔아 주세요. 내용은 모두 창작으로 하고, 실제 책 제목이나 원문은 인용하지 마세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo corto de notas de lectura de unos 44 segundos en formato horizontal 16:9. Al terminar un fragmento, déjate tres acciones: apuntar la pregunta que de verdad quieres hacer, comparar dos hilos y elegir una cosa pequeña que puedas probar mañana. Pega las notas en pantalla una a una como pósits, con una narración femenina pausada sobre una base estable. Que sea totalmente original, sin títulos de libros reales ni citas. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 44 Sekunden langes Kurzvideo im Querformat (16:9) mit Lesenotizen: Nach einem Textabschnitt nimmst du dir drei Dinge vor – die Frage aufschreiben, die du wirklich stellen willst, zwei Gedankenstränge vergleichen und eine Kleinigkeit auswählen, die du morgen ausprobieren kannst. Klebe die Notizen nacheinander wie Haftzettel auf den Bildschirm, mit einer ruhigen Sprecherin und gleichmäßiger Hintergrundmusik. Alles komplett eigenständig, ohne echte Buchtitel oder Zitate. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une courte vidéo d'environ 44 secondes au format paysage (16:9) sur des notes de lecture : après avoir lu un passage, on se laisse trois actions – noter la question qu'on veut vraiment poser, comparer deux pistes, et choisir une petite chose à essayer dès demain. Collez les notes à l'écran une à une comme des post-it, avec une voix off féminine posée sur un fond musical régulier. Le contenu doit être entièrement original, sans titres de livres réels ni citations. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo curto de cerca de 44 segundos na horizontal (16:9) sobre anotações de leitura: depois de terminar um trecho, deixe para você mesmo três ações — anotar a pergunta que você realmente quer fazer, comparar duas pistas e escolher uma coisinha que dá para testar amanhã. Cole as anotações na tela uma a uma, como post-its, com uma narração feminina sem pressa sobre uma música de fundo constante. Mantenha tudo original, sem títulos de livros reais nem citações. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 未找到可归属本片的独立踩坑记录。

## 依据

- 公开包内 prompt.json：S038 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
