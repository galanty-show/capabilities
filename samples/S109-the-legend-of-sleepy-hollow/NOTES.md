# S109 The Legend of Sleepy Hollow

Washington Irving 1820 年公版小说《The Legend of Sleepy Hollow》的英文故事短片，美国最有名的万圣节故事：1790 年哈德逊河谷，迷信又贪吃的教书先生 Ichabod Crane、富家女 Katrina、爱恶作剧的情敌 Brom Bones，深夜的林间路、桥、无头骑士和一个燃烧的南瓜。像营火边讲故事的人那样讲，秋夜惊悚但不血腥、适合全家。正文约 128 秒，横版 1080p。

*An English campfire retelling of Washington Irving’s public-domain 1820 tale, about 128 seconds, 16:9. Original narration (one line quoted from the 1820 text), AI-generated plates with consistent characters, and every effect — moonlight, flowing fog, wind-blown leaves, candle flicker, galloping parallax, the ever-faster chase cuts and the pumpkin burst — drawn live in scene code.*

## 这支样片演示什么

- **画面跟着词走**：念到 “rider”，骑士剪影从路尽头的雾里显形；“The moon broke through” 云散月出；“He had no head” 镜头猛推到空领口；Brom 的名牌在 “Brom” 上砸下；“Well…” 一甩镜头从 Katrina 甩到粮仓。卡点词都是各幕的参数（如 `riderCue`、`headCue`、`turnCue`），改旁白时一起改。
- **越切越快**：`chase` 幕念到原文引语那一句起，在多层视差奔跑、Ichabod 特写、越来越近的桥三种镜头之间轮切，每次间隔乘 `cutFactor`（默认 0.8）。视差奔跑整段是代码：远山、三层递归生成的枯树、近景树干、两个骑手剪影，后面的骑士越追越近。
- **南瓜那一下**：`throw` 幕里掷出的是代码画的南瓜灯，迎着镜头越飞越大，正好在 “pumpkin” 一词上闪白、碎片四溅（canvas 粒子，带重力），随后黑场无声。
- **改一个设定就换一种夜色**：`credit` 幕先把一个夜晚一层层“写”出来（旁边标出画它的组件名），再分成四格——同一个场景，`nights` 参数分别是 `moonlit`、`storm`（雨与闪电）、`harvest`（橙色满月）、`frost`（初雪）；标签直接显示参数值。
- **代码画的天气与光**：每幕在底图上叠代码实时绘制的流云与月晕、三层流雾、风卷落叶、烛火与灯笼闪烁、火星、鬼火；片名与落版两幕整幕纯代码。

## 可改的参数

| 幕 | 模块 | 参数 |
| --- | --- | --- |
| open / hook | `sh-road` | `mode`（open/hook）、`riderCue`、`headCue`、`listenCue`、`fog` |
| title | `sh-title` | `kicker`、`title`、`subtitle` |
| hollow | `sh-hollow` | `date`、`dateCue`、`place`、`placeCue`、`magicCue` |
| ichabod | `sh-ichabod` | `name`、`role`、`nameCue`、`tags`（标注文字 + 卡点词） |
| katrina | `sh-katrina` | `name`、`role`、`nameCue`、`turnCue`、`pantryCue` |
| brom | `sh-brom` | `name`、`role`、`nameCue`、`prankCue`、`packCue` |
| party | `sh-party` | `storyCue`、`soldierCue`、`shotCue`、`rideCue` |
| ride | `sh-ride` | `quietCue`、`eyes` |
| shadow | `sh-shadow` | `shadowCue`、`moonCue`、`headCue` |
| chase / throw | `sh-chase` | `mode`（chase/throw）、各卡点词、`cutFactor` |
| morning | `sh-morning` | `hatCue`、`pumpkinCue`、`goneCue` |
| ending | `sh-wedding` | `laughCue`、`pumpkinCue` |
| credit | `sh-credit` | `nights`、`changeCue`、`cycleCue`、`title`、`brand`、`line1`、`line2` |

## 素材与声音

- 底图 12 张：Gemini 3 Pro Image 原创生成，人物先出设定图、再作参考图保持一致，按原著描写原创设计，未参照任何电影、动画或演员形象。样片不能引用素材 ID，所以每张底图以 1600 宽 WebP data URI 内联在用到它的那个模块的 `MEDIA` 里（共用底图的幕共用一个模块：open/hook 共用 `sh-road`，chase/throw 共用 `sh-chase`），提示词、哈希与权利字段见 [media-sources.json](media-sources.json)；制作任务里同名素材槽优先。
- 剪影 3 个（无头骑士、Ichabod、立镫掷物）：同批生成的黑白剪影描成的矢量路径，几 KB，内联在各模块的 `SIL` 里。
- 旁白：Gemini 2.5 Pro TTS（音色 Charon），经“自定义命令配音”合成并逐词校验；以随包旁白种子形式提供（`templates/samples/narration/S109/`，只在本机与安装包里，不入 Git），播放只读数据、不联网。改了旁白文字，新句子没有这把声音：工作台会提示用本机配音整片重配。
- 配乐：Sleepy Hollow，Lyria 3 Pro 原创生成后按本片时间轴剪成 7 段并合成 35 处音效（夜风、炉火、雷、远炮、火焰呼啸、南瓜爆裂、钟声），CC0，随包曲库 `library:original-sleepy-hollow`。重击、骤停与音效卡在本片逐字时间上：改节奏或换曲后不再对齐。马蹄声没有单独合成（几版合成都不像），奔马的节奏感在配乐的奔跑段里。
- 字体：画面文字用系统衬线字体（macOS 上是 Baskerville），其他系统回退 Georgia / serif；不随包字体文件。

## 已知限制

- 南瓜的闪白一帧接近全白、紧跟着黑场，对光敏感的观众可在 `throw` 幕调低 `Flash` 的 `peak`。
- 成片里 3 处很短的句子为了绕开字幕合并后丢空格的问题改写过（见制作目录 README）。
- 导出时底图若用 JPEG，交付检查可能判 `CODE_NONDETERMINISTIC`；制作任务改用 PNG 后通过。样片内联的是 WebP。

## 来源与边界

故事要点与原文出处见 [source.md](source.md)。旁白是自写复述，只直接引用原文一句（“If I can but reach that bridge, … I am safe.”）。制作脚本、成本账与复现步骤在 `tools/production/sleepy-hollow-20261013/`。

## 另一语言版本：中文《沉睡谷传奇》

`locales/zh.json`（2026-10-14）：界面是中文时播这一版；画面代码、底图、配乐与音效与英文版共用，只换文字与配音。

- 旁白：重新写成营火边讲鬼故事的口吻（不是逐句直译），每幕句数与英文相同；人名用通行译名（伊卡博德·克兰、卡特琳娜·范·塔塞尔、布罗姆·博恩斯，老马“火药”）。片尾按中文样片惯例说“文影”。
- 配音：Gemini 2.5 Pro TTS，音色 Charon（与英文同一个），纯正文无风格提示，逐音节拼音校验；入口 `tools/production/sleepy-hollow-20261013/tts_zh.py`（云端成品按正文缓存，调语速不重配）。语速 272（英文 258）；随包种子 `narration/S109-zh/`（41 句）。试听：Charon/Orus × 3.8 Flash/2.5 Pro 同三句，Gemini 听评代理选 Charon + 2.5 Pro；人耳试听未做。
- 时长与卡点：中文整片 133.7 秒（英文 132.9 秒）。配乐按英文时间轴剪辑，所以中文版在 open、ichabod、morning、ending 几幕用 `hold` 补齐，让后续幕起点回到英文时间轴（片名卡与配乐同时进）；katrina～throw 几幕中文略长，最大滞后约 1.1 秒，hook 起滞后约 0.7 秒。幕内的词卡点跟中文词走，与配乐音效的相对位置会有零点几秒差异。
- 画面文字：全部在 `meta.params`，中文版覆盖名牌、标注、片名、片尾三行；`sh-brom` 的受害者标注原来写死 “Ichabod”，改成参数 `victim`（默认值不变）。衬线字体栈末尾加了 Songti SC / STSong，中文落到宋体；英文画面抽 5 帧（含 Brom 标注出现的 2 帧）逐像素相同。
- 已知问题：2.5 Pro TTS 对个别短句（如“1790 年，纽约，沉睡谷。”）连续返回空结果，已改写措辞绕开。
