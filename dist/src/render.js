import {rooms,WIDTH as W,HEIGHT as H} from './data.js';
import {seed,rect,poly,oval,star,arch,stone,palace,bed,tree,fountain,person} from './art.js';
function layer(){const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;return canvas.getContext('2d')}
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
 for(let i=15;i<w-8;i+=25){if(council){rect(c,x+i,y+2,12,8,'#e9d7ad');rect(c,x+i+2,y+4,8,1,'#988669')}else{oval(c,x+i,y+8,8,6,'#6c5842');oval(c,x+i,y+6,7,4,'#c79458');oval(c,x+i,y+5,5,3,'#a97446')}}});
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
 const c=layer(),r=seed(key==='court'?1520:758);const room=rooms[key],drawables=[];
 if(room.type==='inside')inside(c,key,r);else{
 outdoor(c,key,r);
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
export class Renderer{
 constructor(canvas){this.c=canvas.getContext('2d');canvas.width=W;canvas.height=H;this.cache=new Map();this.c.imageSmoothingEnabled=false}
 render(game,t){
 const {s}=game,p=s.player,key=p.room,room=rooms[key],c=this.c;
 if(!this.cache.has(key))this.cache.set(key,scenery(key));
 const scene=this.cache.get(key);c.drawImage(scene.base,0,0);
 if(key==='garden'&&game.active('plant'))for(const [x,y,w,h] of room.beds)for(let i=0;i<w-30;i+=7){rect(c,x+12+i,y+h-18,1,5,'#436b46');oval(c,x+12+i,y+h-19,2,2,'#b65655')}
 if(key==='court'&&game.active('meal')){rect(c,491,341,48,8,'#8c6643');rect(c,493,349,3,5,'#68523b');rect(c,533,349,3,5,'#68523b');for(let i=0;i<4;i++)oval(c,497+i*10,342,4,2,'#d6bc91')}
 const items=scene.drawables.slice();
 if(room.fountain)items.push({y:room.fountain[1]+8,draw:ctx=>fountain(ctx,room.fountain,t)});
 for(const n of s.npcs.filter(n=>n.room===key))items.push({y:n.y,draw:ctx=>person(ctx,n.x,n.y,game.note(n).color,n.face,n.moving,t+n.id.length,n.id)});
 items.push({y:p.y,draw:ctx=>{
 const a=p.x,b=p.y;oval(ctx,a,b,15,5,'#f7da81');oval(ctx,a,b,13,4,'#a4956b');oval(ctx,a,b,11,3,'#d6c29b');person(ctx,a,b,'#a04b3e',p.face,p.moving,t,'sultan');
 const x=Math.round(a),y=Math.round(b)-43;poly(ctx,[[x-4,y-4],[x+4,y-4],[x,y]],'#66512e');poly(ctx,[[x-3,y-4],[x+3,y-4],[x,y-1]],'#f5d990')
 }});
 if(game.motion.length){const [x,y]=game.motion.at(-1);for(let i=0;i<4;i++){let a=i*Math.PI/2;rect(c,x+Math.cos(a)*6,y+Math.sin(a)*3,2,2,'#fff0c0')}}
 for(const d of items.sort((a,b)=>a.y-b.y))d.draw(c);
 if(room.type!=='inside'){for(let i=0;i<4;i++){const x=(t*(11+i)+i*199)%860-30,y=21+i*5+Math.sin(t*.7+i)*4;rect(c,x,y,2,1,'#48594e');rect(c,x+2,y+1,2,1,'#48594e');rect(c,x+4,y,2,1,'#48594e')}}
 const hour=(s.minutes/60)%24,shade=hour<5||hour>=20?.43:hour<7?(7-hour)*.15:hour>17?(hour-17)*.14:0;
 if(shade){c.fillStyle='rgba(26,40,76,'+shade+')';c.fillRect(0,0,W,H)}
 }
}
