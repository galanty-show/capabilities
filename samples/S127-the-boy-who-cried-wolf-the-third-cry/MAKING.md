# S127 · 狼来了 · 第三声 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code（本机 Agent 入口；模型推理位置未记录）
- 画面代码：Claude Code（本机 Agent 入口；模型推理位置未记录）
- 配音/对齐/校验：Gemini TTS（云端）
- 配乐/音效：Lyria 3 Pro（云端）
- 配乐/音效：NumPy（本地）
- 视觉素材：Codex image_gen（云端）
- 视觉素材：Veo 3.1 Fast（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "把《狼来了》做成约三分钟的电影感手绘动画短片，中英文各一版。用“回声就是信任”串起三次喊狼：第一声传遍山谷，第二声变弱，第三声真有狼却没有回应。多角色配音、原创配乐与声波动效，先播放预览。",
  "en": "Create a roughly three-minute cinematic, hand-painted animated retelling of The Boy Who Cried Wolf in Chinese and English. Make echoes stand for trust: the first cry reaches the whole valley, the second grows weaker, and the real third cry gets no answer. Use multiple character voices, original music and animated sound waves. Show the preview first.",
  "zh-Hant": "把《狼來了》做成約三分鐘的電影感手繪動畫短片，中英文各一版。用「回聲就是信任」串起三次喊狼：第一聲傳遍山谷，第二聲變弱，第三聲真有狼卻沒有回應。多角色配音、原創配樂與聲波動效，先播放預覽。",
  "ja": "「オオカミ少年」を約3分の映画風手描きアニメにし、中国語版と英語版を作って。こだまを信頼の象徴にして、最初の叫びは谷全体へ、二度目は弱く、本当に狼が来た三度目には返事がない。複数の声とオリジナル音楽、音波の動きを使い、先にプレビューを見せて。",
  "ko": "양치기 소년을 약 3분 길이의 영화 같은 손그림 애니메이션으로 중국어와 영어 두 버전으로 만들어 줘. 메아리를 신뢰로 표현해 첫 외침은 골짜기에 가득하고 두 번째는 약해지며 진짜 늑대가 온 세 번째에는 응답이 없게 해. 여러 배역 목소리와 창작 음악, 음파 효과를 쓰고 먼저 미리보기를 보여 줘.",
  "es": "Crea una animación cinematográfica dibujada a mano de unos tres minutos de El pastor mentiroso, en chino e inglés. Usa el eco como símbolo de confianza: la primera llamada llena el valle, la segunda es débil y la tercera, real, queda sin respuesta. Incluye varias voces, música original y ondas animadas. Muestra primero la vista previa.",
  "de": "Erstelle eine etwa dreiminütige, filmisch handgezeichnete Animation von Der Hirtenjunge und der Wolf auf Chinesisch und Englisch. Das Echo steht für Vertrauen: Der erste Ruf füllt das Tal, der zweite wird schwächer, der echte dritte bleibt unbeantwortet. Nutze mehrere Stimmen, eigene Musik und animierte Schallwellen. Zeige zuerst eine Vorschau.",
  "fr": "Crée une animation cinématographique dessinée à la main, environ trois minutes, du Garçon qui criait au loup en chinois et en anglais. Les échos symbolisent la confiance : le premier appel remplit la vallée, le deuxième faiblit, le troisième, réel, reste sans réponse. Ajoute plusieurs voix, une musique originale et des ondes animées. Montre d’abord l’aperçu.",
  "pt-BR": "Crie uma animação cinematográfica desenhada à mão de cerca de três minutos de O menino que gritava lobo, em chinês e inglês. Faça os ecos representarem confiança: o primeiro grito enche o vale, o segundo enfraquece e o terceiro, verdadeiro, fica sem resposta. Use várias vozes, música original e ondas animadas. Mostre a prévia primeiro."
}
```

逐轮原话：未记录。

## 步骤

- 按“回声就是信任”设计三次喊话，以人物设定参考生成 20 张统一风格画作，再用幕代码做声波、运镜、灯光与环境。
- Gemini Pro TTS 分配旁白与角色音色，逐句拼音校验；按模型、音色与讲法缓存并行预热。
- Lyria 多段生成后按实测锚点剪辑，NumPy 合成回声与音效；另做三段各 8 秒的 Veo 动态镜头。
- 样片封装复用现有中英旁白与对齐，动态片段压为 960×540、24 fps；缺视频槽时可回退底图。

## 耗时与费用

- 耗时：端到端总耗时未记录。制作 README 近似记载 31 句配音从串行约 40 分钟变为并行预热约 3 分钟；这是该片配音阶段的观察，未记录严谨效率对照。不能将随包封装的缓存命中或降规格当作首次制作耗时。
- 费用：保留逐调用账本 470 条，账面合计 US$4.4171；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 部分 Pro TTS 按工具包统一单价记账，可能低于实际计费。 其中 Veo 24 秒为 US$2.88、Lyria 13 条为 US$1.04；账本不含缺失的编稿/画作总账，也不能证明覆盖所有重试。

## 踩坑与验证边界

- 悬念慢读被默认最小字速当异常，放宽本片判定后避免无效重录。
- Veo 1080p 不支持该次尝试的 6 秒长度，改 8 秒；生成操作号落盘后可续取，防止中断重付费。
- 直接内联 data:video 曾被 CSP 拒绝，内容代码改 Blob URL；按实际素材拆幕避免单幕过大。
- 随包动态与画作有损压缩，与原 1080p 审片视频存在画质差异；未以抽帧冒称整片播放或人耳试听完成。

## 依据

- 公开包内 prompt.json：S127 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：wolf-cry-20261016 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 保留制作档案标识：wolf-cry-20261016 / README.md“工具包改动”“双语样片收口”“随包规格边界”。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
