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

//DEF: Check Type Strict, Partial, None | Check Cardinality Strict, Partial, None, ...
//Natural => Formal
function Model(name) {
    this.__name = name;
    this.referenceModel = {}; //set the metamodel of this
    this.modellingElements = {};
}

//WARNING CHECK if classs is defined
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

//
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
Model.prototype.add = function (ClassTab) {
    this.setModellingElements(ClassTab);
}

//Send to JSMF Util?
Model.prototype.contains = function (ModelElement) {
    var indexM = ModelElement.conformsTo().__name;
    var result = _.includes(this.modellingElements[indexM], ModelElement);
    return result;
}


Model.prototype.Filter = function(Classifier) {
 return this.modellingElements[Classifier.__name] ;

}

Model.prototype.setReferenceModel = function (metamodel) {
    this.referenceModel = metamodel;
}


//M2
function Class(name) {
    this.__name = name;
    this.__attributes = {};
    this.__references = {};
    this.__superType = {};
}

Class.newInstance = function (classname){
    var Obj = new Class(classname);  //here check promote/demote functions
    return Obj;
};

//Class conformsTo itself (metacircularity)
Class.conformsTo = function() {
    return Class;

};

Class.prototype.setAttribute = function (name, type) {
    if (!(_.includes(this.__attributes, name))) {
        this.__attributes[name] = type;
    }
};

Class.prototype.setSuperType = function (Class) {
    this.__superType[Class.__name] = Class;
}

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

//
Class.prototype.getAllReferences = function() {
    var result={};
    _.forEach(this.__references, function(elem, index) {
        result[index]=elem;
    });
    var allsuperTypes = this.getInheritanceChain();
    _.forEach(allsuperTypes, function(refSuperType) {
        _.forEach(refSuperType.__references, function(elem, index) {
            result[index]=elem;
        });
    });
    return result;
}

Class.prototype.getAllAttributes = function() {
    return _.reduce (this.getInheritanceChain(),
        function(result, refSuperType) {
            result.push(refSuperType.__attributes);
        },
        [this.__attribute]
        );
}

//Instance of MetaClass is conforms to Class.
Class.prototype.conformsTo = function () {
    return Class;
};


Class.prototype.setReference = function (name, type, cardinality, opposite, composite, associated) {
    //check name?
    this.__references[name] = {
        "type": type, //should check the type
        "card": cardinality,
        "associated":associated
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

/******************************
//Enum definition : should extend class? or a super class classifier?
*****************************/
function Enum(name) {
    this.__name = name;
    this.__literals = {};
    return this;
}

Enum.prototype.conformsTo = function() {return Enum;}

Enum.prototype.setLiteral = function(name, value) {
     if (_.includes(this.__literals, name)) {
        console.log("Try to set existing litteral " + name + " for Enum " + this);
     } else {
        this.__literals[name]=value;
     }
};

Enum.prototype.getValue= function(name) {
    return this.__literals[name];
}

/****************************************************************************************
*       Building Instance: attributes and references conforms to metamodel elements
****************************************************************************************/
function makeAssignation(ob, index, attype) {
    //if attype = primitive JS type else ...
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
                "ref":index,
                "elem":elementsinrelation,
                "associated":associated
            });
        } else if (hasClass(param, types)) {
             if(_.includes(ob[index],param)) {
                 console.log("Error trying to assign already assigned object of relation "+ index);
                 //maybe assigning it because of circular opposite relation
             } else {
                 ob[index].push(param); //ob[index]=param...
                 ob.associated.push({"ref":index, "elem":elementsinrelation, "associated":associated});
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

Class.prototype.newInstance = function (init) {
    var result = {};
    var self = this;
    var setterName = function (s) {
      return 'set' + s[0].toUpperCase() + s.slice(1);
    }
    var createAttributesSetter = function (type) {
        _.forEach (type.__attributes, function(attype, sup) {
            if(attype.conformsTo== undefined) {
                result[sup] = new attype(); //Work with JS primitve types only.
            } else {
                console.log(attype); //TODO: add behavior for jsmf class instance
            }
            result[setterName(sup)] = makeAssignation(result, sup, attype);
            if (init instanceof Object && init[sup] != undefined) {
              result[setterName(sup)](init[sup]);
            }
        });
    };
    var createReferencesSetter = function (type) {
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

    return result;
};

//Export three main framework functions
module.exports = {

    Class: Class,

    Model: Model,

    Enum : Enum

};
