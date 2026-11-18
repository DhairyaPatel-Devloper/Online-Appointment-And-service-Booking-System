package com.bookwithtech.service;

import com.bookwithtech.model.Feedback;
import java.sql.SQLException;
import java.util.List;

/** Business logic contract for feedback. */
public interface FeedbackService {
    int submitFeedback(int bookingId, int customerId, int providerId, int rating, String comment) throws SQLException;
    List<Feedback> getProviderFeedback(int providerId) throws SQLException;
    List<Feedback> getCustomerFeedback(int customerId) throws SQLException;
    double getProviderAverageRating(int providerId) throws SQLException;
    void deleteFeedback(int feedbackId) throws SQLException;
}
