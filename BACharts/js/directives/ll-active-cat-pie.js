(function () {
  'use strict';

  angular.module('Analytics.directives')
      .directive('llActiveCatPie', ['d3', function (d3) {
        return {
          restrict: 'EA',
          scope: {
            data: "=",
            settings: "=",
            label: "@"
          },
          link: function ($scope, iElement) {
            var svg = d3.select(iElement[0])
                .append('svg')
                .attr('class', 'analytics-active-cat-pie')
                .attr('width', '100%');

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

            // define render function
            $scope.render = function (data, settings) {
                /**
                 * Valid data
                 */
                if (settings.filterData) {
                    data.values = settings.filterData(data.values);
                }

              // remove all previous items before render
              svg.selectAll('*').remove();

              //get settings or set defaults
              var margin = settings.margin || { top: 50, right: 0, bottom: 50, left: 0 };
              var duration = settings.duration || 1500;
              var ease = settings.ease || 'cubic-in-out';
              var labels = data.labels || [];
              var hRatio = settings.heightRatio || 1;

              //containing element width
              var width = d3.select(iElement[0])[0][0].offsetWidth;
              //svg height to 1/2 of width
              var height = width * hRatio;
              var legendH = settings.legendHeight || height / 8;
              var titleH = settings.titleHeight || height / 8;
              var innerH = height - margin.top - margin.bottom - legendH - titleH;
              var innerW = width - margin.left - margin.right;
              // set the height based on the calculations above
              svg.attr('height', height);

              // prepare data
              var pieData = data.values;

              // prepare chart attributes
              var radius = Math.min(innerW, innerH) / 2;
              var innerRadius = radius * 0.6;
              var centerX = width / 2;
              var centerY = innerH / 2 + margin.top + titleH;

              // set colors
              var colors = settings.colors || ['#efc164', '#4cd797'];
              var color = d3.scale.ordinal()
                  .range(colors);

                if (!data.values.length) {
                    /*svg.append("text")
                        .attr("x", width / 2)
                        .attr("y", height / 2)
                        .attr('class', 'text-no-data')
                        .text("No data available.");*/
                    svg.append('svg:text')
                        .attr('class', 'text-no-data')
                        .append('svg:tspan')
                        .attr('x', 0)
                        .attr('y', height / 2)
                        .text('No data')
                        .append('svg:tspan')
                        .attr('x', 0)
                        .attr('dy', "1.4em" )
                        .text('available');
                }

              // prepare chart
              var arc = d3.svg.arc()
                  .outerRadius(innerRadius)
                  .innerRadius(radius);
              var pie = d3.layout.pie()
                  .sort(null);
              var slices = svg.append('g')
                  .attr('transform', 'translate(' +  (margin.left+radius) + ',' + centerY + ')');
              var path = slices.selectAll('path')
                  .data(pie(pieData))
                  .enter().append('g');

              //draw chart
              path.append('path').attr('class', 'path')
                  .attr('fill', function (d, i) {
                    return color(i);
                  })
                  .transition()
                  .duration(duration).ease(ease)
                  .attrTween('d', tweenPie);

              // animate chart
              function tweenPie(finish) {
                var start = {
                  startAngle: 0,
                  endAngle: 0
                };
                var i = d3.interpolate(start, finish);
                return function (d) {
                  return arc(i(d));
                };
              }

              var legend = svg
                  .append('g')
                  .attr('transform', 'translate(' + ( radius*2.2 + margin.left)  + ',' + (centerY-legendH) + ')')
                  .selectAll('g')
                  .data(labels)
                  .enter()
                  .append('g')
                  .attr('class', 'legend')
                  .attr('transform', function (d, i) {
                    var height = legendH / 2;
                    var x = 0;
                    var y = i * height + legendH/4;
                    return 'translate(' + x + ',' + y + ')';
                  });

              legend.append('rect')
                  .attr('width', legendH / 4)
                  .attr('height', legendH / 4)
                  .style('fill', function (d, i) {
                    return colors[i];
                  });

              legend.append('text')
                  .attr('x', legendH / 3)
                  .attr('y', legendH / 4)
                  .attr('class', 'legend-item')
                  .style('font-size', legendH / 3)
                  .text(function (d, i) {
                    return labels[i];
                  });

              // add labels
              var slice_labels = path.append('text')
                  .attr({
                    'class': 'pie-labels',
                    'text-anchor': 'middle',
                    'transform': function (d) {
                      return 'translate(' + (arc.centroid(d)) + ')';
                    }
                  })
                  .text(function (d, i) {
                    return pieData[i];
                  });
              slice_labels.style('opacity', 0).transition().delay(duration).duration(300).style('opacity', 1);

            };
          }
        };
      }]);

}());
