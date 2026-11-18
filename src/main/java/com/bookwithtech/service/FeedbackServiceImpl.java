package com.bookwithtech.service;

import com.bookwithtech.dao.FeedbackDAO;
import com.bookwithtech.dao.FeedbackDAOImpl;
import com.bookwithtech.model.Feedback;

import java.sql.SQLException;
import java.util.List;

public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackDAO feedbackDAO;

    public FeedbackServiceImpl() {
        this.feedbackDAO = new FeedbackDAOImpl();
    }

    @Override
    public int submitFeedback(int bookingId, int customerId, int providerId,
                              int rating, String comment) throws SQLException {

        // ── Validation ──────────────────────────────────────────────────────
        if (bookingId  <= 0) throw new IllegalArgumentException("Invalid bookingId.");
        if (customerId <= 0) throw new IllegalArgumentException("Invalid customerId.");
        if (providerId <= 0) throw new IllegalArgumentException("Invalid providerId.");
        if (rating < 1 || rating > 5)
            throw new IllegalArgumentException("Rating must be between 1 and 5.");

        // Prevent duplicate feedback for same booking
        if (feedbackDAO.findByBookingId(bookingId).isPresent()) {
            throw new IllegalStateException("Feedback already submitted for this booking.");
        }

        Feedback fb = new Feedback();
        fb.setBookingId(bookingId);
        fb.setCustomerId(customerId);
        fb.setProviderId(providerId);
        fb.setRating(rating);
        fb.setComment(comment != null ? comment.trim() : "");

        return feedbackDAO.create(fb);
    }

    @Override
    public List<Feedback> getProviderFeedback(int providerId) throws SQLException {
        return feedbackDAO.findByProvider(providerId);
    }

    @Override
    public List<Feedback> getCustomerFeedback(int customerId) throws SQLException {
        return feedbackDAO.findByCustomer(customerId);
    }

    @Override
    public double getProviderAverageRating(int providerId) throws SQLException {
        return feedbackDAO.getAverageRatingForProvider(providerId);
    }

    @Override
    public void deleteFeedback(int feedbackId) throws SQLException {
        if (feedbackId <= 0) throw new IllegalArgumentException("Invalid feedbackId.");
        feedbackDAO.delete(feedbackId);
    }
}
