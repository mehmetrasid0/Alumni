/**
 * ============================================================================
 * Alumni Tracker — Announcement Model (In-Memory / No Database Required)
 * ============================================================================
 * Architectural Layer: MODEL (M in MVC)
 * Author: Mehmet Raşid Ünlüel
 * Institution: Istanbul University (Management Information Systems / YBS, 3rd Year)
 * 
 * Description:
 *   Self-contained Announcement Model encapsulating all data operations,
 *   validation rules, filtering, and state management without requiring an
 *   external database connection.
 *   Provides full CRUD operations (Create, Read, Update, Delete) with built-in
 *   error handling, category classification, priority tagging, and search.
 * ============================================================================
 */

class AnnouncementModel {
  constructor() {
    this.reset();
  }

  // ==========================================================================
  // [READ] Queries
  // ==========================================================================

  /**
   * Retrieve all announcements, with optional filtering criteria.
   * Sorted by pinned status (descending) followed by creation timestamp (newest first).
   * 
   * @param {Object} [filters] - Query filters (query/q, category, status, priority)
   * @returns {Array<Object>} List of cloned announcement objects
   */
  findAll(filters = {}) {
    let result = [...this._announcements];

    // Filter by keyword query (matches title, content, author, or category)
    const searchTerm = filters.query || filters.q;
    if (searchTerm) {
      const q = String(searchTerm).toLowerCase().trim();
      result = result.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (a.author && a.author.toLowerCase().includes(q)) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.targetAudience && a.targetAudience.toLowerCase().includes(q))
      );
    }

    // Filter by category (e.g. Event, Career, Academic, General, Networking)
    if (filters.category && filters.category !== 'all') {
      const cat = String(filters.category).toLowerCase().trim();
      result = result.filter(a => a.category && a.category.toLowerCase() === cat);
    }

    // Filter by status (published, draft, archived)
    if (filters.status && filters.status !== 'all') {
      const st = String(filters.status).toLowerCase().trim();
      result = result.filter(a => a.status && a.status.toLowerCase() === st);
    }

    // Filter by priority (low, medium, high, urgent)
    if (filters.priority && filters.priority !== 'all') {
      const pr = String(filters.priority).toLowerCase().trim();
      result = result.filter(a => a.priority && a.priority.toLowerCase() === pr);
    }

    // Order: Pinned announcements first, then descending by createdAt timestamp
    result.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Return shallow clones to maintain immutable state
    return result.map(a => ({ ...a }));
  }

  /**
   * Find a single announcement by primary numeric ID.
   * @param {number|string} id - The announcement ID
   * @returns {Object|null} Cloned announcement object or null if not found
   */
  findById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const item = this._announcements.find(a => a.id === numericId);
    return item ? { ...item } : null;
  }

  /**
   * Return the total count of announcements currently stored.
   * @param {Object} [filters] - Optional filter object
   * @returns {number}
   */
  count(filters = {}) {
    return this.findAll(filters).length;
  }

  // ==========================================================================
  // [CREATE] Creation
  // ==========================================================================

  /**
   * Create a new announcement record.
   * @param {Object} data - Announcement attributes
   * @returns {Object} Newly created announcement entity
   * @throws {Error} If validation fails
   */
  create(data) {
    if (!data || typeof data !== 'object') {
      const err = new Error('Invalid announcement payload');
      err.statusCode = 400;
      throw err;
    }

    const {
      title,
      content,
      category = 'General',
      priority = 'medium',
      status = 'published',
      author = 'Istanbul University Alumni Office',
      targetAudience = 'All Alumni',
      pinned = false
    } = data;

    // Validate mandatory fields
    if (!title || !String(title).trim()) {
      const err = new Error('Title is a mandatory field');
      err.statusCode = 400;
      throw err;
    }

    if (!content || !String(content).trim()) {
      const err = new Error('Content is a mandatory field');
      err.statusCode = 400;
      throw err;
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    const normalizedPriority = String(priority).toLowerCase().trim();
    const finalPriority = validPriorities.includes(normalizedPriority) ? normalizedPriority : 'medium';

    const validStatuses = ['published', 'draft', 'archived'];
    const normalizedStatus = String(status).toLowerCase().trim();
    const finalStatus = validStatuses.includes(normalizedStatus) ? normalizedStatus : 'published';

    const isPinned = pinned === true || pinned === 'true' || pinned === 'on' || pinned === 1 || pinned === '1';

    const newAnnouncement = {
      id: this._nextId++,
      title: String(title).trim(),
      content: String(content).trim(),
      category: String(category).trim() || 'General',
      priority: finalPriority,
      status: finalStatus,
      author: String(author).trim() || 'Istanbul University Alumni Office',
      targetAudience: String(targetAudience).trim() || 'All Alumni',
      pinned: isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    this._announcements.push(newAnnouncement);
    return { ...newAnnouncement };
  }

  // ==========================================================================
  // [UPDATE] Modification
  // ==========================================================================

  /**
   * Fully update (PUT) or partially update (PATCH) an existing announcement.
   * @param {number|string} id - The announcement ID
   * @param {Object} updateData - Attributes to update
   * @param {boolean} [isPartial=false] - True for PATCH, False for full PUT replacement
   * @returns {Object} Updated announcement object
   * @throws {Error} If announcement not found or validation fails
   */
  update(id, updateData, isPartial = false) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = new Error('Invalid announcement ID parameter');
      err.statusCode = 400;
      throw err;
    }

    const index = this._announcements.findIndex(a => a.id === numericId);
    if (index === -1) {
      const err = new Error(`Announcement with ID ${numericId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const {
      title,
      content,
      category,
      priority,
      status,
      author,
      targetAudience,
      pinned
    } = updateData || {};

    if (!isPartial) {
      // Full PUT replacement requires both title and content
      if (!title || !String(title).trim()) {
        const err = new Error('PUT requests require a title field');
        err.statusCode = 400;
        throw err;
      }
      if (!content || !String(content).trim()) {
        const err = new Error('PUT requests require a content field');
        err.statusCode = 400;
        throw err;
      }
    }

    const target = this._announcements[index];

    if (isPartial) {
      // Selective PATCH updates
      if (title !== undefined) target.title = String(title).trim();
      if (content !== undefined) target.content = String(content).trim();
      if (category !== undefined) target.category = String(category).trim();
      if (author !== undefined) target.author = String(author).trim();
      if (targetAudience !== undefined) target.targetAudience = String(targetAudience).trim();

      if (priority !== undefined) {
        const normPr = String(priority).toLowerCase().trim();
        if (['low', 'medium', 'high', 'urgent'].includes(normPr)) target.priority = normPr;
      }

      if (status !== undefined) {
        const normSt = String(status).toLowerCase().trim();
        if (['published', 'draft', 'archived'].includes(normSt)) target.status = normSt;
      }

      if (pinned !== undefined) {
        target.pinned = pinned === true || pinned === 'true' || pinned === 'on' || pinned === 1 || pinned === '1';
      }

      target.updatedAt = new Date().toISOString();
      return { ...target };
    } else {
      // Full PUT replacement
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      const normalizedPriority = priority ? String(priority).toLowerCase().trim() : 'medium';
      const finalPriority = validPriorities.includes(normalizedPriority) ? normalizedPriority : 'medium';

      const validStatuses = ['published', 'draft', 'archived'];
      const normalizedStatus = status ? String(status).toLowerCase().trim() : 'published';
      const finalStatus = validStatuses.includes(normalizedStatus) ? normalizedStatus : 'published';

      const isPinned = pinned === true || pinned === 'true' || pinned === 'on' || pinned === 1 || pinned === '1';

      const updated = {
        id: numericId,
        title: String(title).trim(),
        content: String(content).trim(),
        category: category ? String(category).trim() : (target.category || 'General'),
        priority: finalPriority,
        status: finalStatus,
        author: author ? String(author).trim() : (target.author || 'Istanbul University Alumni Office'),
        targetAudience: targetAudience ? String(targetAudience).trim() : (target.targetAudience || 'All Alumni'),
        pinned: isPinned,
        createdAt: target.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this._announcements[index] = updated;
      return { ...updated };
    }
  }

  // ==========================================================================
  // [DELETE] Removal
  // ==========================================================================

  /**
   * Delete an announcement by primary ID.
   * @param {number|string} id - The announcement ID
   * @returns {Object} Deleted announcement object
   * @throws {Error} If announcement not found
   */
  delete(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = new Error('Invalid announcement ID parameter');
      err.statusCode = 400;
      throw err;
    }

    const index = this._announcements.findIndex(a => a.id === numericId);
    if (index === -1) {
      const err = new Error(`Announcement with ID ${numericId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const [deletedItem] = this._announcements.splice(index, 1);
    return { ...deletedItem };
  }

  // ==========================================================================
  // [SEED] State Management & Testing
  // ==========================================================================

  /**
   * Reset store to initial seed announcements.
   * @returns {void}
   */
  reset() {
    this._announcements = [
      {
        id: 1,
        title: 'Annual Alumni Homecoming & Networking Gala 2026',
        content: 'Join us on the historic Beyazit Campus for the annual Istanbul University Alumni Reunion. Features keynote addresses from industry leaders, networking dinners, and campus tours.',
        category: 'Event',
        priority: 'high',
        status: 'published',
        author: 'Istanbul University Alumni Office',
        targetAudience: 'All Alumni & Faculty',
        pinned: true,
        createdAt: '2026-09-15T09:00:00.000Z',
        updatedAt: null
      },
      {
        id: 2,
        title: 'Tech Career Fair & Executive Mentorship Program',
        content: 'Exclusive career opportunities for YBS and engineering graduates with premier technology firms including Google, Microsoft, and Amazon. Pre-registration is mandatory.',
        category: 'Career',
        priority: 'urgent',
        status: 'published',
        author: 'YBS Career Center',
        targetAudience: 'Graduates & Final-Year Students',
        pinned: true,
        createdAt: '2026-09-20T11:30:00.000Z',
        updatedAt: null
      },
      {
        id: 3,
        title: 'Guest Lecture: Artificial Intelligence & Enterprise Architecture',
        content: 'Distinguished alumni seminar on modern microservices, cloud telemetry, and AI integration in corporate management information systems.',
        category: 'Academic',
        priority: 'medium',
        status: 'published',
        author: 'Mehmet Raşid Ünlüel',
        targetAudience: 'Management Information Systems (YBS)',
        pinned: false,
        createdAt: '2026-09-28T14:15:00.000Z',
        updatedAt: null
      },
      {
        id: 4,
        title: 'Alumni Mentorship Applications Now Open for Fall Semester',
        content: 'Give back to the Istanbul University community by guiding 3rd and 4th-year students through industry transitions and professional career planning.',
        category: 'Networking',
        priority: 'high',
        status: 'published',
        author: 'Alumni Relations Committee',
        targetAudience: 'Alumni with 2+ Years Experience',
        pinned: false,
        createdAt: '2026-10-01T08:45:00.000Z',
        updatedAt: null
      },
      {
        id: 5,
        title: 'Alumni Survey 2026: Enhancing Departmental Curriculum',
        content: 'We invite all graduates to complete our biennial academic feedback survey to align current course offerings with modern industry requirements.',
        category: 'General',
        priority: 'low',
        status: 'draft',
        author: 'Faculty of Economics - YBS Department',
        targetAudience: 'All Graduates',
        pinned: false,
        createdAt: '2026-10-05T16:20:00.000Z',
        updatedAt: null
      }
    ];
    this._nextId = 6;
  }
}

// Export singleton instance representing the Announcement Model
module.exports = new AnnouncementModel();
