package com.bookwithtech.servlet;

import com.bookwithtech.dao.ProviderTimeSlotDAO;
import com.bookwithtech.dao.ProviderTimeSlotDAOImpl;
import com.bookwithtech.model.ProviderTimeSlot;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * PRESENTATION LAYER — Time Slot & Capacity Engine Servlet.
 *
 * GET  /api/slots?providerId=X&date=YYYY-MM-DD          → fetch slots for provider on date
 * GET  /api/slots/available?providerId=X&date=YYYY-MM-DD→ fetch only available slots
 * POST /api/slots/toggle?slotId=X&status=true|false    → toggle slot Available / Break
 * POST /api/slots/generate                             → bulk generate slots for day
 */
@WebServlet(urlPatterns = {"/api/slots", "/api/slots/*"})
public class TimeSlotServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(LocalDate.class, (com.google.gson.JsonSerializer<LocalDate>) (src, typeOfSrc, context) ->
                    new com.google.gson.JsonPrimitive(src.toString()))
            .registerTypeAdapter(LocalTime.class, (com.google.gson.JsonSerializer<LocalTime>) (src, typeOfSrc, context) ->
                    new com.google.gson.JsonPrimitive(src.toString()))
            .create();

    private final ProviderTimeSlotDAO slotDAO = new ProviderTimeSlotDAOImpl();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        setCorsHeaders(resp);
        resp.setContentType("application/json;charset=UTF-8");

        String pathInfo = req.getPathInfo();
        String providerIdStr = req.getParameter("providerId");
        String dateStr = req.getParameter("date");

        if (providerIdStr == null || dateStr == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", "Parameters providerId and date are required."));
            return;
        }

        try {
            int providerId = Integer.parseInt(providerIdStr);
            LocalDate date = LocalDate.parse(dateStr);

            List<ProviderTimeSlot> slots;
            if ("/available".equals(pathInfo)) {
                slots = slotDAO.findAvailableByProviderAndDate(providerId, date);
            } else {
                slots = slotDAO.findByProviderAndDate(providerId, date);
            }

            writeJson(resp, slots);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "JDBC query failed: " + e.getMessage()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        setCorsHeaders(resp);
        resp.setContentType("application/json;charset=UTF-8");

        String pathInfo = req.getPathInfo();

        try {
            if ("/toggle".equals(pathInfo) || "/status".equals(pathInfo)) {
                handleToggleStatus(req, resp);
            } else if ("/generate".equals(pathInfo)) {
                handleGenerateDaySlots(req, resp);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                writeJson(resp, Map.of("error", "Unknown slot endpoint: " + pathInfo));
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "JDBC operation failed: " + e.getMessage()));
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse resp) {
        setCorsHeaders(resp);
        resp.setStatus(HttpServletResponse.SC_OK);
    }

    private void handleToggleStatus(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, SQLException {

        String slotIdStr = req.getParameter("slotId");
        String statusStr = req.getParameter("status");

        if (slotIdStr == null || statusStr == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", "slotId and status parameters are required."));
            return;
        }

        int slotId = Integer.parseInt(slotIdStr);
        boolean newStatus = Boolean.parseBoolean(statusStr)
                || "1".equals(statusStr)
                || "Available".equalsIgnoreCase(statusStr);

        // Execute JDBC update via DAO
        int rowsUpdated = slotDAO.setSlotStatus(slotId, newStatus);
        Optional<ProviderTimeSlot> updated = slotDAO.findById(slotId);

        writeJson(resp, Map.of(
                "success", rowsUpdated > 0,
                "slotId", slotId,
                "slotStatus", newStatus,
                "statusText", newStatus ? "Available" : "Break / Not Available",
                "slot", updated.orElse(null)
        ));
    }

    private void handleGenerateDaySlots(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, SQLException {

        int providerId = Integer.parseInt(req.getParameter("providerId"));
        LocalDate date = LocalDate.parse(req.getParameter("date"));
        LocalTime startTime = LocalTime.parse(req.getParameter("startTime"));
        LocalTime endTime = LocalTime.parse(req.getParameter("endTime"));
        int durationMin = Integer.parseInt(req.getParameter("duration"));
        int capacity = Integer.parseInt(req.getParameter("capacity"));

        LocalTime current = startTime;
        int generatedCount = 0;

        while (current.plusMinutes(durationMin).isBefore(endTime) || current.plusMinutes(durationMin).equals(endTime)) {
            LocalTime next = current.plusMinutes(durationMin);

            ProviderTimeSlot slot = new ProviderTimeSlot();
            slot.setProviderId(providerId);
            slot.setSlotDate(date);
            slot.setSlotStartTime(current);
            slot.setSlotEndTime(next);
            slot.setSlotCapacity(capacity);
            slot.setSlotStatus(true);

            slotDAO.create(slot);
            generatedCount++;
            current = next;
        }

        writeJson(resp, Map.of(
                "success", true,
                "generatedCount", generatedCount,
                "date", date.toString()
        ));
    }

    private void setCorsHeaders(HttpServletResponse resp) {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    }

    private void writeJson(HttpServletResponse resp, Object data) throws IOException {
        resp.getWriter().write(GSON.toJson(data));
    }
}

