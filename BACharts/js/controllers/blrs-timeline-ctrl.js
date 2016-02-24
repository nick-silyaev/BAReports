(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('blrsTimelineCtrl', ['$scope', '$window', function($scope, $window){
            $scope.title = "Timeline";
            $scope.d3Data = $window.timelineData.data;
            $scope.settings = $window.timelineData.settings;
        }]);

}());
