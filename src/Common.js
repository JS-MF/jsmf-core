'use strict'

const _ = require('lodash')
    , uuid = require('uuid')

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

function generateId() {
  const arrayUUID = new Array(16)
  uuid.v4(null, arrayUUID)
  return arrayUUID
}

module.exports =
  { conformsTo
  , jsmfId
  , isJSMFElement
  , generateId
  }
