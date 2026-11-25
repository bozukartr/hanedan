import test from 'node:test';
import assert from 'node:assert/strict';
import {Palace,fresh,restore} from '../dist/src/simulation.js';
import {rooms,dateText} from '../dist/src/data.js';
import {walkable,path,clear} from '../dist/src/navigation.js';
function advance(game,seconds){for(let i=0;i<seconds*20;i++)game.tick(.05)}
test('Başlangıç tarihi, karakter konumu ve yeni kayıt',()=>{
 const s=fresh();assert.equal(dateText(s.minutes),'30 Eylül 1520');assert.equal(s.player.room,'court');assert.equal(s.npcs.length,11);
 for(const n of s.npcs)assert.ok(walkable(n.room,n.x,n.y),n.id)
});
test('Tüm geçitler ve varış noktaları ulaşılabilir',()=>{
 for(const [name,r] of Object.entries(rooms))for(const e of r.exits){
 assert.ok(walkable(name,e.x,e.y));assert.ok(walkable(e.to,...e.arrive));
 const back=rooms[e.to].exits.find(x=>x.to===name);assert.ok(back);assert.ok(path(e.to,e.arrive,[back.x,back.y]).length)
 }
});
test('Yol bulma çeşmenin çevresini dolaşır',()=>{
 const start=[400,350],end=[402,166];assert.ok(!clear('court',start,end));assert.ok(!walkable('court',400,281));let from=start;let route=path('court',start,end);assert.ok(route.length>1);
 for(const to of route){assert.ok(clear('court',from,to));from=to}assert.deepEqual(from,end)
});
test('Elle hareket çarpışmaları korur',()=>{const g=new Palace();Object.assign(g.s.player,{x:399,y:358});for(let i=0;i<400;i++)g.tick(.03,0,-1);assert.ok(g.s.player.y>305);assert.ok(walkable('court',g.s.player.x,g.s.player.y))});
test('Ferman maliyeti bir kez ödenir ve aşçı meydana yürür',()=>{
 const g=new Palace();assert.ok(g.order('meal'));assert.ok(!g.order('meal'));assert.equal(g.s.gold,12160);advance(g,90);const cook=g.s.npcs.find(n=>n.id==='cook');assert.equal(cook.room,'court');assert.ok(Math.hypot(cook.x-515,cook.y-355)<3);
 g.s.gold=0;assert.ok(!g.order('plant'))
});
test('Divan gerçekten toplanır ve süre bitince dağılır',()=>{
 const g=new Palace();g.order('council');advance(g,70);assert.ok(['scribe','lala','vizier'].every(id=>g.s.npcs.find(n=>n.id===id).room==='council'));advance(g,180);assert.equal(g.s.npcs.find(n=>n.id==='scribe').room,'court')
});
test('Refakatçi kapıları izler; uzaktan geçiş engellenir',()=>{
 const g=new Palace(),n=g.s.npcs[1],e=rooms.court.exits[2];assert.equal(g.enter(e),false);g.escort(n);Object.assign(g.s.player,{x:e.x,y:e.y});assert.ok(g.enter(e));advance(g,60);assert.equal(n.room,'garden');g.escort(n);assert.equal(n.duty,'routine')
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
import {initialLife,usePlace,dismount,consume} from '../dist/src/life.js';
test('Eski kayıt yeni heybe ve at durumunu alır',()=>{const old=fresh();delete old.life;assert.deepEqual(restore(JSON.stringify(old)).life,initialLife())});
test('At, çuval, mutfak ve heybe',()=>{const g=new Palace(),p=g.s.player,l=g.s.life;Object.assign(p,l.horse);assert.equal(usePlace(g,'horse'),'');assert.ok(l.mounted);assert.ok(dismount(g));Object.assign(p,{x:1430,y:750});assert.equal(usePlace(g,'sack'),'');assert.ok(l.cargo);Object.assign(p,{room:'kitchen',x:305,y:247});assert.equal(usePlace(g,'oven'),'');assert.equal(l.deliveries,1);assert.equal(l.cargo,false);assert.ok(consume(g,'bread'))});
