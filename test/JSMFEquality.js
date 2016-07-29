'use strict'

const should = require('should')
    , jsmf = require('../src/index')

describe ('jsmf equals on Enum', () => {

  it ('returns true on the exact same Enum', done => {
    const e = new jsmf.Enum('Foo', ['test', 'is', 'ok'])
    jsmf.jsmfIsEqual(e,e).should.be.true()
    done()
  })

  it ('returns true on Enum with the same name and values', done => {
    const e = new jsmf.Enum('Foo', ['test', 'is', 'ok'])
    const e2 = new jsmf.Enum('Foo', ['test', 'is', 'ok'])
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    jsmf.jsmfIsEqual(e,e2).should.be.true()
    done()
  })

  it ('returns false on Enum with different uuid', done => {
    const e = new jsmf.Enum('Foo', ['test', 'is', 'ok'])
    const e2 = new jsmf.Enum('Foo', ['test', 'is', 'ok'])
    jsmf.jsmfIsEqual(e,e2).should.be.false()
    done()
  })

  it ('returns false on Enum with the same name and different values', done => {
    const e = new jsmf.Enum('Foo', ['test', 'is', 'not', 'ok'])
    const e2 = new jsmf.Enum('Foo', ['test', 'is', 'ok'])
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    jsmf.jsmfIsEqual(e,e2).should.be.false()
    done()
  })

  it ('returns false on Enum with different name and same values', done => {
    const e = new jsmf.Enum('Foo', ['test', 'is', 'ok'])
    const e2 = new jsmf.Enum('Bar', ['test', 'is', 'ok'])
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    jsmf.jsmfIsEqual(e,e2).should.be.false()
    done()
  })
})

describe ('jsmf equals on Class', () => {

  it ('returns true on the exact same Class', done => {
    const r = new jsmf.Class('Target')
    const e = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: r})
    jsmf.jsmfIsEqual(e,e).should.be.true()
    done()
  })

  it ('returns true on Classes with the same elements', done => {
    const r = new jsmf.Class('Target')
    const r2 = new jsmf.Class('Target')
    const e = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: r})
    const e2 = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: r2})
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    r2.__jsmf__.uuid = jsmf.jsmfId(r)
    jsmf.jsmfIsEqual(e,e2).should.be.true()
    done()
  })

  it ('returns false on Classes with different names', done => {
    const e = new jsmf.Class('Bar', [], {foo: jsmf.Positive})
    const e2 = new jsmf.Class('Foo', [], {foo: jsmf.Positive})
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    jsmf.jsmfIsEqual(e,e2).should.be.false()
    done()
  })

  it ('returns false on Classes with different attributes', done => {
    const e = new jsmf.Class('Foo', [], {foo: jsmf.Positive})
    const e2 = new jsmf.Class('Foo', [], {bar: jsmf.Positive})
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    jsmf.jsmfIsEqual(e,e2).should.be.false()
    done()
  })

  it ('returns false on Classes with different attributes types', done => {
    const e = new jsmf.Class('Foo', [], {foo: jsmf.Positive})
    const e2 = new jsmf.Class('Foo', [], {bar: jsmf.String})
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    jsmf.jsmfIsEqual(e,e2).should.be.false()
    done()
  })

  it ('returns false on Classes with different references', done => {
    const r = new jsmf.Class('Target')
    const e = new jsmf.Class('Foo', [], {}, {ref: r})
    const e2 = new jsmf.Class('Foo', [], {}, {ref2: r})
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    jsmf.jsmfIsEqual(e,e2).should.be.false()
    done()
  })

  it ('returns true on cyclic structure', done => {
    const r = new jsmf.Class('Target')
    const r2 = new jsmf.Class('Target')
    const e = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: r})
    r.addReference('back', e)
    const e2 = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: r2})
    r2.addReference('back', e2)
    e2.__jsmf__.uuid = jsmf.jsmfId(e)
    r2.__jsmf__.uuid = jsmf.jsmfId(r)
    jsmf.jsmfIsEqual(e,e2).should.be.true()
    done()
  })

})

describe ('jsmf equals on Class instances', () => {


  it ('returns true on similar instances', done => {
    const R = new jsmf.Class('Target')
    const C0 = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: R})
    const C1 = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: R})
    C1.__jsmf__.uuid = jsmf.jsmfId(C0)
    const r = new R()
    const c0 = new C0({foo: 42, ref: r})
    const c1 = new C1({foo: 42, ref: r})
    c1.__jsmf__.uuid = jsmf.jsmfId(c0)
    jsmf.jsmfIsEqual(c0,c1).should.be.true()
    done()
  })
})

describe ('jsmf equals on Model', () => {

  it ('ensures that a model is equal to itself', done => {
    const m = new jsmf.Model('Foo')
    jsmf.jsmfIsEqual(m,m).should.be.true()
    done()
  })

  it ('ensures that a model is equal to identic model', done => {
    const R = new jsmf.Class('Target')
    const C0 = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: R})
    const C1 = new jsmf.Class('Foo', [], {foo: jsmf.Positive}, {ref: R})
    C1.__jsmf__.uuid = jsmf.jsmfId(C0)
    const r = new R()
    const c0 = new C0({foo: 42, ref: r})
    const c1 = new C1({foo: 42, ref: r})
    const m0 = new jsmf.Model('Foo', [], c0, true)
    const m1 = new jsmf.Model('Foo', [], c1, true)
    c1.__jsmf__.uuid = jsmf.jsmfId(c0)
    m1.__jsmf__.uuid = jsmf.jsmfId(m0)
    jsmf.jsmfIsEqual(m0,m1).should.be.true()
    done()
  })

})
