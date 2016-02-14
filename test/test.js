'use strict'

const fs = require('fs')
const through = require('through2')
const request = require('request')

const obo = require('../src/obo')

const readStream = fs.createReadStream(__dirname + '/SyRO.obo')  
const liveStream = request.get('http://purl.obolibrary.org/obo/go/go-basic.obo') 

// readStream
//   .pipe(obo.parse)
//   .pipe(process.stdout)

// obo.terms(readStream)
//   .pipe(through.obj( function(chunk, enc, cb) {
//     console.log(chunk)
//     
//     cb()
//   } ))

obo.termsNdjson(readStream)
  .pipe(process.stdout)
