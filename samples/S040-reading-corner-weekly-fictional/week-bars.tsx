// 自写周报画面：每日数据按同一刻度画条，总和由分镜显式给出。
import {ease, useScene, type SceneInput} from '@talkframe/scene';

export const meta = {
  params: {
    caption: {label: '图表说明', type: 'text', default: '虚构数据 · 到访次数／日', help: '标题下方的小字说明。'},
    dayPrefix: {label: '星期前缀', type: 'text', default: '周', help: '拼在每个星期名前的文字；星期名已写全时留空。'},
    weekendNote: {label: '周末提示', type: 'text', default: '周末较高：仅为演示现象', help: '第二句出现时右下角的提示。'},
  },
};

export default function WeekBars(props: SceneInput) {
  const {theme, layout, params, sentences, progress} = props;
  const s = useScene(props);
  const c = layout.content;
  const W = c.right - c.left;
  const H = c.bottom - c.top;
  const days = Array.isArray(params.days) ? params.days.slice(0, 7).map(String) : [];
  const values = Array.isArray(params.values) ? params.values.slice(0, 7).map(Number) : [];
  const max = Math.max(1, ...values.filter(Number.isFinite));
  const n = Math.min(days.length, values.length);
  const plotTop = c.top + H * .30;
  const plotH = H * .53;
  const gap = W * .026;
  const barW = (W - gap * (n + 1)) / Math.max(1, n);
  const first = sentences[0]?.id ?? '';
  const second = sentences[1]?.id ?? '';
  const weekend = ease(progress(second));
  const show = (i: number) => ease(progress(first, i * .52, .65));
  return <div style={{position:'absolute',inset:0,background:theme.background,
    color:theme.text,fontFamily:props.fonts.text,opacity:s.fadeOut()}}>
    <div style={{position:'absolute',left:c.left,top:c.top + H*.045,width:W,
      fontSize:67,fontWeight:800,lineHeight:1.08,opacity:s.reveal(0)}}>{String(params.heading ?? '')}</div>
    <div style={{position:'absolute',left:c.left,top:c.top+H*.155,
      color:theme.muted,fontSize:27,letterSpacing:'.08em',opacity:s.reveal(0)}}>{String(params.caption ?? meta.params.caption.default)}</div>
    <div style={{position:'absolute',left:c.left,top:plotTop+plotH,width:W,height:2,background:theme.muted,opacity:.45}} />
    {values.slice(0,n).map((value,i) => {
      const on=show(i);
      const h=plotH * Math.max(0, value) / max * on;
      const x=c.left + gap + i*(barW+gap);
      const isWeekend=i>=5;
      const color=isWeekend ? `color-mix(in srgb, ${theme.accent} ${Math.round(40+60*weekend)}%, ${theme.muted})` : theme.muted;
      return <div key={i}>
        <div style={{position:'absolute',left:x,top:plotTop+plotH-h,width:barW,height:h,
          background:color,borderRadius:'13px 13px 0 0',opacity:on}} />
        <div style={{position:'absolute',left:x,top:plotTop+plotH-h-49,width:barW,
          textAlign:'center',fontSize:31,fontWeight:800,opacity:on}}>{value}</div>
        <div style={{position:'absolute',left:x,top:plotTop+plotH+21,width:barW,
          textAlign:'center',fontSize:28,color:isWeekend?theme.accent:theme.text,opacity:on}}>{String(params.dayPrefix ?? meta.params.dayPrefix.default)}{days[i]}</div>
      </div>;
    })}
    <div style={{position:'absolute',right:props.width-c.right,top:c.bottom-38,
      color:theme.muted,fontSize:23,opacity:weekend}}>{String(params.weekendNote ?? meta.params.weekendNote.default)}</div>
  </div>;
}
