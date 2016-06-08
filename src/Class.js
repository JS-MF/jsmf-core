/**
 *   JavaScript Modelling Framework (JSMF)
 *
*
©2015 Luxembourg Institute of Science and Technology All Rights Reserved
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors : J.S. Sottet, A. Vagner, N. Biri
*/
'use strict'

const _ = require('lodash')
    , Type = require('./Type')
    , Cardinality = require('./Cardinality').Cardinality

let conformsTo, generateId
(function () {
  const Common = require('./Common')
  conformsTo = Common.conformsTo
  generateId = Common.generateId
}).call()

/**
 * Creation of a JSMF Class.
 *
 * The attributes are given in a key value manner: the key is the name of the
 * attribute, the valu its type.
 *
 * The references are also given in a key / value way. The name of the
 * references are the keys, the value can has the following attrivutes:
 * - type: The target type of the reference
 * - cardinality: the cardinality of the reference
 * - opposite: the name of the opposite reference
 * - oppositeCardinality: the cardinality of the opposite reference
 * - associated: the type of the associated data.
 *
 * @param {string} name - Name of the class
 * @param {Class[]} superClasses - The superclasses of the current class
 * @param {Object} attributes - the attributes of the class.
 * @param {Object} attributes - the references of the class.
 * @constructor
 */
function Class(name, superClasses, attributes, references) {
  function jsmfElement(attr) {
    Object.defineProperties(this,
      { __jsmf__: {value: elementMeta(jsmfElement)}
      })
    createAttributes(this, jsmfElement)
    createReferences(this, jsmfElement)
    _.forEach(attr, (v,k) => this[k] = v)
  }
  jsmfElement.prototype.conformsTo = function () { return conformsTo(this) }
  jsmfElement.prototype.getAssociated = getAssociated
  superClasses = superClasses || []
  superClasses = superClasses instanceof Array ? superClasses : [superClasses]
  Object.assign(jsmfElement, {__name: name, superClasses, attributes: {}, references: {}})
  Object.defineProperty(jsmfElement, '__jsmf__', {value: classMeta()})
  populateClassFunction(jsmfElement)
  if (attributes !== undefined) { jsmfElement.addAttributes(attributes)}
  if (references !== undefined) { jsmfElement.addReferences(references)}
  return jsmfElement
}

Class.__name = 'Class'
Class.getInheritanceChain = () => [Class]

Class.newInstance = (name, superClasses, attributes, references) => new Class(name, superClasses, attributes, references)

/** Return true if the given object is a JSMF Class.
 */
const isJSMFClass = o => conformsTo(o) === Class


function getInheritanceChain() {
  return _(this.superClasses)
    .reverse()
    .reduce((acc, v) => v.getInheritanceChain().concat(acc), [this])
}

function getAllReferences() {
  return _.reduce(
    this.getInheritanceChain(),
    (acc, cls) => _.reduce(cls.references, (acc2, v, k) => {acc2[k] = v; return acc2}, acc),
    {})
}

function getAllAttributes() {
  return _.reduce(
    this.getInheritanceChain(),
    (acc, cls) => _.reduce(cls.attributes, (acc2, v, k) => {acc2[k] = v; return acc2}, acc),
    {})
}


function getAssociated(name) {
  const path = ['__jsmf__', 'associated']
  if (name !== undefined) {
    path.push(name)
  }
  return _.get(this, path)
}

function addReferences(descriptors) {
  _.forEach(descriptors, (desc, k) =>
    this.addReference(
      k,
      desc.target || desc.type,
      desc.cardinality,
      desc.opposite,
      desc.oppositeCardinality,
      desc.associated,
      desc.errorCallback,
      desc.oppositeErrorCallback)
    )
}

function addReference(name, target, sourceCardinality, opposite, oppositeCardinality, associated, errorCallback, oppositeErrorCallback) {
  this.references[name] = { type: target || Type.JSMFAny
                          , cardinality: Cardinality.check(sourceCardinality)
                          }
  if (opposite !== undefined) {
    this.references[name].opposite = opposite
    target.references[opposite] =
          { type: this
          , cardinality: oppositeCardinality === undefined && target.references[opposite] !== undefined ?
              target.references[opposite].cardinality :
              Cardinality.check(oppositeCardinality)
          , opposite: name
          , errorCallback: oppositeErrorCallback === undefined && target.references[opposite] !== undefined ?
              target.references[opposite].oppositeErrorCallback :
              onError.throw
          }
  }
  if (associated !== undefined) {
    this.references[name].associated = associated
    if (opposite !== undefined) {
      target.references[opposite].associated = associated
    }
  }
  this.references[name].errorCallback = errorCallback || onError.throw
}

function removeReference(name, opposite) {
  const ref = this.references[name]
  _.unset(this.references, name)
  if (ref.opposite !== undefined) {
    if (opposite) {
      _.unset(ref.type.references, ref.opposite)
    } else {
      _.unset(ref.type.references[ref.opposite], 'opposite')
    }
  }
}

function populateClassFunction(cls) {
  Object.defineProperties(cls,
    { getInheritanceChain: {value: getInheritanceChain}
    , newInstance: {value: init => new cls(init)}
    , conformsTo: {value: () => conformsTo(cls)}
    , getAllReferences: {value: getAllReferences}
    , addReference: {value: addReference}
    , removeReference: {value: removeReference}
    , setReference: {value: addReference}
    , addReferences: {value: addReferences}
    , setReferences: {value: addReferences}
    , getAllAttributes: {value: getAllAttributes}
    , addAttribute: {value: addAttribute}
    , removeAttribute: {value: removeAttribute}
    , setAttribute: {value: addAttribute}
    , addAttributes: {value: addAttributes}
    , setAttributes: {value: addAttributes}
    , setSuperType: {value: setSuperType}
    , setSuperClass: {value: setSuperType}
    , setFlexible: {value: setFlexible}
    })
}

function setSuperType(s) {
  const ss = s instanceof Array ? s : [s]
  this.superClasses = _.uniq(this.superClasses.concat(ss))
}

function addAttribute(name, type, mandatory, errorCallback) {
  this.attributes[name] =
    { type: Type.normalizeType(type)
    , mandatory: mandatory || false
    , errorCallback: errorCallback || onError.throw
    }
}

function removeAttribute(name) {
  _.unset(this.attributes, name)
}

function addAttributes(attrs) {
  _.forEach(attrs, (v, k) => {
    if (v.type !== undefined) {
      this.addAttribute(k, v.type, v.mandatory, v.errorCallback)
    } else {
      this.addAttribute(k, v)
    }
  })
}


function createAttributes(e, cls) {
  _.forEach(cls.getAllAttributes(), (desc, name) => {
    e.__jsmf__.attributes[name] = undefined
    createAttribute(e, name, desc)
  })
}

function createReferences(e, cls) {
  _.forEach(cls.getAllReferences(), (desc, name) => {
    e.__jsmf__.associated[name] = []
    e.__jsmf__.references[name] = []
    createAddReference(e, name, desc)
    createRemoveReference(e, name)
    createReference(e, name, desc)
  })
}

function createAttribute(o, name, desc) {
  createSetAttribute(o,name, desc)
  Object.defineProperty(o, name,
    { get: () => o.__jsmf__.attributes[name]
    , set: o[setName(name)]
    , enumerable: true
    }
  )
}

function createSetAttribute(o, name, desc) {
  Object.defineProperty(o, setName(name),
    {value: x => {
      if (!desc.type(x) || (desc.mandatory && _.isUndefined(x))) {
        desc.errorCallback(o, name, x)
      }
      o.__jsmf__.attributes[name] = x
    }
    })
}

function hasClass(x, type) {
  const types = type instanceof Array ? type : [type]
  return _.some(x.conformsTo().getInheritanceChain(), c => _.includes(types, c))
}


function createReference(o, name, desc) {
  Object.defineProperty(o, name,
    { get: () => o.__jsmf__.references[name]
    , set: xs => {
      xs = xs instanceof Array ? xs : [xs]
      const invalid = _.filter(xs, x => {
        const type = conformsTo(x)
        return type === undefined
          || !(_.includes(type.getInheritanceChain(), desc.type) || (desc.type === Type.JSMFAny))
      })
      if (!_.isEmpty(invalid)) {
        desc.errorCallback(o, name, xs)
      }
      o.__jsmf__.associated[name] = []
      if (desc.opposite !== undefined) {
        const removed = _.difference(o[name], xs)
        _.forEach(removed, function(y) {
          _.remove(y.__jsmf__.references[desc.opposite], z => z === o)
        })
        const added = _.difference(xs, o[name])
        _.forEach(added, y => y.__jsmf__.references[desc.opposite].push(o))
      }
      o.__jsmf__.references[name] = xs
    }
    , enumerable: true
    })
}


function createAddReference(o, name, desc) {
  Object.defineProperty(o, addName(name),
    { value: function(xs, associated) {
      xs = xs instanceof Array ? xs : [xs]
      const associationMap = o.__jsmf__.associated
      const backup = associationMap[name]
      o.__jsmf__.references[name] = o[name].concat(xs)
      if (desc.opposite !== undefined) {
        _.forEach(xs, y => y.__jsmf__.references[desc.opposite].push(o))
      }
      associationMap[name] = backup
      if (associated !== undefined) {
        associationMap[name] = associationMap[name] || []
        if (desc.associated !== undefined
          && !_.includes(associated.conformsTo().getInheritanceChain(), desc.associated)) {
          throw new Error(`Invalid association ${associated} for object ${o}`)
        }
        _.forEach(xs, x => {
          associationMap[name].push({elem: x, associated})
          if (desc.opposite !== undefined) {
            x.__jsmf__.associated[desc.opposite].push({elem: o, associated})
          }
        })
      }
    }
    })
}

function createRemoveReference(o, name) {
  Object.defineProperty(o, removeName(name),
    { value: xs => {
      xs = xs instanceof Array ? xs : [xs]
      const associationMap = o.__jsmf__.associated
      associationMap[name] = _.differenceWith(associationMap[name], xs, (x,y) => x.elem === y)
      o.__jsmf__.references[name] = _.difference(o.__jsmf__.references[name], xs)
    }
    })
}


function classMeta() {
  return {uuid: generateId(), conformsTo: Class}
}

function setFlexible(b) {
  if (b) {
    _.forEach(this.references, r => r.errorCallback = onError.silent)
    _.forEach(this.attributes, r => r.errorCallback = onError.silent)
  } else {
    _.forEach(this.references, r => r.errorCallback = onError.throw)
    _.forEach(this.attributes, r => r.errorCallback = onError.throw)
  }
}

function elementMeta(constructor) {
  return { conformsTo: constructor
         , uuid: generateId()
         , attributes: {}
         , references: {}
         , associated: {}
         }
}


function addName(n) {
  return prefixedName('add',n)
}

function setName(n) {
  return prefixedName('set',n)
}

function removeName(n) {
  return prefixedName('remove',n)
}

function prefixedName(pre, n) {
  return pre + n[0].toUpperCase() + n.slice(1)
}

const onError =
  { 'throw': (o,n,x) => {throw new TypeError(`Invalid assignment: ${x} for property ${n} of object ${o}`)}
  , 'log': (o,n,x) => {console.log(`assignment: ${x} for property ${n} of object ${o}`)}
  , 'silent': () => undefined
  }

module.exports = { Class, isJSMFClass, hasClass, onError }
