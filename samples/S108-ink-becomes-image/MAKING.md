# S108 · 落笔成影 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：macOS fonts · Xingkai SC, Weibei SC（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Uncle_Fu（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Aiden（本地）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：numpy/scipy（本地）
- 配乐/音效：随包曲库 · Luobi（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "给文影做一支约 70 秒的横版（16:9）水墨宣传片：墨滴落在宣纸上，毛笔写出片名；再选四首唐诗，每首先一句介绍，诗句随朗读一字一字落在纸上，念完化成一幅水墨画；然后演示点一下画上的“明月”改成“落日”，画面跟着变；最后墨爆、钤印，打出“落笔成影”。用沉稳的诗词朗读配音，配乐原创，用五声音阶，按朗读的时间排拍点，说话时让位。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 70-second 16:9 landscape ink-wash promo for Galanty: a drop of ink lands on rice paper and a brush writes the title; then take four Tang poems, open each with one line of introduction, let the poem's lines appear on the paper character by character as they're read aloud, and when the reading ends, let the words turn into an ink painting. Then show a quick edit — click “bright moon” in the painting, change it to “setting sun,” and the picture follows. End with an ink burst, a red seal and the line “Ink becomes image.” Use a calm, poetry-reading voice and an original pentatonic score timed to the reading that steps back while the voice speaks. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "幫文影做一支約 70 秒的橫版（16:9）水墨宣傳片：墨滴落在宣紙上，毛筆寫出片名；再選四首唐詩，每首先一句介紹，詩句隨著朗讀一字一字落在紙上，念完化成一幅水墨畫；接著示範點一下畫上的「明月」改成「落日」，畫面跟著變；最後墨爆、鈐印，打出「落筆成影」。用沉穩的詩詞朗讀配音，配樂原創、用五聲音階，依照朗讀的時間安排節拍，說話時讓位。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "Galanty の水墨プロモーション動画を、横長（16:9）で約70秒で作ってください。墨のしずくが和紙に落ち、筆でタイトルを書きます。続いて唐詩を4首選び、それぞれ一言の紹介のあと、朗読に合わせて詩句が1文字ずつ紙に書かれ、読み終わると水墨画に変わります。次に、画中の「明月」をクリックして「落日」に変えると絵も変わる、という編集を見せてください。最後は墨がはじけて落款を押し、「落筆成影」で締めます。落ち着いた詩の朗読の声を使い、BGM は五音音階のオリジナルで、朗読のタイミングに合わせて拍を置き、声の間は控えめにしてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "Galanty의 수묵 홍보 영상을 가로형(16:9) 약 70초로 만들어 주세요. 먹물 한 방울이 화선지에 떨어지고 붓이 제목을 써요. 이어서 당시(唐詩) 네 수를 골라, 각각 한 줄 소개 뒤에 낭독에 맞춰 시구가 한 글자씩 종이에 써지고, 낭독이 끝나면 수묵화로 바뀌게 해 주세요. 그다음 그림 속 ‘밝은 달’을 클릭해 ‘지는 해’로 바꾸면 그림도 따라 바뀌는 편집을 보여 주세요. 마지막은 먹이 터지며 낙관이 찍히고 ‘붓 끝에서 영상이 된다(落筆成影)’로 마무리해요. 차분한 시 낭송 목소리를 쓰고, 음악은 5음 음계의 오리지널로 낭독 타이밍에 맞춰 박을 놓고 목소리가 나올 때는 물러나게 해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo promocional de tinta china para Galanty, en horizontal 16:9 y de unos 70 segundos: una gota de tinta cae sobre papel de arroz y un pincel escribe el título; luego elige cuatro poemas Tang, abre cada uno con una frase de presentación, haz que los versos aparezcan en el papel carácter a carácter mientras se recitan y que, al terminar la lectura, se conviertan en una pintura a tinta. Después muestra una edición rápida: haz clic en «luna brillante» dentro de la pintura, cámbiala por «sol poniente» y la imagen cambia con ella. Cierra con un estallido de tinta, un sello rojo y la frase «La tinta se hace imagen». Usa una voz serena de recitado poético y una banda sonora original pentatónica, sincronizada con la lectura, que se retire mientras habla la voz. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach für Galanty einen Tusche-Werbefilm im Querformat (16:9), etwa 70 Sekunden lang: Ein Tuschetropfen fällt auf Reispapier, ein Pinsel schreibt den Titel. Dann nimm vier Tang-Gedichte, leite jedes mit einem Satz ein, lass die Verse beim Vorlesen Zeichen für Zeichen aufs Papier fließen und nach dem Vortrag zu einem Tuschebild werden. Zeig anschließend eine schnelle Änderung: Klick im Bild auf „heller Mond“, mach daraus „sinkende Sonne“, und das Bild folgt. Zum Schluss ein Tuscheausbruch, ein rotes Siegel und der Satz „Tusche wird Bild“. Nutze eine ruhige Gedichtvortrags-Stimme und eigene pentatonische Musik, deren Schläge auf den Vortrag gelegt sind und die zurücktritt, während die Stimme spricht. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Réalisez pour Galanty un film promotionnel à l'encre de Chine au format paysage (16:9), d'environ 70 secondes : une goutte d'encre tombe sur du papier de riz et un pinceau écrit le titre ; prenez ensuite quatre poèmes Tang, introduisez chacun par une phrase, faites apparaître les vers sur le papier caractère par caractère au fil de la lecture, puis transformez-les en peinture à l'encre une fois la lecture terminée. Montrez ensuite une modification rapide : cliquez sur « lune claire » dans la peinture, remplacez-la par « soleil couchant », et l'image suit. Terminez par une éclaboussure d'encre, un sceau rouge et la phrase « L'encre devient image ». Utilisez une voix posée de récitation poétique et une musique originale pentatonique, calée sur la lecture, qui s'efface quand la voix parle. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo promocional em pintura a nanquim para o Galanty, na horizontal (16:9), com cerca de 70 segundos: uma gota de tinta cai no papel de arroz e um pincel escreve o título; depois escolha quatro poemas Tang, abra cada um com uma frase de apresentação, faça os versos surgirem no papel caractere por caractere enquanto são recitados e, quando a leitura terminar, transforme-os numa pintura a nanquim. Em seguida, mostre uma edição rápida: clique em “lua clara” na pintura, troque por “sol poente” e a imagem acompanha. Termine com uma explosão de tinta, um selo vermelho e a frase “A tinta vira imagem”. Use uma voz serena de declamação e uma trilha original pentatônica, marcada pelo tempo da leitura, que recua enquanto a voz fala. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 先制作无旁白短版，按反馈扩为约 68.5 秒诗词朗读版；山水、印章等均用代码绘制。
- 四首唐诗用本地 Qwen3-TTS（Uncle_Fu）朗读，ForcedAligner 取逐字时间，让毛笔字随朗读落纸。
- 原创配乐“落笔”由 NumPy/SciPy 合成，音画读取同一时间表；样片版拆幕并分离旁白与配乐两轨，英文另用 Aiden。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 另一个并行创作的约 28.9 秒“墨境”不是本片；不能挪用其约 12 分钟或 30.178 秒制作记录。
- 原作歌曲模式改为两轨样片，复现时要区分对应版本。

## 依据

- 公开包内 prompt.json：S108 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
