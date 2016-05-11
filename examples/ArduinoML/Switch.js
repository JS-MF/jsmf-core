'use strict';

var AML = require('./MMArduinoML.js')
var Model;

(function() {
    var JSMF = require('../../src/index');
    Model = JSMF.Model;
}).call();


var button = AML.Sensor.newInstance({name: 'button', pin: 9});
var led = AML.Actuator.newInstance({name: 'led', pin: 12});

/*
 * on state
 */

var aOn = AML.Action.newInstance({value: AML.Signal.HIGH, actuator: led});
var tOn = AML.Transition.newInstance({value: AML.Signal.HIGH, sensor: button});

var on = AML.State.newInstance({name: 'on'});
on.action = aOn;
on.transition = tOn;

/*
 * off state
 */

var aOff = AML.Action.newInstance({value: AML.Signal.LOW, actuator: led});
var tOff = AML.Transition.newInstance({value: AML.Signal.HIGH, sensor: button});
var off = AML.State.newInstance({name: 'off'});
on.action = aOff;
on.transition = tOff;


/*
 * set transitions
 */
tOn.next = off;
tOff.next = on;


/*
 * define app
 */

var switchApp = AML.App.newInstance({
    name: 'Switch!',
    bricks: [button, led],
    states: [on, off],
    initial: off
});

var Switch = new Model('Switch', AML.ArduinoML, switchApp, true);

module.exports = {
    Switch: Switch,
    switchApp: switchApp
}
