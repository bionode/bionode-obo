'use strict'

const fs = require('fs')

const obo = require('../src/obo')

obo.parse(fs.createReadStream(__dirname + '/SyRO.obo'))
