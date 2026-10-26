# S110 The Gift of the Magi · 两分钟讲完

O. Henry 1905 年的公版短篇（美国最有名的圣诞反转故事）的英文原创复述：圣诞前夜 Della 只有一块八毛七，她卖掉及膝的长发给 Jim 买白金表链，Jim 却卖掉祖传金表给她买了一套梳子。正文约 121 秒，横版 1080p，英文旁白与画面文字。

*An original English retelling of O. Henry's public-domain story (1905): on Christmas Eve Della has one dollar and eighty-seven cents; she sells her hair to buy Jim a platinum watch chain, while Jim sells his watch to buy her combs. About 121 seconds, 1080p landscape.*

## 这支样片演示什么 · What it shows

- **画面跟着词走**：硬币一枚枚落下，计数器数到 $1.87，念到 “three” 再飞快数三遍；“Sofronie” 金字招牌显现、“quick” 句尾剪刀一剪；挂钟一秒一跳，正好在 “seven” 走到七点整；“opened” 门缝拉开；“sold” 金表影子化成金尘。卡点词都在各幕 `meta.params`（`recountCue`、`snipCue`、`sevenCue`、`openCue`、`soldCue` 等），改旁白后把卡点词一起改掉，画面就跟着新词走；找不到词时有兜底秒数。
  *Every visual beat is cued to a spoken word (the counter, the scissors, the clock striking seven, the door, the watch dissolving); the cue words are scene parameters.*
- **分屏反转**：`treasures` 与 `reveal` 两幕用同一种左右分屏（左 Jim、右 Della、顶部 “I · THE WATCH / II · THE HAIR”），反转时同一位置的两件珍宝都不见了，标签被划掉。
  *The twist mirrors the earlier split screen: same layout, both treasures gone.*
- **静一拍**：“Give me your watch, I want to see it on.” 之后句间停顿 1.3 秒（`settings.sentencePauses`），配乐在这里整段静音，Jim 倒在沙发上时主题再起。
- **代码画的道具**：硬币、怀表与挂钟（罗马数字、秒针）、白金表链、剪刀与飘落的发丝、牛皮纸包、雪、煤气灯、长发上的流光都是幕代码实时画的；可改的金额、价签、招牌字、日历日期都在 `meta.params`。

## 素材与声音 · Media and sound

- 底图 16 张：Gemini 3 Pro Image 原创生成（另 2 张人物参考图不进画面），1905 年纽约暖色油画质感，人物为虚构形象，不参照任何影视改编或演员。样片不能引用素材 ID，所以每幕把自己用到的底图缩到 1280～1440 宽（竖幅半屏 900 宽）、轻度平滑后以 WebP data URI 内联在 `scenes/*.tsx` 的 `MEDIA` 里；提示词、哈希与权利字段见 [media-sources.json](media-sources.json)。导出的成片用的是 1920 宽的高清底图。
- 字形：片名、招牌、金额等大字是 STIX Two Text（SIL OFL 1.1）的字形轮廓，只内联每幕要画的字；改成没内联的字时整串退回系统衬线字（macOS 上仍是 STIX Two，其他系统回退 Georgia）。
- 旁白：Gemini 3.8 Flash TTS（音色 Sulafat，从 6 个音色里试听后选），经“自定义命令配音”合成并逐词核对；以随包旁白种子提供（`templates/samples/narration/S110/`，不入 Git），播放只读数据、不联网。改了旁白文字，新句子没有这把声音：要自备 Gemini API key 用同一条自定义命令，或用本机配音整片重配。
  *Narration ships as a pregenerated seed (cloud voice Sulafat); playback needs no key.*
- 配乐：The Gift of the Magi（Lyria 3 Pro 原创生成后按本片时间轴重排，叠加代码合成的硬币、剪刀、门铃、钟声、脚步等音效），CC0，随包曲库 `library:original-gift-of-the-magi`。卡点依赖本片节奏，改停顿、换语速或换曲后音效不再对齐。

## 可以改什么 · What to edit

| 幕 | 常改参数 |
| --- | --- |
| coins | `amount`（金额）、`recountCue`、`month` / `day` / `year`（日历） |
| title | `title`、`byline` |
| flat | `rent`、`rentTop`、`him`、`her` |
| treasures / reveal | `watchLabel`、`hairLabel`、`heirloom` |
| sale | `shop`、`goods`、`goods2`、`price`、`before` / `after`（剪前后的钱数） |
| search | `price`、`before` / `after`、`hours`（怀表转过的小时数） |
| wait | `hour`（整点）、`sevenCue` |
| door | `notWords`（浮出又被划掉的词） |
| magi | `line`（结尾句）、`credit` |

## 来源与边界 · Sources

原文要点、引用的公版原句与示意说明见 [source.md](source.md)。硬币组合、价签与钟面时间是示意动画。制作脚本、成本账与复现步骤在 `tools/production/gift-magi-20261013/`。

## 另一语言版本：中文《麦琪的礼物》 · Chinese version

`locales/zh.json`（2026-10-14）：界面是中文时播这一版；画面代码、底图、配乐与音效与英文版共用，只换文字与配音。

- 旁白：温暖、克制的讲述口吻，每幕句数与英文相同；人名用通行译名（德拉、吉姆、索弗罗妮夫人），开头“一块八毛七分钱”、结尾“他们，就是麦琪”沿用中文读者熟悉的说法。金额与时间（$1.87、$20、$21、87 美分、七点）不变，画面价签仍是美元。
- 配音：Gemini 2.5 Pro TTS，音色 Sulafat（与英文同一个；英文用 3.8 Flash），纯正文，逐音节拼音校验；入口 `tools/production/gift-magi-20261013/tts_zh.py`（云端成品按正文缓存，调语速不重配）。语速 270（英文 240）；随包种子 `narration/S110-zh/`（44 句）。试听：Sulafat（3.8 Flash / 2.5 Pro）、Kore、Leda 同三句，Gemini 听评代理选 Sulafat + 2.5 Pro；人耳试听未做。
- 时长与卡点：配乐按英文时间轴重排，中文版在开场 `coins` 用 `hold` 补齐，让片名卡与配乐同时进；英文的四处句间停顿（含 “Give me your watch” 之后配乐整段静音的 1.3 秒）按句子位置换成中文句子的编号写进 `settings.sentencePauses`。中段几幕中文略长，最大滞后约 1.1 秒；`magi` 片尾停留从 1.7 秒减到 0.75 秒；中文整片 126.0 秒（英文 125.6 秒）。
- 画面文字：全部在 `meta.params`。大字的 STIX 字形表只有英文字母，中文会整串退回系统字体；原来退回时按拉丁字母估宽，居中的中文会偏右，改成汉字按 1 个字号宽估算，衬线字体栈末尾加 Songti SC / STSong。英文字符串走字形表，英文画面抽 3 帧逐像素相同。
- 已知问题：2.5 Pro TTS 对个别短句（如“价钱是二十一块。”）连续返回空结果，已改写措辞绕开。
