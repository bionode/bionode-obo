'use strict'

const _ = require('lodash')
const highland = require('highland')
const EventEmitter2 = require('eventemitter2').EventEmitter2

/**
 * Parse OBO files. Emits a [Term] object stream.
 * @module bionode-obo
 */

// Setting up event emitter
const emitter = new EventEmitter2({
  wildcard: false,
  delimiter: '.',
  newListener: true,
  maxListeners: 10
})

emitter.addListener('header', header => console.log('HEADER: ' + JSON.stringify(stanzaParser(header), null, 2)))

highland('stanza', emitter)
  .map(stanza => stanzaParser(stanza))
  .map(stanza => JSON.stringify(stanza, null, 2))
  .each(stanza => console.log('STANZA: ' + stanza))

// Flags and buffers
let header = true
let headerComplete = false
let headerStr = ''

let term = false
let termStr = ''


highland('line', emitter)
  .each(line => {
    if (line.match(/^\[[a-z]+\]/i)) {
      // Found a stanza 
      header = false
      term = !term
    } 

    if (header) {
      headerStr += line + '\n'
    } else if (!headerComplete) {
      emitter.emit('header', headerStr)
      headerComplete = true
    }

    if (term) {
      termStr += line + '\n'
      // console.log('TERM: ', line)
    } else if (!term && !header) {
      term = !term
      // console.log('!TERM: ', line) 
      emitter.emit('stanza', termStr)
      // don't include [TERM] for now so stanzaParser works
      // termStr = ''
      termStr = line + '\n' 
    }
  })

const getLines = (stream) => {
  return stream
    .splitBy('\n')
    .each(line => emitter.emit('line', line)) 
}

/**
 * Parse OBO 1.2 file
 * @return {stream} the readable stream of an OBO file from fs or www
 */
exports.parse = highland.pipeline(highland.through(getLines))

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
