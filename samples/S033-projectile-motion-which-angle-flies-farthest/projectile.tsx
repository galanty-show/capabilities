import {clamp, ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  "title": "抛体运动：角度与射程",
  "params": {
    "stage": "原有物理演示阶段选择，不生成控件；计算条件与轨迹保持固定。",
    "eyebrow": {
      "label": "眉题",
      "type": "text",
      "default": "",
      "help": "沿用当前分镜的眉题文字，未提供时保持空白。"
    },
    "headline": {
      "label": "标题",
      "type": "text",
      "default": "",
      "help": "沿用当前分镜的标题文字，未提供时保持空白。"
    },
    "descriptions": {
      "label": "阶段说明",
      "type": "list",
      "default": [
        "三十度、四十五度、六十度。",
        "比较之前，先固定所有条件。",
        "角度改变高度，也改变飞行时间。",
        "让终点刻度说话。",
        "同样条件下，四十五度最远。"
      ],
      "help": "按五幕顺序显示标题下方的说明。"
    },
    "footerTitle": {
      "label": "页脚名称",
      "type": "text",
      "default": "抛体运动",
      "help": "幕序号前的课程名称。"
    },
    "footerCount": {
      "label": "页脚总页数",
      "type": "text",
      "default": " / 05",
      "help": "幕序号后的文字，保留原有空格与分隔符。"
    },
    "xAxisLabel": {
      "label": "横轴名称",
      "type": "text",
      "default": "x / m",
      "help": "横轴的显示名称与单位，不改变坐标计算。"
    },
    "yAxisLabel": {
      "label": "纵轴名称",
      "type": "text",
      "default": "y / m",
      "help": "纵轴的显示名称与单位，不改变坐标计算。"
    },
    "xTickLabels": {
      "label": "横轴刻度",
      "type": "list",
      "default": [
        "0",
        "2",
        "4",
        "6",
        "8",
        "10"
      ],
      "help": "依次替换横轴六个刻度的文字，不改变网格位置。"
    },
    "yTickLabels": {
      "label": "纵轴刻度",
      "type": "list",
      "default": [
        "1",
        "2",
        "3",
        "4"
      ],
      "help": "依次替换纵轴四个刻度的文字，不改变网格位置。"
    },
    "angleLabels": {
      "label": "角度标签",
      "type": "list",
      "default": [
        "30°",
        "45°",
        "60°"
      ],
      "help": "只改三个固定角度的显示文字，不改变轨迹计算。"
    },
    "variableNote": {
      "label": "变量提示",
      "type": "text",
      "default": "只改这一个变量",
      "help": "第一幕角度比较的提示。"
    },
    "conditions": {
      "label": "条件说明",
      "type": "list",
      "default": [
        {
          "label": "初速度",
          "value": "10 m/s"
        },
        {
          "label": "重力",
          "value": "10 m/s²"
        },
        {
          "label": "高度",
          "value": "起点 = 终点"
        },
        {
          "label": "空气阻力",
          "value": "忽略"
        }
      ],
      "help": "依次编辑四组条件的显示名称和数值，实际物理计算保持不变。",
      "item": [
        {
          "key": "label",
          "label": "条件名称",
          "type": "text"
        },
        {
          "key": "value",
          "label": "条件文字",
          "type": "text"
        }
      ]
    },
    "landingLabel": {
      "label": "落点说明",
      "type": "text",
      "default": "30° / 60°：同一落点",
      "help": "第三幕两条轨迹的落点说明。"
    },
    "clockNote": {
      "label": "时钟说明",
      "type": "text",
      "default": "按同一物理时钟推进",
      "help": "第三幕底部的物理时钟说明。"
    },
    "pairedRangeLabel": {
      "label": "共同射程",
      "type": "text",
      "default": "30° / 60° ≈ 8.66 m",
      "help": "第四幕共同射程的显示标签，不改变数值计算。"
    },
    "maximumRangeLabel": {
      "label": "最大射程",
      "type": "text",
      "default": "45° = 10 m",
      "help": "第四幕最大射程的显示标签，不改变数值计算。"
    },
    "rangeFormula": {
      "label": "射程公式",
      "type": "text",
      "default": "射程 R = v₀² sin(2θ) / g",
      "help": "第五幕公式框中的显示文字，不改变轨迹方程。"
    },
    "angleFormulas": {
      "label": "角度代入式",
      "type": "list",
      "default": [
        "30° → sin 60°",
        "60° → sin 120°"
      ],
      "help": "第五幕左右两条角度代入式的文字。"
    },
    "equalRangeLabel": {
      "label": "等射程结论",
      "type": "text",
      "default": "同值 · 同射程",
      "help": "第五幕两条代入式下方的说明。"
    },
    "maximumFormula": {
      "label": "最远结论",
      "type": "text",
      "default": "45° → sin 90° = 1 → 最远",
      "help": "第五幕底部的最大射程结论。"
    }
  }
};

const v = 10, g = 10;
const origin = {x:105, y:565}, pixels = {x:88, y:100};
const flights = [
  {angle:30, color:'#7AE4CC'},
  {angle:45, color:'#F5C76C'},
  {angle:60, color:'#E88FB0'},
] as const;

function flight(angle: number) {
  const rad = angle * Math.PI / 180;
  const total = 2 * v * Math.sin(rad) / g;
  const point = (time: number) => {
    const t = Math.min(total, Math.max(0, time));
    return {x:origin.x + v * Math.cos(rad) * t * pixels.x,
      y:origin.y - (v * Math.sin(rad) * t - g * t * t / 2) * pixels.y};
  };
  return {total, point, range:v * v * Math.sin(2 * rad) / g};
}

function trajectory(angle: number, until: number) {
  const f = flight(angle), end = Math.min(f.total, Math.max(0, until));
  const count = Math.max(1, Math.ceil(80 * end / f.total));
  return Array.from({length:count + 1}, (_, i) => {
    const p = f.point(end * i / count);
    return `${i ? 'L' : 'M'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }).join(' ');
}

function Axes({textColor, xAxisLabel, yAxisLabel, xTickLabels, yTickLabels}: {textColor:string; xAxisLabel:string; yAxisLabel:string; xTickLabels:string[]; yTickLabels:string[]}) {
  return <g>
    {[0, 2, 4, 6, 8, 10].map((n, i) => <g key={n}>
      <path d={`M${origin.x + n * pixels.x} 140 V${origin.y}`} stroke={textColor} strokeWidth="2" opacity=".09" />
      <text x={origin.x + n * pixels.x} y="611" textAnchor="middle" fontSize="24" fill={textColor} opacity=".75">{xTickLabels[i]}</text>
    </g>)}
    {[1, 2, 3, 4].map((n, i) => <g key={n}>
      <path d={`M${origin.x} ${origin.y - n * pixels.y} H1010`} stroke={textColor} strokeWidth="2" opacity=".09" />
      <text x="73" y={origin.y - n * pixels.y + 8} textAnchor="middle" fontSize="22" fill={textColor} opacity=".65">{yTickLabels[i]}</text>
    </g>)}
    <path d="M105 135 V565 H1010" fill="none" stroke={textColor} strokeWidth="5" strokeLinecap="round" />
    <text x="1030" y="613" fontSize="24" fill={textColor}>{xAxisLabel}</text>
    <text x="37" y="115" fontSize="24" fill={textColor}>{yAxisLabel}</text>
  </g>;
}

function FlightPaths({time, full = false, labels = false, angleLabels}: {time:number; full?:boolean; labels?:boolean; angleLabels:string[]}) {
  return <g>
    {flights.map((item, i) => {
      const f = flight(item.angle), at = full ? f.total : Math.min(f.total, time), p = f.point(at);
      const visible = full || time > 0;
      return <g key={item.angle} opacity={visible ? 1 : 0}>
        <path d={trajectory(item.angle, at)} fill="none" stroke={item.color} strokeWidth={item.angle === 45 ? 8 : 6}
          strokeLinecap="round" strokeLinejoin="round" />
        {!full ? <circle cx={p.x} cy={p.y} r="14" fill={item.color} stroke="#101D2E" strokeWidth="5" /> : null}
        {labels ? <text x={f.point(f.total / 2).x + 22} y={f.point(f.total / 2).y - 22} fontSize="31" fontWeight="800" fill={item.color}>{angleLabels[i]}</text> : null}
      </g>;
    })}
  </g>;
}

export default function Projectile(props: SceneInput) {
  const s = useScene(props), {params, theme, fonts} = props, c = s.box;
  const descriptions = (params.descriptions ?? meta.params.descriptions.default) as typeof meta.params.descriptions.default;
  const xTickLabels = (params.xTickLabels ?? meta.params.xTickLabels.default) as typeof meta.params.xTickLabels.default;
  const yTickLabels = (params.yTickLabels ?? meta.params.yTickLabels.default) as typeof meta.params.yTickLabels.default;
  const angleLabels = (params.angleLabels ?? meta.params.angleLabels.default) as typeof meta.params.angleLabels.default;
  const conditions = (params.conditions ?? meta.params.conditions.default) as typeof meta.params.conditions.default;
  const angleFormulas = (params.angleFormulas ?? meta.params.angleFormulas.default) as typeof meta.params.angleFormulas.default;
  const stage = Number(params.stage ?? 1);
  const second = s.sentence(1)?.id ?? s.sentence(0)?.id ?? '';
  const a = ease(s.reveal(0, {seconds:0.7}));
  const b = ease(props.progress(second, 0, 0.8));
  const artLeft = Math.max(625, c.left + c.width * .39), artWidth = c.right - artLeft;
  // 场景钟缩放物理时间，不改变任一时刻的坐标方程；最晚落地是 60° 的 1.732 秒。
  const longestFlight = flight(60).total;
  const physicalTime = clamp((s.t - .55) / (longestFlight * 2.25), 0, 1) * longestFlight;
  return <div style={{position:'absolute', inset:0, overflow:'hidden', background:theme.background,
    color:theme.text, fontFamily:fonts.text, opacity:s.fadeOut(9)}}>
    <div style={{position:'absolute', left:c.left, top:c.top + 15, width:560}}>
      <div style={{fontSize:23, fontWeight:800, letterSpacing:'.13em', color:theme.accent}}>{String(params.eyebrow ?? meta.params.eyebrow.default)}</div>
      <div style={{fontSize:71, fontWeight:850, lineHeight:1.13, marginTop:34, letterSpacing:'-.04em'}}>{String(params.headline ?? meta.params.headline.default)}</div>
      <div style={{width:86, height:7, marginTop:40, borderRadius:10, background:theme.accent}} />
      <div style={{fontSize:27, lineHeight:1.45, color:theme.muted, marginTop:32}}>{descriptions[stage - 1]}</div>
      <div style={{marginTop:45, fontSize:20, color:theme.muted, letterSpacing:'.18em'}}>{String(params.footerTitle ?? meta.params.footerTitle.default)} · {String(stage).padStart(2,'0')}{String(params.footerCount ?? meta.params.footerCount.default)}</div>
    </div>
    <div style={{position:'absolute', left:artLeft, top:c.top + 8, width:artWidth, height:c.height - 20,
      borderRadius:34, background:'#162940', boxShadow:'0 28px 80px #050D1C66', overflow:'hidden'}}>
      <svg viewBox="0 0 1100 650" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <Axes textColor={theme.muted} xAxisLabel={String(params.xAxisLabel ?? meta.params.xAxisLabel.default)} yAxisLabel={String(params.yAxisLabel ?? meta.params.yAxisLabel.default)} xTickLabels={xTickLabels} yTickLabels={yTickLabels} />
        {stage === 1 ? <g>
          {flights.map((item, i) => {
            const rad = item.angle * Math.PI / 180, length = 185;
            return <g key={item.angle} opacity={i === 0 ? a : b}>
              <path d={`M105 565 L${105 + length * Math.cos(rad)} ${565 - length * Math.sin(rad)}`} stroke={item.color} strokeWidth="13" strokeLinecap="round" />
              <circle cx={105 + length * Math.cos(rad)} cy={565 - length * Math.sin(rad)} r="15" fill={item.color} />
              <text x={330 + i * 205} y={130 + i * 75} fontSize="66" fontWeight="850" fill={item.color}>{angleLabels[i]}</text>
            </g>;
          })}
          <text x="770" y="480" fontSize="31" fontWeight="800" fill={theme.text} opacity={b}>{String(params.variableNote ?? meta.params.variableNote.default)}</text>
        </g> : null}
        {stage === 2 ? <g>
          {[
            {x:170, y:178},
            {x:620, y:178},
            {x:170, y:365},
            {x:620, y:365},
          ].map((item, i) => <g key={i} opacity={i < 2 ? a : b}>
            <rect x={item.x} y={item.y} width="340" height="132" rx="22" fill="#243C52" stroke={theme.accent} strokeWidth="2" />
            <text x={item.x + 22} y={item.y + 42} fontSize="25" fill={theme.muted}>{conditions[i]?.label ?? ''}</text>
            <text x={item.x + 22} y={item.y + 93} fontSize="43" fontWeight="850" fill={theme.text}>{conditions[i]?.value ?? ''}</text>
          </g>)}
        </g> : null}
        {stage === 3 ? <g>
          <FlightPaths time={physicalTime} angleLabels={angleLabels} />
          <g opacity={b}><text x="650" y="118" fontSize="32" fontWeight="800" fill={theme.text}>{String(params.landingLabel ?? meta.params.landingLabel.default)}</text>
          <circle cx={flight(30).point(flight(30).total).x} cy="565" r="16" fill="#F3F7F9" /></g>
          <text x="680" y="625" fontSize="21" fill={theme.muted}>{String(params.clockNote ?? meta.params.clockNote.default)}</text>
        </g> : null}
        {stage === 4 ? <g>
          <g opacity={a}><FlightPaths time={2} full labels angleLabels={angleLabels} /><path d={`M${flight(30).point(flight(30).total).x} 520 V590`} stroke={theme.text} strokeWidth="3" strokeDasharray="8 8" />
            <rect x="655" y="130" width="310" height="62" rx="30" fill="#29485A" /><text x="810" y="173" textAnchor="middle" fontSize="30" fontWeight="800" fill={theme.text}>{String(params.pairedRangeLabel ?? meta.params.pairedRangeLabel.default)}</text></g>
          <g opacity={b}><path d="M985 490 V590" stroke="#F5C76C" strokeWidth="4" strokeDasharray="8 8" /><rect x="846" y="224" width="208" height="62" rx="30" fill="#F5C76C" />
            <text x="950" y="268" textAnchor="middle" fontSize="32" fontWeight="900" fill="#162940">{String(params.maximumRangeLabel ?? meta.params.maximumRangeLabel.default)}</text></g>
        </g> : null}
        {stage === 5 ? <g>
          <g opacity={a}>
            <rect x="162" y="185" width="770" height="114" rx="22" fill="#243C52" stroke={theme.accent} strokeWidth="3" />
            <text x="547" y="256" textAnchor="middle" fontSize="47" fontWeight="850" fill={theme.text}>{String(params.rangeFormula ?? meta.params.rangeFormula.default)}</text>
            <text x="265" y="389" fontSize="33" fontWeight="800" fill="#7AE4CC">{angleFormulas[0]}</text>
            <text x="670" y="389" fontSize="33" fontWeight="800" fill="#E88FB0">{angleFormulas[1]}</text>
            <path d="M466 410 H650" stroke={theme.muted} strokeWidth="4" strokeDasharray="10 10" />
            <text x="550" y="457" textAnchor="middle" fontSize="28" fill={theme.muted}>{String(params.equalRangeLabel ?? meta.params.equalRangeLabel.default)}</text>
          </g>
          <g opacity={b}><rect x="285" y="486" width="535" height="81" rx="38" fill="#F5C76C" />
            <text x="552" y="541" textAnchor="middle" fontSize="39" fontWeight="900" fill="#162940">{String(params.maximumFormula ?? meta.params.maximumFormula.default)}</text></g>
        </g> : null}
      </svg>
    </div>
  </div>;
}
