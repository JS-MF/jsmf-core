/**
 *   JavaScript Modelling Framework (JSMF)
 *
*
©2015 Luxembourg Institute of Science and Technology All Rights Reserved
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors : J.S. Sottet, A. Vagner, N. Biri
*/
'use strict';

var _ = require('lodash');
var uuid = require('uuid');

var Type = require('./Type');
var conformsTo;
(function() {
    var common = require('./Common');
    conformsTo = common.conformsTo;
}).call();
var Cardinality = require('./Cardinality').Cardinality


/** 
 * Creation of a JSMF Class.
 *
 * The attributes are given in a key value manner: the key is the name of the
 * attribute, the valu its type.
 *
 * The references are also given in a key / value way. The name of the
 * references are the keys, the value can has the following attrivutes:
 * - type: The target type of the reference;
 * - cardinality: the cardinality of the reference;
 * - opposite: the name of the opposite reference;
 * - oppositeCardinality: the cardinality of the opposite reference;
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
        var o = this;
        Object.defineProperties(o,
            { __jsmf__: {value: elementMeta(jsmfElement)}
            , conformsTo: {value: function() {return conformsTo(o);}}
            , getAssociated: {value: getAssociated, enumerable: false}
            });
        createAttributes(o, jsmfElement);
        createReferences(o, jsmfElement);
        _.forEach(attr, function(v,k) {
            o[k] = v;
        });
    }
    superClasses = superClasses || [];
    jsmfElement.__name = name;
    jsmfElement.superClasses = superClasses instanceof Array ? superClasses : [superClasses];
    jsmfElement.attributes = {};
    jsmfElement.references = {};
    Object.defineProperty(jsmfElement, '__jsmf__', {value: classMeta()});
    populateClassFunction(jsmfElement);
    if (attributes !== undefined) { jsmfElement.addAttributes(attributes)}
    if (references !== undefined) { jsmfElement.addReferences(references)}
    return jsmfElement;
}

Class.__name = 'Class';

Class.newInstance = function(name, superClasses, attributes, references) {
    return new Class(name, superClasses, attributes, references);
}

/** Check the cardinality of all the references of a JSMF element
 */
function checkCardinality(elem) {
    var context = {toVisit: [elem], visited: [], errors: []};
    while (context.toVisit.length > 0) {
        var e = context.toVisit.pop();
        context.visited.push(e);
        var c = conformsTo(e);
        if (c !== undefined) {
            _.forEach(c.allReferences(), function(desc, r) {
                var min = _.get(desc, ['cardinality', 'min'], 0);
                var max = _.get(desc, ['cardinality', 'max'], undefined);
                var length = e[r].length
                if ((max !== undefined && length > max) || length < min) {
                    context.errors.push({element: e, reference: r, length: length, expected: desc.cardinality});
                }
                _.forEach(e[r], function (v) {
                    if (!_.includes(context.visited, v)) {
                        context.visited.push(v);
                    }
                });
            });
        }
    }
    return context.errors;
}

/** Return true if the given object is a JSMF Class.
 */
function isJSMFClass(o) {
    return conformsTo(o) === Class;
}


function getInheritanceChain() {
    return _.reduce( this.superClasses.reverse()
        , function (acc, v) {return v.getInheritanceChain().concat(acc);}
        , [this]
        );
}

function getAllReferences() {
    return _.reduce(
        this.getInheritanceChain(),
        function (acc, cls) {
            return _.reduce(
                cls.references,
                function (acc2, v, k) { acc2[k] = v; return acc2; },
                acc);
        },
        {});
}

function getAssociated(name) {
    if (name === undefined) {
        return _.get(this, ['__jsmf__', 'associated']);
    } else {
        return _.get(this, ['__jsmf__', 'associated', name]);
    }
}

function addReferences(descriptors) {
    var self = this;
    _.forEach(descriptors, function (desc, k) {
        self.addReference(k, desc.target || desc.type, desc.cardinality, desc.opposite, desc.oppositeCardinality, desc.associated);
    });
}

function addReference(name, target, sourceCardinality, opposite, oppositeCardinality, associated) {
    this.references[name] = { type: target || Type.JSMFAny
                            , cardinality: Cardinality.check(sourceCardinality)
                            };
    if (opposite !== undefined) {
        this.references[name].opposite = opposite;
        target.references[opposite] =
            { type: this
            , cardinality: Cardinality.check(oppositeCardinality)
            , opposite: name
            };
    }
    if (associated !== undefined) {
        this.references[name].associated = associated;
        if (opposite !== undefined) {
            target.references[opposite].associated = associated;
        }
    }
}

function removeReference(name, opposite) {
    var ref = this.references[name];
    _.unset(this.references, name);
    if (ref.opposite !== undefined) {
        if (opposite) {
            _.unset(ref.type.references, ref.opposite);
        } else {
            _.unset(ref.type.references[ref.opposite], 'opposite');
        }
    }
}

function getAllAttributes() {
    return _.reduce(
        this.getInheritanceChain(),
        function (acc, cls) {
            return _.reduce(
                cls.attributes,
                function (acc2, v, k) { acc2[k] = v; return acc2; },
                acc);
        },
        {});
}

function populateClassFunction(cls) {
    Object.defineProperties(cls,
        { getInheritanceChain: {value: getInheritanceChain, enumerable: false}
        , newInstance: {value: function(init) {return new cls(init);}, enumerable:false}
        , conformsTo: {value: function() {return conformsTo(cls);}, enumerable:false}
        , getAllReferences: {value: getAllReferences, enumerable: false}
        , addReference: {value: addReference, enumerable: false}
        , removeReference: {value: removeReference, enumerable: false}
        , setReference: {value: addReference, enumerable: false}
        , addReferences: {value: addReferences, enumerable: false}
        , setReferences: {value: addReferences, enumerable: false}
        , getAllAttributes: {value: getAllAttributes, enumerable: false}
        , addAttribute: {value: addAttribute, enumerable: false}
        , removeAttribute: {value: removeAttribute, enumerable: false}
        , setAttribute: {value: addAttribute, enumerable: false}
        , addAttributes: {value: addAttributes, enumerable: false}
        , setAttributes: {value: addAttributes, enumerable: false}
        , setSuperType: {value: setSuperType, enumerable: false}
        , setSuperClass: {value: setSuperType, enumerable: false}
        });

}

function setSuperType(s) {
    var self = this;
    var ss = s instanceof Array ? s : [s];
    _.forEach(ss, function(cls) {
        if (!_.includes(self.superClasses, cls)) {
            self.superClasses.push(s);
        }
    });
}

function addAttribute(name, type) {
  this.attributes[name] = Type.normalizeType(type);
}

function removeAttribute(name) {
  _.unset(this.attributes, name);
}

function addAttributes(attrs) {
  var self = this;
  _.forEach(attrs, function(v, k) {self.addAttribute(k, v);});
}


function createAttributes(e, cls) {
    _.forEach(cls.getAllAttributes(), function(type, name) {
        e.__jsmf__.attributes[name] = undefined;
        createAttribute(e, name, type);
    });
}

function createReferences(e, cls) {
    _.forEach(cls.getAllReferences(), function(desc, name) {
        e.__jsmf__.associated[name] = [];
        e.__jsmf__.references[name] = [];
        createAddReference(e, name, desc);
        createRemoveReference(e, name);
        createReference(e, name, desc);
    });
}

function createAttribute(o, name, type) {
    createSetAttribute(o,name, type)
    Object.defineProperty(o, name,
        { get: function() {return o.__jsmf__.attributes[name];}
        , set: o[setName(name)]
        , enumerable: true
        }
    );
}

function createSetAttribute(o, name, type) {
    Object.defineProperty(o, setName(name),
        {value: function(x) {
                if (type(x)) {
                    o.__jsmf__.attributes[name] = x;
                } else {
                    throw new TypeError('Invalid assignment: ' + x + ' for object ' + o);
                }
            }
        , enumerable: false
        });
}


function createReference(o, name, desc) {
    Object.defineProperty(o, name,
        { get: function() {return o.__jsmf__.references[name];}
        , set: function(xs) {
              xs = xs instanceof Array ? xs : [xs];
              var invalid = _.filter(xs, function(x) {
                  var type = conformsTo(x);
                  return type === undefined
                            || !(_.includes(type.getInheritanceChain(), desc.type) || (desc.type === Type.JSMFAny));
              });
              if (!_.isEmpty(invalid)) {
                    throw new TypeError('Invalid assignment: ' + invalid + ' for object ' + o);
              }
              o.__jsmf__.associated[name] = [];
              if (desc.opposite !== undefined) {
                  var removed = _.difference(o[name], xs);
                  _.forEach(removed, function(y) {
                      _.remove(y.__jsmf__.references[desc.opposite],
                               function(z) {return z === o});
                  });
                  var added = _.difference(xs, o[name]);
                  _.forEach(added, function(y) {
                      y.__jsmf__.references[desc.opposite].push(o);
                  });
              }
              o.__jsmf__.references[name] = xs;
          }
        , enumerable: true
        });
}


function createAddReference(o, name, desc) {
    Object.defineProperty(o, addName(name),
        { value: function(xs, associated) {
            xs = xs instanceof Array ? xs : [xs];
            var associationMap = o.__jsmf__.associated;
            var backup = associationMap[name];
            o.__jsmf__.references[name] = o[name].concat(xs);
            if (desc.opposite !== undefined) {
                  _.forEach(xs, function(y) {
                      y.__jsmf__.references[desc.opposite].push(o);
                  });
            }
            associationMap[name] = backup;
            if (associated !== undefined) {
                associationMap[name] = associationMap[name] || [];
                if (desc.associated !== undefined
                  && !_.includes(associated.conformsTo().getInheritanceChain(), desc.associated)) {
                    throw new Error('Invalid association ' + associated + ' for object' + o)
                }
                _.forEach(xs, function(x) {
                    associationMap[name].push({elem: x, associated: associated});
                    if (desc.opposite !== undefined) {
                        x.__jsmf__.associated[desc.opposite].push({elem: o, associated: associated});
                    }
                });
            }
        }
        , enumerable: false
        });
}

function createRemoveReference(o, name, desc) {
    Object.defineProperty(o, removeName(name),
        { value: function(xs) {
            xs = xs instanceof Array ? xs : [xs];
            var associationMap = o.__jsmf__.associated;
            associationMap[name] = _.differenceWith(associationMap[name], xs, function(x,y) {x.elem === y});
            o.__jsmf__.references[name] = _.difference(o.__jsmf__.references[name], xs);
            }
        , enumerable: false
        });
}


function classMeta() {
    return {uuid: uuid.v4(), conformsTo: Class};
}

function elementMeta(constructor) {
    return { conformsTo: constructor
           , uuid: uuid.v4()
           , attributes: {}
           , references: {}
           , associated: {}
           };
}


function addName(n) {
    return prefixedName('add',n);
}

function setName(n) {
    return prefixedName('set',n);
}

function removeName(n) {
    return prefixedName('remove',n);
}

function prefixedName(pre, n) {
    return pre + n[0].toUpperCase() + n.slice(1);
}


module.exports =
    { Class: Class
    , isJSMFClass: isJSMFClass
    , checkCardinality: checkCardinality
    }
