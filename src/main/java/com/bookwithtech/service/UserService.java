package com.bookwithtech.service;

import com.bookwithtech.model.User;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** Business-logic contract for user operations. */
public interface UserService {

    /** Register a new user. Returns the generated userId. */
    int register(String firstName, String lastName, String emailId,
                 String rawPassword, String phone, String rolle) throws SQLException;

    /**
     * Authenticate by email + raw password.
     * Returns the authenticated User, or empty if credentials are wrong.
     */
    Optional<User> login(String emailId, String rawPassword) throws SQLException;

    Optional<User> findById(int userId) throws SQLException;
    List<User> findAll() throws SQLException;
    List<User> findByRole(String rolle) throws SQLException;
    void updateProfile(User user) throws SQLException;
    void changePassword(int userId, String oldRaw, String newRaw) throws SQLException;
    void deactivate(int userId) throws SQLException;
    void activate(int userId) throws SQLException;
    void delete(int userId) throws SQLException;
}
