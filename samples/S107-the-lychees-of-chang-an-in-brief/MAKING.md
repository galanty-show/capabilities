# S107 · 长安的荔枝 · 两分钟讲完 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 视觉素材：Veo 3.1 Fast · veo-3.1-fast-generate-preview（云端）
- 视觉素材：Ma Shan Zheng (SIL OFL 1.1)（本地）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Orus（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Aiden（本地）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Chang'an Lychee（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "用约两分钟讲清《长安的荔枝》的故事，做成横版（16:9）的原创导读：一个小吏被派去把岭南的鲜荔枝运到长安，荔枝几天就坏，他靠算学和驿站接力、换马换人完成了任务，最后说了真话。不搬原文、不用电影画面，节奏要快，故事要清楚。顺便展示软件的方便：同一幕随旁白切换天气、路线反复推演、字幕逐字卡点。用高质量的云端配音，配乐按片子时间轴原创并卡点，需要的底图可以生成。先即时播放给我看，满意了再导出 MP4。",
  "en": "Tell the story of “The Lychee Road” (Chang'an de Lizhi) in about two minutes as an original 16:9 landscape story guide: a minor official is ordered to carry fresh lychees from the far south to the capital, the fruit spoils within days, and he pulls it off with arithmetic and a relay of post stations, swapping horses and riders — then tells the truth about what it cost. Don't copy the novel's text or use any film footage; keep it fast and the story clear. Along the way, show off the tool: the weather in a scene changes with the narration, the route is worked out again and again, and captions hit word by word. Use a high-quality cloud voice and an original score cut to the film's timeline, and generate any background art you need. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "用大約兩分鐘講清楚《長安的荔枝》的故事，做成橫版（16:9）的原創導讀：一個小吏被派去把嶺南的新鮮荔枝運到長安，荔枝幾天就會壞，他靠算學和驛站接力、換馬換人完成了任務，最後說了真話。不照搬原文、不用電影畫面，節奏要快，故事要清楚。順便展示軟體的方便：同一幕隨著旁白切換天氣、路線反覆推演、字幕逐字對準配音。用高品質的雲端配音，配樂依照影片的時間軸原創並卡點，需要的底圖可以生成。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "『長安のライチ』（原題『長安的荔枝』）の物語を約2分でわかりやすく伝える、横長（16:9）のオリジナルのストーリー解説動画を作ってください。下級役人が南方の嶺南から新鮮なライチを都の長安まで運ぶよう命じられ、ライチは数日で傷んでしまいますが、彼は計算と宿駅のリレー、馬と人の乗り継ぎで任務を果たし、最後には本当のことを語ります。原作の文章をそのまま使ったり映画の映像を使ったりせず、テンポよく、話の筋がはっきりわかるようにしてください。あわせてツールの便利さも見せ、同じシーンでナレーションに合わせて天気が変わる、ルートを何度も検討し直す、字幕が音声に合わせて1文字ずつ表示される、といった点を盛り込んでください。高品質なクラウドの音声を使い、BGMは動画のタイムラインに合わせてオリジナルで作ってビートを合わせ、必要な背景画像は生成してかまいません。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "『장안의 리치』(Chang'an de Lizhi) 이야기를 약 2분 안에 분명하게 전하는 가로형(16:9) 창작 해설 영상을 만들어 주세요. 하급 관리가 남쪽 끝 영남의 신선한 리치를 수도 장안까지 옮기라는 명을 받지만 리치는 며칠이면 상해 버리고, 그는 셈법과 역참 릴레이로 말과 사람을 바꿔 가며 임무를 해낸 뒤, 마지막에 그 대가에 대해 진실을 말하는 이야기예요. 원작 문장을 그대로 옮기거나 영화 장면을 쓰지 말고, 템포는 빠르게, 이야기는 분명하게 해 주세요. 내친김에 도구의 편리함도 보여 주세요. 같은 장면에서 내레이션에 따라 날씨가 바뀌고, 경로를 몇 번이고 다시 짜 보고, 자막이 한 글자씩 딱딱 맞아떨어지는 모습이요. 고품질 클라우드 음성을 쓰고, 영상 타임라인에 맞춰 비트를 맞춘 오리지널 음악을 만들고, 필요한 배경 그림은 생성해도 돼요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Cuenta en unos dos minutos la historia de «Los lichis de Chang'an» (Chang'an de Lizhi) como una guía narrativa original en formato horizontal 16:9: un funcionario menor recibe la orden de llevar lichis frescos desde el lejano sur hasta la capital, la fruta se estropea en pocos días y él lo consigue con cálculos y un relevo de postas, cambiando caballos y jinetes, y al final dice la verdad sobre lo que costó. No copies el texto de la novela ni uses imágenes de la película; que sea ágil y que la historia quede clara. De paso, luce la herramienta: el clima de una escena cambia con la narración, la ruta se recalcula una y otra vez y los subtítulos encajan palabra por palabra. Usa una voz de alta calidad en la nube y una banda sonora original ajustada a la línea de tiempo del vídeo, y genera las imágenes de fondo que necesites. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Erzähl die Geschichte „Die Litschis von Chang'an“ (Chang'an de Lizhi) in etwa zwei Minuten als eigenständige Story-Einführung im Querformat (16:9): Ein kleiner Beamter soll frische Litschis aus dem fernen Süden in die Hauptstadt bringen, die Früchte verderben innerhalb weniger Tage, und er schafft es mit Rechenkunst und einer Stafette von Poststationen, mit wechselnden Pferden und Reitern – und sagt am Ende die Wahrheit darüber, was es gekostet hat. Übernimm keinen Text aus dem Roman und kein Filmmaterial; halte das Tempo hoch und die Geschichte klar. Zeig nebenbei, was das Tool kann: Das Wetter in einer Szene wechselt mit dem Sprechertext, die Route wird immer wieder neu durchgerechnet, und die Untertitel sitzen Wort für Wort. Nutze eine hochwertige Cloud-Stimme und eigene Musik, die auf die Zeitleiste des Films geschnitten ist, und erzeuge bei Bedarf Hintergrundbilder. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Racontez l'histoire des « Litchis de Chang'an » (Chang'an de Lizhi) en environ deux minutes, sous forme de guide narratif original au format paysage (16:9) : un petit fonctionnaire reçoit l'ordre d'acheminer des litchis frais de l'extrême sud jusqu'à la capitale, les fruits se gâtent en quelques jours, et il y parvient grâce au calcul et à un relais de stations de poste, en changeant de chevaux et de cavaliers – puis il dit la vérité sur ce que cela a coûté. Ne reprenez pas le texte du roman et n'utilisez aucune image du film ; gardez un rythme rapide et une histoire claire. Au passage, mettez l'outil en valeur : la météo d'une scène change avec la narration, l'itinéraire est recalculé encore et encore, et les sous-titres tombent mot à mot. Utilisez une voix cloud de haute qualité et une musique originale calée sur la timeline de la vidéo, et générez les images de fond nécessaires. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Conte a história de “A estrada das lichias” (Chang'an de Lizhi) em cerca de dois minutos, num vídeo-guia original na horizontal (16:9): um funcionário de baixo escalão recebe a ordem de levar lichias frescas do extremo sul até a capital, a fruta estraga em poucos dias, e ele consegue com cálculos e um revezamento entre postos de correio, trocando cavalos e cavaleiros — e depois diz a verdade sobre o quanto aquilo custou. Não copie o texto do romance nem use cenas do filme; mantenha o ritmo rápido e a história clara. No caminho, mostre o que a ferramenta faz: o clima de uma cena muda junto com a narração, a rota é recalculada várias vezes e as legendas entram palavra por palavra. Use uma voz de alta qualidade na nuvem e uma trilha original ajustada à linha do tempo do vídeo, e gere as artes de fundo de que precisar. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 原创复述、编写 14 幕代码；生成 15 张底图与 3 段奔马视频，样片视频素材与原制作版有差别。
- 中文 Gemini 云端配音逐句转拼音校验，本地逐字对齐驱动天气与运镜；英文版另用本地 Qwen3-TTS（Aiden）。
- Lyria 生成候选曲后按实际时间轴剪接，并以 NumPy 合成音效和环境声。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 307 条，账面合计 US$5.9933；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。

## 踩坑与验证边界

- 3.8 TTS 风格提示曾让模型额外念读或变慢，因此中文旁白只给正文。
- 大尺寸底图缩放与运行时 CSS 滤镜曾导致重复渲染不一致，改为离线尺寸和调色。
- 英文旁白更长；配乐沿用中文时间轴，英文版本重击与音效不再精确对应原词。

## 依据

- 公开包内 prompt.json：S107 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：lychee-20261007 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
