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
    , conformsTo = (require('./Common')).conformsTo


module.exports =
    { Number: _.isNumber
    , Positive: x => x >= 0
    , Negative: x => x <= 0
    , String: _.isString
    , Boolean: _.isBoolean
    , Date: _.isDate
    , Array: _.isArray
    , Object: _.isObject
    , Range: function Range(min, max) {
      const self = x => x >= min && x <= max
      Object.assign(self, {typeName: 'Range', min, max})
      return self
    }
    , JSMFAny: x => conformsTo(x) !== undefined
    , Any: _.constant(true)
    }

/** Transform a native JS type in a JSMF type */
module.exports.normalizeType = function normalizeType(t) {
  switch (t) {
  case Number: return module.exports.Number
  case String: return module.exports.String
  case Boolean: return module.exports.Boolean
  case Array: return module.exports.Array
  case Object: return module.exports.Object
  case Date: return module.exports.Date
  default: return t
  }
}

