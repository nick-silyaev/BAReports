(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsSubmissionsCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Submissions";
            $scope.d3Data = $window.submissionsData;
            $scope.settings = $window.submissionsSettings;
        }]);

}());
