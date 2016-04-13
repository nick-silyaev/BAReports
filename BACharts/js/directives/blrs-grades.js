(function () {
  'use strict';

  angular.module('Analytics.directives')
    .directive('blrsGrades', ['d3', 'tip', function (d3, tip) {
      return {
        restrict: 'EA',
        scope: {
          data: "=",
          settings: "=",
          label: "@"
        },
        link: function ($scope, iElement) {

          // create tip
          var tip = d3.tip()
            .attr('class', 'd3-tip grades-tip')
            .direction('n')
            .offset([-20, 0])
            .html(function (d) {
              return '<span>Assignment: </span><strong>' + d.name + '</strong><br><span>Due Date: </span><strong>' + d.due + '</strong><br><span>Submission Date: </span><strong>' + d.submit + '</strong><br><span>Points Earned: </span><strong>' + d.score + '</strong>';
            });

          // create svg
          var svg = d3.select(iElement[0])
            .append('svg')
            .attr('class', 'analytics-grades')
            .attr('width', '100%')
            .call(tip);

          // on window resize, re-render d3 canvas
          window.onresize = function () {
            return $scope.$apply();
          };

          $scope.settings.resize = function () {
            $scope.render($scope.data, $scope.settings);
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
            if (settings.filterData) {
              data.values.scores = settings.filterData(data.values.scores);
            }

            // remove all previous items before render
            svg.selectAll('*').remove();

            //containing element width
            var width = d3.select(iElement[0])[0][0].offsetWidth;

            //var abarH = 14;
            // get settings or set defaults
            var margin = settings.margin || { top: 20, right: 30, bottom: 30, left: 50 };
            var heightRatio = settings.heightRatio || 0.5;
            var height = width * heightRatio;
            var duration = settings.duration || 1500;
            var ease = settings.ease || 'cubic-in-out';
            var barSpan = settings.barSpan || 10;

            // set the height based on the calculations above
            svg.attr('height', height);

            // prepare x scale
            var maxScore = d3.max(data.values.scores, function (d) {
              return d;
            });
            var maxX = Math.ceil(maxScore / 10) * 10;
            var tickSpan = maxX / 10; // one tick value

            var xScale = d3.scale.linear()
              .domain([0, maxX])
              .range([margin.left, width - margin.right]);

            if (!data.values.scores.length) {
              svg.append("text")
                  .attr("x", width / 2)
                  .attr("y", height / 2)
                  .attr('class', 'text-no-data text-no-data--text-center')
                  .text("No data available.");
              return false;
            }

            // prepare data
            function prepareData(d) {
              var arr = [];
              d.forEach(function (item) {
                var index = Math.floor(item / tickSpan);
                if (typeof arr[index] === 'undefined') {
                  arr[index] = [];
                }
                arr[index].push(item);
              });
              return arr;
            }

            var grades = prepareData(data.values.scores); // group scores

            var maxGroup = d3.max(grades, function (d) {
              if (typeof d !== 'undefined') {
                return d.length;
              }
            }); // max students in on one group

            // it's time to calculate bar width
            var barW = xScale(tickSpan) - xScale(0) - barSpan;

            // prepare y scale
            var maxY = Math.ceil(maxGroup / 10) * 10;
            var yScale = d3.scale.linear()
              .domain([0, maxY])
              .range([height - margin.bottom, margin.top]);

            // prepare x axis
            var xAxis = d3.svg.axis()
              .scale(xScale)
              .ticks(10)
              .tickSize(10, 0);

            //prepare y axis
            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .ticks(5)
              .tickSize(5, 0);

            //draw x axis
            svg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
              .call(xAxis);

            // draw yAxis
            svg.append('g')
              .attr('class', 'y axis')
              .attr('transform', 'translate(' + margin.left + ', 0)')
              .call(yAxis);

            //draw horisontal grid lines
            svg.append('g').selectAll('line.y')
              .data(yScale.ticks(5))
              .enter().append('line')
              .attr('class', 'y')
              .attr('x1', margin.left)
              .attr('x2', width - margin.right)
              .attr('y1', yScale)
              .attr('y2', yScale);


            var bars = svg.append('g').selectAll('rect')
              .data(grades).enter();

            bars.append('rect')
              .attr('class', function (d) {
                //check if user score belongs to the group
                if (typeof d !== 'undefined') {
                  var avg = d3.mean(d);
                  var group = Math.floor(avg / tickSpan);
                  var usr = Math.floor(data.values.score / tickSpan);
                  return group === usr ? 'rect user' : 'rect';
                }
                return 'rect';
              }).attr({
                x: function (d, i) {
                  return xScale(i * tickSpan) + barSpan / 2;
                },
                y: function () {
                  return yScale(0);
                },
                width: barW,
                height: 0
              }).transition().duration(duration).ease(ease)
              .attr({
                y: function (d) {
                  return (typeof d !== 'undefined') ? yScale(0) - (yScale(0) - yScale(d.length)) : 0;
                },
                height: function (d) {
                  return (typeof d !== 'undefined') ? yScale(0) - yScale(d.length) : 0;
                }
              });


            // define median line coordinates
            var median = d3.svg.line()
              .interpolate('monotone')
              .x(function (d, i) {
                return xScale(i * tickSpan) + barSpan / 2;
              })
              .y(function (d) {
                return (typeof d !== 'undefined') ? yScale(0) - (yScale(0) - yScale(d.length / 2)) : yScale(0);
              });

            var path = svg.append('path')
              .attr('d', median(grades))
              .attr('class', 'line median')
              .attr('transform', 'translate(' + (barW) / 2 + ', 0)');

            var totalLength = path.node().getTotalLength();

            path.attr('stroke-dasharray', totalLength + ' ' + totalLength)
              .attr('stroke-dashoffset', totalLength)
              .transition()
              .duration(duration).delay(duration)
              .ease(ease)
              .attr('stroke-dashoffset', 0);
          };
        }
      };
    }]);
}());
