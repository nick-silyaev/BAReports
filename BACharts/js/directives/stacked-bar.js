(function () {
    'use strict';

    angular.module('Analytics.directives')
        .directive('stackedBar', ['d3', function (d3) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    settings: "=",
                    label: "@"
                },
                link: function ($scope, iElement) {

                    // create tip
                    var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .direction('n')
                        .offset([-20, 0])
                        .html(function (d) {
                            return d.value.map(function(t){
                                return '<span>'+ t.label +': </span><strong>' + t.value + '</strong><br>';
                            }).join('');
                        });

                    var svg = d3.select(iElement[0])
                        .append('svg')
                        .attr('class', 'stacked-bar')
                        .attr('width', '100%')
                        .attr('height', d3.select(iElement[0])[0][0].offsetWidth / 2)
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
                        if (!data || !data.values || !data.values.length) {
                            svg.append("text")
                                .attr("x", d3.select(iElement[0])[0][0].offsetWidth / 2)
                                .attr("y", d3.select(iElement[0])[0][0].offsetWidth / 3)
                                .attr('class', 'text-no-data text-no-data--text-center')
                                .text("No data available.");
                            return false;
                        }

                        // remove all previous items before render
                        svg.selectAll('*').remove();

                        // get settings or set defaults
                        var margin = settings.margin || { top: 20, right: 50, bottom: 80, left: 50 };
                        var heightRatio = settings.heightRatio || 0.6;
                        var colors = d3.scale.category20();
                        var duration = settings.duration || 500;
                        //var ease = settings.ease || 'cubic-in-out';

                        //containing element width
                        var width = d3.select(iElement[0])[0][0].offsetWidth;
                        var height = width * heightRatio;
                        var innerWidth = width - margin.left - margin.right;
                        var innerHeight = height - margin.top - margin.bottom;
                        var columnWidth = innerWidth / ( data.values.length);

                        var maxY = d3.max(data.values.map(function (d) {
                            return d3.sum(d.value.map(function(t){
                                return t.value;
                            }));
                        }));

                        var dateFormat = d3.time.format("%m-%d-%Y");
                        var labelWidth = 0;
                        var labelAngle = 0;


                        // set the height based on the calculations above
                        svg.attr('height', height);

                        // x axis - parse timestamp to date if label is a timestamp
                        var xData = data.values.map(function (d) {
                            var date = new Date(d.label);
                            if(date.getTime() > 0 ){
                                return dateFormat(date);
                            }
                            return d.label;
                        });
                        // add fake value to the data to extend xAxis
                        xData.push('');

                        var xScale = d3.scale.ordinal()
                            .domain(xData).rangePoints([margin.left, width - margin.right]);

                        var yScale = d3.scale.linear()
                            .domain([0, maxY])
                            .range([height - margin.bottom, margin.top]);

                        // prepare x axis
                        var xAxis = d3.svg.axis()
                            .scale(xScale);

                        //prepare y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient('left');

                        //draw x axis
                        var gx = svg.append('g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate( 0 ,' + (height - margin.bottom) + ')')
                            .attr('fill', 'none')
                            .attr('stroke', '#445566')
                            .attr('stroke-width', '1')
                            .call(xAxis);


                        // rotate x labels depending on column width
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
                                .attr('stroke', 'none')
                                .attr('font-size', "12px")
                                .style("text-anchor", "end")
                                .attr('font-family', 'Arial, sans-serif')
                                .attr('transform', 'translate( ' + (columnWidth / 2 - 12 ) + ' , 0) rotate(' + (-labelAngle) + ')');
                        } else {
                            gx.selectAll("text")
                                .attr('fill', "#115577")
                                .attr('stroke', 'none')
                                .style("text-anchor", "middle")
                                .attr('font-family', 'Arial, sans-serif')
                                .attr('transform', 'translate( ' + (columnWidth / 2) + ' , 0)');
                        }

                        // draw yAxis
                        var dy = svg.append('g')
                            .attr('class', 'y axis')
                            .attr('fill', 'none')
                            .attr('stroke', '#445566')
                            .attr('stroke-width', '1')
                            .attr('transform', 'translate(' + margin.left + ', 0)')
                            .call(yAxis);

                        dy.selectAll("text")
                            .attr('fill', "#115577")
                            .attr('stroke', 'none')
                            .attr('font-size', "12px")
                            .attr('font-family', 'Arial, sans-serif');

                        //draw horisontal grid lines
                        svg.selectAll('line.y')
                            .data(yScale.ticks(5))
                            .enter().append('line')
                            .attr('class', 'y')
                            .attr('stroke', '#ebebeb')
                            .attr('x1', margin.left)
                            .attr('x2', (width - margin.right))
                            .attr('y1', yScale)
                            .attr('y2', yScale);

                        var verbs = [];

                        data.values.forEach(function(d){
                            d.value.forEach(function(t){
                                if(verbs.indexOf(t.label) < 0 ){
                                    verbs.push(t.label);
                                }
                            })
                        });

                        var layers = [];

                        verbs.forEach(function(verb, i) {
                            layers.push([]);
                            data.values.forEach(function(d, n) {
                                var f = false;
                                d.value.forEach(function(t){
                                    if(t.label == verb) {
                                        layers[i].push({x: n, y: t.value});
                                        f = true;
                                    }
                                });
                                if(!f){
                                    layers[i].push({x: n, y: 0});
                                }
                            });
                        });

                        console.log(layers);
                        var stack = d3.layout.stack();

                        var groups = svg.selectAll(".layer")
                            .data(stack(layers))
                            .enter()
                            .append("g")
                            .attr("class", "layer")
                            .style("fill", function(d, i) {
                                return colors(i);
                            });

                        var bars = groups.selectAll(".bar")
                            .data(function(d) { return d; })
                            .enter().append("a")
                            .attr("class", "bar")
                            .on('mouseover', function (d, i) {
                                tip.show(data.values[i]);
                            })
                            .on('mouseout', function (git ) {
                                tip.hide();
                            });


                        bars.append("rect")
                            .attr("x", function(d){
                                return margin.left + 5  + d.x * columnWidth ;
                            })
                            .attr("width", columnWidth - 10 )
                            .attr("y", yScale(0))
                            .attr("height", 0)
                            .transition()
                            .duration(duration)
                            .delay(function (d, i){return i * 30})
                            .attr("y", function(d){
                                return yScale(d.y0 + d.y);
                            } )
                            .attr("height", function(d){
                                return d.y > 0 ? innerHeight / maxY * d.y : 0;
                            });


                    };
                }
            };
        }]);
}());
