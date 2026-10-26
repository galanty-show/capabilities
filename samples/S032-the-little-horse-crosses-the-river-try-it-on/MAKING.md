# S032 · 小马过河：衣服尺码要自己试 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-astra (high)（云端）
- 画面代码：Codex CLI · gpt-6-astra (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：随包曲库 · Bright Horizon 96（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 51 秒的横版（16:9）寓言短片，改编“小马过河”：小马要挑一件雨衣，小松鼠说选小号，大牛说选大号；它试穿后发现小号紧、大号松，量好自己的尺寸，最后选了中号。画面要真画出三件雨衣试穿的松紧差别，故事讲给小朋友听，要生动，不要只总结大纲。女声旁白，配一段明快的底乐，结尾点题：别人的建议可以听，最后要拿自己的尺寸试一试。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 51-second 16:9 landscape fable that retells “The Pony Crosses the River” as a story about clothing sizes: the pony needs a raincoat, the squirrel says go small, the big ox says go large; the small one is too tight, the large one too loose, so the pony measures itself and picks the medium. Actually draw how each raincoat fits, and tell it vividly for kids rather than summarizing the plot. Female voiceover over a bright, upbeat bed, ending on the moral: listen to advice, then try it against your own measurements. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 51 秒的橫版（16:9）寓言短片，改編「小馬過河」：小馬要挑一件雨衣，小松鼠說選小號，大牛說選大號；牠試穿後發現小號太緊、大號太鬆，量好自己的尺寸，最後選了中號。畫面要真的畫出三件雨衣試穿的鬆緊差別，故事講給小朋友聽，要生動，不要只總結大綱。女聲旁白，配一段明快的背景音樂，結尾點題：別人的建議可以聽，最後要拿自己的尺寸試一試。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "中国の寓話「子馬の川渡り」を服のサイズの話にアレンジした、約51秒の横長（16:9）の寓話動画を作ってください。子馬がレインコートを選ぶ場面で、小リスは小さいサイズを、大きな牛は大きいサイズを勧めますが、試着してみると小さいのはきつく、大きいのはぶかぶかなので、子馬は自分の寸法を測って最後に中サイズを選びます。3着のレインコートを試着したときのきつさ・ゆるさの違いを実際に絵で描き、あらすじをまとめるのではなく子ども向けにいきいきと語ってください。女性のナレーションに明るく軽快なBGMを合わせ、最後は「人のアドバイスは聞いてもいい、でも最後は自分のサイズで確かめよう」というテーマで締めてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 51초 길이의 가로형(16:9) 우화 영상을 만들어 주세요. 「꼬마 말의 강 건너기」를 옷 치수 이야기로 바꿔서, 비옷을 골라야 하는 꼬마 말에게 다람쥐는 작은 걸, 큰 소는 큰 걸 권하지만, 입어 보니 작은 건 끼고 큰 건 헐렁해서 자기 치수를 재고 중간 크기를 고르는 이야기예요. 비옷 세 벌이 어떻게 맞는지 실제로 그려 주고, 줄거리만 요약하지 말고 아이들에게 생생하게 들려주세요. 밝고 경쾌한 배경 음악 위에 여성 내레이션을 깔고, “다른 사람의 조언은 듣되, 마지막엔 내 치수에 맞춰 입어 보자”라는 교훈으로 끝내 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz una fábula de unos 51 segundos en formato horizontal 16:9 que vuelva a contar «El potrillo que cruzó el río» como una historia de tallas: el potrillo necesita un chubasquero, la ardilla le dice que elija uno pequeño y el gran buey, uno grande; el pequeño le aprieta y el grande le queda holgado, así que el potrillo se mide y elige la talla mediana. Dibuja de verdad cómo le queda cada chubasquero y cuéntalo con viveza para niños, sin limitarte a resumir la trama. Narración con voz femenina sobre una base alegre y animada, terminando con la moraleja: escucha los consejos y luego pruébalos con tus propias medidas. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 51 Sekunden langes Fabelvideo im Querformat (16:9), das „Das kleine Pferd überquert den Fluss“ als Geschichte über Kleidergrößen neu erzählt: Das kleine Pferd braucht einen Regenmantel, das Eichhörnchen empfiehlt einen kleinen, der große Ochse einen großen; der kleine sitzt zu eng, der große zu locker, also misst das kleine Pferd sich selbst und nimmt den mittleren. Zeichne wirklich, wie jeder Regenmantel sitzt, und erzähl lebendig für Kinder, statt nur die Handlung zusammenzufassen. Eine Sprecherin, dazu fröhliche, beschwingte Hintergrundmusik, und am Ende die Moral: Hör dir Ratschläge an, aber probier sie an deinen eigenen Maßen aus. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une courte fable d'environ 51 secondes au format paysage (16:9) qui revisite « Le petit cheval traverse la rivière » sous la forme d'une histoire de tailles de vêtements : le petit cheval a besoin d'un imperméable, l'écureuil lui conseille le petit, le grand bœuf le grand ; le petit est trop serré, le grand trop ample, alors le petit cheval prend ses propres mesures et choisit le moyen. Dessinez vraiment comment tombe chaque imperméable, et racontez l'histoire de façon vivante pour les enfants au lieu de résumer l'intrigue. Voix off féminine sur un fond musical gai et entraînant, avec pour morale finale : écoutez les conseils, puis essayez vous-même pour trouver la taille qui vous va. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça uma fábula de cerca de 51 segundos na horizontal (16:9) que reconte “O potrinho atravessa o rio” como uma história sobre tamanhos de roupa: o potrinho precisa de uma capa de chuva, o esquilo diz para escolher a pequena, o boi grandão diz para escolher a grande; a pequena fica apertada, a grande fica folgada, então o potrinho tira as próprias medidas e escolhe a média. Desenhe de verdade como cada capa veste e conte de um jeito vivo, para crianças, em vez de resumir o enredo. Narração com voz feminina sobre uma música de fundo alegre e animada, terminando com a moral: ouça os conselhos e depois confira com as suas próprias medidas. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 公开包内 prompt.json：S032 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
