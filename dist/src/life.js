import {places} from './district.js?v=3';

export function initialLife(){
 return {stamina:90,thirst:75,bread:1,water:1,cargo:false,deliveries:0,
  horse:{room:'court',x:432,y:235,face:-1},mounted:false};
}
export function targets(state){
 const horse=state.life.horse;
 const points=places.filter(point=>point.room===state.player.room);
 if(!state.life.mounted && state.player.room===horse.room)
  points.push({id:'horse',label:'Ata bin',name:'Kırat',x:horse.x,y:horse.y,room:horse.room});
 return points;
}
export function dismount(game){
 const s=game.s;if(!s.life.mounted)return false;
 const {room,x,y,face}=s.player;
 Object.assign(s.life.horse,{room,x,y,face});s.life.mounted=false;
 game.log('Kırat burada bekliyor.');return true;
}
export function usePlace(game,id){
 const s=game.s,l=s.life,p=s.player,site=targets(s).find(site=>site.id===id);
 if(!site||Math.hypot(p.x-site.x,p.y-site.y)>34)return 'Biraz daha yaklaş.';
 switch(id){
 case 'horse':
  if(l.cargo)return 'Çuvalı taşırken ata binemezsin.';
  l.mounted=true;break;
 case 'bread':
  if(s.gold<4)return 'Ekmek için 4 akçe gerekiyor.';
  if(l.bread>=8)return 'Heybende sekiz ekmek var.';
  if(!s.stores.bread)return 'Fırında ekmek kalmadı. Yeni parti pişiriliyor.';
  s.stores.bread--;s.gold-=4;l.bread++;break;
 case 'sack':case 'oven':return 'Zahire sevki için bir vekil görevlendirin.';
 default:l.water=3;l.thirst=100;
 }
 const messages={horse:'Kırat’a bindin.',bread:'Heybene bir ekmek koydun.',sack:'Un çuvalını omuzladın. Matbah-ı Âmire’ye götürebilirsin.',oven:'Un kilerde. Aşçı heybene iki ekmek koydu.'};
 game.log(messages[id]||'Su içtin ve mataranı doldurdun.');return '';
}
export function consume(game,item){
 const l=game.s.life;
 if(item==='bread'&&l.bread>0&&l.stamina<100){l.bread--;l.stamina=Math.min(100,l.stamina+35);game.log('Ekmek yedin.');return true}
 if(item==='water'&&l.water>0&&l.thirst<100){l.water--;l.thirst=Math.min(100,l.thirst+40);game.log('Mataradan su içtin.');return true}
 return false;
}
export function moveSpeed(l,fast){return l.mounted?(fast?191:141):l.cargo?48:fast&&l.stamina>3?109:69}
export function updateNeeds(state,dt,sprint){
 const l=state.life,walking=state.player.moving;
 const running=walking&&sprint&&!l.mounted&&!l.cargo;
 l.stamina=Math.max(0,Math.min(100,l.stamina+dt*(running?-5.0:walking?.35:1.2)*(running||l.thirst>10?1:.35)));
 l.thirst=Math.max(0,l.thirst-dt*(running?.095:.031));
}
