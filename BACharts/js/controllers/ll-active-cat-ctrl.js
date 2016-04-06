(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('llActiveCatCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Most Active Categories";
            $scope.d3Data = $window.activeCatData;
            $scope.settings = $window.activeCatSettings;

        }]);

}());
