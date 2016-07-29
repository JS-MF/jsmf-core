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

const Common = require('./Common')
const Model = require('./Model')
const Class = require('./Class')
const Enum = require('./Enum')
const Cardinality = require('./Cardinality')
const Type = require('./Type')

function customizer(obj, other) {
  if (obj === other) {return true}
  if (Common.isJSMFElement(obj) && Common.isJSMFElement(obj)) {
    if (!jsmfIsEqual(obj.conformsTo(), other.conformsTo())) {
      return false
    }
    if (Enum.isJSMFEnum(obj) && Enum.isJSMFEnum(other)) {
      return jsmfIsEqual(dryEnum(obj), dryEnum(other))
    } else if (Class.isJSMFClass(obj) && Class.isJSMFClass(other)) {
      return jsmfIsEqual(dryClass(obj), dryClass(other))
    } else if (obj instanceof Model.Model && obj instanceof Model.Model) {
      return jsmfIsEqual(dryModel(obj), dryModel(other))
    } else {
      return jsmfIsEqual(dryElement(obj), dryElement(other))
    }
  }
}

function dryEnum(e) {
  const res = _.toPairsIn(e)
  return {__jsmf: {uuid: Common.jsmfId(e)}, values: res, name: e.__name}
}

function dryClass(c) {
  return _.assign({__jsmf: {uuid: Common.jsmfId(c)}}, _.toPairsIn(_.omit(c, 'errorCallback')))
}

function dryElement(e) {
  return _.assign({__jsmf: {uuid: Common.jsmfId(e), conformsTo: e.conformsTo()}}, _.toPairsIn(e))
}

function dryModel(c) {
  return _.assign({__jsmf: {uuid: Common.jsmfId(c)}}, _.pick(c, ['__name', 'referenceModel', 'modellingElements']))
}

function jsmfIsEqual(obj, other) {
  return _.isEqualWith(obj, other, customizer)
}

module.exports = _.assign(
  {jsmfIsEqual},
  Common,
  Model,
  Class,
  Enum,
  Cardinality,
  Type)

