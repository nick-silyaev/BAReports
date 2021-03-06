(function () {
    'use strict';

    // Pie chart controller
    angular.module('Analytics.controllers')
        .controller('analyticspieCtrl', ['$scope', 'sharedChartData', function($scope, sharedChartData){
            $scope.settings = {
                heightRatio:.6 , // height to width ration. default is 1
                margin: {top: 0, right: 20, bottom: 0, left: 20}, // drawing margins
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
                margin: {top: 20, right: 20, bottom: 60, left: 55},
                duration: 1500, // transition duration
                delay: 750, // transition delay between two areas
                ease: "cubic-in-out" // transition ease
            };
            $scope.d3Data = sharedChartData.getData();

        }]);

    // line chart controller
    angular.module('Analytics.controllers')
        .controller('analyticslineCtrl', ['$scope', 'sharedChartData', function($scope, sharedChartData){
            $scope.settings = {
                heightRatio:.8, // height to width ration. default is 0.5
                margin: {top: 20, right: 20, bottom: 60, left: 45},
                duration: 1500, // transition duration
                delay: 750, // transition delay between two areas
                ease: "cubic-in-out" // transition ease
            };
            $scope.d3Data = sharedChartData.getData();

        }]);

    // line chart controller
    angular.module('Analytics.controllers')
        .controller('analyticstableCtrl', ['$scope', 'sharedChartData', function($scope, sharedChartData){
            $scope.d3Data = sharedChartData.getData();
        }]);
}());