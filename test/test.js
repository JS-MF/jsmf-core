//var assert = require("assert");
var should = require('should');
var JSMF = require('../jsmf');
Class = JSMF.Class;
Model = JSMF.Model;

// ******************************
// Check M2 Level Instanciation
// ******************************
//2 ways of creating a JSMF Class and check conformance relation
describe('Create Class', function() {
	describe('NewInstanceMode', function(){
	it('Instance Created', function(done) {	
			var Instance = Class.newInstance('Instance');
			Instance.__name.should.equal('Instance');
			done();
		})

		it('Instance ConformsTo Class', function(done) {	
			var Instance = Class.newInstance('Instance');
			Instance.conformsTo().should.equal(Class);
			done();	
		})
		
		it('Instance Created using Old Fashion', function(done) {	
			var InstanceOld = new Class('InstanceOld');
			InstanceOld.__name.should.equal('InstanceOld');
			done();
		})
	})
	describe('Inheritance', function(){
		it('Inheritance level 1 Created', function(done) {	
			var Instance = new Class('Instance');
			var SuperInstance = Class.newInstance('SuperInstance');
			var NonRelatedInstance = Class.newInstance('NonRelatedInstance');
			Instance.setSuperType(SuperInstance);
			Instance.__superType.should.have.keys('SuperInstance');
			Instance.__superType.should.not.have.keys('NonRelatedInstance');
			Instance.__superType['SuperInstance'].should.equal(SuperInstance);
			done();
		})

		it('Inheritance level 2 Created', function(done) {	
			var Instance = new Class('Instance');
			var SuperInstance = Class.newInstance('SuperInstance');
			var SuperSuperInstance = Class.newInstance('SuperSuperInstance');
			Instance.setSuperType(SuperInstance);
			SuperInstance.setSuperType(SuperSuperInstance);
			Instance.__superType.should.have.keys('SuperInstance');
			Instance.__superType.should.not.have.keys('SuperSuperInstance');
			Instance.__superType['SuperInstance'].should.equal(SuperInstance);
			SuperInstance.__superType.should.have.keys('SuperSuperInstance');
			SuperInstance.__superType.should.not.have.keys('SuperInstance');
			done();
		})

		it('Inheritance multiple levels', function(done) {	
			var Instance = new Class('Instance');
			var SuperInstance = Class.newInstance('SuperInstance');
			var OtherSuperInstance = Class.newInstance('OtherSuperInstance');
			Instance.setSuperType(SuperInstance);
			Instance.setSuperType(OtherSuperInstance);
			Instance.__superType.should.have.keys('SuperInstance','OtherSuperInstance');
			//Instance.__superType.should.have.keys('SuperInstance');
			Instance.__superType['SuperInstance'].should.equal(SuperInstance);
			Instance.__superType['OtherSuperInstance'].should.equal(OtherSuperInstance);
			//Instance.__superType.should.have.properties('SuperInstance',SuperInstance);
			done();
		})
	})	
})

// Create Attributes and check types, values
describe('Create Class Elements', function() {
	describe('Create Attribute', function() {
		it('Attributes Created With primitve types', function(done){
			var State = Class.newInstance('State');
			State.__attributes.should.be.empty;
			State.setAttribute('name', String);
			State.setAttribute('id', Number);
			State.setAttribute('active', Boolean);

			State.__attributes.should.not.be.empty;

			State.__attributes.should.have.property('name',String);
			State.__attributes.should.have.property('id',Number);
			State.__attributes.should.have.property('active',Boolean);

			State.__attributes['name'].should.equal(String);
			State.__attributes['id'].should.equal(Number);
			State.__attributes['active'].should.equal(Boolean);
			done();
		})
	})

	describe('Create References', function() {
		it('Simple cardinalty (0..1) reference created', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
			State.setReference('transition', Transition,1);
			State.__references.should.not.be.empty
            State.__references.should.have.keys('transition');
            State.__references['transition'].should.have.property('card',1);
			State.__references['transition'].type.should.equal(Transition);
			done();
		})

		it('Multiple cardinality (0..n) reference created', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
			State.setReference('transition', Transition,-1);
			State.__references.should.not.be.empty
            State.__references.should.have.keys('transition');
			State.__references['transition'].type.should.equal(Transition);
            State.__references['transition'].should.have.property('card',-1);
			done();
		})

		it('Array of Target class (0..n) reference created', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
			var Association = Class.newInstance('Association');
			State.setReference('transition', [Association,Transition],-1);
			State.__references.should.not.be.empty
            State.__references.should.have.keys('transition');
			var resultArray = [Association,Transition];			
			State.__references['transition'].type.should.containDeep(resultArray);
			State.__references['transition'].card.should.equal(-1);
			done();
		})

		it('Opposite (0..n) reference created', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
			State.setReference('transition', Transition,-1, 'source');
            Transition.setReference('source', State, 1, 'transition');
            
			State.__references.should.not.be.empty
            State.__references.should.have.keys('transition');
			State.__references['transition'].type.should.equal(Transition);
			State.__references['transition'].should.have.property('card',-1);
            State.__references['transition'].should.have.property('opposite','source');
            
            Transition.__references.should.not.be.empty
            Transition.__references.should.have.keys('source');
			Transition.__references['source'].type.should.equal(State);
			Transition.__references['source'].should.have.property('card',1);
            Transition.__references['source'].should.have.property('opposite','transition');
            
			done();
		})

		it('Any (0..n) reference created', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
			State.setReference('transition', Class,-1);
			State.__references.should.not.be.empty
			State.__references['transition'].type.should.equal(Class);
			done();
		})
	})

	describe('Inheritance tests', function() {
		it('Attributes', function(done){
			var State = Class.newInstance('State');
			State.setAttribute('name', String);
			State.setAttribute('id', Number);
			//State.setAttribute('active', Boolean);
			var SuperState = Class.newInstance('SuperState');
			SuperState.setAttribute('id', String);
			SuperState.setAttribute('active', Boolean);
			State.setSuperType(SuperState);
			State.__attributes.should.have.property('name',String);
			State.__attributes.should.have.property('id',Number);
			State.__attributes.should.not.have.property('active',Boolean); //Indeed attribute is given by superType
			State.__superType.should.be.ok; //have.property('id',String);
			State.__superType['SuperState'].should.equal(SuperState);
			done();
		})
	})
})

// ******************************
// Check M1 Level Instanciation
// ******************************

// Create and Check Instances
describe('Create Class Instances', function() {
	describe('Create Instances (Attributes)', function() {
		it('Instance Created and Conforms to Meta Element', function(done){
			var State = Class.newInstance('State');
			var s1 = State.newInstance('s1');
			s1.conformsTo().should.equal(State);
			done();
		})

		it('Instance Created with Attributes and values', function(done){
			var State = Class.newInstance('State');
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
			var State = Class.newInstance('State');
			State.setAttribute('name', String);
			State.setAttribute('id', Number);

			var SuperState = Class.newInstance('SuperState');
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
			var State = Class.newInstance('State');
			State.setAttribute('name', String);
			State.setAttribute('id', Number);

			var SuperState = Class.newInstance('SuperState');
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
			var State = Class.newInstance('State');
			State.setAttribute('name', String);
			State.setAttribute('id', Number);

			var SuperState = Class.newInstance('SuperState');
			SuperState.setAttribute('id', String);
			SuperState.setAttribute('active', Boolean);
				
			var OtherSuperState = Class.newInstance('OtherSuperState');
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
			var State = Class.newInstance('State');
			State.setAttribute('name', String);
			State.setAttribute('id', Number);

			var SuperState = Class.newInstance('SuperState');
			SuperState.setAttribute('active', Boolean);			

			var SuperSuperState = Class.newInstance('SuperSuperState');
			SuperSuperState.setAttribute('blink', Number);
		
			SuperState.setSuperType(SuperSuperState);	
			State.setSuperType(SuperState);								

			s1 = State.newInstance('s1');
			s1.setName('s1');
            s1.should.have.property('name','s1');
			s1.setId(12);
            s1.should.have.property('id',12);
			s1.setBlink(182);
			s1.should.have.property('blink',182);
			done();
		})
 
		it('Instance Created with inheritance chain, attribute overriding (multiple times - each level keep its own definition) ', function(done){
			var State = Class.newInstance('State');
			State.setAttribute('id', Number);

			var SuperState = Class.newInstance('SuperState');
			SuperState.setAttribute('active', Boolean);		
			SuperState.setAttribute('id', String);	

			var SuperSuperState = Class.newInstance('SuperSuperState');
			SuperSuperState.setAttribute('id', Boolean);

			State.setSuperType(SuperState);
			SuperState.setSuperType(SuperSuperState);
			
			s1 = State.newInstance('s1');
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

            
            s2 = SuperState.newInstance('s2');
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
            
            s3 = SuperSuperState.newInstance('s3');
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
			var State = Class.newInstance('State');
            State.setAttribute('name', Number);
            
			var SuperState = Class.newInstance('SuperState');
			SuperState.setAttribute('id', String);
	
			var OtherSuperState = Class.newInstance('OtherSuperState');
			OtherSuperState.setAttribute('id', Boolean);
			
			State.setSuperType(SuperState);
			State.setSuperType(OtherSuperState); //the most Left element get
            
			SuperState.__superType.should.be.empty;
			
			var s1 = State.newInstance('s1');
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
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
            State.setReference('transition', Transition, 1);
            
            
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            
            
            t1 = Transition.newInstance('t1');
            t1.conformsTo().should.equal(Transition);
            
            s1.setTransition(t1);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1]);
            s1.transition[0].should.equal(t1);
            
            
			done();
		})
        
        it('Instance Created with 0..1 reference and cannot assign more than one target', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
            State.setReference('transition', Transition, 1);
            
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            
            t1 = Transition.newInstance('t1');
            t2 = Transition.newInstance('t2');
            
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
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
            State.setReference('transition', Transition, -1);
            
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            
            t1 = Transition.newInstance('t1');
            t2 = Transition.newInstance('t2');
            t3 = Transition.newInstance('t3');
             
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
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
            var FalseTransition = Class.newInstance('FalseTransition');
            State.setReference('transition', Transition, -1);
            
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            
            t0 = FalseTransition.newInstance('falset0');  
            t1 = Transition.newInstance('t1');
            t2 = FalseTransition.newInstance('falset2');
            t3 = FalseTransition.newInstance('falset3');
             
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
         
        it('Instance created trying to assign multiple time the same model element (JS reference) to a reference', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
            Transition.setAttribute('name', String);
            State.setReference('transition', Transition, -1);
            
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
             
            t1 = Transition.newInstance('t1');
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
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
            Transition.setAttribute('name', String);
            State.setReference('transition', Transition, -1);
            
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
             
            t1 = Transition.newInstance('t1');
            t1.setName('transitionOne');
            
            t2 = Transition.newInstance('t1'); //keeping the same name ...
            t2.setName('transitionOne'); //... and the same attributes
        
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
        
        it('We can add several references at the same time', function(done){
            State = Class.newInstance('State');
            Transition = Class.newInstance('Transition');
            Transition.setAttribute('name', String);
            State.setReference('transition', Transition, -1);

            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;

            t1 = Transition.newInstance('t1');
            t1.setName('transitionOne');

            t2 = Transition.newInstance('t1'); //keeping the same name ...
            t2.setName('transitionOne'); //... and the same attributes

            s1.setTransition([t1,t2]);
            s1.transition.should.not.be.empty;
            s1.should.have.property('transition',[t1,t2]);
            s1.transition[0].should.equal(t1);
            s1.transition[1].should.equal(t2);
            s1.transition.length.should.equal(2); // the object has not been set two times

			done();
        });

         it('Instance Created with circular (non-opposite) References', function(done){
			var State = Class.newInstance('State');
			var Transition = Class.newInstance('Transition');
            State.setReference('transition', Transition, -1);
            Transition.setReference('source', State, 1);
            
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            
            t1 = Transition.newInstance('t1');
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
            State = Class.newInstance('State');
            Transition = Class.newInstance('Transition');
            State.setReference('transition', Transition, -1, 'source');
            Transition.setReference('source', State, 1, 'transition'); //'transition'
             
             
            State.__references['transition'].opposite.should.equal('source');
            Transition.__references['source'].opposite.should.equal('transition');
             
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.conformsTo().__references['transition'].opposite.should.equal('source');
            s1.transition.should.be.empty;
            
            t1 = Transition.newInstance('t1');
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
            State = Class.newInstance('State');
            Transition = Class.newInstance('Transition');
            State.setReference('transition', Transition, -1, 'source');
            Transition.setReference('source', State, 1, 'transition'); //'transition'
             
            State.__references['transition'].opposite.should.equal('source');
            Transition.__references['source'].opposite.should.equal('transition');

            s1 = State.newInstance('s1');
            s1.transition.should.be.empty;
            
            s2 = State.newInstance('s2');
            s1.setTransition(s2);
        
            s1.transition.should.be.empty;
            s2.transition.should.be.empty;

            done();
         })


         it('Instances created with simple inherited Reference', function(done){
			var State = Class.newInstance('State');
            var Transition = Class.newInstance('Transition');
            var SuperTransition = Class.newInstance('SuperTransition');
             
            State.setReference('transition', Transition, -1);
             
            var SuperState = Class.newInstance('SuperState');
            SuperState.setReference('supertransition', SuperTransition,-1);
            
            State.setSuperType(SuperState);
            Transition.setSuperType(SuperTransition);
             
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.should.have.property('setSupertransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__superType.should.have.keys('SuperState');
            s1.conformsTo().__superType['SuperState'].__references.should.have.keys('supertransition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            s1.supertransition.should.be.empty;
            
            t1 = Transition.newInstance('t1');
            st1 = SuperTransition.newInstance('st1');
             
            s1.setTransition(t1);
            s1.setSupertransition(st1);
            s1.should.have.property('transition',[t1]);
            s1.should.have.property('supertransition',[st1]); 
             
			done();
		})
         
         
        it('Instances created with overriden inherited Reference', function(done){
			var State = Class.newInstance('State');
            var Transition = Class.newInstance('Transition');
            var SuperTransition = Class.newInstance('SuperTransition');
             
            State.setReference('transition', Transition, -1);
             
            var SuperState = Class.newInstance('SuperState');
            SuperState.setReference('transition', SuperTransition, -1);
            
            State.setSuperType(SuperState);
            Transition.setSuperType(SuperTransition);
             
            s1 = State.newInstance('s1');
            s1.should.have.property('setTransition');
            s1.conformsTo().__references.should.have.keys('transition');
            s1.conformsTo().__superType.should.have.keys('SuperState');
            s1.conformsTo().__superType['SuperState'].__references.should.have.keys('transition');
            s1.conformsTo().__references['transition'].type.should.equal(Transition);
            s1.transition.should.be.empty;
            
            t1 = Transition.newInstance('t1');
            st1 = SuperTransition.newInstance('st1');
             
            s1.setTransition(t1);
            s1.should.have.property('transition',[t1]);
            
            //That should not work (inherited references) => but it may work with relaxed JSMF (cumulative types).
            s1.setTransition(st1);
            //console.log(s1.transition.conformsTo());
            s1.should.have.property('transition',[st1]); 
             
			done();
		})
        
        
        it('Instance created with reference to an inhereted class', function(done) { //Alain's reported bug
            var State = Class.newInstance('State');
            var Transition = Class.newInstance('Transition');
            var SubState = Class.newInstance('SubState');
            
            SubState.setSuperType(State);
            
            Transition.setReference('states',State,-1);
            
            s1= State.newInstance('s1');
            t1 =  Transition.newInstance('t1');
            sub = SubState.newInstance('sub');
            
            t1.setStates(sub);
            
           done(); 
        });
        
        it('Instances created with multiple inherented references', function(done){
	       var State = Class.newInstance('State');
             
			done();
		})
        
	})
})

/**********************************************************
// Model/Metamodel (aka package/namespace) Creation 
***********************************************************/
describe('Create a Model (Namespace/Package)', function() {
    describe('MetaModel - Reference Model',function() {
        it('Metamodel Created with one Meta element inside', function(done) {
            
            var ReferenceModel = new Model("Reference");
            var State = Class.newInstance('State');
            ReferenceModel.setModellingElement(State);
            ReferenceModel.modellingElements.should.have.keys('State');
            ReferenceModel.modellingElements['State'][0].should.be.equal(State);
            //.should.be.equal([State]);
            done();
            })
        
        it('Metamodel Created with one Meta element inside', function(done) {
           
            var ReferenceModel = new Model("Reference");
            var State = Class.newInstance('State');
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
            var State = Class.newInstance('State');
            ReferenceModel.setModellingElement(State);
            ReferenceModel.modellingElements['State'][0].should.be.equal(State);
                 
            var modelI = new Model('Instance');
            modelI.setReferenceModel(ReferenceModel);
            var s1 = State.newInstance('s1');
            var s2 = State.newInstance('s2');
             
            modelI.setModellingElement(s1);
            modelI.setModellingElement(s2);
            
            modelI.modellingElements.should.have.keys('State');
            modelI.modellingElements.should.have.property('State',[s1,s2]);
            console.log(modelI.modellingElements[State]); 
            done();
            })
    })
})
