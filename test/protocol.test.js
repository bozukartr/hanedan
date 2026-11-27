import test from 'node:test';
import assert from 'node:assert/strict';
import {Palace,restore} from '../dist/src/simulation.js?v=8';
import {callGuard,attendants,dismissGuard,encounter} from '../dist/src/protocol.js?v=8';
import {issue,petition} from '../dist/src/council.js?v=8';
import {manageTraffic} from '../dist/src/foot-traffic.js?v=8';
import {gesture} from '../dist/src/gestures.js?v=8';

test('Maiyet çağrısı müsait muhafızları seçer ve saf aralığı değişir',()=>{
 const g=new Palace(),s=g.s,p=s.player;assert.equal(callGuard(g),3);assert.equal(callGuard(g),0);
 for(let i=0;i<320;i++)g.tick(.1);
 const staff=attendants(s);assert.equal(staff.length,3);
 const gap=Math.hypot(staff[0].x-staff[1].x,staff[0].y-staff[1].y);assert.ok(gap>15);
 s.household.formation='procession';for(let i=0;i<80;i++)g.tick(.1);
 assert.ok(Math.hypot(staff[0].x-staff[1].x,staff[0].y-staff[1].y)>gap+15);
 assert.ok(staff.every(n=>Math.hypot(n.x-p.x,n.y-p.y)<85));dismissGuard(g);assert.equal(attendants(s).length,0);
});
test('Yol verme görünürlük, mesai ve karşılaşma belleğine bağlıdır',()=>{
 const g=new Palace(),p=g.s.player,n=g.s.npcs.find(n=>n.id==='guard'),d=g.note(n);
 Object.assign(p,{x:400,y:217,heading:Math.PI,moving:true});Object.assign(n,{x:402,y:235});
 assert.ok(encounter(g,n,d,.1));assert.equal(n.reaction.pose,'salute');assert.equal(n.reaction.steps.length,1);
 const start=n.x;for(let i=0;i<45;i++){g.s.minutes+=.13;encounter(g,n,d,.1)}
 assert.ok(Math.abs(n.x-start)>12);assert.equal(n.reaction,undefined);
 Object.assign(n,{x:190,y:131,greeted:false});Object.assign(p,{x:210,y:74});assert.equal(encounter(g,n,d,.1),false);
});
test('Karşılaşan iki yayadan biri yol verir, ulak önceliğini korur',()=>{
 const g=new Palace(),a=g.s.npcs[0],b=g.s.npcs[1];g.s.npcs=[a,b];
 Object.assign(a,{x:390,y:220,path:[[465,220]],moving:true,duty:'courier'});
 Object.assign(b,{x:408,y:220,path:[[334,220]],moving:true,duty:'routine'});
 manageTraffic(g.s);assert.ok(b.yieldUntil>g.s.minutes);assert.equal(a.yieldUntil,undefined);assert.equal(b.path.length,2);
});
test('Ulak sonucu icra noktasından alır, hareket eden hükümdara ulaştırır, çift teslim yapmaz',()=>{
 let g=new Palace();assert.equal(petition(g.s).type,'relief');assert.equal(issue(g,'relief','kitchen',1,'cook'),'');
 for(let i=0;i<1600&&!g.s.household.reports.some(r=>r.stage==='return');i++)g.tick(.1);
 const before=g.s.household.reports[0];assert.equal(before.stage,'return');assert.equal(g.s.office.accounts.kitchen.served,20);
 g=new Palace(restore(JSON.stringify(g.s)));const s=g.s,r=s.household.reports[0],n=s.npcs.find(n=>n.id===r.courier);
 assert.equal(n.duty,'courier');assert.ok(!s.events.some(e=>e.text.includes('sıcak aş dağıtıldı')));
 assert.ok(g.moveTo(1000,435));for(let i=0;i<1600&&r.stage!=='delivered';i++)g.tick(.1);
 assert.equal(r.stage,'delivered');assert.ok(Math.hypot(n.x-s.player.x,n.y-s.player.y)<22);
 for(let i=0;i<90;i++)g.tick(.1);assert.equal(s.events.filter(e=>e.text.includes('sıcak aş dağıtıldı')).length,1);
 assert.equal(s.office.accounts.kitchen.served,20);assert.equal(n.duty,'routine');
});
test('Çalışma hareketi mesleğe, üretim aşamasına ve eldeki işe bağlıdır',()=>{
 const g=new Palace();
 for(const [id,expected] of [['dokuma-4','weave'],['bakir-4','hammer'],['kiler-4','hammer'],['cilt-4','write'],['imaret-4','stir']]){
  const n=g.s.npcs.find(n=>n.id===id);n.work.leg='bench';n.work.progress=3;n.work.period='work';
  assert.equal(gesture(n,g.note(n),g.s),expected);
  n.moving=true;assert.equal(gesture(n,g.note(n),g.s),'');
 }
});

test('Önceki şehir kaydı hazine ve görevleriyle açılır, bekleyen arzlar boş başlar',()=>{
 const old=new Palace();issue(old,'provision','kitchen',1,'porter');delete old.s.household;
 const copy=new Palace(restore(JSON.stringify(old.s)));
 assert.deepEqual(copy.s.household,{formation:'close',reports:[]});
 assert.equal(copy.s.office.jobs[0].officer,'porter');assert.equal(copy.s.gold,old.s.gold);
});
