# How Your Map Finds the Fastest Way Home · 本片原文依据

本片是原创科普讲解（英文旁白自写），讲导航软件找最快路线的三件事：Dijkstra 算法、A* 算法、实时路况与预处理。画面 100% 由代码绘制，片中的城市是程序按固定种子生成的虚构路网，所有搜索都在画面里真实运行。

## 事实与出处

- **城市是一张图**：路口是节点，路段是带权的边，权重取通行时间。这是最短路问题的标准建模（任何算法教材，如 Cormen 等《Introduction to Algorithms》第 22～24 章；本片的边权 = 路段长度 ÷ 车速 × 1～1.2 的路况系数）。
- **Dijkstra，1956 年构思、1959 年发表**：Dijkstra 在 2001 年接受 Philip L. Frana 访谈时回忆，1956 年他为展示 ARMAC 计算机，想找一个外行也听得懂的问题——“从鹿特丹到格罗宁根的最短路怎么走”；某天上午和未婚妻在阿姆斯特丹逛街，坐在咖啡馆露台喝咖啡时，用大约二十分钟想出了最短路算法，没有用纸笔；三年后（1959）发表。访谈刊于 *Communications of the ACM* 53(8), 2010（“An Interview with Edsger W. Dijkstra”）；论文 E. W. Dijkstra, “A note on two problems in connexion with graphs”, *Numerische Mathematik* 1, 269–271 (1959)。
  - 片中“Edsger Dijkstra sits down for coffee”“About twenty minutes later, he has it”“No pencil. No paper.”是对访谈原话的复述；“鹿特丹 → 格罗宁根”小图是示意，不是地理位置。
- **Dijkstra 为什么保证最优**：每次取出“已知最短距离”最小的未访问路口，它的距离就确定了；因为边权都不为负（“Roads only add time”），之后任何绕路都不会更短。这是 Dijkstra 正确性的标准论证（边权非负是前提）。
- **A*，1968 年**：P. E. Hart, N. J. Nilsson, B. Raphael, “A Formal Basis for the Heuristic Determination of Minimum Cost Paths”, *IEEE Transactions on Systems Science and Cybernetics* SSC-4(2), 100–107 (1968)。在 Dijkstra 的基础上，按“已走时间 + 剩余时间的估计”排序；只要估计从不高估（可采纳），找到的仍是最优路线。
  - 本片的估计 = 直线距离 ÷ 全城最高车速（40 km/h）。路段长度不短于直线、车速不高于最高车速、路况系数 ≥ 1，所以估计永远不超过真实剩余时间（可采纳且一致），片中“guess must never overestimate”即此条件。
- **实时路况改变边权、路线随之改变**：导航软件用实时交通数据更新路段通行时间并重新计算路线（通识；片中只演示“权重变了、再搜一次、得到新路线”这一机制，不代表任何具体产品的实现）。
- **预处理与 contraction hierarchies**：R. Geisberger, P. Sanders, D. Schultes, D. Delling, “Contraction Hierarchies: Faster and Simpler Hierarchical Routing in Road Networks”, WEA 2008, LNCS 5038。论文在约 1800 万节点、4200 万条有向边的西欧路网上实验，单次查询约 0.15～0.21 毫秒（2008 年硬件，距离查询）；片中说“Tens of millions of intersections”“Under a millisecond”即据此。片中的“捷径弧线”是示意画，不是真的 CH 结构；大陆光点网络同样是程序生成的虚构地图。

## 片中数字（全部实算）

由 `tools/production/code-route-20261013/stats.mjs` 对同一份 `src/algo.mjs` 运行得到（种子 1956）：

| 项 | 数值 |
| --- | --- |
| 路口 / 路段 | 372 / 627 |
| 起点 → 家：最快路线 | 4.92 分钟（4:55） |
| Dijkstra 确定的路口数（到家为止，含家） | 280 |
| A* 确定的路口数（同起终点） | 83（同一条路线，少做约 3.4 倍） |
| 西南角 → 东北角“不回头”的路线数 | 93,122,801 |
| 30 × 30 街区网格的“不回头”路线数 | C(60,30) = 118,264,581,564,861,424 |
| 堵车路段（Central Ave） | 16 秒 → 2:20（× 9） |
| 不改道的用时 / 改道后 | 7:00 / 5:49，A* 重新搜索确定 143 个路口 |
| 小图演示（9 个路口） | S → A → B → D → E → H = 11 分钟，9 步 |

“不回头”指每一步都朝终点方向（向东、向北或斜向东北），用有向无环图计数；真实可走的路线（允许绕回）只会更多。
