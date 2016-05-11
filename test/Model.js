'use strict';

var should = require('should');
var _ = require('lodash');
var JSMF = require('../src/index');
var Model = JSMF.Model;
var Class = JSMF.Class;

describe('Model', function() {

    describe('constructor', function() {

        it('creates an empty model', function(done) {
            var foo = new Model('Foo');
            foo.modellingElements.should.be.empty();
            foo.referenceModel.should.be.empty();
            done();
        });

        it ('creates a model with a given reference model', function(done) {
            var MM = new Model('Foo');
            var M = new Model('Bar', MM);
            M.referenceModel.should.equal(MM);
            done();
        });

        it ('adds the given classes to the model', function(done) {
            var A = new Class('A');
            var B = new Class('B');
            var M = new Model('Bar', {}, [A, B]);
            M.modellingElements.should.have.property('A', [A]);
            M.modellingElements.should.have.property('B', [B]);
            done();
        });

        it ('adds the given elements to the model', function(done) {
            var A = new Class('A');
            var a = new A();
            var B = new Class('B');
            var b = new B();
            var M = new Model('Bar', {}, [a, b]);
            M.modellingElements.should.have.property('A', [a]);
            M.modellingElements.should.have.property('B', [b]);
            done();
        });

        it ('does not add the given elements transitively if not mentioned', function(done) {
            var A = new Class('A');
            var B = new Class('B');
            A.addReference('b', B);
            var a = new A();
            var b = new B();
            a.b = b;
            var M = new Model('Bar', {}, [a]);
            M.modellingElements.should.have.property('A', [a]);
            M.modellingElements.should.not.have.property('B');
            done();
        });

        it ('adds the given elements transitively if mentioned', function(done) {
            var A = new Class('A');
            var B = new Class('B');
            A.addReference('b', B);
            var a = new A();
            var b = new B();
            a.b = b;
            var M = new Model('Bar', {}, [a], true);
            M.modellingElements.should.have.property('A', [a]);
            M.modellingElements.should.have.property('B', [b]);
            done();
        });

    });

    describe('elements', function() {
        it('lists all the elements of the model', function(done) {
            var A = new Class('A');
            var B = new Class('B');
            A.addReference('b', B);
            var a = new A();
            var b = new B();
            a.b = b;
            var M = new Model('Bar', {}, [a, b], true);
            var elements = M.elements();
            elements.should.have.length(2);
            elements.should.containEql(a);
            elements.should.containEql(b);
            done();
        });
    });

    describe('crop', function() {

        it('remove references to elements that are not in the model', function(done) {
            var A = new Class('A');
            var B = new Class('B');
            A.addReference('b', B);
            var a = new A();
            var b = new B();
            a.b = b;
            var M = new Model('Bar', {}, [a], true);
            M.crop();
            a.b.should.be.empty();
            done();
        });

        it('remove references to elements that are not in the model', function(done) {
            var A = new Class('A');
            var B = new Class('B');
            A.addReference('b', B, 1, 'back', 1, A);
            var a = new A();
            var b = new B();
            a.addB(b, a);
            var M = new Model('Bar', {}, [a], true);
            M.crop();
            a.b.should.be.empty();
            a.getAssociated().b.should.be.empty();
            done();
        });

    });
})
