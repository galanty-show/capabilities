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

// 三用：title 片名（路网按 Dijkstra 的先后一圈圈亮起）；scale 拉远到大陆尺度的光点网络与“捷径”示意；credit 收尾（伪代码 + 实际数字）。
export const meta = {
  params: {
    mode: {label: '用法', type: 'select', options: [{value: 'title', label: '片名'}, {value: 'scale', label: '拉远到大陆'}, {value: 'credit', label: '收尾'}]},
    title1: {label: '片名第一行', type: 'text', default: 'How Your Map Finds', maxLength: 40},
    title2: {label: '片名第二行', type: 'text', default: 'the Fastest Way Home', maxLength: 40},
    subtitle: {label: '副标题', type: 'text', default: 'Dijkstra · A* · and a little traffic', maxLength: 60},
    nodes: {label: '大陆路口数', type: 'text', default: '18,000,000+', maxLength: 30},
    nodesNote: {label: '路口数说明', type: 'text', default: 'intersections in the Western Europe road graph', maxLength: 60},
    shortcuts: {label: '捷径标题', type: 'text', default: 'Contraction hierarchies', maxLength: 40},
    shortcutsNote: {label: '捷径说明', type: 'text', default: 'precomputed shortcuts · Geisberger et al., 2008', maxLength: 60},
    query: {label: '查询用时', type: 'text', default: '< 1 ms', maxLength: 20},
    queryNote: {label: '查询说明', type: 'text', default: 'one query across Western Europe', maxLength: 60},
    schematic: {label: '示意标注', type: 'text', default: 'shortcut arcs: schematic', maxLength: 40},
    millionsCue: {label: '路口数卡点词', type: 'text', default: 'millions', maxLength: 24},
    shortcutCue: {label: '捷径卡点词', type: 'text', default: 'shortcuts', maxLength: 24},
    chCue: {label: '名称卡点词', type: 'text', default: 'contraction', maxLength: 24},
    queryCue: {label: '查询卡点词', type: 'text', default: 'Europe', maxLength: 24},
    msCue: {label: '毫秒卡点词', type: 'text', default: 'millisecond', maxLength: 24},
    code: {label: '伪代码', type: 'list', min: 6, max: 6, maxLength: 40,
      default: ['dist[you] = 0', 'while home is not visited:', '  u = closest unvisited', '  visit u', '  for each road u→v:', '    dist[v] = min(dist[v], dist[u] + w)']},
    tagline: {label: '结语', type: 'text', default: 'Closest first. Since 1956.', maxLength: 40},
    stats: {label: '实际数字', type: 'text', default: '{nodes} intersections · {edges} roads · seed {seed}', maxLength: 70},
    runs: {label: '本片实跑', type: 'text', default: 'Dijkstra: {d} checked · A*: {a} checked · same {t} route', maxLength: 80},
    codeCue: {label: '代码卡点词', type: 'text', default: 'code', maxLength: 24},
    ranCue: {label: '实跑卡点词', type: 'text', default: 'ran', maxLength: 24},
  },
};

// ---------- 大陆：几十座城（抖动网格）+ 公路，全部固定种子生成 ----------
const CONT: any = (() => {
  const r = rand32(1959), cx = 2600, cy = 300;
  const inside = (x: number, y: number) => {
    const th = Math.atan2((y - cy) / 8200, (x - cx) / 15500), rr = Math.hypot((x - cx) / 15500, (y - cy) / 8200);
    return rr < 1 + .16 * Math.sin(3 * th + 1) + .09 * Math.sin(5 * th + 2) - .1;
  };
  const cities = [{x: 960, y: 540, n: 0, side: 0}];
  for (let tries = 0; cities.length < 42 && tries < 4000; tries++) {
    const x = cx + (r() * 2 - 1) * 16000, y = cy + (r() * 2 - 1) * 9000;
    if (!inside(x, y) || cities.some(c => Math.hypot(c.x - x, c.y - y) < 2300)) continue;
    const n = Math.floor(30 + r() * r() * 650);
    cities.push({x, y, n, side: Math.ceil(Math.sqrt(n))});
  }
  const dots: number[] = [], lines: number[] = [];
  cities.forEach((c, k) => {
    if (k === 0) return;
    const side = c.side, gap = 66, ox = c.x - side * gap / 2, oy = c.y - side * gap / 2, pts: number[][] = [];
    for (let j = 0; j < side; j++) for (let i = 0; i < side; i++) {
      const dx = i - side / 2 + .5, dy = j - side / 2 + .5;
      if (Math.hypot(dx, dy) > side / 2 * (.75 + .3 * r())) {pts.push([]); continue;}
      const p = [ox + i * gap + (r() - .5) * 22, oy + j * gap + (r() - .5) * 22];
      pts.push(p); dots.push(p[0], p[1]);
    }
    for (let j = 0; j < side; j++) for (let i = 0; i < side; i++) {
      const p = pts[j * side + i];
      if (!p.length) continue;
      const right = i + 1 < side ? pts[j * side + i + 1] : [], down = j + 1 < side ? pts[(j + 1) * side + i] : [];
      if (right.length) lines.push(p[0], p[1], right[0], right[1]);
      if (down.length) lines.push(p[0], p[1], down[0], down[1]);
    }
  });
  // 公路：每座城连最近的两座（去重），沿路撒小镇光点。
  const links: number[][] = [];
  cities.forEach((a, i) => {
    const near = cities.map((b, j) => [Math.hypot(a.x - b.x, a.y - b.y), j]).filter(([, j]) => j !== i).sort((p, q) => p[0] - q[0]).slice(0, 2);
    for (const [, j] of near) if (!links.some(([p, q]) => (p === i && q === j) || (p === j && q === i))) links.push([i, j]);
  });
  const roadDots: number[] = [];
  for (const [i, j] of links) {
    const a = cities[i], b = cities[j], len = Math.hypot(a.x - b.x, a.y - b.y);
    for (let s = 0; s < len; s += 260) {const f = s / len; roadDots.push(mix(a.x, b.x, f) + (r() - .5) * 120, mix(a.y, b.y, f) + (r() - .5) * 120);}
  }
  // 捷径示意：按城市大小分层，小城连近邻（1 层），大城之间（2 层），四座最大的城之间（3 层）。
  const order = cities.map((c, i) => [i === 0 ? 300 : c.n, i]).sort((p, q) => q[0] - p[0]).map(([, i]) => i);
  const hubs2 = order.slice(0, 12), hubs3 = order.slice(0, 4);
  const arcs: number[][] = links.map(([i, j]) => [i, j, 1]);
  hubs2.forEach(i => hubs2.filter(j => j > i && Math.hypot(cities[i].x - cities[j].x, cities[i].y - cities[j].y) < 11000).forEach(j => arcs.push([i, j, 2])));
  hubs3.forEach(i => hubs3.filter(j => j > i).forEach(j => arcs.push([i, j, 3])));
  const west = cities.reduce((m, c, i) => c.x < cities[m].x && c.n > 80 ? i : m, 1);
  const east = cities.reduce((m, c, i) => c.x > cities[m].x && c.n > 80 ? i : m, 1);
  const hubOf = (i: number) => hubs2.slice().sort((p, q) => Math.hypot(cities[p].x - cities[i].x, cities[p].y - cities[i].y) - Math.hypot(cities[q].x - cities[i].x, cities[q].y - cities[i].y))[0];
  const topOf = (i: number) => hubs3.slice().sort((p, q) => Math.hypot(cities[p].x - cities[i].x, cities[p].y - cities[i].y) - Math.hypot(cities[q].x - cities[i].x, cities[q].y - cities[i].y))[0];
  const climb = [west, hubOf(west), topOf(west), topOf(east), hubOf(east), east].filter((v, i, a) => i === 0 || v !== a[i - 1]);
  return {cities, dots, lines, roadDots, arcs, climb, center: [cx, cy]};
})();
const FULLD = search(CITYG, SID, TID, {stopAtTarget: false});

/** 曲线捷径（二次贝塞尔，向上拱起，按层抬高），p 为画出的比例。 */
function arcPath(a: any, b: any, level: number, p: number, z: number, ox: number, oy: number) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, len = Math.hypot(a.x - b.x, a.y - b.y);
  const lift = len * (.12 + .08 * level);
  const pts: number[][] = [];
  const steps = 24;
  for (let s = 0; s <= steps * clamp(p); s++) {
    const u = s / steps, x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mx + u * u * b.x, y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * (my - lift) + u * u * b.y;
    pts.push([(x - ox) * z + W / 2, (y - oy) * z + H / 2]);
  }
  return pts;
}

function Scale(props: SceneInput) {
  const {t, at, start, dur} = cues(props), pal = palette(props);
  const zoomA = start(0, .2) - .1, zoomB = Math.max(zoomA + 3.2, at(txt(props, 'millionsCue'), 1) + .2);
  const shortcutAt = at(txt(props, 'shortcutCue'), start(2, zoomB + 3)), chAt = at(txt(props, 'chCue'), start(3, shortcutAt + 2));
  const queryAt = at(txt(props, 'queryCue'), start(4, chAt + 2)), msAt = at(txt(props, 'msCue'), queryAt + 1.2);
  const p = easeInOut(clamp((t - zoomA) / (zoomB - zoomA)));
  const z0 = 1, z1 = .056, z = z0 * Math.pow(z1 / z0, p);
  const c0 = [W / 2, H / 2], c1 = CONT.center;
  const w = (1 / z - 1 / z0) / (1 / z1 - 1 / z0);
  const ox = mix(c0[0], c1[0], w) + 600 * sm(t - zoomB) * 0, oy = mix(c0[1], c1[1], w);
  const arcsP = [1, 2, 3].map(l => sm((t - shortcutAt - (l - 1) * .55) / .8));
  const climbP = clamp((t - queryAt + .1) / 1.4), msP = sm((t - msAt) / .3);
  const ref = useCanvas(props.frame, (c) => {
    const X = (x: number) => (x - ox) * z + W / 2, Y = (y: number) => (y - oy) * z + H / 2;
    c.globalCompositeOperation = 'lighter';
    // 其他城市：网格线 + 路口光点
    c.lineWidth = Math.max(.6, 1.4 * z);
    c.strokeStyle = `rgba(90,150,255,${clamp(.08 + .5 * z)})`;
    c.beginPath();
    const L = CONT.lines;
    for (let i = 0; i < L.length; i += 4) {c.moveTo(X(L[i]), Y(L[i + 1])); c.lineTo(X(L[i + 2]), Y(L[i + 3]));}
    c.stroke();
    const ds = Math.max(1.6, 5 * z);
    c.fillStyle = 'rgba(140,200,255,.75)';
    const D = CONT.dots;
    for (let i = 0; i < D.length; i += 2) c.fillRect(X(D[i]) - ds / 2, Y(D[i + 1]) - ds / 2, ds, ds);
    c.fillStyle = 'rgba(255,200,120,.45)';
    const R = CONT.roadDots;
    for (let i = 0; i < R.length; i += 2) c.fillRect(X(R[i]) - 1, Y(R[i + 1]) - 1, 2, 2);
    // 公路
    c.strokeStyle = `rgba(255,190,110,${.18 + .2 * p + .3 * arcsP[0]})`;
    c.lineWidth = 1.6 + 1.2 * arcsP[0];
    c.beginPath();
    for (const [i, j] of CONT.arcs.filter((a: number[]) => a[2] === 1)) {const a = CONT.cities[i], b = CONT.cities[j]; c.moveTo(X(a.x), Y(a.y)); c.lineTo(X(b.x), Y(b.y));}
    c.stroke();
    // 我们的城：边 + 路口，金色路线
    c.strokeStyle = 'rgba(80,120,190,.9)';
    c.lineWidth = Math.max(.8, 2 * z);
    c.beginPath();
    for (const e of CITYG.edges) {const a = P(e.a), b = P(e.b); c.moveTo(X(a.x), Y(a.y)); c.lineTo(X(b.x), Y(b.y));}
    c.stroke();
    c.fillStyle = 'rgba(69,216,255,.95)';
    const ns = Math.max(1.8, 9 * z);
    for (const n of CITYG.nodes) if (n.alive) c.fillRect(X(n.x) - ns / 2, Y(n.y) - ns / 2, ns, ns);
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = pal.gold; c.lineWidth = Math.max(2.5, 8 * z); c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath();
    AST.path.forEach((v: number, i: number) => {const q = P(v); if (i) c.lineTo(X(q.x), Y(q.y)); else c.moveTo(X(q.x), Y(q.y));});
    c.stroke();
    // 捷径（示意）：分三层拱起
    const colors = ['', 'rgba(255,215,94,.40)', 'rgba(255,200,110,.45)', 'rgba(255,120,190,.7)'];
    for (const [i, j, level] of CONT.arcs) {
      const pr = arcsP[level - 1];
      if (pr <= 0 || level === 1) continue;
      const pts = arcPath(CONT.cities[i], CONT.cities[j], level, pr, z, ox, oy);
      c.strokeStyle = colors[level]; c.lineWidth = level === 3 ? 3 : level === 2 ? 2.2 : 1.4;
      c.beginPath(); pts.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke();
    }
    // 查询：从西边一城往上爬到大城、走顶层捷径、再落到东边一城
    if (climbP > 0) {
      const hops = CONT.climb.length - 1;
      for (let k = 0; k < hops; k++) {
        const f = clamp(climbP * hops - k);
        if (f <= 0) continue;
        const a = CONT.cities[CONT.climb[k]], b = CONT.cities[CONT.climb[k + 1]];
        const pts = arcPath(a, b, 2, f, z, ox, oy);
        c.strokeStyle = '#ffffff'; c.lineWidth = 5;
        c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke();
        c.strokeStyle = pal.gold; c.lineWidth = 2.5; c.stroke();
      }
      for (const i of [CONT.climb[0], CONT.climb[CONT.climb.length - 1]]) {
        const q = CONT.cities[i];
        c.fillStyle = i === CONT.climb[0] ? GREEN : pal.gold;
        c.beginPath(); c.arc(X(q.x), Y(q.y), 11, 0, Math.PI * 2); c.fill();
      }
    }
  });
  const millions = sm((t - zoomB + .2) / .4);
  return <Root props={props} t={t} dur={dur} outS={.25} vignette={.6}>
    <canvas ref={ref} width={W} height={H} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
    <Card x={110} y={80} w={560} fonts={props.fonts} color={CYAN} value={txt(props, 'nodes')} note={txt(props, 'nodesNote')} big={60}
      opacity={millions * (1 - sm((t - chAt + .2) / .4))} />
    <Card x={110} y={80} w={640} fonts={props.fonts} color={pal.gold} title={txt(props, 'shortcuts')} note={txt(props, 'shortcutsNote')} big={52}
      opacity={sm((t - chAt + .1) / .4)} />
    {msP > 0 && <div style={{position: 'absolute', right: 110, top: 80, textAlign: 'right', fontFamily: props.fonts.text, opacity: msP, background: 'rgba(6,10,20,.85)',
      border: `2px solid ${pal.gold}`, borderRadius: 18, padding: '14px 28px'}}>
      <div style={{fontFamily: MONO, fontSize: 76, fontWeight: 800, color: pal.gold, lineHeight: 1}}>{txt(props, 'query')}</div>
      <div style={{fontSize: 24, color: 'rgba(230,236,250,.8)', marginTop: 6}}>{txt(props, 'queryNote')}</div></div>}
    {arcsP[0] > 0 && <div style={{position: 'absolute', right: 120, top: 880, fontFamily: props.fonts.text, fontSize: 20, color: pal.muted, opacity: arcsP[0] * .9}}>{txt(props, 'schematic')}</div>}
  </Root>;
}

/** 片名：路网按 Dijkstra 的距离先后亮起（τ 是搜索时钟），片名在上面浮出。 */
function Title(props: SceneInput) {
  const {t, dur} = cues(props), pal = palette(props);
  const gmax = Math.max(...FULLD.g.filter((g: number) => Number.isFinite(g)));
  const tau = gmax * Math.pow(clamp(t / (dur * .75)), 1.3);
  const t1 = sm((t - .35) / .5), t2 = sm((t - .65) / .5), sub = sm((t - 1.1) / .5);
  return <Root props={props} t={t} dur={dur} inS={.05} outS={.25} vignette={0}>
    <Svg>
      <Terrain opacity={.35} park={false} />
      {CITYG.edges.map((e: any) => {
        const [u, v] = FULLD.g[e.a] <= FULLD.g[e.b] ? [e.a, e.b] : [e.b, e.a];
        const f = clamp((tau - FULLD.g[u]) / Math.max(.01, e.minutes));
        if (f <= 0) return null;
        const a = P(u), b = P(v), c = waveColor(FULLD.g[u], gmax);
        return <line key={e.id} x1={a.x} y1={a.y} x2={mix(a.x, b.x, f)} y2={mix(a.y, b.y, f)} stroke={c} strokeWidth={e.kind === 'street' ? 2 : 3.5} opacity={.55} strokeLinecap="round" />;
      })}
      {CITYG.nodes.map((n: any) => n.alive && FULLD.g[n.id] <= tau && <circle key={n.id} cx={n.x} cy={n.y} r={4} fill={waveColor(FULLD.g[n.id], gmax)} opacity={.8} />)}
    </Svg>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(6,10,20,.82) 25%, rgba(6,10,20,.2) 70%)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: props.fonts.text}}>
      <div style={{fontSize: 96, fontWeight: 800, color: pal.text, opacity: t1, transform: `translateY(${(1 - t1) * 24}px)`, letterSpacing: -1}}>{txt(props, 'title1')}</div>
      <div style={{fontSize: 108, fontWeight: 900, color: pal.gold, opacity: t2, transform: `translateY(${(1 - t2) * 24}px)`, letterSpacing: -1, marginTop: 6}}>{txt(props, 'title2')}</div>
      <div style={{fontSize: 34, color: pal.muted, opacity: sub, marginTop: 26, letterSpacing: 2}}>{txt(props, 'subtitle')}</div>
    </div>
  </Root>;
}

/** 收尾：伪代码 + 本片实际跑出的数字；背景是整座城被 Dijkstra 走过一遍的样子。 */
function Credit(props: SceneInput) {
  const {t, at, start, dur} = cues(props), pal = palette(props);
  const codeAt = at(txt(props, 'codeCue'), start(1, 2)), ranAt = at(txt(props, 'ranCue'), start(2, codeAt + 1.5));
  const code = (props.params.code as string[] | undefined)?.length ? props.params.code as string[] : (meta.params.code.default as string[]);
  const gmax = DIJ.minutes * 1.05;
  const k = DIJ.settled * clamp((t - .1) / Math.max(1, dur * .6));
  const codeP = (i: number) => sm((t - .5 - i * .35) / .4), glow = win(t, codeAt - .1, ranAt - .2, .3);
  const ranP = sm((t - ranAt) / .4), tag = sm((t - dur + 2.2) / .5);
  const s = .44, px = W - 90 - W * s, py = 150;
  return <Root props={props} t={t} dur={dur} inS={.2} outS={.4} vignette={.35}>
    <Svg><g transform={`translate(${px} ${py}) scale(${s})`}>
      <defs><clipPath id="credit-clip"><rect x={0} y={0} width={W} height={H} rx={34} /></clipPath></defs>
      <rect x={0} y={0} width={W} height={H} rx={34} fill="rgba(10,16,30,.92)" stroke={`${CYAN}55`} strokeWidth={4} />
      <g clipPath="url(#credit-clip)">
        <Terrain opacity={.4} /><Roads dim={.85} width={2} />
        <SearchLayer run={DIJ} k={k} labels={false} gmax={gmax} ring={10} scale={s} />
        <RoutePath path={AST.path} p={sm((t - 1.2) / 1.2)} color={pal.gold} width={12} />
        <Pin v={SID} kind="you" t={t} gold={pal.gold} scale={.7} /><Pin v={TID} kind="home" t={t} gold={pal.gold} scale={.7} />
      </g>
    </g></Svg>
    <div style={{position: 'absolute', left: 110, top: 150, width: 860, fontFamily: MONO, fontSize: 28, lineHeight: 1.75, background: 'rgba(6,10,20,.9)',
      border: `${1.5 + 1.5 * glow}px solid ${CYAN}${glow > .5 ? 'cc' : '55'}`, borderRadius: 18, padding: '22px 28px', boxSizing: 'border-box', opacity: codeP(0)}}>
      {code.map((line, i) => <div key={i} style={{whiteSpace: 'pre', color: i === 2 ? CYAN : '#c9d6f2', opacity: codeP(i), fontWeight: i === 2 ? 800 : 500}}>{line}</div>)}
    </div>
    <div style={{position: 'absolute', left: px, width: W * s, top: py + H * s + 24, fontFamily: MONO, fontSize: 22, color: pal.muted, lineHeight: 1.6, opacity: ranP, textAlign: 'center'}}>
      <div>{fmt(txt(props, 'stats'), {nodes: CITYG.nodes.filter((n: any) => n.alive).length, edges: CITYG.edges.length, seed: CITYG.cfg.seed})}</div>
      <div style={{color: pal.text}}>{fmt(txt(props, 'runs'), {d: DIJ.settled, a: AST.settled, t: mmss(AST.minutes)})}</div>
    </div>
    <div style={{position: 'absolute', left: 110, top: 620, fontFamily: props.fonts.text, fontSize: 72, fontWeight: 900, color: pal.gold, opacity: tag,
      transform: `translateY(${(1 - tag) * 16}px)`}}>{txt(props, 'tagline')}</div>
  </Root>;
}

export default function RouteScale(props: SceneInput) {
  const mode = String(props.params.mode ?? 'scale');
  if (mode === 'title') return <Title {...props} />;
  if (mode === 'credit') return <Credit {...props} />;
  return <Scale {...props} />;
}
