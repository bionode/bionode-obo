'use strict'

const through = require('through2')
const filter = require('through2-filter')
const split = require('split')
const BufferList = require('bl')
const pumpify = require('pumpify')

const charCode = (char) => new Buffer(char)[0]

// Flags and buffers
let header = true
let stanzaBuffer = new BufferList()

const skipEmpties = filter(chunk => chunk.length !== 0)

const parseStanza = (stanzaBuffer) => stanzaBuffer
  .toString()
  .trim()
  .split('\n')
  .reduce((stanza, currentLine) => {
    // add key:val to stanza
    const keyValSeperatorIndex = currentLine.indexOf(':')
    let key = currentLine.slice(0, keyValSeperatorIndex)
    let val = currentLine.slice(keyValSeperatorIndex+1).trim()

    if (currentLine[0] === '[') {
      key = ''
      val = val.replace(/^\[/, '').replace(/\]$/, '')
    }

    // TODO know ahead of time which keys should be arrays
    if (stanza[key]) {
      if (stanza[key].constructor !== Array) {
        stanza[key] = new Array(stanza[key])
      }

      stanza[key].push(val)
    } else {
      stanza[key] = val
    }

    return stanza
  }, {})

const parse = (h) => {

  const transform = function (chunk, enc, next) {
    // Line starts with [
    if (chunk[0] === charCode('[')) {
      if (header) {
        this.emit('header', parseStanza(stanzaBuffer.slice()))
        h(parseStanza(stanzaBuffer.slice()))
        header = false
      } else {
        // Push what we have collected for the current set of key:value pairs
        this.push(JSON.stringify(parseStanza(stanzaBuffer.slice())) + '\n')
      }

      // and start again
      stanzaBuffer = new BufferList()
    }

    stanzaBuffer.append(chunk).append('\n')
    next()
  }

  const flush = function() {
    this.push(JSON.stringify(parseStanza(stanzaBuffer.slice())) + '\n')
    this.push(null)
  }

  // return stream
  //   .pipe(split())
  //   .pipe(skipEmpties)
  //   .pipe(through.obj(transform, flush))
  return through(transform, flush)
}

exports.parse = (h) => {
  return pumpify(split(), skipEmpties, parse(h))
}

exports.parseNdjson = (stream) => {
  return parse(stream)
    .pipe(through.obj(function (obj, enc, next) {
      this.push(JSON.stringify(obj))
      next()
    }))
}
