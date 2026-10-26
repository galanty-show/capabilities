# S106 · Fix a word. Play on. · 制作记录

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
  "zh-CN": "给文影做一支约 58 秒的横版（16:9）英文卡点宣传片，标题“Fix a word. Play on.”，屏上界面和文字都用英文，不要旁白。只讲三件事，各落在一个音乐段落上：样片库悬停即播、即时播放、暂停定位改一个词后从同一秒接着播，中间穿插素材管理，最后收在导出与回顾。界面全部用代码画，按乐曲段落剪，配一段原创合成配乐，Drop 处画面爆发。先即时播放给我看，满意了再导出 MP4。",
  "en": "Make a 58-second 16:9 landscape English beat-cut promo for Galanty called “Fix a word. Play on.”, with no voiceover and every interface and caption in English. Cover three things, each on its own section of the music: hover to play in the sample library, live preview, and locating a moment, fixing one word and playing on from the same second — with asset tracking as an interlude and export plus a recap to close. Draw the interface in code, cut to the song's sections, and use an original synth track whose drop makes the picture burst open. Show me a live preview first, and export the MP4 only once I'm happy.",
  "zh-Hant": "幫文影做一支約 58 秒的橫版（16:9）英文卡點宣傳片，標題是「Fix a word. Play on.」，螢幕上的介面和文字都用英文，不要旁白。只講三件事，各落在一個音樂段落上：樣片庫滑鼠移上去就播放、即時播放、暫停定位改一個詞後從同一秒接著播，中間穿插素材管理，最後收在匯出與回顧。介面全部用程式碼畫，按樂曲段落剪輯，配一段原創合成器配樂，Drop 處畫面爆發。先即時播放給我看，滿意了再匯出 MP4。",
  "ja": "Galanty のために、約58秒の横長（16:9）の英語版ビート同期プロモーション動画を作ってください。タイトルは「Fix a word. Play on.」で、画面上のインターフェースも文字もすべて英語にし、ナレーションは入れません。伝えるのは、サンプルライブラリでマウスを乗せると再生、ライブプレビュー、一時停止して位置を決め単語を1つ直したら同じ秒から再生を続ける、の3つだけで、それぞれを音楽の1セクションに乗せます。間に素材管理を挟み、最後は書き出しと振り返りで締めてください。インターフェースはコードで描いて曲のセクションに合わせて編集し、オリジナルのシンセ曲を使ってドロップで画面が一気に弾けるようにしてください。まずライブプレビューで見せて、気に入ったら MP4 に書き出してください。",
  "ko": "Galanty를 위한 약 58초 길이의 가로형(16:9) 영어 비트 컷 홍보 영상을 만들어 주세요. 제목은 “Fix a word. Play on.”이고, 내레이션 없이 모든 인터페이스와 화면 글자를 영어로 해 주세요. 세 가지를 다루고 각각 음악의 한 구간에 맞추는데, 샘플 라이브러리에서 마우스를 올리면 재생, 실시간 미리보기, 그리고 한 순간을 찾아 단어 하나를 고친 뒤 같은 초부터 이어서 재생하는 것이에요. 중간에는 에셋 관리를 간주처럼 넣고, 마지막은 내보내기와 돌아보기로 마무리해 주세요. 인터페이스는 코드로 그리고, 곡의 구간에 맞춰 편집하며, 드롭에서 화면이 터지듯 폭발하는 오리지널 신스 음악을 써 주세요. 먼저 실시간 미리보기로 보여 주고, 마음에 들면 그때 MP4로 내보내 주세요.",
  "es": "Haz un vídeo promocional en inglés de unos 58 segundos en formato horizontal 16:9, con cortes al ritmo de la música, para Galanty, titulado «Fix a word. Play on.», sin narración y con toda la interfaz y los textos en inglés. Cuenta tres cosas, cada una en su propia sección de la música: pasar el cursor para reproducir en la biblioteca de ejemplos, la vista previa en vivo, y localizar un momento, corregir una palabra y seguir reproduciendo desde el mismo segundo, con el seguimiento de recursos como interludio y la exportación más un repaso para cerrar. Dibuja la interfaz con código, monta según las secciones de la canción y usa una pista original de sintetizadores cuyo drop haga estallar la imagen. Primero muéstramelo en vista previa en vivo y exporta el MP4 solo cuando me guste.",
  "de": "Mach ein etwa 58 Sekunden langes englischsprachiges, auf den Beat geschnittenes Promo-Video im Querformat (16:9) für Galanty mit dem Titel „Fix a word. Play on.“, ohne Sprechertext und mit allen Oberflächen und Texten auf Englisch. Zeig drei Dinge, jedes auf einem eigenen Abschnitt der Musik: in der Beispielbibliothek zum Abspielen mit der Maus darüberfahren, die Live-Vorschau, und eine Stelle ansteuern, ein Wort korrigieren und ab derselben Sekunde weiterspielen – mit der Medienverwaltung als Zwischenspiel und Export plus Rückblick zum Abschluss. Zeichne die Oberfläche in Code, schneide nach den Abschnitten des Songs und nimm einen eigenen Synth-Track, dessen Drop das Bild explodieren lässt. Zeig mir zuerst die Live-Vorschau und exportiere die MP4-Datei erst, wenn ich zufrieden bin.",
  "fr": "Créez une vidéo promo en anglais d'environ 58 secondes au format paysage (16:9), montée sur le rythme, pour Galanty, intitulée « Fix a word. Play on. », sans voix off, avec toutes les interfaces et tous les textes en anglais. Montrez trois choses, chacune sur sa propre section musicale : survoler pour lancer la lecture dans la bibliothèque d'exemples, l'aperçu en direct, et se placer sur un instant, corriger un mot et reprendre à la même seconde – avec le suivi des ressources en interlude, puis l'export et un récapitulatif pour conclure. Dessinez l'interface en code, montez selon les sections du morceau, et utilisez une piste synthé originale dont le drop fait exploser l'image. Montrez-moi d'abord l'aperçu en direct, et n'exportez le MP4 que lorsque le résultat me convient.",
  "pt-BR": "Faça um vídeo promocional em inglês de cerca de 58 segundos na horizontal (16:9) para o Galanty, com cortes na batida, chamado “Fix a word. Play on.”, sem narração e com toda a interface e as legendas em inglês. Mostre três coisas, cada uma numa seção própria da música: passar o mouse para tocar na biblioteca de exemplos, a prévia ao vivo, e localizar um momento, corrigir uma palavra e continuar tocando a partir do mesmo segundo — com o controle de recursos como interlúdio e, para fechar, a exportação e uma recapitulação. Desenhe a interface em código, corte seguindo as seções da música e use uma trilha sintetizada original cujo drop faz a imagem explodir. Primeiro me mostre uma prévia ao vivo e só exporte o MP4 quando eu gostar do resultado."
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

- 公开包内 prompt.json：S106 的 tools 与 basis 制作来历元数据。
- 公开包内 storyboard.json、settings.json 与 scenes/：本次随包版本的结构和画面代码；历史账本不等于本次重渲染账本。

代码按随附 LICENSE；新增制作说明按 CC BY 4.0。历史记录不代表本次重新验收。
