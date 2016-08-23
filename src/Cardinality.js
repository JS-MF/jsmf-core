'use srtict'
const _ = require('lodash')

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

/** Reference Cardinality
 * @constructor
 * @param {number} min - The lower bound of a cardinality
 * @param {number} max - The upper bound of a cardinality
 */
function Cardinality(min, max) {
  /** The minimal cardinality, will be consider as 0 if undefined
   */
  this.min = min
  /** The maxmial cardinality, if udefined, there is no max (*)
   */
  this.max = max
}

/** A Shortcut for 0..1 cardinality
 */
Cardinality.optional = new Cardinality(0,1)

/** A Shortcut for 1..1 cardinality
 */
Cardinality.one = new Cardinality(1,1)

/** A Shortcut for 0..* cardinality
 */
Cardinality.any = new Cardinality(0)

/** A Shortcut for * cardinality
 */
Cardinality.some = new Cardinality(1)

/** Build a Cardinality from a value.
 * If the value is a positive number v, the result will be 0..v
 * If it's any other value, we'll try to get the min and max properties
 * and use respectively 0 and undefined if they are not set.
 *
 * @example
 * // returns {min: 0, max: 4}
 * Cardinality.check(4)
 *
 * @example
 * // returns {min: 2, max: 4}
 * Cardinality.check({min: 2, max: 4})
 *
 * @example
 * // returns {min: 2, max: undefined}
 * Cardinality.check({min: 2, foo: 4})
 *
 * @example
 * // returns {min: 0, max: undefined}
 * Cardinality.check(undefined)
 */
Cardinality.check = function(v) {
  return (_.isNumber(v) && v >= 0)
    ? {min: 0, max: v}
    : {min: _.get(v, 'min', 0), max: _.get(v, 'max', undefined)}
}

module.exports = {Cardinality}
