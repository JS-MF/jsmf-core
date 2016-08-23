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

let conformsTo, generateId
(function () {
  const Common = require('./Common')
  conformsTo = Common.conformsTo
  generateId = Common.generateId
}).call()

/** Define an Enum
 * @constructor
 * @param {string} name - The name of the created Enum
 * @param values - Either an Array of string or an Object.
 *                 If an Array is provided, the indexes are used as Enum values.
 */
function Enum(name, values) {
  /** The generic Enum instance
   * @constructor
   */
  function EnumInstance(x) {return _.includes(EnumInstance, x)}
  Object.defineProperties(EnumInstance,
    { __jsmf__: {value: {uuid: generateId(), conformsTo: Enum}}
    , __name: {value: name}
    , getName: {value: getName}
    , conformsTo: {value: () => conformsTo(EnumInstance)}
    })
  if (_.isArray(values)) {
    _.forEach(values, (v, k) => EnumInstance[v] = k)
  } else {
    _.forEach(values, (v, k) => EnumInstance[k] = v)
  }
  return EnumInstance
}

/** The Enum name */
Enum.__name = 'Enum'


Enum.getInheritanceChain = () => [Enum]

/** Given a value, find the associated key in an Enum, if any.
 * @memberof Enum~EnumInstance
 */
function getName(o) {
  return _.findKey(this, v => v === o)
}

/** Check if an object is an Enum
 */
function isJSMFEnum(o) {
  return conformsTo(o) === Enum
}

module.exports = {Enum, isJSMFEnum}
