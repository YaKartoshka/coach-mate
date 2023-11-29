const express = require('express');
const validator = require('validator');
const router = express.Router();
const { fdb, admin_fauth, fauth } = require("../libs/firebase_db");

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('login'); // redirect to sign-in route
    }
    next();
};

router.post('/create', async (req, res) => {
    var r = { r: 0 };
    const fieldsToCheck = ['email', 'first_name', 'last_name', 'panel_id'];
    const errors = fieldsToCheck.filter(field => !req.body[field] || req.body[field].trim() === '');

    if (errors.length > 0) {
        r['r'] = 3; // invalid or empty fields
        res.send(JSON.stringify(r));
        return;
    }

    if (!validator.isEmail(req.body.email)) {
        r['r'] = 2; // invalid email
        res.send(JSON.stringify(r));
        return;
    }

    const email = req.body.email;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const role = 'student';
    const panel_id = req.body.panel_id;
    console.log(req.body)
    const find_request = await fdb.collection('panels').doc(panel_id).collection('requests').where('email', '==', email).get();
    if (!find_request.empty) {
        r['r'] = 5; // Such request already exists
        res.send(JSON.stringify(r));
        return;
    }

    admin_fauth.getUserByEmail(email).then((userRecord) => {
        r['r'] = 4; // user already exists
        res.send(JSON.stringify(r));
    }).catch(async (error) => {
        if (error.code == 'auth/user-not-found') {
            await fdb.collection('panels').doc(panel_id).collection('requests').add({
                email: email,
                first_name: first_name,
                last_name: last_name,
                role: role,
                profile_img: ''
            }).then(() => {
                r['r'] = 1;
                res.send(JSON.stringify(r));
            });
        } else {
            r['r'] = 0; // error
            res.send(JSON.stringify(r));
        }
    });
});

router.post('/accept',isAuthenticated, async (req, res) => {
    var r = { r: 0 };

    const request_id = req.body.request_id;

    await fdb.collection('panels').doc(req.session.panel_id).collection('requests').doc(request_id).get().then(async (request) => {
        await admin_fauth.createUser({
            email: request.data().email,
            emailVerified: true,
            password: `${request.data().first_name}123456`,
            displayName: `${request.data().first_name} ${request.data().last_name}`,
        }).then(async (userRecord) => {
            await fdb.collection('panels').doc(req.session.panel_id).collection('users').doc(userRecord.uid).set({
                email: request.data().email,
                first_name: request.data().first_name,
                last_name: request.data().last_name,
                role: request.data().role,
                user_id: userRecord.uid,
                profile_img: ''
            }).then(async () => {
                await fdb.collection('panels').doc(req.session.panel_id).collection('requests').doc(request_id).delete();
                r['r'] = 1;
                res.send(JSON.stringify(r));
            });
        }).catch(async (err) => {
            if (err.code == 'auth/email-already-exists') {
                await fdb.collection('panels').doc(req.session.panel_id).collection('requests').doc(request_id).delete();
                r['r'] = 4;
            }
            console.log(err);
            res.send(JSON.stringify(r));
        });
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });
});

router.post('/decline', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const request_id = req.body.request_id;

    await fdb.collection('panels').doc(req.session.panel_id).collection('requests').doc(request_id).delete().then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });
});


router.get('/get-all', isAuthenticated, async (req, res) => {
    const panel_id = req.session.panel_id;
    const data = [];
    try {
        await fdb.collection('panels').doc(panel_id).collection('requests').get().then((requests) => {
            requests.forEach((r_doc) => {
                data.push({
                    id: r_doc.id,
                    first_name: r_doc.data().first_name,
                    last_name: r_doc.data().last_name,
                    email: r_doc.data().email,
                    role: r_doc.data().role,
                    profile_img: r_doc.data().profile_img,
                });
            });
            res.send(JSON.stringify(data));
        });
    } catch (e) {
        var r = { r: 0 };
        res.send(JSON.stringify(r));
    }
});


module.exports = router;