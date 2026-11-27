import {bounds,buildings,gardens,cottages,walls,groves,monuments,isOpen,landmark} from './geography.js?v=7';
import {baseMap} from './terrain.js?v=7';
import {parcels} from './city.js?v=7';
export const chartNames=[['court','Topkapı Sarayı'],['tahtakale','Tahtakale'],['galata','Galata'],['bogaz','Boğaziçi'],['uskudar','Üsküdar'],['strait','Boğaz']];
export function chart(c,game,cx,cy,scale,overview=false){
 const w=c.canvas.width,h=c.canvas.height,s=game.s;
 c.save();c.fillStyle='#989b74';c.fillRect(0,0,w,h);c.translate(w/2-cx*scale,h/2-cy*scale);c.scale(scale,scale);
 baseMap(c);
 for(const [x,y,w,h] of gardens){c.fillStyle='#667a53';c.fillRect(x,y,w,h)}
 for(const [x,y,w,h] of [...cottages,...walls]){c.fillStyle='#92795b';c.fillRect(x,y,w,h)}
 c.fillStyle='#778962';for(const [x,y] of groves)if(Math.abs(x-cx)<w/(2*scale)+12&&Math.abs(y-cy)<h/(2*scale)+12)c.fillRect(x-6,y-5,13,10);
 for(const m of monuments){c.fillStyle='#766e55';c.fillRect(m.x,m.y,m.w,m.h)}
 for(const b of buildings){
  c.fillStyle=parcels[b.id]?.build&&!isOpen(b.id,s)?'#a5a170':b.parent==='court'||b.parent==='enderun'?'#806b54':'#976b51';
  c.fillRect(b.x,b.y,b.w,b.h);c.lineWidth=1/scale;c.strokeStyle='#d8c99e';c.strokeRect(b.x,b.y,b.w,b.h);
 }
 if(!overview){c.fillStyle='#4d614a';for(const n of s.npcs)if(Math.abs(n.x-cx)<w/(scale*2)&&Math.abs(n.y-cy)<h/(scale*2))c.fillRect(n.x-2,n.y-2,4,4)}
 if(game.motion.length){
  c.strokeStyle='#8c583c';c.lineWidth=1.8/scale;c.setLineDash([4/scale,3/scale]);c.beginPath();c.moveTo(s.player.x,s.player.y);
  for(const [x,y] of game.motion)c.lineTo(x,y);c.stroke();c.setLineDash([]);
 }
 c.restore();
 const xy=(x,y)=>[(x-cx)*scale+w/2,(y-cy)*scale+h/2];
 if(overview){
  c.textAlign='center';c.font='bold 17px Georgia';c.lineWidth=4;c.strokeStyle='#e3d5ab';c.fillStyle='#2c4339';
  for(const [id,name] of chartNames){const [x,y]=xy(...landmark(id));c.strokeText(name,x,y-12);c.fillText(name,x,y-12)}
 }
 if(game.pin){const [x,y]=xy(game.pin.x,game.pin.y);c.strokeStyle='#913f2c';c.lineWidth=2;c.beginPath();c.arc(x,y,6,0,Math.PI*2);c.stroke()}
 const [x,y]=xy(s.player.x,s.player.y);
 c.save();c.translate(x,y);c.rotate(s.player.heading||0);c.beginPath();c.moveTo(0,-7);c.lineTo(5,5);c.lineTo(0,3);c.lineTo(-5,5);c.closePath();c.fillStyle='#fff2c9';c.fill();c.strokeStyle='#3c493a';c.lineWidth=1.6;c.stroke();c.restore();
}
export function overview(canvas,game){
 const [l,t,r,b]=bounds;canvas.width=800;canvas.height=Math.round(800*(b-t)/(r-l));
 const scale=canvas.width/(r-l),cx=(l+r)/2,cy=(t+b)/2;
 const draw=()=>chart(canvas.getContext('2d'),game,cx,cy,scale,true);
 function pick(e){const box=canvas.getBoundingClientRect();return [l+(e.clientX-box.left)/box.width*(r-l),t+(e.clientY-box.top)/box.height*(b-t)]}
 draw();return {draw,pick};
}
