'use strict'

const fs = require('fs')
const request = require('request')

const obo = require('../src/obo')

const readStream = fs.createReadStream(__dirname + '/SyRO.obo')  

readStream
  .pipe(obo.parse2)
  .pipe(process.stdout)

// obo.parse(request.get('http://purl.obolibrary.org/obo/go/go-basic.obo'))
