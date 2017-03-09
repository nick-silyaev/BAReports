(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('analyticsMultiBarCtrl', ['$scope', '$window', function ($scope, $window) {
            $scope.title = "";
            $scope.d3Data = $window.multiBarData;
            $scope.settings = $window.multiBarSettings;
        }]);

}());