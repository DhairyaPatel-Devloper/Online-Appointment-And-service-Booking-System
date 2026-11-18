package com.bookwithtech.dao;

import com.bookwithtech.model.Booking;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** DAO contract for the "booking" table. */
public interface BookingDAO {

    int create(Booking booking) throws SQLException;
    Optional<Booking> findById(int bookingId) throws SQLException;
    List<Booking> findByCustomer(int customerId) throws SQLException;
    List<Booking> findByProvider(int providerId) throws SQLException;
    List<Booking> findByStatus(String status) throws SQLException;
    List<Booking> findAll() throws SQLException;
    int updateStatus(int bookingId, String status) throws SQLException;
    int delete(int bookingId) throws SQLException;
}
