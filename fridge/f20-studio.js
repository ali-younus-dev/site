/* F20 solid model. Units: metres. Overall geometry follows brochure p6 installation
 * drawing: W .894, H 1.910, D .575. The conflicting .984 specification is disclosed
 * on the page. Interior geometry is schematic, based on the p4 layout. */
import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import frontImageUrl from './reference/manual-front.webp';


const studio=document.querySelector('#f20-studio');
const viewport=document.querySelector('#f20-viewport');
const mount=document.querySelector('#f20-model-mount');
const $=s=>studio.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const SIZE={width:.894,height:1.910,depth:.575,doorMax:113,freezerTop:.800};
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch(e){
  studio.querySelectorAll('button,input').forEach(b=>b.disabled=true);
  document.querySelector('.f20-model-note').prepend('Showing the official product photograph. ');
}
if(renderer) initialize();

async function initialize(){
 const scene=new THREE.Scene();
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.08;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 mount.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','F20 solid model with 894 millimetre width, 1910 millimetre height and 575 millimetre depth');
 renderer.domElement.setAttribute('role','button');
 renderer.domElement.setAttribute('tabindex','0');
 const environment=new RoomEnvironment();
 const pmrem=new THREE.PMREMGenerator(renderer);
 const env=pmrem.fromScene(environment,.04);
 scene.environment=env.texture;scene.environmentIntensity=1;environment.dispose();pmrem.dispose();
 const camera=new THREE.PerspectiveCamera(30,1,.05,30);
 camera.position.set(0,1.7,5.65);camera.lookAt(0,.97,0);
 scene.add(new THREE.HemisphereLight(0xf3f0ff,0x27202b,.9));
 const key=new THREE.DirectionalLight(0xfff7ef,1.65);key.position.set(-3,4.5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-2;key.shadow.camera.right=2;key.shadow.camera.top=3;key.shadow.camera.bottom=-2;key.shadow.normalBias=.01;scene.add(key);
 const fill=new THREE.DirectionalLight(0xcbdcff,1);fill.position.set(3,3,2);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xfc344e,.65);rim.position.set(-2,2,-2);scene.add(rim);
 const model=new THREE.Group();scene.add(model);
 model.rotation.y=THREE.MathUtils.degToRad(-20);
 const shellMat=new THREE.MeshStandardMaterial({color:0x424348,metalness:.58,roughness:.37});
 const edgeMat=new THREE.MeshStandardMaterial({color:0x292b30,metalness:.5,roughness:.4});
 const linerMat=new THREE.MeshStandardMaterial({color:0x8d9295,metalness:.58,roughness:.48});
 const drawerMat=new THREE.MeshStandardMaterial({color:0x777d81,metalness:.5,roughness:.43});
 const doorBinMat=new THREE.MeshStandardMaterial({color:0x8b9295,metalness:.72,roughness:.35,envMapIntensity:1.1});
 const railMat=new THREE.MeshStandardMaterial({color:0xc5cdd0,metalness:.9,roughness:.22,envMapIntensity:1.4});
 const iceMat=new THREE.MeshStandardMaterial({color:0xd7e1e5,metalness:.18,roughness:.32});
 const ventMat=new THREE.MeshStandardMaterial({color:0x262d31,metalness:.58,roughness:.38});
 const brushCanvas=document.createElement('canvas');brushCanvas.width=1024;brushCanvas.height=512;
 const brushContext=brushCanvas.getContext('2d');brushContext.fillStyle='#b8bdc0';brushContext.fillRect(0,0,1024,512);
 // Long, low-contrast vertical strokes reproduce the satin metal of the supplied door render.
 let brushSeed=19;
 for(let x=0;x<1024;x++){
   brushSeed=(brushSeed*1664525+1013904223)>>>0;
   const tone=187+(brushSeed%3);
   brushContext.fillStyle=`rgb(${tone},${tone+3},${tone+5})`;
   brushContext.fillRect(x,0,1,512);
 }
 const brushTexture=new THREE.CanvasTexture(brushCanvas);brushTexture.colorSpace=THREE.SRGBColorSpace;
 brushTexture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
 const grainCanvas=document.createElement('canvas');grainCanvas.width=512;grainCanvas.height=512;
 const grainContext=grainCanvas.getContext('2d');let seed=207;
 for(let x=0;x<512;x++){
   seed=(seed*1664525+1013904223)>>>0;const shade=126+(seed%9);
   grainContext.fillStyle=`rgb(${shade},${shade},${shade})`;grainContext.fillRect(x,0,1,512);
 }
 const grainTexture=new THREE.CanvasTexture(grainCanvas);
 for(const material of [shellMat,drawerMat,doorBinMat]){
   material.map=brushTexture;material.bumpMap=grainTexture;material.bumpScale=.000008;
 }
 doorBinMat.color.setHex(0x929e9b);drawerMat.color.setHex(0x8f9996);
 const tubMat=new THREE.MeshStandardMaterial({color:0xbfc9ca,metalness:.23,roughness:.4});
 const paleSealMat=new THREE.MeshStandardMaterial({color:0xc2c6c4,roughness:.72});
 const brushMat=new THREE.MeshStandardMaterial({map:brushTexture,bumpMap:grainTexture,bumpScale:.000008,color:0xdde4e1,metalness:.72,roughness:.42,envMapIntensity:1.2});
 const gasketMat=new THREE.MeshStandardMaterial({color:0x242528,roughness:.85});
 const glassMat=new THREE.MeshPhysicalMaterial({color:0xc7d5d9,metalness:.12,roughness:.17,transparent:true,opacity:.27,side:THREE.DoubleSide,depthWrite:false});
 const lightMat=new THREE.MeshBasicMaterial({color:0xe6faff});
 function box(w,h,d,x,y,z,material=linerMat,parent=model,round=.004){
   const geometry=round?new RoundedBoxGeometry(w,h,d,3,Math.min(round,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d);
   const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function label(text,w,h,x,y,z,parent,color='#d9dddf',size=36){
   const cv=document.createElement('canvas');cv.width=640;cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle=color;ctx.font=`500 ${size}px Manrope,Arial,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,320,64);
   const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
   const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.FrontSide}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 // Cabinet frame, real depth and solid walls. Door thickness is included in .575 m.
 box(.026,1.865,.523,-.434,.974,-.026,shellMat);
 box(.026,1.865,.523,.434,.974,-.026,shellMat);
 box(.868,.025,.523,0,1.8975,-.026,shellMat);
 box(.85,1.84,.025,0,.98,-.275,shellMat);
 box(.85,.036,.522,0,.07,-.026,edgeMat);
 box(.842,.022,.49,0,.793,-.022,linerMat);
 // Illuminated stainless upper cavity, with two adjustable shelves.
 box(.8,1.05,.012,0,1.331,-.253,linerMat);
 box(.011,1.055,.454,-.405,1.337,-.021,brushMat);
 box(.011,1.055,.454,.405,1.337,-.021,brushMat);
 box(.793,.009,.395,0,1.567,-.007,glassMat);
 box(.793,.009,.395,0,1.335,-.007,glassMat);
 box(.793,.01,.018,0,1.567,.194,linerMat);
 box(.793,.01,.018,0,1.335,.194,linerMat);
 const glassEdgeMat=new THREE.MeshBasicMaterial({color:0x8cdeed,transparent:true,opacity:.58});
 for(const y of [1.567,1.335]){
   box(.77,.003,.004,0,y+.006,.205,glassEdgeMat,model,.001);
   for(const x of [-.37,.37])box(.017,.015,.045,x,y,-.205,railMat,model,.002);
 }
 box(.735,.009,.03,0,1.862,-.005,lightMat);
 // The supplied open-door image shows a restrained cool-blue LED edge in the cavity.
 const sideLightMat=new THREE.MeshBasicMaterial({color:0x91dbf0});
 box(.006,.94,.009,-.397,1.365,.196,sideLightMat);
 box(.006,.94,.009,.397,1.365,.196,sideLightMat);
 const interiorLight=new THREE.PointLight(0xb7e9f5,.65,1.65,2);interiorLight.position.set(0,1.67,.17);model.add(interiorLight);
 const sideFillLeft=new THREE.PointLight(0x8cdbf2,.15,.65,2);sideFillLeft.position.set(-.37,1.39,.16);model.add(sideFillLeft);
 const sideFillRight=new THREE.PointLight(0x8cdbf2,.15,.65,2);sideFillRight.position.set(.37,1.39,.16);model.add(sideFillRight);
 // Rounded, open-top liners. The ring is one continuous four-sided wall.
 function roundedOutline(shape,w,d,r){
   const x=-w/2,z=-d/2;
   shape.moveTo(x+r,z);shape.lineTo(x+w-r,z);shape.quadraticCurveTo(x+w,z,x+w,z+r);
   shape.lineTo(x+w,z+d-r);shape.quadraticCurveTo(x+w,z+d,x+w-r,z+d);
   shape.lineTo(x+r,z+d);shape.quadraticCurveTo(x,z+d,x,z+d-r);
   shape.lineTo(x,z+r);shape.quadraticCurveTo(x,z,x+r,z);
 }
 function tubWall(w,h,d,t,y,z,material,parent,r=.016){
   const shape=new THREE.Shape();roundedOutline(shape,w,d,r);
   const hole=new THREE.Path();roundedOutline(hole,w-t*2,d-t*2,Math.max(.004,r-t));shape.holes.push(hole);
   const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:8}),material);
   mesh.rotation.x=Math.PI/2;mesh.position.set(0,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function tray(w,h,d,x,y,z,pattern){
   const group=new THREE.Group();group.position.set(x,y,z);model.add(group);
   box(w,.015,d,0,-h/2+.0075,0,tubMat,group,.007);
   tubWall(w,h,d,.012,0,0,tubMat,group);
   tubWall(w+.004,.005,d+.004,.007,h/2,0,railMat,group);
   box(w+.005,h,.016,0,0,d/2+.006,drawerMat,group,.005);
   box(w-.018,.009,.013,0,-h/2+.01,d/2+.016,railMat,group,.003);
   const count=pattern==='ribbed'?12:4;
   for(let i=0;i<count;i++){
     box(w-.05,pattern==='ribbed'?.008:.006,pattern==='ribbed'?.014:.023,0,-h/2+.020,-d/2+.043+i*(d-.086)/(count-1),tubMat,group,.003);
   }
   for(const side of [-1,1]){
     box(.008,.018,d-.015,side*(w/2+.006),-.035,0,railMat,group,.002);
     box(.008,.025,d-.02,x+side*(w/2+.003),y-.036,z,ventMat,model,.002);
     // Recessed ventilation marks on the inner side walls.
     for(let i=0;i<3;i++)box(.001,.017,.003,side*(w/2-.0125),.008,-.09+i*.025,ventMat,group,.001);
   }
   group.userData={baseZ:z,travel:.29,open:false,current:0};
   return group;
 }
 const nitrogen=tray(.775,.188,.36,0,1.154,-.005,'molded');
 const defrost=tray(.378,.17,.36,-.198,.925,-.005,'ribbed');
 const fresh=tray(.378,.17,.36,.198,.925,-.005,'molded');
 const compartments=[nitrogen,defrost,fresh];
 compartments.forEach((drawer,i)=>{
   drawer.name=['nitrogen','defrost','fresh'][i];
   label(['AIR CONTROL','AIR REFRESH','FRESH STORAGE'][i],i===0?.12:.105,.019,i===0?.29:.11,.055,.198,drawer,'#becac8',28);
 });
 // Oval molded recess in the nitrogen liner's rear wall.
 for(const [w,h,z,mat] of [[.145,.034,-.167,linerMat],[.141,.030,-.1663,tubMat]]){
   const oval=new THREE.Shape();roundedOutline(oval,w,h,h/2);
   const recess=new THREE.Mesh(new THREE.ShapeGeometry(oval),mat);recess.position.set(0,.012,z);nitrogen.add(recess);
 }
 // Covers and touch console remain attached to the cabinet while the tubs slide.
 box(.79,.012,.375,0,1.257,-.007,brushMat);
 box(.786,.023,.38,0,1.043,-.001,edgeMat);
 const controlCanvas=document.createElement('canvas');controlCanvas.width=1024;controlCanvas.height=160;
 const controlCtx=controlCanvas.getContext('2d');controlCtx.fillStyle='#212a2e';controlCtx.fillRect(0,0,1024,160);
 controlCtx.strokeStyle='#b8dfe6';controlCtx.lineWidth=3;controlCtx.beginPath();controlCtx.moveTo(35,15);controlCtx.lineTo(989,15);controlCtx.stroke();
 controlCtx.textAlign='center';controlCtx.fillStyle='#d9eff1';controlCtx.font='32px Arial';controlCtx.fillText('04°',512,83);
 controlCtx.strokeStyle='#d6ba83';controlCtx.lineWidth=2;controlCtx.beginPath();controlCtx.arc(512,77,40,Math.PI,Math.PI*2);controlCtx.stroke();
 for(const [x,color,glyph,name] of [[268,'#d7adb9','◒','THAW'],[373,'#c4e9ed','▥','FRESH'],[650,'#a6dbeb','❄','COOL'],[755,'#a2ca87','✧','AIR']]){
   controlCtx.fillStyle=color;controlCtx.font='25px Arial';controlCtx.fillText(glyph,x,80);
   controlCtx.fillStyle='#c4d0d1';controlCtx.font='12px Arial';controlCtx.fillText(name,x,111);
 }
 const controlTexture=new THREE.CanvasTexture(controlCanvas);controlTexture.colorSpace=THREE.SRGBColorSpace;
 const consolePanel=new THREE.Mesh(new THREE.PlaneGeometry(.76,.118),new THREE.MeshStandardMaterial({map:controlTexture,emissiveMap:controlTexture,emissive:0xffffff,emissiveIntensity:.35,roughness:.22,metalness:.35}));
 consolePanel.rotation.x=-Math.PI/2;consolePanel.position.set(0,1.055,.123);model.add(consolePanel);
 box(.746,.003,.005,0,1.061,.193,lightMat);
 label('04°    ·    AIR CONTROL',.27,.013,0,1.044,.192,model,'#c7e5ed',23);
 // Door hinges pivot at the physical edges, not at the image centre.
 const left=new THREE.Group(),right=new THREE.Group();left.position.set(-.447,0,.2625);right.position.set(.447,0,.2625);model.add(left,right);
 const doorWidth=.444,doorHeight=1.104,doorY=1.352;
 const doorShells=[],hingeLinks=[];
 // Concealed hinge links bring the door bins clear of the full-width drawer.
 for(const side of [-1,1])for(const y of [.823,1.879]){
   const link=box(.09,.01,.037,side*.447,y,.251,railMat,model,.002);
   link.userData.side=side;hingeLinks.push(link);
 }
 for(const [hinge,sign] of [[left,1],[right,-1]]){
   const x=sign*doorWidth/2;
   doorShells.push(box(doorWidth,doorHeight,.05,x,doorY,0,shellMat,hinge,.006));
   box(doorWidth-.018,doorHeight-.016,.008,x,doorY,-.03,gasketMat,hinge,.004);
   box(doorWidth-.033,doorHeight-.031,.01,x,doorY,-.04,paleSealMat,hinge,.005);
   box(doorWidth-.061,doorHeight-.061,.009,x,doorY,-.047,brushMat,hinge,.006);
   for(const offset of [-.157,.157]){
     box(.006,.925,.002,x+offset,1.343,-.0525,railMat,hinge,.001);
     for(let n=0;n<31;n++)box(.0035,.01,.001,x+offset,.893+n*.029,-.054,ventMat,hinge,.001);
   }
   box(.009,doorHeight-.047,.012,x-sign*(doorWidth/2-.023),doorY,-.048,lightMat,hinge,.003);
   for(const y of [1.58,1.31,1.055]){
     const bin=new THREE.Group();bin.position.set(x,y,-.102);hinge.add(bin);
     box(.354,.009,.11,0,0,0,doorBinMat,bin,.007);
     tubWall(.354,.088,.11,.007,.043,0,doorBinMat,bin,.019);
     tubWall(.356,.003,.112,.004,.088,0,railMat,bin,.019);
   }
   for(const y of [.84,1.86]){
     box(.043,.016,.06,x-sign*.18,y,-.037,railMat,hinge,.003);
     const pin=new THREE.Mesh(new THREE.CylinderGeometry(.007,.007,.028,12),railMat);
     pin.rotation.z=Math.PI/2;pin.position.set(x-sign*.18,y,-.071);hinge.add(pin);
   }
 }
 // Lower freezer: a single exterior front carries the deep lower basket.
 // The separate pale upper tray runs on its own rails, as the real close-ups show.
 const freezerFace=new THREE.Group();model.add(freezerFace);
 box(.889,.744,.05,0,.418,.2625,shellMat,freezerFace,.006);
 box(.832,.706,.014,0,.418,.231,linerMat,freezerFace,.004);
 // One closed-bottom tub, with overlapping wall joints and a continuous rim.
 // All coordinates inside each basket are local to that basket, including rails.
 function freezerTub(w,h,d,y,z,material){
   const tub=new THREE.Group();tub.position.set(0,y,z);model.add(tub);
   const wall=.018;
   box(w,wall,d,0,-h/2+wall/2,0,material,tub,.002);
   box(wall,h,d,-w/2+wall/2,0,0,material,tub,.002);
   box(wall,h,d,w/2-wall/2,0,0,material,tub,.002);
   box(w,h,wall,0,0,-d/2+wall/2,material,tub,.002);
   box(w,h,wall,0,0,d/2-wall/2,material,tub,.002);
   for(const side of [-1,1]){
     box(.023,.009,d,side*(w/2-.01),h/2,0,railMat,tub,.002);
     box(w,.009,.023,0,h/2,side*(d/2-.01),railMat,tub,.002);
   }
   return tub;
 }
 const freezerDrawers=[];
 const upperFreezer=freezerTub(.752,.10,.40,.711,-.015,iceMat);
 upperFreezer.userData.baseZ=-.015;upperFreezer.userData.travel=.28;freezerDrawers.push(upperFreezer);
 const lowerFreezer=freezerTub(.78,.49,.474,.374,-.001,drawerMat);
 lowerFreezer.userData.baseZ=-.001;lowerFreezer.userData.travel=.48;freezerDrawers.push(lowerFreezer);
 // The lower tub meets the backing of the exterior front; there is no open shell around it.
 const middleRails=new THREE.Group();model.add(middleRails);
 for(const side of [-1,1]){
   box(.012,.034,.45,side*.407,.468,-.006,ventMat);
   box(.01,.026,.45,side*.400,.468,-.006,railMat,middleRails,.002);
   box(.008,.020,.45,side*.394,.094,0,railMat,lowerFreezer,.002);
   box(.009,.022,.38,side*.381,-.023,0,railMat,upperFreezer,.002);
   for(const z of [-.16,-.06,.04,.14]){
     const fastener=new THREE.Mesh(new THREE.SphereGeometry(.004,8,6),ventMat);
     fastener.position.set(side*.412,.468,z);model.add(fastener);
   }
 }
 // Ventilated rear wall of the lower basket, visible when it slides out.
 box(.68,.16,.006,0,.125,-.215,ventMat,lowerFreezer,.002);
 const ventGlow=new THREE.MeshBasicMaterial({color:0xa4e0ed,transparent:true,opacity:.45});
 for(let row=0;row<4;row++)for(let col=0;col<8;col++){
   box(.047,.006,.002,-.255+col*.073,.070+row*.036,-.211,ventGlow,lowerFreezer,.001);
 }
 studio.dataset.freezerSkin='shallow upper tray, deep lower basket and telescopic rails';
 box(.835,.036,.014,0,.038,.238,gasketMat);
 for(let i=0;i<53;i++)box(.006,.028,.013,-.393+i*.015,.038,.247,edgeMat,model,0);
 box(.055,.025,.08,-.401,.0125,.22,shellMat);box(.055,.025,.08,.401,.0125,.22,shellMat);
 // Manufacturer's front render is texture-mapped in the original proportions.
 try{
   const image=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=frontImageUrl;});
   function officialFace(rect,w,h,x,y,z,parent){
     const cv=document.createElement('canvas');cv.width=rect[2]*2;cv.height=rect[3]*2;cv.getContext('2d').drawImage(image,...rect,0,0,cv.width,cv.height);
     const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
     const material=new THREE.MeshStandardMaterial({map:tex,metalness:.28,roughness:.47,envMapIntensity:.55});
     const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);mesh.position.set(x,y,z);parent.add(mesh);
   }
   officialFace([452,54,184,462],.437,1.093,.222,doorY,.0257,left);
   officialFace([643,54,182,462],.437,1.093,-.222,doorY,.0257,right);
   officialFace([453,524,372,307],.88,.734,0,.418,.0257+.2625,freezerFace);
 }catch(e){label('FOTILE',.078,.018,.35,1.837,.026,right,'#cbb88f',46);}
 // Physically lit satin metal, without baked reflections on moving drawer fronts.
 label('Air-Circle Pro',.21,.024,0,1.48,-.244,model,'#687579',27);
 studio.dataset.interiorSkin='brushed satin metal, molded liners and independent drawers';
 // Soft contact shadow, no holographic wireframe or stretched image panels.
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.ShadowMaterial({opacity:.07,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.003;floor.receiveShadow=true;scene.add(floor);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=256;shadowCanvas.height=256;const shadowCtx=shadowCanvas.getContext('2d');const shadowGradient=shadowCtx.createRadialGradient(128,128,15,128,128,125);shadowGradient.addColorStop(0,'rgba(0,0,0,.65)');shadowGradient.addColorStop(.4,'rgba(0,0,0,.32)');shadowGradient.addColorStop(1,'rgba(0,0,0,0)');shadowCtx.fillStyle=shadowGradient;shadowCtx.fillRect(0,0,256,256);const contact=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.15),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));contact.rotation.x=-Math.PI/2;contact.position.y=.001;model.add(contact);
 const dimGroup=new THREE.Group();model.add(dimGroup);dimGroup.visible=false;
 const dimMat=new THREE.LineBasicMaterial({color:0xf6536a,transparent:true,opacity:.75,depthTest:false});
 function line(points){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));const l=new THREE.Line(g,dimMat);dimGroup.add(l);}
 line([[-.447,-.08,.32],[.447,-.08,.32]]);line([[.56,0,.29],[.56,1.91,.29]]);line([[-.54,2.01,-.2875],[-.54,2.01,.2875]]);
 for(const x of [-.447,.447])line([[x,-.045,.32],[x,-.115,.32]]);
 for(const y of [0,1.91])line([[.53,y,.29],[.59,y,.29]]);
 for(const z of [-.2875,.2875])line([[-.57,2.01,z],[-.51,2.01,z]]);
 const dimensionAnchors=[[$('.f20-width'),new THREE.Vector3(0,-.12,.32)],[$('.f20-height'),new THREE.Vector3(.62,.98,.29)],[$('.f20-depth'),new THREE.Vector3(-.56,2.08,0)]];
 const featureAnchors=[new THREE.Vector3(.05,1.55,.215),new THREE.Vector3(0,1.155,.21),new THREE.Vector3(-.2,.93,.21),new THREE.Vector3(.2,.93,.21)];
 const descriptions=[['Two adjustable shelves','Reposition the shelves to suit your ingredients. The brochure specifies high-quality sandblasted stainless steel for the compartment back panel and inner doors.'],['Air Control · Nitrogen preservation','The dedicated nitrogen preservation chamber sits beneath the adjustable shelves and above the lower compartments.'],['Air Refresh · Defrost compartment','The lower-left compartment gently brings ingredients to a −3°C micro-frozen state in about four hours, as described in the brochure.'],['Flexible fresh-storage zone','The lower-right storage zone sits alongside the defrost compartment, above the separate lower freezer and its two inner baskets.']];
 let detailView=false,detailFocus=0;
 let angle=-20,open=false,freezer=false,dimensions=false,photoMode=false,renderIndex=0,currentAngle=angle,currentDoor=0,currentFreezer=0,frame=0,last=0;
 const photo=$('#f20-photo'),range=$('#f20-angle');
 const renderViews=[
   {src:'../assets/f20/f20-render-ajar.webp',alt:'FOTILE F20 Luna Grey with its upper doors partly open',label:'STUDIO RENDER · HALF OPEN'},
   {src:'../assets/f20/f20-render-open.webp',alt:'FOTILE F20 Luna Grey with both upper doors fully open',label:'STUDIO RENDER · FULL INTERIOR'},
   {src:'../assets/f20/f20-render-top.webp',alt:'FOTILE F20 overhead view showing the shelves and door racks',label:'STUDIO RENDER · FROM ABOVE'}
 ];
 const inlineDetail=document.createElement('div');inlineDetail.className='f20-inline-detail';inlineDetail.hidden=true;inlineDetail.setAttribute('role','dialog');inlineDetail.setAttribute('aria-label','F20 compartment detail');inlineDetail.innerHTML='<div class="f20-detail-number"></div><div class="f20-detail-body"><span>F20 / DISCOVER INSIDE</span><strong></strong><p></p></div><button type="button" aria-label="Close feature detail">×</button>';document.body.appendChild(inlineDetail);
 inlineDetail.querySelector('button').addEventListener('click',()=>{inlineDetail.hidden=true;});
 document.addEventListener('keydown',event=>{if(event.key==='Escape')inlineDetail.hidden=true;});
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)inlineDetail.hidden=true;},{threshold:.1}).observe(viewport);
 function announceFeature(i){document.querySelector('#px-feature-index').textContent=`0${i+1} / BROCHURE COMPARTMENT LAYOUT`;document.querySelector('#px-feature-title').textContent=descriptions[i][0];document.querySelector('#px-feature-copy').textContent=descriptions[i][1];document.querySelectorAll('.px-tour-progress i').forEach((el,n)=>el.classList.toggle('active',n===i));$('#f20-hotspots').querySelectorAll('button').forEach((el,n)=>el.setAttribute('aria-pressed',String(n===i)));inlineDetail.querySelector('.f20-detail-number').textContent=`0${i+1}`;inlineDetail.querySelector('strong').textContent=descriptions[i][0];inlineDetail.querySelector('p').textContent=descriptions[i][1];inlineDetail.hidden=false;}
 $('#f20-hotspots').querySelectorAll('button').forEach((button,i)=>button.addEventListener('click',()=>announceFeature(i)));
 function setAngle(value){angle=Math.max(-65,Math.min(65,Number(value)));range.value=angle;$('#f20-angle-output').textContent=`${Math.round(angle)}°`;studio.querySelectorAll('[data-model-angle]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.modelAngle)===angle)));requestRender();}
 function leavePhotos(){if(photoMode)$('#f20-photo-toggle').click();}
 range.addEventListener('input',()=>{leavePhotos();setAngle(range.value);});studio.querySelectorAll('[data-model-angle]').forEach(b=>b.addEventListener('click',()=>{leavePhotos();setAngle(b.dataset.modelAngle);}));
 function updatePhoto(){if(photoMode){const view=renderViews[renderIndex];photo.src=view.src;photo.alt=view.alt;$('#f20-state-label').textContent=view.label;studio.querySelectorAll('[data-render-view]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===renderIndex)));}else{photo.src=open?'./reference/manual-open.webp':'./reference/manual-front.webp';photo.alt=open?'Official open F20 kitchen photograph extracted from page 4 of the supplied brochure':'Official F20 front view extracted from page 6 of the supplied brochure';$('#f20-state-label').textContent=freezer?'LOWER FREEZER · TWO INNER DRAWERS':open?'113° OPENING · SIX DOOR RACKS':'FRENCH 3-DOOR · 508 L';}}
 studio.querySelectorAll('[data-render-view]').forEach(button=>button.addEventListener('click',()=>{if(!photoMode)$('#f20-photo-toggle').click();renderIndex=Number(button.dataset.renderView);updatePhoto();}));
 function syncDrawers(){
   studio.querySelectorAll('[data-drawer]').forEach((button,i)=>{
     const expanded=compartments[i].userData.open;
     button.setAttribute('aria-expanded',String(expanded));button.setAttribute('aria-pressed',String(expanded));
     button.querySelector('span').textContent=expanded?'−':'+';
   });
 }
 function toggleDrawer(i){
   leavePhotos();const drawer=compartments[i];drawer.userData.open=!drawer.userData.open;
   if(drawer.userData.open)setOpen(true);
   syncDrawers();requestRender();
 }
 studio.querySelectorAll('[data-drawer]').forEach((button,i)=>button.addEventListener('click',()=>toggleDrawer(i)));
 function setOpen(value){open=value;if(!open){detailView=false;$('#f20-detail-view').setAttribute('aria-pressed','false');inlineDetail.hidden=true;compartments.forEach(d=>d.userData.open=false);syncDrawers();}if(photoMode)renderIndex=open?1:0;$('#f20-open').innerHTML=`${open?'Close doors':'Open doors'} <span>${open?'↙':'↗'}</span>`;$('#f20-open').setAttribute('aria-expanded',String(open));$('#f20-state-label').textContent=open?'113° OPENING · SIX DOOR RACKS':'FRENCH 3-DOOR · 508 L';if(open&&dimensions){dimensions=false;studio.classList.remove('dimensions-on');$('#f20-dim-toggle').setAttribute('aria-pressed','false');dimGroup.visible=false;}updatePhoto();requestRender();}
 $('#f20-open').addEventListener('click',()=>{leavePhotos();setOpen(!open);});
 $('#f20-detail-view').addEventListener('click',()=>{
   leavePhotos();detailView=!detailView;$('#f20-detail-view').setAttribute('aria-pressed',String(detailView));
   if(detailView){setOpen(true);setAngle(-15);}
   requestRender();
 });
 $('#f20-freezer').addEventListener('click',()=>{leavePhotos();freezer=!freezer;$('#f20-freezer').innerHTML=`Freezer <span>${freezer?'−':'+'}</span>`;$('#f20-freezer').setAttribute('aria-expanded',String(freezer));$('#f20-state-label').textContent=freezer?'LOWER FREEZER · TWO INNER DRAWERS':open?'113° OPENING · SIX DOOR RACKS':'FRENCH 3-DOOR · 508 L';requestRender();});
 $('#f20-dim-toggle').addEventListener('click',()=>{dimensions=!dimensions;studio.classList.toggle('dimensions-on',dimensions);$('#f20-dim-toggle').setAttribute('aria-pressed',String(dimensions));dimGroup.visible=dimensions;if(dimensions){setOpen(false);freezer=false;$('#f20-freezer').innerHTML='Freezer <span>+</span>';$('#f20-freezer').setAttribute('aria-expanded','false');setAngle(-28);if(photoMode)$('#f20-photo-toggle').click();}requestRender();});
 $('#f20-photo-toggle').addEventListener('click',()=>{photoMode=!photoMode;if(photoMode){inlineDetail.hidden=true;renderIndex=open?1:0;}studio.classList.toggle('photo-mode',photoMode);$('#f20-photo-toggle').setAttribute('aria-pressed',String(photoMode));updatePhoto();requestRender();});
 let drag=null,suppressClick=false;
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,angle,id:e.pointerId,moved:false};});
 window.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.abs(dy)>Math.abs(dx)+8){drag=null;return;}if(Math.abs(dx)>5)drag.moved=true;if(drag.moved)setAngle(drag.angle+dx*.28);},{passive:true});
 window.addEventListener('pointerup',()=>{suppressClick=Boolean(drag?.moved);drag=null;setTimeout(()=>{suppressClick=false;},0);});window.addEventListener('pointercancel',()=>{drag=null;});
 const raycaster=new THREE.Raycaster();
 renderer.domElement.addEventListener('click',e=>{
   if(suppressClick||photoMode)return;
   const bounds=renderer.domElement.getBoundingClientRect();
   raycaster.setFromCamera(new THREE.Vector2((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1),camera);
   const hit=raycaster.intersectObject(model,true)[0];
   let part=hit?.object;
   while(part&&part!==model){
     const index=compartments.indexOf(part);
     if(index>=0&&currentDoor>1.9){toggleDrawer(index);return;}
     part=part.parent;
   }
   setOpen(!open);
 });
 renderer.domElement.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(!open);}});
 photo.addEventListener('click',()=>{if(photoMode)setOpen(!open);});
 function project(point){const v=point.clone();model.localToWorld(v);v.project(camera);return{x:(v.x*.5+.5)*viewport.clientWidth,y:(-.5*v.y+.5)*viewport.clientHeight};}
 function updateOverlays(){dimensionAnchors.forEach(([el,point])=>{const p=project(point);el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;});const show=open&&currentDoor>1.1&&!photoMode;$('#f20-hotspots').hidden=!show;if(show)$('#f20-hotspots').querySelectorAll('button').forEach((el,i)=>{const anchor=featureAnchors[i].clone();if(i>0)anchor.z+=compartments[i-1].userData.current;
     const world=model.localToWorld(anchor.clone());const distance=camera.position.distanceTo(world);
     raycaster.set(camera.position,world.clone().sub(camera.position).normalize());
     const occluders=[left,right,...compartments.filter((d,n)=>n!==i-1)];
     const blocker=raycaster.intersectObjects(occluders,true)[0];el.hidden=Boolean(blocker&&blocker.distance<distance-.018);
     const p=project(anchor);el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;});}
 function render(time=performance.now()){
   frame=0;if(document.hidden)return;
   const dt=last?Math.min((time-last)/1000,.06):.016;last=time;
   const ease=reduced.matches?1:1-Math.exp(-dt*7);
   currentAngle+=(angle-currentAngle)*ease;detailFocus+=((detailView?1:0)-detailFocus)*ease;
   // Doors remain fully open until every inner drawer has returned to its recess.
   const drawersOut=compartments.some(d=>d.userData.current>.001);
   const doorTarget=(open||drawersOut)?THREE.MathUtils.degToRad(SIZE.doorMax):0;
   currentDoor+=(doorTarget-currentDoor)*ease;
   currentFreezer+=((freezer?.48:0)-currentFreezer)*ease;
   compartments.forEach(drawer=>{
     const data=drawer.userData;
     const target=data.open&&open&&currentDoor>1.94?data.travel:0;
     data.current+=(target-data.current)*ease;
     if(Math.abs(target-data.current)<.0005)data.current=target;
     drawer.position.z=data.baseZ+data.current;
   });
   model.rotation.y=THREE.MathUtils.degToRad(currentAngle);left.rotation.y=-currentDoor;right.rotation.y=currentDoor;
   const hingeExtension=.09*currentDoor/THREE.MathUtils.degToRad(SIZE.doorMax);
   left.position.x=-.447-hingeExtension;right.position.x=.447+hingeExtension;
   hingeLinks.forEach(link=>{link.scale.x=Math.max(.001,hingeExtension/.09);link.position.x=link.userData.side*(.447+hingeExtension/2);});
   freezerFace.position.z=currentFreezer;middleRails.position.z=currentFreezer*.5;freezerDrawers.forEach(d=>d.position.z=d.userData.baseZ+currentFreezer*(d.userData.travel/.48));
   interiorLight.intensity=.15+Math.min(1,currentDoor)*.68;
   sideFillLeft.intensity=sideFillRight.intensity=.05+Math.min(1,currentDoor)*.12;
   const freezerFocus=currentFreezer/.48,drawerFocus=Math.max(...compartments.map(d=>d.userData.current/d.userData.travel)),aspect=viewport.clientWidth/viewport.clientHeight;
   camera.position.set(0,1.65+Math.max(freezerFocus*(aspect<.9?2.25:1.85),drawerFocus*1.05),(aspect<.9?6:5.1)-freezerFocus*(aspect<.9?.6:1.1));
   const targetY=.98-freezerFocus*.15+drawerFocus*(1-freezerFocus)*.07;
   const detailAmount=detailFocus*(1-freezerFocus);
   camera.position.lerp(new THREE.Vector3(0,2.65,aspect<.9?5.25:3.12),detailAmount);
   camera.lookAt(0,THREE.MathUtils.lerp(targetY,1.34,detailAmount),THREE.MathUtils.lerp(0,.1,detailAmount));
   renderer.render(scene,camera);updateOverlays();
   if(Math.abs((detailView?1:0)-detailFocus)>.001||compartments.some(d=>Math.abs((d.userData.open?d.userData.travel:0)-d.userData.current)>.0005)||Math.abs(angle-currentAngle)>.02||Math.abs((open?THREE.MathUtils.degToRad(113):0)-currentDoor)>.001||Math.abs((freezer?.48:0)-currentFreezer)>.001)requestRender();
 }
 function requestRender(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
 function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const aspect=w/h;camera.position.set(0,1.65,aspect<.9?6:5.1);camera.lookAt(0,.98,0);camera.updateProjectionMatrix();requestRender();}
 new ResizeObserver(resize).observe(viewport);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=0;requestRender();}});reduced.addEventListener('change',requestRender);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();studio.classList.remove('model-ready');});renderer.domElement.addEventListener('webglcontextrestored',()=>{studio.classList.add('model-ready');requestRender();});
 studio.classList.add('model-ready');studio.dataset.modelDimensions='894×1910×575';studio.dataset.doorMax='113';
 // Exposed read-only facts make geometry checks independent of pixel screenshots.
 Object.defineProperty(studio,'modelFacts',{value:Object.freeze({...SIZE,shelves:2,bottleRacks:6,freezerDrawers:2,interiorDrawers:3})});
 Object.defineProperty(studio,'modelState',{get:()=>({doorAngle:THREE.MathUtils.radToDeg(currentDoor),hingeExtension:Math.abs(left.position.x)-.447,freezerTravel:currentFreezer,drawers:compartments.map(d=>({name:d.name,open:d.userData.open,travel:d.userData.current}))})});
 syncDrawers();
 setAngle(-20);resize();requestRender();
}
