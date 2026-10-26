# S111 · John Henry, the Steel-Driving Man · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 2.5 Pro TTS · Algenib（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Steel-Driving Man（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "用约两分钟、横版（16:9），做一支美国民间传说 John Henry 的原创英文故事短片：19 世纪 70 年代铁路隧道里的钢钎手，传说生来手里就攥着锤子，和推销员带来的蒸汽钻机比赛凿山，赢了，倒下时锤子还握在手里。旁白自己写，讲明这是传说，传统民歌最多化用一两句，不要照抄现代录音的歌词。John Henry 和工友要画得有尊严、有力量。底图生成麻胶版画 / WPA 壁画风，标志性画面用代码做：锤击和火星严格卡在节拍上、实时进尺对比图（14 英尺对 9 英尺，注明是传说里的数）、蒸汽钻机的活塞运动、比赛段越剪越快、倒下时一切静止只剩心跳。旁白用低沉温暖的云端配音，配乐原创劳动号子式布鲁斯，比赛段加速、倒下处骤停、最后一段口琴余韵。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make an original two-minute English retelling of the American folk legend John Henry as a 16:9 story film: the steel-driving man of the 1870s railroad tunnels, said to be born with a hammer in hand, who raced a salesman's steam drill through a mountain, won, and died with his hammer in his hand. Write the narration yourself, frame it as a legend, borrow at most a line or two of the traditional ballad and never copy modern recorded lyrics. Portray John Henry and his crew as dignified, powerful working men. Generate plates in a linocut / WPA-mural look, and draw the signature moments in code: hammer strikes and sparks locked to the beat, a live depth chart (14 feet against 9, marked as the legend's figures), steam-drill pistons, cuts that get faster during the race, and a freeze with only a heartbeat when he falls. Use a deep, warm cloud narrator and an original work-song blues score that speeds up in the race, stops dead at the fall and ends on a harmonica coda. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "用大約兩分鐘、橫版（16:9），做一支美國民間傳說 John Henry 的原創英文故事短片：19 世紀 70 年代鐵路隧道裡的鋼釺手，傳說生來手裡就攥著錘子，和推銷員帶來的蒸汽鑽機比賽鑿山，贏了，倒下時錘子還握在手裡。旁白自己寫，講明這是傳說，傳統民歌最多化用一兩句，不要照抄現代錄音的歌詞。John Henry 和工友要畫得有尊嚴、有力量。底圖生成麻膠版畫／WPA 壁畫風，標誌性畫面用程式碼做：錘擊和火星嚴格卡在節拍上、即時進尺對比圖（14 英尺對 9 英尺，註明是傳說裡的數字）、蒸汽鑽機的活塞運動、比賽段越剪越快、倒下時一切靜止只剩心跳。旁白用低沉溫暖的雲端配音，配樂原創勞動號子式藍調，比賽段加速、倒下處驟停、最後一段口琴餘韻。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "アメリカの民間伝説ジョン・ヘンリーを、約2分・横長（16:9）のオリジナル英語ストーリー映像にしてください。1870年代の鉄道トンネルで働いた鋼鉄打ち（スティール・ドライバー）で、生まれたときからハンマーを握っていたと語られる男が、セールスマンの持ち込んだ蒸気ドリルと山を掘る勝負をして勝ち、ハンマーを握ったまま倒れる物語です。ナレーションは自分で書き、伝説であることがわかるように語り、伝承歌は一、二節を下敷きにする程度にとどめ、現代の録音の歌詞は写さないでください。ジョン・ヘンリーと仲間たちは尊厳と力強さのある労働者として描いてください。背景画はリノカット／WPA 壁画風で生成し、見せ場はコードで描きます。ハンマーと火花をビートに合わせる、掘進の深さをリアルタイムで比べる図（14 フィート対 9 フィート、伝説上の数字と明記）、蒸気ドリルのピストン、レース中にだんだん速くなるカット、倒れた瞬間にすべてが止まり心音だけが残る場面。ナレーションは低く温かいクラウド音声、音楽はオリジナルのワークソング調ブルースで、レースで加速し、倒れる瞬間にぴたりと止まり、最後はハーモニカの余韻で終えてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "미국 민간 전설 존 헨리를 약 2분 길이의 가로형(16:9) 영어 창작 이야기 영상으로 만들어 주세요. 1870년대 철도 터널의 착암공(스틸 드라이빙 맨)으로, 태어날 때부터 손에 망치를 쥐고 있었다고 전해지는 사람이 세일즈맨이 끌고 온 증기 드릴과 산을 뚫는 시합을 벌여 이기고, 망치를 손에 쥔 채 쓰러지는 이야기예요. 내레이션은 직접 쓰고 전설이라는 점을 분명히 하되, 전통 민요는 한두 구절만 빌려 쓰고 현대 녹음의 가사는 베끼지 마세요. 존 헨리와 동료들은 존엄하고 힘 있는 노동자로 그려 주세요. 배경 그림은 리놀륨 판화 / WPA 벽화풍으로 생성하고, 핵심 장면은 코드로 그려 주세요. 박자에 딱 맞는 망치질과 불꽃, 실시간 굴진 깊이 비교 그래프(14피트 대 9피트, 전설 속 숫자라고 표시), 증기 드릴의 피스톤 움직임, 시합 동안 점점 빨라지는 컷, 쓰러지는 순간 모든 것이 멈추고 심장 소리만 남는 장면이요. 내레이션은 낮고 따뜻한 클라우드 음성으로, 음악은 시합에서 빨라지고 쓰러지는 순간 뚝 멈추며 하모니카 여운으로 끝나는 오리지널 노동요풍 블루스로 해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz en unos dos minutos, en horizontal 16:9, un relato original en inglés de la leyenda estadounidense de John Henry: el perforador de los túneles ferroviarios de la década de 1870, que según cuentan nació con un martillo en la mano, compitió contra el taladro de vapor de un vendedor para atravesar una montaña, ganó y murió con el martillo en la mano. Escribe tú la narración, preséntala como leyenda, toma como mucho uno o dos versos de la balada tradicional y no copies letras de grabaciones modernas. Retrata a John Henry y a su cuadrilla como trabajadores dignos y fuertes. Genera los fondos con estética de linograbado / mural WPA y dibuja en código los momentos clave: martillazos y chispas al ritmo, un gráfico en vivo de la profundidad (14 pies contra 9, cifras de la leyenda), los pistones del taladro de vapor, cortes cada vez más rápidos en la carrera y una imagen congelada con solo un latido cuando cae. Usa una voz en la nube grave y cálida y un blues original de canto de trabajo que acelere en la carrera, se corte en seco al caer y cierre con una coda de armónica. Muéstrame primero una vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach in etwa zwei Minuten im Querformat (16:9) eine eigene englische Nacherzählung der amerikanischen Legende von John Henry: der Steel-Driving Man der Eisenbahntunnel der 1870er-Jahre, angeblich mit einem Hammer in der Hand geboren, der gegen den Dampfbohrer eines Vertreters einen Berg durchbohrte, gewann und mit dem Hammer in der Hand starb. Schreib den Erzähltext selbst, kennzeichne die Geschichte als Legende, übernimm höchstens ein, zwei Zeilen der traditionellen Ballade und kopiere keine Texte moderner Aufnahmen. Zeig John Henry und seine Kolonne als würdevolle, starke Arbeiter. Erzeuge die Hintergründe im Stil von Linolschnitt und WPA-Wandbild und zeichne die Schlüsselmomente im Code: Hammerschläge und Funken auf dem Takt, ein Live-Diagramm der Bohrtiefe (14 gegen 9 Fuß, Zahlen der Legende), die Kolben des Dampfbohrers, im Rennen immer schnellere Schnitte und ein Standbild, in dem beim Sturz nur ein Herzschlag bleibt. Nimm eine tiefe, warme Cloud-Stimme und eigenen Worksong-Blues, der im Rennen schneller wird, beim Sturz abbricht und mit einer Mundharmonika-Coda endet. Zeig mir zuerst eine Live-Vorschau und exportiere das MP4 erst, wenn ich zufrieden bin.",
  "fr": "Réalise en deux minutes environ, en 16:9, un récit original en anglais de la légende américaine de John Henry : le foreur des tunnels ferroviaires des années 1870, né, dit-on, un marteau à la main, qui affronta la foreuse à vapeur d'un représentant pour percer une montagne, gagna, et mourut le marteau à la main. Écris la narration, présente-la comme une légende, emprunte au plus un ou deux vers de la ballade traditionnelle et ne copie aucune parole d'enregistrement moderne. Montre John Henry et son équipe comme des travailleurs dignes et puissants. Génère les fonds en style linogravure / fresque WPA et dessine en code les temps forts : coups de marteau et étincelles calés sur le temps, un graphique en direct de la profondeur (14 pieds contre 9, chiffres de la légende), les pistons de la foreuse, des coupes de plus en plus rapides pendant la course, et un arrêt sur image où ne reste qu'un battement de cœur quand il tombe. Prends une voix cloud grave et chaleureuse et un blues original de chant de travail qui accélère pendant la course, s'arrête net à la chute et finit sur une coda d'harmonica. Montre-moi d'abord un aperçu en direct, et n'exporte le MP4 que lorsqu'il me plaît.",
  "pt-BR": "Faça, em cerca de dois minutos e em 16:9, uma releitura original em inglês da lenda americana de John Henry: o perfurador dos túneis ferroviários dos anos 1870 que, dizem, nasceu com um martelo na mão, disputou com a perfuratriz a vapor de um vendedor quem atravessava a montanha, venceu e morreu com o martelo na mão. Escreva você mesmo a narração, deixe claro que é uma lenda, aproveite no máximo um ou dois versos da balada tradicional e não copie letras de gravações modernas. Retrate John Henry e sua turma como trabalhadores dignos e fortes. Gere os fundos com cara de linoleogravura / mural da WPA e desenhe em código os momentos marcantes: marteladas e faíscas no tempo da música, um gráfico ao vivo da profundidade (14 pés contra 9, números da lenda), os pistões da perfuratriz, cortes cada vez mais rápidos na disputa e uma imagem congelada com só um batimento cardíaco quando ele cai. Use uma voz na nuvem grave e calorosa e um blues original de canto de trabalho que acelera na disputa, para de repente na queda e termina numa coda de gaita. Mostre primeiro uma prévia ao vivo e exporte o MP4 só quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 区分民间传说与史实，写英文复述、人物设定、底图与幕代码。
- 制作云端英文旁白并本地对齐，代码画锤击、火星与轨道。
- 实测配乐 92 BPM 网格，将画面、锤击、心跳与配乐共用同一张节拍表。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 293 条，账面合计 US$3.1542；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 部分 Pro TTS 按工具包统一单价记账，可能低于实际计费。 原 README 的实价估计不超过约 US$3.5，属于估计。

## 踩坑与验证边界

- 3.8 TTS 风格提示曾导致一句念十几秒，改为只给正文。
- 成本工具按统一 TTS 单价记账，Pro 实际单价更高，因此账面数不是完整实付。

## 依据

- 公开包内 prompt.json：S111 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：john-henry-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
