'use strict'

const _ = require('lodash')
const highland = require('highland')
const EventEmitter2 = require('eventemitter2').EventEmitter2 || require('eventemitter2')

/**
 * Parse OBO files from an input stream.
 * Emits a [Term] object stream or ndjson stream.
 * @module bionode-obo
 */

console.log(require('eventemitter2').EventEmitter2)

// Setting up event emitter
const emitter = new EventEmitter2({
  wildcard: false,
  delimiter: '.',
  newListener: true,
  maxListeners: 10
})

// emitter.addListener('header', header => console.log('HEADER: ' + JSON.stringify(stanzaParser(header), null, 2)))

// highland('stanza', emitter)
//   .map(stanza => stanzaParser(stanza))
//   .map(stanza => JSON.stringify(stanza, null, 2))
//   .each(stanza => console.log('STANZA: ' + stanza))

// Flags and buffers
let header = true
let headerComplete = false
let headerStr = ''

let term = false
let termStr = ''

// Watch for `line` events from the emitter
// TODO stop using events, as this stream "never ends"
highland('line', emitter)
  .each(line => {
    // If we found a new stanza, swap term flag
    if (line.match(/^\[[a-z]+\]/i)) {
      // Found a stanza
      header = false
      term = !term
    }

    // Emit header once
    // TODO headerStr buffer can be termStr
    if (header) {
      headerStr += line + '\n'
    } else if (!headerComplete) {
      emitter.emit('header', headerStr)
      headerComplete = true
    }


    if (term) {
      // If we are currently buffering a stanza, continue to do so
      termStr += line + '\n'
    } else if (!term && !header) {
      // Term flag will have been swapped if we encountered a [Term], [Typedef], etc
      // Then emit the currently completed stanza, and swap the flag back so we
      // continue to buffer a new stanza
      term = !term
      emitter.emit('stanza', termStr)
      termStr = line + '\n'
    }
  })

// Emits a `line` event with each line passed in
// TODO mitigate using events, event stream doesn't know when it ends
const getLines = (stream) => {
  return stream
    .splitBy('\n')
    .each(line => emitter.emit('line', line))
}

// map stanza text to an object representation
const parseStanzas = (stream) => {
  return stream.map(stanza => stanzaParser(stanza))
}

// map objects to stringified lines
const ndjsonIfy = (stream) => {
  return stream.map(obj => JSON.stringify(obj) + '\n')
}

// filter out [Term]s
const termsFilter = (stream) => {
  return stream.filter(obj => obj[''] === '[Term]')
}

/**
 * Parse OBO 1.2 file
 * @return {stream} the readable stream of an OBO file from fs or www
 */
exports.parse = highland.pipeline(highland.through(getLines))

/**
 * Produce [Term]s object stream
 * @param  {stream} stream stream from fs or www
 * @return {stream}        object stream
 */
exports.terms = (stream) => {
  highland(stream).through(getLines)

  return highland('stanza', emitter)
    .through(parseStanzas)
    .through(termsFilter)
}

/**
 * Produce [Term]s ndjson stream
 * @param  {stream} stream strem from fs or www
 * @return {stream}        ndjson stream
 */
exports.termsNdjson = (stream) => {
  highland(stream).through(getLines)

  return highland('stanza', emitter)
    .through(parseStanzas)
    .through(termsFilter)
    .through(ndjsonIfy)
}

/**
 * Parse one [Term] at once.
 *
 * NOTE Although this parser is a stream, this function requires one term to be
 * stored in memory at once. How else to create an Object stream? One
 * could append a string until it is JSON.parse()''able, but that still requires
 * storing the object in memory at once, on the other side. Better to provide
 * an Object stream as well as an ndjson stream.
 */
const stanzaParser = (stanza) => {
  return stanza
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
