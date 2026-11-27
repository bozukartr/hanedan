import {coffeeOpen} from './city.js?v=8';
import {walkable} from './navigation.js?v=8';

const workplaces={
 divan:'council',hazine:'council',vakif:'guild',posta:'lodge',kapi:'barracks',ocak:'barracks',
 ahir:'stable','saraç':'stable',iskele:'warehouse',kayik:'warehouse',tersane:'warehouse',balik:'warehouse',
 kiler:'kitchen',firin:'kitchen',helva:'kitchen',imaret:'kitchen',bostan:'garden',bahce:'garden',su:'garden',
 dokuma:'loom',boya:'loom',terzi:'loom',deri:'tannery',bakir:'metal',comlek:'metal',cilt:'press',
 nakkas:'press',tabip:'garden',insaat:'guild',pazar:'guild'
};
const field={
 court:[[240,325],[515,374],[530,187],[405,572]],market:[[970,406],[1090,414],[1190,414],[1280,480]],
 pier:[[1432,787],[1255,755],[1130,758],[1450,592]],garden:[[320,189],[401,328],[503,394],[485,259]]
};
const held=new Map();
function spot(room,x,y,radius,seed){
 // Stable per-person stopping places leave room for adjacent workers.
 const used=held.get(room)??new Set();held.set(room,used);
 for(let i=0;i<1600;i++){
  const angle=(seed*1.239+i*2.39996),r=Math.sqrt(((seed*13+i*41)%173)/173)*radius+Math.floor(i/90)*8;
  const px=Math.round(x+Math.cos(angle)*r),py=Math.round(y+Math.sin(angle)*r),cell=Math.round(px/12)+','+Math.round(py/10);
  if(!used.has(cell)&&walkable(room,px,py)){used.add(cell);return {room,point:[px,py]}}
 }
 throw Error('Görev yeri ayrılamadı: '+room);
}
export function handoff(site,seed){return spot(site.room,...site.point,22,seed)}
function desk(room,seed){
 const x=[130,310,504,667][seed%4],y=[263,351,379,181][Math.floor(seed/4)%4];
 return spot(room,x,y,46,seed);
}
export function itinerary(unit,zone,slot,index){
 const home=workplaces[unit],patrol=['kapi','ocak','posta'].includes(unit),seed=index+1;
 let district=zone;
 if(unit==='ahir'||unit==='saraç')district='market';
 const outside=(field[district]&&slot<3)||(patrol&&slot<6)||(['divan','hazine','vakif'].includes(unit)&&slot<2);
 let source;
 if(outside){const key=field[district]?district:'court',points=field[key],p=points[seed%points.length];source=spot(key==='garden'?'garden':'court',...p,48,seed)}
 else source=desk(home,seed+70);
 const bench=desk(home,seed+19);
 let receiver=desk(home,seed+45);
 if(patrol&&slot<6){const target=field.court[(seed+1)%4];receiver=spot('court',...target,37,seed)}
 const nightWatch=patrol&&(slot===2||slot===4);
 const lodging=patrol?'barracks':['lodge','house','guild','loom','tannery','press','metal','stable'][seed%8];
 const bed=desk(lodging,seed+81),meal=desk(home,seed+143);
 // Neighbours meet at the same public place, at separate seats.
 const meeting=['çeşme','çarşı','rıhtım','saray yolu'][Math.floor(index/3)%4];
 const meetingPoint={'çeşme':[400,336],'çarşı':[1090,466],'rıhtım':[1398,761],'saray yolu':[461,587]}[meeting];
 const visit=spot('court',...meetingPoint,74,seed);
 const local=['tavern','han','galata','bogaz','uskudar','tahtakale'][seed%6];
 const social=local==='tavern'||local==='han'?desk(local,seed):spot(local,560+(seed%5)*100,488,75,seed);
 const shore=spot(['galata','uskudar','bogaz'][seed%3],610+(seed%6)*91,590,40,seed);
 const cafe=desk('kahve',seed);
 return {source,bench,receiver,bed,meal,visit,meeting,social,shore,cafe,nightWatch,offset:(seed*17)%62,seed,
  parcel:['divan','hazine','vakif','posta','cilt','pazar','nakkas'].includes(unit)?'paper':patrol?'watch':'goods'};
}
export function period(plan,minutes){
 const m=((minutes-plan.offset)%1440+1440)%1440;
 if(Math.floor(minutes/1440)%7===plan.seed%7&&m>=480&&m<1110)return 'leave';
 if(plan.nightWatch)return m<360||m>=1140?'work':'rest';
 if(m<345||m>=1140)return 'rest';
 if(m>=1095)return 'visit';
 return m>=690&&m<725?'break':'work';
}
export function routineSite(d,n,minutes,estate={}){
 const p=d.plan??d.socialPlan,when=period(p,minutes);
 if(when==='rest')return p.bed;
 if(when==='break')return p.meal;
 if(when==='visit')return p.seed%3===0?p.social:p.visit;
 if(when==='leave'){
  const hour=(minutes-p.offset)%1440;
  if(hour<730)return p.shore;
  if(hour<875&&estate.mosqueLand?.status==='owned'&&p.seed%3===0)return {room:'mosqueLand',point:p.cafe.point};
  if(hour<875)return coffeeOpen(minutes)&&p.seed%3===1?p.cafe:p.social;
  return p.seed%2?p.visit:p.shore;
 }
 return p[n.work.leg||'source'];
}
export function jobTravel(d,leg){
 if(d.plan.parcel==='watch')return leg==='bench'?'Nöbet yerine geçiyor':leg==='receiver'?'Devriye güzergâhını denetliyor':'Yoklamaya gidiyor';
 if(d.plan.parcel==='paper')return leg==='source'?'Evrakı almaya gidiyor':leg==='bench'?'Evrakı kaleme götürüyor':'Evrakı teslim ediyor';
 return leg==='source'?'Teslim noktasına gidiyor':leg==='bench'?'Tezgâha gidiyor':'Partiyi teslime götürüyor';
}
