# S056 · Inference, in motion · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex · gpt-6-sol (high)（云端）
- 画面代码：Codex · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Samantha（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit（本地）
- 配乐/音效：随包曲库 · Minimal Electronic 100（本地）
- 修改：Codex · gpt-6-sol (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "给一家做推理（inference）的新创公司做一支现代、利落、有冲击力的横版（16:9）广告片，约 26 秒，公司不具名。六拍：一个想法出现、实时信号变成聪明的回应、一个问题打开无数可能、下一步在动态中成形、为持续前进而打造，最后片尾卡写“Inference, in motion.”。每一幕都自己写动画，配沉稳自信的英文旁白和一段极简电子乐，不写任何性能或产品承诺。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a modern, slick, punchy 16:9 landscape ad for an unnamed startup that works on inference, about 26 seconds long. Six beats: an idea arrives, live signals become smart responses, one question opens a thousand possibilities, the next step takes shape in motion, build for momentum, and an end card that reads “Inference, in motion.” Write every scene as custom animation, with a calm, confident English voiceover over a minimal electronic track, and make no performance or product claims. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "幫一家做推論（inference）的新創公司做一支現代、俐落、有衝擊力的橫版（16:9）廣告片，約 26 秒，不提公司名稱。六個節拍：一個想法出現、即時訊號變成聰明的回應、一個問題打開無數可能、下一步在動態中成形、為持續的動能而打造，最後片尾卡寫「Inference, in motion.」。每一幕都自己寫動畫，配沉穩自信的英文旁白和一段極簡電子樂，不寫任何效能或產品承諾。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "推論（inference）を手がけるスタートアップのために、モダンで洗練された、インパクトのある横長（16:9）の広告動画を約26秒で作ってください。社名は出しません。構成は6ビートで、アイデアが生まれる、リアルタイムの信号が賢い応答に変わる、一つの問いが無数の可能性を開く、次の一歩が動きの中で形になる、勢いを保ち続けるために作られている、そして最後のエンドカードに「Inference, in motion.」と表示します。すべてのシーンを独自のアニメーションで作り、落ち着いて自信のある英語のナレーションとミニマルな電子音楽を合わせ、性能や製品についての約束は一切書かないでください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "추론(inference) 분야의 스타트업을 위해, 회사 이름은 밝히지 않고 현대적이고 세련되며 임팩트 있는 가로형(16:9) 광고 영상을 약 26초 길이로 만들어 주세요. 여섯 비트로 구성해요: 아이디어가 떠오르고, 실시간 신호가 똑똑한 응답이 되고, 질문 하나가 수많은 가능성을 열고, 다음 단계가 움직임 속에서 모양을 갖추고, 지속되는 추진력을 위해 만들어지고, 마지막 엔딩 카드에는 “Inference, in motion.”이라고 적어요. 모든 장면은 직접 애니메이션으로 만들고, 미니멀한 전자음악 위에 차분하고 자신감 있는 영어 내레이션을 깔아 주세요. 성능이나 제품에 대한 약속은 하나도 넣지 마세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un anuncio moderno, ágil y contundente, de unos 26 segundos y en formato horizontal 16:9, para una startup de inferencia cuyo nombre no se menciona. Seis momentos: llega una idea, las señales en tiempo real se convierten en respuestas inteligentes, una pregunta abre mil posibilidades, el siguiente paso toma forma en movimiento, pensado para un impulso sostenido, y una tarjeta final que dice «Inference, in motion.». Crea cada escena con animación propia, con una narración en inglés tranquila y segura sobre una pista electrónica minimalista, y no hagas ninguna promesa de rendimiento ni de producto. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach einen modernen, eleganten und packenden Werbespot im Querformat (16:9) für ein ungenanntes Start-up, das an Inferenz arbeitet, etwa 26 Sekunden lang. Sechs Beats: Eine Idee taucht auf, Live-Signale werden zu klugen Antworten, eine Frage öffnet tausend Möglichkeiten, der nächste Schritt nimmt in Bewegung Gestalt an, gebaut für Momentum, und eine Schlusstafel mit „Inference, in motion.“ Schreib jede Szene als eigene Animation, mit einer ruhigen, selbstbewussten englischen Sprecherstimme und minimalistischer elektronischer Musik, und mach keine Leistungs- oder Produktversprechen. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une publicité moderne, élégante et percutante au format paysage (16:9) pour une start-up anonyme spécialisée dans l'inférence, d'environ 26 secondes. Six temps : une idée surgit, des signaux en temps réel deviennent des réponses intelligentes, une question ouvre mille possibilités, l'étape suivante prend forme en mouvement, construire pour garder l'élan, et un carton de fin qui affiche « Inference, in motion. ». Écrivez chaque scène en animation sur mesure, avec une voix off anglaise calme et assurée sur une piste électronique minimaliste, et sans aucune promesse de performance ni de produit. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um anúncio moderno, elegante e impactante na horizontal (16:9), com cerca de 26 segundos, para uma startup sem nome que trabalha com inferência. Seis momentos: uma ideia surge, sinais ao vivo viram respostas inteligentes, uma pergunta abre mil possibilidades, o próximo passo ganha forma em movimento, construir para manter o embalo e uma cartela final com “Inference, in motion.”. Faça todas as cenas com animação própria, com narração em inglês calma e confiante sobre uma faixa eletrônica minimalista, e não faça nenhuma promessa de desempenho ou de produto. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 根据创意简报直接写英文六幕分镜与 inference-film 幕代码。
- 用 macOS Samantha（语速 235）制作原版旁白，手选 Minimal Electronic 100，本地渲染。
- 抽帧后修改字幕粘连与遮挡；之后的配音对照实验未改变原样片设定，历史元数据记载 10-05 起旁白改为 Qwen3-TTS；当前公开包的种子另见 CREDITS.md。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 英文原版配音被反馈不自然、语速慢；对照版与当前样片不能混作同一版本。
- 第三方帖子的一句话提示词未收录；公开复刻提示词不应标为当时逐轮原话。

## 依据

- 公开包内 prompt.json：S056 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
