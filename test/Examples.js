'use strict';

var should = require('should');
var JSMF = require('../src/index');

describe('ArduinoML', function() {

    describe('Metamodel', function() {

        var MM = require('../examples/ArduinoML/MMArduinoML');

        it('exports the expected elements', function(done) {
            MM.should.have.properties(
                [ 'NamedElement'
                , 'App'
                , 'Brick'
                , 'Sensor'
                , 'Actuator'
                , 'State'
                , 'Transition'
                , 'Signal'
                , 'ArduinoML'
                ]);
            done();
        });

        it('has the expected references and attributes', function(done) {
            MM.NamedElement.attributes.should.have.property(['name']);
            MM.App.references.should.have.properties(['states', 'initial', 'bricks']);
            MM.State.references.should.have.properties(['action', 'transition']);
            done();
        });

    });

    describe('Model', function() {

        var M = require('../examples/ArduinoML/Switch');

        it('Model has the expected elements', function(done) {
            var me = M.Switch.modellingElements;
            me.should.have.properties(
                [ 'App'
                , 'Sensor'
                , 'Actuator'
                , 'State'
                , 'Transition'
                ]);
            me.App[0].should.have.properties(['initial', 'states']);
            me.App[0].states.should.have.length(2);
            done();
        });

    });

});
