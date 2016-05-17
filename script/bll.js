var Q       = require('q');
var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');

var MongoClient = require('mongodb').MongoClient, assert = require('assert');


var sbModule = function() {
    var self = this;
    var thisdebug = 0;
    var url = 'mongodb://192.168.1.224:27017/myproject';

    var pubBLL = {
        init: function(debug){
            thisdebug = debug;
        },
        connectDB: function(args){
            var deferred = new Q.defer();
            return deferred.promise;
        },
        writeRecord: function(args){
            var deferred = new Q.defer();

            MongoClient.connect(url, function(err, db) {
                if(err){
                    console.log('Mongo Connection Error');
                    // assert.equal(null, err);
                    args[2] = err;
                    deferred.reject(args);
                }
                else{
                    console.log("Connected correctly to server");
                    // Get the documents collection
                    var collection = db.collection('historical');
                    // Insert some documents
                    console.log('inserting Many',args[2]);
                    collection.insertMany([
                        args[2]
                    ], function(err, result) {
                    assert.equal(err, null);
                    assert.equal(1, result.result.n);
                    assert.equal(1, result.ops.length);
                    console.log("Inserted 1 documents into the document collection");
                    args[2] = 'Inserted 1 documents into the document collection';
                    deferred.resolve(args);
                    });
                }
            });

            return deferred.promise;
        },
        readRecords: function(args){
            var deferred = new Q.defer();

            MongoClient.connect(url, function(err, db) {
                if(err){
                    console.log('Mongo Connection Error');
                    // assert.equal(null, err);
                    args[2] = err;
                    deferred.reject(args);
                }
                else{
                    console.log("Connected correctly to server");

                    // Get the documents collection
                    var collection = db.collection('historical');
                    // Find some documents
                    collection.find({}).toArray(function(err, docs) {
                    assert.equal(err, null);
                    // assert.equal(2, docs.length);
                    console.log("Found the following records",docs.length);
                    args[2] = docs;
                    deferred.resolve(args);
                    });

                }
            });

            return deferred.promise;
        },        
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    return pubBLL;


}
util.inherits(sbModule, EventEmitter);
exports.shaneBLL = sbModule;