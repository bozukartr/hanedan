import {rect,poly,oval,seed,arch,tree} from './art.js?v=6';
import {house} from './istanbul-art.js?v=6';
import {parcels,venues,coffeeOpen} from './city.js?v=6';
import {rooms} from './data.js?v=6';

function road(c,points,w,color){
 c.strokeStyle=color;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.beginPath();
 points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
}
function dome(c,x,y,w){
 oval(c,x,y,w/2,w*.28,'#526f71');rect(c,x-w/2,y,w,w*.15,'#a69474');rect(c,x-1,y-w*.31,2,6,'#cead63');
}
function pavilion(c,x,y,w,h){
 rect(c,x-w/2,y-h,w,h,'#cdb890');rect(c,x-w/2,y-h+5,w,5,'#557d78');
 for(let i=x-w/2+8;i<x+w/2-8;i+=20){arch(c,i,y-h+17,13,22,'#5e6b59');rect(c,i+6,y-h+18,1,20,'#b2a78a')}
 poly(c,[[x-w/2-9,y-h],[x-w/2+13,y-h-20],[x+w/2-13,y-h-20],[x+w/2+9,y-h]],'#607978');
 arch(c,x-10,y-24,20,24,'#65543e');
}
function gate(c,x,y,name,towers){
 rect(c,x-64,y-42,128,36,'#beab86');arch(c,x-17,y-43,34,36,'#3d4d42');rect(c,x-25,y-46,50,5,'#c4b082');
 for(const dx of [-54,54]){
  rect(c,x+dx-9,y-48,18,42,'#b7a383');
  if(towers)poly(c,[[x+dx-13,y-48],[x+dx,y-82],[x+dx+13,y-48]],'#677477');
 }
 c.fillStyle='#e9d5ab';c.fillRect(x-35,y-58,70,11);c.fillStyle='#504d3c';c.font='8px Georgia';c.textAlign='center';c.fillText(name,x,y-50);
}
export function palaceApproach(c){
 road(c,[[400,729],[408,649],[399,547],[400,459]],67,'#c8bb95');
 for(const y of [468,704]){
  for(const [x,w] of [[20,310],[470,295]]){rect(c,x,y-15,w,15,'#baac89');rect(c,x,y-18,w,4,'#d9c9a3')}
 }
 rect(c,796,161,7,295,'#b9a98a');rect(c,794,161,3,295,'#ded0aa');
 gate(c,400,468,'Bâbüsselâm',true);gate(c,400,704,'Bâb-ı Hümâyun',false);
 pavilion(c,260,574,90,44);dome(c,260,515,54);
 for(let i=0;i<5;i++)tree(c,488+(i%2)*32,502+i*35,36+i%3*4,'cypress',i+65);
}
export function boat(c,x,y,tint){
 poly(c,[[x-28,y],[x-19,y+8],[x+16,y+8],[x+32,y-2],[x+8,y+2]],'#604b33');rect(c,x,y-29,2,32,'#6d573b');
 poly(c,[[x-1,y-29],[x-2,y-2],[x-20,y-5]],tint);
}
export function drawQuarter(c,key){
 const q=rooms[key],w=q.width,h=q.height,r=seed(1520+key.length*31);
 if(key==='strait'){
  rect(c,0,0,w,h,'#548e91');
  for(let i=0;i<14000;i++)rect(c,r()*w,r()*h,3+r()*20,1,i%3?'#adceba55':'#3b787b70');
  for(const x of [0,w-143]){
   rect(c,x,0,143,h,'#8e9d73');
   for(let n=0;n<20;n++){const xx=x+10+r()*64,yy=n*50;tree(c,xx,yy,30+r()*26,'cypress',n);if(n%3===0)house(c,{x:xx,y:yy+35,w:47,h:31,kind:'house'})}
  }
  for(const e of q.exits){const left=e.x<w/2;rect(c,left?132:e.x,e.y-8,left?e.x-124:w-125-e.x,17,'#aa8d63');
   c.font='11px Georgia';c.fillStyle='#213b34';c.textAlign='center';c.fillText(e.label,e.x,e.y-13)}
  return;
 }
 const palace=key==='enderun';rect(c,0,0,w,h,palace?'#8b9a6e':'#a9a677');
 for(let i=0;i<w*h/45;i++)rect(c,r()*w,r()*h,2+r()*3,1,i%2?'#d4c99655':'#687c5355');
 if(palace){
  road(c,[[480,580],[480,180]],85,'#d5c5a1');road(c,[[125,230],[820,230]],54,'#d2c3a0');
  rect(c,0,85,w,52,'#bfad8f');gate(c,480,155,'Hasbahçe',false);
  for(const x of [240,676])for(let i=0;i<5;i++)tree(c,x+(i%2)*21,190+i*65,49+i*2,'cypress',i+20);
 }else{
  const line=[[45,527],[325,426],[680,455],[1030,437],[w-36,494]];
  road(c,line,65,'#a28e69');road(c,line,59,'#d4bf92');road(c,[[270,585],[w-60,585]],57,'#d6c59e');
  for(const x of [280,640,1090])road(c,[[x-63,215],[x,435],[x+42,614]],32,'#d1bc90');
  for(let i=0;i<15;i++){
   const x=38+i*(w-90)/15,y=143+Math.sin(i*2)*20,sz=45+r()*26;
   house(c,{x,y,w:sz,h:35+r()*21,kind:'house'});
  }
  for(const [x,y] of q.blocks){house(c,{x,y,w:86,h:57,kind:'house'})}
  for(let i=0;i<12;i++)tree(c,30+i*107,176+(i%3)*12,26+r()*25,i%2?'plane':'cypress',70+i);
  if(key==='tahtakale'){
   for(let i=0;i<10;i++){
    const x=180+100*i,y=392+(i%3)*18;
    rect(c,x,y-13,46,14,'#9a7551');rect(c,x,y-35,2,28,'#72573d');rect(c,x+43,y-35,2,28,'#72573d');
    const tint=['#ad654c','#568779','#bb955b'][i%3];
    poly(c,[[x-3,y-25],[x+5,y-38],[x+37,y-38],[x+49,y-25]],tint);
    for(let j=0;j<5;j++)oval(c,x+5+j*8,y-14,4,2,i%2?'#bf9a62':'#a36347');
   }
  }
  if(key==='bogaz'){
   for(let i=0;i<24;i++)tree(c,70+i*59,279+Math.sin(i*1.4)*41,43+r()*28,i%4?'plane':'cypress',90+i);
   for(const x of [440,550,1030]){rect(c,x-12,606,23,68,'#a48660');for(let y=609;y<675;y+=7)rect(c,x-12,y,23,1,'#d1b68e')}
  }
  if(key==='uskudar'){
   pavilion(c,233,327,88,41);dome(c,233,268,63);rect(c,286,236,6,87,'#d2c7a8');
   poly(c,[[283,237],[289,210],[294,237]],'#677a77');
   for(const x of [369,395,450,1050]){rect(c,x,608,15,9,'#ba9864');rect(c,x+3,608,3,9,'#876c4d')}
  }
  if(key==='galata'){rect(c,290,61,42,78,'#a79a7e');poly(c,[[284,66],[310,7],[339,66]],'#596e6c');for(let j=0;j<4;j++)arch(c,295+9*j,75,5,11,'#586153')}
  rect(c,0,640,w,h-640,'#4e8e92');for(let i=0;i<1800;i++)rect(c,r()*w,644+r()*(h-644),r()*18+2,1,'#9ac5b34f');
  for(const x of [418,632,1104,1280]){rect(c,x-15,623,30,60,'#987852');for(let j=0;j<9;j++)rect(c,x-15,625+j*6,30,1,'#cfab7d');boat(c,x+44,683,'#ebdab0')}
 }
 for(const [id,[name,zone,x,y]] of Object.entries(venues)){
  if(zone!==key)continue;
  if(palace)pavilion(c,x,y-6,128,54);else house(c,{x:x-60,y:y-8,w:120,h:65,kind:'house'});
 }
}
export function drawProperty(c,key,s){
 for(const [id,p] of Object.entries(parcels)){
  if(p.room!==key)continue;
  const status=s.estate[id]?.status,x=p.x,y=p.y-8;
  if(p.build&&status!=='owned'){
   rect(c,x-50,y-30,100,30,status?'#b39a75':'#8d9a64');for(const dx of [-48,48])rect(c,x+dx,y-34,3,35,'#876344');
   if(status){for(let i=0;i<4;i++)rect(c,x-39+i*23,y-26,5,27,'#876a48');rect(c,x-42,y-30,87,5,'#a78960')}
  }else if(p.kind==='mosque'){
   pavilion(c,x,y,82,39);dome(c,x,y-57,61);rect(c,x+45,y-70,6,70,'#d3c49b');poly(c,[[x+43,y-70],[x+48,y-95],[x+53,y-70]],'#6c7772');
  }else house(c,{x:x-51,y,w:102,h:p.kind==='yali'?59:42,kind:'house'});
 }
}
export function localSigns(c,key,s){
 const signs=Object.entries(venues).filter(([,v])=>v[1]===key).map(([id,[name,,x,y]])=>[id==='kahve'&&!coffeeOpen(s.minutes)?'Şerbetçi tezgâhı':name,x,y]);
 for(const [id,p] of Object.entries(parcels))if(p.room===key)signs.push([p.build&&s.estate[id]?.status==='owned'?rooms[id].name:p.name,p.x,p.y]);
 for(const [name,x,y] of signs){c.font='9px Georgia';c.textAlign='center';const w=c.measureText(name).width+10;rect(c,x-w/2,y-14,w,12,'#34483bea');c.fillStyle='#f0d9ac';c.fillText(name,x,y-5)}
}
