'use strict';

var JSMF = require('../../index');

var Class, Model, Enum;

(function() {
    Model = JSMF.Model;
    Class = JSMF.Class;
    Enum = JSMF.Enum;
}).call();


var Signal = new Enum('Signal', ['LOW', 'HIGH']);

var NamedElement = Class.newInstance('NamedElement', [], {name: String});

var App = Class.newInstance('App', NamedElement);

var State = Class.newInstance('State', NamedElement);
App.setReference('states', State, -1);
App.setReference('initial', State, 1);

var Brick = Class.newInstance('Brick', NamedElement, {pin: JSMF.Range(0,13)});

var Action = Class.newInstance('Action', [], {value: Signal});
State.setReference('action', Action, -1);

var Transition = Class.newInstance('Transition', [], {value: Signal});
Transition.setReference('next', State, 1);
State.setReference('transition', Transition, 1);

var Sensor = Class.newInstance('Sensor', Brick);
Transition.setReference('sensor', Sensor, 1);

var Actuator = Class.newInstance('Actuator', Brick);
Action.setReference('actuator', Actuator, 1);

App.setReference('bricks', Brick, -1);

var ArduinoML = new Model('ArduinoML', {}, App, true);

module.exports = JSMF.modelExport(ArduinoML);
