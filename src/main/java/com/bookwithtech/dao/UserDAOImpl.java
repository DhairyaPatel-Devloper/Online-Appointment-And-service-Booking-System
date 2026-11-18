package com.bookwithtech.dao;

import com.bookwithtech.model.User;
import com.bookwithtech.util.DBConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * JDBC implementation of UserDAO.
 * ONLY this class is allowed to contain Connection/PreparedStatement/ResultSet code
 * for the "users" table.
 *
 * Rules enforced:
 *  - PreparedStatement everywhere (no string concatenation)
 *  - try-with-resources for all JDBC objects
 *  - Meaningful SQLException propagation — never silent swallowing
 */
public class UserDAOImpl implements UserDAO {

    private static final Logger log = LoggerFactory.getLogger(UserDAOImpl.class);

    // ── SQL ────────────────────────────────────────────────────────────────

    private static final String SQL_INSERT =
        "INSERT INTO users (firstname, lastname, emailid, passw, phone, rolle, isactive, createdat, modifiedat) "
        + "VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING userid";

    private static final String SQL_FIND_BY_ID =
        "SELECT userid, firstname, lastname, emailid, passw, phone, rolle, isactive, createdat, modifiedat "
        + "FROM users WHERE userid = ?";

    private static final String SQL_FIND_BY_EMAIL =
        "SELECT userid, firstname, lastname, emailid, passw, phone, rolle, isactive, createdat, modifiedat "
        + "FROM users WHERE emailid = ?";

    private static final String SQL_FIND_ALL =
        "SELECT userid, firstname, lastname, emailid, passw, phone, rolle, isactive, createdat, modifiedat "
        + "FROM users ORDER BY userid";

    private static final String SQL_FIND_BY_ROLE =
        "SELECT userid, firstname, lastname, emailid, passw, phone, rolle, isactive, createdat, modifiedat "
        + "FROM users WHERE rolle = ? ORDER BY userid";

    private static final String SQL_UPDATE =
        "UPDATE users SET firstname=?, lastname=?, emailid=?, phone=?, rolle=?, isactive=?, modifiedat=NOW() "
        + "WHERE userid=?";

    private static final String SQL_SET_ACTIVE =
        "UPDATE users SET isactive=?, modifiedat=NOW() WHERE userid=?";

    private static final String SQL_DELETE =
        "DELETE FROM users WHERE userid=?";

    private static final String SQL_EXISTS_BY_EMAIL =
        "SELECT 1 FROM users WHERE emailid=?";

    // ── CRUD ───────────────────────────────────────────────────────────────

    @Override
    public int create(User user) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_INSERT)) {

            ps.setString(1, user.getFirstName());
            ps.setString(2, user.getLastName());
            ps.setString(3, user.getEmailId());
            ps.setString(4, user.getPassw());
            ps.setString(5, user.getPhone());
            ps.setString(6, user.getRolle());
            ps.setBoolean(7, user.isActive());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int newId = rs.getInt("userid");
                    log.info("Created user id={}", newId);
                    return newId;
                }
                throw new SQLException("User insert returned no generated key.");
            }
        }
    }

    @Override
    public Optional<User> findById(int userId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_ID)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Optional<User> findByEmail(String emailId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_EMAIL)) {

            ps.setString(1, emailId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public List<User> findAll() throws SQLException {
        List<User> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_ALL);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    @Override
    public List<User> findByRole(String rolle) throws SQLException {
        List<User> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_ROLE)) {

            ps.setString(1, rolle);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public int update(User user) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_UPDATE)) {

            ps.setString(1, user.getFirstName());
            ps.setString(2, user.getLastName());
            ps.setString(3, user.getEmailId());
            ps.setString(4, user.getPhone());
            ps.setString(5, user.getRolle());
            ps.setBoolean(6, user.isActive());
            ps.setInt(7, user.getUserId());

            int rows = ps.executeUpdate();
            log.info("Updated user id={}, rows={}", user.getUserId(), rows);
            return rows;
        }
    }

    @Override
    public int setActive(int userId, boolean active) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_SET_ACTIVE)) {

            ps.setBoolean(1, active);
            ps.setInt(2, userId);
            return ps.executeUpdate();
        }
    }

    @Override
    public int delete(int userId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_DELETE)) {

            ps.setInt(1, userId);
            int rows = ps.executeUpdate();
            log.warn("Hard-deleted user id={}, rows={}", userId, rows);
            return rows;
        }
    }

    @Override
    public boolean existsByEmail(String emailId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_EXISTS_BY_EMAIL)) {

            ps.setString(1, emailId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    // ── Row mapper ─────────────────────────────────────────────────────────

    private User mapRow(ResultSet rs) throws SQLException {
        User u = new User();
        u.setUserId(rs.getInt("userid"));
        u.setFirstName(rs.getString("firstname"));
        u.setLastName(rs.getString("lastname"));
        u.setEmailId(rs.getString("emailid"));
        u.setPassw(rs.getString("passw"));
        u.setPhone(rs.getString("phone"));
        u.setRolle(rs.getString("rolle"));
        u.setActive(rs.getBoolean("isactive"));
        Timestamp ca = rs.getTimestamp("createdat");
        Timestamp ma = rs.getTimestamp("modifiedat");
        u.setCreatedAt(ca != null ? ca.toLocalDateTime() : null);
        u.setModifiedAt(ma != null ? ma.toLocalDateTime() : null);
        return u;
    }
}
