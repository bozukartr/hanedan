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
export function newStores(){
 return {...Object.fromEntries(Object.keys(goods).map(k=>[k,0])),grain:10,bread:6,vegetables:2,petitions:2,files:1};
}
export function shift(n,minutes){
 const h=Math.floor(minutes/60)%24;
 if(h<6||h>=19)return 'İstirahatte';
 if(h===12)return 'Öğle molasında';
 return '';
}
export function workStatus(n,s){
 if(n.duty==='mandate')return 'Padişahın hükmünü yürütüyor';
 if(n.duty!=='routine')return 'Saray hizmetinde';
 return shift(n,s.minutes)||n.work.status;
}
export function occupation(n,d,s,dt){
 const spec=trades[n.id],w=n.work,station=d.routes[w.cycles%d.routes.length];
 if(Math.hypot(n.x-station[0],n.y-station[1])>3){
  w.status='İş yerine gidiyor';return station;
 }
 w.status=spec[0];w.progress=Math.min(spec[1],w.progress+dt*1.3);
 if(w.progress<spec[1])return;
 if(Object.entries(spec[2]).some(([k,v])=>s.stores[k]<v)){w.status='Malzeme bekliyor';return}
 for(const [k,v] of Object.entries(spec[2]))s.stores[k]-=v;
 for(const [k,v] of Object.entries(spec[3]))s.stores[k]+=v;
 w.cycles++;w.progress=0;w.last=s.minutes;
}
