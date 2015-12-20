'use strict'

/**
 * Utility functions.
 * @module util
 */

 /**
  * Return an object mapping characters to their respective codes.
  * @param  {string} str a string of characters
  * @return {object}     an object with keys as single characters and values as
  *                      their character code
  */
exports.charCodeMap = function (str) {
  // could this be made more function? `reduce` on an object?
  // http://stackoverflow.com/questions/15748656/javascript-reduce-on-object
  let map = {}
  str.split('').forEach( (char) => {
    map[char] = char.charCodeAt(0)
  })
  return map
}

/**
 * Return position of next newline in a binary chunk starting from pos.
 * @param  {number} pos   the start position
 * @param  {object} chunk binary object emitted from stream
 * @return {number}       Index of the next newline from pos.
 */
exports.getNextNewline = function (pos, chunk) {
  for (let i=pos; i < chunk.length; i++) {
    if (chunk[i] === 10) {
      return i
    }
  }
}
