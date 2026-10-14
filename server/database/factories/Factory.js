/**
 * ============================================================================
 * Alumni Tracker — Base Factory Class
 * ============================================================================
 * Architectural Layer: DATABASE / FACTORY PATTERN (DDD Specification)
 * Author: Mehmet Raşid Ünlüel (Istanbul University - YBS)
 * 
 * Description:
 *   Abstract base Factory providing fluent state transformation, attribute
 *   randomization, batch generation (make/create), and seed dataset utilities.
 *   Inspired by modern ORM factories (Laravel, Fishery, Prisma Seed).
 * ============================================================================
 */

class Factory {
  constructor() {
    this._count = 1;
    this._states = [];
  }

  /**
   * Define default attributes for the entity. Subclasses must implement.
   * @returns {Object}
   */
  definition() {
    throw new Error('Factory must implement definition() method');
  }

  /**
   * Set the number of entity instances to produce.
   * @param {number} n
   * @returns {Factory}
   */
  count(n) {
    const clone = this._clone();
    clone._count = Math.max(1, parseInt(n, 10) || 1);
    return clone;
  }

  /**
   * Apply a state mutation callback to the generated attributes.
   * @param {Function|Object} stateFnOrObj
   * @returns {Factory}
   */
  state(stateFnOrObj) {
    const clone = this._clone();
    clone._states.push(stateFnOrObj);
    return clone;
  }

  /**
   * Produce in-memory entity object(s) with overrides applied.
   * @param {Object} [overrides={}]
   * @returns {Object|Array<Object>} Single entity or array depending on count()
   */
  make(overrides = {}) {
    const items = [];
    for (let i = 0; i < this._count; i++) {
      let attributes = { ...this.definition() };

      // Apply chained state transformations
      for (const st of this._states) {
        if (typeof st === 'function') {
          attributes = { ...attributes, ...st(attributes, i) };
        } else if (typeof st === 'object' && st !== null) {
          attributes = { ...attributes, ...st };
        }
      }

      // Apply runtime parameter overrides
      if (typeof overrides === 'function') {
        attributes = { ...attributes, ...overrides(attributes, i) };
      } else {
        attributes = { ...attributes, ...overrides };
      }

      items.push(attributes);
    }

    return this._count === 1 ? items[0] : items;
  }

  /**
   * Create entity in database or persistence store.
   * Subclasses override or inherit standard persistence logic.
   * @param {Object} [overrides={}]
   * @returns {Promise<Object|Array<Object>>}
   */
  async create(overrides = {}) {
    throw new Error('Subclass must implement async create() for database persistence');
  }

  // ==========================================================================
  // Lightweight Randomization Helpers (Zero External Dependency)
  // ==========================================================================

  static randomElement(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  static randomElements(array, count = 2) {
    if (!array || array.length === 0) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  static randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomBoolean(chanceTrue = 0.5) {
    return Math.random() < chanceTrue;
  }

  static randomDate(startYear = 2018, endYear = 2026) {
    const start = new Date(startYear, 0, 1).getTime();
    const end = new Date(endYear, 11, 31).getTime();
    return new Date(start + Math.random() * (end - start)).toISOString();
  }

  _clone() {
    const clone = Object.create(Object.getPrototypeOf(this));
    clone._count = this._count;
    clone._states = [...this._states];
    return clone;
  }
}

module.exports = Factory;
