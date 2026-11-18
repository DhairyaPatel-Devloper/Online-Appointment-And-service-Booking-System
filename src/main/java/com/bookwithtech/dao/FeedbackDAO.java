package com.bookwithtech.dao;

import com.bookwithtech.model.Feedback;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** DAO contract for the "feedback" table. */
public interface FeedbackDAO {

    int create(Feedback feedback) throws SQLException;
    Optional<Feedback> findById(int feedbackId) throws SQLException;
    Optional<Feedback> findByBookingId(int bookingId) throws SQLException;
    List<Feedback> findByProvider(int providerId) throws SQLException;
    List<Feedback> findByCustomer(int customerId) throws SQLException;
    double getAverageRatingForProvider(int providerId) throws SQLException;
    int delete(int feedbackId) throws SQLException;
}
