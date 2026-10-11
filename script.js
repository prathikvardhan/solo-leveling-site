(function(){
  "use strict";

  var page = document.body.getAttribute('data-page');
  document.querySelectorAll('[data-page-link]').forEach(function(link){
    if(link.getAttribute('data-page-link') === page) link.setAttribute('aria-current','page');
  });

  var progress = document.getElementById('progress');
  var header = document.getElementById('siteHeader');
  var parEls = Array.prototype.slice.call(document.querySelectorAll('[data-par]'));
  function onScroll(){
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var y = doc.scrollTop || document.body.scrollTop;
    if(progress) progress.style.width = (max > 0 ? y/max*100 : 0) + '%';
    if(header) header.classList.toggle('solid', y > 60);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 900) return;
    parEls.forEach(function(el){
      var rect = el.getBoundingClientRect();
      if(rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      var offset = (rect.top + rect.height/2 - window.innerHeight/2) * parseFloat(el.getAttribute('data-par'));
      el.style.transform = 'translate3d(0,' + (-offset).toFixed(2) + 'px,0)';
    });
  }
  if(progress || header || parEls.length){
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in'); observer.unobserve(entry.target); }
      });
    }, {threshold:.14,rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ observer.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  var particles = document.getElementById('particles');
  if(particles){
    var fragment = document.createDocumentFragment();
    for(var i=0;i<34;i++){
      var particle = document.createElement('i');
      particle.style.left = Math.random()*100 + '%';
      particle.style.bottom = '-10px';
      particle.style.animationDuration = (7 + Math.random()*9).toFixed(1) + 's';
      particle.style.animationDelay = (-Math.random()*12).toFixed(1) + 's';
      var size = (1 + Math.random()*2.4).toFixed(1);
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.opacity = (0.35 + Math.random()*0.6).toFixed(2);
      if(Math.random() > .65){ particle.style.background = '#a887ff'; particle.style.boxShadow = '0 0 10px #a887ff'; }
      fragment.appendChild(particle);
    }
    particles.appendChild(fragment);
  }

  var statusBox = document.querySelector('.sys');
  var level = document.getElementById('lvlNum');
  if(statusBox && level){
    var counted = false;
    function fillStats(){
      statusBox.classList.add('scanned');
      document.querySelectorAll('.bar i').forEach(function(bar,index){
        setTimeout(function(){ bar.style.width = bar.getAttribute('data-fill') + '%'; }, index*110);
      });
    }
    function countUp(){
      if(counted) return;
      counted = true;
      var target = parseInt(level.getAttribute('data-count'),10) || 100;
      var start = performance.now();
      (function frame(now){
        var progress = Math.min((now-start)/1400,1);
        level.textContent = Math.round((1-Math.pow(1-progress,3))*target);
        if(progress < 1) requestAnimationFrame(frame);
      })(start);
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(entries,observer){
        if(entries[0].isIntersecting){ fillStats(); countUp(); observer.disconnect(); }
      },{threshold:.3}).observe(statusBox);
    } else { fillStats(); countUp(); }
  }

  var countdown = document.getElementById('countdown');
  if(countdown){
    var days = countdown.querySelector('[data-cd="d"]');
    var hours = countdown.querySelector('[data-cd="h"]');
    var minutes = countdown.querySelector('[data-cd="m"]');
    var seconds = countdown.querySelector('[data-cd="s"]');
    var release = new Date('2026-12-18T18:00:00Z').getTime();
    var targetDate = release - Date.now() > 60000 ? release : Date.now() + 47*86400000 + 6*3600000;
    function pad(value){ return String(value).padStart(2,'0'); }
    function tick(){
      var left = Math.max(targetDate-Date.now(),0);
      var totalSeconds = Math.floor(left/1000);
      days.textContent = pad(Math.floor(totalSeconds/86400));
      hours.textContent = pad(Math.floor(totalSeconds%86400/3600));
      minutes.textContent = pad(Math.floor(totalSeconds%3600/60));
      seconds.textContent = pad(totalSeconds%60);
    }
    tick();
    setInterval(tick,1000);
  }

  var marquee = document.getElementById('marqueeList');
  if(marquee) marquee.innerHTML += marquee.innerHTML;

  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  if(burger && menu){
    burger.addEventListener('click',function(){
      var open = menu.classList.toggle('on');
      burger.classList.toggle('on',open);
      document.body.classList.toggle('locked',open);
    });
    menu.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click',function(){
        menu.classList.remove('on');
        burger.classList.remove('on');
        document.body.classList.remove('locked');
      });
    });
  }

  document.querySelectorAll('.q').forEach(function(question){
    var button = question.querySelector('button');
    var answer = question.querySelector('.a');
    button.addEventListener('click',function(){
      var wasOpen = question.classList.contains('on');
      document.querySelectorAll('.q.on').forEach(function(openQuestion){
        openQuestion.classList.remove('on');
        openQuestion.querySelector('.a').style.maxHeight = '0px';
      });
      if(!wasOpen){
        question.classList.add('on');
        answer.style.maxHeight = answer.scrollHeight + 40 + 'px';
      }
    });
  });

  var players = document.querySelectorAll('.player[data-video-id]');
  var modal = document.getElementById('modal');
  var closeButton = document.getElementById('modalClose');
  var screen = document.getElementById('screen');
  var modalTitle = document.getElementById('modalTitle');
  var youtubeLink = document.getElementById('youtubeLink');
  if(players.length && modal && closeButton && screen){
    var activePlayer = null;
    function closePlayer(){
      modal.classList.remove('on');
      document.body.classList.remove('locked');
      screen.replaceChildren();
      if(activePlayer) activePlayer.focus();
    }
    players.forEach(function(player){
      player.addEventListener('click',function(){
        activePlayer = player;
        modal.classList.add('on');
        document.body.classList.add('locked');
        var videoId = player.getAttribute('data-video-id');
        var title = player.getAttribute('data-video-title');
        modalTitle.textContent = title;
        youtubeLink.href = player.getAttribute('data-video-url');
        screen.setAttribute('aria-label',title);
        var frame = document.createElement('iframe');
        frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0&origin=' + encodeURIComponent(window.location.origin);
        frame.title = title;
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.referrerPolicy = 'origin';
        frame.allowFullscreen = true;
        screen.replaceChildren(frame);
        closeButton.focus();
      });
    });
    closeButton.addEventListener('click',closePlayer);
    modal.addEventListener('click',function(event){ if(event.target === modal) closePlayer(); });
    document.addEventListener('keydown',function(event){ if(event.key === 'Escape' && modal.classList.contains('on')) closePlayer(); });
  }

  var form = document.getElementById('signupForm');
  if(form){
    var email = document.getElementById('email');
    var message = document.getElementById('formMsg');
    form.addEventListener('submit',function(event){
      event.preventDefault();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())){
        message.className = 'form-msg err';
        message.textContent = '[ SYSTEM ] ✕ Invalid email. Quest not accepted.';
        email.focus();
        return;
      }
      message.className = 'form-msg';
      message.textContent = '[ SYSTEM ] ✓ Quest accepted — you will be notified. (demo only)';
      email.value = '';
    });
  }
})();