// Districts are separately streamed canvas scenes. Coordinates are local to a district.
export const quarters={
 tahtakale:{name:'Tahtakale',style:'bazaar',width:1440,height:800},
 galata:{name:'Galata',style:'tower',width:1440,height:800},
 uskudar:{name:'Üsküdar',style:'village',width:1440,height:800},
 bogaz:{name:'Boğaziçi Sahili',style:'shore',width:1600,height:800},
 strait:{name:'İstanbul Boğazı',style:'water',width:1500,height:960},
 enderun:{name:'Enderun · Üçüncü Avlu',style:'palace',width:960,height:620}
};
export const venues={
 tavern:['Galata Meyhanesi','galata',460,357,'tavern'],
 han:['Tahtakale Hanı','tahtakale',660,355,'han'],
 kahve:['Tahtakale Kahvehanesi','tahtakale',950,330,'coffee'],
 arz:['Arz Odası','enderun',481,437,'audience'],
 has:['Has Oda','enderun',167,205,'audience'],
 icHazine:['İç Hazine','enderun',789,214,'paper']
};
export const parcels={
 timberHome:{name:'Üsküdar’da ahşap ev',room:'uskudar',x:440,y:360,kind:'house',price:980},
 oldYali:{name:'Boğaz kıyısında yalı',room:'bogaz',x:550,y:563,kind:'yali',price:3600},
 mosqueLand:{name:'Üsküdar mahalle arsası',room:'uskudar',x:870,y:400,kind:'mosque',price:2100,build:true},
 yalıLand:{name:'Boğaz kıyısında boş arsa',room:'bogaz',x:1030,y:565,kind:'yali',price:2900,build:true}
};
export const coffeeOpen=minutes=>minutes>=(Date.UTC(1554,0,1)-Date.UTC(1520,8,30))/60000;
function interior(name,interior){
 return {name,type:'inside',interior,bounds:[38,155,762,443],beds:[[85,204,145,25],[560,204,145,25],[322,284,150,27]],exits:[]};
}
function link(rooms,a,x,y,b,xx,yy,label,back,extra={}){
 rooms[a].exits.push({x,y,to:b,arrive:[xx,yy-5],label,...extra});
 rooms[b].exits.push({x:xx,y:yy,to:a,arrive:[x,y+5],label:back});
}
export function addCity(rooms){
 for(const [key,q] of Object.entries(quarters)){
  const palace=key==='enderun';
  const blocks=palace||key==='strait'?[]:[[78,282],[265,255],[555,250],[775,263],[1080,258],[1220,320],[84,551],[750,527]];
  rooms[key]={...q,blocks,type:'city',bounds:[18,145,q.width-18,palace?q.height-16:638],beds:blocks.map(([x,y])=>[x,y-30,86,30]),exits:[]};
 }
 for(let i=0;i<10;i++)rooms.tahtakale.beds.push([180+100*i,383+(i%3)*18,46,9]);
 rooms.uskudar.beds.push([196,292,77,31]);
 rooms.strait.bounds=[155,45,1335,911];
 for(const [key,[name,zone,x,y,style]] of Object.entries(venues)){
  rooms[key]=interior(name,style);link(rooms,zone,x,y,key,400,426,name,'Dışarı çık',key==='kahve'?{coffee:true}:{});
  rooms[zone].beds.push([x-57,y-34,114,25]);
 }
 for(const [id,p] of Object.entries(parcels)){
  rooms[id]=interior(p.build?(p.kind==='mosque'?'Mahalle Camii':'Sahil Yalısı'):p.name,p.kind);
  link(rooms,p.room,p.x,p.y,id,400,426,rooms[id].name,'Dışarı çık',{parcel:id});
  rooms[p.room].beds.push([p.x-49,p.y-38,98,28]);
 }
 link(rooms,'court',62,717,'tahtakale',1340,513,'Tahtakale yolu','Sarayburnu yolu');
 link(rooms,'court',1430,847,'strait',215,818,'Kayığa bin · İstanbul Boğazı','Sarayburnu İskelesi');
 link(rooms,'uskudar',420,620,'strait',1280,685,'Kayığa bin · İstanbul Boğazı','Üsküdar İskelesi');
 link(rooms,'tahtakale',450,620,'galata',635,620,'Kayıkla Haliç’i geç','Kayıkla Tahtakale');
 link(rooms,'galata',1250,606,'bogaz',150,582,'Boğaz sahil yoluna çık','Galata yolu');
 link(rooms,'bogaz',1280,622,'strait',218,95,'Kayığa bin · İstanbul Boğazı','Boğaziçi İskelesi');
 link(rooms,'galata',1030,620,'strait',220,546,'Kayığa bin · İstanbul Boğazı','Galata İskelesi');
 // Inside the imperial palace the inner gate opens to Enderun, then the gardens.
 link(rooms,'court',402,166,'enderun',480,565,'Bâbüssaâde · Enderun','Bâbüssaâde · Divan Meydanı');
 link(rooms,'enderun',480,156,'garden',400,132,'Hasbahçe yolu','Enderun');
}
export function openExit(state,e){
 return (!e.coffee||coffeeOpen(state.minutes))&&(!e.parcel||state.estate?.[e.parcel]?.status==='owned');
}
export function citySpots(s){
 const p=s.player;
 const stops={han:'Han avlusunda dinlen',tavern:'Meyhanede sohbete katıl',kahve:'Kahvehanede sohbete katıl'};
 if(stops[p.room])return [{id:'gather',room:p.room,x:290,y:330,label:stops[p.room]}];
 const plots=Object.entries(parcels).filter(([,v])=>v.room===p.room).map(([id,v])=>({id:'estate-'+id,room:p.room,x:v.x+24,y:v.y+12,label:v.name+' · Mülk defteri'}));
 if(p.room==='tahtakale'&&!coffeeOpen(s.minutes))plots.push({id:'gather',room:p.room,x:942,y:346,label:'Şerbetçi tezgâhında dinlen'});
 return plots;
}
