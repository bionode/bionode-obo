'use strict'

const fs = require('fs')
const through = require('through2')
const request = require('request')
const hl = require('highland')

const obo = require('../src/obo')

// const readStream = fs.createReadStream(__dirname + '/SyRO.obo')
const readStream = fs.createReadStream(__dirname + '/ff-phase2-140729.obo')
const liveStream = request.get('http://purl.obolibrary.org/obo/go/go-basic.obo')

// readStream
//   .pipe(obo.parse)
//   .pipe(process.stdout)

// readStream
//   .pipe(through())
//   .on('data', () => {
//     console.log('got data')
//   })
//   .on('end', () => console.log('finished'))


const receiveHeader = (data) => {
  console.log(data)
}

// readStream
//   .pipe(obo.parse)
//   .pipe(process.stdout)

hl(obo.parse(readStream).on('header', receiveHeader))
  // .map(chunk => chunk.toString() + '=========')
  .each(chunk => console.log(chunk))
  .done(() => console.log('DONE'))

// hl(readStream.pipe(through()))
//   .each(chunk => console.log(chunk.toString()))
//   .done(() => console.log('done'))

// obo.terms(readStream)
//   .pipe(through.obj( function(chunk, enc, cb) {
//     console.log(chunk)
//
//     cb()
//   } ))

// obo.termsNdjson(liveStream)
//   .pipe(process.stdout)

// obo.parse(liveStream)

// liveStream
//   .pipe(obo.parse)
//   .pipe(process.stdout)
