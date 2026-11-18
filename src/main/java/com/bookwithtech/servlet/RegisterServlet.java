package com.bookwithtech.servlet;

import com.bookwithtech.service.UserService;
import com.bookwithtech.service.UserServiceImpl;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

/**
 * POST /api/auth/register  { firstName, lastName, email, password, phone, rolle }
 */
@WebServlet("/api/auth/register")
public class RegisterServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private static final Gson GSON = new Gson();
    private final UserService userService = new UserServiceImpl();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        resp.setContentType("application/json;charset=UTF-8");

        String firstName = req.getParameter("firstName");
        String lastName  = req.getParameter("lastName");
        String email     = req.getParameter("email");
        String password  = req.getParameter("password");
        String phone     = req.getParameter("phone");
        String rolle     = req.getParameter("rolle");

        if (rolle == null || rolle.isBlank()) rolle = "Customer";  // default role

        try {
            int newUserId = userService.register(firstName, lastName, email, password, phone, rolle);
            resp.setStatus(HttpServletResponse.SC_CREATED);
            writeJson(resp, Map.of("success", true, "userId", newUserId,
                                   "message", "Registration successful. Please log in."));

        } catch (IllegalArgumentException | IllegalStateException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            writeJson(resp, Map.of("error", e.getMessage()));
        } catch (SQLException e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            writeJson(resp, Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    private static void writeJson(HttpServletResponse resp, Object obj) throws IOException {
        resp.getWriter().write(GSON.toJson(obj));
    }
}
