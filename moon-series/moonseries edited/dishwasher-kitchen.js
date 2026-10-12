import * as THREE from '../fridge/vendor/three.module.js';
import {RoundedBoxGeometry} from '../fridge/vendor/RoundedBoxGeometry.js';

// A compact architectural vignette. The appliance keeps its original dimensions.
export function createKitchen(renderer){
 const group=new THREE.Group();group.name='Kitchen installation setting';group.visible=false;
 let seed=23817;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 function texture(kind){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;const ctx=canvas.getContext('2d');
  ctx.fillStyle=kind==='wood'?'#b8a486':'#dfdcd5';ctx.fillRect(0,0,512,512);
  if(kind==='wood'){for(let i=0;i<800;i++){const x=random()*512;ctx.strokeStyle=`rgba(${random()>.5?'62,43,24':'240,220,182'},${.035+random()*.12})`;ctx.lineWidth=.3+random()*1.4;ctx.beginPath();for(let y=0;y<=512;y+=8){const xx=x+Math.sin(y*.015+x)*2.8+Math.sin(y*.047+x)*.8;y?ctx.lineTo(xx,y):ctx.moveTo(xx,y);}ctx.stroke();}}
  else {for(let i=0;i<11000;i++){const v=random()>.5?255:70;ctx.fillStyle=`rgba(${v},${v},${v},${random()*.05})`;ctx.fillRect(random()*512,random()*512,1+random()*2,1);}
   for(let i=0;i<8;i++){ctx.beginPath();let y=random()*512;ctx.moveTo(-10,y);for(let x=0;x<540;x+=12){y+=Math.sin(x*.023+i)*4+(random()-.5)*10;ctx.lineTo(x,y);}ctx.strokeStyle='rgba(105,101,90,.11)';ctx.lineWidth=.5+random()*1.5;ctx.stroke();}}
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tex;
 }
 const wood=texture('wood'),stone=texture('stone');
 const mat=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const cabinet=mat(0xbca17e),counter=mat(0xe5e0d6,.28),wall=mat(0xc7bdaa,.92),floor=mat(0x84786b,.8),metal=mat(0xb29a6c,.29,.75),recess=mat(0x242321),ceramic=mat(0xd5c6b2,.38),leafMat=mat(0x35442c,.8),soil=mat(0x28211b);
 function box(w,h,d,x,y,z,m,r=.003){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 // A 610 mm illustrative opening gives the 598 mm product a visible reveal.
 for(const side of [-1,1]){
  box(.452,.706,.558,side*.537,.435,-.01,cabinet);
  box(.448,.697,.012,side*.537,.430,.274,recess);
  for(let i=0;i<3;i++){
   const y=.200+i*.228;box(.441,.219,.018,side*.537,y,.289,cabinet,.002);
   box(.345,.004,.012,side*.537,y+.093,.304,metal,.001);
  }
  box(.460,.071,.047,side*.536,.041,.218,recess,.001);
  box(.012,.729,.591,side*.779,.425,.004,cabinet,.001);
 }
 // Recessed installation plinth covers the exposed service base below the hinge.
 box(.610,.050,.017,0,.026,.245,recess,.001);
 box(1.60,.028,.650,0,.809,-.005,counter,.004);
 box(1.59,.120,.017,0,.881,-.319,counter,.002);
 box(1.66,1.44,.025,0,.705,-.352,wall,.001);
 box(1.70,.018,1.80,0,-.018,.24,floor,.001);
 // Narrow floor joints make the installation read as a room, rather than a plinth.
 const grout=mat(0x696259,.95);
 for(const x of [-.55,.55])box(.002,.001,1.78,x,-.008,.24,grout,0);
 for(const z of [-.10,.55])box(1.69,.001,.002,0,-.008,z,grout,0);
 // Floating shelf with a warm recessed light strip.
 box(.64,.024,.154,-.38,1.246,-.256,cabinet,.003);
 const led=new THREE.MeshBasicMaterial({color:0xffdda6});box(.56,.002,.011,-.38,1.232,-.210,led,.0005);
 const glow=new THREE.PointLight(0xffd4a0,.045,.75,2);glow.position.set(-.38,1.18,-.23);group.add(glow);
 function vase(x,y,z,scale,m){const profile=[[.031,0],[.037,.007],[.043,.039],[.038,.077],[.023,.101],[.020,.130],[.023,.134]].map(([r,h])=>new THREE.Vector2(r*scale,h*scale));const mesh=new THREE.Mesh(new THREE.LatheGeometry(profile,32),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 vase(-.59,.823,-.10,1.55,ceramic);vase(-.27,1.26,-.256,.72,ceramic);
 const pot=new THREE.Mesh(new THREE.CylinderGeometry(.061,.044,.088,32),ceramic);pot.position.set(.579,.867,-.15);pot.castShadow=true;group.add(pot);
 const dirt=new THREE.Mesh(new THREE.CircleGeometry(.055,24),soil);dirt.rotation.x=-Math.PI/2;dirt.position.set(.579,.912,-.15);group.add(dirt);
 const leafGeo=new THREE.SphereGeometry(1,10,6);const leaves=new THREE.InstancedMesh(leafGeo,leafMat,22);const dummy=new THREE.Object3D();
 for(let i=0;i<22;i++){const a=i*2.399,r=.035+(i%3)*.015;dummy.position.set(.579+Math.cos(a)*r,.925+(i/22)*.16,-.15+Math.sin(a)*r);dummy.rotation.set(Math.sin(a)*.65,a,Math.cos(a)*.75);dummy.scale.set(.016,.047,.004);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);}leaves.castShadow=true;group.add(leaves);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.002,.003,.19,7),leafMat);stem.position.set(.579,1.0,-.15);group.add(stem);
 // A low tray and two stacked ceramic dishes leave the worktop mostly clear.
 box(.19,.011,.14,.29,.829,.06,metal,.008);
 for(let i=0;i<2;i++){const dish=new THREE.Mesh(new THREE.CylinderGeometry(.055,.047,.009,36),ceramic);dish.position.set(.29,.842+i*.010,.06);dish.castShadow=true;group.add(dish);}
 const schemes={
  oak:{name:'Warm oak',caption:'Natural grain · ivory stone · warm plaster',cab:0xc7ab82,top:0xf1eee7,wall:0xcac0ae,floor:0x9d9282,metal:0xb89a64,map:wood,bg:0x282521},
  stone:{name:'Soft stone',caption:'Soft greige · pale stone · brushed champagne',cab:0xa8a69b,top:0xf5f3ec,wall:0xe4e1d8,floor:0xb3b0a6,metal:0xbaab8f,map:null,bg:0x302f2c},
  midnight:{name:'Midnight',caption:'Graphite cabinetry · dark stone · warm brass',cab:0x252c2f,top:0x4c5050,wall:0x656962,floor:0x696d68,metal:0xc4a165,map:null,bg:0x161a1c}
 };
 function apply(id){const scheme=schemes[id];group.visible=!!scheme;if(!scheme)return null;
  cabinet.color.setHex(scheme.cab);cabinet.map=scheme.map;cabinet.needsUpdate=true;
  counter.color.setHex(scheme.top);counter.map=stone;counter.needsUpdate=true;
  wall.color.setHex(scheme.wall);floor.color.setHex(scheme.floor);floor.map=stone;floor.needsUpdate=true;metal.color.setHex(scheme.metal);grout.color.setHex(scheme.floor).multiplyScalar(.8);
  return scheme;
 }
 return {group,apply};
}
