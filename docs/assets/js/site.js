// Black Flame — blackflamegames.com
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shot = location.hash === '#shot'; // screenshot mode used by tools/shoot-site.js

  // Nav: solid background once the page scrolls
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if (shot || reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  // Ember particles
  document.querySelectorAll('canvas.embers').forEach(c => {
    const ctx = c.getContext('2d');
    const N = +c.dataset.count || 60;
    const P = [];
    let w = 0, h = 0, visible = true;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(p, init) {
      p.x = Math.random() * w;
      p.y = init ? Math.random() * h : h + 10;
      p.r = Math.random() * 1.6 + 0.5;
      p.vy = -(Math.random() * 0.55 + 0.2);
      p.vx = (Math.random() - 0.5) * 0.25;
      p.life = init ? Math.random() * 300 : 0;
      p.max = Math.random() * 420 + 260;
      p.hue = 16 + Math.random() * 26;
      p.ph = Math.random() * 6.283;
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of P) {
        const a = Math.sin(Math.PI * Math.min(p.life / p.max, 1)) * 0.85;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue},100%,72%,${a})`);
        g.addColorStop(0.35, `hsla(${p.hue},100%,55%,${a * 0.5})`);
        g.addColorStop(1, `hsla(${p.hue},100%,50%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      }
    }
    size();
    for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); P.push(p); }
    addEventListener('resize', size);
    if (reduce || shot) { draw(); return; }
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(c);
    (function tick() {
      requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      for (const p of P) {
        p.life++; p.ph += 0.025;
        p.x += p.vx + Math.sin(p.ph) * 0.22; p.y += p.vy;
        if (p.life >= p.max || p.y < -10) spawn(p, false);
      }
      draw();
    })();
  });

  // Gameplay loop: play only while on screen; with reduced motion, leave it paused with controls
  document.querySelectorAll('video[data-loop]').forEach(v => {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); v.controls = true; return; }
    new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: 0.2 }).observe(v);
  });

  // Trailer: YouTube (no-cookie) player in a dialog, only loaded when asked for
  const dlg = document.getElementById('trailer');
  if (dlg && typeof dlg.showModal === 'function') {
    const screen = dlg.querySelector('.screen');
    const close = () => dlg.close();
    document.querySelectorAll('[data-trailer]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      screen.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${dlg.dataset.yt}?autoplay=1&rel=0" title="Black Flame Tactics trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      dlg.showModal();
    }));
    dlg.querySelector('.close').addEventListener('click', close);
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    dlg.addEventListener('close', () => { screen.innerHTML = ''; });
  }

  // Screenshot carousel: arrows step one screenshot; swipe/scroll also works
  document.querySelectorAll('.gallery').forEach(g => {
    const track = g.querySelector('.track');
    const slides = [...track.children];
    const prev = g.querySelector('.prev'), next = g.querySelector('.next');
    const count = g.querySelector('.gallery-count span');
    const step = () => slides[1].offsetLeft - slides[0].offsetLeft;
    const go = dir => track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = step(), first = Math.round(track.scrollLeft / s);
      const shown = Math.max(1, Math.round((track.clientWidth + s - slides[0].offsetWidth) / s));
      const last = Math.min(first + shown, slides.length);
      count.textContent = shown > 1 ? `${first + 1}–${last}` : `${first + 1}`;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    };
    track.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();
  });

  // Screenshot viewer: click a screenshot to see it full size, arrows/keys to browse
  const viewer = document.getElementById('viewer');
  const shots = [...document.querySelectorAll('.shot')];
  if (viewer && typeof viewer.showModal === 'function' && shots.length) {
    const img = viewer.querySelector('img'), cap = viewer.querySelector('.cap');
    let i = 0;
    const show = n => {
      i = (n + shots.length) % shots.length;
      img.src = shots[i].dataset.full;
      img.alt = shots[i].querySelector('img').alt;
      cap.textContent = `${shots[i].dataset.caption} · ${i + 1} / ${shots.length}`;
    };
    shots.forEach((b, n) => b.addEventListener('click', () => { show(n); viewer.showModal(); }));
    viewer.querySelector('.prev').addEventListener('click', () => show(i - 1));
    viewer.querySelector('.next').addEventListener('click', () => show(i + 1));
    viewer.querySelector('.close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
  }
})();
