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


function Class(name, superClasses, attributes, references) {
    function jsmfElement(attr) {
        var o = this;
        Object.defineProperties(o,
            { __meta__: {value: elementMeta(jsmfElement)}
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
    Object.defineProperty(jsmfElement, '__meta__', {value: classMeta()});
    populateClassFunction(jsmfElement);
    if (attributes !== undefined) { jsmfElement.addAttributes(attributes)}
    if (references !== undefined) { jsmfElement.addReferences(references)}
    return jsmfElement;
}

Class.__name = 'Class';

Class.newInstance = function(name, superClasses, attributes, references) {
    return new Class(name, superClasses, attributes, references);
}

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
        return _.get(this, ['__meta__', 'associated']);
    } else {
        return _.get(this, ['__meta__', 'associated', name]);
    }
}

function addReferences(descriptors) {
    var self = this;
    _.forEach(descriptors, function (desc, k) {
        self.addReference(k, desc.target, desc.cardinality, desc.opposite, desc.oppositeCardinality, desc.associated);
    });
}

function addReference(name, target, sourceCardinality, opposite, oppositeCardinality, associated) {
    this.references[name] = { type: target
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
        , setReference: {value: addReference, enumerable: false}
        , addReferences: {value: addReferences, enumerable: false}
        , setReferences: {value: addReferences, enumerable: false}
        , getAllAttributes: {value: getAllAttributes, enumerable: false}
        , addAttribute: {value: addAttribute, enumerable: false}
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

function addAttributes(attrs) {
  var self = this;
  _.forEach(attrs, function(v, k) {self.addAttribute(k, v);});
}


function createAttributes(e, cls) {
    _.forEach(cls.getAllAttributes(), function(type, name) {
        e.__meta__.attributes[name] = undefined;
        createAttribute(e, name, type);
    });
}

function createReferences(e, cls) {
    _.forEach(cls.getAllReferences(), function(desc, name) {
        e.__meta__.associated[name] = [];
        e.__meta__.references[name] = [];
        createAddReference(e, name, desc);
        createRemoveReference(e, name);
        createReference(e, name, desc);
    });
}

function createAttribute(o, name, type) {
    createSetAttribute(o,name, type)
    Object.defineProperty(o, name,
        { get: function() {return o.__meta__.attributes[name];}
        , set: o[setName(name)]
        , enumerable: true
        }
    );
}

function createSetAttribute(o, name, type) {
    Object.defineProperty(o, setName(name),
        {value: function(x) {
                if (type(x)) {
                    o.__meta__.attributes[name] = x;
                } else {
                    throw new TypeError('Invalid assignment: ' + x + ' for object ' + o);
                }
            }
        , enumerable: false
        });
}


function createReference(o, name, desc) {
    Object.defineProperty(o, name,
        { get: function() {return o.__meta__.references[name];}
        , set: function(xs) {
              xs = xs instanceof Array ? xs : [xs];
              var invalid = _.filter(xs, function(x) {
                  var type = conformsTo(x);
                  return type === undefined || !_.includes(type.getInheritanceChain(), desc.type);
              });
              if (!_.isEmpty(invalid)) {
                    throw new TypeError('Invalid assignment: ' + invalid + ' for object ' + o);
              }
              o.__meta__.associated[name] = [];
              if (desc.opposite !== undefined) {
                  var removed = _.difference(o[name], xs);
                  _.forEach(removed, function(y) {
                      _.remove(y.__meta__.references[desc.opposite],
                               function(z) {return z === o});
                  });
                  var added = _.difference(xs, o[name]);
                  _.forEach(added, function(y) {
                      y.__meta__.references[desc.opposite].push(o);
                  });
              }
              o.__meta__.references[name] = xs;
          }
        , enumerable: true
        });
}


function createAddReference(o, name, desc) {
    Object.defineProperty(o, addName(name),
        { value: function(xs, associated) {
            xs = xs instanceof Array ? xs : [xs];
            var associationMap = o.__meta__.associated;
            var backup = associationMap[name];
            o[name] = o[name].concat(xs);
            associationMap[name] = backup;
            if (associated !== undefined) {
                associationMap[name] = associationMap[name] || [];
                if (desc.associated !== undefined
                  && !_.includes(associated.conformsTo().getInheritanceChain(), desc.associated)) {
                    throw new Error('Invalid association ' + associated + ' for object' + o)
                }
                _.forEach(xs, function(x) {
                    console.log(name);
                    console.log({elem: x, associated: associated});
                    associationMap[name].push({elem: x, associated: associated});
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
            var associationMap = o.__meta__.associated;
            associationMap[name] = _.differenceWith(associationMap[name], xs, function(x,y) {x.elem === y});
            o.__meta__.references[name] = _.difference(o.__meta__.references[name], xs);
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
