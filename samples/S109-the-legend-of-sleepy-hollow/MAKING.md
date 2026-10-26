# S109 · The Legend of Sleepy Hollow · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 视觉素材：numpy（本地）
- 配音/对齐/校验：Gemini TTS · Gemini 2.5 Pro TTS · Charon（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Sleepy Hollow（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "把 Washington Irving 1820 年的公版小说《The Legend of Sleepy Hollow》讲成一支两分钟左右的英文横版（16:9）故事短片：1790 年哈德逊河谷，迷信又贪吃的瘦高教书先生 Ichabod Crane 追求富家女 Katrina，情敌 Brom Bones 爱恶作剧；秋收聚会上听了无头骑士的鬼故事，深夜独自骑老马回家，被无头骑士追到教堂边的桥，一个燃烧的南瓜迎面砸来，第二天只剩帽子和摔碎的南瓜。像营火边讲故事那样讲，惊悚但不血腥、适合全家；旁白自己写现代英文复述，最多引一句原文。画面电影感、画风和人物前后一致，用代码做月光、流雾、落叶、烛火、奔马视差和越切越快的追逐，南瓜爆裂的闪白和碎片卡在 pumpkin 这个词上。用低沉的云端英文男声，配乐原创（暗调民谣、追逐加速、南瓜处骤停）。先即时播放给我看，满意了再导出 MP4。",
  "en": "Turn Washington Irving’s public-domain 1820 tale “The Legend of Sleepy Hollow” into a two-minute English story short, 16:9: in the Hudson Valley of 1790 the lanky, superstitious, always-hungry schoolmaster Ichabod Crane courts Katrina while the prankster Brom Bones wants her too; after ghost stories at the autumn party he rides home alone at midnight, the Headless Horseman chases him to the church bridge and hurls a blazing pumpkin, and next morning only his hat and a shattered pumpkin remain. Tell it like a campfire storyteller: spooky but never gory, fine for families; write a modern retelling and quote at most one line of the original. Keep it cinematic with consistent art and characters, and draw moonlight, drifting fog, leaves, candle flicker, galloping parallax and ever-faster chase cuts in code, with the flash and pumpkin shards landing on the word “pumpkin”. Use a deep cloud English voice and an original score that speeds up for the chase and stops dead at the pumpkin. Show me a live preview first; export the MP4 only once I’m happy.",
  "zh-Hant": "把 Washington Irving 1820 年的公版小說《The Legend of Sleepy Hollow》講成一支約兩分鐘的英文橫版（16:9）故事短片：1790 年哈德遜河谷，迷信又貪吃的瘦高教書先生 Ichabod Crane 追求富家女 Katrina，情敵 Brom Bones 愛惡作劇；秋收聚會上聽了無頭騎士的鬼故事，深夜獨自騎老馬回家，被無頭騎士追到教堂邊的橋，一顆燃燒的南瓜迎面砸來，第二天只剩帽子和摔碎的南瓜。像營火邊講故事那樣講，驚悚但不血腥、適合全家；旁白自己寫現代英文重述，最多引一句原文。畫面有電影感、畫風和人物前後一致，用程式碼做月光、流霧、落葉、燭火、奔馬視差和越切越快的追逐，南瓜爆裂的閃白和碎片對準 pumpkin 這個字。用低沉的雲端英文男聲，配樂原創（暗調民謠、追逐加速、南瓜處驟停）。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "ワシントン・アーヴィングのパブリックドメイン小説『スリーピー・ホロウの伝説』（1820 年）を、約 2 分の英語・横長（16:9）のショートストーリーにしてください。1790 年のハドソン川流域、迷信深く食いしん坊の痩せた教師イカボッド・クレーンが富農の娘カトリーナに言い寄り、いたずら好きのブロム・ボーンズも彼女を狙います。秋の集まりで首なし騎士の怪談を聞いた夜、老馬で一人帰るイカボッドは首なし騎士に教会そばの橋まで追われ、燃えるカボチャを投げつけられ、翌朝には帽子と砕けたカボチャだけが残ります。焚き火の語り手のように、怖いけれど残酷ではなく家族で楽しめるように。ナレーションは現代英語の語り直しで、原文の引用は一行まで。画風と人物を統一した映画的な画面で、月明かり、流れる霧、落ち葉、ろうそくの揺らぎ、疾走する馬の視差、どんどん速くなる追跡のカットをコードで描き、白い閃光とカボチャの破片を「pumpkin」の語に合わせてください。低く深いクラウドの英語音声と、追跡で加速しカボチャで急停止するオリジナル BGM を使ってください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "워싱턴 어빙의 퍼블릭 도메인 소설 『슬리피 할로우의 전설』(1820)을 약 2분 길이의 영어 가로형(16:9) 스토리 단편으로 만들어 주세요. 1790년 허드슨 강 계곡, 미신을 믿고 늘 배고픈 깡마른 교사 이카보드 크레인이 부잣집 딸 카트리나에게 구애하고 장난꾸러기 브롬 본즈도 그녀를 노립니다. 가을 잔치에서 머리 없는 기사 괴담을 들은 밤, 늙은 말을 타고 혼자 돌아가던 이카보드는 머리 없는 기사에게 교회 옆 다리까지 쫓기고 불타는 호박을 맞으며, 다음 날 아침엔 모자와 깨진 호박만 남습니다. 모닥불 앞 이야기꾼처럼, 으스스하지만 잔인하지 않게 온 가족이 볼 수 있게 해 주세요. 내레이션은 현대 영어 각색으로, 원문 인용은 한 줄까지만. 화풍과 인물이 일관된 영화 같은 화면에 달빛, 흐르는 안개, 낙엽, 촛불, 달리는 말의 시차 효과, 점점 빨라지는 추격 컷을 코드로 그리고, 흰 섬광과 호박 파편이 ‘pumpkin’이라는 단어에 맞게 해 주세요. 낮고 깊은 클라우드 영어 음성과, 추격에서 빨라지고 호박에서 뚝 멈추는 오리지널 음악을 써 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 MP4로 내보내 주세요.",
  "es": "Convierte el relato de dominio público de Washington Irving «La leyenda de Sleepy Hollow» (1820) en un corto en inglés de dos minutos, 16:9: en el valle del Hudson de 1790, el maestro Ichabod Crane, larguirucho, supersticioso y siempre hambriento, corteja a Katrina mientras el bromista Brom Bones también la quiere; tras los cuentos de fantasmas de la fiesta de otoño vuelve solo a medianoche, el Jinete sin Cabeza lo persigue hasta el puente de la iglesia y le lanza una calabaza en llamas, y a la mañana solo quedan su sombrero y una calabaza rota. Cuéntalo como junto a una fogata: inquietante pero nunca sangriento, apto para familias; narración moderna escrita por ti y como mucho una línea citada. Estilo de cine con arte y personajes coherentes, y luz de luna, niebla, hojas, velas, paralaje del galope y cortes cada vez más rápidos dibujados en código, con el destello y los pedazos de calabaza en la palabra «pumpkin». Voz grave en inglés en la nube y música original que acelera en la persecución y se corta en seco con la calabaza. Primero una vista previa en vivo; exporta el MP4 solo cuando me guste.",
  "de": "Mach aus Washington Irvings gemeinfreier Erzählung „Die Legende von Sleepy Hollow“ (1820) einen zweiminütigen englischen Story-Kurzfilm im Querformat (16:9): Im Hudson-Tal 1790 wirbt der lange, abergläubische, ewig hungrige Lehrer Ichabod Crane um Katrina, während der Spaßvogel Brom Bones sie auch will; nach Gespenstergeschichten beim Herbstfest reitet er um Mitternacht allein heim, der kopflose Reiter jagt ihn bis zur Kirchbrücke und schleudert einen brennenden Kürbis, und am Morgen bleiben nur Hut und zerschmetterter Kürbis. Erzähl es wie am Lagerfeuer: gruselig, nie blutig, familientauglich; eigener moderner Sprechertext, höchstens eine Zeile Originalzitat. Filmisch, mit einheitlichem Stil und gleichen Figuren; Mondlicht, Nebel, Laub, Kerzen, Galopp-Parallaxe und immer schnellere Schnitte im Code gezeichnet, Blitz und Kürbisscherben genau auf „pumpkin“. Tiefe englische Cloud-Stimme und eigene Musik, die in der Jagd schneller wird und beim Kürbis abrupt endet. Zeig mir zuerst die Live-Vorschau; exportiere die MP4 erst, wenn ich zufrieden bin.",
  "fr": "Faites du conte de Washington Irving tombé dans le domaine public « La Légende de Sleepy Hollow » (1820) un court métrage en anglais de deux minutes, 16:9 : dans la vallée de l’Hudson en 1790, l’instituteur Ichabod Crane, long, superstitieux et toujours affamé, courtise Katrina tandis que le farceur Brom Bones la veut aussi ; après les histoires de fantômes de la fête d’automne, il rentre seul à minuit, le Cavalier sans tête le poursuit jusqu’au pont de l’église et lui lance une citrouille enflammée, et au matin il ne reste que son chapeau et une citrouille écrasée. Racontez-le comme au coin du feu : inquiétant mais jamais sanglant, pour toute la famille ; narration moderne écrite par vous, au plus une ligne citée. Rendu de cinéma, style et personnages cohérents ; lune, brume, feuilles, bougies, parallaxe du galop et coupes de plus en plus rapides dessinés en code, l’éclair et les éclats de citrouille sur le mot « pumpkin ». Voix grave en anglais dans le cloud et musique originale qui accélère pendant la poursuite et s’arrête net sur la citrouille. D’abord un aperçu en direct ; n’exportez le MP4 que si cela me plaît.",
  "pt-BR": "Transforme o conto de domínio público de Washington Irving “The Legend of Sleepy Hollow” (1820) num curta em inglês de dois minutos, 16:9: no vale do Hudson em 1790, o professor Ichabod Crane, magricela, supersticioso e sempre faminto, corteja Katrina enquanto o brincalhão Brom Bones também a quer; depois das histórias de fantasmas da festa de outono ele volta sozinho à meia-noite, o Cavaleiro sem Cabeça o persegue até a ponte da igreja e arremessa uma abóbora em chamas, e de manhã só restam o chapéu e uma abóbora despedaçada. Conte como ao redor da fogueira: assustador, nunca sangrento, bom para a família; narração moderna escrita por você, no máximo uma linha citada. Cara de cinema, arte e personagens consistentes; luar, névoa, folhas, velas, paralaxe do galope e cortes cada vez mais rápidos desenhados em código, com o clarão e os pedaços de abóbora na palavra “pumpkin”. Voz grave em inglês na nuvem e trilha original que acelera na perseguição e para de repente na abóbora. Primeiro uma prévia ao vivo; só exporte o MP4 quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 自写公版故事英文复述与幕代码，先做人物设定再生成统一风格底图和剪影。
- 选 Charon 云端旁白，按故事段落改变讲法；转写校验并本地对齐逐词时间。
- Lyria 候选曲剪为七段对位，NumPy 合成音效；南瓜爆裂与音乐骤停对齐关键词。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 529 条，账面合计 US$3.5844；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 部分 Pro TTS 按工具包统一单价记账，可能低于实际计费。

## 踩坑与验证边界

- JPEG 底图曾导致重复渲染边缘差异，改 PNG 后复渲一致；该结论来自本片实测。
- 英文短句字幕曾合并丢空格；片中改句绕过，后续应用修复不改变这段历史。
- 合成马蹄与猫头鹰被听评代理判不像，最终删去；交叉淡化叠加黑场也曾产生黑帧。

## 依据

- 公开包内 prompt.json：S109 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：sleepy-hollow-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
