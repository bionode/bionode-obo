'use strict'

const fs = require('fs')

const obo = require('../src/obo')

obo.parseHL(fs.createReadStream(__dirname + '/SyRO.obo'))
