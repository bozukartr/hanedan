export function gesture(n,d,s){
 if(n.reaction&&!n.moving)return n.reaction.pose;
 if(n.duty==='courier')return 'dispatch';
 if(n.moving)return '';
 if(n.duty==='construction'&&n.goal&&Math.hypot(n.x-n.goal[0],n.y-n.goal[1])<5)return 'hammer';
 if(n.duty==='escort')return 'stand';
 if(n.duty==='mandate'){
  const j=s.office.jobs.find(j=>(j.executor??j.officer)===n.id);
  if(j?.phase==='work')return j.type==='relief'?'stir':j.type==='guard'?'stand':'write';
 }
 const w=n.work;
 if(w.period==='rest')return 'rest';
 if(w.period==='break')return 'eat';
 if(w.status.includes('sohbet'))return 'talk';
 if(n.duty!=='routine'||w.progress<=0||(d.plan&&w.leg!=='bench'))return '';
 if(d.unit==='ocak'||d.unit==='kapi')return 'stand';
 if(['imaret','firin','helva'].includes(d.unit))return 'stir';
 if(['bahce','bostan','su'].includes(d.unit))return 'tend';
 if(d.plan?.parcel==='paper'||['vizier','scribe','lala'].includes(n.id))return 'write';
 if(['dokuma','terzi','boya'].includes(d.unit))return 'weave';
 return 'hammer';
}
export function paintGesture(c,action,t,color){
 const wave=Math.sin(t*5),swing=Math.sin(t*3.4);
 const line=(x,y,a,b,w,col)=>{c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.strokeStyle=col;c.lineWidth=w;c.stroke()};
 const box=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)};
 let hand;
 switch(action){
  case 'bow':hand=[1,-15];break;
  case 'salute':hand=[1,-21];break;
  case 'signal':hand=[9,-27+swing];break;
  case 'talk':hand=[8+wave*3,-21+swing*3];break;
  case 'eat':hand=[6,-20-wave*4];box(4,-21-wave*4,5,3,'#d8a869');break;
  case 'stand':hand=[7,-16];line(8,-2,8,-32,1.5,'#6d5235');box(7,-33,2,3,'#c4c8b1');break;
  case 'write':
   box(5,-14,13,5,'#f0d8a3');line(9+wave*2,-14,14+wave*2,-21,1.2,'#394438');hand=[10+wave*2,-16];break;
  case 'present':case 'dispatch':hand=[8,-17];box(5,-20,9,6,'#f1dba5');box(9,-18,2,2,'#984232');break;
  case 'hammer':
   hand=[8,-19+swing*6];line(8,hand[1],11+swing*3,hand[1]-6,2,'#80613c');box(8+swing*3,hand[1]-8,7,3,'#4b5351');break;
  case 'stir':
   c.fillStyle='#7f563b';c.beginPath();c.ellipse(12,-6,8,3,0,0,Math.PI*2);c.fill();
   hand=[10+wave*3,-17];line(hand[0],-18,12+wave*2,-7,1.6,'#795a38');break;
  case 'tend':hand=[8,-16+swing*3];line(6,-20,16+swing*4,-2,2,'#87623d');box(13+swing*4,-3,7,2,'#56645a');break;
  case 'weave':
   box(7,-13,14,5,'#8b6e4c');for(let i=0;i<6;i++)box(8+2*i,-14,1,7,'#bda190');hand=[12+wave*5,-15];break;
  default:return;
 }
 line(3,-20,hand[0],hand[1],3.6,color);box(hand[0]-1,hand[1]-1,3,3,'#d7ad83');
}
