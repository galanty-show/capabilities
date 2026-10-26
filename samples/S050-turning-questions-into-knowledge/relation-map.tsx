// 关系图模板：layout 控制 sequence/hub/grid/tree 排布（最多 8 节点）；mode 控制 branch/gate 语义。
// params: {heading, layout?, mode?, nodes:[{label,detail?,condition?,glyph?}], selected?:number, confirmed?:boolean, halo?:boolean}
// 节点提供 glyph 时使用宿主 ParticleGlyph（wallet/key/network/…）在卡片上部聚拢；省略时保留纯文本节点。halo 默认 true。
// 素材槽：node-1..node-8 节点图（卡片上部，优先于 glyph；分镜 nodes[i].media 投影为 node-<i+1>）；background（或 scene）整幅背景。
import {Img} from 'remotion';
import {Media, OrbitHalo, ParticleGlyph, assets as slots, ease, particleGlyphs, type ParticleGlyphName, type SceneAsset, type SceneInput} from '@talkframe/scene';
export const meta = {params: {
  heading: {label: '标题', type: 'text', default: '', help: '可用 ==词== 标出强调色'},
  nodes: {label: '节点', type: 'list', max: 8, default: [], item: [{key: 'label', label: '名称'}, {key: 'detail', label: '说明'},
    {key: 'condition', label: '条件'}, {key: 'glyph', label: '粒子字形'}], help: '粒子字形可填 wallet、key、network 等'},
  layout: 'sequence / hub / grid / tree 排布；属于布局',
  mode: 'sequence / branch / gate 语义',
  selected: '分支选中的节点序号（从 1 起）',
  confirmed: 'gate 是否已确认（true / false）',
  halo: '粒子字形是否带轨道光环，默认 true',
}};
// 背景槽：整幅铺满（cover）后压一层主题底色渐变，文字始终可读；图片、SVG、视频都可以。
const Backdrop = ({asset, frame, background, strength = .62}: {asset?: SceneAsset; frame: number; background: string; strength?: number}) => asset
  ? <div style={{position: 'absolute', inset: 0}}><Media asset={asset} frame={frame} fit={asset.fit ?? 'cover'} />
    <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, ${background} 0%, ${background}${Math.round(strength * 255).toString(16).padStart(2, '0')} 48%, ${background}88 100%)`}} /></div>
  : null;

type Node = {label:string; detail?:string; condition?:string; glyph?:ParticleGlyphName};
const highlighted = (text: string, accent: string) => text.split(/(==[^=]+==)/g).map((part, i) =>
  part.startsWith('==') && part.endsWith('==') ? <span key={i} style={{color: accent}}>{part.slice(2, -2)}</span> : part);
const plain = (text: string) => text.replace(/==([^=]+)==/g, '$1');

export default function RelationMap(props:SceneInput) {
  const {frame,fps,durationInFrames,aspect,theme,layout,sentences,progress,params,seed}=props;
  const media=slots(props), picture=(i:number)=>media[`node-${i+1}`], backdrop=media.background??media.scene;
  const mode = params.mode === 'branch' || params.mode === 'gate' ? params.mode : 'sequence';
  const layoutKind = params.layout === 'hub' || params.layout === 'grid' || params.layout === 'tree' || params.layout === 'sequence'
    ? params.layout : mode === 'branch' ? 'hub' : 'sequence';
  const raw = Array.isArray(params.nodes) ? params.nodes : [];
  const nodes:Node[] = raw.slice(0,8).map((item) => {
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
  const confirmed=params.confirmed===true, selected=Number.isInteger(params.selected) && Number(params.selected)>0 && Number(params.selected)<nodes.length ? Number(params.selected) : 0;
  const graph={left:c.left,top:c.top+H*.2,width:W,height:H*.77};
  const legacyBranch=mode==='branch' && params.layout==null && total<=3;
  const legacyGate=mode==='gate' && params.layout==null && total<=3;
  const lift=nodes.some((node,i)=>node.glyph||picture(i)) ? 1.5 : 1;
  const compact=total>4;
  const columns=portrait ? 2 : aspect==='square' ? 3 : 4;
  const rows=Math.ceil(total/columns);
  const linear=layoutKind==='sequence' && !compact;
  const hub=layoutKind==='hub' && total>1;
  const tree=layoutKind==='tree' && total>1;
  const grid=layoutKind==='grid' || layoutKind==='sequence' && compact;
  const treeLevels=Math.floor(Math.log2(total))+1;
  const cardW=legacyBranch ? (portrait ? W*.45 : aspect==='square' ? W*.43 : W*.31)
    : legacyGate ? (portrait ? W*.78 : W*.27)
    : linear ? (portrait ? W*.78 : W/Math.max(2,total)*.78)
    : grid ? W/columns*.78 : hub ? W*(portrait ? (compact?.24:.29) : compact?.18:.22)
    : tree ? (portrait ? W/Math.min(4,Math.max(2,Math.ceil(total/2)))*.82 : W/treeLevels*.75) : W*.45;
  const cardH=legacyBranch || legacyGate ? Math.min(legacyGate&&portrait?graph.height*.3:graph.height*.9,lift*graph.height*(portrait?.23:.29))
    : linear ? (portrait ? Math.min(graph.height/total*.9,lift*Math.min(graph.height/total*.64,175*u))
      : Math.min(graph.height*.9,lift*graph.height*.42))
    : grid ? graph.height/rows*.72 : hub ? graph.height*(portrait ? .14 : .19)
    : tree ? (portrait ? graph.height/treeLevels*.72 : graph.height/Math.min(4,Math.max(2,Math.ceil(total/2)))*.72) : graph.height*.23;
  const position=(i:number) => {
    if (legacyBranch) return portrait || aspect==='square'
      ? i===0 ? {x:W*.5,y:graph.height*.19} : {x:W*(i===1?.25:.75),y:graph.height*.72}
      : i===0 ? {x:W*.18,y:graph.height*.5} : {x:W*.72,y:graph.height*(i===1?.27:.73)};
    if (linear) return portrait
      ? {x:W*.5,y:graph.height*(i+.5)/total}
      : {x:W*(i+.5)/total,y:graph.height*.5};
    if (grid) {
      const row=Math.floor(i/columns), column=i%columns;
      const ordered=layoutKind==='sequence' && row%2 ? columns-1-column : column;
      return {x:W*(ordered+.5)/columns,y:graph.height*(row+.5)/rows};
    }
    if (hub) {
      if (i===0) return {x:W*.5,y:graph.height*.5};
      const angle=-Math.PI/2+(i-1)*2*Math.PI/(total-1);
      return {x:W*.5+Math.cos(angle)*W*(portrait?.36:.37),y:graph.height*.5+Math.sin(angle)*graph.height*.36};
    }
    const level=Math.floor(Math.log2(i+1)), slot=i-(2**level-1), levelCount=Math.min(2**level,total-(2**level-1));
    return portrait ? {x:W*(slot+.5)/levelCount,y:graph.height*(level+.5)/treeLevels}
      : {x:W*(level+.5)/treeLevels,y:graph.height*(slot+.5)/levelCount};
  };
  const connections=layoutKind==='grid' && mode==='sequence' ? [] : nodes.slice(1).map((_,i)=>[
    mode==='branch' || hub ? 0 : tree ? Math.floor(i/2) : i, i+1]);
  // 关系线作为独立 SVG 图片解码，避免内联曲线/斜线的跨页边缘栅格差异。
  const edges = connections.map(([from,to])=>{
    const a=position(from),b=position(to),branch=mode==='branch';
    const active=branch?selected===to:mode==='gate'&&to>=2?confirmed&&visible[1]>=.99:true;
    const strength=Math.min(visible[from]??0,visible[to]??0),vertical=Math.abs(b.y-a.y)>Math.abs(b.x-a.x)*.75;
    const direction=vertical?Math.sign(b.y-a.y):Math.sign(b.x-a.x);
    const x1=a.x+(vertical?0:cardW*.5*direction),y1=a.y+(vertical?cardH*.5*direction:0);
    const x2=b.x-(vertical?0:cardW*.5*direction),y2=b.y-(vertical?cardH*.5*direction:0);
    const dx=x2-x1,dy=y2-y1,len=Math.max(1,Math.hypot(dx,dy)),ux=dx/len,uy=dy/len;
    const size=15*u,half=8*u,bx=x2-ux*size,by=y2-uy*size,color=active?theme.accent:theme.muted;
    return `<g opacity="${strength}"><path d="M${x1},${y1} L${x2},${y2}" stroke="${color}" stroke-width="${4*u}" ${active?'':`stroke-dasharray="${7*u} ${7*u}"`} fill="none"/>`
      + `<path d="M${x2},${y2} L${bx-uy*half},${by+ux*half} L${bx+uy*half},${by-ux*half} Z" fill="${color}"/></g>`;
  }).join('');
  const edgesSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W*4}" height="${graph.height*4}" viewBox="0 0 ${W} ${graph.height}"><rect width="${W}" height="${graph.height}" fill="${backdrop ? 'none' : theme.background}"/>${edges}</svg>`;
  const fade=1-ease((frame-(durationInFrames-10))/10);
  return <div style={{position:'absolute',inset:0,background:theme.background,opacity:fade}}>
    <Backdrop asset={backdrop} frame={frame} background={theme.background} />
    <div style={{position:'absolute',left:c.left,top:c.top,width:W,fontSize:Math.min(64*u,H*.105),
      fontWeight:800,color:theme.text,lineHeight:1.1,opacity:show(0),overflowWrap:'anywhere'}}>{highlighted(String(params.heading ?? ''),theme.accent)}</div>
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
        const pad=Math.max(7,compact?10*u:18*u),condition=mode==='branch'&&i>0 ? node.condition||'条件未指定' : '';
        const innerW=Math.max(1,cardW-pad*2);
        const conditionSize=Math.min(28*u,cardH*.18,innerW/Math.max(1,plain(condition).length));
        const detailSize=Math.min(24*u,cardH*.15,innerW/Math.max(1,plain(node.detail??'').length));
        const statusSize=Math.min(19*u,cardH*.12);
        const glyphH=node.glyph||picture(i)?cardH*(compact?.28:.42):0;
        const reserved=pad*2+glyphH+(condition?conditionSize*1.25:0)
          +(node.detail?detailSize*1.25+8*u:0)+(gateStatus?statusSize*1.25+7*u:0);
        const titleSize=Math.min(45*u,cardH*.32,Math.max(14*u,(cardH-reserved)/2.4),
          innerW*1.8/Math.max(1,plain(node.label).length));
        return <div key={i} style={{position:'absolute',left:p.x-cardW/2,top:p.y-cardH/2,width:cardW,height:cardH,
          boxSizing:'border-box',padding:pad,borderRadius:0,
          border:`${3*u}px solid ${lit?theme.accent:theme.muted}`,background:theme.background,
          opacity:on,display:'flex',flexDirection:'column',justifyContent:'center',textAlign:'center',
          color:lit?theme.text:theme.muted,overflow:'hidden'}}>
          {picture(i) ? <div style={{height:glyphH,flex:'none',marginBottom:6*u}}><Media asset={picture(i)} frame={frame} /></div>
            : glyphH ? <div style={{height:glyphH,flex:'none'}} />:null}
          {condition ? <div style={{fontSize:conditionSize,color:theme.accent,
            fontWeight:700,overflowWrap:'anywhere'}}>{highlighted(condition,theme.accent)}</div>:null}
          <div style={{fontSize:titleSize,fontWeight:800,lineHeight:1.2,overflowWrap:'anywhere'}}>{highlighted(node.label,theme.accent)}</div>
          {node.detail ? <div style={{fontSize:detailSize,marginTop:8*u,lineHeight:1.25,overflowWrap:'anywhere'}}>{highlighted(node.detail,theme.accent)}</div>:null}
          {gateStatus ? <div style={{fontSize:statusSize,marginTop:7*u,color:confirmed?theme.accent:theme.muted}}>{gateStatus}</div>:null}
        </div>;
      })}
    </div>
    {nodes.map((node,i)=>{
      if (!node.glyph || picture(i)) return null;
      const p=position(i), glyphH=cardH*(compact?.28:.42), pad=Math.max(7,compact?10*u:18*u);
      const chosen=mode==='branch' ? i===0 || selected===i : mode==='gate' ? i<2 || confirmed && visible[1]>=.99 : true;
      return <ParticleGlyph key={i} name={node.glyph} from="scatter" progress={visible[i]} frame={frame} seed={seed+i} count={700}
        x={graph.left+p.x} y={graph.top+p.y-cardH/2+pad+glyphH*.5} size={Math.min(glyphH*.72,cardW*.4)} contour={false}
        accent={chosen?theme.accent:theme.muted} secondary={chosen?theme.text:theme.muted} opacity={visible[i]} />;
    })}
  </div>;
}
