package com.bookwithtech.dao;

import com.bookwithtech.model.Feedback;
import com.bookwithtech.util.DBConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class FeedbackDAOImpl implements FeedbackDAO {

    private static final Logger log = LoggerFactory.getLogger(FeedbackDAOImpl.class);

    private static final String COLS =
        "feedbackid, bookingid, customerid, providerid, rating, comment, createdat, modifiedat";

    private static final String SQL_INSERT =
        "INSERT INTO feedback (bookingid, customerid, providerid, rating, comment, createdat, modifiedat) "
        + "VALUES (?, ?, ?, ?, ?, NOW(), NOW()) RETURNING feedbackid";

    private static final String SQL_FIND_BY_ID =
        "SELECT " + COLS + " FROM feedback WHERE feedbackid = ?";

    private static final String SQL_FIND_BY_BOOKING =
        "SELECT " + COLS + " FROM feedback WHERE bookingid = ?";

    private static final String SQL_FIND_BY_PROVIDER =
        "SELECT " + COLS + " FROM feedback WHERE providerid = ? ORDER BY createdat DESC";

    private static final String SQL_FIND_BY_CUSTOMER =
        "SELECT " + COLS + " FROM feedback WHERE customerid = ? ORDER BY createdat DESC";

    private static final String SQL_AVG_RATING =
        "SELECT COALESCE(AVG(rating), 0.0) AS avgrating FROM feedback WHERE providerid = ?";

    private static final String SQL_DELETE =
        "DELETE FROM feedback WHERE feedbackid = ?";

    @Override
    public int create(Feedback feedback) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_INSERT)) {

            ps.setInt(1, feedback.getBookingId());
            ps.setInt(2, feedback.getCustomerId());
            ps.setInt(3, feedback.getProviderId());
            ps.setInt(4, feedback.getRating());
            ps.setString(5, feedback.getComment());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int newId = rs.getInt("feedbackid");
                    log.info("Created feedback id={}", newId);
                    return newId;
                }
                throw new SQLException("Feedback insert returned no generated key.");
            }
        }
    }

    @Override
    public Optional<Feedback> findById(int feedbackId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_ID)) {

            ps.setInt(1, feedbackId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Optional<Feedback> findByBookingId(int bookingId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_BOOKING)) {

            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public List<Feedback> findByProvider(int providerId) throws SQLException {
        List<Feedback> list = new ArrayList<>();
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
    public List<Feedback> findByCustomer(int customerId) throws SQLException {
        List<Feedback> list = new ArrayList<>();
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
    public double getAverageRatingForProvider(int providerId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_AVG_RATING)) {

            ps.setInt(1, providerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getDouble("avgrating");
                return 0.0;
            }
        }
    }

    @Override
    public int delete(int feedbackId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_DELETE)) {

            ps.setInt(1, feedbackId);
            return ps.executeUpdate();
        }
    }

    private Feedback mapRow(ResultSet rs) throws SQLException {
        Feedback f = new Feedback();
        f.setFeedbackId(rs.getInt("feedbackid"));
        f.setBookingId(rs.getInt("bookingid"));
        f.setCustomerId(rs.getInt("customerid"));
        f.setProviderId(rs.getInt("providerid"));
        f.setRating(rs.getInt("rating"));
        f.setComment(rs.getString("comment"));
        Timestamp ca = rs.getTimestamp("createdat");
        Timestamp ma = rs.getTimestamp("modifiedat");
        f.setCreatedAt(ca != null ? ca.toLocalDateTime() : null);
        f.setModifiedAt(ma != null ? ma.toLocalDateTime() : null);
        return f;
    }
}
