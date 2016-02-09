/**
 *   JavaScript Modelling Framework (JSMF)
 *
*
©2015 Luxembourg Institute of Science and Technology All Rights Reserved
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors : J.S. Sottet, A Vagner
Contributor : N. Biri
*/
'use strict';

var _ = require('lodash');
var uuid = require('uuid');

//DEF: Check Type Strict, Partial, None | Check Cardinality Strict, Partial, None, ...
//Natural => Formal
/** @class
 * Declare a new Model. In JSMF, a model can be roughly see as a container for Class or Classes instances declarations.
 * @param {String} name - The name of the model, it may be used as an dientifier for model comparison.
 * @entrypoint {Class instance} entrypoint - Optional argument that can be used to populate a model, if set, the entrypoint is crawled and all the class instances that are referenced are added to the model recursively.
 */
function Model(name, entryPoint) {
    this.__name = name;
    this.referenceModel = {}; //set the metamodel of this
    this.modellingElements = {};
    if (entryPoint !== undefined) {
        var visited = [];
        var toVisit = entryPoint instanceof Array ? entryPoint : [entryPoint];
        while (!_.isEmpty(toVisit)) {
            var e = toVisit.pop();
            //WARNING CHECK if classs is defined
            if (!_.contains(visited, e)) {
                visited.push(e);
                this.setModellingElement(e);
                var refs = e.conformsTo().getAllReferences();
                var newNodes = _.flatten(_.map(refs, function(v, x) {return e[x];}));
                toVisit = toVisit.concat(newNodes);
            }
        }
    }
}

/** Add an element (a class, or a class instance) to a model
 *  @param Class - The class to add.
 */
Model.prototype.setModellingElement = function (Class) {
    if (Class.__name == undefined) {
        var tab = this.modellingElements[Class.conformsTo().__name] || [];
        tab.push(Class);
        this.modellingElements[Class.conformsTo().__name] = tab;
    } else {
        var tab = [];
        tab.push(Class);
        this.modellingElements[Class.__name] = tab;
    }
};

/** Add one or several elements (a class, or a class instance) to a model
 *  @param ClassTab - Either a class or a class instance, or an array of such elements.
 */
Model.prototype.setModellingElements = function (ClassTab) {
    var self = this;
    if (ClassTab instanceof Array) {
        _.forEach (ClassTab, function(ct) {
            self.setModellingElement(ct);
        });
    } else {
        self.setModellingElement(ClassTab);
    }
};

//Another way to put modelling elements in model.
/** Synonym for {@link setModellingElements}. */
Model.prototype.add = function (ClassTab) {
    this.setModellingElements(ClassTab);
}

//Send to JSMF Util?
/** Check if a model class instance is in the model.
 * Warning: It will faill if the parameter is a class.
 * */
Model.prototype.contains = function (ModelElement) {
    var indexM = ModelElement.conformsTo().__name;
    var result = _.includes(this.modellingElements[indexM], ModelElement);
    return result;
}


/** Filter elements of a given class in the model. Note: it does not includes the subclasses instances. */
Model.prototype.Filter = function(Classifier) {
 return this.modellingElements[Classifier.__name] ;

}

/** Define a reference model for this model */
Model.prototype.setReferenceModel = function (metamodel) {
    this.referenceModel = metamodel;
}


/** @Class
 * Defines a Class for a Model (M2 modelling in a classical MDE representation).
 * @param {String} name - The name of the class used as an identifier.
 * @param {Array[Class]} supertypes - The supertypes of the class. Multiples superclasses are allwoed.
 * @attributes {Object} attributes - The object is seen as a key/value store where the keys are the name of the attributes that must be added to the class and the value is the type of the attribute.
 * @references {Object} references - The object is seen as a key/value store where the keys are the name of the reference that must be added to the class and the value is the reference descriptor. A reference descriptotr is an object with the following properties:
 *      - type: the type of the reference;
 *      - cardinbality: the refenrence maximal cardinality (-1 if there is no maximum), default is -1;
 *      - composite: the class of the composite objects attached to the reference, if any;
 *      - associated: the name of the associated reference in the target class.
 */
//M2
function Class(name, supertypes, attributes, references) {
    this.__name = name;
    this.__attributes = {};
    this.__references = {};
    this.__superType = {};
    var self = this;
    supertypes = supertypes || [];
    supertypes = supertypes instanceof Array
                 ? supertypes
                 : [supertypes];
    _.forEach(supertypes, function(s) {
        self.setSuperType(s);
    });
    _.forEach(attributes, function (type, name) {
      self.setAttribute(name, type);
    });
    _.forEach(references, function (descriptor, name) {
        var type = descriptor['type'];
        var cardinality = descriptor['cardinality'] || -1;
        var opposite = descriptor['opposite'];
        var composite = descriptor['composite'];
        var associated = descriptor['associated'];
        self.setReference(name, type, cardinality, opposite, composite, associated);
    });
}

/** an alias for `new Class` */
Class.newInstance = function (classname, supertypes, attributes, references) {
    var Obj = new Class(classname, supertypes, attributes, references);  //here check promote/demote functions
    return Obj;
};

/** Class conformsTo itself (metacircularity) */
Class.conformsTo = _.constant(Class);

/** Add an attribute
 * @param String - The name of the attribute
 * @param type - The type of the attribute
 */
Class.prototype.setAttribute = function (name, type) {
    if (!(_.includes(this.__attributes, name))) {
        this.__attributes[name] = type;
    }
};

/** Add an reference
 * @param String - The name of the reference
 * @param type - The type of the attribute
 * @param cardinbality: the refenrence maximal cardinality (-1 if there is no maximum), default is -1;
 * @param composite: the class of the composite objects attached to the reference, if any;
 * @param associated: the name of the associated reference in the target class.
 */
Class.prototype.setReference = function (name, type, cardinality, opposite, composite, associated) {
    //check name?
    this.__references[name] = {
        type: type, //should check the type
        card: cardinality,
        associated: associated
    }
    if (opposite !== undefined) {
        var tmp = this.__references[name];
        tmp.opposite = opposite;
    }
    if (composite !== undefined) {
         var tmp = this.__references[name];
        tmp.composite = composite;
    }

};

/** Define the supertype of this class.
 * @param {Array[Class]} classes - The supertypes.
 */
Class.prototype.setSuperType = function (cls) {
    this.__superType[cls.__name] = cls;
}

/** Instance of MetaClass is conforms to Class. */
Class.prototype.conformsTo = _.constant(Class);


/** Rebuild the inheritance chain of the class, by crawling iteratively the supertypes */
Class.prototype.getInheritanceChain = function() {
    if (Object.getOwnPropertyNames(this.__superType).length == 0 || this.__superType == undefined) {
        return [this];
    } else {
        return _.reduce(this.__superType,
            function (result, next) {
                return result.concat(next.getInheritanceChain());
            },
            [this]
            );
    }
}

var hasClass = function (x, type) {
    var types = type instanceof Array ? type : [type];
    return _.some(x.conformsTo().getInheritanceChain(),
                  function (c) {return _.includes(types, c)});
}

/** get all the References of an object */
Class.prototype.getAllReferences = function() {
    var result={};
    var allsuperTypes = this.getInheritanceChain();
    _.forEach(allsuperTypes, function(refSuperType) {
        _.forEach(refSuperType.__references, function(elem, index) {
            result[index]=elem;
        });
    });
    return result;
}

/** get all the Attributes of an object */
Class.prototype.getAllAttributes = function() {
    var result={};
    var allsuperTypes = this.getInheritanceChain();
    _.forEach(allsuperTypes, function(refSuperType) {
        _.forEach(refSuperType.__attributes, function(elem, index) {
            result[index]=elem;
        });
    });
    return result;
}

/* ************************* *
 * Enum definition           *
 * ************************* */

/** @class
 * Create a enumeration.
 * @param {String} name - the enumeration name.
 * @param {Object} values - keys are the enumeration members, values are the corresponding values.
 */
function Enum(name, values) {
    var self = this;
    this.__name = name;
    this.__literals = [];
    _.forEach(values, function (v, k) { self.setLiteral(k, v);});
    return this;
}

/** Enumerations conformsTo Enum */
Enum.prototype.conformsTo = _.constant(Enum);

/** Add a value to an existing enumeration */
Enum.prototype.setLiteral = function(name, value) {
     if (!(_.contains(this.__literals, name))) {
         this.__literals.push(value);
         this[name]=value;
     }
};

/** Get the value of an enum Key */
Enum.prototype.resolve = function(value) {
    return _.findKey(this, function(x) { return x === value; })
}

/* *************************************************************************************
 *       Building Instance: attributes and references conforms to metamodel elements
 * *************************************************************************************/
function makeAssignation(ob, index, attype) {
    //if attype = primitive JS type else ...
    if ((typeof attype.conformsTo !== 'undefined') && (attype.conformsTo() === Enum)) {
        return function (param) {
            var val = param;
            if (_.contains(attype.__literals,val)) {
                ob[index] = val;
            } else {
                console.log("Error when assigning enum value: "+param);
            }
        };
    }  else {
        var type = new attype;
        return function (param) {
            if (param.__proto__ == type.__proto__) {
                ob[index] = param;
            } else {
                throw new Error("Assigning wrong type: " + param.__proto__ + " expected " + type.__proto__);
                //console.log("Assigning wrong type: " + param.__proto__ + " expected " + type.__proto__);
            }
        };
    }
}

// Adding the creation of opposite except for ARRAY of Type
function makeReference(ob, index, type, card, opposite, composite, associated) {
    ob.associated=[];
    return function assign(param,associated) {
        //CheckCardinalitie
        var elementsinrelation = ob[index].length;
        var types = type instanceof Array ? type : [type];
        if (card == 1 && elementsinrelation >= 1) {
            console.log("error trying to assign multiple elements to a single reference");
        } else if (param instanceof Array) {
            _.forEach(param, function(p) {assign(p, associated)});
        } else if (type === Class) { // <=> bypasscheckType, equivalent to oclAny
            ob[index].push(param);
            ob.associated.push({
                ref: index,
                elem: elementsinrelation,
                associated: associated
            });
        } else if (hasClass(param, types)) {
             if(_.includes(ob[index],param)) {
                 console.log("Error trying to assign already assigned object of relation "+ index);
                 //maybe assigning it because of circular opposite relation
             } else {
                 ob[index].push(param); //ob[index]=param...
                 ob.associated.push({ref: index, elem: elementsinrelation, associated: associated});
                 if(opposite!=undefined) {
                      if (param[opposite] == undefined) { param[opposite] = []; }
                      param[opposite].push(ob);
                      //param[functionStr](ob); // using object function but consequently it is trying to push 2 times but have all the checks...
                      //even for inheritance?
                 }
             }
        } else {
             console.log(_.includes(param.conformsTo().getInheritanceChain()),type);
             console.log(param.conformsTo().getInheritanceChain()[0])
             //ob[index].push(param); //WARNING DO the push if type
             console.log("assigning wrong type: " + param.conformsTo().__name + " to current reference." + " Type " + type.__name + " was expected");
        }
    };
}

/** Creation of a new instance of a Class instance
 * @param {Object} init - init contains the initialisation of the object,
 * associating each attribute / parameter to an initial value.
 * */
Class.prototype.newInstance = function (init) {
    var result = {};
    var self = this;
    function setterName(s) {
      return 'set' + s[0].toUpperCase() + s.slice(1);
    }
    function createAttributesSetter(type) {
        _.forEach (type.__attributes, function(attype, sup) {
            if(attype.conformsTo == undefined) {
                result[sup] = new attype(); //Work with JS primitve types only.
            // } else {
            //    console.log(attype); //TODO: add behavior for jsmf class instance
            }
            result[setterName(sup)] = makeAssignation(result, sup, attype);
            if (init instanceof Object && init[sup] != undefined) {
              result[setterName(sup)](init[sup]);
            }
        });
    };
    function createReferencesSetter(type) {
        _.forEach (type.__references, function(ref, sup) {
            result[sup] = [];
            var type = ref.type;
            var card = ref.card;
            var opposite = ref.opposite;
            var composite = ref.composite;
            var associated = ref.associated;
            result[setterName(sup)] = makeReference(result, sup, type, card, opposite, composite,associated); //TODO: composite specific behavior
            if (init instanceof Object && init[sup] != undefined) {
              result[setterName(sup)](init[sup]);
            }
        });
    }

    //Get all the super types of the current instance
    var allsuperType = this.getInheritanceChain();

    //create setter for attributes from superclass
    _.forEach(allsuperType, function (refSuperType) {
        createAttributesSetter(refSuperType);
        createReferencesSetter(refSuperType);
    });

    //create setter for attributes (super attributes will be overwritten if they have the same name)
    createAttributesSetter(this);
    createReferencesSetter(this);

    // Assign the "type" to which M1 class is conform to.
    result.conformsTo = function () {
        return self;
    };
    result.__jsmfId = uuid.v4();
    return result;
};


//Export three main framework functions
module.exports = {

    Class: Class,
    Model: Model,
    Enum : Enum

};
