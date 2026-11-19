package com.bookwithtech.servlet;

import com.bookwithtech.service.FeedbackService;
import com.bookwithtech.service.FeedbackServiceImpl;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

/**
 * POST /api/feedback              → submit feedback
 * GET  /api/feedback?providerId=X → get provider feedback + avg rating
 * GET  /api/feedback?customerId=X → get customer's submitted feedback
 * DELETE /api/feedback?id=X       → admin delete
 */
@WebServlet("/api/feedback")
public class FeedbackServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Gson GSON = new Gson();
    private final FeedbackService feedbackService = new FeedbackServiceImpl();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");
        try {
            String providerIdStr = req.getParameter("providerId");
            String customerIdStr = req.getParameter("customerId");

            if (providerIdStr != null) {
                int pid = Integer.parseInt(providerIdStr);
                writeJson(resp, Map.of(
                    "feedback",      feedbackService.getProviderFeedback(pid),
                    "averageRating", feedbackService.getProviderAverageRating(pid)
                ));
            } else if (customerIdStr != null) {
                int cid = Integer.parseInt(customerIdStr);
                writeJson(resp, feedbackService.getCustomerFeedback(cid));
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                writeJson(resp, Map.of("error", "Provide providerId or customerId."));
            }
        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", "Invalid numeric parameter."));
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(resp, Map.of("error", "Authentication required."));
            return;
        }

        try {
            int bookingId  = Integer.parseInt(req.getParameter("bookingId"));
            int customerId = Integer.parseInt(req.getParameter("customerId"));
            int providerId = Integer.parseInt(req.getParameter("providerId"));
            int rating     = Integer.parseInt(req.getParameter("rating"));
            String comment = req.getParameter("comment");

            int newId = feedbackService.submitFeedback(bookingId, customerId, providerId, rating, comment);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            writeJson(resp, Map.of("success", true, "feedbackId", newId));

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

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");
        try {
            int feedbackId = Integer.parseInt(req.getParameter("id"));
            feedbackService.deleteFeedback(feedbackId);
            writeJson(resp, Map.of("success", true));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", e.getMessage()));
        }
    }

    private static void writeJson(HttpServletResponse resp, Object obj) throws IOException {
        resp.getWriter().write(GSON.toJson(obj));
    }
}
