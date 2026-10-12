import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

// Lightweight, unbranded groceries. Contents are children of their actual supports.
export function stockF20({model,bins,nitrogen,fresh,defrost}){
 const groups=[],materials={};
 const mat=(name,color,roughness=.5,extra={})=>materials[name]||(materials[name]=new THREE.MeshStandardMaterial({color,roughness,...extra}));
 const white=mat('ceramic',0xf1eee2,.3),blue=mat('blue',0x356789,.36),green=mat('green',0x55822b,.65),darkGreen=mat('darkgreen',0x2e5423,.7),red=mat('red',0xc43c30,.3),orange=mat('orange',0xed922b,.65),stemMat=mat('stem',0x53682c,.8),glass=mat('glass',0xb3d3d7,.16,{transparent:true,opacity:.36,depthWrite:false,metalness:.05}),water=mat('water',0x94bac9,.23,{transparent:true,opacity:.52,depthWrite:false}),lid=mat('lid',0xc6cfcb,.33);
 const roundGeo=new THREE.SphereGeometry(1,18,12);
 function group(parent){const g=new THREE.Group();parent.add(g);groups.push(g);return g;}
 function mesh(geometry,material,parent,x,y,z){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=!material.transparent;m.receiveShadow=true;parent.add(m);return m;}
 function oval(parent,x,y,z,rx,ry,rz,material){const m=mesh(roundGeo,material,parent,x,y,z);m.scale.set(rx,ry,rz);return m;}
 function box(parent,w,h,d,x,y,z,material,r=.004){return mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),material,parent,x,y,z);}
 function cylinder(parent,r,h,x,y,z,material){return mesh(new THREE.CylinderGeometry(r,r,h,20),material,parent,x,y,z);}
 function label(parent,text,w,h,x,y,z,color='#3d5d6c'){
  const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#f0ede3';ctx.fillRect(0,0,256,128);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='500 27px Arial';ctx.fillText(text,128,60);ctx.font='12px Arial';ctx.fillText('F R E S H',128,89);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}),parent,x,y,z);
 }
 const bottleGeo=new THREE.LatheGeometry([[0,0],[.023,0],[.028,.006],[.028,.132],[.026,.151],[.014,.176],[.011,.18],[.011,.202],[0,.202]].map(p=>new THREE.Vector2(...p)),24);
 function bottle(parent,x,y,z,cap=blue){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);mesh(bottleGeo,glass,g,0,0,0);cylinder(g,.024,.128,0,.068,0,water);cylinder(g,.013,.016,0,.201,0,cap);
  for(const yy of [.022,.04,.058,.13]){const ring=mesh(new THREE.TorusGeometry(.028,.0012,5,24),glass,g,0,yy,0);ring.rotation.x=Math.PI/2;}
  const band=cylinder(g,.0286,.041,0,.102,0,white);label(g,'WATER',.045,.025,0,.103,.029);
 }
 function fruit(parent,x,y,z,r,material){const m=oval(parent,x,y,z,r,r*.9,r,material);cylinder(parent,.0018,.009,x,y+r*.85,z,stemMat);const leaf=oval(parent,x+.008,y+r*.89,z,.011,.0015,.005,green);leaf.rotation.z=.35;return m;}
 function bowl(parent,x,y,z){const points=[[.045,0],[.06,.008],[.085,.036],[.089,.041],[.084,.043],[.079,.037],[.054,.009],[.045,.007]].map(p=>new THREE.Vector2(...p));mesh(new THREE.LatheGeometry(points,32),white,parent,x,y,z);}
 const shelves=group(model);
 // Top shelf: a ceramic fruit bowl and a pair of water bottles, set behind the door bins.
 bowl(shelves,-.218,1.573,-.078);
 fruit(shelves,-.247,1.625,-.074,.033,red);fruit(shelves,-.194,1.62,-.093,.032,orange);fruit(shelves,-.218,1.624,-.034,.032,green);
 bottle(shelves,.195,1.573,-.13);bottle(shelves,.265,1.573,-.12);
 // Second shelf: a small lidded food container, two yoghurt pots and vine tomatoes.
 box(shelves,.159,.045,.112,-.229,1.363,-.080,glass,.009);box(shelves,.166,.009,.118,-.229,1.390,-.080,lid,.006);
 for(let i=0;i<7;i++)oval(shelves,-.28+(i%4)*.029,1.356,-.109+Math.floor(i/4)*.04,.014,.014,.016,red);
 for(const x of [-.035,.035]){cylinder(shelves,.027,.070,x,1.375,-.12,white);cylinder(shelves,.028,.005,x,1.412,-.12,blue);label(shelves,'YOGURT',.038,.028,x,1.382,-.092);}
 box(shelves,.169,.008,.122,.225,1.344,-.076,white,.012);
 for(const [x,z] of [[.19,-.08],[.247,-.104],[.255,-.047]]){fruit(shelves,x,1.373,z,.027,red);for(let i=0;i<5;i++){const a=i*Math.PI*.4;const leaf=oval(shelves,x+Math.cos(a)*.008,1.398,z+Math.sin(a)*.008,.01,.0015,.003,green);leaf.rotation.y=-a;}}
 // Door racks: bottles and cartons follow the hinges instead of floating in space.
 for(const {bin,sign,y} of bins){const g=group(bin);g.rotation.y=Math.PI;
  if(sign===1&&y===1.58){for(const x of [-.105,0,.105])bottle(g,x,.006,0);}
  if(sign===-1&&y===1.31){
   for(const x of [-.085,.065]){box(g,.065,.157,.065,x,.084,0,white,.002);const roof=mesh(new THREE.CylinderGeometry(.046,.046,.066,3),white,g,x,.171,0);roof.rotation.y=Math.PI/4;roof.scale.set(1,.52,1);cylinder(g,.009,.008,x+.017,.191,.010,blue);label(g,'MILK',.05,.051,x,.117,.033);}
  }
  if(sign===1&&y===1.055){for(const x of [-.105,0,.105]){cylinder(g,.026,.107,x,.061,0,glass);cylinder(g,.027,.014,x,.122,0,lid);cylinder(g,.022,.077,x,.047,0,mat('jarfill',0x7f933a,.7));label(g,'OLIVES',.038,.027,x,.075,.027);}}
  if(sign===-1&&y===1.58){bottle(g,-.08,.006,0,green);bottle(g,.02,.006,0,green);}
 }
 // Produce stays below the closed drawer covers and travels with the actual tubs.
 const produce=group(nitrogen);
 for(const [x,z,m] of [[-.27,-.085,red],[-.19,-.07,green],[-.235,.004,orange]])fruit(produce,x,-.041,z,.033,m);
 for(let i=0;i<3;i++){const c=oval(produce,.21+(i%2)*.061,-.043+i*.009,-.055+i*.055,.019,.018,.083,darkGreen);c.rotation.y=.20;}
 const veg=group(fresh);
 for(let i=0;i<8;i++){const a=i*2.399;const leaf=oval(veg,-.077+Math.cos(a)*.026,-.016+Math.sin(i)*.014,-.045+Math.sin(a)*.034,.035,.027,.048,i%2?green:darkGreen);leaf.rotation.set(.25,a,.2);}
 for(let i=0;i<3;i++){const carrot=mesh(new THREE.ConeGeometry(.012,.15,12),orange,veg,.045+i*.032,-.050,.006);carrot.rotation.x=Math.PI/2;const greens=oval(veg,.045+i*.032,-.04,-.078,.013,.009,.02,green);}
 const meal=group(defrost);box(meal,.24,.04,.19,0,-.042,0,glass,.012);box(meal,.247,.007,.197,0,-.018,0,lid,.009);
 return {setVisible(value){groups.forEach(g=>g.visible=value);},groups};
}
