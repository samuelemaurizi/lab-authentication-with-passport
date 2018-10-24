require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStategy = require("passport-local");
const flash = require("connect-flash");
const User = require("./models/user");

// Mongoose Configuration
mongoose.Promise = Promise;
mongoose
  .connect(
    "mongodb://localhost/passport-local",
    { useMongoClient: true }
  )
  .then(() => {
    console.log("Connected to Mongo!");
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Configure the Middleware
app.use(
  session({
    secret: "auth-with-passoprt",
    resave: true,
    saveUninitialized: true
  })
);

// ////////////////////////////// Passport Strategy
passport.serializeUser((user, cb) => {
  cb(null, user._id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

app.use(flash());

passport.use(
  new LocalStategy(
    { passReqToCallback: true },
    (req, username, password, next) => {
      User.findOne({ username }, (err, user) => {
        // If Error
        if (err) {
          return next(err);
        }
        // If not user
        if (!user) {
          return next(null, false, { message: "Incorrect username" });
        }
        // If different password
        if (!bcrypt.compareSync(password, user.password)) {
          return next(null, false, { message: "Incorrect password" });
        }
        return next(null, user);
      });
    }
  )
);

// Initalize passport
app.use(passport.initialize());
app.use(passport.session());

// Express View engine setup
app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// default value for title local
app.locals.title = "Auth with Passport";

const index = require("./routes/index");
const passportRouter = require("./routes/passportRouter");
app.use("/", index);
app.use("/", passportRouter);

module.exports = app;
