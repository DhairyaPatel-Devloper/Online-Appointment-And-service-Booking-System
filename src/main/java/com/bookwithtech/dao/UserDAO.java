package com.bookwithtech.dao;

import com.bookwithtech.model.User;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/**
 * DAO interface for the "users" table.
 * No JDBC here — only the contract. Implementation is in UserDAOImpl.
 */
public interface UserDAO {

    /** Insert a new user. Returns generated userid. */
    int create(User user) throws SQLException;

    /** Find user by primary key. */
    Optional<User> findById(int userId) throws SQLException;

    /** Find user by email (for login). */
    Optional<User> findByEmail(String emailId) throws SQLException;

    /** All users — for admin list. */
    List<User> findAll() throws SQLException;

    /** Find all users with a specific role. */
    List<User> findByRole(String rolle) throws SQLException;

    /** Update existing user record. Returns rows affected. */
    int update(User user) throws SQLException;

    /** Soft-delete by toggling isactive. Returns rows affected. */
    int setActive(int userId, boolean active) throws SQLException;

    /** Hard delete (use with caution). Returns rows affected. */
    int delete(int userId) throws SQLException;

    /** Check if email already registered. */
    boolean existsByEmail(String emailId) throws SQLException;
}
