// Coordinates are feet positions. Outdoor landmarks share one continuous map.
export const outerWidth = 1600;
export const outerHeight = 920;

export const houses = [
  {x:835,y:230,w:126,h:78,kind:'stable'},
  {x:1048,y:221,w:96,h:62,kind:'house'},
  {x:1196,y:235,w:106,h:78,kind:'house'},
  {x:1390,y:222,w:93,h:73,kind:'house'},
  {x:162,y:634,w:131,h:84,kind:'house'},
  {x:489,y:664,w:102,h:76,kind:'house'},
  {x:676,y:681,w:125,h:87,kind:'house'},
  {x:1067,y:551,w:114,h:81,kind:'house'},
  {x:1213,y:557,w:104,h:64,kind:'house'},
  {x:1272,y:711,w:121,h:70,kind:'warehouse'}
];

export const stalls = [
  {x:940,y:379,w:70,kind:'bread',color:'#9f4a35'},
  {x:1055,y:380,w:72,kind:'cloth',color:'#477e76'},
  {x:1175,y:384,w:74,kind:'fruit',color:'#9e7941'},
  {x:330,y:368,w:46,kind:'scribe',color:'#587768'}
];

export const places = [
  {id:'fountain',room:'court',x:400,y:310,label:'Matara doldur',name:'Meydan çeşmesi'},
  {id:'bread',room:'court',x:973,y:395,label:'Ekmek al · 4 akçe',name:'Fırın tezgâhı'},
  {id:'sack',room:'court',x:1430,y:750,label:'Zahire sevk emri ver',name:'İskele ambarı'},
  {id:'oven',room:'kitchen',x:305,y:247,label:'Mutfak için hüküm ver',name:'Saray fırını'},
  {id:'gardenWater',room:'garden',x:401,y:319,label:'Matara doldur',name:'Hasbahçe çeşmesi'}
];

export const districtName=(x,y)=> y>705?'Sarayburnu İskelesi':x>=1000?'Esnaf Çarşısı':x>=807?'Has Ahırlar':y>485?'Saray Yolu':'Divan Meydanı';

export function terrainBlocked(x,y){
 if(y>=818 && !(x>=1360&&x<=1450&&y<896))return true;
 return houses.some(h=>x>h.x-2&&x<h.x+h.w+2&&y>h.y-27&&y<h.y+3) ||
 stalls.some(s=>x>s.x&&x<s.x+s.w&&y>s.y-13&&y<s.y+3);
}
