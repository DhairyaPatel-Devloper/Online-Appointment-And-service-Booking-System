package com.bookwithtech.servlet;

import com.bookwithtech.model.User;
import com.bookwithtech.service.UserService;
import com.bookwithtech.service.UserServiceImpl;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import java.util.Optional;

/**
 * PRESENTATION LAYER — Login Servlet.
 *
 * POST /api/auth/login   { email, password }  → sets session, returns JSON
 * POST /api/auth/logout                        → invalidates session
 * GET  /api/auth/me                            → returns current session user or 401
 *
 * ⚠️  No SQL here. No business logic here. Only HTTP parsing → service call → response.
 *
 * NOTE: If running Tomcat 9 / javax.servlet, change all
 *       jakarta.* imports to javax.*.
 */
@WebServlet(urlPatterns = {"/api/auth/login", "/api/auth/logout", "/api/auth/me"})
public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Gson GSON = new Gson();

    private final UserService userService = new UserServiceImpl();

    // ── POST ────────────────────────────────────────────────────────────────

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        String path = req.getServletPath();
        resp.setContentType("application/json;charset=UTF-8");

        if ("/api/auth/login".equals(path)) {
            handleLogin(req, resp);
        } else if ("/api/auth/logout".equals(path)) {
            handleLogout(req, resp);
        } else {
            resp.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            writeJson(resp, Map.of("error", "Method not allowed on this path."));
        }
    }

    // ── GET ─────────────────────────────────────────────────────────────────

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");

        if ("/api/auth/me".equals(req.getServletPath())) {
            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                writeJson(resp, Map.of("error", "Not authenticated."));
                return;
            }
            writeJson(resp, Map.of(
                "userId",    session.getAttribute("userId"),
                "firstName", session.getAttribute("firstName"),
                "rolle",     session.getAttribute("rolle")
            ));
        } else {
            resp.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
        }
    }

    // ── Handlers ────────────────────────────────────────────────────────────

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        String email    = req.getParameter("email");
        String password = req.getParameter("password");

        if (isBlank(email) || isBlank(password)) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", "Email and password are required."));
            return;
        }

        try {
            Optional<User> result = userService.login(email, password);
            if (result.isEmpty()) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                writeJson(resp, Map.of("error", "Invalid email or password."));
                return;
            }

            User user = result.get();

            // Establish session
            HttpSession session = req.getSession(true);
            session.setAttribute("userId",    user.getUserId());
            session.setAttribute("firstName", user.getFirstName());
            session.setAttribute("rolle",     user.getRolle());
            session.setMaxInactiveInterval(30 * 60); // 30 min

            resp.setStatus(HttpServletResponse.SC_OK);
            writeJson(resp, Map.of(
                "success",   true,
                "userId",    user.getUserId(),
                "firstName", user.getFirstName(),
                "rolle",     user.getRolle()
            ));

        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "Database error during login: " + e.getMessage()));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", e.getMessage()));
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
        resp.setStatus(HttpServletResponse.SC_OK);
        writeJson(resp, Map.of("success", true, "message", "Logged out."));
    }

    // ── Utilities ────────────────────────────────────────────────────────────

    private static void writeJson(HttpServletResponse resp, Object obj) throws IOException {
        resp.getWriter().write(GSON.toJson(obj));
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
