(function () {
  'use strict';

  angular.module('Analytics.directives')
    .directive('blrsSubmissions', ['d3', 'tip', function (d3, tip) {
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
            return _.isString(item.name) && _.isNumber(item.score)
                && _.isDate( new Date(item.due))
                && ( _.isDate(new Date(item.submit)) || _.isEmpty(item.submit) );
          };

          // create tip
          var tip = d3.tip()
            .attr('class', 'd3-tip submissions-tip')
            .direction('n')
            .offset([-20, 0])
            .html(function (d) {
              return '<span>Assignment: </span><strong>' + d.name + '</strong><br><span>Due Date: </span><strong>' + d.due + '</strong><br><span>Submission Date: </span><strong>' + d.submit + '</strong><br><span>Points Earned: </span><strong>' + d.score + '</strong>';
            });

          // create svg
          var svg = d3.select(iElement[0])
            .append('svg')
            .attr('class', 'analytics-submissions')
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

            // get settings or set defaults
            var margin = settings.margin || { top: 20, right: 30, bottom: 30, left: 50 };
            var heightRatio = settings.heightRatio || 0.5;
            var height = width * heightRatio;
            var duration = settings.duration || 1500;
            var ease = settings.ease || 'cubic-in-out';
            var months = settings.months || 7;
            var barH = settings.barTickness || Math.round(height / 12); // bar height
            var dateFormat = d3.time.format('%Y-%m-%d');

            // set the height based on the calculations above
            svg.attr('height', height);

            //get dates
            var endDate = new Date();
            // get last X months
            var startDate = d3.time.month.offset(endDate, -months);
            // prepate x scale
            var xScale = d3.time.scale()
              .domain([startDate, endDate])
              .range([margin.left, width - margin.right]);


            // prepare y scale
            var maxScore = d3.max(data.values, function (d) {
              return d.score;
            });
            var maxY = Math.ceil(maxScore / 10) * 10;
            var yScale = d3.scale.linear()
              .domain([0, maxY])
              .range([height - margin.bottom, margin.top]);

            // prepare x axis
            var xAxis = d3.svg.axis()
              .scale(xScale)
              .ticks(d3.time.months)
              .tickSize(10, 0)
              .tickFormat(d3.time.format('%b'));

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
            svg.selectAll('line.y')
              .data(yScale.ticks(5))
              .enter().append('line')
              .attr('class', 'y')
              .attr('x1', margin.left)
              .attr('x2', width - margin.right)
              .attr('y1', yScale)
              .attr('y2', yScale);


            var bars = svg.selectAll('.bar')
              .data(data.values).enter()
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
              })
              .attr('class', function (d) {
                if (d.submit === '') {
                  return 'bar missing';
                }
                var submit = xScale(dateFormat.parse(d.submit));
                var due = xScale(dateFormat.parse(d.due));
                return submit > due ? 'bar late' : 'bar ontime';
              })
              .attr('transform', function (d) {
                var x = xScale(dateFormat.parse(d.due));
                var y = yScale(d.score);
                return 'translate(' + x + ',' + y + ')';
              })
              .attr('opacity', 0);

            //dtraw rects in bars
            bars.append('rect').data(data.values)
              .attr('class', 'rect')
              .attr({
                x: -barH / 2,
                y: -barH / 2,
                rx: barH / 2,
                width: barH,
                height: barH
              });

            // draw circles(checkmark background) in bars
            bars.append('circle').data(data.values)
              .attr('class', 'circle')
              .attr({
                cx: 0,
                cy: 0,
                r: (barH - 2) / 2
              });
            //add AwesomeFont chec kmark
            bars.append('text')
              .attr('class', 'check')
              .attr('font-family', 'FontAwesome')
              .attr('font-size', (barH - 4) + 'px')
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'central')
              .attr('transform', 'translate( 0, 0)')
              .text('\uf00c');

            // fade in bars
            bars.transition().duration(300)
              .attr('opacity', 1);

            // anumate bars width
            bars.data(data.values)
              .select('rect')
              .transition().ease(ease)
              .delay(function () {
                return Math.random() * duration;
              })
              .duration(duration)
              .attr('width', function (d) {
                if (d.submit === '') {
                  return xScale(endDate) - xScale(dateFormat.parse(d.due)) + barH; // no submitted date. extend bar to the left margin
                }
                return Math.abs(xScale(dateFormat.parse(d.submit)) - xScale(dateFormat.parse(d.due))) + barH;
              })
              .attr('x', function (d) {
                var submit = xScale(dateFormat.parse(d.submit));
                var due = xScale(dateFormat.parse(d.due));
                return (submit < due && d.submit !== '') ? submit - due - barH / 2 : -barH / 2;
              });


            // add legend
            var legend = svg.append('g')
              .attr('class', 'legend cubmissions-legend');

            var series = legend.selectAll('g')
              .data(['on time', 'late', 'missing'])
              .enter()
              .append('g')
              .attr('class', 'series');

            series.append('circle')
              .attr('cx', 0)
              .attr('cy', 0)
              .attr('r', barH / 4)
              .attr('class', function (d) {
                return d.replace(/\s/g, '');
              });

            series.append('text')
              .attr('x', barH / 2)
              .attr('dominant-baseline', 'central')
              .text(function (d) {
                return d;
              });

            var xPos = 0;
            series.attr('transform', function () {
              var x = xPos;
              xPos += this.getBBox().width + 10;
              return 'translate( ' + x + ', 0)';
            });

            legend.attr('transform', function () {
              var w = this.getBBox().width;
              return 'translate(' + (width - margin.right - w) + ',' + barH + ')';
            });
          };
        }
      };
    }]);
}());
