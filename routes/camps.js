var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Review = require("../models/review");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

router.get("/", function (req, res) {
    //eval(require('locus'));
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ name: regex }, function (err, allCamps) {
            if (err) {
                console.log(err);
            } else {
                res.render("../views/index", { camps: allCamps, page: "camps" });
            }
        });
    } else {
        Campground.find({}, function (err, allCamps) {
            if (err) {
                console.log(err);
            } else {
                res.render("../views/index", { camps: allCamps, page: "camps" });
            }
        });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function (req, res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = { name: name, image: image, description: desc, author: author, location: location, lat: lat, lng: lng };
        // Create a new campground and save to DB
        Campground.create(newCampground, function (err, newlyCreated) {
            if (err) {
                console.log(err);
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/camps");
            }
        });
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("camps/new");
});

//SHOW- show more info about one campground
router.get("/:id", function (req, res) {
    //find the camp by the required ID
    var id = req.params.id;
    Campground.findById(id).populate("comments").populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } }
    }).exec(function (err, foundCamp) {
        if (err) {
            console.log("camp ground:" + foundCamp);
            console.log(err);
        } else {
            res.render("camps/show", { camp: foundCamp });
        }
    });
});

//LIKE camp post route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCamp) {
        if (err) {
            console.log(err);
            return res.redirect("/camps");
        }
        //check if req.user._id already in foundCamp.likes
        var foundUserLike = foundCamp.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            //user already liked, removing like
            foundCamp.likes.pull(req.user._id);
        } else {
            foundCamp.likes.push(req.user);
        }

        foundCamp.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/camps");
            }
            return res.redirect("/camps/" + foundCamp._id);
        });
    });
});

//EDIT camp edit route
router.get("/:id/edit", middleware.checkCampOwnership, function (req, res) {
    //is user logged in?
    Campground.findById(req.params.id, function (err, foundCamp) {
        res.render("camps/edit", { camp: foundCamp });
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampOwnership, function (req, res) {
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.camp.lat = data[0].latitude;
        req.body.camp.lng = data[0].longitude;
        req.body.camp.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.camp, function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully Updated!");
                res.redirect("/camps/" + campground._id);
            }
        });
    });
});

//DELETE camp delete route
router.delete("/:id", middleware.checkCampOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err) {
        if (err) {
            res.redirect("/camps");
        } else {
            // // deletes all comments associated with the campground
            Comment.remove({ "_id": { $in: camp.comments } }, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/camps");
                }
                // deletes all reviews associated with the campground
                Review.remove({ "_id": { $in: camp.reviews } }, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/camps");
                    }
                    //  delete the campground
                    camp.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/camps");
                });
            });
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;