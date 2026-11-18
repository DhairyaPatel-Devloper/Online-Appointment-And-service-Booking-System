package com.bookwithtech.dao;

import com.bookwithtech.model.ProviderDetails;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** DAO contract for "providerdetails" table. */
public interface ProviderDetailsDAO {

    int create(ProviderDetails pd) throws SQLException;
    Optional<ProviderDetails> findById(int providerId) throws SQLException;
    Optional<ProviderDetails> findByUserId(int userId) throws SQLException;
    List<ProviderDetails> findAll() throws SQLException;
    List<ProviderDetails> findByApprovalStatus(boolean approved) throws SQLException;
    int update(ProviderDetails pd) throws SQLException;
    int setApprovalStatus(int providerId, boolean approved) throws SQLException;
    int delete(int providerId) throws SQLException;
}
