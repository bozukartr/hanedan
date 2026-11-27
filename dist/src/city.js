// District templates are projected onto the shared map by geography.js.
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
 oldYali:{name:'Boğaz kıyısında yalı',room:'bogaz',x:1600,y:563,kind:'yali',price:3600},
 mosqueLand:{name:'Üsküdar mahalle arsası',room:'uskudar',x:870,y:400,kind:'mosque',price:2100,build:true},
 yalıLand:{name:'Boğaz kıyısında boş arsa',room:'bogaz',x:1638,y:280,kind:'yali',price:2900,build:true}
};
export const coffeeOpen=minutes=>minutes>=(Date.UTC(1554,0,1)-Date.UTC(1520,8,30))/60000;
function interior(name,interior){
 return {name,type:'inside',interior,bounds:[38,155,762,443],beds:[[85,204,145,25],[560,204,145,25],[322,284,150,27]]};
}
// Street frontages follow the bazaar, the tower slope, the landing and the shore.
const frontages={
 tahtakale:[[64,292],[158,278],[262,260],[362,252],[485,237],[571,235],[751,220],[857,214],[1074,270],[1166,288],[1280,307],[1340,520],[1195,547],[1083,530],[506,559],[408,540],[317,526],[174,525]],
 galata:[[74,272],[161,238],[255,207],[408,152],[520,169],[623,204],[725,250],[824,300],[939,337],[1037,368],[1150,375],[1218,496],[1060,540],[890,523],[708,515],[592,494],[332,472]],
 uskudar:[[320,270],[444,211],[597,182],[752,154],[947,187],[1095,210],[1210,255],[1100,512],[990,539],[815,531],[680,504],[514,544],[355,569],[205,525],[113,480]],
 bogaz:[[250,338],[475,415],[652,303],[823,388],[1002,300],[1120,398],[1290,276],[1370,352],[1482,419],[1540,695],[1350,590],[1164,572]]
};
export function addCity(rooms){
 for(const [key,q] of Object.entries(quarters)){
  const palace=key==='enderun';
  const blocks=frontages[key]??[];
  rooms[key]={...q,blocks,type:'city',bounds:[18,145,q.width-18,palace?q.height-16:638],beds:blocks.map(([x,y])=>[x,y-30,86,30])};
 }
 for(let i=0;i<10;i++)rooms.tahtakale.beds.push([180+100*i,383+(i%3)*18,46,9]);
 rooms.uskudar.beds.push([196,292,77,31]);
 rooms.strait.bounds=[155,45,1335,911];
 for(const [key,[name,zone,x,y,style]] of Object.entries(venues)){
  rooms[key]=interior(name,style);
  rooms[zone].beds.push([x-57,y-34,114,25]);
 }
 for(const [id,p] of Object.entries(parcels)){
  rooms[id]=interior(p.build?(p.kind==='mosque'?'Mahalle Camii':'Sahil Yalısı'):p.name,p.kind);
  rooms[p.room].beds.push([p.x-49,p.y-38,98,28]);
 }
}
export function citySpots(s){
 const p=s.player;
 const stops={han:'Han avlusunda dinlen',tavern:'Meyhanede sohbete katıl',kahve:'Kahvehanede sohbete katıl'};
 if(stops[p.room])return [{id:'gather',room:p.room,x:290,y:330,label:stops[p.room]}];
 const plots=Object.entries(parcels).filter(([,v])=>v.room===p.room).map(([id,v])=>({id:'estate-'+id,room:p.room,x:v.x+24,y:v.y+12,label:v.name+' · Mülk defteri'}));
 if(p.room==='tahtakale'&&!coffeeOpen(s.minutes))plots.push({id:'gather',room:p.room,x:942,y:346,label:'Şerbetçi tezgâhında dinlen'});
 return plots;
}
