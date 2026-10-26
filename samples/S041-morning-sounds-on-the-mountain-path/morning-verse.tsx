// 从 typography-stage 的逐句诗文舞台改写：晨景代替月夜，诗句仍随配音逐句进入。
import {Img} from 'remotion';
import {useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  params: {
    translations: {label: '诗句译文', type: 'list', default: [] as string[], help: '可选：每句诗下方的小字译文，按诗句顺序；留空时只显示原诗。'},
  },
};

export default function MorningVerse(props: SceneInput) {
  const {layout, theme, params} = props;
  const s = useScene(props);
  const c=layout.content, W=c.right-c.left, H=c.bottom-c.top;
  const lines=Array.isArray(params.lines) ? params.lines.slice(0,2).map(String) : [];
  const indices=Array.isArray(params.lineSentenceIndices) ? params.lineSentenceIndices.slice(0,2).map(Number) : [0,1];
  const translations=(Array.isArray(params.translations) ? params.translations : meta.params.translations.default).slice(0,2).map(String);
  const stream=params.art==='stream';
  const landscape=stream
    ? `<path d="M35 490 C130 390 235 440 300 342 S430 290 490 138" fill="none" stroke="${theme.accent}" stroke-width="75" opacity=".18"/><path d="M25 520 C130 420 235 470 300 372 S430 320 490 168" fill="none" stroke="${theme.accent}" stroke-width="5" opacity=".65"/><path d="M130 410 L128 110 M152 425 L154 60 M178 450 L177 175 M185 248 L225 214 M174 207 L126 178 M149 155 L99 117" fill="none" stroke="${theme.muted}" stroke-width="8" opacity=".75"/><path d="M314 120 q22 -25 44 0 q22 -25 44 0 M375 87 q16 -19 33 0 q16 -19 32 0" fill="none" stroke="${theme.text}" stroke-width="5" opacity=".8"/>`
    : `<circle cx="395" cy="115" r="69" fill="${theme.accent}" opacity=".57"/><path d="M0 360 L102 240 L183 297 L290 125 L410 288 L520 170 L520 600 L0 600 Z" fill="${theme.muted}" opacity=".2"/><path d="M0 436 L105 315 L197 365 L287 235 L415 375 L520 283 L520 600 L0 600 Z" fill="${theme.accent}" opacity=".22"/><path d="M0 505 Q130 440 260 481 T520 455" fill="none" stroke="${theme.text}" stroke-width="16" opacity=".27"/><circle cx="412" cy="236" r="80" fill="none" stroke="${theme.accent}" stroke-width="3" opacity=".35"/><circle cx="412" cy="236" r="116" fill="none" stroke="${theme.accent}" stroke-width="2" opacity=".18"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1560" height="1800" viewBox="0 0 520 600">${landscape}</svg>`;
  const artUrl=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return <div style={{position:'absolute',inset:0,background:theme.background,
    color:theme.text,fontFamily:'Noto Serif CJK SC, Songti SC, serif',opacity:s.fadeOut()}}>
    <div style={{position:'absolute',left:c.left+W*.57,top:c.top+H*.06,
      width:W*.43,height:H*.86,opacity:.88}}>
      <Img src={artUrl} style={{width:'100%',height:'100%',objectFit:'contain'}} />
    </div>
    <div style={{position:'absolute',left:c.left+W*.025,top:c.top+H*.12,width:W*.58}}>
      <div style={{color:theme.accent,fontSize:25,letterSpacing:'.23em',fontWeight:700,
        opacity:s.reveal(0)}}>{String(params.kicker??'原创短诗')}</div>
      <div style={{color:theme.muted,fontSize:43,marginTop:20,opacity:s.reveal(0)}}>{String(params.title??'')}</div>
      <div style={{height:3,width:78,background:theme.accent,marginTop:28,opacity:.8}} />
      {lines.map((line,i)=>{
        const on=s.reveal(indices[i]??i,{seconds:.85});
        return <div key={i} style={{fontSize:76,fontWeight:700,letterSpacing:'.12em',lineHeight:1.45,
          marginTop:i===0?45:19,opacity:on,transform:`translateY(${(1-on)*18}px)`,
          whiteSpace:'nowrap'}}>{line}{translations[i] ? <div style={{fontSize:31,fontWeight:400,letterSpacing:'.01em',
          lineHeight:1.35,marginTop:4,color:theme.muted}}>{translations[i]}</div> : null}</div>;
      })}
    </div>
  </div>;
}
