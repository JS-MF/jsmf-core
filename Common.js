'use strict';

var _ = require('lodash');

function conformsTo(o) {
    return _.get(o, ['__jsmf__', 'conformsTo']);
}

function jsmfId(o) {
    return _.get(o, ['__jsmf__', 'uuid']);
}

function isJSMFElement(o) {
    return conformsTo(o) !== undefined;
}

module.exports =
  { conformsTo
  , jsmfId
  , isJSMFElement
  }
