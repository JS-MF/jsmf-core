'use strict';

const AML = require('./MMArduinoML.js')
const Model = require('../../src/index').Model


const button = AML.Sensor.newInstance({name: 'button', pin: 9})
const led = AML.Actuator.newInstance({name: 'led', pin: 12})

/*
 * on state
 */

const aOn = AML.Action.newInstance({value: AML.Signal.HIGH, actuator: led})
const tOn = AML.Transition.newInstance({value: AML.Signal.HIGH, sensor: button})

const on = AML.State.newInstance({name: 'on'})
on.action = aOn
on.transition = tOn

/*
 * off state
 */

const aOff = AML.Action.newInstance({value: AML.Signal.LOW, actuator: led})
const tOff = AML.Transition.newInstance({value: AML.Signal.HIGH, sensor: button})
const off = AML.State.newInstance({name: 'off'})
on.action = aOff
on.transition = tOff


/*
 * set transitions
 */
tOn.next = off
tOff.next = on


/*
 * define app
 */

const switchApp = AML.App.newInstance({
    name: 'Switch!',
    bricks: [button, led],
    states: [on, off],
    initial: off
})

const Switch = new Model('Switch', AML.ArduinoML, switchApp, true)

module.exports = {
    Switch: Switch,
    switchApp: switchApp
}
