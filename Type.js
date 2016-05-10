'use strict';

var _ = require('lodash');
var conformsTo = (require('./Common')).conformsTo;


module.exports =
    { Number: _.isNumber
    , Positive: x => x >= 0
    , Negative: x => x <= 0
    , String: _.isString
    , Boolean: _.isBoolean
    , Date: _.isDate
    , Array: _.isArray
    , Object: _.isObject
    , Range: function Range(min, max) {
          const self = function jsmfRange(x) { return x >= min && x <= max }
          self.typeName = 'Range'
          self.min = min
          self.max = max
          return self
      }
    , JSMFAny: x => conformsTo(x) !== undefined
    , Any: _.constant(true)
    }

module.exports.normalizeType = function normalizeType(t) {
    switch (t) {
      case Number: return module.exports.Number
      case String: return module.exports.String
      case Boolean: return module.exports.Boolean
      case Array: return module.exports.Array
      case Object: return module.exports.Object
      case Date: return module.exports.Date
      default: return t
    }
}

