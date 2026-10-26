# S120 How Your Map Finds the Fastest Way Home

英文算法讲解（约 2 分钟，横版 1080p）：导航软件怎么找最快的回家路线——城市是一张图，Dijkstra 一圈圈向外扩、保证最优，A* 加上“直线距离按最高车速”的估计少做三倍多的功，堵车改变边权、路线随之改道，真实导航再用 contraction hierarchies 预处理。正文约 120 秒，导出时接约 4.9 秒品牌片尾。

An English explainer (about two minutes, 16:9 1080p): a city is a graph; Dijkstra expands ring by ring and is guaranteed optimal; A* adds a straight-line-at-top-speed guess and does about 3.4× less work for the same route; traffic changes edge weights and the route changes with them; real routing engines precompute shortcuts (contraction hierarchies).

## 这支样片演示什么

- **画面 100% 代码绘制**：没有一张图片。城市路网（372 个路口、627 条路段，种子 1956）、大陆光点网络都由程序按固定种子生成；SVG 画路网与标注，Canvas 2D 画大陆尺度的几万个光点。
- **算法真跑**：Dijkstra 与 A* 在模块加载时真实运行一遍，记下每一步出队与每一次松弛；画面按帧号取“前 k 步”还原当时的已确定路口、发光的前沿（优先队列）和每个路口的暂定用时，所以同一帧永远同一画面。屏上的计数是实际计数：Dijkstra 确定 280 个路口，A* 83 个，同一条 4:55 的路线；堵车后 A* 重新搜索确定 143 个路口，新路线 5:49（不改道 7:00）。
- **逐步讲解**：`steps` 幕在 9 个路口的小图上一步步跑 Dijkstra，右侧伪代码逐行高亮、优先队列实时排序，B 从 4 改成 3 时划掉旧值。
- **跟着旁白走**：搜索开始、到家、分屏比赛、堵车、改道都锚在旁白念到的词上（`cue()`），卡点词都是幕参数。

## 幕与参数

| 幕 | 模块 / mode | 画面 |
| --- | --- | --- |
| hook | `route-city` / `hook` | 倾斜的夜间地图，搜索框打出 Home，A* 一闪，金色路线与其他“不回头”路线 |
| title | `route-scale` / `title` | 路网按 Dijkstra 的距离先后一圈圈亮起，片名浮出 |
| graph | `route-city` / `graph` | 地图变成节点与边，推近看边权（秒），拉远数路线：西南角到东北角“不回头”的路线 93,122,801 条（实算）、30×30 网格 C(60,30) |
| cafe | `route-steps` / `cafe` | 1956 年阿姆斯特丹：线描咖啡杯、脑中的小图（鹿特丹 → 格罗宁根，示意）、二十分钟时钟、划掉的纸和笔 |
| steps | `route-steps` / `steps` | 9 路口小图逐步 Dijkstra + 伪代码 + 优先队列 |
| ripple | `route-city` / `ripple` | 整座城的 Dijkstra 水波，前沿琥珀色、路口标确定时刻，到家后沿来路找回路线 |
| astar | `route-city` / `astar` | 先标出“背离家”的白跑区域，再分屏同速比赛（实际计数） |
| traffic | `route-city` / `traffic` | Central Ave 一段路堵车变红、0:16 → 2:20，A* 重搜、改道 |
| scale | `route-scale` / `scale` | 拉远到大陆尺度的光点网络，分层“捷径”弧线（示意）与一次跨洲查询 |
| credit | `route-scale` / `credit` | 伪代码 + 本片实跑的数字 |

画面文字与卡点词都在各模块的 `meta.params`（如 `street`、`eta`、`checked`、`rule`、`tagline`、`code`），改字不用改代码；城市本身（种子、起终点、堵车路段、车速）写在幕代码开头的 `CITY` 与 `ROUTE` 常量里，改了以后屏上计数会自动变，但旁白里念的数字要自己同步改。

## 声音

- 旁白：Gemini 3.8 Flash TTS，音色 Puck（先用同两句试了 Puck、Achird、Kore、Zephyr、Charon，风格提示会让模型多念，只给纯正文），经“自定义命令配音”合成，每句再转写逐词核对；语速 248、句间 0.1 秒。以随包旁白种子提供（`templates/samples/narration/S120/`，只在本机与安装包，不入 Git），播放不联网、不需要 key。改了旁白文字，新句子没有这把声音：要自备 Gemini key，或用本机英文配音整片重配。英文句子都写在 45 个字符以内，并避免短于 1.2 秒的句子（短句会和相邻字幕合并）。
- 配乐：Fastest Way Home，Lyria 3 Pro 按本片时间轴提示生成三版，选与成片等长的一版（实测约 110 BPM），叠加 NumPy 合成的音效：路口被确定时的“滴”声按 1/16 拍合并成批、音高随距离升高，改道是两声上行钟音。CC0，随包曲库 `library:original-fastest-way-home`。音效按本片时间轴放好：改节奏或换曲后不再对齐。

## 来源与边界

事实与出处见 [source.md](source.md)：Dijkstra 1956 年构思、1959 年发表（Numerische Mathematik 1, 269–271），咖啡馆、二十分钟与不用纸笔出自 2001 年 Frana 访谈（CACM 2010）；A* 出自 Hart、Nilsson、Raphael 1968；contraction hierarchies 出自 Geisberger 等 2008，西欧约 1800 万节点路网单次查询约 0.2 毫秒。片中城市与大陆都是虚构的程序生成地图；“捷径弧线”与“鹿特丹 → 格罗宁根”小图是示意。不代表任何导航产品的具体实现。

制作脚本、实算数字（`stats.mjs`）、成本账与复现步骤在 `tools/production/code-route-20261013/`。

## 另一语言版本：中文《导航怎么找到回家最快的路》

`locales/zh.json`（2026-10-14）：界面是中文时播这一版；城市、算法、画面代码与配乐与英文版共用，只换文字与配音。

- 旁白：中文科普解说口吻，每幕句数与英文相同；口播用“迪杰斯特拉算法”“A 星”，画面上的 Dijkstra、A*、人名与论文出处保留原文。算法数字不变（9300 多万条路线、280 对 83 个路口、3.4 倍、4:55 等都由代码实算，画面与英文同值）；伪代码保留英文。
- 配音：Gemini 3.8 Flash TTS，音色 Puck（与英文同一个），纯正文，逐音节拼音校验；入口 `tools/production/code-route-20261013/tts_zh.py`（云端成品按正文缓存）。语速 265（英文 248）；随包种子 `narration/S120-zh/`（45 句）。试听：Orus、Kore、Charon、Puck 同三句，Gemini 听评代理选 Puck；人耳试听未做。
- 时长与卡点：配乐按英文时间轴生成，中文版在 `graph`、`traffic`、`scale`、`credit` 用 `hold` 补齐，让后续幕起点回到英文时间轴；开场与中段几幕中文略长，最大滞后约 0.8 秒，片尾对齐；中文整片 125.2 秒（英文 125.1 秒）。
- 画面文字：全部在 `meta.params`。用时卡里的 “min” 原来写死在代码里，改成参数 `etaMinutes`（默认 `{n} min`，中文 `{n} 分钟`）；A* 计数行与“同一路线”行遇到中文时收紧行高（中文回退字体行高更大，会压到规则框），英文不走这条分支。英文画面抽 4 帧逐像素相同。路网边上的权重仍是 “42s” 这样的秒数记号。
