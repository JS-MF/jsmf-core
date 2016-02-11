'use strict';

var Class;
var Model;
var Enum;

(function() {var JSMF = require('../../index');
    Model = JSMF.Model;
    Class = JSMF.Class;
    Enum = JSMF.Enum;
}).call();

var ArduinoML = new Model('ArduinoML');

var Signal = new Enum('Signal', {LOW: 0, HIGH: 1});

var NamedElement = Class.newInstance('NamedElement', [], {name: String});

var App = Class.newInstance('App', NamedElement);

var State = Class.newInstance('State', NamedElement);
App.setReference('states', State, -1);
App.setReference('initial', State, 1);

var Brick = Class.newInstance('Brick', NamedElement, {pin: Number});

var Action = Class.newInstance('Action', [], {value: Number});
State.setReference('action', Action, -1);

var Transition = Class.newInstance('Transition', [], {value: Number});
Transition.setReference('next', State, 1);
State.setReference('transition', Transition, 1);

var Sensor = Class.newInstance('Sensor', Brick);
Transition.setReference('sensor', Sensor, 1);

var Actuator = Class.newInstance('Actuator', Brick);
Action.setReference('actuator', Actuator, 1);

App.setReference('bricks', Brick, -1);


ArduinoML.setModellingElements([Signal, NamedElement, App, State, Brick, Action, Transition, Sensor, Actuator]);

module.exports = {
  ArduinoML: ArduinoML,
  Signal: Signal,
  NamedElement: NamedElement,
  App: App,
  State: State,
  Brick: Brick,
  Action: Action,
  Transition: Transition,
  Sensor: Sensor,
  Actuator: Actuator
}
