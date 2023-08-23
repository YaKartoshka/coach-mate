const express = require("express");
const router = express.Router();
const async = require("async");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const firebase = require("../libs/firebase_db");

var r = { "r": 200 };

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

/* ---- Basic Auth ----    */

router.post("/sign-in", async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const password = req.body.password.toLowerCase().trim();

  firebase.fauth.signInWithEmailAndPassword(firebase.fauth.getAuth(), email, password).then((userCredential) => {
      const user = userCredential.user.uid
      console.log(user)
      req.session.isAuthenticated = true;
      r['r'] = 1; 
      res.send(JSON.stringify(r))
 
  }, (err)=>{
    console.log(err.code)
    if(err.code == 'auth/user-not-found'){
      r['r'] = 2; // user not found
    } else if(err.code == 'auth/wrong-password'){
      r['r'] = 0; // wrond password
    }
    res.send(JSON.stringify(r))
  })


 
});



/* ---- Google Auth ----    */

router.get(
  "/google_sign_in",
  passport.authenticate("google_sign_in", { scope: ["profile"] }, () => { })
);

router.get(
  "/google_sign_in/index",
  passport.authenticate("google_sign_in", { failureRedirect: "/login" }),
  function (req, res) {
    const google_id = req.user.id;
    res.render('index')
  }
);

/* ---- End Google Auth ----    */

module.exports = router;
