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
                        .attr("class", "analytics-timeline")
                        .attr("width", "100%");

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
                        var width, height, margin, innerHeight;
                        //containing element width
                        width = d3.select(iElement[0])[0][0].offsetWidth;
                        //svg height to 1/10 of width
                        height = 50;
                        margin = {top: 10, right: 20, bottom: 10, left: 20};
                        innerHeight = height - margin.top - margin.bottom
                        // set the height based on the calculations above
                        svg.attr('height', height);

                        var timeFrame = 6;
                        //now
                        var endDate = new Date();
                        // get last six months
                        var startDate = d3.time.month.offset(endDate, -timeFrame);

                        var xScale = d3.time.scale()
                            .domain([startDate, endDate])
                            .range([margin.left, width - margin.right]);

                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .ticks(d3.time.months)
                            .tickSize(0,0)
                            .tickFormat(d3.time.format(""));

                        //var tip = d3.tip()
                        //    .attr('class', 'timeline-tip')
                        //    .offset([-10, 0])
                        //    .html(function(d) {
                        //        return "<strong>Date: </strong><span>" + d[0] + "</span><br><strong>Page Views: </strong><span>" + d[1] + "</span><strong>Activities: </strong><span>" + d[2] + "</span>";
                        //    })


                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0,"+height/2+")")
                            .call(xAxis)
                            .selectAll("path, line")
                            .style("stroke","#d4d5d6");

                        // draw grid big vertical lines
                        svg.append("g")
                            .attr("class", "big-ticks")
                            .selectAll("line.x")
                            .data(xScale.ticks(d3.time.days, 16))
                            .enter().append("line")
                            .attr("class", "x")
                            .attr("x1", function(d){return xScale(d)})
                            .attr("x2", function(d){return xScale(d)})
                            .attr("y1", height/2-10)
                            .attr("y2", height/2+10);

                        // draw grid small vertical lines
                        svg.append("g")
                            .attr("class", "small-ticks")
                            .selectAll("line.x")
                            .data(xScale.ticks(d3.time.days, 4))
                            .enter().append("line")
                            .attr("class", "x")
                            .attr("x1", function(d){return xScale(d)})
                            .attr("x2", function(d){return xScale(d)})
                            .attr("y1", height/2-5)
                            .attr("y2", height/2+5);

                        var maxValue = d3.max(data.values, function(d){return d[1]} );
                        //var minValue = d3.min(data.values, function(d){return d[1]} );

                        var valueScale = innerHeight/maxValue;

                        var dateFormat = d3.time.format("%Y-%m-%dT%H:%M:%S");

                        svg.append("g")
                            .attr("class", "centers")
                            .selectAll("circle")
                            .data(data.values)
                            .enter().append("circle")
                            .attr("class", function(d){
                                if(d[2] > 0) {return "circle actions"}
                                else {return "circle"}
                            })
                            .attr("cx", function(d){
                                return xScale(dateFormat.parse(d[0]))
                            })
                            .attr("cy", height/2)
                            .attr("r", 2);

                        svg.append("g")
                            .attr("class", "circles")
                            .selectAll("circle")
                            .data(data.values)
                            .enter().append("circle")
                            .attr("class", function(d){
                                if(d[2] > 0) {return "circle actions"}
                                else {return "circle"}
                            })
                            .attr("cx", function(d){
                                return xScale(dateFormat.parse(d[0]))
                            })
                            .attr("cy", height/2)
                            .attr("r", 1)
                            .transition()
                            .duration(1500)
                            .ease('elastic').delay( function(d, i){return Math.random()*500})
                            .attr("r", function(d){return d[1]*valueScale/2})
                            .on("mouseover", function(){})
                            //.on("mousemove", function(){
                            //    return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                            //})
                            .on("mouseout", function(){});





                        //var xScale = d3.scale.ordinal()
                        //    .domain( data.values.map(function(d){return d[0]}))
                        //    .rangePoints([margin.left, width - margin.right]);
                        //
                        //var yScale = d3.scale.linear()
                        //    .domain([0,100])
                        //    .range([height - margin.bottom , margin.top]);
                        //
                        //var xAxis = d3.svg.axis()
                        //    .scale(xScale);
                        //
                        //var yAxis = d3.svg.axis()
                        //    .scale(yScale)
                        //    .orient("left")
                        //    .ticks(5).tickFormat(function(d){return d+ "%"});
                        //
                        //
                        //var studentsStart = d3.svg.area()
                        //    .x(function(d, i) { return xScale(d[0]) })
                        //    .y0(height-margin.bottom)
                        //    .y1(height-margin.bottom);
                        //
                        //var studentsEnd = d3.svg.area()
                        //    .x(function(d, i) { return xScale(d[0]) })
                        //    .y0(height-margin.bottom)
                        //    .y1(function(d) { return yScale(d[1])});
                        //
                        //var teachersStart = d3.svg.area()
                        //    .x(function(d, i) { return xScale(d[0]) })
                        //    .y0(height-margin.bottom)
                        //    .y1(height-margin.bottom);
                        //
                        //var teachersEnd = d3.svg.area()
                        //    .x(function(d, i) { return xScale(d[0]) })
                        //    .y0(height-margin.bottom)
                        //    .y1(function(d) { return yScale(d[2]) });
                        //
                        //var xAxis = svg.append("g")
                        //    .attr("class", "x axis")
                        //    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
                        //    .call(xAxis);
                        //xAxis.selectAll("path, line")
                        //    .style("display", "none");
                        //
                        //xAxis.selectAll("text")
                        //    .style("fill", "#445566")
                        //    .style("font-size", "12px");
                        //
                        //var yAxis = svg.append("g")
                        //    .attr("class", "y axis")
                        //    .attr("transform", "translate(" + margin.left + ", 0)")
                        //    .call(yAxis)
                        //
                        //yAxis.selectAll("path, line")
                        //    .style("display", "none");
                        //
                        //yAxis.selectAll("text")
                        //    .style("fill", "#445566")
                        //    .style("font-size", "12px");
                        //
                        //svg.append("path")
                        //    .datum(data.values)
                        //    .attr("class", "area")
                        //    .attr("d", studentsStart)
                        //    .style("fill", '#3598dc' )
                        //    .transition().duration(1000).attr("d", studentsEnd);
                        //
                        //svg.append("path")
                        //    .datum(data.values)
                        //    .attr("class", "area")
                        //    .attr("d", teachersStart)
                        //    .style("fill", '#ea5d4b' )
                        //    .on('mouseover', function(d){
                        //        //mouseover function
                        //    })
                        //    .transition().duration(1000).delay(1000).attr("d", teachersEnd);
                        //
                        //
                        ////draw horisontal grid lines
                        //svg.selectAll("line.y")
                        //    .data(yScale.ticks(5))
                        //    .enter().append("line")
                        //    .attr("class", "y")
                        //    .attr("x1", margin.left)
                        //    .attr("x2", width-margin.right)
                        //    .attr("y1", yScale)
                        //    .attr("y2", yScale)
                        //    //.attr("transform", "translate(0, "+ (-margin.top) +")")
                        //    .style("stroke", "#ebebeb");

                    };
                }
            };
        }]);

}());
