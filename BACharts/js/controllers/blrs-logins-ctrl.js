(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsLoginsCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Logins";
            $scope.d3Data = $window.loginsData;
            $scope.settings = $window.loginsSettings;

        }]);

}());
