/**
 * SUPABASE CLIENT & GLOBAL APP CONFIG MODULE
 * Manages Supabase client initialization, Live DB vs Static Demo Mode toggles,
 * connection diagnostic checks, and global notifications.
 */

(function () {
  'use strict';

  const MODE_STORAGE_KEY = 'BOOKWITH_DATA_MODE';
  const DEFAULT_SUPABASE_URL = 'https://cdcxnhrmfubqynrtyyjz.supabase.co';
  const DEFAULT_ANON_KEY = 'sb_publishable_7m_VUDyELu-65KuKwcEjLA_0vUpJ-KP';

  function getSupabaseConfig() {
    const envUrl = (window.ENV && window.ENV.SUPABASE_URL) || localStorage.getItem('SUPABASE_URL') || DEFAULT_SUPABASE_URL;
    const envKey = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || localStorage.getItem('SUPABASE_ANON_KEY') || DEFAULT_ANON_KEY;
    return {
      url: envUrl.trim(),
      anonKey: envKey.trim()
    };
  }

  let config = getSupabaseConfig();
  let client = null;

  function initClient(url, anonKey) {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      try {
        client = window.supabase.createClient(url, anonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
        window.db = client;
        if (window.SupabaseClient) window.SupabaseClient.client = client;
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
      }
    }
  }

  initClient(config.url, config.anonKey);

  // Global App Configuration (Data Mode Switcher & Utilities)
  window.AppConfig = {
    /**
     * Get current operational data mode ('static' | 'database')
     * Defaults to 'static'
     */
    getMode() {
      const mode = localStorage.getItem(MODE_STORAGE_KEY);
      if (mode === 'database') return 'database';
      return 'static';
    },

    /**
     * Check if currently in live database mode (Supabase)
     */
    isDatabaseMode() {
      return this.getMode() === 'database';
    },

    /**
     * Check if currently in pure Java Servlets + JDBC mode
     */
    isJavaMode() {
      return this.getMode() === 'java';
    },

    /**
     * Set operational data mode ('static' | 'database')
     */
    setMode(mode) {
      const target = (mode === 'database') ? 'database' : 'static';
      const prev = this.getMode();
      localStorage.setItem(MODE_STORAGE_KEY, target);

      // Dispatch global events for UI listeners
      const event = new CustomEvent('datamodechange', { detail: { mode: target, previous: prev } });
      window.dispatchEvent(event);

      if (target === 'database') {
        this.showToast('🟢 Switched to Live Supabase Database Mode. Real-time queries & authentication active.', 'success');
        
        // Strict protection: If on a portal page without login in DB mode, redirect to login
        const p = window.location.pathname;
        const isPortal = p.includes('/customer/') || p.includes('/provider/') || p.includes('/admin/');
        const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
        if (isPortal && !user) {
          const prefix = isPortal ? '../' : '';
          setTimeout(() => {
            window.location.replace(`${prefix}login.html?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          }, 600);
        }
      } else {
        this.showToast('⚡ Switched to Demo / Static Mode. Fast offline sample data active.', 'info');
      }

      // Update toggle UI elements across the page
      this.updateToggleUI();
    },

    /**
     * Toggle between static and database modes
     */
    toggleMode() {
      const next = this.isDatabaseMode() ? 'static' : 'database';
      this.setMode(next);
      return next;
    },

    /**
     * Check if user is authenticated when in Database Mode
     * If not, redirects to login page with return URL or shows prompt
     */
    requireAuth(redirectUrl = null) {
      if (!this.isDatabaseMode()) return true; // Static mode does not lock screens

      const user = window.AuthService ? window.AuthService.getCurrentUser() : null;
      if (!user) {
        this.showToast('⚠️ Live Database Mode requires signing in to your Supabase account.', 'warning');
        const returnTarget = redirectUrl || window.location.pathname + window.location.search;
        const prefix = (window.location.pathname.includes('/customer/') || window.location.pathname.includes('/provider/') || window.location.pathname.includes('/admin/')) ? '../' : '';
        setTimeout(() => {
          window.location.href = `${prefix}login.html?returnUrl=${encodeURIComponent(returnTarget)}`;
        }, 1200);
        return false;
      }
      return true;
    },

    /**
     * Update all toggle buttons on current page to match state
     */
    updateToggleUI() {
      const isDb = this.isDatabaseMode();
      document.querySelectorAll('.data-mode-toggle-wrapper').forEach(wrapper => {
        const staticBtn = wrapper.querySelector('[data-mode="static"]');
        const dbBtn = wrapper.querySelector('[data-mode="database"]');

        if (staticBtn) staticBtn.classList.toggle('active-static', !isDb);
        if (dbBtn) dbBtn.classList.toggle('active-db', isDb);
      });

      // Update banner indicators if present
      document.querySelectorAll('.data-mode-indicator-pill').forEach(pill => {
        if (isDb) {
          pill.className = 'data-mode-indicator-pill db-mode';
          pill.innerHTML = '<span class="pulse-dot"></span> Live Database';
        } else {
          pill.className = 'data-mode-indicator-pill static-mode';
          pill.innerHTML = '<i class="bi bi-lightning-charge-fill"></i> Demo Mode';
        }
      });
    },

    /**
     * Lightweight Toast Notification Helper
     */
    showToast(message, type = 'info') {
      let container = document.getElementById('bwtToastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'bwtToastContainer';
        container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:380px;';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `bwt-toast bwt-toast-${type}`;
      toast.style.cssText = `
        background: #0f172a;
        color: #ffffff;
        padding: 12px 16px;
        border-radius: 10px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        font-size: 0.85rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        pointer-events: auto;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'danger' ? '#ef4444' : '#3b82f6'};
        animation: bwtToastSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transition: opacity 0.25s ease, transform 0.25s ease;
      `;

      let icon = 'bi-info-circle';
      if (type === 'success') icon = 'bi-check-circle-fill text-success';
      if (type === 'warning') icon = 'bi-exclamation-triangle-fill text-warning';
      if (type === 'danger') icon = 'bi-x-circle-fill text-danger';

      toast.innerHTML = `
        <i class="bi ${icon}" style="font-size:1.1rem;flex-shrink:0;"></i>
        <div style="flex:1;line-height:1.4;">${message}</div>
        <button type="button" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:0;font-size:0.9rem;" onclick="this.parentElement.remove()">
          <i class="bi bi-x"></i>
        </button>
      `;

      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
  };

  // Supabase Client Wrapper
  window.SupabaseClient = {
    client: client,
    getConfig: getSupabaseConfig,
    setConfig(url, anonKey) {
      if (url) localStorage.setItem('SUPABASE_URL', url.trim());
      if (anonKey) localStorage.setItem('SUPABASE_ANON_KEY', anonKey.trim());
      initClient(url.trim(), anonKey.trim());
    },
    async testConnection() {
      if (!this.client) return { ok: false, message: 'Supabase SDK not loaded or client uninitialized' };
      try {
        const { data, error } = await this.client.from('users').select('userid').limit(1);
        if (error) return { ok: false, error: error.message };
        return { ok: true, data, message: 'Connected to Supabase PostgreSQL Database' };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
  };

  window.db = client;

  // Initialize UI state on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    if (window.AppConfig) window.AppConfig.updateToggleUI();
  });
})();

