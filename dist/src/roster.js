import {itinerary,handoff} from './daylife.js?v=8';
import {institutions} from './institutions.js?v=8';
import {cast as founders} from './data.js?v=8';

const names='Ahmed Hasan Hüseyin İbrahim Mustafa Yusuf Yakub İshak Selim Mahmud Musa Davud Fatma Emine Ayşe Hatice Zeynep Meryem Ali Ömer Hamza Halil İlyas Osman'.split(' ');
const origins='Edirneli Bursalı Üsküdarlı İznikli Tireli Amasyalı Bolulu Konyalı Tokatlı Sofyalı Gelibolulu Sinoplu'.split(' ');
const colors=['#6a7552','#825047','#4f7080','#926c54','#5d687b','#825c70'];
const originalUnits=['kapi','ocak','divan','divan','imaret','bostan','bahce','ahir','firin','iskele','dokuma'];
export const people=founders.map((d,i)=>({...d,unit:originalUnits[i],rank:d.id==='vizier'?'Vezîriâzam':d.role,boss:d.id==='vizier'?null:originalUnits[i]+'-8'}));
for(const [u,[id,label,zone,authority,product,posts]] of institutions.entries()){
 for(const [slot,role] of posts.split('|').entries()){
  const i=u*9+slot,plan=itinerary(id,zone,slot,i),home=plan.bench.room,start=plan.bench.point;
  const rank=slot===8?'Birim amiri':slot===7?'Vekil':slot===6?'Denetçi':slot>=3?'Usta / uzman':'Hizmetli';
  people.push({id:id+'-'+slot,name:origins[Math.floor(i/names.length)]+' '+names[i%names.length],role,rank,unit:id,slot,authority,
   boss:slot===8?'vizier':id+'-'+(slot===7?8:slot===6?7:slot>=3?6:7),home,start,plan,routes:[start],color:colors[u%colors.length],
   line:label+' hizmetindeyim, hünkârım. Birimimizin teslimi: '+product+'.'});
 }
}
export const personnel=new Map(people.map(d=>[d.id,d]));
// Hand off finished work at the receiving colleague's station.
for(const d of people.filter(d=>d.plan)){
 if(d.plan.parcel==='watch'&&d.slot<6)continue;
 const next=personnel.get(d.slot<3?d.unit+'-'+(3+d.slot):d.boss);
 if(next?.plan)d.plan.receiver=handoff(next.plan.bench,d.plan.seed);
}
for(const [i,founder] of founders.entries()){
 const d=personnel.get(founder.id),neighbour=personnel.get(d.unit+'-'+(i%6)).plan;
 d.socialPlan={...neighbour,seed:281+i+(i>=6?1:0),offset:(i*13)%60};
}
export const departments=new Map(institutions.map(unit=>[unit[0],unit]));
