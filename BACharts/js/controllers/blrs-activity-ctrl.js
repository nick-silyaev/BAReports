(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsActivityCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "blrsActivity";
            $scope.d3Data = $window.blrsActivityData;
            $scope.settings = $window.blrsActivitySettings;
        }]);

}());