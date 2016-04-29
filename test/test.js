//var assert = require("assert");
var should = require('should');
var JSMF = require('../index');
Class = JSMF.Class;
Model = JSMF.Model;
Enum = JSMF.Enum;

/*


// Create Attributes and check types, values
describe('Create Class Elements', function() {

// ******************************
// Check M1 Level Instanciation
// ******************************

// Create and Check Instances
describe('Create Class Instances', function() {
    describe('Create Instances (Attributes)', function() {
        it('creates instances conforms to Meta Element', function(done){
            var State = new Class('State');
            var s1 = State.newInstance('s1');
            s1.conformsTo().should.equal(State);
            done();
        })

        it('creates instances with an id (uuid)', function(done){
            var State = new Class('State');
            var s1 = State.newInstance('s1');
            s1.__jsmfId.should.not.equal(undefined);
            done();
        })

        it('Instance Created with Attributes and values', function(done){
            var State = new Class('State');
            State.setAttribute('name', String);
            State.setAttribute('id', Number);
            var s1 = State.newInstance('s1');
            s1.conformsTo().should.equal(State);

            //attributes have been set
            s1.should.have.property('name');
            s1.should.have.property('id');

            //attributes values have been set
            s1.should.have.property('setName');
            s1.should.have.property('setId');
            s1.setName('s1');
            s1.setId(12);
            s1.should.have.property('name','s1');
            s1.should.have.property('id',12);
            s1.should.not.have.property('id','12');
            s1.should.not.have.property('name',s1);

            //Rewritting values
            s1.setName('news1');
            s1.should.have.property('name','news1');
            s1.should.not.have.property('name','s1');

            done();
        })

        it('Instance Created with inherited Attributes', function(done){
            var State = new Class('State');
            State.setAttribute('name', String);
            State.setAttribute('id', Number);

            var SuperState = new Class('SuperState');
            SuperState.setAttribute('active', Boolean);

            State.setSuperType(SuperState);
            State.__superType['SuperState'].should.equal(SuperState);
            SuperState.__superType.should.be.empty;

            var s1 = State.newInstance('s1');
            s1.conformsTo().should.equal(State);
            //s1.conformsTo().should.not.equal(SuperState); //But Should it be also?

            //attributes have been set
            s1.should.have.property('name');
            s1.should.have.property('id');

            //attributes values have been set
            s1.should.have.property('setName');
            s1.should.have.property('setId');
            s1.setName('s1');

            //set the overriden attributes (id), with the overidden type
            s1.setId(12);
            s1.should.have.property('name','s1');
            s1.should.have.property('id',12);
            s1.should.not.have.property('name',s1);

            // set inherited values
            s1.should.have.property('setActive');
            s1.setActive(true);
            s1.should.have.property('active',true);
            done();
        })

        it('Instance Created with simple inheritance chain (inherited Attributes)', function(done){
            var State = new Class('State');
            State.setAttribute('name', String);
            State.setAttribute('id', Number);

            var SuperState = new Class('SuperState');
            SuperState.setAttribute('id', String);
            SuperState.setAttribute('active', Boolean);
            State.setSuperType(SuperState);
            State.__superType['SuperState'].should.equal(SuperState);
            SuperState.__superType.should.be.empty;

            var s1 = State.newInstance('s1');
            s1.conformsTo().should.equal(State);
            //s1.conformsTo().should.not.equal(SuperState); //But Should it be also?

            //attributes have been set
            s1.should.have.property('name');
            s1.should.have.property('id');

            //attributes values have been set
            s1.should.have.property('setName');
            s1.should.have.property('setId');
            s1.should.have.property('setActive');
            s1.setName('s1');
            //set active
            s1.setActive(true);
            s1.should.have.property('active',true);

            //set the overriden attributes (id), with the overidden type
            s1.setId(12);
            s1.should.have.property('name','s1');
            s1.should.have.property('id',12);
            s1.should.not.have.property('name',s1);

            //update the id with incorrect type (with inherented but overriden type)
            var exception=false;
            try {
                s1.setId('12');
            } catch(e) {
                exception=true;
            }
            exception.should.equal(true);
            s1.should.not.have.property('id','12');
            s1.should.have.property('id',12);

            //update this id with a correct type
            s1.setId(13);
            s1.should.not.have.property('id',12);
            s1.should.have.property('id',13);

            done();
        })

        it('Instance Created with multiple inheritance (inherited Attributes)', function(done){
            var State = new Class('State');
            State.setAttribute('name', String);
            State.setAttribute('id', Number);

            var SuperState = new Class('SuperState');
            SuperState.setAttribute('id', String);
            SuperState.setAttribute('active', Boolean);

            var OtherSuperState = new Class('OtherSuperState');
            OtherSuperState.setAttribute('isnew', Boolean);

            State.setSuperType(SuperState);
            State.setSuperType(OtherSuperState);
            State.__superType['SuperState'].should.equal(SuperState);
            State.__superType['OtherSuperState'].should.equal(OtherSuperState);
            SuperState.__superType.should.be.empty;

            var s1 = State.newInstance('s1');
            s1.conformsTo().should.equal(State);
            //s1.conformsTo().should.not.equal(SuperState); //But Should it be also?

            //attributes have been set
            s1.should.have.property('name');
            s1.should.have.property('id');

            //attributes values have been set
            s1.should.have.property('setName');
            s1.should.have.property('setId');
            s1.id.should.be.empty;
            s1.name.should.be.empty;

            s1.setName('s1');
            s1.setId(12);
            s1.should.have.property('name','s1');
            s1.should.have.property('id',12);
            s1.should.not.have.property('id','12');
            s1.should.not.have.property('name',s1);

            // set inherited values from first class
            s1.should.have.property('setActive');
            s1.setActive(true);
            s1.should.have.property('active',true);

            //set inherited value from second class
            s1.should.have.property('setIsnew');
            s1.setIsnew(false);
            s1.should.have.property('isnew',false);

            done();
        })

        it('Instance Created with simple inheritance chain', function(done){
            var State = new Class('State');
            State.setAttribute('name', String);
            State.setAttribute('id', Number);

            var SuperState = new Class('SuperState');
            SuperState.setAttribute('active', Boolean);

            var SuperSuperState = new Class('SuperSuperState');
            SuperSuperState.setAttribute('blink', Number);

            SuperState.setSuperType(SuperSuperState);
            State.setSuperType(SuperState);

            s1 = State.newInstance();
            s1.setName('s1');
            s1.should.have.property('name','s1');
            s1.setId(12);
            s1.should.have.property('id',12);
            s1.setBlink(182);
            s1.should.have.property('blink',182);
            done();
        })

        it('Instance Created with inheritance chain, attribute overriding (multiple times - each level keep its own definition) ', function(done){
            var State = new Class('State');
            State.setAttribute('id', Number);

            var SuperState = new Class('SuperState');
            SuperState.setAttribute('active', Boolean);
            SuperState.setAttribute('id', String);

            var SuperSuperState = new Class('SuperSuperState');
            SuperSuperState.setAttribute('id', Boolean);

            State.setSuperType(SuperState);
            SuperState.setSuperType(SuperSuperState);

            s1 = State.newInstance();
            s1.should.have.property('setId');
            s1.id.should.be.empty;

            s1.setId(12);
            s1.should.have.property('id',12);

            //incorrect assignation: type of SuperState
            var exception=false;
            try {
                s1.setId('12');
            } catch(e) {
                exception=true;
            }
            exception.should.equal(true);
            s1.should.not.have.property('id','12');

            //incorrect assignation: type of SuperSuperState
            exception=false;
            try {
                s1.setId(true);
            } catch(e) {
                exception=true;
            }

            exception.should.equal(true);
            s1.should.not.have.property('id',true);


            s2 = SuperState.newInstance();
            s2.conformsTo().should.equal(SuperState);
            s2.conformsTo().should.not.equal(SuperSuperState);
            s2.conformsTo().should.not.equal(State);

            s2.should.have.property('id');
            s2.should.have.property('setId');
            s2.setId('12');
            s2.should.have.property('id','12');
            s2.should.not.have.property('id',12);

            exception=false;
            try {
                s2.setId(12);
            } catch(e) {
                exception=true;
            }

            exception.should.equal(true);
            s2.should.not.have.property('id',12);

            exception=false;
            try {
                 s2.setId(false);
            } catch(e) {
                exception=true;
            }

            exception.should.equal(true);
            s2.should.not.have.property('id',false);

            s3 = SuperSuperState.newInstance();
            s3.conformsTo().should.not.equal(SuperState);
            s3.conformsTo().should.equal(SuperSuperState);
            s3.conformsTo().should.not.equal(State);

            s3.should.have.property('id');
            s3.should.have.property('setId');
            s3.setId(true);

            s3.should.have.property('id',true);
            s3.should.not.have.property('id',false);
            s3.should.not.have.property('id',12);

            done();
        })

        it('Instance Created with multiple inheritance using the last superclass attribute', function(done){
            var State = new Class('State');
            State.setAttribute('name', Number);

            var SuperState = new Class('SuperState');
            SuperState.setAttribute('id', String);

            var OtherSuperState = new Class('OtherSuperState');
            OtherSuperState.setAttribute('id', Boolean);

            State.setSuperType(SuperState);
            State.setSuperType(OtherSuperState); //the most Left element get

            SuperState.__superType.should.be.empty;

            var s1 = State.newInstance();
            s1.conformsTo().should.equal(State);

            //attributes have been set
            s1.should.have.property('id');
            s1.should.have.property('name');
            s1.should.have.property('setId');
            s1.should.have.property('setName');
            s1.name.should.be.empty;
            s1.setId(false);
            s1.should.have.property('id',false);

            //cannot assign the value for first type (super state)
            exception=false;
            try {
                s1.setId('12');
            } catch(e) {
                exception=true;
            }

            exception.should.equal(true);
            s1.should.not.have.property('id','12');

            done();
        })
    })

    describe('Create Instances (References)', function() {
        it('Instance Created with simple references', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            State.setReference('transition', Transition, 1);


            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;


            t1 = Transition.newInstance();
            t1.conformsTo().should.equal(Transition);

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);


            done();
        })

        it('Instance Created with 0..1 reference and cannot assign more than one target', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            State.setReference('transition', Transition, 1);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t2 = Transition.newInstance();

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);

            s1.setTransition(t2);
            s1.should.have.property('transition',[t1]);
            s1.should.not.have.property('transition',[t1,t2]);

            done();
        })

         it('Instance Created with multiple cardinality reference (0..*)', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            State.setReference('transition', Transition, -1);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t2 = Transition.newInstance();
            t3 = Transition.newInstance();

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);

            s1.setTransition(t2);
            s1.should.not.have.property('transition',[t1]);
            s1.should.have.property('transition',[t1,t2]);
            s1.transition[1].should.equal(t2);

            s1.setTransition(t3);
            s1.should.not.have.property('transition',[t1]);
            s1.should.have.property('transition',[t1,t2,t3]);
            s1.transition[2].should.equal(t3);

            done();
        })

        it('Instance Created trying to assign wrong Class type and correct  Class type: only correct Class type are assigned', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            var FalseTransition = new Class('FalseTransition');
            State.setReference('transition', Transition, -1);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t0 = FalseTransition.newInstance();
            t1 = Transition.newInstance();
            t2 = FalseTransition.newInstance();
            t3 = FalseTransition.newInstance();

            s1.setTransition(t0);
            s1.transition.should.be.empty;
            s1.should.not.have.property('transition',[t0]);

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);

            s1.setTransition(t2);
            s1.should.have.property('transition',[t1]);
            s1.should.not.have.property('transition',[t1,t2]);

            s1.setTransition(t3);
            s1.should.have.property('transition',[t1]);
            s1.should.not.have.property('transition',[t1,t2,t3]);

            done();
        })

        it('Instance Created : with assignation of a child class to a reference only correct Class type are assigned', function(done){
            var Basket = new Class('Basket');
            var Fruit = new Class('Fruit');
            var Banana = new Class('Banana');
            Banana.setSuperType(Fruit);
            Basket.setReference('fruit', Fruit, -1);

            b1 = Basket.newInstance();
            b1.should.have.property('setFruit');
            b1.conformsTo().__references['fruit'].type.should.equal(Fruit);
            b1.fruit.should.be.empty;

            f0 = Fruit.newInstance();
            b0 = Banana.newInstance();

            b1.setFruit(f0);
            b1.fruit.should.not.be.empty;
            b1.should.have.property('fruit',[f0]);

            b1.setFruit(b0);
            b1.fruit.should.not.be.empty;
            b1.should.have.property('fruit',[f0, b0]);

            done();
        })
        it('Instance created trying to assign multiple time the same model element (JS reference) to a reference', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            Transition.setAttribute('name', String);
            State.setReference('transition', Transition, -1);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t1.setName('transitionOne');

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);
            s1.transition.length.should.equal(1);

            //Setting again t1 and checking that nothing has changed for s1.transition
            s1.setTransition(t1);
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);
            s1.transition.length.should.equal(1); // the object has not been set two times

            done();
        })

        it('Instance created assigning similar model element but a different instance to a reference', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            Transition.setAttribute('name', String);
            State.setReference('transition', Transition, -1);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t1.setName('transitionOne');

            t2 = Transition.newInstance();
            t2.setName('transitionOne'); // Keeping the same attributes

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);
            s1.transition.length.should.equal(1);

            s1.setTransition(t2);
            s1.should.have.property('transition',[t1,t2]);
            s1.transition[0].should.equal(t1);
            s1.transition[1].should.equal(t2);
            s1.transition.length.should.equal(2); // the object has not been set two times

            done();
        })

        it('Instance created with several references added at the same time', function(done){
            State = new Class('State');
            Transition = new Class('Transition');
            Transition.setAttribute('name', String);
            State.setReference('transition', Transition, -1);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t1.setName('transitionOne');

            t2 = Transition.newInstance();
            t2.setName('transitionOne'); // keeping the same attributes

            s1.setTransition([t1,t2]);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1,t2]);
            s1.transition[0].should.equal(t1);
            s1.transition[1].should.equal(t2);
            s1.transition.length.should.equal(2); // the object has not been set two times

            done();
        });

         it('Instance Created with circular (non-opposite) References', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            State.setReference('transition', Transition, -1);
            Transition.setReference('source', State, 1);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t1.should.have.property('setSource');
            t1.conformsTo().__references['source'].type.should.equal(State);
            //(t1.transition === undefined).should.be.true;
            t1.source.should.be.empty

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);

            t1.setSource(s1);
            t1.source.should.not.be.empty;
            t1.should.have.property('source',[s1]);
            t1.source[0].should.equal(s1);

            done();
        })


         //Opposite!
         it('Instance Created with simple opposite relations', function(done){
            State = new Class('State');
            Transition = new Class('Transition');
            State.setReference('transition', Transition, -1, 'source');
            Transition.setReference('source', State, 1, 'transition'); //'transition'


            State.__references['transition'].opposite.should.equal('source');
            Transition.__references['source'].opposite.should.equal('transition');

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.conformsTo().__references['transition'].opposite.should.equal('source');
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t1.should.have.property('setSource');
            t1.conformsTo().__references['source'].type.should.equal(State);
            t1.conformsTo().__references['source'].opposite.should.equal('transition');
            (t1.transition === undefined).should.be.true;
            t1.source.should.be.empty

            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);
            s1.transition.length.should.equal(1); //no more in case of multiple opposite assignations

            t1.source.should.not.be.empty;
            t1.should.have.property('source',[s1]);
            t1.source[0].should.equal(s1);
            t1.source.length.should.equal(1); // idem no more..

            done();
        })

         it('Opposite relations are not added if direct relation fails', function(done){
            State = new Class('State');
            Transition = new Class('Transition');
            State.setReference('transition', Transition, -1, 'source');
            Transition.setReference('source', State, 1, 'transition'); //'transition'

            State.__references['transition'].opposite.should.equal('source');
            Transition.__references['source'].opposite.should.equal('transition');

            s1 = State.newInstance();
            s1.transition.should.be.empty;

            s2 = State.newInstance();
            s1.setTransition(s2);

            s1.transition.should.be.empty;
            s2.transition.should.be.empty;

            done();
         })


         it('Instances created with simple inherited Reference', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            var SuperTransition = new Class('SuperTransition');

            State.setReference('transition', Transition, -1);

            var SuperState = new Class('SuperState');
            SuperState.setReference('supertransition', SuperTransition,-1);

            State.setSuperType(SuperState);
            Transition.setSuperType(SuperTransition);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.should.have.property('setSupertransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__superType.should.have.keys('SuperState');
            s1.conformsTo().__superType['SuperState'].__references.should.have.keys('supertransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            s1.supertransition.should.be.empty;

            t1 = Transition.newInstance();
            st1 = SuperTransition.newInstance();

            s1.setTransition(t1);
            s1.setSupertransition(st1);
            s1.should.have.property('transition',[t1]);
            s1.should.have.property('supertransition',[st1]);

            done();
        })


        it('Instances created with overriden inherited Reference', function(done){
            var State = new Class('State');
            var Transition = new Class('Transition');
            var SuperTransition = new Class('SuperTransition');

            State.setReference('transition', Transition, -1);

            var SuperState = new Class('SuperState');
            SuperState.setReference('transition', SuperTransition, -1);

            State.setSuperType(SuperState);
            Transition.setSuperType(SuperTransition);

            s1 = State.newInstance();
            s1.should.have.property('setTransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__superType.should.have.keys('SuperState');
            s1.conformsTo().__superType['SuperState'].__references.should.have.keys('transition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance();
            t1.name = 'foo';
            st1 = SuperTransition.newInstance();
            st1.name = 'bar';

            s1.setTransition(t1);
            s1.should.have.property('transition',[t1]);

            //That should not work (inherited references) => but it may work with relaxed JSMF (cumulative types).
            s1.setTransition(st1);
            //console.log(s1.transition.conformsTo());
            s1.should.have.property('transition',[t1]);

            done();
        })


        it('Instance created with reference to an inhereted class', function(done) { //Alain's reported bug
            var State = new Class('State');
            var Transition = new Class('Transition');
            var SubState = new Class('SubState');

            SubState.setSuperType(State);

            Transition.setReference('states',State,-1);

            s1= State.newInstance();
            t1 =  Transition.newInstance();
            sub = SubState.newInstance();

            t1.setStates(sub);

           done();
        });

        it('Instances created with multiple inherented references', function(done){
            var State = new Class('State');

            done();
        });

    });
    describe("Create instance (initialisation)", function () {
        it("Allows attribute initialisation", function (done) {
            var State = new Class('State');
            State.setAttribute('name', String);
            var s0 = State.newInstance({name: "s0"});
            s0['name'].should.be.equal("s0");
            done();
        });
        it("Allows reference initialisation", function (done) {
            var State = new Class('State');
            var Transition = new Class('Transition');
            State.setReference('transition', Transition, -1);
            var t0 = Transition.newInstance();
            var t1 = Transition.newInstance();
            var s0 = State.newInstance({transition: [t0, t1]});
            s0['transition'].should.have.lengthOf(2);
            s0['transition'].should.containEql(t0);
            s0['transition'].should.containEql(t1);
            done();
        });
        it("Does nothing with unknown properties", function (done) {
            var State = new Class('State');
            State.setAttribute('name', String);
            State.setReference('foo', State, -1);
            var s0 = State.newInstance({bar: 42});
            s0.should.not.has.key('bar');
            done();
        });
    });
})

// ************************************************************
//    Test Enumerations
// ************************************************************/
/*
describe('Create Enumeration', function() {
        it('Instance Created with enumerated value', function(done){
            var State = new Class('State');

            var E1 = new Enum('IType');
            E1.setLiteral('v1',0);
            E1.setLiteral('v2',2);

            State.setAttribute('name',String);
            State.setAttribute('type',E1);

            var s0 = State.newInstance();
            s0.setName('First State');
            s0.setType(E1.v1);

            s0.should.have.property('type', 0);
            s0.should.have.property('name','First State');
            done();
    });
        it('Instance Created with inline enumerated values', function(done){
            var State = new Class('State');

            var E1 = new Enum('IType', {v1: 0, v2: 2});

            State.setAttribute('name',String);
            State.setAttribute('type',E1);

            var s0 = State.newInstance();
            s0.setName('First State');
            s0.setType(E1.v1);

            s0.should.have.property('type', 0);
            s0.should.have.property('name','First State');
            done();
    });

    it('Instance Created with incorrect enumerated value', function(done){
            var State = new Class('State');

            var E1 = new Enum('IType');
            E1.setLiteral('v1',0);
            E1.setLiteral('v2',2);

            State.setAttribute('name',String);
            State.setAttribute('type',E1);

            var s0 = State.newInstance();
            s0.setName('First State');
            s0.setType(3);

            s0.should.not.have.property('type', 3);
            s0.should.have.property('name','First State');
            done();
    });

    it('esolve instance values', function(done){
            var State = new Class('State');

            var E1 = new Enum('IType');
            E1.setLiteral('v1',0);
            E1.setLiteral('v2',2);

            E1.resolve(0).should.be.equal('v1');
            E1.resolve(2).should.be.equal('v2');
            (E1.resolve(1) === undefined).should.be.equal(true);
            done();
    });
});
*/
/**********************************************************
// Model/Metamodel (aka package/namespace) Creation
***********************************************************/

/*
describe('Create a Model (Namespace/Package)', function() {
    describe('MetaModel - Reference Model',function() {
        it('Metamodel Created with one Meta element inside', function(done) {

            var ReferenceModel = new Model("Reference");
            var State = new Class('State');
            ReferenceModel.setModellingElement(State);
            ReferenceModel.modellingElements.should.have.keys('State');
            ReferenceModel.modellingElements['State'][0].should.be.equal(State);
            //.should.be.equal([State]);
            done();
            })

        it('Metamodel Created with one Meta element inside', function(done) {

            var ReferenceModel = new Model("Reference");
            var State = new Class('State');
            ReferenceModel.setModellingElement(State);
            ReferenceModel.modellingElements.should.have.keys('State');
            ReferenceModel.modellingElements.should.have.property('State',[State]);
            ReferenceModel.modellingElements['State'][0].should.be.equal(State);
            //.should.be.equal([State]);
            done();
            })
    })
    describe('Model - Containing Instance of  MetaModel elements',function() {
         it('Metamodel Created and Model Associated with corresponding Instances', function(done) {

            var ReferenceModel = new Model('Reference');
            var State = new Class('State');
            ReferenceModel.setModellingElement(State);
            ReferenceModel.modellingElements['State'][0].should.be.equal(State);

            var modelI = new Model('Instance');
            modelI.setReferenceModel(ReferenceModel);
            var s1 = State.newInstance();
            var s2 = State.newInstance();

            modelI.setModellingElement(s1);
            modelI.setModellingElement(s2);

            modelI.modellingElements.should.have.keys('State');
            modelI.modellingElements.should.have.property('State',[s1,s2]);
            console.log(modelI.modellingElements[State]);
            done();
            })

        it("Add elements to the model recursively", function (done) {
            var State = new Class('State');
            var Transition = new Class('Transition');
            State.setReference('transition', Transition, -1);
            var t0 = Transition.newInstance();
            var t1 = Transition.newInstance();
            var s0 = State.newInstance({transition: [t0, t1]});
            var modelI = new Model('Model', s0);
            modelI.modellingElements.should.have.keys(['State', 'Transition']);
            modelI.modellingElements.should.have.property('State',[s0]);
            modelI.modellingElements['Transition'].should.containEql(t0);
            modelI.modellingElements['Transition'].should.containEql(t1);
            done();
        });
    })
})
*/
