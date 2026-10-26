# S117 · 眠晓智能床垫 · 一夜到天亮 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：Gemini 3 Pro Image · gemini-3-pro-image（云端）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Iapetus（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配音/对齐/校验：Qwen3-ForcedAligner 0.6B（本地）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Mianxiao Dawn（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支 50 秒左右的横版（16:9）智能床垫宣传片，品牌和型号自己虚构，不出现任何真实商标。开头用凌晨三点睁眼和一条忽高忽低的睡眠曲线做钩子；再用代码画的数据图讲清四个卖点：睡眠分期带状图实时画出来、翻身时压力热力图跟着变、打鼾时床头微微抬起声波平息、左右分区控温；清晨醒来，手机里的睡眠报告分数一路跳动后落定；最后是产品英雄镜头、口号和结尾标版。调性安静、高级、可信，色彩从深夜蓝暖到清晨金。卧室、产品剖面和材质特写可以生成，产品外观每张图一致；数据和界面都用代码画，卡在旁白念到的词上。配音用沉稳偏低的云端声音，健康说法要克制；配乐原创，从安静的夜抬升到“醒来”那一刻的高点，再加呼吸般的底噪、提示音和轻柔的电机声。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a ~50-second 16:9 promo for a smart mattress with an invented brand and model and no real trademarks. Hook: someone awake at 3 a.m. and a jagged sleep curve. Then four features as code-drawn data visuals: a sleep-stage chart drawn live, a pressure heat map that changes when the sleeper turns over, the head of the bed rising slightly as snoring waves calm down, and separate left/right temperature zones. At sunrise, a phone sleep report whose score ticks up and lands; then a product hero shot, the slogan and an end card. Quiet, premium and credible, with colors warming from midnight blue to morning gold. Generate the bedroom, a product cutaway and fabric close-ups, with the product identical in every image; draw all data and UI in code, timed to the narration. Use a calm, low cloud voice and modest health claims; compose original music that rises from the night to a high point at waking, with breathing-like ambience, chimes and a soft motor sound. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 50 秒的橫版（16:9）智慧床墊宣傳片，品牌和型號自己虛構，不出現任何真實商標。開頭用凌晨三點睜眼和一條忽高忽低的睡眠曲線做鉤子；再用程式碼畫的資料圖講清四個賣點：睡眠分期帶狀圖即時畫出來、翻身時壓力熱力圖跟著變、打鼾時床頭微微抬起、聲波平息、左右分區控溫；清晨醒來，手機裡的睡眠報告分數一路跳動後落定；最後是產品英雄鏡頭、口號和結尾標版。調性安靜、高級、可信，色彩從深夜藍暖到清晨金。臥室、產品剖面和材質特寫可以生成，產品外觀每張圖一致；資料和介面都用程式碼畫，對準旁白念到的詞。配音用沉穩偏低的雲端聲音，健康說法要克制；配樂原創，從安靜的夜抬升到「醒來」那一刻的高點，再加呼吸般的底噪、提示音和輕柔的電機聲。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約50秒の横長（16:9）のスマートマットレス宣伝動画を作ってください。ブランドと型番は架空にし、実在の商標は出さないでください。冒頭は午前3時に目が覚める場面と上下に揺れる睡眠曲線でつかみ、次にコードで描くデータ表現で4つの特長を見せます：睡眠ステージの帯グラフがリアルタイムに描かれる、寝返りで体圧ヒートマップが変わる、いびきに合わせてベッドの頭側がわずかに上がり音の波が静まる、左右で温度を分けて調整する。夜明けにはスマホの睡眠レポートのスコアが跳ねながら確定し、最後に製品のヒーローショット、キャッチコピー、エンドカード。静かで上質、信頼できるトーンで、色は深夜の青から朝の金色へ。寝室、製品の断面、素材のアップは生成してよく、製品の見た目はどの画像でも同じに。データと画面はすべてコードで描き、ナレーションの言葉に合わせてください。声は落ち着いた低めのクラウド音声、健康の表現は控えめに。BGM はオリジナルで、静かな夜から目覚めの瞬間の頂点へ高まり、呼吸のような環境音、通知音、静かなモーター音も加えてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 50초 분량의 가로형(16:9) 스마트 매트리스 홍보 영상을 만들어 주세요. 브랜드와 모델명은 지어내고 실제 상표는 쓰지 마세요. 시작은 새벽 3시에 눈뜬 장면과 들쭉날쭉한 수면 곡선으로 잡고, 이어서 코드로 그린 데이터 시각화로 네 가지 장점을 보여 줍니다. 수면 단계 띠 그래프가 실시간으로 그려지고, 뒤척이면 체압 히트맵이 바뀌고, 코를 골면 침대 머리 쪽이 살짝 올라가며 소리 파형이 잦아들고, 좌우 온도를 따로 조절합니다. 아침에는 휴대폰 수면 리포트 점수가 오르내리다 확정되고, 마지막은 제품 히어로 컷, 슬로건, 엔딩 카드입니다. 조용하고 고급스럽고 믿음직하게, 색은 한밤의 파랑에서 아침의 금빛으로 따뜻해지게 해 주세요. 침실, 제품 단면, 소재 클로즈업은 생성해도 되지만 제품 외관은 모든 이미지에서 같아야 합니다. 데이터와 화면은 모두 코드로 그리고 내레이션 단어에 맞춰 주세요. 목소리는 차분하고 낮은 클라우드 음성, 건강 관련 표현은 절제하고, 음악은 오리지널로 밤에서 깨어나는 순간의 절정까지 올라가게, 숨소리 같은 배경음과 알림음, 부드러운 모터 소리를 넣어 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 MP4로 내보내 주세요.",
  "es": "Haz un vídeo promocional horizontal (16:9) de unos 50 segundos para un colchón inteligente, con marca y modelo inventados y sin marcas reales. Gancho: alguien despierto a las 3 de la madrugada y una curva de sueño irregular. Luego, cuatro ventajas con datos dibujados en código: un gráfico de fases del sueño que se traza en directo, un mapa de calor de presión que cambia al darse la vuelta, la cabecera que sube un poco mientras se calman las ondas del ronquido, y zonas de temperatura separadas a izquierda y derecha. Al amanecer, el informe de sueño en el móvil con una puntuación que sube a saltos hasta fijarse; al final, plano del producto, eslogan y cierre. Tranquilo, elegante y creíble, del azul de medianoche al dorado de la mañana. Genera el dormitorio, un corte del producto y primeros planos del tejido, con el producto igual en todas las imágenes; dibuja datos e interfaces en código, sincronizados con la narración. Voz en la nube serena y grave, prudencia con la salud, y música original que suba de la noche al clímax del despertar, con fondo de respiración, avisos y un suave motor. Muéstramelo primero en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Erstelle ein etwa 50 Sekunden langes Querformat-Video (16:9) für eine smarte Matratze mit erfundener Marke und Modell, ohne echte Markenzeichen. Einstieg: jemand liegt um 3 Uhr nachts wach, dazu eine zackige Schlafkurve. Dann vier Vorteile als per Code gezeichnete Datengrafiken: ein Schlafphasen-Diagramm, das live entsteht, eine Druck-Heatmap, die sich beim Umdrehen ändert, ein Kopfteil, das sich beim Schnarchen leicht hebt, während die Schallwellen abklingen, und getrennte Temperaturzonen links und rechts. Bei Sonnenaufgang ein Schlafbericht auf dem Handy, dessen Punktzahl hochspringt und stehen bleibt; zum Schluss Produkt-Hero-Shot, Slogan und Abschlusstafel. Ruhig, hochwertig, glaubwürdig, Farben von Mitternachtsblau zu Morgengold. Schlafzimmer, Produktschnitt und Stoffdetails dürfen generiert sein, das Produkt überall gleich; Daten und Oberflächen per Code, getimt auf die Sprecherstimme. Ruhige, tiefe Cloud-Stimme, zurückhaltende Gesundheitsaussagen, eigene Musik, die von der Nacht bis zum Höhepunkt beim Aufwachen ansteigt, mit atemähnlichem Grundrauschen, Hinweistönen und leisem Motor. Zeig mir zuerst die Live-Vorschau und exportiere die MP4 erst, wenn ich zufrieden bin.",
  "fr": "Réalisez un spot horizontal (16:9) d'environ 50 secondes pour un matelas connecté, avec une marque et un modèle inventés, sans aucune marque réelle. Accroche : quelqu'un éveillé à 3 h du matin et une courbe de sommeil en dents de scie. Puis quatre atouts en données dessinées en code : un graphique des phases de sommeil tracé en direct, une carte de pression qui change quand on se retourne, la tête du lit qui se relève un peu tandis que les ondes du ronflement s'apaisent, et des zones de température séparées à gauche et à droite. Au lever du soleil, le rapport de sommeil sur le téléphone, dont le score grimpe puis se fixe ; enfin plan du produit, slogan et carton de fin. Calme, haut de gamme et crédible, du bleu nuit à l'or du matin. Générez la chambre, une vue en coupe et des gros plans du tissu, avec le même produit sur chaque image ; dessinez données et interfaces en code, calées sur la narration. Voix cloud posée et grave, prudence sur la santé, musique originale qui monte de la nuit jusqu'au réveil, avec un fond de respiration, des signaux et un léger moteur. Montrez-moi d'abord l'aperçu en direct ; n'exportez le MP4 que lorsqu'il me convient.",
  "pt-BR": "Faça um vídeo promocional horizontal (16:9) de uns 50 segundos para um colchão inteligente, com marca e modelo inventados e sem marcas reais. Abertura: alguém acordado às 3 da manhã e uma curva de sono irregular. Depois, quatro diferenciais em dados desenhados em código: um gráfico das fases do sono desenhado ao vivo, um mapa de calor de pressão que muda quando a pessoa se vira, a cabeceira subindo um pouco enquanto as ondas do ronco se acalmam, e zonas de temperatura separadas à esquerda e à direita. Ao amanhecer, o relatório de sono no celular com a nota subindo aos saltos até parar; por fim, destaque do produto, slogan e encerramento. Calmo, sofisticado e confiável, do azul da meia-noite ao dourado da manhã. Gere o quarto, um corte do produto e closes do tecido, com o produto igual em todas as imagens; desenhe dados e interfaces em código, sincronizados com a narração. Voz na nuvem serena e grave, cautela com a saúde, e trilha original que sobe da noite até o ápice ao acordar, com fundo de respiração, sinais sonoros e um motor suave. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 调研品类并虚构品牌与型号，以英雄图作参考生成七张统一产品底图。
- 试听五个音色后选 Iapetus，云端旁白逐句核对并本地对齐。
- 代码绘制数据示意与夜蓝至晨金色彩弧线，Lyria 曲按段落对位，NumPy 合成 47 处音效。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 166 条，账面合计 US$1.2771；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。

## 踩坑与验证边界

- 健康表达只用体感与示意，避免无法验证的治疗承诺；产品参数是虚构演示。
- 原导出约 −18.9 LUFS，受旁白归一与配乐音量上限影响；提高音乐不等于提高整片可懂度。

## 依据

- 公开包内 prompt.json：S117 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：promo-mattress-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
