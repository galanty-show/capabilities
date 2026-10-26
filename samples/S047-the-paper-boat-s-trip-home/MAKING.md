# S047 · 小纸船的回程 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：自动配乐（本地）
- 配乐/音效：随包曲库 · Piano and Strings 76（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 30 秒的横版（16:9）原创寓言插画短片：小纸船要把信送到对岸，芦苇说顺流，水草说逆流；它先观察水纹，从石头旁的缓水道绕过去，信一点没湿。结尾留一个问题给观众：你会先观察什么？四幕插画风，女声讲述，配乐按“故事”自动挑选。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 30-second 16:9 landscape illustrated original fable: a little paper boat must carry a letter to the far bank; the reeds say go with the current, the waterweed says go against it. The boat reads the ripples first, slips around a rock through calmer water, and the letter arrives dry. End with a question for the viewer: what would you look at first? Four illustrated scenes, a female storyteller, and music picked automatically for a story. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 30 秒的橫版（16:9）原創寓言插畫短片：小紙船要把信送到對岸，蘆葦說順流，水草說逆流；它先觀察水紋，從石頭旁的緩流繞過去，信一點也沒濕。結尾留一個問題給觀眾：你會先觀察什麼？四幕插畫風，女聲講述，配樂依「故事」自動挑選。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約30秒の横長（16:9）のオリジナル寓話のイラスト動画を作ってください。小さな紙の舟が手紙を向こう岸へ届けようとしていて、アシは流れに乗れと言い、水草は流れに逆らえと言います。紙の舟はまず水面の模様を観察し、石のそばの流れのゆるやかなところを回り込んで進み、手紙は少しも濡れずに届きます。最後に「あなたなら、まず何を観察しますか？」と見る人に問いかけてください。イラスト調の4シーンで、語りは女性の声、BGMは「物語」として自動で選ばせてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 30초 길이의 가로형(16:9) 창작 우화 그림 영상을 만들어 주세요. 작은 종이배가 편지를 건너편 강가까지 날라야 하는데, 갈대는 물살을 따라가라 하고, 물풀은 물살을 거슬러 가라고 해요. 종이배는 먼저 물결을 살피고, 바위 옆 잔잔한 물길로 돌아가서 편지를 하나도 젖지 않게 전해요. 마지막에는 “여러분이라면 먼저 무엇을 살펴보겠어요?”라는 질문을 시청자에게 남기고, 그림 스타일의 네 장면에 여성 목소리로 들려주며, 배경 음악은 ‘이야기’에 맞춰 자동으로 고르게 해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz una fábula original ilustrada de unos 30 segundos en formato horizontal 16:9: un barquito de papel tiene que llevar una carta a la otra orilla; los juncos le dicen que vaya con la corriente y las algas, que vaya en contra. El barquito observa primero las ondas, rodea una roca por aguas más tranquilas y la carta llega seca. Termina con una pregunta para quien lo vea: ¿qué observarías tú primero? Cuatro escenas ilustradas, una voz femenina que cuente la historia y música elegida automáticamente para un cuento. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 30 Sekunden langes illustriertes Video im Querformat (16:9) mit einer eigenen Fabel: Ein kleines Papierboot soll einen Brief ans andere Ufer bringen; das Schilf rät, mit der Strömung zu fahren, die Wasserpflanze rät, dagegen anzufahren. Das Boot liest zuerst die Wellen, gleitet durch ruhigeres Wasser an einem Felsen vorbei, und der Brief kommt trocken an. Zum Schluss eine Frage an die Zuschauer: Worauf würdest du zuerst achten? Vier illustrierte Szenen, eine Erzählerin und automatisch passend für eine Geschichte ausgewählte Musik. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une courte vidéo illustrée d'environ 30 secondes au format paysage (16:9) sur une fable originale : un petit bateau en papier doit porter une lettre jusqu'à l'autre rive ; les roseaux lui disent de suivre le courant, les algues de le remonter. Le bateau observe d'abord les rides de l'eau, contourne un rocher par une eau plus calme, et la lettre arrive sèche. Terminez par une question au public : qu'observeriez-vous en premier ? Quatre scènes illustrées, une conteuse et une musique choisie automatiquement pour une histoire. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça uma fábula original ilustrada de cerca de 30 segundos na horizontal (16:9): um barquinho de papel precisa levar uma carta até a outra margem; os juncos dizem para seguir a correnteza, a alga diz para ir contra ela. O barquinho primeiro observa as ondulações, contorna uma pedra por águas mais calmas, e a carta chega sequinha. Termine com uma pergunta para quem assiste: o que você observaria primeiro? Quatro cenas ilustradas, uma voz feminina contando a história e música escolhida automaticamente para histórias. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 最初插图与纸船正文不符，修改为纸船后重新渲染。

## 依据

- 公开包内 prompt.json：S047 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
