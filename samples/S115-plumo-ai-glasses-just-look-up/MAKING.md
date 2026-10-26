# S115 · 羽见 AI 眼镜 · 抬头就是答案 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Zephyr（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · PLUMO Heads Up（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支 AI 眼镜的竖屏（9:16）产品宣传片，35～50 秒，投短视频平台。品牌和型号虚构：起一个好记的中英文名并查重，不出现真实商标，也不仿真实产品的外观。先查这个品类用户最在意什么，挑 4～5 个卖点，参数合理、不夸大，并注明是演示设定。结构：开头 1～2 秒第一视角的强钩子加一句话；然后卖点快切，每个卖点一个年轻人的生活场景，配代码画的 HUD（翻译字幕、贴在路面的导航箭头、拍照取景框、提词滚动、消息轻提示）；接着产品英雄镜头，转台、光扫、参数逐个弹出；最后口号和标版。配乐用原创电子流行，要有明显的铺垫和 Drop，先测拍点再按拍点剪辑和弹字；旁白短促有力，旁白时配乐让位；音效用代码合成。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a vertical (9:16) promo for AI smart glasses, 35–50 seconds, for short-video feeds. Use a fictional brand and model: pick a memorable Chinese and English name and check it isn't taken, show no real trademarks, and don't copy any real product's look. First find out what buyers in this category care about most, pick 4–5 selling points, keep the specs plausible, and label them as demo figures. Structure: a 1–2 second first-person hook with one line; fast cuts through the selling points, each in a young person's everyday scene with a HUD drawn in code (translation subtitles, navigation arrows on the road, a viewfinder, a scrolling teleprompter, a light message alert); a product hero shot with a turntable move, a light sweep and the specs popping in one by one; then the slogan and end card. Use original electronic pop with a clear build and drop, measure the beats first and cut on them. Keep the voice-over short and punchy, duck the music under it, and synthesize the sound effects in code. Show me a live preview first and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支 AI 眼鏡的直式（9:16）產品宣傳片，35～50 秒，投放短影音平台。品牌和型號虛構：取一個好記的中英文名並查重，不出現真實商標，也不模仿真實產品的外觀。先查這個品類的使用者最在意什麼，挑 4～5 個賣點，參數合理、不誇大，並註明是演示設定。結構：開頭 1～2 秒第一人稱視角的強鉤子加一句話；接著賣點快切，每個賣點一個年輕人的生活場景，配上用程式碼畫的 HUD（翻譯字幕、貼在路面的導航箭頭、拍照取景框、提詞捲動、訊息輕提示）；然後是產品英雄鏡頭，轉台、光掃、參數逐一彈出；最後是口號和標版。配樂用原創電子流行，要有明顯的鋪陳和 Drop，先測拍點再依拍點剪輯和彈字；旁白短促有力，旁白時配樂讓位；音效用程式碼合成。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "AI スマートグラスの縦型（9:16）プロモーション動画を 35～50 秒で、ショート動画向けに作ってください。ブランドと型番は架空にし、覚えやすい中国語名と英語名を考えて既存ブランドと重ならないか確認し、実在の商標や実在製品の外観は使わないでください。まずこのカテゴリーで購入者が一番気にする点を調べて売りを 4～5 個選び、スペックは誇張せず妥当な値にしてデモ用の設定だと明記してください。構成は、冒頭 1～2 秒の一人称視点の強いつかみと一言、続いて売りを素早く切り替え、それぞれ若者の日常シーンにコードで描いた HUD（翻訳字幕、路面に置かれたナビ矢印、ファインダー、スクロールするプロンプター、控えめな通知）を重ね、次にターンテーブルとライトスイープの製品ヒーローショットでスペックを一つずつ表示し、最後にスローガンとエンドカードです。BGM はビルドとドロップがはっきりしたオリジナルのエレクトロポップにし、先に拍を測って拍に合わせて切り替えてください。ナレーションは短く力強く、その間は BGM を下げ、効果音はコードで合成してください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "AI 스마트 안경의 세로형(9:16) 홍보 영상을 35～50초 길이로, 숏폼 피드용으로 만들어 주세요. 브랜드와 모델은 가상으로 하고, 기억하기 쉬운 중국어·영어 이름을 지어 이미 있는 이름인지 확인하고, 실제 상표나 실제 제품의 외관은 쓰지 마세요. 먼저 이 제품군에서 구매자가 가장 신경 쓰는 점을 찾아 셀링 포인트 4～5개를 고르고, 사양은 과장 없이 그럴듯하게 쓰되 데모용 설정이라고 밝혀 주세요. 구성은 처음 1～2초 1인칭 시점의 강한 훅과 한마디, 이어서 셀링 포인트를 빠르게 넘기며 각각 젊은 사람의 일상 장면에 코드로 그린 HUD(번역 자막, 노면에 깔리는 내비 화살표, 뷰파인더, 스크롤 프롬프터, 가벼운 알림)를 얹고, 턴테이블과 라이트 스윕으로 보여 주는 제품 히어로 숏에서 사양이 하나씩 튀어나온 뒤, 슬로건과 엔드 카드로 마무리해요. 음악은 빌드업과 드롭이 뚜렷한 오리지널 일렉트로 팝으로 하고, 먼저 비트를 측정해 비트에 맞춰 컷해 주세요. 내레이션은 짧고 힘 있게, 그동안 음악은 낮추고, 효과음은 코드로 합성해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 MP4로 내보내 주세요.",
  "es": "Haz un vídeo promocional vertical (9:16) de unas gafas inteligentes con IA, de 35 a 50 segundos, para feeds de vídeo corto. Marca y modelo ficticios: inventa un nombre fácil de recordar en chino y en inglés y comprueba que no exista, sin marcas reales ni el aspecto de un producto real. Averigua qué valoran más los compradores de esta categoría, elige 4 o 5 puntos de venta con especificaciones verosímiles y márcalas como cifras de demostración. Estructura: un gancho en primera persona de 1 a 2 segundos con una frase; cortes rápidos por los puntos de venta, cada uno en una escena cotidiana de gente joven con un HUD dibujado en código (subtítulos de traducción, flechas de navegación sobre el asfalto, un visor, un teleprompter, un aviso de mensaje discreto); un plano protagonista del producto con giro, barrido de luz y las cifras apareciendo una a una; y el eslogan con la placa final. Música electropop original con subida y drop claros: mide primero los pulsos y corta sobre ellos. Voz en off breve y contundente, música más baja bajo la voz y efectos sintetizados en código. Muéstramelo primero en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein vertikales (9:16) Promo-Video für eine KI-Brille, 35–50 Sekunden, für Kurzvideo-Feeds. Marke und Modell sind erfunden: Denk dir einen einprägsamen chinesischen und englischen Namen aus und prüf, dass es ihn noch nicht gibt, ohne echte Markenzeichen und ohne das Aussehen eines echten Produkts. Finde heraus, worauf Käufer in dieser Kategorie am meisten achten, wähl 4–5 Verkaufsargumente mit plausiblen Daten und kennzeichne sie als Demo-Werte. Aufbau: ein 1–2 Sekunden langer Hook aus der Ich-Perspektive mit einem Satz; schnelle Schnitte durch die Argumente, jedes in einer Alltagsszene junger Leute mit einem im Code gezeichneten HUD (Übersetzungsuntertitel, Navigationspfeile auf der Straße, Kamerasucher, Teleprompter, dezenter Nachrichtenhinweis); eine Heldenaufnahme mit Drehteller, Lichtschwenk und nacheinander einploppenden Daten; dann Slogan und Abspann. Eigener Electropop mit deutlichem Aufbau und Drop: erst die Beats messen, dann darauf schneiden. Sprechertext kurz und kraftvoll, Musik darunter zurücknehmen, Soundeffekte im Code synthetisieren. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Réalisez une vidéo promotionnelle verticale (9:16) pour des lunettes connectées à IA, de 35 à 50 secondes, pour les vidéos courtes. Marque et modèle fictifs : trouvez un nom facile à retenir en chinois et en anglais et vérifiez qu'il n'existe pas, sans marque réelle ni l'apparence d'un produit réel. Cherchez ce qui compte le plus pour les acheteurs de cette catégorie, retenez 4 ou 5 arguments avec des caractéristiques plausibles, indiquées comme valeurs de démonstration. Structure : une accroche de 1 à 2 secondes en vue subjective avec une phrase ; des coupes rapides sur les arguments, chacun dans une scène du quotidien de jeunes avec un HUD dessiné en code (sous-titres de traduction, flèches sur la chaussée, viseur, prompteur, alerte de message) ; un plan héros du produit avec plateau tournant, balayage de lumière et chiffres qui apparaissent un à un ; puis le slogan et le carton final. Électro-pop originale avec une montée et un drop nets : mesurez d'abord les temps, puis coupez dessus. Voix off courte et percutante, musique baissée sous la voix, effets synthétisés en code. Montrez-moi d'abord l'aperçu en direct et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo promocional vertical (9:16) de óculos inteligentes com IA, de 35 a 50 segundos, para feeds de vídeos curtos. Marca e modelo fictícios: invente um nome fácil de lembrar em chinês e em inglês e confira se ele já não existe, sem marcas reais nem a aparência de um produto real. Descubra o que os compradores dessa categoria mais valorizam, escolha de 4 a 5 pontos de venda com especificações plausíveis, marcadas como valores de demonstração. Estrutura: um gancho em primeira pessoa de 1 a 2 segundos com uma frase; cortes rápidos pelos pontos de venda, cada um numa cena do dia a dia de gente jovem com um HUD desenhado em código (legendas de tradução, setas de navegação no asfalto, visor de câmera, teleprompter, aviso discreto de mensagem); um plano de destaque do produto com giro, varredura de luz e números surgindo um a um; e o slogan com a cartela final. Eletropop original com subida e drop bem marcados: meça as batidas primeiro e corte em cima delas. Narração curta e enérgica, música abaixada sob a voz e efeitos sintetizados em código. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 检索品类卖点并为虚构品牌做网页查重，编稿并生成产品与场景底图。
- 试听选择 Zephyr 云端中文旁白，逐句转拼音核对；代码绘制 HUD 与卖点界面。
- Lyria 三版选一版，NumPy 测拍并按实测 126 BPM 网格剪辑和合成音效。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 121 条，账面合计 US$1.8297；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。

## 踩坑与验证边界

- 制作做的是网页品牌查重，商业投放仍需另做商标检索；虚构参数不应当作真实产品性能。

## 依据

- 公开包内 prompt.json：S115 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：promo-glasses-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
