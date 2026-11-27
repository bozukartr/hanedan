import {canStand,water,locationAt} from './geography.js?v=8';
import {clear} from './world-route.js?v=8';
import {travel} from './navigation.js?v=8';

export const household=()=>({formation:'close',reports:[]});
export const attendants=s=>s.npcs.filter(n=>n.duty==='escort');
const distance=(n,x,y)=>Math.hypot(n.x-x,n.y-y);
const isGuard=d=>d.unit==='ocak'||d.unit==='kapi';
export function callGuard(game){
 const s=game.s,p=s.player,already=attendants(s).length;
 const eligible=s.npcs.filter(n=>n.duty==='routine'&&isGuard(game.note(n))&&n.work.period!=='rest');
 eligible.sort((a,b)=>distance(a,p.x,p.y)-distance(b,p.x,p.y));
 const summoned=eligible.slice(0,Math.max(0,3-already));
 for(const n of summoned)game.assign(n,'escort',n.room,[400,330],Number.MAX_SAFE_INTEGER);
 if(summoned.length){s.player.signalUntil=s.minutes+2;game.log(summoned.length+' muhafız huzura çağrıldı.')}
 return summoned.length;
}
export function dismissGuard(game){
 for(const n of attendants(game.s))game.routine(n);
 game.log('Maiyet dağıldı. Görevliler mesailerine dönüyor.');
}
function follow(game,n,x,y,dt,speed,range){
 const s=game.s;
 if(distance(n,x,y)<=range&&clear([n.x,n.y],[x,y],s)){n.path=[];return true}
 const last=n.path.at(-1);
 if(!last||((s.minutes>=(n.trackAt||0))&&Math.hypot(last[0]-x,last[1]-y)>12)){
  n.path=game.route(n,x,y);n.trackAt=s.minutes+.65;
 }
 travel(n,dt,speed);return false;
}
export function followFormation(game,n,dt){
 const s=game.s,p=s.player,slot=game.retinue.indexOf(n),open=s.household.formation==='procession',row=Math.floor(Math.max(0,slot)/2);
 const side=(slot%2?1:-1)*(open?36:15),back=(open?19:11)+row*(open?31:16),angle=p.heading||0;
 let x=p.x+side*Math.cos(angle)-back*Math.sin(angle),y=p.y+side*Math.sin(angle)+back*Math.cos(angle);
 // Inside a doorway the escort closes ranks and follows through the same opening.
 if(!canStand(x,y,s)||locationAt(x,y,s)!==p.room||!clear([p.x,p.y],[x,y],s)){x=p.x;y=p.y}
 if(follow(game,n,x,y,dt,s.life.mounted?195:124,4)){n.face=p.face;n.moving=false}
}
// Keep reactions short and remember a greeting until the encounter ends.
export function encounter(game,n,d,dt){
 const s=game.s,p=s.player,dx=n.x-p.x,dy=n.y-p.y,dist2=dx*dx+dy*dy;
 if(n.reaction){
  const r=n.reaction;
  if(r.steps.length){n.path=r.steps;travel(n,dt,51);r.steps=n.path;return true}
  n.face=Math.sign(p.x-n.x)||n.face;
  if(s.minutes<r.until)return true;
  delete n.reaction;n.path=[];n.wait=0;return false;
 }
 if(dist2>115*115){n.greeted=false;return false}
 if(n.greeted||dist2>65*65||n.work.period==='rest'||water(n.x,n.y)||!clear([n.x,n.y],[p.x,p.y],s))return false;
 const angle=p.heading||0,forward=dx*Math.sin(angle)-dy*Math.cos(angle),cross=dx*Math.cos(angle)+dy*Math.sin(angle);
 const inWay=p.moving&&forward>-6&&forward<61&&Math.abs(cross)<20;
 let steps=[];
 if(inWay){
  const side=cross<0?-1:1;
  for(const direction of [side,-side]){
   const x=n.x+direction*Math.cos(angle)*22,y=n.y+direction*Math.sin(angle)*22;
   if(locationAt(x,y,s)===n.room&&clear([n.x,n.y],[x,y],s)){steps=[[x,y]];break}
  }
 }
 n.greeted=true;n.path=[];n.reaction={pose:isGuard(d)?'salute':'bow',steps,until:s.minutes+(steps.length?2.9:1.9)};
 n.face=Math.sign(-dx)||n.face;return true;
}
export function queueReport(game,job,site,result,actor){
 game.s.household.reports.push({number:job.id,officer:actor.id,zone:site.name,result,x:actor.x,y:actor.y,stage:'collect',courier:null});
}
export function dispatchReports(game){
 const s=game.s;
 for(const r of s.household.reports){
  if(r.stage!=='collect'||r.courier)continue;
  const available=s.npcs.filter(n=>n.duty==='routine'&&game.note(n).unit==='posta');
  const n=available.sort((a,b)=>distance(a,r.x,r.y)-distance(b,r.x,r.y))[0];if(!n)break;
  r.courier=n.id;game.assign(n,'courier',n.room,[400,330],Number.MAX_SAFE_INTEGER);
 }
}
export function carryReport(game,n,dt){
 const s=game.s,r=s.household.reports.find(r=>r.courier===n.id&&r.stage!=='delivered');
 if(!r){game.routine(n);return}
 if(r.stage==='collect'){
  if(follow(game,n,r.x,r.y,dt,92,5)){r.stage='return';n.path=[]}
  return;
 }
 if(!follow(game,n,s.player.x,s.player.y,dt,145,19))return;
 r.stage='delivered';r.delivered=s.minutes;
 game.routine(n);n.reaction={pose:'present',steps:[],until:s.minutes+3};n.greeted=true;
 game.log(game.note(n).name+' huzura arz etti. '+r.zone+' · '+r.result);
 // Retain the latest delivered correspondence and every outstanding dispatch.
 const delivered=s.household.reports.filter(v=>v.stage==='delivered');
 if(delivered.length>32)s.household.reports=s.household.reports.filter(v=>v!==delivered[0]);
}
