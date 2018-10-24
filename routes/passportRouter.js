const express = require("express");
const router = express.Router();
// User model
const User = require("../models/user");
// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const ensureLogin = require("connect-ensure-login");
const passport = require("passport");

// ////////////////////////////////////////
// //////////////////// GET & POST SIGNUP
router.get("/signup", (req, res, next) => {
  res.render("passport/signup");
});

router.post("/signup", (req, res, next) => {
  let { username, password } = req.body;

  // Check if the fields are empty
  if (username === "" || password === "") {
    res.render("passport/signup", {
      message: "Indicate username and password"
    });
    return;
  }

  // Check if the username already exist
  User.findOne({ username })
    .then(user => {
      if (user !== null) {
        res.render("passport/signup", {
          message: "The username already exists"
        });
        return;
      }

      // Bcrypt the password
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      // Create user
      const newUser = new User({
        username,
        password: hashPass
      });

      newUser.save(err => {
        if (err) {
          res.render("passport/signup", { message: "Something went wrong" });
        } else {
          res.redirect("/login");
        }
      });
    })
    .catch(err => {
      next(err);
    });
});

// ////////////////////////////////////////
// //////////////////// GET & POST LOGIN
router.get("/login", (req, res, next) => {
  res.render("passport/login", { message: req.flash("error") });
});

// Start session with Passport
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

// ////////////////////////////////////////
// //////////////////// GET PRIVATE PAGE
router.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("passport/private", { user: req.user });
});

// ////////////////////////////////////////
// //////////////////// GET LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

// ////////////////////////////////////////
// //////////////////// EXPORTS
module.exports = router;
