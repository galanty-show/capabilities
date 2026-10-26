import {ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {title: '三页读书笔记', aspects: ['landscape', 'portrait'] as const, params: {
  phase: '笔记展示阶段：intro 留白、question 提问、compare 对照、action 试做；改阶段请改幕代码。',
  eyebrow: {type: 'text', label: '章节标签', default: '阅读手记', help: '标题上方、章节编号前的短标签。'},
  number: {type: 'text', label: '章节编号', default: '00', help: '标题上方显示的文字编号。'},
  heading: {type: 'text', label: '主标题', default: '', help: '本幕的阅读笔记标题；原样片按幕提供文字。'},
  support: {type: 'longtext', label: '补充说明', default: '', help: '本幕的阅读方法说明；原样片按幕提供文字。'},
  notes: {type: 'list', label: '阶段笔记卡片', default: [
    {number: '00', title: '留白', detail: '为自己的问题留位置'},
    {number: '01', title: '提问', detail: '用自己的话追问'},
    {number: '02', title: '对照', detail: '并排相似与冲突'},
    {number: '03', title: '试做', detail: '给明天一个起点'},
  ], item: [{key: 'number', label: '编号', type: 'text'}, {key: 'title', label: '标题', type: 'text'}, {key: 'detail', label: '说明', type: 'text'}], help: '竖版下方的卡片，依次对应留白、提问、对照和试做四个阶段。'},
  questionMark: {type: 'text', label: '问题符号', default: '?', help: '提问阶段纸面上的问题文字。'},
  questionLabel: {type: 'text', label: '追问提示', default: '我还想知道什么？', help: '提问阶段纸面底部的提示。'},
  clueLabels: {type: 'list', label: '对照线索标签', default: ['线索 A', '线索 B'], help: '对照阶段两栏上方的文字标签。'},
  paperLabel: {type: 'text', label: '纸面页脚标签', default: 'NOTES / 01—03', help: '笔记示意图底部的页码文字。'},
  footer: {type: 'longtext', label: '页脚说明', default: '原创笔记 · 无真实书名或引文', help: '画面右下角的笔记来源说明。'},
}};

export default function ReadingNotes(props: SceneInput) {
  const s = useScene(props);
  const {theme, params, fonts} = props;
  const ink = '#263B48';
  const c = s.box;
  const portrait = props.aspect === 'portrait';
  const u = props.width / (portrait ? 1080 : 1920);
  const phase = String(params.phase ?? 'intro');
  const cue = (i: number, offset = 0) => {
    const index = Math.min(i, Math.max(0, props.sentences.length - 1));
    return props.sentences.length ? s.reveal(index, {offset, seconds: .78}) : ease((s.t - i - offset) / .78);
  };
  const enter = cue(0), mark = cue(1), complete = cue(2, .08);
  const art = portrait
    ? {left:c.left+10*u,top:c.top+240*u,width:c.width-20*u,height:Math.min(c.height*.54,760*u)}
    : {left:c.left+c.width*.43,top:c.top+28*u,width:c.width*.55,height:c.height-56*u};
  const text = portrait
    ? {left:c.left+16*u,top:c.top+6*u,width:c.width-32*u}
    : {left:c.left+16*u,top:c.top+c.height*.19,width:c.width*.39};
  const supportTop = portrait ? art.top+art.height+28*u : c.top+c.height*.69;
  const notes = Array.isArray(params.notes) ? params.notes : meta.params.notes.default;
  const noteIndex = phase === 'intro' ? 0 : phase === 'question' ? 1 : phase === 'compare' ? 2 : 3;
  const note = notes[noteIndex] ?? {};
  const clueLabels = (Array.isArray(params.clueLabels) ? params.clueLabels : meta.params.clueLabels.default).map(String);
  return <div style={{position:'absolute',inset:0,overflow:'hidden',background:theme.background,
    color:ink,fontFamily:fonts.text,opacity:s.fadeOut(10)}}>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 73% 47%, #D8A77A30, transparent 47%)'}} />
    <div style={{position:'absolute',...text,zIndex:2}}>
      <div style={{fontSize:22*u,color:theme.accent,fontWeight:800,letterSpacing:'.18em',opacity:enter}}>
        {`${String(params.eyebrow ?? meta.params.eyebrow.default)} / `}{String(params.number ?? meta.params.number.default)}
      </div>
      <div style={{marginTop:27*u,fontSize:(portrait?72:78)*u,fontWeight:820,
        lineHeight:1.15,letterSpacing:'-.035em',opacity:enter,
        transform:`translateY(${(1-enter)*26*u}px)`}}>{String(params.heading ?? meta.params.heading.default)}</div>
      <div style={{width:108*u,height:6*u,marginTop:29*u,background:theme.accent,borderRadius:3*u,
        transform:`scaleX(${enter})`,transformOrigin:'left'}}/>
    </div>
    <div style={{position:'absolute',...art,borderRadius:24*u,background:'#E7DAC5',
      border:`${2*u}px solid #C9B9A2`,boxShadow:'0 25px 70px #59432B32',opacity:enter,overflow:'hidden'}}>
      <svg viewBox="0 0 800 600" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-label="原创阅读笔记的纸面变化">
        <defs>
          <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFFDF5"/><stop offset="1" stopColor="#F6ECD9"/></linearGradient>
          <linearGradient id="cover" x1="0" x2="1"><stop stopColor="#274455"/><stop offset="1" stopColor="#3A5B66"/></linearGradient>
        </defs>
        <rect width="800" height="600" fill="#E9DDCA"/>
        <path d="M0 98 H800 M0 505 H800" stroke="#D8C9B1" strokeWidth="2" opacity=".7"/>
        <g transform="rotate(-5 292 292)">
          <rect x="70" y="95" width="425" height="395" rx="12" fill="#A8A08C" opacity=".22"/>
          <path d="M88 78 Q74 80 74 97 V459 Q74 478 91 480 H470 Q487 478 487 460 V97 Q486 79 467 78 Z" fill="url(#cover)"/>
          <path d="M120 79 V480" stroke="#E9D6AE" strokeWidth="8" opacity=".75"/>
          <path d="M153 143 H420 M153 172 H366 M153 328 H427 M153 357 H399" stroke="#A6BCB8" strokeOpacity=".34" strokeWidth="8" strokeLinecap="round"/>
          <path d="M153 387 H344" stroke="#A6BCB8" strokeOpacity=".34" strokeWidth="8" strokeLinecap="round"/>
          <rect x="153" y="225" width="210" height="5" rx="2" fill="#C97A55" opacity=".75"/>
          <rect x="153" y="244" width="158" height="5" rx="2" fill="#C97A55" opacity=".55"/>
        </g>
        <g transform={`translate(${(1-mark)*100} ${(1-mark)*70}) rotate(5 544 306)`} opacity={mark}>
          <rect x="367" y="110" width="365" height="395" rx="10" fill="#5B4C3B" opacity=".16" transform="translate(8 10)"/>
          <rect x="367" y="110" width="365" height="395" rx="10" fill="url(#paper)" stroke="#DFCDAE" strokeWidth="3"/>
          <path d="M393 174 H706 M393 239 H706 M393 304 H706 M393 369 H706 M393 434 H706" stroke="#9FB9B9" strokeOpacity=".28" strokeWidth="2"/>
          <circle cx="389" cy="156" r="5" fill="#C9BDAA"/><circle cx="389" cy="221" r="5" fill="#C9BDAA"/>
          <circle cx="389" cy="286" r="5" fill="#C9BDAA"/><circle cx="389" cy="351" r="5" fill="#C9BDAA"/>
          {phase === 'intro' && <g>
            <path d="M440 201 H650 M440 270 H600 M440 339 H665" stroke="#CAD2C8" strokeWidth="8" strokeLinecap="round" strokeDasharray="8 13"/>
          </g>}
          {phase === 'question' && <g>
            <text x="420" y="315" fill="#CB734E" fontSize="148" fontWeight="800" opacity={mark}>{String(params.questionMark ?? meta.params.questionMark.default)}</text>
            <path d="M542 229 H675 M542 275 H654 M542 321 H630" stroke="#456A77" strokeWidth="10" strokeLinecap="round" opacity={complete}/>
            <path d="M425 374 H675" stroke="#CB734E" strokeWidth="5" strokeLinecap="round" opacity={complete}/>
            <text x="425" y="427" fill="#456A77" fontSize="26" fontWeight="700" opacity={complete}>{String(params.questionLabel ?? meta.params.questionLabel.default)}</text>
          </g>}
          {phase === 'compare' && <g>
            <rect x="405" y="193" width="131" height="204" rx="7" fill="#E2ECE8" stroke="#8CAAA8" strokeWidth="3"/>
            <rect x="561" y="193" width="131" height="204" rx="7" fill="#F2E6D3" stroke="#D3B695" strokeWidth="3"/>
            <text x="449" y="233" fill="#456A77" fontSize="25" fontWeight="800">{clueLabels[0]}</text>
            <text x="604" y="233" fill="#A76646" fontSize="25" fontWeight="800">{clueLabels[1]}</text>
            {[0,1,2].map(i => <g key={i}><path d={`M422 ${269+i*43} H518`} stroke="#7699A2" strokeWidth="7" strokeLinecap="round"/>
              <path d={`M579 ${269+i*43} H676`} stroke="#BA9378" strokeWidth="7" strokeLinecap="round"/></g>)}
            <path d="M530 423 C569 447 610 447 649 423" fill="none" stroke="#CB734E" strokeWidth="6" opacity={complete}/>
            <circle cx="617" cy="331" r="39" fill="none" stroke="#CB734E" strokeWidth="7" opacity={complete}/>
          </g>}
          {phase === 'action' && <g>
            <rect x="409" y="210" width="54" height="54" rx="7" fill="none" stroke="#456A77" strokeWidth="6"/>
            <path d="M418 235 L431 249 L459 217" fill="none" stroke="#CB734E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity={complete}/>
            <path d="M486 225 H675 M486 259 H641" stroke="#456A77" strokeWidth="10" strokeLinecap="round"/>
            <path d="M412 316 H673 M412 354 H600" stroke="#A5B7B2" strokeWidth="8" strokeLinecap="round" opacity={mark}/>
            <path d="M414 426 H666" stroke="#CB734E" strokeWidth="6" strokeLinecap="round" opacity={complete}/>
            <circle cx="664" cy="426" r="10" fill="#CB734E" opacity={complete}/>
          </g>}
        </g>
        <path d="M107 538 H684" stroke="#C6B99F" strokeWidth="3" strokeLinecap="round"/>
        <text x="112" y="566" fill="#7A8786" fontSize="17" fontWeight="700" letterSpacing="3">{String(params.paperLabel ?? meta.params.paperLabel.default)}</text>
      </svg>
    </div>
    <div style={{position:'absolute',left:portrait?c.left+16*u:c.left+16*u,top:supportTop,
      width:portrait?c.width-32*u:c.width*.37,color:theme.muted,
      fontSize:(portrait?36:34)*u,fontWeight:580,lineHeight:1.3,opacity:mark}}>
      {String(params.support ?? meta.params.support.default)}
    </div>
    {portrait && <div style={{position:'absolute',left:c.left+16*u,top:supportTop+112*u,
      width:c.width-32*u,height:224*u,boxSizing:'border-box',padding:`${29*u}px ${34*u}px`,
      background:'#FFF9EC',border:`${2*u}px solid #D5BCA1`,borderRadius:16*u,
      boxShadow:'0 13px 30px #59432B1C',opacity:complete}}>
      <div style={{display:'flex',alignItems:'baseline',gap:23*u}}>
        <span style={{fontSize:26*u,fontWeight:800,color:theme.accent}}>{String(note.number ?? '')}</span>
        <span style={{fontSize:48*u,fontWeight:800,color:ink}}>{String(note.title ?? '')}</span>
      </div>
      <div style={{width:90*u,height:4*u,background:theme.accent,marginTop:15*u}}/>
      <div style={{fontSize:29*u,color:theme.muted,marginTop:18*u,fontWeight:600}}>{String(note.detail ?? '')}</div>
    </div>}
    <div style={{position:'absolute',right:props.width-c.right,bottom:props.height-c.bottom,
      color:theme.muted,fontSize:17*u,letterSpacing:'.12em'}}>{String(params.footer ?? meta.params.footer.default)}</div>
  </div>;
}
