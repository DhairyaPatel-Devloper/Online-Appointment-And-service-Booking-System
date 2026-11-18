package com.bookwithtech.model;

import java.time.LocalDateTime;

/**
 * POJO matching the "feedback" table exactly.
 * rating: integer (typically 1–5)
 */
public class Feedback {

    private int           feedbackId;
    private int           bookingId;    // FK → booking.bookingid
    private int           customerId;  // FK → users.userid
    private int           providerId;  // FK → providerdetails.providerid
    private int           rating;
    private String        comment;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public Feedback() {}

    public Feedback(int feedbackId, int bookingId, int customerId, int providerId,
                    int rating, String comment,
                    LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.feedbackId  = feedbackId;
        this.bookingId   = bookingId;
        this.customerId  = customerId;
        this.providerId  = providerId;
        this.rating      = rating;
        this.comment     = comment;
        this.createdAt   = createdAt;
        this.modifiedAt  = modifiedAt;
    }

    // ── Getters & Setters ────────────────────────────────────────────────

    public int getFeedbackId()                              { return feedbackId; }
    public void setFeedbackId(int feedbackId)               { this.feedbackId = feedbackId; }

    public int getBookingId()                               { return bookingId; }
    public void setBookingId(int bookingId)                 { this.bookingId = bookingId; }

    public int getCustomerId()                              { return customerId; }
    public void setCustomerId(int customerId)               { this.customerId = customerId; }

    public int getProviderId()                              { return providerId; }
    public void setProviderId(int providerId)               { this.providerId = providerId; }

    public int getRating()                                  { return rating; }
    public void setRating(int rating)                       { this.rating = rating; }

    public String getComment()                              { return comment; }
    public void setComment(String comment)                  { this.comment = comment; }

    public LocalDateTime getCreatedAt()                     { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt)       { this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt()                    { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt)     { this.modifiedAt = modifiedAt; }

    @Override
    public String toString() {
        return "Feedback{feedbackId=" + feedbackId + ", bookingId=" + bookingId
               + ", rating=" + rating + "}";
    }
}
