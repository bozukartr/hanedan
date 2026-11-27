import {rooms} from './data.js?v=8';
import {terrainBlocked} from './district.js?v=8';
export function walkable(room,x,y){
 const r=rooms[room], [l,t,h,b]=r.bounds;
 if(x<l||x>h||y<t||y>b)return false;
 if(room==='court'&&terrainBlocked(x,y))return false;
 if(r.fountain){const [cx,cy,a,d]=r.fountain;if(((x-cx)/(a+4))**2+((y-cy)/(d+3))**2<1)return false}
 return !r.beds.some(([a,b,w,h])=>x>a-3&&x<a+w+3&&y>b-3&&y<b+h+3);
}
export function travel(actor,dt,speed){
 let left=dt*speed;actor.moving=false;
 while(actor.path.length&&left>0){
  const [x,y]=actor.path[0],dx=x-actor.x,dy=y-actor.y,len=Math.hypot(dx,dy);
  if(len>.05)actor.heading=Math.atan2(dx,-dy);
  actor.face=dx<-.1?-1:dx>.1?1:actor.face; actor.moving=len>.05;
  if(len<=left){actor.x=x;actor.y=y;actor.path.shift();left-=len}
  else{actor.x+=dx*left/len;actor.y+=dy*left/len;left=0}
 }
}
