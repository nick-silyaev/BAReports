(function () {
  'use strict';

  angular.module('Analytics.directives')
    .directive('blrsCourseSubmissions', ['d3', function (d3) {
      return {
        restrict: 'EA',
        scope: {
          data: "=",
          settings: "=",
          label: "@"
        },
        link: function ($scope, iElement) {
          $scope.filterData = function(values) {
            var $this = this;
            _.remove(values, function(item) {
              return !$this.validationData(item);
            });
            return values;
          };
          $scope.validationData = function(item) {
            return _.isString(item.name) && _.isDate( new Date(item.duedate) )
                && _.isNumber(item.ontime) && _.isNumber(item.late) && _.isNumber(item.missing);
          };
          // create tip
          var tip = d3.tip()
            .attr('class', 'd3-tip distributions-tip')
            .direction('n')
            .offset([-20, 0])
            .html(function (d) {
              return '<span>Assignment: </span><strong>' + d.name + '</strong><br>' +
                '<span>Due date: </span><strong>' + d.duedate + '</strong><br>' +
                '<span>On time: </span><strong>' + d.ontime + '</strong><br>' +
                '<span>Late: </span><strong>' + d.late + '</strong><br>' +
                '<span>Missing: </span><strong>' + d.missing + '</strong><br>';
            });

          var svg = d3.select(iElement[0])
            .append('svg')
            .attr('class', 'analytics-logins')
            .attr('width', '100%')
            .call(tip);

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
          //scope.$watch('data', function(newVals, oldVals) {
          //  return scope.render(newVals);
          //}, true);

          // define render function
          $scope.render = function (data, settings) {
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
            var duration = settings.duration || 1000;
            var ease = settings.ease || 'cubic-in-out';

            //containing element width
            var width = d3.select(iElement[0])[0][0].offsetWidth;
            var height = width * heightRatio;
            var columnWidth = (width - margin.left - margin.right) / (data.values.length + 1);

            // set the height based on the calculations above
            svg.attr('height', height);

            var xScale = d3.scale.ordinal()
              .domain(data.values.map(function (d, i) {
                return i;
              }))
              .rangePoints([margin.left, width - margin.right - columnWidth]);

            var yScale = d3.scale.linear()
              .domain([0, 100])
              .range([height - margin.bottom, margin.top]);

            // prepare x axis
            var xAxis = d3.svg.axis()
              .scale(xScale);

            //prepare y axis
            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .ticks(5).tickFormat(function (d) {
                return d + '%';
              });

            if (!data.values.length) {
              svg.append("text")
                  .attr("x", width / 2)
                  .attr("y", height / 2)
                  .attr('class', 'text-no-data text-no-data--text-center')
                  .text("No data available.");
            }

            //draw x axis
            svg.append('g')
              .attr('class', 'x axis brls-course-submission-x-axis')
              .attr('transform', 'translate(' + columnWidth + ',' + (height - margin.bottom) + ')')
              .call(xAxis);

            // draw yAxis
            svg.append('g')
              .attr('class', 'y axis')
              .attr('transform', 'translate(' + margin.left + ', 0)')
              .call(yAxis);

            //draw horisontal grid lines
            svg.selectAll('line.y')
              .data(yScale.ticks(5))
              .enter().append('line')
              .attr('class', 'y')
              .attr('x1', margin.left)
              .attr('x2', (width - margin.right))
              .attr('y1', yScale)
              .attr('y2', yScale);


            var reacts = svg.selectAll('rect').
              data(data.values).enter()
              .append('g')
              .on('mouseover', function (d) {
                tip.show(d);
              })
              .on('mouseout', function (d) {
                tip.hide(d);
              })
              .attr('tooltip-append-to-body', true)
              .attr('tooltip', function (d) {
                return d;
              });

            var ontime_height,
              late_height,
              missing_height;

            /**
             * ontime
             */
            reacts
              .append('rect')
              .attr('x', function (d, i) {
                return xScale(i);
              })
              .attr('y', yScale(0))
              .attr('width', columnWidth)
              .attr('height', 0)
              .attr('fill', colors[0])
              .transition().ease(ease).duration(duration)
              .attr('height', function (d) {
                ontime_height = height - yScale(d.ontime) - margin.bottom;
                return ontime_height;
              })
              .attr('y', function (d) {
                return yScale(d.ontime);
              });

            /**
             * late
             */
            reacts
              .append('rect')
              .attr('x', function (d, i) {
                return xScale(i);
              })
              .attr('y', yScale(ontime_height))
              .attr('width', columnWidth)
              .attr('height', 0)
              .attr('fill', colors[2])
              .transition().ease(ease).duration(duration)
              .attr('height', function (d) {
                late_height = height - yScale(d.late) - margin.bottom;
                return late_height;
              })
              .attr('y', function (d) {
                return yScale(d.late + d.ontime);
              });

            /**
             * missing
             */
            reacts
              .append('rect')
              .attr('x', function (d, i) {
                return xScale(i);
              })
              .attr('y', yScale(late_height))
              .attr('width', columnWidth)
              .attr('height', 0)
              .attr('fill', colors[1])
              .transition().ease(ease).duration(duration)
              .attr('height', function (d) {
                missing_height = height - yScale(d.missing) - margin.bottom;
                return missing_height;
              })
              .attr('y', function (d) {
                return yScale(d.missing + d.ontime + d.late);
              });
          };
        }
      };
    }]);
}());
