import {tickEstate} from './estate.js?v=6';
import {inPalaceWall} from './district.js?v=6';
import {openExit} from './city.js?v=6';
import {routineSite,period,jobTravel} from './daylife.js?v=6';
import {newStores,occupation,shift,workshop} from './work.js?v=6';
import {treasuryOffice,tickOrders} from './council.js?v=6';
import {people as cast,personnel} from './roster.js?v=6';
import {rooms,orders,nextExit} from './data.js?v=6';
import {path,travel,walkable,nearbyGround} from './navigation.js?v=6';
import {initialLife, targets, moveSpeed, updateNeeds, dismount} from './life.js?v=6';
const SAVE='hanedan.saray.v1';
export function fresh(){
 return {version:1,estate:{},priority:{},stores:newStores(),office:treasuryOffice(),life:initialLife(),minutes:480,player:{room:'court',x:391,y:220,face:1},gold:12400,esteem:72,peace:81,
 events:[{time:480,text:'Sultan Süleyman Divan Meydanı’na çıktı.'}],issued:{},lastGrant:-1,
 npcs:cast.map((d,i)=>{
  // Open the day with staggered commutes; inventories remain untouched until pickup.
  const place=d.plan?(period(d.plan,480)==='rest'?d.plan.bed:[d.plan.source,d.plan.bench,d.plan.receiver,d.plan.meal][i%4]):{room:d.home,point:d.start};
  return {id:d.id,room:place.room,x:place.point[0],y:place.point[1],face:i%2?-1:1,
   work:{progress:0,cycles:0,last:null,status:'Mesaiye hazırlanıyor'},point:0,wait:d.plan?(i%7)*.09:3+(i%11)*2,path:[],duty:'routine',until:0};
 }),sound:false};
}
export function restore(raw){
 const initial=fresh();if(!raw)return initial;
 try{const v=JSON.parse(raw);
 for(const actor of [v.player,v.life?.horse,...(Array.isArray(v.npcs)?v.npcs:[])]){
  if(actor?.room==='court'&&inPalaceWall(actor.x,actor.y)){
   const point=nearbyGround('court',actor.x,actor.y);if(point)[actor.x,actor.y]=point;
  }
 }
 if(v.version!==1||!v.player||!rooms[v.player.room]||!walkable(v.player.room,v.player.x,v.player.y)||!Number.isFinite(v.player.x+v.player.y))return initial;
 for(const k of ['gold','esteem','peace','minutes'])if(!Number.isFinite(v[k])||v[k]<0)return initial;
 if(!Array.isArray(v.npcs)||!Array.isArray(v.events)||!v.issued)return initial;
 return {...initial,...v,stores:{...initial.stores,...v.stores},life:{...initial.life,...v.life,cargo:false,horse:{...initial.life.horse,...v.life?.horse}},events:v.events.filter(e=>typeof e.text==='string'&&Number.isFinite(e.time)).slice(-100),npcs:initial.npcs.map(n=>{
 const a=v.npcs.find(x=>x.id===n.id);
 return a&&rooms[a.room]&&Number.isFinite(a.x+a.y)&&walkable(a.room,a.x,a.y)?{...n,...a,path:[],wait:0}:n})};
 }catch{return initial}
}
export class Palace {
 constructor(state=fresh()){this.s=state;this.pending=[];this.routes=new Map();this.systems=new Map();this.motion=[];this.target=null}
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
 assign(n,duty,room,goal,until){Object.assign(n,{duty,goalRoom:room,goal,until,path:[],wait:0,point:0})}
 escort(n){if(['mandate','supervise','construction'].includes(n.duty))return; if(n.duty==='escort'){this.routine(n);this.log(n.id==='guard'?'Muhafız nöbetine döndü.':'Refakat sona erdi.');return}
 this.assign(n,'escort',this.s.player.room,[this.s.player.x,this.s.player.y],Infinity);this.log(this.note(n).name+' maiyete katıldı.')}
 routine(n){const d=this.note(n);n.work.status='İş yerine dönüyor';this.assign(n,'routine',d.home,d.start,0)}
 enter(exit){
 const p=this.s.player;if(!openExit(this.s,exit)||!rooms[p.room].exits.includes(exit)||Math.hypot(exit.x-p.x,exit.y-p.y)>34)return false;
 if(this.s.life.mounted)dismount(this);
 Object.assign(p,{room:exit.to,x:exit.arrive[0],y:exit.arrive[1]});this.motion=[];this.target=null;
 this.log(rooms[p.room].name+' bölgesine girdin.');return true;
 }
 moveTo(x,y,target=null){const p=this.s.player;this.motion=path(p.room,[p.x,p.y],[x,y]);this.target=this.motion.length?target:null;return !!this.motion.length}
 nearby(){const p=this.s.player;
 return [...targets(this.s).map(e=>({kind:'place',item:e,x:e.x,y:e.y})),...this.s.npcs.filter(n=>n.room===p.room).map(n=>({kind:'npc',item:n,x:n.x,y:n.y})),...rooms[p.room].exits.filter(e=>openExit(this.s,e)).map(e=>({kind:'exit',item:e,x:e.x,y:e.y}))].map(a=>({...a,d:Math.hypot(a.x-p.x,a.y-p.y)})).filter(a=>a.d<=34).sort((a,b)=>a.d-b.d)[0]}
 tick(dt,dx=0,dy=0,run=false){
 const s=this.s,p=s.player,day=Math.floor(s.minutes/1440);s.minutes+=dt*1.3;p.moving=false;
 if(Math.floor(s.minutes/1440)>day){for(const a of Object.values(s.office.accounts))a.levies=Math.max(0,Math.min(12,a.levies+2));s.gold+=360;this.log('Günlük saray tahsisatı hazineye girdi: 360 akçe.')}
 if(dx||dy){this.motion=[];this.target=null;const len=Math.hypot(dx,dy),step=dt*moveSpeed(s.life,run)/len;
 if(walkable(p.room,p.x+dx*step,p.y)){p.x+=dx*step;p.moving=true}
 if(walkable(p.room,p.x,p.y+dy*step)){p.y+=dy*step;p.moving=true}
 p.heading=Math.atan2(dx,-dy);if(dx)p.face=Math.sign(dx);
 }else if(this.motion.length){p.path=this.motion;const [gx,gy]=p.path[0];p.heading=Math.atan2(gx-p.x,p.y-gy);travel(p,dt,moveSpeed(s.life,false))}
 updateNeeds(s,dt,run);
 for(const n of s.npcs)this.tickNPC(n,dt);
 tickOrders(this);tickEstate(this,dt);
 for(const sys of this.systems.values())sys.tick?.(dt,this);
 }
 tickNPC(n,dt){
 const p=this.s.player,d=this.note(n);n.moving=false;
 if(n.duty!=='routine'&&n.duty!=='escort'&&n.until<=this.s.minutes)this.routine(n);
 if(n.duty==='escort'){n.goalRoom=p.room;n.goal=[p.x,p.y];if(p.room===n.room&&Math.hypot(n.x-p.x,n.y-p.y)<25){n.path=[];return}}
 if(n.duty==='routine'){
  if(d.plan){this.tickTrade(n,d,dt);return}
  const leisure=period(d.socialPlan,this.s.minutes);
  if(leisure==='visit'||leisure==='leave'){this.tickTrade(n,d,dt);return}
  if(n.work.period){delete n.work.period;n.path=[];n.wait=0}
 }
 if(n.path.length){travel(n,dt,n.duty==='escort'?73:23);return}
 n.wait-=dt;if(n.wait>0)return;
 const hour=Math.floor(this.s.minutes/60)%24;
 const room=n.duty==='routine'?(hour>=19||hour<6?(['lala','guard','scribe'].includes(n.id)?'council':d.home):d.home):n.goalRoom;
 if(room!==n.room){
 const ex=nextExit(n.room,room);
 if(!ex)return;
 if(Math.hypot(n.x-ex.x,n.y-ex.y)<8){n.room=ex.to;[n.x,n.y]=ex.arrive;n.wait=.15}
 else n.path=path(n.room,[n.x,n.y],[ex.x,ex.y]);return;
 }
 let goal=n.goal;
 if(n.duty==='routine'&&!shift(n,this.s.minutes)){
 goal=occupation(n,d,this.s,dt);
 if(goal)n.path=path(n.room,[n.x,n.y],goal);
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
 if(n.duty==='routine'){goal=room===d.home?d.start:[250+d.start[0]%300,345];if(Math.hypot(n.x-goal[0],n.y-goal[1])<3)return}
 else if(n.duty==='watch'){goal=[[230,185],[559,184],[575,405],[220,400]][n.point++%4];n.wait=1}
 else if(n.duty==='escort'){if(Math.hypot(n.x-p.x,n.y-p.y)>28)goal=[p.x,p.y];n.wait=.25}
 else n.wait=3;
 if(goal)n.path=path(n.room,[n.x,n.y],goal);
 }
 tickTrade(n,d,dt){
 const s=this.s,w=n.work,plan=d.plan??d.socialPlan,when=period(plan,s.minutes);
 if(when!==w.period){w.period=when;n.path=[];n.wait=0}
 const site=routineSite(d,n,s.minutes,s.estate),leg=w.leg||'source';
 const walking=when==='rest'?'İkametine dönüyor':when==='break'?'Yemek molasına gidiyor':when==='leave'?'İzin gününde gezintiye çıktı':when==='visit'?'İş çıkışı buluşmaya gidiyor':jobTravel(d,leg);
 if(n.path.length){w.status=walking;travel(n,dt,29+plan.seed%13);return}
 n.wait-=dt;if(n.wait>0)return;
 if(n.room!==site.room){
  const ex=nextExit(n.room,site.room);
  w.status=walking;
  if(Math.hypot(n.x-ex.x,n.y-ex.y)<7){n.room=ex.to;[n.x,n.y]=ex.arrive;n.wait=.08}
  else n.path=this.route(n,ex.x,ex.y);
  return;
 }
 if(Math.hypot(n.x-site.point[0],n.y-site.point[1])>3){w.status=walking;n.path=this.route(n,...site.point);return}
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
  if(!route){route=path(n.room,[n.x,n.y],[x,y]);if(this.routes.size>6000)this.routes.clear();this.routes.set(key,route)}
  if(!route.length)n.wait=1;
  return route.slice();
 }
 save(storage){storage.setItem(SAVE,JSON.stringify(this.s,(k,v)=>k==='path'?undefined:v))}
 static load(storage){try{return new Palace(restore(storage.getItem(SAVE)))}catch{return new Palace()}}
}
