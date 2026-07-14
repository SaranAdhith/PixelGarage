/* ============================================================
   PIXELGARAGE — Mission Control interactions
   ============================================================ */

/* ------------------------------------------------------------------
   LEFT RAIL DRAWER (mobile)
------------------------------------------------------------------ */
(function () {
  const rail = document.getElementById('rail');
  const toggle = document.getElementById('railToggle');
  const close = document.getElementById('railClose');
  if (!rail || !toggle) return;
  const open = () => rail.classList.add('open');
  const shut = () => rail.classList.remove('open');
  toggle.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);
  rail.querySelectorAll('a').forEach(a => a.addEventListener('click', shut));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut(); });
})();

/* ------------------------------------------------------------------
   SCROLLSPY — active nav underline
------------------------------------------------------------------ */
(function () {
  const links = Array.from(document.querySelectorAll('.topnav a'));
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map();
  links.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  const setActive = (a) => {
    links.forEach(l => l.classList.toggle('active', l === a));
  };
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) setActive(map.get(e.target));
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  map.forEach((_, sec) => obs.observe(sec));
})();

/* ------------------------------------------------------------------
   REVEAL ON SCROLL
------------------------------------------------------------------ */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
})();

/* ------------------------------------------------------------------
   COUNT-UP (supports prefix / suffix / decimals / zero-pad)
------------------------------------------------------------------ */
function countUp(el, steps) {
  const target = +el.dataset.target;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const decimals = +el.dataset.decimals || 0;
  const pad = +el.dataset.pad || 0;
  let cur = 0;
  const step = target / (steps || 80);
  const fmt = (n) => {
    let s = decimals ? n.toFixed(decimals) : String(Math.floor(n));
    if (pad && !decimals) s = s.padStart(pad, '0');
    return s;
  };
  const go = () => {
    cur = Math.min(cur + step, target);
    el.textContent = prefix + fmt(cur) + suffix;
    if (cur < target) requestAnimationFrame(go);
  };
  requestAnimationFrame(go);
}

/* ------------------------------------------------------------------
   MISSION PARAMETER COUNTERS (on scroll)
------------------------------------------------------------------ */
(function () {
  const nums = document.querySelectorAll('.param-n[data-target]');
  if (!nums.length) return;
  if (!('IntersectionObserver' in window)) {
    nums.forEach(el => countUp(el, 90));
    return;
  }
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (!done && entries.some(e => e.isIntersecting)) {
      done = true;
      nums.forEach(el => countUp(el, 90));
    }
  }, { threshold: 0.5 });
  nums.forEach(el => obs.observe(el));
})();

/* ------------------------------------------------------------------
   MISSION LOG FILTER
------------------------------------------------------------------ */
(function () {
  const btns = document.querySelectorAll('.filter-btn');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.log-card').forEach(card => {
        card.classList.toggle('hidden', f !== 'all' && !card.dataset.category.includes(f));
      });
    });
  });
})();

/* ------------------------------------------------------------------
   CONTACT FORM
------------------------------------------------------------------ */
(function () {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const type = form.type.value;
    const message = form.message.value.trim();
    if (!name || !email || !message) {
      if (note) { note.style.color = 'var(--ink)'; note.textContent = 'Please fill in your name, email and project details.'; }
      return;
    }
    const subject = encodeURIComponent(`Project brief — ${type} (${name})`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nNeed: ${type}\n\n${message}`);
    window.location.href = `mailto:pixelgarage.info@gmail.com?subject=${subject}&body=${body}`;
    if (note) { note.style.color = 'var(--ink2)'; note.textContent = 'Opening your email app… if nothing happens, write to pixelgarage.info@gmail.com'; }
  });
})();

/* ------------------------------------------------------------------
   FOOTER YEAR
------------------------------------------------------------------ */
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ------------------------------------------------------------------
   SMOOTH SCROLL (offset for fixed top bar)
------------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const t = document.querySelector(href);
    if (!t) return;
    e.preventDefault();
    const bar = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar')) || 66;
    const y = t.getBoundingClientRect().top + window.scrollY - bar + 1;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});
