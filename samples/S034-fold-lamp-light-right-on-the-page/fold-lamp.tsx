import {ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {title: '折页桌灯', aspects: ['landscape', 'portrait'] as const, params: {
  phase: '产品展示阶段：before 使用前、form 产品形态、use 使用、after 使用后；改阶段请改幕代码。',
  eyebrow: {type: 'text', label: '章节标签', default: '', help: '标题上方的短标签；原样片按幕提供文字。'},
  headline: {type: 'text', label: '主标题', default: '', help: '本幕的产品说明标题；原样片按幕提供文字。'},
  detail: {type: 'longtext', label: '补充说明', default: '', help: '画面下方的产品说明；原样片按幕提供文字。'},
  productLabel: {type: 'text', label: '产品图标签', default: 'FOLD / LAMP', help: '桌灯示意图左下角的产品名称。'},
  beforeTags: {type: 'list', label: '使用前要点', default: ['灯在角落', '书页阴影'], help: '使用前阶段竖版卡片的两条说明。'},
  formTags: {type: 'list', label: '产品形态要点', default: ['薄底座', '可折灯臂'], help: '产品形态阶段竖版卡片的两条说明。'},
  useTags: {type: 'list', label: '使用步骤要点', default: ['推近书旁', '轻转旋钮'], help: '使用阶段竖版卡片的两条说明。'},
  afterTags: {type: 'list', label: '使用后要点', default: ['收起灯面', '留出杯位'], help: '使用后阶段竖版卡片的两条说明。'},
  tagNumbers: {type: 'list', label: '要点编号', default: ['01', '02'], help: '竖版两张要点卡片上方的文字编号。'},
  footer: {type: 'text', label: '页脚说明', default: '虚构产品演示', help: '画面右下角的示例说明。'},
}};

export default function FoldLamp(props: SceneInput) {
  const s = useScene(props);
  const {theme, params, fonts, aspect} = props;
  const c = s.box;
  const portrait = aspect === 'portrait';
  const u = props.width / (portrait ? 1080 : 1920);
  const phase = String(params.phase ?? 'before');
  const before = phase === 'before';
  const form = phase === 'form';
  const use = phase === 'use';
  const after = phase === 'after';
  const cue = (i: number, offset = 0) => {
    const index = Math.min(i, Math.max(0, props.sentences.length - 1));
    return props.sentences.length ? s.reveal(index, {offset, seconds: .75}) : ease((s.t - i - offset) / .75);
  };
  const enter = cue(0);
  const unfold = cue(1);
  const finish = cue(2, .15);
  const raised = before ? 0 : form ? unfold : use ? Math.max(.2, unfold) : .25 * (1 - unfold);
  const light = before ? .12 : form ? .32 * unfold : use ? .85 * finish : .3 * (1 - unfold);
  const art = portrait
    ? {left: c.left + c.width * .025, top: c.top + 210 * u, width: c.width * .95, height: Math.min(c.height * .53, 760 * u)}
    : {left: c.left + c.width * .41, top: c.top + c.height * .06, width: c.width * .59, height: c.height * .89};
  const text = portrait
    ? {left: c.left + 16 * u, top: c.top + 8 * u, width: c.width - 32 * u}
    : {left: c.left + 12 * u, top: c.top + c.height * .19, width: c.width * .38};
  const subtitleTop = portrait ? art.top + art.height + 20 * u : c.top + c.height * .67;
  const tagsKey = before ? 'beforeTags' : form ? 'formTags' : use ? 'useTags' : 'afterTags';
  const tags = (Array.isArray(params[tagsKey]) ? params[tagsKey] : meta.params[tagsKey].default).map(String);
  const tagNumbers = (Array.isArray(params.tagNumbers) ? params.tagNumbers : meta.params.tagNumbers.default).map(String);
  return <div style={{position:'absolute',inset:0,overflow:'hidden',background:theme.background,
    color:theme.text,fontFamily:fonts.text,opacity:s.fadeOut(10)}}>
    <div style={{position:'absolute',inset:0,background:'radial-gradient(circle at 78% 45%, #F3A84718, transparent 45%)'}} />
    <div style={{position:'absolute',...text,zIndex:2}}>
      <div style={{fontSize:23*u,fontWeight:750,letterSpacing:'.17em',color:theme.accent,
        opacity:enter}}>{String(params.eyebrow ?? meta.params.eyebrow.default)}</div>
      <div style={{fontSize:(portrait?69:82)*u,fontWeight:800,lineHeight:1.13,marginTop:26*u,
        letterSpacing:'-.04em',opacity:enter,transform:`translateY(${(1-enter)*28*u}px)`}}>
        {String(params.headline ?? meta.params.headline.default)}
      </div>
      <div style={{width:110*u,height:6*u,background:theme.accent,borderRadius:3*u,
        marginTop:29*u,transform:`scaleX(${enter})`,transformOrigin:'left'}} />
    </div>
    <div style={{position:'absolute',...art,opacity:enter,background:'#172E3B',border:`${2*u}px solid #78919A44`,
      borderRadius:32*u,overflow:'hidden',boxShadow:'0 28px 80px #07121B80'}}>
      <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" aria-label="可折叠桌灯与阅读桌面">
        <defs>
          <linearGradient id="desk" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#315061"/><stop offset="1" stopColor="#193341"/></linearGradient>
          <linearGradient id="shade" x1="0" x2="1"><stop stopColor="#FFF1CD"/><stop offset="1" stopColor="#F3A847"/></linearGradient>
          <radialGradient id="glow"><stop stopColor="#FFD786" stopOpacity=".45"/><stop offset="1" stopColor="#FFD786" stopOpacity="0"/></radialGradient>
        </defs>
        <rect x="0" y="0" width="800" height="600" fill="#172E3B"/>
        <path d="M0 420 H800 V600 H0 Z" fill="url(#desk)"/>
        <path d="M0 421 H800" stroke="#809BA3" strokeOpacity=".45" strokeWidth="3"/>
        <ellipse cx="385" cy="447" rx="280" ry="104" fill="url(#glow)" opacity={light}/>
        <g transform="translate(0 5)">
          <path d="M166 427 L355 407 L522 433 L335 461 Z" fill="#EFE9D7" stroke="#C9BFA8" strokeWidth="3"/>
          <path d="M335 461 L522 433 L522 455 L335 484 Z" fill="#C7C1B1"/>
          <path d="M166 427 L335 461 L335 484 L166 450 Z" fill="#DCD5C3"/>
          <path d="M337 460 L337 481" stroke="#A89F8E" strokeWidth="3"/>
          {[0,1,2,3].map(i => <path key={i} d={`M${205+i*28} ${435+i*1.5} L${297+i*10} ${452+i*1.5}`} stroke="#7E9BA4" strokeOpacity=".45" strokeWidth="2"/>)}
          {[0,1,2].map(i => <path key={i} d={`M${367+i*27} ${445-i*2} L${475+i*9} ${431+i*1}`} stroke="#7E9BA4" strokeOpacity=".45" strokeWidth="2"/>)}
        </g>
        <path d="M555 465 L636 454 L673 468 L596 482 Z" fill="#E5D7B9"/>
        <path d="M568 469 L626 461" stroke="#A6A0A0" strokeWidth="3"/>
        {after && <g opacity={unfold} transform="translate(61 0)"><ellipse cx="681" cy="439" rx="44" ry="13" fill="#0D2633" opacity=".5"/>
          <path d="M642 391 Q644 448 681 448 Q718 448 720 391 Z" fill="#D8E6E5" stroke="#F5F4E9" strokeWidth="4"/>
          <path d="M646 393 Q682 407 716 393" fill="none" stroke="#F5F4E9" strokeWidth="4"/></g>}
        {/* 连续的同一件实体：薄底座、橙色旋钮、双段灯臂、灯面。 */}
        <ellipse cx="603" cy="445" rx="112" ry="21" fill="#0A1720" opacity=".55"/>
        <path d="M509 427 Q510 413 530 412 L677 412 Q699 413 701 427 L704 442 Q703 450 689 452 L519 452 Q505 450 505 442 Z" fill="#EAE4D3" stroke="#B6B9B4" strokeWidth="4"/>
        <path d="M532 419 H680" stroke="#FFFFFF" strokeOpacity=".65" strokeWidth="4"/>
        <circle cx="598" cy="410" r="22" fill="#D78637" stroke="#FFCF74" strokeWidth="5"/>
        <circle cx="598" cy="410" r="7" fill="#FFF0CA"/>
        <g opacity={before ? .25 : 1}>
          <path d={`M598 408 L${598-100*raised} ${408-170*raised}`} fill="none" stroke="#102936" strokeWidth="25" strokeLinecap="round"/>
          <path d={`M${598-100*raised} ${408-170*raised} L${570-240*raised} ${397-220*raised}`} fill="none" stroke="#183746" strokeWidth="19" strokeLinecap="round"/>
          <circle cx={598-100*raised} cy={408-170*raised} r="14" fill="#E6E0D0" stroke="#F3A847" strokeWidth="4"/>
          <g transform={`translate(${552-250*raised} ${380-220*raised}) rotate(${-30*raised})`}>
            <rect x="-12" y="-16" width="150" height="38" rx="16" fill="#E9E4D4" stroke="#F5F4E9" strokeWidth="3"/>
            <rect x="0" y="15" width="126" height="8" rx="4" fill="url(#shade)" opacity={before ? .25 : 1}/>
          </g>
        </g>
        {before && <path d="M200 343 Q334 320 450 354" fill="none" stroke="#152733" strokeWidth="60" opacity=".65"/>}
        {use && <g opacity={finish}><path d="M170 542 H605" stroke="#F3A847" strokeWidth="4" strokeDasharray="8 12"/>
          <circle cx="335" cy="480" r="8" fill="#F3A847"/></g>}
        {form && <g opacity={unfold}><path d="M660 305 V380" stroke="#F3A847" strokeWidth="3" strokeDasharray="7 8"/>
          <path d="M651 311 L660 301 L669 311" fill="none" stroke="#F3A847" strokeWidth="3"/></g>}
      </svg>
      <div style={{position:'absolute',left:24*u,bottom:20*u,fontSize:19*u,fontWeight:700,
        color:'#EAE4D3',letterSpacing:'.12em'}}>{String(params.productLabel ?? meta.params.productLabel.default)}</div>
    </div>
    <div style={{position:'absolute',left:portrait?c.left+16*u:c.left+12*u,top:subtitleTop,
      width:portrait?c.width-32*u:c.width*.36,color:theme.muted,fontSize:(portrait?36:34)*u,
      fontWeight:550,lineHeight:1.32,opacity:unfold}}>{String(params.detail ?? meta.params.detail.default)}</div>
    {portrait && <div style={{position:'absolute',left:c.left+16*u,top:subtitleTop+112*u,
      width:c.width-32*u,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16*u,opacity:finish}}>
      {tags.map((tag,i)=><div key={tag} style={{height:142*u,boxSizing:'border-box',padding:`${27*u}px ${29*u}px`,
        border:`${2*u}px solid #F3A84766`,borderRadius:18*u,background:'#1A3441',
        display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <span style={{fontSize:20*u,color:theme.accent,fontWeight:800}}>{tagNumbers[i]}</span>
        <span style={{fontSize:30*u,color:theme.text,fontWeight:700}}>{tag}</span>
      </div>)}
    </div>}
    <div style={{position:'absolute',right:props.width-c.right,bottom:props.height-c.bottom,
      color:theme.muted,fontSize:17*u,letterSpacing:'.14em'}}>{String(params.footer ?? meta.params.footer.default)}</div>
  </div>;
}
