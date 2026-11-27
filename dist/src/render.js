import {seed,rect,poly,oval,star,arch,stone,building,bed,tree,fountain,person} from './art.js?v=7';
import {house,stand,horse,carriedSack} from './istanbul-art.js?v=7';
import {bounds,buildings,gardens,cottages,gardenPool,pool,gates,walls,water,shores,isOpen,cityStalls,monuments,groves} from './geography.js?v=7';
import {tileSize,terrainTile} from './terrain.js?v=7';
import {parcels} from './city.js?v=7';
function boat(c,x,y,tint){
 poly(c,[[x-28,y],[x-19,y+8],[x+16,y+8],[x+32,y-2],[x+8,y+2]],'#604b33');rect(c,x,y-29,2,32,'#6d573b');
 poly(c,[[x-1,y-29],[x-2,y-2],[x-20,y-5]],tint);
}
function drawResident(ctx,n,game,t){
 if(water(n.x,n.y)){boat(ctx,n.x,n.y,'#decba5');return}
 const d=game.note(n),plan=d.plan,phase=t+(plan?.seed??n.id.length)*.713;
 const working=plan&&n.duty==='routine'&&n.work.period==='work'&&!n.moving&&n.work.leg==='bench'&&n.work.progress>0;
 const pose=plan?.parcel==='watch'?'guard':['bostan','bahce'].includes(d.unit)?'gardener':['imaret','helva','firin'].includes(d.unit)?'cook':n.id;
 const rest=plan&&n.duty==='routine'&&n.work.status==='İkametinde dinleniyor';
 ctx.save();
 if(rest){ctx.translate(0,n.y*.25);ctx.scale(1,.75)}
 person(ctx,n.x,n.y,d.color,n.face,n.moving,phase,pose);
 ctx.restore();
 const mandate=game.s.office.jobs.some(j=>(j.executor??j.officer)===n.id&&j.type==='provision'&&j.phase!=='pickup');
 if(mandate){carriedSack(ctx,n.x-6*n.face,n.y-13);return}
 if(n.duty!=='routine'||n.work.period!=='work'||!plan)return;
 const carrying=n.moving&&(n.work.leg==='receiver'||n.work.leg==='bench');
 if(!working&&!carrying)return;
 const f=n.face||1,x=n.x+5*f,y=n.y-13+(working?Math.round(Math.sin(phase*5)*2):0);
 if(plan.parcel==='paper'){rect(ctx,x-3,y,9,6,'#ebd9a5');rect(ctx,x-1,y+2,5,1,'#8a7754')}
 else if(plan.parcel==='watch'){rect(ctx,x,y-10,2,18,'#826747')}
 else if(carrying){
  if(['iskele','kiler','firin'].includes(d.unit))carriedSack(ctx,n.x-f*5,n.y-10);
  else {rect(ctx,x-5,y,12,8,d.unit==='dokuma'?'#a96f60':'#ab8958');rect(ctx,x,y,2,8,'#daba81')}
 }else{rect(ctx,x,y-1,7*f,2,'#d8b88e');rect(ctx,x+6*f,y-4,2,5,'#75674a')}
}
function sprite(x,y,w,h,paint,depth=y+h){
 const canvas=document.createElement('canvas');canvas.width=Math.ceil(w);canvas.height=Math.ceil(h);
 const c=canvas.getContext('2d');c.translate(-x,-y);paint(c);
 return {x,y,w,h,depth,draw:ctx=>ctx.drawImage(canvas,x,y)};
}
function buildingSprite(b,inside=false){
 const {x,y,w,h,cx,front}=b;
 return sprite(x-14,y-58,w+55,h+73,c=>{
  const r=seed(Math.floor(cx*front));
  if(inside){
   rect(c,x,y,w,h,'#9e8761');stone(c,x+3,y+3,w-6,h-6,r,['#d4c294','#cabc96','#dacba3','#cec19a']);
   rect(c,x+3,y+2,w-6,8,'#6c806c');for(let a=x+6;a<x+w-6;a+=9)star(c,a,y+6,3,'#d5bd88');
   const palace=['arz','has','council','mosqueLand'].includes(b.id);
   rect(c,x+w*.18,y+h*.34,w*.64,h*.48,palace?'#a35845':'#aa8c66');
   c.strokeStyle='#d2aa73';c.strokeRect(x+w*.18+3,y+h*.34+3,w*.64-6,h*.48-6);
   if(palace){for(let a=-1;a<=1;a++)star(c,cx+a*w*.19,y+h*.56,h*.13,'#d2b579')}
   else for(const a of [x+12,x+w-35]){rect(c,a,y+14,23,9,'#775d40');for(let i=0;i<3;i++)oval(c,a+4+i*7,y+14,3,2,b.id==='kitchen'?'#aa7846':'#c6ae7d')}
   for(const a of [x,x+w-4])rect(c,a,y,4,h,'#9c9475');
   rect(c,x,front-3,w/2-18,3,'#b8a580');rect(c,cx+18,front-3,w/2-18,3,'#b8a580');
  }else if(['council','kitchen','arz','has','icHazine','mosqueLand'].includes(b.id)){
   stone(c,x,y,w,h,r);building(c,x,front-60,w,Math.max(3,Math.floor(w/31)),b.id==='kitchen'?4:b.id==='council'?3:2,r);
   if(b.id==='council'||b.id==='mosqueLand'){
    const tx=x+13;stone(c,tx,y-32,16,39,r);rect(c,tx-2,y-32,20,4,'#99896a');
    poly(c,[[tx-2,y-33],[tx+8,y-50],[tx+18,y-33]],'#566f65');rect(c,tx+7,y-53,2,5,'#b89a50');
   }
   arch(c,cx-13,front-28,26,28,'#d8c49d');arch(c,cx-10,front-25,20,25,'#4d5947');
  }else house(c,{x,y:front,w,h,kind:b.id});
 },inside?y:front);
}
function scenery(){
 const result=[];
 for(const [i,b] of gardens.entries()){
  const [x,y,w,h]=b;result.push(sprite(x,y,w+5,h+6,c=>bed(c,b,seed(i+48)),y));
  for(let j=0;j<3;j++){
   const xx=x+20+j*(w-40)/2,yy=y+h*.58+(j%2)*9;
   result.push(sprite(xx-33,yy-84,70,91,c=>tree(c,xx,yy,58+(i%3)*8,j%2?'plane':'cypress',i*13+j),yy));
  }
 }
 for(const [i,[x,y,w,h]] of cottages.entries())result.push(sprite(x-12,y-33,w+52,h+48,c=>house(c,{x,y:y+h,w,h:h+5+(i%2)*9,kind:'house'}),y+h));
 for(const a of cityStalls)result.push(sprite(a.x-6,a.y-49,a.w+14,56,c=>stand(c,a),a.y));
 for(const [x,y,w] of walls)result.push(sprite(x-2,y-25,w+4,33,c=>{
  stone(c,x,y-19,w,24,seed(x));rect(c,x,y-21,w,3,'#b09e79');for(let i=0;i<w-7;i+=18)rect(c,x+i,y-25,9,5,'#dccba4')
 },y));
 for(const [x,y] of gates)for(const dir of [-1,1]){
  const xx=x+dir*37;result.push(sprite(xx-14,y-62,28,70,c=>{
   stone(c,xx-9,y-35,18,39,seed(xx));arch(c,xx-4,y-30,8,15,'#6d7966');
   poly(c,[[xx-13,y-35],[xx,y-56],[xx+13,y-35]],'#61766c');rect(c,xx-1,y-61,2,6,'#b99755');rect(c,xx-12,y-36,24,3,'#aaa888');
  },y+4));
 }
 const trees=Array.from({length:8},(_,i)=>sprite(0,0,70,90,c=>tree(c,35,80,41+i*4,i%3?'plane':'cypress',730+i)));
 for(const [x,y,i] of groves){const treeSprite=trees[i];result.push({x:x-35,y:y-80,w:70,h:90,depth:y,draw(c){c.save();c.translate(x-35,y-80);treeSprite.draw(c);c.restore()}})}
 for(const m of monuments){
  const {x,y,w,h}=m,front=y+h;
  result.push(sprite(x-12,front-132,w+25,146,c=>{
   if(m.id==='tower'){
    stone(c,x,front-71,w,71,seed(162));rect(c,x-3,front-72,w+6,6,'#967d61');
    for(let i=4;i<w-2;i+=9)arch(c,x+i,front-63,5,13,'#596b60');
    poly(c,[[x-5,front-73],[x+w/2,front-124],[x+w+5,front-73]],'#5c726c');
   }else{building(c,x,front-59,w,3,1,seed(61));rect(c,x+w,front-79,6,79,'#c5b796');poly(c,[[x+w-2,front-79],[x+w+3,front-107],[x+w+8,front-79]],'#5b7569')}
  },front));
 }
 for(const [index,y] of [-1780,-1130,790,410].entries()){
  const side=index===3?1:0,x=shores(y)[side],start=x+(side?-77:-18);
  result.push(sprite(start-5,y-14,105,45,c=>{
   for(let i=0;i<97;i+=7){rect(c,start+i,y,6,19,i%3?'#a18559':'#b09667')}
   for(const i of [0,35,90]){rect(c,start+i,y-5,3,10,'#725a3d');rect(c,start+i,y+15,3,11,'#796043')}
  },y+14));
 }
 return result;
}
function lot(c,b,job){
 const {x,y,w,h}=b;
 rect(c,x,y,w,h,'#acaa77');
 for(let a=x+5;a<x+w-2;a+=14){rect(c,a,y,2,6,'#9a7951');rect(c,a,y+h-4,2,6,'#9a7951')}
 if(job){stone(c,x+14,y+13,w-28,5+Math.floor(job.progress*.22),seed(252));for(let i=0;i<4;i++)rect(c,x+8+i*9,y+h-18,18,3,'#8d6c48')}
}
export class Renderer{
 constructor(canvas){
  this.c=canvas.getContext('2d');this.camX=this.camY=0;this.tiles=new Map();this.scenery=scenery();
  this.facades=new Map(buildings.map(b=>[b.id,[buildingSprite(b),buildingSprite(b,true)]]));
 }
 project(clientX,clientY){
  const canvas=this.c.canvas,box=canvas.getBoundingClientRect();
  return [this.camX+(clientX-box.left)*canvas.width/box.width,this.camY+(clientY-box.top)*canvas.height/box.height];
 }
 render(game,t){
  const s=game.s,p=s.player,c=this.c,canvas=c.canvas,ratio=canvas.clientWidth/Math.max(1,canvas.clientHeight);
  const vw=Math.max(1,Math.min(810,Math.round(440*ratio))),vh=Math.max(1,Math.round(vw/ratio));
  if(canvas.width!==vw||canvas.height!==vh){canvas.width=vw;canvas.height=vh;c.imageSmoothingEnabled=false}
  this.camX=Math.round(Math.max(bounds[0],Math.min(bounds[2]-vw,p.x-vw/2)));
  this.camY=Math.round(Math.max(bounds[1],Math.min(bounds[3]-vh,p.y-vh*.57)));
  const l=this.camX,u=this.camY,right=l+vw,bottom=u+vh,inView=(x,y,w,h)=>x+w>=l&&x<=right&&y+h>=u&&y<=bottom;
  c.setTransform(1,0,0,1,-l,-u);
  for(let y=Math.floor(u/tileSize);y<=Math.floor(bottom/tileSize);y++)for(let x=Math.floor(l/tileSize);x<=Math.floor(right/tileSize);x++){
   const key=x+','+y;let tile=this.tiles.get(key);
   if(tile)this.tiles.delete(key);else tile=terrainTile(x,y);
   this.tiles.set(key,tile);c.drawImage(tile,x*tileSize,y*tileSize);
  }
  while(this.tiles.size>80)this.tiles.delete(this.tiles.keys().next().value);
  const items=this.scenery.filter(o=>inView(o.x,o.y,o.w,o.h));
  const overlay=(depth,draw)=>items.push({depth,draw});
  const hide=new Set();
  for(const b of buildings){
   if(!inView(b.x-18,b.y-62,b.w+52,b.h+83))continue;
   if(parcels[b.id]?.build&&!isOpen(b.id,s)){lot(c,b,s.estate[b.id]);continue}
   const cut=isOpen(b.id,s)&&((p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.front)||(Math.abs(p.x-b.cx)<22&&p.y>=b.front&&p.y<b.front+13));
   if(!cut)hide.add(b.id);
   items.push(this.facades.get(b.id)[cut?1:0]);
  }
  for(const f of [pool,gardenPool])if(inView(f[0]-65,f[1]-45,130,80))overlay(f[1]+7,c=>fountain(c,f,t));
  if(game.active('plant'))for(const [x,y,w,h] of gardens.slice(0,4))for(let i=12;i<w-10;i+=7)oval(c,x+i,y+h-10,2,2,'#ad5753');
  if(game.active('meal'))overlay(352,c=>{rect(c,491,341,48,8,'#8c6643');for(let i=0;i<4;i++)oval(c,497+i*10,342,4,2,'#d6bc91')});
  for(const n of s.npcs)if(inView(n.x-30,n.y-48,64,59)&&!hide.has(n.room))overlay(n.y,c=>drawResident(c,n,game,t));
  const h=s.life.horse;
  if(!s.life.mounted&&!hide.has(h.room)&&inView(h.x-24,h.y-35,55,43))overlay(h.y,c=>horse(c,h.x,h.y,h.face,false,t));
  overlay(p.y,c=>{
   const {x,y}=p,atSea=water(x,y);
   if(atSea)boat(c,x,y,'#eed9ab');
   else{if(s.life.mounted)horse(c,x,y,p.face,p.moving,t);person(c,x,y-(s.life.mounted?12:0),'#9d332e',p.face,p.moving&&!s.life.mounted,t,'sultan')}
   const yy=y-(s.life.mounted?57:atSea?37:46);poly(c,[[x-3,yy-3],[x+3,yy-3],[x,yy]],'#fff1c5');
  });
  if(game.motion.length){const [x,y]=game.motion.at(-1);c.strokeStyle='#fff0c0';c.lineWidth=1;c.beginPath();c.ellipse(x,y,6,3,0,0,Math.PI*2);c.stroke()}
  for(const item of items.sort((a,b)=>a.depth-b.depth))item.draw(c);
  const hour=s.minutes/60%24,shade=hour<5||hour>=20?.43:hour<7?(7-hour)*.15:Math.max(0,(hour-17)*.14);
  if(shade){c.fillStyle='rgba(26,40,76,'+shade+')';c.fillRect(l,u,vw,vh)}
  c.setTransform(1,0,0,1,0,0);
 }
}
