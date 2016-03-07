'use strict';

var should = require('should');
var JSMF = require('../index');

describe('JSMFAny', function() {

    it('validates any JSMF class', function(done) {
        var a = new JSMF.Class('A');
        JSMF.JSMFAny(a).should.be.true();
        done();
    });

    it('validates any JSMF element', function(done) {
        var A = new JSMF.Class('A');
        var a = new A();
        JSMF.JSMFAny(a).should.be.true();
        done();
    });

    it('refuses non JSMF objects', function(done) {
        var a = {x:42};
        JSMF.JSMFAny(a).should.be.false();
        done();
    });

});
