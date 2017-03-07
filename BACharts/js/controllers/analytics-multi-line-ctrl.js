(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('analyticsMultiLineCtrl', ['$scope', '$window', function ($scope, $window) {
            $scope.title = "";
            $scope.d3Data = $window.multiLineData;
            $scope.settings = $window.multiLineSettings;
        }]);

}());