# S041 · 山径晨声 · 制作记录

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
  "zh-CN": "做一支约 51 秒的横版（16:9）诗歌短片：先原创一首四句五言小诗，写清晨的山路、远处的钟声、溪光竹影和归鸟。诗句逐句用大字上场，再配一段解说，让视线从山径移到溪水再到天空，末句之后留一段静默。女声慢读，配一段舒缓的底乐，意境清淡。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 51-second 16:9 landscape poetry film: first write a short original four-line poem with short lines of equal length (five characters per line if written in Chinese) about a mountain path at dawn, a distant bell, light on a stream through bamboo, and birds flying home. Bring each line in as big type, then add a short commentary that moves the eye from the path to the water to the sky, and leave a beat of silence after the last line. A slow female reading over a gentle bed, light and understated in mood. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "做一支約 51 秒的橫版（16:9）詩歌短片：先原創一首四句五言小詩，寫清晨的山路、遠處的鐘聲、溪光竹影和歸鳥。詩句逐句用大字登場，再配一段解說，讓視線從山徑移到溪水再到天空，末句之後留一段靜默。女聲慢讀，配一段舒緩的背景音樂，意境清淡。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約51秒の横長（16:9）の詩の動画を作ってください。まず、明け方の山道、遠くの鐘の音、竹の影が映る渓流のきらめき、ねぐらへ帰る鳥を詠んだ、4行のオリジナルの短い詩（各行を同じ短さに揃え、中国語で書くなら1行5字）を書いてください。詩は1行ずつ大きな文字で登場させ、続けて短い解説を加えて視線を山道から渓流、そして空へと移していき、最後の行のあとには少し静けさを残してください。女性の声でゆっくり朗読し、穏やかなBGMを合わせて、淡くすっきりした雰囲気にしてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 51초 길이의 가로형(16:9) 시 영상을 만들어 주세요. 먼저 새벽의 산길, 멀리서 들리는 종소리, 대숲 사이로 비치는 시냇물 빛, 둥지로 돌아가는 새를 담은 네 줄짜리 짧은 창작시(각 행은 같은 길이로 짧게, 중국어로 쓴다면 한 행에 다섯 글자)를 써 주세요. 각 행은 큰 글씨로 등장시키고, 이어서 시선을 산길에서 시냇물, 하늘로 옮겨 가는 짧은 해설을 덧붙인 뒤, 마지막 행 다음에는 잠시 정적을 남겨 주세요. 잔잔한 배경 음악 위에 여성 목소리로 천천히 읽고, 담백하고 은은한 분위기로 해 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo de poesía de unos 51 segundos en formato horizontal 16:9: primero escribe un breve poema original de cuatro versos cortos y de igual longitud (cinco caracteres por verso si lo escribes en chino) sobre un sendero de montaña al amanecer, una campana lejana, la luz de un arroyo entre bambúes y pájaros que vuelven al nido. Haz que cada verso entre en letra grande, añade después un breve comentario que lleve la mirada del sendero al agua y luego al cielo, y deja un momento de silencio tras el último verso. Lectura lenta con voz femenina sobre una base suave, con un tono ligero y sobrio. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 51 Sekunden langes Poesievideo im Querformat (16:9): Schreib zuerst ein kurzes, eigenes Gedicht in vier kurzen, gleich langen Zeilen (fünf Schriftzeichen pro Zeile, wenn du es auf Chinesisch schreibst) über einen Bergpfad im Morgengrauen, eine ferne Glocke, Licht auf einem Bach zwischen Bambus und heimkehrende Vögel. Lass jede Zeile in großer Schrift erscheinen, füge dann einen kurzen Kommentar hinzu, der den Blick vom Pfad zum Wasser und zum Himmel führt, und lass nach der letzten Zeile einen Moment Stille. Eine Sprecherin liest langsam, dazu sanfte Hintergrundmusik, die Stimmung leicht und zurückhaltend. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une courte vidéo poétique d'environ 51 secondes au format paysage (16:9) : écrivez d'abord un court poème original de quatre vers brefs et de même longueur (cinq caractères par vers s'il est écrit en chinois) sur un sentier de montagne à l'aube, une cloche lointaine, la lumière d'un ruisseau entre les bambous et des oiseaux qui rentrent au nid. Faites entrer chaque vers en grands caractères, ajoutez ensuite un court commentaire qui guide le regard du sentier vers l'eau puis vers le ciel, et laissez un temps de silence après le dernier vers. Lecture lente par une voix féminine sur un fond musical doux, dans une atmosphère légère et sobre. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo de poesia de cerca de 51 segundos na horizontal (16:9): primeiro escreva um poema original curto, de quatro versos curtos e do mesmo tamanho (cinco caracteres por verso, se for escrito em chinês), sobre uma trilha na montanha ao amanhecer, um sino ao longe, a luz num riacho entre bambus e pássaros voltando para o ninho. Faça cada verso entrar em letras grandes, depois acrescente um breve comentário que leve o olhar da trilha para a água e da água para o céu, e deixe um instante de silêncio depois do último verso. Leitura lenta em voz feminina sobre uma música de fundo suave, num clima leve e contido. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 样片目录原有的时长估计偏短；后续旁白实测片长约 68.0 秒，这不是制作耗时。

## 依据

- 公开包内 prompt.json：S041 的 tools 与 basis 制作来历元数据。
- 修复档案标识：1.0.1 上线后修复 / 样片时长校正。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
