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

/* ------------------------------------------------------------------
   WEBMCP — Agentic Browsing (tools registered + schemas)
   Exposes PixelGarage's key interactions as structured tools so
   AI agents can discover and call them reliably.
   Spec: https://github.com/WICG/webmcp
------------------------------------------------------------------ */
(function () {
  if (!navigator.modelContext || typeof navigator.modelContext.registerTool !== 'function') return;

  /* ── Tool 1: Submit project brief ── */
  navigator.modelContext.registerTool({
    name: 'submit-project-brief',
    description: 'Submit a project inquiry to PixelGarage. The studio builds iOS & Android apps, custom websites, and backend APIs from scratch to production. Use this to send a project brief; PixelGarage typically replies within 24 hours.',
    inputSchema: {
      type: 'object',
      required: ['name', 'email', 'projectType', 'details'],
      properties: {
        name: {
          type: 'string',
          description: 'Full name of the person submitting the inquiry.'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Contact email address where PixelGarage should reply.'
        },
        projectType: {
          type: 'string',
          enum: [
            'Mobile app (iOS / Android)',
            'Website',
            'Backend / API',
            'Full product (design → launch)',
            'Something else'
          ],
          description: 'The category of work being requested.'
        },
        details: {
          type: 'string',
          minLength: 10,
          description: 'A short description of what the user wants to build — the more context the better.'
        }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'True if the form was submitted and the email client was opened.'
        },
        message: {
          type: 'string',
          description: 'A human-readable status message.'
        }
      }
    },
    invoke: function (input) {
      const form = document.getElementById('contactForm');
      if (!form) return { success: false, message: 'Contact form not found on page.' };

      /* Populate the form fields */
      if (form.name)    form.name.value    = input.name    || '';
      if (form.email)   form.email.value   = input.email   || '';
      if (form.type)    form.type.value    = input.projectType || '';
      if (form.message) form.message.value = input.details || '';

      /* Scroll to and highlight the form */
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });

      /* Open email client (mirrors the manual submit handler) */
      const subject = encodeURIComponent(`Project brief — ${input.projectType} (${input.name})`);
      const body    = encodeURIComponent(
        `Name: ${input.name}\nEmail: ${input.email}\nNeed: ${input.projectType}\n\n${input.details}`
      );
      window.location.href = `mailto:pixelgarage.info@gmail.com?subject=${subject}&body=${body}`;

      return { success: true, message: 'Project brief submitted — email client opened for confirmation.' };
    }
  });

  /* ── Tool 2: Get studio info ── */
  navigator.modelContext.registerTool({
    name: 'get-pixelgarage-info',
    description: 'Retrieve key information about PixelGarage — the services offered, the team, shipped products, and how to get in touch. Use this before submitting a brief to understand what PixelGarage builds.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: ['services', 'team', 'portfolio', 'process', 'contact', 'all'],
          description: 'The specific topic to retrieve. Defaults to "all".'
        }
      }
    },
    outputSchema: {
      type: 'object',
      properties: {
        studio: { type: 'string' },
        services: { type: 'array', items: { type: 'string' } },
        team: { type: 'array', items: { type: 'string' } },
        portfolio: { type: 'array', items: { type: 'string' } },
        process: { type: 'array', items: { type: 'string' } },
        contact: { type: 'object' }
      }
    },
    invoke: function (input) {
      const topic = (input && input.topic) || 'all';
      const data = {
        studio: 'PixelGarage — software studio based in India. Designs, builds and launches iOS & Android apps, custom websites and backend APIs from scratch to production.',
        services: [
          'iOS & Android Mobile App Development (SwiftUI, Kotlin Jetpack Compose, React Native)',
          'Custom Web Development (React, Next.js, TypeScript)',
          'Backend Engineering & APIs (Node.js, Express, PostgreSQL, GraphQL)',
          'AI & GTM Automation Workflows (n8n, Claude, OpenRouter)'
        ],
        team: [
          'Saran Adhith — Founder & Software Engineer',
          'Daraneesh — Co-Founder & CTO',
          'Alwin N Joseph — Co-Founder & Lead Developer',
          '25+ QA testers per release'
        ],
        portfolio: [
          'Mount Valley School Platform — custom web app & backend, live in production',
          'RoomAdda — iOS & Android booking app with listing, search & reservation backend',
          'CommunityTracker.ai GTM Stack — 100+ AI automation workflows on self-hosted n8n VPS'
        ],
        process: [
          'T-04 Discover: Scope session, milestones, fixed-cost quote',
          'T-03 Design: Figma flows & screens before code begins',
          'T-02 Build: Iterative engineering, 25-tester QA on every release',
          'T-00 Launch: Store submissions, deployment, full source code handover'
        ],
        contact: {
          email: 'pixelgarage.info@gmail.com',
          website: 'https://pixelgarage.in',
          contactForm: 'https://pixelgarage.in/#contact',
          responseTime: 'Within 24 hours'
        }
      };

      if (topic === 'all') return data;
      return { [topic]: data[topic] };
    }
  });
})();

