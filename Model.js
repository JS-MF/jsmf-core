'use strict';

var _ = require('lodash');

var isJSMFElement, conformsTo;
(function() {
    var common = require('./Common');
    isJSMFElement = common.isJSMFElement;
    conformsTo = common.conformsTo;
}).call();

var isJSMFEnum;
(function() {
    var e = require('./Enum');
    isJSMFEnum = e.isJSMFEnum;
}).call();


var isJSMFClass;
(function() {
    var cls = require('./Class');
    isJSMFClass = cls.isJSMFClass;
}).call();


function Model(name, referenceModel, modellingElements, transitive) {
    this.__name = name;
    this.referenceModel = referenceModel || {};
    this.modellingElements = {};
    if (modellingElements !== undefined) {
        modellingElements = modellingElements instanceof Array ?  modellingElements : [modellingElements];
        if (transitive) {
            this.modellingElements = crawlElements(modellingElements);
        } else {
            var self = this;
            _.forEach(modellingElements, function(e) {self.addModellingElement(e)});
        }
    }
}

function modelExport(m) {
    var extractedFirst = _.mapValues(m.modellingElements, function(x) {return x[0];});
    var result = _.pickBy(extractedFirst, function(x) {return isJSMFClass(x) || isJSMFEnum(x);});
    result[m.__name] = m;
    return result;
}

Model.prototype.addModellingElement = function(es) {
    var self = this;
    es = es instanceof Array ? es : [es];
    _.forEach(es, function(e) {
        if (!isJSMFElement(e)) {throw new TypeError('can\'t Add ' + e + ' to model ' + self);}
        var key;
        if (isJSMFClass(e) || isJSMFEnum(e)) {
            key = e.__name;
        } else {
            key = conformsTo(e).__name;
        }
        var current = self.modellingElements[key] || [];
        current.push(e);
        self.modellingElements[key] = current;
    });
}

Model.prototype.Filter = function(cls) {
    return this.modellingElements[_.get(cls, '__name')];
}

Model.prototype.setModellingElements = Model.prototype.addModellingElement;
Model.prototype.add = Model.prototype.addModellingElement;
Model.prototype.setReferenceModel = function(rm) { this.referenceModel = rm; }

Model.prototype.elements = function() {
    return _.flatten(_.values(this.modellingElements));
}

Model.prototype.crop = function() {
    var elements = this.elements();
    _.forEach(elements, function(e) {
        var mme = e.conformsTo();
        if (mme !== undefined) {
            for (var refName in mme.references) {
                e.__jsmf__.references[refName] = _.intersection(e.__jsmf__.references, elements);
                e.__jsmf__.associated[refName] = _.filter(e.__jsmf__.associated[refName], function(x) {
                    return _.includes(e.__jsmf__.references[refName], x.elem);
                });
            }
        }
    })
}


function crawlElements(init) {
    var visited = [];
    var toVisit = init;
    while (!_.isEmpty(toVisit)) {
        var e = toVisit.pop();
        if (!_.includes(visited, e)) {
            visited.push(e);
            var refs = {};
            var newNodes = [];
            if (isJSMFClass(e)) {
                refs = e.getAllReferences();
                var refTypes = _.map(refs, function(v) {return v.type;});
                var attrs = e.getAllAttributes();
                var attrsEnum = _.filter(_.values(attrs), isJSMFEnum);
                newNodes = _.flatten([refTypes, attrsEnum, e.getInheritanceChain()]);
            } else if (isJSMFEnum(e)) {
                newNodes = [];
            } else if (isJSMFElement(e)) {
              refs = conformsTo(e).getAllReferences();
              newNodes = _.flatten(_.map(refs, function(v, x) {return e[x];}));
            }
            toVisit = toVisit.concat(newNodes);
        }
    }
    return dispatch(visited);
}

function dispatch(elems) {
    var result = {};
    _.forEach(elems, function(e) {
        var key;
        if (isJSMFClass(e) || isJSMFEnum(e)) {
            key = e.__name;
        } else if (isJSMFElement(e)) {
            key = e.conformsTo().__name;
        }
        var values = result[key] || [];
        values.push(e);
        result[key] = values;
    });
    return result;
}


module.exports =
    { Model: Model
    , modelExport: modelExport
    }
