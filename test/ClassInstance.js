'use strict'

const should = require('should')
const JSMF = require('../src/index')
const Class = JSMF.Class

const State = new Class('State', [], {name: JSMF.String})
const Transition = new Class('Transition', [], {on: JSMF.String})
State.addReference('transitions', Transition, JSMF.Cardinality.any, 'source')
Transition.addReference('next', State, JSMF.Cardinality.one)

describe('Class instance', function() {

    describe('Class creation', function() {

        it('can be created using the class as a constructor', function(done) {
            const s = new State()
            s.conformsTo().should.equal(State)
            done()
        })

        it('can be created using newInstance', function(done) {
            const s = State.newInstance()
            s.conformsTo().should.equal(State)
            done()
        })

        it('has an UUID', function(done) {
            const s = State.newInstance()
            should(JSMF.jsmfId(s)).not.equal(undefined)
            done()
        })

        it('creates attributes', function(done) {
            const s = State.newInstance()
            s.should.has.property('name')
            done()
        })

        it('creates inherited attributes', function(done) {
            const MyState = new Class('MyState', State)
            const s = MyState.newInstance()
            s.should.has.property('name')
            done()
        })

        it('creates references', function(done) {
            const s = State.newInstance()
            s.should.has.property('transitions')
            done()
        })

        it('creates inherited references', function(done) {
            const MyState = new Class('MyState', State)
            const s = MyState.newInstance()
            s.should.has.property('transitions')
            done()
        })

        it('can initialize attributes during creation', function(done) {
            const s = State.newInstance({name: 's0'})
            s.should.has.property('name', 's0')
            done()
        })

        it('can initialize references during creation', function(done) {
            const s = State.newInstance()
            const t = State.newInstance({next: [s]})
            t.should.has.property('next', [s])
            done()
        })

    })

    describe('attribute settings', function() {

        it('assign valid values', function(done) {
            const s = new State()
            s.name = 'foo'
            s.should.have.property('name', 'foo')
            done()
        })

        it('can use setter syntax to set attributes', function(done) {
            const s = new State()
            s.setName('foo')
            s.should.have.property('name', 'foo')
            done()
        })

        it('throws error on invalid values', function(done) {
            const s = new State()
            function test() {s.name = 42}
            test.should.throw()
            done()
        })

        it('throws error when we set undefined value for mandatory attribute', function(done) {
            const Foo = new Class('Foo', [], {x: {type: Number, mandatory: true}});
            const s = new Foo({x: 12})
            function test() {s.x = undefined}
            test.should.throw()
            done()
        })

        it('allows undefined value to optional attribute', function(done) {
            const Foo = new Class('Foo', [], {x: {type: Number, mandatory: false}});
            const s = new Foo({x: 12})
            function test() {s.x = undefined}
            test.should.not.throw()
            done()
        })

        it('doesn\'t stop on false value', function(done) {
            const C = new Class('C', undefined, {a: Boolean, b: Number})
            const c = new C({a: false, b: 12})
            c.should.have.property('b', 12)
            done()
        })

        it('assign wongly typed values on relaxed schema', function(done) {
            const Foo = new Class('Foo', [], {test: {type: Number, errorCallback: JSMF.onError.silent}})
            const s = new Foo({test: "i'm not a number"})
            s.should.have.property('test', "i'm not a number")
            done()
        })

    })

    describe('reference settings', function() {

        it('assign valid values', function(done) {
            const s = new State()
            const t = new Transition()
            s.transitions = t
            s.should.have.property('transitions', [t])
            done()
        })

        it('throws error on invalid values', function(done) {
            const s = new State()
            const t = new Transition()
            function test () {s.transitions = s}
            test.should.throw()
            done()
        })

        it('assign wongly typed values on relaxed schema', function(done) {
            const Foo = new Class('Foo', [], {}, {test: {target: State, errorCallback: JSMF.onError.silent}})
            const s = new Foo()
            s.test = s
            s.should.have.property('test', [s])
            done()
        })

        it('replace former references when we use assignement', function(done) {
            const s = new State()
            const t1 = new Transition()
            const t2 = new Transition()
            s.transitions = [t1]
            s.transitions = t2
            s.should.have.property('transitions', [t2])
            done()
        })

        it('accept any object for a reference that has the targetType JSMFAny', function(done) {
            const Foo = new Class('Foo', [], {}, {test: {target: JSMF.JSMFAny}})
            const Bar = new Class('Bar')
            const x = new Foo()
            const y = new Bar()
            x.test = [x,y]
            x.should.have.property('test', [x, y])
            done()
        })

        it('accept any object for a reference with no target type specified', function(done) {
            const Foo = new Class('Foo', [], {}, {test: {}})
            const Bar = new Class('Bar')
            const x = new Foo()
            const y = new Bar()
            x.test = [x,y]
            x.should.have.property('test', [x, y])
            done()
        })

        it('add references when we use the adder', function(done) {
            const s = new State()
            const t1 = new Transition()
            const t2 = new Transition()
            s.addTransitions([t1])
            s.addTransitions(t2)
            s.should.have.property('transitions', [t1, t2])
            done()
        })

        it('can remove elements from references with remove', function(done) {
            const s = new State()
            const t1 = new Transition()
            const t2 = new Transition()
            s.addTransitions([t1, t2])
            s.removeTransitions(t2)
            s.should.have.property('transitions', [t1])
            done()
        })

        it ('adds elements to opposite relation', function(done) {
            const s = new State()
            const t1 = new Transition()
            const t2 = new Transition()
            s.addTransitions([t1, t2])
            t1.should.have.property('source', [s])
            t2.should.have.property('source', [s])
            done()
        })

        it ('assigns elements from opposite relation', function(done) {
            const s = new State()
            const t1 = new Transition()
            const t2 = new Transition()
            t1.source = s
            t2.source = s
            s.should.have.property('transitions', [t1, t2])
            done()
        })

        it ('allows the definition of associated data', function(done) {
            const s = new State()
            const t1 = new Transition()
            s.addTransitions(t1, "Associated data")
            s.getAssociated('transitions').should.eql([{elem: t1, associated: "Associated data"}])
            done()
        })

        it ('adds the associated data to the opposite reference', function(done) {
            const s = new State()
            const t1 = new Transition()
            s.addTransitions(t1, "Associated data")
            t1.getAssociated('source').should.eql([{elem: s, associated: "Associated data"}])
            done()
        })

        it ('reject associated data of the wrong type', function(done) {
            const s = new State()
            const T = new JSMF.Class('T')
            T.addReference('test', State, JSMF.Cardinality.any, undefined, undefined, State)
            const t1 = new T()
            t1.addTest(s, s)
            t1.getAssociated('test').should.eql([{elem: s, associated: s}])
            done()
        })

        it ('reject associated data of the wrong type', function(done) {
            const s = new State()
            const T = new JSMF.Class('T')
            T.addReference('test', State, JSMF.Cardinality.any, undefined, undefined, State)
            const t1 = new T()
            function test() {t1.addTest(s, t1)}
            test.should.throw()
            done()
        })

        it ('creates correct setter names for camel case fields', function(done) {
            const s = new State()
            const T = new JSMF.Class('T')
            T.addReference('testCamel', State, JSMF.Cardinality.any, undefined, undefined, State)
            const t1 = new T()
            should(t1.addTestCamel).not.be.undefined()
            done()
        })

    })

})
