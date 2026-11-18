/**
 * api.js — BookWithTech Frontend API Client
 * ==========================================
 * Drop this script into any HTML page that needs to talk to the Java backend.
 *
 * Usage:
 *   <script src="/api.js"></script>
 *
 *   // Login
 *   const result = await BookWithTechAPI.login('user@example.com', 'pass123');
 *
 *   // Register
 *   await BookWithTechAPI.register({ firstName, lastName, email, password, phone, rolle });
 *
 *   // Create booking
 *   await BookWithTechAPI.createBooking({ customerId, providerId, slotId, amount });
 *
 * All functions return the parsed JSON response object.
 * On HTTP error, they throw an Error with the server's error message.
 */

const BookWithTechAPI = (() => {

    const BASE = '';  // same origin — the WAR serves both HTML and the API

    // ── Generic fetch helper ───────────────────────────────────────────────

    async function request(method, path, params = {}) {
        let url = BASE + path;
        let body = null;

        if (method === 'GET' && Object.keys(params).length > 0) {
            url += '?' + new URLSearchParams(params).toString();
        } else if (method !== 'GET') {
            body = new URLSearchParams(params);
        }

        const res = await fetch(url, {
            method,
            credentials: 'include',   // send session cookie
            headers: body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {},
            body
        });

        const data = await res.json().catch(() => ({ error: 'Non-JSON response from server' }));

        if (!res.ok) {
            throw new Error(data.error || `HTTP ${res.status}`);
        }
        return data;
    }

    // ── Auth ───────────────────────────────────────────────────────────────

    async function login(email, password) {
        return request('POST', '/api/auth/login', { email, password });
    }

    async function register({ firstName, lastName, email, password, phone, rolle = 'Customer' }) {
        return request('POST', '/api/auth/register', { firstName, lastName, email, password, phone, rolle });
    }

    async function logout() {
        return request('POST', '/api/auth/logout');
    }

    async function getCurrentUser() {
        return request('GET', '/api/auth/me');
    }

    // ── Providers ──────────────────────────────────────────────────────────

    async function getApprovedProviders() {
        return request('GET', '/api/providers');
    }

    async function getAllProviders() {
        return request('GET', '/api/providers/all');
    }

    async function getPendingProviders() {
        return request('GET', '/api/providers/pending');
    }

    async function approveProvider(id) {
        return request('POST', '/api/providers/approve', { id });
    }

    async function rejectProvider(id) {
        return request('POST', '/api/providers/reject', { id });
    }

    async function registerProviderProfile(data) {
        return request('POST', '/api/providers/register', data);
    }

    // ── Bookings ───────────────────────────────────────────────────────────

    async function getCustomerBookings(customerId) {
        return request('GET', '/api/bookings', { customerId });
    }

    async function getProviderBookings(providerId) {
        return request('GET', '/api/bookings', { providerId });
    }

    async function getAllBookings() {
        return request('GET', '/api/bookings/all');
    }

    async function createBooking({ customerId, providerId, slotId, amount }) {
        return request('POST', '/api/bookings', { customerId, providerId, slotId, amount });
    }

    async function cancelBooking(bookingId) {
        return request('POST', '/api/bookings/cancel', { bookingId });
    }

    async function confirmBooking(bookingId) {
        return request('POST', '/api/bookings/confirm', { bookingId });
    }

    async function completeBooking(bookingId) {
        return request('POST', '/api/bookings/complete', { bookingId });
    }

    // ── Feedback ───────────────────────────────────────────────────────────

    async function getProviderFeedback(providerId) {
        return request('GET', '/api/feedback', { providerId });
    }

    async function getCustomerFeedback(customerId) {
        return request('GET', '/api/feedback', { customerId });
    }

    async function submitFeedback({ bookingId, customerId, providerId, rating, comment }) {
        return request('POST', '/api/feedback', { bookingId, customerId, providerId, rating, comment });
    }

    // ── Session guard (call on protected pages) ────────────────────────────

    async function requireLogin(redirectTo = '/clone/LoginScreen.html') {
        try {
            const user = await getCurrentUser();
            return user;
        } catch {
            window.location.href = redirectTo;
        }
    }

    async function requireRole(role, redirectTo = '/clone/LandingPage.html') {
        const user = await requireLogin();
        if (user && user.rolle !== role) {
            window.location.href = redirectTo;
        }
        return user;
    }

    // ── Public API ────────────────────────────────────────────────────────

    return {
        login, register, logout, getCurrentUser,
        getApprovedProviders, getAllProviders, getPendingProviders,
        approveProvider, rejectProvider, registerProviderProfile,
        getCustomerBookings, getProviderBookings, getAllBookings,
        createBooking, cancelBooking, confirmBooking, completeBooking,
        getProviderFeedback, getCustomerFeedback, submitFeedback,
        requireLogin, requireRole
    };
})();
