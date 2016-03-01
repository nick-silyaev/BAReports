
var loginsSettings = {
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
        ["JAN", getRandom(100), getRandom(100)],
        ["FEB", getRandom(100), getRandom(100)],
        ["MAR", getRandom(100), getRandom(100)],
        ["APR", getRandom(100), getRandom(100)],
        ["MAY", getRandom(100), getRandom(100)],
        ["JUN", getRandom(100), getRandom(100)],
        ["JUL", getRandom(100), getRandom(100)]
    ]
};


var timelineSettings = {
    margin: {top: 10, right: 20, bottom: 10, left: 20}, // drawing margins
    height:58, // timeline chart height
    months: 10 // last x months to display
};
var timelineData = {
    reportId: "123asd123asd123",
    key: "Sara Sanderson",
    values: [
        //date , page views, activities
        ["2015-7-01", getRandom(100), getRandom(1)],
        ["2015-7-11", getRandom(100), getRandom(1)],
        ["2015-7-28", getRandom(100), getRandom(1)],
        ["2015-8-02", getRandom(100), getRandom(1)],
        ["2015-8-15", getRandom(100), getRandom(1)],
        ["2015-8-22", getRandom(100), getRandom(1)],
        ["2015-9-08", getRandom(100), getRandom(1)],
        ["2015-9-30", getRandom(100), getRandom(1)],
        ["2015-10-01", getRandom(100), getRandom(1)],
        ["2015-10-11", getRandom(100), getRandom(1)],
        ["2015-11-08", getRandom(100), getRandom(1)],
        ["2015-11-30", getRandom(100), getRandom(1)],
        ["2015-12-23", getRandom(100), getRandom(1)],
        ["2016-01-11", getRandom(100), getRandom(1)],
        ["2016-02-05", getRandom(100), getRandom(1)],
        ["2016-02-10", getRandom(100), getRandom(1)],
        ["2016-02-22", getRandom(100), getRandom(1)]
    ]
};


var cmnicationSettings = {
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
    value: getRandom(100) // random data for demo. set percentage value here
};


var submissionsSettings = {
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
        { name:"assignment1", score:12, due:"2015-10-01", submit:"2015-09-25"},
        { name:"assignment1", score:20, due:"2015-10-10", submit:"2015-11-01"},
        { name:"assignment1", score:10, due:"2015-12-01", submit:"2015-12-10"},
        {name: "assignment2",  score:5, due:"2016-01-01", submit:"2016-02-01"},
        {name: "assignment3", score:20, due:"2016-01-01", submit:""},
        {name:"assignment4",  score:35, due:"2016-02-01", submit:"2016-01-20"},
        {name: "assignment3", score:25, due:"2016-02-01", submit:""},
        {name:"assignment4",  score:30, due:"2015-11-01", submit:"2015-09-10"}
    ]

};

var gradesSettings = {
    heightRatio:.6, // height to width ration. default is 0.5
    margin: {top: 30, right: 20, bottom: 30, left: 30},
    duration: 1500, // transition duration
    ease: "cubic-out", // transition ease
    barSpan: 6 // a gap between two bars
}

var gradesData = {
    reportId: "223asd123asd123",
    key: "grades",
    values: {
        name:"assignment1",  // assignment name
        score: 25, 	//score of the current user,
        scores:[52, 20, 25, 11, 93, 86, 43, 10, 44, 20, 75, 20, 25, 11, 93, 96, 43, 10, 44, 98, 75, 43, 10, 44, 98, 75, 65, 66, 64, 68] //other users' scores for the assignment
        //scores:[2, 2, 1, 9, 8, 4, 1, 4, 2, 7, 2, 2, 11, 9, 9, 4, 10, 4, 9, 7, 4, 1, 4, 9, 7] //other users' scores for the assignment
    }

}




function getRandom(multiplier){
    return Math.round(Math.random() * multiplier);
}