# S105 · 改一个字，接着播 · 制作记录

English summary: Tools, provenance, prompts and known production lessons. Missing time or cost is explicitly unrecorded.

## 工具与模型

- 以下是保留制作来历中的历史工具与模型；当前公开包旁白等工件的实际来源以 CREDITS.md 与对应种子清单为准。未记模型版本的不补猜。
- 编稿/分镜：Claude Code · Claude Opus 5.5（云端）
- 画面代码：Claude Code · Claude Opus 5.5（云端）
- 配乐/音效：numpy/scipy（本地）
- 配乐/音效：随包曲库 · Play On（本地）
- 修改：Claude Code · Claude Opus 5.5（云端）

## 提示词与来历

以下为提示词文件保留的公开复刻摘要，不冒充逐轮原话；完整原始逐轮对话未记录。

```json
{
  "zh-CN": "给文影做一支约 58 秒的横版（16:9）卡点宣传片，主题是“改一个字，接着播”，不要旁白。只讲三件事，每件落在一个音乐段落上：样片库悬停就播放、即时播放（换配色、跳到任意一幕、开关配音都当场生效）、暂停定位到这一秒改一个字后从同一秒接着播，中间穿插素材管理，最后收在导出。界面全部用代码画出来，按乐曲段落剪，配一段原创合成配乐，在 Drop 处让画面爆发。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 58-second 16:9 landscape beat-cut promo for Galanty called “Fix a word. Play on.”, with no voiceover. Cover just three things, each landing on its own section of the music: samples play on hover in the library; live preview, where switching colors, jumping to any scene or toggling the voice takes effect instantly; and pausing on a moment, fixing one word and playing on from that same second — with asset management as an interlude and export as the finale. Draw every interface in code, cut to the song's sections, and score it with an original synth track whose drop makes the picture burst open. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "幫文影做一支約 58 秒的橫版（16:9）卡點宣傳片，主題是「改一個字，接著播」，不要旁白。只講三件事，每件落在一個音樂段落上：樣片庫滑鼠移上去就播放；即時播放，換配色、跳到任意一幕、開關配音都當場生效；暫停定位到這一秒，改一個字後從同一秒接著播。中間穿插素材管理，最後收在匯出。介面全部用程式碼畫出來，按樂曲段落剪輯，配一段原創合成器配樂，在 Drop 處讓畫面爆發。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "Galanty のために、約58秒の横長（16:9）のビート同期プロモーション動画を作ってください。テーマは「一文字直して、そのまま再生」で、ナレーションは入れません。伝えるのは3つだけで、それぞれを音楽の1セクションに乗せます。サンプルライブラリではマウスを乗せるだけで再生されること、ライブプレビューでは配色の変更、任意のシーンへのジャンプ、音声のオン・オフがその場で反映されること、そして一時停止してその1秒を特定し、一文字直したら同じ秒から再生を続けられることです。間に素材管理を挟み、最後は書き出しで締め、インターフェースはすべてコードで描いて曲のセクションに合わせて編集し、オリジナルのシンセ曲を使ってドロップで画面が一気に弾けるようにしてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "Galanty를 위한 약 58초 길이의 가로형(16:9) 비트 컷 홍보 영상을 만들어 주세요. 제목은 “한 글자 고치고, 이어서 재생”이고, 내레이션은 넣지 마세요. 딱 세 가지만 다루고 각각 음악의 한 구간에 맞추는데, 샘플 라이브러리에서 마우스를 올리면 바로 재생되는 것, 색상 바꾸기·원하는 장면으로 건너뛰기·음성 켜고 끄기가 즉시 반영되는 실시간 미리보기, 그리고 한 순간에 멈춰 한 글자를 고친 뒤 같은 초부터 이어서 재생하는 것이에요. 중간에는 에셋 관리를 간주처럼 넣고, 마지막은 내보내기로 마무리해 주세요. 모든 인터페이스는 코드로 그리고, 곡의 구간에 맞춰 편집하며, 드롭에서 화면이 터지듯 폭발하는 오리지널 신스 음악을 써 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo promocional de unos 58 segundos en formato horizontal 16:9, con cortes al ritmo de la música, para Galanty, titulado «Corrige una palabra y sigue reproduciendo», sin narración. Cuenta solo tres cosas, cada una en su propia sección de la música: los ejemplos se reproducen al pasar el cursor por la biblioteca; la vista previa en vivo, donde cambiar los colores, saltar a cualquier escena o activar y desactivar la voz surte efecto al instante; y pausar en un momento, corregir una palabra y seguir reproduciendo desde ese mismo segundo, con la gestión de recursos como interludio y la exportación como final. Dibuja toda la interfaz con código, monta según las secciones de la canción y ponle una pista original de sintetizadores cuyo drop haga estallar la imagen. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 58 Sekunden langes, auf den Beat geschnittenes Promo-Video im Querformat (16:9) für Galanty mit dem Titel „Fix a word. Play on.“, ohne Sprechertext. Zeig nur drei Dinge, jedes auf einem eigenen Abschnitt der Musik: In der Beispielbibliothek werden Beispiele abgespielt, sobald man mit der Maus darüberfährt; die Live-Vorschau, in der Farbwechsel, Sprünge zu jeder Szene oder das Ein- und Ausschalten der Stimme sofort wirken; und an einer Stelle anhalten, ein Wort korrigieren und ab genau derselben Sekunde weiterspielen – mit der Medienverwaltung als Zwischenspiel und dem Export als Finale. Zeichne jede Oberfläche in Code, schneide nach den Abschnitten des Songs und unterlege alles mit einem eigenen Synth-Track, dessen Drop das Bild explodieren lässt. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une vidéo promo d'environ 58 secondes au format paysage (16:9), montée sur le rythme, pour Galanty, intitulée « Fix a word. Play on. », sans voix off. Ne montrez que trois choses, chacune sur sa propre section musicale : dans la bibliothèque d'exemples, les exemples se lancent au survol ; l'aperçu en direct, où changer de couleurs, sauter à n'importe quelle scène ou activer et désactiver la voix prend effet immédiatement ; et mettre en pause sur un instant, corriger un mot et reprendre la lecture à la même seconde – avec la gestion des ressources en interlude et l'export en final. Dessinez chaque interface en code, montez selon les sections du morceau, et accompagnez le tout d'une piste synthé originale dont le drop fait exploser l'image. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo promocional de cerca de 58 segundos na horizontal (16:9) para o Galanty, com cortes na batida, chamado “Fix a word. Play on.”, sem narração. Mostre só três coisas, cada uma numa seção própria da música: na biblioteca de exemplos, os vídeos tocam ao passar o mouse; a prévia ao vivo, em que trocar as cores, pular para qualquer cena ou ligar e desligar a voz vale na hora; e pausar num momento, corrigir uma palavra e continuar tocando a partir do mesmo segundo — com o gerenciamento de recursos como interlúdio e a exportação como final. Desenhe toda a interface em código, corte seguindo as seções da música e use uma trilha sintetizada original cujo drop faz a imagem explodir. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
}
```

公开逐轮记录见 [prompt.json](prompt.json) 的 rounds。

## 步骤

- 先试过截图与录屏拼接版，反馈后改为 TSX 代码绘制全部界面。
- 以 NumPy/SciPy 原创曲 Play On 的 124 BPM 乐段编排七幕，无旁白。
- 第 3 幕示例作品按反馈重做，并将收尾拨弦对齐新片尾；同一制作流程形成中英文两支。

## 耗时与费用

- 耗时：未记录单片端到端制作耗时；未用成片时长、文件时间或后续重渲染时间代替。
- 费用：未记录可归属本片的完整 AI token 与费用；未记录不代表零。

## 踩坑与验证边界

- 初稿的截图/录屏拼接表达未获认可，重做为代码动画。
- 收尾画面改动后要重对片尾拨弦；英文幕标题按长度约束另行缩短。

## 依据

- 公开包内 prompt.json：S105 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
