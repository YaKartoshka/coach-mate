
const admin = require('firebase-admin')
const serviceAccount = require("../pfiles/serviceAccessKey.json");

const firebaseConfig = {
  apiKey: "AIzaSyDtQoOTC_PnboLsSCz77tP5H0Cf8cUxvcY",
  authDomain: "coach-mate-b8795.firebaseapp.com",
  projectId: "coach-mate-b8795",
  storageBucket: "coach-mate-b8795.appspot.com",
  messagingSenderId: "1093856290910",
  appId: "1:1093856290910:web:5dcd16baaa6817b5b9accf"
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const fdb = admin.firestore()


module.exports = fdb;