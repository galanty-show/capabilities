// 指标卡模板：数字始终显示真实终值；只有卡片和比较条按旁白逐项揭示。
// params: {heading, metrics:[{label,value,unit?,compareTo?,comparisonLabel?}]}；建议不超过 4 项。
// 素材槽：metric-1..metric-4 卡片图标（图片/SVG）；background（或 scene）整幅背景。metrics[i].icon?: 随包图标名（素材槽优先）。
import {Icon, Media, assets as slots, type SceneAsset} from '@talkframe/scene';
type Box={left:number;top:number;right:number;bottom:number};
type Metric={label:string;value:number;unit:string;compareTo?:number;comparisonLabel:string;icon?:string};
// 背景槽：整幅铺满（cover）后压一层主题底色渐变，文字始终可读；图片、SVG、视频都可以。
const Backdrop = ({asset, frame, background, strength = .62}: {asset?: SceneAsset; frame: number; background: string; strength?: number}) => asset
  ? <div style={{position: 'absolute', inset: 0}}><Media asset={asset} frame={frame} fit={asset.fit ?? 'cover'} />
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, ${background} 0%, ${background}${Math.round(strength * 255).toString(16).padStart(2, '0')} 48%, ${background}88 100%)`}} /></div>
  : null;
type Props={frame:number;fps:number;durationInFrames:number;aspect:'landscape'|'portrait'|'square';
  theme:{background:string;accent:string;text:string;muted:string};layout:{content:Box};
  sentences:ReadonlyArray<{id:string;start:number;end:number}>;
  progress:(id:string,offset?:number)=>number;params:Readonly<Record<string,unknown>>;assets:Readonly<Record<string,SceneAsset>>};
const ease=(v:number)=>1-Math.pow(1-Math.max(0,Math.min(1,v)),3);
const number=(value:number)=>String(value);

export default function MetricsCards(props:Props){
  const {frame,fps,durationInFrames,aspect,theme,layout,sentences,progress,params}=props;
  const media=slots(props as never);
  const source=Array.isArray(params.metrics)?params.metrics:[];
  // 只显示输入里确实给出的有限数值，不用占位数字冒充测量值。
  const metrics:Metric[]=source.slice(0,4).flatMap((item)=>{
    if(!item||typeof item!=='object')return [];
    const data=item as Record<string,unknown>;
    if(typeof data.value!=='number'||!Number.isFinite(data.value))return [];
    return [{label:String(data.label??''),value:data.value,unit:String(data.unit??''),
      compareTo:typeof data.compareTo==='number'&&Number.isFinite(data.compareTo)?data.compareTo:undefined,
      comparisonLabel:String(data.comparisonLabel??'对照'),...(typeof data.icon==='string'?{icon:data.icon}:{})}];
  });
  const c=layout.content,W=c.right-c.left,H=c.bottom-c.top,portrait=aspect==='portrait';
  const u=Math.min(W/900,H/720),total=Math.max(1,metrics.length),sec=frame/Math.max(1,fps);
  // 一句对应多卡时，在这句话内均匀错峰；无句子时按整幕时长回退。
  const show=(i:number)=>{
    if(!sentences.length)return ease((sec-(i+.15)*durationInFrames/Math.max(1,fps)*.75/total)/.45);
    const si=Math.min(sentences.length-1,Math.floor(i*sentences.length/total));
    const first=Math.ceil(si*total/sentences.length),count=Math.ceil((si+1)*total/sentences.length)-first;
    const sentence=sentences[si],span=Math.max(0,sentence.end-sentence.start-.6);
    return ease(progress(sentence.id,count>1?(i-first)*span/count:0));
  };
  // 同单位共用最大绝对值刻度；带符号的数值保留符号，条只表达幅度。
  const maxima=new Map<string,number>();
  metrics.forEach(m=>maxima.set(m.unit,Math.max(maxima.get(m.unit)??0,Math.abs(m.value),Math.abs(m.compareTo??0))));
  const columns=portrait?1:2,rows=Math.max(1,Math.ceil(metrics.length/columns));
  const titleH=H*.16,gap=Math.max(12,20*u),cardsH=H-titleH-gap;
  const cardH=(cardsH-gap*(rows-1))/rows,cardW=(W-gap*(columns-1))/columns;
  const fade=1-ease((frame-(durationInFrames-10))/10);
  return <div style={{position:'absolute',inset:0,background:theme.background,opacity:fade}}>
    <Backdrop asset={media.background??media.scene} frame={frame} background={theme.background} />
    <div style={{position:'absolute',left:c.left,top:c.top,width:W,fontSize:Math.min(60*u,titleH*.57),
      fontWeight:800,lineHeight:1.1,color:theme.text,opacity:show(0),overflowWrap:'anywhere'}}>{String(params.heading??'')}</div>
    <div style={{position:'absolute',left:c.left,top:c.top+titleH,width:W,height:cardsH,display:'grid',
      gridTemplateColumns:`repeat(${columns},minmax(0,1fr))`,gridTemplateRows:`repeat(${rows},minmax(0,1fr))`,gap}}>
      {metrics.map((m,i)=>{
        const on=show(i),max=Math.max(1e-9,maxima.get(m.unit)??1),pad=Math.min(30*u,cardH*.13);
        const labelSize=Math.min(27*u,cardH*.13),valueSize=Math.min(59*u,cardH*.25);
        const hasCompare=m.compareTo!==undefined,barH=Math.max(5,9*u);
        return <div key={i} style={{boxSizing:'border-box',width:cardW,height:cardH,borderRadius:22*u,
          border:`${2*u}px solid ${theme.accent}88`,background:`${theme.accent}0d`,padding:pad,
          display:'flex',flexDirection:'column',overflow:'hidden',opacity:on,position:'relative'}}>
          {media[`metric-${i+1}`]||m.icon?<div style={{position:'absolute',right:pad,top:pad,width:Math.min(cardH*.3,96*u),height:Math.min(cardH*.3,96*u)}}>
            {media[`metric-${i+1}`]?<Media asset={media[`metric-${i+1}`]} frame={frame} />:<Icon name={m.icon!} size={Math.min(cardH*.3,96*u)} color={theme.accent} />}</div>:null}
          <div style={{fontSize:labelSize,fontWeight:700,color:theme.muted,lineHeight:1.2,overflowWrap:'anywhere'}}>{m.label}</div>
          <div style={{display:'flex',alignItems:'baseline',gap:8*u,marginTop:Math.min(14*u,cardH*.045),minWidth:0}}>
            <span style={{fontSize:valueSize,fontWeight:900,color:theme.text,lineHeight:1.08,
              fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap'}}>{number(m.value)}</span>
            <span style={{fontSize:Math.min(25*u,cardH*.12),color:theme.accent,overflowWrap:'anywhere'}}>{m.unit}</span>
          </div>
          <div style={{marginTop:'auto',display:'grid',gap:Math.min(10*u,cardH*.04)}}>
            {hasCompare?<div style={{fontSize:Math.min(19*u,cardH*.09),color:theme.muted,lineHeight:1.15}}>
              {m.comparisonLabel}：{number(m.compareTo!)}{m.unit}</div>:null}
            {hasCompare?<div style={{height:barH,borderRadius:barH,background:`${theme.muted}30`,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.abs(m.compareTo!)/max*100}%`,background:theme.muted}}/></div>:null}
            <div style={{height:barH,borderRadius:barH,background:`${theme.muted}30`,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.abs(m.value)/max*on*100}%`,background:theme.accent}}/></div>
            {hasCompare?<div style={{fontSize:Math.min(17*u,cardH*.08),color:theme.muted}}>本期｜条长表示绝对值</div>:null}
          </div>
        </div>;
      })}
    </div>
  </div>;
}
