'use strict'

const _ = require('lodash')
const highland = require('highland')

/**
 * Parse OBO files. Emits a [Term] object stream.
 * @module bionode-obo
 */


/**
 * Parse one [Term] at once.
 *
 * NOTE Although this parser is a stream, this function requires one term to be
 * stored in memory at once. How else to create an Object stream? One
 * could append a string until it is JSON.parse()''able, but that still requires
 * storing the object in memory at once, on the other side. Better to provide
 * an Object stream as well as an ndjson stream.
 */
const termParser = (term) => {
  return term
    .split('\n')
    // Filter out empty lines
    .filter(l => l.length !== 0)
    // Reduce array into object of key:val
    .reduce( (prev, curr) => { 
      const sep = curr.indexOf(':')
      const key = curr.substring(0, sep)
      const val = _.trim(curr.substring(sep+1))
      
      prev[key] = val

      return prev
    }, {} )
}

/**
 * Parse OBO 1.2 file
 * @return {stream} the readable stream of an OBO file from fs or www
 */
exports.parse = function (stream) {
  highland(stream)
    .splitBy('[Term]')
    .map(term => termParser(term))
    .map(term => JSON.stringify(term, null, 2) + '\n')
    .pipe(process.stdout)
}

