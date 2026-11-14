/**
 * BOOKING SERVICE
 * Handles appointment creation, status lifecycle, customer bookings, and admin listings matching REF logic.
 */

window.BookingService = (function () {
  'use strict';

  function getClient() {
    return window.SupabaseClient ? window.SupabaseClient.client : window.db;
  }

  return {
    /**
     * Create a new booking matching REF sp_Master @Table='Booking', @Action='Insert'
     */
    async createBooking({ customerId, providerId, slotId, amount = 450, bookingDate }) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const now = new Date().toISOString();
      const bDate = bookingDate ? new Date(bookingDate).toISOString() : now;

      const { data, error } = await client
        .from('booking')
        .insert([
          {
            customerid: customerId,
            providerid: providerId,
            slotid: slotId,
            bookingdate: bDate,
            bookingstatus: 'Confirmed',
            amount: amount,
            createdat: now,
            modifiedat: now
          }
        ])
        .select(`
          bookingid,
          customerid,
          providerid,
          slotid,
          bookingdate,
          bookingstatus,
          amount
        `);

      if (error) throw new Error(error.message);
      return data && data[0];
    },

    /**
     * Get active/upcoming bookings for a customer matching REF CustomerMyBooking.aspx.cs
     */
    async getCustomerBookings(customerId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('booking')
        .select(`
          bookingid,
          customerid,
          providerid,
          slotid,
          bookingdate,
          bookingstatus,
          amount,
          createdat,
          providerdetails:providerid (
            businessname,
            businessaddress,
            businessphone
          ),
          providertimeslots:slotid (
            slotdate,
            slotstarttime,
            slotendtime
          )
        `)
        .eq('customerid', customerId)
        .in('bookingstatus', ['Pending', 'Confirmed', 'Ongoing'])
        .order('bookingid', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    /**
     * Get past booking history for a customer matching REF CustomerViewBookingHistory.aspx.cs
     */
    async getCustomerBookingHistory(customerId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('booking')
        .select(`
          bookingid,
          customerid,
          providerid,
          slotid,
          bookingdate,
          bookingstatus,
          amount,
          createdat,
          providerdetails:providerid (
            businessname,
            businessaddress,
            businessphone
          ),
          providertimeslots:slotid (
            slotdate,
            slotstarttime,
            slotendtime
          ),
          feedback:feedback (
            feedbackid,
            rating,
            comment
          )
        `)
        .eq('customerid', customerId)
        .in('bookingstatus', ['Completed', 'Cancelled'])
        .order('bookingid', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    /**
     * Get bookings for a provider matching REF ProviderAppointmentList.aspx.cs
     */
    async getProviderBookings(providerId, { status, date } = {}) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      let query = client
        .from('booking')
        .select(`
          bookingid,
          customerid,
          providerid,
          slotid,
          bookingdate,
          bookingstatus,
          amount,
          createdat,
          users:customerid (
            firstname,
            lastname,
            emailid,
            phone
          ),
          providertimeslots:slotid (
            slotdate,
            slotstarttime,
            slotendtime
          )
        `)
        .eq('providerid', providerId)
        .order('bookingid', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('bookingstatus', status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      if (date) {
        return (data || []).filter(b => {
          const sDate = b.providertimeslots && b.providertimeslots.slotdate;
          return sDate === date || (b.bookingdate && b.bookingdate.startsWith(date));
        });
      }

      return data || [];
    },

    /**
     * Get all bookings for Admin matching REF AdminBookingList.aspx.cs
     */
    async getAllBookings({ status, search } = {}) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      let query = client
        .from('booking')
        .select(`
          bookingid,
          customerid,
          providerid,
          slotid,
          bookingdate,
          bookingstatus,
          amount,
          createdat,
          users:customerid (
            firstname,
            lastname,
            emailid,
            phone
          ),
          providerdetails:providerid (
            businessname,
            businessaddress,
            businessphone
          ),
          providertimeslots:slotid (
            slotdate,
            slotstarttime,
            slotendtime
          )
        `)
        .order('bookingid', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('bookingstatus', status);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      if (search && search.trim()) {
        const s = search.toLowerCase().trim();
        return (data || []).filter(b => {
          const cName = b.users ? `${b.users.firstname} ${b.users.lastname || ''}`.toLowerCase() : '';
          const pName = b.providerdetails ? b.providerdetails.businessname.toLowerCase() : '';
          return String(b.bookingid).includes(s) || cName.includes(s) || pName.includes(s);
        });
      }

      return data || [];
    },

    /**
     * Get single booking details by ID
     */
    async getBookingById(bookingId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('booking')
        .select(`
          bookingid,
          customerid,
          providerid,
          slotid,
          bookingdate,
          bookingstatus,
          amount,
          createdat,
          users:customerid (
            firstname,
            lastname,
            emailid,
            phone
          ),
          providerdetails:providerid (
            businessname,
            businessaddress,
            businessphone
          ),
          providertimeslots:slotid (
            slotdate,
            slotstarttime,
            slotendtime
          )
        `)
        .eq('bookingid', bookingId)
        .limit(1);

      if (error) throw new Error(error.message);
      return data && data[0];
    },

    /**
     * Update booking status ('Confirmed', 'Ongoing', 'Completed', 'Cancelled')
     */
    async updateBookingStatus(bookingId, status) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('booking')
        .update({
          bookingstatus: status,
          modifiedat: new Date().toISOString()
        })
        .eq('bookingid', bookingId)
        .select();

      if (error) throw new Error(error.message);
      return data && data[0];
    },

    /**
     * Cancel an appointment matching REF CustomerCancelAppointments.aspx.cs
     */
    async cancelBooking(bookingId) {
      return this.updateBookingStatus(bookingId, 'Cancelled');
    }
  };
})();

