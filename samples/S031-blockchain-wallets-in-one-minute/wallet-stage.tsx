import {ParticleGlyph, OrbitHalo, ease, clamp, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  "title": "钱包小课",
  "params": {
    "mode": "原有画面阶段选择；改画面结构时直接修改幕代码，不生成控件。",
    "index": "原有幕序号，用于页码与进度显示，不生成控件。",
    "title": {
      "label": "标题",
      "type": "text",
      "default": "undefined",
      "help": "沿用分镜中的标题；缺失时保留原来的显示文字。"
    },
    "lessonLabel": {
      "label": "课程标记",
      "type": "text",
      "default": "钱包小课 / ",
      "help": "标题上方的课程文字，末尾空格连接幕序号。"
    },
    "walletLabel": {
      "label": "钱包说明",
      "type": "text",
      "default": "你的钱包 · 管理密钥",
      "help": "钱包图形下方的说明文字。"
    },
    "recordLabel": {
      "label": "记录说明",
      "type": "text",
      "default": "链上记录",
      "help": "链上记录图形下方的说明文字。"
    },
    "roleLabels": {
      "label": "地址与密钥说明",
      "type": "list",
      "default": [
        {
          "title": "地址",
          "description": "可以分享的收件口"
        },
        {
          "title": "密钥",
          "description": "自己保管的签字笔"
        }
      ],
      "help": "按地址、密钥顺序编辑两组说明。",
      "item": [
        {
          "key": "title",
          "label": "名称",
          "type": "text"
        },
        {
          "key": "description",
          "label": "解释",
          "type": "text"
        }
      ]
    },
    "networkLabels": {
      "label": "网络与地址名称",
      "type": "list",
      "default": [
        {
          "name": "网络甲",
          "address": "甲地址"
        },
        {
          "name": "网络乙",
          "address": "乙地址"
        }
      ],
      "help": "按上下两条独立路径编辑名称，不改变路径。",
      "item": [
        {
          "key": "name",
          "label": "网络名称",
          "type": "text"
        },
        {
          "key": "address",
          "label": "地址名称",
          "type": "text"
        }
      ]
    },
    "networkNote": {
      "label": "网络提示",
      "type": "text",
      "default": "两条独立路径，不画成跨网直达",
      "help": "两条网络路径下方的提示文字。"
    },
    "processLabels": {
      "label": "操作步骤",
      "type": "list",
      "default": [
        "核对内容",
        "签名授权",
        "网络确认"
      ],
      "help": "依次显示三步操作的名称。"
    },
    "processNumbers": {
      "label": "步骤编号",
      "type": "list",
      "default": [
        "01",
        "02",
        "03"
      ],
      "help": "三步操作的显示编号，不改变步骤顺序。"
    },
    "updateLabel": {
      "label": "确认结果",
      "type": "text",
      "default": "记录更新",
      "help": "网络确认步骤下方的结果文字。"
    },
    "backupTitle": {
      "label": "备份标题",
      "type": "text",
      "default": "备份 → 恢复",
      "help": "备份示意卡上方的标题。"
    },
    "backupNote": {
      "label": "备份卡说明",
      "type": "text",
      "default": "示意卡 · 不展示真实助记词",
      "help": "保留示意卡用途说明，可替换文字。"
    },
    "backupWarning": {
      "label": "保管提示",
      "type": "text",
      "default": "别把钥匙，发给别人。",
      "help": "备份示意下方的保管提示。"
    },
    "summaryLabels": {
      "label": "总结要点",
      "type": "list",
      "default": [
        "钱包操作",
        "密钥签名",
        "链上记录"
      ],
      "help": "依次显示钱包、密钥、网络图形下的总结。"
    },
    "footerTitle": {
      "label": "页脚标题",
      "type": "text",
      "default": "一分钟认识区块链钱包",
      "help": "每幕底部显示的课程名称。"
    },
    "footerCount": {
      "label": "页脚总页数",
      "type": "text",
      "default": " / 06",
      "help": "页脚幕序号后的文字，包含原有空格与分隔符。"
    }
  }
};

export default function WalletStage(p: SceneInput) {
  const s = useScene(p), c = s.box, {width: w, height: h, frame, seed, theme, fonts, params} = p;
  const roleLabels = (params.roleLabels ?? meta.params.roleLabels.default) as typeof meta.params.roleLabels.default;
  const networkLabels = (params.networkLabels ?? meta.params.networkLabels.default) as typeof meta.params.networkLabels.default;
  const processLabels = (params.processLabels ?? meta.params.processLabels.default) as typeof meta.params.processLabels.default;
  const processNumbers = (params.processNumbers ?? meta.params.processNumbers.default) as typeof meta.params.processNumbers.default;
  const summaryLabels = (params.summaryLabels ?? meta.params.summaryLabels.default) as typeof meta.params.summaryLabels.default;
  const mode = String(params.mode), index = Number(params.index), light = mode === 'roles';
  const bg = light ? '#EEEFE6' : theme.background, ink = light ? '#132A32' : theme.text;
  const accent = light ? '#47791F' : theme.accent, blue = light ? '#167D95' : '#6ACDDF';
  const enter = ease(s.t / .65), r = (i: number) => s.reveal(i, {seconds: .7});
  const top = c.top + 185, floor = c.bottom - 30, bodyH = floor - top;
  const label = (text: string, x: number, y: number, color = ink, size = 30) => <text x={x} y={y} fill={color} fontSize={size} fontWeight={650} textAnchor="middle">{text}</text>;
  return <div style={{position:'absolute',inset:0,background:bg,color:ink,fontFamily:fonts.text,overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,background:`radial-gradient(ellipse at 72% 52%, ${light?'#C4DCCB55':'#28514F44'}, transparent 60%)`}} />
    <div style={{position:'absolute',left:c.left,top:c.top,opacity:enter}}>
      <div style={{fontSize:20,letterSpacing:5,color:accent}}>{String(params.lessonLabel ?? meta.params.lessonLabel.default)}{String(index).padStart(2,'0')}</div>
      <div style={{fontSize:64,fontWeight:800,letterSpacing:-2,marginTop:22}}>{String(params.title === undefined ? meta.params.title.default : params.title)}</div>
      <div style={{width:96,height:5,background:accent,marginTop:25}} />
    </div>
    {mode === 'wallet' && <>
      <ParticleGlyph name="wallet" from="scatter" progress={ease(s.t/1.4)} frame={frame} seed={seed} x={w*.39} y={top+bodyH*.53} size={490} halo accent={accent}/>
      <svg width={w} height={h} style={{position:'absolute',inset:0}}>
        <g opacity={r(2)}><path d={`M ${w*.61} ${top+bodyH*.4} H ${w*.74}`} stroke={blue} strokeWidth={3} strokeDasharray="9 12"/>
          {[0,1,2].map(i=><g key={i} transform={`translate(${w*.69+i*105} ${top+bodyH*.32+i*44})`}><rect width="205" height="135" rx="13" fill="#172F3B" stroke={blue} strokeWidth="2"/>{[0,1,2].map(j=><path key={j} d={`M 25 ${38+j*25} H ${145-j*20}`} stroke={j===0?accent:'#6B8B98'} strokeWidth="5"/>)}</g>)}
          {label(String(params.recordLabel ?? meta.params.recordLabel.default),w*.80, floor-10,blue,32)}</g>
        <g opacity={r(1)}>{label(String(params.walletLabel ?? meta.params.walletLabel.default),w*.36,floor-10,ink,34)}</g>
      </svg>
    </>}
    {mode === 'roles' && <>
      <svg width={w} height={h} style={{position:'absolute',inset:0}}>
        <path d={`M ${w/2} ${top+10} V ${floor-20}`} stroke="#A4B4AA" strokeWidth="2"/>
        <g opacity={r(0)}><rect x={w*.17} y={top+50} width={420} height={240} rx="20" fill="#D8E7DE" stroke={blue} strokeWidth="3"/>
          <path d={`M ${w*.17+12} ${top+60} L ${w*.17+210} ${top+195} L ${w*.17+408} ${top+60}`} fill="none" stroke={blue} strokeWidth="4"/>
          {label(String(roleLabels[0]?.title ?? ''),w*.28,top+350,blue,52)}{label(String(roleLabels[0]?.description ?? ''),w*.28,top+402,ink,30)}</g>
        <g opacity={r(1)}>{label(String(roleLabels[1]?.title ?? ''),w*.73,top+350,accent,52)}{label(String(roleLabels[1]?.description ?? ''),w*.73,top+402,ink,30)}</g>
      </svg>
      <ParticleGlyph name="key" from="scatter" progress={r(1)} frame={frame} seed={seed} x={w*.73} y={top+165} size={300} tone="light" accent={accent} opacity={r(1)}/>
    </>}
    {mode === 'networks' && <svg width={w} height={h} style={{position:'absolute',inset:0}}>
      {[0,1].map(i=>{const y=top+110+i*210,col=i?blue:accent,a=r(i);return <g key={i} opacity={a}>
        <rect x={c.left} y={y-65} width={c.width} height={135} rx="24" fill={i?'#18303E':'#263629'}/>
        {label(String(networkLabels[i]?.name ?? ''),c.left+125,y+10,col,36)}
        <path d={`M ${c.left+260} ${y} H ${c.right-220}`} stroke={col} strokeWidth="3" strokeDasharray="10 12"/>
        <rect x={c.left+270+(c.width-570)*clamp((s.t-(s.sentence(i)?.start??0))/5)} y={y-30} width="60" height="60" rx="10" fill={col}/>
        {label(String(networkLabels[i]?.address ?? ''),c.right-120,y+10,col,32)}
      </g>})}
      <g opacity={r(2)}>{label(String(params.networkNote ?? meta.params.networkNote.default),w/2,floor,theme.muted,25)}</g>
    </svg>}
    {mode === 'process' && <svg width={w} height={h} style={{position:'absolute',inset:0}}>
      <path d={`M ${w*.2} ${top+170} H ${w*.80}`} stroke="#35505C" strokeWidth="5"/>
      {processLabels.map((txt,i)=>{const a=r(i),x=w*(.2+i*.3);return <g key={txt}>
        <circle cx={x} cy={top+170} r="91" fill="#142C36" stroke={a>.1?accent:'#35505C'} strokeWidth="3"/>
        <g opacity={a}><text x={x} y={top+194} textAnchor="middle" fontSize="65" fill={accent} fontWeight="750">{processNumbers[i]}</text>
        {label(txt,x,top+325,ink,38)}{i===2?label(String(params.updateLabel ?? meta.params.updateLabel.default),x,top+382,blue,26):null}</g>
      </g>})}
    </svg>}
    {mode === 'backup' && <>
      <ParticleGlyph name="shield" from="key" progress={ease(s.t/1.3)} frame={frame} seed={seed} x={w*.68} y={top+bodyH*.46} size={435} halo accent={accent}/>
      <div style={{position:'absolute',left:c.left,top:top+55,width:520,opacity:r(0)}}>
        <div style={{fontSize:42,fontWeight:750}}>{String(params.backupTitle ?? meta.params.backupTitle.default)}</div>
        <div style={{marginTop:32,padding:30,border:'2px solid #48606C',borderRadius:18,background:'#152B35'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>{Array.from({length:6},(_,i)=><div key={i} style={{height:35,borderRadius:6,background:'#49606A',opacity:.6}}/>)}</div>
          <div style={{fontSize:24,marginTop:25,color:theme.muted}}>{String(params.backupNote ?? meta.params.backupNote.default)}</div>
        </div>
        <div style={{fontSize:34,color:accent,marginTop:38,opacity:r(1)}}>{String(params.backupWarning ?? meta.params.backupWarning.default)}</div>
      </div>
    </>}
    {mode === 'summary' && <>
      <OrbitHalo frame={frame} seed={seed} x={w/2} y={top+210} size={540} accent={blue} opacity={.22}/>
      {(['wallet','key','network'] as const).map((name,i)=>{const a=r(Math.min(i,1)),x=w*(.2+i*.3);return <div key={name} style={{position:'absolute',inset:0,opacity:a}}>
        <ParticleGlyph name={name} frame={frame} seed={seed+i} x={x} y={top+160} size={220} accent={i===1?accent:blue}/>
        <div style={{position:'absolute',left:x-190,top:top+320,width:380,textAlign:'center',fontSize:40,fontWeight:750}}>{summaryLabels[i]}</div>
      </div>})}
    </>}
    <div style={{position:'absolute',left:c.left,right:w-c.right,bottom:27,display:'flex',gap:20,alignItems:'center',fontSize:16,color:light?'#64776D':theme.muted}}>
      <span>{String(params.footerTitle ?? meta.params.footerTitle.default)}</span><div style={{height:2,background:light?'#B8C6BB':'#314854',flex:1}}><div style={{height:2,background:accent,width:`${((index-1+frame/p.durationInFrames)/6)*100}%`}}/></div><span>{String(index).padStart(2,'0')}{String(params.footerCount ?? meta.params.footerCount.default)}</span>
    </div>
  </div>;
}
