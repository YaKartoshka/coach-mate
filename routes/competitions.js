const express = require('express');
const router = express.Router();
const multer = require('multer');
const { fdb } = require("../libs/firebase_db");
const fs = require('fs');

const admin = require('firebase-admin');
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

router.get('/create', isAuthenticated, (req, res) => {
    res.render('competition_create', { role: req.session.role });
});

router.post('/create', isAuthenticated, upload.single('event_img'), async (req, res) => {
    var r = { r: 0 };
    console.log(req.body)
    const event_img = req.file;
    const { event_name, organizer_name, description, city, address, normal_start_date, normal_end_date, late_start_date, late_end_date, event_start, event_time, phone_number, email, entries } = req.body;

    if (!event_name || !organizer_name || !description || !city || !address || !normal_start_date || !normal_end_date || !event_start || !phone_number || !email) {
        return res.send(JSON.stringify(r));
    }
  
    await fdb.collection('competitions').add({
        event_name: event_name,
        organizer_name: organizer_name,
        description: description,
        city: city,
        address: address,
        normal_registration: {
            start_date: normal_start_date,
            end_date: normal_end_date
        },
        late_registration: {
            start_date: late_start_date,
            end_date: late_end_date
        },
        event_start: event_start,
        event_time: event_time,
        phone_number: phone_number,
        email: email,
        entries: entries,
        event_img: event_img
    }).then(async(comp) => {
        await storage.upload(event_img.path, {
            gzip: true,
            metadata: metadata,
            destination: `events/${comp.id}`
        });
        var event_img_url = `https://firebasestorage.googleapis.com/v0/b/coach-mate-b8795.appspot.com/o/events%2F${comp.id}?alt=media`

        await fdb.collection('competitions').doc(comp.id).update({ event_img: event_img_url }).then(() => {
            r['r'] = 1;
            res.send(r);
            fs.unlink(event_img.path, () => { });
        });
      
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
        fs.unlink(event_img.path, () => { });
    })
});

router.post('/get-all', async (req, res) => {
    var data = [];
    const competitions = await fdb.collection('competitions').get();
    competitions.docs.forEach((comp) => {
        data.push({ ...comp.data(), comp_id: comp.id });
    });
    res.send(data);
});

router.get('/:id', async (req, res) => {
    const comp_id = req.params.id;

    await fdb.collection('competitions').doc(comp_id).get().then((comp) => {
        if (!comp.exists) {
            return res.render('error');
        }
        res.render('competition', { comp_data: { ...comp.data(), comp_id: comp.id }, role: req.session.role })
    });
});






module.exports = router;