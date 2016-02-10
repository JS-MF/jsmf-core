'use strict';

var _ = require('lodash');

function conformsTo(o) {
    return _.get(o, ['__meta__', 'conformsTo']);
}

function jsmfId(o) {
    return _.get(o, ['__meta__', 'uuid']);
}

function isJSMFElement(o) {
    return conformsTo(o) !== undefined;
}

module.exports =
  { conformsTo: conformsTo
  , jsmfId: jsmfId
  , isJSMFElement: isJSMFElement
  }
