import {houses,stalls} from './district.js?v=3';
import {rooms} from './data.js?v=3';
import {targets} from './life.js?v=3';

export function chart(c,game,cx,cy,scale){
 const w=c.canvas.width,h=c.canvas.height,p=game.s.player,r=rooms[p.room];
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#b9aa78';c.fillRect(0,0,w,h);
 c.translate(w/2,h/2);c.scale(scale,scale);c.translate(-cx,-cy);
 const box=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
 if(p.room==='court'){
  box(0,0,1600,818,'#9fa078');box(0,818,1600,102,'#7d9d9b');box(0,145,800,335,'#d1c199');
  c.strokeStyle='#ddcda4';c.lineWidth=46;
  for(const route of [[[450,348],[980,310],[1450,340]],[[395,355],[426,665],[574,748],[1460,748]],[[975,308],[970,560],[1048,747]],[[1370,330],[1429,749]]]){
   c.beginPath();route.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke()
  }
  box(0,62,800,96,'#9c8765');
  for(const h of houses)box(h.x,h.y-55,h.w,55,'#997e61');
  for(const s of stalls)box(s.x,s.y-16,s.w,16,'#a38461');
 }else box(...[0,0,800,480],'#ccbc97');
 for(const b of r.beds)box(...b,'#8c9369');
 if(r.fountain){const [x,y,a,b]=r.fountain;c.fillStyle='#77a5a0';c.beginPath();c.ellipse(x,y,a,b,0,0,Math.PI*2);c.fill()}
 const dot=(x,y,size,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,size/scale,0,Math.PI*2);c.fill()};
 for(const e of r.exits)dot(e.x,e.y,3,'#624734');
 for(const a of targets(game.s))dot(a.x,a.y,a.id==='horse'?4:2.6,a.id==='horse'?'#75412e':'#a9783d');
 for(const n of game.s.npcs.filter(n=>n.room===p.room))dot(n.x,n.y,1.7,'#3c5247');
 const pin=game.pin;if(pin&&pin.room===p.room){c.strokeStyle='#a23e2d';c.lineWidth=2/scale;c.beginPath();c.arc(pin.x,pin.y,6/scale,0,Math.PI*2);c.stroke()}
 c.translate(p.x,p.y);c.rotate(p.heading||0);c.scale(1/scale,1/scale);c.fillStyle='#fff5cc';c.strokeStyle='#3c382e';c.lineWidth=1.6;c.beginPath();c.moveTo(0,-7);c.lineTo(5,5);c.lineTo(0,3);c.lineTo(-5,5);c.closePath();c.fill();c.stroke();c.setTransform(1,0,0,1,0,0)
}
