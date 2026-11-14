/**
 * BOOKINGPRO CORE INTERACTION & ADVANCED MOTION ENGINE
 * Features: Top scroll progress bar, 3D card tilt, scroll counters, entrance reveals, toasts
 */

const AppCore = (function () {
  let scrollObserver = null;

  // Initialize Top Scroll Progress Indicator Bar
  function initProgressBar() {
    let bar = document.getElementById('scrollProgressBar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'scrollProgressBar';
      document.body.appendChild(bar);
    }

    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      bar.style.width = scrolled + '%';

      // Sticky Header Shrink on Scroll
      const navbar = document.querySelector('.navbar-custom, .app-topbar');
      if (navbar) {
        if (winScroll > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      }
    });
  }

  // Advanced IntersectionObserver Scroll Reveals
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-slide-left, .reveal-slide-right');
    if (!revealElements.length) return;

    if ('IntersectionObserver' in window) {
      scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Trigger counter animation if element has counter target
            if (entry.target.classList.contains('stat-card-value') || entry.target.querySelector('.stat-card-value')) {
              animateCounters(entry.target);
            }
            scrollObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealElements.forEach(el => scrollObserver.observe(el));
    } else {
      revealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  // 3D Card Tilt Micro-Interaction
  function init3DTilt() {
    const cards = document.querySelectorAll('.custom-card-interactive, .role-card-landing');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // Number Counter Animation
  function animateCounters(container) {
    const counters = container.querySelectorAll ? container.querySelectorAll('[data-count]') : [container];
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-count'));
      if (isNaN(target)) return;

      const duration = 1200;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

        const currentVal = Math.floor(easeProgress * target);
        counter.textContent = currentVal.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = target.toLocaleString();
        }
      }
      requestAnimationFrame(updateNumber);
    });
  }

  function initSidebarDrawer() {
    const sidebar = document.querySelector('.app-sidebar');
    if (!sidebar) return;

    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    const toggleBtns = document.querySelectorAll('[data-toggle="sidebar"]');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('show');
        backdrop.classList.toggle('show');
      });
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('show');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
        backdrop.classList.remove('show');
      }
    });
  }

  return {
    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          initProgressBar();
          initScrollReveals();
          init3DTilt();
          initSidebarDrawer();
        });
      } else {
        initProgressBar();
        initScrollReveals();
        init3DTilt();
        initSidebarDrawer();
      }
    },

    showToast(message, type = 'info') {
      let toastContainer = document.getElementById('toastContainer');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:8px;';
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      const bgMap = {
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        info: 'var(--color-primary)'
      };

      toast.style.cssText = `background: ${bgMap[type] || bgMap.info}; color: white; padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; box-shadow: var(--shadow-hover); opacity:0; transform: translateY(10px); transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);`;
      toast.textContent = message;

      toastContainer.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    },

    renderSkeleton(container, count = 3, type = 'card') {
      if (!container) return;
      let html = '';
      for (let i = 0; i < count; i++) {
        if (type === 'card') {
          html += `
            <div class="col-12 col-md-6 col-lg-3 mb-4">
              <div class="custom-card p-4">
                <div class="skeleton-box skeleton-title mb-3"></div>
                <div class="skeleton-box skeleton-text mb-2"></div>
                <div class="skeleton-box skeleton-text mb-4" style="width: 80%;"></div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="skeleton-box" style="width: 70px; height: 28px;"></div>
                  <div class="skeleton-box" style="width: 100px; height: 38px; border-radius: 8px;"></div>
                </div>
              </div>
            </div>`;
        } else if (type === 'table') {
          html += `
            <tr>
              <td><div class="skeleton-box skeleton-text mb-0" style="width: 120px;"></div></td>
              <td><div class="skeleton-box skeleton-text mb-0" style="width: 160px;"></div></td>
              <td><div class="skeleton-box skeleton-text mb-0" style="width: 90px;"></div></td>
              <td><div class="skeleton-box skeleton-text mb-0" style="width: 80px;"></div></td>
              <td><div class="skeleton-box" style="width: 60px; height: 24px; border-radius: 12px;"></div></td>
            </tr>`;
        }
      }
      container.innerHTML = html;
    },

    init3DTilt: init3DTilt
  };
})();

AppCore.init();
window.AppCore = AppCore;
