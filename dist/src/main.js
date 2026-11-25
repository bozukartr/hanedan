import {rooms,orders,clockText,dateText,WIDTH,HEIGHT} from './data.js';
import {Palace} from './simulation.js';
import {Renderer} from './render.js';
import {portrait} from './art.js';
import {icons} from './icons.js';
const $=id=>document.getElementById(id),world=$('world'),dialog=$('dialog'),body=$('modalbody');
let storage;try{storage=window.localStorage}catch{}
const game=Palace.load(storage),s=game.s,renderer=new Renderer(world),keys=new Set();
let paused=false,view='',t=0,last=performance.now(),uiTime=0,saveTime=0,msgUntil=0,peopleKey='',soundContext;
const el=(tag,txt)=>{const a=document.createElement(tag);a.textContent=txt;return a};
function save(){try{game.save(storage);$('savestate').textContent='Otomatik kayıt açık'}catch{$('savestate').textContent='Bu tarayıcıda kayıt kapalı'}}
function toast(text){$('message').textContent=text;$('message').style.display='block';msgUntil=performance.now()+3600}
function beep(hz=370){if(!s.sound)return;try{soundContext??=new AudioContext();soundContext.resume().catch(()=>{});let o=soundContext.createOscillator(),g=soundContext.createGain();o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.045,soundContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,soundContext.currentTime+.14);o.connect(g).connect(soundContext.destination);o.start();o.stop(soundContext.currentTime+.15)}catch{}}
function toggleSound(){s.sound=!s.sound;controls();beep();save()}
function controls(){for(const [id,type,label] of [['sound',s.sound?'volume':'mute',s.sound?'Sesi kapat':'Sesi aç'],['pause',paused?'play':'pause',paused?'Sürdür':'Duraklat']]){const b=$(id);b.firstElementChild.dataset.icon=type;b.title=label;b.setAttribute('aria-label',label);icons(b)}}
function button(title,detail,action,disabled=false){const b=el('button','');b.append(el('strong',title));if(detail)b.append(el('small',detail));b.disabled=disabled;b.onclick=()=>{beep();action()};body.append(b)}
function navmark(){document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('selected',b.dataset.view===(['map','log'].includes(view)?view:'game')))}
function modal(id,cap,title){keys.clear();view=id;$('modalcap').textContent=cap;$('modaltitle').textContent=title;body.replaceChildren();if(!dialog.open)dialog.showModal();navmark();$('close').focus()}
function close(){if(dialog.open)dialog.close();view='';navmark();world.focus({preventScroll:true})}
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});$('close').onclick=close;
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
game.register('chronicle',{event(type,text){if(type==='record'){toast(text);beep(310);refresh();save()}}});
function decrees(){modal('orders','DİVAN-I HÜMAYUN','Ferman ver');body.append(el('p','Mührünü taşıyan emirleri saray görevlileri yerine getirir.'));
 for(const d of orders){const active=game.active(d.id);button(d.name,active?'Yürürlükte · '+Math.ceil(s.issued[d.id]-s.minutes)+' dakika kaldı':d.detail,()=>{if(game.order(d.id))close()},active||s.gold<d.cost)}}
function codex(){modal('log','SARAY DEFTERİ','Vekayinâme');for(const a of s.events.slice().reverse()){const row=el('div','');row.className='entry';row.append(el('time',dateText(a.time)+' · '+clockText(a.time)),el('span',a.text));body.append(row)}}
function navigateTo(x,y,target){if(!game.moveTo(x,y,target)){toast('Buraya yürünecek açık bir yol yok.');return false}return true}
function guide(to){const room=rooms[s.player.room],e=room.exits.find(a=>a.to===to)||room.exits.find(a=>a.to==='court');
 if(e){close();navigateTo(e.x,e.y,{kind:'exit',item:e});toast('Geçide doğru yürüyorsun: '+e.label)}}
function atlas(){modal('map','TOPKAPI SARAYI','Saray planı');
 const map=document.createElement('canvas');map.className='atlas';map.width=440;map.height=178;map.setAttribute('aria-label','Meydan, Kubbealtı, mutfak ve Hasbahçe bağlantıları');body.append(map);
 const c=map.getContext('2d');c.fillStyle='#e9e4ce';c.fillRect(0,0,440,178);c.strokeStyle='#b6ab88';for(let i=0;i<440;i+=16){c.strokeRect(i,0,16,178)}c.lineWidth=4;c.strokeStyle='#a79873';c.beginPath();c.moveTo(102,45);c.lineTo(220,91);c.lineTo(339,45);c.moveTo(220,91);c.lineTo(220,146);c.stroke();
 for(const [key,x,y] of [['council',101,40],['kitchen',337,40],['court',220,92],['garden',220,148]]){const here=s.player.room===key;c.fillStyle=here?'#24483d':'#d9cfb0';c.fillRect(x-62,y-13,124,26);c.strokeStyle='#9d8f68';c.lineWidth=1;c.strokeRect(x-62,y-13,124,26);c.textAlign='center';c.font='14px Georgia';c.fillStyle=here?'#f6e9bd':'#304f40';c.fillText(rooms[key].name,x,y+5)}
 for(const e of rooms[s.player.room].exits)button(e.label,'Geçide yürü',()=>guide(e.to))}
function help(){modal('help','OYUN KONTROLLERİ','Sarayda dolaş');for(const a of ['WASD veya yön tuşlarıyla yürü. Shift ile hızlan.','Zemine tıklayarak veya dokunarak bir yol belirle. Bir görevliye dokunursan yanına yürüyüp konuşursun.','E yakındaki kişiyle konuşur veya kapıdan geçer. F fermanları, M saray planını, J vekayinâmeyi açar.','Boşluk zamanı duraklatır. Esc açık pencereyi kapatır. İlerlemen bu tarayıcıya kaydedilir.'])body.append(el('p',a))}
function talk(n){
 const d=game.note(n);modal('talk',d.role.toLocaleUpperCase('tr'),d.name);
 const tasks={escort:'Emriniz üzere yanınızdayım, hünkârım.',meal:'İmaret sofrasını meydana kuruyorum, hünkârım.',watch:'Kapılarda devriyedeyim, hünkârım.',plant:'Gül tarhlarının bakımındayım, hünkârım.',council:'Divan için Kubbealtı’nda toplanıyoruz, hünkârım.'};
 body.append(el('p','“'+(tasks[n.duty]||d.line)+'”'));
 button('Ahvali sor','Sarayın bugünkü durumunu öğren.',()=>{body.querySelector('p').textContent='“'+(s.peace>=85?'Saray halkının gönlü ferah.':'Meydan sakin, hünkârım.')+' Hazinede '+s.gold.toLocaleString('tr-TR')+' akçe var. '+(game.active('meal')?'İmaret sofrası meydana kuruldu.':'Yeni arzlarınızı bekleriz.')+'”'});
 button(n.duty==='escort'?'Görevine gönder':'Maiyete al',n.duty==='escort'?'Günlük işine döner.':'Sarayda sana refakat eder.',()=>{game.escort(n);close()});
 button('İhsanda bulun','40 akçe · İtibar +1 · Günde bir kez',()=>{s.gold-=40;s.esteem=Math.min(100,s.esteem+1);s.lastGrant=Math.floor(s.minutes/1440);game.log(d.name+' için 40 akçe ihsan buyuruldu.');close()},s.gold<40||s.lastGrant===Math.floor(s.minutes/1440))
}
function perform(obj){if(obj?.kind==='npc')talk(obj.item);else if(obj?.kind==='exit')game.enter(obj.item);else toast('Konuşmak için bir görevliye, geçmek için bir kapıya yaklaş.')}
function act(){perform(game.nearby())}
function walkToNPC(n){
 if(n.room!==s.player.room){atlas();return}
 if(Math.hypot(n.x-s.player.x,n.y-s.player.y)<=34){talk(n);return}
 navigateTo(n.x,n.y,{kind:'npc',item:n})
}
function refresh(){
 $('area').textContent=rooms[s.player.room].name.toLocaleUpperCase('tr');$('day').textContent=dateText(s.minutes);
 const hr=Math.floor(s.minutes/60)%24;$('time').textContent=clockText(s.minutes)+' · '+(hr<5?'Gece':hr<12?'Sabah':hr<17?'Öğle':hr<20?'Akşam':'Gece');
 $('gold').textContent=s.gold.toLocaleString('tr-TR')+' akçe';$('esteem').textContent=s.esteem+' / 100';$('peace').textContent=s.peace+' / 100';
 const npcs=s.npcs.filter(n=>n.room===s.player.room),key=npcs.map(n=>n.id+n.duty).join(',');
 $('nearcount').textContent=npcs.length+' kişi';
 if(key!==peopleKey||!$('people').childNodes.length){peopleKey=key;$('people').replaceChildren();for(const n of npcs){const d=game.note(n),row=el('button',''),pic=el('canvas','');row.className='person';pic.width=32;pic.height=37;portrait(pic.getContext('2d'),d.color,false,d.id);const info=el('span','');info.append(el('strong',d.name),el('small',d.role+(n.duty==='escort'?' · Maiyette':'')));row.append(pic,info,el('em','›'));row.onclick=()=>walkToNPC(n);$('people').append(row)}if(!npcs.length)$('people').append(el('p','Bu bölgede görevli yok.'))}
 const a=game.nearby(),prompt=$('prompt');prompt.style.display=a?'block':'none';if(a)prompt.textContent='E · '+(a.kind==='npc'?game.note(a.item).name:a.item.label);
}
function pause(){paused=!paused;keys.clear();controls();toast(paused?'Oyun duraklatıldı.':'Oyun sürüyor.')}
$('sound').onclick=toggleSound;$('pause').onclick=pause;$('orders').onclick=decrees;$('interact').onclick=act;$('mapkey').onclick=atlas;$('prompt').onclick=act;$('help').onclick=help;
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>({map:atlas,log:codex,game:close}[b.dataset.view]()));
world.addEventListener('pointerdown',e=>{world.focus({preventScroll:true});if(paused){toast('Yürümek için oyunu sürdür.');return}
 const b=world.getBoundingClientRect(),x=(e.clientX-b.left)*WIDTH/b.width,y=(e.clientY-b.top)*HEIGHT/b.height;
 const n=s.npcs.find(n=>n.room===s.player.room&&Math.abs(n.x-x)<11&&y>=n.y-36&&y<n.y+5);if(n){walkToNPC(n);return}
 const door=rooms[s.player.room].exits.find(d=>Math.hypot(d.x-x,d.y-y)<26||(Math.abs(d.x-x)<21&&d.y-y>0&&d.y-y<61));
 if(door){if(Math.hypot(s.player.x-door.x,s.player.y-door.y)<34){perform({kind:'exit',item:door});return}navigateTo(door.x,door.y,{kind:'exit',item:door});return}
 navigateTo(x,y)
});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(dialog.open)return;
 const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 keys.add(k);if(e.repeat)return;const fn={e:act,f:decrees,m:atlas,j:codex,'?':help,' ':pause,escape:pause}[k];if(fn)fn()});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{keys.clear();last=performance.now();if(document.hidden)save()});
function frame(now){
 const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
 if(!paused&&!dialog.open&&!document.hidden){t+=dt;const on=(...input)=>input.some(k=>keys.has(k))?1:0;for(let remaining=dt;remaining>0;remaining-=.04)game.tick(Math.min(.04,remaining),on('d','arrowright')-on('a','arrowleft'),on('s','arrowdown')-on('w','arrowup'),keys.has('shift'));
 if(game.target&&!game.motion.length){const target=game.target;game.target=null;
 if(target.kind==='npc'&&target.item.room===s.player.room){if(Math.hypot(target.item.x-s.player.x,target.item.y-s.player.y)<=34)talk(target.item);else walkToNPC(target.item)}
 else if(target.kind==='exit')perform(target)}
 }
 renderer.render(game,t);if(now>uiTime){refresh();uiTime=now+230}if(now>msgUntil)$('message').style.display='none';if(now>saveTime){save();saveTime=now+5000}requestAnimationFrame(frame);
}
portrait($('portrait').getContext('2d'),'#914536',true);icons();controls();refresh();requestAnimationFrame(frame);
