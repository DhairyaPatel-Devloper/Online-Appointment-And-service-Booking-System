package com.bookwithtech.model;

import java.time.LocalDateTime;

/**
 * POJO matching the "users" table exactly.
 * Column: userid, firstname, lastname, emailid, passw,
 *         phone, rolle, isactive, createdat, modifiedat
 */
public class User {

    private int    userId;
    private String firstName;
    private String lastName;
    private String emailId;
    private String passw;          // hashed password stored in DB
    private String phone;
    private String rolle;          // "Admin" | "Provider" | "Customer"
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public User() {}

    public User(int userId, String firstName, String lastName, String emailId,
                String passw, String phone, String rolle, boolean isActive,
                LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.userId     = userId;
        this.firstName  = firstName;
        this.lastName   = lastName;
        this.emailId    = emailId;
        this.passw      = passw;
        this.phone      = phone;
        this.rolle      = rolle;
        this.isActive   = isActive;
        this.createdAt  = createdAt;
        this.modifiedAt = modifiedAt;
    }

    // ── Getters & Setters ────────────────────────────────────────────────

    public int getUserId()                          { return userId; }
    public void setUserId(int userId)               { this.userId = userId; }

    public String getFirstName()                    { return firstName; }
    public void setFirstName(String firstName)      { this.firstName = firstName; }

    public String getLastName()                     { return lastName; }
    public void setLastName(String lastName)        { this.lastName = lastName; }

    public String getEmailId()                      { return emailId; }
    public void setEmailId(String emailId)          { this.emailId = emailId; }

    public String getPassw()                        { return passw; }
    public void setPassw(String passw)              { this.passw = passw; }

    public String getPhone()                        { return phone; }
    public void setPhone(String phone)              { this.phone = phone; }

    public String getRolle()                        { return rolle; }
    public void setRolle(String rolle)              { this.rolle = rolle; }

    public boolean isActive()                       { return isActive; }
    public void setActive(boolean active)           { isActive = active; }

    public LocalDateTime getCreatedAt()             { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt){ this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt()            { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt){ this.modifiedAt = modifiedAt; }

    @Override
    public String toString() {
        return "User{userId=" + userId + ", emailId='" + emailId + "', rolle='" + rolle + "'}";
    }
}
