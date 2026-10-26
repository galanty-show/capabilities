# S034 · 折页桌灯，让书页亮起来 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：随包曲库 · Bright Horizon 96（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 54 秒的横版（16:9）虚构产品介绍片：一盏能折起来的桌灯。按“拥挤的桌面 → 灯臂从薄底座展开 → 把暖光移到书页上 → 读完折回、桌面重新空出来”四幕来讲，用自己写的动画画出灯的展开和光照范围。女声旁白，配一段明快的底乐，并说明这是虚构产品、不做效果承诺。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 54-second 16:9 landscape product film for a fictional folding desk lamp. Tell it in four scenes: a crowded desk, the lamp arm unfolding from a slim base, warm light moved onto the page, then folded away so the desk is clear again, with custom animation for the unfolding lamp and its pool of light. Female voiceover over a bright bed, and say clearly that the product is fictional and makes no performance claims. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 54 秒的橫版（16:9）虛構產品介紹片：一盞可以折起來的桌燈。按「擁擠的桌面 → 燈臂從薄底座展開 → 把暖光移到書頁上 → 讀完折回、桌面重新空出來」四幕來講，用自己寫的動畫畫出燈的展開和照明範圍。女聲旁白，配一段明快的背景音樂，並說明這是虛構產品、不做效果承諾。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "架空の折りたたみ式デスクライトを紹介する、約54秒の横長（16:9）の製品紹介動画を作ってください。「散らかった机 → 薄い台座からアームが伸びる → 温かい光を本のページに当てる → 読み終えたら折りたたんで机がまた広くなる」の4シーンで構成し、ライトが開く動きと光の当たる範囲は独自のアニメーションで描いてください。女性のナレーションに明るいBGMを合わせ、架空の製品であり効果を約束するものではないことも明記してください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 54초 길이의 가로형(16:9) 제품 영상을 만들어 주세요. 가상의 접이식 책상 스탠드를 소개하는데, “어수선한 책상 → 얇은 받침대에서 스탠드 팔이 펼쳐짐 → 따뜻한 빛을 책장 위로 옮김 → 다 읽고 접으면 책상이 다시 비워짐” 네 장면으로 이야기해요. 스탠드가 펼쳐지는 모습과 빛이 닿는 범위는 직접 만든 애니메이션으로 그려 주세요. 밝은 배경 음악 위에 여성 내레이션을 깔고, 가상의 제품이며 성능을 약속하지 않는다는 점을 분명히 말해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo de producto de unos 54 segundos en formato horizontal 16:9 para una lámpara de escritorio plegable ficticia. Cuéntalo en cuatro escenas: un escritorio abarrotado, el brazo de la lámpara desplegándose desde una base fina, la luz cálida llevada hasta la página y, al final, la lámpara plegada para que el escritorio vuelva a quedar despejado, con animación propia para el despliegue y su círculo de luz. Narración con voz femenina sobre una base alegre, y di claramente que el producto es ficticio y que no se promete ningún rendimiento. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 54 Sekunden langes Produktvideo im Querformat (16:9) für eine fiktive klappbare Schreibtischlampe. Erzähl es in vier Szenen: ein vollgestellter Schreibtisch, der Lampenarm klappt aus einem flachen Fuß auf, warmes Licht wird auf die Buchseite gelenkt, dann wird die Lampe wieder zusammengeklappt und der Tisch ist frei – mit eigener Animation für die aufklappende Lampe und ihren Lichtkegel. Eine Sprecherin, dazu beschwingte Hintergrundmusik, und sag deutlich, dass das Produkt fiktiv ist und keine Leistungsversprechen gemacht werden. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez un film produit d'environ 54 secondes au format paysage (16:9) pour une lampe de bureau pliante fictive. Racontez-le en quatre scènes : un bureau encombré, le bras de la lampe qui se déplie depuis un socle fin, une lumière chaude dirigée sur la page, puis la lampe repliée pour libérer le bureau, avec une animation sur mesure pour le dépliage et le halo de lumière. Voix off féminine sur un fond musical enjoué, en précisant clairement que le produit est fictif et qu'aucune performance n'est promise. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo de produto de cerca de 54 segundos na horizontal (16:9) para uma luminária de mesa dobrável fictícia. Conte em quatro cenas: uma mesa abarrotada, o braço da luminária se abrindo a partir de uma base fina, a luz quente levada até a página e, por fim, a luminária dobrada e guardada, deixando a mesa livre de novo, com animação própria para a luminária se abrindo e o círculo de luz. Narração com voz feminina sobre uma música de fundo animada, e diga claramente que o produto é fictício e não promete nenhum desempenho. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 公开包内 prompt.json：S034 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
