/**
 * FEEDBACK SERVICE
 * Handles customer reviews, star ratings, and provider reputation metrics matching REF logic.
 */

window.FeedbackService = (function () {
  'use strict';

  function getClient() {
    return window.SupabaseClient ? window.SupabaseClient.client : window.db;
  }

  return {
    /**
     * Submit feedback matching REF CustomerGiveFeedback.aspx.cs / sp_Master @Table='Feedback', @Action='Insert'
     */
    async submitFeedback({ bookingId, customerId, providerId, rating, comment }) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const now = new Date().toISOString();

      // Insert feedback
      const { data, error } = await client
        .from('feedback')
        .insert([
          {
            bookingid: bookingId,
            customerid: customerId,
            providerid: providerId,
            rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
            comment: comment.trim(),
            createdat: now,
            modifiedat: now
          }
        ])
        .select();

      if (error) throw new Error(error.message);
      return data && data[0];
    },

    /**
     * Get all feedback for a provider with rating analytics matching REF ProviderRating.aspx.cs
     */
    async getProviderFeedback(providerId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('feedback')
        .select(`
          feedbackid,
          bookingid,
          customerid,
          providerid,
          rating,
          comment,
          createdat,
          users:customerid (
            firstname,
            lastname
          )
        `)
        .eq('providerid', providerId)
        .order('feedbackid', { ascending: false });

      if (error) throw new Error(error.message);
      const reviews = data || [];

      // Calculate star distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalStars = 0;

      reviews.forEach(r => {
        const star = Math.round(r.rating);
        if (distribution[star] !== undefined) {
          distribution[star]++;
        }
        totalStars += r.rating;
      });

      const avgRating = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : '5.0';

      return {
        reviews,
        totalReviews: reviews.length,
        averageRating: parseFloat(avgRating),
        distribution
      };
    },

    /**
     * Get feedback for a specific booking
     */
    async getFeedbackByBooking(bookingId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('feedback')
        .select('*')
        .eq('bookingid', bookingId)
        .limit(1);

      if (error) throw new Error(error.message);
      return (data && data[0]) || null;
    }
  };
})();

