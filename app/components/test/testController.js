angular.module('myApp')
.controller('testController', function($scope,$rootScope,$timeout,$state,$location, $anchorScroll, api) {
	$scope.writeRecord = function(){
        var data = {
            header: {
                userName: 'shane@realtelematics.co.za',
                token: '12345'
            },
            payLoad: {
                    sourceAddress: 123,
                    msgId: 789,
                    msgType: 'write',
                    dateTime: '2016/05/15 12:13:14',
                    io: {
                        AI1: 1000,
                        AIScaled: 51,
                        digIn: 65535
                    }
            }
        };

        api.writeRecord(data,function(result){
        	console.log('result',result);
        },function(err){
			console.log('Error',err);
        });

	};
});
