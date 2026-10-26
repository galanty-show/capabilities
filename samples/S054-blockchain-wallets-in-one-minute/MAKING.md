# S054 · 一分钟认识区块链钱包 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-astra (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-astra (xhigh)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 28 秒的横版（16:9）知识卡片短片，三幕讲清区块链钱包：资产记在链上，钱包帮你管理密钥、查看余额和签名；地址可以分享，私钥和助记词必须自己保管；先选网络，再选钱包。每个要点配一张图标卡片，女声旁白，不加配乐。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 28-second 16:9 landscape knowledge-card short that explains a crypto wallet in three scenes: assets live on the blockchain, and the wallet manages your keys, shows balances and signs; an address is fine to share, but the private key and recovery phrase stay with you; pick the network first, then the wallet. Give each point an icon card, with female voiceover and no music. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 28 秒的橫版（16:9）知識卡片短片，三幕講清楚區塊鏈錢包：資產記在鏈上，錢包幫你管理金鑰、查看餘額和簽名；地址可以分享，私鑰和助記詞必須自己保管；先選網路，再選錢包。每個重點配一張圖示卡片，女聲旁白，不加配樂。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約28秒の横長（16:9）の知識カード形式のショート動画で、3つのシーンを使ってブロックチェーンのウォレットを説明してください。資産はチェーン上に記録され、ウォレットは鍵の管理、残高の確認、署名を手伝うこと、アドレスは人に教えてよいが秘密鍵とシードフレーズは必ず自分で保管すること、まずネットワークを選び、それからウォレットを選ぶこと、の3点です。各ポイントにアイコンカードを1枚ずつ付け、女性のナレーションでBGMはなしにしてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 28초 길이의 가로형(16:9) 지식 카드 영상을 만들어 주세요. 세 장면으로 암호화폐 지갑을 설명하는데, 자산은 블록체인에 기록되고 지갑은 키를 관리하고 잔액을 보여 주며 서명을 해 준다는 것, 주소는 공유해도 되지만 개인 키와 복구 문구는 반드시 직접 보관해야 한다는 것, 네트워크를 먼저 고르고 지갑은 그다음에 고른다는 것이에요. 핵심마다 아이콘 카드를 한 장씩 붙이고, 여성 내레이션에 배경 음악은 넣지 마세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo corto de tarjetas de conocimiento de unos 28 segundos en formato horizontal 16:9 que explique una cartera de criptomonedas en tres escenas: los activos están registrados en la cadena de bloques y la cartera gestiona tus claves, muestra saldos y firma; una dirección se puede compartir, pero la clave privada y la frase de recuperación te las guardas tú; primero eliges la red y luego la cartera. Dale a cada punto una tarjeta con icono, con narración de voz femenina y sin música. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 28 Sekunden langes Kurzvideo im Querformat (16:9) mit Wissenskarten, das eine Krypto-Wallet in drei Szenen erklärt: Die Vermögenswerte liegen auf der Blockchain, und die Wallet verwaltet deine Schlüssel, zeigt Guthaben an und signiert; eine Adresse darfst du teilen, aber privaten Schlüssel und Wiederherstellungsphrase behältst du für dich; zuerst das Netzwerk wählen, dann die Wallet. Jeder Punkt bekommt eine Icon-Karte, dazu eine Sprecherin und keine Musik. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une courte vidéo d'environ 28 secondes au format paysage (16:9), en cartes de connaissances, qui explique un portefeuille crypto en trois scènes : les actifs sont inscrits sur la blockchain, et le portefeuille gère vos clés, affiche les soldes et signe ; une adresse peut se partager, mais la clé privée et la phrase de récupération restent avec vous ; choisissez d'abord le réseau, puis le portefeuille. Une carte à icône par point, une voix off féminine et pas de musique. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo curto de cerca de 28 segundos na horizontal (16:9), com cartões de conhecimento, que explique uma carteira de criptomoedas em três cenas: os ativos ficam registrados na blockchain, e a carteira gerencia suas chaves, mostra saldos e assina; o endereço pode ser compartilhado, mas a chave privada e a frase de recuperação ficam só com você; escolha primeiro a rede, depois a carteira. Dê a cada ponto um cartão com ícone, com narração em voz feminina e sem música. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

逐轮原话：未记录。

## 步骤

- 以既有钱包参考稿制作模板修补后的回归对照片；Agent 写分镜、修补模板画面。
- 原版用 macOS Tingting 配音且不配乐，历史元数据记载 10-05 起改用 Qwen3-TTS 0.6B 预生成旁白；当前公开包的种子另见 CREDITS.md。
- 另由 Agent 制作粒子接力转场。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 原来配乐留空代表不配乐，后来的管线会自动配乐；复现无配乐版本时需明确选择“无”。

## 依据

- 公开包内 prompt.json：S054 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
