'use strict';

var _ = require('lodash');
var uuid = require('uuid');

var Common = require('./Common');
var Model = require('./Model');
var Class = require('./Class');
var Enum = require('./Enum');
var Cardinality = require('./Cardinality');
var Type = require('./Type');

module.exports =
    { Model: Model.Model
    , modelExport: Model.modelExport
    , Class: Class.Class
    , isJSMFClass: Class.isJSMFClass
    , checkCardinality: Class.checkCardinality
    , Cardinality: Cardinality.Cardinality
    , Enum: Enum.Enum
    , isJSMFEnum: Enum.isJSMFEnum
    , conformsTo: Common.conformsTo
    , jsmfId: Common.jsmfId
    , isJSMFElement: Common.isJSMFElement
    , Number: Type.Number
    , String: Type.String
    , Boolean: Type.Boolean
    , Date: Type.Date
    , Array: Type.Array
    , Object: Type.Object
    , Range: Type.Range
    , Any: Type.Any
    , normalizeType: Type.normalizeType
    }
