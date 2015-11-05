var assert = require("assert");
var should = require('should');
var JSMF = require('../jsmf');
var JSON_save = require('../jsmf-json')
Class = JSMF.Class;
Model = JSMF.Model; 

//should preprocess the deletion of persisted path
describe('Save Models', function() {
    describe('Save MetaModels', function() {
        it('Simple MetaModel correctly persisted', function(done)   {
        var ReferenceModel = new Model('Reference');
        var State = Class.newInstance('State');
        State.setAttribute('name',String);
        State.setAttribute('id',Number);
        State.setAttribute('isStart', Boolean);
        ReferenceModel.setModellingElement(State);
            
    try {       
console.log(ReferenceModel);        JSON_save.saveModel(ReferenceModel,'./test/persistence.json');
      done();
    } 
catch(e){ 
    console.log(e);
}
            
            //check that file exists
            //chek that files...
        });
    });
});
