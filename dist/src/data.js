import {addCity} from './city.js?v=7';
import {premises} from './premises.js?v=7';
export const WIDTH=800, HEIGHT=480;
export const rooms={
 court:{name:'Divan Meydanı',type:'court',bounds:[8,164,1590,907],
  beds:[[20,205,158,83],[619,205,160,83],[22,369,145,85],[635,369,142,85]],
  fountain:[400,281,45,22]},
 council:{name:'Kubbealtı',type:'inside',bounds:[38,155,762,443],beds:[[110,210,60,33],[630,210,60,33],[316,225,168,49]]},
 kitchen:{name:'Matbah-ı Âmire',type:'inside',bounds:[38,157,762,443],beds:[[75,185,155,39],[553,185,163,39],[322,272,150,45]]},
 garden:{name:'Hasbahçe',type:'garden',bounds:[15,124,785,466],beds:[[38,158,235,94],[529,158,233,94],[38,331,235,104],[529,331,233,104]],fountain:[401,288,60,25]}
};
for(const [key,name,,,interior] of premises){
 rooms[key]={name,type:'inside',interior,bounds:[38,155,762,443],
  beds:[[85,204,145,25],[560,204,145,25],[322,284,150,27]]};
}
addCity(rooms);
export const cast=[
 {id:'lala',name:'Mehmed Ağa',role:'Kapıcıbaşı',color:'#904739',home:'court',start:[475,319],line:'Bâb kapıları açık, hünkârım. Gelenleri önce meydanda karşılarız.',routes:[[474,318],[541,178],[410,426],[554,342]]},
 {id:'guard',name:'Hasan Çavuş',role:'Saray muhafızı',color:'#8d3433',home:'court',start:[290,215],line:'Gündüz nöbeti bende. Dilerseniz size refakat ederim.',routes:[[290,215],[222,340],[529,339],[546,209]]},
 {id:'scribe',name:'Yusuf Efendi',role:'Divan kâtibi',color:'#346b78',home:'court',start:[569,353],line:'Bugünkü hükümleri deftere geçirdim. Kubbealtı toplantı için hazır.',routes:[[569,353],[532,187],[310,191],[231,347]]},
 {id:'vizier',name:'Pîrî Mehmed Paşa',role:'Sadrazam',color:'#50634a',home:'council',start:[486,291],line:'Arzınız üzere divanı burada toplayabiliriz, hünkârım.',routes:[[486,291],[516,215],[282,306]]},
 {id:'cook',name:'Ali Usta',role:'Aşçıbaşı',color:'#8b6b47',home:'kitchen',start:[278,247],line:'Kazanlar hazır. İmaret için buğday ayırırsanız sofrayı genişletiriz.',routes:[[278,247],[520,245],[495,346],[226,323]]},
 {id:'gardener',name:'Hızır Usta',role:'Bahçıvan',color:'#576e42',home:'garden',start:[338,213],line:'Lale tarhlarının toprağı havalandı. Yeni fidanlar için yer açtım.',routes:[[338,213],[330,385],[490,386],[485,204]]},
 {id:'page',name:'İlyas',role:'İçoğlanı',color:'#6e577d',home:'garden',start:[475,392],line:'Hasbahçe yolundan saray meydanına çıkılır, sultanım.',routes:[[475,392],[506,273],[298,273],[322,387]]},
 {id:'groom',name:'Osman',role:'Seyis',color:'#845434',home:'court',start:[908,265],line:'Kırat meydanda hazır, hünkârım. İndiğiniz yerde sizi bekler.',routes:[[908,265],[806,328],[537,383],[845,290]]},
 {id:'baker',name:'Hatice Usta',role:'Fırıncı',color:'#954133',home:'court',start:[968,403],line:'Tezgâhta taze ekmek var. Un çuvalları iskeleden gelir.',routes:[[968,403],[985,430],[944,439],[959,400]]},
 {id:'porter',name:'İshak',role:'İskele hamalı',color:'#416a7b',home:'court',start:[1445,740],line:'Sarayın unu burada. Mührünüz ulaşınca zahireyi buyurduğunuz yere götürürüz.',routes:[[1445,740],[1353,772],[1230,759],[1425,749]]},
 {id:'weaver',name:'Emine',role:'Dokumacı',color:'#617954',home:'court',start:[1090,415],line:'Bursa bezleri bugün iskeleden geldi. Tezgâhımı ikindiye kadar açık tutarım.',routes:[[1090,415],[1180,411],[1107,429],[1092,406]]}
];
export const orders=[
 {id:'meal',name:'İmaret sofrası kur',detail:'240 akçe · Aşçıbaşı meydana gelir ve halka sofra açar.',cost:240,esteem:2,peace:5},
 {id:'watch',name:'Meydan nöbetini sıklaştır',detail:'80 akçe · Muhafız kapılar arasında devriye gezer.',cost:80,esteem:1,peace:3},
 {id:'council',name:'Divanı toplantıya çağır',detail:'Kâtip ve kapıcıbaşı Kubbealtı’nda sadrazama katılır.',cost:0,esteem:2,peace:0},
 {id:'plant',name:'Hasbahçe’ye gül diktir',detail:'160 akçe · Bahçıvan tarhlara yeni güller diker.',cost:160,esteem:1,peace:2}
];
export const clockText=min=>[Math.floor(min/60)%24,Math.floor(min)%60].map(x=>String(x).padStart(2,'0')).join('.');
export const dateText=min=>new Intl.DateTimeFormat('tr-TR',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date(Date.UTC(1520,8,30+Math.floor(min/1440))));
