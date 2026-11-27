import {rect,poly,oval,seed,tree,star} from './art.js?v=6';
import {houses,stalls} from './district.js?v=6';

function road(c,points,size,color){
 c.strokeStyle=color;c.lineWidth=size;c.lineCap='round';c.lineJoin='round';c.beginPath();
 points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
}
export function landscape(c){
 const rand=seed(9187),W=c.canvas.width,H=c.canvas.height;
 rect(c,0,0,W,H,'#929351');
 for(let i=0;i<75000;i++){
  const x=rand()*W,y=rand()*H;
  rect(c,x,y,1+rand()*5,1+rand()*2,['#9e9d5e','#a6a260','#7a8952','#879456'][i%4]);
 }
 const lanes=[[[380,320],[770,342],[946,302],[1179,308],[1514,340]],[[470,373],[404,520],[434,657],[550,740],[933,759],[1440,758]],[[985,280],[968,414],[959,560],[1050,743]],[[1365,290],[1369,504],[1429,640],[1432,770]]];
 for(const l of lanes){road(c,l,91,'#a79a69');road(c,l,84,'#cfbb8a');road(c,l,69,'#d8c494')}
 // Worn cart tracks and plants are seeded once per location.
 for(let i=0;i<21000;i++){const x=rand()*W,y=rand()*815;rect(c,x,y,1+rand()*3,1,'#746b4320')}
 rect(c,0,791,W,30,'#bcae81');for(let j=0;j<4;j++)for(let i=-10;i<W;i+=17){rect(c,i+(j%2)*8,793+j*6,15,5,j%2?'#d5c7a0':'#cbbc91')}
 rect(c,0,817,W,H-817,'#4d8889');for(let i=0;i<2100;i++){const y=818+rand()*105,x=rand()*W;rect(c,x,y,2+rand()*13,1,i%2?'#70a8a1':'#407b7d')}
 for(let x=1360;x<1450;x+=8){rect(c,x,802,7,96,'#9c7a52');rect(c,x,802,1,96,'#b59768')}
 for(let y=805;y<=895;y+=24){rect(c,1357,y,5,7,'#665539');rect(c,1449,y,5,7,'#665539')}
 for(const [x,y] of [[1309,853],[1510,840],[550,846]]){poly(c,[[x-43,y],[x-30,y+14],[x+27,y+15],[x+48,y-2],[x+24,y+4],[x-29,y+3]],'#664b34');rect(c,x,y-39,2,46,'#705d43');poly(c,[[x-1,y-37],[x-1,y-4],[x-28,y-6]],'#e2ceb0')}
}
export function house(c,h){
 const {x,y,w,h:height,kind}=h,roof=y-height;
 poly(c,[[x-2,y-10],[x+w,y-10],[x+w+22,y+10],[x+16,y+12]],'#414e3840');
 rect(c,x,y-height,w,height,'#ceb994');rect(c,x+5,roof+7,w-10,height-9,kind==='stable'?'#b49368':'#e0cba4');
 for(let i=3;i<w;i+=20){rect(c,x+i,roof+3,3,height-3,'#80674b')}
 for(let i=0;i<3;i++)rect(c,x,roof+i*height/3,w,2,'#9d8059');
 for(let i=12;i<w-13;i+=26){
  rect(c,x+i,roof+12,12,16,'#836e50');rect(c,x+i+2,roof+14,8,12,'#4f6358');rect(c,x+i+6,roof+14,1,12,'#c4ae85');rect(c,x+i+2,roof+20,8,1,'#c4ae85');
 }
 rect(c,x+w*.37,y-25,w*.25,25,kind==='stable'?'#534c38':'#806247');rect(c,x+w*.47,y-24,2,24,'#a7895f');
 poly(c,[[x-8,roof+1],[x+11,roof-21],[x+w-4,roof-21],[x+w+9,roof+1]],'#945b43');
 for(let row=0;row<4;row++){const dx=8-row*4;for(let i=0;i<w+row*4;i+=7){rect(c,x+dx+i,roof-19+row*5,5,2,i%3?'#bc7d53':'#a96c4a')}}
 rect(c,x-7,roof+1,w+16,4,'#775a40');rect(c,x+4,y-2,w-8,3,'#9f916e');
}
function stand(c,s){
 const {x,y,w,color,kind}=s;
 rect(c,x+1,y-32,3,34,'#674f36');rect(c,x+w-4,y-32,3,34,'#674f36');
 rect(c,x-1,y-11,w+2,12,'#956b44');rect(c,x-2,y-12,w+4,2,'#dab886');
 for(let i=3;i<w-3;i+=7){
  if(kind==='cloth'){rect(c,x+i,y-16,6,4,['#ac6145','#748375','#c2a35d'][i%3]);rect(c,x+i+1,y-15,4,1,'#e1bf89')}
  else{oval(c,x+i,y-14,3,2,kind==='fruit'?'#aa523b':kind==='bread'?'#deb172':'#d9ca9e');rect(c,x+i-1,y-15,2,1,'#efd5a3')}
 }
 poly(c,[[x-4,y-31],[x+2,y-43],[x+w-2,y-43],[x+w+5,y-31]],color);
 for(let i=3;i<w;i+=12)poly(c,[[x+i,y-42],[x+i+5,y-42],[x+i+4,y-30],[x+i-2,y-30]],'#e4cfaa');
 rect(c,x-4,y-31,w+9,2,'#786544');for(let i=-3;i<w+4;i+=6)rect(c,x+i,y-29,5,3,(i+3)%12?color:'#e4cfaa');
}
function bundle(c,x,y){oval(c,x,y,9,3,'#77704c');poly(c,[[x-7,y],[x-8,y-8],[x-3,y-15],[x-4,y-18],[x+4,y-18],[x+3,y-14],[x+8,y-8],[x+7,y]],'#c6aa74');rect(c,x-3,y-15,7,2,'#87724d');rect(c,x-5,y-7,2,5,'#dbc08b')}
export function carriedSack(c,x,y){bundle(c,x,y)}
function sprite(y,x,w,h,paint){
 const cvs=document.createElement('canvas');cvs.width=w;cvs.height=h;
 const ctx=cvs.getContext('2d');ctx.translate(-x,-(y-h+12));paint(ctx);
 return {y,draw:c=>c.drawImage(cvs,x,y-h+12)};
}
export function streetObjects(){
 const list=houses.map(h=>sprite(h.y,h.x-12,h.w+46,h.h+46,c=>house(c,h)));
 for(const s of stalls)list.push(sprite(s.y,s.x-5,s.w+12,60,c=>stand(c,s)));
 for(const [x,y] of [[1421,740],[1432,729],[1445,739],[1399,735]])list.push(sprite(y,x-11,23,36,c=>bundle(c,x,y)));
 const groups=[[31,507,9],[552,508,8],[326,676,5],[830,481,7],[1027,631,4],[1513,461,6],[812,93,9],[1090,99,11],[1322,110,9],[19,716,8]];
 for(const [sx,sy,count] of groups){const r=seed(sx*sy);
  for(let i=0;i<count;i++){const x=sx+r()*97,y=sy+r()*40,h=43+r()*47;
   list.push(sprite(y,x-44,90,112,c=>tree(c,x,y,h,i%4?'plane':'cypress',Math.floor(r()*90000))))}
 }
 return list;
}
export function horse(c,x,y,face,moving,t){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(face||1,1);
 oval(c,0,0,19,4,'#3e493452');const step=moving?Math.sin(t*11)*3:0;
 for(const [lx,walk] of [[-13,step],[-8,-step],[8,-step],[13,step]]){poly(c,[[lx-2,-13],[lx+2,-13],[lx+walk+1,-2],[lx+walk-2,-1]],'#86775f');rect(c,lx+walk-2,-2,4,2,'#4d4737')}
 oval(c,0,-16,16,7,'#c4b798');oval(c,-2,-18,13,5,'#d7c9aa');
 poly(c,[[9,-18],[13,-31],[18,-34],[23,-29],[27,-26],[26,-22],[20,-22],[18,-16],[14,-12]],'#cbbd9e');
 poly(c,[[9,-19],[12,-30],[17,-33],[19,-32],[15,-26],[13,-17]],'#8d8068');poly(c,[[17,-32],[17,-38],[21,-32]],'#a89a80');rect(c,20,-29,2,2,'#413f32');
 poly(c,[[-14,-21],[-19,-18],[-22,-5],[-18,-7],[-15,-15]],'#9c8b6a');
 rect(c,-6,-22,14,7,'#964e3a');rect(c,-5,-16,12,1,'#deb06e');star(c,0,-18,2,'#e8c985');c.restore();
}
