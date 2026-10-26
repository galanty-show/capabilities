// 关系图模板：sequence 顺序、branch 互斥条件、gate 确认门。建议 2～4 个短节点。
// params: {heading, mode, nodes:[{label,detail?,condition?,glyph?}], selected?:1|2, confirmed?:boolean, halo?:boolean}
// glyph 是宿主粒子字形名（wallet/key/network/…），在卡片上部随节点聚拢；halo 默认 true：图后一组淡轨道环。
import {Img} from 'remotion';
import {OrbitHalo, ParticleGlyph, ease, particleGlyphs, type ParticleGlyphName, type SceneInput} from '@talkframe/scene';

type Node = {label:string; detail?:string; condition?:string; glyph?:ParticleGlyphName};

export default function RelationMap({frame,fps,durationInFrames,aspect,theme,layout,sentences,progress,params,seed}:SceneInput) {
  const mode = params.mode === 'branch' || params.mode === 'gate' ? params.mode : 'sequence';
  const raw = Array.isArray(params.nodes) ? params.nodes : [];
  const nodes:Node[] = raw.slice(0,mode === 'sequence' ? 4 : 3).map((item) => {
    const value = item && typeof item === 'object' ? item as Record<string,unknown> : {};
    return {label:String(value.label ?? ''),detail:value.detail == null ? undefined : String(value.detail),
      condition:value.condition == null ? undefined : String(value.condition),
      glyph:(particleGlyphs as readonly unknown[]).includes(value.glyph) ? value.glyph as ParticleGlyphName : undefined};
  });
  const c=layout.content, W=c.right-c.left, H=c.bottom-c.top, portrait=aspect==='portrait';
  const u=Math.min(W/1000,H/760), total=Math.max(1,nodes.length), sec=frame/Math.max(1,fps);
  // 多节点共享一句时，在该句持续时间内错峰；无句子才按整幕时长回退。
  const show=(i:number) => {
    if (!sentences.length) return ease((sec-(i+.15)*durationInFrames/Math.max(1,fps)*.75/total)/.45);
    const si=Math.min(sentences.length-1,Math.floor(i*sentences.length/total));
    const first=Math.ceil(si*total/sentences.length), count=Math.ceil((si+1)*total/sentences.length)-first;
    const sentence=sentences[si], span=Math.max(0,sentence.end-sentence.start-.6);
    return ease(progress(sentence.id,count>1 ? (i-first)*span/count : 0));
  };
  const visible=nodes.map((_,i)=>show(i));
  const confirmed=params.confirmed===true, selected=params.selected===1||params.selected===2 ? params.selected : 0;
  const graph={left:c.left,top:c.top+H*.2,width:W,height:H*.77};
  const cardW=mode==='sequence' ? portrait ? W*.78 : W/Math.max(2,nodes.length)*.78
    : mode==='gate' ? portrait ? W*.78 : W*.27
    : portrait ? W*.45 : aspect==='square' ? W*.43 : W*.31;
  const lift=nodes.some(node=>node.glyph) ? 1.5 : 1;
  const cardH=Math.min(portrait&&mode!=='branch' ? graph.height/(mode==='sequence'?total:3)*.9 : graph.height*.9, lift*(mode==='sequence' ? portrait ? Math.min(graph.height/total*.64,175*u) : graph.height*.42
    : portrait ? graph.height*.23 : graph.height*.29));
  const position=(i:number) => {
    if (mode==='sequence') return portrait
      ? {x:W*.5,y:graph.height*(i+.5)/total}
      : {x:W*(i+.5)/total,y:graph.height*.5};
    if (mode==='branch') return portrait || aspect==='square'
      ? i===0 ? {x:W*.5,y:graph.height*.19} : {x:W*(i===1?.25:.75),y:graph.height*.72}
      : i===0 ? {x:W*.18,y:graph.height*.5} : {x:W*.72,y:graph.height*(i===1?.27:.73)};
    return portrait ? {x:W*.5,y:graph.height*(i+.5)/3}
      : {x:W*(i+.5)/3,y:graph.height*.5};
  };
  const connections=mode==='branch' ? [[0,1],[0,2]] : nodes.slice(1).map((_,i)=>[i,i+1]);
  // 关系线作为独立 SVG 图片解码，避免内联曲线/斜线的跨页边缘栅格差异。
  const edges = connections.map(([from,to])=>{
    const a=position(from),b=position(to),branch=mode==='branch';
    const active=branch?selected===to:mode==='gate'&&to===2?confirmed&&visible[1]>=.99:true;
    const strength=Math.min(visible[from]??0,visible[to]??0),vertical=portrait||branch&&aspect==='square';
    const x1=a.x+(vertical?0:cardW*.5),y1=a.y+(vertical?cardH*.5:0);
    const x2=b.x-(vertical?0:cardW*.5),y2=b.y-(vertical?cardH*.5:0);
    const dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len;
    const size=15*u,half=8*u,bx=x2-ux*size,by=y2-uy*size,color=active?theme.accent:theme.muted;
    return `<g opacity="${strength}"><path d="M${x1},${y1} L${x2},${y2}" stroke="${color}" stroke-width="${4*u}" ${active?'':`stroke-dasharray="${7*u} ${7*u}"`} fill="none"/>`
      + `<path d="M${x2},${y2} L${bx-uy*half},${by+ux*half} L${bx+uy*half},${by-ux*half} Z" fill="${color}"/></g>`;
  }).join('');
  const edgesSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W*4}" height="${graph.height*4}" viewBox="0 0 ${W} ${graph.height}"><rect width="${W}" height="${graph.height}" fill="${theme.background}"/>${edges}</svg>`;
  const fade=1-ease((frame-(durationInFrames-10))/10);
  return <div style={{position:'absolute',inset:0,background:theme.background,opacity:fade}}>
    <div style={{position:'absolute',left:c.left,top:c.top,width:W,fontSize:Math.min(64*u,H*.105),
      fontWeight:800,color:theme.text,lineHeight:1.1,opacity:show(0),overflowWrap:'anywhere'}}>{String(params.heading ?? '')}</div>
    <div style={{position:'absolute',left:graph.left,top:graph.top,width:graph.width,height:graph.height}}>
      <Img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(edgesSvg)}`} style={{position:'absolute',inset:0,width:W,height:graph.height,imageRendering:'pixelated'}} />
      {/* 光环画在连线图之上、卡片之下；画布用幕坐标，所以抵消 graph 的偏移。 */}
      {params.halo !== false ? <div style={{position:'absolute',left:-graph.left,top:-graph.top}}>
        <OrbitHalo frame={frame} seed={seed} x={graph.left+W/2} y={graph.top+graph.height/2} size={Math.min(W,graph.height*1.6)*.46}
          accent={theme.accent} secondary={theme.muted} dots={nodes.length+2} opacity={.7*show(0)} /></div>:null}
      {nodes.map((node,i)=>{
        const p=position(i), on=visible[i], chosen=mode==='branch' ? i===0 || selected===i
          : mode==='gate' ? i<2 || confirmed && visible[1]>=.99 : true;
        const lit=chosen && on>0, gateStatus=mode==='gate' && i===1 ? confirmed?'已确认':'待确认' : '';
        const pad=Math.max(10,18*u),condition=mode==='branch'&&i>0 ? node.condition||'条件未指定' : '';
        const innerW=Math.max(1,cardW-pad*2);
        const conditionSize=Math.min(28*u,cardH*.18,innerW/Math.max(1,condition.length));
        const detailSize=Math.min(24*u,cardH*.15,innerW/Math.max(1,node.detail?.length??0));
        const statusSize=Math.min(19*u,cardH*.12);
        const glyphH=node.glyph?cardH*.42:0;
        const reserved=pad*2+glyphH+(condition?conditionSize*1.25:0)
          +(node.detail?detailSize*1.25+8*u:0)+(gateStatus?statusSize*1.25+7*u:0);
        const titleSize=Math.min(45*u,cardH*.32,Math.max(14*u,(cardH-reserved)/2.4),
          innerW*1.8/Math.max(1,node.label.length));
        return <div key={i} style={{position:'absolute',left:p.x-cardW/2,top:p.y-cardH/2,width:cardW,height:cardH,
          boxSizing:'border-box',padding:pad,borderRadius:0,
          border:`${3*u}px solid ${lit?theme.accent:theme.muted}`,background:theme.background,
          opacity:on,display:'flex',flexDirection:'column',justifyContent:'center',textAlign:'center',
          color:lit?theme.text:theme.muted,overflow:'hidden'}}>
          {glyphH ? <div style={{height:glyphH,flex:'none'}} />:null}
          {condition ? <div style={{fontSize:conditionSize,color:theme.accent,
            fontWeight:700,overflowWrap:'anywhere'}}>{condition}</div>:null}
          <div style={{fontSize:titleSize,fontWeight:800,lineHeight:1.2,overflowWrap:'anywhere'}}>{node.label}</div>
          {node.detail ? <div style={{fontSize:detailSize,marginTop:8*u,lineHeight:1.25,overflowWrap:'anywhere'}}>{node.detail}</div>:null}
          {gateStatus ? <div style={{fontSize:statusSize,marginTop:7*u,color:confirmed?theme.accent:theme.muted}}>{gateStatus}</div>:null}
        </div>;
      })}
    </div>
    {nodes.map((node,i)=>{
      if (!node.glyph) return null;
      const p=position(i), glyphH=cardH*.42, pad=Math.max(10,18*u), chosen=mode!=='branch' || i===0 || selected===i;
      return <ParticleGlyph key={i} name={node.glyph} from="scatter" progress={visible[i]} frame={frame} seed={seed+i} count={700}
        x={graph.left+p.x} y={graph.top+p.y-cardH/2+pad+glyphH*.5} size={Math.min(glyphH*.72,cardW*.4)} contour={false}
        accent={chosen?theme.accent:theme.muted} secondary={chosen?theme.text:theme.muted} opacity={visible[i]} />;
    })}
  </div>;
}
