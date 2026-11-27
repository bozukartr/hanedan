import {rooms} from './data.js?v=7';
import {stalls} from './district.js?v=7';
import {premises} from './premises.js?v=7';
import {venues,parcels,coffeeOpen} from './city.js?v=7';

export const bounds=[-1380,-2260,3450,1270];
const zones={
 court:[0,0,1],enderun:[65,-245,.7],garden:[92,-505,.65],
 tahtakale:[-1300,35,.85],galata:[-520,-1560,.9],bogaz:[85,-2230,.93],uskudar:[2070,-470,.90]
};
export const buildings=[];
function building(id,parent,x,y,w,h){
 const [ox,oy,k]=zones[parent],cx=ox+x*k,front=oy+y*k;
 buildings.push({id,parent,x:cx-w/2,y:front-h,w,h,cx,front,name:rooms[id].name});
}
building('council','court',190,180,190,100);
building('kitchen','court',710,180,194,109);
for(const [id,,x,y] of premises)building(id,'court',x,y, id==='barracks'?162:124,id==='barracks'?88:75);
for(const [id,[,parent,x,y]] of Object.entries(venues))building(id,parent,x,y,130,80);
for(const [id,p] of Object.entries(parcels))building(id,p.room,p.x,p.y,133,78);
export const structure=Object.fromEntries(buildings.map(b=>[b.id,b]));
export const gardenPool=[353,-317,30,15];
export const gardens=[[117,-402,134,47],[432,-402,134,47],[117,-283,134,48],[432,-283,134,48],[20,205,158,83],[619,205,160,83],[22,369,145,85],[635,369,142,85]];
export const pool=[400,281,45,22];
export function shores(y){return [1620+83*Math.sin(y/510),2070+118*Math.sin((y+130)/568)]}
export function horn(x){return -850+Math.sin(x/690)*125}
export function water(x,y){
 const [a,b]=shores(y);
 return (x>a&&x<b)||(x<a&&Math.abs(y-horn(x))<Math.min(120,Math.max(0,(x+1270)*.095)));
}
export const roads=[
 [[-1180,345],[-740,396],[-225,392],[38,492],[395,460],[400,342],[400,171],[399,48],[397,-227]],
 [[397,345],[802,326],[970,410],[1375,412],[1430,752],[1600,801]],
 [[395,460],[403,610],[398,725],[754,757],[1130,758],[1430,753]],
 [[-740,396],[-825,-200],[-757,-674],[-635,-1040],[-292,-1130],[178,-1164],[690,-1140],[1470,-990]],
 [[152,-1165],[346,-1440],[792,-1695],[1335,-1710],[1484,-2010]],
 [[2250,834],[2420,540],[2610,235],[2510,-115],[2640,-470],[2560,-783]],
 [[802,326],[904,244],[1418,244]],[[802,326],[1075,540],[1315,558],[1430,753]]
];
// A spatial index lets local steering and long routes use identical walls.
const bins=new Map(),unit=128;
function register(o,x,y,w,h){
 for(let a=Math.floor(x/unit);a<=Math.floor((x+w)/unit);a++)
 for(let b=Math.floor(y/unit);b<=Math.floor((y+h)/unit);b++){
  const key=a+','+b,list=bins.get(key)||[];list.push(o);bins.set(key,list);
 }
}
for(const b of buildings)register(b,b.x-3,b.y-3,b.w+6,b.h+6);
export const gates=[[400,460,340],[400,704,340],[401,165,155]];
export const walls=[
 ...gates.slice(0,2).flatMap(([x,y,w])=>[[x-w,y,w-34,5],[x+34,y,w-34,5]]),
 [285,165,82,5],[435,165,178,5]
];
export const cityStalls=[...stalls];
for(let i=0;i<9;i++){
 const [ox,oy,k]=zones.tahtakale,x=ox+(160+110*i)*k,y=oy+(387+(i%3)*18)*k;
 cityStalls.push({x,y,w:38,kind:i%2?'fruit':'cloth',color:['#97563d','#5b827b','#ab844c'][i%3]});
}
export const monuments=[
 {id:'tower',x:-265,y:-1432,w:46,h:26},
 {id:'mescit',x:2230,y:-205,w:64,h:34}
];
for(const m of monuments){const rect=[m.x,m.y,m.w,m.h];register({rect},...rect)}
for(const s of cityStalls){const rect=[s.x,s.y-12,s.w,14];register({rect},...rect)}

export const cottages=[];
for(const id of ['tahtakale','galata','uskudar','bogaz']){
 const [ox,oy,k]=zones[id];
 for(const [i,[x,y]] of rooms[id].blocks.entries()){
  const cx=ox+x*k,front=oy+y*k,w=59+(i%3)*7,h=34+(i%2)*10;
  if(water(cx,front)||buildings.some(b=>Math.abs(b.cx-cx)<(b.w+w)/2+16&&front>=b.y-12&&front-h<=b.front+12))continue;
  const rect=[cx-w/2,front-h,w,h];cottages.push(rect);register({rect},...rect);
 }
}
for(const rect of [...gardens,...walls])register({rect},...rect);
for(const [x,y,w,h] of [pool,gardenPool])register({pool:[x,y,w+3,h+2]},x-w-3,y-h-2,w*2+6,h*2+4);
export function isOpen(id,s){
 if(id==='kahve')return coffeeOpen(s?.minutes??480);
 return !parcels[id]||s?.estate?.[id]?.status==='owned';
}
function emptyLot(b,s){return parcels[b.id]?.build&&s?.estate?.[b.id]?.status!=='owned'}
const at=(x,y)=>bins.get(Math.floor(x/unit)+','+Math.floor(y/unit))||[];
export function canStand(x,y,s){
 if(!Number.isFinite(x+y)||x<bounds[0]+4||y<bounds[1]+4||x>bounds[2]-4||y>bounds[3]-4)return false;
 for(const o of at(x,y)){
  if(o.rect){const [a,b,w,h]=o.rect;if(x>=a&&x<=a+w&&y>=b&&y<=b+h)return false;continue}
  if(o.pool){const [cx,cy,w,h]=o.pool;if(((x-cx)/w)**2+((y-cy)/h)**2<1)return false;continue}
  if(emptyLot(o,s)||x<o.x||y<o.y||x>o.x+o.w||y>o.front)continue;
  if(!isOpen(o.id,s)||x<o.x+4||x>o.x+o.w-4||y<o.y+4||(y>o.front-4&&Math.abs(x-o.cx)>18))return false;
 }
 return true;
}
// A completed building can put a new wall across an occupied spot.
export function settle(actor,s){
 if(!Number.isFinite(actor.x+actor.y))return false;
 if(canStand(actor.x,actor.y,s))return true;
 for(let radius=1;radius<=96;radius+=2){
  for(let i=0;i<16;i++){
   const angle=i*Math.PI/8,x=actor.x+Math.cos(angle)*radius,y=actor.y+Math.sin(angle)*radius;
   if(canStand(x,y,s)){actor.x=x;actor.y=y;actor.room=locationAt(x,y,s);return true}
  }
 }
 return false;
}
export function buildingAt(x,y,s){
 return at(x,y).find(o=>o.id&&!emptyLot(o,s)&&x>o.x&&x<o.x+o.w&&y>o.y&&y<o.front);
}
export function locationAt(x,y,s){
 const b=buildingAt(x,y,s);if(b)return b.id;
 if(water(x,y))return 'strait';
 if(x>shores(y)[1])return 'uskudar';
 if(y<horn(x))return y<-1510?'bogaz':'galata';
 if(x<0)return 'tahtakale';
 if(x<780&&y< -135)return 'garden';
 if(x<780&&y<164)return 'enderun';
 return 'court';
}
// Pocket groves on the hills and along the shores leave the streets and palace clear.
export const groves=[];
const nearRoad=(x,y)=>roads.some(road=>road.slice(1).some(([bx,by],i)=>{
 const [ax,ay]=road[i],dx=bx-ax,dy=by-ay;
 const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
 return Math.hypot(x-ax-t*dx,y-ay-t*dy)<48;
}));
let random=1520;
function sample(){random=(Math.imul(random,1664525)+1013904223)>>>0;return random/4294967296}
for(let i=0;i<150;i++){
 const cx=bounds[0]+90+sample()*(bounds[2]-bounds[0]-180),cy=bounds[1]+90+sample()*(bounds[3]-bounds[1]-180);
 for(let j=0;j<4;j++){
  const x=Math.round(cx+sample()*90),y=Math.round(cy+sample()*65);
  if((x>0&&x<1530&&y>-520&&y<820)||water(x,y)||!canStand(x,y)||buildingAt(x,y)||nearRoad(x,y))continue;
  groves.push([x,y,i%8]);const rect=[x-2,y-3,4,5];register({rect},...rect);
 }
}
const converted=new Map();
export function worldPoint(id,x,y){
 const key=id+','+x+','+y;
 if(converted.has(key))return converted.get(key);
 let p;const b=structure[id];
 if(b){const [l,t,r,bt]=rooms[id].bounds;
  p=[b.x+9+(x-l)/(r-l)*(b.w-18),b.y+8+(y-t)/(bt-t)*(b.h-17)];
 }else if(id==='strait'){
  const yy=-2060+(y-45)*3.36,[l,r]=shores(yy);p=[l+12+(x-155)/1180*(r-l-24),yy];
 }else {
  const [ox,oy,k]=zones[id];p=[ox+x*k,oy+y*k];
  // Legacy outdoor workstations stay in the street beside their new footprint.
  const hit=at(...p).find(o=>o.id&&p[0]>=o.x-1&&p[0]<=o.x+o.w+1&&p[1]>=o.y-1&&p[1]<=o.front+1);
  if(hit)p=[p[0],hit.front+7];
  if(!canStand(...p)){outer:for(let r=4;r<=80;r+=4)for(let a=0;a<8;a++){
   const xx=p[0]+r*Math.cos(a*Math.PI/4),yy=p[1]+r*Math.sin(a*Math.PI/4);
   if(canStand(xx,yy)&&!buildingAt(xx,yy)){p=[xx,yy];break outer}
  }}
 }
 converted.set(key,p);return p;
}
export function landmark(id){
 if(id==='strait')return worldPoint(id,720,490);
 if(structure[id])return [structure[id].cx,structure[id].front-14];
 const center={court:[400,350],garden:[400,320],enderun:[480,320],tahtakale:[695,456],galata:[605,464],uskudar:[642,470],bogaz:[643,570]};
 return worldPoint(id,...center[id]);
}
