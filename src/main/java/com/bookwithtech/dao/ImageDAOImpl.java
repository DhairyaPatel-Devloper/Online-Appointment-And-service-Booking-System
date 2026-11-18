package com.bookwithtech.dao;

import com.bookwithtech.model.Image;
import com.bookwithtech.util.DBConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class ImageDAOImpl implements ImageDAO {

    private static final Logger log = LoggerFactory.getLogger(ImageDAOImpl.class);

    private static final String SQL_INSERT =
        "INSERT INTO images (providerid, imagesource) VALUES (?, ?) RETURNING imageid";

    private static final String SQL_FIND_BY_ID =
        "SELECT imageid, providerid, imagesource FROM images WHERE imageid = ?";

    private static final String SQL_FIND_BY_PROVIDER =
        "SELECT imageid, providerid, imagesource FROM images WHERE providerid = ? ORDER BY imageid";

    private static final String SQL_DELETE =
        "DELETE FROM images WHERE imageid = ?";

    @Override
    public int create(Image image) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_INSERT)) {

            ps.setInt(1, image.getProviderId());
            ps.setString(2, image.getImageSource());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt("imageid");
                throw new SQLException("Image insert returned no generated key.");
            }
        }
    }

    @Override
    public Optional<Image> findById(int imageId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_FIND_BY_ID)) {

            ps.setInt(1, imageId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return Optional.of(mapRow(rs));
                return Optional.empty();
            }
        }
    }

    @Override
    public List<Image> findByProvider(int providerId) throws SQLException {
        List<Image> list = new ArrayList<>();
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
    public int delete(int imageId) throws SQLException {
        try (Connection conn = DBConnectionManager.getConnection();
             PreparedStatement ps = conn.prepareStatement(SQL_DELETE)) {

            ps.setInt(1, imageId);
            return ps.executeUpdate();
        }
    }

    private Image mapRow(ResultSet rs) throws SQLException {
        return new Image(
            rs.getInt("imageid"),
            rs.getInt("providerid"),
            rs.getString("imagesource")
        );
    }
}
