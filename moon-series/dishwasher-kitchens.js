import * as THREE from '../fridge/vendor/three.module.js';
import {RoundedBoxGeometry} from '../fridge/vendor/RoundedBoxGeometry.js';

// Shared installation bay, five distinct settings, and independent product dimensions.
export function createKitchen(renderer){
 const group=new THREE.Group();group.name='Installed kitchen';group.visible=false;
 let seed=23817;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const mat=(color,roughness=.65,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=kind==='wood'?'#b69c78':'#ccc8be';ctx.fillRect(0,0,512,512);
  if(kind==='wood'){for(let i=0;i<950;i++){const x=random()*512;ctx.beginPath();for(let y=0;y<=512;y+=8){const xx=x+Math.sin(y*.012+x*.1)*3.4+Math.sin(y*.047+x)*.8;y?ctx.lineTo(xx,y):ctx.moveTo(xx,y);}ctx.lineWidth=.3+random()*1.2;ctx.strokeStyle=`rgba(${random()>.4?'65,42,23':'244,223,188'},${.035+random()*.16})`;ctx.stroke();}}
  else{for(let i=0;i<18000;i++){const v=random()>.5?250:65;ctx.fillStyle=`rgba(${v},${v},${v},${random()*.05})`;ctx.fillRect(random()*512,random()*512,1+random()*2,1);}for(let i=0;i<12;i++){ctx.beginPath();let y=random()*512;ctx.moveTo(0,y);for(let x=0;x<=512;x+=8){y+=Math.sin(x*.026+i)*3+(random()-.5)*9;ctx.lineTo(x,y);}ctx.strokeStyle='rgba(85,82,73,.19)';ctx.lineWidth=.5+random()*1.2;ctx.stroke();}}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
 }
 const wood=texture('wood'),stone=texture('stone');
 const cabinet=mat(0xb69a78),top=mat(0xd4d0c7,.3),wall=mat(0xc7bca9,.94),floor=mat(0x8e8273,.87),metal=mat(0xb69a6c,.26,.83),recess=mat(0x242623,.8),steel=mat(0xa0aeb0,.23,.92),ceramic=mat(0xd7cabb,.30),darkCeramic=mat(0x41463d,.36),leaf=mat(0x354c31,.86),grout=mat(0x7d7364,.95),glass=mat(0x455153,.22,.3);
 top.map=stone;top.bumpMap=stone;top.bumpScale=.0003;floor.map=stone;
 const variants={};for(const id of ['oak','stone','midnight','loft','coastal']){variants[id]=new THREE.Group();variants[id].visible=false;group.add(variants[id]);}
 function box(w,h,d,x,y,z,m,parent=group,r=.002){const mesh=new THREE.Mesh(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function line(points,r,m,parent=group){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*5),r,8,false),m);mesh.castShadow=true;parent.add(mesh);return mesh;}
 function cylinder(r1,r2,h,x,y,z,m,parent=group){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function batchBoxes(poses,dimensions,m,parent){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(...dimensions),m,poses.length),dummy=new THREE.Object3D();poses.forEach(([x,y,z],i)=>{dummy.position.set(x,y,z);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);}
 function bowl(x,y,z,scale=1,m=ceramic,parent=group){const profile=[[0,0],[.033,.001],[.04,.008],[.058,.035],[.063,.044],[.060,.047],[.056,.039],[.037,.013],[0,.009]].map(([r,h])=>new THREE.Vector2(r*scale,h*scale));const mesh=new THREE.Mesh(new THREE.LatheGeometry(profile,28),m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);}
 function vase(x,y,z,scale=1,m=ceramic,parent=group){const pts=[[.026,0],[.037,.008],[.043,.062],[.031,.105],[.017,.13],[.017,.151],[.021,.153]].map(([r,h])=>new THREE.Vector2(r*scale,h*scale));const mesh=new THREE.Mesh(new THREE.LatheGeometry(pts,28),m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);}
 function plant(x,y,z,scale=1,parent=group){cylinder(.045*scale,.033*scale,.067*scale,x,y+.033*scale,z,ceramic,parent);const leaves=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),leaf,28),d=new THREE.Object3D();for(let i=0;i<28;i++){const a=i*2.399,r=.018+(i%5)*.009;d.position.set(x+Math.cos(a)*r*scale,y+(.08+i*.004)*scale,z+Math.sin(a)*r*scale);d.rotation.set(Math.sin(a)*.6,a,Math.cos(a)*.6);d.scale.set(.012*scale,.039*scale,.003*scale);d.updateMatrix();leaves.setMatrixAt(i,d.matrix);}leaves.castShadow=true;parent.add(leaves);cylinder(.0015*scale,.002*scale,.16*scale,x,y+.10*scale,z,leaf,parent);}
 for(const side of [-1,1])for(const [center,w] of [[.536,.45],[.991,.43]]){
  box(w,.704,.556,side*center,.431,-.013,recess);
  for(let i=0;i<3;i++){const y=.197+i*.229;box(w-.008,.217,.018,side*center,y,.280,cabinet);box(w-.018,.007,.013,side*center,y+.105,.280,recess);}
  box(w,.069,.045,side*center,.040,.210,recess);
 }
 for(const side of [-1,1])box(.013,.726,.592,side*1.220,.423,-.01,cabinet);
 box(.610,.050,.017,0,.026,.245,recess);box(2.46,.012,.650,0,.787,-.010,recess);
 // Split worktop surrounds a recessed sink, rather than a solid slab under a bowl.
 box(1.895,.032,.650,-.2775,.810,-.005,top);box(.145,.032,.650,1.1525,.810,-.005,top);
 box(.410,.032,.130,.875,.810,-.265,top);box(.410,.032,.210,.875,.810,.215,top);box(.410,.006,.310,.875,.705,-.045,steel);
 for(const x of [.670,1.080])box(.006,.102,.310,x,.759,-.045,steel);for(const z of [-.200,.110])box(.410,.102,.006,.875,.759,z,steel);
 cylinder(.018,.003,.005,.875,.711,-.045,recess);cylinder(.026,.022,.008,.875,.827,-.235,steel);
 line([[.875,.829,-.235],[.875,1.03,-.235],[.875,1.075,-.205],[.875,1.067,-.135],[.875,1.015,-.115]],.009,metal);
 cylinder(.013,.013,.035,.933,.843,-.230,metal);box(.005,.045,.006,.933,.870,-.218,metal);
 box(2.49,1.96,.024,0,.965,-.362,wall);box(2.63,.020,2.08,0,-.019,.322,floor);
 batchBoxes([-.88,-.44,0,.44,.88].map(x=>[x,-.008,.322]),[.0015,.001,2.05],grout,group);batchBoxes([-.29,.18,.65,1.12].map(z=>[0,-.008,z]),[2.61,.001,.0015],grout,group);
 const board=mat(0x9d7651,.8);board.map=wood;box(.250,.012,.175,-.79,.833,-.02,board,group,.012);bowl(-.79,.840,-.02,1.15,ceramic);vase(-1.02,.827,-.19,1.2,darkCeramic);plant(.43,.827,-.20,.75);
 for(const x of [-.50,-.61]){cylinder(.033,.033,.080,x,.868,-.205,ceramic);cylinder(.034,.034,.008,x,.912,-.205,board);}
 function upperUnit(x,y,w,h,parent,reeded=false){box(w,h,.265,x,y,-.208,cabinet,parent);if(reeded){box(w-.04,h-.04,.008,x,y,-.067,glass,parent);const ribs=[];for(let dx=-w/2+.035;dx<w/2-.02;dx+=.022)ribs.push([x+dx,y,-.060]);batchBoxes(ribs,[.002,h-.05,.003],metal,parent);}else{box(w-.012,h-.012,.014,x,y,-.066,cabinet,parent);box(.003,h-.015,.014,x,y,-.055,recess,parent);}box(w-.05,.003,.015,x,y-h/2-.004,-.085,new THREE.MeshBasicMaterial({color:0xffd79a}),parent);}
 function shelf(x,y,w,parent){box(w,.022,.190,x,y,-.255,cabinet,parent);box(w-.04,.002,.008,x,y-.013,-.165,new THREE.MeshBasicMaterial({color:0xffdda0}),parent);}
 function windowFrame(x,y,w,h,parent,kind='garden'){
  const c=document.createElement('canvas');c.width=512;c.height=384;const cx=c.getContext('2d'),sky=cx.createLinearGradient(0,0,0,384);sky.addColorStop(0,kind==='city'?'#a9b8c1':'#c5d1c1');sky.addColorStop(1,kind==='city'?'#d9c9aa':'#839878');cx.fillStyle=sky;cx.fillRect(0,0,512,384);
  for(let i=0;i<35;i++){cx.fillStyle=kind==='city'?`rgba(68,78,84,${.12+random()*.18})`:`rgba(48,77,46,${.07+random()*.15})`;if(kind==='city')cx.fillRect(random()*512,180+random()*120,15+random()*45,200);else{const xx=random()*512;cx.fillRect(xx,0,3+random()*8,384);cx.beginPath();cx.ellipse(xx,170+random()*200,30+random()*50,60+random()*80,random(),0,Math.PI*2);cx.fill();}}
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;box(w,h,.006,x,y,-.344,new THREE.MeshBasicMaterial({map}),parent);
  for(const side of [-1,1]){box(.025,h+.04,.055,x+side*w/2,y,-.315,metal,parent);box(w+.04,.025,.055,x,y+side*h/2,-.315,metal,parent);}box(.018,h,.045,x,y,-.312,metal,parent);box(w,.018,.045,x,y+.03,-.312,metal,parent);box(w+.08,.030,.145,x,y-h/2-.02,-.284,top,parent);
 }
 windowFrame(-.74,1.44,.78,.77,variants.oak);upperUnit(.79,1.54,.79,.57,variants.oak);shelf(.02,1.365,.55,variants.oak);bowl(-.12,1.38,-.25,.7,ceramic,variants.oak);vase(.16,1.38,-.24,.60,darkCeramic,variants.oak);batchBoxes(Array.from({length:14},(_,i)=>[1.055+i*.012,1.12,-.337]),[.006,.41,.014],cabinet,variants.oak);
 const nicheBack=mat(0x80786c,.9),niche=new THREE.Shape();niche.moveTo(-1.11,1.02);niche.lineTo(-1.11,1.44);niche.absarc(-.74,1.44,.37,Math.PI,0,true);niche.lineTo(-.37,1.02);niche.closePath();const nicheMesh=new THREE.Mesh(new THREE.ShapeGeometry(niche),nicheBack);nicheMesh.position.z=-.345;variants.stone.add(nicheMesh);
 const archPoints=[[-1.12,1.02,-.323],[-1.12,1.44,-.323]];for(let i=0;i<=20;i++){const a=Math.PI-i*Math.PI/20;archPoints.push([-.74+Math.cos(a)*.38,1.44+Math.sin(a)*.38,-.323]);}archPoints.push([-.36,1.02,-.323]);line(archPoints,.009,top,variants.stone);shelf(-.74,1.19,.68,variants.stone);shelf(-.74,1.47,.60,variants.stone);vase(-.88,1.206,-.27,.85,ceramic,variants.stone);bowl(-.58,1.487,-.26,.75,darkCeramic,variants.stone);upperUnit(.78,1.55,.82,.58,variants.stone);
 const tile=mat(0xd0cdc3,.40),tiles=[];for(let x=-.25;x<1.2;x+=.12)for(let y=.88;y<1.23;y+=.115)tiles.push([x,y,-.342]);batchBoxes(tiles,[.116,.110,.008],tile,variants.stone);
 upperUnit(-.78,1.55,.79,.57,variants.midnight,true);upperUnit(.78,1.55,.79,.57,variants.midnight,true);shelf(0,1.45,.62,variants.midnight);for(let i=0;i<3;i++)bowl(-.15,1.465+i*.012,-.255,.75,ceramic,variants.midnight);vase(.15,1.465,-.25,.72,ceramic,variants.midnight);box(.36,.725,.43,-1.03,.43,.52,cabinet,variants.midnight);box(.40,.032,.47,-1.03,.810,.53,top,variants.midnight);box(.25,.008,.20,-1.03,.835,.50,metal,variants.midnight,.012);
 const brick=mat(0x70503e,.94),brickPos=[];for(let row=0;row<7;row++)for(let col=0;col<12;col++){const x=-1.14+col*.200+(row%2?.100:0),y=.90+row*.145,inWindow=x> -1.23&&x< -.31&&y>.992;if(x<1.16&&!inWindow)brickPos.push([x,y,-.341]);}batchBoxes(brickPos,[.188,.127,.015],brick,variants.loft);windowFrame(-.77,1.45,.72,.78,variants.loft,'city');const blackSteel=mat(0x252b2d,.45,.75);box(.98,.014,.21,.64,1.60,-.246,blackSteel,variants.loft);for(const x of [.22,1.06])box(.010,.45,.010,x,1.37,-.319,blackSteel,variants.loft);for(const x of [.28,.60,.91]){cylinder(.050,.044,.058,x,1.638,-.25,steel,variants.loft);cylinder(.052,.052,.006,x,1.669,-.25,blackSteel,variants.loft);}shelf(.65,1.20,.97,variants.loft);plant(.96,1.215,-.25,.75,variants.loft);
 windowFrame(.37,1.50,1.44,.70,variants.coastal);shelf(-.88,1.32,.55,variants.coastal);shelf(-.88,1.68,.55,variants.coastal);vase(-1.03,1.695,-.26,.73,ceramic,variants.coastal);bowl(-.77,1.335,-.25,.85,ceramic,variants.coastal);plant(-.93,1.335,-.25,.65,variants.coastal);batchBoxes(Array.from({length:24},(_,i)=>[-.29+i*.060,1.01,-.340]),[.027,.30,.012],ceramic,variants.coastal);
 const glow=new THREE.PointLight(0xffd5a0,.060,1.8,2);glow.position.set(.25,1.25,-.15);group.add(glow);
 const schemes={oak:{name:'Warm oak',caption:'Garden window · oak grain · brushed brass',cab:0xc7ac85,top:0xe5e0d6,wall:0xbeb39e,floor:0x978b78,metal:0xb99a64,map:wood,bg:0x242320},stone:{name:'Soft stone',caption:'Arched niche · ceramic tile · pale stone',cab:0xaaa69b,top:0xf1eee4,wall:0xd0cbbf,floor:0xb0aaa0,metal:0xb8aa8c,map:null,bg:0x292a28},midnight:{name:'Midnight',caption:'Reeded glass · graphite cabinets · return counter',cab:0x252d30,top:0x41494a,wall:0x4a514e,floor:0x575b55,metal:0xb89e70,map:null,bg:0x11191b},loft:{name:'Urban loft',caption:'Brick wall · industrial glazing · open steel shelving',cab:0x686b67,top:0x7d8078,wall:0x7e7063,floor:0x625f55,metal:0x777d7b,map:null,bg:0x222324},coastal:{name:'Coastal',caption:'Daylight window · sage cabinetry · open oak shelves',cab:0x9eafa1,top:0xe8e5da,wall:0xd6d1c1,floor:0xb6aa92,metal:0xb5a17c,map:null,bg:0x2b302e}};
 let active='studio';
 function apply(id){const scheme=schemes[id];active=scheme?id:'studio';group.visible=!!scheme;Object.entries(variants).forEach(([key,g])=>g.visible=key===id);if(!scheme)return null;cabinet.color.setHex(scheme.cab);cabinet.map=scheme.map;cabinet.bumpMap=scheme.map;cabinet.bumpScale=.0008;cabinet.needsUpdate=true;top.color.setHex(scheme.top);wall.color.setHex(scheme.wall);floor.color.setHex(scheme.floor);metal.color.setHex(scheme.metal);grout.color.setHex(scheme.floor).multiplyScalar(.8);return scheme;}
 return {group,apply,get active(){return active;},get bounds(){return {min:[-1.31,-.04,-.39],max:[1.31,1.97,1.01]};},get locations(){return Object.keys(schemes);}};
}


