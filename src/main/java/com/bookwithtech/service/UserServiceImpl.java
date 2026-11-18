package com.bookwithtech.service;

import com.bookwithtech.dao.UserDAO;
import com.bookwithtech.dao.UserDAOImpl;
import com.bookwithtech.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/**
 * Business logic for user operations.
 *
 * PASSWORD HASHING NOTE:
 * Passwords are hashed with a simple SHA-256 hex digest here for
 * demonstration. In production, replace with BCrypt (add
 * org.mindrot:jbcrypt:0.4 to pom.xml) and update hashPassword /
 * checkPassword accordingly. SHA-256 is intentionally kept simple to
 * avoid adding a dependency not listed in the prompt.
 */
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserDAO userDAO;

    public UserServiceImpl() {
        this.userDAO = new UserDAOImpl();
    }

    // ── Registration ────────────────────────────────────────────────────────

    @Override
    public int register(String firstName, String lastName, String emailId,
                        String rawPassword, String phone, String rolle) throws SQLException {

        // ── Input validation (service layer — not in servlet, not in DAO) ──
        if (firstName == null || firstName.isBlank())  throw new IllegalArgumentException("First name is required.");
        if (lastName  == null || lastName.isBlank())   throw new IllegalArgumentException("Last name is required.");
        if (emailId   == null || !emailId.contains("@")) throw new IllegalArgumentException("Valid email is required.");
        if (rawPassword == null || rawPassword.length() < 6) throw new IllegalArgumentException("Password must be at least 6 characters.");
        if (phone     == null || phone.isBlank())      throw new IllegalArgumentException("Phone is required.");

        // Validate role
        if (!List.of("Admin", "Provider", "Customer").contains(rolle)) {
            throw new IllegalArgumentException("Invalid role: " + rolle);
        }

        // Duplicate check
        if (userDAO.existsByEmail(emailId)) {
            throw new IllegalStateException("An account with this email already exists.");
        }

        User user = new User();
        user.setFirstName(firstName.trim());
        user.setLastName(lastName.trim());
        user.setEmailId(emailId.trim().toLowerCase());
        user.setPassw(hashPassword(rawPassword));
        user.setPhone(phone.trim());
        user.setRolle(rolle);
        user.setActive(true);

        return userDAO.create(user);
    }

    // ── Login ───────────────────────────────────────────────────────────────

    @Override
    public Optional<User> login(String emailId, String rawPassword) throws SQLException {
        if (emailId == null || rawPassword == null) return Optional.empty();

        Optional<User> found = userDAO.findByEmail(emailId.trim().toLowerCase());
        if (found.isEmpty()) return Optional.empty();

        User user = found.get();
        if (!user.isActive()) {
            log.warn("Login attempt for deactivated account: {}", emailId);
            return Optional.empty();
        }

        if (!checkPassword(rawPassword, user.getPassw())) {
            log.warn("Bad password for: {}", emailId);
            return Optional.empty();
        }

        // Clear the password hash before returning (don't expose it)
        user.setPassw(null);
        return Optional.of(user);
    }

    // ── Read ────────────────────────────────────────────────────────────────

    @Override
    public Optional<User> findById(int userId) throws SQLException {
        return userDAO.findById(userId);
    }

    @Override
    public List<User> findAll() throws SQLException {
        return userDAO.findAll();
    }

    @Override
    public List<User> findByRole(String rolle) throws SQLException {
        return userDAO.findByRole(rolle);
    }

    // ── Update ──────────────────────────────────────────────────────────────

    @Override
    public void updateProfile(User user) throws SQLException {
        if (user.getUserId() <= 0) throw new IllegalArgumentException("Invalid userId.");
        if (user.getFirstName() == null || user.getFirstName().isBlank())
            throw new IllegalArgumentException("First name is required.");
        userDAO.update(user);
    }

    @Override
    public void changePassword(int userId, String oldRaw, String newRaw) throws SQLException {
        if (newRaw == null || newRaw.length() < 6)
            throw new IllegalArgumentException("New password must be at least 6 characters.");

        User user = userDAO.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (!checkPassword(oldRaw, user.getPassw()))
            throw new IllegalArgumentException("Current password is incorrect.");

        user.setPassw(hashPassword(newRaw));
        userDAO.update(user);
    }

    // ── Activate / Deactivate / Delete ──────────────────────────────────────

    @Override
    public void deactivate(int userId) throws SQLException {
        userDAO.setActive(userId, false);
    }

    @Override
    public void activate(int userId) throws SQLException {
        userDAO.setActive(userId, true);
    }

    @Override
    public void delete(int userId) throws SQLException {
        userDAO.delete(userId);
    }

    // ── Password hashing (SHA-256 hex) ──────────────────────────────────────
    // ⚠️  Replace with BCrypt in production for real security.

    private static String hashPassword(String raw) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private static boolean checkPassword(String raw, String stored) {
        if (raw == null || stored == null) return false;
        return hashPassword(raw).equals(stored);
    }
}
