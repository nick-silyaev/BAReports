/**
 * Created on 30.11.16.
 */

angular.module('Analytics.directives')
    .directive('analyticsMultiBar', ['d3', 'tip', function (d3, tip) {
        return {
            restrict: 'EA',
            scope: {
                data: '=',
                settings: '=',
                label: '@',
                showTitleDescr: '='
            },
            link: function ($scope, iElement) {
                var isPercent = $scope.settings.isPercent;

                var tip = d3.tip()
                    .attr('class', 'd3-tip distributions-tip')
                    .direction('n')
                    .offset([-20, 0])
                    .html(function (val) {
                        return '<strong>' + val + (isPercent ? '%' : '') + '</strong>';
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

                // define render function
                $scope.render = function (data, settings) {
                    // remove all previous items before render
                    svg.selectAll('*').remove();

                    if (!data.values.length) {
                        svg.append('text')
                            .attr('x', d3.select(iElement[0])[0][0].offsetWidth / 2)
                            .attr('y', d3.select(iElement[0])[0][0].offsetWidth / 4)
                            .attr('class', 'text-no-data text-no-data--text-center')
                            .text('No data available.');
                        return;
                    }

                    // get settings or set defaults
                    var margin = settings.margin || { top: 20, right: 50, bottom: 30, left: 50 };
                    var heightRatio = settings.heightRatio || 0.5;
                    var c20 = d3.scale.category20();
                    var colors = settings.colors;

                    var maxInSets = [];

                    data.values.forEach(function (val) {
                        var nValues = val.filter(function (v) {
                            return typeof v === 'number';
                        });

                        maxInSets.push(d3.max(nValues));
                    });

                    var maxValue = d3.max(maxInSets);

                    if (isPercent && maxValue === 100) {
                        maxValue = 99;
                    }

                    var valuesCount = data.values && data.values[0] ? (data.values[0].length - 1) : 0;

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

                    var dMax = (((maxValue + 100) / 100 ^ 0) * 100);

                    if (maxValue < 10) {
                        dMax = 10;
                    }

                    var yScale = d3.scale.linear()
                        .domain([0, dMax])
                        .range([height - margin.bottom, margin.top]);

                    // prepare x axis
                    var xAxis = d3.svg.axis()
                        .scale(xScale);

                    //prepare y axis
                    var ticksN = 10;
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('left')
                        .tickFormat(function (d) {
                            return isPercent ? d + '%' : d;
                        })
                        .ticks(ticksN);

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
                        .data(yScale.ticks(ticksN))
                        .enter().append('line')
                        .attr('class', 'y')
                        .attr('x1', margin.left)
                        .attr('x2', width - margin.right + columnWidth + 2)
                        .attr('y1', yScale)
                        .attr('y2', yScale);

                    //if ($scope.showTitleDescr) {
                    //    svg.append('text')
                    //        .attr('x', width / 2 + 5)
                    //        .attr('y', 20)
                    //        .attr('fill', '#115577')
                    //        .style('text-anchor', 'middle')
                    //        .style('font-size', '24px')
                    //        .text(data.name);
                    //}

                    var reacts = svg.selectAll('rect').data(data.values).enter();

                    function appendRect(i) {
                        var cWidth = columnWidth / valuesCount;

                        if (cWidth === columnWidth) {
                            cWidth *= 0.5;
                        }

                        reacts
                            .append('rect')
                            .on('mouseover', function (d) {
                                tip.show(d[i + 1]);
                            })
                            .on('mouseout', function (d) {
                                tip.hide(d[i + 1]);
                            })
                            .attr('x', function (d) {
                                return xScale(d[0]) + (cWidth * i) + (cWidth * 2);
                            })
                            .attr('y', function () {
                                return yScale(0);
                            })
                            .attr('width', cWidth)
                            .attr('height', 0)
                            .attr('fill', (colors && colors[i]) ? colors[i] : c20(i))
                            .transition().ease(ease).duration(duration)
                            .attr('height', function (d) {
                                return height - yScale(d[i + 1]) - margin.bottom;
                            })
                            .attr('y', function (d) {
                                return yScale(d[i + 1]);
                            });
                    }

                    for (var i = 0; i < valuesCount; i++) {
                        appendRect(i);
                    }

                    svg.append('text')
                        .attr('x', width / 2 + 5)
                        .attr('y', height)
                        .attr('fill', '#115577')
                        .style('text-anchor', 'middle')
                        .text('Likert Response');

                    svg.append('text')
                        .attr('class', 'scale-y-label')
                        .attr('font-size', '12px')
                        .attr('fill', '#115577')
                        .style('text-anchor', 'middle')
                        .attr('font-family', 'Arial, sans-serif')
                        .attr('transform', 'translate(15,' + (height / 2) + ')rotate(-90)')
                        .text('Number of Responses');
                };
            }
        };
    }]);
