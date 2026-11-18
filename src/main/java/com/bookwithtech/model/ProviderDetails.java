package com.bookwithtech.model;

import java.time.LocalDateTime;

/**
 * POJO matching the "providerdetails" table exactly.
 */
public class ProviderDetails {

    private int    providerId;
    private int    userId;              // FK → users.userid
    private String businessName;
    private String businessAddress;
    private String businessPhone;
    private java.time.LocalTime openingTime;
    private java.time.LocalTime closingTime;
    private int    avgServiceTime;      // minutes
    private int    perSlotCapacity;
    private boolean approvalStatus;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public ProviderDetails() {}

    public ProviderDetails(int providerId, int userId, String businessName,
                           String businessAddress, String businessPhone,
                           java.time.LocalTime openingTime, java.time.LocalTime closingTime,
                           int avgServiceTime, int perSlotCapacity, boolean approvalStatus,
                           LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.providerId      = providerId;
        this.userId          = userId;
        this.businessName    = businessName;
        this.businessAddress = businessAddress;
        this.businessPhone   = businessPhone;
        this.openingTime     = openingTime;
        this.closingTime     = closingTime;
        this.avgServiceTime  = avgServiceTime;
        this.perSlotCapacity = perSlotCapacity;
        this.approvalStatus  = approvalStatus;
        this.createdAt       = createdAt;
        this.modifiedAt      = modifiedAt;
    }

    // ── Getters & Setters ────────────────────────────────────────────────

    public int getProviderId()                                  { return providerId; }
    public void setProviderId(int providerId)                   { this.providerId = providerId; }

    public int getUserId()                                      { return userId; }
    public void setUserId(int userId)                           { this.userId = userId; }

    public String getBusinessName()                             { return businessName; }
    public void setBusinessName(String businessName)            { this.businessName = businessName; }

    public String getBusinessAddress()                          { return businessAddress; }
    public void setBusinessAddress(String businessAddress)      { this.businessAddress = businessAddress; }

    public String getBusinessPhone()                            { return businessPhone; }
    public void setBusinessPhone(String businessPhone)          { this.businessPhone = businessPhone; }

    public java.time.LocalTime getOpeningTime()                 { return openingTime; }
    public void setOpeningTime(java.time.LocalTime openingTime) { this.openingTime = openingTime; }

    public java.time.LocalTime getClosingTime()                 { return closingTime; }
    public void setClosingTime(java.time.LocalTime closingTime) { this.closingTime = closingTime; }

    public int getAvgServiceTime()                              { return avgServiceTime; }
    public void setAvgServiceTime(int avgServiceTime)           { this.avgServiceTime = avgServiceTime; }

    public int getPerSlotCapacity()                             { return perSlotCapacity; }
    public void setPerSlotCapacity(int perSlotCapacity)         { this.perSlotCapacity = perSlotCapacity; }

    public boolean isApprovalStatus()                           { return approvalStatus; }
    public void setApprovalStatus(boolean approvalStatus)       { this.approvalStatus = approvalStatus; }

    public LocalDateTime getCreatedAt()                         { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt)           { this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt()                        { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt)         { this.modifiedAt = modifiedAt; }

    @Override
    public String toString() {
        return "ProviderDetails{providerId=" + providerId + ", businessName='" + businessName + "'}";
    }
}
