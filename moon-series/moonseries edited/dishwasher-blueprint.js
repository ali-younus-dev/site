import * as THREE from '../fridge/vendor/three.module.js';

export function createBlueprint({model,shell,steel}){
 const meshes=[],panels=[],textPlanes=[],materialCache=new Map();
 model.traverse(object=>{
  if(!object.isMesh)return;
  meshes.push({object,material:object.material,shadow:object.castShadow});
  object.geometry.computeBoundingBox();const size=object.geometry.boundingBox.getSize(new THREE.Vector3());
  const innerWall=size.y>.60&&(size.x>.49||size.x<.02),innerCeiling=size.x>.49&&size.z>.48&&object.position.y>.73;
  if(object.parent===model&&(object.material===shell||(object.material===steel&&(innerWall||innerCeiling)))){
   const position=object.position.clone(),offset=new THREE.Vector3();
   if(Math.abs(position.x)>.25)offset.x=Math.sign(position.x)*.17;else if(position.y>.70)offset.y=.16;else offset.z=-.16;
   panels.push({object,position,offset,material:object.material,visible:object.visible,edge:null});
  }
  if(object.geometry.type==='PlaneGeometry'&&object.material.map)textPlanes.push({object,visible:object.visible});
 });
 const group=new THREE.Group();group.name='Blueprint dimensions';group.visible=false;model.add(group);
 const grid=new THREE.GridHelper(2.4,48,0x416c91,0x22445e);grid.position.y=-.064;grid.material.transparent=true;grid.material.opacity=.25;grid.material.depthWrite=false;group.add(grid);
 const dimensions=new THREE.Group();group.add(dimensions);const positions=[];
 function segment(a,b){positions.push(...a,...b);}
 function measure(a,b){segment(a,b);for(const p of [a,b])segment([p[0]-.009,p[1]-.009,p[2]-.009],[p[0]+.009,p[1]+.009,p[2]+.009]);}
 measure([-.299,-.045,.405],[.299,-.045,.405]);segment([-.299,0,.285],[-.299,-.061,.405]);segment([.299,0,.285],[.299,-.061,.405]);
 measure([.397,0,.285],[.397,.775,.285]);segment([.299,0,.285],[.425,0,.285]);segment([.299,.775,.285],[.425,.775,.285]);
 measure([.397,-.045,-.285],[.397,-.045,.285]);segment([.299,0,-.285],[.425,-.061,-.285]);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));dimensions.add(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:0xafd9f3,transparent:true,opacity:.85,depthTest:false,depthWrite:false})));
 const anchors={width:new THREE.Vector3(0,-.070,.405),height:new THREE.Vector3(.465,.40,.285),depth:new THREE.Vector3(.47,-.075,-.04)};
 let enabled=false,cutaway=true,showDimensions=true,exploded=false,explodeValue=0,pose='iso';
 function sheet(object){const s=object.geometry.boundingBox.getSize(new THREE.Vector3()),a=[s.x,s.y,s.z].sort((x,y)=>x-y);return a[0]<.05&&a[1]>.30&&!(object.geometry.type==='BufferGeometry'&&object.geometry.attributes.position.count>1000);}
 function schematic(original,object){const flat=sheet(object),key=original.uuid+(flat?'sheet':'detail');if(materialCache.has(key))return materialCache.get(key);const m=new THREE.MeshBasicMaterial({color:flat?0x729fbd:0x91c6e5,transparent:true,opacity:flat?.055:original.metalness>.65?.30:.80,depthWrite:!flat&&original.metalness<=.65,side:THREE.DoubleSide});materialCache.set(key,m);return m;}
 const outlines=[],skin=new THREE.MeshBasicMaterial({color:0x284e68,transparent:true,opacity:.90,side:THREE.DoubleSide});
 function panelVisibility(){panels.forEach(p=>{p.object.visible=enabled?(!cutaway||exploded):p.visible;if(enabled)p.object.material=!cutaway&&!exploded?skin:schematic(p.material,p.object);if(p.edge)p.edge.visible=enabled;});outlines.forEach(edge=>edge.visible=enabled);}
 function setEnabled(value){enabled=!!value;group.visible=enabled;for(const item of meshes){item.object.material=enabled?schematic(item.material,item.object):item.material;item.object.castShadow=enabled?false:item.shadow;}textPlanes.forEach(t=>t.object.visible=enabled?false:t.visible);
  if(enabled){for(const p of panels){if(!p.edge){p.edge=new THREE.LineSegments(new THREE.EdgesGeometry(p.object.geometry,28),new THREE.LineBasicMaterial({color:0x739fc1,transparent:true,opacity:.45}));p.object.add(p.edge);}}if(!outlines.length)for(const item of meshes){if(sheet(item.object)&&!panels.some(p=>p.object===item.object)){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(item.object.geometry,32),new THREE.LineBasicMaterial({color:0x80abc7,transparent:true,opacity:.35}));item.object.add(edge);outlines.push(edge);}}}
  else{exploded=false;explodeValue=0;panels.forEach(p=>p.object.position.copy(p.position));}
  panelVisibility();
 }
 function update(ease){if(!enabled)return false;const target=exploded?1:0;explodeValue+=(target-explodeValue)*ease;if(Math.abs(target-explodeValue)<.001)explodeValue=target;panels.forEach(p=>p.object.position.copy(p.position).addScaledVector(p.offset,explodeValue));return Math.abs(target-explodeValue)>.001;}
 return {group,dimensions,anchors,setEnabled,update,get enabled(){return enabled;},get cutaway(){return cutaway;},setCutaway(value){cutaway=!!value;panelVisibility();},get showDimensions(){return showDimensions;},setDimensions(value){showDimensions=!!value;dimensions.visible=showDimensions;},get exploded(){return exploded;},setExploded(value){exploded=!!value;panelVisibility();},get explodeValue(){return explodeValue;},get pose(){return pose;},setPose(value){pose=value;},get panelCount(){return panels.length;},get facts(){return {width:598,height:775,depth:570,unit:'mm',grid:50};}};
}
