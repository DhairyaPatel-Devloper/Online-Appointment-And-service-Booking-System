/**
 * USER SERVICE
 * Manages user accounts, listings, status toggles, and profile updates matching REF logic.
 */

window.UserService = (function () {
  'use strict';

  function getClient() {
    return window.SupabaseClient ? window.SupabaseClient.client : window.db;
  }

  return {
    /**
     * Get all users with optional role, status, and search filters
     */
    async getAllUsers({ role, isActive, search } = {}) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      let query = client
        .from('users')
        .select('userid, firstname, lastname, emailid, phone, rolle, isactive, createdat, modifiedat')
        .order('userid', { ascending: false });

      if (role && role !== 'all') {
        query = query.ilike('rolle', role);
      }
      if (isActive !== undefined && isActive !== 'all') {
        query = query.eq('isactive', isActive === true || isActive === 'true');
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      if (search && search.trim()) {
        const s = search.toLowerCase().trim();
        return data.filter(u =>
          (u.firstname && u.firstname.toLowerCase().includes(s)) ||
          (u.lastname && u.lastname.toLowerCase().includes(s)) ||
          (u.emailid && u.emailid.toLowerCase().includes(s)) ||
          (u.phone && u.phone.includes(s))
        );
      }

      return data || [];
    },

    /**
     * Get single user by ID
     */
    async getUserById(userId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('userid', userId)
        .limit(1);

      if (error) throw new Error(error.message);
      return (data && data[0]) || null;
    },

    /**
     * Update user details matching REF AdminEditUserData.aspx.cs and ProfileCustomer.aspx.cs
     */
    async updateUser(userId, { firstName, lastName, email, phone, role, isActive }) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const updateData = {
        modifiedat: new Date().toISOString()
      };
      if (firstName !== undefined) updateData.firstname = firstName.trim();
      if (lastName !== undefined) updateData.lastname = lastName.trim();
      if (email !== undefined) updateData.emailid = email.trim().toLowerCase();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (role !== undefined) updateData.rolle = role;
      if (isActive !== undefined) updateData.isactive = isActive;

      const { data, error } = await client
        .from('users')
        .update(updateData)
        .eq('userid', userId)
        .select();

      if (error) throw new Error(error.message);
      return (data && data[0]) || null;
    },

    /**
     * Toggle active/inactive status of a user
     */
    async toggleUserStatus(userId, isActive) {
      return this.updateUser(userId, { isActive });
    },

    /**
     * Delete user
     */
    async deleteUser(userId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { error } = await client
        .from('users')
        .delete()
        .eq('userid', userId);

      if (error) throw new Error(error.message);
      return true;
    }
  };
})();

