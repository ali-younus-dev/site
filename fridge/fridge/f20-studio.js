/* F20 solid model. Units: metres. Overall geometry follows brochure p6 installation
 * drawing: W .894, H 1.910, D .575. The conflicting .984 specification is disclosed
 * on the page. Interior geometry is schematic, based on the p4 layout. */
import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';
import frontImageUrl from './reference/manual-front.webp';
import interiorImageUrl from '../assets/f20/f20-render-open.webp';

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
 renderer.toneMappingExposure=.93;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 mount.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','F20 solid model with 894 millimetre width, 1910 millimetre height and 575 millimetre depth');
 renderer.domElement.setAttribute('role','button');
 renderer.domElement.setAttribute('tabindex','0');
 const environment=new RoomEnvironment();
 const pmrem=new THREE.PMREMGenerator(renderer);
 const env=pmrem.fromScene(environment,.04);
 scene.environment=env.texture;scene.environmentIntensity=.72;environment.dispose();pmrem.dispose();
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
 const brushCanvas=document.createElement('canvas');brushCanvas.width=256;brushCanvas.height=512;
 const brushContext=brushCanvas.getContext('2d');brushContext.fillStyle='#b8bdc0';brushContext.fillRect(0,0,256,512);
 // Long, low-contrast vertical strokes reproduce the satin metal of the supplied door render.
 for(let x=0;x<256;x++){
   const tone=Math.round(187+1.5*Math.sin(x*.31)+Math.sin(x*2.13));
   brushContext.fillStyle=`rgb(${tone},${tone+3},${tone+5})`;
   brushContext.fillRect(x,0,1,512);
 }
 const brushTexture=new THREE.CanvasTexture(brushCanvas);brushTexture.colorSpace=THREE.SRGBColorSpace;
 const brushMat=new THREE.MeshStandardMaterial({map:brushTexture,color:0xf2f4f5,metalness:.72,roughness:.32,envMapIntensity:1.2});
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
 function tray(w,h,d,x,y,z,parent,material=drawerMat){
   const group=new THREE.Group();group.position.set(x,y,z);parent.add(group);
   box(w,.012,d,0,-h/2,0,material,group);
   box(.012,h,d,-w/2+.006,0,0,material,group);box(.012,h,d,w/2-.006,0,0,material,group);
   box(w,h,.014,0,0,-d/2,material,group);box(w,h,.017,0,0,d/2,material,group);
   return group;
 }
 const nitrogen=tray(.775,.188,.36,0,1.154,-.005,model);label('Air Control',.22,.036,0,0,.191,nitrogen,'#e6e8e7',35);
 const defrost=tray(.378,.17,.36,-.198,.925,-.005,model);label('Air Refresh',.17,.028,0,.015,.192,defrost,'#d6dedf',33);
 const fresh=tray(.378,.17,.36,.198,.925,-.005,model);label('Fresh Storage',.19,.028,0,.015,.192,fresh,'#d6dedf',30);
 box(.786,.027,.037,0,1.043,.187,edgeMat);
 label('03°    ◌    AIR CONTROL     •     05°',.52,.022,0,1.043,.208,model,'#c7e5ed',22);
 // Door hinges pivot at the physical edges, not at the image centre.
 const left=new THREE.Group(),right=new THREE.Group();left.position.set(-.447,0,.2625);right.position.set(.447,0,.2625);model.add(left,right);
 const doorWidth=.444,doorHeight=1.104,doorY=1.352;
 const doorShells=[];
 for(const [hinge,sign] of [[left,1],[right,-1]]){
   const x=sign*doorWidth/2;
   doorShells.push(box(doorWidth,doorHeight,.05,x,doorY,0,shellMat,hinge,.006));
   box(doorWidth-.018,doorHeight-.016,.008,x,doorY,-.03,gasketMat,hinge,.004);
   box(doorWidth-.038,doorHeight-.035,.01,x,doorY,-.04,brushMat,hinge,.005);
   box(.009,doorHeight-.047,.012,x-sign*(doorWidth/2-.023),doorY,-.048,lightMat,hinge,.003);
   for(const y of [1.58,1.31,1.055]){
     box(.344,.012,.095,x,y,-.091,doorBinMat,hinge);
     box(.344,.087,.012,x,y+.038,-.136,doorBinMat,hinge);
     box(.012,.087,.095,x-.168,y+.038,-.091,doorBinMat,hinge);
     box(.012,.087,.095,x+.168,y+.038,-.091,doorBinMat,hinge);
     box(.332,.006,.009,x,y+.084,-.138,railMat,hinge,.002);
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
 // Photo-derived interior skins from the newly supplied clean F20 render.
 // The upper crop stays behind the modeled glass shelves; drawer face crops
 // align with the actual three visible compartments.
 try{
   const inside=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=interiorImageUrl;});
   function skin(sourceRect,width,height,x,y,z,parent){
     const [sx,sy,sw,sh]=sourceRect;
     const canvas=document.createElement('canvas');canvas.width=sw*2;canvas.height=sh*2;
     canvas.getContext('2d').drawImage(inside,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
     const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
     const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide,toneMapped:false}));
     panel.position.set(x,y,z);parent.add(panel);return panel;
   }
   skin([310,256,525,362],.742,.56,0,1.58,-.242,model);
   skin([274,626,597,155],.752,.171,0,0,.190,nitrogen);
   skin([280,794,283,153],.365,.154,0,0,.190,defrost);
   skin([568,794,280,153],.365,.154,0,0,.190,fresh);
   studio.dataset.interiorSkin='new F20 open-door render';
 }catch(e){studio.dataset.interiorSkin='fallback metal panels';}
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
 function setOpen(value){open=value;if(!open)inlineDetail.hidden=true;if(photoMode)renderIndex=open?1:0;$('#f20-open').innerHTML=`${open?'Close doors':'Open doors'} <span>${open?'↙':'↗'}</span>`;$('#f20-open').setAttribute('aria-expanded',String(open));$('#f20-state-label').textContent=open?'113° OPENING · SIX DOOR RACKS':'FRENCH 3-DOOR · 508 L';if(open&&dimensions){dimensions=false;studio.classList.remove('dimensions-on');$('#f20-dim-toggle').setAttribute('aria-pressed','false');dimGroup.visible=false;}updatePhoto();requestRender();}
 $('#f20-open').addEventListener('click',()=>{leavePhotos();setOpen(!open);});
 $('#f20-freezer').addEventListener('click',()=>{leavePhotos();freezer=!freezer;$('#f20-freezer').innerHTML=`Freezer <span>${freezer?'−':'+'}</span>`;$('#f20-freezer').setAttribute('aria-expanded',String(freezer));$('#f20-state-label').textContent=freezer?'LOWER FREEZER · TWO INNER DRAWERS':open?'113° OPENING · SIX DOOR RACKS':'FRENCH 3-DOOR · 508 L';requestRender();});
 $('#f20-dim-toggle').addEventListener('click',()=>{dimensions=!dimensions;studio.classList.toggle('dimensions-on',dimensions);$('#f20-dim-toggle').setAttribute('aria-pressed',String(dimensions));dimGroup.visible=dimensions;if(dimensions){setOpen(false);freezer=false;$('#f20-freezer').innerHTML='Freezer <span>+</span>';$('#f20-freezer').setAttribute('aria-expanded','false');setAngle(-28);if(photoMode)$('#f20-photo-toggle').click();}requestRender();});
 $('#f20-photo-toggle').addEventListener('click',()=>{photoMode=!photoMode;if(photoMode){inlineDetail.hidden=true;renderIndex=open?1:0;}studio.classList.toggle('photo-mode',photoMode);$('#f20-photo-toggle').setAttribute('aria-pressed',String(photoMode));updatePhoto();requestRender();});
 let drag=null,suppressClick=false;
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,angle,id:e.pointerId,moved:false};});
 window.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.abs(dy)>Math.abs(dx)+8){drag=null;return;}if(Math.abs(dx)>5)drag.moved=true;if(drag.moved)setAngle(drag.angle+dx*.28);},{passive:true});
 window.addEventListener('pointerup',()=>{suppressClick=Boolean(drag?.moved);drag=null;setTimeout(()=>{suppressClick=false;},0);});window.addEventListener('pointercancel',()=>{drag=null;});
 renderer.domElement.addEventListener('click',()=>{if(!suppressClick&&!photoMode)setOpen(!open);});
 renderer.domElement.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setOpen(!open);}});
 photo.addEventListener('click',()=>{if(photoMode)setOpen(!open);});
 function project(point){const v=point.clone();model.localToWorld(v);v.project(camera);return{x:(v.x*.5+.5)*viewport.clientWidth,y:(-.5*v.y+.5)*viewport.clientHeight};}
 function updateOverlays(){dimensionAnchors.forEach(([el,point])=>{const p=project(point);el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;});const show=open&&currentDoor>1.1&&!photoMode;$('#f20-hotspots').hidden=!show;if(show)$('#f20-hotspots').querySelectorAll('button').forEach((el,i)=>{const p=project(featureAnchors[i]);el.style.left=`${p.x}px`;el.style.top=`${p.y}px`;});}
 function render(time=performance.now()){
   frame=0;if(document.hidden)return;
   const dt=last?Math.min((time-last)/1000,.06):.016;last=time;
   const ease=reduced.matches?1:1-Math.exp(-dt*7);
   currentAngle+=(angle-currentAngle)*ease;currentDoor+=((open?THREE.MathUtils.degToRad(113):0)-currentDoor)*ease;currentFreezer+=((freezer?.48:0)-currentFreezer)*ease;
   model.rotation.y=THREE.MathUtils.degToRad(currentAngle);left.rotation.y=-currentDoor;right.rotation.y=currentDoor;freezerFace.position.z=currentFreezer;middleRails.position.z=currentFreezer*.5;freezerDrawers.forEach(d=>d.position.z=d.userData.baseZ+currentFreezer*(d.userData.travel/.48));
   interiorLight.intensity=.15+Math.min(1,currentDoor)*.68;
   sideFillLeft.intensity=sideFillRight.intensity=.05+Math.min(1,currentDoor)*.12;
   const freezerFocus=currentFreezer/.48,aspect=viewport.clientWidth/viewport.clientHeight;
   camera.position.set(0,1.65+freezerFocus*(aspect<.9?2.25:1.85),(aspect<.9?6:5.1)-freezerFocus*(aspect<.9?.6:1.1));
   camera.lookAt(0,.98-freezerFocus*.15,0);
   renderer.render(scene,camera);updateOverlays();
   if(Math.abs(angle-currentAngle)>.02||Math.abs((open?THREE.MathUtils.degToRad(113):0)-currentDoor)>.001||Math.abs((freezer?.48:0)-currentFreezer)>.001)requestRender();
 }
 function requestRender(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
 function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;const aspect=w/h;camera.position.set(0,1.65,aspect<.9?6:5.1);camera.lookAt(0,.98,0);camera.updateProjectionMatrix();requestRender();}
 new ResizeObserver(resize).observe(viewport);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=0;requestRender();}});reduced.addEventListener('change',requestRender);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();studio.classList.remove('model-ready');});renderer.domElement.addEventListener('webglcontextrestored',()=>{studio.classList.add('model-ready');requestRender();});
 studio.classList.add('model-ready');studio.dataset.modelDimensions='894×1910×575';studio.dataset.doorMax='113';
 // Exposed read-only facts make geometry checks independent of pixel screenshots.
 Object.defineProperty(studio,'modelFacts',{value:Object.freeze({...SIZE,shelves:2,bottleRacks:6,freezerDrawers:2})});
 setAngle(-20);resize();requestRender();
}
