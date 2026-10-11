(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const panels = [...document.querySelectorAll('.hero, .pagehead')];
  // Keep all page content visible immediately, independent of animation.
  if (reduce.matches || !panels.length) return;
  const state = panels.map(panel => {
    const canvas = document.createElement('canvas');
    canvas.className = 'motion-canvas'; canvas.setAttribute('aria-hidden', 'true');
    panel.prepend(canvas);
    const ctx = canvas.getContext('2d');
    return { panel, canvas, ctx, width: 0, height: 0, pointer: { x: -1000, y: -1000 }, nodes: [] };
  });
  function resize(s) {
    const rect = s.panel.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    s.width = rect.width; s.height = rect.height;
    s.canvas.width = Math.round(rect.width * dpr);
    s.canvas.height = Math.round(rect.height * dpr);
    s.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(52, Math.max(20, Math.round(rect.width * rect.height / 18000)));
    s.nodes = Array.from({ length: count }, (_, i) => ({
      x: (i * 127.7 % 997) / 997 * rect.width,
      y: (i * 317.3 % 991) / 991 * rect.height,
      phase: i * 1.7, size: i % 5 === 0 ? 2.4 : 1.3
    }));
  }
  state.forEach(s => {
    resize(s);
    s.panel.addEventListener('pointermove', e => {
      const r = s.panel.getBoundingClientRect();
      s.pointer.x = e.clientX - r.left; s.pointer.y = e.clientY - r.top;
      s.panel.style.setProperty('--mx', `${s.pointer.x - s.width / 2}px`);
      s.panel.style.setProperty('--my', `${s.pointer.y - s.height / 2}px`);
    }, { passive: true });
    s.panel.addEventListener('pointerleave', () => { s.pointer.x = -1000; s.pointer.y = -1000; s.panel.style.setProperty('--mx','0px'); s.panel.style.setProperty('--my','0px'); });
  });
  let scrollY = window.scrollY;
  addEventListener('scroll', () => { scrollY = window.scrollY; panels.forEach(p => p.style.setProperty('--scroll', `${scrollY}px`)); }, { passive: true });
  addEventListener('resize', () => state.forEach(resize), { passive: true });
  let frame;
  function draw(time) {
    if (reduce.matches) return;
    const t = time * .0003;
    state.forEach(s => {
      const rect = s.panel.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const { ctx, width: w, height: h } = s;
      ctx.clearRect(0, 0, w, h);
      const pts = s.nodes.map(n => {
        const x = n.x + Math.sin(t + n.phase) * 12 + scrollY * .012;
        const y = n.y + Math.cos(t * .75 + n.phase) * 10;
        const distance = Math.hypot(x - s.pointer.x, y - s.pointer.y);
        const glow = Math.max(0, 1 - distance / 190);
        return { x, y, glow, size: n.size };
      });
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], distance = Math.hypot(a.x-b.x,a.y-b.y);
        if (distance < 145) {
          ctx.strokeStyle = `rgba(115,217,242,${(.04 + .17 * (1-distance/145) + .2 * Math.max(a.glow,b.glow)).toFixed(3)})`;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
      pts.forEach(p => { ctx.fillStyle = `rgba(139,227,246,${(.25 + p.glow * .7).toFixed(3)})`; ctx.beginPath(); ctx.arc(p.x,p.y,p.size+p.glow*1.7,0,Math.PI*2); ctx.fill(); });
      if (s.pointer.x >= 0) {
        const g = ctx.createRadialGradient(s.pointer.x,s.pointer.y,0,s.pointer.x,s.pointer.y,200);
        g.addColorStop(0,'rgba(69,180,224,.13)');g.addColorStop(1,'rgba(69,180,224,0)');
        ctx.fillStyle=g;ctx.fillRect(s.pointer.x-200,s.pointer.y-200,400,400);
      }
    });
    frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);
  reduce.addEventListener('change', e => { if (e.matches) { cancelAnimationFrame(frame); state.forEach(s => { s.canvas.remove(); s.panel.style.removeProperty('--mx'); s.panel.style.removeProperty('--my'); }); } else location.reload(); });
})();
