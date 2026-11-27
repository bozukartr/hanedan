// A schematic nautical chart complements the metrically independent district maps.
const ports=[['court','Topkapı',274,202],['tahtakale','Tahtakale',138,197],['galata','Galata',219,104],['bogaz','Boğaziçi',358,43],['uskudar','Üsküdar',475,152],['strait','İstanbul Boğazı',386,114]];
export const destinations=[['court','Divan Meydanı'],['enderun','Enderun Avlusu'],['arz','Arz Odası'],['garden','Hasbahçe'],['tahtakale','Tahtakale'],['han','Tahtakale Hanı'],['galata','Galata'],['tavern','Galata Meyhanesi'],['strait','İstanbul Boğazı'],['uskudar','Üsküdar'],['bogaz','Boğaziçi Sahili']];
export function seaChart(canvas,current,onPick){
 const c=canvas.getContext('2d');canvas.width=600;canvas.height=254;
 c.fillStyle='#709c99';c.fillRect(0,0,600,254);
 function land(points){c.fillStyle='#b6b78f';c.strokeStyle='#e2cc99';c.lineWidth=5;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.stroke()}
 land([[-12,89],[83,108],[194,151],[288,171],[319,205],[242,236],[200,265],[-12,265]]);
 land([[-12,-12],[398,-12],[365,37],[314,93],[305,144],[237,138],[133,107],[-12,64]]);
 land([[482,-12],[620,-12],[620,270],[399,270],[452,194],[454,152],[423,125],[460,60]]);
 c.font='15px Georgia';c.textAlign='center';
 for(const [id,name,x,y] of ports){c.fillStyle=id===current?'#934b35':'#284d41';c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill();c.fillStyle='#233a31';c.fillText(name,x,y+20)}
 canvas.onclick=e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*600/r.width,y=(e.clientY-r.top)*254/r.height;
 const p=ports.find(v=>Math.abs(v[2]-x)<46&&Math.abs(v[3]+6-y)<24);if(p)onPick(p[0])};
}
