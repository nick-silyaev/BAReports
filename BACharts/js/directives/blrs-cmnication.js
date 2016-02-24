(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsCmnicationCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Communication";
            $scope.d3Data = $window.cmnicationData.data;
            $scope.settings = $window.cmnicationData.settings;

        }]);

}());
