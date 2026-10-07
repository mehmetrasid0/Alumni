/**
 * ============================================================================
 * Alumni Tracker — User Model (In-Memory / No Database Required)
 * ============================================================================
 * Architectural Layer: MODEL (M in MVC)
 * 
 * Description:
 *   Self-contained User Model encapsulating all data operations, validation
 *   rules, and state management without requiring an external database connection.
 *   Provides full CRUD operations (Create, Read, Update, Delete) with built-in
 *   error handling, uniqueness constraints, and search/filtering capabilities.
 * ============================================================================
 */

class UserModel {
  constructor() {
    this.reset();
  }

  // ==========================================================================
  // [READ] Queries
  // ==========================================================================

  /**
   * Retrieve all users, with optional filtering criteria.
   * @param {Object} [filters] - Query filters (query, department, graduationYear)
   * @returns {Array<Object>} List of cloned user objects
   */
  findAll(filters = {}) {
    let result = [...this._users];

    // Filter by keyword query (matches name, email, company, role, department)
    if (filters.query) {
      const q = String(filters.query).toLowerCase().trim();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.company && u.company.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }

    // Filter by department
    if (filters.department) {
      result = result.filter(u => u.department === filters.department);
    }

    // Filter by graduation year
    if (filters.graduationYear) {
      const year = Number(filters.graduationYear);
      result = result.filter(u => u.graduationYear === year);
    }

    // Return a shallow clone of each object to prevent accidental state mutation
    return result.map(u => ({ ...u }));
  }

  /**
   * Find a single user by primary ID.
   * @param {number|string} id - The user ID
   * @returns {Object|null} Cloned user object or null if not found
   */
  findById(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) return null;

    const user = this._users.find(u => u.id === numericId);
    return user ? { ...user } : null;
  }

  /**
   * Find a single user by email address (case-insensitive).
   * @param {string} email - Email address
   * @returns {Object|null} User object or null
   */
  findByEmail(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    const user = this._users.find(u => u.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
  }

  /**
   * Return the total count of users currently stored.
   * @returns {number}
   */
  count() {
    return this._users.length;
  }

  // ==========================================================================
  // [CREATE] Creation
  // ==========================================================================

  /**
   * Create a new alumni user record.
   * @param {Object} userData - User attributes
   * @returns {Object} Newly created user entity
   * @throws {Error} If validation fails or email already exists
   */
  create(userData) {
    if (!userData || typeof userData !== 'object') {
      const err = new Error('Invalid user payload');
      err.statusCode = 400;
      throw err;
    }

    const { name, email, graduationYear, department, company, role } = userData;

    // Validate mandatory fields
    if (!name || !String(name).trim() || !email || !String(email).trim()) {
      const err = new Error('Both name and email are mandatory fields');
      err.statusCode = 400;
      throw err;
    }

    const trimmedEmail = String(email).trim().toLowerCase();

    // Check unique email constraint
    if (this.findByEmail(trimmedEmail)) {
      const err = new Error('A user with this email address is already registered');
      err.statusCode = 409;
      throw err;
    }

    const newUser = {
      id: this._nextId++,
      name: String(name).trim(),
      email: trimmedEmail,
      graduationYear: graduationYear ? Number(graduationYear) : null,
      department: department ? String(department).trim() : null,
      company: company ? String(company).trim() : null,
      role: role ? String(role).trim() : null,
      createdAt: new Date().toISOString()
    };

    this._users.push(newUser);
    return { ...newUser };
  }

  // ==========================================================================
  // [UPDATE] Modification
  // ==========================================================================

  /**
   * Fully update (PUT) or partially update (PATCH) an existing user.
   * @param {number|string} id - The user ID
   * @param {Object} updateData - Attributes to update
   * @param {boolean} [isPartial=false] - True for PATCH, False for full PUT replacement
   * @returns {Object} Updated user object
   * @throws {Error} If user not found, required fields missing (PUT), or email conflict
   */
  update(id, updateData, isPartial = false) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = new Error('Invalid user ID parameter');
      err.statusCode = 400;
      throw err;
    }

    const index = this._users.findIndex(u => u.id === numericId);
    if (index === -1) {
      const err = new Error(`User with ID ${numericId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const { name, email, graduationYear, department, company, role } = updateData || {};

    // In PUT mode, mandatory fields are strictly validated
    if (!isPartial) {
      if (!name || !String(name).trim() || !email || !String(email).trim()) {
        const err = new Error('PUT requests require both name and email fields');
        err.statusCode = 400;
        throw err;
      }
    }

    // Verify email uniqueness if email is being updated
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const conflict = this._users.find(
        u => u.email.toLowerCase() === normalizedEmail && u.id !== numericId
      );
      if (conflict) {
        const err = new Error('This email address is already registered by another user');
        err.statusCode = 409;
        throw err;
      }
    }

    if (isPartial) {
      // PATCH: Selectively modify provided attributes
      const allowedFields = ['name', 'email', 'graduationYear', 'department', 'company', 'role'];
      const target = this._users[index];

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          if (field === 'graduationYear') {
            target[field] = updateData[field] ? Number(updateData[field]) : null;
          } else if (field === 'email') {
            target[field] = String(updateData[field]).trim().toLowerCase();
          } else if (typeof updateData[field] === 'string') {
            target[field] = String(updateData[field]).trim();
          } else {
            target[field] = updateData[field];
          }
        }
      });

      target.updatedAt = new Date().toISOString();
      return { ...target };
    } else {
      // PUT: Replace full entity representation
      const updatedUser = {
        id: numericId,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        graduationYear: graduationYear ? Number(graduationYear) : null,
        department: department ? String(department).trim() : null,
        company: company ? String(company).trim() : null,
        role: role ? String(role).trim() : null,
        createdAt: this._users[index].createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this._users[index] = updatedUser;
      return { ...updatedUser };
    }
  }

  // ==========================================================================
  // [DELETE] Removal
  // ==========================================================================

  /**
   * Delete an alumni user by primary ID.
   * @param {number|string} id - The user ID
   * @returns {Object} Deleted user object
   * @throws {Error} If user not found
   */
  delete(id) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      const err = new Error('Invalid user ID parameter');
      err.statusCode = 400;
      throw err;
    }

    const index = this._users.findIndex(u => u.id === numericId);
    if (index === -1) {
      const err = new Error(`User with ID ${numericId} not found`);
      err.statusCode = 404;
      throw err;
    }

    const [deletedUser] = this._users.splice(index, 1);
    return { ...deletedUser };
  }

  /**
   * Reset store to initial seed data (useful for automated testing).
   * @returns {void}
   */
  reset() {
    this._users = [
      {
        id: 1,
        name: 'Ahmet Yilmaz',
        email: 'ahmet@alumni.edu',
        graduationYear: 2020,
        department: 'Computer Engineering',
        company: 'Google',
        role: 'Software Engineer',
        createdAt: '2026-09-22T10:00:00.000Z'
      },
      {
        id: 2,
        name: 'Elif Demir',
        email: 'elif@alumni.edu',
        graduationYear: 2019,
        department: 'Electrical & Electronics',
        company: 'Microsoft',
        role: 'Product Manager',
        createdAt: '2026-09-22T10:05:00.000Z'
      },
      {
        id: 3,
        name: 'Mehmet Kaya',
        email: 'mehmet@alumni.edu',
        graduationYear: 2021,
        department: 'Industrial Engineering',
        company: 'Amazon',
        role: 'Data Analyst',
        createdAt: '2026-09-22T10:10:00.000Z'
      },
      {
        id: 4,
        name: 'Zeynep Celik',
        email: 'zeynep@alumni.edu',
        graduationYear: 2018,
        department: 'Computer Engineering',
        company: 'Meta',
        role: 'Frontend Developer',
        createdAt: '2026-09-22T10:15:00.000Z'
      },
      {
        id: 5,
        name: 'Can Ozturk',
        email: 'can@alumni.edu',
        graduationYear: 2022,
        department: 'Software Engineering',
        company: 'Apple',
        role: 'iOS Developer',
        createdAt: '2026-09-22T10:20:00.000Z'
      },
      {
        id: 6,
        name: 'Ofe Emor Demiroz',
        email: 'ofe@alumni.edu',
        graduationYear: 2023,
        department: 'Information Systems (YBS)',
        company: 'Ay Yapim',
        role: 'Cast Manager',
        createdAt: '2026-09-22T10:25:00.000Z'
      }
    ];
    this._nextId = 7;
  }
}

// Export singleton instance representing the User Model
module.exports = new UserModel();

