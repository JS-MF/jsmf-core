'use strict';

var should = require('should');
var JSMF = require('../src/index');
var Class = JSMF.Class;

describe('Class', function() {


    describe('Class construction', function() {

        it('should have the given name', function(done) {
            var Instance = new Class('Instance');
            Instance.__name.should.equal('Instance');
            done();
        })

        it('should ConformsTo Class', function(done) {
            var Instance = new Class('Instance');
            Instance.conformsTo().should.equal(Class);
            done();
        });

        it('has an UUID', function(done) {
            var s = new Class('S');
            should(JSMF.jsmfId(s)).not.equal(undefined);
            done();
        });

        it('can be built with newInstance', function(done) {
            var Instance = Class.newInstance('Instance');
            Instance.__name.should.equal('Instance');
            done();
        });
    });

    describe('Class inheritance', function() {

        it('should work with assigniation of superClasses', function(done) {
            var Instance = new Class('Instance');
            var SuperInstance = new Class('SuperInstance');
            var NonRelatedInstance = new Class('NonRelatedInstance');
            Instance.superClasses = [SuperInstance];
            Instance.superClasses.should.containEql(SuperInstance);
            done();
        }),

        it('should work with push of new superClass', function(done) {
            var Instance = new Class('Instance');
            var SuperInstance = new Class('SuperInstance');
            var NonRelatedInstance = new Class('NonRelatedInstance');
            Instance.superClasses.push(SuperInstance);
            Instance.superClasses.should.containEql(SuperInstance);
            done();
        }),

        it('should work at class initialization', function(done) {
            var SuperInstance = new Class('SuperInstance');
            var Instance = new Class('Instance', SuperInstance);
            var NonRelatedInstance = new Class('NonRelatedInstance');
            Instance.superClasses = [SuperInstance];
            Instance.superClasses.should.containEql(SuperInstance);
            done();
        }),

        it('can be done in cascade', function(done) {
            var Instance = new Class('Instance');
            var SuperInstance = new Class('SuperInstance');
            var SuperSuperInstance = new Class('SuperSuperInstance');
            Instance.superClasses = [SuperInstance];
            SuperInstance.superClasses = [SuperSuperInstance];
            Instance.superClasses.should.containEql(SuperInstance);
            Instance.superClasses.should.not.containEql(SuperSuperInstance);
            SuperInstance.superClasses.should.containEql(SuperSuperInstance);
            SuperInstance.superClasses.should.not.containEql(SuperInstance);
            done();
        }),

        it('should support multi-inheritance', function(done) {
            var SuperInstance = new Class('SuperInstance');
            var OtherSuperInstance = new Class('OtherSuperInstance');
            var Instance = new Class('Instance', [SuperInstance, OtherSuperInstance]);
            Instance.superClasses.should.have.length(2);
            Instance.superClasses.should.containEql(SuperInstance);
            Instance.superClasses.should.containEql(OtherSuperInstance);
            done();
        });
    });

    describe('Class attributes', function() {

        it('allows jsmf primitive types', function(done) {
          var State = new Class('State');
          State.attributes.should.be.empty;
          State.setAttribute('name', JSMF.String);
          State.attributes.should.have.property('name', {type: JSMF.String, mandatory: false});
          done();
        });

        it('allows normalize built-in primitive types', function(done) {
          var State = new Class('State');
          State.attributes.should.be.empty();
          State.setAttribute('name', String);
          State.attributes.should.have.property('name', {type: JSMF.String, mandatory: false});
          done();
        });

        it('allows mandatory attributes', function(done) {
          var State = new Class('State');
          State.attributes.should.be.empty();
          State.setAttribute('name', String, true);
          State.attributes.should.have.property('name', {type: JSMF.String, mandatory: true});
          done();
        });

        it('has addAttribute is a synonym to setAttribute', function(done) {
          var State = new Class('State');
          State.attributes.should.be.empty();
          State.addAttribute('name', JSMF.String);
          State.attributes.should.have.property('name', {type: JSMF.String, mandatory: false});
          done();
        });

        it('accept bulk setting', function(done) {
          var State = new Class('State');
          State.attributes.should.be.empty;
          State.addAttributes({name: {type: JSMF.String, mandatory: true}, age: Number});
          State.attributes.should.have.property('name', {type: JSMF.String, mandatory: true});
          State.attributes.should.have.property('age', {type: JSMF.Number, mandatory: false});
          done();
        });

        it('can be modified', function(done) {
          var State = new Class('State');
          State.attributes.should.be.empty;
          State.addAttributes({name: JSMF.Number});
          State.addAttributes({name: JSMF.String});
          State.attributes.should.have.property('name', {type: JSMF.String, mandatory: false});
          done();
        });

        it('can be set at initialization', function(done) {
          var State = new Class('State', [], {name: JSMF.String, age: Number});
          State.attributes.should.have.property('name', {type: JSMF.String, mandatory: false});
          State.attributes.should.have.property('age', {type: JSMF.Number, mandatory: false});
          done();
        });

        it ('can be removed', function(done) {
          var State = new Class('State', [], {name: JSMF.String, age: Number});
          State.removeAttribute('name');
          State.attributes.should.not.have.property('name');
          State.attributes.should.have.property('age', {type: JSMF.Number, mandatory: false});
          done();
        });

    });

    describe('Class references', function() {

        it('can be assign', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReference('has', SuperPower, JSMF.Cardinality.one);
            Hero.references.should.have.property('has');
            Hero.references.has.should.have.property('type', SuperPower);
            Hero.references.has.should.have.property('cardinality')
            Hero.references.has.cardinality.should.have.property('min' , 1);
            Hero.references.has.cardinality.should.have.property('max' , 1);
            done();
        });

        it('has a default cardinality of {0,n}', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReference('has', SuperPower);
            Hero.references.should.have.property('has');
            Hero.references.has.should.have.property('cardinality');
            Hero.references.has.cardinality.should.have.property('min', 0);
            Hero.references.has.cardinality.should.have.property('max', undefined);
            done();
        });

        it('accepts only the max cardinality', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReference('has', SuperPower, 2);
            Hero.references.should.have.property('has');
            Hero.references.has.should.have.property('cardinality');
            Hero.references.has.cardinality.should.have.property('max', 2);
            done();
        });

        it('has unlimited max cardinality on negative number', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReference('has', SuperPower, -1);
            Hero.references.should.have.property('has');
            Hero.references.has.should.have.property('cardinality');
            Hero.references.has.cardinality.should.have.property('max', undefined);
            done();
        });

        it('push opposite reference in the target class', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReference('has', SuperPower, JSMF.Cardinality.any, 'owners');
            SuperPower.references.should.have.property('owners');
            Hero.references.has.should.have.property('opposite', 'owners');
            done();
        });

        it('keep the cardinality of the opposite ref if it exists', function(done) {
            const Hero = new Class('Hero')
            const SuperPower = new Class('SuperPower')
            SuperPower.setReference('owners', Hero, JSMF.Cardinality.one)
            Hero.setReference('has', SuperPower, JSMF.Cardinality.any, 'owners')
            SuperPower.references.should.have.property('owners')
            SuperPower.references.owners.cardinality.should.have.properties({min: 1, max: 1})
            SuperPower.references.owners.should.have.property('opposite', 'has')
            done();
        });

        it('support bulk definition', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReferences({has: {target: SuperPower}, weakness: {target: SuperPower}});
            Hero.references.should.have.property('has');
            Hero.references.should.have.property('weakness');
            done();
        });

        it('can be set at initialization', function(done) {
            var SuperPower = new Class('SuperPower');
            var Hero = new Class('Hero', [], {}, {has: {target: SuperPower}, weakness: {target: SuperPower}});
            Hero.references.should.have.property('has');
            Hero.references.should.have.property('weakness');
            done();
        });

        it('has addReference as a synonym', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.addReference('has', SuperPower, JSMF.Cardinality.one);
            Hero.references.should.have.property('has');
            Hero.references.has.should.have.property('type', SuperPower);
            Hero.references.has.should.have.property('cardinality')
            Hero.references.has.cardinality.should.have.property('min' , 1);
            Hero.references.has.cardinality.should.have.property('max' , 1);
            done();
        });

        it ('can be removed', function(done) {
            var SuperPower = new Class('SuperPower');
            var Hero = new Class('Hero', [], {}, {has: {target: SuperPower}, weakness: {target: SuperPower}});
            Hero.removeReference('has');
            Hero.references.should.not.have.property('has');
            Hero.references.should.have.property('weakness');
            done();
        });

        it('remove a removed reference from its opposite', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReference('has', SuperPower, JSMF.Cardinality.any, 'owners');
            Hero.removeReference('has');
            SuperPower.references.owners.should.not.have.property('opposite');
            done();
        });

        it('can removed a reference and its opposite simulteneaously', function(done) {
            var Hero = new Class('Hero');
            var SuperPower = new Class('SuperPower');
            Hero.setReference('has', SuperPower, JSMF.Cardinality.any, 'owners');
            Hero.removeReference('has', true);
            SuperPower.references.should.not.have.property('owners');
            done();
        });

    });

    describe('Class getInheritanceChain', function() {

        it('returns the class alone if no superClasses', function(done) {
            var Hero = new Class('Hero');
            Hero.getInheritanceChain().should.be.eql([Hero]);
            done();
        });

        it('returns the class and it\'s parent for simple inheritance', function(done) {
            var Hero = new Class('Hero');
            var SuperHero = new Class('SuperHero', [Hero]);
            SuperHero.getInheritanceChain().should.be.eql([Hero, SuperHero]);
            done();
        });

        it('returns the class and it\'s parent for multiple inheritance', function(done) {
            var A = new Class('A');
            var B = new Class('B', [A]);
            var C = new Class('C', [A]);
            var D = new Class('D', [B,C]);
            D.getInheritanceChain().should.be.eql([A, B, A, C, D]);
            done();
        });

    });

    describe('Class getAllAttributes', function() {

        it('returns the attributes of the class if no inheritance', function(done) {
            var State = new Class('State');
            State.attributes.should.be.empty;
            State.addAttributes({name: JSMF.String, age: Number});
            State.getAllAttributes().should.have.property('name', {type: JSMF.String, mandatory: false});
            State.getAllAttributes().should.have.property('age', {type: JSMF.Number, mandatory: false});
            done();
        });

        it('get parents attributes, override them if necessary', function(done) {
            var State = new Class('State');
            var TargetState = new Class('TargetState', State);
            State.attributes.should.be.empty;
            State.addAttributes({name: JSMF.String, age: Number});
            function positive(x) {return x > 0;}
            TargetState.addAttributes({age: positive, value: JSMF.Any});
            TargetState.getAllAttributes().should.have.property('name', {type: JSMF.String, mandatory: false});
            TargetState.getAllAttributes().should.have.property('age', {type: positive, mandatory: false});
            TargetState.getAllAttributes().should.have.property('value', {type: JSMF.Any, mandatory: false});
            done();
        });

        it ('kept the attributes of the last inherited class', function(done) {
            var A = new Class('A', [], {foo: JSMF.Number});
            var B = new Class('B', [], {foo: JSMF.String});
            var C = new Class('C', [A, B]);
            C.getAllAttributes().should.have.property('foo', {type: JSMF.String, mandatory: false});
            done();
        });

    });

    describe('Class getAllReferences', function() {

        it('returns the references of the class if no inheritance', function(done) {
            var State = new Class('State');
            State.attributes.should.be.empty;
            State.addReference('next', State);
            State.getAllReferences().should.have.property('next');
            done();
        });

        it('get parents attributes, override them if necessary', function(done) {
            var State = new Class('State');
            var TargetState = new Class('TargetState', State);
            State.attributes.should.be.empty;
            State.addAttributes({name: JSMF.String, age: Number});
            State.addReference('next', State);
            TargetState.addReference('next', TargetState);
            var references = TargetState.getAllReferences();
            references.should.have.property('next');
            references.next.should.have.property('type', TargetState);
            done();
        });

        it ('kept the references of the last inherited class', function(done) {
            var A = new Class('A');
            A.addReference('foo', A);
            var B = new Class('B');
            B.addReference('foo', B);
            var C = new Class('C', [A, B]);
            var references = C.getAllReferences();
            references.should.have.property('foo');
            references.foo.should.have.property('type', B);
            done();
        });

    });
});
