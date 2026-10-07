/**
 * ============================================================================
 * Alumni Tracker — Web Announcement Controller (AnnouncementController)
 * ============================================================================
 * Architectural Layer: CONTROLLER (Web View & Request Lifecycle)
 * Author: Mehmet Raşid Ünlüel
 * Institution: Istanbul University (Management Information Systems / YBS, 3rd Year)
 * 
 * Description:
 *   Handles full browser-facing MVC CRUD operations and HTML view delivery
 *   for the Announcements resource without an external database connection:
 *   1. index()   - [GET /announcements]         Renders Announcement Management Interface
 *   2. create()  - [GET /announcements/create]  Renders new announcement authoring form view
 *   3. store()   - [POST /announcements]        Processes creation and redirects to /announcements
 *   4. show()    - [GET /announcements/:id]     Renders single announcement detail view
 *   5. edit()    - [GET /announcements/:id/edit] Renders pre-filled edit form view
 *   6. update()  - [POST /announcements/:id/update] Processes updates and redirects to /announcements/:id
 *   7. destroy() - [POST /announcements/:id/delete] Processes deletion and redirects to /announcements
 * ============================================================================
 */

const path = require('path');
const Announcement = require('../models/Announcement');

class AnnouncementController {
  /**
   * [GET /announcements]
   * [CRUD: READ ALL] Renders the Announcement Management Interface.
   */
  index(req, res) {
    res.sendFile(path.join(__dirname, '..', 'public', 'announcements.html'));
  }

  /**
   * [GET /announcements/create]
   * [CRUD: CREATE FORM] Renders the HTML form view to author a new announcement.
   */
  create(req, res) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Create Announcement — Alumni Tracker</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body style="background: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; color: #1E293B;">
        <div style="max-width: 680px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(10, 22, 40, 0.08); border: 1px solid #E2E8F0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <a href="/announcements" style="color: #0A1628; text-decoration: none; font-weight: 600; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
              ← Back to Management
            </a>
            <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">Istanbul University YBS</span>
          </div>

          <h1 style="color: #0A1628; font-size: 1.8rem; margin-bottom: 8px;">📢 Author New Announcement</h1>
          <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 28px;">Publish an official campus notice, career opportunity, or alumni event.</p>

          <form action="/announcements" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Title <span style="color:#DC2626;">*</span></label>
              <input type="text" name="title" required placeholder="e.g. Annual Alumni Gala & Reunion 2026" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Category</label>
                <select name="category" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; background: #fff;">
                  <option value="General">General</option>
                  <option value="Event">Event</option>
                  <option value="Career">Career</option>
                  <option value="Academic">Academic</option>
                  <option value="Networking">Networking</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Priority Level</label>
                <select name="priority" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; background: #fff;">
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Publication Status</label>
                <select name="status" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; background: #fff;">
                  <option value="published" selected>Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Target Audience</label>
                <input type="text" name="targetAudience" placeholder="e.g. All Alumni, YBS Students" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Author / Issuing Body</label>
              <input type="text" name="author" placeholder="Istanbul University Alumni Office" value="Istanbul University Alumni Office" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Announcement Content <span style="color:#DC2626;">*</span></label>
              <textarea name="content" required rows="5" placeholder="Provide full details of the notice..." style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; font-family: inherit;"></textarea>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="pinned" name="pinned" value="true" style="width: auto;">
              <label for="pinned" style="font-size: 0.9rem; font-weight: 600; color: #334155; cursor: pointer;">Pin announcement to top of listings</label>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 12px;">
              <button type="submit" style="flex: 1; background: #0A1628; color: #FFFFFF; border: none; padding: 14px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                Publish Announcement
              </button>
              <a href="/announcements" style="background: #F1F5F9; color: #475569; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-size: 1rem; font-weight: 600; display: inline-flex; align-items: center;">
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
   * [POST /announcements]
   * [CRUD: STORE] Process form submission, persist via Announcement Model, and redirect.
   */
  store(req, res) {
    try {
      Announcement.create(req.body);
      return res.redirect(302, '/announcements');
    } catch (err) {
      return res.status(err.statusCode || 400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Announcement Creation Error</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="background: #F8FAFC; font-family: 'Inter', sans-serif; padding: 60px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
            <h2 style="color: #DC2626; margin-bottom: 8px;">Creation Failed</h2>
            <p style="color: #64748B; margin-bottom: 24px;">${err.message}</p>
            <a href="/announcements/create" style="background: #0A1628; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: inline-block;">
              Return to Form
            </a>
          </div>
        </body>
        </html>
      `);
    }
  }

  /**
   * [GET /announcements/:id]
   * [CRUD: READ ONE / SHOW] Detail view for an announcement.
   */
  show(req, res) {
    const item = Announcement.findById(req.params.id);

    if (!item) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Announcement Not Found</title>
          <link rel="stylesheet" href="/css/style.css">
        </head>
        <body style="background: #F8FAFC; font-family: 'Inter', sans-serif; padding: 80px 20px; text-align: center;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 16px; border: 1px solid #E2E8F0;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
            <h2 style="color: #0A1628;">Announcement Not Found</h2>
            <p style="color: #64748B; margin-bottom: 24px;">The requested announcement with ID #${req.params.id} does not exist.</p>
            <a href="/announcements" style="background: #0A1628; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600;">
              Return to Management
            </a>
          </div>
        </body>
        </html>
      `);
    }

    const priorityColors = {
      urgent: { bg: '#FFF1F2', text: '#E11D48', border: '#FFE4E6' },
      high: { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7' },
      medium: { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE' },
      low: { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' }
    };
    const pStyle = priorityColors[item.priority] || priorityColors.medium;
    const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${item.title} — Alumni Tracker</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body style="background: #F8FAFC; font-family: 'Inter', sans-serif; padding: 40px 20px; color: #1E293B;">
        <div style="max-width: 780px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(10, 22, 40, 0.08); border: 1px solid #E2E8F0;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
            <a href="/announcements" style="color: #0A1628; text-decoration: none; font-weight: 600; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
              ← Back to Management
            </a>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="background: #EFF6FF; color: #2563EB; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                ${item.category}
              </span>
              <span style="background: ${pStyle.bg}; color: ${pStyle.text}; border: 1px solid ${pStyle.border}; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                ● ${item.priority.toUpperCase()}
              </span>
              <span style="background: #ECFDF5; color: #059669; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                ${item.status}
              </span>
            </div>
          </div>

          <h1 style="color: #0A1628; font-size: 2.1rem; line-height: 1.3; margin: 0 0 16px 0;">
            ${item.pinned ? '📌 ' : ''}${item.title}
          </h1>

          <div style="display: flex; gap: 24px; color: #64748B; font-size: 0.9rem; padding-bottom: 20px; border-bottom: 1px solid #E2E8F0; margin-bottom: 28px; flex-wrap: wrap;">
            <div><strong>Author:</strong> ${item.author}</div>
            <div><strong>Target:</strong> ${item.targetAudience}</div>
            <div><strong>Published:</strong> ${dateFormatted}</div>
          </div>

          <div style="color: #334155; font-size: 1.05rem; line-height: 1.7; margin-bottom: 36px; white-space: pre-wrap;">${item.content}</div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid #E2E8F0;">
            <a href="/announcements/${item.id}/edit" style="background: #2563EB; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600;">
              Edit Announcement
            </a>
            <form action="/announcements/${item.id}/delete" method="POST" onsubmit="return confirm('Permanently delete this announcement?');" style="margin: 0;">
              <button type="submit" style="background: #DC2626; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                Delete Notice
              </button>
            </form>
          </div>

        </div>
      </body>
      </html>
    `);
  }

  /**
   * [GET /announcements/:id/edit]
   * [CRUD: EDIT FORM] Form view to update an existing announcement.
   */
  edit(req, res) {
    const item = Announcement.findById(req.params.id);

    if (!item) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Announcement Not Found</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 60px;">
          <h2>Announcement Not Found</h2>
          <p>Target ID #${req.params.id} does not exist.</p>
          <a href="/announcements">Return to Management</a>
        </body>
        </html>
      `);
    }

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit Announcement #${item.id} — Alumni Tracker</title>
        <link rel="stylesheet" href="/css/style.css">
      </head>
      <body style="background: #F8FAFC; font-family: 'Inter', sans-serif; padding: 40px 20px; color: #1E293B;">
        <div style="max-width: 680px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; padding: 36px; box-shadow: 0 10px 30px rgba(10, 22, 40, 0.08); border: 1px solid #E2E8F0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <a href="/announcements/${item.id}" style="color: #0A1628; text-decoration: none; font-weight: 600; font-size: 0.95rem;">
              ← Back to Details
            </a>
            <span style="background: #EFF6FF; color: #2563EB; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">Announcement ID #${item.id}</span>
          </div>

          <h1 style="color: #0A1628; font-size: 1.8rem; margin-bottom: 8px;">✏️ Edit Announcement</h1>
          <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 28px;">Modify notice attributes, audience, and priority classification.</p>

          <form action="/announcements/${item.id}/update" method="POST" style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Title <span style="color:#DC2626;">*</span></label>
              <input type="text" name="title" required value="${item.title.replace(/"/g, '&quot;')}" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Category</label>
                <select name="category" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; background: #fff;">
                  <option value="General" ${item.category === 'General' ? 'selected' : ''}>General</option>
                  <option value="Event" ${item.category === 'Event' ? 'selected' : ''}>Event</option>
                  <option value="Career" ${item.category === 'Career' ? 'selected' : ''}>Career</option>
                  <option value="Academic" ${item.category === 'Academic' ? 'selected' : ''}>Academic</option>
                  <option value="Networking" ${item.category === 'Networking' ? 'selected' : ''}>Networking</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Priority Level</label>
                <select name="priority" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; background: #fff;">
                  <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low</option>
                  <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Medium</option>
                  <option value="high" ${item.priority === 'high' ? 'selected' : ''}>High</option>
                  <option value="urgent" ${item.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Publication Status</label>
                <select name="status" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; background: #fff;">
                  <option value="published" ${item.status === 'published' ? 'selected' : ''}>Published</option>
                  <option value="draft" ${item.status === 'draft' ? 'selected' : ''}>Draft</option>
                  <option value="archived" ${item.status === 'archived' ? 'selected' : ''}>Archived</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Target Audience</label>
                <input type="text" name="targetAudience" value="${(item.targetAudience || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Author / Issuing Body</label>
              <input type="text" name="author" value="${(item.author || '').replace(/"/g, '&quot;')}" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box;">
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 6px;">Announcement Content <span style="color:#DC2626;">*</span></label>
              <textarea name="content" required rows="5" style="width: 100%; padding: 11px 14px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 0.95rem; box-sizing: border-box; font-family: inherit;">${item.content.replace(/</g, '&lt;')}</textarea>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="pinned" name="pinned" value="true" ${item.pinned ? 'checked' : ''} style="width: auto;">
              <label for="pinned" style="font-size: 0.9rem; font-weight: 600; color: #334155; cursor: pointer;">Pin announcement to top of listings</label>
            </div>

            <div style="display: flex; gap: 12px; margin-top: 12px;">
              <button type="submit" style="flex: 1; background: #2563EB; color: #FFFFFF; border: none; padding: 14px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer;">
                Save Changes
              </button>
              <a href="/announcements/${item.id}" style="background: #F1F5F9; color: #475569; text-decoration: none; padding: 14px 20px; border-radius: 10px; font-size: 1rem; font-weight: 600; display: inline-flex; align-items: center;">
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
   * [POST /announcements/:id/update]
   * [CRUD: UPDATE] Process form updates and redirect to announcement view.
   */
  update(req, res) {
    try {
      Announcement.update(req.params.id, req.body, false);
      return res.redirect(302, `/announcements/${req.params.id}`);
    } catch (err) {
      return res.status(err.statusCode || 400).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Update Error</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 60px;">
          <h2 style="color: #DC2626;">Update Failed</h2>
          <p>${err.message}</p>
          <a href="/announcements/${req.params.id}/edit">Return to Edit Form</a>
        </body>
        </html>
      `);
    }
  }

  /**
   * [POST /announcements/:id/delete]
   * [CRUD: DESTROY] Delete announcement and redirect to management interface.
   */
  destroy(req, res) {
    try {
      Announcement.delete(req.params.id);
      return res.redirect(302, '/announcements');
    } catch (err) {
      return res.status(err.statusCode || 404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Deletion Error</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding: 60px;">
          <h2 style="color: #DC2626;">Deletion Failed</h2>
          <p>${err.message}</p>
          <a href="/announcements">Return to Management</a>
        </body>
        </html>
      `);
    }
  }
}

// Export singleton instance
module.exports = new AnnouncementController();
