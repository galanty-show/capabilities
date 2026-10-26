# S126 · 四渡赤水 · 一堂军事课 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · claude-fable-5-1（本机 Agent 入口；模型推理位置未记录）
- 画面代码：Codex CLI · gpt-6-astra（本机 Agent 入口；模型推理位置未记录）
- 配音/对齐/校验：Gemini TTS · gemini-3.8-flash-tts（云端）
- 配乐/音效：Lyria 3 Pro（云端）
- 配乐/音效：NumPy sound design（本地）
- 视觉素材：Codex image_gen · gpt-image（云端）
- 视觉素材：Depth Anything V2 · Small（本地）
- 视觉素材：Mapzen Terrain Tiles / OpenStreetMap / Natural Earth（本地）
- 修改：Claude Code（本机 Agent 入口；模型推理位置未记录）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "把四渡赤水做成一支 6 分钟的军事教科书式讲解片：前 30 秒先抛出‘给你重来一次也走不出这条路’的悬念，再铺湘江战役与遵义会议的背景，按一渡到四渡、南渡乌江、佯攻贵阳、巧渡金沙江讲完，最后讲军委二局和三条课。真实高程的 3D 战场飞越配军事地图，画作做视差，低音男声旁白，原创战鼓弦乐配乐，全片称毛泽东为‘教员’。先即时播放给我看。",
  "en": "Make a 6-minute military textbook-style explainer on the Four Crossings of the Chishui. In the first 30 seconds, hook viewers with ‘Even given another try, you could not find your way out along this route.’ Then set up the Xiang River battle and Zunyi Conference, cover crossings one to four, the southward Wu River crossing, the feint at Guiyang and the clever Jinsha River crossing, and finish with the Military Commission’s Second Bureau and three lessons. Use 3D battlefield flyovers based on real elevation, military maps, parallax paintings, a deep male voiceover and original war drums and strings. Call Mao Zedong ‘the Instructor’ throughout. Show me a live preview first.",
  "zh-Hant": "把四渡赤水做成一支 6 分鐘的軍事教科書式講解片：前 30 秒先拋出「給你重來一次也走不出這條路」的懸念，再鋪湘江戰役與遵義會議的背景，按一渡到四渡、南渡烏江、佯攻貴陽、巧渡金沙江講完，最後講軍委二局和三條課。真實高程的 3D 戰場飛越配軍事地圖，畫作做視差，低音男聲旁白，原創戰鼓弦樂配樂，全片稱毛澤東為「教員」。先即時播放給我看。",
  "ja": "四渡赤水を、軍事教科書のように解説する6分間の映像にして。最初の30秒で「もう一度やり直せても、この道を抜け出せない」という謎を提示し、湘江の戦いと遵義会議の背景を描いてから、第1〜第4の渡河、烏江の南渡、貴陽への陽動、金沙江の巧みな渡河まで語り、最後に軍事委員会第二局と3つの教訓を紹介して。実際の標高データによる3D戦場の飛行映像と軍事地図、絵画の視差表現、低い男性ナレーション、オリジナルの戦太鼓と弦楽の音楽を使って。毛沢東は全編で「教員」と呼んで。まずライブ再生で見せて。",
  "ko": "사도적수(적수강 네 차례 도하)를 군사 교과서처럼 설명하는 6분 영상으로 만들어 줘. 첫 30초에는 ‘다시 기회를 줘도 이 길을 빠져나갈 수 없다’는 궁금증을 던지고, 샹강 전투와 쭌이 회의의 배경을 짚어 줘. 1차부터 4차 도하, 우강 남쪽 도하, 구이양 양동 공격, 진사강 도하까지 설명한 뒤 군사위원회 제2국과 세 가지 교훈으로 마무리해. 실제 고도 데이터의 3D 전장 비행과 군사 지도, 그림의 시차 효과, 낮은 남성 내레이션, 창작 전투 북과 현악 음악을 써 줘. 마오쩌둥은 영상 내내 ‘교원’이라고 불러 줘. 먼저 실시간 재생으로 보여 줘.",
  "es": "Haz un video de 6 minutos sobre los cuatro cruces del Chishui, explicado como un manual militar. En los primeros 30 segundos, engancha con «Aunque pudieras intentarlo otra vez, no lograrías salir por esta ruta». Presenta la batalla del Xiang y la Conferencia de Zunyi; cuenta los cruces del primero al cuarto, el cruce del Wu hacia el sur, la finta sobre Guiyang y el ingenioso cruce del Jinsha. Termina con el Segundo Buró de la Comisión Militar y tres lecciones. Usa vuelos 3D sobre el campo de batalla con elevación real, mapas militares, pinturas con paralaje, una voz masculina grave y música original de tambores de guerra y cuerdas. Llama a Mao Zedong «el Instructor» durante todo el video. Muéstrame primero la vista previa en vivo.",
  "de": "Mach einen 6-minütigen Erklärfilm über die vier Überquerungen des Chishui, wie ein militärisches Lehrbuch. Wecke in den ersten 30 Sekunden Spannung: „Selbst bei einem zweiten Versuch würdest du diesen Weg nicht hinausfinden.“ Erkläre die Schlacht am Xiang und die Zunyi-Konferenz, dann die erste bis vierte Überquerung, den Wu-Übergang nach Süden, das Täuschungsmanöver gegen Guiyang und den geschickten Jinsha-Übergang. Schließe mit dem Zweiten Büro der Militärkommission und drei Lehren. Nutze 3D-Flüge über das Schlachtfeld mit echten Höhendaten, Militärkarten, Gemälde mit Parallaxe, eine tiefe Männerstimme und eigene Musik aus Kriegstrommeln und Streichern. Nenne Mao Zedong durchgehend „den Lehrer“. Zeig mir zuerst die Live-Vorschau.",
  "fr": "Fais un film explicatif de 6 minutes sur les quatre traversées du Chishui, comme un manuel militaire. Dans les 30 premières secondes, accroche avec « Même en recommençant, vous ne trouveriez pas la sortie par cet itinéraire ». Pose le contexte de la bataille du Xiang et de la conférence de Zunyi, puis raconte les quatre traversées, le passage du Wu vers le sud, la feinte sur Guiyang et l’astucieuse traversée du Jinsha. Termine par le Deuxième Bureau de la Commission militaire et trois leçons. Utilise des survols 3D du champ de bataille fondés sur des altitudes réelles, des cartes militaires, des peintures en parallaxe, une voix masculine grave et une musique originale de tambours de guerre et de cordes. Appelle Mao Zedong « l’Instructeur » tout au long du film. Montre-moi d’abord l’aperçu en direct.",
  "pt-BR": "Faça um vídeo de 6 minutos sobre as quatro travessias do Chishui, explicado como um manual militar. Nos primeiros 30 segundos, prenda a atenção com ‘Mesmo tentando de novo, você não conseguiria sair por essa rota’. Apresente a batalha do Xiang e a Conferência de Zunyi; conte da primeira à quarta travessia, a passagem do Wu rumo ao sul, a finta sobre Guiyang e a engenhosa travessia do Jinsha. Termine com o Segundo Departamento da Comissão Militar e três lições. Use sobrevoos 3D do campo de batalha com elevação real, mapas militares, pinturas com paralaxe, narração masculina grave e música original de tambores de guerra e cordas. Chame Mao Zedong de ‘o Instrutor’ durante todo o vídeo. Mostre primeiro a prévia ao vivo."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 编写历史讲解分镜，结合公开地理资料处理高程、河流与地图，历史路线和兵力动画标为示意。
- 云端生成画作与旁白，本地估深、生成地形法线与代码镜头；Lyria 段落本地剪辑并合成音效。
- 多阶段抽帧修改；最终重剪配乐以匹配修音后的时间轴，映射已有配音缓存为随包种子。

## 耗时与费用

- 耗时：全片端到端耗时未记录。最终收口中按修音后时间轴本地重剪配乐 18.591 秒；更早一次阶段记录的配乐 7.748 秒、缓存编译约 26.8 秒、48 帧定位入口 56.571 秒均仅为对应阶段，不相加冒称全流程。正式 MP4 导出在保留记录中未执行。
- 费用：保留逐调用账本 404 条，账面合计 US$0.8382；这是记录内 API 项目的估价，未记录 Agent 编稿/代码模型费用或完整 token 总账，不等于完整制作实付。 此账本仅有配音/校验与 Lyria 项，画作等费用缺测。

## 踩坑与验证边界

- 修音后全片时间表变化，原配乐约一秒错位，已按最终时间表重剪；重剪不等于已做人耳试听。
- 同键旧配音缓存曾污染随包种子，以新缓存身份映射最终句缓存解决。
- 部分阶段对齐模型未安装，不能将按字数估算写成逐字对齐已验证。
- 地形范围和采样精度限制仍在，路线与阵地是示意；抽帧与确定性检查不替代全片播放和听感验收。

## 依据

- 公开包内 prompt.json：S126 的 tools 与 basis 制作来历元数据。
- 保留制作档案标识：sidu-chishui-20261016 / README.md；cost-ledger.jsonl（按 usd 字段求和，保留账面范围）。
- 保留制作档案标识：sidu-chishui-20261016 / PROGRESS.md“阶段五”“Codex 接手收口”。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
