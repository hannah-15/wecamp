var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoggedIn, function (req, res) {
    var id = req.params.id;
    Campground.findById(id, function (err, camp) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { camp: camp });
        }
    })
});

router.post("/", middleware.isLoggedIn, function (req, res) {
    //lookup campground using ID
    Campground.findById(req.params.id, function (err, camp) {
        if (err) {
            console.log(err);
            res.redirect("/camps");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    camp.comments.push(comment);
                    camp.save();
                    req.flash("success", "Successfully added comment!");
                    res.redirect('/camps/' + camp._id);
                }
            });
        }
    })
});

//comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            console.log("camp id: " + JSON.stringify(req.params));
            res.render("comments/edit", { camp_id: req.params.id, comment: foundComment });
        }
    });
});

//comment update route
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            console.log("id=" + req.params.id);
            res.redirect("/camps/" + req.params.id);
        }
    });
});

//comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    //findByIdAndDelete
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!");
            res.redirect("/camps/" + req.params.id);
        }
    });
});


module.exports = router;