(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsGradesCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Grades";
            $scope.d3Data = $window.gradesData;
            $scope.settings = $window.gradesSettings;

        }]);

}());
