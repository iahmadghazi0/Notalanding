(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG=typeof window.gsap!=='undefined'&&typeof window.ScrollTrigger!=='undefined';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  document.getElementById('yr').textContent=new Date().getFullYear();

  /* nav border */
  var nav=$('.nav');
  var onScroll=function(){nav.classList.toggle('is-scrolled',window.scrollY>10)};
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* language */
  function setLang(l){
    root.lang=l;root.dir=l==='ar'?'rtl':'ltr';
    try{localStorage.setItem('nota-lang',l)}catch(e){}
    var u=new URL(location.href);u.searchParams.set('lang',l);history.replaceState(null,'',u);
    startRotator();
    if(hasG){ScrollTrigger.refresh()}
  }
  $('[data-lang-toggle]').addEventListener('click',function(){setLang(root.lang==='ar'?'en':'ar')});

  /* rotator */
  var rotTimer=null;
  function startRotator(){
    clearInterval(rotTimer);
    var items=$$('.who__rot [lang="'+root.lang+'"] .rot');
    $$('.who__rot .rot').forEach(function(r){r.classList.remove('is-in','is-out')});
    if(!items.length)return;
    var i=0;items[0].classList.add('is-in');
    if(reduce)return;
    rotTimer=setInterval(function(){
      var cur=items[i];cur.classList.remove('is-in');cur.classList.add('is-out');
      setTimeout(function(){cur.classList.remove('is-out')},900);
      i=(i+1)%items.length;items[i].classList.add('is-in');
    },2300);
  }
  startRotator();

  /* form -> WhatsApp */
  var form=$('#lead');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var n=form.name.value.trim(),b=form.business.value.trim(),d=form.need.value.trim();
    var err=$('.form__err',form);
    if(!n||!b){err.hidden=false;(n?form.business:form.name).focus();return}
    err.hidden=true;
    var msg=root.lang==='ar'
      ? 'أهلاً أحمد، أنا '+n+'.\nشغلي: '+b+(d?'\nنفسي أغيّر: '+d:'')+'\nعايز أشوف اتجاه شغلي.'
      : 'Hi Ahmad, I am '+n+'.\nMy business: '+b+(d?'\nWhat I would like to change: '+d:'')+'\nI would like to see my direction.';
    window.open('https://wa.me/201029752345?text='+encodeURIComponent(msg),'_blank','noopener');
  });

  if(!hasG||reduce)return;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('motion');

  /* hero entrance: one orchestrated moment */
  var lines=$$('.hero__title [lang] .ln');
  var swipe=$('.swipe path');var sl=swipe.getTotalLength();
  gsap.set(swipe,{strokeDasharray:sl,strokeDashoffset:sl});
  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from(lines,{yPercent:60,opacity:0,duration:1,stagger:.09})
    .from('.hero__note',{y:-90,rotation:-22,scale:1.15,opacity:0,duration:.9,ease:'back.out(2.2)'},.25)
    .to(swipe,{strokeDashoffset:0,duration:.9,ease:'power2.inOut'},.75)
    .from('.hero__lead,.hero__actions,.hero__foot',{y:24,opacity:0,duration:.8,stagger:.08},.9);

  /* pieces: scattered work becomes one stack */
  var mm=gsap.matchMedia();
  mm.add({wide:'(min-width: 861px)',narrow:'(max-width: 860px)'},function(ctx){
    var w=ctx.conditions.wide, k=w?1:.6;
    var stack=[[-8,-6,-5],[-4,-3,3],[-2,-1,-2],[0,0,1.5]];
    var scatter=w?[[-50,-34,-14],[54,-38,12],[-52,34,9],[58,30,-11]]:[[-48,-30,-12],[46,-32,11],[-44,26,8],[48,24,-10]];
    var sheets=$$('.sheets .sheet:not(.sheet--top)');
    sheets.forEach(function(s,i){gsap.set(s,{xPercent:scatter[i][0],yPercent:scatter[i][1],rotation:scatter[i][2],x:0,y:0})});
    var arrow=$('.sheet__arrow path');var al=arrow.getTotalLength();
    gsap.set(arrow,{strokeDasharray:al,strokeDashoffset:al});
    gsap.set('.sheet--top',{yPercent:-170,rotation:-14,opacity:0});
    gsap.set('.pieces__b',{opacity:0,y:30});
    var t=gsap.timeline({scrollTrigger:{trigger:'.pieces',start:'top top',end:'bottom bottom',scrub:.8}});
    t.to({}, {duration:.25});
    sheets.forEach(function(s,i){t.to(s,{xPercent:stack[i][0],yPercent:stack[i][1],rotation:stack[i][2],duration:1,ease:'power2.inOut'},.25+i*.06)});
    t.to('.pieces__a',{opacity:0,y:-30,duration:.5},1.05)
     .to('.sheet--top',{yPercent:0,rotation:-1,opacity:1,duration:.7,ease:'back.out(1.4)'},1.25)
     .to('.pieces__b',{opacity:1,y:0,duration:.5},1.45)
     .to(arrow,{strokeDashoffset:0,duration:.6},1.7)
     .to({}, {duration:.4});
  });

  /* who: slow parallax */
  gsap.to('.who__img',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'.who',start:'top bottom',end:'bottom top',scrub:true}});

  /* how: the line draws as you read */
  gsap.fromTo('.how__line',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',ease:'none',scrollTrigger:{trigger:'.how__path',start:'top 70%',end:'bottom 60%',scrub:true}});
  $$('.step').forEach(function(s){ScrollTrigger.create({trigger:s,start:'top 62%',onEnter:function(){s.classList.add('is-on')},onLeaveBack:function(){s.classList.remove('is-on')}})});

  /* offer: the two sheets arrive and settle */
  var bpa=$('.bp__arrow path');var bl=bpa.getTotalLength();gsap.set(bpa,{strokeDasharray:bl,strokeDashoffset:bl});
  var ot=gsap.timeline({scrollTrigger:{trigger:'.blueprint',start:'top 80%',end:'center 50%',scrub:.6}});
  ot.from('.bp--back',{y:120,rotation:18,opacity:0},0).from('.bp--front',{y:180,rotation:-16,opacity:0},.15).to(bpa,{strokeDashoffset:0,duration:.5},.5);

  /* about: gentle image drift */
  gsap.to('.about__img img',{yPercent:-8,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:true}});

  window.addEventListener('load',function(){ScrollTrigger.refresh()});
})();
