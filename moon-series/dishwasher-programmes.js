// Short, illustrative visual treatments. These are not appliance cycle timings
// or engineering measurements of pressure, speed, coverage, or consumption.
export const programmeLooks={
 Quick:{duration:7,count:130,speed:1.35,rotation:1.20,height:.19,opacity:.58,label:'A brisk, short wash preview',load:'normal'},
 Normal:{duration:10,count:180,speed:.90,rotation:.75,height:.21,opacity:.60,label:'An even spray through both racks',load:'normal'},
 Heavy:{duration:10,count:240,speed:1.20,rotation:1.0,height:.25,opacity:.82,label:'A denser, more intensive spray',load:'normal'},
 Glass:{duration:10,count:105,speed:.55,rotation:.42,height:.16,opacity:.48,label:'A gentle preview with glassware',load:'glass'},
 Auto:{duration:12,count:185,speed:.85,rotation:.75,height:.21,opacity:.65,label:'Spray emphasis shifts between racks',load:'normal'},
 ECO:{duration:11,count:75,speed:.58,rotation:.45,height:.18,opacity:.48,label:'A light, pulsed wash illustration',load:'normal'},
 'Self-Clean':{duration:10,count:210,speed:.95,rotation:.80,height:.25,opacity:.72,label:'A rinse through the empty chamber',load:'empty'},
 Silence:{duration:11,count:95,speed:.42,rotation:.30,height:.17,opacity:.38,label:'A slow, subdued spray illustration',load:'normal'}
};

export function drawProgrammeSpray(array,look,name,time){
 const pulse=name==='ECO'?.45+.55*Math.max(0,Math.sin(time*1.5)):name==='Quick'?.8+.2*Math.sin(time*5):1;
 const count=Math.round(look.count*pulse),autoPhase=Math.floor(time/2)%2;
 for(let i=0;i<count;i++){
  const level=name==='Glass'?1:name==='Auto'?autoPhase:i%2;
  const rotation=time*look.rotation*(level?-1:1)+(level?.25:0);
  const nozzle=(-.19+(i%12)*.38/11),x0=Math.cos(rotation)*nozzle,z0=Math.sin(rotation)*nozzle-.026,y0=level?.455:.15;
  const direction=i*2.399,spread=.035+(i%5)*.015,p=(i*.061+time*look.speed)%1,tail=Math.max(0,p-(name==='Heavy'?.14:name==='Glass'?.065:.10));
  const j=i*6;
  for(const [offset,progress] of [[0,p],[3,tail]]){
   array[j+offset]=Math.max(-.248,Math.min(.248,x0+Math.cos(direction)*progress*spread));
   array[j+offset+1]=y0+look.height*progress-.075*progress*progress;
   array[j+offset+2]=Math.max(-.218,Math.min(.208,z0+Math.sin(direction)*progress*spread));
  }
 }
 return count;
}
