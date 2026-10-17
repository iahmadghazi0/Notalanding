import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
;(()=>{
const d=document,root=d.documentElement,rm=root.classList.contains('rm');
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const hasG=true;let lenis:Lenis|null=null,pinP:number|null=null;
if(hasG){gsap.registerPlugin(ScrollTrigger);
 if(!rm){lenis=new Lenis({duration:1.15,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),anchors:true,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0)}}
d.querySelectorAll<HTMLElement>('.split .w').forEach((w,i)=>w.style.setProperty('--i',String(i)));
// intro
const cur=d.getElementById('curtain');
const go=()=>{root.classList.add('go');d.dispatchEvent(new Event('nota:go'))};
if(rm||!cur){go()}else if(hasG){
 if(lenis)lenis.stop();
 const img=cur.querySelector('img');
 gsap.timeline({defaults:{ease:'power3.inOut'}})
  .fromTo(img,{scale:.92},{scale:1.04,duration:1.4,ease:'power2.out'},0)
  .to(cur,{yPercent:-101,duration:1.05,onStart:()=>setTimeout(go,380)},1.25)
  .to(img,{yPercent:-30,duration:1.05},1.25)
  .add(()=>{cur.remove();if(lenis)lenis.start()});
}else{setTimeout(()=>cur.classList.add('lift'),1300);setTimeout(go,1750);setTimeout(()=>cur.remove(),2900)}
// reveal
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
if(hasG&&!rm){ScrollTrigger.batch('.rv:not(.hero .rv),.page,.ul',{start:'top 90%',once:true,onEnter:els=>els.forEach((e,i)=>setTimeout(()=>e.classList.add('in'),i*90))})}
else d.querySelectorAll<HTMLElement>('.rv,.page,.ul').forEach(el=>io.observe(el));
// nav + progress
const bar=d.querySelector<HTMLElement>('.progress i'),nav=d.getElementById('nav');let ly=0;
const links=[...d.querySelectorAll<HTMLElement>('.nav nav a')];
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
links.forEach(a=>{const s=d.querySelector<HTMLElement>(a.getAttribute('href'));s&&so.observe(s)});
// pinned track
const pin=d.getElementById('blueprint'),track=d.getElementById('track'),pbar=d.getElementById('pbar'),pc=d.getElementById('pc'),pages=track.children.length;
const desktop=()=>matchMedia('(min-width:901px)').matches;
const sheets=[...d.querySelectorAll<HTMLElement>('.hs')],hero=d.querySelector<HTMLElement>('.hero');
let mx=0,my=0,smx=0,smy=0;
function frame(){
 const y=scrollY,h=root.scrollHeight-innerHeight;
 bar.style.setProperty('--p',String(h?y/h:0));
 nav.classList.toggle('stuck',y>30);nav.classList.toggle('away',y>ly&&y>500);ly=y;
 if(!rm){
  const hy=clamp(y/innerHeight);
  sheets.forEach(s=>{const k=+s.dataset.depth;
   s.style.setProperty('--tx',((hasG?smx:mx)*-18*k)+'px');
   s.style.setProperty('--ty',((hasG?smy:my)*-12*k - y*.12*k)+'px');
   s.style.setProperty('--r',getComputedStyle(s).getPropertyValue('--r'))});
 }
 if(desktop()&&!rm){
  const r=pin.getBoundingClientRect(),total=pin.offsetHeight-innerHeight,p=pinP!==null?pinP:clamp(-r.top/total);
  const max=track.scrollWidth-innerWidth+48;
  track.style.transform=`translate3d(${-p*max}px,0,0)`;
  pbar.style.setProperty('--pp',String(p));
  pc.textContent=String(Math.min(pages,Math.floor(p*pages*.999)+1)).padStart(2,'0');
 }
 if(big)bigUpdate();
}
let t=false;const sched=()=>{if(hasG)return;if(!t){t=true;requestAnimationFrame(()=>{t=false;frame()})}};
if(hasG){gsap.ticker.add(()=>{smx+=(mx-smx)*.08;smy+=(my-smy)*.08;frame()});
 ScrollTrigger.create({trigger:pin,start:'top top',end:'bottom bottom',onUpdate:self=>{pinP=self.progress},onRefresh:self=>{pinP=self.progress}})}
else{addEventListener('scroll',sched,{passive:true});addEventListener('resize',sched)}
// about words
const big=d.getElementById('big');let sw=[];
if(big&&!rm){big.innerHTML=big.textContent.split(' ').map(w=>`<span class="sw">${w}</span>`).join(' ');sw=[...big.children]}
function bigUpdate(){if(!sw.length)return;const r=big.getBoundingClientRect(),p=clamp((innerHeight*.85-r.top)/(innerHeight*.45+r.height*.5));sw.forEach((s,i)=>s.style.opacity=.16+.84*clamp(p*sw.length*1.15-i))}
// sheets keep their base rotation
const rots=sheets.map(s=>getComputedStyle(s).getPropertyValue('--r'));
frame();
if(rm)return;
// pointer
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;hero.style.setProperty('--mx',mx.toFixed(3));hero.style.setProperty('--my',my.toFixed(3));hero.style.setProperty('--gx',(e.clientX-r.left)+'px');hero.style.setProperty('--gy',(e.clientY-r.top)+'px');sched()},{passive:true});
// ink canvas
const cv=d.getElementById('ink') as HTMLCanvasElement,cx=cv.getContext('2d');let W,H,dpr=Math.min(2,devicePixelRatio||1),px=null,drawing=false,last=0;
const size=()=>{const r=hero.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)};size();addEventListener('resize',size);
let hint=hero.querySelector<HTMLElement>('.hint');
hero.addEventListener('pointermove',e=>{
 const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,now=performance.now();
 if(px){const dx=x-px.x,dy=y-px.y,sp=Math.hypot(dx,dy)/Math.max(8,now-last);
  cx.globalCompositeOperation='source-over';cx.strokeStyle='rgba(14,107,69,.8)';cx.lineCap='round';cx.lineJoin='round';
  cx.lineWidth=clamp(20-sp*8,5,16);cx.beginPath();cx.moveTo(px.x,px.y);cx.lineTo(x,y);cx.stroke();
  if(hint&&hint.style.opacity!=='0')hint.style.opacity='0'}
 px={x,y};last=now;drawing=true;ticker()},{passive:true});
hero.addEventListener('pointerleave',()=>{px=null});
hero.addEventListener('pointerdown',e=>{const r=hero.getBoundingClientRect();cx.fillStyle='rgba(14,107,69,.9)';cx.beginPath();cx.arc(e.clientX-r.left,e.clientY-r.top,22,0,7);cx.fill();drawing=true;ticker()});
let ticking=false;
function ticker(){if(ticking)return;ticking=true;(function loop(){
 cx.globalCompositeOperation='destination-out';cx.fillStyle='rgba(0,0,0,.022)';cx.fillRect(0,0,W,H);
 if(drawing&&!px){drawing=false}
 requestAnimationFrame(()=>{if(px||drawing||true){ if(frames++<2400)loop();else{ticking=false;frames=0;cx.clearRect(0,0,W,H)} }})})()}
let frames=0;
// image slots
if(location.search.includes('slots'))root.classList.add('slots-on');
const galSec=d.getElementById('pages');
d.querySelectorAll<HTMLElement>('.slot,.shot').forEach(el=>{
 if(el.dataset.ratio)el.style.setProperty('--ratio',el.dataset.ratio);
 const im=new Image();im.alt=el.dataset.alt||'';im.decoding='async';
 im.onload=()=>{el.classList.add('has');
  if(el.classList.contains('slot')){el.insertBefore(im,el.firstChild);if(galSec&&galSec.contains(el)){galSec.hidden=false;io.observe(el);const g=el.parentElement.previousElementSibling;if(g&&g.classList.contains('gh'))g.classList.add('on')}}
  else el.style.backgroundImage=`url("${el.dataset.src}")`};
 im.src=el.dataset.src});
if(location.search.includes('slots')&&galSec){galSec.hidden=false;galSec.querySelectorAll('.slot').forEach(s=>s.classList.add('in'));galSec.querySelectorAll('.gh').forEach(h=>h.classList.add('on'))}
// flow field (generative)
const fc=d.getElementById('flow');
if(fc){const fx=(fc as HTMLCanvasElement).getContext('2d'),sec=fc.parentElement;let fw,fh,ps=[],on=false,tt=0;
 const fs=()=>{const r=sec.getBoundingClientRect();fw=(fc as HTMLCanvasElement).width=r.width;fh=(fc as HTMLCanvasElement).height=r.height;fx.fillStyle='#111110';fx.fillRect(0,0,fw,fh);ps=Array.from({length:Math.round(fw/6)},()=>({x:Math.random()*fw,y:Math.random()*fh,a:Math.random()*6}))};fs();addEventListener('resize',fs);
 const ang=(x,y)=>Math.sin(x*.004+tt)*2+Math.cos(y*.005-tt*.7)*2+Math.sin((x+y)*.002)*1.5;
 const fio=new IntersectionObserver(e=>{on=e[0].isIntersecting;if(on)run()});fio.observe(sec);
 let run=()=>{if(!on)return;tt+=.0016;fx.fillStyle='rgba(17,17,16,.045)';fx.fillRect(0,0,fw,fh);fx.strokeStyle='rgba(95,208,160,.55)';fx.lineWidth=1.1;fx.beginPath();
  for(const p of ps){const a=ang(p.x,p.y);const nx=p.x+Math.cos(a)*1.8,ny=p.y+Math.sin(a)*1.8;fx.moveTo(p.x,p.y);fx.lineTo(nx,ny);p.x=nx;p.y=ny;if(p.x<0||p.x>fw||p.y<0||p.y>fh){p.x=Math.random()*fw;p.y=Math.random()*fh}}
  fx.stroke();requestAnimationFrame(run)}}
// touch: scripted stroke so phones get the signature moment too
if(matchMedia('(pointer:coarse)').matches){let k=0;const T=setInterval(()=>{k++;const r=hero.getBoundingClientRect(),x=r.width*(.1+k*.012),y=r.height*(.62+Math.sin(k/6)*.07);
 cx.strokeStyle='rgba(14,107,69,.8)';cx.lineCap='round';cx.lineWidth=10;if(px){cx.beginPath();cx.moveTo(px.x,px.y);cx.lineTo(x,y);cx.stroke()}px={x,y};last=performance.now();ticker();if(k>60){clearInterval(T);px=null}},28)}
// cursor ring
const cu=d.querySelector<HTMLElement>('.cursor');
if(cu&&matchMedia('(hover:hover) and (pointer:fine)').matches){let cxp=0,cyp=0,tx=0,ty=0;
 addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;cu.classList.add('on');
  cu.classList.toggle('big',!!(e.target as Element).closest&&!!(e.target as Element).closest('a,button,summary,[data-magnet]'))},{passive:true});
 d.addEventListener('mouseleave',()=>cu.classList.remove('on'));
 (function mv(){cxp+=(tx-cxp)*.2;cyp+=(ty-cyp)*.2;cu.style.transform=`translate3d(${cxp}px,${cyp}px,0)`;requestAnimationFrame(mv)})()}
// magnet + tilt
d.querySelectorAll<HTMLElement>('[data-magnet]').forEach(b=>{
 b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.2}px,${(e.clientY-r.top-r.height/2)*.3}px)`});
 b.addEventListener('pointerleave',()=>b.style.transform='')});
d.querySelectorAll<HTMLElement>('.tilt').forEach(c=>{
 c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`translate(${x*8}px,${y*8-8}px)`});
 c.addEventListener('pointerleave',()=>c.style.transform='')});
})();

;(()=>{const t=document.querySelectorAll('.nbtabs button'),im=document.querySelectorAll('.nbstage img');if(!t.length)return;let n=0,tm;
const go=i=>{n=i;t.forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-selected',String(k===i))});im.forEach((m,k)=>m.classList.toggle('on',k===i))};
t.forEach((b,i)=>{b.addEventListener('click',()=>{clearInterval(tm);go(i)});b.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches){clearInterval(tm);go(i)}})});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){tm=setInterval(()=>go((n+1)%3),4500)}})();

// WebGL hero. Loaded after first paint. The flat CSS mark stays visible until the
// first 3D frame has really rendered, and comes back if WebGL fails or is too slow.
;(async()=>{
  const cv=document.getElementById('gl') as HTMLCanvasElement|null
  if(!cv)return
  const root=document.documentElement
  const reduced=root.classList.contains('rm')
  const mem=(navigator as any).deviceMemory, cores=navigator.hardwareConcurrency||4
  const phone=matchMedia('(max-width: 900px)').matches
  if(phone&&((mem&&mem<=3)||cores<=3))return
  try{
    const { createHero3D }=await import('./hero3d')
    let h:any=null
    h=createHero3D(cv,{reduced,
      onReady:()=>root.classList.add('gl-on'),
      onFail:()=>root.classList.remove('gl-on')})
    if(!h)return
    if(reduced||root.classList.contains('go'))h.reveal()
    else document.addEventListener('nota:go',()=>setTimeout(()=>h.reveal(),500),{once:true})
  }catch{ root.classList.remove('gl-on') }
})()
