'use strict'

const _ = require('lodash')
const uuid = require('uuid')

const conformsTo = require('./Common').conformsTo

function Enum(name, values) {
  function jsmfEnum(x) {return _.includes(jsmfEnum, x)}
  jsmfEnum.__name = name
  Object.defineProperties(jsmfEnum,
    { __jsmf__: {value: {uuid: uuid.v4(), conformsTo: Enum}}
    , getName: {value: getName}
    , conformsTo: {value: () => conformsTo(jsmfEnum)}
    })
  if (values instanceof Array) {
    _.forEach(values, (v, k) => jsmfEnum[v] = k)
  } else {
    _.forEach(values, (v, k) => jsmfEnum[k] = v)
  }
  return jsmfEnum
}

Enum.getInheritanceChain = () => [Enum]

function getName(o) {
  return _.findKey(this, v => v === o)
}

function isJSMFEnum(o) {
  return conformsTo(o) === Enum
}



module.exports = {Enum, isJSMFEnum}
