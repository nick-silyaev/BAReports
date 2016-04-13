
var loginsSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isString(item[0]) && _.isNumber(item[1]) && _.isNumber(item[2]);
    },
    heightRatio:.5, // height to width ration. default is 0.5
    margin: {top: 20, right: 20, bottom: 30, left: 45},
    duration: 1500, // transition duration
    delay: 750, // transition delay between two areas
    ease: "cubic-in-out" // transition ease
};
var loginsData = {
    reportId: "123asd123asd123",
    values: [
        // month label , students percentage, teachers percentage
        ["JAN", _.random(100), _.random(100)],
        ["FEB", _.random(100), _.random(100)],
        ["MAR", _.random(100), _.random(100)],
        ["APR", _.random(100), _.random(100)],
        ["MAY", _.random(100), _.random(100)],
        ["JUN", _.random(100), _.random(100)],
        ["JUL", _.random(100), _.random(100)]
    ]
};


var timelineSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isDate( new Date(item[0]) ) && _.isNumber(item[1]) && _.isNumber(item[2]);
    },
    margin: {top: 10, right: 20, bottom: 10, left: 20}, // drawing margins
    height:58, // timeline chart height
    months: 10 // last x months to display
};
var timelineData = {
    reportId: "123asd123asd123",
    key: "Sara Sanderson",
    values: [
        //date , page views, activities
        ["2015-7-01", _.random(100), _.random(1)],
        ["2015-7-11", _.random(100), _.random(1)],
        ["2015-7-28", _.random(100), _.random(1)],
        ["2015-8-02", _.random(100), _.random(1)],
        ["2015-8-15", _.random(100), _.random(1)],
        ["2015-8-22", _.random(100), _.random(1)],
        ["2015-9-08", _.random(100), _.random(1)],
        ["2015-9-30", _.random(100), _.random(1)],
        ["2015-10-01", _.random(100), _.random(1)],
        ["2015-10-11", _.random(100), _.random(1)],
        ["2015-11-08", _.random(100), _.random(1)],
        ["2015-11-30", _.random(100), _.random(1)],
        ["2015-12-23", _.random(100), _.random(1)],
        ["2016-01-11", _.random(100), _.random(1)],
        ["2016-02-05", _.random(100), _.random(1)],
        ["2016-02-10", _.random(100), _.random(1)],
        ["2016-02-22", _.random(100), _.random(1)]
    ]
};


var cmnicationSettings = {
    filterData: function(value) {
        var $this = this;
        return $this.validationData(value) ? value : false;
    },
    validationData: function(value) {
        return _.isNumber(value);
    },
    heightRatio:1 , // height to width ration. default is 1
    margin: {top: 0, right: 20, bottom: 0, left: 20}, // drawing margins
    colors: ["#efc164", "#4cd797"],
    labels: ["Respond", "Did not respond"],
    duration: 1000, // transition duration
    ease: "cubic-in-out", // transition ease
    titleHeight: 40, // 0 to make responsive
    legendHeight: 40 // 0 to make responsive

};
var cmnicationData = {
    reportId: "123asd123asd123",
    key: "communication",
    value: _.random(100) // random data for demo. set percentage value here
};


var submissionsSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isString(item.name) && _.isNumber(item.score)
            && _.isDate( new Date(item.due))
            && ( _.isDate(new Date(item.submit)) || _.isEmpty(item.submit) );
    },
    heightRatio:.6, // height to width ration. default is 0.5
    margin: {top: 30, right: 20, bottom: 30, left: 30},
    duration: 1000, // transition duration
    ease: "cubic-in-out", // transition ease
    months: 7,
    barTickness: 14 // int for fixed amount or null to scale automatically
};
var submissionsData = {
    reportId: "123asd123asd123",
    key: "submission",
    values: [
        // assignment name, points earned, due date, submission date
        {name:"assignment1", score:12, due:"2015-10-01", submit:"2015-09-25"},
        {name:"assignment1", score:20, due:"2015-10-10", submit:"2015-11-01"},
        {name:"assignment1", score:10, due:"2015-12-01", submit:"2015-12-10"},
        {name: "assignment2",  score:5, due:"2016-01-01", submit:"2016-02-01"},
        {name: "assignment3", score:20, due:"2016-01-01", submit:""},
        {name:"assignment4",  score:35, due:"2016-02-01", submit:"2016-01-20"},
        {name: "assignment3", score:25, due:"2016-02-01", submit:""},
        {name:"assignment4",  score:30, due:"2015-11-01", submit:"2015-09-10"}
    ]

};

var gradesSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(value) {
        return _.isNumber(value);
    },
    heightRatio:.6, // height to width ration. default is 0.5
    margin: {top: 30, right: 20, bottom: 30, left: 30},
    duration: 1500, // transition duration
    ease: "cubic-out", // transition ease
    barSpan: 6 // a gap between two bars
};

var gradesData = {
    reportId: "223asd123asd123",
    key: "grades",
    values: {
        name:"assignment1",  // assignment name
        score: 25, 	//score of the current user,
        scores:[52, 20, 25, 11, 93, 86, 43, 10, 44, 20, 75, 20, 25, 11, 93, 96, 43, 10, 44, 98, 75, 43, 10, 44, 98, 75, 65, 66, 64, 68] //other users' scores for the assignment
        //scores:[2, 2, 1, 9, 8, 4, 1, 4, 2, 7, 2, 2, 11, 9, 9, 4, 10, 4, 9, 7, 4, 1, 4, 9, 7] //other users' scores for the assignment
    }

};


var distributionsSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isString(item.name) && _.isNumber(item.possible) && _.isArray(item.scores);
    },
    heightRatio:.6, // height to width ration. default is 0.5
    margin: {top: 30, right: 20, bottom: 30, left: 50},
    duration: 1000, // transition duration
    ease: "quad-in", // transition ease
    barSpan: 6 // a gap between two bars
};

var distributionsData = {
    reportId: "423asd123asd123",
    values: [
        {
            name: "assignment1",
            possible: 25,
            scores: [23,3,3,20,5,5,15,10,10,5,10,5,25,10]
        },
        {
            name: "assignment2",
            possible: 10,
            scores: [2,0,0,2,5,5,1,10,10,5,10,5,2,10]
        },
        {
            name: "assignment3",
            possible: 20,
            scores: [10,15,3,2,15,15,5,4,5,5,10,5,15,10]
        },
        {
            name: "assignment1",
            possible: 30,
            scores: [23,20,15,20,15,15,15,10,10,13,10,22,25,10]
        },
        {
            name: "assignment2",
            possible: 10,
            scores: [8,10,10,9,8,8,10,10,10,10,10,10,9,10]
        },
        {
            name: "assignment3",
            possible: 25,
            scores: [10,15,22,5,15,15,10,20,22,23,19,22,25,21]
        }
    ]
};


var connectionsSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isString(item.name) && _.isNumber(item.activities) && _.isNumber(item.score);
    },
    heightRatio:.6, // height to width ration. default is 0.5
    margin: {top: 30, right: 20, bottom: 45, left: 55},
    duration: 1000, // transition duration
    ease: "quad-in", // transition ease
    dotSize: 8 // a gap between two bars
};

var connectionsData = {
    reportId: "423asd123asd123",
    values: [
        {
            name: "Sara Sanderson", 		// student's name
            activities: 10,  			// student's number of activities in the course
            score: 25			// student's total score in the course
        },
        {
            name: "Eric Hill",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Perry Mason",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Eric Hill",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Billy Dean",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Han Solo",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "C3PO",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "R2D2",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Jonny",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Yoda",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Chandler Bing",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Nick",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Joe",
            activities: _.random(100),
            score: _.random(100)
        },
        {
            name: "Green",
            activities: _.random(100),
            score: _.random(100)
        }
    ]

};

var blrsActivitySettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isString(item[0]) && _.isNumber(item[1]) && _.isNumber(item[2]);
    },
    heightRatio:.6, // height to width ration. default is 0.5
    margin: {top: 20, right: 40, bottom: 30, left: 45},
    colors: ["#3598dc", "#ea5d4b"],
    duration: 1000, // transition duration
    delay: 500, // transition delay between two areas
    ease: "quad-out" // transition ease
};
var blrsActivityData = {
    reportId: "423asd123asd123",
    values: [
        ["JAN", 250, 300],
        ["FEB", 130, 100],
        ["MAR", 354, 100],
        ["APR", 54, 100],
        ["MAY", 56, 100],
        ["JUN", 589, 200]
    ]
};

var blrsCourseSubmissionsSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isString(item.name) && _.isDate( new Date(item.duedate) )
            && _.isNumber(item.ontime) && _.isNumber(item.late) && _.isNumber(item.missing);
    },
    heightRatio:.6, // height to width ration. default is 0.5
    margin: {top: 20, right: 20, bottom: 30, left: 45},
    colors: ["#3598dc", "#ea5d4b", "#efc064"],
    duration: 1000, // transition duration
    delay: 500, // transition delay between two areas
    ease: "quad-out" // transition ease
};

var blrsCourseSubmissionsData = {
    reportId: '423asd123asd123',
    values: [
        {
            name: "assignment1",
            duedate: "2012-03-22",
            ontime: 76,
            late: 20,
            missing: 4
        },
        {
            name: "assignment2",
            duedate: "2012-04-12",
            ontime: 50,
            late: 50,
            missing: 0
        },
        {
            name: "assignment3",
            duedate: "2012-0-28",
            ontime: 56,
            late: 0,
            missing: 44
        },
        {
            name: "assignment4",
            duedate: "2012-0-28",
            ontime: 50,
            late: 44,
            missing: 6
        },
        {
            name: "assignment5",
            duedate: "2012-0-28",
            ontime: 80,
            late: 20,
            missing: 0
        }
    ]
};

var activeCatSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(item) {
        return _.isString(item[0]) && _.isNumber(item[1]) && _.isNumber(item[2])
            && _.isNumber(item[3]) && _.isNumber(item[4]);
    },
    heightRatio:.5, // height to width ration. default is 0.5
    margin: {top: 20, right: 20, bottom: 30, left: 45},
    duration: 1500, // transition duration
    delay: 750, // transition delay between two areas
    ease: "cubic-in-out" // transition ease
};
var activeCatData = {
    reportId: "123asd123asd123",
    values: [
        // month label , students percentage, teachers percentage
        ["JAN", _.random(100), _.random(100), _.random(100), _.random(100)],
        ["FEB", _.random(100), _.random(100), _.random(100), _.random(100)],
        ["MAR", _.random(100), _.random(100), _.random(100), _.random(100)],
        ["APR", _.random(100), _.random(100), _.random(100), _.random(100)],
        ["MAY", _.random(100), _.random(100), _.random(100), _.random(100)],
        ["JUN", _.random(100), _.random(100), _.random(100), _.random(100)],
        ["JUL", _.random(100), _.random(100), _.random(100), _.random(100)]
    ]
};


var activeCatPieSettings = {
    filterData: function(values) {
        var $this = this;
        _.remove(values, function(item) {
            return !$this.validationData(item);
        });
        return values;
    },
    validationData: function(value) {
        return _.isNumber(value);
    },
    heightRatio:.6 , // height to width ration. default is 1
    margin: {top: 0, right: 20, bottom: 0, left: 20}, // drawing margins
    colors: ["#3598dc", "#ea5d4b", "#efc164", "#4cd797"],
    duration: 1000, // transition duration
    ease: "cubic-in-out", // transition ease
    titleHeight: 0, // 0 to make responsive
    legendHeight: 40 // 0 to make responsive

};
var activeCatPieData = {
    reportId: "123asd123asd123",
    labels: ["Introduction to Oceanography", "Astronomy", "Math", 'Chemistry'],
    values: [ 48, 30, 10, 12] // random data for demo. set percentage value here
};

