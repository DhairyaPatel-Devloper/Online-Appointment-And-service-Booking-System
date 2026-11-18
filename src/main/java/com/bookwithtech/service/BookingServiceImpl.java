package com.bookwithtech.service;

import com.bookwithtech.dao.BookingDAO;
import com.bookwithtech.dao.BookingDAOImpl;
import com.bookwithtech.dao.ProviderTimeSlotDAO;
import com.bookwithtech.dao.ProviderTimeSlotDAOImpl;
import com.bookwithtech.model.Booking;
import com.bookwithtech.model.ProviderTimeSlot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final BookingDAO bookingDAO;
    private final ProviderTimeSlotDAO slotDAO;

    public BookingServiceImpl() {
        this.bookingDAO = new BookingDAOImpl();
        this.slotDAO    = new ProviderTimeSlotDAOImpl();
    }

    @Override
    public int createBooking(int customerId, int providerId, int slotId, long amount) throws SQLException {
        // ── Business rules ──────────────────────────────────────────────────
        if (customerId <= 0) throw new IllegalArgumentException("Invalid customerId.");
        if (providerId <= 0) throw new IllegalArgumentException("Invalid providerId.");
        if (slotId     <= 0) throw new IllegalArgumentException("Invalid slotId.");
        if (amount     <  0) throw new IllegalArgumentException("Amount cannot be negative.");

        // Check slot still open
        ProviderTimeSlot slot = slotDAO.findById(slotId)
            .orElseThrow(() -> new IllegalArgumentException("Time slot not found: " + slotId));

        if (!slot.isSlotStatus()) {
            throw new IllegalStateException("The selected time slot is no longer available.");
        }

        // Slot must belong to the given provider
        if (slot.getProviderId() != providerId) {
            throw new IllegalArgumentException("Slot does not belong to the specified provider.");
        }

        // Create booking
        Booking booking = new Booking();
        booking.setCustomerId(customerId);
        booking.setProviderId(providerId);
        booking.setSlotId(slotId);
        booking.setBookingStatus("Pending");
        booking.setAmount(amount);

        int newId = bookingDAO.create(booking);

        // Close the slot (capacity = 1 per slot in this schema)
        slotDAO.setSlotStatus(slotId, false);

        log.info("Booking created: id={}, customer={}, provider={}, slot={}", newId, customerId, providerId, slotId);
        return newId;
    }

    @Override
    public Optional<Booking> findById(int bookingId) throws SQLException {
        return bookingDAO.findById(bookingId);
    }

    @Override
    public List<Booking> getCustomerBookings(int customerId) throws SQLException {
        return bookingDAO.findByCustomer(customerId);
    }

    @Override
    public List<Booking> getProviderBookings(int providerId) throws SQLException {
        return bookingDAO.findByProvider(providerId);
    }

    @Override
    public List<Booking> getAllBookings() throws SQLException {
        return bookingDAO.findAll();
    }

    @Override
    public void confirmBooking(int bookingId) throws SQLException {
        assertBookingExists(bookingId);
        bookingDAO.updateStatus(bookingId, "Confirmed");
    }

    @Override
    public void cancelBooking(int bookingId, int requestingUserId) throws SQLException {
        Booking booking = assertBookingExists(bookingId);

        // Business rule: only the customer who made the booking (or admin = userId=0 sentinel) can cancel
        if (requestingUserId != 0 && booking.getCustomerId() != requestingUserId) {
            throw new IllegalStateException("You are not authorised to cancel this booking.");
        }

        bookingDAO.updateStatus(bookingId, "Cancelled");

        // Re-open the slot so others can book it
        slotDAO.setSlotStatus(booking.getSlotId(), true);
    }

    @Override
    public void completeBooking(int bookingId) throws SQLException {
        assertBookingExists(bookingId);
        bookingDAO.updateStatus(bookingId, "Completed");
    }

    // ── Internal helpers ────────────────────────────────────────────────────

    private Booking assertBookingExists(int bookingId) throws SQLException {
        return bookingDAO.findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
    }
}
