(function () {
    'use strict';

    angular.module('Analytics.directives')
        .directive('analyticsPie', ['d3', 'tip', function (d3, tip) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    settings: "=",
                    label: "@"
                },
                link: function ($scope, iElement) {
                    $scope.filterData = function (values) {
                        var $this = this;
                        _.remove(values, function (item) {
                            return !$this.validationData(item.value);
                        });
                        return values;
                    };
                    $scope.validationData = function (value) {
                        return _.isNumber(value);
                    };

                    var svg = d3.select(iElement[0])
                        .append('svg')
                        .attr('class', 'analytics-pie')
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
                        if ($scope.filterData) {
                            data.values = $scope.filterData(data.values);
                        }

                        // remove all previous items before render
                        svg.selectAll('*').remove();

                        //get settings or set defaults
                        var margin = settings.margin || { top: 50, right: 0, bottom: 50, left: 0 };
                        var duration = settings.duration || 1500;
                        var ease = settings.ease || 'cubic-in-out';
                        var labels = data.values.map(function(d){ return d.label });
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
                        var pieData = data.values.map(function(d){ return d.value });

                        // prepare chart attributes
                        var radius = Math.min(innerW, innerH) / 2;
                        var innerRadius = 0;
                        var centerX = width / 2;
                        var centerY = innerH / 2 + margin.top + titleH;

                        // set colors
                        var colors = settings.colors || ['#efc164', '#4cd797'];
                        var color = d3.scale.ordinal()
                            .range(colors);

                        if (!data.values.length) {
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
                            .attr('transform', 'translate(' +  centerX + ',' + centerY + ')');
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
                            .attr('transform', 'translate(' + margin.left  + ',' + margin.top + ')')
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
                            .attr('width', 10)
                            .attr('height', 10)
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


    angular.module('Analytics.directives')
        .directive('analyticsBar', ['d3', function (d3) {
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
                        return _.isString(item.label) && _.isNumber(item.value);
                    };

                    var svg = d3.select(iElement[0])
                        .append('svg')
                        .attr('class', 'analytics-logins')
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

                    //// watch for data changes and re-render
                    //$scope.$watch('data', function(newVals, oldVals) {
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
                        var margin = settings.margin || { top: 20, right: 50, bottom: 50, left: 50 };
                        var heightRatio = settings.heightRatio || 0.5;
                        var colors = settings.colors || ['#3598dc', '#ea5d4b'];
                        var duration = settings.duration || 1000;
                        var ease = settings.ease || 'cubic-in-out';

                        //containing element width
                        var width = d3.select(iElement[0])[0][0].offsetWidth;
                        var height = width * heightRatio;
                        var columnWidth = (width - margin.left - margin.right) / (data.values.length) - 5;
                        var labelWidth = 0;
                        var labelAngle = 0;

                        var maxY = d3.max(data.values.map(function(d){
                            return d.value;
                        }));

                        // set the height based on the calculations above
                        svg.attr('height', height);

                        var xScale = d3.scale.ordinal()
                            .domain(data.values.map(function (d, i) {
                                return i;
                            }))
                            .rangePoints([margin.left, width - margin.right - columnWidth]);

                        var yScale = d3.scale.linear()
                            .domain([0, maxY])
                            .range([height - margin.bottom, margin.top]);

                        // prepare x axis
                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .tickFormat(function(d){
                                return data.values[d].label;
                            });

                        //prepare y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(5).tickFormat(function (d) {
                                return d;
                            });

                        if (!data.values.length) {
                            svg.append("text")
                                .attr("x", width / 2)
                                .attr("y", height / 2)
                                .attr('class', 'text-no-data text-no-data--text-center')
                                .text("No data available.");
                        }

                        //draw x axis
                        var gx = svg.append('g')
                            .attr('class', 'x axis brls-course-submission-x-axis')
                            .attr('transform', 'translate( 0 ,' + (height - margin.bottom) + ')')
                            .attr('fill', 'none')
                            .call(xAxis);

                        // draw yAxis
                        var gy = svg.append('g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + margin.left + ', 0)')
                            .attr('fill', 'none')
                            .call(yAxis);

                        gx.selectAll("text")
                            .each(function(d, i){
                                var w = this.getBBox().width;
                                labelWidth = labelWidth < w ? w : labelWidth;
                            });

                        if(labelWidth > columnWidth){
                            var r = Math.acos(columnWidth/labelWidth);
                            labelAngle = r * (180/Math.PI);
                            var h = Math.sqrt( Math.pow(labelWidth, 2) - Math.pow(columnWidth,2));
                            //svg.attr('height', height + h);
                            gx.selectAll("text")
                                .attr('fill', "#939598")
                                .attr('font-size', "12px")
                                .attr('font-family', 'source_sans_prosemibold')
                                .style("text-anchor", "end")
                                .attr('transform', 'translate( '+(columnWidth / 2 - 12 )+' , 0) rotate('+ (-labelAngle)+')' );
                        }else{
                            gx.selectAll("text")
                                .attr('fill', "#939598")
                                .style("text-anchor", "middle")
                                .attr('transform', 'translate( ' + (columnWidth/2) + ' , 0)')
                        }


                        gy.selectAll("text")
                            .attr('fill', "#939598");

                        //draw horisontal grid lines
                        svg.selectAll('line.y')
                            .data(yScale.ticks(5))
                            .enter().append('line')
                            .attr('class', 'y')
                            .attr('x1', margin.left)
                            .attr('x2', (width - margin.right))
                            .attr('y1', yScale)
                            .attr('y2', yScale);


                        var reacts = svg.selectAll('rect')
                            .data(data.values).enter()
                            .append('g')
                            //.on('mouseover', function (d) {
                            //    tip.show(d);
                            //})
                            //.on('mouseout', function (d) {
                            //    tip.hide(d);
                            //})
                            .attr('tooltip-append-to-body', true)
                            .attr('tooltip', function (d) {
                                return d;
                            });

                        reacts
                            .append('rect')
                            .attr('x', function (d, i) {
                                return xScale(i);
                            })
                            .attr('y', yScale(0))
                            .attr('width', columnWidth)
                            .attr('height', 0)
                            .attr('fill', function(d, i){
                                return colors[i];
                            })
                            .transition().ease(ease).duration(duration)
                            .attr('height', function (d) {
                                return height - yScale(d.value) - margin.bottom;
                            })
                            .attr('y', function (d) {
                                return yScale(d.value);
                            });

                    };
                }
            };
        }]);
}());
