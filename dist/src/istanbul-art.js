import {rect,poly,oval,star} from './art.js?v=8';
export function house(c,h){
 const {x,y,w,h:height,kind}=h,roof=y-height;
 const roofColor=kind==='bogaz'||kind==='oldYali'?'#5e726b':kind==='galata'?'#7e5342':'#945b43';
 poly(c,[[x-2,y-10],[x+w,y-10],[x+w+22,y+10],[x+16,y+12]],'#414e3840');
 rect(c,x,y-height,w,height,'#ceb994');rect(c,x+5,roof+7,w-10,height-9,kind==='stable'?'#b49368':kind==='galata'?'#baab96':kind==='uskudar'?'#d3bf95':'#e0cba4');
 for(let i=3;i<w;i+=20){rect(c,x+i,roof+3,3,height-3,'#80674b')}
 for(let i=0;i<3;i++)rect(c,x,roof+i*height/3,w,2,'#9d8059');
 for(let i=12;i<w-13;i+=26){
  rect(c,x+i,roof+12,12,16,'#836e50');rect(c,x+i+2,roof+14,8,12,'#4f6358');rect(c,x+i+6,roof+14,1,12,'#c4ae85');rect(c,x+i+2,roof+20,8,1,'#c4ae85');
 }
 rect(c,x+w*.37,y-25,w*.25,25,kind==='stable'?'#534c38':'#806247');rect(c,x+w*.47,y-24,2,24,'#a7895f');
 poly(c,[[x-8,roof+1],[x+11,roof-21],[x+w-4,roof-21],[x+w+9,roof+1]],roofColor);
 for(let row=0;row<4;row++){const dx=8-row*4;for(let i=0;i<w+row*4;i+=7){rect(c,x+dx+i,roof-19+row*5,5,2,roofColor==='#5e726b'?(i%3?'#84958a':'#70847b'):i%3?'#bc7d53':'#a96c4a')}}
 rect(c,x-7,roof+1,w+16,4,'#775a40');rect(c,x+4,y-2,w-8,3,'#9f916e');
 if(['oldYali','yalıLand','uskudar'].includes(kind)){
  const bx=x+w*.17,bw=w*.66;rect(c,bx-3,roof+4,bw+6,20,'#795c49');rect(c,bx,roof+5,bw,17,'#cdbb97');
  for(let i=4;i<bw-7;i+=11){rect(c,bx+i,roof+7,7,12,'#425c5b');rect(c,bx+i+3,roof+7,1,12,'#babea3')}
  poly(c,[[bx-7,roof+4],[bx+3,roof-3],[bx+bw-2,roof-3],[bx+bw+7,roof+4]],roofColor);
 }
}
export function stand(c,s){
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
