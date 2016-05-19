'use strict'

const should = require('should')

const C = require('../src/Class')
const Co = require('../src/ConformanceCheck')
const Ca = require('../src/Cardinality')

const Sample = new C.Class('Sample', [], {name: {type: String, mandatory: true}, foo: Number})
Sample.addReference('test', Sample, Ca.Cardinality.one, undefined, undefined, Sample)

const WrongType = new C.Class('WrongType', [], {name: String, foo: Number})

describe('referenceMinCardinality rule', function () {

  it ('is verified if Min cardinality is verified', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    x.test = x
    const result = Co.referenceMinCardinalityRule.run(undefined, {elements: [x]})
    result.succeed.should.be.true()
    done()
  })

  it ('fails if Min cardinality is not verified', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    const result = Co.referenceMinCardinalityRule.run(undefined, {elements: [x]})
    result.succeed.should.be.false()
    done()
  })

})


describe('referenceMaxCardinality rule', function () {

  it ('is verified if Max cardinality is verified', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    x.test = x
    const result = Co.referenceMaxCardinalityRule.run(undefined, {elements: [x]})
    result.succeed.should.be.true()
    done()
  })

  it ('fails if Max cardinality is not verified', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    const y = new Sample({name: 'y', foo: 42})
    x.test = [x,y]
    const result = Co.referenceMaxCardinalityRule.run(undefined, {elements: [x]})
    result.succeed.should.be.false()
    done()
  })

})


describe('referenceType rule', function () {

  it ('is verified if references type are correct', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    x.test = x
    const result = Co.referencesTypeRule.run(undefined, {elements: [x]})
    result.succeed.should.be.true()
    done()
  })

  it ('fails if types are not correct', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    const y = new WrongType({name: 'y', foo: 42})
    x.__jsmf__.references.test = [y]
    const result = Co.referencesTypeRule.run(undefined, {elements: [x]})
    result.succeed.should.be.false()
    done()
  })

})


describe('attributeType rule', function () {

  it ('is verified if attributes type are correct', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    x.test = x
    const result = Co.attributesTypeRule.run(undefined, {elements: [x]})
    result.succeed.should.be.true()
    done()
  })

  it ('fails if types are not correct', function (done) {
    const x = new Sample({name: 'x', foo: 42})
    x.__jsmf__.attributes.foo = "wroooooong"
    const result = Co.attributesTypeRule.run(undefined, {elements: [x]})
    result.succeed.should.be.false()
    done()
  })

  it ('fails if values are not defined for a mandatory attribute', function (done) {
    const x = new Sample({foo: 42})
    const result = Co.attributesTypeRule.run(undefined, {elements: [x]})
    result.succeed.should.be.false()
    done()
  })

  it ('passes if values are not defined for a non-mandatory attribute', function (done) {
    const x = new Sample({name: 'x'})
    const result = Co.attributesTypeRule.run(undefined, {elements: [x]})
    result.succeed.should.be.true()
    done()
  })

})

