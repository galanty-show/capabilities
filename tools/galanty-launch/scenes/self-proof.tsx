import React from 'react';
import {Img, staticFile} from 'remotion';
import type {LaunchProps} from './launch';
import {BRAND_ACCENT, MARK_BARS, MARK_STROKE, PLAY_ROUNDING, playPath} from './galanty-mark';
const LIME = BRAND_ACCENT, PAPER = '#f2f3ef', MUTED = '#9daaa2', BG = '#0b1110';
const full: React.CSSProperties = {position: 'absolute', inset: 0};
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => 1 - (1 - clamp(n)) ** 3;
const label: React.CSSProperties = {fontSize: 28, letterSpacing: 4, fontWeight: 650};
const heading: React.CSSProperties = {fontSize: 112, fontWeight: 850, lineHeight: 1.1, letterSpacing: -5};
// Keep brand geometry static; native rounded rects avoid history-dependent path-edge rasterization.
function Mark({size = 100, dark = false}: {size?: number; dark?: boolean}) {
  return <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {MARK_BARS.map(([x,y,w], i) => <rect key={i} x={x} y={y} width={w} height={MARK_STROKE} rx={MARK_STROKE / 2} fill={dark ? BG : PAPER} />)}
    <path d={playPath()} fill={dark ? BG : LIME} stroke={dark ? BG : LIME} strokeWidth={PLAY_ROUNDING} strokeLinejoin="round" />
  </svg>;
}
function Bars({frame, light = false}: {frame: number; light?: boolean}) {
  return <div style={{...full, opacity: light ? .055 : .15, transform: `rotate(-9deg) scale(1.2) translateY(${-frame * .16}px)`}}>
    {Array.from({length: 15}, (_, i) => <div key={i} style={{display: 'flex', gap: 30, margin: '34px 0', transform: `translateX(${(i * 127) % 240 - 100}px)`}}>{Array.from({length: 5}, (_, j) => <div key={j} style={{height: 19, width: 90 + (i * 67 + j * 131) % 280, background: (i + j) % 5 === 0 ? LIME : '#83978b', borderRadius: 3}} />)}</div>)}
  </div>;
}
function Chrome({name, children, style}: {name: string; children: React.ReactNode; style?: React.CSSProperties}) {
  return <div style={{background: '#121c18', border: '2px solid #3d5145', borderRadius: 22, overflow: 'hidden', boxShadow: '0 35px 100px #0007', ...style}}>
    <div style={{height: 60, borderBottom: '1px solid #3d5145', display: 'flex', alignItems: 'center', gap: 10, padding: '0 26px', color: MUTED, fontSize: 24}}>{['#c9f65a','#65776b','#65776b'].map((c,i)=><span key={i} style={{width: 11, height: 11, borderRadius: 9, background: c}} />)}<span style={{marginLeft: 20}}>{name}</span></div>{children}
  </div>;
}
function Top({zh, step, title}: {zh: boolean; step: string; title: string}) {
  return <><div style={{...label, position: 'absolute', left: 100, top: 75, color: LIME}}>{step} / {zh ? '预览优先' : 'PREVIEW FIRST'}</div><div style={{...heading, position: 'absolute', left: 96, top: 133, right: 80}}>{title}</div></>;
}
export function SelfProof(p: LaunchProps) {
  const zh = p.brief.language === 'zh', shot = Number(p.scene.id.split('-').at(-1));
  const e = ease(p.frame / 13), pulse = Math.exp(-((p.frame / p.fps * p.bpm / 60) % 1) * 7);
  const light = shot === 2 || shot === 8;
  const title = zh ? '让想法发光' : 'Let ideas glow';
  const time = shot === 5 && p.frame >= 15 ? 12.5 + (p.frame - 15) / 30 : 6;
  return <div style={{...full, background: light ? LIME : BG, color: light ? BG : PAPER, overflow: 'hidden'}}>
    <Bars frame={p.frame} light={light} />
    <div style={{...full, background: light ? 'transparent' : 'radial-gradient(ellipse at 72% 68%, #263d2355, transparent 70%)'}} />
    {shot === 1 && <>
      <div style={{position:'absolute',left:105,top:85,display:'flex',alignItems:'center',gap:24,...label}}><Img src={staticFile('brand/galanty-app-icon.png')} style={{width:74,height:74}} />GALANTY / 文影</div>
      <div style={{position:'absolute',left:96,top:300,right:530,fontSize:zh ? 144 : 132,fontWeight:850,lineHeight:1.09,letterSpacing:-5,transform:`translateY(${Math.round((1-e)*35)}px)`}}>{zh ? <>用 Agent<br />做视频？</> : <>Making video<br />with an Agent?</>}</div>
      <div style={{position:'absolute',right:95,top:285}}><Mark size={430} /></div>
      <div style={{position:'absolute',left:105,bottom:165,fontSize:52,color:MUTED}}>{zh ? '代码在变。画面，也该跟上。' : 'Code changes. Your preview should keep up.'}</div>
    </>}
    {shot === 2 && <>
      <div style={{position:'absolute',left:100,top:95,...label}}>GALANTY LAUNCH</div>
      <div style={{position:'absolute',left:95,right:95,top:345,fontSize:zh ? 254 : 214,fontWeight:900,lineHeight:1,letterSpacing:-10,transform:`scale(${1.04 - e*.04 + pulse*.005})`}}>{p.scene.text}</div>
      <div style={{position:'absolute',left:105,bottom:155,fontSize:54,fontWeight:650}}>{zh ? '每次改完，先看那一秒。' : 'Every edit. Back to its moment.'}</div>
    </>}
    {shot === 3 && <>
      <Top zh={zh} step="01" title={p.scene.text} />
      <Chrome name={zh ? '你的 Agent · 对话' : 'Your Agent · chat'} style={{position:'absolute',left:100,right:100,top:315,height:590}}>
        <div style={{padding:'48px 60px',fontSize:38,color:MUTED}}>{zh ? '你 · 00:12.5' : 'YOU · 00:12.5'}</div>
        <div style={{margin:'0 60px',padding:'32px 42px',borderLeft:`8px solid ${LIME}`,background:'#213024',fontSize:64,fontWeight:700}}>{(zh ? '把 12.5 秒的标题换成荧光绿。' : 'Make the title at 12.5s lime.')}</div>
        <div style={{margin:'40px 60px',fontSize:34,color:LIME}}>{zh ? 'Agent › 修改标题颜色，保留其他内容。' : 'AGENT › Change the title color. Keep the rest.'}</div>
        <div style={{margin:'25px 60px',fontSize:28,color:MUTED}}>Claude Code · Codex · Gemini CLI</div>
      </Chrome>
    </>}
    {shot === 4 && <>
      <Top zh={zh} step="02" title={p.scene.text} />
      <Chrome name="scenes/title.tsx" style={{position:'absolute',left:100,right:100,top:315,height:580}}>
        <div style={{padding:'34px 48px',fontSize:32,color:MUTED}}>{zh ? '只改需要改的那一处' : 'A focused edit in your project'}</div>
        <div style={{margin:'0 35px',padding:'28px 34px',fontSize:46,background:'#462426',color:'#e9a2a2',whiteSpace:'pre'}}>{'- <Title color="#F2F3EF">'}</div>
        <div style={{margin:'12px 35px',padding:'28px 34px',fontSize:46,background:'#293c20',color:LIME,whiteSpace:'pre'}}>{'+ <Title color="#C9F65A">'}</div>
        <div style={{margin:'24px 70px',fontSize:46}}>  {title}{' </Title>'}</div>
        <div style={{position:'absolute',bottom:35,right:65,fontSize:30,color:LIME}}>{zh ? '已保存 · 等待预览' : 'SAVED · preview next'}</div>
      </Chrome>
    </>}
    {shot === 5 && <>
      <Top zh={zh} step="03" title={p.scene.text} />
      <Chrome name={zh ? '文影 · 发布片' : 'Galanty · launch-film'} style={{position:'absolute',left:100,right:100,top:315,height:590}}>
        <div style={{position:'relative',height:340,margin:'0 25px',background:'#0c1410',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
          <div style={{position:'absolute',width:800,height:800,border:`2px solid #56723a`,borderRadius:'50%',transform:`translate(310px,160px) scale(${1+p.frame*.0006})`}} />
          <div style={{fontSize:114,fontWeight:850,letterSpacing:-4,color:p.frame<15?PAPER:LIME,transform:`scale(${1 + (p.frame>=15 ? (p.frame-15)*.0005 : 0)})`}}>{title}</div>
          <div style={{position:'absolute',bottom:22,left:35,fontSize:25,color:MUTED}}>{zh ? '代码绘制的播放器示意' : 'Code-drawn player illustration'}</div>
        </div>
        <div style={{padding:'28px 55px',display:'flex',alignItems:'center',gap:30,fontSize:36}}><svg width={38} height={38} viewBox="0 0 38 38" fill={LIME}>{p.frame<15?<path d="M8 4 L33 19 L8 34 Z" />:<><rect x={8} y={5} width={7} height={28}/><rect x={23} y={5} width={7} height={28}/></>}</svg><span>{time.toFixed(1).padStart(4,'0')} / 30.0</span><span style={{marginLeft:'auto',color:LIME,fontSize:31}}>{p.frame<15 ? (zh?'正在回到改动位置':'Seeking to the edit'):(zh?'从改动处接着播':'Playing from the edit')}</span></div>
        <div style={{position:'relative',margin:'0 55px',height:52,background:'#27332a',borderRadius:6}}>{Array.from({length:15},(_,i)=><div key={i} style={{position:'absolute',left:`${i*6.67}%`,top:3,bottom:3,width:'6.2%',background:i%3===0?'#526b3c':'#3b4a37'}} />)}<div style={{position:'absolute',left:`${time/30*100}%`,top:-12,bottom:-12,width:4,background:LIME}} /></div>
      </Chrome>
    </>}
    {shot === 6 && <>
      <div style={{position:'absolute',left:100,top:80,...label,color:LIME}}>{zh ? '一条回路，反复打磨' : 'ONE LOOP. KEEP REFINING.'}</div>
      <div style={{position:'absolute',left:95,top:185,...heading,fontSize:zh ? 154 : 141}}>{p.scene.text}</div>
      <div style={{position:'absolute',left:100,right:100,top:475,display:'flex',alignItems:'center',gap:32}}>{(zh ? ['你说一句','Agent 改代码','文影接着播'] : ['You ask.','Agent edits.','Galanty plays.']).map((s,i)=><React.Fragment key={s}>{i>0&&<svg width={80} height={80} viewBox="0 0 80 80" fill="none" stroke={LIME} strokeWidth={5}><path d="M6 40 H72 M48 16 L72 40 L48 64" /></svg>}<div style={{flex:1,opacity:p.frame>=i*10?1:0}}><div style={{fontSize:94,color:LIME,fontWeight:850}}>0{i+1}</div><div style={{fontSize:zh?57:52,fontWeight:750,whiteSpace:'nowrap',marginTop:25}}>{s}</div><div style={{height:4,background:i===2?LIME:'#52653e',marginTop:30,width:`${ease((p.frame-i*10)/25)*100}%`}} /></div></React.Fragment>)}</div>
      <div style={{position:'absolute',left:105,bottom:115,fontSize:41,color:MUTED}}>{zh ? '修改意见直接说，先预览，再导出。' : 'Talk to your Agent. Preview, then export.'}</div>
    </>}
    {shot === 7 && <>
      <Top zh={zh} step="OPEN" title={p.scene.text} />
      <div style={{position:'absolute',left:105,right:105,top:340,display:'flex',gap:28}}>{['Remotion','HyperFrames',zh?'视频文件':'Video files'].map((s,i)=><div key={s} style={{flex:1,height:380,background:'#1c2921',border:'2px solid #506043',borderRadius:18,padding:32,transform:`translateY(${Math.round((1-ease((p.frame-i*5)/17))*40)}px)`}}><div style={{fontSize:76,color:LIME,marginBottom:65}}>{i===0?'tsx':i===1?'html':'mp4'}</div><div style={{fontSize:s==='HyperFrames'?53:61,fontWeight:750}}>{s}</div><div style={{marginTop:26,fontSize:29,color:MUTED}}>{i===0?'React / TSX':i===1?'HTML animation':'MP4 / MOV / WebM'}</div></div>)}</div>
      <div style={{position:'absolute',left:105,bottom:100,fontSize:38,color:MUTED}}>{zh ? '原地打开、播放；保留你的工程。' : 'Open and play. Keep your original project.'}</div>
    </>}
    {shot === 8 && <>
      <div style={{position:'absolute',left:100,top:95,...label}}>EXPORT WHEN READY</div>
      <div style={{position:'absolute',left:95,top:280,fontSize:zh?126:108,fontWeight:850,letterSpacing:-4}}>{zh ? '满意，再导出' : 'Happy with it? Export.'}</div>
      <div style={{position:'absolute',left:95,top:450,fontSize:300,fontWeight:900,letterSpacing:-15,transform:`translateX(${(1-e)*70}px)`}}>MP4<svg width={180} height={180} viewBox="0 0 180 180" fill="none" stroke={BG} strokeWidth={15} style={{marginLeft:70}}><path d="M25 150 L150 25 M25 25 H150 V150" /></svg></div>
      <div style={{position:'absolute',left:105,bottom:115,fontSize:36}}>{zh ? 'Remotion 工程 · 本机导出' : 'Remotion project · local export'}</div>
    </>}
    {shot === 9 && <>
      <div style={{position:'absolute',left:100,top:165,display:'flex',gap:50,alignItems:'center'}}><Mark size={240} /><div style={{fontSize:zh?180:190,fontWeight:850,letterSpacing:-6}}>{zh?'文影':'Galanty'}</div></div>
      <div style={{position:'absolute',left:115,right:100,top:495,fontSize:zh?109:94,fontWeight:750,lineHeight:1.24,letterSpacing:-3}}>{zh ? <>改一处，<span style={{color:LIME}}>回到那一秒</span></> : <>Change one thing.<br /><span style={{color:LIME}}>Back to that second.</span></>}</div>
      <div style={{position:'absolute',left:120,bottom:115,fontSize:43,color:MUTED}}>galanty.cn{zh?'':'/en/'}</div>
      <div style={{position:'absolute',right:120,bottom:125,fontSize:26,color:MUTED}}>Made with Galanty Launch</div>
    </>}
    {shot>=3 && shot<=7 && <div style={{position:'absolute',bottom:35,right:100,fontSize:22,color:MUTED}}>{zh?'流程示意 · 非实机性能测量':'Illustrated workflow · not a performance measurement'}</div>}
  </div>;
}
