'use strict'

const JSMF = require('../../src/index')

let Class, Model, Enum

(function() {
  Model = JSMF.Model
  Class = JSMF.Class
}).call()

const Member = new Class('Member', [], {firstName : String})
const Family = new Class('Family', [], {lastName : String},
    { father: { type: Member
              , cardinality: JSMF.Cardinality.one
              , opposite: 'familyFather'
              , oppositeCardinality: JSMF.Cardinality.optional
              }
    , mother: { type: Member
              , cardinality: JSMF.Cardinality.one
              , opposite: 'familyMother'
              , oppositeCardinality: JSMF.Cardinality.optional
              }
    , sons: { type: Member
            , cardinality: JSMF.Cardinality.any
            , opposite: 'familySon'
            , oppositeCardinality: JSMF.Cardinality.optional
            }
    , daughters: { type: Member
                 , cardinality: JSMF.Cardinality.any
                 , opposite: 'familyDaughter'
                 , oppositeCardinality: JSMF.Cardinality.optional
                 }
    })

const Families = new Model('Families', undefined, [Family, Member])

module.exports = {Families}
