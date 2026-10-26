# S116 · 呼呼 · AI 陪伴玩偶宣传片 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Leda（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 2.5 Pro TTS · Laomedeia（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Huhu Lullaby（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 50 秒的横版（16:9）产品宣传片，产品是一个虚构品牌的 AI 陪伴毛绒玩偶：会聊天、讲睡前故事、陪孩子练英语、记得生日和小事，孩子难过时会安慰、再提醒去抱抱爸爸妈妈。开头用孩子睡前对玩偶说悄悄话、玩偶眼睛亮起来回答当钩子；中间三四个使用场景；再用代码画的家长端手机界面讲清能设时长、能看聊天记录、记录加密保存；最后是产品英雄镜头（材质、尺寸、续航、外套可拆洗）和口号标版。品牌名和外形自己原创，不要像任何现有 IP，参数合理不夸大，并在画面上写明是虚构演示。画风温暖、有绘本感，底图可以生成，玩偶说话时眼睛跟着字一下下亮。旁白用温柔的女声，玩偶台词换一个可爱的声音；配乐原创，温暖的钢琴和钟琴，难过之后有一处情绪抬升，音效用代码合成。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a roughly 50-second 16:9 promo for an AI companion plush toy from a made-up brand: it chats, tells bedtime stories, practices English with kids, remembers birthdays and little things, and comforts a sad child, then suggests a hug from Mom or Dad. Open with a child whispering to the toy at bedtime and its eyes lighting up as it answers; then three or four everyday uses; then a code-drawn parent phone screen (daily time limit, chat history, encrypted storage); end with a product hero shot (fabric, size, battery life, washable outer coat) and a tagline card. Invent the name and look yourself — nothing like an existing character — keep the specs plausible and label it on screen as a fictional demo. Warm picture-book style with generated background art; the toy's eyes pulse with each word it says. A gentle female narrator, a different cute voice for the toy, an original warm piano-and-glockenspiel score that lifts after the sad moment, and code-synthesized sound effects. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支大約 50 秒的橫版（16:9）產品宣傳片，產品是虛構品牌的 AI 陪伴絨毛玩偶：會聊天、講睡前故事、陪孩子練英語、記得生日和小事，孩子難過時會安慰，再提醒他去抱抱爸爸媽媽。開頭用孩子睡前對玩偶說悄悄話、玩偶眼睛亮起來回答當鉤子；中間三四個使用情境；再用程式碼畫的家長端手機介面講清楚能設定時長、能查看聊天紀錄、紀錄加密保存；最後是產品主視覺鏡頭（材質、尺寸、續航、外套可拆洗）和標語片尾。品牌名稱和外型自己原創，不要像任何現有 IP，參數合理不誇大，並在畫面上註明是虛構示範。畫風溫暖、有繪本感，底圖可以生成，玩偶說話時眼睛跟著字一下下亮。旁白用溫柔的女聲，玩偶台詞換一個可愛的聲音；配樂原創，溫暖的鋼琴和鐘琴，難過之後有一處情緒抬升，音效用程式碼合成。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "架空ブランドの AI コンパニオンぬいぐるみの、約 50 秒の横長（16:9）プロモーション動画を作ってください。おしゃべりする、寝る前のお話をする、英語の練習相手になる、誕生日や小さな出来事を覚えている、子どもが落ち込んだときは慰めて「パパやママにぎゅっとしてもらおう」と促す、という製品です。冒頭は、寝る前の子どもがぬいぐるみにひそひそ話しかけ、ぬいぐるみの目が光って答えるシーンでつかみます。続いて 3〜4 つの使用シーン、コードで描いた保護者向けスマホ画面（1 日の利用時間の設定、会話履歴の確認、履歴の暗号化保存）、最後に製品のヒーローショット（素材、サイズ、バッテリー持ち、外側の服は外して洗える）とキャッチコピーで締めます。ブランド名と見た目はオリジナルで、既存のキャラクターに似せないこと。仕様は誇張せず現実的にし、画面上に架空のデモであることを明記してください。温かい絵本風のタッチで、背景画像は生成してかまいません。ぬいぐるみが話すときは一語ごとに目が光るように。ナレーションはやさしい女性の声、ぬいぐるみのセリフは別のかわいい声にしてください。BGM はオリジナルで、温かいピアノとグロッケンシュピール、悲しい場面のあとに気持ちが盛り上がるところを入れ、効果音はコードで合成してください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "가상 브랜드의 AI 애착 봉제 인형을 소개하는 약 50초짜리 가로형(16:9) 제품 홍보 영상을 만들어 주세요. 대화를 나누고, 잠자리 동화를 들려주고, 아이와 영어 연습을 하고, 생일과 작은 일들을 기억하고, 아이가 속상할 때는 달래 준 뒤 엄마 아빠에게 안겨 보라고 권하는 인형이에요. 오프닝은 잠들기 전 아이가 인형에게 귓속말을 하자 인형의 눈이 반짝 켜지며 대답하는 장면으로 시선을 끌어 주세요. 이어서 사용 장면 서너 가지, 코드로 그린 보호자용 휴대폰 화면(하루 사용 시간 설정, 대화 기록 확인, 기록 암호화 저장), 마지막으로 제품 히어로 컷(소재, 크기, 배터리 사용 시간, 분리 세탁 가능한 겉옷)과 슬로건 엔딩으로 마무리해 주세요. 브랜드 이름과 생김새는 직접 창작하되 기존 캐릭터와 닮지 않게 하고, 사양은 과장 없이 그럴듯하게, 화면에 가상 데모라고 적어 주세요. 따뜻한 그림책 느낌으로, 배경 그림은 생성해도 돼요. 인형이 말할 때는 글자마다 눈이 반짝이게 해 주세요. 내레이션은 부드러운 여성 목소리, 인형 대사는 다른 귀여운 목소리로 하고, 음악은 따뜻한 피아노와 글로켄슈필로 직접 만들되 슬픈 장면 뒤에 감정이 고조되는 지점을 넣고, 효과음은 코드로 합성해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un promo horizontal (16:9) de unos 50 segundos de un peluche de compañía con IA de una marca inventada: conversa, cuenta cuentos para dormir, practica inglés con los niños, recuerda cumpleaños y pequeños detalles y consuela a un niño triste antes de sugerirle un abrazo de mamá o papá. Empieza con una niña que le susurra al peluche antes de dormir y sus ojos se iluminan al responder; luego tres o cuatro usos cotidianos; después una pantalla de móvil para padres dibujada con código (límite diario, historial de conversaciones, guardado cifrado); y cierra con un plano protagonista del producto (tejido, tamaño, autonomía, funda lavable) y el eslogan. Inventa el nombre y el aspecto, sin parecerse a ningún personaje existente, con especificaciones verosímiles, e indica en pantalla que es una demo ficticia. Estilo cálido de libro ilustrado con fondos generados; los ojos del peluche brillan con cada palabra. Narradora de voz suave, otra voz tierna para el peluche, música original de piano y glockenspiel que crece tras la escena triste y efectos sintetizados con código. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Erstelle einen etwa 50 Sekunden langen 16:9-Spot für ein KI-Kuscheltier einer erfundenen Marke: Es plaudert, erzählt Gutenachtgeschichten, übt mit Kindern Englisch, merkt sich Geburtstage und kleine Erlebnisse und tröstet ein trauriges Kind, bevor es eine Umarmung von Mama oder Papa vorschlägt. Steig ein mit einem Kind, das dem Kuscheltier abends etwas zuflüstert, worauf dessen Augen aufleuchten; dann drei oder vier Alltagsszenen; danach ein mit Code gezeichneter Eltern-Bildschirm (Tageslimit, Gesprächsverlauf, verschlüsselte Speicherung); zum Schluss eine Produkt-Hero-Einstellung (Stoff, Größe, Akkulaufzeit, waschbarer Überzug) und der Slogan. Name und Aussehen selbst erfinden, ohne Ähnlichkeit mit bestehenden Figuren, Daten realistisch halten und im Bild als fiktive Demo kennzeichnen. Warmer Bilderbuchstil mit erzeugten Hintergründen; die Augen leuchten bei jedem gesprochenen Wort. Eine sanfte Sprecherin, eine andere, niedliche Stimme fürs Kuscheltier, eigene Musik mit warmem Klavier und Glockenspiel, die nach der traurigen Szene aufblüht, und mit Code synthetisierte Effekte. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Réalisez un spot 16:9 d'environ 50 secondes pour une peluche compagnon à IA d'une marque inventée : elle discute, raconte des histoires du soir, fait pratiquer l'anglais, se souvient des anniversaires et des petits événements, et console un enfant triste avant de lui proposer un câlin de maman ou papa. Ouvrez sur un enfant qui chuchote à la peluche au coucher et ses yeux qui s'allument quand elle répond ; puis trois ou quatre usages du quotidien ; puis un écran de téléphone parent dessiné en code (limite quotidienne, historique des conversations, stockage chiffré) ; et terminez sur un plan héros du produit (tissu, taille, autonomie, housse lavable) et le slogan. Inventez nom et apparence, sans rappeler un personnage existant, avec des caractéristiques plausibles, et indiquez à l'écran que c'est une démo fictive. Style chaleureux de livre illustré avec des fonds générés ; les yeux brillent à chaque mot. Une narratrice à la voix douce, une autre voix, mignonne, pour la peluche, une musique originale piano et glockenspiel qui s'élève après la scène triste, et des effets synthétisés en code. Montrez-moi d'abord l'aperçu en direct, puis exportez le MP4 seulement s'il me convient.",
  "pt-BR": "Faça um promo horizontal (16:9) de cerca de 50 segundos de uma pelúcia de companhia com IA de uma marca inventada: ela conversa, conta histórias para dormir, pratica inglês com as crianças, lembra de aniversários e pequenos acontecimentos e consola a criança triste antes de sugerir um abraço da mamãe ou do papai. Abra com uma criança sussurrando para a pelúcia na hora de dormir e os olhos dela acendendo ao responder; depois três ou quatro usos do dia a dia; em seguida uma tela de celular para os pais desenhada em código (limite diário, histórico de conversas, armazenamento criptografado); e feche com um plano de destaque do produto (tecido, tamanho, bateria, capa lavável) e o slogan. Crie o nome e a aparência, sem lembrar nenhum personagem existente, com especificações plausíveis, e indique na tela que é uma demonstração fictícia. Estilo acolhedor de livro ilustrado com fundos gerados; os olhos brilham a cada palavra. Uma narradora de voz suave, outra voz fofa para a pelúcia, trilha original de piano e glockenspiel que cresce depois da cena triste e efeitos sintetizados em código. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 调研家长顾虑与品类表达，虚构品牌、玩偶与参数，先出设定再生成场景图。
- 旁白用 Leda，玩偶对白用 Pro TTS Laomedeia；逐句转写核对并本地对齐。
- 代码绘制家长端和玩偶反馈，Lyria 三版选器乐版，按小节剪辑并合成音效。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 222 条，账面合计 US$2.7389；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 部分 Pro TTS 按工具包统一单价记账，可能低于实际计费。

## 踩坑与验证边界

- 全半角标点及多音字预处理使 voice-map 匹配不到角色句，改为去标点比对。
- Pro 风格提示拖慢旁白，只保留玩偶对白使用；品牌名曾读错，末句改念产品名。
- 听评代理对“亲肤”读音与拼音校验结论不同，保留最好样本并记录分歧。

## 依据

- 公开包内 prompt.json：S116 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：promo-aitoy-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
