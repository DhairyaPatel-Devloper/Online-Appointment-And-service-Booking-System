package com.bookwithtech.servlet;

import com.bookwithtech.model.Booking;
import com.bookwithtech.service.BookingService;
import com.bookwithtech.service.BookingServiceImpl;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * PRESENTATION LAYER — Booking Servlet.
 *
 * GET  /api/bookings?customerId=X           → customer's bookings
 * GET  /api/bookings?providerId=X           → provider's bookings
 * GET  /api/bookings/all                    → admin: all bookings
 * POST /api/bookings                        → create booking
 * POST /api/bookings/cancel?bookingId=X     → cancel a booking
 * POST /api/bookings/confirm?bookingId=X    → confirm a booking (provider/admin)
 * POST /api/bookings/complete?bookingId=X   → mark complete
 */
@WebServlet(urlPatterns = {"/api/bookings", "/api/bookings/*"})
public class BookingServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Gson GSON = new Gson();
    private final BookingService bookingService = new BookingServiceImpl();

    // ── GET ─────────────────────────────────────────────────────────────────

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");

        if (!isAuthenticated(req)) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(resp, Map.of("error", "Authentication required."));
            return;
        }

        String pathInfo = req.getPathInfo();  // e.g., "/all" or null

        try {
            if ("/all".equals(pathInfo)) {
                requireRole(req, resp, "Admin");
                List<Booking> all = bookingService.getAllBookings();
                writeJson(resp, all);
                return;
            }

            String customerIdStr = req.getParameter("customerId");
            String providerIdStr = req.getParameter("providerId");

            if (customerIdStr != null) {
                int customerId = Integer.parseInt(customerIdStr);
                writeJson(resp, bookingService.getCustomerBookings(customerId));
            } else if (providerIdStr != null) {
                int providerId = Integer.parseInt(providerIdStr);
                writeJson(resp, bookingService.getProviderBookings(providerId));
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                writeJson(resp, Map.of("error", "Provide customerId or providerId query param."));
            }

        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", "Invalid numeric parameter."));
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    // ── POST ────────────────────────────────────────────────────────────────

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");

        if (!isAuthenticated(req)) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(resp, Map.of("error", "Authentication required."));
            return;
        }

        String pathInfo = req.getPathInfo(); // "/cancel", "/confirm", "/complete", or null

        try {
            if ("/cancel".equals(pathInfo)) {
                int bookingId = Integer.parseInt(req.getParameter("bookingId"));
                int sessionUserId = (int) req.getSession().getAttribute("userId");
                bookingService.cancelBooking(bookingId, sessionUserId);
                writeJson(resp, Map.of("success", true, "message", "Booking cancelled."));

            } else if ("/confirm".equals(pathInfo)) {
                int bookingId = Integer.parseInt(req.getParameter("bookingId"));
                bookingService.confirmBooking(bookingId);
                writeJson(resp, Map.of("success", true, "message", "Booking confirmed."));

            } else if ("/complete".equals(pathInfo)) {
                int bookingId = Integer.parseInt(req.getParameter("bookingId"));
                bookingService.completeBooking(bookingId);
                writeJson(resp, Map.of("success", true, "message", "Booking marked complete."));

            } else {
                // Create new booking
                int customerId = Integer.parseInt(req.getParameter("customerId"));
                int providerId = Integer.parseInt(req.getParameter("providerId"));
                int slotId     = Integer.parseInt(req.getParameter("slotId"));
                long amount    = Long.parseLong(req.getParameter("amount"));

                int newId = bookingService.createBooking(customerId, providerId, slotId, amount);
                resp.setStatus(HttpServletResponse.SC_CREATED);
                writeJson(resp, Map.of("success", true, "bookingId", newId));
            }

        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", "Invalid numeric parameter."));
        } catch (IllegalArgumentException | IllegalStateException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", e.getMessage()));
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    // ── Utilities ─────────────────────────────────────────────────────────

    private static boolean isAuthenticated(HttpServletRequest req) {
        HttpSession s = req.getSession(false);
        return s != null && s.getAttribute("userId") != null;
    }

    private static void requireRole(HttpServletRequest req, HttpServletResponse resp, String role)
            throws IOException {
        HttpSession s = req.getSession(false);
        String userRole = s != null ? (String) s.getAttribute("rolle") : null;
        if (!role.equals(userRole)) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            writeJson(resp, Map.of("error", "Access denied. Requires role: " + role));
            throw new IllegalStateException("Forbidden");
        }
    }

    private static void writeJson(HttpServletResponse resp, Object obj) throws IOException {
        resp.getWriter().write(GSON.toJson(obj));
    }
}
