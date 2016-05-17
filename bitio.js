/**
 * Created by shane on 3/9/15.
 */
//var CONFIG = require('./config/config.js');
//var CONFIG;
//var SETINGS;

global.__base = __dirname + '/';
var Q       = require('q');
var Settings    = require(__base + './script/settings.js');
global.__settings = new Settings.settings();

var express     = require('express');           // call express
var cors        = require('cors');              // call cors
var bodyParser  = require('body-parser');       // call body-parser
var http        = require('http');
var api    = require(__base + './script/api.js');

try{
    //var settings = new Settings.settings();
    var myAPI = new api.shaneAPI();
    var svr = {
        initWeb: function(port,retErr){
            try{
                var app = express();
                // Allow cross domain for AJAX queries
                app.use(cors());
                // Use parsing to extract JSON object from POST requests
                app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
                app.use(bodyParser.json( {limit: '50mb'} ));

                // Set the connection port
                //var port = 8000;      // set our port

                // Setup processing at the base URL to retrieve static assets
                app.use('/', express.static(__dirname + '/app'));
                app.get('/', function(req, res){
                    res.sendFile('default.html',{ root: __dirname + '/app'} );
                });

                // API ROUTES
                //=============================================================================
                // Get an instance of the express Router
                var router = express.Router();

                // Set up the main services at ROUTE_PARAM.API_RES / ROUTE_PARAM.WS_RESOURCE
                // The target is specified in the request parameters
                app.post('/api', function(req, res) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");

                    // console.log('api req',req);
                    var data = req.body.myData.data;
                    var args = [req,res,data];
                    svr.processAPICall(args)
                    .then(function(args){
                        console.log('success');
                        args[1].json(args[2]);
                    },function(args){
                        console.log('Error');
                        args[1].json(args[2]);
                    });
                });
                app.get('/api',function(req,res){
                        var data = {};
                        var args = [req,res,data];
                        svr.processAPICall(args)
                        .then(function(args){
                            args[1].json(args[2]);
                        },function(args){
                            args[1].json(args[2]);
                        });
                });

                //more routes for our API will happen here

                //REGISTER ROUTES
                //All of the routes will be prefixed with the value defined in the ROUTE_PARAM.API_RES parameter
                app.use('/api', router);

                //ErrorHandler
                app.use(function(err, req, res, next) {
                    //console.log('router error: ', err);
                    var response={header:{result:{}},content:{}};
                    response.header.result = 'Error';
                    response.content = err.message.toString();
                    retErr(err);
                    res.json(response);
                });                


                var server = http.createServer(app);
                var websockio = require('socket.io').listen(server);
                server.listen(port);


                websockio.sockets.on('connection', function (socket) {
                    console.log('websockio connection made:');

                    setInterval(function(data){
                        console.log('sending socketio data to client');
                        socket.emit('message','test');
                    },100000);

                    socket.on('message', function(data){
                        var resData = {
                            message: data
                        }
                        console.log('Server recieved client socketio data',data);
                    });
                });

                console.log('connecting story');
                var test = require('socket.io-client').connect('http://localhost:8000');
                console.log('connecting story1');
                test.on('connect',function(data){
                    console.log('test Client Connected to Server socketio');
                    test.on('message',function(data){
                        console.log('test socketio server data reveived',data);
                    });
                });



                console.log('API connect on port ' + port);

            }
            catch(e){
                //next1(e);
                console.log(e.message.toString());
            }
        },
        processAPICall: function(args){
            var deferred = new Q.defer();
            var apiRespone = {header:{result:{}},content:{}};
            var req = args[0];
            console.log('api requestOption',req.body.myData.reqOption);
            debugger;
            switch(req.body.myData.reqOption){
                case('apiRequest'):
                    console.log('got a writeRecord');
                    myAPI.processMessageIn(args)
                    .then(function(args){
                        apiRespone.header.result = 'success';
                        apiRespone.content = args[2];
                        args[2] = apiRespone;
                        deferred.resolve(args);
                    },function(args){
                        apiRespone.header.result = 'Error';
                        apiRespone.content = args[2];
                        args[2] = apiRespone;
                        deferred.reject(args);
                    });
                    break;
                case('settings'):
                    apiRespone.header.result = 'success';
                    apiRespone.content = settings;
                    args[2] = apiRespone;
                    deferred.resolve(args);
                    break;
                case('settingsSave'):
                    __settings.saveSettings(args)
                    .then(function(args){
                        apiRespone.header.result = 'success';
                        apiRespone.content = args.settings;
                        args[2] = apiRespone;
                        console.log('okay here now');
                        deferred.resolve(args);
                        return deferred.promise;
                    }, function(args){
                        apiRespone.header.result = 'error';
                        apiRespone.content = err;
                        args[2] = apiRespone;
                        deferred.reject(args);
                        return deferred.promise;
                    });
                    break;
                default:
                    apiRespone.header.result = 'error';
                    apiRespone.content = 'Error. Not sure which io to read';
                    args[2] = apiRespone;
                    deferred.reject(args);
            }
            return deferred.promise;
        },
        init: function(args){
            var deferred = Q.defer();
            __settings.getSettings(args)
            .then(svr.otherInit,null)
            .then(function(args){
                deferred.resolve(args);
            },function(args){
                deferred.reject(args);
                console.log('promise error');
            });
            return deferred.promise;
        },
        otherInit: function(args){
            var deferred = Q.defer();

            var webPort = __settings.value.localwebserver.port;
            console.log('webPort',webPort);
            svr.initWeb(webPort,function(err){
                console.log('bitio error: ', err);
            });

            deferred.resolve(args);
            return deferred.promise;
        }


    };




    // var myIO;
    var x = {'settings': ''};
    svr.init(x);









}
catch(error){
    console.log('The following error has occurred: '+error.message);
}

