import {ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {title: '社区停水通知', aspects: ['landscape', 'portrait'] as const, params: {
  phase: '通知展示阶段：time 时间、scope 范围、prepare 准备、resume 恢复；改阶段请改幕代码。',
  eyebrow: {type: 'text', label: '通知标签', default: '社区事务 / 虚构示例', help: '画面左上角的通知类别和示例说明。'},
  headline: {type: 'text', label: '主标题', default: '', help: '本幕的通知标题；原样片按幕提供文字。'},
  detail: {type: 'longtext', label: '通知详情', default: '', help: '本幕的补充说明；原样片按幕提供文字。'},
  resumeNote: {type: 'longtext', label: '恢复时间说明', default: '预计时间，以正式通知为准', help: '恢复阶段标题下方的提示。'},
  timeLabel: {type: 'text', label: '停水时长标签', default: '计划停水 · 3 小时', help: '时间阶段时钟下方的说明。'},
  buildingLabels: {type: 'list', label: '楼栋标签', default: ['1', '2', '3', '西'], help: '范围阶段四栋楼下方的文字标签。'},
  scopeLabel: {type: 'text', label: '影响范围标签', default: '东区影响范围', help: '范围阶段楼栋上方的说明。'},
  confirmationMark: {type: 'text', label: '确认状态符号', default: '?', help: '恢复阶段示意图中的确认状态文字。'},
  confirmationLabel: {type: 'text', label: '确认状态说明', default: '等待正式确认', help: '恢复阶段示意图中的状态说明。'},
  footer: {type: 'longtext', label: '页脚提醒', default: '示意信息 · 请勿据此安排实际用水', help: '画面右下角的示例使用提醒。'},
}};

export default function WaterNotice(props: SceneInput) {
  const s = useScene(props);
  const {theme, params, fonts} = props;
  const ink = '#173341';
  const c = s.box;
  const portrait = props.aspect === 'portrait';
  const u = props.width / (portrait ? 1080 : 1920);
  const phase = String(params.phase ?? 'time');
  const buildingLabels = (Array.isArray(params.buildingLabels) ? params.buildingLabels : meta.params.buildingLabels.default).map(String);
  const cue = (i: number, offset = 0) => {
    const index = Math.min(i, Math.max(0, props.sentences.length - 1));
    return props.sentences.length ? s.reveal(index, {offset, seconds: .68}) : ease((s.t - i - offset) / .68);
  };
  const a = cue(0), b = cue(1), final = cue(2, .05);
  const compactPortrait = portrait && c.height < 1200*u;
  const cardTop = c.top+(compactPortrait?190:285)*u;
  const infoRoom = (phase === 'resume' ? 342 : 242)*u;
  const card = portrait
    ? {left:c.left+12*u,top:cardTop,width:c.width-24*u,
      height:Math.min(c.height*.51,760*u,compactPortrait?c.bottom-cardTop-34*u-infoRoom:Infinity)}
    : {left:c.left+c.width*.45,top:c.top+55*u,width:c.width*.53,height:c.height-110*u};
  const info = portrait
    ? {left:c.left+12*u,top:card.top+card.height+34*u,width:c.width-24*u}
    : {left:c.left+20*u,top:c.top+175*u,width:c.width*.4};
  return <div style={{position:'absolute',inset:0,overflow:'hidden',background:theme.background,
    color:ink,fontFamily:fonts.text,opacity:s.fadeOut(10)}}>
    <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(90deg, #176C8510 1px, transparent 1px), linear-gradient(#176C8510 1px, transparent 1px)',
      backgroundSize:`${48*u}px ${48*u}px`}} />
    <div style={{position:'absolute',left:c.left+12*u,top:c.top+8*u,fontSize:22*u,fontWeight:800,
      letterSpacing:'.18em',color:theme.accent,opacity:a}}>{String(params.eyebrow ?? meta.params.eyebrow.default)}</div>
    <div style={{position:'absolute',...info,opacity:a}}>
      <div style={{fontSize:(portrait?75:82)*u,fontWeight:840,lineHeight:1.14,
        letterSpacing:'-.04em',overflowWrap:'anywhere'}}>{String(params.headline ?? meta.params.headline.default)}</div>
      <div style={{width:100*u,height:6*u,background:theme.accent,borderRadius:3*u,
        marginTop:32*u,transform:`scaleX(${b})`,transformOrigin:'left'}}/>
      <div style={{fontSize:(portrait?35:34)*u,lineHeight:1.35,marginTop:26*u,color:theme.muted,
        opacity:b}}>{String(params.detail ?? meta.params.detail.default)}</div>
      {phase === 'resume' && <div style={{fontSize:21*u,lineHeight:1.3,marginTop:30*u,
        padding:`${15*u}px ${18*u}px`,borderLeft:`${5*u}px solid ${theme.accent}`,
        background:'#D6E8EA',opacity:b}}>{String(params.resumeNote ?? meta.params.resumeNote.default)}</div>}
    </div>
    <div style={{position:'absolute',...card,borderRadius:28*u,background:'#F9FCFA',
      border:`${2*u}px solid #B5D0D4`,boxShadow:'0 22px 70px #27647329',opacity:a,overflow:'hidden'}}>
      <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="供水通知示意图">
        <defs>
          <linearGradient id="water" x1="0" x2="1"><stop stopColor="#69BDD0"/><stop offset="1" stopColor="#176C85"/></linearGradient>
          <linearGradient id="card" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#F7FBF9"/><stop offset="1" stopColor="#E3F0F0"/></linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#card)"/>
        <circle cx="654" cy="105" r="160" fill="#BDE3E9" opacity=".48"/>
        <circle cx="125" cy="520" r="138" fill="#CFE7E8" opacity=".52"/>
        <path d="M80 490 H720" stroke="#B8D7DA" strokeWidth="24" strokeLinecap="round"/>
        <path d="M80 490 H720" stroke="url(#water)" strokeWidth="12" strokeLinecap="round" strokeDasharray={phase === 'time' || phase === 'scope' ? '40 14' : undefined} opacity={phase === 'resume' ? b : .5}/>
        {phase === 'time' && <g>
          <circle cx="400" cy="260" r="164" fill="#FFFFFF" stroke="#176C85" strokeWidth="11"/>
          <circle cx="400" cy="260" r="128" fill="#EAF3F5"/>
          {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
            const theta=i*Math.PI/6-Math.PI/2;
            const x1=400+143*Math.cos(theta), y1=260+143*Math.sin(theta);
            const x2=400+128*Math.cos(theta), y2=260+128*Math.sin(theta);
            return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#176C85" strokeWidth="5" strokeLinecap="round"/>;
          })}
          <path d="M400 260 L295 260" stroke="#173341" strokeWidth="11" strokeLinecap="round"/>
          <path d="M400 260 L400 148" stroke="#173341" strokeWidth="9" strokeLinecap="round"/>
          <circle cx="400" cy="260" r="13" fill="#176C85"/>
          <path d="M220 415 H580" stroke="#176C85" strokeWidth="8" strokeLinecap="round" opacity={b}/>
          <circle cx="220" cy="415" r="14" fill="#176C85" opacity={b}/><circle cx="580" cy="415" r="14" fill="#176C85" opacity={b}/>
          <text x="400" y="555" textAnchor="middle" fill="#176C85" fontSize="27" fontWeight="800" opacity={b}>{String(params.timeLabel ?? meta.params.timeLabel.default)}</text>
        </g>}
        {phase === 'scope' && <g>
          {[0,1,2,3].map(i => {
            const x=130+i*145, selected=i<3;
            return <g key={i} opacity={selected ? 1 : .44}>
              <rect x={x} y="183" width="108" height="250" rx="8" fill={selected?'#D3EAED':'#E7EDEB'} stroke={selected?'#176C85':'#8DA5A8'} strokeWidth="5"/>
              {[0,1,2].map(row => <g key={row}><rect x={x+18} y={215+row*62} width="26" height="31" rx="3" fill="#F9FCFA"/>
                <rect x={x+62} y={215+row*62} width="26" height="31" rx="3" fill="#F9FCFA"/></g>)}
              <text x={x+54} y="473" textAnchor="middle" fill={selected?'#176C85':'#65828C'} fontSize="29" fontWeight="800">{buildingLabels[i]}</text>
            </g>;
          })}
          <path d="M180 145 H510" stroke="#176C85" strokeWidth="7" strokeLinecap="round" opacity={b}/>
          <text x="345" y="126" textAnchor="middle" fill="#176C85" fontSize="28" fontWeight="800" opacity={b}>{String(params.scopeLabel ?? meta.params.scopeLabel.default)}</text>
        </g>}
        {phase === 'prepare' && <g>
          <path d="M154 246 H332 Q359 246 359 272 V314" fill="none" stroke="#176C85" strokeWidth="28" strokeLinecap="round"/>
          <path d="M202 203 H293" stroke="#176C85" strokeWidth="24" strokeLinecap="round"/>
          <path d="M247 203 V246" stroke="#176C85" strokeWidth="15"/>
          <circle cx="359" cy="299" r="20" fill="#F3A847" stroke="#176C85" strokeWidth="7"/>
          <path d="M359 326 Q346 360 346 371 Q346 386 359 386 Q372 386 372 371 Q372 360 359 326 Z" fill="#6DB9CA" opacity={b}/>
          <path d="M507 330 H657 L638 449 Q636 470 612 470 H553 Q531 470 526 449 Z" fill="#D9EBEB" stroke="#176C85" strokeWidth="8"/>
          <path d="M532 415 Q580 426 650 414" fill="none" stroke="#6DB9CA" strokeWidth="11" opacity={b}/>
          <circle cx="247" cy="202" r="38" fill="none" stroke="#F3A847" strokeWidth="6" opacity={final}/>
          <path d="M530 228 L559 258 L624 188" fill="none" stroke="#176C85" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" opacity={final}/>
        </g>}
        {phase === 'resume' && <g>
          <path d="M229 218 H523 Q562 218 562 259 V350" fill="none" stroke="#176C85" strokeWidth="31" strokeLinecap="round"/>
          <path d="M324 171 H438 M381 171 V218" stroke="#176C85" strokeWidth="24" strokeLinecap="round"/>
          <path d="M561 377 Q542 429 542 450 Q542 480 562 480 Q582 480 582 450 Q582 429 561 377 Z" fill="#64B9CE" opacity={b}/>
          <path d="M476 466 Q560 486 648 466" fill="none" stroke="#176C85" strokeWidth="8" strokeLinecap="round" opacity={final}/>
          <circle cx="562" cy="313" r="75" fill="none" stroke="#F3A847" strokeWidth="7" opacity={a}/>
          <text x="252" y="380" fill="#176C85" fontSize="69" fontWeight="800">{String(params.confirmationMark ?? meta.params.confirmationMark.default)}</text>
          <text x="246" y="424" fill="#65828C" fontSize="24">{String(params.confirmationLabel ?? meta.params.confirmationLabel.default)}</text>
        </g>}
      </svg>
    </div>
    <div style={{position:'absolute',right:props.width-c.right,bottom:props.height-c.bottom,
      color:theme.muted,fontSize:17*u,letterSpacing:'.1em'}}>{String(params.footer ?? meta.params.footer.default)}</div>
  </div>;
}
