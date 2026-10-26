# S120 · How Your Map Finds the Fastest Way Home · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 视觉素材：SVG + Canvas 2D (code-drawn, no images)（本地）
- 配音/对齐/校验：Gemini TTS · Gemini 3.8 Flash TTS · Puck（云端）
- 配音/对齐/校验：Gemini 3.5 Flash · gemini-3.5-flash（云端）
- 配乐/音效：Google Lyria 3 Pro · lyria-3-pro-preview（云端）
- 配乐/音效：numpy（本地）
- 配乐/音效：随包曲库 · Fastest Way Home（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "做一支约两分钟的英文横版（16:9）算法讲解短片《How Your Map Finds the Fastest Way Home》：城市是一张图（路口是节点、路段是带权的边，权重是通行时间）；Dijkstra 按已知最短时间一圈圈向外扩、保证最优；A* 再加上“直线距离按最高车速估算剩余时间”的启发，搜索范围小得多，只要估计不高估就仍然最优；堵车会改变边权、路线随之改道；最后点到真实导航用 contraction hierarchies 预处理。画面全部用代码画、不用任何生成图片：按固定种子生成一座城市路网，在画面里真跑 Dijkstra 和 A*（已访问路口像水波扩散、优先队列前沿发光、每个路口标出当前最短时间），分屏对比两种算法实际访问的路口数，演示一段路堵车变红、实时改道，结尾拉远到大陆尺度的光点网络。每一帧都按帧号从预先算好的搜索序列取前 k 步，渲染要确定。旁白清楚、聪明、带一点幽默，用高质量云端英文配音；配乐原创轻快的合成器琶音，搜索扩散时节奏推进、改道时一个转折，访问的“滴”声按批合并、克制。片中数字都要实算，事实写明出处。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a two-minute English explainer in 16:9 called “How Your Map Finds the Fastest Way Home”. A city is a graph: intersections are nodes, roads are edges weighted by travel time. Dijkstra expands ring by ring and is guaranteed optimal; A* adds a guess of the time left (straight line at top speed), searches far less, and stays optimal as long as the guess never overestimates; traffic changes the weights and the route; end with a light touch on contraction hierarchies. Draw everything in code, no generated images: build a road network from a fixed seed and really run Dijkstra and A* on screen (a ripple of visited intersections, a glowing priority-queue frontier, current best times), compare the real visit counts side by side, jam one road and reroute live, then pull out to a continent of lights. Derive each frame's search state from the frame number so rendering is deterministic. Clear, smart, lightly funny cloud narration; an original light synth-arpeggio score that builds as the search spreads and turns at the reroute, with restrained visit ticks. Compute every number and source every fact. Show me a live preview first; export the MP4 only when I'm happy.",
  "zh-Hant": "做一支約兩分鐘的英文橫版（16:9）演算法講解短片《How Your Map Finds the Fastest Way Home》：城市是一張圖（路口是節點、路段是帶權的邊，權重是通行時間）；Dijkstra 依已知最短時間一圈圈向外擴、保證最優；A* 再加上「直線距離按最高車速估算剩餘時間」的啟發，搜尋範圍小得多，只要估計不高估就仍然最優；塞車會改變邊權、路線隨之改道；最後點到真實導航用 contraction hierarchies 預先處理。畫面全部用程式碼畫、不用任何生成圖片：以固定種子生成一座城市路網，在畫面裡真的跑 Dijkstra 和 A*（已走訪路口像水波擴散、優先佇列前緣發光、每個路口標出目前最短時間），分割畫面比較兩種演算法實際走訪的路口數，示範一段路塞車變紅、即時改道，結尾拉遠到大陸尺度的光點網路。每一格都依幀號從預先算好的搜尋序列取前 k 步，渲染要確定。旁白清楚、聰明、帶一點幽默，用高品質雲端英文配音；配樂原創輕快的合成器琶音，搜尋擴散時節奏推進、改道時一個轉折，走訪的「滴」聲分批合併、克制。片中數字都要實算，事實寫明出處。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "約2分の英語の横長（16:9）アルゴリズム解説動画「How Your Map Finds the Fastest Way Home」を作ってください。都市はグラフです（交差点がノード、道路区間が重み付きの辺で、重みは所要時間）。Dijkstra は既知の最短時間の順に一周ずつ外へ広がり、最適が保証されます。A* は「直線距離を最高速度で割った残り時間の見積もり」を加えて探索範囲をぐっと小さくし、見積もりが過大でない限り最適のままです。渋滞は辺の重みを変え、ルートもそれに合わせて変わります。最後に、実際のナビが contraction hierarchies で事前計算していることに軽く触れてください。画面はすべてコードで描き、生成画像は使いません。固定シードで都市の道路網を作り、画面の中で Dijkstra と A* を実際に走らせます（訪問済みの交差点が波紋のように広がり、優先度付きキューの最前線が光り、各交差点に現在の最短時間を表示）。画面を分割して2つのアルゴリズムが実際に訪れた交差点の数を比べ、1本の道が渋滞で赤くなってリアルタイムに迂回するところを見せ、最後は大陸規模の光の網へズームアウトします。各フレームは、事前に計算した探索手順の最初の k ステップをフレーム番号から求め、レンダリングを決定的にしてください。ナレーションは明快で知的、少しユーモアのある高品質なクラウドの英語音声で。BGM はオリジナルの軽快なシンセのアルペジオで、探索が広がるにつれてリズムが前に進み、迂回の瞬間に展開が変わるように。訪問の「ピッ」という音はまとめて控えめに。画面の数字はすべて実際に計算し、事実には出典を付けてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "약 2분짜리 영어 가로형(16:9) 알고리즘 해설 영상 「How Your Map Finds the Fastest Way Home」를 만들어 주세요. 도시는 그래프예요(교차로는 노드, 도로 구간은 가중치가 있는 간선, 가중치는 통행 시간). Dijkstra는 알려진 최단 시간 순서로 한 겹씩 바깥으로 퍼지며 최적이 보장되고, A*는 '직선거리를 최고 속도로 나눈 남은 시간 추정'을 더해 탐색 범위를 훨씬 줄이면서도 추정이 과대평가하지 않는 한 여전히 최적이에요. 정체는 간선 가중치를 바꾸고 경로도 따라 바뀌어요. 마지막엔 실제 내비게이션이 contraction hierarchies로 미리 계산해 둔다는 점을 가볍게 짚어 주세요. 화면은 전부 코드로 그리고 생성 이미지는 쓰지 마세요. 고정 시드로 도시 도로망을 만들고 화면 안에서 Dijkstra와 A*를 실제로 돌려 주세요(방문한 교차로가 물결처럼 퍼지고, 우선순위 큐의 최전선이 빛나고, 교차로마다 현재 최단 시간을 표시). 화면을 나눠 두 알고리즘이 실제로 방문한 교차로 수를 비교하고, 도로 한 구간이 막혀 빨갛게 변하며 실시간으로 우회하는 모습을 보여 준 뒤, 대륙 규모의 빛나는 점 네트워크로 줌아웃해 주세요. 각 프레임은 미리 계산한 탐색 순서에서 프레임 번호로 처음 k단계를 가져와 렌더링이 결정적이도록 해 주세요. 내레이션은 명확하고 똑똑하면서 살짝 유머 있게, 고품질 클라우드 영어 음성으로요. 음악은 오리지널 경쾌한 신스 아르페지오로, 탐색이 퍼질 때 리듬이 앞으로 나아가고 경로가 바뀔 때 전환이 오게 해 주세요. 방문 '띡' 소리는 묶어서 절제해 주세요. 화면의 숫자는 모두 실제로 계산하고 사실에는 출처를 달아 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo explicativo en inglés de dos minutos, 16:9, titulado “How Your Map Finds the Fastest Way Home”. Una ciudad es un grafo: los cruces son nodos y las calles, aristas con peso igual al tiempo de viaje. Dijkstra se expande anillo a anillo y garantiza el óptimo; A* añade una estimación del tiempo restante (línea recta a la velocidad máxima), explora mucho menos y sigue siendo óptimo si la estimación nunca se pasa; el tráfico cambia los pesos y la ruta; cierra con las contraction hierarchies. Todo dibujado en código, sin imágenes generadas: una red de calles con semilla fija donde Dijkstra y A* se ejecutan de verdad (una onda de cruces visitados, el frente de la cola de prioridad brillando), comparación en pantalla dividida con los recuentos reales, un atasco con desvío en vivo y un alejamiento hasta una red de luces continental. El estado de cada fotograma sale de su número, para un render determinista. Narración clara, inteligente y con humor; voz inglesa en la nube; música original de arpegios de sintetizador que avanza con la búsqueda y gira en el desvío. Calcula cada número y cita cada dato. Primero vista previa en vivo; exporta el MP4 solo cuando me guste.",
  "de": "Erstelle ein zweiminütiges englisches Erklärvideo in 16:9: „How Your Map Finds the Fastest Way Home“. Eine Stadt ist ein Graph: Kreuzungen sind Knoten, Straßen Kanten mit der Fahrzeit als Gewicht. Dijkstra breitet sich Ring für Ring aus und ist garantiert optimal; A* schätzt zusätzlich die Restzeit (Luftlinie bei Höchsttempo), sucht viel weniger und bleibt optimal, solange die Schätzung nie zu hoch ist; Verkehr ändert Gewichte und Route; zum Schluss kurz Contraction Hierarchies. Alles im Code gezeichnet, ohne generierte Bilder: ein Straßennetz aus festem Seed, auf dem Dijkstra und A* wirklich laufen (eine Welle besuchter Kreuzungen, leuchtende Front der Prioritätswarteschlange), geteiltes Bild mit den echten Besuchszahlen, ein Stau mit Live-Umleitung und ein Zoom hinaus auf ein Lichternetz im Kontinentmaßstab. Der Zustand jedes Frames folgt aus der Framenummer, damit das Rendering deterministisch ist. Klare, kluge, leicht witzige englische Cloud-Stimme; eigene Musik mit Synth-Arpeggios, die mit der Suche vorantreibt und beim Umleiten kippt. Jede Zahl berechnen, jede Tatsache belegen. Zuerst Live-Vorschau; MP4 erst exportieren, wenn ich zufrieden bin.",
  "fr": "Réalisez une vidéo explicative en anglais de deux minutes, en 16:9 : « How Your Map Finds the Fastest Way Home ». Une ville est un graphe : les carrefours sont des nœuds, les rues des arêtes pondérées par le temps de trajet. Dijkstra s'étend anneau par anneau et garantit l'optimum ; A* ajoute une estimation du temps restant (ligne droite à vitesse maximale), explore bien moins et reste optimal tant qu'elle ne surestime jamais ; la circulation change les poids et l'itinéraire ; finir sur les contraction hierarchies. Tout est dessiné en code, sans image générée : un réseau de rues à graine fixe où Dijkstra et A* tournent vraiment (une onde de carrefours visités, le front de la file de priorité qui brille), un écran partagé avec les vrais comptes, un bouchon avec recalcul en direct, puis un dézoom vers un réseau de lumières continental. L'état de chaque image découle de son numéro pour un rendu déterministe. Narration claire, intelligente et drôle par une voix anglaise cloud ; musique originale en arpèges de synthé qui avance avec la recherche et vire au détour. Calculez chaque chiffre, sourcez chaque fait. D'abord l'aperçu en direct ; exportez le MP4 seulement quand il me convient.",
  "pt-BR": "Faça um explicativo em inglês de dois minutos, em 16:9, chamado “How Your Map Finds the Fastest Way Home”. Uma cidade é um grafo: cruzamentos são nós e ruas são arestas com peso igual ao tempo de viagem. Dijkstra se expande anel por anel e garante o ótimo; A* acrescenta uma estimativa do tempo restante (linha reta na velocidade máxima), explora bem menos e continua ótimo se a estimativa nunca exagerar; o trânsito muda os pesos e a rota; termine com as contraction hierarchies. Tudo desenhado em código, sem imagens geradas: uma malha de ruas com semente fixa onde Dijkstra e A* rodam de verdade (uma onda de cruzamentos visitados, a frente da fila de prioridade brilhando), tela dividida com as contagens reais, um congestionamento com desvio ao vivo e um afastamento até uma rede de luzes continental. O estado de cada quadro vem do número do quadro, para a renderização ser determinística. Narração clara, inteligente e bem-humorada numa voz em inglês na nuvem; trilha original de arpejos de sintetizador que avança com a busca e vira no desvio. Calcule cada número e cite a fonte de cada fato. Primeiro a prévia ao vivo; exporte o MP4 só quando eu gostar."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 生成虚构路网，实际运行 Dijkstra 与 A* 并记录访问步骤，画面按帧还原真实搜索过程，没有生成图片。
- 试听五个音色后选 Puck，云端英文旁白仅给纯正文，逐句转写核对。
- Lyria 候选曲按实际时间轴剪接，NumPy 合成访问提示与改道音效；多轮导出后柔化高频提示声。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：保留逐调用账本 271 条，账面合计 US$0.4008；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。

## 踩坑与验证边界

- A* 的提速受路网与起终点影响；片中 3.4 倍来自该虚构场景实算，不能泛化。
- 英文短句曾合并字幕丢空格；3.8 TTS 风格提示会额外念读。
- Lyria 提示的时长与 BPM 不可靠，听评也可能顺着提示回答，应以实际起音和节拍测量为准。

## 依据

- 公开包内 prompt.json：S120 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：code-route-20261013 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
