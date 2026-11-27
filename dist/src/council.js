// District accounts and officers persist independently of the sultan's location.
export const districts = {
  palace: {name:'Divan Meydanı', room:'court', x:500, y:350},
  market: {name:'Esnaf Çarşısı', room:'court', x:995, y:428},
  pier: {name:'Sarayburnu İskelesi', room:'court', x:1430, y:750},
  kitchen: {name:'Matbah-ı Âmire', room:'kitchen', x:305, y:247},
  garden: {name:'Hasbahçe', room:'garden', x:315, y:251}
};
export const mandates = {
  provision: {name:'Zahire sevk et', cost:60, unit:'çuval', help:'İskele ambarından alınan zahire hedef bölgenin stokuna girer.'},
  relief: {name:'Halka sofra açtır', cost:25, unit:'çuval', help:'Bölgedeki her çuval 20 kişiye aş olur. Halkın huzuru yükselir.'},
  guard: {name:'Muhafız konuşlandır', cost:90, unit:'bölük', help:'Her bölük dört muhafızdır. Bölgeyi korur ve tahsilatın yarattığı huzursuzluğu azaltır.'},
  levy: {name:'Vergi tahsil ettir', cost:10, unit:'pay', help:'Her pay hazinenize 120 akçe getirir. Bölgenin vergi kapasitesi ve huzuru azalır.'}
};
export const officers=['vizier','lala','scribe','guard','groom','cook','porter','gardener'];
export function treasuryOffice(){
 const accounts={};
 for(const id of Object.keys(districts))accounts[id]={grain:id==='kitchen'?4:2,guards:0,levies:id==='market'?10:5,served:0,peace:75};
 return {serial:0,jobs:[],accounts};
}
export function summary(s,type,zone,amount,officer){
 const rules=mandates[type],a=s.office.accounts[zone];
 if(!rules||!a||!Number.isInteger(amount)||amount<1||amount>8||!officers.includes(officer))return 'Emrin kapsamını ve vekilini belirleyin.';
 if(s.office.jobs.some(j=>j.officer===officer))return 'Bu vekil başka bir emri yürütüyor.';
 if(s.gold<rules.cost*amount)return 'Hazinedeki akçe bu tahsisat için yetersiz.';
 if(type==='provision'&&s.stores.grain<amount)return 'İskele ambarında yeterli zahire yok.';
 if(type==='relief'&&a.grain<amount)return 'Bölgeye önce zahire sevk edilmesi gerekiyor.';
 if(type==='levy'&&a.levies<amount)return 'Bölgenin bugün tahsil edilebilir payı yetersiz.';
 return '';
}
function dispatch(game,j,site){
 const officer=game.s.npcs.find(n=>n.id===j.officer);
 game.assign(officer,'mandate',site.room,[site.x,site.y],Number.MAX_SAFE_INTEGER);
}
export function issue(game,type,zone,amount,officer){
 const s=game.s,error=summary(s,type,zone,amount,officer);
 if(error)return error;
 const account=s.office.accounts[zone],cost=mandates[type].cost*amount;
 s.gold-=cost;
 if(type==='provision')s.stores.grain-=amount;
 if(type==='relief')account.grain-=amount;
 if(type==='levy')account.levies-=amount;
 const job={id:++s.office.serial,type,zone,amount,officer,cost,phase:type==='provision'?'pickup':'travel',due:0};
 s.office.jobs.push(job);
 dispatch(game,job,job.phase==='pickup'?districts.pier:districts[zone]);
 game.log('Hüküm '+job.id+' mühürlendi. '+game.note(s.npcs.find(n=>n.id===officer)).name+' görevlendirildi: '+mandates[type].name+' · '+districts[zone].name+'.');
 return '';
}
export function revoke(game,id){
 const s=game.s,j=s.office.jobs.find(j=>j.id===id);if(!j)return;
 const a=s.office.accounts[j.zone];
 if(j.type==='provision')s.stores.grain+=j.amount;
 if(j.type==='relief')a.grain+=j.amount;
 if(j.type==='levy')a.levies+=j.amount;
 s.gold+=j.cost;s.office.jobs=s.office.jobs.filter(x=>x!==j);
 game.routine(s.npcs.find(n=>n.id===j.officer));game.log('Hüküm '+id+' geri alındı. Tahsisat hazineye döndü.');
}
export function tickOrders(game){
 const s=game.s;
 for(const j of [...s.office.jobs]){
  const n=s.npcs.find(n=>n.id===j.officer),site=districts[j.zone];
  const target=j.phase==='pickup'?districts.pier:site;
  if(n.room!==target.room||Math.hypot(n.x-target.x,n.y-target.y)>6)continue;
  if(j.phase==='pickup'){j.phase='travel';dispatch(game,j,site);continue}
  if(j.phase==='travel'){j.phase='work';j.due=s.minutes+6+3*j.amount;continue}
  if(s.minutes<j.due)continue;
  const a=s.office.accounts[j.zone],k=j.amount;
  let report;
  switch(j.type){
   case 'provision':a.grain+=k;report=k+' çuval zahire ambara girdi.';break;
   case 'relief':a.served+=20*k;a.peace=Math.min(100,a.peace+4*k);s.peace=Math.min(100,s.peace+k);report=20*k+' kişiye sıcak aş dağıtıldı.';break;
   case 'guard':a.guards+=4*k;report=4*k+' muhafız nöbete yerleşti.';break;
   case 'levy':{const loss=Math.max(1,3*k-Math.floor(a.guards/4));s.gold+=120*k;a.peace=Math.max(0,a.peace-loss);report=120*k+' akçe tahsil edildi. Bölgenin huzuru '+loss+' puan düştü.';break}
  }
  game.routine(n);s.office.jobs=s.office.jobs.filter(x=>x!==j);
  game.log(game.note(n).name+' arz eder — '+site.name+': '+report)
 }
}
