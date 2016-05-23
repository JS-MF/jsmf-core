'use strict'

const _ = require('lodash')

const check = require('jsmf-check')

let Class, hasClass
(function() {const C = require('./Class')
  Class = C.Class
  hasClass = C.hasClass
}).call()


const Model = require('./Model').Model

let isJSMFElement, conformsTo
(function() {const Common = require('./Common')
  isJSMFElement = Common.isJSMFElement
  conformsTo = Common.conformsTo
}).call()

const attributesTypeRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
        return _.map(conformsTo(this[0]).getAllAttributes(), (desc, name) => {return {name, desc}})
      }))
    ],
    (e, a) => {
      const value = e[a.name]
      return a.desc.type(value) || (!a.desc.mandatory && (_.isNull(value) || _.isUndefined(value)))
    }
)

const referenceMinCardinalityRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
        return _.map(conformsTo(this[0]).getAllReferences(), (props, name) => {return {name, cardinality: props.cardinality}})
      }))
    ],
    (e, r) => e[r.name].length >= r.cardinality.min
)

const referenceMaxCardinalityRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
        return _.map(conformsTo(this[0]).getAllReferences(), (props, name) => {return {name, cardinality: props.cardinality}})
      }))
    ],
    (e, r) => e[r.name].length <= r.cardinality.max
)

const referencesTypeRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
        return _.map(conformsTo(this[0]).getAllReferences(), (props, name) => {return {name, type: props.type}})
      }))
    , check.all(check.ContextualReference(function () {
        return this[0][this[1].name]
      }))
    ],
    (e, r, v) => {console.log(Class); try { return hasClass(v, r.type) } catch (err) { return false }}
)

const associatedTypeRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
        return _.map(this[0].getAssociated(), (value, key) => {return {key, value}})
      }))
    , check.all(check.ContextualReference(function () { return this[1].value }))
    ],
    (e, as, v) => {
        const refs = conformsTo(e).getAllReferences()
        const refType = refs[as.key].associated
        try { return hasClass(v.associated, refType) } catch (err) { return false }
    }
)

const nonExtraProperties = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
        return _.map(this[0], (value, name) => name)
      }))
    , check.raw(check.ContextualReference(function () {
        const attrs = _.map(conformsTo(this[0]).getAllAttributes(), (type, name) => name)
        const refs  = _.map(conformsTo(this[0]).getAllReferences(), (type, name) => name)
        return attrs.concat(refs)
      }))
    ],
    (e, elemA, classAs) => _.includes(classAs, elemA)
)

const conformance = new check.Checker()
conformance.rules =
  { attributesTypeRule
  , referenceMinCardinalityRule
  , referenceMaxCardinalityRule
  , referencesTypeRule
  , associatedTypeRule
  , nonExtraProperties
  }
conformance.helpers.elements = e => {
    if (e instanceof Model) {
        return e.elements()
    }
    if (isJSMFElement(e)) {
        return (new Model('tmp', {}, e, true)).elements()
    }
    throw new TypeError(`Invalid argument for conformance: ${e}`)
}

module.exports = _.assign(conformance.rules, { conformance })
