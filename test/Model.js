'use strict'

const should = require('should')
    , _ = require('lodash')
    , JSMF = require('../src/index')
    , Model = JSMF.Model
    , Class = JSMF.Class

describe('Model', function() {

  describe('constructor', function() {

    it('creates an empty model', function(done) {
      const foo = new Model('Foo')
      foo.modellingElements.should.be.empty()
      foo.referenceModel.should.be.empty()
      done()
    })

    it('creates a model that is a jsmf element', function(done) {
      const foo = new Model('Foo')
      JSMF.isJSMFElement(foo).should.be.true()
      done()
    })

    it ('creates a model with a given reference model', function(done) {
      const MM = new Model('Foo')
      const M = new Model('Bar', MM)
      M.referenceModel.should.equal(MM)
      done()
    })

    it ('adds the given classes to the model', function(done) {
      const A = new Class('A')
      const B = new Class('B')
      const M = new Model('Bar', {}, [A, B])
      M.modellingElements.should.have.property('Class', [A, B])
      M.classes.should.have.property('A', [A])
      M.classes.should.have.property('B', [B])
      done()
    })

    it ('adds the given elements to the model', function(done) {
      const A = new Class('A')
      const a = new A()
      const B = new Class('B')
      const b = new B()
      const M = new Model('Bar', {}, [a, b])
      M.modellingElements.should.have.property('A', [a])
      M.modellingElements.should.have.property('B', [b])
      done()
    })

    it ('does not add the given elements transitively if not mentioned', function(done) {
      const A = new Class('A')
      const B = new Class('B')
      A.addReference('b', B)
      const a = new A()
      const b = new B()
      a.b = b
      const M = new Model('Bar', {}, [a])
      M.modellingElements.should.have.property('A', [a])
      M.modellingElements.should.not.have.property('B')
      done()
    })

    it ('adds the given elements transitively if mentioned', function(done) {
      const A = new Class('A')
      const B = new Class('B')
      A.addReference('b', B)
      const a = new A()
      const b = new B()
      a.b = b
      const M = new Model('Bar', {}, [a], true)
      M.modellingElements.should.have.property('A', [a])
      M.modellingElements.should.have.property('B', [b])
      done()
    })

  })

  describe('elements', function() {
    it('lists all the elements of the model', function(done) {
      const A = new Class('A')
      const B = new Class('B')
      A.addReference('b', B)
      const a = new A()
      const b = new B()
      a.b = b
      const M = new Model('Bar', {}, [a, b], true)
      const elements = M.elements()
      elements.should.have.length(2)
      elements.should.containEql(a)
      elements.should.containEql(b)
      done()
    })
  })

  describe('crop', function() {

    it('remove references to elements that are not in the model', function(done) {
      const A = new Class('A')
      const B = new Class('B')
      A.addReference('b', B)
      const a = new A()
      const b = new B()
      a.b = b
      const M = new Model('Bar', {}, [a], true)
      M.crop()
      a.b.should.be.empty()
      done()
    })

    it('remove references to elements that are not in the model', function(done) {
      const A = new Class('A')
      const B = new Class('B')
      A.addReference('b', B, 1, 'back', 1, A)
      const a = new A()
      const b = new B()
      a.addB(b, a)
      const M = new Model('Bar', {}, [a], true)
      M.crop()
      a.b.should.be.empty()
      a.getAssociated().b.should.be.empty()
      done()
    })

  })
})
