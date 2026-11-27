import {rect,poly,arch,stone,oval,star,building} from './art.js?v=8';

// Each silhouette belongs to a particular court building. The entrance is at its actual walking threshold.
export function kitchens(c,b,r){
 const {x,w,front,cx}=b,y=front-52;
 stone(c,x,y,w,52,r,['#c3b69b','#d5c4a3','#c6b998','#dbc8a5']);
 for(let i=0;i<5;i++){
  const px=x+(i+.5)*w/5;
  poly(c,[[px-20,y],[px-13,y-11],[px-5,y-25],[px+5,y-25],[px+13,y-11],[px+20,y]],'#627571');
  rect(c,px-4,y-46,8,25,'#a6997d');rect(c,px-4,y-45,3,20,'#e3ceb0');
  rect(c,px-6,y-48,12,4,'#726e5b');rect(c,px-4,y-49,8,2,'#4a5046');
  arch(c,px-9,y+13,18,22,'#a49474');arch(c,px-6,y+16,12,19,'#435246');
  for(let j=-3;j<=3;j+=3)rect(c,px+j,y+21,1,14,'#a3ab91');
 }
 rect(c,x-4,y,w+8,4,'#495d52');arch(c,cx-15,front-35,30,35,'#e9d5ad');arch(c,cx-10,front-30,20,30,'#394b42');
}
export function councilHall(c,b,r){
 const {x,y,w,front,cx}=b;
 building(c,x,front-60,w,7,3,r);
 const tx=x+12,base=y+18;
 stone(c,tx,base-72,25,79,r);rect(c,tx-4,base-58,33,4,'#8c8772');
 for(let i=0;i<3;i++){arch(c,tx+2+7*i,base-72,7,17,'#65776d');arch(c,tx+3+7*i,base-69,5,14,'#354e48')}
 poly(c,[[tx-6,base-73],[tx+12,base-99],[tx+31,base-73]],'#536c67');rect(c,tx+12,base-106,2,8,'#bc974e');
 arch(c,cx-13,front-30,26,30,'#e8d1a8');arch(c,cx-9,front-27,18,27,'#374f41');
}
export function gateWing(c,x,y,w,inner){
 const r=inner?'#456d65':'#627c75';
 poly(c,[[x,y-39],[x+w,y-39],[x+w+8,y-26],[x-8,y-26]],r);
 rect(c,x-8,y-26,w+16,3,'#544f3d');rect(c,x-7,y-23,w+14,2,'#d7b978');
 for(let i=2;i<w-1;i+=12){rect(c,x+i,y-21,3,22,'#a69878');rect(c,x+i+1,y-21,1,22,'#ead7af')}
}
export function romanPaving(c,x,y,size){
 // Offset seams on each ring keep the fountain apron legible at sprite scale.
 for(let ring=0;ring<4;ring++){
  const rx=size-ring*5,ry=rx*.62;c.strokeStyle=ring%2?'#ae9f81':'#ded2b0';c.lineWidth=1.2;
  c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<32;i++){
   const a=(i+ring*.5)*Math.PI/16;c.beginPath();c.moveTo(x+rx*Math.cos(a),y+ry*Math.sin(a));c.lineTo(x+(rx-5)*Math.cos(a),y+(ry-3)*Math.sin(a));c.stroke();
  }
 }
}
export function standard(c,x,y,t){
 const flutter=Math.sin(2*t+x)*2;
 rect(c,x-1,y-53,2,54,'#8e7145');oval(c,x,y-55,2,2,'#d5ac68');
 poly(c,[[x+1,y-52],[x+10,y-51+flutter],[x+13,y-53+flutter],[x+13,y-31+flutter],[x+7,y-26],[x+1,y-31]],'#903c36');
 rect(c,x+2,y-49,1,16,'#d6ac61');star(c,x+7,y-40+flutter,3,'#e9c98b');
}
export function bakehouseSmoke(c,x,y,t){
 for(let i=0;i<4;i++){
  const p=(t*.27+i/4)%1;
  c.fillStyle='rgba(228,223,195,'+(.27*(1-p))+')';c.beginPath();c.ellipse(x+p*10+Math.sin(t+p*5)*3,y-p*24,2+p*5,2+p*3,0,0,Math.PI*2);c.fill();
 }
}

export function innerGate(c,x,y){
 // Set the shadow and the open arch behind the gilded canopy.
 poly(c,[[x-54,y-1],[x+50,y-1],[x+67,y+8],[x-40,y+8]],'#494c3833');
 for(const side of [-1,1]){
  const a=x+side*34;
  rect(c,a-4,y-35,8,37,'#caba95');rect(c,a-3,y-34,2,32,'#f1dcb2');rect(c,a-5,y-35,10,4,'#9e936f');
 }
 poly(c,[[x-47,y-40],[x-25,y-48],[x,y-54],[x+24,y-49],[x+47,y-40],[x+61,y-32],[x-61,y-32]],'#395f5b');
 poly(c,[[x-47,y-40],[x,y-54],[x-7,y-39],[x-59,y-32]],'#63837a');
 for(let i=-46;i<=46;i+=12){c.beginPath();c.moveTo(x+i*.45,y-48);c.lineTo(x+i,y-34);c.strokeStyle='#86a398';c.lineWidth=1;c.stroke()}
 rect(c,x-60,y-32,120,3,'#333e33');rect(c,x-57,y-29,114,2,'#d7b777');
 for(let i=-52;i<53;i+=6){rect(c,x+i,y-27,3,2,'#b59256')}
 rect(c,x-13,y-29,26,8,'#385e56');rect(c,x-12,y-28,24,1,'#d9b469');star(c,x,y-25,3,'#dbbb7d');
}
