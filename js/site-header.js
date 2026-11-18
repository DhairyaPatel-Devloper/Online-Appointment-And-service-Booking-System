/**
 * BOOKWITH.TECH — UNIFIED SITE HEADER & SIDEBAR (Native Web Component)
 * Single Source of Truth for navigation across all roles.
 * Admin & Provider: Fixed left sidebar layout.
 * Customer & Public: Sticky top horizontal nav.
 * Features integrated Data Mode Switcher (Static Demo vs Live Supabase Database).
 */

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this._role   = this.detectRole();
    this._active = (this.getAttribute('data-active') || '').toLowerCase();
    this._prefix = this.getPrefix();
    this._useSidebar = (this._role === 'admin' || this._role === 'provider');

    if (this._useSidebar) {
      this.renderSidebar();
      this.renderSlimHeader();
      document.body.classList.add('has-sidebar');
    } else {
      this.renderFullHeader();
    }

    this.ensureDbSettingsModal();
    this.initInteractions();

    if (typeof window.JavaBackendService === 'undefined') {
      const script = document.createElement('script');
      script.src = `${this._prefix}js/java-backend-service.js`;
      document.head.appendChild(script);
    }
  }

  detectRole() {
    const a = this.getAttribute('data-role');
    if (a) return a.toLowerCase();
    const p = window.location.pathname.toLowerCase();
    if (p.includes('/customer/')) return 'customer';
    if (p.includes('/provider/')) return 'provider';
    if (p.includes('/admin/'))    return 'admin';
    const s = sessionStorage.getItem('Role');
    if (s) return s.toLowerCase();
    return 'public';
  }

  getPrefix() {
    const ex = this.getAttribute('data-root-prefix');
    if (ex !== null) return ex;
    const p = window.location.pathname.replace(/\\/g, '/');
    return (p.includes('/customer/') || p.includes('/provider/') || p.includes('/admin/')) ? '../' : '';
  }

  /* ── Bespoke SVG Logo Mark ────────────────────────────────────────────── */
  getLogoMark(size = 38, dark = false) {
    const bg = dark ? '#1a3d30' : '#0d5c46';
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="40" height="40" rx="9" fill="${bg}"/>
        <!-- Pen-nib inspired "b" letterform -->
        <path d="M13 9v22" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        <path d="M13 20 C13 16.2 15.9 13 20 13 C24.1 13 27 16.2 27 20 C27 23.8 24.1 27 20 27 C15.9 27 13 23.8 13 20Z"
              stroke="white" stroke-width="2.5" fill="none"/>
        <!-- Amber accent dot — the "." in bookwith.tech -->
        <circle cx="33" cy="11" r="3.5" fill="#d97706"/>
      </svg>`;
  }

  /* ── Wordmark HTML ────────────────────────────────────────────────────── */
  getWordmark(sidebar = false) {
    if (sidebar) {
      return `
        <span class="bwt-wordmark bwt-wordmark--sidebar">
          bookwith<span class="bwt-tld">.tech</span>
        </span>`;
    }
    return `
      <span class="bwt-wordmark">
        bookwith<span class="bwt-tld">.tech</span>
      </span>`;
  }

  /* ── Nav link data per role ───────────────────────────────────────────── */
  getNavLinks() {
    const p = this._prefix;
    const r = this._role;
    if (r === 'public') return [
      { label: 'Browse Shops',  icon: 'bi-shop',         href: `${p}customer/browse-shops.html`, id: 'browse' },
      { label: 'How It Works',  icon: 'bi-lightbulb',    href: `${p}index.html#how-it-works`,    id: 'how-it-works' },
      { label: 'Features',      icon: 'bi-stars',         href: `${p}index.html#features`,        id: 'features' },
      { label: 'Pricing',       icon: 'bi-tag',           href: `${p}index.html#pricing`,         id: 'pricing' },
    ];
    if (r === 'customer') return [
      { label: 'Browse Shops',  icon: 'bi-shop',             href: `${p}customer/browse-shops.html`,    id: 'browse' },
      { label: 'My Bookings',   icon: 'bi-calendar-check',   href: `${p}customer/my-bookings.html`,     id: 'my-bookings' },
      { label: 'Booking History',icon:'bi-clock-history',    href: `${p}customer/booking-history.html`, id: 'history' },
      { label: 'Give Feedback', icon: 'bi-star',             href: `${p}customer/feedback.html`,        id: 'feedback' },
    ];
    if (r === 'provider') return [
      { label: 'Dashboard',    icon: 'bi-grid-1x2',        href: `${p}provider/dashboard.html`,    id: 'dashboard',    section: null },
      { label: 'Appointments', icon: 'bi-calendar-event',  href: `${p}provider/appointments.html`, id: 'appointments', section: null },
      { label: 'Services',     icon: 'bi-list-stars',      href: `${p}provider/services.html`,     id: 'services',     section: null },
      { label: 'Time Slots',   icon: 'bi-alarm',           href: `${p}provider/time-slots.html`,   id: 'time-slots',   section: null },
      { label: 'Shop Profile', icon: 'bi-building-gear',   href: `${p}provider/shop-profile.html`, id: 'shop-profile', section: null },
      { label: 'Revenue',      icon: 'bi-wallet2',         href: `${p}provider/revenue.html`,      id: 'revenue',      section: 'Reports' },
      { label: 'Reviews',      icon: 'bi-chat-heart',      href: `${p}provider/ratings.html`,      id: 'ratings',      section: null },
    ];
    if (r === 'admin') return [
      { label: 'Overview',          icon: 'bi-speedometer2',      href: `${p}admin/dashboard.html`,        id: 'overview',   section: null },
      { label: 'Provider Requests', icon: 'bi-person-lines-fill', href: `${p}admin/provider-requests.html`,id: 'requests',   section: 'Manage' },
      { label: 'Categories',        icon: 'bi-tags',              href: `${p}admin/categories.html`,       id: 'categories', section: null },
      { label: 'Providers',         icon: 'bi-shop-window',       href: `${p}admin/provider-list.html`,    id: 'providers',  section: null },
      { label: 'Customers',         icon: 'bi-people',            href: `${p}admin/user-list.html`,        id: 'users',      section: null },
      { label: 'Master Bookings',   icon: 'bi-journal-check',     href: `${p}admin/booking-list.html`,     id: 'bookings',   section: null },
      { label: 'Reports',           icon: 'bi-bar-chart-line',    href: `${p}admin/reports.html`,          id: 'reports',    section: 'Analytics' },
    ];
    return [];
  }

  /* ── USER DATA ───────────────────────────────────────────────────────── */
  getUserData() {
    const r = this._role;
    const cookieUser = window.AuthService?.getCurrentUser ? window.AuthService.getCurrentUser() : null;
    const fn = sessionStorage.getItem('FirstName') || cookieUser?.firstname || (r==='admin'?'System':(r==='provider'?'Dhairya':'Aarav'));
    const ln = sessionStorage.getItem('LastName')  || cookieUser?.lastname  || (r==='admin'?'Admin':'Patel');
    return {
      firstName: fn, lastName: ln,
      fullName: `${fn} ${ln}`.trim(),
      initials: (fn.charAt(0)+(ln ? ln.charAt(0) : '')).toUpperCase() || 'U',
      email: sessionStorage.getItem('Email') || cookieUser?.emailid || `${fn.toLowerCase()}@bookwith.tech`
    };
  }

  /* ── DATA MODE TOGGLE HTML ───────────────────────────────────────────── */
  getDataModeToggleHtml() {
    const isDb = window.AppConfig ? window.AppConfig.isDatabaseMode() : false;
    return `
      <div class="data-mode-toggle-wrapper" title="Toggle between Static Demo Mode and Live Supabase Database (JDBC)">
        <button type="button" class="mode-toggle-btn mode-btn-static ${!isDb ? 'active-static' : ''}" data-mode="static" aria-label="Switch to Demo Static Mode">
          <i class="bi bi-lightning-charge-fill"></i>
          <span>Demo Mode</span>
        </button>
        <button type="button" class="mode-toggle-btn mode-btn-db ${isDb ? 'active-db' : ''}" data-mode="database" aria-label="Switch to Live Supabase DB Mode">
          <span class="db-live-indicator"></span>
          <i class="bi bi-database-fill"></i>
          <span>Live Supabase DB</span>
        </button>
        <button type="button" class="mode-settings-btn mode-settings-trigger" title="Supabase Database Settings & Credentials" aria-label="Open DB Settings">
          <i class="bi bi-gear-fill"></i>
        </button>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════════════
     SIDEBAR RENDER (Admin & Provider only)
  ══════════════════════════════════════════════════════════════════════ */
  renderSidebar() {
    const u    = this.getUserData();
    const r    = this._role;
    const p    = this._prefix;
    const links= this.getNavLinks();

    let lastSection = null;
    const navHtml = links.map(link => {
      const isActive = this._active === link.id;
      let sectionHtml = '';
      if (link.section && link.section !== lastSection) {
        lastSection = link.section;
        sectionHtml = `<div class="sidebar-section-label">${link.section}</div>`;
      }
      return `
        ${sectionHtml}
        <a href="${link.href}" class="sidebar-nav-link ${isActive ? 'active' : ''}" id="snl-${link.id}">
          <i class="bi ${link.icon}"></i>
          <span>${link.label}</span>
          ${isActive ? `<div class="sidebar-link-indicator"></div>` : ''}
        </a>`;
    }).join('');

    const roleLabel = r === 'admin' ? 'System Admin' : 'Provider Console';
    const roleColor = r === 'admin' ? '#ef4444' : '#34d399';

    const sidebarEl = document.createElement('aside');
    sidebarEl.className = 'site-sidebar';
    sidebarEl.id = 'siteSidebar';
    sidebarEl.innerHTML = `
      <!-- Brand top -->
      <a href="${p}index.html" class="sidebar-brand" aria-label="BookWith.tech Home">
        ${this.getLogoMark(34, true)}
        <div class="sidebar-brand-text">
          ${this.getWordmark(true)}
          <span class="sidebar-role-chip" style="--rc: ${roleColor};">${roleLabel}</span>
        </div>
      </a>

      <!-- Navigation -->
      <nav class="sidebar-nav" aria-label="Main navigation">
        <div class="sidebar-nav-section">
          ${navHtml}
        </div>
      </nav>

      <!-- Sidebar collapse toggle -->
      <button class="sidebar-collapse-btn" id="sidebarCollapseBtn" aria-label="Collapse sidebar" title="Collapse sidebar">
        <i class="bi bi-layout-sidebar-reverse"></i>
      </button>

      <!-- User footer -->
      <div class="sidebar-user-footer">
        <div class="sidebar-user-avatar">${u.initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${u.fullName}</div>
          <div class="sidebar-user-email">${u.email}</div>
        </div>
        <a href="${p}login.html" class="sidebar-logout-btn" title="Sign out" onclick="sessionStorage.clear()">
          <i class="bi bi-box-arrow-right"></i>
        </a>
      </div>

      <!-- Mobile close btn -->
      <button class="sidebar-mobile-close" id="sidebarMobileClose" aria-label="Close sidebar">
        <i class="bi bi-x-lg"></i>
      </button>
    `;

    document.body.insertBefore(sidebarEl, document.body.firstChild);

    // Mobile overlay for sidebar
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';
    document.body.appendChild(overlay);
  }

  /* ══════════════════════════════════════════════════════════════════════
     SLIM TOP HEADER (Admin & Provider — no nav links, sidebar has those)
  ══════════════════════════════════════════════════════════════════════ */
  renderSlimHeader() {
    const u = this.getUserData();
    const p = this._prefix;
    const r = this._role;

    this.innerHTML = `
      <header class="site-slim-header" id="masterHeader">
        <div class="slim-header-inner">
          <!-- Mobile hamburger (shows sidebar) -->
          <button class="sidebar-mobile-open" id="sidebarMobileOpen" aria-label="Open sidebar">
            <i class="bi bi-list"></i>
          </button>

          <!-- Breadcrumb / Page context -->
          <div class="slim-header-breadcrumb" id="slimBreadcrumb"></div>

          <!-- Mode Switcher & User Pill Group -->
          <div class="d-flex align-items-center gap-2 ms-auto">
            ${this.getDataModeToggleHtml()}

            <!-- User pill -->
            <div class="header-user-dropdown" id="userDropdownContainer">
              <div class="header-user-pill" id="userPillTrigger">
                <div class="header-user-avatar">${u.initials}</div>
                <span class="header-user-name d-none d-sm-inline">${u.fullName}</span>
                <i class="bi bi-chevron-down" style="font-size:0.7rem; color:var(--color-slate-500);"></i>
              </div>
              <div class="header-dropdown-menu" id="userDropdownMenu">
                <div style="padding:0.4rem 0.85rem 0.5rem; border-bottom:1px solid var(--color-slate-200); margin-bottom:0.35rem;">
                  <div style="font-weight:700; font-size:0.85rem; color:#0f172a;">${u.fullName}</div>
                  <div style="font-size:0.75rem; color:var(--color-slate-500);">${u.email}</div>
                </div>
                ${r==='provider' ? `<a href="${p}provider/shop-profile.html" class="header-dropdown-item"><i class="bi bi-gear"></i> Shop Settings</a>` : ''}
                ${r==='admin' ? `<a href="${p}admin/manage-accounts.html" class="header-dropdown-item"><i class="bi bi-person-gear"></i> Manage Staff</a>` : ''}
                <div class="header-dropdown-divider"></div>
                <div style="padding:0.2rem 0.85rem; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--color-slate-400);">Switch Portal</div>
                <a href="#" class="header-dropdown-item role-switch-btn" data-switch="Customer"><i class="bi bi-person"></i> Customer Portal</a>
                <a href="#" class="header-dropdown-item role-switch-btn" data-switch="Provider"><i class="bi bi-shop"></i> Provider Console</a>
                <a href="#" class="header-dropdown-item role-switch-btn" data-switch="Admin"><i class="bi bi-shield-check"></i> Admin Control</a>
                <div class="header-dropdown-divider"></div>
                <a href="${p}login.html" class="header-dropdown-item" style="color:#dc2626;" id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Sign Out</a>
              </div>
            </div>
          </div>
        </div>
      </header>`;

    // Set breadcrumb from active link label
    setTimeout(() => {
      const active = document.querySelector(`.sidebar-nav-link.active span`);
      const bc = document.getElementById('slimBreadcrumb');
      if (bc && active) bc.textContent = active.textContent.trim();
    }, 0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     FULL TOP HEADER (Public & Customer)
  ══════════════════════════════════════════════════════════════════════ */
  renderFullHeader() {
    const r     = this._role;
    const u     = this.getUserData();
    const p     = this._prefix;
    const links = this.getNavLinks();

    const navLinksHtml = links.map(link => {
      const isActive = this._active === link.id;
      return `<li>
        <a href="${link.href}" class="header-nav-link ${isActive ? 'active' : ''}">
          <i class="bi ${link.icon}"></i><span>${link.label}</span>
        </a></li>`;
    }).join('');

    const drawerLinksHtml = links.map(link => {
      const isActive = this._active === link.id;
      return `<a href="${link.href}" class="header-drawer-link ${isActive ? 'active' : ''}">
        <i class="bi ${link.icon}"></i><span>${link.label}</span>
      </a>`;
    }).join('');

    let roleBadge = '';
    if (r === 'customer') roleBadge = `<span class="header-brand-role-tag">Customer</span>`;

    let actionsHtml = '';
    if (r === 'public') {
      actionsHtml = `
        <div class="d-flex align-items-center gap-2">
          ${this.getDataModeToggleHtml()}
          <a href="${p}login.html"    class="btn-outline-custom" style="padding:0.45rem 1rem; font-size:0.85rem;">Sign In</a>
          <a href="${p}register.html" class="btn-primary-custom" style="padding:0.45rem 1.15rem; font-size:0.85rem;">Get Started</a>
        </div>`;
    } else {
      actionsHtml = `
        <div class="d-flex align-items-center gap-2">
          ${this.getDataModeToggleHtml()}
          <div class="header-user-dropdown" id="userDropdownContainer">
            <div class="header-user-pill" id="userPillTrigger">
              <div class="header-user-avatar">${u.initials}</div>
              <span class="header-user-name d-none d-sm-inline">${u.fullName}</span>
              <i class="bi bi-chevron-down" style="font-size:0.75rem; color:var(--color-slate-500);"></i>
            </div>
            <div class="header-dropdown-menu" id="userDropdownMenu">
              <div style="padding:0.4rem 0.85rem 0.5rem; border-bottom:1px solid var(--color-slate-200); margin-bottom:0.35rem;">
                <div style="font-weight:700; font-size:0.85rem; color:#0f172a;">${u.fullName}</div>
                <div style="font-size:0.75rem; color:var(--color-slate-500);">${u.email}</div>
              </div>
              ${r==='customer' ? `<a href="${p}customer/profile.html" class="header-dropdown-item"><i class="bi bi-person-gear"></i> My Profile</a>` : ''}
              <div class="header-dropdown-divider"></div>
              <div style="padding:0.2rem 0.85rem; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--color-slate-400);">Switch Portal</div>
              <a href="#" class="header-dropdown-item role-switch-btn" data-switch="Customer"><i class="bi bi-person"></i> Customer Portal</a>
              <a href="#" class="header-dropdown-item role-switch-btn" data-switch="Provider"><i class="bi bi-shop"></i> Provider Console</a>
              <a href="#" class="header-dropdown-item role-switch-btn" data-switch="Admin"><i class="bi bi-shield-check"></i> Admin Control</a>
              <div class="header-dropdown-divider"></div>
              <a href="${p}login.html" class="header-dropdown-item" style="color:#dc2626;" id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Sign Out</a>
            </div>
          </div>
        </div>`;
    }

    this.innerHTML = `
      <header class="site-master-header" id="masterHeader">
        <div class="site-header-container">
          <a href="${p}index.html" class="header-brand-badge" aria-label="BookWith.tech Home">
            ${this.getLogoMark(38)}
            ${this.getWordmark(false)}
            ${roleBadge}
          </a>
          <nav aria-label="Main navigation">
            <ul class="header-nav-list">${navLinksHtml}</ul>
          </nav>
          <div class="header-actions-group">
            ${actionsHtml}
            <button class="header-mobile-toggle" id="mobileDrawerOpen" aria-label="Open Navigation Menu">
              <i class="bi bi-list"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile Offcanvas Drawer -->
      <div class="header-mobile-overlay" id="drawerOverlay"></div>
      <div class="header-mobile-drawer" id="mobileDrawer">
        <div class="header-drawer-top">
          <a href="${p}index.html" class="header-brand-badge" style="font-size:1.15rem;">
            ${this.getLogoMark(32)}
            ${this.getWordmark(false)}
          </a>
          <button class="header-drawer-close" id="mobileDrawerClose" aria-label="Close Navigation Menu">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="header-drawer-nav">
          <div class="p-2 mb-2 bg-light rounded-3 d-flex justify-content-center">
            ${this.getDataModeToggleHtml()}
          </div>
          ${drawerLinksHtml}
          ${r === 'public' ? `
            <div style="margin-top:1rem; display:flex; flex-direction:column; gap:0.5rem;">
              <a href="${p}login.html"    class="btn-outline-custom w-100 text-center">Sign In</a>
              <a href="${p}register.html" class="btn-primary-custom w-100 text-center">Get Started</a>
            </div>` : `
            <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--color-slate-200);">
              <a href="${p}login.html" class="header-drawer-link" style="color:#dc2626;"><i class="bi bi-box-arrow-right"></i> Sign Out</a>
            </div>`}
        </div>
      </div>`;
  }

  /* ── Ensure Supabase Connection Settings Modal is in DOM ─────────────── */
  ensureDbSettingsModal() {
    if (document.getElementById('bwtDbModal')) return;

    const modal = document.createElement('div');
    modal.id = 'bwtDbModal';
    modal.className = 'bwt-modal-backdrop';
    const cfg = window.SupabaseClient ? window.SupabaseClient.getConfig() : { url: '', anonKey: '' };

    modal.innerHTML = `
      <div class="bwt-modal-content">
        <div class="p-4 border-bottom d-flex align-items-center justify-content-between" style="background:#0b1e18; color:#fff;">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-database-gear text-success fs-5"></i>
            <h3 class="fs-6 fw-bold mb-0 text-white">Supabase Connection Settings</h3>
          </div>
          <button type="button" class="btn-close btn-close-white" id="bwtDbModalClose" aria-label="Close"></button>
        </div>

        <div class="p-4">
          <p class="fs-xs text-muted mb-3">
            Configure your active Supabase project endpoint. These settings are persisted locally in your browser session.
          </p>

          <div class="mb-3">
            <label class="form-label fs-xs fw-bold text-slate-700">Supabase Project URL</label>
            <input type="url" id="bwtModalUrl" class="form-control form-control-sm" placeholder="https://your-project.supabase.co" value="${cfg.url}">
          </div>

          <div class="mb-3">
            <label class="form-label fs-xs fw-bold text-slate-700">Supabase Anon Public API Key</label>
            <input type="password" id="bwtModalKey" class="form-control form-control-sm" placeholder="eyJhbGciOiJIUzI1NiIsInR5c..." value="${cfg.anonKey}">
          </div>

          <div id="bwtDbTestResult" class="p-2 rounded-2 fs-xs mb-3" style="display:none;"></div>

          <div class="d-flex align-items-center justify-content-between gap-2 pt-2 border-top">
            <button type="button" class="btn btn-sm btn-outline-secondary" id="bwtBtnTestConn">
              <i class="bi bi-activity"></i> Test Connection
            </button>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-light" id="bwtBtnCancelModal">Cancel</button>
              <button type="button" class="btn btn-sm btn-primary" style="background:#0d5c46; border-color:#0d5c46;" id="bwtBtnSaveDbConfig">
                <i class="bi bi-check2"></i> Save & Reconnect
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Modal Events
    const closeModal = () => modal.classList.remove('show');
    modal.querySelector('#bwtDbModalClose')?.addEventListener('click', closeModal);
    modal.querySelector('#bwtBtnCancelModal')?.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    modal.querySelector('#bwtBtnTestConn')?.addEventListener('click', async () => {
      const url = modal.querySelector('#bwtModalUrl').value.trim();
      const key = modal.querySelector('#bwtModalKey').value.trim();
      const resEl = modal.querySelector('#bwtDbTestResult');
      resEl.style.display = 'block';
      resEl.className = 'p-2 rounded-2 fs-xs mb-3 bg-light text-slate-700';
      resEl.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Ping testing Supabase endpoint...';

      if (window.SupabaseClient) {
        window.SupabaseClient.setConfig(url, key);
        const res = await window.SupabaseClient.testConnection();
        if (res.ok) {
          resEl.className = 'p-2 rounded-2 fs-xs mb-3 bg-success-subtle text-success fw-bold';
          resEl.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i> Success: Connected to live Supabase Postgres database!';
        } else {
          resEl.className = 'p-2 rounded-2 fs-xs mb-3 bg-danger-subtle text-danger fw-bold';
          resEl.innerHTML = `<i class="bi bi-x-circle-fill me-1"></i> Connection Error: ${res.error || res.message}`;
        }
      }
    });

    modal.querySelector('#bwtBtnSaveDbConfig')?.addEventListener('click', () => {
      const url = modal.querySelector('#bwtModalUrl').value.trim();
      const key = modal.querySelector('#bwtModalKey').value.trim();
      if (window.SupabaseClient) {
        window.SupabaseClient.setConfig(url, key);
        if (window.AppConfig) window.AppConfig.setMode('database');
      }
      closeModal();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     INTERACTIONS
  ══════════════════════════════════════════════════════════════════════ */
  initInteractions() {
    const p = this._prefix;

    if (this._useSidebar) {
      this._initSidebarInteractions();
    } else {
      this._initTopNavInteractions();
    }

    // Dropdown (shared)
    const trigger = this.querySelector('#userPillTrigger');
    const menu    = this.querySelector('#userDropdownMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('show'); });
      document.addEventListener('click', e => {
        if (!trigger.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('show');
      });
    }

    // Role switcher
    this.querySelectorAll('.role-switch-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const t = btn.getAttribute('data-switch');
        sessionStorage.setItem('Role', t);
        if (t === 'Customer')  { sessionStorage.setItem('FirstName','Aarav');  sessionStorage.setItem('LastName','Patel'); window.location.href = `${p}customer/browse-shops.html`; }
        else if (t === 'Provider') { sessionStorage.setItem('FirstName','Dhairya'); sessionStorage.setItem('LastName','Patel'); window.location.href = `${p}provider/dashboard.html`; }
        else if (t === 'Admin')    { sessionStorage.setItem('FirstName','System');  sessionStorage.setItem('LastName','Admin'); window.location.href = `${p}admin/dashboard.html`; }
      });
    });

    // Logout
    const logoutBtn = this.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (window.AuthService?.logout) {
          window.AuthService.logout();
        } else {
          sessionStorage.clear();
        }
      });
    }

    // Data Mode Switcher Buttons
    this.querySelectorAll('[data-mode="static"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.AppConfig) window.AppConfig.setMode('static');
      });
    });

    this.querySelectorAll('[data-mode="database"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.AppConfig) window.AppConfig.setMode('database');
      });
    });

    // DB Settings Modal Opener
    this.querySelectorAll('#btnOpenDbModal, .mode-settings-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById('bwtDbModal');
        if (modal) modal.classList.add('show');
      });
    });
  }

  _initSidebarInteractions() {
    const sidebar  = document.getElementById('siteSidebar');
    const overlay  = document.getElementById('sidebarOverlay');
    const openBtn  = this.querySelector('#sidebarMobileOpen') || document.querySelector('#sidebarMobileOpen');
    const closeBtn = document.getElementById('sidebarMobileClose');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');

    const openSidebar  = () => { sidebar?.classList.add('mobile-open'); overlay?.classList.add('show'); document.body.style.overflow = 'hidden'; };
    const closeSidebar = () => { sidebar?.classList.remove('mobile-open'); overlay?.classList.remove('show'); document.body.style.overflow = ''; };

    openBtn?.addEventListener('click', openSidebar);
    closeBtn?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    collapseBtn?.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      sidebar?.classList.toggle('collapsed');
      const icon = collapseBtn.querySelector('i');
      if (icon) icon.className = document.body.classList.contains('sidebar-collapsed') ? 'bi bi-layout-sidebar' : 'bi bi-layout-sidebar-reverse';
    });

    // Sticky slim header shadow
    const header = this.querySelector('#masterHeader');
    window.addEventListener('scroll', () => {
      header?.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  _initTopNavInteractions() {
    const header   = this.querySelector('#masterHeader');
    const openBtn  = this.querySelector('#mobileDrawerOpen');
    const closeBtn = this.querySelector('#mobileDrawerClose');
    const drawer   = this.querySelector('#mobileDrawer');
    const overlay  = this.querySelector('#drawerOverlay');

    window.addEventListener('scroll', () => {
      header?.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    const toggleDrawer = open => {
      drawer?.classList.toggle('open', open);
      overlay?.classList.toggle('show', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    openBtn?.addEventListener('click', () => toggleDrawer(true));
    closeBtn?.addEventListener('click', () => toggleDrawer(false));
    overlay?.addEventListener('click', () => toggleDrawer(false));
  }
}

customElements.define('site-header', SiteHeader);
