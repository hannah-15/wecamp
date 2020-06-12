if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  Campground = require("./models/campground.js"),
  Comment = require("./models/comment.js"),
  moment = require("moment"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  User = require("./models/user.js"),
  seedDB = require("./seeds.js");

app.locals.moment = moment;

var campRoutes = require("./routes/camps.js"),
  reviewRoutes = require("./routes/reviews"),
  commentRoutes = require("./routes/comments.js"),
  indexRoutes = require("./routes/index.js");

app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(flash());
//seedDB();

//db
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
  .then(() => console.log("DB Connected"));

mongoose.connection.on("error", err => {
  console.log(`DB connection error: ${err.message}`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

//passport configuration
app.use(require("express-session")({
  secret: "The most beautiful trails are in Halstadt!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/camps", campRoutes);
app.use("/camps/:id/comments", commentRoutes);
app.use("/camps/:id/reviews", reviewRoutes);

const port = process.env.port || 3000;
app.listen(port, process.env.IP, function () {
  console.log("The Yelp Server is started!");
});