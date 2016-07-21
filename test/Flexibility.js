'use strict'

const should = require('should')
    , _ = require('lodash')
    , JSMF = require('../src/index')
    , Class = JSMF.Class

describe('Class Flexibility', () => {

  describe('errorCallback', () => {

    describe('throw callback', () => {

      it('throws error on invalid attribute value', done => {
        const A = new Class('A', [], {x: {type: Number, errorCallback: JSMF.onError.throw}})
        let test = function() {new A({x: 'foo'})}
        test.should.throw()
        done()
      })

      it('throws error on invalid reference value', done => {
        const A = new Class('A', [])
        const B = new Class('B', [])
        A.addReference('x', A, 1, undefined, undefined, undefined, JSMF.onError.throw)
        let test = function() {let x = new A(); let y = new B(); x.x = y}
        test.should.throw()
        done()
      })

      it('throws error on invalid reference value', done => {
        const A = new Class('A', [])
        A.addReference('x', A, 1, undefined, undefined, undefined, JSMF.onError.throw)
        let test = function() {let x = new A(); x.x = 'toto'}
        test.should.throw()
        done()
      })

    })

    describe('silent callback', () => {

      it('assigns on invalid attribute value', done => {
        const A = new Class('A', [], {x: {type: Number, errorCallback: JSMF.onError.silent}})
        let x = new A({x: 12})
        x.x = 'toto'
        x.x.should.be.equal('toto')
        done()
      })

      it('assigns on invalid reference value', done => {
        const A = new Class('A', [])
        const B = new Class('B', [])
        A.addReference('x', A, 1, undefined, undefined, undefined, JSMF.onError.silent)
        let x = new A()
        x.x = x
        let y = new B()
        x.x = y
        x.x.should.be.eql([y])
        done()
      })

      it('assign invalid reference value', done => {
        const A = new Class('A', [])
        A.addReference('x', A, 1, undefined, undefined, undefined, JSMF.onError.silent)
        let x = new A()
        x.x = x
        x.x = 'toto'
        x.x.should.be.eql(['toto'])
        done()
      })

    })

    describe('default behaviour', () => {

      it('throws on invalid attribute value', done => {
        const A = new Class('A', [], {x: Number})
        let test = function() {new A({x: 'foo'})}
        test.should.throw()
        done()
      })

      it('throws on invalid reference value', done => {
        const A = new Class('A', [])
        const B = new Class('B', [])
        A.addReference('x', A, 1)
        let test = function() {let x = new A(); let y = new B(); x.x = y}
        test.should.throw()
        done()
      })

    })

    describe('change flexibility behaviour to strict', () => {

      it('throws on invalid attribute value', done => {
        const A = new Class('A', [], {x: {type: Number, errorCallback: JSMF.onError.silent}})
        A.setFlexible(false)
        let test = function() {new A({x: 'foo'})}
        test.should.throw()
        done()
      })

      it('throws on invalid reference value', done => {
        const A = new Class('A', [])
        const B = new Class('B', [])
        A.addReference('x', A, 1, undefined, undefined, undefined, JSMF.onError.silent)
        A.setFlexible(false)
        let test = function() {let x = new A(); let y = new B(); x.x = y}
        test.should.throw()
        done()
      })

    })

    describe('change flexibility behaviour to flexible', () => {

      it('assigns on invalid attribute value', done => {
        const A = new Class('A', [], {x: {type: Number, errorCallback: JSMF.onError.throw}})
        A.setFlexible(true)
        let x = new A({x: 12})
        x.x = 'toto'
        x.x.should.be.equal('toto')
        done()
      })

      it('assigns on invalid reference value', done => {
        const A = new Class('A', [])
        const B = new Class('B', [])
        A.addReference('x', A, 1, undefined, undefined, undefined, JSMF.onError.throw)
        A.setFlexible(true)
        let x = new A()
        x.x = x
        let y = new B()
        x.x = y
        x.x.should.be.eql([y])
        done()
      })

    })
  })

  describe('chanching the metamodel', () => {

    it('ensures that removed property is not acessible via getAllAttributes', done => {
      const A = new Class('A', [], {a: Number})
      const a = new A({a: 12})
      a.b = 'foo'
      delete A.attributes['a']
      _.pick(a, _.keys(A.getAllAttributes())).should.eql({})
      done()
    })

    it('ensures that added property is acessible via getAllAttributes', done => {
      const A = new Class('A', [], {a: Number})
      const a = new A({a: 12})
      a.b = 'foo'
      _.pick(a, _.keys(A.getAllAttributes())).should.eql({a: 12})
      delete A.addAttribute('b', String)
      _.pick(a, _.keys(A.getAllAttributes())).should.eql({a: 12, b: 'foo'})
      done()
    })

    it('throws error on a new attribute wrong type when refresh', done => {
      const A = new Class('A', [], {a: Number})
      const a = new A({a: 12})
      delete A.addAttribute('b', String)
      JSMF.refresh(a)
      function test() {a.b = 42}
      test.should.throw()
      done()
    })

    it('except if the class is flexible', done => {
      const A = new Class('A', [], {a: Number})
      const a = new A({a: 12})
      delete A.addAttribute('b', String)
      JSMF.refresh(a)
      function test() {a.b = 42}
      test.should.throw()
      done()
    })


    it ('adds flexible attributes to a flexible class', done => {
      const A = new Class('A', [], {a: Number}, {}, true)
      const a = new A({a: 12})
      delete A.addAttribute('b', String)
      JSMF.refresh(a)
      function test() {a.b = 42}
      test.should.not.throw()
      done()
    })

    it ('adds flexible references to a flexible class', done => {
      const A = new Class('A', [], {a: Number}, {}, true)
      const B = new Class('B')
      const a = new A({a: 12})
      delete A.addReference('b', B)
      JSMF.refresh(a)
      function test() {a.b = new A()}
      test.should.not.throw()
      function testAddFunction() {a.addB(new A())}
      testAddFunction.should.not.throw()
      done()
    })

  })
})
