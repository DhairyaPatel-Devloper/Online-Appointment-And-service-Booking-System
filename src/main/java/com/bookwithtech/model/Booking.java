package com.bookwithtech.model;

import java.time.LocalDateTime;

/**
 * POJO matching the "booking" table exactly.
 * bookingstatus: "Pending" | "Confirmed" | "Cancelled" | "Completed"
 */
public class Booking {

    private int           bookingId;
    private int           customerId;     // FK → users.userid
    private int           providerId;     // FK → providerdetails.providerid
    private int           slotId;         // FK → providertimeslots.slotid
    private LocalDateTime bookingDate;
    private String        bookingStatus;
    private long          amount;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public Booking() {}

    public Booking(int bookingId, int customerId, int providerId, int slotId,
                   LocalDateTime bookingDate, String bookingStatus, long amount,
                   LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.bookingId     = bookingId;
        this.customerId    = customerId;
        this.providerId    = providerId;
        this.slotId        = slotId;
        this.bookingDate   = bookingDate;
        this.bookingStatus = bookingStatus;
        this.amount        = amount;
        this.createdAt     = createdAt;
        this.modifiedAt    = modifiedAt;
    }

    // ── Getters & Setters ────────────────────────────────────────────────

    public int getBookingId()                               { return bookingId; }
    public void setBookingId(int bookingId)                 { this.bookingId = bookingId; }

    public int getCustomerId()                              { return customerId; }
    public void setCustomerId(int customerId)               { this.customerId = customerId; }

    public int getProviderId()                              { return providerId; }
    public void setProviderId(int providerId)               { this.providerId = providerId; }

    public int getSlotId()                                  { return slotId; }
    public void setSlotId(int slotId)                       { this.slotId = slotId; }

    public LocalDateTime getBookingDate()                   { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate)   { this.bookingDate = bookingDate; }

    public String getBookingStatus()                        { return bookingStatus; }
    public void setBookingStatus(String bookingStatus)      { this.bookingStatus = bookingStatus; }

    public long getAmount()                                 { return amount; }
    public void setAmount(long amount)                      { this.amount = amount; }

    public LocalDateTime getCreatedAt()                     { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt)       { this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt()                    { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt)     { this.modifiedAt = modifiedAt; }

    @Override
    public String toString() {
        return "Booking{bookingId=" + bookingId + ", customerId=" + customerId
               + ", bookingStatus='" + bookingStatus + "'}";
    }
}
