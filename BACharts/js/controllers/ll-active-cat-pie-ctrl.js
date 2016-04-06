(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('llActiveCatPieCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Most Active Categories";
            $scope.d3Data = $window.activeCatPieData;
            $scope.settings = $window.activeCatPieSettings;

        }]);

}());
