import React from 'react';
import {clamp, easeInOut, seeded, useCanvas, useScene, type SceneInput} from '@talkframe/scene';

// 路网与搜索算法的唯一来源：prepare.py 把本文件（去掉 export）内联进每个幕模块，Node 制作脚本（stats.mjs、
// music_build.py 经 events.mjs）直接 import，所以画面里跑的搜索、旁白里的数字、音效的时间点是同一份计算。
// 纯函数、固定种子，不读时钟、不用 Math 里的随机数：同一帧永远同一结果。

/** mulberry32：固定种子的伪随机序列，返回 [0, 1)。 */
function rand32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 城市参数：27×14 个路口，街区约 150 米（66 像素 × 2.3 米），种子 1956（Dijkstra 构思算法那年）。 */
const SLOW = .2;
const CITY = {cols: 27, rows: 14, gap: 66, x0: 102, y0: 72, seed: 1956, mpp: 2.3,
  riverRow: 9, bridges: [2, 9, 15, 22], park: [11, 2, 3, 2], avenueRows: [2, 6], avenueCols: [5, 13, 20],
  diagonal: [[2, 9], [7, 4]], speeds: {street: 26, avenue: 36, boulevard: 40, bridge: 30}};

/** 河道中线 y（像素）：在 riverRow 与下一行之间缓慢蜿蜒。 */
function riverY(x, c = CITY) {
  return c.y0 + (c.riverRow + .5) * c.gap + c.gap * .16 * Math.sin(x / 260 + .7) + c.gap * .06 * Math.sin(x / 97);
}

/** 生成确定性的城市路网：路口 = 节点，路段 = 带权边（权重 = 通行分钟数）。 */
function makeCity(c = CITY) {
  const r = rand32(c.seed);
  const nodes = [];
  const id = (i, j) => j * c.cols + i;
  const inPark = (i, j) => i >= c.park[0] && i < c.park[0] + c.park[2] && j >= c.park[1] && j < c.park[1] + c.park[3];
  for (let j = 0; j < c.rows; j++) for (let i = 0; i < c.cols; i++) {
    let x = c.x0 + i * c.gap + (r() - .5) * c.gap * .26, y = c.y0 + j * c.gap + (r() - .5) * c.gap * .26;
    // 河岸两侧的路口离开水面：贴河的两行往外推。
    if (j === c.riverRow) y = Math.min(y, riverY(x, c) - c.gap * .34);
    if (j === c.riverRow + 1) y = Math.max(y, riverY(x, c) + c.gap * .34);
    nodes.push({id: id(i, j), i, j, x, y, alive: !inPark(i, j)});
  }
  const edges = [];
  const avenue = (a, b) => (a.j === b.j && c.avenueRows.includes(a.j)) || (a.i === b.i && c.avenueCols.includes(a.i));
  const addEdge = (a, b, kind) => {
    if (!a.alive || !b.alive) return;
    const len = Math.hypot(a.x - b.x, a.y - b.y);
    edges.push({id: edges.length, a: a.id, b: b.id, len, kind, slow: 1});
  };
  for (let j = 0; j < c.rows; j++) for (let i = 0; i < c.cols; i++) {
    const n = nodes[id(i, j)];
    if (i + 1 < c.cols) addEdge(n, nodes[id(i + 1, j)], avenue(n, nodes[id(i + 1, j)]) ? 'avenue' : 'street');
    if (j + 1 < c.rows) {
      const m = nodes[id(i, j + 1)];
      if (j === c.riverRow) { if (c.bridges.includes(i)) addEdge(n, m, 'bridge'); }
      else addEdge(n, m, avenue(n, m) ? 'avenue' : 'street');
    }
  }
  // 斜向林荫大道：从西南往东北穿过几个街区（只连对角，不与网格相交）。
  const [[di, dj], [ei]] = c.diagonal;
  for (let k = 0; di + k < ei; k++) addEdge(nodes[id(di + k, dj - k)], nodes[id(di + k + 1, dj - k - 1)], 'boulevard');
  // 随机封掉约 9% 的小街（死胡同、单行、工地），保证全城仍然连通。
  const alive = nodes.filter(n => n.alive);
  const connected = (skip) => {
    const adj = new Map(alive.map(n => [n.id, []]));
    for (const e of edges) if (!e.cut && e !== skip) { adj.get(e.a).push(e.b); adj.get(e.b).push(e.a); }
    const seen = new Set([alive[0].id]), stack = [alive[0].id];
    while (stack.length) for (const v of adj.get(stack.pop())) if (!seen.has(v)) { seen.add(v); stack.push(v); }
    return seen.size === alive.length;
  };
  for (const e of edges) if (e.kind === 'street' && r() < .09 && connected(e)) e.cut = true;
  const kept = edges.filter(e => !e.cut).map((e, k) => ({...e, id: k}));
  // 红绿灯与路况：每段路慢 0%～35%。权重 = 长度 × 米/像素 ÷ 车速（米/分钟）× 慢系数。
  for (const e of kept) {
    e.slow = 1 + SLOW * r();
    e.minutes = e.len * c.mpp / (c.speeds[e.kind] * 1000 / 60) * e.slow;
  }
  const adj = nodes.map(() => []);
  for (const e of kept) { adj[e.a].push({to: e.b, e: e.id}); adj[e.b].push({to: e.a, e: e.id}); }
  const vmax = Math.max(...Object.values(c.speeds)) * 1000 / 60;  // 米/分钟；慢系数 ≥ 1，所以直线 ÷ 最高车速不会高估
  return {cfg: c, nodes, edges: kept, adj, vmax, id};
}

/** 二叉堆优先队列（按 key 取最小；key 相同按插入序，保证确定）。 */
function heap() {
  const a = [];
  let seq = 0;
  const less = (x, y) => x.k < y.k || (x.k === y.k && x.s < y.s);
  return {
    get size() { return a.length; },
    push(v, k) {
      a.push({v, k, s: seq++});
      let i = a.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (!less(a[i], a[p])) break; [a[i], a[p]] = [a[p], a[i]]; i = p; }
    },
    pop() {
      const top = a[0], last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < a.length && less(a[l], a[m])) m = l;
          if (r < a.length && less(a[r], a[m])) m = r;
          if (m === i) break;
          [a[i], a[m]] = [a[m], a[i]]; i = m;
        }
      }
      return top;
    },
  };
}

/**
 * Dijkstra（astar=false）或 A*（astar=true，启发 = 直线距离 ÷ 最高车速，不高估）。
 * 返回逐步记录：order[k] 是第 k 个被“确定”（出队）的路口；updates 是每次松弛改写的暂定值，
 * 画面按帧取前 k 步就能还原任意时刻的已访问集合、前沿与每个路口当时的暂定分钟数。
 * weight(e) 可覆盖边权（堵车）；stopAtTarget=false 时跑完全图。
 */
function search(city, s, t, {astar = false, weight = null, stopAtTarget = true} = {}) {
  const n = city.nodes.length, w = weight ?? (e => city.edges[e].minutes);
  const h = astar ? (v => Math.hypot(city.nodes[v].x - city.nodes[t].x, city.nodes[v].y - city.nodes[t].y) * city.cfg.mpp / city.vmax) : (() => 0);
  const g = new Array(n).fill(Infinity), prev = new Array(n).fill(-1), prevEdge = new Array(n).fill(-1);
  const popAt = new Array(n).fill(-1), seenAt = new Array(n).fill(-1);
  const order = [], updates = [];
  const q = heap();
  g[s] = 0; seenAt[s] = 0; q.push(s, h(s));
  updates.push({step: 0, v: s, g: 0, from: -1, e: -1});
  while (q.size) {
    const {v: u} = q.pop();
    if (popAt[u] >= 0) continue;
    popAt[u] = order.length; order.push(u);
    if (u === t && stopAtTarget) break;
    for (const {to, e} of city.adj[u]) {
      if (popAt[to] >= 0) continue;
      const nd = g[u] + w(e);
      if (nd < g[to] - 1e-12) {
        g[to] = nd; prev[to] = u; prevEdge[to] = e;
        if (seenAt[to] < 0) seenAt[to] = order.length;
        updates.push({step: order.length, v: to, g: nd, from: u, e});
        q.push(to, nd + h(to));
      }
    }
  }
  const path = [];
  if (popAt[t] >= 0) for (let v = t; v >= 0; v = prev[v]) path.unshift(v);
  const pathEdges = path.slice(1).map(v => prevEdge[v]);
  return {s, t, astar, order, updates, popAt, seenAt, g, prev, prevEdge, path, pathEdges, settled: order.length, minutes: g[t]};
}

/**
 * 第 k 步（可带小数）时的搜索状态：settled 已确定、frontier 前沿（优先队列里的路口及暂定分钟）、tree 每个已发现路口当前的来路边。
 * k 个路口已出队；第 k 个（下标 k-1）出队时做的松弛也已生效。
 */
function stateAt(run, k) {
  const done = Math.max(0, Math.min(run.order.length, Math.floor(k)));
  const tent = new Map();
  for (const u of run.updates) { if (u.step > done) break; tent.set(u.v, u); }
  const frontier = [];
  for (const [v, u] of tent) if (run.popAt[v] < 0 || run.popAt[v] >= done) frontier.push({v, g: u.g, from: u.from, e: u.e, step: u.step});
  return {done, tent, frontier};
}

// 全片共用的起终点与堵车路段（网格坐标 [列, 行]）。prepare.py 同样内联进幕模块。
const ROUTE = {start: [8, 7], home: [21, 3], jam: [[14, 6], [15, 6]], jamFactor: 9};


// 《How Your Map Finds the Fastest Way Home》共用画面库：prepare.py 把 algo.mjs、route.mjs 内联在上面，
// 再拼上本文件与每个幕模块。画面 100% 代码绘制，没有任何图片素材；所有搜索都在模块加载时真跑一遍，
// 每一帧只按帧号取“前 k 步”的状态，所以同一帧永远同一画面。
const W = 1920, H = 1080;
const CYAN = '#45d8ff', VIOLET = '#8f7bff', MAGENTA = '#ff5fb0', AMBER = '#ffb547', RED = '#ff4b4b', GREEN = '#5cf29a';
const STREET = '#1b2740', AVENUE = '#2b3d62', RIVER = '#0c2442', PARK = '#0d2a24', NODE = '#7f90b8';
const MONO = 'Menlo, "SF Mono", Consolas, "DejaVu Sans Mono", monospace';
const sm = (v: number) => {const p = clamp(v); return p * p * (3 - 2 * p);};
const out3 = (v: number) => 1 - Math.pow(1 - clamp(v), 3);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
/** 区间窗：a 起淡入、b 起淡出（秒）。 */
const win = (t: number, a: number, b: number, f = .3) => sm((t - a) / f) * (1 - sm((t - b) / f));
const fadeEdges = (t: number, dur: number, inS = .2, outS = .25) => Math.min(sm(t / inS), sm((dur - t) / outS));

/** 颜色：背景、正文、路线金色、次要文字跟随 props.theme（播放页可换配色）；算法配色固定。 */
function palette(props: SceneInput) {
  return {bg: props.theme.background || '#060a14', text: props.theme.text || '#eef3ff', gold: props.theme.accent || '#ffd75e', muted: props.theme.muted || '#8d9abb'};
}
/** 文字参数：props 里写了就用，否则用本幕 meta 的默认值。 */
function txt(props: SceneInput, key: string): string {
  const value = props.params[key];
  return typeof value === 'string' ? value : String((meta as any).params?.[key]?.default ?? '');
}
const fmt = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''));
/** 分钟 → m:ss。 */
const mmss = (minutes: number) => {
  if (!Number.isFinite(minutes)) return '∞';
  const s = Math.round(minutes * 60);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const secs = (minutes: number) => `${Math.round(minutes * 60)}s`;

/** 句子时间：cue 找不到时退回给定秒数，改文案后画面不丢。 */
function cues(props: SceneInput) {
  const s = useScene(props);
  const at = (phrase: string, fallback = 0) => s.cue(phrase) ?? fallback;
  const start = (i: number, fallback = 0) => s.sentence(i)?.start ?? fallback;
  const end = (i: number, fallback = s.seconds) => s.sentence(i)?.end ?? fallback;
  const n = props.sentences.length;
  return {s, t: s.t, at, start, end, n, dur: s.seconds};
}

// ---------- 全片共用的城市与搜索（模块加载时算一次） ----------
const CITYG = makeCity();
const SID = CITYG.id(ROUTE.start[0], ROUTE.start[1]), TID = CITYG.id(ROUTE.home[0], ROUTE.home[1]);
const JAM = CITYG.edges.find(e => (e.a === CITYG.id(ROUTE.jam[0][0], ROUTE.jam[0][1]) && e.b === CITYG.id(ROUTE.jam[1][0], ROUTE.jam[1][1]))
  || (e.b === CITYG.id(ROUTE.jam[0][0], ROUTE.jam[0][1]) && e.a === CITYG.id(ROUTE.jam[1][0], ROUTE.jam[1][1])))!;
const jamWeight = (e: number) => CITYG.edges[e].minutes * (e === JAM.id ? ROUTE.jamFactor : 1);
const DIJ = search(CITYG, SID, TID);
const AST = search(CITYG, SID, TID, {astar: true});
const RE = search(CITYG, SID, TID, {astar: true, weight: jamWeight});
const OLD_JAMMED = AST.pathEdges.reduce((sum: number, e: number) => sum + jamWeight(e), 0);
const P = (v: number) => CITYG.nodes[v];

/** 镜头：把城市坐标 (cx, cy) 放到画面 (sx, sy)，放大 z 倍。 */
const camera = (cx: number, cy: number, z: number, sx = W / 2, sy = H / 2) => `translate(${sx} ${sy}) scale(${z}) translate(${-cx} ${-cy})`;
const lerpCam = (a: number[], b: number[], p: number) => a.map((v, i) => mix(v, b[i], p));

/** 河与公园（地图层）。 */
function Terrain({opacity = 1, park = true}: {opacity?: number; park?: boolean}) {
  const c = CITYG.cfg, pts: string[] = [];
  for (let x = -200; x <= W + 200; x += 20) pts.push(`${x},${riverY(x).toFixed(1)}`);
  const [pi, pj, pw, ph] = c.park;
  const x0 = c.x0 + (pi - .55) * c.gap, y0 = c.y0 + (pj - .55) * c.gap;
  return <g opacity={opacity}>
    {park && <rect x={x0} y={y0} width={(pw + .1) * c.gap} height={(ph + .1) * c.gap} rx={18} fill={PARK} />}
    <polyline points={pts.join(' ')} fill="none" stroke={RIVER} strokeWidth={34} strokeLinecap="round" />
    <polyline points={pts.join(' ')} fill="none" stroke="#123056" strokeWidth={4} strokeDasharray="2 14" opacity={.8} />
  </g>;
}

/** 路网底图：mapness=1 是地图（粗路、圆头），0 是图（细线 + 节点）；nodes 为节点显现进度（0～1，可按格子错峰）。 */
function Roads({mapness = 0, nodes = 1, dim = 1, nodeColor = NODE, edgeColor, highlightKinds = 0, width: k = 1}:
  {mapness?: number; nodes?: number; dim?: number; nodeColor?: string; edgeColor?: string; highlightKinds?: number; width?: number}) {
  return <g>
    {CITYG.edges.map((e: any) => {
      const a = P(e.a), b = P(e.b), fast = e.kind !== 'street';
      const width = mix(fast ? 2.4 : 1.6, fast ? 20 : 12, mapness) * k;
      const color = edgeColor ?? (fast ? (highlightKinds > 0 ? '#3f6fb0' : AVENUE) : STREET);
      return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={width} strokeLinecap="round"
        opacity={dim * (fast ? 1 : mix(.9, 1, mapness))} />;
    })}
    {nodes > 0 && CITYG.nodes.map((n: any) => {
      if (!n.alive) return null;
      const k = clamp(nodes * 1.4 - (n.i + n.j) / 40 * .4);
      return k > 0 && <circle key={n.id} cx={n.x} cy={n.y} r={5.2 * out3(k)} fill={nodeColor} opacity={dim} />;
    })}
  </g>;
}

/** 距离 → 颜色：近处青、远处紫。 */
function waveColor(g: number, gmax: number) {
  const p = clamp(g / gmax);
  const a = [69, 216, 255], b = [143, 123, 255];
  return `rgb(${a.map((v, i) => Math.round(mix(v, b[i], p))).join(',')})`;
}

/**
 * 搜索层：按第 k 步（可带小数）画已确定的路口（按距离着色、刚确定的有水波环）、沿街流出的水流、
 * 前沿（优先队列）的琥珀色光环与暂定时间。run 是 search() 的结果。
 */
function SearchLayer({run, k, color, labels = true, labelAge = 2.2, flow = 3, ring = 7, frontier = true, scale = 1, gmax = 6, weight}:
  {run: any; k: number; color?: string; labels?: boolean; labelAge?: number; flow?: number; ring?: number; frontier?: boolean; scale?: number; gmax?: number; weight?: (e: number) => number}) {
  const st = stateAt(run, k);
  const items: any[] = [], rings: any[] = [], marks: any[] = [], texts: any[] = [];
  const w = weight ?? ((e: number) => CITYG.edges[e].minutes);
  const font = 15 / Math.max(.6, scale);
  for (let idx = 0; idx < st.done; idx++) {
    const u = run.order[idx], pu = P(u), age = k - idx;
    const c = color ?? waveColor(run.g[u], gmax);
    // 沿街流出的水流：每条出边按年龄从 u 往外长。
    for (const {to, e} of CITYG.adj[u]) {
      const f = clamp(age / flow), pv = P(to);
      if (run.popAt[to] >= 0 && run.popAt[to] < idx) continue;  // 来路那条已画
      if (f <= 0) continue;
      items.push(<line key={`f${e}-${u}`} x1={pu.x} y1={pu.y} x2={mix(pu.x, pv.x, f)} y2={mix(pu.y, pv.y, f)} stroke={c} strokeWidth={2.6 / scale} opacity={.5} strokeLinecap="round" />);
    }
    if (run.prevEdge[u] >= 0) {
      const pp = P(run.prev[u]);
      items.push(<line key={`t${u}`} x1={pp.x} y1={pp.y} x2={pu.x} y2={pu.y} stroke={c} strokeWidth={3.4 / scale} opacity={.85} strokeLinecap="round" />);
    }
    marks.push(<circle key={`n${u}`} cx={pu.x} cy={pu.y} r={6.5 / Math.sqrt(scale)} fill={c} />);
    const ra = age / ring;
    if (ra < 1) rings.push(<circle key={`r${u}`} cx={pu.x} cy={pu.y} r={(7 + 30 * out3(ra)) / Math.sqrt(scale)} fill="none" stroke={c} strokeWidth={2.2 / scale} opacity={.9 * (1 - ra)} />);
    if (labels && age < labelAge) texts.push(<text key={`l${u}`} x={pu.x} y={pu.y - 12 / scale} textAnchor="middle" fontFamily={MONO} fontSize={font} fontWeight={700}
      fill="#f4f8ff" opacity={1 - sm((age - labelAge * .55) / (labelAge * .45))}>{mmss(run.g[u])}</text>);
  }
  if (frontier) for (const f of st.frontier) {
    if (f.v === run.s && st.done === 0) continue;
    const p = P(f.v);
    marks.push(<circle key={`q${f.v}`} cx={p.x} cy={p.y} r={8 / Math.sqrt(scale)} fill="none" stroke={AMBER} strokeWidth={3 / scale} />);
    marks.push(<circle key={`qg${f.v}`} cx={p.x} cy={p.y} r={16 / Math.sqrt(scale)} fill={AMBER} opacity={.16} />);
    if (labels) texts.push(<text key={`ql${f.v}`} x={p.x} y={p.y - 13 / scale} textAnchor="middle" fontFamily={MONO} fontSize={font * .92} fill={AMBER} opacity={.95}>{mmss(f.g)}</text>);
  }
  void w;
  return <g>{items}{rings}{marks}{texts}</g>;
}

/** 金色路线：p 为从起点画到终点的进度；宽光带 + 亮芯。 */
function RoutePath({path, p = 1, color, width = 7, dashed = false, opacity = 1}: {path: number[]; p?: number; color: string; width?: number; dashed?: boolean; opacity?: number}) {
  if (!path.length || p <= 0) return null;
  const pts = path.map(v => [P(v).x, P(v).y]);
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let left = clamp(p) * total;
  const out = [pts[0]];
  for (let i = 0; i < lens.length && left > 0; i++) {
    const f = Math.min(1, left / lens[i]);
    out.push([mix(pts[i][0], pts[i + 1][0], f), mix(pts[i][1], pts[i + 1][1], f)]);
    left -= lens[i];
  }
  const d = out.map(q => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
  return <g opacity={opacity}>
    {!dashed && <polyline points={d} fill="none" stroke={color} strokeWidth={width * 3.2} opacity={.18} strokeLinecap="round" strokeLinejoin="round" />}
    <polyline points={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? `${width * 2} ${width * 2}` : undefined} />
  </g>;
}

/** 起点（你）与终点（家）的图钉。 */
function Pin({v, kind, scale = 1, t = 0, label, gold}: {v: number; kind: 'you' | 'home'; scale?: number; t?: number; label?: string; gold: string}) {
  const p = P(v), s = 1 / scale;
  const pulse = .5 + .5 * Math.sin(t * 4);
  if (kind === 'you') return <g transform={`translate(${p.x} ${p.y}) scale(${s})`}>
    <circle r={26 + 8 * pulse} fill={GREEN} opacity={.14} />
    <circle r={13} fill={GREEN} stroke="#08130c" strokeWidth={4} />
    {label && <text y={-26} textAnchor="middle" fontSize={22} fontWeight={800} fill={GREEN} fontFamily="inherit">{label}</text>}
  </g>;
  return <g transform={`translate(${p.x} ${p.y}) scale(${s})`}>
    <circle r={26} fill={gold} opacity={.16} />
    <path d="M-14 2 L0 -12 L14 2 L14 14 L-14 14 Z" fill={gold} stroke="#1a1405" strokeWidth={3} strokeLinejoin="round" />
    <rect x={-4} y={4} width={8} height={10} fill="#1a1405" />
    {label && <text y={-24} textAnchor="middle" fontSize={22} fontWeight={800} fill={gold} fontFamily="inherit">{label}</text>}
  </g>;
}

/** 屏上小卡片（HTML）：标题 + 大数字 + 说明。 */
function Card({x, y, w = 360, title, value, note, color, opacity = 1, fonts, align = 'left', big = 64}: any) {
  if (opacity <= 0) return null;
  return <div style={{position: 'absolute', left: x, top: y, width: w, opacity, fontFamily: fonts?.text, textAlign: align,
    background: 'rgba(6,10,20,.78)', border: `1.5px solid ${color}55`, borderRadius: 18, padding: '18px 24px', boxSizing: 'border-box'}}>
    {title && <div style={{fontSize: 22, letterSpacing: 3, color, fontWeight: 800, textTransform: 'uppercase'}}>{title}</div>}
    {value !== undefined && <div style={{fontSize: big, fontWeight: 800, color: '#f4f8ff', fontFamily: MONO, lineHeight: 1.1, marginTop: 4}}>{value}</div>}
    {note && <div style={{fontSize: 22, color: 'rgba(220,230,250,.78)', marginTop: 6}}>{note}</div>}
  </div>;
}

/** 优先队列面板：前沿里最小的几个，最上面是下一个要确定的。 */
function QueuePanel({run, k, x, y, title, nextLabel, fonts, opacity = 1, rows = 5, name}: any) {
  if (opacity <= 0) return null;
  const st = stateAt(run, k);
  const list = st.frontier.slice().sort((a: any, b: any) => (a.g + 0) - (b.g + 0) || a.v - b.v).slice(0, rows);
  return <div style={{position: 'absolute', left: x, top: y, width: 330, opacity, fontFamily: fonts?.text,
    background: 'rgba(6,10,20,.8)', border: `1.5px solid ${AMBER}55`, borderRadius: 16, padding: '14px 18px', boxSizing: 'border-box'}}>
    <div style={{fontSize: 19, letterSpacing: 2, color: AMBER, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6}}>{title}</div>
    {list.map((f: any, i: number) => <div key={f.v} style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 24,
      color: i === 0 ? '#fff6e0' : 'rgba(230,236,250,.7)', fontWeight: i === 0 ? 800 : 500, padding: '3px 0'}}>
      <span>{name ? name(f.v) : `#${String(f.v).padStart(3, '0')}`}</span><span>{mmss(f.g)}{i === 0 ? `  ${nextLabel}` : ''}</span></div>)}
  </div>;
}

/** 幕根：底色铺满整幅，内容画在固定 1920×1080 的舞台上再按画幅等比缩放（预览窗、其他分辨率都不错位）。 */
function Root({props, t, dur, inS = .15, outS = .2, vignette = .5, children}: {props: SceneInput; t: number; dur: number; inS?: number; outS?: number; vignette?: number; children: any}) {
  const k = Math.min(props.width / W, props.height / H);
  return <div style={{position: 'absolute', inset: 0, background: palette(props).bg, overflow: 'hidden', opacity: fadeEdges(t, dur, inS, outS)}}>
    <div style={{position: 'absolute', left: (props.width - W * k) / 2, top: (props.height - H * k) / 2, width: W, height: H, transform: `scale(${k})`, transformOrigin: '0 0', overflow: 'hidden'}}>
      {children}{vignette > 0 && <Vignette k={vignette} />}
    </div>
  </div>;
}
/** 全幅 SVG（幕坐标 1920×1080）。 */
const Svg = ({children, style}: {children: any; style?: any}) =>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>{children}</svg>;
/** 暗角。 */
const Vignette = ({k = .55}: {k?: number}) => <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${k}) 100%)`}} />;
/** 打字机：按进度显出前 n 个字。 */
const typed = (text: string, p: number) => text.slice(0, Math.round(clamp(p) * text.length));
void seeded; void useCanvas; void easeInOut; void win; void VIOLET; void MAGENTA; void RED;

// 城市路网五用：hook 开场点“Home”、graph 城市变成图、ripple Dijkstra 水波、astar 与 A* 分屏对比、traffic 堵车改道。
// 每一幕的搜索都是上面 algo 真跑的结果，画面按帧取前 k 步；屏上计数是实际计数。
export const meta = {
  params: {
    mode: {label: '用法', type: 'select', options: [{value: 'hook', label: '开场：点“回家”'}, {value: 'graph', label: '城市变成图'},
      {value: 'ripple', label: 'Dijkstra 水波'}, {value: 'astar', label: 'A* 分屏对比'}, {value: 'traffic', label: '堵车改道'}]},
    search: {label: '搜索框文字', type: 'text', default: 'Home', maxLength: 24},
    you: {label: '起点标签', type: 'text', default: 'You', maxLength: 16},
    home: {label: '终点标签', type: 'text', default: 'Home', maxLength: 16},
    eta: {label: '用时卡', type: 'text', default: '{t} · fastest route', maxLength: 40, help: '{t} 换成实际路线用时'},
    etaMinutes: {label: '用时卡分钟', type: 'text', default: '{n} min', maxLength: 16, help: '{n} 换成路线分钟数（四舍五入）'},
    tapCue: {label: '点按卡点词', type: 'text', default: 'Go', maxLength: 24},
    routeCue: {label: '出路线卡点词', type: 'text', default: 'moment', maxLength: 24},
    ghostCue: {label: '其他路线卡点词', type: 'text', default: 'fastest', maxLength: 24},
    nodesText: {label: '节点说明', type: 'text', default: 'intersection = node', maxLength: 40},
    edgesText: {label: '边说明', type: 'text', default: 'street = edge', maxLength: 40},
    weightText: {label: '权重说明', type: 'text', default: 'weight = seconds to drive', maxLength: 40},
    fastText: {label: '快路说明', type: 'text', default: 'avenues: fast', maxLength: 30},
    slowText: {label: '慢路说明', type: 'text', default: 'side streets: slow', maxLength: 30},
    routes: {label: '不回头路线数', type: 'text', default: '93,122,801', maxLength: 30, help: 'stats.mjs 对本城实算：西南角到东北角只往终点方向走的路线条数'},
    routesNote: {label: '路线数说明', type: 'text', default: 'routes corner to corner that never double back', maxLength: 60},
    bigRoutes: {label: '真实城市路线数', type: 'text', default: '118,264,581,564,861,424', maxLength: 40, help: 'C(60,30)：30×30 个街区的网格'},
    bigNote: {label: '真实城市说明', type: 'text', default: 'a 30 × 30-block grid city', maxLength: 60},
    checking: {label: '逐条检查', type: 'text', default: 'Checking them one by one…', maxLength: 40},
    nodesCue: {label: '节点卡点词', type: 'text', default: 'nodes', maxLength: 24},
    edgesCue: {label: '边卡点词', type: 'text', default: 'edges', maxLength: 24},
    weightCue: {label: '权重卡点词', type: 'text', default: 'weight', maxLength: 24},
    cornerCue: {label: '路线数卡点词', type: 'text', default: 'Corner', maxLength: 24},
    realCue: {label: '真实城市卡点词', type: 'text', default: 'real', maxLength: 24},
    hopelessCue: {label: '逐条检查卡点词', type: 'text', default: 'hopeless', maxLength: 24},
    dijkstra: {label: 'Dijkstra 名称', type: 'text', default: 'Dijkstra', maxLength: 24},
    settled: {label: '已确定计数', type: 'text', default: 'intersections settled', maxLength: 40},
    queue: {label: '优先队列标题', type: 'text', default: 'Priority queue', maxLength: 30},
    next: {label: '下一个', type: 'text', default: '← next', maxLength: 12},
    proven: {label: '保证最优', type: 'text', default: 'fastest · {t}', maxLength: 30, help: '{t} 换成路线用时'},
    homeCue: {label: '到家卡点词', type: 'text', default: 'touches', maxLength: 24},
    provenCue: {label: '保证卡点词', type: 'text', default: 'guaranteed', maxLength: 24},
    wrong: {label: '白跑说明', type: 'text', default: 'wrong way', maxLength: 30},
    wrongCue: {label: '白跑卡点词', type: 'text', default: 'wrong', maxLength: 24},
    astar: {label: 'A* 名称', type: 'text', default: 'A*', maxLength: 16},
    astarCredit: {label: 'A* 出处', type: 'text', default: 'Hart, Nilsson & Raphael · 1968', maxLength: 50},
    guess: {label: '估计标签', type: 'text', default: 'guess: {t}', maxLength: 30, help: '{t} 换成估计剩余用时'},
    guessRule: {label: '估计算法', type: 'text', default: 'straight line ÷ top speed', maxLength: 40},
    checked: {label: '检查计数', type: 'text', default: '{n} checked', maxLength: 30, help: '{n} 换成实际确定的路口数'},
    same: {label: '同一路线', type: 'text', default: 'same route · {t}', maxLength: 30},
    less: {label: '少做的功', type: 'text', default: '{x}× less work', maxLength: 30},
    rule: {label: '规则', type: 'text', default: 'guess ≤ real time  →  still the fastest route', maxLength: 60},
    splitCue: {label: '分屏卡点词', type: 'text', default: 'A-star', maxLength: 24},
    guessCue: {label: '估计卡点词', type: 'text', default: 'guesses', maxLength: 24},
    speedCue: {label: '直线卡点词', type: 'text', default: 'Straight', maxLength: 24},
    sameCue: {label: '同路线卡点词', type: 'text', default: 'same', maxLength: 24},
    ruleCue: {label: '规则卡点词', type: 'text', default: 'rule', maxLength: 24},
    street: {label: '堵车路名', type: 'text', default: 'Central Ave', maxLength: 30},
    crash: {label: '事故标题', type: 'text', default: 'Crash', maxLength: 24},
    stay: {label: '原路用时', type: 'text', default: 'stay: {t}', maxLength: 30},
    reroute: {label: '新路线用时', type: 'text', default: 'new route: {t}', maxLength: 30},
    saves: {label: '省下', type: 'text', default: 'saves {t}', maxLength: 30},
    crashCue: {label: '事故卡点词', type: 'text', default: 'crash', maxLength: 24},
    blockCue: {label: '变慢卡点词', type: 'text', default: 'block', maxLength: 24},
    againCue: {label: '重搜卡点词', type: 'text', default: 'again', maxLength: 24},
    rerouteCue: {label: '改道卡点词', type: 'text', default: 'rerouting', maxLength: 24},
  },
};

// ---------- 不回头路线：在西南角 → 东北角的 DAG 上按条数加权随机抽样（固定种子），用来画“数不完的路线” ----------
const SW = CITYG.id(0, CITYG.cfg.rows - 1), NE = CITYG.id(CITYG.cfg.cols - 1, 0);
const towardNE = (u: number, v: number) => {const a = P(u), b = P(v); return b.i >= a.i && b.j <= a.j && (b.i > a.i || b.j < a.j);};
const WAYS: number[] = (() => {
  const ways = new Array(CITYG.nodes.length).fill(0);
  ways[NE] = 1;
  const ids = CITYG.nodes.filter((n: any) => n.alive).map((n: any) => n.id).sort((a: number, b: number) => (P(b).i - P(b).j) - (P(a).i - P(a).j));
  for (const v of ids) for (const {to} of CITYG.adj[v]) if (towardNE(v, to)) ways[v] += ways[to];
  ways[NE] = 1;
  return ways;
})();
function ghostRoute(n: number): number[] {
  const r = rand32(4242 + n * 977), path = [SW];
  let v = SW;
  for (let guard = 0; v !== NE && guard < 80; guard++) {
    const next = CITYG.adj[v].filter(({to}: any) => towardNE(v, to) && WAYS[to] > 0);
    const total = next.reduce((s: number, x: any) => s + WAYS[x.to], 0);
    let pick = r() * total;
    for (const x of next) {pick -= WAYS[x.to]; if (pick <= 0) {v = x.to; break;}}
    if (pick > 0) v = next[next.length - 1].to;
    path.push(v);
  }
  return path;
}
// 开场“其他路线”：从起点到家的几条随机不回头路线（同样按条数抽样）。
function ghostHome(n: number): number[] {
  const toward = (u: number, v: number) => {const a = P(u), b = P(v), h = P(TID); return Math.abs(h.i - b.i) + Math.abs(h.j - b.j) < Math.abs(h.i - a.i) + Math.abs(h.j - a.j);};
  const r = rand32(77 + n * 131), path = [SID];
  let v = SID;
  for (let guard = 0; v !== TID && guard < 60; guard++) {
    const next = CITYG.adj[v].filter(({to}: any) => toward(v, to));
    if (!next.length) break;
    v = next[Math.floor(r() * next.length)].to;
    path.push(v);
  }
  return v === TID ? path : AST.path;
}

const FULL = [W / 2, H / 2 - 20, 1];
const ROUTE_VIEW = (() => {const a = P(SID), b = P(TID); return [(a.x + b.x) / 2, (a.y + b.y) / 2 + 20, 1.32];})();

const Frame = ({props, children, t, dur}: any) => <Root props={props} t={t} dur={dur}>{children}</Root>;

/** 开场：倾斜的夜间地图，点“Home”→ 搜索一闪 → 金色路线 → 其他路线淡淡闪过。 */
function Hook(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), pal = palette(props);
  const s0 = start(0, .2), tap = at(txt(props, 'tapCue'), s0 + .5), go = Math.max(tap + .35, at(txt(props, 'routeCue'), tap + .9) - .5);
  const k = AST.settled * sm((t - go) / 1.1), routeP = sm((t - go - 1.0) / .8);
  const ghost = at(txt(props, 'ghostCue'), end(1, go + 3) + .3);
  const tilt = mix(42, 30, sm(t / dur)), cam = lerpCam([ROUTE_VIEW[0], ROUTE_VIEW[1] + 60, 1.25], [ROUTE_VIEW[0], ROUTE_VIEW[1] + 30, 1.4], sm(t / dur));
  const typing = typed(txt(props, 'search'), (t - s0 + .2) / .5);
  const press = sm((t - tap) / .12) * (1 - sm((t - tap - .25) / .3));
  const etaIn = sm((t - go - 1.7) / .35);
  return <Frame props={props} t={t} dur={dur}>
    <div style={{position: 'absolute', inset: -120, transform: `perspective(1900px) rotateX(${tilt}deg)`, transformOrigin: '50% 60%'}}>
      <svg viewBox={`-120 -120 ${W + 240} ${H + 240}`} width={W + 240} height={H + 240} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={camera(cam[0], cam[1], cam[2])}>
          <Terrain />
          <Roads mapness={1} nodes={0} />
          <g opacity={1 - .75 * sm((t - go - 1.6) / .8)}><SearchLayer run={AST} k={k} color={CYAN} labels={false} flow={2} ring={6} /></g>
          {[0, 1, 2, 3, 4, 5].map(n => {
            const a = win(t, ghost + n * .28, ghost + n * .28 + .5, .15);
            return a > 0 && <RoutePath key={n} path={ghostHome(n)} color="#9fb2dd" width={4} opacity={a * .7} />;
          })}
          <RoutePath path={AST.path} p={routeP} color={pal.gold} width={8} />
          <Pin v={SID} kind="you" t={t} label={txt(props, 'you')} gold={pal.gold} scale={1} />
          <g opacity={sm((t - go - 1.4) / .3)}><Pin v={TID} kind="home" t={t} label={txt(props, 'home')} gold={pal.gold} /></g>
        </g>
      </svg>
    </div>
    <div style={{position: 'absolute', left: 120, top: 92, width: 560, height: 84, borderRadius: 42, background: `rgba(14,20,36,${.88 + .1 * press})`,
      border: `2px solid ${press > 0 ? pal.gold : 'rgba(150,170,210,.35)'}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 30px', boxSizing: 'border-box',
      transform: `scale(${1 - .04 * press})`, fontFamily: props.fonts.text, opacity: sm((t - .05) / .3)}}>
      <svg width={34} height={34} viewBox="0 0 34 34"><circle cx={14} cy={14} r={10} fill="none" stroke={pal.muted} strokeWidth={4} /><line x1={22} y1={22} x2={31} y2={31} stroke={pal.muted} strokeWidth={4} strokeLinecap="round" /></svg>
      <span style={{fontSize: 38, color: pal.text, fontWeight: 700}}>{typing}<span style={{opacity: t < tap ? (Math.floor(t * 2.5) % 2) : 0, color: pal.gold}}>|</span></span>
    </div>
    {press > 0 && <div style={{position: 'absolute', left: 560 - 60 * press, top: 134 - 60 * press, width: 120 * press, height: 120 * press, borderRadius: '50%', border: `3px solid ${pal.gold}`, opacity: 1 - press * .6}} />}
    <div style={{position: 'absolute', right: 120, top: 92, opacity: etaIn, transform: `translateY(${(1 - etaIn) * 20}px)`, fontFamily: props.fonts.text,
      background: 'rgba(14,20,36,.9)', borderRadius: 24, padding: '16px 30px', border: `2px solid ${pal.gold}88`}}>
      <span style={{fontSize: 44, fontWeight: 800, color: pal.gold, fontFamily: MONO}}>{fmt(txt(props, 'eta'), {t: fmt(txt(props, 'etaMinutes'), {n: Math.round(AST.minutes)})})}</span>
    </div>
  </Frame>;
}

/** 城市变成图：地图 → 节点与边 → 推近看权重 → 拉远数路线。 */
function Graph(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), pal = palette(props);
  const nodesAt = at(txt(props, 'nodesCue'), start(1, 2)), edgesAt = at(txt(props, 'edgesCue'), nodesAt + 1.3);
  const weightAt = at(txt(props, 'weightCue'), start(3, edgesAt + 1.2)), cornerAt = at(txt(props, 'cornerCue'), start(4, weightAt + 3));
  const realAt = at(txt(props, 'realCue'), start(5, cornerAt + 2.5)), hopeless = at(txt(props, 'hopelessCue'), start(6, realAt + 2));
  const nodesP = sm((t - nodesAt + .1) / .8), mapness = 1 - sm((t - edgesAt + .1) / .7);
  const zoomIn = sm((t - weightAt + .3) / 1.0) * (1 - sm((t - cornerAt + .4) / .9));
  const near = [P(SID).x + 190, P(SID).y - 70, 2.35];
  const cam = lerpCam(FULL, near, zoomIn);
  const labelsP = sm((t - weightAt - .3) / .5) * (1 - sm((t - cornerAt + .6) / .4));
  const kinds = win(t, end(3, weightAt + 2) - .2, cornerAt - .4, .3);
  const viewL = cam[0] - W / 2 / cam[2], viewR = cam[0] + W / 2 / cam[2], viewT = cam[1] - H / 2 / cam[2], viewB = cam[1] + H / 2 / cam[2];
  const ghostIdx = Math.floor((t - cornerAt) / .11);
  const roll = sm((t - cornerAt) / 1.6), routesText = txt(props, 'routes'), digits = routesText.replace(/\D/g, '');
  const rolled = digits ? Math.round(Number(digits) * roll * roll).toLocaleString('en-US') : routesText;
  const big = sm((t - realAt - .2) / .3), checkP = sm((t - hopeless + .2) / .4);
  const pct = (1e-15 * Math.max(0, t - hopeless) * 3).toFixed(17).replace(/0+$/, '');
  return <Frame props={props} t={t} dur={dur}>
    <Svg><g transform={camera(cam[0], cam[1], cam[2])}>
      <Terrain opacity={.4 + .6 * mapness} />
      <Roads mapness={mapness} nodes={nodesP} dim={1 - .45 * sm((t - cornerAt) / .5)} highlightKinds={kinds} />
      {labelsP > 0 && CITYG.edges.map((e: any) => {
        const a = P(e.a), b = P(e.b), x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
        if (x < viewL - 20 || x > viewR + 20 || y < viewT - 20 || y > viewB + 20) return null;
        const r = Math.hypot(x - near[0], y - near[1]) / CITYG.cfg.gap, fadeR = 1 - sm((r - 3.2) / 1.2);
        if (fadeR <= 0) return null;
        const fast = e.kind !== 'street', vertical = Math.abs(a.x - b.x) < Math.abs(a.y - b.y);
        const emph = fast ? 1 : 1 - .45 * kinds;
        return <g key={e.id} opacity={labelsP * emph * fadeR}>
          <rect x={x - (vertical ? 1 : 16)} y={y - 9} width={vertical ? 34 : 32} height={17} rx={4} fill={pal.bg} opacity={.85} transform={vertical ? 'translate(2 0)' : undefined} />
          <text x={vertical ? x + 18 : x} y={y + 5} textAnchor="middle" fontFamily={MONO} fontSize={14} fontWeight={700}
            fill={fast ? (kinds > .1 ? '#8fd3ff' : '#c9d6f2') : (kinds > .1 ? '#9aa6c0' : '#c9d6f2')}>{secs(e.minutes)}</text>
        </g>;
      })}
      {Array.from({length: 7}, (_, j) => {
        const n = ghostIdx - j;
        if (t < cornerAt || n < 0) return null;
        const a = (1 - j / 7) * (1 - sm((t - hopeless - .6) / .6) * .7);
        return <RoutePath key={n} path={ghostRoute(n)} color={j === 0 ? pal.gold : '#7fb6ff'} width={j === 0 ? 5 : 3} opacity={a * .85} />;
      })}
      {t > cornerAt - .2 && <><Pin v={SW} kind="you" t={t} gold={pal.gold} /><Pin v={NE} kind="home" t={t} gold={pal.gold} /></>}
    </g></Svg>
    {[[txt(props, 'nodesText'), nodesAt], [txt(props, 'edgesText'), edgesAt], [txt(props, 'weightText'), weightAt]].map(([label, when], i) => {
      const a = sm((t - (when as number) - .1) / .35) * (1 - sm((t - cornerAt + .5) / .4));
      return a > 0 && <div key={i} style={{position: 'absolute', left: 120, top: 100 + i * 70, fontFamily: MONO, fontSize: 34, fontWeight: 700, color: i === 2 ? pal.gold : pal.text,
        opacity: a, transform: `translateX(${(1 - a) * -30}px)`, background: 'rgba(6,10,20,.78)', padding: '8px 18px', borderRadius: 10}}>{label}</div>;
    })}
    {kinds > 0 && <div style={{position: 'absolute', right: 120, top: 100, fontFamily: props.fonts.text, fontSize: 30, fontWeight: 700, opacity: kinds, textAlign: 'right',
      background: 'rgba(6,10,20,.78)', padding: '10px 20px', borderRadius: 10, lineHeight: 1.5}}>
      <div style={{color: '#8fd3ff'}}>━━ {txt(props, 'fastText')}</div><div style={{color: '#9aa6c0'}}>── {txt(props, 'slowText')}</div></div>}
    <Card x={W / 2 - 430} y={330} w={860} align="center" fonts={props.fonts} color={pal.gold} big={92}
      opacity={sm((t - cornerAt) / .3) * (1 - sm((t - realAt + .05) / .2))} value={rolled} note={txt(props, 'routesNote')} />
    <Card x={W / 2 - 560} y={330} w={1120} align="center" fonts={props.fonts} color={RED} big={84}
      opacity={big} value={txt(props, 'bigRoutes')} note={txt(props, 'bigNote')} />
    {checkP > 0 && <div style={{position: 'absolute', left: W / 2 - 460, top: 600, width: 920, opacity: checkP, fontFamily: props.fonts.text, background: 'rgba(6,10,20,.85)', borderRadius: 14, padding: '14px 30px 20px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', color: pal.text, fontSize: 28, marginBottom: 10}}><span>{txt(props, 'checking')}</span><span style={{fontFamily: MONO}}>{pct}%</span></div>
      <div style={{height: 16, borderRadius: 8, background: 'rgba(255,255,255,.12)'}}><div style={{width: 3, height: 16, borderRadius: 8, background: RED}} /></div>
    </div>}
  </Frame>;
}

/** Dijkstra 水波：从你家门口一圈圈往外，每个路口标出确定那一刻的最短用时；碰到“家”就停，沿来路找回整条路线。 */
function Ripple(props: SceneInput) {
  const {t, at, start, dur} = cues(props), pal = palette(props);
  const t0 = start(0, .2) + .15, tHome = Math.max(t0 + 3, at(txt(props, 'homeCue'), start(1, dur - 3)) + .15);
  const u = clamp((t - t0) / (tHome - t0)), k = DIJ.settled * Math.pow(u, 1.75);
  const done = t >= tHome, back = sm((t - tHome - .05) / 1.0);
  const proven = sm((t - at(txt(props, 'provenCue'), tHome + 1.2) + .1) / .3);
  const cam = lerpCam([P(SID).x + 60, P(SID).y - 20, 2.0], [W / 2, H / 2, 1.0], sm(Math.pow(u, .8) * 1.15));
  const reversed = DIJ.path.slice().reverse();
  return <Frame props={props} t={t} dur={dur}>
    <Svg><g transform={camera(cam[0], cam[1], cam[2])}>
      <Terrain opacity={.45} />
      <Roads dim={.8} />
      <SearchLayer run={DIJ} k={Math.min(k, DIJ.settled)} labels scale={cam[2]} gmax={DIJ.minutes * 1.05} />
      <RoutePath path={reversed} p={back} color={pal.gold} width={7 / Math.sqrt(cam[2])} />
      <Pin v={SID} kind="you" t={t} gold={pal.gold} scale={Math.sqrt(cam[2])} />
      <Pin v={TID} kind="home" t={t} gold={pal.gold} scale={Math.sqrt(cam[2])} />
    </g></Svg>
    <Card x={110} y={80} w={380} fonts={props.fonts} color={CYAN} title={txt(props, 'dijkstra')} value={String(Math.min(DIJ.settled, Math.floor(k)))}
      note={txt(props, 'settled')} opacity={sm((t - t0 + .3) / .3)} />
    <QueuePanel run={DIJ} k={Math.min(k, DIJ.settled)} x={W - 110 - 330} y={80} title={txt(props, 'queue')} nextLabel={txt(props, 'next')} fonts={props.fonts}
      opacity={sm((t - t0) / .3) * (1 - sm((t - tHome) / .3))} name={(v: number) => `${P(v).i},${P(v).j}`} />
    {done && <div style={{position: 'absolute', right: 110, top: 80, opacity: back, fontFamily: props.fonts.text, background: 'rgba(6,10,20,.85)',
      border: `2px solid ${pal.gold}`, borderRadius: 18, padding: '16px 28px', fontSize: 44, fontWeight: 800, color: pal.gold}}>
      <span style={{fontFamily: MONO}}>{fmt(txt(props, 'proven'), {t: mmss(DIJ.minutes)})}</span>
      <span style={{display: 'inline-block', marginLeft: 16, transform: `scale(${1 + .5 * (1 - proven)})`, opacity: proven}}>✓</span></div>}
  </Frame>;
}

/** 分屏的一半：同一座城缩小放进 (x, y, scale) 的框里。 */
function Panel({x, y, s, children, border}: any) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs><clipPath id={`clip-${x}`}><rect x={0} y={0} width={W} height={H} rx={30} /></clipPath></defs>
    <rect x={0} y={0} width={W} height={H} rx={30} fill="rgba(10,16,30,.9)" stroke={border} strokeWidth={4} />
    <g clipPath={`url(#clip-${x})`}>{children}</g>
  </g>;
}

/** A*：先看 Dijkstra 白跑的那一大片，再分屏同速对比（实际计数），最后讲“不高估”的规则。 */
function AStar(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), pal = palette(props);
  const wrongAt = at(txt(props, 'wrongCue'), start(0, .2) + 1.2), split = at(txt(props, 'splitCue'), start(1, 3)) - .1;
  const guessAt = at(txt(props, 'guessCue'), start(2, split + 3)), speedAt = at(txt(props, 'speedCue'), start(3, guessAt + 2.5));
  const raceA = speedAt + .35, raceB = Math.max(raceA + 2.5, end(4, raceA + 3) - .1);
  const sameAt = at(txt(props, 'sameCue'), start(5, raceB + 1.5)), ruleAt = at(txt(props, 'ruleCue'), start(6, sameAt + 2));
  const rate = DIJ.settled / (raceB - raceA), kr = Math.max(0, (t - raceA) * rate);
  const sp = sm((t - split) / .7);
  const home = P(TID), st = P(SID), startDist = Math.hypot(st.x - home.x, st.y - home.y);
  const h0 = Math.hypot(st.x - home.x, st.y - home.y) * CITYG.cfg.mpp / CITYG.vmax;
  // 单图（分屏之前）：Dijkstra 全部确定的样子，“背离家的方向”的路口染红。
  const wrongP = sm((t - wrongAt) / .5);
  const single = <g opacity={1 - sp}>
    <Terrain opacity={.4} /><Roads dim={.7} />
    <SearchLayer run={DIJ} k={DIJ.settled} labels={false} gmax={DIJ.minutes * 1.05} ring={0.001} />
    {wrongP > 0 && DIJ.order.map((v: number) => {
      const p = P(v);
      return Math.hypot(p.x - home.x, p.y - home.y) > startDist + 40 && <circle key={v} cx={p.x} cy={p.y} r={10} fill={RED} opacity={.55 * wrongP} />;
    })}
    <RoutePath path={DIJ.path} color={pal.gold} width={7} />
    <Pin v={SID} kind="you" t={t} gold={pal.gold} /><Pin v={TID} kind="home" t={t} gold={pal.gold} />
  </g>;
  const s = .48, LX = 22, RX = W - 22 - W * s, PY = 175;
  const kd = Math.min(DIJ.settled, kr), ka = Math.min(AST.settled, kr);
  const doneD = kr >= DIJ.settled, doneA = kr >= AST.settled;
  const guessP = win(t, guessAt, raceB - .2, .3), ruleP = sm((t - speedAt) / .3) * (1 - sm((t - raceB + .2) / .3));
  const sameP = sm((t - sameAt + .1) / .4), ruleCard = sm((t - ruleAt) / .4);
  const ratio = (DIJ.settled / AST.settled).toFixed(1);
  return <Frame props={props} t={t} dur={dur}>
    <Svg>
      {sp < 1 && single}
      {sp > 0 && <g opacity={sp}>
        <Panel x={LX} y={PY} s={s} border={`${CYAN}66`}>
          <Terrain opacity={.4} /><Roads dim={.9} width={2.2} />
          <SearchLayer run={DIJ} k={kd} color={CYAN} labels={false} scale={s} ring={8} />
          {doneD && <RoutePath path={DIJ.path} p={sm((t - raceB) / .5)} color={pal.gold} width={9} />}
          <Pin v={SID} kind="you" t={t} gold={pal.gold} scale={.7} /><Pin v={TID} kind="home" t={t} gold={pal.gold} scale={.7} />
        </Panel>
        <Panel x={RX} y={PY} s={s} border={`${MAGENTA}66`}>
          <Terrain opacity={.4} /><Roads dim={.9} width={2.2} />
          <SearchLayer run={AST} k={ka} color={MAGENTA} labels={false} scale={s} ring={8} />
          {doneA && <RoutePath path={AST.path} p={sm((t - raceA - AST.settled / rate) / .5)} color={pal.gold} width={9} />}
          {guessP > 0 && <g opacity={guessP}>
            <line x1={st.x} y1={st.y} x2={home.x} y2={home.y} stroke={MAGENTA} strokeWidth={5} strokeDasharray="16 12" />
            <text x={(st.x + home.x) / 2} y={(st.y + home.y) / 2 - 26} textAnchor="middle" fontFamily={MONO} fontSize={44} fontWeight={800} fill="#ffd1ea">
              {fmt(txt(props, 'guess'), {t: mmss(h0)})}</text>
          </g>}
          <Pin v={SID} kind="you" t={t} gold={pal.gold} scale={.7} /><Pin v={TID} kind="home" t={t} gold={pal.gold} scale={.7} />
        </Panel>
      </g>}
    </Svg>
    {wrongP > 0 && sp < 1 && <div style={{position: 'absolute', left: 120, top: 96, opacity: wrongP * (1 - sp), fontFamily: props.fonts.text, fontSize: 36, fontWeight: 800,
      color: RED, background: 'rgba(6,10,20,.8)', padding: '10px 22px', borderRadius: 12}}>● {txt(props, 'wrong')}</div>}
    {sp > 0 && <>
      <div style={{position: 'absolute', left: LX, width: W * s, top: 96, textAlign: 'center', fontFamily: props.fonts.text, opacity: sp}}>
        <span style={{fontSize: 46, fontWeight: 800, color: CYAN}}>{txt(props, 'dijkstra')}</span><span style={{fontSize: 24, color: pal.muted, marginLeft: 14}}>1959</span></div>
      <div style={{position: 'absolute', left: RX, width: W * s, top: 96, textAlign: 'center', fontFamily: props.fonts.text, opacity: sp}}>
        <span style={{fontSize: 46, fontWeight: 800, color: MAGENTA}}>{txt(props, 'astar')}</span><span style={{fontSize: 24, color: pal.muted, marginLeft: 14}}>{txt(props, 'astarCredit')}</span></div>
      {[[LX, kd, DIJ, CYAN, doneD], [RX, ka, AST, MAGENTA, doneA]].map(([x, kk, run, c, fin]: any, i) =>
        <div key={i} style={{position: 'absolute', left: x, width: W * s, top: PY + H * s + 22, textAlign: 'center', fontFamily: MONO, opacity: sp * sm((t - raceA + .4) / .3)}}>
          <span style={{fontSize: 54, fontWeight: 800, color: fin ? '#fff' : c, ...(/[\u2E80-\u9FFF]/.test(txt(props, 'checked')) ? {lineHeight: 1.1} : {})}}>{fmt(txt(props, 'checked'), {n: Math.floor(kk)})}</span>
          {sameP > 0 && <div style={{fontSize: 32, color: pal.gold, opacity: sameP, marginTop: 4, fontWeight: 700, ...(/[\u2E80-\u9FFF]/.test(txt(props, 'same')) ? {lineHeight: 1.1, marginTop: 0} : {})}}>{fmt(txt(props, 'same'), {t: mmss(run.minutes)})}</div>}
        </div>)}
      {sameP > 0 && <div style={{position: 'absolute', left: W / 2 - 150, top: PY + H * s + 26, width: 300, textAlign: 'center', fontFamily: props.fonts.text, opacity: sameP,
        transform: `scale(${.8 + .2 * sameP})`, background: pal.gold, color: '#14100a', borderRadius: 20, padding: '14px 8px', fontSize: 34, fontWeight: 900}}>
        {fmt(txt(props, 'less'), {x: ratio})}</div>}
      {ruleP > 0 && <div style={{position: 'absolute', left: RX, width: W * s, top: PY + H * s - 70, textAlign: 'center', opacity: ruleP, fontFamily: MONO, fontSize: 28, color: '#ffd1ea'}}>
        {txt(props, 'guessRule')}</div>}
      {ruleCard > 0 && <div style={{position: 'absolute', left: W / 2 - 520, width: 1040, top: 816, textAlign: 'center', opacity: ruleCard, fontFamily: MONO, fontSize: 34, fontWeight: 700,
        color: pal.text, background: 'rgba(6,10,20,.88)', border: `2px solid ${MAGENTA}88`, borderRadius: 14, padding: '10px 0'}}>{txt(props, 'rule')}</div>}
    </>}
  </Frame>;
}

/** 堵车：一段路变红、权重变大，同一问题新数字，再搜一次绕过去。 */
function Traffic(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), pal = palette(props);
  const crashAt = at(txt(props, 'crashCue'), start(0, .2) + .8), blockAt = at(txt(props, 'blockCue'), start(1, crashAt + 1.5));
  const againAt = at(txt(props, 'againCue'), start(2, blockAt + 2)), rerouteAt = at(txt(props, 'rerouteCue'), start(3, againAt + 2));
  const cam = ROUTE_VIEW;
  const a = P(JAM.a), b = P(JAM.b), jx = (a.x + b.x) / 2, jy = (a.y + b.y) / 2;
  const crash = sm((t - crashAt) / .25), heavy = sm((t - blockAt) / .5);
  const ks = RE.settled * sm((t - againAt - .1) / 1.3), newP = sm((t - againAt - 1.3) / .8);
  const pulse = .5 + .5 * Math.sin(t * 9);
  const w = mix(JAM.minutes, JAM.minutes * ROUTE.jamFactor, heavy);
  const jamIdx = AST.pathEdges.indexOf(JAM.id);
  const after = AST.path.slice(jamIdx);
  const etaOld = mix(AST.minutes, OLD_JAMMED, heavy);
  const reIn = sm((t - rerouteAt + .2) / .4);
  return <Frame props={props} t={t} dur={dur}>
    <Svg><g transform={camera(cam[0], cam[1], cam[2])}>
      <Terrain opacity={.5} /><Roads dim={.85} />
      <text x={P(CITYG.id(11, 6)).x} y={P(CITYG.id(11, 6)).y + 30} fontFamily={props.fonts.text} fontSize={20} fontWeight={700} fill="#7f96c8" letterSpacing={3}>{txt(props, 'street').toUpperCase()}</text>
      <g opacity={1 - .75 * newP}>
        <RoutePath path={AST.path} color={pal.gold} width={7} opacity={1 - heavy * .4} />
        {heavy > 0 && <RoutePath path={after} color={RED} width={7} opacity={heavy * .8} dashed={newP > 0} />}
      </g>
      {t > againAt && <g opacity={1 - .7 * newP}><SearchLayer run={RE} k={ks} color={MAGENTA} labels={false} scale={cam[2]} flow={2} ring={5} weight={jamWeight} /></g>}
      <RoutePath path={RE.path} p={newP} color={pal.gold} width={8} />
      {crash > 0 && <g transform={`translate(${jx} ${jy})`}>
        <line x1={a.x - jx} y1={a.y - jy} x2={b.x - jx} y2={b.y - jy} stroke={RED} strokeWidth={11} strokeLinecap="round" opacity={.7 + .3 * pulse} />
        <circle r={40 + 16 * pulse} fill={RED} opacity={.18 * crash} />
        <g transform={`translate(0 -58) scale(${crash})`}>
          <path d="M0 -26 L25 18 L-25 18 Z" fill={RED} stroke="#fff" strokeWidth={3} strokeLinejoin="round" />
          <rect x={-2.5} y={-12} width={5} height={16} fill="#fff" /><circle cy={10} r={3} fill="#fff" />
        </g>
        {heavy > 0 && <g transform="translate(46 4)" opacity={heavy}>
          <rect x={0} y={-22} width={150} height={40} rx={8} fill="rgba(6,10,20,.92)" stroke={RED} strokeWidth={2} />
          <text x={75} y={6} textAnchor="middle" fontFamily={MONO} fontSize={24} fontWeight={800} fill="#ffd0d0">{mmss(w)}</text>
        </g>}
      </g>}
      <Pin v={SID} kind="you" t={t} gold={pal.gold} label={txt(props, 'you')} scale={1.15} />
      <Pin v={TID} kind="home" t={t} gold={pal.gold} label={txt(props, 'home')} scale={1.15} />
    </g></Svg>
    <Card x={110} y={80} w={420} fonts={props.fonts} color={RED} title={`${txt(props, 'crash')} · ${txt(props, 'street')}`}
      value={heavy > 0 ? `${mmss(JAM.minutes)} → ${mmss(w)}` : mmss(JAM.minutes)} big={52} opacity={crash} />
    <div style={{position: 'absolute', right: 110, top: 80, fontFamily: MONO, textAlign: 'right', background: 'rgba(6,10,20,.85)', borderRadius: 18, padding: '16px 26px',
      border: `2px solid ${pal.gold}77`, opacity: sm((t - .1) / .3)}}>
      <div style={{fontSize: 40, fontWeight: 800, color: heavy > 0 ? (newP > 0 ? 'rgba(255,190,190,.55)' : '#ffb0b0') : pal.gold, textDecoration: newP > .5 ? 'line-through' : 'none'}}>
        {fmt(txt(props, 'stay'), {t: mmss(etaOld)})}</div>
      {newP > 0 && <div style={{fontSize: 48, fontWeight: 800, color: pal.gold, opacity: newP, marginTop: 6}}>{fmt(txt(props, 'reroute'), {t: mmss(RE.minutes)})}</div>}
      {reIn > 0 && <div style={{fontSize: 28, color: GREEN, opacity: reIn, marginTop: 4}}>{fmt(txt(props, 'saves'), {t: mmss(OLD_JAMMED - RE.minutes)})}</div>}
    </div>
  </Frame>;
}

export default function RouteCity(props: SceneInput) {
  const mode = String(props.params.mode ?? 'ripple');
  if (mode === 'hook') return <Hook {...props} />;
  if (mode === 'graph') return <Graph {...props} />;
  if (mode === 'astar') return <AStar {...props} />;
  if (mode === 'traffic') return <Traffic {...props} />;
  return <Ripple {...props} />;
}
