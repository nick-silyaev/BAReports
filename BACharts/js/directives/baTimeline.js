(function () {
    'use strict';

    angular.module('Analytics.directives')
        .directive('baTimeline', ['d3', function(d3) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    label: "@",
                    onClick: "&"
                },
                link: function(scope, iElement, iAttrs) {
                    var svg = d3.select(iElement[0])
                        .append("svg")
                        .attr("width", "100%");
                    console.log(iElement[0]);
                    // on window resize, re-render d3 canvas
                    window.onresize = function() {
                        return scope.$apply();
                    };
                    scope.$watch(function(){
                            return angular.element(window)[0].innerWidth;
                        }, function(){
                            return scope.render(scope.data);
                        }
                    );

                    //// watch for data changes and re-render
                    //scope.$watch('data', function(newVals, oldVals) {
                    //  return scope.render(newVals);
                    //}, true);

                    // define render function
                    scope.render = function(data){
                        // remove all previous items before render
                        svg.selectAll("*").remove();
                        // setup variables
                        var width, height, margin;
                        //containing element width
                        width = d3.select(iElement[0])[0][0].offsetWidth;
                        //svg height to 1/2 of width
                        height = width * 0.50;
                        margin = {top: 20, right: 30, bottom: 30, left: 50};

                        var innerHeight = height - margin.top - margin.bottom;
                        var innerWidth = width - margin.left - margin.bottom;

                        // set the height based on the calculations above
                        svg.attr('height', height);
                        //.append("g")
                        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                        var maxStudents = d3.max(data.values, function(d){ return d[2] });
                        var maxTeachers = d3.max(data.values, function(d){ return d[1] });

                        var xScale = d3.scale.ordinal()
                            .domain( data.values.map(function(d){return d[0]}))
                            .rangePoints([margin.left, width - margin.right]);

                        var yScale = d3.scale.linear()
                            .domain([0,100])
                            .range([height - margin.bottom , margin.top]);

                        var xAxis = d3.svg.axis()
                            .scale(xScale);

                        var yAxis = d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(5).tickFormat(function(d){return d+ "%"});


                        var studentsStart = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(height-margin.bottom);

                        var studentsEnd = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(function(d) { return yScale(d[1])});

                        var teachersStart = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(height-margin.bottom);

                        var teachersEnd = d3.svg.area()
                            .x(function(d, i) { return xScale(d[0]) })
                            .y0(height-margin.bottom)
                            .y1(function(d) { return yScale(d[2]) });

                        var xAxis = svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
                            .call(xAxis);
                        xAxis.selectAll("path, line")
                            .style("display", "none");

                        xAxis.selectAll("text")
                            .style("fill", "#445566")
                            .style("font-size", "12px");

                        var yAxis = svg.append("g")
                            .attr("class", "y axis")
                            .attr("transform", "translate(" + margin.left + ", 0)")
                            .call(yAxis)

                        yAxis.selectAll("path, line")
                            .style("display", "none");

                        yAxis.selectAll("text")
                            .style("fill", "#445566")
                            .style("font-size", "12px");

                        svg.append("path")
                            .datum(data.values)
                            .attr("class", "area")
                            .attr("d", studentsStart)
                            .style("fill", '#3598dc' )
                            .transition().duration(1000).attr("d", studentsEnd);

                        svg.append("path")
                            .datum(data.values)
                            .attr("class", "area")
                            .attr("d", teachersStart)
                            .style("fill", '#ea5d4b' )
                            .on('mouseover', function(d){
                                //mouseover function
                            })
                            .transition().duration(1000).delay(1000).attr("d", teachersEnd);


                        //draw horisontal grid lines
                        svg.selectAll("line.y")
                            .data(yScale.ticks(5))
                            .enter().append("line")
                            .attr("class", "y")
                            .attr("x1", margin.left)
                            .attr("x2", width-margin.right)
                            .attr("y1", yScale)
                            .attr("y2", yScale)
                            //.attr("transform", "translate(0, "+ (-margin.top) +")")
                            .style("stroke", "#ebebeb");

                    };
                }
            };
        }]);

}());
