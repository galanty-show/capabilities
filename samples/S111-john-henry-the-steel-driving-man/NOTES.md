# S111 John Henry, the Steel-Driving Man

美国民间传说 John Henry 的原创英文复述：19 世纪 70 年代铁路隧道里的黑人钢钎手，与推销员带来的蒸汽钻机比赛，赢了，倒下时锤子还握在手里。正文约 120 秒，横版 1080p，英文旁白。

An original English retelling of the American folk legend of John Henry, the Black steel-driving man who raced a steam drill through a railroad tunnel in the 1870s, won, and died with his hammer in his hand. About 120 seconds, 16:9, English narration.

## 这支样片演示什么 / What it shows

- **锤击卡在节拍上**：钩子、打钎、比赛三幕的锤击时刻写在各幕 `props.beats`（幕内秒），配乐里的代码合成锤声读的是同一张表；比赛幕每拍切到“锤落”那一帧、迸火星，钻机活塞每半拍一冲，配乐逐小节加速，人机镜头也按拍交替、越切越快。
  Hammer strikes sit on the beat: `props.beats` in the hook, crew and race scenes is the same table the score's synthesized hammer hits were placed from. In the race, every beat cuts to the impact frame with sparks, the drill piston fires on the half beat, the score speeds up bar by bar and the man/machine cuts get faster.
- **实时进尺图表**：右上角两条进尺随锤数增长，钻机先领先、人在 “Faster” 前后反超；比分幕里两个炮眼停在传说里的 9 / 14 英尺（`manFinal`、`machineFinal` 可改，角注写明是传说里的数）。
  A live depth chart: the drill leads first, John Henry overtakes around “Faster”; the final count lands on the legend's 9 and 14 feet (editable `manFinal` / `machineFinal`, with an on-screen note that the figures come from the legend).
- **一切静止只剩心跳**：`still` 幕定格在最后一锤，褪色变暗，只剩四下渐弱的心跳（心跳时刻同样在 `props.beats`）。
  Stillness: the `still` scene freezes on the last strike and fades to black under four slowing heartbeats.
- **逐词卡点**：标签、落印、刻字都锚在 `cue()` 念到的词上（卡点词都是参数，如 `stampCue`、`swungCue`、`wonCue`），随包旁白带逐词时间。
  Word-level cues: labels, stamps and carved words fire on the spoken word (cue words are parameters); the bundled narration carries word timings.

## 素材与声音 / Media and sound

- 底图 12 张：Gemini 3 Pro Image 原创生成的麻胶版画 / WPA 壁画风插画，人物为虚构形象。样片不能引用素材 ID，所以每幕把自己用到的底图以 WebP data URI 内联在 `scenes/*.tsx` 的 `MEDIA` 里；为控制随包体积，样片版按画面重要性缩到 1024–1280 宽，比导出成片（1920 宽）略软。提示词、哈希与权利字段见 [media-sources.json](media-sources.json)。
  12 plates generated with Gemini 3 Pro Image in a linocut / WPA-mural style; characters are fictional. They are inlined per scene as WebP data URIs, downsized to 1024–1280 px for package size, so the sample is a little softer than the exported film.
- 旁白：Gemini 2.5 Pro TTS（音色 Algenib，纯正文，语速 242），经“自定义命令配音”合成并逐词校验，以随包旁白种子提供（播放只读数据、不联网）。改了旁白文字，新句没有这把声音：工作台会提示用本机配音整片重配。
  Narration: Gemini 2.5 Pro TTS (voice Algenib), pregenerated and shipped as narration seeds; edited lines need re-voicing locally.
- 配乐：Steel-Driving Man，Lyria 3 Pro 原创生成后按本片时间轴剪辑并合成音效（锤击、钻机、爆破、心跳、汽笛），CC0，随包曲库 `library:original-john-henry`。换节奏、改停留或换曲后锤击不再卡拍。
  Score: Steel-Driving Man (CC0, `library:original-john-henry`), a Lyria 3 Pro score cut to this film with code-synthesized effects; accents only fit this timeline.
- 字体：片名与刻字只按名称引用 macOS 自带的 Superclarendon、DIN Condensed、Georgia，不随包；其他系统回退 Rockwell / Roboto Slab / Georgia 与 Oswald / Arial Narrow，字宽会变。
  Fonts: macOS system fonts by name only (not bundled); other systems fall back and widths change.

## 可改参数 / Editable parameters

画面文字都在各幕 `meta.params`：片名与副标题（`title`）、线路图地名（`west`）、标签（`crew`）、隧道长度与地点角注（`mountain`）、广告传单（`drill`）、引语行（`reply`）、人机名称、单位、终值与卡点词（`race`/`win`）、片尾卡（`legacy`）。比赛、比分、定格三幕共用模块 `jh-race`，用 `mode`（race / win / still）区分，改代码时会同时影响三幕。

## 来源与边界 / Sources

传说要点、地点之争（Big Bend Tunnel / Lewis Tunnel）、两句传统歌词的出处与史实边界见 [source.md](source.md)。旁白自写，不照抄任何书籍或现代录音版本的歌词。制作脚本、成本账与复现步骤在 `tools/production/john-henry-20261013/`。

## 另一语言版本：中文《约翰·亨利：打钢钎的汉子》 / Chinese version

`locales/zh.json`（2026-10-14）：界面是中文时播这一版；画面代码、底图、配乐与锤声表（`props.beats`）与英文版共用，只换文字与配音。

- 旁白：按纪录片解说的口吻重写，短句、有分量，每幕句数与英文相同；两句传统歌词意译为“人嘛，不过是个人。……我宁愿死，手里也攥着这把锤子。”，画面引语行同步换成中文。
- 配音：Gemini 2.5 Pro TTS，音色 Orus（英文版是 Algenib），纯正文，逐音节拼音校验；沿用本片 `tools/production/john-henry-20261013/tts.py`（同一条命令行，云端成品按正文缓存）。语速 245（英文 242）；随包种子 `narration/S111-zh/`（33 句）。试听：Orus/Charon/Algenib（2.5 Pro）与 Orus（3.8 Flash）同三句，Gemini 听评代理选 Orus + 2.5 Pro；人耳试听未做。
- 时长与卡点：中文旁白比英文短，各幕用 `hold` 补到英文幕长，所以钩子、打钎、比赛三幕的锤击与配乐里的锤声仍在同一时刻；`legacy` 中文略长，把片尾停留从 3.0 秒减到 1.7 秒；中文整片 125.1 秒（英文 125.0 秒）。
- 画面文字：全部在 `meta.params`。印章与传单的宽度原来按拉丁字母估算（`text.length × 字号 × 0.52`），中文会挤出边框，改成按字符宽度估算（汉字按约 1 个字号宽，`cjkLen`）；字体栈末尾加了 PingFang SC / Songti SC。英文字符串的估算结果不变，英文画面抽 3 帧逐像素相同。
- 已知问题：2.5 Pro TTS 偶尔对很短的句子返回空结果，脚本会自动重来。
