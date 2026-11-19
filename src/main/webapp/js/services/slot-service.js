/**
 * TIME SLOT SERVICE
 * Manages provider schedule, slot generation, availability checks, and capacity calculations matching REF logic.
 */

window.SlotService = (function () {
  'use strict';

  function getClient() {
    return window.SupabaseClient ? window.SupabaseClient.client : window.db;
  }

  function toBooleanStatus(status) {
    if (typeof status === 'boolean') return status;
    if (typeof status === 'string') {
      const s = status.toLowerCase().trim();
      return s === 'available' || s === 'true' || s === '1' || s === 'active';
    }
    return Boolean(status);
  }

  return {
    /**
     * Get slots for a provider on a specific date with live remaining booking capacity
     */
    async getSlotsByDateAndProvider(providerId, dateStr) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      // 1. Fetch slots for the date
      const { data: slots, error } = await client
        .from('providertimeslots')
        .select('*')
        .eq('providerid', providerId)
        .eq('slotdate', dateStr)
        .order('slotstarttime', { ascending: true });

      if (error) throw new Error(error.message);
      if (!slots || slots.length === 0) return [];

      // 2. Fetch existing active bookings for these slots to calculate remaining capacity
      const slotIds = slots.map(s => s.slotid);
      const { data: bookings } = await client
        .from('booking')
        .select('slotid, bookingstatus')
        .in('slotid', slotIds)
        .in('bookingstatus', ['Pending', 'Confirmed', 'Ongoing']);

      const bookedCountMap = {};
      if (bookings) {
        bookings.forEach(b => {
          bookedCountMap[b.slotid] = (bookedCountMap[b.slotid] || 0) + 1;
        });
      }

      return slots.map(s => {
        const bookedCount = bookedCountMap[s.slotid] || 0;
        const remainingCapacity = Math.max(0, s.slotcapacity - bookedCount);
        const isActive = s.slotstatus === true || s.slotstatus === 'true' || s.slotstatus === 1 || s.slotstatus === 'Available';
        const isAvailable = isActive && remainingCapacity > 0;
        const dynamicStatus = !isActive ? 'Blocked' : (remainingCapacity <= 0 ? 'Full' : 'Available');

        return {
          ...s,
          bookedCount,
          remainingCapacity,
          isAvailable,
          computedStatus: dynamicStatus
        };
      });
    },

    /**
     * Generate standard time slot grid for a provider for a date based on operating hours and duration
     */
    async generateDaySlots(providerId, dateStr, startTime = '09:00:00', endTime = '18:00:00', avgServiceTime = 30, perSlotCapacity = 2) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const slotsToInsert = [];
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      let currentMin = startHour * 60 + startMin;
      const totalEndMin = endHour * 60 + endMin;
      const step = avgServiceTime > 0 ? avgServiceTime : 30;

      while (currentMin + step <= totalEndMin) {
        const nextMin = currentMin + step;

        const sHour = String(Math.floor(currentMin / 60)).padStart(2, '0');
        const sMin = String(currentMin % 60).padStart(2, '0');
        const eHour = String(Math.floor(nextMin / 60)).padStart(2, '0');
        const eMin = String(nextMin % 60).padStart(2, '0');

        slotsToInsert.push({
          providerid: providerId,
          slotdate: dateStr,
          slotstarttime: `${sHour}:${sMin}:00`,
          slotendtime: `${eHour}:${eMin}:00`,
          slotcapacity: perSlotCapacity,
          slotstatus: true // Strict boolean for PostgreSQL schema
        });

        currentMin = nextMin;
      }

      if (slotsToInsert.length === 0) return [];

      // Check existing slots to avoid duplicate constraint violations
      const { data: existingSlots } = await client
        .from('providertimeslots')
        .select('slotstarttime')
        .eq('providerid', providerId)
        .eq('slotdate', dateStr);

      const existingStartTimes = new Set((existingSlots || []).map(s => s.slotstarttime));
      const freshSlots = slotsToInsert.filter(s => !existingStartTimes.has(s.slotstarttime));

      if (freshSlots.length > 0) {
        const { data, error } = await client
          .from('providertimeslots')
          .insert(freshSlots)
          .select();

        if (error) throw new Error(error.message);
        return data || [];
      }

      return [];
    },

    /**
     * Save or update an individual slot
     */
    async saveSlot({ providerId, slotDate, slotStartTime, slotEndTime, slotCapacity, slotStatus }) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const boolStatus = toBooleanStatus(slotStatus);

      const { data: existing } = await client
        .from('providertimeslots')
        .select('slotid')
        .eq('providerid', providerId)
        .eq('slotdate', slotDate)
        .eq('slotstarttime', slotStartTime)
        .limit(1);

      if (existing && existing.length > 0) {
        const { data, error } = await client
          .from('providertimeslots')
          .update({
            slotcapacity: slotCapacity,
            slotstatus: boolStatus,
            slotendtime: slotEndTime
          })
          .eq('slotid', existing[0].slotid)
          .select();

        if (error) throw new Error(error.message);
        return data[0];
      } else {
        const { data, error } = await client
          .from('providertimeslots')
          .insert([
            {
              providerid: providerId,
              slotdate: slotDate,
              slotstarttime: slotStartTime,
              slotendtime: slotEndTime,
              slotcapacity: slotCapacity || 2,
              slotstatus: boolStatus
            }
          ])
          .select();

        if (error) throw new Error(error.message);
        return data[0];
      }
    },

    /**
     * Update slot status (Available, Unavailable, BreakTime)
     */
    async updateSlotStatus(slotId, slotStatus) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('providertimeslots')
        .update({ slotstatus: toBooleanStatus(slotStatus) })
        .eq('slotid', slotId)
        .select();

      if (error) throw new Error(error.message);
      return data && data[0];
    },

    /**
     * Mark an entire day as Available or Unavailable
     */
    async markDayStatus(providerId, dateStr, status) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('providertimeslots')
        .update({ slotstatus: toBooleanStatus(status) })
        .eq('providerid', providerId)
        .eq('slotdate', dateStr)
        .select();

      if (error) throw new Error(error.message);
      return data || [];
    }
  };
})();

