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

   Submits over AJAX so the brief is actually captured server-side.
   A mailto: handoff is only used as a last-resort fallback — it fails
   silently for webmail users, mobile browsers with no mail client, and
   locked-down corporate machines, which loses the lead with no record.

   >>> SETUP (one step): create a free access key at https://web3forms.com
       (enter pixelgarage.info@gmail.com, confirm, paste the key below).
       Until a real key is set, the form falls back to mailto: as before.
------------------------------------------------------------------ */
const PG_FORM_ENDPOINT = 'https://api.web3forms.com/submit';
const PG_ACCESS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';

(function () {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const btn = form && form.querySelector('.btn-send');
  if (!form) return;

  const setNote = (msg, tone) => {
    if (!note) return;
    note.style.color = tone === 'error' ? 'var(--ink)' : 'var(--ink2)';
    note.textContent = msg;
  };

  const mailtoFallback = (name, email, type, message) => {
    const subject = encodeURIComponent(`Project brief — ${type} (${name})`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nNeed: ${type}\n\n${message}`);
    window.location.href = `mailto:pixelgarage.info@gmail.com?subject=${subject}&body=${body}`;
    setNote('Opening your email app… if nothing happens, write to pixelgarage.info@gmail.com');
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const type = form.type.value;
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      setNote('Please fill in your name, email and project details.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote('That email address doesn’t look right — mind checking it?', 'error');
      return;
    }
    /* Honeypot: bots fill hidden fields, humans never see this one. */
    if (form.botcheck && form.botcheck.value) return;

    /* No key configured yet — preserve the previous behaviour. */
    if (PG_ACCESS_KEY === 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY') {
      mailtoFallback(name, email, type, message);
      return;
    }

    const label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Transmitting…'; }
    setNote('Sending your brief…');

    try {
      const res = await fetch(PG_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: PG_ACCESS_KEY,
          subject: `Project brief — ${type} (${name})`,
          from_name: 'PixelGarage Website',
          name, email, type, message
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        /* Conversion event for GTM / GA4 */
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'generate_lead', form_name: 'project_brief', project_type: type });

        form.reset();
        setNote('Brief received — we’ll reply within 24 hours. Check your inbox.');
      } else {
        mailtoFallback(name, email, type, message);
      }
    } catch (err) {
      mailtoFallback(name, email, type, message);
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    }
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
   STICKY MOBILE CTA — show after scrolling past hero
------------------------------------------------------------------ */
(function () {
  const cta = document.getElementById('stickyCta');
  const hero = document.getElementById('mission');
  const contact = document.getElementById('contact');
  if (!cta || !hero) return;
  const show = () => { cta.classList.add('visible'); cta.setAttribute('aria-hidden', 'false'); };
  const hide = () => { cta.classList.remove('visible'); cta.setAttribute('aria-hidden', 'true'); };
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.target === hero) { e.isIntersecting ? hide() : show(); }
      if (e.target === contact && e.isIntersecting) hide();
    });
  }, { threshold: 0.1 });
  obs.observe(hero);
  if (contact) obs.observe(contact);
})();

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
          description: 'True if the project brief was submitted to PixelGarage.'
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

      /* Submit through the same handler as a manual submit, so the brief is
         actually captured server-side rather than dropped into a mailto: */
      form.requestSubmit
        ? form.requestSubmit()
        : form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

      return { success: true, message: 'Project brief submitted to PixelGarage — they reply within 24 hours.' };
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

/* ------------------------------------------------------------------
   SCROLL-DEPTH TRACKING (GA4 via GTM dataLayer)
   Fires once per threshold: 25%, 50%, 75%, 100%
------------------------------------------------------------------ */
(function () {
  const thresholds = [25, 50, 75, 100];
  const fired = new Set();
  const onScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((scrollTop / docHeight) * 100);
    thresholds.forEach(t => {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'scroll_depth', scroll_percentage: t });
      }
    });
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
})();

/* ------------------------------------------------------------------
   CTA CLICK TRACKING (GA4 via GTM dataLayer)
   Tracks all elements with data-cta attribute
------------------------------------------------------------------ */
(function () {
  document.addEventListener('click', e => {
    const cta = e.target.closest('[data-cta]');
    if (!cta) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cta_click',
      cta_name: cta.dataset.cta,
      cta_text: cta.textContent.trim().slice(0, 80),
      cta_href: cta.href || ''
    });
  });
})();

/* ------------------------------------------------------------------
   FAQ INTERACTION TRACKING
   Tracks which FAQ items users open
------------------------------------------------------------------ */
(function () {
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        const question = item.querySelector('summary');
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'faq_open',
          faq_question: question ? question.textContent.trim().slice(0, 120) : ''
        });
      }
    });
  });
})();

