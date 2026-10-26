# S043 · 让 agent 写画面 · 制作记录

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
  "zh-CN": "做一支约 48 秒的横版（16:9）产品短片，主题是“让 Agent 写画面”：模板里没有的画面，描述出来交给 Agent 写成动画。核心镜头是一句话落进水里、再从涟漪中浮出来——文字落下，圆环从字心推开，光点沿波纹散开；接着演示“换成暖金色、节奏放慢”这样的修改。女声旁白，配一段平稳的底乐，结尾落在“让想法进入作品”。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 48-second 16:9 landscape product short called “Let the Agent write the frames”: when a shot isn't in any template, you describe it and the Agent animates it. The hero shot is a sentence dropping into water and rising back out of the ripples — the words fall, rings push out from their center, and specks of light drift along the waves — followed by a revision like “make it warm gold and slow it down.” Female voiceover over a steady bed, ending on “bring the idea into the work.” Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 48 秒的橫版（16:9）產品短片，主題是「讓 Agent 寫畫面」：範本裡沒有的畫面，描述出來交給 Agent 寫成動畫。核心鏡頭是一句話落進水裡、再從漣漪中浮出來——文字落下，圓環從字心推開，光點沿著波紋散開；接著示範「換成暖金色、節奏放慢」這樣的修改。女聲旁白，配一段平穩的背景音樂，結尾落在「讓想法進入作品」。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "「Agent に画面を書かせる」をテーマに、約48秒の横長（16:9）の製品ショート動画を作ってください。テンプレートにない画面でも、言葉で説明すれば Agent がアニメーションにしてくれる、という内容です。メインのカットは一文が水に落ち、波紋の中から再び浮かび上がる場面で、文字が落ちると中心から輪が広がり、光の粒が波紋に沿って散っていきます。続いて「暖かい金色に変えて、テンポをゆっくりに」といった修正の様子を見せてください。女性のナレーションに落ち着いたBGMを合わせ、最後は「アイデアを作品の中へ」で締めてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 48초 길이의 가로형(16:9) 제품 영상을 만들어 주세요. 제목은 “Agent에게 화면을 맡기세요”이고, 템플릿에 없는 장면이라도 말로 설명하면 Agent가 애니메이션으로 만들어 준다는 내용이에요. 핵심 장면은 한 문장이 물속에 떨어졌다가 물결 속에서 다시 떠오르는 모습으로, 글자가 떨어지고 글자 중심에서 동심원이 퍼지고 빛 알갱이가 물결을 따라 흩어진 뒤, “따뜻한 금색으로 바꾸고 속도를 늦춰 줘” 같은 수정을 이어서 보여 주세요. 차분한 배경 음악 위에 여성 내레이션을 깔고, “아이디어를 작품 속으로”로 끝내 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo de producto de unos 48 segundos en formato horizontal 16:9 titulado «Deja que el Agent escriba los fotogramas»: cuando una toma no está en ninguna plantilla, la describes y el Agent la anima. La toma principal es una frase que cae al agua y vuelve a emerger de las ondas: las palabras caen, unos anillos se expanden desde su centro y puntos de luz se dispersan siguiendo las olas; después se muestra una corrección como «ponlo en dorado cálido y más lento». Narración con voz femenina sobre una base estable, terminando con «lleva la idea a la obra». Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 48 Sekunden langes Produktvideo im Querformat (16:9) mit dem Titel „Lass den Agent die Bilder schreiben“: Wenn eine Einstellung in keiner Vorlage vorkommt, beschreibst du sie, und der Agent animiert sie. Die Hauptszene ist ein Satz, der ins Wasser fällt und aus den Wellen wieder auftaucht – die Wörter sinken, Ringe breiten sich von ihrer Mitte aus, und Lichtpunkte treiben über die Wellen –, gefolgt von einer Änderung wie „mach es warmgolden und langsamer“. Eine Sprecherin, dazu gleichmäßige Hintergrundmusik, und zum Schluss „Bring die Idee ins Werk“. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une courte vidéo produit d'environ 48 secondes au format paysage (16:9) intitulée « Laissez l'Agent écrire les images » : quand un plan n'existe dans aucun modèle, vous le décrivez et l'Agent l'anime. Le plan phare : une phrase qui tombe dans l'eau puis remonte des remous – les mots chutent, des cercles s'élargissent depuis leur centre et des points de lumière dérivent le long des vagues –, suivi d'une retouche du type « passez à un or chaud et ralentissez le rythme ». Voix off féminine sur un fond musical régulier, avec pour fin « Faites entrer l'idée dans l'œuvre ». Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo curto de produto de cerca de 48 segundos na horizontal (16:9) chamado “Deixe o Agent escrever as imagens”: quando uma cena não existe em nenhum modelo, você a descreve e o Agent a transforma em animação. A cena principal é uma frase caindo na água e voltando a surgir das ondulações — as palavras caem, anéis se abrem a partir do centro delas e pontinhos de luz deslizam pelas ondas —, seguida de um pedido de ajuste como “deixe em dourado quente e mais devagar”. Narração com voz feminina sobre uma música de fundo constante, terminando em “deixe a ideia entrar na obra”. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 公开包内 prompt.json：S043 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
