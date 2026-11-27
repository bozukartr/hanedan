import {institutions} from './institutions.js?v=6';
// Each shift lists its inputs, outputs and duration in game minutes.
export const trades = {
 porter: ['Gemiden zahire boşaltıyor', 15, {}, {grain:3}],
 cook: ['İmaret için aş pişiriyor', 25, {grain:1}, {meals:8}],
 baker: ['Fırında ekmek pişiriyor', 20, {grain:1}, {bread:6}],
 weaver: ['Tezgâhta bez dokuyor', 35, {}, {cloth:2}],
 guard: ['Meydanı teftiş ediyor', 25, {}, {patrol:1}],
 lala: ['Kapıda gelenleri kayda alıyor', 18, {}, {petitions:2}],
 scribe: ['Arzuhalleri deftere geçiriyor', 22, {petitions:1}, {files:1}],
 vizier: ['Arz dosyalarını inceliyor', 30, {files:1}, {decisions:1}],
 groom: ['Atların yemini dağıtıyor', 30, {grain:1}, {horses:2}],
 gardener: ['Bostanda sebze yetiştiriyor', 40, {}, {vegetables:4}],
 page: ['Bostan erzağını ayıklıyor', 20, {vegetables:2}, {meals:2}]
};
export const goods = {grain:'çuval zahire', meals:'porsiyon aş', bread:'somun', cloth:'top bez', patrol:'devriye', petitions:'arzuhal', files:'dosya', decisions:'divan kararı', horses:'at bakımı', vegetables:'sepet sebze'};
// Three intake desks feed three specialists. Inspection, countersignature
// and release each require the previous stage's actual output.
export const workshopStock={};
for(const [id,label,,,product,posts] of institutions){
 const steps=['girdi','işlenmiş parti','denetlenmiş parti','onaylı parti',product];
 steps.forEach((name,i)=>{goods[id+'/'+i]=label+' · '+name;workshopStock[id+'/'+i]=i===4?0:2});
 posts.split('|').forEach((role,slot)=>{
  const stage=slot<3?0:slot<6?1:slot-4;
  const activity=['malzeme veya başvuru kabul ediyor','partiyi işliyor','işi denetliyor','teslimi onaylıyor','teslimi kayda geçiriyor'][stage];
  trades[id+'-'+slot]=[role+' · '+activity,[22,28,12,12,12][stage],stage?{[id+'/'+(stage-1)]:1}:{},{[id+'/'+stage]:1}];
 });
}
// Delivered batches can enter other workshops or the existing public stocks.
for(const [supplier,buyer] of [['dokuma','terzi'],['deri','saraç'],['saraç','ahir'],['boya','nakkas'],['comlek','helva'],['bakir','imaret']]){
 trades[buyer+'-0'][2]={[supplier+'/4']:1};
}
for(const [id,good,count] of [['firin','bread',10],['imaret','meals',16],['bostan','vegetables',8],['divan','files',1],['dokuma','cloth',2]]){
 trades[id+'-8'][3][good]=count;
}
export function newStores(){
 return {...Object.fromEntries(Object.keys(goods).map(k=>[k,0])),...workshopStock,grain:10,bread:6,vegetables:2,petitions:2,files:1};
}
export function shift(n,minutes){
 const h=Math.floor(minutes/60)%24;
 if(h<6||h>=19)return 'İstirahatte';
 if(h===12)return 'Öğle molasında';
 return '';
}
export function workStatus(n,s){
 if(n.duty==='construction')return n.room===n.goalRoom&&!n.moving?'Şantiyede çalışıyor':'Şantiyeye gidiyor';
 if(n.duty==='supervise')return 'Verilen hükmün icrasını yönetiyor';
 if(n.duty==='mandate')return 'Padişahın hükmünü yürütüyor';
 if(n.duty!=='routine')return 'Saray hizmetinde';
 return n.work.period?n.work.status:shift(n,s.minutes)||n.work.status;
}
export function occupation(n,d,s,dt){
 const spec=trades[n.id],w=n.work,station=d.routes[w.cycles%d.routes.length];
 if(Math.hypot(n.x-station[0],n.y-station[1])>3){
  w.status='İş yerine gidiyor';return station;
 }
 w.status=spec[0];w.progress=Math.min(spec[1],w.progress+dt*1.3*((s.priority?.[d.unit]??0)>s.minutes?1.5:1));
 if(w.progress<spec[1])return;
 if(Object.entries(spec[2]).some(([k,v])=>s.stores[k]<v)){w.status='Malzeme bekliyor';return}
 for(const [k,v] of Object.entries(spec[2]))s.stores[k]-=v;
 for(const [k,v] of Object.entries(spec[3]))s.stores[k]+=v;
 w.cycles++;w.progress=0;w.last=s.minutes;
}

export function workshop(n,d,s,dt){
 const w=n.work,spec=trades[n.id];
 if(!w.leg||w.leg==='source'){
  if(Object.entries(spec[2]).some(([k,count])=>s.stores[k]<count)){
   w.status='Malzeme bekliyor';n.wait=1.4;return
  }
  for(const [k,count] of Object.entries(spec[2]))s.stores[k]-=count;
  w.leg='bench';w.status='Teslim aldı';n.wait=.45;return
 }
 if(w.leg==='bench'){
  w.status=spec[0];w.progress+=dt*1.3*(s.priority[d.unit]>s.minutes?1.5:1);
  if(w.progress>=spec[1]){w.leg='receiver';w.progress=0}
  return;
 }
 for(const [k,count] of Object.entries(spec[3]))s.stores[k]+=count;
 w.last=s.minutes;w.cycles++;w.leg='source';w.status='Teslim etti';n.wait=.8;
}
