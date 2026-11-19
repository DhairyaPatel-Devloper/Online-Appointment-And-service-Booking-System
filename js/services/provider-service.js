/**
 * PROVIDER SERVICE
 * Manages provider business details, shop listings, approval requests, images, and ratings matching REF logic.
 */

window.ProviderService = (function () {
  'use strict';

  function getClient() {
    return window.SupabaseClient ? window.SupabaseClient.client : window.db;
  }

  const DEFAULT_BANNERS = {
    salon: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80',
    spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
    dental: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=700&q=80',
    skin: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=700&q=80',
    barber: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=700&q=80',
    default: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80'
  };

  function resolveBannerImage(imgSrc, businessName = '') {
    if (imgSrc && (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'))) {
      return imgSrc;
    }
    const name = ((imgSrc || '') + ' ' + (businessName || '')).toLowerCase();
    if (name.includes('dental') || name.includes('tooth') || name.includes('apex') || name.includes('clinic')) {
      return DEFAULT_BANNERS.dental;
    }
    if (name.includes('spa') || name.includes('massage') || name.includes('serene')) {
      return DEFAULT_BANNERS.spa;
    }
    if (name.includes('derma') || name.includes('skin') || name.includes('glow')) {
      return DEFAULT_BANNERS.skin;
    }
    if (name.includes('barber') || name.includes('hair') || name.includes('cut') || name.includes('elite')) {
      return DEFAULT_BANNERS.barber;
    }
    if (name.includes('salon') || name.includes('aura') || name.includes('beauty')) {
      return DEFAULT_BANNERS.salon;
    }
    return DEFAULT_BANNERS.default;
  }

  return {
    /**
     * Get all approved providers for customer browsing with joined user info, images, and rating aggregates
     */
    async getApprovedProviders({ search } = {}) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      // Fetch approved provider details
      const { data: providers, error } = await client
        .from('providerdetails')
        .select(`
          providerid,
          userid,
          businessname,
          businessaddress,
          businessphone,
          openingtime,
          closingtime,
          avgservicetime,
          perslotcapacity,
          approvalstatus,
          users:userid (
            firstname,
            lastname,
            emailid,
            phone,
            isactive
          )
        `)
        .eq('approvalstatus', true)
        .order('providerid', { ascending: false });

      if (error) throw new Error(error.message);
      if (!providers) return [];

      // Fetch images and feedback to enrich provider cards
      const providerIds = providers.map(p => p.providerid);

      let imagesByProvider = {};
      let feedbackByProvider = {};

      if (providerIds.length > 0) {
        const { data: images } = await client
          .from('images')
          .select('imageid, providerid, imagesource')
          .in('providerid', providerIds);

        if (images) {
          images.forEach(img => {
            if (!imagesByProvider[img.providerid]) imagesByProvider[img.providerid] = [];
            imagesByProvider[img.providerid].push(img);
          });
        }

        const { data: feedbacks } = await client
          .from('feedback')
          .select('providerid, rating')
          .in('providerid', providerIds);

        if (feedbacks) {
          feedbacks.forEach(fb => {
            if (!feedbackByProvider[fb.providerid]) feedbackByProvider[fb.providerid] = [];
            feedbackByProvider[fb.providerid].push(fb.rating);
          });
        }
      }

      const enriched = providers.map(p => {
        const ratings = feedbackByProvider[p.providerid] || [];
        const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 5.0;
        const pImages = (imagesByProvider[p.providerid] || []).map(img => ({
          ...img,
          imagesource: resolveBannerImage(img.imagesource, p.businessname)
        }));
        const rawSource = pImages.length > 0 ? pImages[0].imagesource : null;
        const bannerImage = resolveBannerImage(rawSource, p.businessname);

        return {
          id: p.providerid,
          providerId: p.providerid,
          userId: p.userid,
          name: p.businessname,
          businessName: p.businessname,
          address: p.businessaddress,
          phone: p.businessphone,
          openingTime: p.openingtime,
          closingTime: p.closingtime,
          avgServiceTime: p.avgservicetime,
          perSlotCapacity: p.perslotcapacity,
          rating: parseFloat(avgRating),
          reviewsCount: ratings.length,
          image: bannerImage,
          images: pImages,
          owner: p.users ? `${p.users.firstname} ${p.users.lastname || ''}`.trim() : 'Verified Provider'
        };
      });

      if (search && search.trim()) {
        const s = search.toLowerCase().trim();
        return enriched.filter(p =>
          (p.businessName && p.businessName.toLowerCase().includes(s)) ||
          (p.address && p.address.toLowerCase().includes(s)) ||
          (p.owner && p.owner.toLowerCase().includes(s))
        );
      }

      return enriched;
    },

    /**
     * Get pending provider registration requests for Admin approval
     */
    async getPendingProviders() {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('providerdetails')
        .select(`
          providerid,
          userid,
          businessname,
          businessaddress,
          businessphone,
          openingtime,
          closingtime,
          avgservicetime,
          perslotcapacity,
          approvalstatus,
          createdat,
          users:userid (
            firstname,
            lastname,
            emailid,
            phone
          )
        `)
        .eq('approvalstatus', false)
        .order('providerid', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },

    /**
     * Get single provider details by provider ID
     */
    async getProviderById(providerId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('providerdetails')
        .select(`
          providerid,
          userid,
          businessname,
          businessaddress,
          businessphone,
          openingtime,
          closingtime,
          avgservicetime,
          perslotcapacity,
          approvalstatus,
          createdat,
          users:userid (
            firstname,
            lastname,
            emailid,
            phone
          )
        `)
        .eq('providerid', providerId)
        .limit(1);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) return null;

      const provider = data[0];

      // Get images
      const { data: images } = await client
        .from('images')
        .select('imageid, imagesource')
        .eq('providerid', providerId);

      // Get feedback / reviews
      const { data: feedback } = await client
        .from('feedback')
        .select(`
          feedbackid,
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

      const ratings = (feedback || []).map(f => f.rating);
      const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 5.0;

      const resolvedImages = (images || []).map(img => ({
        ...img,
        imagesource: resolveBannerImage(img.imagesource, provider.businessname)
      }));
      const banner = resolvedImages.length > 0 ? resolvedImages[0].imagesource : resolveBannerImage(null, provider.businessname);

      return {
        ...provider,
        id: provider.providerid,
        name: provider.businessname,
        image: banner,
        images: resolvedImages,
        feedback: feedback || [],
        rating: parseFloat(avgRating),
        reviewsCount: (feedback || []).length
      };
    },

    /**
     * Get provider by owner User ID (for provider console session)
     */
    async getProviderByUserId(userId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('providerdetails')
        .select('*')
        .eq('userid', userId)
        .limit(1);

      if (error) throw new Error(error.message);
      return (data && data[0]) || null;
    },

    /**
     * Update provider business details matching REF ProviderShopProfile.aspx.cs
     */
    async updateProviderProfile(providerId, profileData) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const updatePayload = {
        modifiedat: new Date().toISOString()
      };
      if (profileData.businessname !== undefined) updatePayload.businessname = profileData.businessname.trim();
      if (profileData.businessaddress !== undefined) updatePayload.businessaddress = profileData.businessaddress.trim();
      if (profileData.businessphone !== undefined) updatePayload.businessphone = profileData.businessphone.trim();
      if (profileData.openingtime !== undefined) updatePayload.openingtime = profileData.openingtime;
      if (profileData.closingtime !== undefined) updatePayload.closingtime = profileData.closingtime;
      if (profileData.avgservicetime !== undefined) updatePayload.avgservicetime = parseInt(profileData.avgservicetime, 10);
      if (profileData.perslotcapacity !== undefined) updatePayload.perslotcapacity = parseInt(profileData.perslotcapacity, 10);

      const { data, error } = await client
        .from('providerdetails')
        .update(updatePayload)
        .eq('providerid', providerId)
        .select();

      if (error) throw new Error(error.message);
      return (data && data[0]) || null;
    },

    /**
     * Approve or reject provider registration request
     */
    async setApprovalStatus(providerId, approvalStatus) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('providerdetails')
        .update({
          approvalstatus: approvalStatus,
          modifiedat: new Date().toISOString()
        })
        .eq('providerid', providerId)
        .select();

      if (error) throw new Error(error.message);
      return (data && data[0]) || null;
    },

    /**
     * Add provider gallery/banner image
     */
    async addImage(providerId, imageSource) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { data, error } = await client
        .from('images')
        .insert([
          {
            providerid: providerId,
            imagesource: imageSource.trim()
          }
        ])
        .select();

      if (error) throw new Error(error.message);
      return (data && data[0]) || null;
    },

    /**
     * Delete provider image
     */
    async deleteImage(imageId) {
      const client = getClient();
      if (!client) throw new Error('Supabase client not initialized');

      const { error } = await client
        .from('images')
        .delete()
        .eq('imageid', imageId);

      if (error) throw new Error(error.message);
      return true;
    }
  };
})();

