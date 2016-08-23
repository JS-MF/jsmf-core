'use strict'

const _ = require('lodash')
    , uuid = require('uuid')

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

/** Provides the conformsTo relationship of any jsmfElement
 * @param o - A jsmf Object (usually Class, Enum, Model, or ClassInstance)
 */
function conformsTo(o) {
  return _.get(o, ['__jsmf__', 'conformsTo'])
}

/** Returns the jsmfId of any jsmfElement
 * @param o - A jsmf Object (usually Class, Enum, Model, or ClassInstance)
 */
function jsmfId(o) {
  return _.get(o, ['__jsmf__', 'uuid'])
}

/** Check if an object is a JSMFElement
 * By construction a JSMFElement has a jsmfID,
 * returns a value on {@link conformsTo}
 * this value has a getInheritanceChain method.
 */
function isJSMFElement(o) {
  const implement = conformsTo(o)
  return implement
    && _.get(implement, 'getInheritanceChain') !== undefined
    && jsmfId(o) !== undefined
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
