'use strict';
var AML = require('./MMArduinoML.js')

var Class;
var Model;

(function() {
    var JSMF = require('../../jsmf.js');
    Model = JSMF.Model;
    Class = JSMF.Class;
}).call(undefined, undefined);

var switchExample = new Model('Switch!');
switchExample.setReferenceModel(AML.ArduinoML);

var button = AML.Sensor.newInstance({name: 'button', pin: 9});
var led = AML.Actuator.newInstance({name: 'led', pin: 12});

/*
 * on state
 */

var aOn = AML.Action.newInstance({value: AML.Signal.getValue('HIGH'), actuator: led});
var tOn = AML.Transition.newInstance({value: AML.Signal.getValue('HIGH'), sensor: button});
var on = AML.State.newInstance({name: 'on', action: aOn, transition: tOn})

/*
 * off state
 */

var aOff = AML.Action.newInstance({value: AML.Signal.getValue('LOW'), actuator: led});
var tOff = AML.Transition.newInstance({value: AML.Signal.getValue('LOW'), sensor: button});
var off = AML.State.newInstance({name: 'off', action: aOff, transition: tOff})


/*
 * set transitions
 */
tOn.setNext(off);
tOff.setNext(on);


/*
 * define app
 */

var switchApp = AML.App.newInstance('Switch!', {
    bricks: [button, led],
    states: [on, off],
    initial: off
});

module.exports = {
  switchExample: switchExample,
  switchApp: switchApp
}
