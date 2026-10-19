// A short, user-triggered gesture; the explorer owns the actual door mechanics.
export function createKnock({root,viewport,reduced,onStart,onOpen,request}){
 const button=root.querySelector('#dw-knock'),overlay=root.querySelector('#dw-knock-gesture'),hand=overlay.querySelector('svg'),rings=[...overlay.querySelectorAll('i')],status=root.querySelector('#dw-knock-status'),caption=root.querySelector('#dw-knock-caption');
 let active=false,phase='idle',elapsed=0,taps=0;
 const smooth=(value,a,b)=>{const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t);};
 const say=text=>{status.textContent=caption.textContent=text;};
 function finish(){active=false;phase='complete';overlay.hidden=caption.hidden=true;button.disabled=false;button.querySelector('span').textContent='Replay Knock Knock';say('Opened with two knocks. Explore the trays inside.');}
 function start(){
  if(active)return;onStart();elapsed=0;taps=0;
  if(reduced.matches){taps=2;onOpen();finish();request();return;}
  active=true;phase='preparing';overlay.hidden=true;caption.hidden=false;overlay.dataset.taps='0';button.disabled=true;say('Getting ready for two gentle knocks…');
  const r=viewport.getBoundingClientRect();if(r.top<90||r.bottom>innerHeight-20)viewport.scrollIntoView({behavior:'smooth',block:'center'});
  request();
 }
 function cancel(){if(!active)return;active=false;phase='idle';overlay.hidden=caption.hidden=true;button.disabled=false;say('Two gentle knocks. The door opens for you.');}
 function update(dt,{ready,opened}){
  if(!active)return false;
  if(reduced.matches){taps=2;onOpen();finish();return false;}
  if(phase==='preparing'){if(!ready)return true;phase='knocking';elapsed=0;overlay.hidden=false;}
  elapsed+=dt;
  const t=elapsed,enter=smooth(t,0,.32),leave=smooth(t,1.17,1.48);
  const press=Math.exp(-Math.pow((t-.55)/.085,2))+Math.exp(-Math.pow((t-.99)/.085,2));
  hand.style.opacity=String(enter*(1-leave));
  hand.style.transform=`translate(${(1-enter)*64+(1-press)*10+leave*30}px,${(1-enter)*30+(1-press)*3+leave*22}px) rotate(${5-press*9+leave*9}deg)`;
  rings.forEach((ring,i)=>{const age=t-[.55,.99][i],progress=age/.62;ring.style.opacity=age>=0&&progress<=1?String((1-progress)*.75):'0';ring.style.transform=`translate(-50%,-50%) scale(${.35+Math.max(0,progress)*2.25})`;});
  const count=t>=.99?2:t>=.55?1:0;
  if(count!==taps){taps=count;overlay.dataset.taps=String(taps);say(taps===1?'Knock…':'Knock. Knock.');}
  if(t>=1.50&&phase==='knocking'){phase='opening';overlay.hidden=true;say('Two knocks. Opening for you…');onOpen();}
  if(phase==='opening'&&opened)finish();
  return active;
 }
 button.onclick=start;
 return {start,cancel,update,get active(){return active;},get state(){return {active,phase,elapsed,taps};},position(x,y,scale){overlay.style.left=x+'px';overlay.style.top=y+'px';overlay.style.setProperty('--knock-scale',scale);}};
}
