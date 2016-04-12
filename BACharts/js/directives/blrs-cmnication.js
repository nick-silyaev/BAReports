(function () {
  'use strict';

  angular.module('Analytics.directives')
    .directive('blrsCmnication', ['d3', function (d3) {
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
            .attr('class', 'analytics-cmnication')
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
            // remove all previous items before render
            svg.selectAll('*').remove();

            //get settings or set defaults
            var margin = settings.margin || { top: 50, right: 0, bottom: 50, left: 0 };
            var duration = settings.duration || 1500;
            var ease = settings.ease || 'cubic-in-out';
            var labels = settings.labels || [];
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
            var respond = data.value;
            var notRespond = 100 - respond;
            var pieData = [respond, notRespond];

            // prepare chart attributes
            var radius = Math.min(innerW, innerH) / 2;
            var innerRadius = radius * 0.7;
            var centerX = width / 2;
            var centerY = innerH / 2 + margin.top + titleH;

            // set colors
            var colors = settings.colors || ['#efc164', '#4cd797'];
            var color = d3.scale.ordinal()
              .range(colors);

          if (!data.value) {
              svg.append('svg:text')
                  .attr('class', 'text-no-data text-no-data--text-center')
                  .append('svg:tspan')
                  .attr('x', width / 2)
                  .attr('y', height / 2)
                  .text('No data')
                  .append('svg:tspan')
                  .attr('x', width / 2)
                  .attr('dy', "1.4em" )
                  .text('available');
              return false;
          }

            // draw title
            svg.append('g')
              .attr('class', 'title').append('text')
              .attr('transform', 'translate(' + (centerX) + ',' + (margin.top + titleH / 2) + ')')
              .attr('text-anchor', 'middle')
              .style('font-size', (titleH / 2) + 'px')
              .text(data.key);


            // prepare chart
            var arc = d3.svg.arc()
              .outerRadius(innerRadius)
              .innerRadius(radius);
            var pie = d3.layout.pie()
              .sort(null);
            var slices = svg.append('g')
              .attr('transform', 'translate(' + centerX + ',' + centerY + ')');
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

            // prepare inner area
            var innerArea = svg.append('g')
              .attr({ class: 'donut-inner' });
            // crete dropshadow filter
            var filter = innerArea.append('filter')
              .attr({
                id: 'drop-shadow',
                height: '130%'
              });
            filter.append('feGaussianBlur')
              .attr({
                in: 'SourceAlpha',
                stdDeviation: 5,
                result: 'blur'
              });
            filter.append('feOffset')
              .attr({
                in: 'blur',
                dx: 0,
                dy: 0,
                result: 'offsetBlur'
              });
            var feCompTrsfr = filter.append('feComponentTransfer');
            feCompTrsfr.append('feFuncA')
              .attr({
                type: 'linear',
                slope: 0.3
              });
            var feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode');

            feMerge.append('feMergeNode')
              .attr({ in: 'SourceGraphic' });


            //append center circle
            innerArea.append('circle')
              .attr({
                class: 'circle',
                cx: centerX,
                cy: centerY,
                r: innerRadius,
                fill: 'white'
              })
              .style('filter', 'url(#drop-shadow)');

            //append text
            innerArea.append('text')
              .attr('transform', 'translate(' + centerX + ',' + (centerY - innerRadius / 4) + ')')
              .attr('text-anchor', 'middle')
              .style('font-size', (innerRadius / 5) + 'px')
              .text('respond');

            innerArea.append('text')
              .attr('transform', 'translate(' + centerX + ',' + (centerY + innerRadius / 4.2) + ')')
              .attr('text-anchor', 'middle')
              .style('font-size', (innerRadius / 2) + 'px')
              .text(data.value + '%');

            innerArea.append('text')
              .attr('transform', 'translate(' + centerX + ',' + (centerY + innerRadius / 2) + ')')
              .attr('text-anchor', 'middle')
              .style('font-size', (innerRadius / 5) + 'px')
              .text('of the time');

            var legend = svg
              .append('g')
              .attr('transform', 'translate(' + (centerX - radius) + ',' + (innerH + margin.top + titleH) + ')')
              .selectAll('g')
              .data(labels)
              .enter()
              .append('g')
              .attr('class', 'legend')
              .attr('transform', function (d, i) {
                var height = legendH / 3;
                var x = 0;
                var y = i * height + legendH / 6;
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
              .style('font-size', legendH / 3)
              .text(function (d, i) {
                return labels[i];
              });


            // fade in inner label
            innerArea.style('opacity', 0).transition().delay(duration).duration(300).style('opacity', 1);
            //legend.style('opacity', 0).transition().delay(duration).duration(300).style('opacity', 1);
          };
        }
      };
    }]);

}());
