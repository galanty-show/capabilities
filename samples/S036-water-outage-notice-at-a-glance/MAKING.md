# S036 · 停水通知，一眼看清 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：随包曲库 · Calm Current 64（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 31 秒的横版（16:9）通知讲解片，把一则虚构的社区停水通知讲得一眼看清：先记住停水时间，再看影响哪几栋楼，停水前备水、关好龙头，恢复时间以正式通知为准。每幕只突出一个信息，用时间条、楼栋示意和清单动画，女声旁白，配一段轻柔的底乐，并标明内容是虚构示例。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 31-second 16:9 landscape explainer that makes a fictional water-outage notice clear at a glance: first the outage time, then which buildings are affected, then two things to do beforehand (store some water, close the taps), and finally that the official notice decides when service returns. Highlight one fact per scene with a time bar, a building map and a checklist animation, female voiceover over a soft bed, and label the content as a made-up example. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 31 秒的橫版（16:9）通知講解片，把一則虛構的社區停水通知講得一目了然：先記住停水時間，再看影響哪幾棟樓，停水前先儲水、關好水龍頭，恢復供水的時間以正式通知為準。每幕只突出一項資訊，用時間條、大樓示意圖和清單動畫，女聲旁白，配一段輕柔的背景音樂，並標明內容是虛構範例。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "架空の地域の断水のお知らせを一目でわかるように伝える、約31秒の横長（16:9）のお知らせ解説動画を作ってください。まず断水の時間、次にどの棟が対象か、断水前に水をためて蛇口を閉めておくこと、そして復旧時間は正式なお知らせに従うことを伝えます。1シーンにつき1つの情報だけを強調し、タイムバー、建物の配置図、チェックリストのアニメーションを使ってください。女性のナレーションにやわらかいBGMを合わせ、内容が架空の例であることを明記してください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 31초 길이의 가로형(16:9) 안내 설명 영상을 만들어 주세요. 가상의 단지 단수 공지를 한눈에 알아보게 정리하는데, 먼저 단수 시간, 다음으로 영향을 받는 동, 그다음 미리 할 두 가지(물 받아 두기, 수도꼭지 잠그기), 마지막으로 재개 시간은 공식 공지를 따른다는 점이에요. 장면마다 정보 하나만 강조하고, 시간 막대, 건물 배치도, 체크리스트 애니메이션을 써 주세요. 부드러운 배경 음악 위에 여성 내레이션을 깔고, 내용이 가상의 예시라는 것을 표시해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo explicativo de unos 31 segundos en formato horizontal 16:9 que deje claro de un vistazo un aviso ficticio de corte de agua en el vecindario: primero la hora del corte, luego qué edificios se ven afectados, después dos cosas que hacer antes (guardar algo de agua y cerrar los grifos) y, por último, que la hora de vuelta del servicio la fija el aviso oficial. Destaca un solo dato por escena con una barra de tiempo, un plano de los edificios y una animación de lista de comprobación, narración con voz femenina sobre una base suave, e indica que el contenido es un ejemplo inventado. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 31 Sekunden langes Erklärvideo im Querformat (16:9), das eine fiktive Mitteilung über eine Wasserabschaltung auf einen Blick verständlich macht: zuerst der Zeitraum der Abschaltung, dann welche Gebäude betroffen sind, dann zwei Dinge, die man vorher erledigt (etwas Wasser vorrätig halten, die Hähne zudrehen), und schließlich, dass die offizielle Mitteilung darüber entscheidet, wann das Wasser wieder läuft. Hebe pro Szene eine Information hervor – mit Zeitbalken, Gebäudeplan und Checklisten-Animation –, dazu eine Sprecherin und sanfte Hintergrundmusik, und kennzeichne den Inhalt als erfundenes Beispiel. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une vidéo explicative d'environ 31 secondes au format paysage (16:9) qui rend un avis fictif de coupure d'eau lisible en un coup d'œil : d'abord l'horaire de la coupure, puis les bâtiments concernés, ensuite deux choses à faire avant (faire une réserve d'eau, fermer les robinets), et enfin le fait que c'est l'avis officiel qui fait foi pour le rétablissement. Mettez en avant une seule information par scène avec une barre horaire, un plan des bâtiments et une animation de liste à cocher, une voix off féminine sur un fond musical doux, et indiquez que le contenu est un exemple inventé. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo explicativo de cerca de 31 segundos na horizontal (16:9) que deixe claro, à primeira vista, um aviso fictício de falta d'água: primeiro o horário da interrupção, depois quais prédios serão afetados, em seguida duas coisas a fazer antes (guardar um pouco de água e fechar as torneiras) e, por fim, que é o aviso oficial que define quando o abastecimento volta. Destaque uma informação por cena com uma barra de tempo, um mapa dos prédios e uma animação de checklist, narração com voz feminina sobre uma música de fundo suave, e indique que o conteúdo é um exemplo inventado. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

逐轮原话：未记录。

## 步骤

- Agent 直接撰写文案、分镜与原创幕代码，没有调用工作台内置编稿。
- 手选随包底乐，以 macOS Tingting 生成原版旁白，本地渲染并查看抽帧后返工。
- 历史元数据记载 10-05 起样片库改用本地 Qwen3-TTS 0.6B 预生成旁白；这次更换与当前公开包种子需分开核对。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 未找到可归属本片的独立踩坑记录。

## 依据

- 公开包内 prompt.json：S036 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
