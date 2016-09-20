'use strict'

const JSMF = require('../../src/index')

let Class, Model, Enum

(function() {
  Model = JSMF.Model
  Class = JSMF.Class
}).call()

const Person = new Class('Person', [], {fullName: String})
const Male = new Class('Male', Person)
const Female = new Class('Male', Person)

const Persons = new Model('Persons', undefined, [Person, Male, Female])

module.exports = {Persons}
