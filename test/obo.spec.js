'use strict'

const chai = require('chai')
const should = chai.should()

const obo = require('../index.js')

describe('obo', function() {
  describe('#parse()', function() {

    it('should be a function', function() {
      obo.parse.should.be.a('function')
    })

    it('should return `foo`', function() {
      obo.parse().should.equal('foo')
    })
  })
})
