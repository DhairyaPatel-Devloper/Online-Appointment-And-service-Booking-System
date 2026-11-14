/**
 * BOOKINGPRO UNIFIED SITE FOOTER (Native Web Component)
 * Single Source of Truth for Master Footer across All Roles and Breakpoints
 * Note: Team section is completely excluded per architectural directive.
 */

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initInteractions();
  }

  getPrefix() {
    const explicitPrefix = this.getAttribute('data-root-prefix');
    if (explicitPrefix !== null) return explicitPrefix;

    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/customer/') || path.includes('/provider/') || path.includes('/admin/')) {
      return '../';
    }
    return '';
  }

  render() {
    const prefix = this.getPrefix();
    const currentYear = new Date().getFullYear();

    this.innerHTML = `
      <footer class="site-master-footer">
        <div class="site-footer-container">
          <div class="site-footer-grid">
            <!-- Brand & Mission Column -->
            <div class="footer-brand-col">
              <a href="${prefix}index.html" class="header-brand-badge" style="font-size: 1.25rem;">
                <div class="header-brand-icon-box" style="width: 32px; height: 32px; font-size: 0.95rem;">
                  <i class="bi bi-calendar-check-fill"></i>
                </div>
                <span>BookingPro</span>
              </a>
              <p>
                The intelligent appointment infrastructure connecting service providers, customers, and administrative teams with real-time slot synchronization, automated reminders, and instant digital payments.
              </p>
              <div class="footer-social-row">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn" aria-label="Follow us on Twitter"><i class="bi bi-twitter-x"></i></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn" aria-label="Follow us on LinkedIn"><i class="bi bi-linkedin"></i></a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn" aria-label="Follow us on GitHub"><i class="bi bi-github"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="footer-social-btn" aria-label="Follow us on Instagram"><i class="bi bi-instagram"></i></a>
              </div>
            </div>

            <!-- Platform Services Links -->
            <div>
              <div class="footer-col-title">Platform</div>
              <ul class="footer-links-list">
                <li><a href="${prefix}customer/browse-shops.html" class="footer-link">Browse All Shops</a></li>
                <li><a href="${prefix}index.html#how-it-works" class="footer-link">How It Works</a></li>
                <li><a href="${prefix}index.html#features" class="footer-link">Core Features</a></li>
                <li><a href="${prefix}index.html#pricing" class="footer-link">Pricing & Plans</a></li>
                <li><a href="${prefix}index.html#faq" class="footer-link">Frequently Asked Questions</a></li>
              </ul>
            </div>

            <!-- Partner & Provider Links -->
            <div>
              <div class="footer-col-title">For Providers</div>
              <ul class="footer-links-list">
                <li><a href="${prefix}register.html" class="footer-link">Register Your Business</a></li>
                <li><a href="${prefix}provider/dashboard.html" class="footer-link">Provider Dashboard</a></li>
                <li><a href="${prefix}provider/time-slots.html" class="footer-link">Smart Slot Engine</a></li>
                <li><a href="${prefix}provider/revenue.html" class="footer-link">Daily Payouts & Billing</a></li>
                <li><a href="${prefix}index.html#contact" class="footer-link">Partner Onboarding Help</a></li>
              </ul>
            </div>

            <!-- Company & Contact Links (No Team links) -->
            <div>
              <div class="footer-col-title">Support & Legal</div>
              <ul class="footer-links-list">
                <li><a href="${prefix}index.html#contact" class="footer-link">Contact Support</a></li>
                <li><a href="${prefix}login.html" class="footer-link">Account Access</a></li>
                <li><a href="${prefix}index.html#contact" class="footer-link">Enterprise Inquiries</a></li>
                <li><a href="#" class="footer-link" onclick="event.preventDefault(); alert('BookingPro Privacy Policy: All customer booking details are encrypted with TLS 1.3.');">Privacy Policy</a></li>
                <li><a href="#" class="footer-link" onclick="event.preventDefault(); alert('BookingPro Terms of Service: Cancellations are handled in accordance with provider policies.');">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="footer-bottom-bar">
            <div>
              &copy; ${currentYear} BookingPro Technologies Inc. All rights reserved. Handcrafted with modern web standards.
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="footer-status-pill">
                <span class="footer-status-dot"></span> All Systems Operational
              </span>
              <span style="font-size: 0.8rem; color: var(--color-slate-400);">v2.4.0 (Enterprise)</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  initInteractions() {
    // Smooth internal anchor scrolling
    this.querySelectorAll('a[href*="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href').split('#')[1];
        if (targetId) {
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }
}

customElements.define('site-footer', SiteFooter);
