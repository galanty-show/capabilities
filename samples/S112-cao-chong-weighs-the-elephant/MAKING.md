# S112 · 曹冲称象 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Aoede（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 2.5 Pro TTS · Aoede（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Cao Chong Weighs the Elephant（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "给 4～9 岁的小朋友做一支约 100 秒的中文故事动画《曹冲称象》（出自《三国志》，公版），横版 16:9，适合在平板或电视上播放。旁白自己写，用孩子听得懂的短句：开头用一个问题当钩子（一头大象有多重？），中间停一下让孩子自己想办法，再把曹冲的办法一步一步讲清楚：大象上船、船往下沉、沿着水面画线、牵走大象、一筐筐搬石头直到水面到线、把石头称一称加起来；结尾一句温和的道理，不说教。不要战争、兵器和吓人的画面。画面用温暖明亮的绘本插画（水彩、蜡笔质感），人物前后一致；关键动作用代码画：水面随船起伏、刻线发光、石头一块块落到船上、水位逼近刻线到线时“叮”一下、秤盘的指针，最后是“石头的重量 = 大象的重量”的等式。配音用温柔亲切的女声，语速慢一点，多音字（称、重）要读对；配乐原创、轻快童趣（木琴、尤克里里），音效可以用代码合成。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a ~100-second Chinese story animation for kids aged 4–9: “Cao Chong Weighs the Elephant” (Records of the Three Kingdoms, public domain), 16:9 for a tablet or TV. Write short, simple narration: open with a question (how heavy is an elephant?), pause so kids can think, then show Cao Chong's method step by step — elephant onto the boat, the boat sinks, mark the waterline, elephant off, baskets of stones until the water reaches the mark, weigh the stones and add them up — and end with one gentle lesson. No war, weapons or scary images. Use warm picture-book art (watercolor, crayon) with consistent characters, and draw key actions in code: water bobbing, a glowing mark, stones dropping as the water creeps up with a “ding” at the line, a scale needle, and “stones' weight = elephant's weight”. Use a gentle female voice, a bit slow, reading 称 and 重 correctly; a playful original score (xylophone, ukulele) and code-made sound effects. Live preview first; export the MP4 once I'm happy.",
  "zh-Hant": "幫 4～9 歲的小朋友做一支約 100 秒的中文故事動畫《曹沖稱象》（出自《三國志》，公版），橫版 16:9，適合在平板或電視上播放。旁白由你來寫，用孩子聽得懂的短句：開頭用一個問題當鉤子（一頭大象有多重？），中間停一下讓孩子自己想辦法，再把曹沖的辦法一步一步講清楚：大象上船、船往下沉、沿著水面畫線、牽走大象、一筐筐搬石頭直到水面到線、把石頭稱一稱加起來；結尾一句溫和的道理，不說教。不要戰爭、兵器和嚇人的畫面。畫面用溫暖明亮的繪本插畫（水彩、蠟筆質感），人物前後一致；關鍵動作用程式碼畫：水面隨船起伏、刻線發光、石頭一塊塊落到船上、水位逼近刻線到線時「叮」一下、秤盤的指針，最後是「石頭的重量 = 大象的重量」的等式。配音用溫柔親切的女聲，語速慢一點，多音字（稱、重）要讀對；配樂原創、輕快童趣（木琴、烏克麗麗），音效可以用程式碼合成。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "4～9歳の子ども向けに、約100秒の中国語ストーリーアニメ「曹沖、象の重さを量る」(曹沖称象)を作ってください(出典は『三国志』、パブリックドメイン)。横向き16:9で、タブレットやテレビで見やすいものにします。ナレーションはあなたが書いて、子どもにも分かる短い文にしてください。冒頭は問いかけで引きつけ(ゾウの重さはどれくらい?)、途中で一拍置いて子どもが自分で考える時間を作り、そのあと曹沖の方法を一歩ずつ丁寧に説明します。ゾウが船に乗る、船が沈む、水面に線を引く、ゾウを降ろす、水面が線に届くまで籠で石を運ぶ、石を量って足し合わせる。最後はやさしい教えをひとこと、説教くさくならないように。戦争、武器、怖い絵は使いません。絵は温かく明るい絵本イラスト(水彩、クレヨンの質感)で、人物は最初から最後まで同じ姿に。要になる動きはコードで描いてください。船と一緒に揺れる水面、光る刻み線、石が一つずつ船に落ちる様子、水位が線に届く瞬間の「チーン」という音、秤の針、そして最後に「石の重さ = ゾウの重さ」の等式。声はやさしく親しみやすい女性の声でゆっくりめに、多音字の称と重を正しく読むこと。音楽はオリジナルの軽やかで楽しい曲(木琴、ウクレレ)、効果音はコードで合成して構いません。まずリアルタイムで再生して見せて、気に入ったらMP4に書き出します。",
  "ko": "4~9세 어린이를 위한 약 100초 분량의 중국어 이야기 애니메이션 「조충칭상(조충, 코끼리 무게를 재다)」을 만들어 주세요(『삼국지』 수록, 공공 저작물). 가로 16:9로, 태블릿이나 TV에서 보기 좋게요. 내레이션은 직접 쓰고, 아이들이 알아듣는 짧은 문장으로 해 주세요. 처음에는 질문으로 시선을 끌고(코끼리는 얼마나 무거울까?), 중간에 잠깐 멈춰 아이가 스스로 방법을 생각해 보게 한 다음, 조충의 방법을 한 단계씩 분명하게 들려주세요. 코끼리가 배에 오르고, 배가 가라앉고, 수면을 따라 선을 긋고, 코끼리를 내리고, 물이 선에 닿을 때까지 바구니로 돌을 나르고, 돌을 달아서 더하는 순서입니다. 마무리는 부드러운 교훈 한 줄, 잔소리는 빼고요. 전쟁, 무기, 무서운 장면은 없어야 합니다. 그림은 따뜻하고 밝은 그림책 일러스트(수채화, 크레용 질감)에 인물 모습은 처음부터 끝까지 똑같이. 핵심 동작은 코드로 그려 주세요. 배를 따라 출렁이는 수면, 빛나는 눈금선, 돌이 하나씩 배에 떨어지는 모습, 수위가 눈금선에 닿는 순간 \"딩\" 하는 소리, 저울 바늘, 마지막으로 \"돌의 무게 = 코끼리의 무게\" 등식입니다. 목소리는 부드럽고 다정한 여성 목소리로 조금 천천히, 다음자 称와 重는 올바르게 읽어야 해요. 음악은 직접 만든 경쾌하고 동심 가득한 곡(실로폰, 우쿨렐레), 효과음은 코드로 합성해도 좋아요. 먼저 바로 재생해서 보여 주시고, 마음에 들면 MP4로 내보내 주세요.",
  "es": "Haz para niños de 4 a 9 años una animación en chino de unos 100 s: «Cao Chong pesa al elefante» (Crónicas de los Tres Reinos, dominio público), 16:9 horizontal, para tableta o tele. Narración en frases cortas: abre con una pregunta gancho (¿cuánto pesa un elefante?), pausa para que piensen y luego el método de Cao Chong paso a paso: el elefante sube a la barca, la barca se hunde, se marca una línea en el agua, baja el elefante, cestas de piedras hasta que el agua llega a la marca, y se pesan y suman las piedras. Cierra con una enseñanza suave, sin sermones. Nada de guerra, armas ni imágenes que asusten. Ilustración de cuento cálida y luminosa (acuarela, cera) con personajes coherentes; acciones clave dibujadas con código: el agua meciéndose con la barca, la marca brillante, las piedras cayendo una a una, un «ding» al llegar a la línea, la aguja de una balanza y, al final, «peso de las piedras = peso del elefante». Voz de mujer dulce y pausada que lea bien 称 y 重; música original y juguetona (xilófono, ukelele) y efectos sintetizados con código. Primero reprodúcelo en directo y, si me gusta, expórtalo en MP4.",
  "de": "Mach für Kinder von 4 bis 9 Jahren eine etwa 100-sekündige chinesische Geschichtenanimation: „Cao Chong wiegt den Elefanten“ (Aufzeichnungen der Drei Reiche, gemeinfrei), Querformat 16:9, für Tablet oder TV. Sprechtext in kurzen Sätzen: Einstieg mit einer Frage (Wie schwer ist ein Elefant?), Pause zum Selbstüberlegen, dann Cao Chongs Methode Schritt für Schritt: Elefant aufs Boot, das Boot sinkt, Linie am Wasserspiegel, Elefant runter, Körbe voller Steine, bis das Wasser die Linie erreicht, Steine wiegen und addieren. Am Ende eine sanfte Lehre ohne Moralpredigt. Keine Kriegs-, Waffen- oder Schreckensbilder. Warme, helle Bilderbuch-Illustrationen (Aquarell, Wachsmalstift), Figuren immer gleich; wichtige Bewegungen per Code: das Wasser schaukelt mit dem Boot, die Markierung leuchtet, Steine fallen einzeln aufs Boot, ein „Ding“ an der Linie, der Zeiger einer Waage, am Ende „Gewicht der Steine = Gewicht des Elefanten“. Sanfte Frauenstimme, etwas langsam, 称 und 重 richtig gelesen; originale, verspielte Musik (Xylofon, Ukulele), Effekte per Code. Erst live abspielen, nach meinem Okay als MP4 exportieren.",
  "fr": "Fais pour des enfants de 4 à 9 ans une animation en chinois d'environ 100 s : « Cao Chong pèse l'éléphant » (Mémoires des Trois Royaumes, domaine public), 16:9 horizontal, pour tablette ou télé. Narration en phrases courtes : question accroche (combien pèse un éléphant ?), pause pour laisser chercher, puis la méthode de Cao Chong pas à pas : l'éléphant monte sur le bateau, le bateau s'enfonce, trait au niveau de l'eau, l'éléphant descend, paniers de pierres jusqu'au trait, on pèse les pierres et on additionne. Finis par une morale douce, sans leçon. Pas de guerre, d'armes ni d'images effrayantes. Illustrations d'album chaleureuses et lumineuses (aquarelle, crayon gras), personnages cohérents ; actions clés dessinées en code : l'eau qui ondule avec le bateau, le trait qui brille, les pierres qui tombent une à une, un « ding » au trait, l'aiguille d'une balance, puis « poids des pierres = poids de l'éléphant ». Voix féminine douce, un peu lente, qui lit bien 称 et 重 ; musique originale enjouée (xylophone, ukulélé), bruitages synthétisés par code. Lance d'abord la lecture en direct ; si ça me plaît, exporte en MP4.",
  "pt-BR": "Faça para crianças de 4 a 9 anos uma animação em chinês de cerca de 100 s: “Cao Chong pesa o elefante” (Registros dos Três Reinos, domínio público), 16:9 horizontal, para tablet ou TV. Narração em frases curtas: comece com uma pergunta de gancho (quanto pesa um elefante?), pausa para as crianças pensarem e depois o método de Cao Chong passo a passo: o elefante sobe no barco, o barco afunda, marca-se uma linha na água, o elefante desce, cestos de pedras até a água chegar na marca, e as pedras são pesadas e somadas. Termine com uma lição suave, sem sermão. Nada de guerra, armas ou imagens assustadoras. Ilustrações de livro infantil quentes e luminosas (aquarela, giz de cera), personagens consistentes; ações-chave desenhadas em código: a água balançando com o barco, a marca brilhando, as pedras caindo uma a uma, um “plim” na linha, o ponteiro de uma balança e, no fim, “peso das pedras = peso do elefante”. Voz feminina doce e um pouco lenta, lendo 称 e 重 corretamente; música original e divertida (xilofone, ukulele) e efeitos por código. Primeiro reproduza ao vivo; se eu gostar, exporte em MP4."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 改写曹冲称象故事，先做人物与大象参考，再生成底图和绿幕贴纸。
- 试听选 Aoede 作旁白，曹冲对白改用 Pro TTS 童声；逐音节校验并本地对齐。
- Lyria 分两段生成后以“到线”为锚点剪辑，NumPy 合成计数、水花与反馈音效。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 266 条，账面合计 US$2.4227；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 另一语言配音与校验另有 108 条账面 US$0.0549，与原制作分开记。

## 踩坑与验证边界

- 3.8 TTS 会把童声风格提示念成正文，曹冲对白改用 Pro TTS。
- 拼音校验不分声调，称、重的读音另请听评代理检查；这仍不等于人耳试听。
- Lyria 整曲的时长与段落不按提示执行，改为两段生成再按锚点剪接。

## 依据

- 公开包内 prompt.json：S112 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：cao-chong-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 另一语言保留档案标识：cao-chong-20261013-i18n / cost-ledger.jsonl。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
