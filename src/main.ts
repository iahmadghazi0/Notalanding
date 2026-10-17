import './style.css'
;(()=>{
const d=document,root=d.documentElement
root.classList.add('js')
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches
requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('go')))
// nav
const nav=d.getElementById('nav')!
const onScroll=()=>nav.classList.toggle('stuck',scrollY>30)
addEventListener('scroll',onScroll,{passive:true});onScroll()
const links=[...d.querySelectorAll<HTMLElement>('.nav nav a')]
const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'})
links.forEach(a=>{const s=d.querySelector(a.getAttribute('href')!);s&&so.observe(s)})
// story panels: the panel nearest the middle of the screen is active
const panels=[...d.querySelectorAll<HTMLElement>('.panel')],steps=[...d.querySelectorAll<HTMLElement>('.steps li')]
const po=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const i=+((e.target as HTMLElement).dataset.s||0);panels.forEach((p,k)=>p.classList.toggle('on',k===i));steps.forEach((s,k)=>s.classList.toggle('on',k===i))}}),{rootMargin:'-40% 0px -40% 0px'})
panels.forEach(p=>po.observe(p))
if(rm)panels.forEach(p=>p.classList.add('on'))
// notabuild tabs
const t=d.querySelectorAll<HTMLElement>('.nbtabs button'),im=d.querySelectorAll('.nbstage img');let n=0,tm=0
const go=(i:number)=>{n=i;t.forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-selected',String(k===i))});im.forEach((m,k)=>m.classList.toggle('on',k===i))}
t.forEach((b,i)=>{b.addEventListener('click',()=>{clearInterval(tm);go(i)});b.setAttribute('tabindex','0');b.addEventListener('keydown',e=>{if((e as KeyboardEvent).key==='Enter'||(e as KeyboardEvent).key===' '){e.preventDefault();clearInterval(tm);go(i)}})})
if(!rm)tm=window.setInterval(()=>go((n+1)%3),4500)
// portrait slot
d.querySelectorAll<HTMLElement>('.slot').forEach(el=>{const img=new Image();img.alt='Ahmad Ghazi';img.onload=()=>{el.classList.add('has');el.insertBefore(img,el.firstChild)};img.src=el.dataset.src!})
// mobile pill
const fab=d.getElementById('fab')!,vis=new Set<Element>()
const upd=()=>fab.classList.toggle('on',vis.size===0)
const fo=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target));upd()},{threshold:.05})
;[d.getElementById('top'),d.querySelector('.final'),d.querySelector('.foot'),d.querySelector('.bp')].forEach(el=>el&&fo.observe(el))
})()

// Signature 3D layer. Loaded after first paint. The flat sheets stay until the first real 3D frame.
;(async()=>{
  const cv=document.getElementById('gl') as HTMLCanvasElement|null
  if(!cv)return
  const root=document.documentElement
  const mem=(navigator as any).deviceMemory, cores=navigator.hardwareConcurrency||4
  if(matchMedia('(max-width: 900px)').matches&&((mem&&mem<=3)||cores<=3))return
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
  try{
    const { createHero3D }=await import('./hero3d')
    createHero3D(cv,{reduced,onReady:()=>root.classList.add('gl-on'),onFail:()=>root.classList.remove('gl-on')})
  }catch{ root.classList.remove('gl-on') }
})()
