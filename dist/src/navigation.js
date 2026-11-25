import {rooms} from './data.js';
import {terrainBlocked} from './district.js';
export function walkable(room,x,y){
 const r=rooms[room], [l,t,h,b]=r.bounds;
 if(x<l||x>h||y<t||y>b)return false;
 if(room==='court'&&terrainBlocked(x,y))return false;
 if(r.fountain){const [cx,cy,a,d]=r.fountain;if(((x-cx)/(a+4))**2+((y-cy)/(d+3))**2<1)return false}
 return !r.beds.some(([a,b,w,h])=>x>a-3&&x<a+w+3&&y>b-3&&y<b+h+3);
}
export function clear(room,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],n=Math.ceil(Math.hypot(dx,dy)/4);
 for(let i=1;i<=n;i++)if(!walkable(room,a[0]+dx*i/n,a[1]+dy*i/n))return false;
 return true;
}
export function path(room,start,end){
 if(!walkable(room,...end))return [];
 if(clear(room,start,end))return [end];
 const step=12,key=(x,y)=>x+','+y, queue=[],prev=new Map();
 const ax=Math.round(start[0]/step),ay=Math.round(start[1]/step);
 for(let y=ay-1;y<=ay+1;y++)for(let x=ax-1;x<=ax+1;x++){
  if(!clear(room,start,[x*step,y*step]))continue;
  queue.push([x,y]);prev.set(key(x,y),null);
 }
 let head=0;
 while(head<queue.length){
  const p=queue[head++],a=[p[0]*step,p[1]*step];
  if(Math.hypot(a[0]-end[0],a[1]-end[1])<22&&clear(room,a,end)){
   const route=[end];let link=p;
   while(link){route.push(link.map(n=>n*step));link=prev.get(key(...link))}
   route.reverse();const smooth=[];let from=start;
   for(let i=0;i<route.length;){let j=i;while(j+1<route.length&&clear(room,from,route[j+1]))j++;from=route[j];smooth.push(from);i=j+1}
   return smooth;
  }
  for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1],[1,1],[-1,-1],[-1,1],[1,-1]]){
   const x=p[0]+dx,y=p[1]+dy,id=key(x,y);
   if(prev.has(id)||!clear(room,a,[x*step,y*step]))continue;
   prev.set(id,p);queue.push([x,y]);
  }
 }
 return [];
}
export function travel(actor,dt,speed){
 let left=dt*speed;actor.moving=false;
 while(actor.path.length&&left>0){
  const [x,y]=actor.path[0],dx=x-actor.x,dy=y-actor.y,len=Math.hypot(dx,dy);
  actor.face=dx<-.1?-1:dx>.1?1:actor.face; actor.moving=len>.05;
  if(len<=left){actor.x=x;actor.y=y;actor.path.shift();left-=len}
  else{actor.x+=dx*left/len;actor.y+=dy*left/len;left=0}
 }
}
