'use strict';

var _ = require('lodash');


module.exports =
    { Number: _.isNumber
    , Positive: function(x) {return x >= 0;}
    , Negative: function(x) {return x <= 0;}
    , String: _.isString
    , Boolean: _.isBoolean
    , Date: _.isDate
    , Array: _.isArray
    , Object: _.isObject
    , Range: function Range(min, max) {
          var self = function jsmfRange(x) { return x >= min && x <= max }
          self.typeName = 'Range';
          self.min = min;
          self.max = max;
          return self;
      }
    , Any: _.constant(true)
    }

module.exports.normalizeType = function normalizeType(t) {
    switch (t) {
      case Number: return module.exports.Number;
      case String: return module.exports.String;
      case Boolean: return module.exports.Boolean;
      case Array: return module.exports.Array;
      case Object: return module.exports.Object;
      case Date: return module.exports.Date;
      default: return t;
    }
}

