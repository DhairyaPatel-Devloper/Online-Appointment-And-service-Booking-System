package com.bookwithtech.dao;

import com.bookwithtech.model.Booking;
import com.bookwithtech.util.DBConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class BookingDAOImpl implements BookingDAO {

    private static final Logger log = LoggerFactory.getLogger(BookingDAOImpl.class);

    private static final String COLS =
        "bookingid, customerid, providerid, slotid, bookingdate, bookingstatus, amount, createdat, modifiedat";

    private static final String SQL_INSERT =
        "INSERT INTO booking (customerid, providerid, slotid, bookingdate, bookingstatus, amount, createdat, modifiedat) "
        + "VALUES (?, ?, ?, NOW(), ?, ?, NOW(), NOW()) RETURNING bookingid";

    private static final String SQL_FIND_BY_ID =
        "SELECT " + COLS + " FROM booking WHERE bookingid = ?";

    private static final String SQL_FIND_BY_CUSTOMER =
        "SELECT " + COLS + " FROM booking WHERE customerid = ? ORDER BY bookingdate DESC";

    private static final String SQL_FIND_BY_PROVIDER =
        "SELECT " + COLS + " FROM booking WHERE providerid = ? ORDER BY bookingdate DESC";

    private static final String SQL_FIND_BY_STATUS =
        "SELECT " + COLS + " FROM booking WHERE bookingstatus = ? ORDER BY bookingdate DESC";

    private static final String SQL_FIND_ALL =
        "SELECT " + COLS + " FROM booking ORDER BY bookingdate DESC";

    private static final String SQL_UPDATE_STATUS =
        "UPDATE booking SET bookingstatus=?, modifiedat=NOW() WHERE bookingid=?";

    private static final String SQL_DELETE =
        "DELETE FROM booking WHERE bookingid=?";

    @Override
    public int create(Booking booking) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_INSERT)) {

            ps.setInt(1, booking.getCustomerId());
            ps.setInt(2, booking.getProviderId());
            ps.setInt(3, booking.getSlotId());
            ps.setString(4, booking.getBookingStatus());
            ps.setLong(5, booking.getAmount());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int newId = rs.getInt("bookingid");
                    log.info("Created booking id={}", newId);
                    return newId;
                }
                throw new SQLException("Booking insert returned no generated key.");
            }
        }
    }

    @Override
    public Optional<Booking> findById(int bookingId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_ID)) {

            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public List<Booking> findByCustomer(int customerId) throws SQLException {
        List<Booking> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_CUSTOMER)) {

            ps.setInt(1, customerId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public List<Booking> findByProvider(int providerId) throws SQLException {
        List<Booking> list = new ArrayList<>();
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
    public List<Booking> findByStatus(String status) throws SQLException {
        List<Booking> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_STATUS)) {

            ps.setString(1, status);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public List<Booking> findAll() throws SQLException {
        List<Booking> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_ALL);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    @Override
    public int updateStatus(int bookingId, String status) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_UPDATE_STATUS)) {

            ps.setString(1, status);
            ps.setInt(2, bookingId);
            return ps.executeUpdate();
        }
    }

    @Override
    public int delete(int bookingId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_DELETE)) {

            ps.setInt(1, bookingId);
            return ps.executeUpdate();
        }
    }

    private Booking mapRow(ResultSet rs) throws SQLException {
        Booking b = new Booking();
        b.setBookingId(rs.getInt("bookingid"));
        b.setCustomerId(rs.getInt("customerid"));
        b.setProviderId(rs.getInt("providerid"));
        b.setSlotId(rs.getInt("slotid"));
        Timestamp bd = rs.getTimestamp("bookingdate");
        b.setBookingDate(bd != null ? bd.toLocalDateTime() : null);
        b.setBookingStatus(rs.getString("bookingstatus"));
        b.setAmount(rs.getLong("amount"));
        Timestamp ca = rs.getTimestamp("createdat");
        Timestamp ma = rs.getTimestamp("modifiedat");
        b.setCreatedAt(ca != null ? ca.toLocalDateTime() : null);
        b.setModifiedAt(ma != null ? ma.toLocalDateTime() : null);
        return b;
    }
}
