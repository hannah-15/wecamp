var mongoose = require("mongoose");
var Campground = require("./models/campground.js");
var Comment = require("./models/comment.js");

var data = [
    {
        name: "Cloud's Rest",
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "dfeghjkylyu oflkdhgekiiklp abshdfhgulwqcnhfl"
    },
    {
        name: "Desert Mesa",
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "dfeghjkylyu oflkdhgekiiklp abshdfhgulwqcnhfl"
    },
    {
        name: "Canyon Floor",
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "dfeghjkylyu oflkdhgekiiklp abshdfhgulwqcnhfl"
    }
];

function seedDB() {
    //remove all camps
    Campground.remove({}, function (err) {
        // if (err) {
        //     console.log(err);
        // }
        // console.log("removed campgrounds!");
        // //add a few camps
        // data.forEach(function (seed) {
        //     Campground.create(seed, function (err, camp) {
        //         if (err) {
        //             console.log(err);
        //         } else {
        //             console.log("added a new camp");
        //             //add a few comments
        //             Comment.create(
        //                 {
        //                     text: "This place is great without internet. ",
        //                     author: "Batman"
        //                 }, function (err, comment) {
        //                     if (err) {
        //                         console.log(err);
        //                     } else {
        //                         camp.comments.push(comment);
        //                         camp.save();
        //                         console.log("Created new comment");
        //                     }
        //                 });
        //         }
        //     });
        // });
    });
}

module.exports = seedDB;
