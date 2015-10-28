/**
 *  Importer of JSON files (Metamodel+Model)
 *
©2015 Luxembourg Institute of Science and Technology All Rights Reserved
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

Authors : J.S. Sottet
*/

var CircularJSON = require('circular-json');
var fs = require('fs');
var JSMF = require('./jsmf');
Class = JSMF.Class;
Model = JSMF.Model;

function saveModel(model,path) {
    
    //prepare for M2 modelling elements
    //var pathTest = __dirname + '/' + 'testFile';
    var serializedResult = CircularJSON.stringify(model);
    //does not includes the attributes
    fs.writeFile(path, serializedResult, function(err) {
        if(err) {
            console.log('err');
            throw(err);
        }  else {
            console.log('Saved');
        }
    });
}

function readModel(path) {
    console.log(path);
    var raw = fs.readFileSync(path);
    console.log(raw);
    var unserializedResult = CircularJSON.parse(raw);
 return unserializedResult;
}

module.exports = {
    
    saveModel: function(model,path) {
        return saveModel(model,path);   
    },
    
    readModel: function(path) {
        return readModel(path);
    }

};
