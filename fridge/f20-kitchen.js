import * as THREE from './vendor/three.module.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';

// A compact architectural vignette. The appliance keeps its original dimensions.
export function createF20Kitchen(renderer){
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


 // All closed furniture fronts share the F20 face plane: z = 0.2882 m.
 // Six-millimetre visual reveals preserve the uninterrupted built-in appearance.
 const faceZ=.2882,frontCenter=faceZ-.011;
 box(.480,2.24,.594,-.704,1.19,-.037,cabinet);
 box(.476,2.24,.012,-.704,1.19,.264,recess);
 box(.476,.710,.022,-.704,.434,frontCenter,cabinet,.0015);
 box(.476,1.518,.022,-.704,1.555,frontCenter,cabinet,.0015);
 // Slim side liners stop at the same front plane, never forming a proud surround.
 for(const x of [-.465,.465])box(.024,2.24,.619,x,1.19,-.0213,cabinet,.001);
 // Handle-free overhead fronts begin just above the refrigerator roof.
 box(.906,.404,.594,0,2.118,-.037,cabinet);
 for(const x of [-.226,.226])box(.449,.398,.022,x,2.115,frontCenter,cabinet,.0015);
 // Matching handle-free drawers, with recessed shadow joints.
 box(.824,.770,.594,.9,.48,-.037,cabinet);
 box(.820,.752,.010,.9,.478,.266,recess);
 for(let i=0;i<3;i++)box(.812,.240,.022,.9,.228+i*.246,frontCenter,cabinet,.0015);
 box(.842,.034,.627,.900,.886,-.0253,counter,.003);
 box(.842,.46,.018,.900,1.133,-.335,counter,.002);
 box(.486,.073,.043,-.704,.0365,.219,recess);
 box(.830,.073,.043,.900,.0365,.219,recess);
  // Finite room vignette: plaster wall and large stone floor slabs.
 box(2.29,2.38,.034,.181,1.18,-.363,wall,.001);
 box(2.36,.022,2.1,.181,-.017,.30,floor,.001);
 const grout=mat(0x696259,.95);
 for(const x of [-.64,.16,.96])box(.002,.001,2.08,x,-.005,.30,grout,0);
 for(const z of [-.08,.72])box(2.34,.001,.002,.181,-.005,z,grout,0);
 // Warm shelf lighting and a few quiet objects on the adjoining worktop.
 box(.72,.032,.17,.904,1.71,-.256,cabinet);
 const led=new THREE.MeshBasicMaterial({color:0xffdda6});box(.65,.002,.012,.904,1.693,-.220,led,.0005);
 const glow=new THREE.PointLight(0xffd4a0,.05,.9,2);glow.position.set(.904,1.61,-.23);group.add(glow);
 function vase(x,y,z,scale,m){const points=[[.036,0],[.050,.01],[.056,.065],[.043,.12],[.024,.15],[.026,.18]].map(([r,h])=>new THREE.Vector2(r*scale,h*scale));const mesh=new THREE.Mesh(new THREE.LatheGeometry(points,32),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 vase(.71,.903,-.13,1.15,ceramic);vase(.77,1.727,-.25,.64,ceramic);
 box(.15,.011,.105,1.07,1.732,-.252,metal,.004);box(.135,.014,.09,1.07,1.745,-.252,ceramic,.002);
 const pot=new THREE.Mesh(new THREE.CylinderGeometry(.07,.048,.10,32),ceramic);pot.position.set(1.14,.953,-.14);pot.castShadow=true;group.add(pot);
 const dirt=new THREE.Mesh(new THREE.CircleGeometry(.064,24),soil);dirt.rotation.x=-Math.PI/2;dirt.position.set(1.14,1.004,-.14);group.add(dirt);
 const leaves=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,6),leafMat,26),dummy=new THREE.Object3D();
 for(let i=0;i<26;i++){const a=i*2.399,r=.045+(i%3)*.02;dummy.position.set(1.14+Math.cos(a)*r,1.03+i*.009,-.14+Math.sin(a)*r);dummy.rotation.set(Math.sin(a)*.65,a,Math.cos(a)*.7);dummy.scale.set(.023,.060,.005);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);}leaves.castShadow=true;group.add(leaves);
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.003,.004,.27,7),leafMat);stem.position.set(1.14,1.135,-.14);group.add(stem);
 const schemes={
  oak:{name:'Warm oak',caption:'Natural oak · ivory stone · warm plaster',cab:0xc7ab82,top:0xf1eee7,wall:0xcac0ae,floor:0x9d9282,metal:0xb89a64,map:wood,bg:0x272421},
  stone:{name:'Soft stone',caption:'Soft greige · pale stone · champagne details',cab:0xb2aea4,top:0xf5f3ec,wall:0xe4e1d8,floor:0xb3b0a6,metal:0xbaab8f,map:null,bg:0x2d2d2b},
  midnight:{name:'Midnight',caption:'Graphite cabinetry · dark stone · warm brass',cab:0x252c2f,top:0x4c5050,wall:0x656962,floor:0x696d68,metal:0xc4a165,map:null,bg:0x161a1c}
 };
 function apply(id){const scheme=schemes[id];group.visible=!!scheme;if(!scheme)return null;
  cabinet.color.setHex(scheme.cab);cabinet.map=scheme.map;cabinet.needsUpdate=true;
  counter.color.setHex(scheme.top);counter.map=stone;counter.needsUpdate=true;
  wall.color.setHex(scheme.wall);floor.color.setHex(scheme.floor);floor.map=stone;floor.needsUpdate=true;metal.color.setHex(scheme.metal);grout.color.setHex(scheme.floor).multiplyScalar(.8);return scheme;
 }
 return {group,apply};
}
