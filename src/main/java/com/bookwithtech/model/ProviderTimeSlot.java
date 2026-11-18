package com.bookwithtech.model;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * POJO matching the "providertimeslots" table exactly.
 */
public class ProviderTimeSlot {

    private int       slotId;
    private int       providerId;       // FK → providerdetails.providerid
    private LocalDate slotDate;
    private LocalTime slotStartTime;
    private LocalTime slotEndTime;
    private int       slotCapacity;
    private boolean   slotStatus;       // true = open / available

    public ProviderTimeSlot() {}

    public ProviderTimeSlot(int slotId, int providerId, LocalDate slotDate,
                            LocalTime slotStartTime, LocalTime slotEndTime,
                            int slotCapacity, boolean slotStatus) {
        this.slotId        = slotId;
        this.providerId    = providerId;
        this.slotDate      = slotDate;
        this.slotStartTime = slotStartTime;
        this.slotEndTime   = slotEndTime;
        this.slotCapacity  = slotCapacity;
        this.slotStatus    = slotStatus;
    }

    // ── Getters & Setters ────────────────────────────────────────────────

    public int getSlotId()                              { return slotId; }
    public void setSlotId(int slotId)                   { this.slotId = slotId; }

    public int getProviderId()                          { return providerId; }
    public void setProviderId(int providerId)           { this.providerId = providerId; }

    public LocalDate getSlotDate()                      { return slotDate; }
    public void setSlotDate(LocalDate slotDate)         { this.slotDate = slotDate; }

    public LocalTime getSlotStartTime()                 { return slotStartTime; }
    public void setSlotStartTime(LocalTime slotStartTime){ this.slotStartTime = slotStartTime; }

    public LocalTime getSlotEndTime()                   { return slotEndTime; }
    public void setSlotEndTime(LocalTime slotEndTime)   { this.slotEndTime = slotEndTime; }

    public int getSlotCapacity()                        { return slotCapacity; }
    public void setSlotCapacity(int slotCapacity)       { this.slotCapacity = slotCapacity; }

    public boolean isSlotStatus()                       { return slotStatus; }
    public void setSlotStatus(boolean slotStatus)       { this.slotStatus = slotStatus; }

    @Override
    public String toString() {
        return "ProviderTimeSlot{slotId=" + slotId + ", providerId=" + providerId
               + ", slotDate=" + slotDate + ", slotStartTime=" + slotStartTime + "}";
    }
}
