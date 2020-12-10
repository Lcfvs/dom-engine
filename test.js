/**
 * @typedef {Object} Obj
 */

/**
 * @typedef {Object} Properties
 */

/**
 * @typedef {Obj & Properties} Mixed
 */

/**
 * @this {Obj}
 */
const obj = {
  /**
   * @param {Properties} [properties]
   * @returns {Obj & Properties}
   */
  spread ({ ...properties } = {}) {
    return { ...this, ...properties }
  }
}

obj.spread()
  .
