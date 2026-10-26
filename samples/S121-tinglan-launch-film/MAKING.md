# S121 · 听澜纪要 · 发布片 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 配乐/音效：随包曲库 · Play On（本地）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "把 GitHub 上一个 HyperFrames 发布片范例改写成文影工程：约 50 秒横版、无旁白，按《Play On》的乐句分七段（钩子、问题、概念、流程、数字、行动、品牌）卡点，产品换成虚构的会议纪要 App，画面文字都放进参数。",
  "en": "Rework a HyperFrames launch-film example from GitHub into a Galanty project: about 50 s, 16:9, no voiceover, seven sections cut to the phrases of Play On (hook, problem, concept, workflow, metric, CTA, brand), rebranded as a fictional meeting-notes app, with all on-screen text as parameters.",
  "zh-Hant": "把 GitHub 上一個 HyperFrames 發布片範例改寫成文影工程：約 50 秒橫版、無旁白，按《Play On》的樂句分七段卡點，產品換成虛構的會議紀要 App，畫面文字都放進參數。",
  "ja": "GitHub の HyperFrames ローンチ動画のサンプルを Galanty のプロジェクトに書き直してください。約50秒の横長、ナレーションなし、Play On のフレーズに合わせた7セクション構成で、架空の議事録アプリに置き換え、画面の文字はすべてパラメータにします。",
  "ko": "GitHub의 HyperFrames 런칭 영상 예제를 Galanty 프로젝트로 다시 만들어 주세요. 약 50초 가로형, 내레이션 없이 Play On의 악구에 맞춘 7개 구간으로 구성하고, 가상의 회의록 앱으로 바꾸며 화면 글자는 모두 파라미터로 둡니다.",
  "es": "Convierte un ejemplo de vídeo de lanzamiento de HyperFrames de GitHub en un proyecto de Galanty: unos 50 s en horizontal, sin voz, siete secciones al ritmo de las frases de Play On, con una app ficticia de actas de reuniones y todo el texto en pantalla como parámetros.",
  "de": "Baue ein HyperFrames-Launchvideo-Beispiel von GitHub zu einem Galanty-Projekt um: etwa 50 s im Querformat, ohne Sprecher, sieben Abschnitte im Takt der Phrasen von Play On, umgebrandet auf eine fiktive Meeting-Protokoll-App, alle Bildschirmtexte als Parameter.",
  "fr": "Transformez un exemple de vidéo de lancement HyperFrames trouvé sur GitHub en projet Galanty : environ 50 s en paysage, sans voix off, sept sections calées sur les phrases de Play On, rebaptisé en application fictive de comptes rendus de réunion, avec tout le texte à l'écran en paramètres.",
  "pt-BR": "Transforme um exemplo de vídeo de lançamento do HyperFrames no GitHub em um projeto do Galanty: cerca de 50 s na horizontal, sem narração, sete seções no ritmo das frases de Play On, com um app fictício de atas de reunião e todo o texto da tela como parâmetros."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 先原地打开上游工程，走播放、批注、交给 Agent 修改、回到原秒数的回路。
- 保留上游许可与运动设计来源，将主题改为虚构产品或团队界面，替换不宜再分发的素材。
- 编写可随样片分发的幕代码，按对应音乐与帧表编译、抽帧、导出。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：S121/S122 共用账本 33 条，账面合计 US$0.6277；包含两片的候选配乐与听评，未按单片拆分。README 约 US$0.63 的摘要写 Lyria 6 首，而保留账本可见 5 条 US$0.40；保留该差异，不将组费用重复当作单片费用。随包 S121 使用既有 Play On，另做 Lyria 三版有人声切片，未采用。

## 踩坑与验证边界

- 原 HyperFrames 子合成曾未挂载、clip 显隐曾错误；这些是制作时的兼容问题，后续修复已另记。
- Lyria 候选曲带人声切片，未采用；随包曲与尝试生成的配乐费用要区分。

## 依据

- 公开包内 prompt.json：S121 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：github-html-20261013 / README.md“声音与成本”；组 cost-ledger.jsonl。
- 修复档案标识：1.0.1 上线后修复 / HyperFrames 兼容修复。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
