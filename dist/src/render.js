import {boat,drawQuarter,drawProperty,localSigns,palaceApproach} from './city-art.js?v=6';
import {rooms,WIDTH as W,HEIGHT as H} from './data.js?v=6';
import {seed,rect,poly,oval,star,arch,stone,palace,bed,tree,fountain,person} from './art.js?v=6';
import {outerWidth,outerHeight} from './district.js?v=6';
import {landscape,streetObjects,horse,carriedSack} from './istanbul-art.js?v=6';
function layer(w=W,h=H){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;return canvas.getContext('2d')}
function floor(c,r){
 rect(c,0,0,W,H,'#c8b996');
 const colors=['#d6c59e','#d6c49d','#d4c39b','#d3c19b','#d9c8a2','#d3bf98','#d7c5a1'];
 for(let y=0;y<H;y+=7){let x=-r()*29;while(x<W){let w=17+Math.floor(r()*23);rect(c,x,y,w-1,6,colors[Math.floor(r()*colors.length)]);rect(c,x+2,y+1,w/3,1,'#e4d4af77');if(r()>.65)rect(c,x+4,y+3,2,1,'#ae9e7f66');x+=w}}
}
function sky(c,r){
 rect(c,0,0,W,112,'#a3bbb0');for(let i=0;i<30;i++){const x=r()*W,y=r()*32;rect(c,x,y,r()*35+10,2,'#c1ccba')}
 for(let i=0;i<76;i++){let x=i*12,y=29+r()*17;rect(c,x,y,13,45,'#91a18b');poly(c,[[x-1,y],[x+6,y-5],[x+14,y]],'#869b8a')}
 for(let i=0;i<65;i++){let x=i*13+r()*8,h=31+r()*33;tree(c,x,72+r()*10,h,i%3?'cypress':'plane',320+i)}
}
function bench(c,x,y){oval(c,x+8,y+1,23,4,'#3c4b3044');for(const a of [-15,12])rect(c,x+a,y-4,4,7,'#6a624c');rect(c,x-20,y-5,39,3,'#81704f');rect(c,x-20,y-7,39,2,'#ae9269');rect(c,x-19,y-13,2,8,'#796346');rect(c,x+16,y-13,2,8,'#796346');rect(c,x-19,y-13,38,3,'#a78b5e')}
function carpet(c,x,y,w,h){rect(c,x,y,w,h,'#6e4439');rect(c,x+3,y+3,w-6,h-6,'#cdab78');rect(c,x+6,y+6,w-12,h-12,'#a35f4b');for(let j=10;j<h-9;j+=10)for(let i=10;i<w-9;i+=12)star(c,x+i,y+j,3,'#c99e67');rect(c,x+w*.22,y+h*.22,w*.56,h*.56,'#965847');star(c,x+w*.5,y+h*.5,h*.26,'#d4ac70');star(c,x+w*.5,y+h*.5,h*.17,'#667e70')}
function inside(c,key,r){
 const council=key==='council';floor(c,r);stone(c,0,0,W,149,r,['#b8a784','#cfbb95','#c5b18d','#baa984']);rect(c,0,0,W,27,'#625d45');
 for(let i=0;i<820;i+=34){rect(c,i,0,4,29,'#9b7850');arch(c,i+6,26,25,21,'#92947b');arch(c,i+9,29,19,18,'#58766c')}
 for(let i=0;i<6;i++){let x=52+i*127;arch(c,x,50,57,82,'#978660');arch(c,x+3,54,51,78,'#e0c69b');arch(c,x+7,58,43,74,council?'#577f7a':'#524c3f');
 for(let j=0;j<5;j++)rect(c,x+12+j*7,73,2,57,'#aeae8e');for(let j=0;j<6;j++)rect(c,x+8,77+j*10,40,2,'#a3a88c')}
 rect(c,0,138,W,12,'#718c7b');for(let x=0;x<W;x+=9)star(c,x,144,4,'#c9c6a0');rect(c,0,151,W,4,'#8b7c60');
 carpet(c,235,177,330,192);if(!council){rect(c,235,177,330,192,'#cdba92');for(let j=0;j<19;j++)for(let i=0;i<16;i++)rect(c,236+i*20+(j%2)*9,178+j*10,18,8,'#d3bf98')}
 rooms[key].beds.forEach(([x,y,w,h])=>{rect(c,x+4,y+3,w,h,'#716a524f');rect(c,x,y-5,w,h+5,'#775638');rect(c,x+1,y-6,w-2,h-1,'#a18055');for(let i=4;i<h-3;i+=6)rect(c,x+2,y-6+i,w-4,1,'#8b6c49');
 for(let i=15;i<w-8;i+=25){if(rooms[key].interior){const surface=rooms[key].interior;
 const shade={bunk:'#a46b51',cloth:'#61908b',metal:'#7a8a85',paper:'#e2cea4',tack:'#846544',hide:'#a27957',cargo:'#bb9a62'}[surface];
 rect(c,x+i-4,y,17,10,shade);rect(c,x+i+2,y+1,2,9,'#d4c49c');}
 else if(council){rect(c,x+i,y+2,12,8,'#e9d7ad');rect(c,x+i+2,y+4,8,1,'#988669')}else{oval(c,x+i,y+8,8,6,'#6c5842');oval(c,x+i,y+6,7,4,'#c79458');oval(c,x+i,y+5,5,3,'#a97446')}}});
 if(key==='arz'||key==='has'){
  carpet(c,168,174,455,195);rect(c,316,234,169,48,'#865538');
  for(const x of [315,479])rect(c,x,167,5,99,'#bd9e64');
  poly(c,[[296,174],[328,149],[466,149],[503,174]],'#7c4943');rect(c,328,235,143,15,'#b78561');
 }
 if(key==='tavern'||key==='han'||key==='kahve'){
  for(const x of [105,589]){rect(c,x,215,94,9,'#795d40');for(let i=0;i<4;i++)oval(c,x+10+i*22,213,4,3,'#c3aa7e')}
  oval(c,281,326,17,6,'#93764c');rect(c,276,327,4,9,'#69563d');
 }
 if(key==='mosqueLand'){for(let j=0;j<3;j++)carpet(c,118,170+j*66,560,56);arch(c,375,59,50,83,'#638371')}
 rect(c,0,446,344,34,'#68654e');rect(c,456,446,344,34,'#68654e');carpet(c,355,398,90,82);
}
function outdoor(c,key,r){
 floor(c,r);sky(c,r);
 if(key==='court')palace(c,r);else{
 stone(c,0,76,W,44,r);rect(c,0,74,W,4,'#a69c7c');rect(c,0,118,W,4,'#887d60');
 for(let x=0;x<W;x+=24){rect(c,x,69,13,7,'#c9b796');rect(c,x,67,13,2,'#e1d0a9')}
 stone(c,362,55,76,66,r);arch(c,374,65,51,56,'#927e5e');arch(c,379,71,42,51,'#445744');rect(c,357,54,86,5,'#8e8e71');
 }
 rooms[key].beds.forEach(b=>bed(c,b,r));for(let y=180;y<H;y+=20){for(const x of [190,602]){rect(c,x,y,4,12,'#b9ab89');rect(c,x+1,y+1,2,10,'#dcccac')}}
 if(key==='court'){for(let x=200;x<603;x+=18){rect(c,x,324,13,2,'#b7a784');rect(c,x,327,13,1,'#e7d3aa')}
 for(let yy=233;yy<335;yy+=2)for(let xx=337;xx<464;xx+=2){const d=((xx-400)/63)**2+((yy-281)/43)**2;if(d>.94&&d<1.06)rect(c,xx,yy,2,2,'#b2a482')}
 }
}
function scenery(key){
 const courtyard=key==='court';
 const c=layer(rooms[key].width??(courtyard?outerWidth:W),rooms[key].height??(courtyard?outerHeight:H)),r=seed(key==='court'?1520:758);const room=rooms[key],drawables=[];
 if(room.type==='city')drawQuarter(c,key);else if(room.type==='inside')inside(c,key,r);else{
 if(courtyard){landscape(c);drawables.push(...streetObjects())}
 outdoor(c,key,r);if(courtyard)palaceApproach(c);
 room.beds.forEach(([x,y,w,h],j)=>{
 for(let i=0;i<(key==='garden'?5:3);i++){
  const xx=x+16+i*(w-30)/(key==='garden'?4:2), yy=y+21+(i%2)*23+(j>1?7:0);
  const kind=i%3===1?'plane':'cypress',height=(kind==='plane'?48:64)+(j>1?9:0)+r()*16;
  const spr=document.createElement('canvas');spr.width=98;spr.height=110;tree(spr.getContext('2d'),48,105,height,kind,j*63+i+4);
  drawables.push({y:yy,draw:ctx=>ctx.drawImage(spr,Math.round(xx)-48,Math.round(yy)-105)});
 }
 bench(c,x+w*.5,y+h-1);
 });
 }
 return {base:c.canvas,drawables};
}
function drawResident(ctx,n,game,t){
 if(n.room==='strait'){boat(ctx,n.x,n.y,'#decba5');return}
 const d=game.note(n),plan=d.plan,phase=t+(plan?.seed??n.id.length)*.713;
 const working=plan&&n.duty==='routine'&&n.work.period==='work'&&!n.moving&&n.work.leg==='bench'&&n.work.progress>0&&n.room===plan.bench.room&&Math.hypot(n.x-plan.bench.point[0],n.y-plan.bench.point[1])<4;
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
export class Renderer{
 project(clientX,clientY){
  const canvas=this.c.canvas,box=canvas.getBoundingClientRect();
  return [this.camX+(clientX-box.left)*canvas.width/box.width,this.camY+(clientY-box.top)*canvas.height/box.height];
 }
 constructor(canvas){this.camX=0;this.camY=0;this.c=canvas.getContext('2d');canvas.width=W;canvas.height=H;this.cache=new Map();this.c.imageSmoothingEnabled=false}
 render(game,t){
 const {s}=game,p=s.player,key=p.room,room=rooms[key],c=this.c;
 if(!this.cache.has(key))this.cache.set(key,scenery(key));
 const scene=this.cache.get(key), canvas=c.canvas;
 const ratio=canvas.clientWidth/Math.max(1,canvas.clientHeight);
 const vw=Math.min(780,Math.round(440*ratio)),vh=Math.min(scene.base.height,Math.round(vw/ratio));
 if(canvas.width!==vw||canvas.height!==vh){canvas.width=vw;canvas.height=vh;c.imageSmoothingEnabled=false}
 this.camX=Math.round(Math.max(0,Math.min(scene.base.width-vw,p.x-vw/2)));
 this.camY=Math.round(Math.max(0,Math.min(scene.base.height-vh,p.y-vh*.56)));
 c.setTransform(1,0,0,1,-this.camX,-this.camY);c.drawImage(scene.base,0,0);
 if(room.type==='city'){drawProperty(c,key,s);localSigns(c,key,s)}
 
 if(key==='garden'&&game.active('plant'))for(const [x,y,w,h] of room.beds)for(let i=0;i<w-30;i+=7){rect(c,x+12+i,y+h-18,1,5,'#436b46');oval(c,x+12+i,y+h-19,2,2,'#b65655')}
 if(key==='court'&&game.active('meal')){rect(c,491,341,48,8,'#8c6643');rect(c,493,349,3,5,'#68523b');rect(c,533,349,3,5,'#68523b');for(let i=0;i<4;i++)oval(c,497+i*10,342,4,2,'#d6bc91')}
 const items=scene.drawables.filter(item=>item.y>=this.camY-15&&item.y<this.camY+vh+110);
 const l=s.life,steed=l.horse;
 if(!l.mounted&&steed.room===key)items.push({y:steed.y,draw:ctx=>horse(ctx,steed.x,steed.y,steed.face,false,t)});
 
 if(room.fountain)items.push({y:room.fountain[1]+8,draw:ctx=>fountain(ctx,room.fountain,t)});
 for(const n of s.npcs.filter(n=>n.room===key&&n.x>this.camX-12&&n.x<this.camX+vw+12&&n.y>this.camY-8&&n.y<this.camY+vh+48))items.push({y:n.y,draw:ctx=>drawResident(ctx,n,game,t)});
 items.push({y:p.y,draw:ctx=>{
 const a=p.x,b=p.y;
 if(key==='strait'){boat(ctx,a,b,'#eed9ab');return}
 if(l.mounted)horse(ctx,a,b,p.face,p.moving,t);
 person(ctx,a,b-(l.mounted?12:0),'#9d332e',p.face,p.moving&&!l.mounted,t,'sultan');
 if(l.cargo)carriedSack(ctx,a-6*p.face,b-13);
 const yy=b-(l.mounted?57:46);
 poly(ctx,[[a-3,yy-3],[a+3,yy-3],[a,yy]],'#f9e8ba');

 }});
 if(game.motion.length){const [x,y]=game.motion.at(-1);for(let i=0;i<4;i++){let a=i*Math.PI/2;rect(c,x+Math.cos(a)*6,y+Math.sin(a)*3,2,2,'#fff0c0')}}
 for(const d of items.sort((a,b)=>a.y-b.y))d.draw(c);
 if(room.type!=='inside'){for(let i=0;i<4;i++){const x=(t*(11+i)+i*199)%860-30,y=21+i*5+Math.sin(t*.7+i)*4;rect(c,x,y,2,1,'#48594e');rect(c,x+2,y+1,2,1,'#48594e');rect(c,x+4,y,2,1,'#48594e')}}
 const hour=(s.minutes/60)%24,shade=hour<5||hour>=20?.43:hour<7?(7-hour)*.15:hour>17?(hour-17)*.14:0;
 if(shade){c.fillStyle='rgba(26,40,76,'+shade+')';c.fillRect(this.camX,this.camY,vw,vh)}
 if(game.pin?.room===key){
  const {x,y}=game.pin;c.strokeStyle='#a34533';c.lineWidth=2;c.beginPath();c.moveTo(x-4,y-4);c.lineTo(x+4,y+4);c.moveTo(x+4,y-4);c.lineTo(x-4,y+4);c.stroke()
 }
 const near=game.nearby();
 if(near){const y=near.y-(near.kind==='npc'||near.item.id==='horse'?47:26);
  rect(c,near.x-4,y-5,9,9,'#574331');rect(c,near.x-3,y-4,7,7,'#e5c88a');c.fillStyle='#4a3826';c.font='bold 7px monospace';c.textAlign='center';c.fillText('E',Math.round(near.x)+.5,Math.round(y)+2)
 }
 c.setTransform(1,0,0,1,0,0);
 }
}
