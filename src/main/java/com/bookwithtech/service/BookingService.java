package com.bookwithtech.service;

import com.bookwithtech.model.Booking;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/** Business logic contract for bookings. */
public interface BookingService {
    int createBooking(int customerId, int providerId, int slotId, long amount) throws SQLException;
    Optional<Booking> findById(int bookingId) throws SQLException;
    List<Booking> getCustomerBookings(int customerId) throws SQLException;
    List<Booking> getProviderBookings(int providerId) throws SQLException;
    List<Booking> getAllBookings() throws SQLException;
    void confirmBooking(int bookingId) throws SQLException;
    void cancelBooking(int bookingId, int requestingUserId) throws SQLException;
    void completeBooking(int bookingId) throws SQLException;
}
