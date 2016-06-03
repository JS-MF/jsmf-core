'use strict'

const assert = require("assert")
    , should = require('should')
    , JSMF = require('../src/index')
    , Enum = JSMF.Enum

describe('Enum instance', function() {

    it('conforms to Enum', function(done) {
        var e = new Enum('TurnMe', ['on', 'off'])
        e.conformsTo().should.equal(Enum)
        done()
    })

    it('is a JSMF element', function(done) {
        var e = new Enum('TurnMe', ['on', 'off'])
        JSMF.isJSMFElement(e).should.be.true()
        done()
    })

    it('can be initialize with an Array of values', function(done) {
        var e = new Enum('TurnMe', ['on', 'off'])
        e.should.have.property('on', 0)
        e.should.have.property('off', 1)
        done()
    })

    it('can be initialize with an object', function(done) {
        var e = new Enum('TurnMe', {on: 'jour', off: 'nuit'})
        e.should.have.property('on', 'jour')
        e.should.have.property('off', 'nuit')
        done()
    })

    it('can resolve keys from values', function(done) {
        var e = new Enum('TurnMe', ['on', 'off'])
        e.getName(0).should.equal('on')
        e.getName(1).should.equal('off')
        should(e.getName(2)).equal(undefined)
        done()
    })

})
