// Shared effects for the Black Flame mockups: scroll reveal, ember particles, click-to-load trailer.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shot = location.hash === '#shot'; // screenshot mode: show everything immediately

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
        const t = p.life / p.max;
        const a = Math.sin(Math.PI * Math.min(t, 1)) * 0.85;
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
      if (!visible) return;
      for (const p of P) {
        p.life++; p.ph += 0.025;
        p.x += p.vx + Math.sin(p.ph) * 0.22; p.y += p.vy;
        if (p.life >= p.max || p.y < -10) spawn(p, false);
      }
      draw();
    })();
  });

  // Trailer: thumbnail until clicked, then the YouTube (no-cookie) player
  document.querySelectorAll('[data-yt]').forEach(el => el.addEventListener('click', () => {
    el.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${el.dataset.yt}?autoplay=1&rel=0" title="Black Flame Tactics trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    el.classList.add('playing');
  }, { once: true }));
})();
