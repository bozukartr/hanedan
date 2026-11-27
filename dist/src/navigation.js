import {rooms} from './data.js?v=6';
import {terrainBlocked} from './district.js?v=6';
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
// The district geometry is static. Cache legal grid edges across commuters.
const graphs=new Map();
const stride=256,step=12;
const gridPoint=id=>[(id%stride)*step,Math.floor(id/stride)*step];
function neighbours(room,id){
 if(!graphs.has(room))graphs.set(room,new Map());
 const graph=graphs.get(room);
 if(graph.has(id))return graph.get(id);
 const from=gridPoint(id),edges=[];
 for(const dx of [-1,0,1])for(const dy of [-1,0,1]){
  if(!dx&&!dy)continue;
  const next=id+dx+dy*stride;
  if(clear(room,from,gridPoint(next)))edges.push([next,step*Math.hypot(dx,dy)]);
 }
 graph.set(id,edges);return edges;
}
class Frontier{
 constructor(){this.heap=[]}
 add(node){
  const a=this.heap;let i=a.length;a.push(node);
  while(i){const parent=(i-1)>>1;if(a[parent].score<=node.score)break;a[i]=a[parent];i=parent}
  a[i]=node;
 }
 pop(){
  const a=this.heap,first=a[0],last=a.pop();
  if(!a.length)return first;
  let i=0;
  while(2*i+1<a.length){
   let child=2*i+1;if(child+1<a.length&&a[child+1].score<a[child].score)child++;
   if(a[child].score>=last.score)break;a[i]=a[child];i=child;
  }
  a[i]=last;return first;
 }
}
export function path(room,start,end){
 if(!walkable(room,...end))return [];
 if(clear(room,start,end))return [end];
 const open=new Frontier(),costs=new Map(),prev=new Map(),ax=Math.round(start[0]/step),ay=Math.round(start[1]/step);
 function offer(id,cost,parent){
  if(cost>=(costs.get(id)??Infinity))return;
  const [x,y]=gridPoint(id);costs.set(id,cost);prev.set(id,parent);
  open.add({id,cost,score:cost+Math.hypot(x-end[0],y-end[1])});
 }
 for(let y=ay-1;y<=ay+1;y++)for(let x=ax-1;x<=ax+1;x++){
  const id=x+y*stride,p=gridPoint(id);
  if(clear(room,start,p))offer(id,Math.hypot(p[0]-start[0],p[1]-start[1]),null);
 }
 while(open.heap.length){
  const {id,cost}=open.pop();if(cost!==costs.get(id))continue;
  const a=gridPoint(id);
  if(Math.hypot(a[0]-end[0],a[1]-end[1])<22&&clear(room,a,end)){
   const route=[end];
   for(let node=id;node!==null;node=prev.get(node))route.push(gridPoint(node));
   route.reverse();const smooth=[];let from=start;
   for(let i=0;i<route.length;){let j=i;while(j+1<route.length&&clear(room,from,route[j+1]))j++;from=route[j];smooth.push(from);i=j+1}
   return smooth;
  }
  for(const [next,length] of neighbours(room,id))offer(next,cost+length,id);
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

export function nearbyGround(room,x,y){
 if(walkable(room,x,y))return [x,y];
 for(let r=4;r<=48;r+=4)for(let a=0;a<8;a++){
  const nx=x+r*Math.cos(a*Math.PI/4),ny=y+r*Math.sin(a*Math.PI/4);
  if(walkable(room,nx,ny))return [nx,ny];
 }
}
