import {paintGesture} from './gestures.js?v=8';
// Raster primitives and seeded ornament. Everything is drawn at world-pixel resolution.
export function seed(n){return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
export function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
export function poly(c,pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill()}
export function oval(c,x,y,w,h,color){
 for(let j=-Math.ceil(h);j<=h;j++){const s=Math.floor(w*Math.sqrt(Math.max(0,1-(j/h)**2)));if(s)rect(c,x-s,y+j,s*2,1,color)}
}
export function stone(c,x,y,w,h,r,palette=['#cbb997','#d9c8a7','#cbba9a','#d2bf9f']){
 rect(c,x,y,w,h,palette[0]);
 for(let j=0;j<h;j+=6)for(let i=-12+(j%12?10:0);i<w;i+=22){let l=Math.max(i,0),end=Math.min(w,i+21);if(end>l)rect(c,x+l,y+j,end-l,Math.min(5,h-j),palette[Math.floor(r()*palette.length)])}
}
export function star(c,x,y,r,col){const p=[];for(let i=0;i<16;i++){let a=i*Math.PI/8,d=i%2?r*.49:r;p.push([x+Math.cos(a)*d,y+Math.sin(a)*d])}poly(c,p,col)}
export function dome(c,cx,base,w,h,r){
 const cols=['#3c5552','#556b66','#71857a','#909c88','#a4ac96','#bdbaa0'];
 for(let i=-w;i<=w;i++){const t=i/w,up=Math.sqrt(Math.max(0,1-t*t)),top=base-h*up;
 const light=Math.min(5,Math.max(0,Math.floor(3.1-2.2*t+Math.sin(Math.acos(t)*16)*.48)));
 rect(c,cx+i,top,1,base-top+1,cols[light]);
 if(i%5===0&&up>.2)rect(c,cx+i,top+2+r()*h*up*.65,1,2,cols[Math.max(0,light-1)]);
 }
 for(let k=-4;k<=4;k++)for(let j=0;j<h;j++){let u=j/h,px=cx+k*w*.205*Math.sqrt(u);rect(c,px,base-h+j,1,1,k>1?'#586e63':'#8d9c89')}
 rect(c,cx-w-2,base,2*w+4,3,'#495e54');rect(c,cx-w,base+3,2*w,3,'#b5b49b');
 rect(c,cx-1,base-h-10,2,10,'#987c3e');oval(c,cx,base-h-4,3,2,'#bf9d52');oval(c,cx,base-h-11,2,2,'#dabd74')
}
export function arch(c,x,y,w,h,color){
 const p=[[x,y+h],[x,y+h*.38],[x+w*.08,y+h*.23],[x+w*.22,y+h*.11],[x+w*.5,y],[x+w*.78,y+h*.11],[x+w*.92,y+h*.23],[x+w,y+h*.38],[x+w,y+h]];poly(c,p,color)
}
function arcade(c,x,y,w,n,h){
 const gap=w/n;
 for(let i=0;i<n;i++){let xx=x+i*gap;
 arch(c,xx+2,y,gap-4,h,'#b59d75');arch(c,xx+5,y+3,gap-10,h-3,'#e5d4a9');arch(c,xx+8,y+6,gap-16,h-6,'#716a52');arch(c,xx+10,y+8,gap-20,h-8,'#414b3e');
 const m=xx+gap/2;
 rect(c,m-6,y+h*.54,12,h*.46,'#5b4e37');rect(c,m-5,y+h*.56,2,h*.44,'#807050');rect(c,m+1,y+h*.58,3,8,'#352f26');
 rect(c,xx-3,y+13,7,h-13,'#a6916e');rect(c,xx-2,y+14,3,h-14,'#e5d2a9');rect(c,xx-5,y+13,11,3,'#d2bd94');rect(c,xx-4,y+h-3,10,3,'#c0a982');
 }
}
function tileBand(c,x,y,w){rect(c,x,y,w,6,'#437e78');for(let i=2;i<w-2;i+=7){rect(c,x+i,y+1,3,3,'#aac0a2');rect(c,x+i+1,y+2,1,1,'#416969');rect(c,x+i+4,y+3,2,2,'#c9ba83')}}
function banner(c,x,y){rect(c,x,y,13,29,'#5e3931');poly(c,[[x+1,y],[x+11,y],[x+11,y+24],[x+6,y+29],[x+1,y+24]],'#9e4437');rect(c,x+2,y,1,23,'#c58e5c');oval(c,x+6,y+10,3,4,'#e0c389');oval(c,x+7,y+9,2,3,'#9e4437');rect(c,x-2,y-1,17,2,'#b49b61')}
export function building(c,x,y,w,n,domeCount,r){
 stone(c,x,y-43,w,43,r);const dw=w/domeCount;
 for(let i=0;i<domeCount;i++){const m=x+dw*(i+.5);rect(c,m-dw*.44,y-48,dw*.88,8,'#c2b391');dome(c,m,y-49,dw*.48,Math.min(42,dw*.32),r)}
 rect(c,x-3,y-44,w+6,3,'#475949');rect(c,x-2,y-41,w+4,2,'#e1ca9b');
 for(let i=0;i<n;i++){let xx=x+(i+.5)*w/n;arch(c,xx-5,y-36,10,17,'#6b7059');arch(c,xx-3,y-34,6,14,'#384a40');rect(c,xx,y-29,1,8,'#baac87')}
 poly(c,[[x-5,y-13],[x+w-4,y-13],[x+w+7,y-2],[x-12,y-2]],'#718479');for(let i=0;i<w;i+=8)poly(c,[[x+i,y-13],[x+i+1,y-13],[x+i-4,y-2],[x+i-5,y-2]],'#91a18e');
 rect(c,x-12,y-2,w+19,4,'#4c5340');rect(c,x-9,y+2,w+14,3,'#d9bf93');stone(c,x,y+5,w,48,r);tileBand(c,x,y+5,w);
 arcade(c,x+2,y+12,w-4,n,40);rect(c,x-4,y+52,w+8,3,'#a39376');rect(c,x-7,y+55,w+14,3,'#ddc9a0');rect(c,x-8,y+58,w+16,2,'#968c71');
}
export function palace(c,r){
 // The justice tower and lead-domed council chambers share the colonnade.
 stone(c,101,26,36,81,r);rect(c,97,22,44,6,'#8a8d73');stone(c,100,6,38,17,r);arcade(c,101,5,36,3,18);
 poly(c,[[94,5],[119,-14],[143,5]],'#4e675e');rect(c,95,5,48,3,'#b4b494');
 building(c,-12,109,210,6,3,r);building(c,594,107,228,6,4,r);
 building(c,175,99,450,9,3,r);
 stone(c,367,86,70,67,r);tileBand(c,367,88,70);arch(c,373,95,58,59,'#b09a77');arch(c,377,98,50,56,'#e7d2a5');arch(c,382,103,40,51,'#54766a');arch(c,385,106,34,48,'#273e34');
 rect(c,397,126,11,28,'#564b35');rect(c,401,126,2,28,'#8e7a52');star(c,402,117,3,'#b9a574');rect(c,362,83,80,4,'#586c59');rect(c,365,81,75,2,'#d4c197');banner(c,344,104);banner(c,447,104);
 for(let i=0;i<3;i++)rect(c,362-3*i,154+i*3,80+i*6,2,i%2?'#b4a386':'#ead6ad');
}
export function tree(c,x,y,h,kind,n){
 const r=seed(n),w=Math.floor(h*(kind==='cypress'?.16:.37));
 oval(c,x+w*.34,y+1,w*1.22,h*.065,'#5a644448');
 rect(c,x-3,y-h*.39,6,h*.39,'#5a5039');rect(c,x-2,y-h*.34,2,h*.34,'#98835c');
 const top=y-h,foot=y-h*.19;
 function width(t){return kind==='cypress'?Math.pow(Math.sin(Math.PI*t),.7)*(.52+.77*t):Math.pow(Math.sin(Math.PI*t),.42)*(.92+.09*Math.sin(t*12))}
 for(let row=0;row<foot-top;row+=2){let t=row/(foot-top),wide=width(t)*w;rect(c,x-wide+(r()-.5)*2,top+row,wide*2+2,3,'#344c3d')}
 const colors=kind==='cypress'?['#354e3e','#456045','#55724c','#6c8051','#819055']:['#3e553e','#516542','#61784a','#7e8a4e','#929651','#a3a15e'];
 for(let i=0;i<h*w*.34;i++){let t=r(),wide=width(t)*w,off=(r()*2-1)*wide;
 let light=(1-off/(wide||1))*.26+(1-t)*.22+r()*.36;let col=colors[Math.min(colors.length-1,Math.floor(light*colors.length))];
 rect(c,x+off,top+t*(foot-top),1+r()*3,1+r()*2,col)}
}
export function bed(c,b,r,roses=false){
 const [x,y,w,h]=b;rect(c,x+3,y+5,w,h,'#7e7b59');rect(c,x,y,w,h,'#e4cfa7');rect(c,x+2,y+2,w-4,h-5,'#9f9874');rect(c,x+5,y+5,w-10,h-10,'#798356');
 for(let i=0;i<w*h*.18;i++){const a=x+6+r()*(w-13),d=y+6+r()*(h-13);rect(c,a,d,r()*3+1,1,r()>.5?'#8e945d':'#697c50')}
 for(let row=0;row<2;row++)for(let i=9;i<w-9;i+=5){const yy=row?y+h-11:y+9;rect(c,x+i,yy,1,4,'#405f3f');rect(c,x+i-1,yy-1,3,2,roses?'#bd5650':r()>.45?'#bc835d':'#d8b978')}
}
export function fountain(c,[x,y,w,h],t){
 function bowl(yy,a,b,color){poly(c,[[x-a*.55,yy-b],[x+a*.55,yy-b],[x+a,yy-b*.42],[x+a,yy+b*.42],[x+a*.55,yy+b],[x-a*.55,yy+b],[x-a,yy+b*.42],[x-a,yy-b*.42]],color)}
 bowl(y+3,w+2,h,'#9f9474');bowl(y,w,h,'#c9b995');bowl(y-4,w,h,'#ebe0bc');bowl(y-4,w-5,h-3,'#6e9080');bowl(y-5,w-8,h-6,'#609b94');bowl(y-5,w-12,h-8,'#72b0a4');
 for(let i=0;i<24;i++){let a=i*2.4+t*.22,rr=.3+(i%7)*.07;rect(c,x+Math.cos(a)*w*rr,y-5+Math.sin(a)*h*rr,3+i%4,1,i%3?'#a1c5ac':'#d4d6b2')}
 oval(c,x,y-4,10,4,'#c1b695');rect(c,x-3,y-18,6,14,'#d3c3a1');oval(c,x,y-18,14,5,'#acac8d');oval(c,x,y-20,14,4,'#e6d7b2');oval(c,x,y-21,9,2,'#91b7a5');rect(c,x-1,y-28,3,8,'#c5cbb2');
 for(let i=0;i<7;i++){let a=(t*.9+i/7)%1;rect(c,x+(i%2?1:-1)*a*14,y-27-Math.sin(a*Math.PI)*7+a*a*7,1,2,'#e9ecd0')}
}
export function person(c,x,y,color,face,walk,t,style='courtier',action='',back=false){
 const f=face||1,sway=walk?Math.sin(t*9)*2:0;
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(f,1);oval(c,1,0,8,3,'#30372355');rect(c,-5-sway*.65,-5+sway,4,5,'#4a4031');rect(c,2+sway*.65,-5-sway,4,5,'#483f31');
 c.translate(0,walk?Math.round(-Math.abs(sway)*.65):Math.sin(t*1.8)>.9?-.5:0);
 if(action==='rest'){c.translate(0,-1);c.scale(1,.71)}
 if(action==='bow'){c.translate(0,-6);c.rotate(.39+Math.sin(t*2)*.025);c.scale(1,.86);c.translate(0,6)}
 if(action==='write'||action==='tend'||action==='hammer')c.rotate(.08+Math.sin(t*3.4)*.075);
 if(action==='stir')c.translate(Math.sin(t*4)*.7,0);
 poly(c,[[-4,-23],[4,-23],[6,-18],[6,-11],[9,-4],[3,-3],[-7,-4],[-5,-12],[-7,-16]],'#3d4436');
 poly(c,[[-4,-22],[4,-22],[5,-17],[4,-12],[7,-5],[-6,-5],[-4,-13],[-6,-17]],color);
 rect(c,-3,-19,2,12,'#f4dfad36');rect(c,1,-22,1,17,'#bc9a65');rect(c,-4,-13,9,2,'#b39461');rect(c,4,-17,3,5,'#785545');rect(c,4,-14,3,3,'#c6a079');
 if(style==='sultan'){
  poly(c,[[-6,-24],[-9,-21],[-8,-12],[-12,-4],[-6,-3],[-4,-14],[0,-22]],'#73332f');
  poly(c,[[-7,-23],[-3,-24],[2,-22],[-3,-18],[-7,-17]],'#ddbf84');
  poly(c,[[1,-21],[4,-21],[5,-11],[8,-5],[5,-4],[2,-12]],'#c39b58');
  for(let j=0;j<5;j++){rect(c,-5+j%2*6,-18+j*3,2,1,'#efc677');rect(c,-8,-10+j,1,1,'#bd9653')}
 }
 rect(c,-3,-30,7,8,'#705940');rect(c,-2,-29,7,6,'#c69e74');rect(c,3,-27,3,2,'#d2ab79');rect(c,2,-28,2,1,'#4b4736');rect(c,2,-24,3,1,'#674e3c');
 oval(c,0,-31,style==='sultan'?7:5,style==='sultan'?6:4,'#c6bf9f');oval(c,-1,-32,style==='sultan'?6:4,style==='sultan'?5:3,'#efdfba');rect(c,-4,-31,8,1,'#b3b199');
 if(style==='guard'){poly(c,[[-5,-31],[-4,-40],[0,-40],[4,-33],[4,-30]],'#ded2b0');rect(c,-4,-32,8,2,'#994135');rect(c,3,-38,2,6,'#b7a16d')}
 if(style==='cook'){oval(c,0,-33,6,5,'#ede0c2');rect(c,-4,-20,7,13,'#c8bd9d')}
 if(style==='gardener'||style==='page'){oval(c,0,-31,5,4,style==='gardener'?'#a38b5d':'#854c3e');rect(c,-4,-31,8,2,'#ac9775')}
 if(style==='vizier'){rect(c,0,-23,4,3,'#6b6551');rect(c,1,-20,2,2,'#837b65')}
 if(back&&!action){
  poly(c,[[-4,-31],[4,-31],[4,-24],[1,-22],[-4,-24]],'#775d47');
  rect(c,-5,-30,10,3,'#d6c8a7');rect(c,0,-25,4,3,'#604d40');
  poly(c,[[-4,-22],[4,-22],[3,-18],[-4,-17]],color);
 }
 if(walk&&!action){const arm=Math.sin(t*9)*3;c.beginPath();c.moveTo(4,-20);c.lineTo(5+arm,-13+Math.abs(arm)*.45);c.strokeStyle=color;c.lineWidth=4;c.stroke();rect(c,4+arm,-14+Math.abs(arm)*.45,3,3,'#c9a078')}
 paintGesture(c,action,t,color);
 if(style==='sultan'){rect(c,3,-36,2,6,'#9b7c46');rect(c,4,-37,2,4,'#d0ae67');rect(c,3,-32,2,2,'#943e32')}
 c.restore()
}
export function portrait(c,color='#963f37',large=false,role=''){
 const w=c.canvas.width,h=c.canvas.height;c.clearRect(0,0,w,h);c.save();c.scale(w/64,h/74);rect(c,0,0,64,74,large?'#355750':'#b4b7a1');const r=seed(98);for(let i=0;i<145;i++)rect(c,r()*64,r()*74,1,1,'#daca9744');
 poly(c,[[0,74],[4,62],[21,54],[27,49],[43,51],[48,57],[61,64],[67,74]],'#4d3c32');poly(c,[[0,74],[5,64],[23,55],[31,59],[42,53],[51,60],[62,66],[65,74]],color);
 poly(c,[[25,52],[31,57],[42,51],[45,55],[33,69],[28,74],[22,74],[30,63]],'#d2ad66');poly(c,[[15,72],[21,58],[23,59],[20,74]],'#a57f53');
 for(let i=0;i<12;i++){const x=i<6?5+i*3:44+(i-6)*3,y=70-i%3*3;star(c,x,y,2,'#c39c61')}
 poly(c,[[21,29],[39,26],[45,31],[46,37],[52,43],[47,45],[46,51],[40,54],[32,53],[29,58],[23,56],[25,48],[20,43]],'#785a43');
 poly(c,[[25,31],[40,29],[44,32],[43,38],[50,42],[46,44],[45,50],[40,52],[32,50],[27,45],[24,40]],'#c59a70');poly(c,[[30,33],[40,30],[42,33],[40,38],[44,40],[45,42],[40,42],[38,47],[32,46]],'#d8af81');
 rect(c,36,34,7,1,'#594a35');rect(c,39,36,3,1,'#3e4033');rect(c,40,44,7,2,'#604a36');rect(c,42,48,4,1,'#986d52');rect(c,23,38,3,5,'#a87a57');
 oval(c,30,20,18,13,'#a7a791');oval(c,29,17,16,13,'#eee2bf');oval(c,28,15,11,12,'#e6d7b3');
 poly(c,[[12,23],[17,26],[34,22],[45,16],[48,20],[42,26],[28,30],[17,32],[12,29]],'#c4c1a5');poly(c,[[12,22],[16,24],[30,23],[45,16],[46,18],[34,25],[17,29],[12,27]],'#f4e9c9');
 poly(c,[[17,14],[21,8],[30,5],[34,5],[26,10]],'#fbf1d3');rect(c,19,31,14,2,'#6e705c');
 if(role==='guard'){poly(c,[[15,26],[17,4],[23,1],[38,15],[41,23],[29,28]],'#e6d9ba');poly(c,[[14,25],[40,19],[44,22],[40,25],[16,31]],'#974f40')}
 if(role==='page'||role==='gardener'){oval(c,30,19,17,13,role==='page'?'#8b5141':'#a88e64');poly(c,[[13,22],[23,24],[45,17],[47,21],[31,28],[14,30]],'#c5a97d')}
 if(role==='vizier'||role==='lala'){poly(c,[[24,43],[30,47],[40,50],[45,48],[43,53],[37,56],[30,53]],role==='vizier'?'#77735f':'#655343')}
 if(large){poly(c,[[38,22],[37,13],[40,5],[42,3],[41,13]],'#c7a363');rect(c,37,21,4,3,'#9d5041')}c.restore()
}
