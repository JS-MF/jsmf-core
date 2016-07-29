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
const uuid = require('uuid')

const conformsTo = require('./Common').conformsTo

function Enum(name, values) {
  function jsmfEnum(x) {return _.includes(jsmfEnum, x)}
  Object.defineProperties(jsmfEnum,
    { __jsmf__: {value: {uuid: uuid.v4(), conformsTo: Enum}}
    , __name: {value: name}
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
