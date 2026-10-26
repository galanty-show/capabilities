# S033 · 抛体运动：三种角度谁飞得远 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Codex CLI · gpt-6-astra (high)（云端）
- 画面代码：Codex CLI · gpt-6-astra (high)（云端）
- 配音/对齐/校验：macOS say · Tingting（本地）
- 配音/对齐/校验：Qwen3-TTS 0.6B · Qwen3-TTS-12Hz-0.6B-CustomVoice-8bit · Dylan（本地）
- 配乐/音效：随包曲库 · Calm Current 78（本地）
- 修改：Codex CLI · gpt-6-astra (high)（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约 51 秒的横版（16:9）物理讲解片：从同一点以相同初速度抛出三颗球，发射角分别是 30°、45°、60°，落点和发射点一样高，比较谁飞得最远。画面同时画出三条抛物线和落点，标出初速度 10 m/s、g = 10 m/s²、忽略空气阻力，最后用 sin 2θ 解释为什么 45° 最远、30° 和 60° 射程相同。女声旁白，配一段平稳的底乐，数值必须和公式对得上。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 51-second 16:9 landscape physics explainer: launch three balls from the same point at the same speed, at 30°, 45° and 60°, landing at the height they were launched from, and ask which lands farthest. Draw all three trajectories and landing points at once, label v₀ = 10 m/s, g = 10 m/s² and no air resistance, then use sin 2θ to show why 45° goes farthest and 30° and 60° tie. Female voiceover over a steady bed, and every number on screen has to match the formula. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 51 秒的橫版（16:9）物理講解片：從同一點以同樣初速度拋出三顆球，發射角分別是 30°、45°、60°，落點和發射點一樣高，比較哪一顆飛得最遠。畫面同時畫出三條拋物線和落點，標出初速度 10 m/s、g = 10 m/s²、忽略空氣阻力，最後用 sin 2θ 解釋為什麼 45° 最遠、30° 和 60° 射程相同。女聲旁白，配一段平穩的背景音樂，數值必須和公式對得上。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約51秒の横長（16:9）の物理解説動画を作ってください。同じ地点から同じ初速度で、発射角30°、45°、60°の3つのボールを投げ（着地点は発射点と同じ高さ）、どれが一番遠くまで飛ぶかを比べます。3本の放物線と着地点を同時に描き、初速度10 m/s、g = 10 m/s²、空気抵抗は無視、と表示したうえで、最後に sin 2θ を使って45°が最も遠く、30°と60°の飛距離が同じになる理由を説明してください。女性のナレーションに落ち着いたBGMを合わせ、画面上の数値は必ず公式と一致させてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 51초 길이의 가로형(16:9) 물리 설명 영상을 만들어 주세요. 같은 지점에서 같은 초속도로 공 세 개를 30°, 45°, 60°로 던지고(낙하 지점은 발사 지점과 같은 높이), 어느 공이 가장 멀리 가는지 물어요. 세 궤적과 낙하 지점을 한 화면에 함께 그리고, v₀ = 10 m/s, g = 10 m/s², 공기 저항 무시를 표시한 뒤, sin 2θ로 45°가 가장 멀리 가고 30°와 60°의 사거리가 같은 이유를 보여 주세요. 차분한 배경 음악 위에 여성 내레이션을 깔고, 화면의 모든 숫자는 공식과 정확히 맞아야 해요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo explicativo de física de unos 51 segundos en formato horizontal 16:9: lanza tres pelotas desde el mismo punto y a la misma velocidad, a 30°, 45° y 60°, cayendo a la misma altura desde la que salen, y pregunta cuál llega más lejos. Dibuja a la vez las tres trayectorias y los puntos de caída, rotula v₀ = 10 m/s, g = 10 m/s² y sin resistencia del aire, y luego usa sin 2θ para mostrar por qué 45° llega más lejos y 30° y 60° empatan. Narración con voz femenina sobre una base estable; cada número en pantalla tiene que cuadrar con la fórmula. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 51 Sekunden langes Physik-Erklärvideo im Querformat (16:9): Drei Bälle werden vom selben Punkt mit derselben Geschwindigkeit abgeschossen, unter 30°, 45° und 60°, und landen auf Abschusshöhe – welcher landet am weitesten? Zeichne alle drei Flugbahnen und Aufschlagpunkte gleichzeitig, beschrifte v₀ = 10 m/s, g = 10 m/s² und „ohne Luftwiderstand“, und zeig dann mit sin 2θ, warum 45° am weitesten fliegt und 30° und 60° gleich weit kommen. Eine Sprecherin, dazu gleichmäßige Hintergrundmusik, und jede Zahl auf dem Bildschirm muss zur Formel passen. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une vidéo explicative de physique d'environ 51 secondes au format paysage (16:9) : trois balles sont lancées du même point, à la même vitesse, sous 30°, 45° et 60°, et retombent à leur hauteur de départ – laquelle retombe le plus loin ? Tracez en même temps les trois trajectoires et leurs points d'impact, indiquez v₀ = 10 m/s, g = 10 m/s² et l'absence de résistance de l'air, puis montrez avec sin 2θ pourquoi 45° va le plus loin et pourquoi 30° et 60° arrivent à égalité. Voix off féminine sur un fond musical régulier, et chaque valeur à l'écran doit correspondre à la formule. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo explicativo de física de cerca de 51 segundos na horizontal (16:9): lance três bolas do mesmo ponto e com a mesma velocidade, a 30°, 45° e 60°, caindo na mesma altura de onde saíram, e pergunte qual cai mais longe. Desenhe as três trajetórias e os pontos de queda ao mesmo tempo, indique v₀ = 10 m/s, g = 10 m/s² e ausência de resistência do ar, e depois use sen 2θ para mostrar por que 45° vai mais longe e por que 30° e 60° empatam. Narração com voz feminina sobre uma música de fundo constante, e todo número na tela precisa bater com a fórmula. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 公开包内 prompt.json：S033 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
