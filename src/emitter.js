const EventEmitter = require('events')
const util = require('util')

/**
 * A small wrapper around custom event emitters.
 * @module emitter
 */

/**
 * Return a new custom event emitter
 * @return {object} a function inheriting from EventEmitter with a default
 *                  `#write()` method
 */
module.exports = function() {
  function customEmitter() {
    EventEmitter.call(this)
  }
  util.inherits(customEmitter, EventEmitter)

  customEmitter.prototype.write = function(data) {
    this.emit('data', data)
  }

  customEmitter.prototype.writeline = function(chunk) {
    this.emit('line', chunk)
  }

  return new customEmitter()
}
