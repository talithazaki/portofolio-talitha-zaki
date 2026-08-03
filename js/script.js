/**
 * Portofolio — script.js
 * Membaca semua data dari config.js
 * ============================================================
 */

/* ============================================================
   PLACEHOLDER IMAGE GENERATOR
   ============================================================ */
function generatePlaceholderSrc(id, title) {
  const hue  = (id * 47 + 180) % 360;
  const hue2 = (hue + 60) % 360;
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="225">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue},60%,20%)"/>
          <stop offset="100%" style="stop-color:hsl(${hue2},60%,12%)"/>
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill="url(#g)"/>
      <text x="50%" y="45%" text-anchor="middle" fill="rgba(255,255,255,0.12)"
            font-family="sans-serif" font-size="56" font-weight="900">${CONFIG_PROFILE.initials}</text>
      <text x="50%" y="68%" text-anchor="middle" fill="rgba(255,255,255,0.45)"
            font-family="sans-serif" font-size="13">${title}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

/* ============================================================
   APPLY CONFIG — Isi halaman dari config.js
   ============================================================ */
function applyConfig() {
  const p = CONFIG_PROFILE;

  // ── Tema warna ──────────────────────────────────────────
  if (CONFIG_THEME) {
    document.documentElement.style.setProperty('--clr-accent',  CONFIG_THEME.accent);
    document.documentElement.style.setProperty('--clr-accent-2', CONFIG_THEME.accent2);
    document.documentElement.style.setProperty('--clr-accent-glow',
      hexToRgba(CONFIG_THEME.accent, 0.35));
    document.documentElement.style.setProperty('--clr-accent-light',
      lightenHex(CONFIG_THEME.accent));
  }

  // ── Logo & title tab ─────────────────────────────────────
  document.querySelectorAll('.logo-text').forEach(el => el.textContent = p.initials);
  document.title = `${p.name} — Portfolio`;

  // ── Hero ─────────────────────────────────────────────────
  setText('hero-greeting',  p.greeting);
  setText('hero-name',      p.name);
  setText('hero-tagline',   p.tagline);
  setText('hero-desc',      p.bio[0]?.replace(/<[^>]+>/g,'') ?? '');

  const badge = document.getElementById('hero-badge-text');
  if (badge) badge.textContent = p.status;
  const dot = document.querySelector('.badge-dot');
  if (dot) dot.style.background = p.statusOpen ? '#22e87a' : '#ff4444';

  // ── Stats ─────────────────────────────────────────────────
  const statsWrap = document.getElementById('hero-stats');
  if (statsWrap && CONFIG_STATS.length) {
    statsWrap.innerHTML = CONFIG_STATS.map((s, i) => `
      ${i > 0 ? '<div class="stat-divider"></div>' : ''}
      <div class="stat-item">
        <span class="stat-number" data-target="${s.number}">0</span>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join('');
  }

  // ── About ─────────────────────────────────────────────────
  const bioWrap = document.getElementById('about-bio');
  if (bioWrap) {
    bioWrap.innerHTML = p.bio.map(b => `<p>${b}</p>`).join('');
  }
  setText('detail-location',  p.location);
  setText('detail-education', p.education);
  setText('detail-focus',     p.focus);
  setText('detail-languages', p.languages);

  const cvBtn = document.getElementById('cv-link');
  if (cvBtn) cvBtn.href = p.cvLink;

  const aboutBadge = document.getElementById('about-badge-text');
  if (aboutBadge) aboutBadge.textContent = p.status;

  // ── Skills categories ─────────────────────────────────────
  const catWrap = document.getElementById('skills-categories');
  if (catWrap) {
    catWrap.innerHTML = CONFIG_SKILLS.categories.map((c, i) => `
      <div class="skill-category reveal${i > 0 ? ' reveal-delay-' + i : ''}">
        <div class="skill-category-header">
          <i class="${c.icon}"></i>
          <span>${c.title}</span>
        </div>
        <div class="skill-tags">
          ${c.tags.map(t => `<span class="skill-tag">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
    catWrap.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  // ── Skill bars ───────────────────────────────────────────
  const barsWrap = document.getElementById('skill-bars');
  if (barsWrap) {
    barsWrap.innerHTML = CONFIG_SKILLS.bars.map(b => `
      <div class="skill-bar-item">
        <div class="skill-bar-header">
          <span class="skill-bar-name">${b.name}</span>
          <span class="skill-bar-pct">${b.pct}%</span>
        </div>
        <div class="skill-bar-track">
          <div class="skill-bar-fill" data-width="${b.pct}"></div>
        </div>
      </div>
    `).join('');
  }

  // ── Sosial media ─────────────────────────────────────────
  const s = CONFIG_SOCIAL;
  setSocialLink('social-email',     s.email     ? `mailto:${s.email}` : '');
  setSocialLink('social-instagram', s.instagram || '');
  setSocialLink('social-github',    s.github    || '');
  setSocialLink('social-linkedin',  s.linkedin  || '');
  setSocialLink('social-twitter',   s.twitter   || '');

  // Contact info text
  setText('contact-email-val',     s.email     || '-');
  setText('contact-instagram-val', s.instagram ? '@' + s.instagram.split('/').pop() : '-');
  setText('contact-github-val',    s.github    ? s.github.replace('https://','') : '-');
  setText('contact-linkedin-val',  s.linkedin  ? s.linkedin.replace('https://','') : '-');

  // ── Footer nama ───────────────────────────────────────────
  document.querySelectorAll('.footer-name').forEach(el => el.textContent = p.name);
}

/* ============================================================
   PROJECTS MODULE
   ============================================================ */
const Projects = (() => {
  let currentFilter = 'all';

  function getFiltered() {
    return currentFilter === 'all'
      ? CONFIG_PROJECTS
      : CONFIG_PROJECTS.filter(p => p.category === currentFilter);
  }

  function render() {
    const grid = document.getElementById('projectsGrid');
    const filtered = getFiltered();

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-folder-open"></i>Belum ada proyek di kategori ini.</div>`;
      return;
    }

    grid.innerHTML = filtered.map((p, idx) => `
      <article class="portfolio-card reveal" style="animation-delay:${idx * 0.08}s">
        <div class="portfolio-img-wrap">
          <img src="${generatePlaceholderSrc(idx + 10, p.title)}" alt="${p.title}" loading="lazy" />
          <span class="portfolio-badge">${p.category}</span>
        </div>
        <div class="portfolio-body">
          <div class="portfolio-author">
            <div class="portfolio-avatar">${CONFIG_PROFILE.initials}</div>
            <span class="portfolio-author-name">${CONFIG_PROFILE.name}</span>
          </div>
          <h3 class="portfolio-title">${p.title}</h3>
          <p class="portfolio-desc">${p.desc}</p>
          <div class="portfolio-tags">
            ${p.tags.map(t => `<span class="portfolio-tag">${t}</span>`).join('')}
          </div>
          <a href="${p.link}" class="portfolio-link" aria-label="Lihat proyek ${p.title}">
            Lihat Proyek <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  function init() {
    render();
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
      });
    });
  }

  return { init };
})();

/* ============================================================
   NAVBAR MODULE
   ============================================================ */
const Navbar = (() => {
  function init() {
    const navbar   = document.getElementById('navbar');
    const toggle   = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const links    = navLinks.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      updateActiveLink();
    }, { passive: true });

    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  function updateActiveLink() {
    const sections = ['home','about','skills','projects','contact'];
    const scrollY  = window.scrollY + 100;
    let activeId   = sections[0];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollY) activeId = id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === activeId);
    });
  }

  return { init };
})();

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ============================================================
   COUNTER ANIMATION
   ============================================================ */
function animateCounters() {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const step   = target / (1800 / 16);
      let current  = 0;
      const timer  = setInterval(() => {
        current += step;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
        else el.textContent = Math.floor(current);
      }, 16);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(c => counterObserver.observe(c));
}

/* ============================================================
   SKILL BAR ANIMATION
   ============================================================ */
function initSkillBars() {
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bar = entry.target;
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 300);
      barObserver.unobserve(bar);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.skill-bar-fill').forEach(b => barObserver.observe(b));
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fields = ['nameInput','emailInput','messageInput'];
    let valid = true;

    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        el.style.borderColor = '#ff6ab0';
        el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
        valid = false;
      }
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = 'Kirim Pesan <i class="fa-solid fa-paper-plane"></i>';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 5000);
    }, 1400);
  });
}

/* ============================================================
   BACK TO TOP
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

/* ============================================================
   HELPER UTILITIES
   ============================================================ */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setSocialLink(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (url) { el.href = url; el.style.display = ''; }
  else      { el.style.display = 'none'; }
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lightenHex(hex) {
  // Simple lighten: blend with white at 40%
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  const lr = Math.round(r + (255-r)*0.4);
  const lg = Math.round(g + (255-g)*0.4);
  const lb = Math.round(b + (255-b)*0.4);
  return `rgb(${lr},${lg},${lb})`;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  Navbar.init();
  Projects.init();
  initReveal();
  animateCounters();
  initSkillBars();
  initContactForm();
  initBackToTop();
  initSmoothScroll();
});
