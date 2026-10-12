import * as THREE from '../fridge/vendor/three.module.js';
import {createKitchen} from './dishwasher-kitchen.js';
import {RoomEnvironment} from '../fridge/vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from '../fridge/vendor/RoundedBoxGeometry.js';

const root=document.querySelector('#dw-explorer'),viewport=document.querySelector('#dw-viewport');
const $=s=>root.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const programs={Quick:'For a lighter load when you want your kitchen ready for what comes next.',Normal:'An everyday setting for the plates, cups, and cutlery that gather around your table.',Heavy:'For cookware and dishes that need a more intensive wash.',Glass:'A dedicated programme for your glassware.',Auto:'Let the automatic programme take care of the wash selection.',ECO:'An economy programme for your regular dishwashing routine.','Self-Clean':'Care for the dishwasher itself with a dedicated cleaning programme.',Silence:'A quieter programme option for the moments when you want less interruption.'};
document.querySelectorAll('[data-dw-program]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-dw-program]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelector('#dw-program-name').textContent=b.dataset.dwProgram;document.querySelector('#dw-program-copy').textContent=programs[b.dataset.dwProgram];root.dispatchEvent(new CustomEvent('programchange',{detail:b.dataset.dwProgram}));}));
let initialized=false;
const startObserver=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)&&!initialized){initialized=true;startObserver.disconnect();initialize();}},{rootMargin:'500px'});startObserver.observe(root);
function fallback(message){$('#dw-loading').hidden=true;root.classList.remove('dw-ready');root.querySelectorAll('button,input').forEach(b=>b.disabled=true);$('#dw-model-note').textContent=message;}
function initialize(){
 let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'low-power'});}catch(e){fallback('3D is unavailable in this browser. The product view and specifications are still available.');return;}
 const scene=new THREE.Scene();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.97;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 $('#dw-mount').appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive BD3BFG3-Y dishwasher. Drag to rotate, tap the door or a rack to open it.');renderer.domElement.setAttribute('role','button');renderer.domElement.tabIndex=0;
 const camera=new THREE.PerspectiveCamera(33,1,.01,20),pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.035);scene.environment=environment.texture;scene.environmentIntensity=.8;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xe6efff,0x302b2a,.55));
 const key=new THREE.DirectionalLight(0xfff6e8,1.4);key.position.set(-2,3,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1.5,right:1.5,top:1.6,bottom:-1,near:.1,far:8});key.shadow.normalBias=.003;scene.add(key);
 const fill=new THREE.DirectionalLight(0xc6e5ff,.8);fill.position.set(2,1.5,2);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xd8b46a,.6);rim.position.set(1,2,-2);scene.add(rim);
 const model=new THREE.Group();scene.add(model);const kitchen=createKitchen(renderer);scene.add(kitchen.group);let setting='studio';
 function material(color,metalness,roughness,extra={}){return new THREE.MeshStandardMaterial({color,metalness,roughness,...extra});}
 const steel=material(0x78878e,.92,.19,{envMapIntensity:1.4}),trim=material(0xc5ccce,.92,.2),shell=material(0xa3adb1,.68,.31),front=new THREE.MeshPhysicalMaterial({color:0x101516,metalness:.25,roughness:.24,clearcoat:.78,clearcoatRoughness:.20}),wireMat=material(0x384249,.35,.43),polymer=material(0x505a60,.25,.4),dark=material(0x161b20,.2,.6),gold=material(0xf0a014,.18,.36),gasket=material(0x101419,.05,.82),black=material(0x0e151c,.15,.26);
 const lightMat=new THREE.MeshBasicMaterial({color:0xd2f4ff});
 const grain=document.createElement('canvas');grain.width=512;grain.height=512;const gc=grain.getContext('2d');let seed=143;
 for(let y=0;y<512;y++){seed=(seed*1664525+1013904223)>>>0;const c=195+seed%5;gc.fillStyle=`rgb(${c},${c+1},${c+2})`;gc.fillRect(0,y,512,1);}
 const metalTexture=new THREE.CanvasTexture(grain);metalTexture.colorSpace=THREE.SRGBColorSpace;metalTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());steel.map=metalTexture;trim.map=metalTexture;
 const batches=new Map();
 function batch(geo,mat,parent){let entry=batches.get(parent);if(!entry){entry=new Map();batches.set(parent,entry);}if(!entry.has(mat))entry.set(mat,[]);entry.get(mat).push(geo);}
 function box(w,h,d,x,y,z,mat=steel,parent=model,r=.003){const mesh=new THREE.Mesh(r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function rod(a,b,r,mat=wireMat,parent=model){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const geometry=new THREE.CylinderGeometry(r,r,delta.length(),7,1);const matrix=new THREE.Matrix4().compose(av.add(bv).multiplyScalar(.5),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()),new THREE.Vector3(1,1,1));geometry.applyMatrix4(matrix);batch(geometry,mat,parent);}
 function wire(points,r=.002,mat=wireMat,parent=model){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.12);batch(new THREE.TubeGeometry(curve,Math.max(12,points.length*5),r,6,false),mat,parent);}
 function cylinder(radius,height,x,y,z,mat,parent=model,axis='y',segments=24){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),mat);mesh.position.set(x,y,z);if(axis==='x')mesh.rotation.z=Math.PI/2;if(axis==='z')mesh.rotation.x=Math.PI/2;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function textPlane(text,w,h,x,y,z,parent,colour='#d5c6a5',size=64){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=colour;ctx.font='500 100px Arial';const fit=Math.min(100,100*470/ctx.measureText(text).width);ctx.font=`500 ${fit}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function ring(w,h,t,x,y,z,parent,mat=trim){box(w,t,.006,x,y+h/2,z,mat,parent);box(w,t,.006,x,y-h/2,z,mat,parent);box(t,h,.006,x-w/2,y,z,mat,parent);box(t,h,.006,x+w/2,y,z,mat,parent);}
 // Cabinet: 598 W × 775 H × 570 D. Front faces +Z. Door pivots at its bottom edge.
 for(const side of [-1,1]){
  const profile=new THREE.Shape();profile.moveTo(.2835,.029);profile.lineTo(-.167,.029);profile.lineTo(-.2455,.103);profile.lineTo(-.2455,.775);profile.lineTo(.2835,.775);profile.closePath();
  const sheetGeo=new THREE.ExtrudeGeometry(profile,{depth:.015,bevelEnabled:false});sheetGeo.rotateY(Math.PI/2);const sheet=new THREE.Mesh(sheetGeo,shell);sheet.position.x=side<0?-.299:.284;sheet.castShadow=true;sheet.receiveShadow=true;model.add(sheet);
  rod([side*.295,.767,-.275],[side*.295,.767,.243],.0012,trim);
  box(.002,.071,.003,side*.299,.357,.193,dark,model,.0005);
 }
 box(.584,.014,.538,0,.768,-.016,shell);box(.565,.705,.016,0,.416,-.277,shell);box(.558,.054,.509,0,.062,-.02,dark);
 box(.014,.669,.492,-.273,.420,-.021,steel);box(.014,.669,.492,.273,.420,-.021,steel);box(.536,.656,.012,0,.420,-.258,steel);box(.536,.012,.49,0,.739,-.02,steel);box(.536,.018,.492,0,.096,-.02,steel);
 // Continuous rounded rubber seal, with a second fine lip.
 for(const inset of [0,.008])wire([[-.284+inset,.105+inset,.248],[-.284+inset,.716-inset,.248],[-.270+inset,.751-inset,.248],[.270-inset,.751-inset,.248],[.284-inset,.716-inset,.248],[.284-inset,.108+inset,.248],[.267-inset,.087+inset,.248],[-.267+inset,.087+inset,.248],[-.284+inset,.105+inset,.248]],inset?.003:.007,gasket);
 ring(.588,.690,.008,0,.420,.251,model,trim);
 // Pressed stainless recesses and the rear water-feed spine.
 for(const x of [-.146,.146]){box(.18,.30,.003,x,.32,-.249,steel,model,.009);ring(.173,.289,.003,x,.32,-.246,model,trim);ring(.123,.215,.002,x,.33,-.242,model,steel);}
 box(.045,.55,.027,0,.403,-.228,polymer);box(.082,.038,.02,0,.407,-.207,polymer);
 for(const side of [-1,1])for(const y of [.226,.417,.63]){box(.003,.047,.358,side*.264,y,-.02,steel);rod([side*.263,y-.025,-.195],[side*.263,y-.025,.177],.002,trim);}
 for(const side of [-1,1]){cylinder(.019,.033,side*.255,.018,.19,dark);cylinder(.016,.028,side*.255,.018,-.23,dark);}
 // Exposed molded plinth and corner hinge carriers, as seen without cabinetry.
 box(.540,.066,.038,0,.044,.218,dark,model,.002);
 box(.512,.006,.006,0,.015,.240,polymer);
 for(const x of [-.217,-.135,-.048,.048,.135,.217]){
  box(.058,.035,.003,x,.044,.239,dark,model,.002);
  rod([x-.027,.030,.242],[x-.027,.060,.242],.0013,polymer);
  rod([x-.027,.060,.242],[x+.027,.060,.242],.0013,polymer);
 }
 for(const x of [-.155,.155])box(.018,.005,.003,x,.022,.242,black,model,0);
 cylinder(.007,.004,0,.041,.244,trim,model,'z',16);
 cylinder(.002,.005,0,.041,.247,dark,model,'z',8);
 for(const side of [-1,1]){
  box(.034,.069,.040,side*.269,.043,.229,polymer,model,.002);
  box(.019,.045,.006,side*.269,.050,.252,dark,model,.001);
  for(const y of [.034,.064]){cylinder(.004,.003,side*.269,y,.257,trim,model,'z',12);rod([side*.269-.002,y,.259],[side*.269+.002,y,.259],.0006,dark);}
  for(let i=0;i<5;i++)box(.002,.012,.004,side*.269-.010+i*.005,.013,.252,dark,model,0);
  box(.008,.054,.048,side*.276,.090,.226,dark);
 }
 // Top latch, frame fasteners and folded panel seams.
 box(.029,.005,.018,0,.761,.253,trim);box(.012,.004,.013,0,.765,.259,dark);
 for(const side of [-1,1])for(const y of [.155,.387,.673]){cylinder(.0035,.002,side*.284,y,.257,trim,model,'z',12);rod([side*.284-.0018,y,.259],[side*.284+.0018,y,.259],.0005,dark);}
 for(const x of [-.26,.26])for(const z of [-.24,.20])cylinder(.0024,.001,x,.776,z,dark,model,'y',10);
 
 cylinder(.013,.009,.186,.729,.095,lightMat,model,'y');const lamp=new THREE.PointLight(0xc9eaff,.055,1.3,2);lamp.position.set(.16,.692,.13);model.add(lamp);
 // Bottom-hinged door: stainless inner well and sealed matte glass front.
 const door=new THREE.Group();door.name='Door';door.position.set(0,.073,.269);model.add(door);
 box(.588,.685,.032,0,.3425,0,front,door,.005);box(.565,.66,.004,0,.343,-.019,trim,door);
 box(.512,.590,.005,0,.343,-.023,steel,door,.006);
 for(const side of [-1,1]){box(.024,.629,.024,side*.268,.343,-.028,steel,door,.005);box(.532,.019,.023,0,.343+side*.307,-.029,steel,door,.004);}
 for(const x of [-.265,.265])for(const y of [.06,.34,.624]){cylinder(.0032,.001,x,y,-.042,trim,door,'z',12);rod([x-.0015,y,-.043],[x+.0015,y,-.043],.0005,dark,door);}
 textPlane('FOTILE',.065,.014,0,.085,.017,door,'#cfa359',62);
 // Touchscreen is drawn cleanly from the reference layout, without showroom reflections or stickers.
 const screenCanvas=document.createElement('canvas');screenCanvas.width=1400;screenCanvas.height=260;const screenCtx=screenCanvas.getContext('2d');const screenTex=new THREE.CanvasTexture(screenCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;
 function paintScreen(program='Quick'){const c=screenCtx;c.fillStyle='#07121d';c.fillRect(0,0,1400,260);for(const [x,caption] of [[115,'Storage'],[280,'Sterilize'],[440,'Extra Rinse'],[1000,'Extra Dry'],[1170,'Half Load']]){const g=c.createRadialGradient(x,118,5,x,118,115);g.addColorStop(0,'#17396a');g.addColorStop(1,'#07121d');c.fillStyle=g;c.fillRect(x-78,10,156,235);c.strokeStyle='#92c9fb';c.lineWidth=3;c.strokeRect(x-14,65,28,32);c.beginPath();c.moveTo(x-7,79);c.lineTo(x+7,79);c.stroke();c.fillStyle='#c3ddfa';c.font='22px Arial';c.textAlign='center';c.fillText(caption,x,160);}c.strokeStyle='#c2e2ff';c.lineWidth=3;c.beginPath();c.arc(718,123,87,Math.PI,Math.PI*2);c.stroke();c.fillStyle='#c2e2ff';c.font='54px monospace';c.fillText('1:30',718,128);c.font='19px Arial';c.fillText(program.toUpperCase(),718,177);c.font='25px Arial';c.fillText('◉',718,222);c.font='16px Arial';for(const [label,y] of [['Quick',53],['Heavy',84],['ECO',115]])c.fillText(label,575,y);for(const [label,y] of [['Glass',53],['Auto',84],['Silence',115]])c.fillText(label,865,y);screenTex.needsUpdate=true;}
 paintScreen();const display=new THREE.Mesh(new THREE.PlaneGeometry(.268,.05),new THREE.MeshStandardMaterial({map:screenTex,emissiveMap:screenTex,emissive:0xffffff,emissiveIntensity:.5,roughness:.22}));display.position.set(0,.611,.017);door.add(display);
 // Inner-door detergent and rinse-aid modules face into the chamber when closed.
 box(.166,.108,.017,.035,.452,-.038,polymer,door,.008);box(.132,.073,.006,.038,.457,-.049,wireMat,door,.003);box(.026,.009,.009,.036,.413,-.054,gold,door);cylinder(.037,.012,-.137,.458,-.041,polymer,door,'z');cylinder(.024,.004,-.137,.458,-.049,dark,door,'z');for(let i=0;i<8;i++){const a=i*Math.PI/4;rod([-.137+Math.cos(a)*.015,.458+Math.sin(a)*.015,-.052],[-.137+Math.cos(a)*.031,.458+Math.sin(a)*.031,-.052],.002,wireMat,door);}
 // Pressed transverse bridge divides the door into two recessed stainless wells.
 box(.505,.038,.025,0,.314,-.034,steel,door,.009);
 rod([-.242,.294,-.046],[.242,.294,-.046],.0015,trim,door);
 rod([-.242,.334,-.046],[.242,.334,-.046],.0015,trim,door);
 box(.116,.069,.012,-.032,.194,-.035,polymer,door,.006);
 box(.096,.050,.005,-.032,.197,-.043,wireMat,door,.004);
 box(.016,.008,.006,-.032,.166,-.048,gold,door,.001);
 // Rolled inner rim and the steel hinge leaves travel with the door.
 wire([[-.255,.040,-.043],[-.264,.054,-.043],[-.264,.628,-.043],[-.251,.641,-.043],[.251,.641,-.043],[.264,.628,-.043],[.264,.054,-.043],[.255,.040,-.043]],.0022,trim,door);
 for(const side of [-1,1]){
  box(.008,.075,.038,side*.278,.014,-.003,trim,door,.003);
  cylinder(.008,.013,side*.279,.008,-.004,dark,door,'x',16);
  rod([side*.276,-.013,-.013],[side*.276,.046,-.013],.002,dark,door);
 }
 // Fine registration marks on the door edge, without fabricated certification text.
 textPlane('FOTILE   ·   BD3BFG3-Y',.092,.006,.165,.675,-.023,door,'#252c30');
 // Door runners align with the lower rack wheels when the door lies horizontal.
 for(const side of [-1,1]){box(.015,.612,.008,side*.247,.33,-.051,trim,door);cylinder(.018,.023,side*.281,0,-.003,polymer,door,'x');}
 const movingRacks=[],tineRows=[],sprayers=[];
 function wheel(x,y,z,parent,r=.018){cylinder(r,.009,x,y,z,polymer,parent,'x',18);const cap=cylinder(r*.48,.010,x,y,z,dark,parent,'x',12);for(let i=0;i<6;i++){const a=i*Math.PI/3;rod([x,y+Math.cos(a)*r*.42,z+Math.sin(a)*r*.42],[x,y+Math.cos(a)*r*.84,z+Math.sin(a)*r*.84],.0014,wireMat,parent);}}
 function rails(y,group,lower=false){for(const side of [-1,1]){box(.012,.014,.442,side*.258,y,-.024,trim);box(.009,.018,.397,side*.251,lower?-.035:.008,0,trim,group);box(.008,.008,.445,side*.264,y+.012,-.02,polymer);}}
 function tines(parent,x,z,sign,height,count){const row=new THREE.Group();row.position.set(x,.008,z);parent.add(row);row.userData.sign=sign;tineRows.push(row);rod([0,0,-.17],[0,0,.17],.003,wireMat,row);for(let i=0;i<count;i++){const zz=-.157+i*.314/(count-1);if(parent.name==='Lower rack'&&x<0&&zz>-.025)continue;wire([[0,0,zz],[sign*.014,.013,zz],[sign*.03,height-.01,zz+.005],[sign*.033,height,zz+.013]],.0021,wireMat,row);}for(const zz of [-.147,.147]){box(.017,.012,.013,0,0,zz,gold,row,.002);cylinder(.006,.021,0,.001,zz,gold,row,'z',12);}return row;}
 function rack(name,y,h,travel){const g=new THREE.Group();g.name=name;g.position.set(0,y,-.023);g.userData={baseZ:-.023,travel,open:false,current:0};model.add(g);
  // The basket is made of wire, including the base, sides, rear and rounded front rail.
  for(let i=0;i<17;i++){const x=-.234+i*.468/16;wire([[x,h,-.215],[x,.015,-.221],[x,0,-.198],[x,0,.194],[x,.025,.213],[x,h,.213]],.0021,wireMat,g);}
  for(let i=0;i<13;i++){const z=-.2+i*.4/12;wire([[-.244,h,z],[-.25,.02,z],[-.232,0,z],[.232,0,z],[.25,.02,z],[.244,h,z]],.0021,wireMat,g);}
  for(const yy of [.037,.09,h])wire([[-.244,yy,-.218],[-.252,yy,-.2],[-.252,yy,.19],[-.23,yy,.222],[.23,yy,.222],[.252,yy,.19],[.252,yy,-.2],[.244,yy,-.218],[-.244,yy,-.218]],.0027,wireMat,g);
  box(.51,.028,.017,0,h-.005,.225,polymer,g,.005);const badgeShape=new THREE.Shape();badgeShape.moveTo(-.097,.011);badgeShape.lineTo(.097,.011);badgeShape.lineTo(.079,-.011);badgeShape.lineTo(-.079,-.011);badgeShape.closePath();const badge=new THREE.Mesh(new THREE.ShapeGeometry(badgeShape),steel);badge.position.set(0,h-.005,.235);g.add(badge);textPlane('FOTILE',.115,.015,0,h-.005,.237,g,'#d5c9ad',62);
  for(const side of [-1,1])for(const z of [-.15,0,.15])wheel(side*.251,-.029,z,g,y<.3?.020:.014);
  rails(y-.029,g,y<.3);tines(g,-.105,0,-1,h*.73,10);tines(g,.115,0,1,h*.73,10);
  // Folding cup-support shelf with the yellow hook details visible in the photos.
  for(let i=0;i<10;i++){const z=-.18+i*.04;rod([.193,h*.80,z],[.245,h*.80,z],.0018,wireMat,g);box(.011,.008,.011,.194,h*.81,z,gold,g,.002);}rod([.194,h*.8,-.20],[.194,h*.8,.20],.003,polymer,g);
  return g;
 }
 const upper=rack('Upper rack',.493,.145,.365),lower=rack('Lower rack',.177,.176,.445);
 // Separate shallow cutlery tray: fine perforated grid and separators, not a third deep basket.
 const cutlery=new THREE.Group();cutlery.name='Cutlery tray';cutlery.position.set(0,.692,-.026);cutlery.userData={baseZ:-.026,travel:.315,open:false,current:0};model.add(cutlery);
 for(const side of [-1,1]){box(.012,.037,.412,side*.251,.015,0,polymer,cutlery,.003);box(.508,.035,.014,0,.015,side*.201,polymer,cutlery,.003);}
 for(let x=-.23;x<.24;x+=.017)rod([x,0,-.19],[x,0,.19],.0018,polymer,cutlery);for(let z=-.185;z<.19;z+=.02)rod([-.238,0,z],[.238,0,z],.0018,polymer,cutlery);
 for(const x of [-.20,-.07,.07,.20])for(let z=-.17;z<.18;z+=.021){rod([x,0,z],[x,.018,z+.005],.0016,polymer,cutlery);}
 for(const side of [-1,1]){rod([side*.078,.018,-.19],[side*.078,.018,.19],.002,polymer,cutlery);wheel(side*.258,.002,-.125,cutlery,.012);}rails(.688,cutlery);
 movingRacks.push(cutlery,upper,lower);
 // Lower basket: removable silverware caddy with a handle and a slotted cover.
 const caddy=new THREE.Group();caddy.position.set(-.153,.011,.086);lower.add(caddy);const cw=.142,cd=.118,ch=.125;
 for(let i=0;i<8;i++){const x=-cw/2+i*cw/7;wire([[x,ch,-cd/2],[x,0,-cd/2],[x,0,cd/2],[x,ch,cd/2]],.0018,polymer,caddy);}
 for(let i=0;i<7;i++){const z=-cd/2+i*cd/6;wire([[-cw/2,ch,z],[-cw/2,0,z],[cw/2,0,z],[cw/2,ch,z]],.0018,polymer,caddy);}
 for(const yy of [.015,.055,.09,ch])wire([[-cw/2,yy,-cd/2],[-cw/2,yy,cd/2],[cw/2,yy,cd/2],[cw/2,yy,-cd/2],[-cw/2,yy,-cd/2]],.0022,polymer,caddy);
 for(let x=-.064;x<.07;x+=.013)rod([x,ch,-.058],[x,ch,.058],.002,polymer,caddy);for(let z=-.05;z<.058;z+=.013)rod([-.07,ch,z],[.07,ch,z],.002,polymer,caddy);
 wire([[-.03,ch,0],[-.03,ch+.067,0],[-.022,ch+.078,0],[.022,ch+.078,0],[.03,ch+.067,0],[.03,ch,0]],.004,polymer,caddy);
 // Spray hardware and visible nozzles. Arm rotations are illustrative, never tied to a claimed cycle.
 function spray(parent,x,y,z,length,planetary=false){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);sprayers.push(g);cylinder(.022,.024,0,0,0,polymer,g);box(length,.011,.027,0,.002,0,polymer,g,.008);for(let i=0;i<12;i++){const xx=-length*.44+i*length*.88/11;cylinder(.0022,.002,xx,.009,(i%2?1:-1)*.007,dark,g,'y',8);}if(planetary){for(const side of [-1,1]){cylinder(.016,.007,side*length*.4,.014,0,gold,g);box(.075,.006,.017,side*length*.4,.017,0,gold,g,.005);}}return g;}
 const lowerSpray=spray(model,0,.132,-.031,.425,true);lowerSpray.rotation.y=.30;spray(upper,0,-.025,-.01,.39);spray(model,.005,.725,-.015,.15);
 cylinder(.042,.005,-.07,.108,-.1,trim);cylinder(.031,.008,-.07,.11,-.1,polymer);for(let i=0;i<12;i++){const a=i*Math.PI/6;rod([-.07+Math.cos(a)*.011,.115,-.1+Math.sin(a)*.011],[-.07+Math.cos(a)*.03,.115,-.1+Math.sin(a)*.03],.0013,trim);}
 cylinder(.023,.008,-.188,.112,.094,polymer);rod([-.201,.119,.094],[-.175,.119,.094],.002,wireMat);
 // Combine repetitive wire geometry by material to keep mobile draw calls low.
 for(const [parent,materials] of batches)for(const [mat,geometries] of materials){const expanded=geometries.map(g=>g.index?g.toNonIndexed():g);const count=expanded.reduce((n,g)=>n+g.attributes.position.count,0);const positions=new Float32Array(count*3),normals=new Float32Array(count*3);let offset=0;expanded.forEach(g=>{positions.set(g.attributes.position.array,offset);normals.set(g.attributes.normal.array,offset);offset+=g.attributes.position.array.length;});const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));const mesh=new THREE.Mesh(geometry,mat);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);geometries.forEach(g=>g.dispose());expanded.forEach(g=>g.dispose());}
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.ShadowMaterial({opacity:.07,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.003;floor.receiveShadow=true;scene.add(floor);
 const particleCount=240,flowPositions=new Float32Array(particleCount*6),flowGeometry=new THREE.BufferGeometry();flowGeometry.setAttribute('position',new THREE.BufferAttribute(flowPositions,3));const flowLines=new THREE.LineSegments(flowGeometry,new THREE.LineBasicMaterial({color:0x9edcf5,transparent:true,opacity:.65,depthWrite:false}));model.add(flowLines);flowLines.visible=false;
 const details=[['01 / CUTLERY TRAY','Small details. Their own space.','The shallow top tray creates a dedicated layer for cutlery, with shaped dividers and a fine open grid.'],['02 / RACK SYSTEM','Ready for the way you load.','Explore the coated wire baskets, rolling wheels, folding tines, and separate silverware caddy.'],['03 / SPRAY SYSTEM','A closer look at the clean.','Spray arms beneath the racks distribute water through the interior. Select Show water flow for an illustrative view of the movement.'],['04 / INNER DOOR','Care, within easy reach.','The stainless inner door houses the detergent dispenser and rinse-aid compartment, alongside the runners for the lower rack.']];
 let angle=-28,currentAngle=-28,doorOpen=false,doorValue=0,fold=false,foldValue=0,light=true,flow=false,flowTime=0,view='hero',frame=0,last=0,visible=true,selectedFeature=-1;
 const cameraTarget=new THREE.Vector3(),cameraPosition=new THREE.Vector3(),bounds=new THREE.Box3(),corner=new THREE.Vector3(),direction=new THREE.Vector3(),up=new THREE.Vector3(),right=new THREE.Vector3(1,0,0);
 function sync(){ $('#dw-door').setAttribute('aria-expanded',String(doorOpen));$('#dw-door span').textContent=doorOpen?'Close the door':'Open the door';movingRacks.forEach((g,i)=>{const b=$(`[data-dw-rack="${i}"]`);b.setAttribute('aria-expanded',String(g.userData.open));b.querySelector('b').textContent=g.userData.open?'−':'+';});$('#dw-flow').setAttribute('aria-pressed',String(flow));$('#dw-flow').textContent=flow?'Pause water flow':'Show water flow';$('#dw-tines').setAttribute('aria-pressed',String(fold));$('#dw-tines').textContent=fold?'Raise tines':'Fold tines';$('#dw-light').setAttribute('aria-pressed',String(light));$('#dw-view-status').textContent=flow?'WATER FLOW · ILLUSTRATIVE PREVIEW':doorOpen?'EXPLORE THE RACKS · TAP A NUMBERED DETAIL':'DRAG TO ROTATE · TAP THE DOOR TO OPEN';}
 function openDoor(value){doorOpen=value;if(!value){movingRacks.forEach(g=>g.userData.open=false);flow=false;}sync();request();}
 function toggleRack(i){const g=movingRacks[i];g.userData.open=!g.userData.open;if(g.userData.open){doorOpen=true;flow=false;}sync();request();}
 function feature(i){selectedFeature=i;$('#dw-detail-index').textContent=details[i][0];$('#dw-detail-title').textContent=details[i][1];$('#dw-detail-copy').textContent=details[i][2];root.querySelectorAll('[data-dw-feature]').forEach((b,n)=>b.setAttribute('aria-pressed',String(i===n)));request();}
 function setAngle(v){angle=THREE.MathUtils.clamp(Number(v),-65,65);$('#dw-angle').value=angle;$('#dw-angle-value').textContent=`${Math.round(angle)}°`;request();}
 function setView(v){view=v;root.querySelectorAll('[data-dw-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dwView===v)));if(v==='front')setAngle(0);if(v==='hero')setAngle(setting==='studio'?-28:-16);if(v==='inside'){setAngle(-12);openDoor(true);}request();}
 $('#dw-door').onclick=()=>openDoor(!doorOpen);root.querySelectorAll('[data-dw-rack]').forEach((b,i)=>b.onclick=()=>toggleRack(i));root.querySelectorAll('[data-dw-feature]').forEach((b,i)=>b.onclick=()=>feature(i));root.querySelectorAll('[data-dw-view]').forEach(b=>b.onclick=()=>setView(b.dataset.dwView));
 $('#dw-angle').oninput=e=>setAngle(e.target.value);$('#dw-tines').onclick=()=>{fold=!fold;doorOpen=true;feature(1);sync();request();};$('#dw-light').onclick=()=>{light=!light;sync();request();};$('#dw-flow').onclick=()=>{flow=!flow;flowTime=0;if(flow){doorOpen=true;light=true;movingRacks.forEach(g=>g.userData.open=false);feature(2);}sync();request();};
 $('#dw-reset').onclick=()=>{doorOpen=false;movingRacks.forEach(g=>g.userData.open=false);flow=false;fold=false;light=true;view='hero';setView('hero');sync();request();};root.addEventListener('programchange',e=>{paintScreen(e.detail);request();});
 root.querySelectorAll('[data-dw-setting]').forEach(b=>b.addEventListener('click',()=>{
 setting=b.dataset.dwSetting;const scheme=kitchen.apply(setting);floor.visible=!scheme;scene.background=scheme?new THREE.Color(scheme.bg):null;
 root.querySelectorAll('[data-dw-setting]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 $('#dw-setting-caption').textContent=scheme?scheme.caption:'The product, in every detail.';
 $('#dw-model-note').textContent=scheme?'Illustrative kitchen setting, not an installation plan. Confirm clearances with your installer. Water flow is illustrative.':'Interactive illustration based on the supplied product references. Water flow is illustrative.';
 root.dataset.setting=setting;setView('hero');cameraPosition.set(0,0,0);request();
 }));
 const raycaster=new THREE.Raycaster();let drag=null,suppressClick=false;
 renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===0)drag={x:e.clientX,y:e.clientY,angle,id:e.pointerId,moved:false};});
 window.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.abs(dy)>Math.abs(dx)+8){drag=null;return;}if(Math.abs(dx)>5)drag.moved=true;if(drag.moved)setAngle(drag.angle+dx*.26);},{passive:true});
 window.addEventListener('pointerup',()=>{suppressClick=!!drag?.moved;drag=null;setTimeout(()=>suppressClick=false,0);});window.addEventListener('pointercancel',()=>drag=null);
 renderer.domElement.addEventListener('click',e=>{if(suppressClick)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);let part=raycaster.intersectObject(model,true).find(h=>h.object!==flowLines)?.object;while(part&&part!==model){const i=movingRacks.indexOf(part);if(i>=0&&doorValue>1.54){toggleRack(i);return;}if(part===door){openDoor(!doorOpen);return;}part=part.parent;}});
 renderer.domElement.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDoor(!doorOpen);}if(e.key==='ArrowLeft'){e.preventDefault();setAngle(angle-5);}if(e.key==='ArrowRight'){e.preventDefault();setAngle(angle+5);}});
 function fitCamera(ease){model.updateMatrixWorld(true);kitchen.group.updateMatrixWorld(true);if(view==='inside'){bounds.set(new THREE.Vector3(-.30,.10,-.27),new THREE.Vector3(.30,.775,.25)).applyMatrix4(model.matrixWorld);movingRacks.forEach(g=>bounds.union(new THREE.Box3().setFromObject(g)));}else if(setting!=='studio'){
 const halfWidth=viewport.clientWidth<500?.67:.86;
 bounds.set(new THREE.Vector3(-halfWidth,-.03,-.37),new THREE.Vector3(halfWidth,1.43,.33+doorValue/(Math.PI/2)*.60)).applyMatrix4(kitchen.group.matrixWorld);
 }else bounds.setFromObject(model);const center=bounds.getCenter(new THREE.Vector3());center.y+=.005;direction.set(0,view==='inside'?.55:setting!=='studio'?.34:THREE.MathUtils.lerp(.32,.68,doorValue/(Math.PI/2)),1).normalize();up.crossVectors(direction,right).normalize();const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),tanH=tanV*camera.aspect;let distance=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){corner.set(x,y,z).sub(center);distance=Math.max(distance,Math.abs(corner.dot(right))/tanH+corner.dot(direction),Math.abs(corner.dot(up))/tanV+corner.dot(direction));}distance*=view==='inside'?1.08:1.14;const destination=center.clone().addScaledVector(direction,distance);if(!cameraPosition.length()){cameraTarget.copy(center);cameraPosition.copy(destination);}else{cameraTarget.lerp(center,ease);cameraPosition.lerp(destination,ease);}camera.position.copy(cameraPosition);camera.lookAt(cameraTarget);}
 function overlays(){const show=doorOpen&&doorValue>1.54;$('#dw-hotspots').hidden=!show;if(!show)return;const anchors=[cutlery.localToWorld(new THREE.Vector3(0,.027,.208)),upper.localToWorld(new THREE.Vector3(.06,.10,.24)),model.localToWorld(new THREE.Vector3(.16,.148,.0)),door.localToWorld(new THREE.Vector3(.04,.45,-.06))];root.querySelectorAll('[data-dw-feature]').forEach((b,i)=>{const p=anchors[i].project(camera);b.style.left=`${(p.x*.5+.5)*viewport.clientWidth}px`;b.style.top=`${(-p.y*.5+.5)*viewport.clientHeight}px`;b.hidden=Math.abs(p.x)>.92||Math.abs(p.y)>.90||(i===2&&movingRacks[2].userData.current<.16);});}
 function render(time=performance.now()){frame=0;if(document.hidden||!visible)return;const dt=last?Math.min((time-last)/1000,.05):.016;last=time;const ease=reduced.matches?1:1-Math.exp(-dt*8);
  currentAngle+=(angle-currentAngle)*ease;model.rotation.y=THREE.MathUtils.degToRad(currentAngle);kitchen.group.rotation.y=model.rotation.y;
  const hasExtendedRack=movingRacks.some(g=>g.userData.current>.0004),doorTarget=(doorOpen||hasExtendedRack)?Math.PI/2:0;doorValue+=(doorTarget-doorValue)*ease;if(Math.abs(doorTarget-doorValue)<.0001)doorValue=doorTarget;door.rotation.x=doorValue;
  movingRacks.forEach(g=>{const u=g.userData,target=u.open&&doorOpen&&doorValue>1.568?u.travel:0;u.current+=(target-u.current)*ease;if(Math.abs(target-u.current)<.0003)u.current=target;g.position.z=u.baseZ+u.current;});
  foldValue+=((fold?1:0)-foldValue)*ease;tineRows.forEach(g=>g.rotation.z=-g.userData.sign*foldValue*1.35);
  lamp.intensity=light?.055:0;lightMat.color.setHex(light?0xd2f4ff:0x414b53);
  const flowReady=flow&&doorValue>1.56&&movingRacks.every(g=>g.userData.current<.001);flowLines.visible=flowReady;
  if(flowReady){if(!reduced.matches)flowTime+=dt;const t=reduced.matches?.7:flowTime;sprayers.forEach((g,i)=>g.rotation.y=t*(i%2?-1:1)*.75+i*.25);for(let i=0;i<particleCount;i++){const level=i%2,y0=level?.455:.15,a=(i*2.399+t*.9),progress=(i*.037+t*.55)%1,radius=.015+progress*.225;const x=Math.cos(a)*radius,z=Math.sin(a)*radius*.67-.026,y=y0+Math.sin(progress*Math.PI)*.19;const j=i*6;flowPositions[j]=x;flowPositions[j+1]=y;flowPositions[j+2]=z;flowPositions[j+3]=x*.98;flowPositions[j+4]=y-.008;flowPositions[j+5]=z-.002;}flowGeometry.attributes.position.needsUpdate=true;flowGeometry.computeBoundingSphere();if(flowTime>9){flow=false;sync();}}
  fitCamera(ease);renderer.render(scene,camera);overlays();
  const moving=Math.abs(angle-currentAngle)>.02||Math.abs((doorOpen?Math.PI/2:0)-doorValue)>.0001||movingRacks.some(g=>Math.abs((g.userData.open?g.userData.travel:0)-g.userData.current)>.0003)||Math.abs((fold?1:0)-foldValue)>.001;
  if(moving||(flow&&!reduced.matches))request();
 }
 function request(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(render);}
 function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();cameraPosition.set(0,0,0);request();}
 new ResizeObserver(resize).observe(viewport);new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){last=0;request();}else if(frame){cancelAnimationFrame(frame);frame=0;}}).observe(viewport);document.addEventListener('visibilitychange',()=>{if(!document.hidden){last=0;request();}});reduced.addEventListener('change',request);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback('3D is temporarily unavailable. Reload the page to restore the interactive view.');});renderer.domElement.addEventListener('webglcontextrestored',()=>{root.querySelectorAll('button,input').forEach(b=>b.disabled=false);root.classList.add('dw-ready');request();});
 Object.defineProperty(root,'modelState',{get:()=>({setting,door:doorValue,doorOpen,racks:movingRacks.map(g=>({name:g.name,open:g.userData.open,travel:g.userData.current})),fold:foldValue,flow,light,angle:currentAngle,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles})});
 Object.defineProperty(root,'modelFacts',{value:Object.freeze({width:.598,height:.775,depth:.570,racks:2,cutleryTrays:1,doorOpening:90})});
 root.classList.add('dw-ready');$('#dw-loading').hidden=true;sync();resize();request();
 const requestedSetting=new URLSearchParams(location.search).get('setting');
 if(requestedSetting)Array.from(root.querySelectorAll('[data-dw-setting]')).find(b=>b.dataset.dwSetting===requestedSetting)?.click();
}
