angular.module('myApp')
.controller('appController', function($scope, $state, $rootScope) {
		$scope.test = function(){
			$state.go('app.test');
		}
		$scope.what = function(){
			$state.go('app.what');
		}		
});

