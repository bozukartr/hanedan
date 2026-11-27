import {worldPoint} from './geography.js?v=8';
import {parcels} from './city.js?v=8';
export function constructionPost(id,i){
 const p=parcels[id];return [p.x-18+36*i,p.y+12];
}
export function commission(game,id){
 const s=game.s,p=parcels[id];
 if(!p||s.estate[id])return 'Bu mülk için işlem yapılmış.';
 if(s.gold<p.price)return 'Hazinedeki akçe yetersiz.';
 if(p.build){
  const foreman=s.npcs.find(n=>n.id==='insaat-7'),mason=s.npcs.find(n=>n.id==='insaat-3');
  if([foreman,mason].some(n=>n.duty!=='routine'))return 'Yapı kalfası ve duvar ustası başka bir işte.';
  for(const [i,n] of [foreman,mason].entries())game.assign(n,'construction',p.room,constructionPost(id,i),Number.MAX_SAFE_INTEGER);
  s.estate[id]={status:'building',crew:[foreman.id,mason.id],progress:0};
 }else s.estate[id]={status:'owned'};
 s.gold-=p.price;game.log(p.build?p.name+' için inşa emri mühürlendi.':p.name+' satın alındı.');return '';
}
export function tickEstate(game,dt){
 for(const [id,job] of Object.entries(game.s.estate)){
  if(job.status!=='building')continue;
  const p=parcels[id],crew=job.crew.map(id=>game.s.npcs.find(n=>n.id===id));
  if(!crew.every((n,i)=>{const [x,y]=worldPoint(p.room,...constructionPost(id,i));return Math.hypot(n.x-x,n.y-y)<=5}))continue;
  job.progress+=dt*1.3;
  if(job.progress<120)continue;
  job.status='owned';for(const n of crew)game.routine(n);
  game.log((p.kind==='mosque'?'Mahalle camii':'Sahil yalısı')+' tamamlandı. Kapıları açıldı.');
 }
}
