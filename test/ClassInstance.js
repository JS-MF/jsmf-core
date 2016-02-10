'use strict';

var should = require('should');
var JSMF = require('../index');
var Class = JSMF.Class;

var State = new Class('State', [], {name: JSMF.String});
var Transition = new Class('Transition', [], {on: JSMF.String});
State.addReference('transitions', Transition, JSMF.Cardinality.any, 'source');
Transition.addReference('next', State, JSMF.Cardinality.one);

describe('Class instance', function() {

    describe('Class creation', function() {

        it('can be created using the class as a constructor', function(done) {
            var s = new State();
            s.conformsTo().should.equal(State);
            done();
        });

        it('can be created using newInstance', function(done) {
            var s = State.newInstance();
            s.conformsTo().should.equal(State);
            done();
        });

        it('has an UUID', function(done) {
            var s = State.newInstance();
            should(JSMF.jsmfId(s)).not.equal(undefined);
            done();
        });

        it('creates attributes', function(done) {
            var s = State.newInstance();
            s.should.has.property('name');
            done();
        });

        it('creates inherited attributes', function(done) {
            var MyState = new Class('MyState', State)
            var s = MyState.newInstance();
            s.should.has.property('name');
            done();
        });

        it('creates references', function(done) {
            var s = State.newInstance();
            s.should.has.property('transitions');
            done();
        });

        it('creates inherited references', function(done) {
            var MyState = new Class('MyState', State)
            var s = MyState.newInstance();
            s.should.has.property('transitions');
            done();
        });

        it('can initialize attributes during creation', function(done) {
            var s = State.newInstance({name: 's0'});
            s.should.has.property('name', 's0');
            done();
        });

        it('can initialize references during creation', function(done) {
            var s = State.newInstance();
            var t = State.newInstance({next: [s]});
            t.should.has.property('next', [s]);
            done();
        });

    });

    describe('attribute settings', function() {

        it('assign valid values', function(done) {
            var s = new State();
            s.name = 'foo';
            s.should.have.property('name', 'foo');
            done();
        });

        it('throws error on invalid values', function(done) {
            var s = new State();
            (function() {s.name = 42}).should.throw();
            done();
        });

        it('can use setter syntax to set attributes', function(done) {
            var s = new State();
            s.setName('foo');
            s.should.have.property('name', 'foo');
            done();
        });

    });

    describe('reference settings', function() {

        it('assign valid values', function(done) {
            var s = new State();
            var t = new Transition();
            s.transitions = t;
            s.should.have.property('transitions', [t]);
            done();
        });

        it('throws error on invalid values', function(done) {
            var s = new State();
            var t = new Transition();
            (function() {s.transitions = s}).should.throw();
            done();
        });

        it('can use setter syntax to set attributes', function(done) {
            var s = new State();
            var t = new Transition();
            s.setTransitions([t]);
            s.should.have.property('transitions', [t]);
            done();
        });

        it('replace former references when we use the setter', function(done) {
            var s = new State();
            var t1 = new Transition();
            var t2 = new Transition();
            s.setTransitions([t1]);
            s.setTransitions(t2);
            s.should.have.property('transitions', [t2]);
            done();
        });

        it('add references when we use the adder', function(done) {
            var s = new State();
            var t1 = new Transition();
            var t2 = new Transition();
            s.addTransitions([t1]);
            s.addTransitions(t2);
            s.should.have.property('transitions', [t1, t2]);
            done();
        });

        it('can remove elements from references with remove', function(done) {
            var s = new State();
            var t1 = new Transition();
            var t2 = new Transition();
            s.addTransitions([t1, t2]);
            s.removeTransitions(t2);
            s.should.have.property('transitions', [t1]);
            done();
        });

        it ('add elements to opposite relation', function(done) {
            var s = new State();
            var t1 = new Transition();
            var t2 = new Transition();
            s.addTransitions([t1, t2]);
            t1.should.have.property('source', [s]);
            t2.should.have.property('source', [s]);
            done();
        });

        it ('assign elements from opposite relation', function(done) {
            var s = new State();
            var t1 = new Transition();
            var t2 = new Transition();
            t1.source = s;
            t2.source = s;
            s.should.have.property('transitions', [t1, t2]);
            done();
        });

    });

});
