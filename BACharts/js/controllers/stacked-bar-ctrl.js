(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('stackedBarCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "";
            $scope.d3Data = $window.stackedBarData;
            $scope.settings = $window.stackedBarSettings;
        }]);

}());