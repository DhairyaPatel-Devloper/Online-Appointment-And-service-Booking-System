/**
 * API SERVICE & DATA LAYER MODULE
 * Bridges frontend UI components with real Supabase backend services.
 */

const ApiService = (function () {
  'use strict';

  return {
    /**
     * Get all verified approved shops/providers
     */
    async getShops(params = {}) {
      if (window.ProviderService) {
        return window.ProviderService.getApprovedProviders(params);
      }
      return [];
    },

    /**
     * Get single shop details by provider ID
     */
    async getShopById(id) {
      if (window.ProviderService) {
        return window.ProviderService.getProviderById(parseInt(id, 10));
      }
      return null;
    },

    /**
     * Get available slots for a provider on a specific date
     */
    async getTimeSlots(providerId, dateStr) {
      if (window.SlotService) {
        return window.SlotService.getSlotsByDateAndProvider(parseInt(providerId, 10), dateStr);
      }
      return [];
    },

    /**
     * Create an appointment booking
     */
    async createBooking(bookingData) {
      if (window.BookingService) {
        return window.BookingService.createBooking(bookingData);
      }
      throw new Error('BookingService not available');
    },

    /**
     * Get all bookings for current user / customer
     */
    async getCustomerBookings(customerId) {
      if (window.BookingService) {
        return window.BookingService.getCustomerBookings(parseInt(customerId, 10));
      }
      return [];
    },

    /**
     * Get booking history for customer
     */
    async getCustomerBookingHistory(customerId) {
      if (window.BookingService) {
        return window.BookingService.getCustomerBookingHistory(parseInt(customerId, 10));
      }
      return [];
    },

    /**
     * Get all appointments (Admin / Provider)
     */
    async getAppointments(providerId = null) {
      if (providerId && window.BookingService) {
        return window.BookingService.getProviderBookings(parseInt(providerId, 10));
      } else if (window.BookingService) {
        return window.BookingService.getAllBookings();
      }
      return [];
    },

    /**
     * Submit customer review/feedback
     */
    async submitFeedback(feedbackData) {
      if (window.FeedbackService) {
        return window.FeedbackService.submitFeedback(feedbackData);
      }
      throw new Error('FeedbackService not available');
    },

    /**
     * Get provider reviews
     */
    async getProviderReviews(providerId) {
      if (window.FeedbackService) {
        return window.FeedbackService.getProviderFeedback(parseInt(providerId, 10));
      }
      return { reviews: [], totalReviews: 0, averageRating: 5.0, distribution: {} };
    },

    /**
     * Get Admin dashboard metrics
     */
    async getAdminStats() {
      if (window.AdminService) {
        return window.AdminService.getDashboardStats();
      }
      return {};
    }
  };
})();

window.ApiService = ApiService;
