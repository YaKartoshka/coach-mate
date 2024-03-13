const express = require("express");
const router = express.Router();
const multer = require('multer');
const admin = require('firebase-admin');
const fs = require('fs');
const { fdb, admin_fauth } = require("../libs/firebase_db");
const storage = admin.storage().bucket('gs://coach-mate-b8795.appspot.com')
const uuid = require('uuid-v4');

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

const metadata = {
    metadata: {
        firebaseStorageDownloadTokens: uuid()
    },
    contentType: 'image/png',
    cacheControl: 'public, max-age=31536000',
};


function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.send('Unauthorized access'); // redirect to sign-in route
    }
    next();
};


router.get('/get', isAuthenticated, async (req, res) => {
    const user_id = req.session.user_id;
    const panel_id = req.session.panel_id;
    try {
        const panel = await fdb.collection('panels').doc(panel_id).get();
        console.log(panel.data().name);
    } catch (e) {
        res.send(e);
    }
});

router.post('/change_password', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const password = req.body.password;
    const user_id = req.session.user_id;
    await admin_fauth.updateUser(user_id, { password: password }).then((user) => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });
});

router.post('/update', isAuthenticated, upload.single('img'), async (req, res) => {
    var r = { r: 0 };
    const { panel_id, user_id } = req.session;
    const { first_name, last_name, phone_number, description } = req.body;
    const image = req.file;
    let random = Math.floor(10000 + Math.random() * 90000);

    if (image != undefined) {
        await storage.upload(image.path, {
            gzip: true,
            metadata: metadata,
            destination: `users/${user_id+random}`
        });
        fs.unlink(image.path, function (err) {
            if (err) console.error(err);
        });
    }

    var data = {
        first_name: first_name,
        last_name: last_name,
        phone_number: phone_number,
        description: description
    }

    if (image != undefined) {
        data.profile_img = `https://firebasestorage.googleapis.com/v0/b/coach-mate-b8795.appspot.com/o/users%2F${user_id+random}?alt=media`
    }

    if (!first_name || !last_name) {
        r['r'] = 2;
        res.send(JSON.stringify(r));
    }

    await fdb.collection('panels').doc(panel_id).collection('users').doc(user_id).update(data).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });

});



module.exports = router;