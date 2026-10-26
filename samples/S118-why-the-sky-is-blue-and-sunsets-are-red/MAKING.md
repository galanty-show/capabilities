# S118 · 为什么天空是蓝的，夕阳是红的 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：numpy（本地）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Kore（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Why the Sky Is Blue（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约两分钟的横版（16:9）中文科普短片《为什么天空是蓝的，夕阳是红的》，画面全部用代码画，不用任何生成图片：白光穿过棱镜拆成光谱；光子穿过大气时按 1/λ⁴ 的概率被弹开，用被弹开光子的统计实时“染”出天色；公式 1/λ⁴ 逐项出现，并算清蓝光 450 nm 比红光 700 nm 多散射约 5.86 倍；把太阳从头顶拖到地平线，光程从 1 倍涨到约 38 倍，天空按同一个模型实时变成橙红；再讲天为什么不是紫色、云为什么是白的，最后的彩蛋是火星的蓝色日落。颜色尽量由物理模型算出来，简化了什么要写清楚。内容要准确，列出出处。旁白用清楚、好奇、有温度的云端配音，原创配乐在夕阳处有一个抬升，音效用代码合成、克制一点。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a roughly two-minute landscape (16:9) Chinese popular-science film, “Why the Sky Is Blue and Sunsets Are Red”, with every visual drawn in code and no generated images: white light splits into a spectrum through a prism; photons crossing the atmosphere get bounced with a probability of 1/λ⁴, and the statistics of the bounced photons dye the sky live; the formula 1/λ⁴ appears term by term and works out that 450 nm blue scatters about 5.86 times more than 700 nm red; drag the sun from overhead to the horizon so the light path grows from 1× to about 38× and the same model turns the sky orange-red in real time; then explain why the sky isn't violet and why clouds are white, and end with a bonus: the blue sunset on Mars. Compute colors from a physical model wherever you can and say what you simplified. Keep the facts accurate and cite sources. Use a clear, curious, warm cloud voice, an original score that lifts at the sunset, and restrained code-synthesized sound effects. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支大約兩分鐘的橫版（16:9）中文科普短片《為什麼天空是藍的，夕陽是紅的》，畫面全部用程式碼繪製，不用任何生成圖片：白光穿過稜鏡拆成光譜；光子穿過大氣時按 1/λ⁴ 的機率被彈開，用被彈開光子的統計即時「染」出天色；公式 1/λ⁴ 逐項出現，並算清楚藍光 450 nm 比紅光 700 nm 多散射約 5.86 倍；把太陽從頭頂拖到地平線，光程從 1 倍增加到約 38 倍，天空依同一個模型即時變成橙紅；再講天空為什麼不是紫色、雲為什麼是白的，最後的彩蛋是火星的藍色日落。顏色盡量由物理模型算出來，簡化了什麼要寫清楚。內容要準確，列出出處。旁白用清楚、好奇、有溫度的雲端配音，原創配樂在夕陽處有一個抬升，音效用程式碼合成、克制一點。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約2分の横長（16:9）の中国語科学解説動画『なぜ空は青く、夕日は赤いのか』を作ってください。映像はすべてコードで描き、生成画像は使いません。白色光がプリズムでスペクトルに分かれる様子、光子が大気を通るときに 1/λ⁴ の確率ではじかれ、はじかれた光子の統計で空の色がリアルタイムに「染まって」いく様子、1/λ⁴ の式が項ごとに現れ、450 nm の青い光が 700 nm の赤い光より約 5.86 倍多く散乱することを計算で示す場面、太陽を真上から地平線までドラッグすると光路が 1 倍から約 38 倍に伸び、同じモデルで空がリアルタイムに橙赤色に変わる場面を入れてください。続けて、なぜ空は紫ではないのか、なぜ雲は白いのかを説明し、最後のおまけとして火星の青い夕焼けを見せてください。色はできるだけ物理モデルから計算し、何を簡略化したかを明記してください。内容は正確に、出典も挙げてください。ナレーションは明瞭で好奇心と温かみのあるクラウド音声、BGM はオリジナルで夕焼けの場面で盛り上がりを作り、効果音はコードで合成して控えめに。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 2분짜리 가로형(16:9) 중국어 과학 해설 영상 『하늘은 왜 파랗고, 노을은 왜 붉을까』를 만들어 주세요. 화면은 전부 코드로 그리고 생성 이미지는 쓰지 않아요. 흰빛이 프리즘을 지나 스펙트럼으로 갈라지고, 광자가 대기를 지날 때 1/λ⁴의 확률로 튕겨 나가며, 튕겨 나간 광자의 통계로 하늘색이 실시간으로 ‘물들어’ 가는 모습, 1/λ⁴ 공식이 항 하나씩 나타나고 450 nm 파란빛이 700 nm 붉은빛보다 약 5.86배 더 산란된다는 계산, 태양을 머리 위에서 지평선까지 끌어내리면 빛의 경로가 1배에서 약 38배로 늘고 같은 모델로 하늘이 실시간으로 주황빛 붉은색이 되는 장면을 넣어 주세요. 이어서 하늘이 왜 보라색이 아닌지, 구름은 왜 흰지 설명하고, 마지막 보너스로 화성의 푸른 노을을 보여 주세요. 색은 되도록 물리 모델로 계산하고 무엇을 단순화했는지 밝혀 주세요. 내용은 정확하게, 출처도 적어 주세요. 내레이션은 또렷하고 호기심과 따뜻함이 있는 클라우드 음성으로, 음악은 노을 장면에서 고조되는 오리지널 곡으로, 효과음은 코드로 합성해 절제해서 넣어 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo de divulgación científica en chino de unos dos minutos, en horizontal (16:9), titulado «Por qué el cielo es azul y los atardeceres son rojos», con todas las imágenes dibujadas en código y sin ninguna imagen generada: la luz blanca se descompone en un espectro al pasar por un prisma; los fotones que cruzan la atmósfera rebotan con una probabilidad de 1/λ⁴ y su estadística tiñe el cielo en tiempo real; la fórmula 1/λ⁴ aparece término a término y calcula que el azul de 450 nm se dispersa unas 5,86 veces más que el rojo de 700 nm; arrastra el sol desde lo alto hasta el horizonte para que el camino de la luz pase de 1× a unas 38× y el mismo modelo vuelva el cielo rojo anaranjado en tiempo real; luego explica por qué el cielo no es violeta y por qué las nubes son blancas, y termina con una sorpresa: el atardecer azul de Marte. Calcula los colores con un modelo físico siempre que puedas y explica qué simplificaste. Que los datos sean exactos y cita las fuentes. Usa una voz en la nube clara y cálida, música original que suba en el atardecer y efectos discretos sintetizados en código. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Erstelle einen etwa zweiminütigen chinesischen Wissenschaftsfilm im Querformat (16:9) mit dem Titel „Warum der Himmel blau ist und der Sonnenuntergang rot“, komplett per Code gezeichnet, ohne generierte Bilder: Weißes Licht zerfällt im Prisma in ein Spektrum; Photonen werden beim Durchqueren der Atmosphäre mit der Wahrscheinlichkeit 1/λ⁴ abgelenkt, und ihre Statistik färbt den Himmel live ein; die Formel 1/λ⁴ erscheint Term für Term und rechnet vor, dass blaues Licht mit 450 nm etwa 5,86-mal stärker gestreut wird als rotes mit 700 nm; zieh die Sonne vom Zenit bis zum Horizont, sodass der Lichtweg von 1× auf etwa 38× wächst und dasselbe Modell den Himmel in Echtzeit orangerot färbt; erkläre dann, warum der Himmel nicht violett und Wolken weiß sind; als Bonus zum Schluss der blaue Sonnenuntergang auf dem Mars. Berechne Farben möglichst aus einem physikalischen Modell und schreib auf, was du vereinfacht hast. Fakten korrekt, mit Quellen. Nimm eine klare, warme Cloud-Stimme, eigene Musik, die beim Sonnenuntergang ansteigt, und dezente, per Code synthetisierte Effekte. Zeig mir zuerst die Live-Vorschau; exportiere die MP4 erst, wenn ich zufrieden bin.",
  "fr": "Réalisez un film de vulgarisation scientifique en chinois d'environ deux minutes, au format paysage (16:9), intitulé « Pourquoi le ciel est bleu et le coucher de soleil rouge », entièrement dessiné en code, sans image générée : la lumière blanche se décompose en spectre à travers un prisme ; les photons qui traversent l'atmosphère sont déviés avec une probabilité de 1/λ⁴, et leur statistique teinte le ciel en direct ; la formule 1/λ⁴ apparaît terme par terme et calcule que le bleu à 450 nm est diffusé environ 5,86 fois plus que le rouge à 700 nm ; faites glisser le soleil du zénith à l'horizon : le trajet de la lumière passe de 1× à environ 38× et le même modèle rend le ciel rouge orangé en temps réel ; expliquez ensuite pourquoi le ciel n'est pas violet et les nuages blancs ; en bonus final, le coucher de soleil bleu sur Mars. Calculez les couleurs avec un modèle physique et dites ce que vous simplifiez. Faits exacts, sources citées. Utilisez une voix cloud claire et chaleureuse, une musique originale qui monte au coucher du soleil et des effets discrets synthétisés en code. Montrez-moi d'abord l'aperçu en direct ; n'exportez le MP4 que s'il me convient.",
  "pt-BR": "Faça um vídeo de divulgação científica em chinês de cerca de dois minutos, na horizontal (16:9), chamado “Por que o céu é azul e o pôr do sol é vermelho”, todo desenhado em código, sem imagens geradas: a luz branca se divide em um espectro ao passar por um prisma; os fótons que atravessam a atmosfera são desviados com probabilidade 1/λ⁴, e a estatística deles tinge o céu ao vivo; a fórmula 1/λ⁴ aparece termo a termo e calcula que o azul de 450 nm se espalha cerca de 5,86 vezes mais que o vermelho de 700 nm; arraste o sol do alto até o horizonte para que o caminho da luz cresça de 1× para cerca de 38× e o mesmo modelo deixe o céu vermelho-alaranjado em tempo real; depois explique por que o céu não é violeta e por que as nuvens são brancas, e termine com um bônus: o pôr do sol azul em Marte. Calcule as cores a partir de um modelo físico sempre que possível e diga o que foi simplificado. Os fatos precisam estar corretos, com as fontes. Use uma voz na nuvem clara, curiosa e calorosa, uma trilha original que cresce no pôr do sol e efeitos sonoros sintetizados em código, discretos. Primeiro me mostre a prévia ao vivo; só exporte o MP4 quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 先用 NumPy 原型检验天空散射模型，再用四个幕模块画光谱、光子与天空；没有生成图片。
- 试听后选 Kore 云端旁白，删减并调整语速，逐句校验和本地对齐。
- 实测候选曲约 103.4 BPM 后剪接，NumPy 合成 223 处音效，逐轮抽帧修正曝光、遮挡与信息密度。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 293 条，账面合计 US$0.4183；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 另一语言配音与校验另有 102 条账面 US$0.0540，与原制作分开记。

## 踩坑与验证边界

- “波长大”曾被多音字按子串替换成“波掌大”，制作时改措辞绕过；后续应用修复已另记。
- 单层均匀天空模型使黄昏天顶发灰，改为空气分子、薄霾与臭氧三层原型。

## 依据

- 公开包内 prompt.json：S118 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：code-sky-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 另一语言保留档案标识：code-sky-20261013-i18n / cost-ledger.jsonl。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
