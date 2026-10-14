/**
 * ============================================================================
 * Alumni Tracker — User Factory
 * ============================================================================
 * Architectural Layer: DATABASE / FACTORY (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * ============================================================================
 */

const Factory = require('./Factory');
const db = require('../../db');

class UserFactory extends Factory {
  definition() {
    const id = Factory.randomNumber(1000, 9999);
    const domain = 'alumni.edu';
    const emailPrefixes = ['ybs.grad', 'tech.alumni', 'engineer', 'alumnus', 'student', 'dev'];
    const prefix = Factory.randomElement(emailPrefixes);

    return {
      email: `${prefix}.${id}@${domain}`,
      // Standard bcrypt hash for password "SecretPass123!" with work factor 10
      password_hash: '$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/kSdf3M7q6YyZ8U8K5o9rR.k1m7G6',
      role: 'alumni',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  admin() {
    return this.state({
      role: 'admin',
      email: `admin.${Factory.randomNumber(100, 999)}@alumni.edu`
    });
  }

  coordinator() {
    return this.state({
      role: 'coordinator',
      email: `coordinator.${Factory.randomNumber(100, 999)}@alumni.edu`
    });
  }

  alumni() {
    return this.state({ role: 'alumni' });
  }

  /**
   * Persist user(s) to PostgreSQL database.
   * @param {Object} [overrides={}]
   * @returns {Promise<Object|Array<Object>>}
   */
  async create(overrides = {}) {
    const data = this.make(overrides);
    const items = Array.isArray(data) ? data : [data];
    const createdUsers = [];

    for (const item of items) {
      const res = await db.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)
         RETURNING id, email, role, created_at, updated_at`,
        [item.email, item.password_hash, item.role]
      );
      createdUsers.push(res.rows[0]);
    }

    return this._count === 1 ? createdUsers[0] : createdUsers;
  }
}

module.exports = new UserFactory();
