import {clear} from './world-route.js?v=8';

const priority=n=>n.duty==='courier'?3:n.duty==='escort'?2:n.duty==='routine'?0:1;
// Only pedestrians in neighbouring cells need to negotiate the same stretch of road.
export function manageTraffic(s){
 const cells=new Map();
 for(const n of s.npcs){
  if(!n.moving||!n.path.length||n.reaction)continue;
  const [gx,gy]=n.path[0],length=Math.hypot(gx-n.x,gy-n.y);
  if(length<9)continue;
  const vx=(gx-n.x)/length,vy=(gy-n.y)/length,ix=Math.floor(n.x/24),iy=Math.floor(n.y/24);
  for(let i=ix-1;i<=ix+1;i++)for(let j=iy-1;j<=iy+1;j++){
   for(const other of cells.get(i+','+j)||[]){
    const a=other.n,dx=a.x-n.x,dy=a.y-n.y;
    if(n.room!==a.room||dx*dx+dy*dy>24**2||vx*other.vx+vy*other.vy>-.3||dx*vx+dy*vy<0||Math.abs(dx*vy-dy*vx)>8)continue;
    if((a.yieldAfter||0)>s.minutes||(n.yieldAfter||0)>s.minutes)continue;
    const lower=priority(a)===priority(n)?(a.id<n.id?n:a):priority(a)>priority(n)?n:a;
    const ux=lower===n?vx:other.vx,uy=lower===n?vy:other.vy;
    for(const side of [1,-1]){
     const step=[lower.x+uy*side*9,lower.y-ux*side*9];
     if(clear([lower.x,lower.y],step,s)&&clear(step,lower.path[0],s)){lower.path.unshift(step);break}
    }
    lower.yieldUntil=s.minutes+.3;lower.yieldAfter=s.minutes+4;
   }
  }
  const key=ix+','+iy;if(!cells.has(key))cells.set(key,[]);cells.get(key).push({n,vx,vy});
 }
}
