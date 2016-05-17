


// var settings = require(__base + '/config.js');
// var settings    = require(__base + './script/settings.js').settings;
var Q       = require('q');
var EventEmitter = require( "events" ).EventEmitter;
var util = require('util');
var net = require('net');
var bll = require(__base + '/script/bll.js');

var sbModule = function() {
    var self = this;
    var thisdebug = 0;
    var myBLL = new bll.shaneBLL();

    var pubAPI = {
        init: function(ioPassedThrough,log,debug){
            thisdebug = debug;
            io = ioPassedThrough;
            myLog = log;
        },
        processMessageIn: function(args){
            var deferred = new Q.defer();

            // var testMessage = {
            //     header: {
            //         userName: 'shane@realtelematics.co.za',
            //         token: '12345'
            //     },
            //     payLoad: {
            //             sourceAddress: 123,
            //             msgId: 789,
            //             msgType: 'read',
            //             dateTime: '2016/05/15 12:13:14',
            //             io: {
            //                 AI1: 1000,
            //                 AIScaled: 50,
            //                 digIn: 65535
            //             }
            //     }
            // };
            // args[2] = testMessage;  //For testing
            console.log('msgIn',msgIn);
            var msgIn = args[2];
            var payLoad = msgIn.payLoad;

            function ObjectLength( object ) {
                var length = 0;
                for( var key in object ) {
                    if( object.hasOwnProperty(key) ) {
                        console.log('key',key);
                        ++length;
                    }
                }
                return length;
            }

            if(payLoad.msgType == 'write'){
                var msgResponse = {
                    msgId: msgIn.messageId,
                    msgType: 'status',
                    errorCode: 0,
                    errorMessage: ''
                };

                myBLL.writeRecord(args)
                .then(function(args){
                    deferred.resolve(args);
                }, function(err){
                    msgResponse.errorCode = 69;
                    msgResponse.errorMessage = err;
                    args[2] = msgResponse;
                    deferred.reject(args);
                });
            }
            if(payLoad.msgType == 'read'){
                var msgResponse = {
                    msgId: msgIn.messageId,
                    msgType: 'status',
                    errorCode: 0,
                    errorMessage: ''
                };

                myBLL.readRecords(args)
                .then(function(args){
                    deferred.resolve(args);
                }, function(err){
                    msgResponse.errorCode = 169;
                    msgResponse.errorMessage = err;
                    args[2] = msgResponse;
                    deferred.reject(args);
                });
            }

            // deferred.resolve(args);
            return deferred.promise;
        },
        on: function(strEvent,callbackFunction){
            self.on(strEvent,function(data){
                callbackFunction(data);
            })
        }
    }

    return pubAPI;


}
util.inherits(sbModule, EventEmitter);
exports.shaneAPI = sbModule;