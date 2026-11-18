package com.bookwithtech.dao;

import com.bookwithtech.model.ProviderTimeSlot;
import com.bookwithtech.util.DBConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ProviderTimeSlotDAOImpl implements ProviderTimeSlotDAO {

    private static final Logger log = LoggerFactory.getLogger(ProviderTimeSlotDAOImpl.class);

    private static final String COLS =
        "slotid, providerid, slotdate, slotstarttime, slotendtime, slotcapacity, slotstatus";

    private static final String SQL_INSERT =
        "INSERT INTO providertimeslots (providerid, slotdate, slotstarttime, slotendtime, slotcapacity, slotstatus) "
        + "VALUES (?, ?, ?, ?, ?, ?) RETURNING slotid";

    private static final String SQL_FIND_BY_ID =
        "SELECT " + COLS + " FROM providertimeslots WHERE slotid = ?";

    private static final String SQL_FIND_BY_PROVIDER =
        "SELECT " + COLS + " FROM providertimeslots WHERE providerid = ? ORDER BY slotdate, slotstarttime";

    private static final String SQL_FIND_BY_PROVIDER_DATE =
        "SELECT " + COLS + " FROM providertimeslots WHERE providerid = ? AND slotdate = ? "
        + "ORDER BY slotstarttime";

    private static final String SQL_FIND_AVAILABLE_BY_PROVIDER_DATE =
        "SELECT " + COLS + " FROM providertimeslots "
        + "WHERE providerid = ? AND slotdate = ? AND slotstatus = TRUE "
        + "ORDER BY slotstarttime";

    private static final String SQL_UPDATE =
        "UPDATE providertimeslots SET slotdate=?, slotstarttime=?, slotendtime=?, "
        + "slotcapacity=?, slotstatus=? WHERE slotid=?";

    private static final String SQL_SET_STATUS =
        "UPDATE providertimeslots SET slotstatus=? WHERE slotid=?";

    private static final String SQL_DELETE =
        "DELETE FROM providertimeslots WHERE slotid=?";

    @Override
    public int create(ProviderTimeSlot slot) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_INSERT)) {

            ps.setInt(1, slot.getProviderId());
            ps.setDate(2, Date.valueOf(slot.getSlotDate()));
            ps.setTime(3, Time.valueOf(slot.getSlotStartTime()));
            ps.setTime(4, Time.valueOf(slot.getSlotEndTime()));
            ps.setInt(5, slot.getSlotCapacity());
            ps.setBoolean(6, slot.isSlotStatus());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("slotid");
                throw new SQLException("TimeSlot insert returned no generated key.");
            }
        }
    }

    @Override
    public Optional<ProviderTimeSlot> findById(int slotId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_ID)) {

            ps.setInt(1, slotId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public List<ProviderTimeSlot> findByProvider(int providerId) throws SQLException {
        List<ProviderTimeSlot> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_PROVIDER)) {

            ps.setInt(1, providerId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public List<ProviderTimeSlot> findByProviderAndDate(int providerId, LocalDate date) throws SQLException {
        List<ProviderTimeSlot> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_PROVIDER_DATE)) {

            ps.setInt(1, providerId);
            ps.setDate(2, Date.valueOf(date));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public List<ProviderTimeSlot> findAvailableByProviderAndDate(int providerId, LocalDate date) throws SQLException {
        List<ProviderTimeSlot> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_AVAILABLE_BY_PROVIDER_DATE)) {

            ps.setInt(1, providerId);
            ps.setDate(2, Date.valueOf(date));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public int update(ProviderTimeSlot slot) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_UPDATE)) {

            ps.setDate(1, Date.valueOf(slot.getSlotDate()));
            ps.setTime(2, Time.valueOf(slot.getSlotStartTime()));
            ps.setTime(3, Time.valueOf(slot.getSlotEndTime()));
            ps.setInt(4, slot.getSlotCapacity());
            ps.setBoolean(5, slot.isSlotStatus());
            ps.setInt(6, slot.getSlotId());
            return ps.executeUpdate();
        }
    }

    @Override
    public int setSlotStatus(int slotId, boolean status) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_SET_STATUS)) {

            ps.setBoolean(1, status);
            ps.setInt(2, slotId);
            return ps.executeUpdate();
        }
    }

    @Override
    public int delete(int slotId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_DELETE)) {

            ps.setInt(1, slotId);
            return ps.executeUpdate();
        }
    }

    private ProviderTimeSlot mapRow(ResultSet rs) throws SQLException {
        ProviderTimeSlot s = new ProviderTimeSlot();
        s.setSlotId(rs.getInt("slotid"));
        s.setProviderId(rs.getInt("providerid"));
        Date d = rs.getDate("slotdate");
        s.setSlotDate(d != null ? d.toLocalDate() : null);
        Time st = rs.getTime("slotstarttime");
        Time et = rs.getTime("slotendtime");
        s.setSlotStartTime(st != null ? st.toLocalTime() : null);
        s.setSlotEndTime(et != null ? et.toLocalTime() : null);
        s.setSlotCapacity(rs.getInt("slotcapacity"));
        s.setSlotStatus(rs.getBoolean("slotstatus"));
        return s;
    }
}
