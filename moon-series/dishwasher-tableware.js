import * as THREE from '../fridge/vendor/three.module.js';

// Rack-local placement keeps every item attached as the baskets slide.
export function createTableware({upper,lower,cutlery}){
 const lowerLoad=new THREE.Group(),upperLoad=new THREE.Group(),cutleryLoad=new THREE.Group();
 lowerLoad.name='Plates';upperLoad.name='Cups and bowls';cutleryLoad.name='Cutlery';
 lower.add(lowerLoad);upper.add(upperLoad);cutlery.add(cutleryLoad);
 const ivory=new THREE.MeshPhysicalMaterial({color:0xe4dfd1,roughness:.27,metalness:0,clearcoat:.5,clearcoatRoughness:.18});
 const stone=new THREE.MeshPhysicalMaterial({color:0xb0aaa0,roughness:.31,metalness:0,clearcoat:.4,clearcoatRoughness:.22});
 const charcoal=new THREE.MeshPhysicalMaterial({color:0x42545b,roughness:.29,metalness:0,clearcoat:.5,clearcoatRoughness:.2});
 const silver=new THREE.MeshStandardMaterial({color:0xb5c0c3,metalness:.93,roughness:.25});
 const lathe=points=>new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),40);
 const plate=lathe([[0,.004],[.039,.004],[.046,.002],[.049,.002],[.052,.005],[.079,.010],[.098,.017],[.102,.020],[.102,.023],[.099,.025],[.095,.023],[.076,.015],[.051,.011],[.037,.010],[0,.010]]);
 const sidePlate=plate.clone().scale(.71,.8,.71);
 const bowl=lathe([[0,.002],[.024,.002],[.029,.005],[.033,.012],[.047,.028],[.058,.047],[.063,.057],[.063,.060],[.060,.062],[.058,.058],[.054,.048],[.043,.030],[.030,.017],[.021,.012],[0,.012]]);
 const mug=lathe([[0,.002],[.021,.002],[.026,.004],[.028,.010],[.031,.069],[.032,.078],[.032,.081],[.030,.083],[.028,.081],[.027,.075],[.024,.014],[.021,.010],[0,.010]]);
 const handle=new THREE.TorusGeometry(.016,.0038,8,28);
 const instances=(geometry,material,parent,poses)=>{
  const mesh=new THREE.InstancedMesh(geometry,material,poses.length),dummy=new THREE.Object3D();
  poses.forEach(({position,rotation=[0,0,0]},i)=>{dummy.position.set(...position);dummy.rotation.set(...rotation);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
  mesh.castShadow=true;mesh.receiveShadow=true;mesh.instanceMatrix.needsUpdate=true;parent.add(mesh);return mesh;
 };
 const dinnerPoses=Array.from({length:5},(_,i)=>({position:[.080,.116,-.139+i*.0698],rotation:[Math.PI/2+.065,0,-.055]}));
 const sidePoses=[-.139,-.0692].map(z=>({position:[-.147,.084,z],rotation:[Math.PI/2+.06,0,.06]}));
 instances(plate,ivory,lowerLoad,dinnerPoses);
 instances(sidePlate,stone,lowerLoad,sidePoses);
 // A thin, curved residue layer follows the ceramic face, including its rim.
 // One small procedural texture is shared by every plate; no image download.
 const stains=document.createElement('canvas');stains.width=stains.height=512;
 const ctx=stains.getContext('2d');let seed=711;
 const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<29;i++){
  const a=random()*Math.PI*2,r=35+random()*128,x=256+Math.cos(a)*r,y=256+Math.sin(a)*r;
  ctx.save();ctx.translate(x,y);ctx.rotate(a+.6);ctx.scale(1,.28+random()*.3);
  const radius=23+random()*47,gradient=ctx.createRadialGradient(0,0,0,0,0,radius);
  gradient.addColorStop(0,'rgba(132,52,18,.58)');gradient.addColorStop(.42,'rgba(179,73,25,.40)');gradient.addColorStop(1,'rgba(187,84,28,0)');
  ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 // Uneven dried sauce arcs and small food flecks, rather than a solid stain.
 for(let i=0;i<9;i++){
  ctx.strokeStyle=`rgba(143,62,22,${.12+random()*.18})`;ctx.lineWidth=1+random()*3;
  ctx.beginPath();ctx.ellipse(256,256,109+i*5,103+i*5,.3,.2+random()*.4,1.1+random()*.5);ctx.stroke();
 }
 for(let i=0;i<92;i++){
  const a=random()*Math.PI*2,r=Math.sqrt(random())*173,x=256+Math.cos(a)*r,y=256+Math.sin(a)*r;
  ctx.fillStyle=i%6===0?'rgba(72,83,32,.72)':`rgba(111,53,23,${.32+random()*.38})`;
  ctx.beginPath();ctx.ellipse(x,y,1+random()*3.2,.6+random()*1.5,random()*Math.PI,0,Math.PI*2);ctx.fill();
 }
 const stainTexture=new THREE.CanvasTexture(stains);stainTexture.colorSpace=THREE.SRGBColorSpace;
 const residue=new THREE.MeshStandardMaterial({map:stainTexture,transparent:true,opacity:1,roughness:.87,metalness:0,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const face=lathe([[0,.0105],[.037,.0105],[.051,.0115],[.076,.0155],[.095,.0235],[.099,.0255],[.102,.0235]]);
 const position=face.attributes.position,uv=face.attributes.uv;
 for(let i=0;i<position.count;i++)uv.setXY(i,position.getX(i)/.204+.5,position.getZ(i)/.204+.5);
 uv.needsUpdate=true;
 const dinnerResidue=instances(face,residue,lowerLoad,dinnerPoses),sideResidue=instances(face.clone().scale(.71,.8,.71),residue,lowerLoad,sidePoses);
 // Turn the residue around each circular face so neighbouring plates vary.
 for(const [offset,mesh] of [dinnerResidue,sideResidue].entries()){
  const matrix=new THREE.Matrix4();for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);matrix.multiply(new THREE.Matrix4().makeRotationY(i*1.73+offset*.81));mesh.setMatrixAt(i,matrix);}
  mesh.instanceMatrix.needsUpdate=true;
 }
 dinnerResidue.name=sideResidue.name='Food residue';
 dinnerResidue.castShadow=sideResidue.castShadow=false;
 // Cups and bowls face downwards, leaving space beneath the shallow top tray.
 instances(bowl,ivory,upperLoad,[-.102,.095].map(z=>({position:[.126,.074,z],rotation:[Math.PI-.14,0,.05]})));
 const cupPoses=[[-.175,-.115],[-.175,.091],[-.070,-.115],[-.070,.091]].map(([x,z])=>({position:[x,.098,z],rotation:[Math.PI-.10,0,0]}));
 instances(mug,charcoal,upperLoad,cupPoses.slice(0,2));instances(mug,stone,upperLoad,cupPoses.slice(2));
 const handlePoses=cupPoses.map(p=>{const matrix=new THREE.Matrix4().compose(new THREE.Vector3(...p.position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotation)),new THREE.Vector3(1,1,1));const point=new THREE.Vector3(.038,.044,0).applyMatrix4(matrix);return {position:point.toArray(),rotation:p.rotation};});
 instances(handle,charcoal,upperLoad,handlePoses.slice(0,2));instances(handle,stone,upperLoad,handlePoses.slice(2));
 // A few teaspoons sit flat between the tray dividers.
 const spoonGroup=new THREE.Group();cutleryLoad.add(spoonGroup);
 const stem=new THREE.BoxGeometry(.007,.002,.080),spoonHead=new THREE.SphereGeometry(1,14,8);
 for(const x of [-.158,-.112,.112,.158]){
  const grip=new THREE.Mesh(stem,silver);grip.position.set(x,.025,.005);grip.castShadow=true;spoonGroup.add(grip);
  const head=new THREE.Mesh(spoonHead,silver);head.scale.set(.012,.0028,.018);head.position.set(x,.025,-.048);head.castShadow=true;spoonGroup.add(head);
 }
 // The Glass programme illustration uses a separate, lightly tinted glass load.
 const glassLoad=new THREE.Group();glassLoad.name='Glass programme load';upper.add(glassLoad);glassLoad.visible=false;
 const glassMaterial=new THREE.MeshPhysicalMaterial({color:0xb3d3db,metalness:.05,roughness:.13,transparent:true,opacity:.52,clearcoat:1,clearcoatRoughness:.1,side:THREE.DoubleSide});
 const glass=lathe([[0,.002],[.022,.002],[.027,.005],[.031,.086],[.032,.091],[.030,.093],[.028,.090],[.027,.012],[.022,.008],[0,.008]]);
 instances(glass,glassMaterial,glassLoad,[-.16,0,.16].flatMap(x=>[-.10,.105].map(z=>({position:[x,.106,z],rotation:[Math.PI-.10,0,0]}))));
 let visible=true,presentation='normal',dirtAmount=1;
 const apply=()=>{lowerLoad.visible=upperLoad.visible=cutleryLoad.visible=visible&&presentation==='normal';glassLoad.visible=presentation==='glass';};
 return {
  get visible(){return visible;},
  get presentation(){return presentation;},
  get dirtAmount(){return dirtAmount;},
  setDirtAmount(value){dirtAmount=THREE.MathUtils.clamp(value,0,1);residue.opacity=dirtAmount;dinnerResidue.visible=sideResidue.visible=dirtAmount>.001;},
  setVisible(value){if(value&&!visible)this.setDirtAmount(1);visible=!!value;apply();},
  setPresentation(mode){presentation=mode;apply();},
  counts:Object.freeze({dinnerPlates:5,sidePlates:2,bowls:2,cups:4,spoons:4}),
  // Read-only geometry diagnostics used to check the closed rack clearances.
  layout(){return [lowerLoad,upperLoad,cutleryLoad].map(group=>{group.updateMatrixWorld(true);const inverse=group.parent.matrixWorld.clone().invert();const box=new THREE.Box3().makeEmpty();group.traverse(object=>{if(!object.isMesh)return;object.geometry.computeBoundingBox();const local=new THREE.Matrix4().multiplyMatrices(inverse,object.matrixWorld);if(object.isInstancedMesh){const m=new THREE.Matrix4();for(let i=0;i<object.count;i++){object.getMatrixAt(i,m);box.union(object.geometry.boundingBox.clone().applyMatrix4(local.clone().multiply(m)));}}else box.union(object.geometry.boundingBox.clone().applyMatrix4(local));});return {rack:group.parent.name,min:box.min.toArray(),max:box.max.toArray(),worldZ:group.getWorldPosition(new THREE.Vector3()).z};});}
 };
}
