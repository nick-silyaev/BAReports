(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsConnectionsCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Activity Outcome Connections";
            $scope.d3Data = $window.connectionsData;
            $scope.settings = $window.connectionsSettings;
        }]);
}());
