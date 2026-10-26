import {clamp, ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  "title": "小马过河：自己的尺寸",
  "params": {
    "stage": "原有故事阶段选择，不生成控件；尺寸代号仍决定固定几何形状。",
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
        "每个人的身体，都有自己的答案。",
        "真诚的建议，也可能不合身。",
        "不看标签说法，看上身效果。",
        "量一量，再穿一穿。",
        "合身，才走得自在。"
      ],
      "help": "按五幕顺序显示标题下方的说明。"
    },
    "footerTitle": {
      "label": "页脚名称",
      "type": "text",
      "default": "小马过河",
      "help": "幕序号前的故事名称。"
    },
    "footerCount": {
      "label": "页脚总页数",
      "type": "text",
      "default": " / 05",
      "help": "幕序号后的文字，保留原有空格与分隔符。"
    },
    "sizeLabels": {
      "label": "衣服尺寸标签",
      "type": "list",
      "default": [
        "S",
        "M",
        "L"
      ],
      "help": "只替换小号、中号、大号衣服上的显示文字，不改变衣服尺寸。"
    },
    "choiceLabel": {
      "label": "选码问题",
      "type": "text",
      "default": "S？　M？　L？",
      "help": "第一幕衣架下方的问题，默认保留全角空格。"
    },
    "animalLabels": {
      "label": "建议者说明",
      "type": "list",
      "default": [
        "松鼠：小号",
        "牛：大号"
      ],
      "help": "第二幕两位建议者下方的标签。"
    },
    "adviceLabel": {
      "label": "建议比较",
      "type": "text",
      "default": "两种建议，两种身形",
      "help": "第二幕底部的比较说明。"
    },
    "fitLabels": {
      "label": "试穿结果",
      "type": "list",
      "default": [
        "S · 肩膀露出",
        "L · 袖口盖蹄"
      ],
      "help": "第三幕小号与大号的试穿结果，只改变显示文字。"
    },
    "measureLabel": {
      "label": "测量提示",
      "type": "text",
      "default": "先量肩宽和胸围",
      "help": "第四幕测量图形上方的提示。"
    },
    "fittedLabel": {
      "label": "合身标签",
      "type": "text",
      "default": "M 合身",
      "help": "第四幕合身衣服旁的标签。"
    },
    "ownSizeLabel": {
      "label": "结论标签",
      "type": "text",
      "default": "自己的尺寸",
      "help": "第五幕的结论文字。"
    }
  }
};

type CoatSize = 'S' | 'M' | 'L';
const ink = '#193C36', fur = '#D7A879', coat = '#D56046', paper = '#FFF9EF';

// 服装是独立轮廓：小号短袖/露肩，大号盖住前蹄，中号袖口与衣摆到位。
function Pony({x, y, scale = 1, size, sizeText, step = 0}: {x: number; y: number; scale?: number; size?: CoatSize; sizeText?: string; step?: number}) {
  const jacket = size === 'S' ? {left: 105, right: 195, hem: 278, sleeve: 261}
    : size === 'L' ? {left: 71, right: 229, hem: 369, sleeve: 357}
      : {left: 91, right: 209, hem: 319, sleeve: 314};
  return <g transform={`translate(${x} ${y + Math.sin(step * Math.PI * 2) * 3}) scale(${scale})`}>
    <ellipse cx="154" cy="404" rx="95" ry="13" fill={ink} opacity=".11" />
    <path d="M111 287 L101 388 Q105 403 126 400 L140 307 M166 307 L180 400 Q203 404 206 389 L195 281" fill={fur} stroke={ink} strokeWidth="8" strokeLinejoin="round" />
    <path d="M85 213 Q55 252 70 318 M212 214 Q247 245 231 319" fill="none" stroke={fur} strokeWidth="34" strokeLinecap="round" />
    <ellipse cx="151" cy="255" rx="76" ry="91" fill={fur} stroke={ink} strokeWidth="8" />
    <path d="M98 80 L77 19 L130 54 M190 57 L226 16 L209 91" fill={fur} stroke={ink} strokeWidth="8" strokeLinejoin="round" />
    <path d="M86 88 Q96 46 157 42 Q222 39 229 108 Q229 151 196 176 Q144 199 101 161 Q72 136 86 88 Z" fill={fur} stroke={ink} strokeWidth="8" />
    <path d="M90 77 Q113 35 155 39 Q189 34 205 70 Q160 62 137 102 Q117 80 90 77" fill="#64493A" />
    <ellipse cx="218" cy="134" rx="48" ry="33" fill="#E8BF98" stroke={ink} strokeWidth="7" />
    <circle cx="169" cy="111" r="7" fill={ink} /><circle cx="236" cy="130" r="5" fill={ink} />
    <path d="M211 153 Q222 163 235 151" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    {size ? <g>
      <path d={`M${jacket.left} 192 Q150 210 ${jacket.right} 192 L${jacket.right + (size === 'L' ? 16 : 7)} ${jacket.hem} Q150 ${jacket.hem + 17} ${jacket.left - (size === 'L' ? 16 : 7)} ${jacket.hem} Z`}
        fill={coat} stroke={ink} strokeWidth="8" strokeLinejoin="round" />
      <path d={`M${jacket.left + 8} 205 L${jacket.left - 36} 225 L${jacket.left - 42} ${jacket.sleeve} L${jacket.left + 4} ${jacket.sleeve - 8} Z M${jacket.right - 8} 205 L${jacket.right + 36} 225 L${jacket.right + 42} ${jacket.sleeve} L${jacket.right - 4} ${jacket.sleeve - 8} Z`}
        fill={coat} stroke={ink} strokeWidth="8" strokeLinejoin="round" />
      <path d={`M150 202 L150 ${jacket.hem - 8}`} stroke={paper} strokeWidth="5" />
      {[228, 258, 288].filter(v => v < jacket.hem - 4).map(v => <circle key={v} cx="159" cy={v} r="5" fill={paper} />)}
      <rect x="112" y="218" width="31" height="27" rx="5" fill={paper} opacity=".94" />
      <text x="127" y="238" textAnchor="middle" fontSize="20" fontWeight="900" fill={ink}>{sizeText}</text>
    </g> : null}
  </g>;
}

function CoatOnRack({x, label, labelText, highlighted = false}: {x: number; label: CoatSize; labelText: string; highlighted?: boolean}) {
  const width = label === 'S' ? 108 : label === 'L' ? 162 : 136;
  return <g transform={`translate(${x} 145)`}>
    <path d="M0 0 Q0 -14 13 -14 Q28 -14 27 0 Q27 11 15 17 L0 28 L-47 42 L47 42 L0 28" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M-${width / 2 - 18} 61 L-${width / 2 + 27} 77 L-${width / 2 + 13} 133 L-${width / 2 - 6} 139 L-${width / 2 - 6} 111 L-${width / 2 + 2} 246 Q0 262 ${width / 2 + 2} 246 L${width / 2 - 6} 111 L${width / 2 - 6} 139 L${width / 2 + 13} 133 L${width / 2 + 27} 77 L${width / 2 - 18} 61 Z`}
      fill={highlighted ? coat : '#E1B2A0'} stroke={ink} strokeWidth="7" strokeLinejoin="round" />
    <text y="210" textAnchor="middle" fontSize="68" fontWeight="900" fill={paper}>{labelText}</text>
  </g>;
}

function AnimalBadge({x, animal, label}: {x: number; animal: 'squirrel' | 'cow'; label: string}) {
  return <g transform={`translate(${x} 0)`}>
    <circle cx="0" cy="0" r="88" fill={animal === 'squirrel' ? '#F1D4A2' : '#DFE9D8'} stroke={ink} strokeWidth="7" />
    {animal === 'squirrel'
      ? <><path d="M-42 -61 L-61 -105 L-18 -81 M29 -76 L59 -112 L58 -48" fill="#BA7654" stroke={ink} strokeWidth="6" /><ellipse cx="0" cy="4" rx="55" ry="60" fill="#BA7654" /></>
      : <><path d="M-45 -54 Q-92 -90 -99 -53 M45 -54 Q92 -90 99 -53" fill="#E8CBAE" stroke={ink} strokeWidth="8" /><ellipse cx="0" cy="4" rx="58" ry="61" fill={paper} /><ellipse cx="0" cy="27" rx="39" ry="25" fill="#D9A5A7" /></>}
    <circle cx="-20" cy="-5" r="5" fill={ink} /><circle cx="20" cy="-5" r="5" fill={ink} />
    <path d="M-10 29 Q0 39 10 29" fill="none" stroke={ink} strokeWidth="4" />
    <text y="150" textAnchor="middle" fontSize="34" fontWeight="800" fill={ink}>{label}</text>
  </g>;
}

export default function SizeStory(props: SceneInput) {
  const s = useScene(props), {params, theme, fonts} = props;
  const descriptions = (params.descriptions ?? meta.params.descriptions.default) as typeof meta.params.descriptions.default;
  const sizeLabels = (params.sizeLabels ?? meta.params.sizeLabels.default) as typeof meta.params.sizeLabels.default;
  const animalLabels = (params.animalLabels ?? meta.params.animalLabels.default) as typeof meta.params.animalLabels.default;
  const fitLabels = (params.fitLabels ?? meta.params.fitLabels.default) as typeof meta.params.fitLabels.default;
  const stage = Number(params.stage ?? 1), c = s.box;
  const second = s.sentence(1)?.id ?? s.sentence(0)?.id ?? '';
  const a = ease(s.reveal(0, {seconds: 0.75}));
  const b = ease(props.progress(second, 0, 0.8));
  const artLeft = Math.max(630, c.left + c.width * 0.39), artWidth = c.right - artLeft;
  return <div style={{position:'absolute', inset:0, overflow:'hidden', background:theme.background,
    color:ink, fontFamily:fonts.text, opacity:s.fadeOut(9)}}>
    <div style={{position:'absolute', left:c.left, top:c.top + 15, width:550}}>
      <div style={{fontSize:23, fontWeight:800, letterSpacing:'.12em', color:theme.accent}}>{String(params.eyebrow ?? meta.params.eyebrow.default)}</div>
      <div style={{fontSize:74, fontWeight:850, lineHeight:1.12, marginTop:35, letterSpacing:'-.04em'}}>{String(params.headline ?? meta.params.headline.default)}</div>
      <div style={{width:86, height:7, marginTop:42, borderRadius:10, background:theme.accent}} />
      <div style={{fontSize:27, lineHeight:1.5, color:theme.muted, marginTop:35}}>{descriptions[stage - 1]}</div>
      <div style={{marginTop:45, fontSize:20, color:theme.muted, letterSpacing:'.18em'}}>{String(params.footerTitle ?? meta.params.footerTitle.default)} · {String(stage).padStart(2,'0')}{String(params.footerCount ?? meta.params.footerCount.default)}</div>
    </div>
    <div style={{position:'absolute', left:artLeft, top:c.top + 8, width:artWidth, height:c.height - 20,
      borderRadius:36, background:'#FFF9EF', boxShadow:'0 28px 90px #193C3620', overflow:'hidden'}}>
      <svg viewBox="0 0 1100 650" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <circle cx="870" cy="100" r="110" fill="#F6D7B8" opacity=".55" />
        <path d="M0 580 Q350 542 1100 585 L1100 650 H0 Z" fill="#DFE8D8" />
        {stage === 1 ? <g>
          <path d="M0 615 Q95 594 195 615 T385 615" fill="none" stroke="#8AC8C2" strokeWidth="13" strokeLinecap="round" opacity=".7" />
          <path d="M105 170 H995" stroke={ink} strokeWidth="11" strokeLinecap="round" opacity={a} />
          <g opacity={a}><CoatOnRack x={380} label="S" labelText={sizeLabels[0]} /><CoatOnRack x={610} label="M" labelText={sizeLabels[1]} /><CoatOnRack x={855} label="L" labelText={sizeLabels[2]} /></g>
          <g opacity={b}><Pony x={12} y={170} scale={.9} /><text x="610" y="527" textAnchor="middle" fontSize="39" fontWeight="850" fill={ink}>{String(params.choiceLabel ?? meta.params.choiceLabel.default)}</text></g>
        </g> : null}
        {stage === 2 ? <g>
          <g opacity={a}><g transform="translate(0 235)"><AnimalBadge x={225} animal="squirrel" label={animalLabels[0]} /></g><CoatOnRack x={435} label="S" labelText={sizeLabels[0]} highlighted /></g>
          <g opacity={b}><g transform="translate(0 235)"><AnimalBadge x={725} animal="cow" label={animalLabels[1]} /></g><CoatOnRack x={938} label="L" labelText={sizeLabels[2]} highlighted /></g>
          <path d="M548 140 V495" fill="none" stroke={ink} strokeWidth="3" strokeDasharray="10 13" opacity=".25" />
          <text x="550" y="552" textAnchor="middle" fontSize="35" fontWeight="800" fill={ink}>{String(params.adviceLabel ?? meta.params.adviceLabel.default)}</text>
        </g> : null}
        {stage === 3 ? <g>
          <g opacity={a}><Pony x={68} y={90} scale={1.05} size="S" sizeText={sizeLabels[0]} /><text x="225" y="583" textAnchor="middle" fontSize="40" fontWeight="850" fill={ink}>{fitLabels[0]}</text><path d="M235 330 L325 260" stroke={coat} strokeWidth="5" /></g>
          <g opacity={b}><Pony x={580} y={90} scale={1.05} size="L" sizeText={sizeLabels[2]} /><text x="745" y="583" textAnchor="middle" fontSize="40" fontWeight="850" fill={ink}>{fitLabels[1]}</text><path d="M750 335 L875 450" stroke={coat} strokeWidth="5" /></g>
        </g> : null}
        {stage === 4 ? <g>
          <g opacity={a}><Pony x={105} y={100} scale={1.15} /><path d="M215 410 Q260 380 420 410" fill="none" stroke="#E2B83B" strokeWidth="14" strokeDasharray="12 6" /><rect x="58" y="26" width="340" height="65" rx="32" fill="#DFE8D8" /><text x="86" y="71" fontSize="32" fontWeight="850" fill={ink}>{String(params.measureLabel ?? meta.params.measureLabel.default)}</text></g>
          <g opacity={b}><Pony x={565} y={100} scale={1.15} size="M" sizeText={sizeLabels[1]} /><rect x="727" y="88" width="180" height="78" rx="22" fill={coat} /><text x="817" y="143" textAnchor="middle" fontSize="52" fontWeight="900" fill={paper}>{String(params.fittedLabel ?? meta.params.fittedLabel.default)}</text></g>
        </g> : null}
        {stage === 5 ? <g>
          <path d="M0 475 Q350 431 1100 480 L1100 650 H0 Z" fill="#A9D8D2" />
          <path d="M35 491 Q540 421 1070 492" fill="none" stroke="#E6CA9B" strokeWidth="68" strokeLinecap="round" />
          <path d="M35 491 Q540 421 1070 492" fill="none" stroke={ink} strokeWidth="7" opacity=".45" />
          <g opacity={a}><Pony x={370 + 105 * clamp(b)} y={77} scale={1.2} size="M" sizeText={sizeLabels[1]} step={s.t * .8} /></g>
          <g opacity={b}><rect x="705" y="93" width="285" height="78" rx="39" fill={coat} /><text x="847" y="147" textAnchor="middle" fontSize="39" fontWeight="850" fill={paper}>{String(params.ownSizeLabel ?? meta.params.ownSizeLabel.default)}</text></g>
        </g> : null}
      </svg>
    </div>
  </div>;
}
