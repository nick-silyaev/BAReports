(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsCourseSubmissionsCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "blrsCourseSubmissionsCtrl";
            $scope.d3Data = $window.blrsCourseSubmissionsData;
            $scope.settings = $window.blrsCourseSubmissionsSettings;

        }]);

}());