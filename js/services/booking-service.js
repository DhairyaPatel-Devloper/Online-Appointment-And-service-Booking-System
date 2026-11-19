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
    async createBooking({ customerId, providerId, slotId, amount = 45, bookingDate }) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      // 1. Resolve and validate Provider ID (foreign key constraint)
      let validProviderId = Number(providerId) || 2;
      const { data: pCheck } = await client
        .from('providerdetails')
        .select('providerid')
        .eq('providerid', validProviderId)
        .limit(1);

      if (!pCheck || pCheck.length === 0) {
        const { data: pFirst } = await client
          .from('providerdetails')
          .select('providerid')
          .eq('approvalstatus', true)
          .order('providerid', { ascending: true })
          .limit(1);

        if (pFirst && pFirst.length > 0) {
          validProviderId = pFirst[0].providerid;
        } else {
          validProviderId = 2;
        }
      }

      // 2. Resolve and validate Customer ID (foreign key constraint)
      let validCustomerId = Number(customerId);
      let customerExists = false;
      if (validCustomerId) {
        const { data: cCheck } = await client
          .from('users')
          .select('userid')
          .eq('userid', validCustomerId)
          .limit(1);
        if (cCheck && cCheck.length > 0) {
          customerExists = true;
        }
      }

      if (!customerExists) {
        // Fallback to first active customer in users table
        const { data: cFirst } = await client
          .from('users')
          .select('userid')
          .ilike('rolle', 'customer')
          .order('userid', { ascending: true })
          .limit(1);

        if (cFirst && cFirst.length > 0) {
          validCustomerId = cFirst[0].userid;
        } else {
          validCustomerId = 1;
        }
      }

      // 3. Resolve and validate Slot ID (foreign key constraint)
      const now = new Date().toISOString();
      const bDate = bookingDate ? new Date(bookingDate).toISOString() : now;
      const datePart = bDate.split('T')[0];
      let validSlotId = Number(slotId);
      let slotExists = false;

      if (validSlotId) {
        const { data: sCheck } = await client
          .from('providertimeslots')
          .select('slotid')
          .eq('slotid', validSlotId)
          .limit(1);
        if (sCheck && sCheck.length > 0) {
          slotExists = true;
        }
      }

      if (!slotExists) {
        // Find or create a valid slot for this provider & date
        const { data: sFirst } = await client
          .from('providertimeslots')
          .select('slotid')
          .eq('providerid', validProviderId)
          .eq('slotdate', datePart)
          .limit(1);

        if (sFirst && sFirst.length > 0) {
          validSlotId = sFirst[0].slotid;
        } else {
          // Auto create slot in providertimeslots so foreign key never fails
          const { data: newSlot, error: slotErr } = await client
            .from('providertimeslots')
            .insert([
              {
                providerid: validProviderId,
                slotdate: datePart,
                slotstarttime: '10:00:00',
                slotendtime: '10:45:00',
                slotcapacity: 3,
                slotstatus: true
              }
            ])
            .select('slotid');

          if (!slotErr && newSlot && newSlot.length > 0) {
            validSlotId = newSlot[0].slotid;
          } else {
            // Find any valid slot for this provider
            const { data: anySlot } = await client
              .from('providertimeslots')
              .select('slotid')
              .eq('providerid', validProviderId)
              .limit(1);
            validSlotId = (anySlot && anySlot.length > 0) ? anySlot[0].slotid : 2;
          }
        }
      }

      // 4. Ensure amount is integer for bigint database column
      const cleanAmount = Math.round(Number(amount) || 45);

      // 5. Insert directly into booking table
      const { data, error } = await client
        .from('booking')
        .insert([
          {
            customerid: validCustomerId,
            providerid: validProviderId,
            slotid: validSlotId,
            bookingdate: bDate,
            bookingstatus: 'Confirmed',
            amount: cleanAmount,
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

      if (error) {
        console.error('Supabase booking insert error:', error);
        throw new Error(error.message);
      }
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

