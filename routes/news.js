const express = require("express");
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');
const { fdb } = require("../libs/firebase_db");
const storage=admin.storage().bucket('gs://coach-mate-b8795.appspot.com')
var r = { r: 200 };

const multer_storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, conf.temp_path);
    },
    filename(req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const limits = {
    fileSize: 1024 * 1024 * 50
}

const upload = multer({
    storage: multer_storage,
    limits: limits
});



router.post('/create', upload.single('img'), async function (req, res, next) {
    console.log(req.file);
    console.log(req.body)
    var data = {
        title: req.body.title,
        text: req.body.text
    }

     const news = fdb.collection('panels').doc(panel_id)
});



module.exports = router;