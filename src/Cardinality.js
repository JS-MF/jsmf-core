
var _ = require('lodash');

function Cardinality(min, max) {
    this.min = min
    this.max = max
}

Cardinality.optional = new Cardinality(0,1)
Cardinality.one = new Cardinality(1,1)
Cardinality.any = new Cardinality(0)
Cardinality.some = new Cardinality(1)

Cardinality.check = function(v) {
    if (_.isNumber(v) && v >= 0) { return {min: 0, max: v} }
    else { return {min: _.get(v, 'min', 0), max: _.get(v, 'max', undefined)}}
}

module.exports = {Cardinality}
