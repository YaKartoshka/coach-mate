const express = require("express");
const router = express.Router();
const async = require("async");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
var r = {"r":200};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  "google_sign_in",
  new GoogleStrategy(
    {
      clientID: conf.google.clientID,
      clientSecret: conf.google.clientSecret,
      callbackURL: "http://localhost:4000/auth/google_sign_in/index",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

passport.use(
  "google_sign_up",
  new GoogleStrategy(
    {
      clientID: conf.google.clientID,
      clientSecret: conf.google.clientSecret,
      callbackURL: "http://localhost:4000/auth/google_sign_up/index",
      scope: ["email", "profile"],
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);

router.get(
  "/auth/google_sign_in",
  passport.authenticate("google_sign_in", { scope: ["profile"] }, () => {})
);

router.post("/login", (req, res) => {
  const email = req.body.email.toLowerCase().trim();
});


router.post("/auth/sign-up-with-google", (req, res) => {
  var r = {};
  
  
});

router.get(
  "/auth/google_sign_up",
  passport.authenticate("google_sign_up", () => {})
);

router.get(
  "/auth/google_sign_in/index",
  passport.authenticate("google_sign_in", { failureRedirect: "/login" }),
  function (req, res) {
    const google_id = req.user.id;
    res.render('index')
  }
);

router.get(
  "/auth/google_sign_up/index",
  passport.authenticate("google_sign_up", { failureRedirect: "/login" }),
  function (req, res) {
    const google_id = req.user.id;
    
    
  }
);




module.exports = router;
