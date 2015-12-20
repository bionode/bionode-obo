'use strict'

const fs = require('fs')
const EventEmitter = require('events')
const util = require('util')

const through = require('through2')
const es = require('event-stream')

const _ = require('./util')
const CE = require('./emitter')

/**
 * Parse OBO files. Emits a `term` object stream.
 * @module bionode-obo
 */


/**
 * Parse OBO 1.2 file
 * @return {string} the parsed output
 */
exports.parse = function () {
  return 'foo'
}

let LineEmitter = CE()

let ccm = _.charCodeMap('[]{}:\n')

let curr = 0
let next

let stream = fs.createReadStream('SyRO.obo')
  .pipe(through(function (chunk, enc, cb) {
    for (let i=0; i < chunk.length; i++) {
      if (chunk[i] == ccm['\n']) {
        next = _.getNextNewline(curr, chunk)
        let line = chunk.slice(curr, next)
        curr = next+1
        if (!(line.length === 0))
          LineEmitter.write(line.toString())
      }
    }

    this.push(chunk)
    cb()
  }))

LineEmitter.on('data', function(data) {
  console.log(data)
})
