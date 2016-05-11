'use strict';
var AML = require('./MMArduinoML.js')

var Model;

(function() {
    var JSMF = require('../../src/index');
    Model = JSMF.Model;
}).call();

var switchExample = new Model('Switch!');
switchExample.setReferenceModel(AML.ArduinoML);

var button = AML.Sensor.newInstance({name: 'button', pin: 9});
switchExample.add(button);
var led = AML.Actuator.newInstance({name: 'led', pin: 12});
switchExample.add(led);

/*
 * on state
 */

var aOn = AML.Action.newInstance({value: AML.Signal.HIGH, actuator: led});
switchExample.add(aOn);
var tOn = AML.Transition.newInstance({value: AML.Signal.HIGH, sensor: button});
switchExample.add(tOn);
var on = AML.State.newInstance({name: 'on', action: aOn, transition: tOn})
switchExample.add(on);

/*
 * off state
 */

var aOff = AML.Action.newInstance({value: AML.Signal.LOW, actuator: led});
switchExample.add(aOff);
var tOff = AML.Transition.newInstance({value: AML.Signal.HIGH, sensor: button});
switchExample.add(tOff);
var off = AML.State.newInstance({name: 'off', action: aOff, transition: tOff})
switchExample.add(off);


/*
 * set transitions
 */
tOn.setNext(off);
tOff.setNext(on);


/*
 * define app
 */

var switchApp = AML.App.newInstance({
    name: 'Switch!',
    bricks: [button, led],
    states: [on, off],
    initial: off
});
switchExample.add(switchApp);

module.exports = {
    switchExample: switchExample,
    switchApp: switchApp
}
