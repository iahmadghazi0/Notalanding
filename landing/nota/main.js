(function(){
  var root=document.documentElement, L=root.lang, RTL=L==='ar';
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  document.getElementById('yr').textContent=new Date().getFullYear();
  var nav=$('.nav');
  window.addEventListener('scroll',function(){nav.classList.toggle('is-scrolled',window.scrollY>10)},{passive:true});

  /* rotator */
  (function(){
    var items=$$('.who__rot [lang="'+L+'"] .rot');if(!items.length)return;
    var i=0;items[0].classList.add('is-in');
    setInterval(function(){
      var cur=items[i];cur.classList.remove('is-in');cur.classList.add('is-out');
      setTimeout(function(){cur.classList.remove('is-out')},900);
      i=(i+1)%items.length;items[i].classList.add('is-in');
    },2300);
  })();

  /* form to WhatsApp */
  var form=$('#lead');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var n=form.name.value.trim(),b=form.business.value.trim(),d=form.need.value.trim();
    var err=$('.form__err',form);
    if(!n||!b){err.hidden=false;(n?form.business:form.name).focus();return}
    err.hidden=true;
    var msg=RTL
      ? 'أهلاً أحمد، أنا '+n+'.\nشغلي: '+b+(d?'\nنفسي أغيّر: '+d:'')+'\nعايز أشوف اتجاه شغلي.'
      : 'Hi Ahmad, I am '+n+'.\nMy business: '+b+(d?'\nWhat I would like to change: '+d:'')+'\nI would like to see my direction.';
    window.open('https://wa.me/201029752345?text='+encodeURIComponent(msg),'_blank','noopener');
  });

  var G=window.gsap;
  var killLoader=function(){var l=$('.loader');if(l)l.style.display='none'};

  /* language switch: lime curtain, then reload in the other language */
  $('[data-lang-toggle]').addEventListener('click',function(){
    var next=RTL?'en':'ar';
    try{localStorage.setItem('nota-lang',next)}catch(e){}
    var u=new URL(location.href);u.searchParams.set('lang',next);u.hash='';
    if(G){G.to('.curtain',{scaleY:1,duration:.55,ease:'expo.inOut',onComplete:function(){location.href=u.toString()}})}
    else location.href=u.toString();
  });

  if(!G||!window.ScrollTrigger){killLoader();return}
  gsap.registerPlugin(ScrollTrigger);
  var hasSplit=!!window.SplitText; if(hasSplit)gsap.registerPlugin(SplitText);
  var hasDrag=!!window.Draggable; if(hasDrag)gsap.registerPlugin(Draggable); if(window.InertiaPlugin)gsap.registerPlugin(InertiaPlugin);
  var skipLoader=root.classList.contains('skip-loader');
  root.classList.add('motion');
  $('.loader').style.animation='none';
  var fine=window.matchMedia('(pointer:fine)').matches;
  var dir=RTL?-1:1;

  /* smooth scroll */
  var lenis=null;
  if(window.Lenis){
    lenis=new Lenis({lerp:.085,smoothWheel:true,wheelMultiplier:1});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000)});
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){
      var id=a.getAttribute('href');if(id.length<2&&id!=='#top')return;
      var t=id==='#top'?0:$(id);if(t===null)return;
      e.preventDefault();lenis.scrollTo(t,{offset:-60,duration:1.4,force:true});
    })});
  }

  /* progress + nav hide */
  gsap.to('.progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
  ScrollTrigger.create({start:0,end:'max',onUpdate:function(s){nav.classList.toggle('is-hidden',s.direction===1&&s.scroll()>500)}});

  /* cursor + magnetic */
  if(fine){
    root.classList.add('has-cursor');
    var cur=$('.cursor'),lab=$('.cursor__label');
    var cx=gsap.quickTo(cur,'x',{duration:.35,ease:'power3'}),cy=gsap.quickTo(cur,'y',{duration:.35,ease:'power3'});
    window.addEventListener('mousemove',function(e){cx(e.clientX);cy(e.clientY)});
    $$('a,button,.lang,.hero__mark').forEach(function(el){
      el.addEventListener('mouseenter',function(){var t=el.getAttribute('data-cursor-'+L)||el.getAttribute('data-cursor');if(t){lab.textContent=t;cur.classList.add('is-label')}else cur.classList.add('is-link')});
      el.addEventListener('mouseleave',function(){cur.classList.remove('is-link','is-label')});
    });
    $$('.btn,.lang,.direct').forEach(function(el){
      var mx=gsap.quickTo(el,'x',{duration:.5,ease:'power3'}),my=gsap.quickTo(el,'y',{duration:.5,ease:'power3'});
      el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();mx((e.clientX-r.left-r.width/2)*.3);my((e.clientY-r.top-r.height/2)*.35)});
      el.addEventListener('mouseleave',function(){gsap.to(el,{x:0,y:0,duration:.9,ease:'elastic.out(1,.4)'})});
    });
  }

  /* ===== intro: loader, then the hero writes itself ===== */
  var started=false,introDone=false,heroPieces=[];
  function intro(){
    if(started)return;started=true;
    var h1=$('.hero__title [lang="'+L+'"]');
    var pieces;
    if(hasSplit){
      var sp=SplitText.create(h1,RTL?{type:'words',mask:'words',wordsClass:'w'}:{type:'words,chars',mask:'words',wordsClass:'w',charsClass:'c'});
      pieces=RTL?sp.words:sp.chars;
    } else pieces=$$('.ln',h1);
    var swipe=$('.swipe path'),sl=swipe.getTotalLength();
    gsap.set(swipe,{strokeDasharray:sl,strokeDashoffset:sl});
    gsap.set(['.hero__title','.swipe'],{autoAlpha:1});
    gsap.set(pieces,{yPercent:120,rotation:RTL?0:8});
    gsap.set('.hero__note',{autoAlpha:0,y:-120,rotation:-28,scale:1.2});
    gsap.set(['.hero__lead','.hero__actions','.hero__foot'],{autoAlpha:0,y:30});

    var tl=gsap.timeline();
    if(!skipLoader){
    tl.from('.loader__mark',{scale:.5,rotation:-14,autoAlpha:0,duration:.6,ease:'back.out(2)'})
      .to('.loader__bar i',{scaleX:1,duration:.55,ease:'power2.inOut'},'-=.2')
      .to('.loader__mark',{y:-30,autoAlpha:0,duration:.35,ease:'power2.in'})
      .to('.loader',{clipPath:'inset(0 0 100% 0)',duration:.8,ease:'expo.inOut'},'-=.1')
      .set('.loader',{display:'none'});
    } else { killLoader(); tl.to({}, {duration:.55}); }
    try{sessionStorage.setItem('nota-seen','1')}catch(e){}
    tl.to(pieces,{yPercent:0,rotation:0,duration:1.1,ease:'expo.out',stagger:RTL?.08:.022},'-=.55')
      .to('.hero__note',{autoAlpha:1,y:0,rotation:-4,scale:1,duration:1,ease:'elastic.out(1,.55)'},'-=.9')
      .to(swipe,{strokeDashoffset:0,duration:.8,ease:'power2.inOut'},'-=.6')
      .to(['.hero__lead','.hero__actions','.hero__foot'],{autoAlpha:1,y:0,duration:.9,ease:'expo.out',stagger:.1},'-=.6')
      .add(function(){if(lenis)lenis.start();ScrollTrigger.refresh();heroPieces=pieces;introDone=true});
  }
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(intro);
  setTimeout(intro,2200);

  /* hero: living type. Letters lean toward your cursor */
  var mouse={x:-9999,y:-9999,in:false};
  var hero=$('.hero');
  hero.addEventListener('mousemove',function(e){mouse.x=e.clientX;mouse.y=e.clientY;mouse.in=true});
  hero.addEventListener('mouseleave',function(){mouse.in=false;mouse.x=-9999;mouse.y=-9999});
  var lastIn=false;
  gsap.ticker.add(function(){
    if(!introDone||!fine)return;
    if(!mouse.in&&!lastIn)return; lastIn=mouse.in;
    for(var k=0;k<heroPieces.length;k++){
      var el=heroPieces[k],r=el.getBoundingClientRect();
      var dx=mouse.x-(r.left+r.width/2),dy=mouse.y-(r.top+r.height/2);
      var f=Math.exp(-(dx*dx+dy*dy)/(170*170));
      gsap.to(el,{y:-f*0.22*r.height,fontWeight:600+Math.round(f*100),color:f>.55?'#123B2A':'#000',duration:.45,ease:'power3.out',overwrite:'auto'});
    }
  });

  /* hero: ruled notebook lines that bend around the cursor */
  (function(){
    var cv=$('.hero__lines');if(!cv)return;var ctx=cv.getContext('2d');var W,H,dpr,gap=38,margin;
    var sm={x:-9999,y:-9999};
    function size(){dpr=Math.min(window.devicePixelRatio||1,2);var r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);var pd=Math.min(72,Math.max(20,W*.05))*.42;margin=RTL?W-pd:pd}
    size();window.addEventListener('resize',size);
    var visible=true;ScrollTrigger.create({trigger:hero,start:'top top',end:'bottom top',onToggle:function(st){visible=st.isActive}});
    var t0=0;
    gsap.ticker.add(function(time){
      if(!visible)return;
      var r=cv.getBoundingClientRect();
      var tx=mouse.in?mouse.x-r.left:-9999,ty=mouse.in?mouse.y-r.top:-9999;
      sm.x+= (tx-sm.x)*.12; sm.y+=(ty-sm.y)*.12; if(!mouse.in){sm.x=tx;sm.y=ty}
      ctx.clearRect(0,0,W,H);
      ctx.lineWidth=1;ctx.strokeStyle='rgba(0,0,0,.075)';
      for(var y=gap*2.2;y<H;y+=gap){
        ctx.beginPath();
        for(var x=0;x<=W;x+=12){
          var dx=x-sm.x,dy=y-sm.y,d2=dx*dx+dy*dy;
          var push=Math.exp(-d2/(140*140))*(dy>0?1:-1)*26;
          var wave=Math.sin(x*.008+time*1.2+y*.02)*1.2;
          var yy=y+push+wave;
          x===0?ctx.moveTo(x,yy):ctx.lineTo(x,yy);
        }
        ctx.stroke();
      }
      ctx.strokeStyle='rgba(210,240,74,.95)';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.moveTo(margin,0);ctx.lineTo(margin,H);ctx.stroke();
    });
  })();

  /* hero: the note is a sticker you can throw around */
  if(hasDrag){
    Draggable.create('.hero__mark',{type:'x,y',bounds:hero,inertia:!!window.InertiaPlugin,edgeResistance:.75,
      onPress:function(){gsap.to('.hero__note',{scale:1.08,rotation:4,duration:.3,ease:'power3.out'})},
      onDrag:function(){gsap.to('.hero__note',{rotation:gsap.utils.clamp(-25,25,this.deltaX*1.4),duration:.3,overwrite:'auto'})},
      onRelease:function(){gsap.to('.hero__note',{scale:1,rotation:-4,duration:1,ease:'elastic.out(1,.4)'})}
    });
  }
  gsap.to('.hero__copy',{yPercent:-18,autoAlpha:.15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

  /* headings rise line by line */
  $$('.h-section [lang="'+L+'"], .offer h2 [lang="'+L+'"], .about h2 [lang="'+L+'"], .contact h2 [lang="'+L+'"], .who h2 [lang="'+L+'"]').forEach(function(el){
    if(!hasSplit){gsap.from(el,{y:40,autoAlpha:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 88%'}});return}
    SplitText.create(el,{type:'lines',mask:'lines',autoSplit:true,onSplit:function(self){
      return gsap.from(self.lines,{yPercent:115,duration:1.15,ease:'expo.out',stagger:.09,scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}});
    }});
  });

  /* quiet fade-ups in batches */
  gsap.set('.about__copy p,.offer__copy p,.offer .btn,.contact__copy>p,.direct,.who__note',{autoAlpha:0,y:34});
  ScrollTrigger.batch('.about__copy p,.offer__copy p,.offer .btn,.contact__copy>p,.direct,.who__note',{start:'top 90%',
    onEnter:function(b){gsap.to(b,{autoAlpha:1,y:0,duration:.9,ease:'expo.out',stagger:.07,overwrite:true})},
    onLeaveBack:function(b){gsap.to(b,{autoAlpha:0,y:34,duration:.4,overwrite:true})}});

  /* the pieces scene: scattered work gathers into one NOTA stack */
  var mm=gsap.matchMedia();
  mm.add({wide:'(min-width: 861px)',narrow:'(max-width: 860px)'},function(ctx){
    var w=ctx.conditions.wide;
    var stack=[[-8,-6,-5],[-4,-3,3],[-2,-1,-2],[0,0,1.5]];
    var sc=w?[[-50,-34,-14],[54,-38,12],[-52,34,9],[58,30,-11]]:[[-48,-30,-12],[46,-32,11],[-44,26,8],[48,24,-10]];
    var sheets=$$('.sheets .sheet:not(.sheet--top)');
    sheets.forEach(function(s,i){gsap.set(s,{xPercent:sc[i][0]*dir,yPercent:sc[i][1],rotation:sc[i][2]*dir,x:0,y:0})});
    var arrow=$('.sheet__arrow path'),al=arrow.getTotalLength();
    gsap.set(arrow,{strokeDasharray:al,strokeDashoffset:al});
    gsap.set('.sheet--top',{yPercent:-170,rotation:-14,autoAlpha:0});
    gsap.set('.pieces__b',{autoAlpha:0,y:40});
    /* idle float while scattered */
    var floats=sheets.map(function(s,i){return gsap.to(s,{y:(i%2?14:-14),duration:2+i*.3,ease:'sine.inOut',yoyo:true,repeat:-1})});
    var t=gsap.timeline({scrollTrigger:{trigger:'.pieces',start:'top top',end:'bottom bottom',scrub:.9}});
    t.to({}, {duration:.2});
    sheets.forEach(function(s,i){t.to(s,{xPercent:stack[i][0]*dir,yPercent:stack[i][1],rotation:stack[i][2]*dir,duration:1,ease:'power3.inOut'},.2+i*.07)});
    t.add(function(){floats.forEach(function(f){f.pause()})},.2)
     .to('.pieces__a',{autoAlpha:0,y:-40,filter:'blur(6px)',duration:.5},1.05)
     .to('.sheet--top',{yPercent:0,rotation:-1,autoAlpha:1,duration:.7,ease:'back.out(1.6)'},1.25)
     .fromTo('.sheets',{scale:1},{scale:1.04,duration:.15,yoyo:true,repeat:1},1.85)
     .to('.pieces__b',{autoAlpha:1,y:0,duration:.5},1.5)
     .to(arrow,{strokeDashoffset:0,duration:.6},1.75)
     .to({}, {duration:.35});
    return function(){floats.forEach(function(f){f.kill()})};
  });

  /* services: an index you open */
  $$('.ix__btn').forEach(function(btn,i){
    var panel=document.getElementById(btn.getAttribute('aria-controls'));
    var items=$$('li',panel);
    function setOpen(open,instant){
      btn.setAttribute('aria-expanded',open?'true':'false');
      gsap.to(panel,{height:open?'auto':0,duration:instant?0:.8,ease:'expo.inOut',onComplete:function(){ScrollTrigger.refresh()}});
      if(open)gsap.fromTo(items,{y:30,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:'expo.out',stagger:.07,delay:instant?0:.2});
    }
    btn.addEventListener('click',function(){
      var open=btn.getAttribute('aria-expanded')!=='true';
      $$('.ix__btn[aria-expanded="true"]').forEach(function(o){if(o!==btn){o.setAttribute('aria-expanded','false');gsap.to(document.getElementById(o.getAttribute('aria-controls')),{height:0,duration:.7,ease:'expo.inOut'})}});
      setOpen(open);
    });
    if(i===0)setOpen(true,true);
  });
  gsap.from('.ix__row',{yPercent:30,autoAlpha:0,duration:1,ease:'expo.out',stagger:.1,scrollTrigger:{trigger:'.ix',start:'top 85%'}});
  gsap.from('.ix__name',{xPercent:-4*dir,duration:1.2,ease:'expo.out',stagger:.1,scrollTrigger:{trigger:'.ix',start:'top 85%'}});

  /* mobile menu */
  var burger=$('.burger'),menu=$('#menu');
  function menuSet(o){burger.setAttribute('aria-expanded',o?'true':'false');
    if(o){menu.hidden=false;if(lenis)lenis.stop();gsap.fromTo(menu,{clipPath:'circle(0% at 90% 4%)'},{clipPath:'circle(150% at 90% 4%)',duration:.8,ease:'expo.inOut'});gsap.from($$('#menu nav a'),{y:50,autoAlpha:0,stagger:.06,duration:.7,ease:'expo.out',delay:.2})}
    else{gsap.to(menu,{clipPath:'circle(0% at 90% 4%)',duration:.6,ease:'expo.inOut',onComplete:function(){menu.hidden=true}});if(lenis)lenis.start()}}
  burger.addEventListener('click',function(){menuSet(burger.getAttribute('aria-expanded')!=='true')});
  $$('#menu a').forEach(function(a){a.addEventListener('click',function(){menuSet(false)})});

  /* marquee band, speed follows your scroll */
  var band=$('.band__track');
  var loop=gsap.to(band,{xPercent:-50*dir,duration:22,ease:'none',repeat:-1});
  var boost=gsap.quickTo(loop,'timeScale',{duration:.4});
  ScrollTrigger.create({trigger:'.band',start:'top bottom',end:'bottom top',onUpdate:function(s){
    var v=s.getVelocity()/300; var ts=1+Math.min(Math.abs(v),6); loop.timeScale(ts*(v<0?-1:1)); gsap.to(loop,{timeScale:1,duration:1.2,overwrite:true,delay:.05});
  }});
  gsap.from('.band',{rotation:-2.5*dir,scrollTrigger:{trigger:'.band',start:'top bottom',end:'bottom top',scrub:true}});

  /* who: the photo opens up like a window */
  gsap.fromTo('.who',{clipPath:'inset(8% 6% 8% 6% round 28px)'},{clipPath:'inset(0% 0% 0% 0% round 0px)',ease:'none',scrollTrigger:{trigger:'.who',start:'top 90%',end:'top 15%',scrub:true}});
  gsap.fromTo('.who__img',{scale:1.25},{scale:1,yPercent:-10,ease:'none',scrollTrigger:{trigger:'.who',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.from('.who__rot',{autoAlpha:0,y:60,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:'.who__rot',start:'top 85%'}});

  /* how: the process slides sideways while you scroll down */
  var track=$('.how__track');
  var hps=$$('.hp');
  hps.forEach(function(c){var p=$('.hp__doodle path',c),l=p.getTotalLength();gsap.set(p,{strokeDasharray:l,strokeDashoffset:l})});
  mm.add({wide:'(min-width: 861px)',narrow:'(max-width: 860px)'},function(ctx){
    if(ctx.conditions.wide){
      var dist=function(){return Math.max(0,track.scrollWidth-window.innerWidth)};
      var ht=gsap.to(track,{x:function(){return dist()*-dir},ease:'none',scrollTrigger:{trigger:'.how',pin:'.how__pin',start:'top top',end:function(){return '+='+dist()},scrub:.6,invalidateOnRefresh:true,
        onUpdate:function(st){gsap.set('.how__bar i',{scaleX:st.progress})}}});
      hps.forEach(function(c,i){
        if(i===0){gsap.to($('.hp__doodle path',c),{strokeDashoffset:0,duration:1.2,ease:'power2.inOut',scrollTrigger:{trigger:'.how',start:'top 55%'}})}
        else gsap.to($('.hp__doodle path',c),{strokeDashoffset:0,duration:1.2,ease:'power2.inOut',scrollTrigger:{trigger:c,containerAnimation:ht,start:'left 85%',toggleActions:'play none none reverse'}});
        gsap.from($('.hp__n',c),{yPercent:40,autoAlpha:0,scrollTrigger:{trigger:c,containerAnimation:ht,start:'left 100%',end:'left 50%',scrub:true}});
        gsap.from(c,{rotation:(i%2?4:-4)*dir,y:40,scrollTrigger:{trigger:c,containerAnimation:ht,start:'left 100%',end:'left 55%',scrub:true}});
      });
    } else {
      hps.forEach(function(c){
        gsap.from(c,{y:80,rotation:3*dir,autoAlpha:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:c,start:'top 85%'}});
        gsap.to($('.hp__doodle path',c),{strokeDashoffset:0,duration:1.2,ease:'power2.inOut',scrollTrigger:{trigger:c,start:'top 70%'}});
      });
    }
  });

  /* offer: two taped sheets land and react to your cursor */
  var bpa=$('.bp__arrow path'),bl=bpa.getTotalLength();gsap.set(bpa,{strokeDasharray:bl,strokeDashoffset:bl});
  var ot=gsap.timeline({scrollTrigger:{trigger:'.blueprint',start:'top 85%',end:'center 50%',scrub:.7}});
  ot.from('.bp--back',{y:220,x:80*dir,rotation:24,autoAlpha:0},0).from('.bp--front',{y:300,x:-60*dir,rotation:-22,autoAlpha:0},.12).to(bpa,{strokeDashoffset:0,duration:.5},.5);
  if(fine){
    var bp=$('.blueprint');
    var rx=gsap.quickTo(bp,'rotationY',{duration:.8,ease:'power3'}),ry=gsap.quickTo(bp,'rotationX',{duration:.8,ease:'power3'});
    gsap.set(bp,{transformPerspective:900});
    bp.addEventListener('mousemove',function(e){var r=bp.getBoundingClientRect();rx(((e.clientX-r.left)/r.width-.5)*14);ry(-((e.clientY-r.top)/r.height-.5)*12)});
    bp.addEventListener('mouseleave',function(){rx(0);ry(0)});
  }

  /* about: the photo reveals from below */
  gsap.fromTo('.about__img',{clipPath:'inset(100% 0 0 0 round 18px)'},{clipPath:'inset(0% 0 0 0 round 18px)',duration:1.4,ease:'expo.inOut',scrollTrigger:{trigger:'.about__img',start:'top 80%'}});
  gsap.fromTo('.about__img img',{scale:1.35},{scale:1,yPercent:-6,ease:'none',scrollTrigger:{trigger:'.about',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.from('.about__role',{autoAlpha:0,x:-30*dir,duration:.9,ease:'expo.out',scrollTrigger:{trigger:'.about__role',start:'top 90%'}});

  /* contact: the form card drops onto the table */
  gsap.from('.form',{y:120,rotation:6*dir,autoAlpha:0,duration:1.3,ease:'expo.out',scrollTrigger:{trigger:'.form',start:'top 88%'}});

  /* footer: NOTA rises */
  gsap.from('.foot__big img',{yPercent:60,autoAlpha:0,ease:'none',scrollTrigger:{trigger:'.foot',start:'top bottom',end:'bottom bottom',scrub:true}});

  window.addEventListener('load',function(){ScrollTrigger.refresh()});
})();
