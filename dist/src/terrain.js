import {bounds,shores,horn,roads,courtPaths} from './geography.js?v=8';
import {romanPaving} from './palace-art.js?v=8';
import {rect,poly,seed} from './art.js?v=8';

export const tileSize=256;
function trace(c,points){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
}
const [left,top,right,bottom]=bounds;
const west=[],east=[],north=[],south=[];
for(let y=top-100;y<bottom+160;y+=12){const [a,b]=shores(y);west.push([a,y]);east.push([b,y])}
for(let x=-1270;x<1770;x+=12){
 const size=Math.min(120,Math.max(0,(x+1270)*.095));
 north.push([x,horn(x)-size]);south.push([x,horn(x)+size]);
}
const waterways=[[...north,...south.reverse()],[...west,...east.reverse()]];
const courts=[[50,465,704,241],[78,-232,644,395],[92,-476,558,270]];
const urban=[
 [[-1300,205],[-160,164],[-55,409],[-220,619],[-1190,638]],
 [[-510,-1460],[642,-1440],[737,-1260],[692,-1020],[-473,-1034]],
 [[120,-2090],[1480,-2150],[1500,-1720],[650,-1580],[80,-1770]],
 [[2215,-364],[3270,-400],[3340,42],[2450,183],[2200,80]],
 [[795,116],[1510,104],[1535,790],[730,796],[771,399]]
];
export function baseMap(c){
 rect(c,left-200,top-200,right-left+400,bottom-top+400,'#929a6c');
 for(const district of urban)poly(c,district,'#bbae86');
 for(const [x,y,w,h] of courts){rect(c,x-3,y-3,w+6,h+6,'#9d9977');rect(c,x,y,w,h,'#d1c09b')}
 // The middle court has lawns between diverging ceremonial and service paths.
 poly(c,[[12,166],[793,166],[773,374],[726,451],[75,451],[18,366]],'#81926a');
 poly(c,[[53,181],[292,181],[298,208],[207,306],[58,325]],'#92a279');
 poly(c,[[491,181],[757,181],[754,319],[586,304],[508,235]],'#90a078');
 c.lineCap='round';c.lineJoin='round';
 for(const road of roads){
  trace(c,road);c.lineWidth=42;c.strokeStyle='#aca17b';c.stroke();
  c.lineWidth=35;c.strokeStyle='#d5c19a';c.stroke();
 }
 for(const lane of courtPaths){
  trace(c,lane);c.lineWidth=37;c.strokeStyle='#b7a681';c.stroke();
  c.lineWidth=33;c.strokeStyle='#d4c5a3';c.stroke();
 }
 c.fillStyle='#d7c8a6';c.beginPath();c.ellipse(400,281,76,49,0,0,Math.PI*2);c.fill();
 for(const channel of waterways){
  trace(c,channel);c.closePath();c.lineWidth=14;c.strokeStyle='#c5bd92';c.stroke();c.fillStyle='#639b99';c.fill();
  c.lineWidth=4;c.strokeStyle='#8ab1a5';c.stroke();
 }
}
export function terrainTile(tx,ty){
 const tile=document.createElement('canvas');tile.width=tile.height=tileSize;
 const c=tile.getContext('2d'),x=tx*tileSize,y=ty*tileSize;
 c.translate(-x,-y);baseMap(c);
 if(x<490&&x+tileSize>308&&y<343&&y+tileSize>223)romanPaving(c,400,281,71);
 const img=c.getImageData(0,0,tileSize,tileSize),r=seed(Math.imul(tx+200,73856093)^Math.imul(ty+200,19349663));
 for(let i=0;i<1950;i++){
  const xx=Math.floor(r()*tileSize),yy=Math.floor(r()*tileSize),k=(yy*tileSize+xx)*4,red=img.data[k];
  if(red===99){if(i%4===0)rect(c,x+xx,y+yy,3+r()*12,1,r()>.5?'#95c0b080':'#417b7970')}
  else if(red===209){
   if(yy%9===0)rect(c,x+xx,y+yy,3+r()*12,1,'#a7977565');
   else rect(c,x+xx,y+yy,1+r()*2,1,'#f7dec546');
  }else {rect(c,x+xx,y+yy,1+r()*3,1,r()>.5?'#f0daab4c':'#54634845');if([129,144,146].includes(red)&&i%7===0)rect(c,x+xx,y+yy-2,1,3,'#697e4c')}
 }
 return tile;
}
