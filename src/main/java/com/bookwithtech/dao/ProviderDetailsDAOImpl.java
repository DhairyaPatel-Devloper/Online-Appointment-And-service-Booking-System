package com.bookwithtech.dao;

import com.bookwithtech.model.ProviderDetails;
import com.bookwithtech.util.DBConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ProviderDetailsDAOImpl implements ProviderDetailsDAO {

    private static final Logger log = LoggerFactory.getLogger(ProviderDetailsDAOImpl.class);

    private static final String COLS =
        "providerid, userid, businessname, businessaddress, businessphone, "
        + "openingtime, closingtime, avgservicetime, perslotcapacity, approvalstatus, createdat, modifiedat";

    private static final String SQL_INSERT =
        "INSERT INTO providerdetails (userid, businessname, businessaddress, businessphone, "
        + "openingtime, closingtime, avgservicetime, perslotcapacity, approvalstatus, createdat, modifiedat) "
        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING providerid";

    private static final String SQL_FIND_BY_ID =
        "SELECT " + COLS + " FROM providerdetails WHERE providerid = ?";

    private static final String SQL_FIND_BY_USERID =
        "SELECT " + COLS + " FROM providerdetails WHERE userid = ?";

    private static final String SQL_FIND_ALL =
        "SELECT " + COLS + " FROM providerdetails ORDER BY providerid";

    private static final String SQL_FIND_BY_APPROVAL =
        "SELECT " + COLS + " FROM providerdetails WHERE approvalstatus = ? ORDER BY providerid";

    private static final String SQL_UPDATE =
        "UPDATE providerdetails SET businessname=?, businessaddress=?, businessphone=?, "
        + "openingtime=?, closingtime=?, avgservicetime=?, perslotcapacity=?, modifiedat=NOW() "
        + "WHERE providerid=?";

    private static final String SQL_SET_APPROVAL =
        "UPDATE providerdetails SET approvalstatus=?, modifiedat=NOW() WHERE providerid=?";

    private static final String SQL_DELETE =
        "DELETE FROM providerdetails WHERE providerid=?";

    // ── CRUD ────────────────────────────────────────────────────────────────

    @Override
    public int create(ProviderDetails pd) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_INSERT)) {

            ps.setInt(1, pd.getUserId());
            ps.setString(2, pd.getBusinessName());
            ps.setString(3, pd.getBusinessAddress());
            ps.setString(4, pd.getBusinessPhone());
            ps.setTime(5, Time.valueOf(pd.getOpeningTime()));
            ps.setTime(6, Time.valueOf(pd.getClosingTime()));
            ps.setInt(7, pd.getAvgServiceTime());
            ps.setInt(8, pd.getPerSlotCapacity());
            ps.setBoolean(9, pd.isApprovalStatus());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int newId = rs.getInt("providerid");
                    log.info("Created providerdetails id={}", newId);
                    return newId;
                }
                throw new SQLException("ProviderDetails insert returned no generated key.");
            }
        }
    }

    @Override
    public Optional<ProviderDetails> findById(int providerId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_ID)) {

            ps.setInt(1, providerId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public Optional<ProviderDetails> findByUserId(int userId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_USERID)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public List<ProviderDetails> findAll() throws SQLException {
        List<ProviderDetails> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_ALL);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) list.add(mapRow(rs));
        }
        return list;
    }

    @Override
    public List<ProviderDetails> findByApprovalStatus(boolean approved) throws SQLException {
        List<ProviderDetails> list = new ArrayList<>();
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_APPROVAL)) {

            ps.setBoolean(1, approved);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapRow(rs));
            }
        }
        return list;
    }

    @Override
    public int update(ProviderDetails pd) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_UPDATE)) {

            ps.setString(1, pd.getBusinessName());
            ps.setString(2, pd.getBusinessAddress());
            ps.setString(3, pd.getBusinessPhone());
            ps.setTime(4, Time.valueOf(pd.getOpeningTime()));
            ps.setTime(5, Time.valueOf(pd.getClosingTime()));
            ps.setInt(6, pd.getAvgServiceTime());
            ps.setInt(7, pd.getPerSlotCapacity());
            ps.setInt(8, pd.getProviderId());

            return ps.executeUpdate();
        }
    }

    @Override
    public int setApprovalStatus(int providerId, boolean approved) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_SET_APPROVAL)) {

            ps.setBoolean(1, approved);
            ps.setInt(2, providerId);
            return ps.executeUpdate();
        }
    }

    @Override
    public int delete(int providerId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_DELETE)) {

            ps.setInt(1, providerId);
            return ps.executeUpdate();
        }
    }

    // ── Row mapper ────────────────────────────────────────────────────────

    private ProviderDetails mapRow(ResultSet rs) throws SQLException {
        ProviderDetails pd = new ProviderDetails();
        pd.setProviderId(rs.getInt("providerid"));
        pd.setUserId(rs.getInt("userid"));
        pd.setBusinessName(rs.getString("businessname"));
        pd.setBusinessAddress(rs.getString("businessaddress"));
        pd.setBusinessPhone(rs.getString("businessphone"));
        Time ot = rs.getTime("openingtime");
        Time ct = rs.getTime("closingtime");
        pd.setOpeningTime(ot != null ? ot.toLocalTime() : null);
        pd.setClosingTime(ct != null ? ct.toLocalTime() : null);
        pd.setAvgServiceTime(rs.getInt("avgservicetime"));
        pd.setPerSlotCapacity(rs.getInt("perslotcapacity"));
        pd.setApprovalStatus(rs.getBoolean("approvalstatus"));
        Timestamp ca = rs.getTimestamp("createdat");
        Timestamp ma = rs.getTimestamp("modifiedat");
        pd.setCreatedAt(ca != null ? ca.toLocalDateTime() : null);
        pd.setModifiedAt(ma != null ? ma.toLocalDateTime() : null);
        return pd;
    }
}
