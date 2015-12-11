var JSMF = require('./jsmf');
var Model = JSMF.Model;
var Class = JSMF.Class;
var _ = require('lodash');
var hash = require('object-hash');


//Copy the element which are the same from sourceME to targetME without changing the metaclass of Source and Target elements
function AttributesModelCopy(SourceME, TargetME) {
    _.each(SourceME.conformsTo().__attributes, function (element, index, list) {
        if (TargetME.hasOwnProperty(index)) {
            var setValue = "set" + index;
            TargetME[setValue](SourceME[index]); // or TargetME[index]=SourceME[index] => prefere the current solution because its check name unicity and attribute types!
        }
    });
    //DO the same for the references
    //_.each(SourceME.conformsTo()._references, function(element,index,list) { 
    // DO the affectation of references elements
    //});
}


function export3DGraph(model) {
var mapId={};
var graph = {};
graph.nodes = [];
graph.links = [];
var idcount = 0;

//That can be done with a transfo / syntax-template language
_.each(model.modellingElements, function(elem,index) {
    _.each(elem, function(elem2,index2){
		 // convert number into string
	var pushGraphNode = {};
	   for(var i in elem2.conformsTo().__attributes) {
        //check if elements are !== undefined
           pushGraphNode['ConformsTo']=elem2.conformsTo().__name;
            var j = elem2[i];
            if(_.isNumber(j)){
                j = new String(j);
                pushGraphNode[i]=j;
            } else {
                pushGraphNode[i]=j;
            }
        }
       var idHash = hash(elem2);
       mapId[idHash]=idcount;
       idcount++;
	   graph.nodes.push(pushGraphNode);            
	});
});
    //map all the 
//Dumb link since the first one seems to be avoided
var dumb = {name:'dumb', source:0, target:0};
graph.links.push(dumb);
_.each(model.modellingElements, function(elem,index) {
    _.each(elem, function(elem2,index2){
        var pushGraphLink={};
        
        for(var i in elem2.conformsTo().__references){
            pushGraphLink.name=i;
            var source = mapId[hash(elem2)];
            _.each(elem2[i], function(elem3,index3) {
                pushGraphLink.source=source;
                var target = hash(elem2[i][index3]);
                pushGraphLink.target = mapId[target];
            });
            graph.links.push(pushGraphLink);
        }
    });
});

return graph;

}

function ModelCopy(SourceME, TargetME) {
    _.each(SourceME.conformsTo().__attributes, function (element, index, list) {
        if (TargetME.hasOwnProperty(index)) {
            var setValue = "set" + index;
            TargetME[setValue](SourceME[index]); // or TargetME[index]=SourceME[index] => prefere the current solution because its check name unicity and attribute types!
        }
    });
    //DO the same for the references
    //_.each(SourceME.conformsTo()._references, function(element,index,list) { 
    // DO the affectation of references elements
    //});
}

//extract model of a metamodel ->should only promote/demote models -> chain of conformance to be kept
function demote(MetaModel) {

    var result = new Model(MetaModel.__name + "_Demoted");

    var tabresolution = [];
    var resolve = {};

    var M3Class = new Class("M3Class");
    M3Class.setAttribute("_name", String);
    //first round -> building metaclass
    for (e in MetaModel.modellingElements) {
        for (j in MetaModel.modellingElements[e]) {
            var currentClass = MetaModel.modellingElements[e][j];
            for (i in currentClass.__attributes) {
                M3Class.setAttribute(i, String);
            }
            for (i in currentClass.__references) {
                M3Class.setReference(i, M3Class, -1);
            }
        }
    }

    //Second Round -> building instance 
    for (e in MetaModel.modellingElements) {
        for (j in MetaModel.modellingElements[e]) {
            var currentClass = MetaModel.modellingElements[e][j];
            var test = M3Class.newInstance("");
            test.set_name(currentClass.__name);

            for (i in currentClass.__attributes) {
                var currenttype = currentClass.__attributes[i].toString().split(" ")[1].replace("()", "");
                var method = "set" + i;
                test[method](currenttype);
            }
        }
        result.setModellingElement(test);
        resolve = {
            source: currentClass,
            target: test
        };

        tabresolution.push(resolve);
        //console.log(resolve);
    }

    //Third Round -> building relation
    for (e in MetaModel.modellingElements) {
        for (j in MetaModel.modellingElements[e]) {
            var currentClass = MetaModel.modellingElements[e][j];
            for (i in currentClass.__references) {
                var target = currentClass.__references[i].type;

                //get sources and target of the reference from the resolve link element
                var newsourcerefClass = _.find(tabresolution, function (param) {
                    return param.source == currentClass;
                });
                var newtargetrefClass = _.find(tabresolution, function (param) {
                    return param.source == target;
                });
                var param = {};
                if (newtargetrefClass == undefined) {
                    param = M3Class;
                } else {
                    param = newtargetrefClass.target;
                }
                var refsetter = "set" + i;
                newsourcerefClass.target[refsetter](param);
                //newsourcerefClass[refsetter](newtargetrefClass);
            }
        }
    }
    // end of process
    console.log(result);
    //result.save();
    return result;
}

//Create a metamodel from model elements
function Promote(model) {
    var result = new Model(model.__name+"_promoted");
    var M2 =  model.referenceModel;
    for(i in model.modellingElements) {
        var currentelement = model.modellingElements[i];
        var M2Class = new CLass(currentelement.__name);
    }
    
}

//Get the metamodel from model
function ExtractMetamodel() {
    
    
}

function metamodelEquals(M2elementR,M2elementL) {
    var result = true;   
    
    return result;    
}

//Shallow equals between two JSMF modeling elements
function equals(elementR, elementL) {
    var result = true;
    if (elementR.conformsTo().__name !== elementL.conformsTo().__name) { //Warning check that these objects are correct too
        result = false;
    } else {
        for (i in elementR.conformsTo().__attributes) {
            if (elementR[i] !== elementL[i]) {
                result = false;
            }
        }
        for(i in elementR.conformsTo().__references) {
            for(j in elementR[i]) {
                if (elementR[i][j] !== elementL[i][j]) {
                result = false;   
            }
            }
        }
    }
    console.log(result);
    return result;
}



module.exports = {
    //Function Create Node From Model Element
    //Create a Model from a Metamodel    
    demote: function (MetaModel) {
        demote(MetaModel);
    },

    equals: function (modelElementR, modelElementL) {
        return equals(modelElementR, modelElementL);
    },

	exportD3JS :function(model)  {
		return export3DGraph(model);
	}
}; // end exports
