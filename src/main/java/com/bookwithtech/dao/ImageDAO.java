package com.bookwithtech.dao;

import com.bookwithtech.model.Image;
import com.bookwithtech.util.DBConnectionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** DAO interface + implementation for the "images" table (small table — combined for brevity). */
public interface ImageDAO {
    int create(Image image) throws SQLException;
    Optional<Image> findById(int imageId) throws SQLException;
    List<Image> findByProvider(int providerId) throws SQLException;
    int delete(int imageId) throws SQLException;
}
