'use strict'

const _ = require('lodash')

let isJSMFElement, conformsTo;
(function() {
    var common = require('./Common');
    isJSMFElement = common.isJSMFElement;
    conformsTo = common.conformsTo;
}).call();

const isJSMFEnum = require('./Enum').isJSMFEnum
const isJSMFClass = require('./Class').isJSMFClass

function Model(name, referenceModel, modellingElements, transitive) {
    this.__name = name
    this.referenceModel = referenceModel || {}
    this.modellingElements = {}
    if (modellingElements !== undefined) {
        modellingElements = modellingElements instanceof Array ?  modellingElements : [modellingElements]
        if (transitive) {
            this.modellingElements = crawlElements(modellingElements)
        } else {
            const self = this
            _.forEach(modellingElements, e => self.addModellingElement(e))
        }
    }
}

function modelExport(m) {
    const result = _(m.modellingElements).mapValues(x => x[0])
                                         .pickBy(x => isJSMFClass(x) || isJSMFEnum(x))
                                         .value()
    result[m.__name] = m
    return result
}

Model.prototype.addModellingElement = function(es) {
    const self = this;
    es = es instanceof Array ? es : [es];
    _.forEach(es, e => {
        if (!isJSMFElement(e)) {throw new TypeError(`can't Add ${e} to model ${self}`)}
        const key = (isJSMFClass(e) || isJSMFEnum(e)) ? e.__name : conformsTo(e).__name
        const current = self.modellingElements[key] || []
        current.push(e)
        self.modellingElements[key] = current
    });
}

Model.prototype.Filter = function(cls) {
    return this.modellingElements[_.get(cls, '__name')]
}

Model.prototype.setModellingElements = Model.prototype.addModellingElement
Model.prototype.add = Model.prototype.addModellingElement
Model.prototype.setReferenceModel = function(rm) {this.referenceModel = rm}

function crawlElements(init) {
    const visited = [];
    let toVisit = init;
    while (!_.isEmpty(toVisit)) {
        var e = toVisit.pop();
        if (!_.includes(visited, e)) {
            visited.push(e)
            let newNodes
            if (isJSMFClass(e)) {
                const refs = e.getAllReferences()
                const refTypes = _.map(refs, v => v.type)
                const attrs = e.getAllAttributes()
                const attrsEnum = _(attrs).values().filter(isJSMFEnum).value()
                newNodes = _.flatten([refTypes, attrsEnum, e.getInheritanceChain()])
            } else if (isJSMFEnum(e)) {
                newNodes = []
            } else if (isJSMFElement(e)) {
              const refs = conformsTo(e).getAllReferences();
              newNodes = _(refs).map((v, x) => e[x]).flatten().value()
            }
            toVisit = toVisit.concat(newNodes)
        }
    }
    return dispatch(visited)
}

function dispatch(elems) {
    return _.reduce(
        elems,
        (acc, e) => {
          const key = (isJSMFClass(e) || isJSMFEnum(e)) ? e.__name : e.conformsTo().__name
          const values = acc[key] || []
          values.push(e)
          acc[key] = values
          return acc
        },
        {})
}


module.exports = {Model, modelExport}
