(function () {
    'use strict';

    angular.module('Analytics.directives')
        .directive('blrsHbar', ['d3', function (d3) {
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
                        .attr('class', 'hbar')
                        .attr('width', '100%')
                        .attr('height', d3.select(iElement[0])[0][0].offsetWidth / 2);

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

                        // get settings or set defaults
                        var margin = settings.margin || { top: 20, right: 140, bottom: 30, left: 70 };
                        var heightRatio = settings.heightRatio || 0.5;
                        var colors = settings.colors || ['#3598dc', '#ea5d4b',"#efc164", "#4cd797"];

                        var duration = settings.duration || 1000;
                        var ease = settings.ease || 'cubic-in-out';

                        //containing element width
                        var width = d3.select(iElement[0])[0][0].offsetWidth;
                        var height = width * heightRatio;
                        var barHeight = getBarHeight();

                        function getBarHeight() {
                            var grouCount = data.groups.length;
                            var barCount = data.groups.map(function (d) {
                                return d.values.length;
                            }).reduce(function (a, b) {
                                return a + b
                            }, 0);
                            var total = height - margin.bottom - margin.top;
                            // here we add a space (equals to bar height) on top, bottom and between each group
                            var h = total / (barCount + grouCount +1);
                            return h;
                        }

                        // set the height based on the calculations above
                        svg.attr('height', height);

                        var xScale = d3.scale.linear()
                            .domain([0, 100])
                            .range([margin.left, width - margin.right]);

                        var yScale = d3.scale.ordinal()
                            .domain(data.groups.map(function (d) {
                                return d.name;
                            }))
                            .rangePoints([height - margin.bottom, margin.top]);

                        // prepare x axis
                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .ticks(5)
                            .tickFormat(function (d) {
                                return d + '%';
                            });

                        //prepare y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient('left');

                        //draw x axis
                        svg.append('g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(' + 0 + ',' + (height - margin.bottom) + ')')
                            .attr('font-size', '11px')
                            .attr('fill', '#445566')
                            .call(xAxis);

                        // draw yAxis
                        svg.append('g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + margin.left + ', 0)')
                            .attr('font-size', '11px')
                            .attr('fill', '#445566')
                            .call(yAxis)
                            .call(adjustYLabels);

                        svg.selectAll('.axis').selectAll('path')
                            .attr('stroke', 'rgba(0,0,0,0)')
                            .attr('fill', 'none')

                        //draw horisontal grid lines
                        svg.selectAll('line.x')
                            .data(xScale.ticks(5))
                            .enter().append('line')
                            .attr('class', 'x')
                            .attr('x1', xScale)
                            .attr('x2', xScale)
                            .attr('y1', margin.bottom)
                            .attr('y2', height - margin.top)
                            .attr('stroke', "#ebebeb");

                        if ($scope.showTitleDescr) {
                            svg.append('text')
                              .attr('x', width / 2 + 5)
                              .attr('y', 20)
                              .attr('fill', '#115577')
                              .style('text-anchor', 'middle')
                              .style('font-size', '24px')
                              .text(data.name);
                        }

                        function adjustYLabels(selection){
                            var labels = selection.selectAll('.tick');
                            labels.each(function(d, i){
                                var y = getYPos(i) + this.getBBox().height;
                                d3.select(this).attr('transform', 'translate(0 ,' + y + ')');
                            })
                        }

                        function getYPos(i){
                            var y = margin.bottom + barHeight;
                            for(var n = 0; n < i; n++){
                                y += data.groups[n].values.length * barHeight + barHeight;
                            }
                            return y;
                        }

                        data.groups.forEach(function(d, i){
                            var bars = svg.selectAll('rect.group'+i).data(d.values).enter();
                            var startY = getYPos(i);

                            bars.append('rect')
                                .attr('class', 'group'+i)
                                .attr('x', margin.left)
                                .attr('y', function(d, i){
                                    return startY + i * barHeight;
                                })
                                .attr('height', barHeight)
                                .attr('width', '0')
                                .attr('fill', function(d, i){
                                    return colors[i];
                                })
                                .transition().ease(ease).duration(duration)
                                .attr('width', function(d){
                                    return xScale(d) - margin.left;
                                });

                            bars.append('text')
                                .attr('fill', function(d){
                                    return d > 10 ? '#ffffff' : '#445566';
                                })
                                .attr('text-anchor', function(d){
                                    return d > 10 ? 'end' : 'start';
                                })
                                .attr('font-size', barHeight * 0.5 )
                                .attr('transform', function(d, i){
                                    var x = xScale(d);
                                    var y = startY + i * barHeight + barHeight * 0.75;
                                    return 'translate(' + x + ',' + y + ')';
                                })
                                .attr('opacity', '0')
                                .text(function(d){
                                    return d+'%';
                                })
                                .transition().duration(duration * 2)
                                .attr('opacity', '1')


                        });

                        data.labels.forEach(function(d, i) {
                            var legend = svg.append('g')
                                .attr('class', 'legend'+i)
                                .attr('class', 'legend');

                            legend.append('rect')
                                .attr('x', 0)
                                .attr('y', 2)
                                .attr('width', 10)
                                .attr('height', 10)
                                .attr('fill', function(){
                                    return colors[i];
                                });

                            legend.append("foreignObject")
                                .attr("x", 15)
                                .attr("y", 0)
                                .attr('font-size', '12px')
                                .attr("width", margin.right - 20)
                                .append("xhtml:div")
                                .append("p")
                                .text(d);

                        });

                        // position legend
                        var legendX = width - margin.right + 20;
                        var legendY = margin.top + 20;
                        svg.selectAll('.legend div').forEach(function(d, i){
                            d.forEach(function(dd, i){
                                var y = legendY;
                                legendY += dd.scrollHeight;
                                d3.select(dd.parentNode.parentNode).attr('transform', 'translate(' + legendX + ',' + y + ')');
                            });
                        });
                    };
                }
            };
        }]);

}());
