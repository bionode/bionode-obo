'use strict'

const fs = require('fs')
const request = require('request')

const obo = require('../src/obo')

obo.parse2(fs.createReadStream(__dirname + '/SyRO.obo'))

// obo.parse(request.get('http://purl.obolibrary.org/obo/go/go-basic.obo'))
