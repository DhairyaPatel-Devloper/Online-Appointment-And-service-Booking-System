/**
 * BOOKWITH.TECH — Landing Page Interactive JS
 * Replaces Three.js entirely with:
 * 1. Mouse parallax on 3D card scene
 * 2. Animated stat counters
 * 3. Scroll reveal observer
 * 4. Slot interaction on hero mockup
 */

(function() {
  'use strict';

  /* ── 1. Mouse Parallax on 3D Card Scene ─────────────────────────────── */
  function initCardParallax() {
    const scene = document.querySelector('.cards-3d-scene');
    if (!scene) return;

    let tX = 0, tY = 0, curX = 0, curY = 0;
    let raf;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      curX = lerp(curX, tX, 0.07);
      curY = lerp(curY, tY, 0.07);
      scene.style.transform = `rotateY(${curX}deg) rotateX(${curY}deg)`;
      raf = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      tX = ((e.clientX - cx) / cx) * 8;   // ±8deg
      tY = -((e.clientY - cy) / cy) * 5;  // ±5deg
    });

    // Reset on mouse leave
    document.addEventListener('mouseleave', () => { tX = 0; tY = 0; });

    // Touch parallax
    document.addEventListener('touchmove', (e) => {
      if (!e.touches[0]) return;
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      tX = ((e.touches[0].clientX - cx) / cx) * 5;
      tY = -((e.touches[0].clientY - cy) / cy) * 3;
    }, { passive: true });

    animate();
  }

  /* ── 2. Stat Counter Animation ───────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) {
      // Fallback: find old stat elements
      animateLegacyStats();
      return;
    }
    counters.forEach(el => {
      const target = parseInt(el.getAttribute('data-count-to'), 10);
      animateCounter(el, 0, target, 1800);
    });
  }

  function animateLegacyStats() {
    // Compatible with existing hero-stat-item h3 elements
    const items = [
      { el: document.getElementById('statBookings'), target: 120000, suffix: 'k+', divider: 1000 },
      { el: document.getElementById('statUptime'),   target: 49,     suffix: ' ★', divider: 10, decimal: 1 },
      { el: document.getElementById('statProviders'),target: 1800,   suffix: '+',  divider: 1 },
    ];
    items.forEach(item => {
      if (!item.el) return;
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          if (item.decimal) {
            animateCounterDecimal(item.el, 0, item.target, 1600, item.divider, item.suffix);
          } else {
            animateCounterFormatted(item.el, 0, item.target, 1600, item.divider, item.suffix);
          }
          observer.disconnect();
        }
      }, { threshold: 0.3 });
      observer.observe(item.el);
    });
  }

  function animateCounter(el, from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = Math.round(from + (to - from) * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateCounterFormatted(el, from, to, duration, divider, suffix) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = (divider > 1 ? (val / divider).toFixed(0) : val.toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateCounterDecimal(el, from, to, duration, divider, suffix) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = (from + (to - from) * eased) / divider;
      el.textContent = val.toFixed(1) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── 3. Scroll Reveal Observer ───────────────────────────────────────── */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal-on-scroll, .reveal-scale');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  /* ── 4. Hero Slot Interaction ────────────────────────────────────────── */
  function initSlotInteraction() {
    const slots = document.querySelectorAll('.mockup-slot-pill');
    slots.forEach(slot => {
      if (slot.style.opacity === '0.45') return; // booked
      slot.addEventListener('click', () => {
        slots.forEach(s => s.classList.remove('active'));
        slot.classList.add('active');
      });
    });

    // Date strip interaction
    const dateStrip = document.getElementById('heroDateStrip');
    if (dateStrip) {
      dateStrip.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          dateStrip.querySelectorAll('button').forEach(b => {
            b.classList.remove('btn-primary-custom');
            b.classList.add('btn-outline-custom');
          });
          btn.classList.remove('btn-outline-custom');
          btn.classList.add('btn-primary-custom');
        });
      });
    }
  }

  /* ── 5. Stat counter trigger on scroll ──────────────────────────────── */
  function initStatsOnScroll() {
    const statsRow = document.querySelector('.hero-stats-row');
    if (!statsRow) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        initCounters();
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(statsRow);
  }

  /* ── 6. Category chip interaction (hero card 1) ──────────────────────── */
  function initCategoryChips() {
    const chips = document.querySelectorAll('.bk-cat-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  }

  /* ── 7. Slot interaction (hero card 2) ───────────────────────────────── */
  function initCardSlots() {
    const slots = document.querySelectorAll('.bk-slot--open');
    slots.forEach(slot => {
      slot.addEventListener('click', () => {
        document.querySelectorAll('.bk-slot').forEach(s => {
          s.style.background = '';
          s.style.fontWeight = '';
        });
        slot.style.background = 'var(--color-primary)';
        slot.style.color = '#fff';
        slot.style.fontWeight = '700';
      });
    });
  }

  /* ── Init ────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initCardParallax();
    initScrollReveal();
    initStatsOnScroll();
    initSlotInteraction();
    initCategoryChips();
    initCardSlots();
  });

})();
