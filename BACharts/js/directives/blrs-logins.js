(function () {
    'use strict';

    angular.module('Analytics.directives')
        .directive('blrsLogins', ['d3', function(d3) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    settings: "=",
                    label: "@"
                },
                link: function(scope, iElement, iAttrs) {
                    var svg = d3.select(iElement[0])
                        .append("svg")
                        .attr("class", "analytics-logins")
                        .attr("width", "100%");

                    // on window resize, re-render d3 canvas
                    window.onresize = function() {
                        return scope.$apply();
                    };
                    scope.$watch(function(){
                            return angular.element(window)[0].innerWidth;
                        }, function(){
                            return scope.render(scope.data, scope.settings);
                        }
                    );

                    //// watch for data changes and re-render
                    //scope.$watch('data', function(newVals, oldVals) {
                    //  return scope.render(newVals);
                    //}, true);

                    // define render function
                    scope.render = function(data, settings){
                        // remove all previous items before render
                        svg.selectAll("*").remove();

                        // get settings or set defaults
                        var margin = settings.margin || {top: 20, right: 30, bottom: 30, left: 50};
                        var heightRatio = settings.heightRatio || 0.5;
                        var colors = settings.colors || ["#3598dc", "#ea5d4b"];
                        var duration = settings.duration || 1000;
                        var delay = settings.delay || 1000;
                        var ease  = settings.ease || "cubic-in-out";

                        //containing element width
                        var width = d3.select(iElement[0])[0][0].offsetWidth;
                        var height = width * heightRatio;
                        //svg height to 1/2 of width

                        // set the height based on the calculations above
                        svg.attr('height', height);

                        var xScale = d3.scale.ordinal()
                            .domain( data.values.map(function(d){return d[0]}))
                            .rangePoints([margin.left, width - margin.right]);

                        var yScale = d3.scale.linear()
                            .domain([0,100])
                            .range([height - margin.bottom , margin.top]);

                        // prepare x axis
                        var xAxis = d3.svg.axis()
                            .scale(xScale);

                        //prepare y axis
                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(5).tickFormat(function(d){return d+ "%"});

                        // students area start animation data
                        var studentsStart = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(height-margin.bottom);

                        //students area end animation data
                        var studentsEnd = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(function(d) { return yScale(d[1])});

                        // teachers area start animation data
                        var teachersStart = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(height-margin.bottom);

                        // teachers area end animation data
                        var teachersEnd = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(function(d) { return yScale(d[2]) });

                        //draw x axis
                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
                            .call(xAxis);
                        // draw yAxis
                        svg.append("g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(" + margin.left + ", 0)")
                            .call(yAxis)

                        // create studeents area
                        svg.append("path")
                            .datum(data.values)
                            .attr("class", "area")
                            .attr("d", studentsStart)
                            .style("fill", colors[0] )
                            .transition().ease(ease).duration(duration).attr("d", studentsEnd);

                        // create teachers area
                        svg.append("path")
                            .datum(data.values)
                            .attr("class", "area")
                            .attr("d", teachersStart)
                            .style("fill", colors[1] )
                            .transition().ease(ease).duration(duration).delay(delay).attr("d", teachersEnd);


                        //draw horisontal grid lines
                        svg.selectAll("line.y")
                            .data(yScale.ticks(5))
                            .enter().append("line")
                            .attr("class", "y")
                            .attr("x1", margin.left)
                            .attr("x2", width-margin.right)
                            .attr("y1", yScale)
                            .attr("y2", yScale);

                    };
                }
            };
        }]);

}());
