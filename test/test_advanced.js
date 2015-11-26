var assert = require("assert");
var should = require('should');
var JSMF = require('../jsmf');
Class = JSMF.Class;
Model = JSMF.Model; 

describe('Create Dynamic Instances', function() {
	describe('Create Instance from metamodel references', function(){
//WARNING the references must be set AFTER the creation of Classes
        it('Instance created from reference', function(done){
			var Transition = Class.newInstance('Transition');
	        Transition.setAttribute('active', Boolean);			

            var Property = Class.newInstance('Property');
	         Property.setAttribute('blink', Number);

            var State = Class.newInstance('State');
            State.setAttribute('name', String);
            State.setAttribute('id', Number);
                              
            State.setReference('transition', Transition, -1);
            State.setReference('property',Property, 1);

            s1 = State.newInstance('s1');
            s1 = State.newInstance('s1');
            var tabOfInstance = {};
            for(i in State.__references) {
                var Type = State.__references[i].type;      
                tabOfInstance[Type.__name]=Type.newInstance();
            }
            
            tabOfInstance['Transition'].should.have.property('setActive');
            tabOfInstance['Property'].should.have.property('setBlink');
            var t1 = tabOfInstance['Transition'];
            var p1 = tabOfInstance['Property'];
            t1.should.have.property('setActive');
            t1.active.should.be.empty;
            t1.setActive(true);
            t1.should.have.property('active',true);
            
            p1.blink.should.be.empty;
            p1.setBlink(182);
            p1.should.have.property('blink',182);
			
			done();
		})
        
         it('Instance created inherited reference', function(done){
			var Transition = Class.newInstance('Transition');
	        Transition.setAttribute('active', Boolean);			

            var Property = Class.newInstance('Property');
	         Property.setAttribute('blink', Number);

            var SuperState = Class.newInstance('SuperState');
            SuperState.setReference('property',Property, 1);
             
            var State = Class.newInstance('State');
            State.setAttribute('name', String);
            State.setAttribute('id', Number);
                              
            State.setReference('transition', Transition, -1);
            State.setSuperType(SuperState);

            s1 = State.newInstance('s1');
            var tabOfInstance = {};
             console.log('AllRefs: ',State.getAllReferences());
            for(i in State.__references) { 
                var Type = State.__references[i].type;      
                tabOfInstance[Type.__name]=Type.newInstance();
            }
            
            tabOfInstance['Transition'].should.have.property('setActive');
            var t1 = tabOfInstance['Transition'];
            t1.should.have.property('setActive');
            t1.active.should.be.empty;
            t1.setActive(true);
            t1.should.have.property('active',true);
            

			
			done();
		})
        
    })
})
