# S042 · 虚构清单接口演示 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-sol (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：随包曲库 · Tense Undertow 80（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 50 秒的横版（16:9）技术流程讲解片，演示一个虚构的清单接口：本地表单发出“新增”请求，收到回执后核对状态和编号才更新列表，超时就保持未完成并提示稍后重试。用关系图、四步流程和请求、回执数据包来回飞行的动画讲清楚，女声旁白，配一段略带紧张感的底乐，并说明这是虚构示意、不访问网络。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 50-second 16:9 landscape technical walkthrough of a fictional to-do list API: a local form sends an “add” request, the list updates only after the receipt's status and ID check out, and on a timeout the item stays pending with a “try again later” hint. Explain it with a relationship diagram, a four-step flow and animated request and receipt packets flying back and forth, female voiceover over a slightly tense bed, and say clearly that it is a fictional illustration with no network calls. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 50 秒的橫版（16:9）技術流程講解片，示範一個虛構的清單 API：本機表單送出「新增」請求，收到回應後核對狀態和編號才更新清單，逾時就維持未完成，並提示稍後再試。用關係圖、四步驟流程，以及請求、回應封包來回飛行的動畫講清楚，女聲旁白，配一段略帶緊張感的背景音樂，並說明這是虛構示意、不會連上網路。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約50秒の横長（16:9）の技術フロー解説動画を作ってください。架空のリスト用 API を例に、ローカルのフォームが「追加」リクエストを送り、レスポンスのステータスと ID を確認してからリストを更新し、タイムアウトしたら未完了のまま「しばらくしてから再試行」と表示する流れを示します。関係図、4ステップのフロー、リクエストとレスポンスのパケットが行き来するアニメーションでわかりやすく説明してください。女性のナレーションに少し緊張感のあるBGMを合わせ、架空の図解であり実際のネットワーク通信は行わないことも明記してください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 50초 길이의 가로형(16:9) 기술 흐름 설명 영상을 만들어 주세요. 가상의 할 일 목록 API를 다루는데, 로컬 폼이 “추가” 요청을 보내고, 응답의 상태와 ID가 확인된 뒤에야 목록이 갱신되며, 시간이 초과되면 항목은 미완료로 남고 “잠시 후 다시 시도해 주세요” 안내가 떠요. 관계도, 4단계 흐름, 요청과 응답 패킷이 오가는 애니메이션으로 설명해 주세요. 살짝 긴장감 있는 배경 음악 위에 여성 내레이션을 깔고, 가상의 예시이며 네트워크에 접속하지 않는다는 점을 분명히 말해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo técnico de unos 50 segundos en formato horizontal 16:9 que recorra una API ficticia de lista de tareas: un formulario local envía una petición de «añadir», la lista solo se actualiza cuando el estado y el ID del acuse de recibo cuadran, y si se agota el tiempo, la tarea queda pendiente con un aviso de «inténtalo más tarde». Explícalo con un diagrama de relaciones, un flujo de cuatro pasos y paquetes animados de petición y respuesta que van y vienen, narración con voz femenina sobre una base algo tensa, y deja claro que es una ilustración ficticia que no se conecta a la red. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 50 Sekunden langes Technik-Erklärvideo im Querformat (16:9) über eine fiktive To-do-Listen-API: Ein lokales Formular sendet eine „Hinzufügen“-Anfrage, die Liste wird erst aktualisiert, wenn Status und ID der Antwort stimmen, und bei einer Zeitüberschreitung bleibt der Eintrag offen mit dem Hinweis „später erneut versuchen“. Erkläre es mit einem Beziehungsdiagramm, einem Ablauf in vier Schritten und animierten Anfrage- und Antwortpaketen, die hin und her fliegen, dazu eine Sprecherin und leicht angespannte Hintergrundmusik, und sag deutlich, dass es eine fiktive Darstellung ohne Netzwerkzugriffe ist. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une vidéo explicative technique d'environ 50 secondes au format paysage (16:9) sur une API fictive de liste de tâches : un formulaire local envoie une requête « ajouter », la liste n'est mise à jour qu'une fois le statut et l'identifiant de la réponse vérifiés, et en cas de délai dépassé l'élément reste en attente avec le message « réessayez plus tard ». Expliquez-le avec un schéma de relations, un circuit en quatre étapes et des paquets de requête et de réponse animés qui font des allers-retours, une voix off féminine sur un fond musical légèrement tendu, et précisez clairement qu'il s'agit d'une illustration fictive, sans aucun accès réseau. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um passo a passo técnico de cerca de 50 segundos na horizontal (16:9) sobre uma API fictícia de lista de tarefas: um formulário local envia uma requisição de “adicionar”, a lista só é atualizada depois que o status e o ID da resposta são conferidos e, se der timeout, o item fica pendente com um aviso de “tente novamente mais tarde”. Explique com um diagrama de relações, um fluxo de quatro etapas e pacotes animados de requisição e resposta indo e voltando, narração com voz feminina sobre uma música de fundo levemente tensa, e diga claramente que é uma ilustração fictícia, sem nenhum acesso à rede. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 样片目录原有的时长估计偏短；后续旁白实测片长约 64.5 秒，这不是制作耗时。

## 依据

- 公开包内 prompt.json：S042 的 tools 与 basis 制作来历元数据。
- 修复档案标识：1.0.1 上线后修复 / 样片时长校正。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
