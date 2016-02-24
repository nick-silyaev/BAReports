(function () {
    'use strict';

    angular.module('Analytics.directives')
        .directive('blrsTimeline', ['d3', 'tip', function(d3, tip) {
            return {
                restrict: 'EA',
                scope: {
                    data: "=",
                    settings: "=",
                    label: "@"
                },
                link: function(scope, iElement, iAttrs) {

                    var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-20, 0])
                        .html(function(d) {
                            return "<strong>Date: </strong><span>" +  d[0]+ "</span><br><strong>Page Views: </strong><span>" + d[1]+ "</span><br><strong>Activities: </strong><span>" + d[2]+ "</span>";
                        });

                    var svg = d3.select(iElement[0])
                        .append("svg")
                        .attr("class", "analytics-timeline")
                        .attr("width", "100%")
                        .call(tip);

                    // on window resize, re-render d3 canvas
                    window.onresize = function() {
                        return scope.$apply();
                    };
                    scope.$watch(function(){
                            return angular.element(window)[0].innerWidth;
                        }, function(){
                            return scope.render(scope.data, scope.settings );
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
                        // setup variables

                        //get settings or set defaults
                        var margin = settings.margin || {top: 10, right: 20, bottom: 10, left: 20};
                        var height = settings.height || 50;
                        var months = settings.months || 6;

                        //containing element width
                        var width = d3.select(iElement[0])[0][0].offsetWidth;
                        var innerHeight = height - margin.top - margin.bottom;
                        // set the height based on the calculations above
                        svg.attr('height', height);

                        //get dates
                        var endDate = new Date();
                        // get last six months
                        var startDate = d3.time.month.offset(endDate, -months);


                        var xScale = d3.time.scale()
                            .domain([startDate, endDate])
                            .range([margin.left, width - margin.right]);

                        var xAxis = d3.svg.axis()
                            .scale(xScale)
                            .ticks(d3.time.months)
                            .tickSize(0,0)
                            .tickFormat(d3.time.format(""));

                        svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0,"+height/2+")")
                            .call(xAxis);

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

                        var dateFormat = d3.time.format("%Y-%m-%d");

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
                            .on('mouseover',  function(d) {tip.show(d)})
                            .on('mouseout',  function(d) {tip.hide(d)})
                            .attr("class", function(d){return d[2] > 0 ? "circle actions" : "circle"})
                            .attr("cx", function(d){return xScale(dateFormat.parse(d[0]))})
                            .attr("cy", height/2)
                            .attr("r", 1)
                            .transition().duration(1500)
                                .ease('elastic').delay( function(d, i){return Math.random()*500})
                                .attr("r", function(d){return d[1]*valueScale/2})
                                .attr("tooltip-append-to-body", true)
                                .attr("tooltip", function(d){return d[0];});


                    };
                }
            };
        }]);

}());
