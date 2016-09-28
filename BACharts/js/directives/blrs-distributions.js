(function () {
  'use strict';

  angular.module('Analytics.directives')
    .directive('blrsDistributions', ['d3', 'tip', function (d3, tip) {
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
            return _.isString(item.name) && _.isNumber(item.possible) && _.isArray(item.scores);
          };

          // create tip
          var tip = d3.tip()
            .attr('class', 'd3-tip distributions-tip')
            .direction('n')
            .offset([-20, 0])
            .html(function (d) {
              var arr = d.scores.sort(function (a, b) {
                return a - b;
              });
              var max = d3.max(arr);
              var min = d3.min(arr);
              var l = d3.quantile(arr, 0.25);
              var m = d3.quantile(arr, 0.5);
              var h = d3.quantile(arr, 0.75);
              return '<span>Assignment: </span><strong>' + d.name + '</strong><br>' +
                '<span>Lower Score: </span><strong>' + min + '</strong><br>' +
                '<span>Highest Score: </span><strong>' + max + '</strong><br>' +
                '<span>25% Scored: </span><strong>' + l + '</strong><br>' +
                '<span>50% Scored: </span><strong>' + m + '</strong><br>' +
                '<span>75% Scored: </span><strong>' + h + '</strong>';
            });

          // create svg
          var svg = d3.select(iElement[0])
            .append('svg')
            .attr('class', 'analytics-distributions')
            .attr('width', '100%')
            .attr('height', d3.select(iElement[0])[0][0].offsetWidth / 2)
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

            //containing element width
            var width = d3.select(iElement[0])[0][0].offsetWidth;

            //var abarH = 14;
            // get settings or set defaults
            var margin = settings.margin || { top: 20, right: 30, bottom: 30, left: 50 };
            var heightRatio = settings.heightRatio || 0.5;
            var height = width * heightRatio;
            var duration = settings.duration || 1500;
            var ease = settings.ease || 'cubic-in-out';
            //var barSpan = settings.barSpan || 10;

            var innerWidth = width - margin.left - margin.right;

            // set the height based on the calculations above
            svg.attr('height', height);

            // prepare y scale
            var maxScore = d3.max(data.values, function (d) {
              return d.possible;
            });
            var maxY = Math.ceil(maxScore / 10) * 10;
            var yScale = d3.scale.linear()
              .domain([0, maxY])
              .range([height - margin.bottom, margin.top]);

            // prepare x scale
            var maxX = data.values.length + 2; // add 2 to have an empty tick on both sides
            var xScale = d3.scale.linear()
              .domain([0, maxX])
              .range([margin.left, width - margin.right]);

            // it's time to calculate single bar width
            var barW = innerWidth / maxX / 2;

            // prepare x axis
            var xAxis = d3.svg.axis()
              .scale(xScale)
              .tickSize(10, 0)
              .ticks(maxX)
              .tickFormat('');

            //prepare y axis
            var yAxis = d3.svg.axis()
              .scale(yScale)
              .orient('left')
              .ticks(6)
              .tickSize(5, 0);

            if (!data.values.length) {
              svg.append("text")
                  .attr("x", width / 2)
                  .attr("y", height / 2)
                  .attr('class', 'text-no-data text-no-data--text-center')
                  .text("No data available.");
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
            svg.append('g').selectAll('line.y')
              .data(yScale.ticks(6))
              .enter().append('line')
              .attr('class', 'y')
              .attr('x1', margin.left)
              .attr('x2', width - margin.right)
              .attr('y1', yScale)
              .attr('y2', yScale);

            // text label for the x axis
            svg.append('text')
              .attr('class', 'label')
              .text('Assignments')
              .attr('x', margin.left + innerWidth / 2)
              .attr('y', function () {
                return height - this.getBBox().height / 2;
              })
              .style('text-anchor', 'middle');

            svg.append('text')
              .attr('class', 'label')
              .text('Points')
              .attr('transform', 'rotate(-90)')
              .attr('x', -height / 2)
              .attr('y', function () {
                return this.getBBox().height;
              })
              .style('text-anchor', 'middle');


            var bars = svg.selectAll('.bar')
              .data(data.values).enter()
              .append('g')
              .attr('class', 'bar')
              .attr('transform', function (d, i) {
                var x = xScale(i + 1);
                var y = 0;
                return 'translate(' + x + ', ' + y + ')';
              })
              .attr('opacity', 0);

            bars.append('line')
              .attr('class', 'whisker')
              .attr('x1', 0)
              .attr('x2', 0)
              .attr('y1', function (d) {
                return isNaN(d.scores) ? 0 : yScale(d3.min(d.scores));
              })
              .attr('y2', function (d) {
                return isNaN(d.scores) ? 0 : yScale(d3.max(d.scores));
              });

            var getQtile = function (d, i) {
              var arr = d.scores.sort(function (a, b) {
                return a - b;
              });
              return d3.quantile(arr, i);
            };

            bars.append('rect')
              .attr('class', 'rect')
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
              .attr('x', -barW / 4)
              .attr('y', function (d) {
                var h = getQtile(d, 0.75);
                return yScale(h);
              })
              .attr('width', barW / 2)
              .attr('height', function (d) {
                var l = getQtile(d, 0.25);
                var h = getQtile(d, 0.75);
                return yScale(l) - yScale(h);

              });

            bars.append('line')
              .attr('class', 'median')
              .attr('x1', -barW / 2)
              .attr('x2', barW / 2)
              .attr('y1', function (d) {
                return yScale(getQtile(d, 0.5));
              })
              .attr('y2', function (d) {
                return yScale(getQtile(d, 0.5));
              });


            bars.transition().ease(ease)
              .delay(function (d, i) {
                return duration - duration / (i + 2);
              })
              .attr('opacity', 1);
          };
        }
      };
    }]);
}());
