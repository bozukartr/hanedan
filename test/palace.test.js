import test from 'node:test';
import assert from 'node:assert/strict';
import {Palace,fresh,restore} from '../dist/src/simulation.js?v=8';
import {rooms,dateText} from '../dist/src/data.js?v=8';
import {worldPoint,canStand,landmark,isOpen,locationAt,water,structure} from '../dist/src/geography.js?v=8';
import {worldRoute,clear} from '../dist/src/world-route.js?v=8';
function place(actor,id,point,s){[actor.x,actor.y]=worldPoint(id,...point);actor.room=locationAt(actor.x,actor.y,s)}

function advance(game,seconds){for(let i=0;i<seconds*20;i++)game.tick(.05)}
test('Başlangıç tarihi, karakter konumu ve yeni kayıt',()=>{
 const s=fresh();assert.equal(dateText(s.minutes),'30 Eylül 1520');assert.equal(s.player.room,'court');assert.equal(s.npcs.length,281);
 for(const n of s.npcs)assert.ok(canStand(n.x,n.y,s),n.id)
});
test('Açık yapıların ve semtlerin hepsine aynı dünya üzerinde ulaşılır',()=>{
 const s=fresh(),start=[s.player.x,s.player.y];
 for(const id of Object.keys(rooms).filter(id=>isOpen(id,s))){
  const end=landmark(id),route=worldRoute(start,end,s);let from=start;
  assert.ok(route.length,id);
  for(const to of route){assert.ok(clear(from,to,s),id);from=to}assert.deepEqual(from,end);
 }
});
test('Yol bulma çeşmenin çevresini dolaşır',()=>{
 const s=fresh(),start=[400,350],end=[402,166];assert.ok(!clear(start,end,s));assert.ok(!canStand(400,281,s));let from=start;const route=worldRoute(start,end,s);assert.ok(route.length>1);
 for(const to of route){assert.ok(clear(from,to,s));from=to}assert.deepEqual(from,end)
});
test('Elle hareket çarpışmaları korur',()=>{const g=new Palace();Object.assign(g.s.player,{x:399,y:358});for(let i=0;i<400;i++)g.tick(.03,0,-1);assert.ok(g.s.player.y>305);assert.ok(canStand(g.s.player.x,g.s.player.y,g.s))});
test('Ferman maliyeti bir kez ödenir ve aşçı meydana yürür',()=>{
 const g=new Palace();assert.ok(g.order('meal'));assert.ok(!g.order('meal'));assert.equal(g.s.gold,12160);advance(g,90);const cook=g.s.npcs.find(n=>n.id==='cook');assert.equal(cook.room,'court');assert.ok(Math.hypot(cook.x-515,cook.y-355)<3);
 g.s.gold=0;assert.ok(!g.order('plant'))
});
test('Divan gerçekten toplanır ve süre bitince dağılır',()=>{
 const g=new Palace();g.order('council');advance(g,70);assert.ok(['scribe','lala','vizier'].every(id=>g.s.npcs.find(n=>n.id===id).room==='council'));advance(g,180);assert.equal(g.s.npcs.find(n=>n.id==='scribe').room,'court')
});
test('Kubbealtı eşiğinde elle hareket ve refakat dünya koordinatlarında kesintisizdir',()=>{
 const g=new Palace(),p=g.s.player,n=g.s.npcs[1],door=structure.council;
 Object.assign(p,{x:door.cx,y:door.front+15});Object.assign(n,{x:door.cx+5,y:door.front+32});g.escort(n);
 const before=p.y;
 for(let i=0;i<14;i++)g.tick(.05,0,-1);
 assert.ok(Math.abs(before-p.y-14*.05*69)<.001);assert.equal(p.room,'council');
 advance(g,10);assert.equal(n.room,'council');assert.ok(Math.hypot(n.x-p.x,n.y-p.y)<29);
 for(let i=0;i<18;i++)g.tick(.05,0,1);
 assert.equal(p.room,'court');g.escort(n);assert.equal(n.duty,'routine')
});
test('Gece nöbet düzeni değişir ve gece yarısı tahsisat bir kez ödenir',()=>{
 const g=new Palace();g.s.minutes=1140;advance(g,80);assert.equal(g.s.npcs[0].room,'council');g.s.minutes=1439.99;advance(g,1);assert.equal(g.s.gold,12760)
});
test('Kayıt ve bozuk kayıt kurtarma',()=>{
 const g=new Palace();g.order('watch');let data;const store={setItem:(_,v)=>data=v,getItem:()=>data};g.save(store);const copy=Palace.load(store);assert.equal(copy.s.gold,g.s.gold);assert.ok(copy.active('watch'));advance(copy,5);assert.equal(restore('!').minutes,480);assert.deepEqual(restore('{"version":1}'),fresh())
});
test('Yeni sistemler ferman olaylarını ve simülasyon zamanını alır',()=>{
 const g=new Palace(),seen=[];g.register('diplomasi',{event:(name)=>seen.push(name),tick:(dt)=>seen.push(dt)});g.order('plant');g.tick(.01);assert.deepEqual(seen,['record','decree',.01])
});
import {initialLife,usePlace,dismount,consume} from '../dist/src/life.js?v=8';
test('Eski kayıt yeni heybe ve at durumunu alır',()=>{const old=fresh();delete old.life;assert.deepEqual(restore(JSON.stringify(old)).life,initialLife())});
test('At, çuval, mutfak ve heybe',()=>{const g=new Palace(),p=g.s.player,l=g.s.life;Object.assign(p,l.horse);assert.equal(usePlace(g,'horse'),'');assert.ok(l.mounted);assert.ok(dismount(g));Object.assign(p,{x:1430,y:750});assert.match(usePlace(g,'sack'),/vekil/);assert.equal(l.cargo,false);assert.ok(consume(g,'bread'))});
import {issue,revoke} from '../dist/src/council.js?v=8';
test('Oyuncu Hasbahçe’de iken saray ve esnaf üretir ve kayda geçer',()=>{
 const g=new Palace();place(g.s.player,'garden',[330,300],g.s);advance(g,140);
 for(const n of g.s.npcs.slice(0,11))assert.ok(n.work.cycles>0,n.id);
 assert.ok(g.s.stores.cloth>0);assert.ok(g.s.stores.decisions>0);
 const copy=restore(JSON.stringify(g.s));assert.deepEqual(copy.stores,g.s.stores);assert.deepEqual(copy.npcs[0].work,g.s.npcs[0].work)
});
test('Vekil iskeleden mutfağa sevk eder, emirdeyken yük boşaltamaz ve görevine döner',()=>{
 let g=new Palace();assert.equal(issue(g,'provision','kitchen',2,'porter'),'');assert.equal(g.s.stores.grain,8);
 assert.ok(issue(g,'guard','pier',1,'porter'));advance(g,10);g=new Palace(restore(JSON.stringify(g.s)));
 assert.equal(g.s.npcs.find(n=>n.id==='porter').work.cycles,0);advance(g,120);
 assert.equal(g.s.office.jobs.length,0);assert.equal(g.s.office.accounts.kitchen.grain,6);
 assert.equal(issue(g,'relief','kitchen',6,'cook'),'');advance(g,50);assert.equal(g.s.office.accounts.kitchen.served,120);
 assert.ok(g.s.npcs.find(n=>n.id==='porter').work.cycles>0);
});
test('Geri alınan emrin tahsisatı yalnız bir kere iade edilir',()=>{
 const g=new Palace();issue(g,'levy','market',2,'scribe');revoke(g,1);revoke(g,1);
 assert.equal(g.s.gold,12400);assert.equal(g.s.office.accounts.market.levies,10)
});
test('Fırıncı zahire yokken bekler, gelince pişirir. Öğle payı günde bir kez yenir.',()=>{
 const g=new Palace(),n=g.s.npcs.find(n=>n.id==='baker');g.s.stores.grain=0;
 for(let i=0;i<160;i++)g.tickNPC(n,.25);
 assert.equal(n.work.status,'Malzeme bekliyor');assert.equal(n.work.cycles,0);
 g.s.stores.grain=1;g.tickNPC(n,.25);assert.equal(n.work.cycles,1);assert.equal(g.s.stores.bread,12);
 g.s.minutes=720;g.tickNPC(n,.25);g.tickNPC(n,.25);assert.equal(g.s.stores.bread,11)
});
import {people,personnel,departments} from '../dist/src/roster.js?v=8';
import {trades} from '../dist/src/work.js?v=8';
test('281 ayrı sicil, bağımsız mesai ve padişaha ulaşan emir zinciri',()=>{
 assert.equal(new Set(people.map(n=>n.name)).size,281);
 for(const d of people){
  const seen=new Set();let p=d;
  while(p.boss){assert.ok(!seen.has(p.id));seen.add(p.id);p=personnel.get(p.boss);assert.ok(p)}
  assert.equal(p.id,'vizier');assert.ok(trades[d.id]);
 }
 const g=new Palace();place(g.s.player,'garden',[330,300],g.s);advance(g,Math.ceil(2880/1.3));
 for(const [id] of departments)assert.ok(g.s.npcs.find(n=>n.id===id+'-8').work.cycles>0,id);
 for(const n of g.s.npcs)assert.ok(n.work.cycles>0,n.id)
});
test('Amir işi astına verir, meşgul personel ikinci kez görevlendirilemez',()=>{
 const g=new Palace();assert.ok(issue(g,'guard','garden',1,'firin-8'));
 assert.equal(issue(g,'relief','kitchen',1,'firin-8'),'');
 const j=g.s.office.jobs[0],chief=g.s.npcs.find(n=>n.id===j.officer),runner=g.s.npcs.find(n=>n.id===j.executor);
 assert.equal(chief.duty,'supervise');assert.equal(runner.duty,'mandate');g.escort(chief);assert.equal(chief.duty,'supervise');
 advance(g,80);assert.equal(chief.duty,'routine');assert.equal(runner.duty,'routine');assert.equal(g.s.office.accounts.kitchen.served,20)
});
test('On bir kişilik eski kayıt yeni kadroyu ve atölye stoklarını edinir',()=>{
 const old=fresh();old.npcs=old.npcs.slice(0,11);old.stores={grain:7};const s=restore(JSON.stringify(old));
 assert.equal(s.stores.grain,7);assert.equal(s.npcs.length,281);assert.equal(s.stores['dokuma/0'],2)
});
test('Mahalle hareketi, mesaiye gidiş ve geceleri süren devriye',()=>{
 const g=new Palace(),seen=new Set();let moving=0,samples=0;
 for(let i=0;i<1600;i++){
  g.tick(.1);if(i%10===0){
   moving+=g.s.npcs.filter(n=>n.moving).length;samples++;
   assert.ok(g.s.npcs.filter(n=>n.room==='court'&&n.x<800&&n.y<480).length<35);
   seen.add(g.s.npcs.find(n=>n.id==='iskele-0').room);
  }
 }
 assert.ok(moving/samples>60);assert.ok(seen.has('court')&&seen.has('warehouse'));
 const guard=g.s.npcs.find(n=>n.id==='ocak-2');g.s.minutes=1350;advance(g,50);assert.equal(guard.work.period,'work');
 assert.equal(g.s.npcs.find(n=>n.id==='terzi-3').work.period,'rest')
});
test('Hammadde alımında ayrılır, mamul ancak fiziki teslimde kayda girer',()=>{
 const g=new Palace(),n=g.s.npcs.find(n=>n.id==='dokuma-3'),d=g.note(n),w=n.work;
 const key='dokuma/0',output='dokuma/1',before=g.s.stores[key],stock=g.s.stores[output];
 place(n,d.plan.source.room,d.plan.source.point,g.s);n.wait=0;g.tickNPC(n,.1);
 assert.equal(w.leg,'bench');assert.equal(g.s.stores[key],before-1);
 const copy=new Palace(restore(JSON.stringify(g.s))),worker=copy.s.npcs.find(a=>a.id===n.id);
 for(let i=0;i<4000&&worker.work.leg!=='receiver';i++)copy.tickNPC(worker,.05);
 assert.equal(worker.work.leg,'receiver');assert.equal(copy.s.stores[output],stock);
 for(let i=0;i<4000&&!worker.work.cycles;i++)copy.tickNPC(worker,.05);
 assert.equal(worker.work.cycles,1);assert.equal(copy.s.stores[output],stock+1);assert.equal(copy.s.stores[key],before-1);
 const end=worldPoint(d.plan.receiver.room,...d.plan.receiver.point);assert.ok(Math.hypot(worker.x-end[0],worker.y-end[1])<4)
});
import {commission} from '../dist/src/estate.js?v=8';
import {coffeeOpen,parcels} from '../dist/src/city.js?v=8';
import {period,routineSite} from '../dist/src/daylife.js?v=8';
test('Boğaz iki kıyıdan kesintisiz aşılır ve sürüş kıyıda sona erer',()=>{
 const g=new Palace(),p=g.s.player;
 Object.assign(p,{x:1510,y:605});g.s.life.mounted=true;g.s.npcs=[];
 assert.ok(g.moveTo(2380,605));const seen=new Set();
 for(let i=0;i<400&&g.motion.length;i++){
  const prev=[p.x,p.y];g.tick(.05);assert.ok(Math.hypot(p.x-prev[0],p.y-prev[1])<=142*.05);
  seen.add(p.room);
 }
 assert.ok(seen.has('strait'));assert.equal(p.room,'uskudar');assert.equal(p.x,2380);
 assert.equal(g.s.life.mounted,false);const h=g.s.life.horse;assert.ok(!water(h.x,h.y));
});
test('Eski iç mekân kaydı dünya konumuna taşınır, sonraki yüklemede sabit kalır',()=>{
 const s=fresh();s.version=1;s.gold=123;Object.assign(s.player,{room:'council',x:410,y:271});s.npcs=[];
 const v=restore(JSON.stringify(s));assert.equal(v.version,2);assert.deepEqual([v.player.x,v.player.y],worldPoint('council',410,271));assert.equal(v.gold,123);assert.deepEqual(restore(JSON.stringify(v)).player,v.player)
});
test('Kahvehanenin açılışı ve mahalledeki haftalık izin takvimi',()=>{
 const g=new Palace();assert.equal(isOpen('kahve',g.s),false);
 assert.equal(worldRoute([0,330],landmark('kahve'),g.s).length,0);
 g.s.minutes=1440*365.25*35;assert.ok(coffeeOpen(g.s.minutes));assert.ok(isOpen('kahve',g.s));
 const d=people.find(d=>d.plan&&!d.plan.nightWatch);
 const noon=1440*(d.plan.seed%7)+630;
 assert.equal(period(d.plan,noon),'leave');assert.notEqual(routineSite(d,{work:{}},noon).room,d.home);
});
test('Mülk alımı ve ekipli inşaat kayıttan sonra tamamlanır',()=>{
 const g=new Palace(),gold=g.s.gold;
 assert.equal(commission(g,'oldYali'),'');assert.ok(commission(g,'oldYali'));
 assert.equal(g.s.gold,gold-parcels.oldYali.price);
 assert.equal(commission(g,'mosqueLand'),'');assert.ok(commission(g,'yalıLand'));
 assert.equal(isOpen('mosqueLand',g.s),false);
 const copy=new Palace(restore(JSON.stringify(g.s)));advance(copy,540);
 assert.equal(copy.s.estate.mosqueLand.status,'owned');assert.ok(isOpen('mosqueLand',copy.s));
 assert.equal(copy.s.npcs.find(n=>n.id==='insaat-3').duty,'routine');
 assert.equal(commission(copy,'yalıLand'),'');advance(copy,540);assert.equal(copy.s.estate.yalıLand.status,'owned');
});
