'use strict'

const through = require('through2')
const es = require('event-stream')
const fs = require('fs')
const util = require('./util')

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



let cm = util.charCodeMap('[]{}:\n')
let j = 0

let curr = 0
let next

let stream = fs.createReadStream('SyRO.obo')
  .pipe(through(function (chunk, enc, cb) {
    for (let i=0; i < chunk.length; i++) {
      if (chunk[i] === cm['\n']) {
        j++
      }
      let activeColon = false
      // if (chunk[i] == cm[':'] && !activeColon) {
      //   next = util.getNextNewline(curr, chunk)
      //   let mini = chunk.slice(curr, next)
      //   let key = chunk.slice(curr,i).toString()
      //   let val = chunk.slice(i+1, next).toString()
      //   curr = next
      //
      //   activeColon = true
      //   console.log(JSON.stringify({key, val}))
      //   // this.emit('error', null)
      // }
      if (chunk[i] == cm['\n']) {
        next = util.getNextNewline(curr, chunk)
        let line = chunk.slice(curr, next)
        curr = next+1
        if (!(line.length === 0))
          console.log('line:', line.toString())
      }
    }

    this.push(chunk)
    cb()
  }))
  .pipe(es.through(function(data) {
    console.log(data.toString().split('\n').length)
    console.log(j)
    this.emit('data', data)
  }))
  // .pipe(process.stdout)

stream.on('newline', function(data) {
  console.log(data)
})
