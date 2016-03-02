(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsDistributionsCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Grades Distribution";
            $scope.d3Data = $window.distributionsData;
            $scope.settings = $window.distributionsSettings;
        }]);

}());
