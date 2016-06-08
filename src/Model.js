'use strict'

const _ = require('lodash')

let isJSMFElement, conformsTo
(function() {
  const common = require('./Common')
  isJSMFElement = common.isJSMFElement
  conformsTo = common.conformsTo
}).call()

const isJSMFEnum = require('./Enum').isJSMFEnum
const isJSMFClass = require('./Class').isJSMFClass

function Model(name, referenceModel, modellingElements, transitive) {
  this.__name = name
  _.set(this, ['__jsmf__','conformsTo'], Model)
  this.referenceModel = referenceModel || {}
  this.modellingElements = {}
  this.elemByClassId = new Map()
  this.classes = {}
  if (modellingElements !== undefined) {
    modellingElements = modellingElements instanceof Array ?  modellingElements : [modellingElements]
    if (transitive) {
      modellingElements = crawlElements(modellingElements)
    }
    _.forEach(modellingElements, e => this.addModellingElement(e))
  }
}

function modelExport(m) {
  const result = _.mapValues(m.classes, _.head)
  result[m.__name] = m
  return result
}

Model.prototype.addModellingElement = function(es) {
  es = es instanceof Array ? es : [es]
  _.forEach(es, e => {
    if (!isJSMFElement(e)) {throw new TypeError(`can't Add ${e} to model ${this}`)}
    addToClass(this, e)
    addToModellingElements(this, e)
  })
}

function addToClass(m, e) {
  if (isJSMFClass(e) || isJSMFEnum(e)) {
    const key = e.__name
    const current = m.classes[key] || []
    current.push(e)
    m.classes[key] = current
  }
}

function addToModellingElements(m, e) {
  const key = conformsTo(e).__name
  const current = m.modellingElements[key] || []
  current.push(e)
  m.modellingElements[key] = current
}

Model.prototype.Filter = function(cls) {
  return this.modellingElements[_.get(cls, '__name')]
}

Model.getInheritanceChain = _.constant([Model])
Model.prototype.conformsTo = function() { return conformsTo(this) }
Model.prototype.setModellingElements = Model.prototype.addModellingElement
Model.prototype.add = Model.prototype.addModellingElement
Model.prototype.setReferenceModel = function(rm) {this.referenceModel = rm}

Model.prototype.elements = function() {
  return _(this.modellingElements).values().flatten().value()
}

Model.prototype.crop = function() {
  const elements = this.elements()
  _.forEach(elements, e => {
    const mme = e.conformsTo()
    if (mme !== undefined) {
      for (var refName in mme.references) {
        e.__jsmf__.references[refName] = _.intersection(e.__jsmf__.references, elements)
        e.__jsmf__.associated[refName] = _.filter(e.__jsmf__.associated[refName],
          x => _.includes(e.__jsmf__.references[refName], x.elem))
      }
    }
  })
}


function crawlElements(init) {
  const visited = new Set()
  let toVisit = init
  while (!_.isEmpty(toVisit)) {
    var e = toVisit.pop()
    if (!visited.has(e)) {
      visited.add(e)
      let newNodes
      if (isJSMFClass(e)) {
        const refs = e.getAllReferences()
        const refTypes = _.map(refs, 'type')
        const attrs = e.getAllAttributes()
        const attrsEnum = _(attrs).values().map('type').filter(isJSMFEnum).value()
        newNodes = _.flatten([refTypes, attrsEnum, e.getInheritanceChain()])
      } else if (isJSMFEnum(e)) {
        newNodes = []
      } else if (isJSMFElement(e)) {
        const refs = conformsTo(e).getAllReferences()
        const associated = _(e.getAssociated()).values().flatten().map('associated').value()
        newNodes = _(refs).map((v, x) => e[x]).flatten().value()
        newNodes = newNodes.concat(associated)
      }
      toVisit = toVisit.concat(newNodes)
    }
  }
  return dispatch(Array.from(visited))
}

function dispatch(elems) {
  return _.reduce(
      elems,
      (acc, e) => {
        const key = (isJSMFClass(e) || isJSMFEnum(e)) ? e.__name : e.conformsTo().__name
        const values = _.get(acc, key, [])
        values.push(e)
        acc[key] = values
        return acc
      },
      {})
}


module.exports = {Model, modelExport}
