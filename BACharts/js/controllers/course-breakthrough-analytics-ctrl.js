(function () {
    'use strict';

    angular.module('Analytics.controllers', ['ui.bootstrap', 'ngTagsInput'])
        .factory('modalFactory', function($uibModal) {
            return {
                open: function(size, template, params) {
                    return $uibModal.open({
                        animation: true,
                        templateUrl: template || 'templates/report-builder.html',
                        controller: 'ModalResultInstanceCtrl',
                        size: size,
                        resolve: {
                            params: function() {
                                return params;
                            }
                        }
                    });
                }
            };
        })
        .service('sharedChartData', function(){
            var data;
            return {
                getData: function () {
                    return data;
                },
                setData: function(value) {
                    data = value;
                }
            };
        })
        .controller('courseBreakthroughAnalyticsCtrl', function($rootScope, $scope, $log, $uibModal){

            $scope.open = function(size, template) {

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: template || 'templates/report-builder.html',
                    controller: 'ModalInstanceCtrl',
                    size: size,
                    resolve: {
                        params: function(){
                            return {}
                        }
                    }
                });

                //modalInstance.result.then(function(result) {
                //    console.log(result);
                //}, function() {
                //
                //});
            };

            // use this function to get search terms for tags input field
            $scope.loadTags = function(query) {
                return [
                    { text: 'tag0' },
                    { text: 'tag1' },
                    { text: 'tag2' },
                    { text: 'tag3' }
                ];
                //return $http.get('/tags?query=' + query);
            };


        });

    // report builder controller
    angular.module('Analytics.controllers').controller('ModalInstanceCtrl', function($scope, $uibModalInstance, modalFactory, params) {

        $scope.model = {};
        $scope.errors = [];

        $scope.model.activities = {
            'Launched' : false,
            'Initialized': false,
            'Completed': false,
            'Passed' : false,
            'Failed': false,
            'Abandoned': false,
            'Waived': false,
            'Terminated': false,
            'Satisfied': false,
        };

        $scope.selectChart = function(event){
            $scope.model.chart = event.target.id;
            angular.element( document.querySelectorAll( '.chart')).parent().removeClass('image-toggled');
            angular.element( document.querySelector( '#'+event.target.id )).parent().addClass('image-toggled');
        }

        $scope.validate = function(){
            $scope.errors = [];
            if(!$scope.model.chart) {
                $scope.errors.push("Please choose chart");
            }
            if( new Date($scope.model.until).getTime() < new Date($scope.model.since).getTime()){
                $scope.errors.push("Please choose date range");
            }
            return !$scope.errors.length;
        }


        $scope.ok = function() {
            if($scope.validate()) {
                $uibModalInstance.close($scope.model);
                modalFactory.open('md', 'templates/report-preview.html', {'model': $scope.model});
            }
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    });


    // Report Preview controller
    angular.module('Analytics.controllers').controller('ModalResultInstanceCtrl', function($scope, $uibModalInstance, params, $compile, sharedChartData) {

        $scope.model = params.model;

        $scope.init = function()
        {

            var testData = {
                reportId: "123asd123asd123",
                name: "Report Name",
                description: "Report description",
                groups: [],
                people: [],
                values: [
                    { label: "Launched", value: 55},
                    { label: "Waived", value: 45},
                    { label: "Passed", value: 49 },
                    { label: "Initialized", value: 201 },
                    { label: "Completed", value: 141 }
                ],
            };
            var lineTestData = {
                reportId: "123asd123asd123",
                name: "Report Name",
                description: "Report description",
                groups: [],
                people: [],
                labels: ["Launched", "Waived", "Passed", "Initialized", "completed"],
                values: [
                    { date: "2016-09-01", scores: [10, 5, 25, 12, 2] },
                    { date: "2016-09-03", scores: [0, 10, 20, 58, 8] },
                    { date: "2016-09-04", scores: [2, 0, 33, 41, 12] },
                    { date: "2016-09-07", scores: [22, 0, 45, 22, 22] },
                    { date: "2016-09-08", scores: [42, 8, 20, 5, 10] },
                    { date: "2016-09-09", scores: [40, 1, 38, 44, 14] }
                ],

            }
            if($scope.model.chart == 'line' || $scope.model.chart == 'table' ){
                sharedChartData.setData(lineTestData);
            }else {
                sharedChartData.setData(testData);
            }

            var elem = angular.element(document.querySelector("#chart"));

            var chart = $compile('<div class="col-md-12" ng-controller="analytics'+ $scope.model.chart +'Ctrl" >' +
                '<analytics-'+$scope.model.chart+' ng-if="d3Data" data="d3Data" settings="settings"></analytics-'+ $scope.model.chart +
                '></div>')($scope);

            elem.append(chart);


        }
        //

        //angular.element( $document('#chart-preview')).append(chart);
        //$timeout(function () { $scope.init(); }, 1000);

        $scope.ok = function() {
            //$uibModalInstance.close($scope.model);
            console.log($scope.model);

        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    })



    // datepicker directive
    angular.module('Analytics.directives')
        .directive('mdrDatepicker', [function(){
            /**
             * @param model {date}
             * @param date {date}
             * @param format {string}
             * @param lang {string}
             * @param zindex {string}
             * @param placeholder {string}
             * @param disabled {boolean}
             * @param required {boolean}
             */
            return {
                require: 'ngModel',
                restrict: 'E',
                controller: 'mdrDatepickerCtrl',
                scope: {
                    input: '=ngModel',
                    output: '=',
                    format: '@',
                    lang: '@',
                    zindex: '@',
                    placeholder: '@',
                    label: '@',
                    disabled: '=',
                    required: '='
                },
                template: '<div class="input-group">' +
                '<span class="input-group-addon">{{label}}</span>' +
                '<input type="text" class="form-control datepicker" id="datepickerId_{{$id}}" placeholder="{{placeholder}}" ng-model="input" ng-disabled="disabled" ng-required="required">' +
                '</div>'
            };
        }]);
    // datepicker controller
    angular.module('Analytics.controllers')
        .controller('mdrDatepickerCtrl', ['$rootScope', '$scope', '$element', '$attrs', '$filter', function($rootScope, $scope, $element, $attrs, $filter){

            initialize();

            function initialize(){
                $element.datepicker({
                    format: $scope.format,
                    autoclose: true,
                    todayHighlight: true,
                    zIndexOffset: $scope.zindex,
                    language: $scope.lang,
                    maxDate: "+1d",
                    endDate: new Date()
                });

            }

        }]);

}());
