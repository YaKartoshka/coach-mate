const express = require('express');
const validator = require('validator');
const router = express.Router();
const { fdb, admin_fauth } = require("../libs/firebase_db");

router.post('/add', async (req, res) => {
    var r = { r: 0 };
    const fieldsToCheck = ['email', 'first_name', 'last_name', 'password', 'phone_number', 'birth_date'];
    const errors = fieldsToCheck.filter(field => !req.body[field] || req.body[field].trim() === '');

    if (errors.length > 0) {
        r['r'] = 3; // invalid or empty fields
        res.send(JSON.stringify(r));
    }

    if (!validator.isEmail(req.body.email)) {
        r['r'] = 2; // invalid email
        res.send(JSON.stringify(r));
    }

    const email = req.body.email;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const password = req.body.password;
    const phone_number = req.body.phone_number;
    const birth_date = req.body.birth_date;

    await admin_fauth.createUser({
        email: email,
        emailVerified: true,
        phoneNumber: phone_number,
        password: password,
        displayName: `${first_name} ${last_name}`,
    }).then(async (userRecord) => {
        await fdb.collection('panels').doc(req.session.panel_id).collection('users').add({
            email: email,
            phone_number: phone_number,
            first_name: first_name,
            last_name: last_name,
            birth_date: birth_date,
            auth_id: userRecord.uid
        }).then(() => {
            r['r'] = 1;
            res.send(JSON.stringify(r));
        });
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });
});

router.post('/edit', async (req, res) => {
    var r = { r: 0 }
    const fieldsToCheck = ['first_name', 'last_name', 'phone_number', 'birth_date'];
    const errors = fieldsToCheck.filter(field => !req.body[field] || req.body[field].trim() === '');

    if (errors.length > 0) {
        r['r'] = 3; // invalid or empty fields
        res.send(JSON.stringify(r));
    }

    if (!validator.isEmail(req.body.email)) {
        r['r'] = 2; // invalid email
        res.send(JSON.stringify(r));
    }

    const user_id = req.body.user_id;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const phone_number = req.body.phone_number;
    const birth_date = req.body.birth_date;

    await fdb.collection('panels').doc(req.session.panel_id).collection('users').doc(user_id).update({
        email: email,
        phone_number: phone_number,
        first_name: first_name,
        last_name: last_name,
        birth_date: birth_date,
        auth_id: userRecord.uid
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e)=>{
        console.log(e);
        res.send(JSON.stringify(r));
    });
});

router.get('/get-all', async (req, res) => {
    const panel_id = req.session.panel_id;
    const data = [];
    try {
        await fdb.collection('panels').doc(panel_id).collection('users').get().then((users) => {
            users.forEach((u_doc) => {
                data.push({
                    id: u_doc.id,
                    first_name: u_doc.data().first_name,
                    last_name: u_doc.data().last_name,
                    email: u_doc.data().email,
                    birth_date: u_doc.data().birth_date
                });
            });
            res.send(JSON.stringify(data));
        });
    } catch (e) {
        var r ={r:0}; 
        res.send(JSON.stringify(r));
    }
});

module.exports = router;