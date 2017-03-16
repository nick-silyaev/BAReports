/**
 * Created on 06.03.17.
 */

'use strict';

angular.module('Analytics.directives')
    .directive('analyticsMultiLine', ['d3', function (d3) {
        return {
            restrict: 'EA',
            scope: {
                data: "=",
                settings: "=",
                label: "@",
                dateGroupType: "="
            },
            link: function ($scope, iElement) {
                if (!$scope.data.labels) {
                    $scope.data.labels = $scope.data.verbs;
                }

                $scope.data.disabled = $scope.data.labels.map(function (d) {
                    return false;
                });

                var tip = d3_tip()
                    .attr('class', 'd3-tip distributions-tip')
                    .direction('n')
                    .offset([-20, 0])
                    .html(function (val) {
                        return '<strong>' + val + '</strong>';
                    });

                var svg = d3.select(iElement[0])
                    .append('svg')
                    .attr('class', 'analytics-line')
                    //.attr('height', d3.select(iElement[0])[0][0].offsetWidth / 2)
                    .attr('width', '100%')
                    .call(tip);

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
                            //.attr("y", d3.select(iElement[0])[0][0].offsetWidth / 4)
                            .attr('y', 20)
                            .attr('class', 'text-no-data text-no-data--text-center')
                            .text("No data available.");
                        return false;
                    }

                    // remove all previous items before render
                    svg.selectAll('*').remove();

                    // get settings or set defaults
                    var margin = settings.margin || { top: 20, right: 30, bottom: 30, left: 50 };
                    var heightRatio = settings.heightRatio || 0.5;
                    var duration = settings.duration || 1000;
                    //var delay = settings.delay || 1000;
                    var ease = settings.ease || 'cubic-in';
                    var labels = data.labels;

                    //colors
                    var c20 = d3.scale.category20();

                    var dateFormat = d3.time.format('%Y-%m-%d');
                    var dFormat;

                    // get time frame
                    var startDate = d3.min(data.values.map(function (d) {
                        return dateFormat.parse(d.date);
                    }));

                    var endDate = d3.max(data.values.map(function (d) {
                        return dateFormat.parse(d.date);
                    }));

                    var maxY = function () {
                        var maxTotal = [];

                        function getMax(scores) {
                            var max = d3.max(data.values.map(function (d) {
                                return d3.max(d[scores].map(function (t, n) {
                                    if (!$scope.data.disabled[n]) {
                                        return t;
                                    }
                                }));
                            }));

                            maxTotal.push(max);
                        }

                        if (data.values && data.values.length > 0) {
                            for (var k = 1; k <= (Object.keys(data.values[0]).length - 1); k++) {
                                getMax('scores' + (k === 1 ? '' : k.toString()));
                            }
                        }

                        return d3.max(maxTotal) * 1.2; // addin 20% to Y axis
                    };

                    //containing element width
                    var width = d3.select(iElement[0])[0][0].offsetWidth;
                    var height = width * heightRatio;
                    //svg height to 1/2 of width

                    var xScale = d3.time.scale()
                        .domain([startDate, endDate])
                        .range([margin.left, width - margin.right]);

                    var yScale = d3.scale.linear()
                        .domain([0, maxY()])
                        .range([height - margin.bottom, margin.top]);

                    // prepare x axis
                    var xAxis;

                    switch ($scope.dateGroupType) {
                        default:
                        case 'Day':
                            dFormat = d3.time.format('%b %d');

                            xAxis = d3.svg.axis()
                                .orient('bottom')

                                .ticks(d3.time.day, 1)
                                .tickSize(5)
                                .tickFormat(dFormat)

                                .scale(xScale);
                            break;
                        case 'Month':
                            dFormat = d3.time.format('%Y %b');

                            xAxis = d3.svg.axis()
                                .orient('bottom')

                                .ticks(d3.time.month, 1)
                                .tickSize(5)
                                .tickFormat(dFormat)

                                .scale(xScale);
                            break;
                        case 'Year':
                            dFormat = d3.time.format('%Y');

                            xAxis = d3.svg.axis()
                                .orient('bottom')

                                .ticks(d3.time.year, 1)
                                .tickSize(5)
                                .tickFormat(dFormat)

                                .scale(xScale);
                            break;

                    }

                    //prepare y axis
                    var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('left')
                        .ticks(5).tickFormat(function (d) {
                            return d;
                        });

                    // add Y axis label
                    svg.append('text')
                        .attr('class', 'scale-y-label')
                        .attr('font-size', "12px")
                        .attr('fill', "#115577")
                        .style("text-anchor", "middle")
                        .attr('font-family', 'Arial, sans-serif')
                        .attr("transform", "translate(15," + (height / 2 - margin.top) + ")rotate(-90)")
                        .text("Number of statements");

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

                    // create areas
                    var draw_lines = function (data, duration) {
                        svg.selectAll(".line").remove();
                        svg.selectAll('line.y').remove();
                        //draw horisontal grid lines
                        svg.selectAll('line.y')
                            .data(yScale.ticks(5))
                            .enter().append('line')
                            .attr('class', 'y')
                            .attr('stroke', '#cccccc')
                            .attr('stroke-width', '1')
                            .attr('x1', margin.left)
                            .attr('x2', width - margin.right)
                            .attr('y1', yScale)
                            .attr('y2', yScale);

                        function drawLine(scN) {
                            for (var i = 0; i < data.labels.length; i++) {
                                if (data.disabled[i]) {
                                    continue;
                                }

                                $scope['cat' + scN + i] = d3.svg.line()
                                    .interpolate('linear')
                                    .x(function (d) {
                                        return xScale(dateFormat.parse(d.date));
                                    })
                                    .y(function (d) {
                                        return yScale(d['scores' + scN][i]);
                                    });
                            }

                            for (var i = 0; i < data.labels.length; i++) {
                                if (data.disabled[i]) {
                                    c20(i);
                                    continue;
                                }

                                $scope['path' + scN + i] = svg.append('path')
                                    .attr('d', $scope['cat' + scN + i](data.values))
                                    .attr('class', 'line')
                                    .attr('fill', 'none')
                                    .attr('stroke', c20(i))
                                    .attr('stroke-width', 3);

                                //animate students path
                                var l = $scope['path' + scN + i].node().getTotalLength();
                                $scope['path' + i].attr('stroke-dasharray', l + ' ' + l)
                                    .attr('stroke-dashoffset', l)
                                    .transition()
                                    .duration(duration)
                                    .ease(ease)
                                    .attr('stroke-dashoffset', 0);

                                svg.selectAll('dot')
                                    .data(data.values)
                                    .enter()
                                    .append('circle')
                                    .attr('r', 5)
                                    .attr('epos', i)
                                    .attr('cx', function (d) {
                                        return xScale(dateFormat.parse(d.date));
                                    })
                                    .attr('cy', function (d) {
                                        return yScale(d['scores' + scN][i]);
                                    })
                                    .on('mouseover', function (d) {
                                        var ePos = parseInt(this.getAttribute('epos'));
                                        var tVar = dFormat(new Date(d.date)) + ' : ' + data.labels[ePos] + ' : ' + d['scores' + scN][ePos];

                                        tip.show(tVar);
                                    })
                                    .on('mouseout', function (d) {
                                        var ePos = parseInt(this.getAttribute('epos'));
                                        var tVar = dFormat(new Date(d.date)) + ' : ' + data.labels[ePos] + ' : ' + d['scores' + scN][ePos];

                                        tip.hide(tVar);
                                    })
                            }
                        }

                        if (data.values && data.values.length > 0) {
                            for (var k = 1; k <= (Object.keys(data.values[0]).length - 1); k++) {
                                drawLine(k === 1 ? '' : k.toString());
                            }
                        }
                    };

                    draw_lines($scope.data, duration);
                    /*
                     *   rotate labels
                     */
                    var labelWidth = 0;
                    var labelAngle = 0;
                    var tickSpace = (width - margin.left - margin.right) / svg.select(".x").selectAll("text")[0].length;

                    svg.select(".x").selectAll("text")
                        .each(function (d, i) {
                            var w = this.getBBox().width;
                            labelWidth = labelWidth < w ? w : labelWidth;
                        });


                    if (labelWidth > tickSpace) {
                        var r = Math.acos(tickSpace / labelWidth);
                        labelAngle = r * (180 / Math.PI);
                        var h = Math.sqrt(Math.pow(labelWidth, 2) - Math.pow(tickSpace, 2));
                        //svg.attr('height', height + h);
                        svg.select(".x").selectAll("text")
                            .attr('fill', "#939598")
                            .attr('font-size', "12px")
                            .attr('font-family', 'Arial, sans-serif')
                            .style("text-anchor", "end")
                            .attr('transform', 'translate( -12 , 0) rotate(' + (-labelAngle) + ')');
                    } else {
                        svg.select(".x").selectAll("text")
                            .attr('fill', "#939598")
                            .style("text-anchor", "middle")
                            .attr('font-family', 'Arial, sans-serif')
                            .attr('transform', 'translate( 0 , 0)');
                    }
                    /*
                     *   end of rotate labels
                     */

                    /*
                     * Legend
                     */

                    var labelX = 0;
                    var labelY = 20;
                    var labelW = width - margin.left - margin.right;

                    var legend = svg
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + 2 + ',' + height - 3 + ')')
                        .attr('class', 'legend-box')
                        .selectAll('g')
                        .data(labels)
                        .enter()
                        .append('g')
                        .attr('class', 'legend')
                        .each(function (d, i) {
                            d3.select(this).append('circle')
                                .attr("cx", 5)
                                .attr("cy", -5)
                                .attr("r", 5)
                                .style('fill', c20(i))
                                .attr('cursor', 'pointer');

                            d3.select(this).append('text')
                                .attr('class', 'legend-item')
                                .style('font-size', 12)
                                .style('fill', '#939598 ')
                                .text(labels[i])
                                .attr('transform', 'translate( 12 , 0)')
                                .attr('cursor', 'pointer');

                            d3.select(this).attr('transform', function () {
                                if (labelX + this.getBBox().width > labelW) {
                                    labelX = 0;
                                    labelY += 20;
                                }
                                var x = labelX;
                                var y = labelY - 5;
                                labelX += this.getBBox().width + 15; // width of the text element + 15px for space
                                return 'translate(' + x + ',' + y + ')';
                            });
                            if ($scope.data.disabled[i]) {
                                d3.select(this).attr('opacity', 0.3);
                            } else {
                                d3.select(this).attr('opacity', 1);
                            }

                        });
                    //.on("click", function (d, i) {
                    //
                    //    $scope.data.disabled[i] = !$scope.data.disabled[i];
                    //    if ($scope.data.disabled[i]) {
                    //        d3.select(this).attr('opacity', 0.4);
                    //    } else {
                    //        d3.select(this).attr('opacity', 1);
                    //    }
                    //    yScale.domain([0, maxY()]);
                    //    //var axis = svg.select('.y.axis');
                    //
                    //    svg.select('.y.axis')
                    //        .call(yAxis);
                    //    draw_lines($scope.data, 400);
                    //});


                    height = svg.node().getBBox().height + svg.select('.legend-box').node().getBBox().height;

                    // set the height based on the calculations above
                    svg.attr('height', height);

                    /*
                     * end of Legend
                     */

                };
            }
        };
    }]);