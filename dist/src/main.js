import {worldPoint,landmark,buildingAt,isOpen,locationAt} from './geography.js?v=7';
import {commission} from './estate.js?v=7';
import {parcels} from './city.js?v=7';
import {movementStick} from './touch.js?v=7';
import {departments,personnel} from './roster.js?v=7';
import {goods,trades,workStatus} from './work.js?v=7';
import {districts,mandates,officers,eligible,issue,revoke,summary} from './council.js?v=7';
import {rooms,clockText,dateText} from './data.js?v=7';
import {Palace} from './simulation.js?v=7';
import {Renderer} from './render.js?v=7';
import {targets,usePlace,dismount,consume} from './life.js?v=7';
import {districtName} from './district.js?v=7';
import {chart,overview} from './cartography.js?v=7';
import {icons} from './icons.js?v=7';
const $=id=>document.getElementById(id),world=$('world'),dialog=$('dialog'),body=$('modalbody');
let storage;try{storage=window.localStorage}catch{}
const game=Palace.load(storage),s=game.s,renderer=new Renderer(world),keys=new Set();
const stick=movementStick($('stick'));
let view='',t=0,last=performance.now(),uiTime=0,saveTime=0,msgUntil=0,storageOK=true,soundContext;
const el=(tag,txt)=>{const a=document.createElement(tag);a.textContent=txt;return a};
function save(){try{game.save(storage);storageOK=true}catch{storageOK=false}}
function toast(text){$('message').textContent=text;$('message').style.display='block';msgUntil=performance.now()+3600}
function beep(hz=370){if(!s.sound)return;try{soundContext??=new AudioContext();soundContext.resume().catch(()=>{});let o=soundContext.createOscillator(),g=soundContext.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.045,soundContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,soundContext.currentTime+.14);o.connect(g).connect(soundContext.destination);o.start();o.stop(soundContext.currentTime+.15)}catch{}}
function toggleSound(){s.sound=!s.sound;beep();save();menu()}
function button(title,detail,action,disabled=false){const b=el('button','');b.append(el('strong',title));if(detail)b.append(el('small',detail));b.disabled=disabled;b.onclick=()=>{beep();action()};body.append(b);return b}
function modal(id,cap,title){
 const switching=!dialog.open||view!==id;
 keys.clear();stick.reset();view=id;$('modalcap').textContent=cap;$('modaltitle').textContent=title;
 body.replaceChildren();if(!dialog.open)dialog.showModal();
 for(const tab of $('panelnav').children){
  if(tab.dataset.view===id)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current');
 }
 if(switching){body.scrollTop=0;$('close').focus({preventScroll:true})}
}
function close(){if(dialog.open)dialog.close();view='';world.focus({preventScroll:true})}
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});$('close').onclick=close;
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
game.register('chronicle',{event(type,text){if(type==='record'){toast(text);beep(310);refresh();save()}}});
function census(selected='divan'){
 modal('census','RÛZNÂME · '+s.npcs.length+' KİŞİ','Teşkilat ve mesai');
 const picker=el('select','');picker.setAttribute('aria-label','Birim');
 for(const [id,unit] of departments){const option=el('option',unit[1]);option.value=id;picker.append(option)}
 picker.value=selected;picker.onchange=()=>census(picker.value);body.append(picker);
 const unit=departments.get(selected),staff=s.npcs.filter(n=>game.note(n).unit===selected);
 body.append(el('p',staff.length+' kişi · '+s.stores[selected+'/4']+' '+unit[4]+' hazır.'));
 const active=(s.priority[selected]??0)>s.minutes;
 button(active?'Öncelikli mesai yürürlükte':'Birime öncelik ver',active?'Kalan süre '+Math.ceil(s.priority[selected]-s.minutes)+' dakika':'180 akçe · Altı saat boyunca işler %50 daha hızlı ilerler.',()=>{
  s.gold-=180;s.priority[selected]=s.minutes+360;game.log(unit[1]+' için öncelikli mesai buyuruldu.');census(selected)
 },active||s.gold<180);
 button('Bir saat geçir','Tüm birimlerin mesaisi sürer.',()=>{advanceClock(60);census(selected)});
 const search=el('input','');search.type='search';search.placeholder='281 kişi içinde ad veya görev ara';search.setAttribute('aria-label','Tüm teşkilatta ara');search.className='directory-search';body.append(search);
 const list=el('div','');body.append(list);
 function showPeople(){
  const q=search.value.trim().toLocaleLowerCase('tr');list.replaceChildren();
  const matches=q?s.npcs.filter(n=>{const d=game.note(n);return [d.name,d.role,departments.get(d.unit)[1]].some(v=>v.toLocaleLowerCase('tr').includes(q))}):staff;
  if(!matches.length){list.append(el('p','Eşleşen kişi bulunamadı.'));return}
  for(const n of matches.slice().sort((a,b)=>(game.note(b).slot??10)-(game.note(a).slot??10))){
   const d=game.note(n),boss=personnel.get(d.boss),row=el('article','');row.className='person-row';
   row.append(el('strong',d.name+' · '+d.role),el('span',departments.get(d.unit)[1]+' · '+d.rank),
    el('span','Amiri: '+(boss?boss.name+' ('+boss.role+')':'Padişah')),
    el('span',rooms[n.room].name+' · '+workStatus(n,s)+' · '+n.work.cycles+' iş tamamlandı'));list.append(row);
  }
 }
 search.oninput=showPeople;showPeople();

}
function advanceClock(minutes,stopAtReport=false){
 const end=s.minutes+minutes,count=s.office.jobs.length;
 game.motion=[];game.target=null;
 while(s.minutes<end&&(!stopAtReport||s.office.jobs.length===count))game.tick(.25);
 save();refresh();
}
function decrees(type='provision',zone='kitchen',officer='porter',amount=1){
 modal('orders','DİVAN-I HÜMAYUN','Hüküm ver');
 const fields=el('div','');fields.className='fields';body.append(fields);
 function field(label,options,value){
  const wrap=el('label',label),select=el('select','');
  for(const [id,name] of options){const opt=el('option',name);opt.value=id;select.append(opt)}
  select.setAttribute('aria-label',label);select.value=value;wrap.append(select);fields.append(wrap);return select;
 }
 const action=field('Hüküm',Object.entries(mandates).map(([id,v])=>[id,v.name]),type);
 const region=field('Bölge',Object.entries(districts).map(([id,v])=>[id,v.name]),zone);
 const available=officers.filter(id=>eligible(id,type));
 if(!available.includes(officer))officer=available[0];
 const agent=field('Vekil',available.map(id=>[id,personnel.get(id).role+' · '+personnel.get(id).name]),officer);
 const qty=field('Miktar',Array.from({length:8},(_,i)=>[i+1,String(i+1)]),amount);
 const a=s.office.accounts[zone],rule=mandates[type],error=summary(s,type,zone,amount,officer);
 body.append(el('p',rule.help),el('p','Bölgede '+a.grain+' çuval zahire, '+a.guards+' muhafız, '+a.levies+' vergi payı · Huzur '+a.peace+'/100 · '+a.served+' kişiye aş dağıtıldı.'));
 for(const [index,sel] of [action,region,agent,qty].entries())sel.onchange=()=>{
  decrees(action.value,region.value,agent.value,Number(qty.value));
  body.querySelectorAll('.fields select')[index].focus({preventScroll:true});
 };
 button('Mühürle · '+(rule.cost*amount)+' akçe',error||amount+' '+rule.unit,()=>{issue(game,type,zone,amount,officer);decrees(type,zone,officer,amount)},!!error).classList.add('primary');
 for(const j of s.office.jobs){
  const name=game.note(s.npcs.find(n=>n.id===j.officer)).name;
  const row=el('article','');row.className='entry';
  row.append(el('strong',mandates[j.type].name+' · '+districts[j.zone].name),
   el('span',name+' · '+({pickup:'Ambara gidiyor',travel:'Yolda',work:'İcra ediliyor'}[j.phase])+(j.executor?' · '+personnel.get(j.executor).name:'')));
  body.append(row);
  row.append(button('Hükmü geri al','№ '+j.id,()=>{revoke(game,j.id);decrees()}));

 }
 if(s.office.jobs.length)button('Sonraki arza kadar bekle','En çok dört oyun saati geçir.',()=>{advanceClock(240,true);decrees(type,zone,officer,amount)});
 if(s.events.length>1)body.append(el('p',s.events.at(-1).text));
 button('Mesai defteri','Saray, iskele ve çarşıdaki herkesin işi',census);
 button('Divanı topla','Sadrazam, kapıcıbaşı ve kâtip Kubbealtı’na gelir.',()=>{game.order('council');close()},game.active('council')||s.office.jobs.some(j=>['vizier','lala','scribe'].includes(j.officer)));
}
function codex(){modal('log','SARAY DEFTERİ','Vekayinâme');for(const a of s.events.slice().reverse()){const row=el('div','');row.className='entry';row.append(el('time',dateText(a.time)+' · '+clockText(a.time)),el('span',a.text));body.append(row)}}
function navigateTo(x,y,target){if(!game.moveTo(x,y,target)){toast('Bu nokta kapalı. Yakınında açık bir yer seç.');return false}return true}
function guide(id,parcel){
 const p=parcels[parcel],where=p?worldPoint(p.room,p.x+24,p.y+12):landmark(id);
 if(navigateTo(...where,p?{kind:'estate',id:parcel}:null)){game.pin={x:where[0],y:where[1]};close()}
}
function estates(){
 modal('estate','MÜLK DEFTERİ','Emlak ve imar');
 for(const [id,p] of Object.entries(parcels))button(p.name,rooms[p.room].name+' · '+(s.estate[id]?.status==='owned'?'Mülkün':s.estate[id]?'İnşa ediliyor':p.price+' akçe'),()=>estate(id));
}
function estate(id){
 const p=parcels[id],job=s.estate[id];modal('estate',rooms[p.room].name,p.name);
 if(job?.status==='owned'&&p.build)body.append(el('p',rooms[id].name));
 if(!job)button(p.build?(p.kind==='mosque'?'Mahalle camii yaptır':'Sahil yalısı yaptır'):'Mülkü satın al',p.price+' akçe'+(p.build?' · Yapı kalfası ve duvar ustası sahaya gider.':''),()=>{
  const error=commission(game,id);estate(id);if(error)body.append(el('p',error))
 },s.gold<p.price);
 else if(job.status==='building'){
  body.append(el('p',job.progress?'İnşaat ilerliyor · %'+Math.floor(job.progress/1.2):'Yapı kalfası ve usta arsaya gidiyor.'));
  button('İnşaatı bekle','En çok altı oyun saati geçir.',()=>{const end=s.minutes+360;game.motion=[];game.target=null;while(s.minutes<end&&job.status==='building')game.tick(.25);save();refresh();estate(id)});
 }else body.append(el('p','Mülk kaydı tamamlandı. Yapıyı ziyaret edebilirsin.'));
 button('Yerinde gör',rooms[p.room].name,()=>guide(job?.status==='owned'?id:p.room,job?.status==='owned'?undefined:id));
 button('Mülk defterine dön','',estates);
}
function atlas(){
 modal('map','İSTANBUL','Şehir haritası');
 const map=el('canvas','');map.className='atlas';map.setAttribute('aria-label','İstanbul haritası üzerinde hedef seç');body.append(map);
 const {draw,pick}=overview(map,game);
 const note=el('p','Haritada bir yere dokun veya listeden bir hedef seç.');body.append(note);
 const select=el('select','');select.setAttribute('aria-label','Harita hedefi');
 const empty=el('option','Hedef seç…');empty.value='';select.append(empty);
 for(const [id,r] of Object.entries(rooms)){
  const option=el('option',r.name);option.value=id;option.disabled=!isOpen(id,s);select.append(option);
 }
 body.append(select);
 const go=button('Buraya git','Yön vererek rotadan ayrılabilirsin.',()=>{
  if(game.pin&&navigateTo(game.pin.x,game.pin.y))close();
 },!game.pin);
 function mark(x,y,name){game.pin={x,y};draw();go.disabled=false;note.textContent='Hedef · '+name}
 map.onclick=e=>{const [x,y]=pick(e);select.value='';mark(x,y,rooms[locationAt(x,y,s)].name)};
 select.onchange=()=>{if(select.value)mark(...landmark(select.value),rooms[select.value].name)};
 if(game.pin)note.textContent='Hedef · '+rooms[locationAt(game.pin.x,game.pin.y,s)].name;
 button('Emlak ve imar','Evler, yalılar ve arsalar',estates);
}
function bag(){
 modal('bag','SULTAN SÜLEYMAN','Heybe');
 const l=s.life;body.append(el('p','Dayanıklılık '+Math.round(l.stamina)+'/100 · Su '+Math.round(l.thirst)+'/100'));
 button('Ekmek · '+l.bread,'Ye · Dayanıklılık kazan',()=>{consume(game,'bread');bag()},!l.bread||l.stamina>=100);
 button('Matara · '+l.water+'/3','Su iç',()=>{consume(game,'water');bag()},!l.water||l.thirst>=100);

}
function wheel(){
 modal('wheel','HÜKÜMDAR','Hızlı menü');
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
 for(const a of ['WASD veya yön tuşlarıyla yürü. Shift ile koş. Dokunmatik ekranda çubuğu sürükleyerek yürü, kenarına çekerek koş. Zemine dokunarak da yürüyebilirsin.','Açık kapılardan yürüyerek gir. E ile yakındaki kişi, at veya tezgâhla etkileş. R ile attan in.','F hüküm, T teşkilat, I heybe, M harita, J vekayinâme. Oyun alanında Tab hızlı menüyü açar.','Doğuda çarşı, güneydoğuda iskele var. Haritada bu yerleri işaretleyebilirsin.','Boşluk veya Esc oyunu duraklatır.'])body.append(el('p',a))}
function talk(n){
 const d=game.note(n);modal('talk',d.role.toLocaleUpperCase('tr'),d.name);
 const tasks={escort:'Emriniz üzere yanınızdayım, hünkârım.',meal:'İmaret sofrasını meydana kuruyorum, hünkârım.',watch:'Kapılarda devriyedeyim, hünkârım.',plant:'Gül tarhlarının bakımındayım, hünkârım.',council:'Divan için Kubbealtı’nda toplanıyoruz, hünkârım.'};
 body.append(el('p','“'+(tasks[n.duty]||d.line)+'”'));
 body.append(el('p',workStatus(n,s)+' · '+n.work.cycles+' iş tamamlandı.'));
 if(officers.includes(n.id))button('Vazife tevdi et','Bu görevliye hüküm yaz.',()=>decrees(Object.keys(mandates).find(type=>eligible(n.id,type)),'kitchen',n.id));
 button('Ahvali sor','Sarayın bugünkü durumunu öğren.',()=>{body.querySelector('p').textContent='“'+(s.peace>=85?'Saray halkının gönlü ferah.':'Meydan sakin, hünkârım.')+' Hazinede '+s.gold.toLocaleString('tr-TR')+' akçe var. '+(game.active('meal')?'İmaret sofrası meydana kuruldu.':'Yeni arzlarınızı bekleriz.')+'”'});
 button(n.duty==='escort'?'Görevine gönder':'Maiyete al',n.duty==='escort'?'Günlük işine döner.':'Sarayda sana refakat eder.',()=>{game.escort(n);close()},['mandate','supervise','construction'].includes(n.duty));
 button('İhsanda bulun','40 akçe · İtibar +1 · Günde bir kez',()=>{s.gold-=40;s.esteem=Math.min(100,s.esteem+1);s.lastGrant=Math.floor(s.minutes/1440);game.log(d.name+' için 40 akçe ihsan buyuruldu.');close()},s.gold<40||s.lastGrant===Math.floor(s.minutes/1440))
}
function perform(obj){if(obj?.kind==='npc')talk(obj.item);else if(obj?.kind==='estate')estate(obj.id);
 else if(obj?.kind==='place'){if(obj.item.id==='gather'){gather();return}if(obj.item.id.startsWith('estate-')){estate(obj.item.id.slice(7));return}if(['sack','oven'].includes(obj.item.id)){decrees(obj.item.id==='sack'?'provision':'relief','kitchen',obj.item.id==='sack'?'porter':'cook');return}const result=usePlace(game,obj.item.id);if(result)toast(result)}
 else toast('Yakındaki bir görevliye veya tezgâha yaklaş.')}
function gather(){
 const p=s.player;modal('gather','ŞEHİR HAYATI',p.room==='tahtakale'?'Şerbetçi tezgâhı':rooms[p.room].name);
 const near=s.npcs.filter(n=>n.room===p.room&&Math.hypot(n.x-p.x,n.y-p.y)<250).slice(0,8);
 if(!near.length)body.append(el('p','Şu an çevrede sohbet eden kimse yok.'));
 for(const n of near)button(game.note(n).name,workStatus(n,s),()=>talk(n));
 button('Burada yarım saat geçir','Mahallelinin mesaisi ve ziyaretleri sürer.',()=>{advanceClock(30);gather()});
}
function act(){perform(game.nearby())}
function walkToNPC(n){
 if(Math.hypot(n.x-s.player.x,n.y-s.player.y)<=34){talk(n);return}
 navigateTo(n.x,n.y,{kind:'npc',item:n})
}
function refresh(){
 const p=s.player,l=s.life;
 $('area').textContent=p.room==='court'?districtName(p.x,p.y):rooms[p.room].name;
 $('day').textContent=dateText(s.minutes);$('time').textContent=clockText(s.minutes);
 $('gold').textContent=s.gold.toLocaleString('tr-TR')+' akçe';
 $('stamina').value=l.stamina;$('thirst').value=l.thirst;$('ride').hidden=!l.mounted;
 $('count').hidden=!s.office.jobs.length;$('count').textContent=s.office.jobs.length;
 const a=game.nearby();$('prompt').textContent=a?(a.kind==='npc'?'Konuş · '+game.note(a.item).name:a.item.label):'Etkileş';
 $('interact').hidden=!a;
 chart($('radar').getContext('2d'),game,p.x,p.y,.28)
}
$('seal').onclick=()=>decrees();$('menu').onclick=menu;$('interact').onclick=act;$('mapkey').onclick=atlas;$('staff').onclick=()=>census();$('chart').onclick=atlas;$('journal').onclick=codex;$('pouch').onclick=bag;$('ride').onclick=()=>dismount(game);
const pages={orders:decrees,census,map:atlas,log:codex,bag};
for(const tab of $('panelnav').children)tab.onclick=()=>pages[tab.dataset.view]();
world.addEventListener('pointerdown',e=>{world.focus({preventScroll:true});
 const [x,y]=renderer.project(e.clientX,e.clientY);
 const obj=targets(s).find(a=>Math.abs(a.x-x)<14&&y>=a.y-(a.id==='horse'?38:13)&&y<a.y+8);
 if(obj){const item={kind:'place',item:obj};if(Math.hypot(obj.x-s.player.x,obj.y-s.player.y)<34)perform(item);else navigateTo(obj.x,obj.y,item);return}
 const n=s.npcs.find(n=>(!buildingAt(n.x,n.y,s)||n.room===s.player.room)&&Math.abs(n.x-x)<11&&y>=n.y-36&&y<n.y+5);if(n){walkToNPC(n);return}
 navigateTo(x,y)
});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
 if(dialog.open){if(view==='wheel'){const fn={m:atlas,f:decrees,i:bag,j:codex,tab:close}[k];if(fn){e.preventDefault();fn()}}return}
 if(k==='tab'&&document.activeElement!==world)return;
 if((k===' '||k==='enter')&&e.target.closest?.('button'))return;
 if(k==='tab')e.preventDefault();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 keys.add(k);if(e.repeat)return;const fn={e:act,f:decrees,t:census,m:atlas,j:codex,'?':help,' ':menu,escape:menu,tab:wheel,i:bag,r:()=>dismount(game)}[k];if(fn)fn()});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();stick.reset()});window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{keys.clear();stick.reset();last=performance.now();if(document.hidden)save()});
function frame(now){
 const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
 if(!dialog.open&&!document.hidden){t+=dt;const on=(...input)=>input.some(k=>keys.has(k))?1:0;for(let remaining=dt;remaining>0;remaining-=.04)game.tick(Math.min(.04,remaining),on('d','arrowright')-on('a','arrowleft')+stick.x,on('s','arrowdown')-on('w','arrowup')+stick.y,keys.has('shift')||stick.run);
 if(game.target&&!game.motion.length){const target=game.target;game.target=null;
 if(target.kind==='npc'){if(Math.hypot(target.item.x-s.player.x,target.item.y-s.player.y)<=34)talk(target.item);else walkToNPC(target.item)}
 else perform(target)}
 }
 renderer.render(game,t);if(now>uiTime){refresh();uiTime=now+230}if(now>msgUntil)$('message').style.display='none';if(now>saveTime){save();saveTime=now+5000}requestAnimationFrame(frame);
}
icons();refresh();requestAnimationFrame(frame);
