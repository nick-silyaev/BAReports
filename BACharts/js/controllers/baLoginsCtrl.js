(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('LoginsCtrl', ['$scope', '$http', function($scope, $http){
            $scope.title = "LoginsCtrl";
            $http({
                method: 'GET',
                url: 'sample-data/logins.json'
            }).then(function successCallback(response) {
                $scope.d3Data = response.data;
                //console.log(response.data);
            }, function errorCallback(response) {
                //console.log(response.data);
            });

        }]);

}());
