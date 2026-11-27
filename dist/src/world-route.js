import {bounds,canStand,buildingAt} from './geography.js?v=7';
import {coffeeOpen} from './city.js?v=7';

const step=16,cols=Math.ceil((bounds[2]-bounds[0])/step)+1;
const point=id=>[bounds[0]+(id%cols)*step,bounds[1]+Math.floor(id/cols)*step];
export function clear(a,b,s){
 const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3));
 for(let k=1;k<=n;k++)if(!canStand(a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n,s))return false;
 return true;
}
let signature='',edges=new Map();
function neighbors(id,s){
 if(edges.has(id))return edges.get(id);
 const out=[],a=point(id);
 for(const dx of [-1,0,1])for(const dy of [-1,0,1]){
  if(!dx&&!dy)continue;
  const key=id+dx+cols*dy,b=point(key);
  if(Math.abs(b[0]-a[0])<=step&&clear(a,b,s))out.push([key,Math.hypot(dx,dy)*step]);
 }
 edges.set(id,out);return out;
}
export const mapRevision=s=>(coffeeOpen(s.minutes)?1:0)+'/'+Object.keys(s.estate).filter(k=>s.estate[k].status==='owned').sort().join('/');
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
function search(start,end,s){
 if(!canStand(...end,s))return [];
 if(clear(start,end,s))return [end];
 const revision=mapRevision(s);if(revision!==signature){signature=revision;edges.clear()}
 const open=new Frontier(),cost=new Map(),parent=new Map();
 function offer(id,g,from){
  if(g>=(cost.get(id)??Infinity))return;
  const a=point(id);cost.set(id,g);parent.set(id,from);
  open.add({id,g,score:g+1.35*Math.hypot(a[0]-end[0],a[1]-end[1])});
 }
 const sx=Math.round((start[0]-bounds[0])/step),sy=Math.round((start[1]-bounds[1])/step);
 for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
  const id=sx+i+(sy+j)*cols,b=point(id);if(clear(start,b,s))offer(id,Math.hypot(b[0]-start[0],b[1]-start[1]),null);
 }
 while(open.heap.length){
  const {id,g}=open.pop();if(g!==cost.get(id))continue;
  const a=point(id);
  if(Math.hypot(a[0]-end[0],a[1]-end[1])<=step*1.7&&clear(a,end,s)){
   const line=[end];for(let v=id;v!==null;v=parent.get(v))line.push(point(v));
   line.reverse();const result=[];let from=start;
   for(let i=0;i<line.length;){let j=i;while(j+1<line.length&&clear(from,line[j+1],s))j++;result.push(line[j]);from=line[j];i=j+1}
   return result;
  }
  for(const [n,d] of neighbors(id,s))offer(n,g+d,id);
 }
 return [];
}

export function worldRoute(start,end,s){
 if(!canStand(...end,s))return [];
 const origin=buildingAt(...start,s),dest=buildingAt(...end,s);
 if(origin===dest||clear(start,end,s))return search(start,end,s);
 const stops=[];
 if(origin)stops.push([origin.cx,origin.front-7],[origin.cx,origin.front+7]);
 if(dest)stops.push([dest.cx,dest.front+7],[dest.cx,dest.front-7]);
 stops.push(end);
 let from=start;
 const result=[];
 for(const to of stops){
  const part=search(from,to,s);
  if(!part.length)return search(start,end,s);
  result.push(...part);from=to;
 }
 return result;
}
