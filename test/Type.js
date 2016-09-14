'use strict'

const should = require('should')
    , JSMF = require('../src/index')

describe('JSMFAny', function() {

  it('validates any JSMF class', done => {
    const a = new JSMF.Class('A')
    JSMF.JSMFAny(a).should.be.true()
    done()
  })

  it('validates any JSMF element', done => {
    const A = new JSMF.Class('A')
    const a = new A()
    JSMF.JSMFAny(a).should.be.true()
    done()
  })

  it('refuses non JSMF objects', done => {
    const a = {x:42}
    JSMF.JSMFAny(a).should.be.false()
    done()
  })

})

describe('Function', done => {

  it('accept functions', done => {
    JSMF.Function(x => x + 1).should.be.true()
    done()
  })

  it('refuses objects', done => {
    JSMF.Function({x :42}).should.be.false()
    done()
  })
})

describe('Range', done => {

  it('accepts values in range', done => {
    const r = new JSMF.Range(0,4)
    r(2).should.be.true()
    done()
  })

  it('accepts min value', done => {
    const r = new JSMF.Range(0,4)
    r(0).should.be.true()
    done()
  })

  it('accepts max value', done => {
    const r = new JSMF.Range(0,4)
    r(4).should.be.true()
    done()
  })

  it('rejects out of scope value', done => {
    const r = new JSMF.Range(0,4)
    r(5).should.be.false()
    done()
  })

})

describe('normalizeType', done => {

  it ('transform Number to JSMF.Number', done => {
    JSMF.normalizeType(Number).should.be.eql(JSMF.Number)
    JSMF.normalizeType(String)(2).should.be.false()
    done()
  })

})
