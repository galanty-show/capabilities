# S113 · 守株待兔 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 视觉素材：Pillow + numpy (chroma key)（本地）
- 配音/对齐/校验：Gemini TTS · Gemini 2.5 Pro Preview TTS · Leda, Achird（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配乐/音效：Google Lyria · lyria-3.5（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Waiting by the Stump（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "给 4～9 岁的小朋友做一支约 90 秒的中文寓言动画《守株待兔》，横版（16:9）：农夫捡到一只撞上树桩、晕乎乎直冒星星的兔子，从此扔下锄头天天坐在树桩边等，日历越翻越快，刮风下雨下雪，野草长得快把他埋起来，最后他想明白了，扛起锄头回到田里。要好笑、适龄：不出现死亡和血，短句口语。画面用明亮的剪纸绘本风，农夫和兔子前后一致；用代码做日夜交替、天数越数越快、天气按参数切换、撞树时画面震动和转圈的星星、问号和省略号气泡。旁白用活泼幽默的云端配音，农夫的台词换一个声音；配乐原创，俏皮的笛子、琵琶和木鱼，等待时慵懒、结尾明亮，音效用代码合成。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a funny Chinese fable cartoon for children aged 4 to 9, about 90 seconds, 16:9 landscape: “Waiting by the Stump” (守株待兔). A farmer finds a rabbit that has bumped into a tree stump and sits there dizzy, seeing stars; from then on he throws away his hoe and waits by the stump every day while a tear-off calendar flips faster and faster, wind, rain and snow come and go, and the weeds almost bury him — until he gets it, shoulders his hoe and goes back to his field. Keep it age-appropriate (no death or blood) with short, spoken sentences. Use a bright paper-cut picture-book look with the same farmer and rabbit throughout, and build in code the day–night cycle, a day count that speeds up, weather switched by a parameter, a screen shake with circling stars for the bump, and “?” and “…” bubbles. Use a lively cloud voice for the narration and another voice for the farmer's line; compose playful original music with flute, pipa and woodblock, lazy while he waits and bright at the end, plus code-made sound effects. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "給 4～9 歲的小朋友做一支約 90 秒的中文寓言動畫《守株待兔》，橫版（16:9）：農夫撿到一隻撞上樹樁、暈乎乎直冒星星的兔子，從此扔下鋤頭天天坐在樹樁邊等，日曆越翻越快，颳風下雨下雪，野草長得快把他埋起來，最後他想明白了，扛起鋤頭回到田裡。要好笑、適齡：不出現死亡和血，短句口語。畫面用明亮的剪紙繪本風，農夫和兔子前後一致；用程式碼做日夜交替、天數越數越快、天氣依參數切換、撞樹時畫面震動和轉圈的星星、問號和省略號氣泡。旁白用活潑幽默的雲端配音，農夫的台詞換一個聲音；配樂原創，俏皮的笛子、琵琶和木魚，等待時慵懶、結尾明亮，音效用程式碼合成。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "4〜9歳の子ども向けに、約90秒の中国語の寓話アニメ『守株待兎（しゅしゅたいと）』を横長（16:9）で作ってください。農夫は切り株にぶつかって目を回し、星がぐるぐる回っているウサギを拾い、それからはくわを放り出して毎日切り株のそばで待ち続けます。日めくりカレンダーはどんどん速くめくれ、風が吹き、雨が降り、雪が降り、雑草は彼が埋もれそうなほど伸びていきます。最後に彼はやっと気づき、くわを担いで畑に戻ります。笑えて年齢にふさわしい内容にし、死や血は出さず、短い話し言葉の文にしてください。画面は明るい切り絵の絵本風で、農夫とウサギの見た目は最後まで統一してください。昼と夜の移り変わり、どんどん速くなる日数のカウント、パラメーターで切り替わる天気、ぶつかった瞬間の画面の揺れと回る星、「?」と「…」の吹き出しはコードで作ってください。ナレーションは明るくユーモアのあるクラウド音声にし、農夫のセリフだけ別の声にしてください。BGMはオリジナルで、笛・琵琶・木魚を使った遊び心のある曲にし、待っている場面はのんびり、結末は明るくして、効果音はコードで合成してください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "4~9세 어린이를 위한 90초 정도의 중국어 우화 애니메이션 『수주대토(守株待兔)』를 가로형(16:9)으로 만들어 주세요. 농부가 나무 그루터기에 부딪혀 어질어질 별을 보는 토끼를 줍고, 그 뒤로는 괭이를 내던지고 날마다 그루터기 옆에 앉아 기다려요. 달력은 점점 빨리 넘어가고, 바람이 불고 비가 오고 눈이 내리고, 잡초는 농부를 거의 덮을 만큼 자라요. 마지막에 농부는 깨닫고 괭이를 메고 밭으로 돌아가요. 웃기면서도 나이에 맞게 해 주세요. 죽음이나 피는 나오지 않게 하고, 짧은 구어체 문장으로 써 주세요. 화면은 밝은 종이 오리기 그림책 풍으로, 농부와 토끼의 모습은 처음부터 끝까지 똑같이 유지해 주세요. 낮과 밤이 바뀌는 장면, 점점 빨라지는 날짜 세기, 파라미터로 바꾸는 날씨, 부딪힐 때의 화면 흔들림과 빙글빙글 도는 별, '?'와 '…' 말풍선은 코드로 만들어 주세요. 내레이션은 발랄하고 유머러스한 클라우드 음성으로, 농부의 대사는 다른 목소리로 해 주세요. 음악은 피리, 비파, 목탁을 쓴 장난스러운 오리지널 곡으로 만들고, 기다리는 장면은 나른하게, 결말은 밝게 해 주세요. 효과음은 코드로 합성해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un dibujo animado divertido de una fábula china para niños de 4 a 9 años, de unos 90 segundos, en horizontal 16:9: «Esperando junto al tocón» (守株待兔). Un campesino encuentra un conejo que se chocó contra un tocón y quedó mareado, viendo estrellitas; desde entonces tira la azada y espera junto al tocón cada día, mientras un calendario pasa cada vez más rápido, llegan el viento, la lluvia y la nieve, y la maleza casi lo tapa, hasta que lo entiende, se echa la azada al hombro y vuelve a su campo. Que sea apropiado para su edad (sin muerte ni sangre), con frases cortas y habladas. Usa un estilo alegre de libro ilustrado de papel recortado, con el mismo campesino y conejo todo el tiempo, y haz con código el ciclo de día y noche, la cuenta de días que se acelera, el clima cambiado por un parámetro, la sacudida con estrellas girando en el choque y los bocadillos «?» y «…». Narra con una voz en la nube alegre y da otra voz a la frase del campesino; compón música original juguetona con flauta, pipa y bloque de madera, perezosa mientras espera y luminosa al final, con efectos hechos por código. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach einen lustigen chinesischen Fabel-Zeichentrickfilm für Kinder von 4 bis 9 Jahren, etwa 90 Sekunden, Querformat 16:9: „Warten am Baumstumpf“ (守株待兔). Ein Bauer findet einen Hasen, der gegen einen Baumstumpf gerannt ist und benommen Sterne sieht; von da an wirft er die Hacke weg und wartet jeden Tag am Stumpf, während ein Abreißkalender immer schneller blättert, Wind, Regen und Schnee kommen und das Unkraut ihn fast verschluckt – bis er es begreift, die Hacke schultert und zurück aufs Feld geht. Altersgerecht (ohne Tod und Blut), mit kurzen, gesprochenen Sätzen. Nutze einen hellen Scherenschnitt-Bilderbuchlook mit durchgehend demselben Bauern und Hasen und baue im Code: Tag-und-Nacht-Wechsel, eine immer schneller zählende Tageszahl, Wetter per Parameter, Wackeln und kreisende Sterne beim Zusammenstoß sowie „?“- und „…“-Sprechblasen. Lass eine lebhafte Cloud-Stimme erzählen, mit einer anderen Stimme für den Satz des Bauern; komponiere verspielte eigene Musik mit Flöte, Pipa und Holzblock, träge beim Warten und hell am Ende, dazu Soundeffekte aus Code. Zeig mir zuerst die Live-Vorschau und exportiere die MP4 erst, wenn ich zufrieden bin.",
  "fr": "Réalisez un dessin animé drôle tiré d'une fable chinoise pour les 4-9 ans, d'environ 90 secondes, en paysage 16:9 : « Attendre près de la souche » (守株待兔). Un paysan trouve un lapin qui s'est cogné contre une souche et reste étourdi à voir des étoiles ; dès lors, il jette sa houe et attend chaque jour près de la souche, tandis qu'un éphéméride s'effeuille de plus en plus vite, que vent, pluie et neige passent et que les herbes l'ensevelissent presque – jusqu'à ce qu'il comprenne et retourne à son champ, la houe sur l'épaule. Contenu adapté à leur âge (ni mort ni sang), phrases courtes et parlées. Style lumineux d'album en papier découpé, même paysan et même lapin partout ; en code : alternance jour-nuit, compte des jours qui s'accélère, météo changée par un paramètre, secousse et étoiles qui tournent au choc, bulles « ? » et « … ». Une voix cloud vive pour la narration, une autre pour la réplique du paysan ; musique originale espiègle (flûte, pipa, wood-block), nonchalante pendant l'attente et lumineuse à la fin, effets sonores faits par code. Montrez-moi d'abord l'aperçu en direct ; n'exportez le MP4 que lorsqu'il me convient.",
  "pt-BR": "Faça um desenho animado engraçado de uma fábula chinesa para crianças de 4 a 9 anos, com cerca de 90 segundos, na horizontal 16:9: “Esperando junto ao toco” (守株待兔). Um camponês encontra um coelho que bateu num toco e ficou tonto, vendo estrelinhas; daí em diante ele joga a enxada fora e espera junto ao toco todo dia, enquanto um calendário vira cada vez mais rápido, vêm vento, chuva e neve, e o mato quase o cobre — até que ele entende, põe a enxada no ombro e volta para a roça. Mantenha adequado à idade (sem morte nem sangue), com frases curtas e faladas. Use um visual alegre de livro ilustrado em papel recortado, com o mesmo camponês e coelho do começo ao fim, e faça em código a troca de dia e noite, a contagem de dias que acelera, o clima trocado por parâmetro, o tremor com estrelas girando na batida e os balões “?” e “…”. Narre com uma voz na nuvem animada e dê outra voz à fala do camponês; componha trilha original brincalhona com flauta, pipa e bloco de madeira, preguiçosa na espera e luminosa no fim, com efeitos feitos por código. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 自写儿童故事与 13 幕代码，生成两张底图及角色绿幕贴纸，离线抠图并烘焙投影。
- 旁白与农夫对白分音色，云端配音后逐句转拼音校验。
- Lyria 候选曲按段落剪接，NumPy 合成音效；抽帧与听评代理反馈后修改。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 385 条，账面合计 US$2.5621；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 部分 Pro TTS 按工具包统一单价记账，可能低于实际计费。 原 README 按 Pro 单价修正后估计约 US$2.7。 另一语言配音与校验另有 42 条账面 US$0.0293，与原制作分开记。

## 踩坑与验证边界

- 第一次合成的鸡叫被听评代理听成尖叫，改为笛声滑音。
- Pro TTS 账面使用统一单价，需保留实际费用与账面不同的说明。

## 依据

- 公开包内 prompt.json：S113 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：shouzhu-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 另一语言保留档案标识：shouzhu-20261013-i18n / cost-ledger.jsonl。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
