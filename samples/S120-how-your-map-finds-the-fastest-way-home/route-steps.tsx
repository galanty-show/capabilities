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

// 两用：cafe 讲 1956 年阿姆斯特丹的咖啡馆（线描、时钟、划掉的纸笔）；steps 在 9 个路口的小图上逐步跑 Dijkstra，
// 右侧伪代码逐行高亮、优先队列实时排序。小图的搜索同样是 algo 的 search() 真跑出来的。
export const meta = {
  params: {
    mode: {label: '用法', type: 'select', options: [{value: 'cafe', label: '咖啡馆 1956'}, {value: 'steps', label: '小图逐步演示'}]},
    place: {label: '地点', type: 'text', default: 'Amsterdam', maxLength: 30},
    year: {label: '年份', type: 'text', default: '1956', maxLength: 12},
    from: {label: '问题起点', type: 'text', default: 'Rotterdam', maxLength: 24},
    to: {label: '问题终点', type: 'text', default: 'Groningen', maxLength: 24},
    question: {label: '问题', type: 'text', default: 'shortest way from {from} to {to}?', maxLength: 60},
    minutes: {label: '用时', type: 'text', default: '~20 min', maxLength: 20},
    published: {label: '发表', type: 'text', default: 'Published 1959 · Numerische Mathematik 1, 269–271', maxLength: 80},
    name: {label: '人物', type: 'text', default: 'Edsger W. Dijkstra', maxLength: 40},
    life: {label: '生卒', type: 'text', default: '1930–2002', maxLength: 20},
    sitsCue: {label: '入座卡点词', type: 'text', default: 'sits', maxLength: 24},
    coffeeCue: {label: '咖啡卡点词', type: 'text', default: 'coffee', maxLength: 24},
    minutesCue: {label: '用时卡点词', type: 'text', default: 'twenty', maxLength: 24},
    pencilCue: {label: '纸笔卡点词', type: 'text', default: 'pencil', maxLength: 24},
    code: {label: '伪代码', type: 'list', min: 7, max: 7, maxLength: 40,
      default: ['dist[S] = 0, all others = ∞', 'repeat until Home is visited:', '  u = closest unvisited', '  mark u visited   # final', '  for each road u→v (w):',
        '    if dist[u] + w < dist[v]:', '      dist[v] = dist[u] + w']},
    queue: {label: '优先队列标题', type: 'text', default: 'Priority queue', maxLength: 30},
    next: {label: '下一个', type: 'text', default: '← next', maxLength: 12},
    unit: {label: '权重单位', type: 'text', default: 'road weights in minutes', maxLength: 40},
    final: {label: '确定标记', type: 'text', default: 'final', maxLength: 16},
    zeroCue: {label: '起点为零卡点词', type: 'text', default: 'zero', maxLength: 24},
    infinityCue: {label: '无穷卡点词', type: 'text', default: 'infinity', maxLength: 24},
    visitCue: {label: '访问卡点词', type: 'text', default: 'Visit', maxLength: 24},
    roadsCue: {label: '查路卡点词', type: 'text', default: 'roads', maxLength: 24},
    shorterCue: {label: '更短卡点词', type: 'text', default: 'shorter', maxLength: 24},
    writeCue: {label: '记下卡点词', type: 'text', default: 'write', maxLength: 24},
    repeatCue: {label: '重复卡点词', type: 'text', default: 'Repeat', maxLength: 24},
    finalCue: {label: '确定卡点词', type: 'text', default: 'final', maxLength: 24},
    detourCue: {label: '绕路卡点词', type: 'text', default: 'detour', maxLength: 24},
  },
};

// ---------- 9 个路口的小图（权重是整数分钟，便于心算） ----------
const NAMES = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const POS = [[230, 500], [446, 290], [473, 690], [716, 380], [734, 760], [959, 590], [968, 250], [1166, 410], [1184, 760]];
const LINKS = [[0, 1, 2], [0, 2, 4], [1, 2, 1], [1, 3, 6], [2, 3, 4], [2, 4, 3], [4, 5, 2], [4, 8, 7], [3, 5, 3], [3, 6, 2], [5, 8, 3], [5, 7, 4], [6, 7, 1], [7, 8, 2]];
const SMALL: any = (() => {
  const nodes = POS.map(([x, y], id) => ({id, x, y}));
  const edges = LINKS.map(([a, b, m], id) => ({id, a, b, minutes: m}));
  const adj = nodes.map(() => [] as any[]);
  for (const e of edges) {adj[e.a].push({to: e.b, e: e.id}); adj[e.b].push({to: e.a, e: e.id});}
  return {nodes, edges, adj, cfg: CITYG.cfg, vmax: 1};
})();
const RUN = search(SMALL, 0, 8);

function Steps(props: SceneInput) {
  const {t, at, start, end, dur} = cues(props), pal = palette(props);
  const zero = at(txt(props, 'zeroCue'), start(0, .3) + .8), inf = at(txt(props, 'infinityCue'), start(2, zero + 1.2));
  const visit = at(txt(props, 'visitCue'), inf + 1.5), roads = at(txt(props, 'roadsCue'), visit + 1.8);
  const shorter = at(txt(props, 'shorterCue'), roads + 1), write = at(txt(props, 'writeCue'), shorter + 1);
  const repeat = at(txt(props, 'repeatCue'), write + 1), finalAt = at(txt(props, 'finalCue'), repeat + 2.5), detour = at(txt(props, 'detourCue'), finalAt + 1.5);
  // 每一步的“出队时刻”与“松弛时刻”：前两步跟旁白走，第三步起在“Repeat”到“no detour”之间匀速加快。
  const n = RUN.order.length, popT: number[] = [], relT: number[] = [];
  popT[0] = visit + .45; relT[0] = roads + .1;
  popT[1] = shorter - .25; relT[1] = write - .1;
  const a = repeat + .15, b = Math.max(a + 2.5, detour - .6);
  for (let i = 2; i < n; i++) {const u = (i - 2) / Math.max(1, n - 3); popT[i] = mix(a, b, Math.pow(u, .85)); relT[i] = popT[i] + .32;}
  const popped = (v: number) => RUN.popAt[v] >= 0 && t >= popT[RUN.popAt[v]];
  const relaxTime = (step: number) => step === 0 ? zero : relT[step - 1];
  // 每个路口当前的暂定值与上一次的值（用于“划掉旧值”）。
  const shown: Record<number, {g: number; old?: number; at: number}> = {};
  for (const u of RUN.updates) {
    const when = relaxTime(u.step);
    if (t < when) break;
    shown[u.v] = {g: u.g, old: shown[u.v]?.g, at: when};
  }
  const lastPop = RUN.order.reduce((m: number, v: number, i: number) => t >= popT[i] ? i : m, -1);
  const lastRel = relT.reduce((m: number, x: number, i: number) => t >= x ? i : m, -1);
  // 伪代码高亮：最近一件事是出队就亮 2→3，是松弛就亮 4→6；开头两句亮第 0 行。
  let line = t < inf + .6 ? 0 : 1;
  const evPop = lastPop >= 0 ? popT[lastPop] : -1, evRel = lastRel >= 0 ? relT[lastRel] : -1;
  if (evPop > evRel && evPop >= 0) line = t - evPop < .22 ? 2 : 3;
  else if (evRel >= 0) line = t - evRel < .12 ? 4 : t - evRel < .24 ? 5 : 6;
  if (lastPop === n - 1 && t > popT[n - 1] + .4) line = 1;
  const code = (props.params.code as string[] | undefined)?.length ? props.params.code as string[] : (meta.params.code.default as string[]);
  const done = popT[n - 1], pathP = sm((t - done - .2) / .9);
  const finalP = sm((t - finalAt) / .3);
  const frontier = Object.entries(shown).map(([v, s]) => ({v: Number(v), g: s.g})).filter(f => !popped(f.v)).sort((x, y) => x.g - y.g || x.v - y.v);
  const intro = sm((t - .05) / .4);
  return <Root props={props} t={t} dur={dur} vignette={.35}>
    <Svg>
      <g transform="translate(40 30)">
        {SMALL.edges.map((e: any) => {
          const A = SMALL.nodes[e.a], B = SMALL.nodes[e.b], mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
          // 松弛闪光：出队路口的出边在松弛时刻从它那头往外亮一下。
          let flash = 0, from = A, to = B;
          for (const end of [e.a, e.b]) {
            const i = RUN.popAt[end];
            if (i < 0) continue;
            const d = t - relT[i];
            if (d >= 0 && d < .7) {flash = 1 - d / .7; from = SMALL.nodes[end]; to = SMALL.nodes[end === e.a ? e.b : e.a];}
          }
          const onPath = RUN.pathEdges.includes(e.id) && pathP > 0;
          return <g key={e.id} opacity={intro}>
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={onPath ? pal.gold : '#33456b'} strokeWidth={onPath ? 9 : 5} strokeLinecap="round" opacity={onPath ? pathP : 1} />
            {flash > 0 && <line x1={from.x} y1={from.y} x2={mix(from.x, to.x, out3(1 - flash))} y2={mix(from.y, to.y, out3(1 - flash))} stroke={CYAN} strokeWidth={8} strokeLinecap="round" opacity={flash} />}
            <rect x={mx - 20} y={my - 18} width={40} height={34} rx={8} fill={pal.bg} />
            <text x={mx} y={my + 9} textAnchor="middle" fontFamily={MONO} fontSize={26} fontWeight={700} fill={onPath ? pal.gold : '#aebbd8'}>{e.minutes}</text>
          </g>;
        })}
        {SMALL.nodes.map((nd: any) => {
          const v = nd.id, st = shown[v], isPopped = popped(v), i = RUN.popAt[v];
          const age = isPopped ? t - popT[i] : -1, cur = isPopped && age < .6;
          const label = st ? String(st.g) : (t >= inf ? '∞' : '');
          const changed = st && st.old !== undefined && t - st.at < 1.4 ? 1 - sm((t - st.at - .9) / .5) : 0;
          const inQueue = st && !isPopped;
          return <g key={v} transform={`translate(${nd.x} ${nd.y})`} opacity={intro}>
            {cur && <circle r={46 + 50 * out3(age / .6)} fill="none" stroke={CYAN} strokeWidth={4} opacity={1 - age / .6} />}
            <circle r={44} fill={isPopped ? '#0f3346' : '#101a2e'} stroke={isPopped ? CYAN : inQueue ? AMBER : '#4a5b82'} strokeWidth={isPopped ? 5 : inQueue ? 4 : 3} />
            <text y={-56} textAnchor="middle" fontFamily={props.fonts.text} fontSize={26} fontWeight={800} fill={v === 0 ? GREEN : v === 8 ? pal.gold : '#9fb0d6'}>
              {v === 0 ? 'S' : v === 8 ? `H` : NAMES[v]}</text>
            <text y={13} textAnchor="middle" fontFamily={MONO} fontSize={label === '∞' ? 40 : 38} fontWeight={800}
              fill={isPopped ? '#e9fbff' : inQueue ? '#ffe2b0' : '#8090b4'}>{label}</text>
            {changed > 0 && <g opacity={changed}>
              <text x={58} y={-14} fontFamily={MONO} fontSize={30} fontWeight={700} fill="#ff8f8f">{st!.old}</text>
              <line x1={52} y1={-24} x2={84} y2={-24} stroke="#ff8f8f" strokeWidth={4} />
            </g>}
            {isPopped && finalP > 0 && t >= popT[i] && <g transform="translate(30 30)" opacity={finalP}>
              <circle r={15} fill={CYAN} /><path d="M-7 0 L-2 6 L8 -6" fill="none" stroke="#06202b" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </g>}
          </g>;
        })}
      </g>
    </Svg>
    <div style={{position: 'absolute', left: 120, top: 860, fontFamily: props.fonts.text, fontSize: 22, color: pal.muted, opacity: intro * .9}}>{txt(props, 'unit')}</div>
    <div style={{position: 'absolute', left: 1290, top: 90, width: 540, fontFamily: MONO, fontSize: 24, lineHeight: 1.75, background: 'rgba(8,13,26,.92)',
      border: '1.5px solid rgba(120,150,210,.3)', borderRadius: 16, padding: '16px 18px', boxSizing: 'border-box', opacity: sm((t - zero + .4) / .4)}}>
      {code.map((text, i) => <div key={i} style={{whiteSpace: 'pre', color: i === line ? '#06121c' : '#b9c6e4', background: i === line ? CYAN : 'transparent',
        borderRadius: 6, padding: '0 6px', fontWeight: i === line ? 800 : 500}}>{text}</div>)}
    </div>
    <div style={{position: 'absolute', left: 1290, top: 500, width: 540, fontFamily: props.fonts.text, background: 'rgba(8,13,26,.92)',
      border: `1.5px solid ${AMBER}55`, borderRadius: 16, padding: '14px 18px', boxSizing: 'border-box', opacity: sm((t - roads) / .4), minHeight: 120}}>
      <div style={{fontSize: 20, letterSpacing: 2, color: AMBER, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6}}>{txt(props, 'queue')}</div>
      {frontier.slice(0, 5).map((f, i) => <div key={f.v} style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 28, padding: '2px 0',
        color: i === 0 ? '#fff3dc' : 'rgba(230,236,250,.72)', fontWeight: i === 0 ? 800 : 500}}>
        <span>{f.v === 8 ? 'H' : NAMES[f.v]}</span><span>{f.g}{i === 0 ? `  ${txt(props, 'next')}` : ''}</span></div>)}
    </div>
    {finalP > 0 && <div style={{position: 'absolute', left: 1330, top: 780, fontFamily: props.fonts.text, fontSize: 28, color: CYAN, fontWeight: 800, opacity: finalP}}>
      ● = {txt(props, 'final')}</div>}
    {pathP > 0 && <div style={{position: 'absolute', left: 1330, top: 826, fontFamily: MONO, fontSize: 34, color: pal.gold, fontWeight: 800, opacity: pathP}}>
      S → … → H = {RUN.minutes}</div>}
  </Root>;
}

/** 1956 年阿姆斯特丹：线描咖啡杯、脑中的小地图（鹿特丹 → 格罗宁根）、二十分钟的时钟、划掉的纸和笔。 */
function Cafe(props: SceneInput) {
  const {t, at, start, dur} = cues(props), pal = palette(props);
  const sits = at(txt(props, 'sitsCue'), start(1, 1.2)), coffee = at(txt(props, 'coffeeCue'), start(1, 1.6)), mins = at(txt(props, 'minutesCue'), start(2, coffee + 2)), pencil = at(txt(props, 'pencilCue'), start(3, mins + 2));
  const draw = (a: number, len = 1) => sm((t - a) / len);
  const year = typed(txt(props, 'year'), (t - .1) / .5), place = typed(txt(props, 'place'), (t - .25) / .6);
  const cup = draw(sits - .3, 1.0), nameP = sm((t - start(1, 1.2) + .1) / .5);
  const steam = (i: number) => {
    const ph = t * 1.4 + i * 2.1;
    return `M ${520 + i * 36} 560 C ${505 + i * 36 + 14 * Math.sin(ph)} 520, ${535 + i * 36 - 14 * Math.sin(ph)} 490, ${520 + i * 36} 450`;
  };
  // 脑中小地图：几座城（示意，不是地理位置）
  const cities = [[1180, 700], [1300, 560], [1440, 640], [1380, 420], [1560, 480], [1520, 300], [1680, 360], [1690, 220]];
  const roads = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6], [5, 7], [6, 7]];
  const best = [0, 1, 3, 5, 7];
  const idea = draw(coffee + .2, .9), solved = draw(mins + .4, 1.0);
  const hand = mix(0, Math.PI * 2 / 3, out3((t - mins + .1) / 1.2));
  const crossP = draw(pencil + .1, .35), cross2 = draw(pencil + .9, .35);
  const pathPts = best.map(i => cities[i]);
  const segP = (k: number) => clamp(solved * (best.length - 1) - k);
  return <Root props={props} t={t} dur={dur} vignette={.45}>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 70%, rgba(255,190,110,.10), rgba(0,0,0,0) 60%)'}} />
    <div style={{position: 'absolute', left: 140, top: 110, fontFamily: 'Georgia, "Times New Roman", serif', color: pal.text}}>
      <div style={{fontSize: 140, fontWeight: 700, letterSpacing: 4, lineHeight: 1}}>{year}</div>
      <div style={{fontSize: 56, fontStyle: 'italic', color: '#f3d9a8', marginTop: 10}}>{place}</div>
      <div style={{fontSize: 34, marginTop: 26, opacity: nameP, fontFamily: props.fonts.text, fontWeight: 700}}>{typed(txt(props, 'name'), nameP * 1.3)}
        <span style={{fontSize: 24, color: pal.muted, fontWeight: 400, marginLeft: 14}}>{txt(props, 'life')}</span></div>
    </div>
    <Svg>
      <g fill="none" stroke="#f3e6cc" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={cup > 0 ? 1 : 0}>
        <ellipse cx={560} cy={760} rx={250} ry={52} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - cup)} opacity={.55} />
        <path d="M 440 590 L 460 730 Q 470 760 560 760 Q 650 760 660 730 L 680 590 Z" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - cup)} />
        <path d="M 676 615 C 740 610, 745 690, 668 700" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - draw(sits + .3, .5))} />
        <ellipse cx={560} cy={590} rx={120} ry={18} pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - cup)} />
        {[0, 1, 2].map(i => <path key={i} d={steam(i)} opacity={.55 * draw(sits + .6 + i * .15, .5)} strokeWidth={3.5} />)}
      </g>
      {/* 想法气泡 */}
      <g opacity={idea}>
        {[[760, 520, 10], [830, 470, 16], [920, 420, 22]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#f3e6cc" strokeWidth={3} opacity={draw(coffee + .2 + i * .12, .3)} />)}
        <rect x={1060} y={140} width={740} height={660} rx={60} fill="rgba(20,28,48,.55)" stroke="rgba(243,230,204,.35)" strokeWidth={3} />
        {roads.map(([a, b], i) => <line key={i} x1={cities[a][0]} y1={cities[a][1]} x2={cities[b][0]} y2={cities[b][1]} stroke="#4f6290" strokeWidth={4} />)}
        {pathPts.slice(1).map((p, k) => {const q = pathPts[k], f = segP(k); return f > 0 && <line key={k} x1={q[0]} y1={q[1]} x2={mix(q[0], p[0], f)} y2={mix(q[1], p[1], f)} stroke={pal.gold} strokeWidth={9} strokeLinecap="round" />;})}
        {cities.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 0 || i === 7 ? 14 : 10} fill={i === 0 ? GREEN : i === 7 ? pal.gold : '#9fb0d6'} />)}
        <text x={cities[0][0] - 20} y={cities[0][1] + 50} fontFamily={props.fonts.text} fontSize={30} fontWeight={700} fill={GREEN}>{txt(props, 'from')}</text>
        <text x={cities[7][0] + 10} y={cities[7][1] - 30} textAnchor="end" fontFamily={props.fonts.text} fontSize={30} fontWeight={700} fill={pal.gold}>{txt(props, 'to')}</text>
      </g>
      {/* 二十分钟 */}
      <g transform="translate(1180 300)" opacity={draw(mins - .2, .3)}>
        <circle r={62} fill="rgba(6,10,20,.85)" stroke="#f3e6cc" strokeWidth={4} />
        <path d={`M 0 0 L 0 -52 A 52 52 0 ${hand > Math.PI ? 1 : 0} 1 ${52 * Math.sin(hand)} ${-52 * Math.cos(hand)} Z`} fill={pal.gold} opacity={.35} />
        <line x1={0} y1={0} x2={46 * Math.sin(hand)} y2={-46 * Math.cos(hand)} stroke="#f3e6cc" strokeWidth={5} strokeLinecap="round" />
        <text y={100} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={800} fill={pal.gold}>{txt(props, 'minutes')}</text>
      </g>
      {/* 纸和笔，被划掉 */}
      <g transform="translate(215 480)" opacity={draw(pencil - .3, .3)}>
        <g transform="rotate(-30)"><rect x={-70} y={-11} width={130} height={22} rx={4} fill="none" stroke="#f3e6cc" strokeWidth={4} />
          <path d="M 60 -11 L 88 0 L 60 11" fill="none" stroke="#f3e6cc" strokeWidth={4} strokeLinejoin="round" /></g>
        <line x1={-80} y1={-60} x2={90} y2={70} stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - crossP)} />
      </g>
      <g transform="translate(215 660)" opacity={draw(pencil + .55, .3)}>
        <rect x={-55} y={-70} width={110} height={140} rx={6} fill="none" stroke="#f3e6cc" strokeWidth={4} />
        {[-35, -10, 15, 40].map(y => <line key={y} x1={-35} y1={y} x2={35} y2={y} stroke="#f3e6cc" strokeWidth={3} opacity={.6} />)}
        <line x1={-80} y1={-90} x2={80} y2={90} stroke={RED} strokeWidth={8} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={100 * (1 - cross2)} />
      </g>
    </Svg>
    <div style={{position: 'absolute', left: 1100, top: 820, width: 680, textAlign: 'center', fontFamily: props.fonts.text, fontSize: 28, color: '#f3d9a8', fontStyle: 'italic', opacity: idea}}>
      {fmt(txt(props, 'question'), {from: txt(props, 'from'), to: txt(props, 'to')})}</div>
    <div style={{position: 'absolute', left: 140, top: 870, fontFamily: props.fonts.text, fontSize: 24, color: pal.muted, opacity: draw(pencil + 1.1, .4)}}>{txt(props, 'published')}</div>
  </Root>;
}

export default function RouteSteps(props: SceneInput) {
  return String(props.params.mode ?? 'steps') === 'cafe' ? <Cafe {...props} /> : <Steps {...props} />;
}
