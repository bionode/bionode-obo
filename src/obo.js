'use strict'

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
 * @return {stream} the readable stream of an OBO file from fs or www
 */
exports.parse = function (stream) {
  let emitter = CE()

  let ccm = _.charCodeMap('[]{}:\n')

  let curr = 0
  let next

  // Emit `line` events
  stream.pipe(through(function (chunk, enc, cb) {
    for (let i=0; i < chunk.length; i++) {
      if (chunk[i] == ccm['\n']) {
        next = _.getNextNewline(curr, chunk)
        let line = chunk.slice(curr, next)
        curr = next+1
        if (!(line.length === 0))
          emitter.writeline(line)
      }
    }

    // don't need this since the pipeline ends here
    // this.push(chunk)
    // cb()
  }))

  emitter.on('line', (chunk) => {
    console.log(chunk.toString())
  })
}
