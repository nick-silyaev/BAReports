(function () {
    'use strict';

    // Pie chart controller
    angular.module('Analytics.controllers')
        .controller('analyticspieCtrl', ['$scope', 'sharedChartData', function($scope, sharedChartData){
            $scope.settings = {
                heightRatio:.6 , // height to width ration. default is 1
                margin: {top: 0, right: 20, bottom: 0, left: 20}, // drawing margins
                colors: ["#3598dc", "#ea5d4b", "#efc164", "#4cd797", "#ed7d31", "#ffc000"],
                duration: 1000, // transition duration
                ease: "cubic-in-out", // transition ease
                titleHeight: 0, // 0 to make responsive
                legendHeight: 40 // 0 to make responsive
            };
            $scope.d3Data = sharedChartData.getData();
        }]);

    // Bar chart controller
    angular.module('Analytics.controllers')
        .controller('analyticsbarCtrl', ['$scope', 'sharedChartData', function($scope, sharedChartData){
            $scope.settings = {
                heightRatio:.8, // height to width ration. default is 0.5
                margin: {top: 20, right: 20, bottom: 60, left: 45},
                colors: ["#3598dc", "#ea5d4b", "#efc164", "#4cd797", "#ed7d31", "#ffc000"],
                duration: 1500, // transition duration
                delay: 750, // transition delay between two areas
                ease: "cubic-in-out" // transition ease
            };
            $scope.d3Data = sharedChartData.getData();

        }]);
}());