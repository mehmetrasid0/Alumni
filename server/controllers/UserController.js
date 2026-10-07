/**
 * ============================================================================
 * Alumni Tracker — Web User Controller (UserController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (Web View & Request Lifecycle)
 * 
 * Description:
 *   Handles full browser-facing MVC CRUD operations and HTML view delivery
 *   for the Alumni Users resource:
 *   1. index()   - [GET /users]        List all alumni (Directory View)
 *   2. create()  - [GET /users/create] Render new alumnus registration form view
 *   3. store()   - [POST /users]       Process registration and redirect to /users
 *   4. show()    - [GET /users/:id]    Render single alumnus profile view
 *   5. edit()    - [GET /users/:id/edit] Render pre-filled edit form view
 *   6. update()  - [POST /users/:id/update] Process updates and redirect to /users/:id
 *   7. destroy() - [POST /users/:id/delete] Process deletion and redirect to /users
 *   Plus static portal pages: home() and about()
 * ============================================================================
 */

const path = require('path');
const User = require('../models/User');

class UserController {
  /**
   * [GET /]
   * Portal landing page view.
   */
  home(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }

  /**
   * [GET /about]
   * Institutional about page view.
   */
  about(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'about.html'));
  }

  /**
   * [GET /users] or [GET /alumni]
   * [CRUD: READ ALL] Renders the Alumni Directory listing view.
   */
  index(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'alumni.html'));
  }

  /**
   * [GET /users/create] or [GET /users/new]
   * [CRUD: CREATE FORM] Renders the HTML form view to register a new alumnus.
   */
  create(req, res) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Add New Alumnus — Alumni Tracker</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body style="background: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; color: #1E293B;">
        <div style="max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(10, 22, 40, 0.08); border: 1px solid #E2E8F0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <a href="/users" style="color: #0A1628; text-decoration: none; font-weight: 600; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
              ← Back to Directory
            </a>
            <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">Istanbul University YBS</span>
          </div>

          <h1 style="color: #0A1628; font-size: 1.8rem; margin-bottom: 8px;">🎓 Add New Alumnus</h1>
          <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 28px;">Fill in the alumni details below to persist a new record to the directory.</p>

          <form action="/users" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Full Name <span style="color:#DC2626;">*</span></label>
                <input type="text" name="name" required placeholder="e.g. Ayse Yilmaz" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Email Address <span style="color:#DC2626;">*</span></label>
                <input type="email" name="email" required placeholder="e.g. ayse@alumni.edu" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Graduation Year</label>
                <input type="number" name="graduationYear" placeholder="2024" min="1990" max="2030" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Academic Department</label>
                <input type="text" name="department" placeholder="Management Information Systems" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Current Company</label>
                <input type="text" name="company" placeholder="e.g. Google, Amazon" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Job Role / Position</label>
                <input type="text" name="role" placeholder="e.g. Software Engineer" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 12px;">
              <button type="submit" style="flex: 1; padding: 13px; background: #0A1628; color: #D4AF37; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: opacity 0.2s;">
                💾 Save Alumnus
              </button>
              <a href="/users" style="padding: 13px 24px; background: #F1F5F9; color: #475569; text-decoration: none; border-radius: 10px; font-weight: 600; text-align: center;">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </body>
      </html>
    `);
  }

  /**
   * [POST /users]
   * [CRUD: STORE / CREATE] Processes web form submission and redirects to /users.
   */
  store(req, res) {
    try {
      const newUser = User.create(req.body);
      if (typeof req.accepts === 'function' && req.accepts('html')) {
        return res.redirect('/users');
      }
      return res.redirect ? res.redirect('/users') : res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      return res.status(err.statusCode || 400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Submission Failed — Alumni Tracker</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="padding: 40px 20px; font-family: 'Inter', sans-serif; background: #F8FAFC;">
          <div style="max-width: 520px; margin: 60px auto; background: white; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">⚠️</div>
            <h2 style="color: #DC2626; margin-bottom: 10px;">Submission Failed</h2>
            <p style="color: #475569; margin-bottom: 24px; font-size: 0.95rem;">${err.message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <a href="/users/create" style="display: inline-block; padding: 11px 20px; background: #0A1628; color: #D4AF37; text-decoration: none; border-radius: 10px; font-weight: 600;">← Back to Form</a>
              <a href="/users" style="display: inline-block; padding: 11px 20px; background: #F1F5F9; color: #475569; text-decoration: none; border-radius: 10px; font-weight: 600;">Directory</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  }

  /**
   * [GET /users/:id]
   * [CRUD: READ ONE] Renders detailed profile view with Edit and Delete action controls.
   */
  show(req, res) {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>User Not Found — Alumni Tracker</title>
            <link rel="stylesheet" href="/css/style.css">
          </head>
          <body style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; font-family: 'Inter', sans-serif; background: #F8FAFC;">
            <div style="max-width: 480px; text-align: center; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
              <h1 style="color: #0A1628; font-size: 1.6rem; margin-bottom: 8px;">404 — User Not Found</h1>
              <p style="color: #64748B; margin-bottom: 24px;">No alumni record exists with ID: <strong>${req.params.id}</strong></p>
              <a href="/users" style="display: inline-block; padding: 10px 24px; background: #0A1628; color: #D4AF37; text-decoration: none; border-radius: 10px; font-weight: 600;">← Back to Directory</a>
            </div>
          </body>
          </html>
        `);
      }

      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${user.name} — Alumni Profile</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="padding: 40px 20px; font-family: 'Inter', sans-serif; background: #F8FAFC;">
          <div style="max-width: 620px; margin: 0 auto; background: white; border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(10, 22, 40, 0.08); border: 1px solid #E2E8F0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <a href="/users" style="text-decoration: none; color: #0A1628; font-weight: 600; font-size: 0.95rem;">← Back to Directory</a>
              <span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700;">ID #${user.id}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
              <div style="width: 70px; height: 70px; border-radius: 18px; background: linear-gradient(135deg, #0A1628, #1E3A8A); color: #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; font-weight: 700;">
                ${user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 style="color: #0A1628; font-size: 1.8rem; margin: 0 0 6px 0;">${user.name}</h1>
                <p style="color: #D4AF37; font-weight: 700; font-size: 1.05rem; margin: 0;">${user.role || 'Alumni'} @ ${user.company || 'Not Specified'}</p>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #E2E8F0; margin-bottom: 24px;">

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px;">
              <div style="background: #F8FAFC; padding: 16px; border-radius: 12px;">
                <div style="font-size: 0.8rem; color: #64748B; font-weight: 600; text-transform: uppercase;">Department</div>
                <div style="font-size: 1rem; color: #0A1628; font-weight: 600; margin-top: 4px;">${user.department || 'N/A'}</div>
              </div>
              <div style="background: #F8FAFC; padding: 16px; border-radius: 12px;">
                <div style="font-size: 0.8rem; color: #64748B; font-weight: 600; text-transform: uppercase;">Graduation Year</div>
                <div style="font-size: 1rem; color: #0A1628; font-weight: 600; margin-top: 4px;">${user.graduationYear || 'N/A'}</div>
              </div>
              <div style="background: #F8FAFC; padding: 16px; border-radius: 12px; grid-column: span 2;">
                <div style="font-size: 0.8rem; color: #64748B; font-weight: 600; text-transform: uppercase;">Email Address</div>
                <div style="font-size: 1rem; margin-top: 4px;">
                  <a href="mailto:${user.email}" style="color: #1E3A8A; font-weight: 600; text-decoration: none;">${user.email}</a>
                </div>
              </div>
            </div>

            <!-- Action Controls (Edit & Delete) -->
            <div style="display: flex; gap: 12px; border-top: 1px solid #E2E8F0; padding-top: 24px;">
              <a href="/users/${user.id}/edit" style="flex: 1; text-align: center; padding: 12px; background: #0A1628; color: #D4AF37; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 0.95rem;">
                ✏️ Edit Alumnus
              </a>
              <form action="/users/${user.id}/delete" method="POST" style="flex: 1; margin: 0;" onsubmit="return confirm('Are you sure you want to delete ${user.name}?');">
                <button type="submit" style="width: 100%; padding: 12px; background: #FEE2E2; color: #DC2626; border: 1px solid #FECACA; border-radius: 10px; font-weight: 700; font-size: 0.95rem; cursor: pointer;">
                  🗑️ Delete Alumnus
                </button>
              </form>
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      return res.status(500).send('Internal server error loading profile');
    }
  }

  /**
   * [GET /users/:id/edit]
   * [CRUD: EDIT FORM] Renders the pre-filled HTML form view to modify an existing alumnus.
   */
  edit(req, res) {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head><meta charset="UTF-8"><title>Not Found</title></head>
          <body style="padding: 40px; font-family: sans-serif; text-align: center;">
            <h2>Alumnus #${req.params.id} Not Found</h2>
            <a href="/users">Return to Directory</a>
          </body>
          </html>
        `);
      }

      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Edit ${user.name} — Alumni Tracker</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="background: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; color: #1E293B;">
          <div style="max-width: 650px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(10, 22, 40, 0.08); border: 1px solid #E2E8F0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
              <a href="/users/${user.id}" style="color: #0A1628; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
                ← Cancel & Return
              </a>
              <span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700;">Editing ID #${user.id}</span>
            </div>

            <h1 style="color: #0A1628; font-size: 1.8rem; margin-bottom: 8px;">✏️ Edit Alumnus Profile</h1>
            <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 28px;">Update the profile fields below and submit to save changes.</p>

            <form action="/users/${user.id}/update" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Full Name <span style="color:#DC2626;">*</span></label>
                  <input type="text" name="name" value="${user.name}" required style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Email Address <span style="color:#DC2626;">*</span></label>
                  <input type="email" name="email" value="${user.email}" required style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Graduation Year</label>
                  <input type="number" name="graduationYear" value="${user.graduationYear || ''}" placeholder="2024" min="1990" max="2030" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Academic Department</label>
                  <input type="text" name="department" value="${user.department || ''}" placeholder="Management Information Systems" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Current Company</label>
                  <input type="text" name="company" value="${user.company || ''}" placeholder="e.g. Google" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
                </div>
                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Job Role / Position</label>
                  <input type="text" name="role" value="${user.role || ''}" placeholder="e.g. Software Engineer" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
                </div>
              </div>

              <div style="display: flex; gap: 12px; margin-top: 12px;">
                <button type="submit" style="flex: 1; padding: 13px; background: #0A1628; color: #D4AF37; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer;">
                  💾 Save Changes
                </button>
                <a href="/users/${user.id}" style="padding: 13px 24px; background: #F1F5F9; color: #475569; text-decoration: none; border-radius: 10px; font-weight: 600; text-align: center;">
                  Cancel
                </a>
              </div>
            </form>
          </div>
        </body>
        </html>
      `);
    } catch (err) {
      return res.status(500).send('Internal server error loading edit form');
    }
  }

  /**
   * [POST /users/:id/update]
   * [CRUD: UPDATE] Processes form updates and redirects to /users/:id.
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
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Update Failed — Alumni Tracker</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="padding: 40px 20px; font-family: 'Inter', sans-serif; background: #F8FAFC;">
          <div style="max-width: 500px; margin: 60px auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">⚠️</div>
            <h2 style="color: #DC2626; margin-bottom: 12px;">Update Failed</h2>
            <p style="color: #475569; margin-bottom: 24px;">${err.message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
              <a href="/users/${req.params.id}/edit" style="display: inline-block; padding: 10px 20px; background: #0A1628; color: #D4AF37; text-decoration: none; border-radius: 8px; font-weight: 600;">← Back to Edit</a>
              <a href="/users" style="display: inline-block; padding: 10px 20px; background: #F1F5F9; color: #475569; text-decoration: none; border-radius: 8px; font-weight: 600;">Directory</a>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  }

  /**
   * [POST /users/:id/delete] or [GET /users/:id/delete]
   * [CRUD: DESTROY / DELETE] Deletes the user record and redirects to /users.
   */
  destroy(req, res) {
    try {
      User.delete(req.params.id);
      if (typeof req.accepts === 'function' && req.accepts('html')) {
        return res.redirect('/users');
      }
      return res.redirect ? res.redirect('/users') : res.status(200).json({ success: true, message: 'Deleted' });
    } catch (err) {
      return res.status(err.statusCode || 404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Delete Failed — Alumni Tracker</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="padding: 40px 20px; font-family: 'Inter', sans-serif; background: #F8FAFC;">
          <div style="max-width: 500px; margin: 60px auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">⚠️</div>
            <h2 style="color: #DC2626; margin-bottom: 12px;">Delete Failed</h2>
            <p style="color: #475569; margin-bottom: 24px;">${err.message}</p>
            <a href="/users" style="display: inline-block; padding: 10px 24px; background: #0A1628; color: #D4AF37; text-decoration: none; border-radius: 8px; font-weight: 600;">← Return to Directory</a>
          </div>
        </body>
        </html>
      `);
    }
  }
}

// Export singleton instance
module.exports = new UserController();
