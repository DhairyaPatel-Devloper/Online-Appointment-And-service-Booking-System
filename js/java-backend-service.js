/**
 * JAVA SERVLET & JDBC BACKEND CONNECTOR
 * =====================================
 * Connects the frontend to the pure Java 3-Tier Backend (Servlets + JDBC).
 *
 * Backend Structure:
 *   - Presentation Layer : Java Servlets (HttpServlet)
 *   - Business Logic     : Java Services (UserService, BookingService, etc.)
 *   - Data Access Layer  : Java JDBC DAOs (PreparedStatement, Connection, ResultSet)
 *   - Database           : PostgreSQL / Supabase / MySQL
 *
 * Default Base URL: http://localhost:8080/BookWithTech
 */

window.JavaBackendService = (function () {
  'use strict';

  function getBaseUrl() {
    const custom = localStorage.getItem('JAVA_BACKEND_URL');
    if (custom) return custom.replace(/\/+$/, '');
    // If hosted on Tomcat with webapp context
    if (window.location.pathname.startsWith('/BookWithTech')) {
      return window.location.origin + '/BookWithTech';
    }
    return 'http://localhost:8080/BookWithTech';
  }

  async function request(method, path, params = {}) {
    let url = getBaseUrl() + path;
    let body = null;

    if (method === 'GET' && Object.keys(params).length > 0) {
      url += '?' + new URLSearchParams(params).toString();
    } else if (method !== 'GET') {
      body = new URLSearchParams(params);
    }

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {},
        body
      });

      const data = await res.json().catch(() => ({ error: 'Non-JSON response from Java Servlet' }));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status} from Java Servlet`);
      }
      return data;
    } catch (err) {
      console.warn(`Java Servlet request to ${path} failed:`, err);
      throw err;
    }
  }

  return {
    getBaseUrl,
    setBaseUrl(url) {
      localStorage.setItem('JAVA_BACKEND_URL', url);
    },

    // ── 1. AUTHENTICATION (LoginServlet, RegisterServlet) ───────────────────
    async login(email, password) {
      return request('POST', '/api/auth/login', { email, password });
    },

    async register({ firstName, lastName, email, password, phone, role = 'Customer' }) {
      return request('POST', '/api/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phone,
        rolle: role
      });
    },

    async logout() {
      return request('POST', '/api/auth/logout');
    },

    async getCurrentUser() {
      return request('GET', '/api/auth/me');
    },

    // ── 2. PROVIDERS (ProviderServlet) ──────────────────────────────────────
    async getApprovedProviders() {
      return request('GET', '/api/providers');
    },

    async getAllProviders() {
      return request('GET', '/api/providers/all');
    },

    async getPendingProviders() {
      return request('GET', '/api/providers/pending');
    },

    async approveProvider(id) {
      return request('POST', '/api/providers/approve', { id });
    },

    async rejectProvider(id) {
      return request('POST', '/api/providers/reject', { id });
    },

    async registerProviderProfile(data) {
      return request('POST', '/api/providers/register', data);
    },

    // ── 3. TIME SLOTS (TimeSlotServlet) ─────────────────────────────────────
    async getSlots(providerId, dateStr) {
      return request('GET', '/api/slots', { providerId, date: dateStr });
    },

    async getAvailableSlots(providerId, dateStr) {
      return request('GET', '/api/slots/available', { providerId, date: dateStr });
    },

    async toggleSlotStatus(slotId, status) {
      return request('POST', '/api/slots/toggle', { slotId, status: String(status) });
    },

    async generateDaySlots(providerId, dateStr, startTime, endTime, duration, capacity) {
      return request('POST', '/api/slots/generate', {
        providerId,
        date: dateStr,
        startTime,
        endTime,
        duration,
        capacity
      });
    },

    // ── 4. BOOKINGS (BookingServlet) ────────────────────────────────────────
    async createBooking({ customerId, providerId, slotId, amount }) {
      return request('POST', '/api/bookings', { customerId, providerId, slotId, amount });
    },

    async getCustomerBookings(customerId) {
      return request('GET', '/api/bookings', { customerId });
    },

    async getProviderBookings(providerId) {
      return request('GET', '/api/bookings', { providerId });
    },

    async getAllBookings() {
      return request('GET', '/api/bookings/all');
    },

    async cancelBooking(bookingId) {
      return request('POST', '/api/bookings/cancel', { bookingId });
    },

    async confirmBooking(bookingId) {
      return request('POST', '/api/bookings/confirm', { bookingId });
    },

    async completeBooking(bookingId) {
      return request('POST', '/api/bookings/complete', { bookingId });
    },

    // ── 5. FEEDBACK (FeedbackServlet) ───────────────────────────────────────
    async getProviderFeedback(providerId) {
      return request('GET', '/api/feedback', { providerId });
    },

    async submitFeedback({ bookingId, customerId, providerId, rating, comment }) {
      return request('POST', '/api/feedback', { bookingId, customerId, providerId, rating, comment });
    }
  };
})();

