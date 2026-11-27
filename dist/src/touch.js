// A captured pointer keeps steering when the thumb leaves the outer ring.
export function movementStick(pad){
 const knob=pad.firstElementChild;
 const axis={x:0,y:0,run:false,reset};
 let pointer=null;
 function reset(){
  const active=pointer;pointer=null;
  if(active!==null&&pad.hasPointerCapture(active))pad.releasePointerCapture(active);
  axis.x=axis.y=0;axis.run=false;knob.style.transform='';
 }
 function move(e){
  if(e.pointerId!==pointer)return;
  const box=pad.getBoundingClientRect(),radius=box.width/2;
  const x=e.clientX-box.left-radius,y=e.clientY-box.top-radius,length=Math.hypot(x,y);
  const scale=Math.min(1,(radius-knob.offsetWidth/2)/Math.max(1,length));
  knob.style.transform='translate('+x*scale+'px,'+y*scale+'px)';
  axis.x=length>7?x/length:0;axis.y=length>7?y/length:0;axis.run=length>radius*.86;
 }
 pad.addEventListener('pointerdown',e=>{
  if(pointer!==null||e.button!==0)return;
  pointer=e.pointerId;pad.setPointerCapture(pointer);move(e);
 });
 pad.addEventListener('pointermove',move);
 for(const event of ['pointerup','pointercancel','lostpointercapture']){
  pad.addEventListener(event,e=>{if(e.pointerId===pointer)reset()});
 }
 return axis;
}
