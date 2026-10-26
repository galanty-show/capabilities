# S122 · 栖云相册 · UI 开场动效 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 配乐/音效：随包曲库 · Project Utopia（本地）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "把 GitHub 上 HyperFrames 的 UI 开场动效模板改写成文影工程：12 秒方版、无旁白，七段帧号和缓动不动，品牌换成虚构的相册 App，标志和图标自己画，文字都放进参数。",
  "en": "Rework the HyperFrames UI sting template from GitHub into a Galanty project: 12 s square, no voiceover, keep all seven sections' frame numbers and easing, rebrand it as a fictional photo-album app with self-drawn marks and icons, and put all text in parameters.",
  "zh-Hant": "把 GitHub 上 HyperFrames 的 UI 開場動效範本改寫成文影工程：12 秒方版、無旁白，七段幀號和緩動不動，品牌換成虛構的相簿 App，文字都放進參數。",
  "ja": "GitHub にある HyperFrames の UI スティングテンプレートを Galanty のプロジェクトに書き直してください。12秒の正方形、ナレーションなし、7セクションのフレーム番号とイージングはそのまま、架空のアルバムアプリに置き換え、文字はすべてパラメータにします。",
  "ko": "GitHub의 HyperFrames UI 스팅 템플릿을 Galanty 프로젝트로 다시 만들어 주세요. 12초 정사각형, 내레이션 없이 7개 구간의 프레임 번호와 이징은 그대로 두고, 가상의 사진 앨범 앱으로 바꾸며 글자는 모두 파라미터로 둡니다.",
  "es": "Convierte la plantilla de UI sting de HyperFrames de GitHub en un proyecto de Galanty: 12 s en cuadrado, sin voz, conserva los fotogramas y las curvas de las siete secciones, cambia la marca por una app ficticia de álbumes de fotos y pon todo el texto en parámetros.",
  "de": "Baue die UI-Sting-Vorlage von HyperFrames auf GitHub zu einem Galanty-Projekt um: 12 s quadratisch, ohne Sprecher, Frame-Nummern und Easing aller sieben Abschnitte unverändert, umgebrandet auf eine fiktive Fotoalbum-App, alle Texte als Parameter.",
  "fr": "Transformez le modèle d'UI sting HyperFrames de GitHub en projet Galanty : 12 s au format carré, sans voix off, en gardant les numéros d'images et les courbes des sept sections, rebaptisé en application fictive d'albums photo, avec tout le texte en paramètres.",
  "pt-BR": "Transforme o modelo de UI sting do HyperFrames no GitHub em um projeto do Galanty: 12 s em formato quadrado, sem narração, mantendo os quadros e as curvas das sete seções, com um app fictício de álbuns de fotos e todo o texto como parâmetros."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 先原地打开上游工程，走播放、批注、交给 Agent 修改、回到原秒数的回路。
- 保留上游许可与运动设计来源，将主题改为虚构产品或团队界面，替换不宜再分发的素材。
- 编写可随样片分发的幕代码，按对应音乐与帧表编译、抽帧、导出。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：S121/S122 共用账本 33 条，账面合计 US$0.6277，未按单片拆分。README 的候选 Lyria 数与现存账本有差异，不能据此补造一次调用。S122 原交付版另做 Lyria 专配乐，随包样片使用既有 Project Utopia；不将组费用重复当作单片费用。

## 踩坑与验证边界

- 原上游工程七个 clip 曾同时叠显；后续兼容修复另有记录。
- 交付版专配乐与随包曲不同，帧表相同不等于两版声音相同。

## 依据

- 公开包内 prompt.json：S122 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：github-html-20261013 / README.md“声音与成本”；组 cost-ledger.jsonl。
- 修复档案标识：1.0.1 上线后修复 / HyperFrames 兼容修复。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
