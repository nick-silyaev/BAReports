(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsHbarCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Math Practice Questions";
            $scope.d3Data = $window.blrsHbarData;
            $scope.settings = $window.blrsHbarSettings;
        }]);

}());