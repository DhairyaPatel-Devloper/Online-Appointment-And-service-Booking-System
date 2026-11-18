package com.bookwithtech.service;

import com.bookwithtech.dao.ProviderDetailsDAO;
import com.bookwithtech.dao.ProviderDetailsDAOImpl;
import com.bookwithtech.model.ProviderDetails;

import java.sql.SQLException;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public class ProviderService {

    private final ProviderDetailsDAO providerDAO;

    public ProviderService() {
        this.providerDAO = new ProviderDetailsDAOImpl();
    }

    public int registerProvider(int userId, String businessName, String businessAddress,
                                String businessPhone, LocalTime openingTime, LocalTime closingTime,
                                int avgServiceTime, int perSlotCapacity) throws SQLException {

        if (businessName == null || businessName.isBlank())
            throw new IllegalArgumentException("Business name is required.");
        if (avgServiceTime <= 0)
            throw new IllegalArgumentException("Average service time must be positive.");
        if (perSlotCapacity <= 0)
            throw new IllegalArgumentException("Per-slot capacity must be positive.");
        if (openingTime != null && closingTime != null && !openingTime.isBefore(closingTime))
            throw new IllegalArgumentException("Opening time must be before closing time.");

        ProviderDetails pd = new ProviderDetails();
        pd.setUserId(userId);
        pd.setBusinessName(businessName.trim());
        pd.setBusinessAddress(businessAddress != null ? businessAddress.trim() : "");
        pd.setBusinessPhone(businessPhone != null ? businessPhone.trim() : "");
        pd.setOpeningTime(openingTime);
        pd.setClosingTime(closingTime);
        pd.setAvgServiceTime(avgServiceTime);
        pd.setPerSlotCapacity(perSlotCapacity);
        pd.setApprovalStatus(false);   // pending admin approval by default

        return providerDAO.create(pd);
    }

    public Optional<ProviderDetails> findById(int providerId) throws SQLException {
        return providerDAO.findById(providerId);
    }

    public Optional<ProviderDetails> findByUserId(int userId) throws SQLException {
        return providerDAO.findByUserId(userId);
    }

    public List<ProviderDetails> getApprovedProviders() throws SQLException {
        return providerDAO.findByApprovalStatus(true);
    }

    public List<ProviderDetails> getPendingProviders() throws SQLException {
        return providerDAO.findByApprovalStatus(false);
    }

    public List<ProviderDetails> getAllProviders() throws SQLException {
        return providerDAO.findAll();
    }

    public void approve(int providerId) throws SQLException {
        providerDAO.setApprovalStatus(providerId, true);
    }

    public void reject(int providerId) throws SQLException {
        providerDAO.setApprovalStatus(providerId, false);
    }

    public void updateProfile(ProviderDetails pd) throws SQLException {
        if (pd.getProviderId() <= 0) throw new IllegalArgumentException("Invalid providerId.");
        providerDAO.update(pd);
    }

    public void delete(int providerId) throws SQLException {
        providerDAO.delete(providerId);
    }
}
