# S110 · The Gift of the Magi · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 视觉素材：STIX Two Text (SIL OFL 1.1)（本地）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Sulafat（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · The Gift of the Magi（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "用两分钟左右讲 O. Henry 的公版短篇《麦琪的礼物》（The Gift of the Magi），做成横版（16:9）英文故事短片：圣诞前夜，Della 只有一块八毛七，她卖掉及膝的长发给 Jim 买白金表链，Jim 却卖掉祖传金表给她买了一套梳子。旁白用现代英文自己复述，结尾可以短引原文 “They are the magi.”。调性温暖、克制、带点幽默，反转处静一拍。画面签名用代码做：硬币一枚枚数到 $1.87 的计数器、窗外的雪和煤气灯、长发上的流光、怀表和挂钟的秒针、橱窗里发光的表链、反转时和前面呼应的左右分屏。人物前后一致，插画统一成 1905 年纽约的暖色油画质感，需要的底图可以生成。用温暖的云端英文配音，配乐原创（钢琴 + 弦乐 + 一点音乐盒）并按时间轴卡点，硬币、剪刀、开门风铃这些音效用代码合成。先即时播放给我看，满意了再导出 MP4。",
  "en": "Tell O. Henry's public-domain story “The Gift of the Magi” in about two minutes as a 16:9 landscape short in English: on Christmas Eve Della has one dollar and eighty-seven cents, so she sells her knee-length hair to buy Jim a platinum watch chain, while Jim sells his family gold watch to buy her a set of combs. Write a modern English retelling for the narration and end with a short quote from the original, “They are the magi.” Keep it warm, restrained and a little funny, with a beat of silence at the twist. Build the signature shots in code: a counter that counts coins up to $1.87, snow and gas lamps outside the window, light flowing down her long hair, the second hands of a pocket watch and a wall clock, a glowing chain in a shop window, and a split screen at the twist that mirrors an earlier one. Keep the characters consistent in one warm 1905 New York oil-painting style, and generate any background art you need. Use a warm cloud English voice and an original score (piano, strings and a little music box) cut to the timeline, with coins, scissors and a door bell synthesized in code. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "用大約兩分鐘講 O. Henry 的公版短篇《麥琪的禮物》（The Gift of the Magi），做成橫版（16:9）英文故事短片：聖誕前夕，Della 只有一塊八毛七，她賣掉及膝的長髮給 Jim 買白金錶鏈，Jim 卻賣掉祖傳金錶給她買了一套梳子。旁白用現代英文自己重述，結尾可以短引原文 “They are the magi.”。調性溫暖、克制、帶點幽默，反轉處靜一拍。畫面招牌鏡頭用程式碼做：硬幣一枚枚數到 $1.87 的計數器、窗外的雪和煤氣燈、長髮上的流光、懷錶和掛鐘的秒針、櫥窗裡發光的錶鏈、反轉時和前面呼應的左右分割畫面。人物前後一致，插畫統一成 1905 年紐約的暖色油畫質感，需要的底圖可以生成。用溫暖的雲端英文配音，配樂原創（鋼琴 + 弦樂 + 一點音樂盒）並依時間軸卡點，硬幣、剪刀、開門風鈴這些音效用程式碼合成。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "O. ヘンリーのパブリックドメインの短編『賢者の贈り物』（The Gift of the Magi）を、約2分の横長（16:9）英語ショートにしてください。クリスマスイブ、デラの手元には1ドル87セントしかなく、彼女は膝まである髪を売ってジムにプラチナの時計鎖を買いますが、ジムは祖父譲りの金時計を売って彼女に櫛のセットを買っていました。ナレーションは現代英語で自分で語り直し、最後に原文の “They are the magi.” を短く引用してかまいません。トーンは温かく、抑えめで、少しユーモアを。どんでん返しの瞬間には一拍の静けさを。見せ場はコードで作ってください。硬貨を1枚ずつ数えて $1.87 になるカウンター、窓の外の雪とガス灯、長い髪を流れる光、懐中時計と掛け時計の秒針、ショーウィンドウで輝く時計鎖、そして前半と呼応する左右分割画面のどんでん返し。人物は最初から最後まで一貫させ、1905年ニューヨークの温かい油彩画のタッチで統一し、必要な背景画は生成してかまいません。温かみのあるクラウドの英語音声を使い、BGM はオリジナル（ピアノ＋弦楽＋少しオルゴール）でタイムラインに合わせ、硬貨・ハサミ・ドアベルの効果音はコードで合成してください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "O. 헨리의 퍼블릭 도메인 단편 『크리스마스 선물』(The Gift of the Magi)을 약 2분짜리 가로형(16:9) 영어 단편으로 만들어 주세요. 크리스마스이브, 델라에게는 1달러 87센트뿐이라 무릎까지 오는 머리카락을 팔아 짐에게 백금 시곗줄을 사 주지만, 짐은 할아버지 때부터 내려온 금시계를 팔아 그녀에게 빗 세트를 사 왔습니다. 내레이션은 현대 영어로 직접 다시 쓰고, 마지막에 원문 “They are the magi.”를 짧게 인용해도 좋아요. 톤은 따뜻하고 절제되게, 약간의 유머와 함께, 반전 순간에는 한 박자 정적을 두세요. 대표 장면은 코드로 만들어 주세요. 동전을 하나씩 세어 $1.87이 되는 카운터, 창밖의 눈과 가스등, 긴 머리카락을 타고 흐르는 빛, 회중시계와 벽시계의 초침, 진열창 속에서 빛나는 시곗줄, 그리고 앞부분과 짝을 이루는 좌우 분할 화면의 반전이요. 인물은 처음부터 끝까지 일관되게, 그림은 1905년 뉴욕의 따뜻한 유화 느낌으로 통일하고, 필요한 배경 그림은 생성해도 됩니다. 따뜻한 클라우드 영어 음성을 쓰고, 음악은 오리지널(피아노 + 현악 + 약간의 오르골)로 타임라인에 맞추며, 동전·가위·문 종소리 효과음은 코드로 합성해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Cuenta en unos dos minutos «El regalo de los Reyes Magos» (The Gift of the Magi), el relato de dominio público de O. Henry, como un corto horizontal 16:9 en inglés: en Nochebuena Della solo tiene un dólar con ochenta y siete; vende su melena para comprarle a Jim una cadena de platino para el reloj, y Jim vende su reloj de oro para regalarle unas peinetas. Escribe tú la narración en inglés moderno y cierra con la cita breve “They are the magi.” Tono cálido, contenido y con algo de humor, con un silencio en el giro final. Haz en código los planos clave: un contador de monedas hasta $1.87, nieve y farolas de gas, luz que recorre su melena, los segunderos de un reloj de bolsillo y de uno de pared, una cadena que brilla en un escaparate y una pantalla dividida en el giro que refleja otra anterior. Personajes coherentes en un único estilo de óleo cálido del Nueva York de 1905; genera los fondos que hagan falta. Voz cálida en inglés en la nube y música original (piano, cuerdas y algo de caja de música) ajustada a la línea de tiempo, con monedas, tijeras y campanilla sintetizadas en código. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Erzähl O. Henrys gemeinfreie Geschichte „Das Geschenk der Weisen“ (The Gift of the Magi) in etwa zwei Minuten als englischen Kurzfilm im Querformat (16:9): An Heiligabend hat Della nur einen Dollar siebenundachtzig; sie verkauft ihr knielanges Haar für eine Uhrkette aus Platin, während Jim seine goldene Familienuhr verkauft, um ihr Kämme zu schenken. Schreib den Sprechertext als eigene Nacherzählung in modernem Englisch und schließe mit dem kurzen Zitat „They are the magi.“ Warm, zurückhaltend, ein wenig humorvoll, mit einem Moment Stille bei der Wendung. Bau die Schlüsselbilder in Code: einen Münzzähler bis $1.87, Schnee und Gaslaternen, Licht, das am langen Haar herabfließt, Sekundenzeiger von Taschen- und Wanduhr, eine leuchtende Kette im Schaufenster und bei der Wendung einen geteilten Bildschirm, der einen früheren spiegelt. Figuren durchgehend gleich, im warmen Ölgemälde-Stil des New York von 1905; Hintergründe darfst du erzeugen. Warme englische Cloud-Stimme, eigene Musik (Klavier, Streicher, etwas Spieluhr) auf die Zeitleiste geschnitten, Münzen, Schere und Türglocke in Code synthetisiert. Zeig mir zuerst die Live-Vorschau, exportiere die MP4 erst, wenn ich zufrieden bin.",
  "fr": "Racontez en deux minutes environ « Le Cadeau des Mages » (The Gift of the Magi), nouvelle d'O. Henry du domaine public, en court métrage anglais au format paysage (16:9) : la veille de Noël, Della n'a qu'un dollar quatre-vingt-sept ; elle vend sa longue chevelure pour offrir à Jim une chaîne de montre en platine, et Jim vend sa montre en or pour lui acheter des peignes. Écrivez vous-même la narration en anglais moderne et terminez par la courte citation « They are the magi. » Ton chaleureux, retenu, avec une pointe d'humour et un temps de silence au retournement. Faites en code les plans clés : un compteur de pièces jusqu'à $1.87, la neige et les becs de gaz, la lumière qui coule le long de ses cheveux, les trotteuses d'une montre de poche et d'une horloge, une chaîne qui brille en vitrine, et un écran partagé au retournement qui fait écho à un plan précédent. Personnages cohérents, style d'huile chaleureuse du New York de 1905 ; générez les fonds utiles. Voix anglaise chaleureuse (cloud), musique originale (piano, cordes, boîte à musique) calée sur la timeline, bruitages synthétisés en code. Montrez-moi d'abord l'aperçu en direct, puis exportez le MP4 quand il me plaît.",
  "pt-BR": "Conte em cerca de dois minutos “O Presente dos Magos” (The Gift of the Magi), o conto de domínio público de O. Henry, como um curta em inglês na horizontal (16:9): na véspera de Natal, Della tem só um dólar e oitenta e sete; vende o cabelo comprido para comprar a Jim uma corrente de platina para o relógio, e Jim vende o relógio de ouro da família para dar a ela uns pentes. Escreva você a narração em inglês moderno e termine com a citação curta “They are the magi.” Tom caloroso, contido e com um pouco de humor, com um instante de silêncio na virada. Faça em código as cenas-chave: um contador de moedas até $1.87, neve e lampiões a gás, luz escorrendo pelo cabelo, os ponteiros de segundos de um relógio de bolso e de parede, uma corrente brilhando na vitrine e uma tela dividida na virada que espelha outra anterior. Personagens consistentes num único estilo de óleo caloroso da Nova York de 1905; gere os fundos que precisar. Voz calorosa em inglês na nuvem e trilha original (piano, cordas e um pouco de caixinha de música) ajustada à linha do tempo, com moedas, tesoura e sininho sintetizados em código. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 自写公版故事现代英文复述，制作人物参考、底图与 12 个幕模块。
- 试听并制作云端旁白，逐词转写校验；用代码绘制硬币、金额、钟表与剪刀。
- Lyria 曲目按叙事与实测配音时间剪辑，音效按词对位，抽帧与混音修改后再次导出。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 312 条，账面合计 US$3.4847；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。

## 踩坑与验证边界

- 校验把英文金额转成数字，造成同一句无效重录八次；改为要求数字拼成单词并归一后比较。
- 运行时 CSS filter 不用于调色，改用叠色层；听评反馈后修了配乐让位与剪刀、硬币音量。

## 依据

- 公开包内 prompt.json：S110 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：gift-magi-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
