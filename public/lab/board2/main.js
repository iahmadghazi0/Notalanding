(function(){
var fl=document.querySelector('.float');function chk(){fl.classList.toggle('off',scrollY<innerHeight*.7)}addEventListener('scroll',chk,{passive:true});chk();
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var word='bakery';
var sheets=[
 ['The mirror','What you and your guests already said.','A blueprint opens with their own words, and every line names the page you can check it on.','"Worth the trip, every time." Guest review'],
 ['The paradox','The {w} paradox.','One gap, named in your terms. Not a failure: the thing you built, sitting one step from the guest who wants it.','A door they cannot find.'],
 ['The pivot','From one line to another.','"Link in bio" becomes a door on every page where guests already land.','A list with a reason to join.'],
 ['Three pillars','Three named things, in your words.','What guests see. How guests take part. Where a waiting guest goes.','One list that answers "tell me when".'],
 ['First drafts','Already begun, for you to keep or rewrite.','Five drafts, close to the owner\'s own captions, ready before you ask.','"You can tell it is made by hand."'],
 ['The next move','One small door.','Reply with one word. You pick the day and the time. No form, no call booked for you.','Reply "Blueprint".']];
var tabs=document.querySelector('.tabs'),sheet=document.getElementById('sheet'),sn=document.getElementById('sn');
function show(i){
 [].forEach.call(tabs.children,function(b,k){b.classList.toggle('on',k===i);b.setAttribute('aria-selected',k===i)});
 var s=sheets[i];sn.textContent=i+1;
 sheet.innerHTML='<p class="mono">0'+(i+1)+' &middot; '+s[0]+'</p><h3>'+s[1].replace('{w}','<span class="hl">'+word+'</span>')+'</h3><p>'+s[2]+'</p><div class="quote"><span class="hand">'+s[3]+'</span></div>';
 if(!RM)gsap.fromTo(sheet.children,{y:14,opacity:0},{y:0,opacity:1,duration:.5,stagger:.06,ease:'power3.out'});
}
sheets.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent='0'+(i+1)+' '+s[0];b.onclick=function(){show(i)};tabs.appendChild(b)});
function setWord(w){word=(w||'bakery').trim().toLowerCase()||'bakery';document.getElementById('bw').textContent=word;var t=[].findIndex.call(tabs.children,function(b){return b.classList.contains('on')});show(Math.max(t,0))}
show(0);
document.getElementById('word').addEventListener('submit',function(e){e.preventDefault();setWord(document.getElementById('w').value);document.getElementById('blueprint').scrollIntoView({behavior:RM?'auto':'smooth'})});
document.querySelectorAll('.chips button').forEach(function(b){b.onclick=function(){document.getElementById('w').value=b.textContent;setWord(b.textContent);document.getElementById('blueprint').scrollIntoView({behavior:RM?'auto':'smooth'})}});
// template crossfade
var im=document.querySelectorAll('.tpl img'),k=0;if(!RM)setInterval(function(){im[k].classList.remove('on');k=(k+1)%im.length;im[k].classList.add('on')},3200);
if(RM)return;
var lenis=new Lenis({lerp:.09});function raf(t){lenis.raf(t);requestAnimationFrame(raf)}requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);lenis.on('scroll',ScrollTrigger.update);
document.querySelectorAll('.rv').forEach(function(el){gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
gsap.to('.shot img',{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
var pp=document.getElementById('pp');if(pp){var L=pp.getTotalLength();gsap.fromTo('.pa path',{strokeDasharray:function(i,t){return t.getTotalLength()},strokeDashoffset:function(i,t){return t.getTotalLength()}},{strokeDashoffset:0,duration:1.6,ease:'power2.out',scrollTrigger:{trigger:'.pathrow',start:'top 80%'}})}
gsap.from('.hero h1',{y:40,opacity:0,duration:1,ease:'power3.out'});gsap.from('.hero .ul path',{strokeDasharray:400,strokeDashoffset:400,duration:1.2,delay:.5,ease:'power2.out'});
var shot=document.getElementById('shot');
if(matchMedia('(pointer:fine)').matches)document.querySelector('.hero').addEventListener('pointermove',function(e){var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;gsap.to(shot,{rotateY:-5+x*7,rotateX:2-y*5,duration:.6,ease:'power2.out'})});
document.querySelectorAll('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();lenis.scrollTo(t,{offset:0})}})});
})();
