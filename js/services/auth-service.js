/**
 * AUTH SERVICE
 * Handles authentication, registration, session management, and password reset matching REF logic.
 */

window.AuthService = (function () {
  'use strict';

  function getClient() {
    return window.SupabaseClient ? window.SupabaseClient.client : window.db;
  }

  function isDatabaseMode() {
    return window.AppConfig ? window.AppConfig.isDatabaseMode() : false;
  }

  // Pre-configured Demo Accounts matching REF sample credentials
  const DEMO_ACCOUNTS = {
    customer: {
      userid: 1,
      firstname: 'Rahul',
      lastname: 'Patel',
      emailid: 'rahul@gmail.com',
      phone: '9876543210',
      rolle: 'Customer',
      isactive: true
    },
    provider: {
      userid: 2,
      firstname: 'Amit',
      lastname: 'Sharma',
      emailid: 'amitprovider@gmail.com',
      phone: '9876500001',
      rolle: 'Provider',
      isactive: true
    },
    admin: {
      userid: 99,
      firstname: 'Admin',
      lastname: 'Super',
      emailid: 'admin@gmail.com',
      phone: '9876599999',
      rolle: 'Admin',
      isactive: true
    }
  };

  return {
    /**
     * Authenticate user with Email, Password, and Role matching REF sp_Master @Table='Users', @Action='Login'
     */
    async login(email, password, role) {
      const cleanEmail = (email || '').trim();
      const cleanPassword = (password || '').trim();
      const cleanRole = (role || 'Customer').trim();
      const roleKey = cleanRole.toLowerCase();

      // =========================================================================
      // 1. DEMO / STATIC MODE (NO DATABASE CALLS, INSTANT RELIABLE SIGN IN)
      // =========================================================================
      if (!isDatabaseMode()) {
        let demoUser = null;
        if (roleKey === 'provider') {
          demoUser = { ...DEMO_ACCOUNTS.provider };
        } else if (roleKey === 'admin') {
          demoUser = { ...DEMO_ACCOUNTS.admin };
        } else {
          demoUser = { ...DEMO_ACCOUNTS.customer };
        }

        // Support custom email and derive clean first name if entered
        if (cleanEmail) {
          demoUser.emailid = cleanEmail;
          if (cleanEmail.includes('@') && !cleanEmail.includes('gmail.com') && !cleanEmail.includes('bookwith.tech')) {
            const rawName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
            demoUser.firstname = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          }
        }
        demoUser.rolle = cleanRole;

        this.setSession(demoUser);
        if (window.AppConfig) {
          window.AppConfig.showToast(`✨ Demo Mode: Signed in as ${demoUser.firstname} (${demoUser.rolle})`, 'success');
        }
        return { success: true, user: demoUser, isDemo: true };
      }

      // =========================================================================
      // 2. LIVE SUPABASE DATABASE MODE
      // =========================================================================
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      // Try RPC first, fallback to table query
      try {
        const { data: rpcData, error: rpcError } = await client.rpc('sp_master_user_login', {
          p_email: cleanEmail,
          p_password: cleanPassword,
          p_role: cleanRole
        });

        if (!rpcError && rpcData && rpcData.length > 0) {
          const user = rpcData[0];
          this.setSession(user);
          return { success: true, user };
        }
      } catch (rpcErr) {
        console.warn('RPC login fallback to direct query:', rpcErr);
      }

      // Direct Table Query (exact case insensitive match on email, role)
      const { data, error } = await client
        .from('users')
        .select('userid, firstname, lastname, emailid, phone, rolle, isactive')
        .ilike('emailid', cleanEmail)
        .eq('passw', cleanPassword)
        .ilike('rolle', cleanRole)
        .eq('isactive', true)
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        // Check if user exists with different role/status to give accurate REF feedback
        const { data: checkUser } = await client
          .from('users')
          .select('rolle, isactive')
          .ilike('emailid', cleanEmail)
          .limit(1);

        if (checkUser && checkUser.length > 0) {
          if (!checkUser[0].isactive) {
            throw new Error('Your account has been deactivated. Please contact support.');
          }
          if (checkUser[0].rolle.toLowerCase() !== cleanRole.toLowerCase()) {
            throw new Error('The selected role does not match your account type.');
          }
        }

        // Informative guidance for demo vs live credentials
        if (cleanEmail === 'rahul@gmail.com' || cleanEmail === 'amitprovider@gmail.com' || cleanEmail === 'admin@gmail.com') {
          throw new Error('This is a Demo Account. Switch to Demo Mode using the top toggle to sign in instantly, or use a live database user.');
        }
        throw new Error('Invalid email or password. Please try again.');
      }

      const user = data[0];
      this.setSession(user);
      return { success: true, user };
    },

    /**
     * Register new user matching REF RegisterUser.aspx.cs
     */
    async register({ firstName, lastName, email, password, phone, role }) {
      const userRole = role || 'Customer';

      // =========================================================================
      // 1. DEMO / STATIC MODE
      // =========================================================================
      if (!isDatabaseMode()) {
        const demoUser = {
          userid: Math.floor(Math.random() * 9000) + 1000,
          firstname: (firstName || 'Demo').trim(),
          lastname: (lastName || 'User').trim(),
          emailid: (email || 'demo@bookwith.tech').trim().toLowerCase(),
          phone: (phone || '9876543210').trim(),
          rolle: userRole,
          isactive: true
        };
        this.setSession(demoUser);
        if (window.AppConfig) {
          window.AppConfig.showToast(`✨ Demo Mode: Account created for ${demoUser.firstname}!`, 'success');
        }
        return { success: true, user: demoUser, isDemo: true };
      }

      // =========================================================================
      // 2. LIVE SUPABASE DATABASE MODE
      // =========================================================================
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      // 1. Check if email already exists
      const { data: existing, error: checkError } = await client
        .from('users')
        .select('userid')
        .ilike('emailid', email.trim())
        .limit(1);

      if (checkError) throw new Error(checkError.message);
      if (existing && existing.length > 0) {
        throw new Error('An account with this email already exists. Please use a different email or login.');
      }

      // 2. Insert into users table
      const now = new Date().toISOString();
      const { data: insertedUsers, error: insertError } = await client
        .from('users')
        .insert([
          {
            firstname: firstName.trim(),
            lastname: lastName.trim(),
            emailid: email.trim().toLowerCase(),
            passw: password.trim(),
            phone: phone.trim(),
            rolle: userRole,
            isactive: true,
            createdat: now,
            modifiedat: now
          }
        ])
        .select();

      if (insertError) throw new Error(insertError.message);
      const newUser = insertedUsers[0];

      // 3. If Provider, initialize providerdetails entry
      if (userRole.toLowerCase() === 'provider') {
        await client.from('providerdetails').insert([
          {
            userid: newUser.userid,
            businessname: `${firstName}'s Shop`,
            businessaddress: 'Address pending update',
            businessphone: phone.trim(),
            openingtime: '09:00:00',
            closingtime: '19:00:00',
            avgservicetime: 30,
            perslotcapacity: 2,
            approvalstatus: false, // Pending admin approval as per REF
            createdat: now,
            modifiedat: now
          }
        ]);
      }

      this.setSession(newUser);
      return { success: true, user: newUser };
    },

    /**
     * Cookie Helpers for Session and Gov / Guest ID Booking
     */
    setCookie(name, value, days = 7) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    },

    getCookie(name) {
      const nameEQ = encodeURIComponent(name) + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length));
        }
      }
      return null;
    },

    deleteCookie(name) {
      document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    },

    /**
     * Store active session in both sessionStorage and persistent cookies
     */
    setSession(user) {
      sessionStorage.setItem('UserID', user.userid);
      sessionStorage.setItem('FirstName', user.firstname);
      sessionStorage.setItem('LastName', user.lastname || '');
      sessionStorage.setItem('Email', user.emailid);
      sessionStorage.setItem('Phone', user.phone || '');
      sessionStorage.setItem('Role', user.rolle);
      sessionStorage.setItem('IsActive', user.isactive ? 'true' : 'false');

      // Sync to Cookies for cross-tab persistence & ID-based booking
      this.setCookie('bwt_user_id', String(user.userid), 14);
      this.setCookie('bwt_first_name', user.firstname, 14);
      this.setCookie('bwt_last_name', user.lastname || '', 14);
      this.setCookie('bwt_email', user.emailid, 14);
      this.setCookie('bwt_phone', user.phone || '', 14);
      this.setCookie('bwt_role', user.rolle, 14);
      this.setCookie('bwt_active', user.isactive ? '1' : '0', 14);
    },

    /**
     * Save / Retrieve Government / National Identity ID in cookie
     */
    setGovId(govId) {
      if (govId) {
        this.setCookie('bwt_gov_id', govId.trim(), 30);
      } else {
        this.deleteCookie('bwt_gov_id');
      }
    },

    getGovId() {
      return this.getCookie('bwt_gov_id') || sessionStorage.getItem('GovID') || '';
    },

    /**
     * Get current logged-in user object (checks sessionStorage first, falls back to Cookie)
     */
    getCurrentUser() {
      let userId = sessionStorage.getItem('UserID') || this.getCookie('bwt_user_id');
      if (!userId) return null;

      const user = {
        userid: parseInt(userId, 10),
        firstname: sessionStorage.getItem('FirstName') || this.getCookie('bwt_first_name') || '',
        lastname: sessionStorage.getItem('LastName') || this.getCookie('bwt_last_name') || '',
        emailid: sessionStorage.getItem('Email') || this.getCookie('bwt_email') || '',
        phone: sessionStorage.getItem('Phone') || this.getCookie('bwt_phone') || '',
        rolle: sessionStorage.getItem('Role') || this.getCookie('bwt_role') || 'Customer',
        isactive: (sessionStorage.getItem('IsActive') || this.getCookie('bwt_active')) !== '0'
      };

      // Resync sessionStorage if restored from cookie
      if (!sessionStorage.getItem('UserID')) {
        this.setSession(user);
      }

      return user;
    },

    /**
     * Clear active session from both sessionStorage and Cookies
     */
    logout() {
      sessionStorage.clear();
      this.deleteCookie('bwt_user_id');
      this.deleteCookie('bwt_first_name');
      this.deleteCookie('bwt_last_name');
      this.deleteCookie('bwt_email');
      this.deleteCookie('bwt_phone');
      this.deleteCookie('bwt_role');
      this.deleteCookie('bwt_active');
      this.deleteCookie('bwt_gov_id');
      window.location.href = window.location.origin + '/login.html';
    },

    /**
     * Change user password
     */
    async changePassword(userId, oldPassword, newPassword) {
      if (!isDatabaseMode()) {
        if (window.AppConfig) {
          window.AppConfig.showToast('✨ Demo Mode: Password updated successfully.', 'success');
        }
        return { success: true, isDemo: true };
      }

      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      // Verify old password
      const { data, error } = await client
        .from('users')
        .select('userid')
        .eq('userid', userId)
        .eq('passw', oldPassword)
        .limit(1);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        throw new Error('Current password is incorrect.');
      }

      // Update password
      const { error: updateError } = await client
        .from('users')
        .update({
          passw: newPassword,
          modifiedat: new Date().toISOString()
        })
        .eq('userid', userId);

      if (updateError) throw new Error(updateError.message);
      return { success: true };
    },

    /**
     * Reset password via Forgot Password
     */
    async forgotPassword(email, newPassword) {
      if (!isDatabaseMode()) {
        if (window.AppConfig) {
          window.AppConfig.showToast(`✨ Demo Mode: Password reset link processed for ${email}`, 'success');
        }
        return { success: true, isDemo: true };
      }

      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('users')
        .select('userid')
        .ilike('emailid', email.trim())
        .limit(1);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        throw new Error('No account found with this email address.');
      }

      const { error: updateError } = await client
        .from('users')
        .update({
          passw: newPassword,
          modifiedat: new Date().toISOString()
        })
        .eq('userid', data[0].userid);

      if (updateError) throw new Error(updateError.message);
      return { success: true };
    }
  };
})();

