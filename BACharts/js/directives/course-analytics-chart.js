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
                        var labelRadius = radius + 10;
                        var visibleAngle = 15;

                        // set colors
                        var c20 = d3.scale.category20();

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
                        path.append('path').attr('class', function(d, i) {
                            return "slice" + " " + labels[i].toLowerCase().replace(/\s+/g, '') //Remove spaces from label name string to make one valid class name
                        })
                            .attr('fill', function (d, i) {
                                return c20(i);
                            })
                            .attr('stroke', '#ffffff')
                            .attr('stroke-width', 1)
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
                            })
                            .on("mouseover", function(d, i){
                                svg.selectAll('.slice')
                                    .transition().duration(300)
                                    .attr('fill-opacity', 0.2);

                                svg.selectAll('.pie-label')
                                    .transition().duration(300)
                                    .attr('fill-opacity', 0);


                                svg.select("." + labels[i].toLowerCase().replace(/\s+/g, ''))
                                    .transition().duration(300)
                                    .attr('fill-opacity', 1);

                                svg.select('.pie-label'+i)
                                    .transition().duration(300)
                                    .attr('fill-opacity', 1)

                            })
                            .on("mouseout", function(d, i){
                                svg.selectAll('.slice')
                                    .transition().duration(200)
                                    .attr('fill-opacity', 1);

                                svg.selectAll('.pie-label')
                                    .transition().duration(200)
                                    .attr('fill-opacity', function(d){
                                        return getAngle(d) < visibleAngle ? 0 : 1;
                                    });

                            });

                        legend.append('rect')
                            .attr('width', 10)
                            .attr('height', 10)
                            .style('fill', function (d, i) {
                                return c20(i);
                            })
                            .attr('cursor', 'pointer');

                        legend.append('text')
                            .attr('x', legendH / 3)
                            .attr('y', legendH / 4)
                            .attr('class', 'legend-item')
                            .style('font-size', legendH / 3)
                            .text(function (d, i) {
                                return labels[i];
                            })
                            .attr('cursor', 'pointer');

                        // add labels

                        var getAngle = function(d){
                            var startAngle = arc.startAngle()(d);
                            var endAngle = arc.endAngle()(d);
                            var degree = (endAngle - startAngle)*180/Math.PI;
                            return degree;
                        }

                        var total = 0;
                        var slice_labels = path.append('text')
                            .attr('class', function(d, i){
                                return 'pie-label pie-label'+i;
                            })
                            .attr('font-family', 'Arial, sans-serif')
                            .attr('font-size', '12px')
                            .attr({
                                'text-anchor': 'middle',
                                'fill': '#333',
                                'font-weight':'bold'
                            })
                            .attr('transform', function(d, i) {
                                if(getAngle(d) < visibleAngle){
                                    var centroid = arc.centroid(d);
                                    var midAngle = Math.atan2(centroid[1], centroid[0]);
                                    //
                                    var labelX  = Math.cos(midAngle) * labelRadius;
                                    //var sign = (x > 0) ? 1 : -1;
                                    //var labelX = x + (5 * sign);
                                    //
                                    var labelY = Math.sin(midAngle) * labelRadius;
                                    return 'translate(' +labelX+ ',' +labelY+ ')';
                                }else{
                                    return 'translate(' + arc.centroid(d) + ')';
                                }

                            })
                            .text(function (d, i) {
                                return pieData[i];
                            });

                        slice_labels.attr('fill-opacity', 0)
                            .transition().delay(duration)
                            .duration(300)
                            .attr('fill-opacity', function(d){
                                return getAngle(d) < visibleAngle ? 0 : 1;
                            });

                        console.log(total);
                    };
                }
            };
        }]);


    angular.module('Analytics.directives')
        .directive('analyticsBar', ['d3', 'tip', function (d3, tip) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    settings: "=",
                    showResults: '=',
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

                    var tip = d3.tip()
                        .attr('class', 'd3-tip distributions-tip')
                        .direction('n')
                        .offset([20, 0])
                        .html(function (val) {
                            return '<strong>' + val + '</strong>';
                        });

                    var svg = d3.select(iElement[0])
                        .append('svg')
                        .attr('class', 'analytics-bar')
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

                    //// watch for data changes and re-render
                    //$scope.$watch('data', function(newVals, oldVals) {
                    //  return scope.render(newVals);
                    //}, true);

                    // define render function
                    $scope.render = function (data, settings, showResults) {
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
                        var duration = settings.duration || 1000;
                        var ease = settings.ease || 'cubic-in-out';

                        //containing element width
                        var width = d3.select(iElement[0])[0][0].offsetWidth;
                        var height = width * heightRatio;
                        var columnWidth = (width - margin.left - margin.right) / (data.values.length) - 5;
                        var labelWidth = 0;
                        var labelAngle = 0;

                        //colors
                        var c20 = d3.scale.category20();

                        var maxY = d3.max(data.values.map(function (d) {
                            return d.value;
                        }));

                        maxY = maxY * 1.2; // add 20% to the Y axis.

                        // set the height based on the calculations above
                        svg.attr('height', height);
                        var xData = data.values.slice();
                        xData.push(0);
                        var xScale = d3.scale.ordinal()
                            .domain(xData.map(function (d, i) {
                                return i;
                            }))
                            .rangePoints([margin.left, width - margin.right]);

                        var yScale = d3.scale.linear()
                            .domain([0, maxY])
                            .range([height - margin.bottom, margin.top]);

                        // prepare x axis
                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .tickFormat(function (d) {
                                if(!maxY){
                                    return "";
                                }
                                return data.values[d] ? data.values[d].label : '';
                            }).tickPadding(15);

                        //prepare y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(5).tickFormat(function (d) {
                                return d;
                            });

                        //draw x axis
                        var gx = svg.append('g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate( 0 ,' + (height - margin.bottom) + ')')
                            .attr('fill', 'none')
                            .call(xAxis);

                        // draw yAxis
                        var gy = svg.append('g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + margin.left + ', 0)')
                            .attr('fill', 'none')
                            .call(yAxis);


                        if(!maxY) {
                            var txtNoData = svg.append("text")
                                .attr("x", width / 2)
                                .attr("y", height / 2)
                                .attr('class', 'text-no-data text-no-data--text-center')
                                .style("text-anchor", "middle")

                            txtNoData.append("tspan")
                                .text('No results found.')
                                .attr("x",  width / 2)
                                .attr("dy", ".6em");
                            txtNoData.append("tspan")
                                .text('Please change the criteria and run the report again.')
                                .attr("x",  width / 2)
                                .attr("dy", "1.2em");
                            return;
                        }


                        gx.selectAll("text")
                            .each(function () {
                                var w = this.getBBox().width;
                                labelWidth = labelWidth < w ? w : labelWidth;
                            });

                        if (labelWidth > columnWidth) {
                            var r = Math.acos(columnWidth / labelWidth);
                            labelAngle = r * (180 / Math.PI);
                            //var h = Math.sqrt( Math.pow(labelWidth, 2) - Math.pow(columnWidth,2));
                            //svg.attr('height', height + h);
                            gx.selectAll("text")
                                .attr('fill', "#115577")
                                .attr('font-size', "12px")
                                .style("text-anchor", "end")
                                .attr('font-family', 'Arial, sans-serif')
                                .attr('transform', 'translate( ' + (columnWidth / 2 - 12 ) + ' , 0) rotate(' + (-labelAngle) + ')');
                        } else {
                            gx.selectAll("text")
                                .attr('fill', "#115577")
                                .style("text-anchor", "middle")
                                .attr('font-family', 'Arial, sans-serif')
                                .attr('transform', 'translate( ' + (columnWidth / 2) + ' , 0)');
                        }

                        gy.selectAll('text')
                            .attr('fill', '#939598');

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
                            .on('mouseover', function (d) {
                                tip.show(d.value);
                            })
                            .on('mouseout', function (d) {
                                tip.hide(d.value);
                            })
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
                            .attr('fill', function (d, i) {
                                return c20(i);
                            })
                            .transition().ease(ease).duration(duration)
                            .attr('height', function (d) {
                                return height - yScale(d.value) - margin.bottom;
                            })
                            .attr('y', function (d) {
                                return yScale(d.value);
                            });

                        reacts.append('text')
                            .attr('fill', '#115577')
                            .style("text-anchor", "middle")
                            .attr('x', function (d, i) {
                                return xScale(i) + (columnWidth / 2) ;
                            })
                            .attr('y', function (d) {
                                return yScale(d.value) - 5;
                            })
                            .text(function (d) {
                                return d.value ? parseFloat(d.value).toFixed(1) : 0;
                            });


                        // adding Y scale label
                        svg.append('text')
                            .attr('class', 'scale-y-label')
                            .attr('font-size', "12px")
                            .attr('fill', "#115577")
                            .style("text-anchor", "middle")
                            .attr('font-family', 'Arial, sans-serif')
                            .attr("transform", "translate(15,"+(height/2)+")rotate(-90)")
                            .text(data.scalYLabel);


                        if (showResults) {
                            reacts.append('text')
                                .attr('fill', '#115577')
                                .attr('x', function (d, i) {
                                    return xScale(i) + (columnWidth / 3);
                                })
                                .attr('y', function () {
                                    return height - 15;
                                })
                                .text(function (d) {
                                    var dV = d.results;
                                    return dV ? parseFloat(dV).toFixed(1) + ' Results' : 'No Results';
                                });

                            svg.append('text')
                                .attr('x', width / 2 + 5)
                                .attr('y', height - 45)
                                .attr('fill', '#115577')
                                .style('text-anchor', 'middle')
                                .text('User(s) / Group(s)');
                        }

                    };
                }
            };
        }]);


    angular.module('Analytics.directives')
        .directive('analyticsLine', ['d3', function (d3) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    settings: "=",
                    label: "@"
                },
                link: function ($scope, iElement) {

                    $scope.data.disabled = $scope.data.labels.map(function(d){
                        return false;
                    });

                    var svg = d3.select(iElement[0])
                        .append('svg')
                        .attr('class', 'analytics-line')
                        //.attr('height', d3.select(iElement[0])[0][0].offsetWidth / 2)
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


                        // remove all previous items before render
                        svg.selectAll('*').remove();


                        // get settings or set defaults
                        var margin = settings.margin || {top: 20, right: 30, bottom: 30, left: 50};
                        var heightRatio = settings.heightRatio || 0.5;
                        var duration = settings.duration || 1000;
                        var delay = settings.delay || 1000;
                        var ease = settings.ease || 'cubic-in';
                        var labels = data.labels;

                        //colors
                        var c20 = d3.scale.category20();

                        var dateFormat = d3.time.format('%Y-%m-%d');

                        // get time frame
                        var startDate = d3.min(data.values.map(function(d){
                            return dateFormat.parse(d.date);
                        }));

                        var endDate = d3.max(data.values.map(function(d){
                            return dateFormat.parse(d.date);
                        }));

                        var maxY = function(){
                            var max = d3.max(data.values.map(function(d, i) {
                                return d3.max(d.scores.map(function(t, n){
                                    if(!$scope.data.disabled[n]){
                                        return t;
                                    }
                                }));
                            }));
                            return max * 1.2 // addin 20% to Y axis
                        }


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
                        var xAxis = d3.svg.axis()
                            .scale(xScale);

                        //prepare y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(5).tickFormat(function (d) {
                                return d;
                            });




                        //draw x axis
                        svg.append('g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
                            .call(xAxis)

                        // draw yAxis
                        svg.append('g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + margin.left + ', 0)')
                            .call(yAxis);

                        // create areas
                        var draw_lines = function(data, duration) {
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

                            for (var i = 0; i < data.labels.length; i++) {
                                if(data.disabled[i])continue;
                                $scope['cat' + i] = d3.svg.line()
                                    .interpolate('linear')
                                    .x(function (d) {
                                        return xScale(dateFormat.parse(d.date));
                                    })
                                    .y(function (d) {
                                        return yScale(d.scores[i]);
                                    });
                            }

                            for (var i = 0; i < data.labels.length; i++) {
                                if(data.disabled[i]){
                                    c20(i);
                                    continue;
                                }
                                $scope['path' + i] = svg.append('path')
                                    .attr('d', $scope['cat' + i](data.values))
                                    .attr('class', 'line cat' + i)
                                    .attr('fill', 'none')
                                    .attr('stroke', c20(i))
                                    .attr('stroke-width', 3);

                                //animate students path
                                var l = $scope['path' + i].node().getTotalLength();
                                $scope['path' + i].attr('stroke-dasharray', l + ' ' + l)
                                    .attr('stroke-dashoffset', l)
                                    .transition()
                                    .duration(duration)
                                    .ease(ease)
                                    .attr('stroke-dashoffset', 0);
                            }


                        }
                        draw_lines($scope.data, duration);
                        /*
                         *   rotate labels
                         */
                        var labelWidth = 0;
                        var labelAngle = 0;
                        var tickSpace = (width - margin.left - margin.right)/svg.select(".x").selectAll("text")[0].length;

                        svg.select(".x").selectAll("text")
                            .each(function(d, i){
                                var w = this.getBBox().width;
                                labelWidth = labelWidth < w ? w : labelWidth;
                            });


                        if(labelWidth > tickSpace){
                            var r = Math.acos(tickSpace/labelWidth);
                            labelAngle = r * (180/Math.PI);
                            var h = Math.sqrt( Math.pow(labelWidth, 2) - Math.pow(tickSpace,2));
                            //svg.attr('height', height + h);
                            svg.select(".x").selectAll("text")
                                .attr('fill', "#939598")
                                .attr('font-size', "12px")
                                .attr('font-family', 'Arial, sans-serif')
                                .style("text-anchor", "end")
                                .attr('transform', 'translate( -12 , 0) rotate('+ (-labelAngle)+')' );
                        }else{
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
                            .attr('transform', 'translate(' + margin.left  + ',' + height + ')')
                            .attr('class', 'legend-box')
                            .selectAll('g')
                            .data(labels)
                            .enter()
                            .append('g')
                            .attr('class', 'legend')
                            .each(function(d, i){
                                d3.select(this).append('circle')
                                    .attr("cx", 0)
                                    .attr("cy", -5)
                                    .attr("r", 5)
                                    .style('fill', c20(i))
                                    .attr('cursor', 'pointer')
                                d3.select(this).append('text')
                                    .attr('class', 'legend-item')
                                    .style('font-size', 12)
                                    .style('fill', '#939598 ')
                                    .text(labels[i])
                                    .attr('transform', 'translate( 10 , 0)')
                                    .attr('cursor', 'pointer')

                                d3.select(this).attr('transform', function () {
                                    if(labelX + this.getBBox().width > labelW){
                                        labelX = 0;
                                        labelY += 20;
                                    }
                                    var x = labelX;
                                    var y = labelY;
                                    labelX += this.getBBox().width + 15; // width of the text element + 15px for space
                                    return 'translate(' + x + ',' + y + ')';
                                });
                                if($scope.data.disabled[i]){
                                    d3.select(this).attr('opacity', 0.3);
                                }else{
                                    d3.select(this).attr('opacity', 1);
                                }

                            })
                            .on("click", function(d, i){

                                $scope.data.disabled[i] = !$scope.data.disabled[i];
                                if($scope.data.disabled[i]){
                                    d3.select(this).attr('opacity', 0.4);
                                }else{
                                    d3.select(this).attr('opacity', 1);
                                }
                                yScale.domain([0, maxY()]);
                                var axis = svg.select('.y.axis');

                                svg.select('.y.axis')
                                    .call(yAxis);
                                draw_lines($scope.data, 400);
                            });


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

    angular.module('Analytics.directives')
        .directive('analyticsTable', [ function () {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@"
                },
                templateUrl: "templates/table-report.html",
                link: function ($scope, element) {
                    $scope.labels = $scope.data.labels;
                    $scope.labels.unshift("Date");

                    $scope.rows = [];
                    for(var i = 0; i < $scope.data.values.length; i++ ){
                        var row = $scope.data.values[i].scores
                        row.unshift($scope.data.values[i].date);
                        $scope.rows.push(row);
                    }


                }
            };
        }]);

}());
