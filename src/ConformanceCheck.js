/**
 * @license
 * ©2015-2016 Luxembourg Institute of Science and Technology All Rights Reserved
 * JavaScript Modelling Framework (JSMF)
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @author J.S. Sottet
 * @author N. Biri
 * @author A. Vagner
 */

'use strict'

const _ = require('lodash')

const check = require('jsmf-check')
    , hasClass = require('./Class').hasClass
    , Model = require('./Model').Model

let isJSMFElement, conformsTo
(function() {const Common = require('./Common')
  isJSMFElement = Common.isJSMFElement
  conformsTo = Common.conformsTo
}).call()

const attributesTypeRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
      return _.map(conformsTo(this[0]).getAllAttributes(), (desc, name) => {return {name, desc}})
    }))
    ],
    (e, a) => {
      const value = e[a.name]
      return a.desc.type(value) || (!a.desc.mandatory && (_.isNull(value) || _.isUndefined(value)))
    }
)

const referenceMinCardinalityRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
      return _.map(conformsTo(this[0]).getAllReferences(), (props, name) => {return {name, cardinality: props.cardinality}})
    }))
    ],
    (e, r) => e[r.name].length >= r.cardinality.min
)

const referenceMaxCardinalityRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
      return _.map(conformsTo(this[0]).getAllReferences(), (props, name) => {return {name, cardinality: props.cardinality}})
    }))
    ],
    (e, r) => e[r.name].length <= r.cardinality.max
)

const referencesTypeRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
      return _.map(conformsTo(this[0]).getAllReferences(), (props, name) => {return {name, type: props.type}})
    }))
    , check.all(check.ContextualReference(function () {
      return this[0][this[1].name]
    }))
    ],
    (e, r, v) => {try { return hasClass(v, r.type) } catch (err) { return false }}
)

const associatedTypeRule = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
      return _.map(this[0].getAssociated(), (value, key) => {return {key, value}})
    }))
    , check.all(check.ContextualReference(function () { return this[1].value }))
    ],
    (e, as, v) => {
      const refs = conformsTo(e).getAllReferences()
      const refType = refs[as.key].associated
      try { return hasClass(v.associated, refType) } catch (err) { return false }
    }
)

const nonExtraProperties = new check.Rule(
    [ check.all(check.Reference('elements'))
    , check.all(check.ContextualReference(function () {
      return _.map(this[0], (value, name) => name)
    }))
    , check.raw(check.ContextualReference(function () {
      const attrs = _.map(conformsTo(this[0]).getAllAttributes(), (type, name) => name)
      const refs  = _.map(conformsTo(this[0]).getAllReferences(), (type, name) => name)
      return attrs.concat(refs)
    }))
    ],
    (e, elemA, classAs) => _.includes(classAs, elemA)
)

const conformance = new check.Checker()

conformance.rules =
  { attributesTypeRule
  , referenceMinCardinalityRule
  , referenceMaxCardinalityRule
  , referencesTypeRule
  , associatedTypeRule
  , nonExtraProperties
  }

conformance.helpers.elements = e => {
  if (e instanceof Model) {
    return e.elements()
  }
  if (isJSMFElement(e)) {
    return (new Model('tmp', {}, e, true)).elements()
  }
  throw new TypeError(`Invalid argument for conformance: ${e}`)
}

module.exports = _.assign(conformance.rules, { conformance })
