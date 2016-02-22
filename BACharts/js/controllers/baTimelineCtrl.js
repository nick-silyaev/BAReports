(function () {
    'use strict';

    angular.module('Analytics.controllers')
        .controller('TimelineCtrl', ['$scope', '$http', function($scope, $http){
            $scope.title = "TimelineCtrl";
            $http({
                method: 'GET',
                url: 'sample-data/timeline.json'
            }).then(function successCallback(response) {
                $scope.timelineData = response.data;
                console.log(response.data);
            }, function errorCallback(response) {
                console.log(response.data);
            });

        }]);

}());
