# S045 · 会收起的书桌灯 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：自动配乐（本地）
- 配乐/音效：随包曲库 · relax_background1（本地）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 30 秒的横版（16:9）产品介绍片，介绍一盏虚构的可折叠书桌灯：它是什么，三个用处（展开照书页、调暗不刺眼、合起腾出桌面），怎么用，以及它的局限。四幕分别用大字结论、三个要点、步骤流程和对比来讲，女声旁白，配乐交给软件按“产品介绍”自动挑选。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 30-second 16:9 landscape product intro for a fictional folding desk lamp: what it is, its three jobs (open up to light the page, dim to avoid glare, fold away to free the desk), how to use it, and where it falls short. Use a big headline, three points, a step flow and a comparison for the four scenes, female voiceover, and let the app pick the music automatically for a product intro. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 30 秒的橫版（16:9）產品介紹片，介紹一盞虛構的可折疊書桌燈：它是什麼、三個用途（展開照亮書頁、調暗不刺眼、收起騰出桌面）、怎麼使用，以及它的限制。四幕分別用大字結論、三個重點、步驟流程和對比來講，女聲旁白，配樂交給軟體依「產品介紹」自動挑選。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "架空の折りたたみ式デスクライトを紹介する、約30秒の横長（16:9）の製品紹介動画を作ってください。それが何か、3つの使い道（広げて本のページを照らす、暗くしてまぶしさを抑える、たたんで机を広く使う）、使い方、そしてその限界を伝えます。4つのシーンはそれぞれ大見出し、3つのポイント、ステップの流れ、比較の形式で構成し、女性のナレーションで、BGMは「製品紹介」としてアプリに自動で選ばせてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 30초 길이의 가로형(16:9) 제품 소개 영상을 만들어 주세요. 가상의 접이식 책상 스탠드를 소개하는데, 무엇인지, 세 가지 쓰임새(펼쳐서 책장 비추기, 눈부시지 않게 밝기 낮추기, 접어서 책상 비우기), 사용법, 그리고 한계를 다뤄요. 네 장면은 각각 큰 글씨 메시지, 세 가지 핵심, 단계별 흐름, 비교로 구성하고, 여성 내레이션을 넣어 주세요. 배경 음악은 앱이 ‘제품 소개’에 맞춰 자동으로 고르게 해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz una presentación de producto de unos 30 segundos en formato horizontal 16:9 para una lámpara de escritorio plegable ficticia: qué es, sus tres usos (abrirse para iluminar la página, atenuarse para no deslumbrar, plegarse para liberar el escritorio), cómo se usa y cuáles son sus limitaciones. Usa un titular grande, tres claves, un flujo de pasos y una comparación para las cuatro escenas, con narración de voz femenina, y deja que la aplicación elija la música automáticamente para una presentación de producto. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 30 Sekunden langes Produktvorstellungsvideo im Querformat (16:9) für eine fiktive klappbare Schreibtischlampe: was sie ist, ihre drei Aufgaben (aufklappen, um die Buchseite zu beleuchten, dimmen gegen Blendung, zusammenklappen, um den Tisch freizumachen), wie man sie benutzt und wo ihre Grenzen liegen. Nutze für die vier Szenen eine große Schlagzeile, drei Punkte, einen Schrittablauf und einen Vergleich, dazu eine Sprecherin, und lass die App die Musik automatisch passend für eine Produktvorstellung auswählen. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une vidéo de présentation produit d'environ 30 secondes au format paysage (16:9) pour une lampe de bureau pliante fictive : ce qu'elle est, ses trois usages (se déplier pour éclairer la page, baisser l'intensité pour ne pas éblouir, se replier pour libérer le bureau), comment l'utiliser et ses limites. Utilisez pour les quatre scènes un grand titre, trois points, un circuit en étapes et une comparaison, avec une voix off féminine, et laissez l'application choisir automatiquement une musique adaptée à une présentation produit. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo de apresentação de produto de cerca de 30 segundos na horizontal (16:9) para uma luminária de mesa dobrável fictícia: o que ela é, suas três funções (abrir para iluminar a página, diminuir a luz para não ofuscar, dobrar para liberar a mesa), como usar e onde ela deixa a desejar. Use um título em letras grandes, três pontos, um fluxo de etapas e uma comparação para as quatro cenas, narração com voz feminina, e deixe o app escolher automaticamente a música para apresentação de produto. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

逐轮原话：未记录。

## 步骤

- Agent 撰写原创短文、分镜以及情绪、能量、速度等配乐意图，画面代码复用随包模板。
- 工作台根据配乐意图与题材自动选择随包曲目，原版旁白使用 macOS Tingting。
- 历史元数据记载 10-05 起改用本地 Qwen3-TTS 0.6B 预生成旁白；当前公开包的种子另见 CREDITS.md。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 英文版抽帧发现第二行标题与底部字幕贴叠；后续多语言修复处理中调整了该画面。

## 依据

- 公开包内 prompt.json：S045 的 tools 与 basis 制作来历元数据。
- 修复档案标识：1.0.1 上线后修复 / S045 英文画面。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
