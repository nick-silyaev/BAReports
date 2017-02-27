(function () {
  'use strict';

  angular.module('Analytics.directives')
    .directive('llActiveCat', ['d3', function (d3) {
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
            return _.isString(item[0]) && _.isNumber(item[1]) && _.isNumber(item[2])
                && _.isNumber(item[3]) && _.isNumber(item[4]);
          };

          var svg = d3.select(iElement[0])
            .append('svg')
            .attr('class', 'analytics-active-cat')
              .attr('id', 'analytics-active-cat')
            .attr('height', d3.select(iElement[0])[0][0].offsetWidth / 2)
            .attr('width', '100%');

          // on window resize, re-render d3 canvas
          window.onresize = function () {
            return $scope.$apply();
          };

          $scope.$watch(function () {
              return angular.element(window)[0].innerWidth;
            }, function () {
              return $scope.render($scope.data, $scope.settings);
            }
          );

          // define render function
          $scope.render = function (data, settings) {
            if (!data || !data.values || !settings || !data.values.length) {
              svg.append("text")
                  .attr("x", d3.select(iElement[0])[0][0].offsetWidth / 2)
                  .attr("y", d3.select(iElement[0])[0][0].offsetWidth / 4)
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
            var margin = settings.margin || {top: 20, right: 30, bottom: 30, left: 50};
            var heightRatio = settings.heightRatio || 0.5;
            var duration = settings.duration || 1000;
            var delay = settings.delay || 1000;
            var ease = settings.ease || 'cubic-in-out';

            //containing element width
            var width = d3.select(iElement[0])[0][0].offsetWidth;
            var height = width * heightRatio;
            //svg height to 1/2 of width

            // set the height based on the calculations above
            svg.attr('height', height);

            var xScale = d3.scale.ordinal()
                .domain(data.values.map(function (d) {
                  return d[0];
                }))
                .rangePoints([margin.left, width - margin.right]);

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

            // prepare lines coordinates

            for (var i = 1; i < 5; i++) {
              window['cat' + i] = d3.svg.line()
                  .interpolate('monotone')
                  .x(function (d) {
                    return xScale(d[0]);
                  })
                  .y(function (d) {
                    return yScale(d[i]);
                  });
            }

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
            svg.selectAll('line.y')
                .data(yScale.ticks(5))
                .enter().append('line')
                .attr('class', 'y')
                .attr('x1', margin.left)
                .attr('x2', width - margin.right)
                .attr('y1', yScale)
                .attr('y2', yScale);

            // create studeents area
            for (var i = 1; i < 5; i++) {

              window['path' + i] = svg.append('path')
                  .attr('d', window['cat' + i](data.values))
                  .attr('class', 'path cat'+i);

              //animate students path
              var studLength = window['path' + i].node().getTotalLength();
              window['path' + i].attr('stroke-dasharray', studLength + ' ' + studLength)
                  .attr('stroke-dashoffset', studLength)
                  .transition()
                  .duration(duration)
                  .ease(ease)
                  .attr('stroke-dashoffset', 0);
            }

          };
        }
      };
    }]);
}());
