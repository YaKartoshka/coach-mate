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

  firebase.fauth.signInWithEmailAndPassword(firebase.fauth.getAuth(), email, password).then(async (userCredential) => {
    const user_id = userCredential.user.uid;

    var documentFound = false;
    const panels = await firebase.fdb.collection('panels').get();
    const panel_promises = panels.docs.map(async (panel) => {
      if (!documentFound) {
        let user = await firebase.fdb.collection('panels').doc(panel.id).collection('users').doc(user_id).get();
        if (user.exists) {
          r['r'] = 1;
          documentFound = true;
          req.session.user_id = user_id;
          req.session.isAuthenticated = true;
          req.session.panel_id = panel.id;
          res.send(JSON.stringify(r));
        }
      }
    });

    await Promise.all(panel_promises);

    if (!documentFound) {
      r['r'] = 3;
      res.send(JSON.stringify(r));
    }

  }, (err) => {
    console.log(err.code);
    if (err.code == 'auth/user-not-found') {
      r['r'] = 2;
    } else if (err.code == 'auth/wrong-password') {
      r['r'] = 0;
    } else if (err.code == 'auth/too-many-requests') {
      r['r'] = 3;
    }
    res.send(JSON.stringify(r));
  });
});

router.post("/sign-up", async (req, res) => {
  const email = req.body.email.toLowerCase().trim();
  const password = req.body.password.toLowerCase().trim();

  firebase.fauth.createUserWithEmailAndPassword(firebase.fauth.getAuth(), email, password).then(async (userCredential) => {
    const user_id = userCredential.user.uid;
    req.session.user_id = user_id;
    req.session.isAuthenticated = true;

    const panels = firebase.fdb.collection('panels');
    const new_panel = await panels.add({
      panel_name: 'Default'
    });
    req.session.panel_id = new_panel.id;

    const new_user = await panels.doc(new_panel.id).collection('users').doc(user_id).set({
      user_id: user_id,
      email: email
    });

    r['r'] = 1;
    res.send(JSON.stringify(r));

  }, (err) => {
    if (err.code == 'auth/email-already-in-use') {
      r['r'] = 4;
    }
    res.send(JSON.stringify(r));
  });
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
