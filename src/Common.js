'use strict'

const _ = require('lodash')

function conformsTo(o) {
  return _.get(o, ['__jsmf__', 'conformsTo'])
}

function jsmfId(o) {
  return _.get(o, ['__jsmf__', 'uuid'])
}

function isJSMFElement(o) {
  const implement = conformsTo(o)
  return implement
    && _.get(implement, 'getInheritanceChain') !== undefined
}

module.exports =
  { conformsTo
  , jsmfId
  , isJSMFElement
  }
