import {cast,rooms,orders} from './data.js';
import {path,travel,walkable} from './navigation.js';
const SAVE='hanedan.saray.v1';
export function fresh(){
 return {version:1,minutes:480,player:{room:'court',x:399,y:358,face:1},gold:12400,esteem:72,peace:81,
 events:[{time:480,text:'Sultan Süleyman Divan Meydanı’na çıktı.'}],issued:{},lastGrant:-1,
 npcs:cast.map((d,i)=>({id:d.id,room:d.home,x:d.start[0],y:d.start[1],face:i%2?-1:1,point:0,wait:3+i*2,path:[],duty:'routine',until:0})),sound:false};
}
export function restore(raw){
 const initial=fresh();if(!raw)return initial;
 try{const v=JSON.parse(raw);if(v.version!==1||!v.player||!rooms[v.player.room]||!walkable(v.player.room,v.player.x,v.player.y)||!Number.isFinite(v.player.x+v.player.y))return initial;
 for(const k of ['gold','esteem','peace','minutes'])if(!Number.isFinite(v[k])||v[k]<0)return initial;
 if(!Array.isArray(v.npcs)||!Array.isArray(v.events)||!v.issued)return initial;
 return {...initial,...v,events:v.events.filter(e=>typeof e.text==='string'&&Number.isFinite(e.time)).slice(-100),npcs:initial.npcs.map(n=>{
 const a=v.npcs.find(x=>x.id===n.id);
 return a&&rooms[a.room]&&Number.isFinite(a.x+a.y)&&walkable(a.room,a.x,a.y)?{...n,...a,path:[],wait:0}:n})};
 }catch{return initial}
}
export class Palace {
 constructor(state=fresh()){this.s=state;this.pending=[];this.systems=new Map();this.motion=[];this.target=null}
 register(name,system){if(this.systems.has(name))throw Error('Sistem zaten kayıtlı');this.systems.set(name,system)}
 emit(type,payload){for(const sys of this.systems.values())sys.event?.(type,payload,this)}
 log(text){this.s.events.push({time:this.s.minutes,text});this.s.events=this.s.events.slice(-100);this.emit('record',text)}
 note(n){return cast.find(d=>d.id===n.id)}
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
 escort(n){if(n.duty==='escort'){this.routine(n);this.log(n.id==='guard'?'Muhafız nöbetine döndü.':'Refakat sona erdi.');return}
 this.assign(n,'escort',this.s.player.room,[this.s.player.x,this.s.player.y],Infinity);this.log(this.note(n).name+' maiyete katıldı.')}
 routine(n){const d=this.note(n);this.assign(n,'routine',d.home,d.start,0)}
 enter(exit){
 const p=this.s.player;if(!rooms[p.room].exits.includes(exit)||Math.hypot(exit.x-p.x,exit.y-p.y)>34)return false;
 Object.assign(p,{room:exit.to,x:exit.arrive[0],y:exit.arrive[1]});this.motion=[];this.target=null;
 this.log(rooms[p.room].name+' bölgesine girdin.');return true;
 }
 moveTo(x,y,target=null){const p=this.s.player;this.motion=path(p.room,[p.x,p.y],[x,y]);this.target=this.motion.length?target:null;return !!this.motion.length}
 nearby(){const p=this.s.player;
 return [...this.s.npcs.filter(n=>n.room===p.room).map(n=>({kind:'npc',item:n,x:n.x,y:n.y})),...rooms[p.room].exits.map(e=>({kind:'exit',item:e,x:e.x,y:e.y}))].map(a=>({...a,d:Math.hypot(a.x-p.x,a.y-p.y)})).filter(a=>a.d<=34).sort((a,b)=>a.d-b.d)[0]}
 tick(dt,dx=0,dy=0,run=false){
 const s=this.s,p=s.player,day=Math.floor(s.minutes/1440);s.minutes+=dt*1.3;p.moving=false;
 if(Math.floor(s.minutes/1440)>day){s.gold+=360;this.log('Günlük saray tahsisatı hazineye girdi: 360 akçe.')}
 if(dx||dy){this.motion=[];this.target=null;const len=Math.hypot(dx,dy),step=dt*(run?112:69)/len;
 if(walkable(p.room,p.x+dx*step,p.y)){p.x+=dx*step;p.moving=true}
 if(walkable(p.room,p.x,p.y+dy*step)){p.y+=dy*step;p.moving=true}
 if(dx)p.face=Math.sign(dx);
 }else if(this.motion.length){p.path=this.motion;travel(p,dt,75)}
 for(const n of s.npcs)this.tickNPC(n,dt);
 for(const sys of this.systems.values())sys.tick?.(dt,this);
 }
 tickNPC(n,dt){
 const p=this.s.player,d=this.note(n);n.moving=false;
 if(n.duty!=='routine'&&n.duty!=='escort'&&n.until<=this.s.minutes)this.routine(n);
 if(n.duty==='escort'){n.goalRoom=p.room;n.goal=[p.x,p.y];if(p.room===n.room&&Math.hypot(n.x-p.x,n.y-p.y)<25){n.path=[];return}}
 if(n.path.length){travel(n,dt,n.duty==='escort'?73:23);return}
 n.wait-=dt;if(n.wait>0)return;
 const hour=Math.floor(this.s.minutes/60)%24;
 const room=n.duty==='routine'?(hour>=19||hour<6?(d.home==='court'?'council':d.home):d.home):n.goalRoom;
 if(room!==n.room){
 const ex=rooms[n.room].exits.find(e=>e.to===room)||rooms[n.room].exits.find(e=>e.to==='court');
 if(!ex)return;
 if(Math.hypot(n.x-ex.x,n.y-ex.y)<8){n.room=ex.to;[n.x,n.y]=ex.arrive;n.wait=.15}
 else n.path=path(n.room,[n.x,n.y],[ex.x,ex.y]);return;
 }
 let goal=n.goal;
 if(n.duty==='routine'){const choices=room===d.home?d.routes:[[250,330],[560,345],[368,356]];
 goal=choices[n.point%choices.length];n.point++;n.wait=2+(n.point%4)}
 else if(n.duty==='watch'){goal=[[230,185],[559,184],[575,405],[220,400]][n.point++%4];n.wait=1}
 else if(n.duty==='escort'){if(Math.hypot(n.x-p.x,n.y-p.y)>28)goal=[p.x,p.y];n.wait=.25}
 else n.wait=3;
 if(goal)n.path=path(n.room,[n.x,n.y],goal);
 }
 save(storage){storage.setItem(SAVE,JSON.stringify(this.s,(k,v)=>k==='path'?undefined:v))}
 static load(storage){try{return new Palace(restore(storage.getItem(SAVE)))}catch{return new Palace()}}
}
