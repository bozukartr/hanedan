import {manageTraffic} from './foot-traffic.js?v=8';
import {household,attendants,encounter,followFormation,carryReport,dispatchReports} from './protocol.js?v=8';
import {parcels} from './city.js?v=8';
import {tickEstate,constructionPost} from './estate.js?v=8';
import {worldPoint,canStand,locationAt,water,settle} from './geography.js?v=8';
import {worldRoute,mapRevision,clear} from './world-route.js?v=8';
import {routineSite,period,jobTravel} from './daylife.js?v=8';
import {newStores,occupation,shift,workshop} from './work.js?v=8';
import {treasuryOffice,tickOrders} from './council.js?v=8';
import {people as cast,personnel} from './roster.js?v=8';
import {rooms,orders} from './data.js?v=8';
import {travel} from './navigation.js?v=8';
import {initialLife, targets, moveSpeed, updateNeeds, dismount} from './life.js?v=8';
const SAVE='hanedan.saray.v1';
export function fresh(){
 return {version:2,household:household(),estate:{},priority:{},stores:newStores(),office:treasuryOffice(),life:initialLife(),minutes:480,player:{room:'court',x:391,y:220,face:1},gold:12400,esteem:72,peace:81,
 events:[{time:480,text:'Sultan Süleyman Divan Meydanı’na çıktı.'}],issued:{},lastGrant:-1,
 npcs:cast.map((d,i)=>{
  // Open the day with staggered commutes; inventories remain untouched until pickup.
  const place=d.plan?(period(d.plan,480)==='rest'?d.plan.bed:[d.plan.source,d.plan.bench,d.plan.receiver,d.plan.meal][i%4]):{room:d.home,point:d.start};
  const [x,y]=worldPoint(place.room,...place.point);
  return {id:d.id,room:locationAt(x,y),x,y,face:i%2?-1:1,
   work:{progress:0,cycles:0,last:null,status:'Mesaiye hazırlanıyor'},point:0,wait:d.plan?(i%7)*.09:3+(i%11)*2,path:[],duty:'routine',until:0};
 }),sound:false};
}
export function restore(raw){
 const initial=fresh();if(!raw)return initial;
 try{const v=JSON.parse(raw);
 if(!v.player||!Array.isArray(v.npcs)||![1,2].includes(v.version))return initial;
 const actors=[v.player,v.life?.horse,...v.npcs].filter(Boolean);
 if(v.version===1){
  for(const actor of actors){
   if(!rooms[actor.room]||!Number.isFinite(actor.x+actor.y))continue;
   [actor.x,actor.y]=worldPoint(actor.room,actor.x,actor.y);
   if(actor.goal&&rooms[actor.goalRoom])actor.goal=worldPoint(actor.goalRoom,...actor.goal);
  }
  for(const [id,job] of Object.entries(v.estate??{}))if(parcels[id]&&job.status==='building'){
   for(const [i,who] of job.crew.entries()){
    const n=v.npcs.find(n=>n.id===who);if(n)n.goal=worldPoint(parcels[id].room,...constructionPost(id,i));
   }
  }
  v.version=2;
 }
 for(const actor of actors){
  if(!Number.isFinite(actor.x+actor.y))continue;
  actor.room=locationAt(actor.x,actor.y,v);
 }
 if(!settle(v.player,v))return initial;
 for(const k of ['gold','esteem','peace','minutes'])if(!Number.isFinite(v[k])||v[k]<0)return initial;
 if(!Array.isArray(v.npcs)||!Array.isArray(v.events)||!v.issued)return initial;
 return {...initial,...v,household:{...household(),...v.household},stores:{...initial.stores,...v.stores},life:{...initial.life,...v.life,cargo:false,horse:{...initial.life.horse,...v.life?.horse}},events:v.events.filter(e=>typeof e.text==='string'&&Number.isFinite(e.time)).slice(-100),npcs:initial.npcs.map(n=>{
 const a=v.npcs.find(x=>x.id===n.id);
 return a&&rooms[a.room]&&Number.isFinite(a.x+a.y)&&settle(a,v)?{...n,...a,path:[],wait:0}:n})};
 }catch{return initial}
}
export class Palace {
 constructor(state=fresh()){this.s=state;this.retinue=attendants(state);this.trafficAt=0;this.routes=new Map();this.revision=mapRevision(state);this.systems=new Map();this.motion=[];this.target=null}
 register(name,system){if(this.systems.has(name))throw Error('Sistem zaten kayıtlı');this.systems.set(name,system)}
 emit(type,payload){for(const sys of this.systems.values())sys.event?.(type,payload,this)}
 log(text){this.s.events.push({time:this.s.minutes,text});this.s.events=this.s.events.slice(-100);this.emit('record',text)}
 note(n){return personnel.get(n.id)}
 active(id){return (this.s.issued[id]??-1)>this.s.minutes}
 order(id){
 const d=orders.find(x=>x.id===id);if(!d||this.active(id)||d.cost>this.s.gold)return false;
 this.s.gold-=d.cost;this.s.esteem=Math.min(100,this.s.esteem+d.esteem);this.s.peace=Math.min(100,this.s.peace+d.peace);
 this.s.issued[id]=this.s.minutes+(id==='plant'?1440:240);
 const tasks={meal:[['cook','court',515,355]],watch:[['guard','court',300,202]],council:[['scribe','council',495,272],['lala','council',298,272],['vizier','council',400,290]],plant:[['gardener','garden',292,200]]};
 for(const [who,room,x,y] of tasks[id])this.assign(this.s.npcs.find(a=>a.id===who),id,room,[x,y],this.s.issued[id]);
 this.log('Ferman mühürlendi: '+d.name+'.');this.emit('decree',id);return true;
 }
 assign(n,duty,room,goal,until){delete n.reaction;delete n.yieldUntil;Object.assign(n,{duty,goalRoom:room,goal:worldPoint(room,...goal),until,path:[],wait:0,point:0})}
 escort(n){if(['mandate','supervise','construction','courier'].includes(n.duty))return; if(n.duty==='escort'){this.routine(n);this.log(n.id==='guard'?'Muhafız nöbetine döndü.':'Refakat sona erdi.');return}
 this.assign(n,'escort',n.room,[400,330],Number.MAX_SAFE_INTEGER);n.goal=[this.s.player.x,this.s.player.y];this.log(this.note(n).name+' maiyete katıldı.')}
 routine(n){const d=this.note(n);n.work.status='İş yerine dönüyor';this.assign(n,'routine',d.home,d.start,0)}
 moveTo(x,y,target=null){
  this.motion=worldRoute([this.s.player.x,this.s.player.y],[x,y],this.s);
  this.target=this.motion.length?target:null;return !!this.motion.length;
 }
 nearby(){const p=this.s.player;
  return [...targets(this.s).map(e=>({kind:'place',item:e,x:e.x,y:e.y})),...this.s.npcs.map(n=>({kind:'npc',item:n,x:n.x,y:n.y}))]
   .map(a=>({...a,d:Math.hypot(a.x-p.x,a.y-p.y)})).filter(a=>a.d<=26&&clear([p.x,p.y],[a.x,a.y],this.s)).sort((a,b)=>a.d-b.d)[0];
 }
 tick(dt,dx=0,dy=0,run=false){
 const s=this.s,p=s.player,day=Math.floor(s.minutes/1440);const lastDry=[p.x,p.y];s.minutes+=dt*1.3;p.moving=false;
 if(Math.floor(s.minutes/1440)>day){for(const a of Object.values(s.office.accounts))a.levies=Math.max(0,Math.min(12,a.levies+2));s.gold+=360;this.log('Günlük saray tahsisatı hazineye girdi: 360 akçe.')}
 if(dx||dy){this.motion=[];this.target=null;const len=Math.hypot(dx,dy),step=dt*moveSpeed(s.life,run)/len;
 const steps=Math.max(1,Math.ceil(Math.hypot(dx*step,dy*step)/3));
 for(let i=0;i<steps;i++){
  if(dx&&canStand(p.x+dx*step/steps,p.y,s)){p.x+=dx*step/steps;p.moving=true}
  if(dy&&canStand(p.x,p.y+dy*step/steps,s)){p.y+=dy*step/steps;p.moving=true}
 }
 p.heading=Math.atan2(dx,-dy);if(dx)p.face=Math.sign(dx);
 }else if(this.motion.length){p.path=this.motion;const [gx,gy]=p.path[0];p.heading=Math.atan2(gx-p.x,p.y-gy);travel(p,dt,moveSpeed(s.life,false))}
 p.room=locationAt(p.x,p.y,s);
 if(s.life.mounted&&water(p.x,p.y))dismount(this,lastDry);
 updateNeeds(s,dt,run);
 if(s.minutes>=this.trafficAt){manageTraffic(s);this.trafficAt=s.minutes+.45}
 this.retinue=attendants(s);dispatchReports(this);
 for(const n of s.npcs){this.tickNPC(n,dt);if(n.moving)n.room=locationAt(n.x,n.y,s)}
 tickOrders(this);tickEstate(this,dt);
 const revision=mapRevision(s);if(this.revision!==revision){this.revision=revision;this.routes.clear();this.motion=[];this.target=null;for(const n of s.npcs){n.path=[];settle(n,s)}settle(p,s);settle(s.life.horse,s)}

 for(const sys of this.systems.values())sys.tick?.(dt,this);
 }
 tickNPC(n,dt){
 const p=this.s.player,d=this.note(n);n.moving=false;
 if(n.duty!=='routine'&&n.duty!=='escort'&&n.until<=this.s.minutes)this.routine(n);
 if(n.yieldUntil>this.s.minutes)return;
 if(n.duty==='courier'){carryReport(this,n,dt);return}
 if(n.duty==='escort'){followFormation(this,n,dt);return}
 if(n.duty==='routine'){
  if(encounter(this,n,d,dt))return;
  if(d.plan){this.tickTrade(n,d,dt);return}
  const leisure=period(d.socialPlan,this.s.minutes);
  if(leisure==='visit'||leisure==='leave'){this.tickTrade(n,d,dt);return}
  if(n.work.period){delete n.work.period;n.path=[];n.wait=0}
 }
 if(n.path.length){travel(n,dt,48);return}
 n.wait-=dt;if(n.wait>0)return;
 const hour=Math.floor(this.s.minutes/60)%24;
 const room=n.duty==='routine'?(hour>=19||hour<6?(['lala','guard','scribe'].includes(n.id)?'council':d.home):d.home):n.goalRoom;
 let goal=n.goal;
 if(n.duty==='routine'&&!shift(n,this.s.minutes)){
 goal=occupation(n,d,this.s,dt);
 if(goal)n.path=this.route(n,...goal);
 return;
 }
 if(n.duty==='routine'&&hour===12){
 const today=Math.floor(this.s.minutes/1440);
 if(n.work.mealDay!==today){
 const food=this.s.stores.meals>0?'meals':this.s.stores.bread>0?'bread':null;
 if(food){this.s.stores[food]--;n.work.mealDay=today}
 }
 return;
 }
 if(n.duty==='routine'){goal=worldPoint(room,...(room===d.home?d.start:[250+d.start[0]%300,345]));if(Math.hypot(n.x-goal[0],n.y-goal[1])<3)return}
 else if(n.duty==='watch'){goal=worldPoint('court',...[[230,185],[559,184],[575,405],[220,400]][n.point++%4]);n.wait=1}
 else n.wait=3;
 if(goal)n.path=this.route(n,...goal);
 }
 tickTrade(n,d,dt){
 const s=this.s,w=n.work,plan=d.plan??d.socialPlan,when=period(plan,s.minutes);
 if(when!==w.period){w.period=when;n.path=[];n.wait=0}
 const site=routineSite(d,n,s.minutes,s.estate),leg=w.leg||'source';
 const walking=when==='rest'?'İkametine dönüyor':when==='break'?'Yemek molasına gidiyor':when==='leave'?'İzin gününde gezintiye çıktı':when==='visit'?'İş çıkışı buluşmaya gidiyor':jobTravel(d,leg);
 if(n.path.length){w.status=walking;travel(n,dt,42+plan.seed%13);return}
 n.wait-=dt;if(n.wait>0)return;
 const stop=worldPoint(site.room,...site.point);
 if(Math.hypot(n.x-stop[0],n.y-stop[1])>2){w.status=walking;n.path=this.route(n,...stop);return}
 if(when==='rest'){w.status='İkametinde dinleniyor';n.wait=2;return}
 if(when==='visit'||when==='leave'){
  const neighbour=s.npcs.find(other=>other!==n&&other.room===n.room&&['leave','visit'].includes(other.work.period)&&!other.moving&&Math.hypot(other.x-n.x,other.y-n.y)<38);
  if(neighbour){n.face=Math.sign(neighbour.x-n.x)||n.face;w.status=this.note(neighbour).name+' ile sohbet ediyor'}
  else w.status=when==='leave'?'İzin gününde dinleniyor':'İş çıkışı dinleniyor';
  n.wait=2;return;
 }
 if(when==='break'){
  const today=Math.floor(s.minutes/1440);
  if(w.mealDay!==today){const food=s.stores.meals?'meals':s.stores.bread?'bread':null;if(food){s.stores[food]--;w.mealDay=today}}
  w.status='Yemek molasında';n.wait=1;return
 }
 workshop(n,d,s,dt);
 }
 route(n,x,y){
  const key=[n.room,n.x,n.y,x,y].join(',');
  let route=this.routes.get(key);
  if(!route){route=worldRoute([n.x,n.y],[x,y],this.s);if(this.routes.size>6000)this.routes.clear();this.routes.set(key,route)}
  if(!route.length)n.wait=1;
  return route.slice();
 }
 save(storage){storage.setItem(SAVE,JSON.stringify(this.s,(k,v)=>k==='path'?undefined:v))}
 static load(storage){try{return new Palace(restore(storage.getItem(SAVE)))}catch{return new Palace()}}
}
