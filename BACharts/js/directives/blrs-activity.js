(function () {
  'use strict';

  angular.module('Analytics.directives')
    .directive('blrsActivity', ['d3', function (d3) {
      return {
        restrict: 'EA',
        scope: {
          data: "=",
          settings: "=",
          label: "@"
        },
        link: function ($scope, iElement) {
          var tip = d3.tip()
            .attr('class', 'd3-tip distributions-tip')
            .direction('n')
            .offset([-20, 0])
            .html(function (d) {
              return '<strong>' + d[0] + '</strong><br>' +
                '<span>Views: </span><strong>' + d[1] + '</strong><br>' +
                '<span>Actions: </span><strong>' + d[2] + '</strong><br>';
            });

          var svg = d3.select(iElement[0])
            .append('svg')
            .attr('class', 'analytics-logins')
            .attr('width', '100%')
            .attr('height', d3.select(iElement[0])[0][0].offsetWidth / 2)
            .call(tip);

          $scope.filterData = function(values) {
            var $this = this;
            _.remove(values, function(item) {
              return !$this.validationData(item);
            });
            return values;
          };
          $scope.validationData =  function(item) {
            return _.isString(item[0]) && _.isNumber(item[1]) && _.isNumber(item[2]);
          };

          // on window resize, re-render d3 canvas
          window.onresize = function () {
            return $scope.$apply();
          };

          $scope.settings.resize = function () {
            $scope.render($scope.data, $scope.settings);
          };

          $scope.$watch(function () {
              return angular.element(window)[0].innerWidth;
            }, function () {
              return $scope.render($scope.data, $scope.settings);
            }
          );

          //// watch for data changes and re-render
          //$scope.$watch('data', function(newVals, oldVals) {
          //  return $scope.render(newVals);
          //}, true);

          // define render function
          $scope.render = function (data, settings) {
            if (!data || !data.values || !settings || !data.values.length) {
              svg.append("text")
                  .attr("x", d3.select(iElement[0])[0][0].offsetWidth / 2)
                  .attr("y", d3.select(iElement[0])[0][0].offsetWidth / 3)
                  .attr('class', 'text-no-data text-no-data--text-center')
                  .text("No data available.");
              return false;
            }

            /**
             * Valid data
             */
            if ($scope.filterData) {
              data.values = $scope.filterData(data.values);
            }
            // remove all previous items before render
            svg.selectAll('*').remove();

            // get settings or set defaults
            var margin = settings.margin || { top: 20, right: 50, bottom: 30, left: 50 };
            var heightRatio = settings.heightRatio || 0.5;
            var colors = settings.colors || ['#3598dc', '#ea5d4b'];
            var maxValue = d3.max(data.values, function (d) {
              return d[1] > d[2] ? d[1] : d[2];
            });
            var duration = settings.duration || 1000;
            var ease = settings.ease || 'cubic-in-out';

            //containing element width
            var width = d3.select(iElement[0])[0][0].offsetWidth;
            var height = width * heightRatio;
            var columnWidth = width / data.values.length / 4;

            // set the height based on the calculations above
            svg.attr('height', height);

            var xScale = d3.scale.ordinal()
              .domain(data.values.map(function (d) {
                return d[0];
              }))
              .rangePoints([margin.left, width - margin.right - columnWidth]);

            var yScale = d3.scale.linear()
              .domain([0, ((maxValue + 100) / 100 ^ 0) * 100])
              .range([height - margin.bottom, margin.top]);

            // prepare x axis
            var xAxis = d3.svg.axis()
              .scale(xScale);

            //prepare y axis
            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .ticks(maxValue / 100 ^ 0);

            //draw x axis
            svg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(' + columnWidth + ',' + (height - margin.bottom) + ')')
              .call(xAxis);

            // draw yAxis
            svg.append('g')
              .attr('class', 'y axis')
              .attr('transform', 'translate(' + margin.left + ', 0)')
              .call(yAxis);

            //draw horisontal grid lines
            svg.selectAll('line.y')
              .data(yScale.ticks(maxValue / 100 ^ 0))
              .enter().append('line')
              .attr('class', 'y')
              .attr('x1', margin.left)
              .attr('x2', width - margin.right + columnWidth + 2)
              .attr('y1', yScale)
              .attr('y2', yScale);

            var reacts = svg.selectAll('rect').data(data.values).enter();
            reacts
              .append('rect')
              .on('mouseover', function (d) {
                tip.show(d);
              })
              .on('mouseout', function (d) {
                tip.hide(d);
              })
              .attr('tooltip-append-to-body', true)
              .attr('tooltip', function (d) {
                return d;
              })
              .attr('x', function (d) {
                return xScale(d[0]);
              })
              .attr('y', yScale(0))
              .attr('width', columnWidth)
              .attr('height', 0)
              .attr('fill', colors[1])
              .transition().ease(ease).duration(duration)
              .attr('height', function (d) {
                return height - yScale(d[1]) - margin.bottom;
              })
              .attr('y', function (d) {
                return yScale(d[1]);
              });

            reacts
              .append('rect')
              .on('mouseover', function (d) {
                tip.show(d);
              })
              .on('mouseout', function (d) {
                tip.hide(d);
              })
              .attr('tooltip-append-to-body', true)
              .attr('tooltip', function (d) {
                return d;
              })
              .attr('x', function (d) {
                return xScale(d[0]) + columnWidth + 2;
              })
              .attr('y', function () {
                return yScale(0);
              })
              .attr('width', columnWidth)
              .attr('height', 0)
              .attr('fill', colors[0])
              .transition().ease(ease).duration(duration)
              .attr('height', function (d) {
                return height - yScale(d[2]) - margin.bottom;
              })
              .attr('y', function (d) {
                return yScale(d[2]);
              });

          };
        }
      };
    }]);

}());
