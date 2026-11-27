import {institutions} from './institutions.js?v=4';
import {cast as founders} from './data.js?v=4';
import {walkable,clear} from './navigation.js?v=4';

const names='Ahmed Hasan Hüseyin İbrahim Mustafa Yusuf Yakub İshak Selim Mahmud Musa Davud Fatma Emine Ayşe Hatice Zeynep Meryem Ali Ömer Hamza Halil İlyas Osman'.split(' ');
const origins='Edirneli Bursalı Üsküdarlı İznikli Tireli Amasyalı Bolulu Konyalı Tokatlı Sofyalı Gelibolulu Sinoplu'.split(' ');
const areas={court:['court',185,180,590,260],market:['court',816,335,650,318],pier:['court',875,675,690,125],council:['council',65,160,670,235],garden:['garden',55,140,680,298],kitchen:['kitchen',50,162,690,238]};
const colors=['#6a7552','#825047','#4f7080','#926c54','#5d687b','#825c70'];
const stations=new Set();
function station(zone,i){
 const [room,x,y,w,h]=areas[zone];
 for(let n=i+1;;n++){
  const point=[x+(n*127)%w,y+(n*73)%h],cell=[room,Math.floor(point[0]/14),Math.floor(point[1]/10)].join('/');
  if(!stations.has(cell)&&walkable(room,...point)){stations.add(cell);return point}
 }
}
const originalUnits=['kapi','ocak','divan','divan','imaret','bostan','bahce','ahir','firin','iskele','dokuma'];
export const people=founders.map((d,i)=>({...d,unit:originalUnits[i],rank:d.id==='vizier'?'Vezîriâzam':d.role,boss:d.id==='vizier'?null:originalUnits[i]+'-8'}));
for(const [u,[id,label,zone,authority,product,posts]] of institutions.entries()){
 for(const [slot,role] of posts.split('|').entries()){
  const i=u*9+slot,start=station(zone,i),home=areas[zone][0];
  const stops=[start,...[[12,4],[-10,5],[6,-6]].map(([dx,dy])=>[start[0]+dx,start[1]+dy]).filter(p=>clear(home,start,p)).slice(0,1)];
  const rank=slot===8?'Birim amiri':slot===7?'Vekil':slot===6?'Denetçi':slot>=3?'Usta / uzman':'Hizmetli';
  people.push({id:id+'-'+slot,name:origins[Math.floor(i/names.length)]+' '+names[i%names.length],role,rank,unit:id,slot,authority,
   boss:slot===8?'vizier':id+'-'+(slot===7?8:slot===6?7:slot>=3?6:7),home,start,routes:stops,color:colors[u%colors.length],
   line:label+' hizmetindeyim, hünkârım. Birimimizin teslimi: '+product+'.'});
 }
}
export const personnel=new Map(people.map(d=>[d.id,d]));
export const departments=new Map(institutions.map(unit=>[unit[0],unit]));
