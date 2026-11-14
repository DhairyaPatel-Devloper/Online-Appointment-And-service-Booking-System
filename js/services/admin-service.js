/**
 * ADMIN SERVICE
 * Handles system-wide KPIs, analytics, provider approvals, and report generations matching REF logic.
 */

window.AdminService = (function () {
  'use strict';

  function getClient() {
    return window.SupabaseClient ? window.SupabaseClient.client : window.db;
  }

  return {
    /**
     * Get aggregate KPIs matching REF AdminDashboard.aspx.cs LoadDashboardStats
     */
    async getDashboardStats() {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      // Try RPC first
      try {
        const { data, error } = await client.rpc('sp_get_admin_dashboard_stats');
        if (!error && data && data.length > 0) {
          const row = data[0];
          return {
            totalProviders: parseInt(row.total_providers || 0, 10),
            totalCustomers: parseInt(row.total_customers || 0, 10),
            todayBookings: parseInt(row.today_bookings || 0, 10),
            monthlyBookings: parseInt(row.monthly_bookings || 0, 10),
            cancelledBookings: parseInt(row.cancelled_bookings || 0, 10),
            pendingRequests: parseInt(row.pending_requests || 0, 10)
          };
        }
      } catch (e) {
        console.warn('RPC failed, falling back to direct counts:', e);
      }

      // Direct queries fallback
      const todayStr = new Date().toISOString().split('T')[0];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const [pRes, cRes, bRes, prRes] = await Promise.all([
        client.from('providerdetails').select('providerid', { count: 'exact', head: true }).eq('approvalstatus', true),
        client.from('users').select('userid', { count: 'exact', head: true }).eq('isactive', true).ilike('rolle', 'Customer'),
        client.from('booking').select('bookingid, bookingdate, bookingstatus'),
        client.from('providerdetails').select('providerid', { count: 'exact', head: true }).eq('approvalstatus', false)
      ]);

      const allBookings = bRes.data || [];
      const todayBookings = allBookings.filter(b => b.bookingdate && b.bookingdate.startsWith(todayStr)).length;
      const monthlyBookings = allBookings.filter(b => {
        if (!b.bookingdate) return false;
        const d = new Date(b.bookingdate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const cancelledMonthly = monthlyBookings.filter(b => (b.bookingstatus || '').toLowerCase() === 'cancelled').length;

      return {
        totalProviders: pRes.count || 0,
        totalCustomers: cRes.count || 0,
        todayBookings,
        monthlyBookings: monthlyBookings.length,
        cancelledBookings: cancelledMonthly,
        pendingRequests: prRes.count || 0
      };
    },

    /**
     * Get monthly booking distribution for line chart (12 months)
     */
    async getMonthlyBookingTrends() {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data: bookings } = await client
        .from('booking')
        .select('bookingdate')
        .order('bookingdate', { ascending: true });

      const currentYear = new Date().getFullYear();
      const monthlyData = new Array(12).fill(0);

      (bookings || []).forEach(b => {
        if (!b.bookingdate) return;
        const d = new Date(b.bookingdate);
        if (d.getFullYear() === currentYear) {
          monthlyData[d.getMonth()]++;
        }
      });

      return monthlyData;
    },

    /**
     * Get rating distribution for donut chart (5-star down to 1-star)
     */
    async getRatingDistribution() {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data: feedbacks } = await client
        .from('feedback')
        .select('rating');

      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      (feedbacks || []).forEach(f => {
        const r = Math.round(f.rating);
        if (counts[r] !== undefined) counts[r]++;
      });

      return [counts[5], counts[4], counts[3], counts[2], counts[1]];
    },

    /**
     * Get today's bookings for Admin dashboard table
     */
    async getTodayBookings() {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const todayStr = new Date().toISOString().split('T')[0];

      const { data, error } = await client
        .from('booking')
        .select(`
          bookingid,
          bookingdate,
          bookingstatus,
          amount,
          users:customerid (
            firstname,
            lastname,
            emailid,
            phone
          ),
          providerdetails:providerid (
            businessname
          ),
          providertimeslots:slotid (
            slotstarttime,
            slotendtime
          )
        `)
        .order('bookingid', { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).filter(b => b.bookingdate && b.bookingdate.startsWith(todayStr));
    },

    /**
     * Get admin accounts
     */
    async getAdminAccounts() {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('users')
        .select('userid, firstname, lastname, emailid, phone, isactive, createdat')
        .ilike('rolle', 'Admin')
        .order('userid', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    }
  };
})();

