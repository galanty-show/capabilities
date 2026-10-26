# S050 · 把问题变成知识 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-astra (high)（云端）
- 画面代码：Codex CLI · gpt-6-sol (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 39 秒的横版（16:9）知识讲解短片，主题是“把问题变成知识”：先讲“观察、记录、用证据修正判断”，再讲“观察提出问题、实验检验假设、证据支持结论”的节奏。接着自己设计并列出一组与主题相关的八个步骤，再把这同一组步骤分别排成顺序链、中心辐射、网格和树状四种关系图，说明不同关系要用不同排布。女声旁白，不加配乐。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 39-second 16:9 landscape knowledge explainer called “Turn questions into knowledge”: first “observe, record, let evidence correct your judgment,” then the rhythm of “observation raises a question, an experiment tests a hypothesis, evidence supports the conclusion.” Then define and list eight steps on the topic, and lay that same set out four ways — a sequence, a hub, a grid and a tree — to show that different relationships need different layouts. Female voiceover, no music. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 39 秒的橫版（16:9）知識講解短片，主題是「把問題變成知識」：先講「觀察、記錄、用證據修正判斷」，再講「觀察提出問題、實驗檢驗假設、證據支持結論」的節奏。接著自己設計並列出一組與主題相關的八個步驟，再把這同一組步驟分別排成順序鏈、中心輻射、網格和樹狀四種關係圖，說明不同關係要用不同排法。女聲旁白，不加配樂。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "「問いを知識に変える」をテーマに、約39秒の横長（16:9）の知識解説ショート動画を作ってください。まず「観察し、記録し、証拠で判断を修正する」ことを、次に「観察が問いを生み、実験が仮説を検証し、証拠が結論を支える」という流れを説明します。そのあとテーマに沿った8つのステップを自分で考えて書き出し、その同じ8つを、順番のチェーン、中心からの放射状、グリッド、ツリーの4種類の関係図に並べ替え、関係が違えば配置も変えるべきことを示してください。女性のナレーションでBGMはなしにしてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 39초 길이의 가로형(16:9) 지식 설명 영상을 만들어 주세요. 제목은 “질문을 지식으로 바꾸기”예요. 먼저 “관찰하고, 기록하고, 증거로 판단을 고친다”를 보여 주고, 이어서 “관찰이 질문을 낳고, 실험이 가설을 검증하고, 증거가 결론을 뒷받침한다”는 흐름을 보여 주세요. 그다음 주제에 맞는 여덟 단계를 직접 정해 적고, 그 같은 여덟 단계를 순서 사슬, 중심 방사형, 격자, 트리 네 가지 관계도로 각각 배치해서, 관계가 다르면 배치도 달라져야 한다는 걸 보여 주세요. 여성 내레이션에 배경 음악은 넣지 마세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo explicativo de unos 39 segundos en formato horizontal 16:9 titulado «Convierte preguntas en conocimiento»: primero «observa, registra y deja que las pruebas corrijan tu juicio», y luego el ritmo de «la observación plantea una pregunta, un experimento pone a prueba una hipótesis y las pruebas respaldan la conclusión». Después, define y enumera ocho pasos relacionados con el tema y organiza esos mismos ocho pasos de cuatro maneras —una secuencia, un esquema radial, una cuadrícula y un árbol— para mostrar que cada tipo de relación pide una disposición distinta. Narración con voz femenina, sin música. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 39 Sekunden langes Wissensvideo im Querformat (16:9) mit dem Titel „Aus Fragen Wissen machen“: zuerst „beobachten, festhalten, das eigene Urteil von Belegen korrigieren lassen“, dann der Rhythmus „Beobachtung wirft eine Frage auf, ein Experiment prüft eine Hypothese, Belege stützen die Schlussfolgerung“. Danach leg acht Schritte zum Thema fest, liste sie auf und ordne genau diese acht Schritte auf vier Arten an – als Abfolge, Stern, Raster und Baum –, um zu zeigen, dass unterschiedliche Beziehungen unterschiedliche Layouts brauchen. Eine Sprecherin, keine Musik. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une vidéo de vulgarisation d'environ 39 secondes au format paysage (16:9) intitulée « Transformer les questions en savoir » : d'abord « observer, noter, laisser les preuves corriger son jugement », puis le rythme « l'observation soulève une question, une expérience teste une hypothèse, les preuves étayent la conclusion ». Définissez ensuite huit étapes liées au thème, listez-les, puis disposez ces mêmes huit étapes de quatre façons – en séquence, en étoile, en grille et en arbre – pour montrer que des relations différentes demandent des mises en page différentes. Voix off féminine, sans musique. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo explicativo de cerca de 39 segundos na horizontal (16:9) chamado “Transforme perguntas em conhecimento”: primeiro, “observe, registre e deixe as evidências corrigirem seu julgamento”; depois, o ritmo de “a observação levanta uma pergunta, um experimento testa uma hipótese, as evidências sustentam a conclusão”. Em seguida, defina e liste oito etapas ligadas ao tema e organize essas mesmas oito etapas de quatro jeitos — em sequência, em estrela a partir de um centro, em grade e em árvore — para mostrar que relações diferentes pedem layouts diferentes. Narração com voz feminina, sem música. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

逐轮原话：未记录。

## 步骤

- 以原创知识短文制作模板修补后的回归对照片；Agent 写分镜、修补模板画面。
- 原版用 macOS Tingting 配音且不配乐，历史元数据记载 10-05 起改用 Qwen3-TTS 0.6B 预生成旁白；当前公开包的种子另见 CREDITS.md。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 原来配乐留空代表不配乐，后来的管线会自动配乐；复现无配乐版本时需明确选择“无”。

## 依据

- 公开包内 prompt.json：S050 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
