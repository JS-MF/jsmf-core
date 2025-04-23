/**
 * @license
 * ©2015-2025 Luxembourg Institute of Science and Technology All Rights Reserved
 * JavaScript Modelling Framework (JSMF)
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @author J.S. Sottet
 * @author N. Biri
 * @author A. Vagner
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
 * @constructor
 * @param {string} name - Name of the class
 * @param {Class[]} superClasses - The superclasses of the current class
 * @param {Object} attributes - the attributes of the class.
 * @param {Object} attributes - the references of the class.
 * @Param {Boolean} flexible - set if the class is flexible (i.e., shutting down error handling) or not.
 * @Param {string} semanticReference  - the uri corresponding the ontological element that the class
 is refering to.
 *
 * @property {string} __name the name of the class
 * @property {Class[]} superClasses - the superclasses of this JSMF class
 * @property {Object[]} attributes - the attributes of the class
 * @property {Object[]} references - the references of the class
 * @returns {Class~ClassInstance}
 */
function Class(name, superClasses, attributes, references, flexible, semanticReference) {
   this.semanticReference = semanticReference
  /** The generic class instances Class
   * @constructor
   * @param {Object} attr The initial values of the instance
   */
  function ClassInstance(attr) {
    Object.defineProperties(this,
      { __jsmf__: {value: elementMeta(ClassInstance)}
      })
    createAttributes(this, ClassInstance)
    createReferences(this, ClassInstance)
    _.forEach(attr, (v,k) => {this[k] = v})
   return new Proxy(this , assignationHandler)
  }
  
  Object.defineProperties(ClassInstance.prototype, {
    conformsTo: {value: function () { return conformsTo(this) }, enumerable: false},
    getAssociated : {value: getAssociated, enumerable: false}
  })
  superClasses = superClasses || []
  superClasses = _.isArray(superClasses) ? superClasses : [superClasses]
  Object.assign(ClassInstance, {__name: name, superClasses, attributes: {}, references: {}, __semanticReference : semanticReference})
  ClassInstance.errorCallback = flexible
    ? onError.silent
    : onError.throw
  Object.defineProperty(ClassInstance, '__jsmf__', {value: classMeta()})
  populateClassFunction(ClassInstance)
  if (attributes !== undefined) { ClassInstance.addAttributes(attributes)}
  if (references !== undefined) { ClassInstance.addReferences(references)}
  return ClassInstance
}

Class.__name = 'Class'
Class.getInheritanceChain = () => [Class]

Class.newInstance = (name, superClasses, attributes, references) => new Class(name, superClasses, attributes, references)

/** Return true if the given object is a JSMF Class.
 */
const isJSMFClass = o => conformsTo(o) === Class



function classMeta() {
  return {uuid: generateId(), conformsTo: Class}
}

/**
 * Returns the InheritanceChain of this class
 * @method
 * @memberof Class~ClassInstance
 */
function getInheritanceChain() {
  return _(this.superClasses)
    .reverse()
    .reduce((acc, v) => v.getInheritanceChain().concat(acc), [this])
}

/**
 * Returns the own and inherited references of this class
 * @method
 * @memberof Class~ClassInstance
 */
function getAllReferences() {
  return _.reduce(
    this.getInheritanceChain(),
    (acc, cls) => _.reduce(cls.references, (acc2, v, k) => {acc2[k] = v; return acc2}, acc),
    {})
}

/**
 * Returns the own and inherited attributes of this class
 * @method
 * @memberof Class~ClassInstance
 */
function getAllAttributes() {
  return _.reduce(
    this.getInheritanceChain(),
    (acc, cls) => _.reduce(cls.attributes, (acc2, v, k) => {acc2[k] = v; return acc2}, acc),
    {})
}


/**
* Returns the semantic reference of a given class
*
*/
function getSemanticReference() {
	return this.__semanticReference
}


function setSemanticReference(semanticReference) {
        this.__semanticReference = semanticReference
}

function isFlexible() {
        console.log(this.errorCallback);
	return this.errorCallback==onError.silent
}
/**
 * Returns the associated data of a reference or of all the references of an object
 * @method
 * @memberof Class~ClassInstance
 * @param {string} name - The name of the reference to explore if undefined, all the references are returned
 */
function getAssociated(name) {
  const path = ['__jsmf__', 'associated']
  if (name !== undefined) {
    path.push(name)
  }
  return _.get(this, path)
}

/**
 * Add several references to the Class
 * @method
 * @memberof Class~ClassInstance
 * @param {Object} descriptor - The definition of the attributes,
 *                              the keys are the names of the attribute to create.
 *                              The values contains the description of the attribute.
 *                              See {@link Class~ClassInstance#addAttribute} parameters name
 *                              for the supported property name.
 */
function addReferences(descriptor) {
  _.forEach(descriptor, (desc, k) =>
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

/**
 * Add a reference to the Class
 * @method
 * @memberof Class~ClassInstance
 * @param {string} name - The reference name
 * @param {Class} target - The target class. Note that {@link Class} and {@link Model}
 *                         can be targeted as well, even if they are not formally
 *                         instances of {@link Class}.
 *  @param {Cardinality} sourceCardinality - The cardinality of the reference
 *  @param {string} opposite - The name of the ooposite reference if any,
 *                             it can be an existing or a new reference name.
 *  @param {Cardinality} oppositeCardinality - The cardinality of the opposite reference,
 *                                             not used if opposite is not set.
 *  @param {Class} associated - The type of the associated data linked to this reference
 *  @param {Function} errorCallback - Defines what to do when wrong types are assigned
 *  @param {Function} oppositeErrorCallback - Defines what to do when wrong types are
 *                                            assigned to the opposite reference
 */
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
          , errorCallback: oppositeErrorCallback === undefined && target.references[opposite] !== undefined
              ? target.references[opposite].oppositeErrorCallback
              : this.errorCallback
          }
  }
  if (associated !== undefined) {
    this.references[name].associated = associated
    if (opposite !== undefined) {
      target.references[opposite].associated = associated
    }
  }
  this.references[name].errorCallback = errorCallback || this.errorCallback
}

/**
 * Remove a reference from a class
 * @method
 * @memberof Class~ClassInstance
 * @param {string} name - The name of the reference to remove
 * @param {boolean} opposite - true if the opposite reference should be removed as well
 */
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
    , setSuperClasses: {value: setSuperType}
    , setFlexible: {value: setFlexible}
    , isFlexible : {value: isFlexible}
    , setSemanticReference : {value : setSemanticReference}
    , getSemanticReference : {value:getSemanticReference}
    })
}

/** Change superClasses of this class.
 *
 * @method
 * @memberof Class~ClassInstance
 * @param s - Either a {@link Class} or an array of {@link Class}
 */
function setSuperType(s) {
  const ss = _.isArray(s) ? s : [s]
  this.superClasses = _.uniq(this.superClasses.concat(ss))
}

/** Add an attribute to a class.
 * @method
 * @memberof Class~ClassInstance
 * @param {string} name - The name of the attribute
 * @param {Function} type - In jsmf an attribute Type is a function that returns true if the
 *                          value is a member of this type, false otherwise. Some predefined
 *                          types are available in the class {@link Type}.
 *                          Users can also use builtin JavaScript types, that are replaced
 *                          on the fly by the corresponding validation function
 * @param {boolean} mandatory - If set to true, the attribute can't be set to undefined.
 * @param {Function} errorCallback - defines what to do if an invalid value is set to this attribute.
 */
function addAttribute(name, type, mandatory, errorCallback) {
  this.attributes[name] =
    { type: Type.normalizeType(type)
    , mandatory: mandatory || false
    , errorCallback: errorCallback || this.errorCallback
    }
}

/** Remove an attribute to a class
 * @method
 * @memberof Class~ClassInstance
 * @param {string} name - The name of the attribute
 */
function removeAttribute(name) {
  _.unset(this.attributes, name)
}

/** Add several attributes
 * @method
 * @memberof Class~ClassInstance
 * @param {Object} attrs - The attributes to add. The keys are te attribute name,
 *                         the values are the attributes descriptors.
 *                         See {@link Class~ClassInstance#RemoveAttribute} for
 *                         the supported properties.
 */
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
    , configurable: true
    }
  )
}

function createSetAttribute(o, name, desc) {
  Object.defineProperty(o, setName(name),
    { value: x => {
      if (!desc.type(x) && (desc.mandatory || !_.isUndefined(x))) {
        desc.errorCallback(o, name, x)
      }
      o.__jsmf__.attributes[name] = x
    }
    , configurable: true
    })
}

/** Check whether a class (or some classes) are in the inheritance chain of a given class
 * @function
 * @param {Class} x - The class to test
 * @param type - Either a {@link Class} or an array of classes tha should be in the class x.
 */
function hasClass(x, type) {
  const types = _.isArray(type) ? type : [type]
  return _.some(x.conformsTo().getInheritanceChain(), c => _.includes(types, c))
}


function createReference(o, name, desc) {
  Object.defineProperty(o, name,
    { get: () => o.__jsmf__.references[name]
    , set: xs => {
      xs = _.isArray(xs) ? xs : [xs]
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
    , configurable: true
    })
}


function createAddReference(o, name, desc) {
  Object.defineProperty(o, addName(name),
    { value: function(xs, associated) {
      xs = _.isArray(xs) ? xs : [xs]
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
    , configurable: true
    })
}

function createRemoveReference(o, name) {
  Object.defineProperty(o, removeName(name),
    { value: xs => {
      xs = _.isArray(xs) ? xs : [xs]
      const associationMap = o.__jsmf__.associated
      associationMap[name] = _.differenceWith(associationMap[name], xs, (x,y) => x.elem === y)
      o.__jsmf__.references[name] = _.difference(o.__jsmf__.references[name], xs)
    }
    , configurable: true
    })
}




/** Decide whether whether or not type will be check for attributes and
 * references of a whole class.
 * @method
 * @memberof Class~ClassInstance
 * @param {boolean} b - If true, type is not checked on assignement,
 *                      if false wrong assignement type riase an error.
 */
function setFlexible(b) {
  this.errorCallback = b ? onError.silent : onError.throw
  _.forEach(this.references, r => r.errorCallback = this.errorCallback)
  _.forEach(this.attributes, r => r.errorCallback = this.errorCallback)
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
  return pre + _.upperFirst(n)
}

function refreshElement(o) {
  const mm = o.conformsTo()
  if (!mm) {return o}
  const oBackup = Object.assign({}, o)
  for (let x in o) {delete o[x]}
  createAttributes(o, mm)
  createReferences(o, mm)
  _.forEach(oBackup, (v, k) => {
    if (v !== undefined) { o[k] = v }
  })
  return o
}

/** Predefined function for assignation error handling
 * It is used in initialisation of classInstance
 */
const assignationHandler = {
  set(target, property, value) {
  const flex = target.conformsTo().errorCallback==onError.silent
    if (!(property in target) && !flex ) { 
      throw new Error(`Cannot add property ${property}` );
    }
    target[property] = value;
    return true;
  }
};

/** Predefined function for type error handling.
 * It can be used in {@link Class~ClassInstance#addReference} and {@link Class~ClassInstance#addAttribute}
 */
const onError =
  { /** Raise an error on type error
      * @member
      */
    'throw': function(o,n,x) {throw new TypeError(`Invalid assignment: ${x} for property ${n} of object ${o}`)}
  , /** Assign and log the error on type error
      * @member
      */
    'log': function(o,n,x) {console.log(`assignment: ${x} for property ${n} of object ${o}`)}
  , /** Assign anyway.
      * @member
      */
    'silent': function() {}
  }

module.exports = { Class, isJSMFClass, hasClass, onError, refreshElement }
