# S114 · 后羿射日 · 讲给小朋友 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 视觉素材：Ma Shan Zheng (SIL OFL 1.1)（本地）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Kore, Fenrir, Leda, Iapetus, Despina（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Houyi Shoots the Suns（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "给 4～9 岁的小朋友做一支约两分钟的中国神话动画《后羿射日》，横版 16:9。用口语短句讲，第一句就是钩子；十个太阳是天帝的孩子、圆滚滚的太阳鸟，被射中时变成金色羽毛落进大海，不写死亡、不吓人；后羿先劝它们回家，劝不回才拉弓，最后人们请他留下一个太阳。画面用中国风绘本插画，后羿前后长得一样；用代码做太阳数量从十倒数到一（每一箭有弧线、命中闪光和飘落的羽毛）、热浪与地面裂纹、下雨后裂缝合上小苗长出来的回春。旁白用亲切又有气势的云端配音，角色对白换不同音色；配乐原创，中国鼓加民族乐器，射日时鼓越来越密、最后一箭后留白，回春时转成温柔的竹笛。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a roughly two-minute Chinese myth animation, \"Hou Yi Shoots the Suns,\" for children aged 4 to 9, 16:9 landscape. Use short spoken sentences and open with a hook. The ten suns are round little sun-birds, children of the Heavenly Emperor; when an arrow hits one it turns into golden feathers that drift into the sea — no death, nothing scary. Hou Yi first asks them to go home and draws his bow only when they won't; in the end the people ask him to keep one sun. Chinese picture-book illustration style, Hou Yi looking the same throughout. In code: the suns counting down from ten to one (arc, hit flash and falling feathers for each arrow), heat shimmer and spreading cracks, and an ending where rain closes the cracks and seedlings sprout. A warm yet stirring cloud voice for the narrator, other voices for the characters; an original score with Chinese drums that speed up with the arrows, silence after the last arrow, and a gentle bamboo flute for the rain. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "給 4～9 歲的小朋友做一支約兩分鐘的中國神話動畫《后羿射日》，橫版 16:9。用口語短句講，第一句就是鉤子；十個太陽是天帝的孩子、圓滾滾的太陽鳥，被射中時變成金色羽毛落進大海，不寫死亡、不嚇人；后羿先勸牠們回家，勸不回才拉弓，最後人們請他留下一個太陽。畫面用中國風繪本插畫，后羿前後長得一樣；用程式碼做太陽數量從十倒數到一（每一箭有弧線、命中閃光和飄落的羽毛）、熱浪與地面裂紋、下雨後裂縫合上、小苗長出來的回春。旁白用親切又有氣勢的雲端配音，角色對白換不同音色；配樂原創，中國鼓加民族樂器，射日時鼓越來越密、最後一箭後留白，回春時轉成溫柔的竹笛。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "4〜9歳の子ども向けに、約2分の中国神話アニメ『后羿射日（こうげい、太陽を射る）』を横長（16:9）で作ってください。話し言葉の短い文で語り、最初の一文でつかみを入れてください。十個の太陽は天帝の子どもで、まんまるの太陽の鳥です。矢が当たると金色の羽になって海へ舞い落ちるようにし、死は描かず、怖くしないでください。后羿はまず家に帰るよう呼びかけ、聞かないときだけ弓を引き、最後は人々に頼まれて太陽を一つ残します。絵は中国風の絵本イラストで、后羿の見た目を最後までそろえてください。コードで、太陽の数が十から一へ減っていくカウント（矢ごとの弧、命中の光、舞い落ちる羽）、陽炎と地面に広がるひび割れ、雨でひびが閉じて苗が芽吹く結末を作ってください。ナレーションは親しみがありつつ力強いクラウドの声で、登場人物のせりふは別の声にしてください。音楽はオリジナルで、中国の太鼓と民族楽器を使い、矢に合わせて太鼓をだんだん速く、最後の一矢のあとに静寂を置き、雨と芽吹きの場面では優しい竹笛に変えてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "4~9세 어린이를 위한 약 2분짜리 중국 신화 애니메이션 『후예가 해를 쏘다(后羿射日)』를 가로형(16:9)으로 만들어 주세요. 짧은 구어체 문장으로 이야기하고, 첫 문장에서 바로 시선을 끌어 주세요. 열 개의 해는 천제의 아이들인 동글동글한 해 새들이고, 화살에 맞으면 금빛 깃털이 되어 바다로 떨어지게 해 주세요. 죽음은 그리지 말고 무섭지 않게요. 후예는 먼저 집에 돌아가라고 타이르고, 듣지 않을 때만 활을 당기며, 마지막에는 사람들이 해 하나는 남겨 달라고 부탁해요. 그림은 중국풍 그림책 일러스트로, 후예의 모습이 처음부터 끝까지 같아야 해요. 코드로 해의 수가 열에서 하나로 줄어드는 카운트(화살마다 포물선, 명중 섬광, 떨어지는 깃털), 아지랑이와 땅에 번지는 균열, 비가 내려 균열이 닫히고 새싹이 돋는 마무리를 만들어 주세요. 내레이션은 다정하면서도 힘 있는 클라우드 음성으로, 등장인물 대사는 다른 목소리로 해 주세요. 음악은 오리지널로 중국 북과 민족 악기를 쓰고, 화살에 맞춰 북이 점점 빨라지다가 마지막 화살 뒤에는 정적을 두고, 비와 새싹 장면에서는 부드러운 대나무 피리로 바꿔 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz una animación de unos dos minutos del mito chino «Hou Yi derriba los soles» para niños de 4 a 9 años, en horizontal 16:9. Frases cortas y orales, con un gancho al empezar. Los diez soles son pajaritos-sol redondos, hijos del Emperador del Cielo; si una flecha alcanza a uno, se convierte en plumas doradas que caen al mar: sin muertes ni sustos. Hou Yi primero les pide que vuelvan a casa y solo tensa el arco cuando no obedecen; al final la gente le pide que deje un sol. Estilo de libro ilustrado chino, con Hou Yi igual de principio a fin. Con código: la cuenta atrás de los soles de diez a uno (arco, destello y plumas en cada flecha), el aire que tiembla de calor y las grietas que se extienden, y un final en que la lluvia cierra las grietas y brotan los plantones. Voz en la nube cálida y con fuerza para el narrador y otras voces para los personajes; música original con tambores chinos que se aceleran con las flechas, un silencio tras la última y una flauta de bambú suave para la lluvia. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach eine etwa zweiminütige Animation zum chinesischen Mythos „Hou Yi schießt die Sonnen ab“ für Kinder von 4 bis 9 Jahren, Querformat 16:9. Kurze, gesprochene Sätze, mit einem Aufhänger am Anfang. Die zehn Sonnen sind kugelrunde Sonnenvögel, Kinder des Himmelskaisers; trifft sie ein Pfeil, werden sie zu goldenen Federn, die ins Meer schweben – kein Tod, nichts Gruseliges. Hou Yi bittet sie zuerst heimzufliegen und spannt den Bogen erst, als sie nicht hören; am Ende bitten ihn die Menschen, eine Sonne übrig zu lassen. Stil chinesischer Bilderbücher, Hou Yi durchgehend gleich. Im Code: der Countdown der Sonnen von zehn auf eins (Flugbogen, Lichtblitz und Federn bei jedem Pfeil), flirrende Hitze und sich ausbreitende Risse, und ein Ende, in dem Regen die Risse schließt und Setzlinge sprießen. Eine warme, kraftvolle Cloud-Stimme für die Erzählung, andere Stimmen für die Figuren; eigene Musik mit chinesischen Trommeln, die mit den Pfeilen schneller werden, Stille nach dem letzten Pfeil und einer sanften Bambusflöte im Regen. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Réalisez une animation d'environ deux minutes du mythe chinois « Hou Yi abat les soleils » pour des enfants de 4 à 9 ans, au format paysage 16:9. Phrases courtes et parlées, avec une accroche au début. Les dix soleils sont de petits oiseaux-soleils ronds, enfants de l'Empereur céleste ; quand une flèche en touche un, il devient des plumes dorées qui tombent dans la mer : pas de mort, rien d'effrayant. Hou Yi leur demande d'abord de rentrer et ne bande son arc que s'ils n'écoutent pas ; à la fin, les gens lui demandent de garder un soleil. Style livre illustré chinois, Hou Yi identique du début à la fin. En code : le compte à rebours des soleils de dix à un (trajectoire, éclair et plumes à chaque flèche), l'air qui tremble de chaleur et les fissures qui gagnent le sol, puis la pluie qui referme les fissures et les pousses qui sortent. Une voix cloud chaleureuse et entraînante pour le narrateur, d'autres voix pour les personnages ; une musique originale aux tambours chinois qui s'accélèrent avec les flèches, un silence après la dernière et une douce flûte de bambou sous la pluie. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça uma animação de cerca de dois minutos do mito chinês “Hou Yi derruba os sóis” para crianças de 4 a 9 anos, na horizontal (16:9). Frases curtas e faladas, com um gancho logo no início. Os dez sóis são passarinhos-sol redondinhos, filhos do Imperador do Céu; quando uma flecha acerta um deles, ele vira penas douradas que caem no mar — sem morte e sem sustos. Hou Yi primeiro pede que voltem para casa e só puxa o arco quando não obedecem; no fim, as pessoas pedem que ele deixe um sol. Estilo de livro ilustrado chinês, com Hou Yi igual do começo ao fim. Em código: a contagem regressiva dos sóis de dez a um (arco, clarão e penas a cada flecha), o ar tremendo de calor e rachaduras se espalhando, e um final em que a chuva fecha as rachaduras e os brotos nascem. Voz na nuvem acolhedora e vibrante para o narrador e outras vozes para os personagens; trilha original com tambores chineses que aceleram com as flechas, silêncio depois da última e uma flauta de bambu suave na chuva. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 将十个太阳写成太阳鸟，生成统一角色参考与底图，代码画倒数、射箭、羽毛与回春。
- 试听后选 Kore 旁白，另给后羿、金乌与村民分配音色；逐句校验与本地对齐。
- Lyria 多版筛选后按段落剪辑，箭与音效共用逐字锚点，最后一箭留白。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 546 条，账面合计 US$3.0042；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 另一语言配音与校验另有 144 条账面 US$0.0678，与原制作分开记。

## 踩坑与验证边界

- 底图扭曲与混合层放在运镜容器内曾导致重复渲染不一致，改成矢量热浪、独立混合层和布局运镜。
- 短拟声词重录仍易误读，改成长句；Lyria 不按提示秒数走，需按实际段落剪。

## 依据

- 公开包内 prompt.json：S114 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：houyi-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 另一语言保留档案标识：houyi-20261013-i18n / cost-ledger.jsonl。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
