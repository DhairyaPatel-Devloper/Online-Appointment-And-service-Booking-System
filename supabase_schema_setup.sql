-- =====================================================================================================================
-- BOOKWITH.TECH / BOOKPORT SUPABASE (POSTGRESQL) SCHEMA SETUP SCRIPT
-- =====================================================================================================================
-- IMPORTANT:
-- This script DOES NOT alter or recreate the existing immutable tables:
--   users, providerdetails, providertimeslots, images, booking, feedback
--
-- It only sets up:
--   1. Row Level Security (RLS) policies allowing anon key access for all frontend operations
--   2. Postgres Stored Procedures / RPC Functions matching REF stored procedures (sp_Master, sp_ManageTimeSlots, sp_ManageImages, Analytics)
-- =====================================================================================================================

-- =====================================================================================================================
-- 1. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================================================

-- Enable RLS on all existing tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS providerdetails ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS providertimeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS booking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "anon_users_all" ON users;
DROP POLICY IF EXISTS "anon_providerdetails_all" ON providerdetails;
DROP POLICY IF EXISTS "anon_providertimeslots_all" ON providertimeslots;
DROP POLICY IF EXISTS "anon_images_all" ON images;
DROP POLICY IF EXISTS "anon_booking_all" ON booking;
DROP POLICY IF EXISTS "anon_feedback_all" ON feedback;

-- Create open policies for anon & authenticated roles so client-side frontend operations function seamlessly
CREATE POLICY "anon_users_all" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_providerdetails_all" ON providerdetails FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_providertimeslots_all" ON providertimeslots FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_images_all" ON images FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_booking_all" ON booking FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_feedback_all" ON feedback FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- =====================================================================================================================
-- 2. STORED PROCEDURES / RPC FUNCTIONS EQUIVALENTS
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- RPC 1: User Login (Equivalent to sp_Master @Table='Users', @Action='Login')
-- ---------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_master_user_login(
    p_email text,
    p_password text,
    p_role text
)
RETURNS TABLE (
    userid integer,
    firstname text,
    lastname text,
    emailid text,
    phone text,
    rolle text,
    isactive boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.userid,
        u.firstname::text,
        u.lastname::text,
        u.emailid::text,
        u.phone::text,
        u.rolle::text,
        u.isactive
    FROM users u
    WHERE LOWER(u.emailid) = LOWER(p_email)
      AND u.passw = p_password
      AND LOWER(u.rolle) = LOWER(p_role)
      AND u.isactive = true
    LIMIT 1;
END;
$$;


-- ---------------------------------------------------------------------------------------------------------------------
-- RPC 2: User Register (Equivalent to sp_Master @Table='Users', @Action='Insert')
-- ---------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_master_user_register(
    p_firstname text,
    p_lastname text,
    p_email text,
    p_password text,
    p_phone text,
    p_role text
)
RETURNS TABLE (
    userid integer,
    firstname text,
    lastname text,
    emailid text,
    rolle text,
    message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id integer;
    v_count integer;
BEGIN
    -- Check duplicate email
    SELECT COUNT(*) INTO v_count FROM users WHERE LOWER(emailid) = LOWER(p_email);
    IF v_count > 0 THEN
        RETURN QUERY SELECT NULL::integer, NULL::text, NULL::text, NULL::text, NULL::text, 'Email already registered'::text;
        RETURN;
    END IF;

    -- Insert user
    INSERT INTO users (firstname, lastname, emailid, passw, phone, rolle, isactive, createdat, modifiedat)
    VALUES (p_firstname, p_lastname, p_email, p_password, p_phone, p_role, true, NOW(), NOW())
    RETURNING users.userid INTO v_user_id;

    -- If registering as provider, create initial providerdetails record
    IF LOWER(p_role) = 'provider' THEN
        INSERT INTO providerdetails (
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
            modifiedat
        )
        VALUES (
            v_user_id,
            p_firstname || '''s Service Shop',
            'Business Address, Sector 1',
            p_phone,
            '09:00:00'::time,
            '19:00:00'::time,
            30,
            2,
            false, -- Needs Admin approval as per REF
            NOW(),
            NOW()
        );
    END IF;

    RETURN QUERY
    SELECT 
        u.userid,
        u.firstname::text,
        u.lastname::text,
        u.emailid::text,
        u.rolle::text,
        'Registration successful'::text
    FROM users u
    WHERE u.userid = v_user_id;
END;
$$;


-- ---------------------------------------------------------------------------------------------------------------------
-- RPC 3: Manage Time Slots (Equivalent to sp_ManageTimeSlots)
-- ---------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_manage_timeslots(
    p_action text,
    p_providerid integer DEFAULT NULL,
    p_slotdate date DEFAULT NULL,
    p_slotstarttime time DEFAULT NULL,
    p_slotendtime time DEFAULT NULL,
    p_slotcapacity integer DEFAULT NULL,
    p_slotstatus text DEFAULT NULL,
    p_slotid integer DEFAULT NULL
)
RETURNS TABLE (
    slotid integer,
    providerid integer,
    slotdate date,
    slotstarttime time,
    slotendtime time,
    slotcapacity integer,
    slotstatus text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_action = 'GetByDateAndProvider' THEN
        RETURN QUERY
        SELECT 
            pts.slotid,
            pts.providerid,
            pts.slotdate,
            pts.slotstarttime,
            pts.slotendtime,
            pts.slotcapacity,
            pts.slotstatus::text
        FROM providertimeslots pts
        WHERE pts.providerid = p_providerid 
          AND pts.slotdate = p_slotdate
        ORDER BY pts.slotstarttime ASC;

    ELSIF p_action = 'InsertOrUpdate' THEN
        IF EXISTS (
            SELECT 1 FROM providertimeslots 
            WHERE providertimeslots.providerid = p_providerid 
              AND providertimeslots.slotdate = p_slotdate 
              AND providertimeslots.slotstarttime = p_slotstarttime
        ) THEN
            UPDATE providertimeslots
            SET slotstatus = p_slotstatus, 
                slotcapacity = COALESCE(p_slotcapacity, providertimeslots.slotcapacity),
                slotendtime = COALESCE(p_slotendtime, providertimeslots.slotendtime)
            WHERE providertimeslots.providerid = p_providerid 
              AND providertimeslots.slotdate = p_slotdate 
              AND providertimeslots.slotstarttime = p_slotstarttime;
        ELSE
            INSERT INTO providertimeslots (providerid, slotdate, slotstarttime, slotendtime, slotcapacity, slotstatus)
            VALUES (p_providerid, p_slotdate, p_slotstarttime, p_slotendtime, COALESCE(p_slotcapacity, 2), COALESCE(p_slotstatus, 'Available'));
        END IF;

        RETURN QUERY
        SELECT 
            pts.slotid,
            pts.providerid,
            pts.slotdate,
            pts.slotstarttime,
            pts.slotendtime,
            pts.slotcapacity,
            pts.slotstatus::text
        FROM providertimeslots pts
        WHERE pts.providerid = p_providerid 
          AND pts.slotdate = p_slotdate 
          AND pts.slotstarttime = p_slotstarttime;

    ELSIF p_action = 'UpdateStatus' THEN
        UPDATE providertimeslots 
        SET slotstatus = p_slotstatus 
        WHERE providertimeslots.slotid = p_slotid;

        RETURN QUERY
        SELECT 
            pts.slotid,
            pts.providerid,
            pts.slotdate,
            pts.slotstarttime,
            pts.slotendtime,
            pts.slotcapacity,
            pts.slotstatus::text
        FROM providertimeslots pts
        WHERE pts.slotid = p_slotid;

    ELSIF p_action = 'MarkDayUnavailable' THEN
        UPDATE providertimeslots 
        SET slotstatus = 'Unavailable' 
        WHERE providertimeslots.providerid = p_providerid AND providertimeslots.slotdate = p_slotdate;

        RETURN QUERY
        SELECT 
            pts.slotid,
            pts.providerid,
            pts.slotdate,
            pts.slotstarttime,
            pts.slotendtime,
            pts.slotcapacity,
            pts.slotstatus::text
        FROM providertimeslots pts
        WHERE pts.providerid = p_providerid AND pts.slotdate = p_slotdate;

    ELSIF p_action = 'MarkDayAvailable' THEN
        UPDATE providertimeslots 
        SET slotstatus = 'Available' 
        WHERE providertimeslots.providerid = p_providerid AND providertimeslots.slotdate = p_slotdate;

        RETURN QUERY
        SELECT 
            pts.slotid,
            pts.providerid,
            pts.slotdate,
            pts.slotstarttime,
            pts.slotendtime,
            pts.slotcapacity,
            pts.slotstatus::text
        FROM providertimeslots pts
        WHERE pts.providerid = p_providerid AND pts.slotdate = p_slotdate;
    END IF;
END;
$$;


-- ---------------------------------------------------------------------------------------------------------------------
-- RPC 4: Generate Day Slots Generator
-- ---------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_generate_provider_slots(
    p_providerid integer,
    p_slotdate date,
    p_starttime time,
    p_endtime time,
    p_avgservicetime integer,
    p_capacity integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_curr_start time := p_starttime;
    v_curr_end time;
    v_slots_created integer := 0;
    v_step interval := (p_avgservicetime || ' minutes')::interval;
BEGIN
    WHILE (v_curr_start + v_step) <= p_endtime LOOP
        v_curr_end := v_curr_start + v_step;

        -- Insert or ignore if exists
        IF NOT EXISTS (
            SELECT 1 FROM providertimeslots
            WHERE providerid = p_providerid
              AND slotdate = p_slotdate
              AND slotstarttime = v_curr_start
        ) THEN
            INSERT INTO providertimeslots (providerid, slotdate, slotstarttime, slotendtime, slotcapacity, slotstatus)
            VALUES (p_providerid, p_slotdate, v_curr_start, v_curr_end, p_capacity, 'Available');
            v_slots_created := v_slots_created + 1;
        END IF;

        v_curr_start := v_curr_end;
    END LOOP;

    RETURN v_slots_created;
END;
$$;


-- ---------------------------------------------------------------------------------------------------------------------
-- RPC 5: Manage Images (Equivalent to sp_ManageImages)
-- ---------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_manage_images(
    p_action text,
    p_imageid integer DEFAULT NULL,
    p_providerid integer DEFAULT NULL,
    p_imagesource text DEFAULT NULL
)
RETURNS TABLE (
    imageid integer,
    providerid integer,
    imagesource text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_action = 'Insert' THEN
        RETURN QUERY
        INSERT INTO images (providerid, imagesource)
        VALUES (p_providerid, p_imagesource)
        RETURNING images.imageid, images.providerid, images.imagesource::text;

    ELSIF p_action = 'Delete' THEN
        DELETE FROM images WHERE images.imageid = p_imageid;
        RETURN;

    ELSIF p_action = 'DeleteByProvider' THEN
        DELETE FROM images WHERE images.providerid = p_providerid;
        RETURN;

    ELSIF p_action = 'GetByProvider' THEN
        RETURN QUERY
        SELECT img.imageid, img.providerid, img.imagesource::text
        FROM images img
        WHERE img.providerid = p_providerid
        ORDER BY img.imageid DESC;

    ELSIF p_action = 'GetBanner' THEN
        RETURN QUERY
        SELECT img.imageid, img.providerid, img.imagesource::text
        FROM images img
        WHERE img.providerid = p_providerid
        ORDER BY img.imageid ASC
        LIMIT 1;
    END IF;
END;
$$;


-- ---------------------------------------------------------------------------------------------------------------------
-- RPC 6: Admin Dashboard Aggregated Statistics (Equivalent to AdminDashboard.aspx.cs LoadDashboardStats)
-- ---------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_get_admin_dashboard_stats()
RETURNS TABLE (
    total_providers bigint,
    total_customers bigint,
    today_bookings bigint,
    monthly_bookings bigint,
    cancelled_bookings bigint,
    pending_requests bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM providerdetails WHERE approvalstatus = true) AS total_providers,
        (SELECT COUNT(*) FROM users WHERE isactive = true AND LOWER(rolle) = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM booking WHERE DATE(bookingdate) = CURRENT_DATE) AS today_bookings,
        (SELECT COUNT(*) FROM booking WHERE EXTRACT(MONTH FROM bookingdate) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM bookingdate) = EXTRACT(YEAR FROM CURRENT_DATE)) AS monthly_bookings,
        (SELECT COUNT(*) FROM booking WHERE LOWER(bookingstatus) = 'cancelled' AND EXTRACT(MONTH FROM bookingdate) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM bookingdate) = EXTRACT(YEAR FROM CURRENT_DATE)) AS cancelled_bookings,
        (SELECT COUNT(*) FROM providerdetails WHERE approvalstatus = false) AS pending_requests;
END;
$$;


-- ---------------------------------------------------------------------------------------------------------------------
-- RPC 7: Provider Dashboard Aggregated Statistics (Equivalent to ProviderDashbord.aspx.cs)
-- ---------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_get_provider_dashboard_stats(p_providerid integer)
RETURNS TABLE (
    today_appointments bigint,
    total_revenue bigint,
    upcoming_bookings bigint,
    avg_rating numeric,
    total_reviews bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM booking WHERE providerid = p_providerid AND DATE(bookingdate) = CURRENT_DATE) AS today_appointments,
        (SELECT COALESCE(SUM(amount), 0)::bigint FROM booking WHERE providerid = p_providerid AND LOWER(bookingstatus) IN ('confirmed', 'completed')) AS total_revenue,
        (SELECT COUNT(*) FROM booking WHERE providerid = p_providerid AND LOWER(bookingstatus) = 'confirmed' AND bookingdate >= CURRENT_DATE) AS upcoming_bookings,
        (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 5.0) FROM feedback WHERE providerid = p_providerid) AS avg_rating,
        (SELECT COUNT(*) FROM feedback WHERE providerid = p_providerid) AS total_reviews;
END;
$$;

