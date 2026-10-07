/**
 * ============================================================================
 * Alumni Tracker — Web User Controller (UserController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (Web View & Page Lifecycle Handlers)
 * 
 * Description:
 *   Handles browser-facing web page routing, template/HTML delivery, and
 *   web application CRUD operations for Alumni users. Responsible for:
 *   - Serving static/HTML views (Home, About, Alumni Directory)
 *   - Web-facing CRUD operations (index, show, create, store, update, destroy)
 *   - Orchestrating View rendering with the underlying User Model
 * ============================================================================
 */

const path = require('path');
const User = require('../models/User');

class UserController {
  /**
   * [GET /]
   * Render/serve the portal landing page (Home view).
   */
  home(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  /**
   * [GET /about]
   * Render/serve the institutional about page view.
   */
  about(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
  }

  /**
   * [GET /alumni] or [GET /users]
   * Render/serve the interactive alumni directory dashboard view.
   */
  index(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'alumni.html'));
  }

  /**
   * [GET /users/:id]
   * Display single user detail view or return user representation.
   */
  show(req, res) {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="UTF-8"><title>User Not Found</title><link rel="stylesheet" href="/css/style.css"></head>
          <body style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:sans-serif;">
            <h1>404 — User Not Found</h1>
            <p>No alumni record exists with ID: ${req.params.id}</p>
            <a href="/alumni" style="color:#0A1628;font-weight:bold;margin-top:16px;">← Back to Directory</a>
          </body>
          </html>
        `);
      }

      // Return user profile summary card view
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${user.name} — Alumni Profile</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="padding: 40px; font-family: 'Inter', sans-serif; background: #F8FAFC;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <a href="/alumni" style="text-decoration:none; color:#1E3A8A; font-weight:600;">← Back to Directory</a>
            <h1 style="color: #0A1628; margin-top: 16px;">${user.name}</h1>
            <p style="color: #D4AF37; font-weight: 700; font-size: 1.1rem; margin-bottom: 24px;">${user.role || 'Alumni'} @ ${user.company || 'Not Specified'}</p>
            <hr style="border: 0; border-top: 1px solid #E2E8F0; margin-bottom: 24px;">
            <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
            <p><strong>Graduation Year:</strong> ${user.graduationYear || 'N/A'}</p>
            <p><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      return res.status(500).send('Internal server error loading profile');
    }
  }

  /**
   * [POST /users]
   * Web form submission handler for creating a new user (CRUD: Create).
   */
  store(req, res) {
    try {
      const newUser = User.create(req.body);
      // Redirect to directory upon successful creation in web flow
      if (typeof req.accepts === 'function' && req.accepts('html')) {
        return res.redirect('/alumni');
      }
      return res.redirect ? res.redirect('/alumni') : res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      return res.status(err.statusCode || 400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body style="font-family:sans-serif;padding:40px;">
          <h2>Submission Failed</h2>
          <p style="color:red;">${err.message}</p>
          <a href="/alumni">← Return to Alumni Directory</a>
        </body>
        </html>
      `);
    }
  }

  /**
   * [POST /users/:id/update]
   * Web form submission handler for updating a user (CRUD: Update).
   */
  update(req, res) {
    try {
      const updatedUser = User.update(req.params.id, req.body, true);
      if (typeof req.accepts === 'function' && req.accepts('html')) {
        return res.redirect(`/users/${updatedUser.id}`);
      }
      return res.redirect ? res.redirect(`/users/${updatedUser.id}`) : res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
      return res.status(err.statusCode || 400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Update Failed</title></head>
        <body style="font-family:sans-serif;padding:40px;">
          <h2>Update Failed</h2>
          <p style="color:red;">${err.message}</p>
          <a href="/alumni">← Return to Directory</a>
        </body>
        </html>
      `);
    }
  }

  /**
   * [POST /users/:id/delete]
   * Web form submission handler for deleting a user (CRUD: Delete).
   */
  destroy(req, res) {
    try {
      User.delete(req.params.id);
      if (typeof req.accepts === 'function' && req.accepts('html')) {
        return res.redirect('/alumni');
      }
      return res.redirect ? res.redirect('/alumni') : res.status(200).json({ success: true, message: 'Deleted' });
    } catch (err) {
      return res.status(err.statusCode || 404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Delete Failed</title></head>
        <body style="font-family:sans-serif;padding:40px;">
          <h2>Delete Failed</h2>
          <p style="color:red;">${err.message}</p>
          <a href="/alumni">← Return to Directory</a>
        </body>
        </html>
      `);
    }
  }
}

// Export singleton instance
module.exports = new UserController();
