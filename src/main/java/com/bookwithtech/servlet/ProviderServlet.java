package com.bookwithtech.servlet;

import com.bookwithtech.model.ProviderDetails;
import com.bookwithtech.service.ProviderService;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * GET  /api/providers           → list approved providers (public)
 * GET  /api/providers/pending   → admin: pending approval
 * GET  /api/providers/all       → admin: all providers
 * POST /api/providers/approve?id=X → admin approve
 * POST /api/providers/reject?id=X  → admin reject
 * POST /api/providers/register     → register new provider profile
 */
@WebServlet(urlPatterns = {"/api/providers", "/api/providers/*"})
public class ProviderServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Gson GSON = new Gson();
    private final ProviderService providerService = new ProviderService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            if ("/pending".equals(pathInfo)) {
                requireAdmin(req, resp);
                writeJson(resp, providerService.getPendingProviders());
            } else if ("/all".equals(pathInfo)) {
                requireAdmin(req, resp);
                writeJson(resp, providerService.getAllProviders());
            } else {
                // Public: approved providers only
                writeJson(resp, providerService.getApprovedProviders());
            }
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        try {
            if ("/approve".equals(pathInfo)) {
                requireAdmin(req, resp);
                int id = Integer.parseInt(req.getParameter("id"));
                providerService.approve(id);
                writeJson(resp, Map.of("success", true, "message", "Provider approved."));

            } else if ("/reject".equals(pathInfo)) {
                requireAdmin(req, resp);
                int id = Integer.parseInt(req.getParameter("id"));
                providerService.reject(id);
                writeJson(resp, Map.of("success", true, "message", "Provider rejected."));

            } else if ("/register".equals(pathInfo)) {
                // Provider registers their profile (must be logged in as Provider)
                HttpSession session = req.getSession(false);
                if (session == null || session.getAttribute("userId") == null) {
                    resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    writeJson(resp, Map.of("error", "Authentication required.")); return;
                }
                int userId = (int) session.getAttribute("userId");

                String businessName    = req.getParameter("businessName");
                String businessAddress = req.getParameter("businessAddress");
                String businessPhone   = req.getParameter("businessPhone");
                String openingStr      = req.getParameter("openingTime");
                String closingStr      = req.getParameter("closingTime");
                int avgService = Integer.parseInt(req.getParameter("avgServiceTime"));
                int perSlot    = Integer.parseInt(req.getParameter("perSlotCapacity"));

                LocalTime opening = openingStr != null ? LocalTime.parse(openingStr) : null;
                LocalTime closing = closingStr != null ? LocalTime.parse(closingStr) : null;

                int newId = providerService.registerProvider(userId, businessName, businessAddress,
                                businessPhone, opening, closing, avgService, perSlot);
                resp.setStatus(HttpServletResponse.SC_CREATED);
                writeJson(resp, Map.of("success", true, "providerId", newId,
                    "message", "Provider profile submitted for approval."));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                writeJson(resp, Map.of("error", "Unknown endpoint."));
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

    private static void requireAdmin(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        HttpSession s = req.getSession(false);
        String role = s != null ? (String) s.getAttribute("rolle") : null;
        if (!"Admin".equals(role)) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            writeJson(resp, Map.of("error", "Admin access required."));
            throw new IllegalStateException("Forbidden");
        }
    }

    private static void writeJson(HttpServletResponse resp, Object obj) throws IOException {
        resp.getWriter().write(GSON.toJson(obj));
    }
}
