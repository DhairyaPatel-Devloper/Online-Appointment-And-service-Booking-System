package com.bookwithtech.dao;

import com.bookwithtech.model.ProviderTimeSlot;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/** DAO contract for "providertimeslots" table. */
public interface ProviderTimeSlotDAO {

    int create(ProviderTimeSlot slot) throws SQLException;
    Optional<ProviderTimeSlot> findById(int slotId) throws SQLException;
    List<ProviderTimeSlot> findByProvider(int providerId) throws SQLException;
    List<ProviderTimeSlot> findByProviderAndDate(int providerId, LocalDate date) throws SQLException;
    List<ProviderTimeSlot> findAvailableByProviderAndDate(int providerId, LocalDate date) throws SQLException;
    int update(ProviderTimeSlot slot) throws SQLException;
    int setSlotStatus(int slotId, boolean status) throws SQLException;
    int delete(int slotId) throws SQLException;
}
