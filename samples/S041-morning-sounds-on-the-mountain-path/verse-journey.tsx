// 自写诗意全景：四个意象沿一条由山到水的路径依次出现，不铺说明卡片。
import {Img} from 'remotion';
import {useScene, type SceneInput} from '@talkframe/scene';

export default function VerseJourney(props: SceneInput) {
  const {layout,theme,params}=props;
  const s=useScene(props);
  const c=layout.content,W=c.right-c.left,H=c.bottom-c.top;
  const stages=Array.isArray(params.stages)?params.stages.slice(0,4).map(String):[];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="3300" height="1300" viewBox="0 0 1100 430"><circle cx="950" cy="92" r="62" fill="${theme.accent}" opacity=".42"/><path d="M0 325 L115 187 L210 264 L335 99 L468 268 L565 216 L695 335 L1100 290 L1100 430 L0 430 Z" fill="${theme.muted}" opacity=".22"/><path d="M0 381 Q180 333 315 365 T600 360 T1100 337" fill="none" stroke="${theme.accent}" stroke-width="9" opacity=".5"/><path d="M0 405 Q186 359 350 398 T700 388 T1100 364" fill="none" stroke="${theme.text}" stroke-width="3" opacity=".35"/><path d="M880 170 q22 -23 44 0 q22 -23 44 0 M975 145 q15 -16 30 0 q15 -16 30 0" fill="none" stroke="${theme.text}" stroke-width="5" opacity=".78"/></svg>`;
  const spots=[.12,.36,.62,.86];
  return <div style={{position:'absolute',inset:0,background:theme.background,
    color:theme.text,fontFamily:props.fonts.text,opacity:s.fadeOut()}}>
    <div style={{position:'absolute',left:c.left,top:c.top+H*.05,fontSize:67,fontWeight:800,
      opacity:s.reveal(0)}}>{String(params.heading??'')}</div>
    <div style={{position:'absolute',left:c.left,top:c.top+H*.32,width:W,height:H*.52,opacity:.93}}>
      <Img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
        style={{width:'100%',height:'100%',objectFit:'fill'}} />
    </div>
    <div style={{position:'absolute',left:c.left,top:c.top+H*.81,width:W,height:H*.12}}>
      {stages.map((stage,i)=>{
        const on=s.reveal(0,{offset:i*.7,seconds:.7});
        return <div key={i} style={{position:'absolute',left:`${(spots[i]-.09)*100}%`,width:'18%',
          textAlign:'center',opacity:on,transform:`translateY(${(1-on)*16}px)`}}>
          <div style={{width:10,height:10,borderRadius:5,background:theme.accent,margin:'0 auto 12px'}} />
          <div style={{fontSize:33,fontWeight:700}}>{stage}</div>
        </div>;
      })}
    </div>
  </div>;
}
