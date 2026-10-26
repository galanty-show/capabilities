// 自写虚构接口报文与终态画面；所有数据来自 params，不发网络请求。
import {useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  params: {
    outcomeNote: {label: '结果页说明', type: 'text', default: '虚构流程示意 · 不代表线上接口', help: '成功/超时画面右下角的说明。'},
    fieldsNote: {label: '报文页说明', type: 'text', default: '虚构字段 · 本地演示', help: '请求与回执画面标题下方的小字。'},
    requestLabel: {label: '请求卡标题', type: 'text', default: '新增请求', help: '左侧请求卡的标题。'},
    responseLabel: {label: '回执卡标题', type: 'text', default: '示例回执', help: '右侧回执卡的标题。'},
    requestKeys: {label: '请求字段名', type: 'list', default: ['名称', '数量'], help: '按名称、数量顺序。'},
    responseKeys: {label: '回执字段名', type: 'list', default: ['状态', '编号'], help: '按状态、编号顺序。'},
    networkNote: {label: '网络说明', type: 'text', default: '未访问网络', help: '第三句出现时右下角的说明。'},
  },
};
const text=(params:Readonly<Record<string,unknown>>,key:'outcomeNote'|'fieldsNote'|'requestLabel'|'responseLabel'|'networkNote')=>String(params[key] ?? meta.params[key].default);
const keys=(params:Readonly<Record<string,unknown>>,key:'requestKeys'|'responseKeys')=>{
  const value=Array.isArray(params[key]) ? (params[key] as unknown[]).map(String) : meta.params[key].default;
  return [value[0] ?? meta.params[key].default[0], value[1] ?? meta.params[key].default[1]];
};

export default function ApiPackets(props: SceneInput) {
  const {layout,theme,params}=props;
  const s=useScene(props);
  const c=layout.content,W=c.right-c.left,H=c.bottom-c.top;
  const mode=params.mode==='outcome'?'outcome':'exchange';
  const heading=<div style={{position:'absolute',left:c.left,top:c.top+H*.04,width:W,
    fontSize:68,fontWeight:800,lineHeight:1.1,opacity:s.reveal(0)}}>{String(params.heading??'')}</div>;
  if (mode==='outcome') {
    const timeout=s.reveal(0,{seconds:.8});
    const limit=s.reveal(1,{seconds:.8});
    return <div style={{position:'absolute',inset:0,background:theme.background,
      color:theme.text,fontFamily:props.fonts.text,opacity:s.fadeOut()}}>
      {heading}
      <div style={{position:'absolute',left:c.left+W*.035,top:c.top+H*.29,width:W*.93,
        height:H*.18,display:'flex',alignItems:'center',gap:34,borderBottom:`3px solid ${theme.accent}`}}>
        <div style={{fontSize:66,color:theme.accent,fontWeight:800}}>✓</div>
        <div style={{fontSize:43,fontWeight:700}}>{String(params.success??'')}</div>
      </div>
      <div style={{position:'absolute',left:c.left+W*.035,top:c.top+H*.52,width:W*.93,
        height:H*.18,display:'flex',alignItems:'center',gap:34,borderBottom:`3px solid ${theme.muted}`,
        opacity:timeout,transform:`translateY(${(1-timeout)*20}px)`}}>
        <div style={{fontSize:66,color:theme.muted,fontWeight:800}}>…</div>
        <div style={{fontSize:43,fontWeight:700}}>{String(params.timeout??'')}</div>
      </div>
      <div style={{position:'absolute',right:props.width-c.right,top:c.top+H*.79,
        fontSize:26,color:theme.muted,opacity:limit}}>{text(params,'outcomeNote')}</div>
    </div>;
  }
  const req=(params.request&&typeof params.request==='object')?params.request as Record<string,unknown>:{};
  const res=(params.response&&typeof params.response==='object')?params.response as Record<string,unknown>:{};
  const reqKeys=keys(params,'requestKeys'), resKeys=keys(params,'responseKeys');
  const request=s.reveal(0,{seconds:.8});
  const response=s.reveal(1,{seconds:.8});
  const note=s.reveal(2,{seconds:.8});
  const panel=(left:number,on:number,label:string,rows:[string,string][]) =>
    <div style={{position:'absolute',left,top:c.top+H*.29,width:W*.43,height:H*.50,
      boxSizing:'border-box',padding:'28px 34px',border:`2px solid ${theme.accent}`,
      background:'#14283A',opacity:on,transform:`translateY(${(1-on)*20}px)`}}>
      <div style={{fontSize:28,color:theme.accent,fontWeight:800,letterSpacing:'.09em'}}>{label}</div>
      {rows.map(([key,value],i)=><div key={key} style={{display:'flex',alignItems:'baseline',gap:18,
        borderTop:`1px solid ${theme.muted}66`,marginTop:i===0?31:19,paddingTop:17,
        fontSize:34,lineHeight:1.3}}>
        <span style={{color:theme.muted,minWidth:135}}>{key}</span><strong>{value}</strong>
      </div>)}
    </div>;
  return <div style={{position:'absolute',inset:0,background:theme.background,
    color:theme.text,fontFamily:props.fonts.text,opacity:s.fadeOut()}}>
    {heading}
    <div style={{position:'absolute',left:c.left,top:c.top+H*.16,
      fontSize:25,color:theme.muted,opacity:s.reveal(0)}}>{text(params,'fieldsNote')}</div>
    {panel(c.left,request,text(params,'requestLabel'),[[reqKeys[0],String(req.name??'')],[reqKeys[1],String(req.quantity??'')]])}
    <div style={{position:'absolute',left:c.left+W*.455,top:c.top+H*.45,width:W*.09,
      textAlign:'center',fontSize:61,color:theme.accent,opacity:response}}>→</div>
    {panel(c.left+W*.57,response,text(params,'responseLabel'),[[resKeys[0],String(res.status??'')],[resKeys[1],String(res.id??'')]])}
    <div style={{position:'absolute',right:props.width-c.right,top:c.top+H*.84,
      fontSize:26,color:theme.muted,opacity:note}}>{text(params,'networkNote')}</div>
  </div>;
}
