import {rooms,orders,clockText,dateText,WIDTH,HEIGHT} from './data.js?v=2';
import {Palace} from './simulation.js?v=2';
import {Renderer} from './render.js?v=2';
import {targets,usePlace,dismount,consume} from './life.js?v=2';
import {districtName,outerWidth,outerHeight} from './district.js?v=2';
import {chart} from './cartography.js?v=2';
import {icons} from './icons.js?v=2';
const $=id=>document.getElementById(id),world=$('world'),dialog=$('dialog'),body=$('modalbody');
let storage;try{storage=window.localStorage}catch{}
const game=Palace.load(storage),s=game.s,renderer=new Renderer(world),keys=new Set();
let view='',t=0,last=performance.now(),uiTime=0,saveTime=0,msgUntil=0,storageOK=true,soundContext;
const el=(tag,txt)=>{const a=document.createElement(tag);a.textContent=txt;return a};
function save(){try{game.save(storage);storageOK=true}catch{storageOK=false}}
function toast(text){$('message').textContent=text;$('message').style.display='block';msgUntil=performance.now()+3600}
function beep(hz=370){if(!s.sound)return;try{soundContext??=new AudioContext();soundContext.resume().catch(()=>{});let o=soundContext.createOscillator(),g=soundContext.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.045,soundContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,soundContext.currentTime+.14);o.connect(g).connect(soundContext.destination);o.start();o.stop(soundContext.currentTime+.15)}catch{}}
function toggleSound(){s.sound=!s.sound;beep();save();menu()}
function button(title,detail,action,disabled=false){const b=el('button','');b.append(el('strong',title));if(detail)b.append(el('small',detail));b.disabled=disabled;b.onclick=()=>{beep();action()};body.append(b)}
function modal(id,cap,title){keys.clear();view=id;$('modalcap').textContent=cap;$('modaltitle').textContent=title;body.replaceChildren();if(!dialog.open)dialog.showModal();dialog.classList.toggle('wheel',id==='wheel');$('close').focus()}
function close(){if(dialog.open)dialog.close();view='';world.focus({preventScroll:true})}
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});$('close').onclick=close;
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
game.register('chronicle',{event(type,text){if(type==='record'){toast(text);beep(310);refresh();save()}}});
function decrees(){modal('orders','DİVAN-I HÜMAYUN','Ferman ver');body.append(el('p','Mührünü taşıyan emirleri saray görevlileri yerine getirir.'));
 for(const d of orders){const active=game.active(d.id);button(d.name,active?'Yürürlükte · '+Math.ceil(s.issued[d.id]-s.minutes)+' dakika kaldı':d.detail,()=>{if(game.order(d.id))close()},active||s.gold<d.cost)}}
function codex(){modal('log','SARAY DEFTERİ','Vekayinâme');for(const a of s.events.slice().reverse()){const row=el('div','');row.className='entry';row.append(el('time',dateText(a.time)+' · '+clockText(a.time)),el('span',a.text));body.append(row)}}
function navigateTo(x,y,target){if(!game.moveTo(x,y,target)){toast('Buraya yürünecek açık bir yol yok.');return false}return true}
function guide(to){const room=rooms[s.player.room],e=room.exits.find(a=>a.to===to)||room.exits.find(a=>a.to==='court');
 if(e){close();navigateTo(e.x,e.y,{kind:'exit',item:e});toast('Geçide doğru yürüyorsun: '+e.label)}}
function atlas(){
 modal('map','İSTANBUL · 1520','Saray ve çevresi');
 const map=el('canvas','');map.className='atlas';map.width=600;map.height=345;map.setAttribute('aria-label','İstanbul haritası, yol işaretlemek için dokun.');
 body.append(map);const exterior=s.player.room==='court';
 const w=exterior?outerWidth:WIDTH,h=exterior?outerHeight:HEIGHT,scale=Math.min(map.width/w,map.height/h);
 const draw=()=>chart(map.getContext('2d'),game,w/2,h/2,scale);draw();
 map.onclick=e=>{const box=map.getBoundingClientRect();const x=Math.round(w/2+((e.clientX-box.left)/box.width-.5)*map.width/scale);
 const y=Math.round(h/2+((e.clientY-box.top)/box.height-.5)*map.height/scale);pin(x,y)};
 function pin(x,y){game.pin={room:s.player.room,x,y};draw();note.textContent='İşaret kondu. Radar üzerinde kırmızı halka ile gösterilir.'}
 const note=el('p','Haritaya dokunarak yol işareti koy.');note.className='mapnote';body.append(note);
 if(exterior){for(const a of [[972,395,'Esnaf Çarşısı'],[1430,750,'İskele ambarı'],[400,310,'Divan Meydanı']]){
 button(a[2],'Yol işareti koy',()=>{pin(a[0],a[1]);close();toast(a[2]+' işaretlendi.')})}}
 for(const e of rooms[s.player.room].exits)button(e.label,'Geçide yürü',()=>guide(e.to))
}
function bag(){
 modal('bag','SULTAN SÜLEYMAN','Heybe');
 const l=s.life;body.append(el('p','Dayanıklılık '+Math.round(l.stamina)+'/100 · Su '+Math.round(l.thirst)+'/100'));
 button('Ekmek · '+l.bread,'Ye · Dayanıklılık kazan',()=>{consume(game,'bread');bag()},!l.bread||l.stamina>=100);
 button('Matara · '+l.water+'/3','Su iç',()=>{consume(game,'water');bag()},!l.water||l.thirst>=100);
 if(l.cargo)body.append(el('p','Omzunda bir çuval un var. Saray mutfağındaki aşçı tezgâhına teslim edebilirsin.'));
 body.append(el('p','Mutfağa teslim edilen çuval: '+l.deliveries));
}
function wheel(){
 modal('wheel','HÜKÜMDAR','Hükümdar çarkı');
 button('Ferman','F',decrees);button('Harita','M',atlas);button('Heybe','I',bag);button('Vekayinâme','J',codex);
}
function menu(){
 modal('menu','HANEDAN','Oyun duraklatıldı');
 body.append(el('p','İtibar '+s.esteem+' · Huzur '+s.peace+' · '+(storageOK?'Otomatik kayıt açık':'Kayıt kapalı')));
 button('Oyuna dön','Esc',close);button('Saray erkânı','Bu bölgedeki görevliler',()=>{
 modal('people','SARAY','Bölgedeki görevliler');
 const present=s.npcs.filter(n=>n.room===s.player.room);if(!present.length)body.append(el('p','Burada görevli yok.'));
 for(const n of present)button(game.note(n).name,game.note(n).role,()=>{close();walkToNPC(n)})
 });
 button('Ses · '+(s.sound?'Açık':'Kapalı'),'',toggleSound);button('Kontroller','',help)
}
function help(){modal('help','OYUN KONTROLLERİ','Sarayda dolaş');
 for(const a of ['WASD veya yön tuşlarıyla yürü. Shift ile koş. Zemine dokunarak da yürüyebilirsin.','E ile yakındaki kişi, at, geçit veya tezgâhla etkileş. R ile attan in.','Tab hükümdar çarkını açar. F ferman, I heybe, M harita, J vekayinâme.','Doğuda çarşı, güneydoğuda iskele var. Haritada bu yerleri işaretleyebilirsin.','Boşluk veya Esc oyunu duraklatır.'])body.append(el('p',a))}
function talk(n){
 const d=game.note(n);modal('talk',d.role.toLocaleUpperCase('tr'),d.name);
 const tasks={escort:'Emriniz üzere yanınızdayım, hünkârım.',meal:'İmaret sofrasını meydana kuruyorum, hünkârım.',watch:'Kapılarda devriyedeyim, hünkârım.',plant:'Gül tarhlarının bakımındayım, hünkârım.',council:'Divan için Kubbealtı’nda toplanıyoruz, hünkârım.'};
 body.append(el('p','“'+(tasks[n.duty]||d.line)+'”'));
 button('Ahvali sor','Sarayın bugünkü durumunu öğren.',()=>{body.querySelector('p').textContent='“'+(s.peace>=85?'Saray halkının gönlü ferah.':'Meydan sakin, hünkârım.')+' Hazinede '+s.gold.toLocaleString('tr-TR')+' akçe var. '+(game.active('meal')?'İmaret sofrası meydana kuruldu.':'Yeni arzlarınızı bekleriz.')+'”'});
 button(n.duty==='escort'?'Görevine gönder':'Maiyete al',n.duty==='escort'?'Günlük işine döner.':'Sarayda sana refakat eder.',()=>{game.escort(n);close()});
 button('İhsanda bulun','40 akçe · İtibar +1 · Günde bir kez',()=>{s.gold-=40;s.esteem=Math.min(100,s.esteem+1);s.lastGrant=Math.floor(s.minutes/1440);game.log(d.name+' için 40 akçe ihsan buyuruldu.');close()},s.gold<40||s.lastGrant===Math.floor(s.minutes/1440))
}
function perform(obj){if(obj?.kind==='npc')talk(obj.item);else if(obj?.kind==='exit')game.enter(obj.item);else if(obj?.kind==='place'){const result=usePlace(game,obj.item.id);if(result)toast(result)}
 else toast('Konuşmak için bir görevliye, geçmek için bir kapıya yaklaş.')}
function act(){perform(game.nearby())}
function walkToNPC(n){
 if(n.room!==s.player.room){atlas();return}
 if(Math.hypot(n.x-s.player.x,n.y-s.player.y)<=34){talk(n);return}
 navigateTo(n.x,n.y,{kind:'npc',item:n})
}
function refresh(){
 const p=s.player,l=s.life;
 $('area').textContent=p.room==='court'?districtName(p.x,p.y):rooms[p.room].name;
 $('day').textContent=dateText(s.minutes);$('time').textContent=clockText(s.minutes);
 $('gold').textContent=s.gold.toLocaleString('tr-TR')+' akçe';
 $('stamina').value=l.stamina;$('thirst').value=l.thirst;$('ride').hidden=!l.mounted;
 $('equipped').textContent=l.mounted?'KIRAT':l.cargo?'UN ÇUVALI':'HÜKÜMDAR MÜHRÜ';
 const a=game.nearby();$('prompt').textContent=a?(a.kind==='npc'?'Konuş · '+game.note(a.item).name:a.item.label):'Etkileş';
 $('interact').hidden=!a;
 chart($('radar').getContext('2d'),game,p.x,p.y,.28)
}
$('menu').onclick=menu;$('interact').onclick=act;$('mapkey').onclick=atlas;$('wheelbtn').onclick=wheel;$('ride').onclick=()=>dismount(game);
world.addEventListener('pointerdown',e=>{world.focus({preventScroll:true});
 const [x,y]=renderer.project(e.clientX,e.clientY);
 const obj=targets(s).find(a=>Math.abs(a.x-x)<14&&y>=a.y-(a.id==='horse'?38:13)&&y<a.y+8);
 if(obj){const item={kind:'place',item:obj};if(Math.hypot(obj.x-s.player.x,obj.y-s.player.y)<34)perform(item);else navigateTo(obj.x,obj.y,item);return}
 const n=s.npcs.find(n=>n.room===s.player.room&&Math.abs(n.x-x)<11&&y>=n.y-36&&y<n.y+5);if(n){walkToNPC(n);return}
 const door=rooms[s.player.room].exits.find(d=>Math.hypot(d.x-x,d.y-y)<26||(Math.abs(d.x-x)<21&&d.y-y>0&&d.y-y<61));
 if(door){if(Math.hypot(s.player.x-door.x,s.player.y-door.y)<34){perform({kind:'exit',item:door});return}navigateTo(door.x,door.y,{kind:'exit',item:door});return}
 navigateTo(x,y)
});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
 if(dialog.open){if(view==='wheel'){const fn={m:atlas,f:decrees,i:bag,j:codex,tab:close}[k];if(fn){e.preventDefault();fn()}}return}
 if(k==='tab')e.preventDefault();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 keys.add(k);if(e.repeat)return;const fn={e:act,f:decrees,m:atlas,j:codex,'?':help,' ':menu,escape:menu,tab:wheel,i:bag,r:()=>dismount(game)}[k];if(fn)fn()});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{keys.clear();last=performance.now();if(document.hidden)save()});
function frame(now){
 const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
 if(!dialog.open&&!document.hidden){t+=dt;const on=(...input)=>input.some(k=>keys.has(k))?1:0;for(let remaining=dt;remaining>0;remaining-=.04)game.tick(Math.min(.04,remaining),on('d','arrowright')-on('a','arrowleft'),on('s','arrowdown')-on('w','arrowup'),keys.has('shift'));
 if(game.target&&!game.motion.length){const target=game.target;game.target=null;
 if(target.kind==='npc'&&target.item.room===s.player.room){if(Math.hypot(target.item.x-s.player.x,target.item.y-s.player.y)<=34)talk(target.item);else walkToNPC(target.item)}
 else if(target.kind==='exit'||target.kind==='place')perform(target)}
 }
 renderer.render(game,t);if(now>uiTime){refresh();uiTime=now+230}if(now>msgUntil)$('message').style.display='none';if(now>saveTime){save();saveTime=now+5000}requestAnimationFrame(frame);
}
icons();refresh();requestAnimationFrame(frame);
