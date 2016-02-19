(function () {
    'use strict';

    angular.module('BALogins.controllers')
        .controller('LoginsCtrl', function($scope, $http){
            $scope.title = "LoginsCtrl";
            $http({
                method: 'GET',
                url: 'sample-data/logins.json'
            }).then(function successCallback(response) {
                $scope.d3Data = response.data;
                console.log(response.data);
            }, function errorCallback(response) {
                console.log(response.data);
            });
            $scope.d3OnClick = function(item){
                alert(item.name);
            };
        });

}());
