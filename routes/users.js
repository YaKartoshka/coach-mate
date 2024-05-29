const express = require('express');
const validator = require('validator');
const router = express.Router();
const { fdb, admin_fauth } = require("../libs/firebase_db");

router.post('/create', async (req, res) => {
    var r = { r: 0 };
    const fieldsToCheck = ['email', 'first_name', 'last_name', 'role'];
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
    const password = `${first_name.toLowerCase()}123456`;
    const role = req.body.role;

    var data = {
        email: email,
        first_name: first_name,
        last_name: last_name,
        role: role,
        user_id: userRecord.uid,
        profile_img: '',
        phone_number: '',
    }

    if (role == 'student') {
        data.pass = req.body.pass
        /// exp date
    }


    await admin_fauth.createUser({
        email: email,
        emailVerified: true,
        password: password,
        displayName: `${first_name} ${last_name}`,
    }).then(async (userRecord) => {
        await fdb.collection('panels').doc(req.session.panel_id).collection('users').doc(userRecord.uid).set(data).then(() => {
            r['r'] = 1;
            res.send(JSON.stringify(r));
        });
    }).catch((err) => {

        if (err.code == 'auth/email-already-exists') {
            r['r'] = 4;
        }
        console.log(err);
        res.send(JSON.stringify(r));
    });
});

router.get('/get-all', async (req, res) => {
    const panel_id = req.session.panel_id;
    const roles = req.query.roles;

    const data = [];
    try {
        if (roles == 'all') {
            await fdb.collection('panels').doc(panel_id).collection('users').get().then((users) => {
                users.forEach((u_doc) => {
                    data.push({
                        id: u_doc.id,
                        first_name: u_doc.data().first_name,
                        last_name: u_doc.data().last_name,
                        email: u_doc.data().email,
                        role: u_doc.data().role,
                        profile_img: u_doc.data().profile_img,
                        phone_number: u_doc.data().phone_number,
                        pass: u_doc.data().pass
                    });
                });
                res.send(JSON.stringify(data));
            });
        } else {
            await fdb.collection('panels').doc(panel_id).collection('users').where('role', '==', roles).get().then((users) => {
                users.forEach((u_doc) => {
                    data.push({
                        id: u_doc.id,
                        first_name: u_doc.data().first_name,
                        last_name: u_doc.data().last_name,
                        email: u_doc.data().email,
                        role: u_doc.data().role,
                        profile_img: u_doc.data().profile_img,
                        phone_number: u_doc.data().phone_number
                    });
                });
                res.send(JSON.stringify(data));
            });
        }
    } catch (e) {
        var r = { r: 0 };
        res.send(JSON.stringify(r));
    }
});

router.get('/get', async (req, res) => {
    const panel_id = req.session.panel_id;
    const user_id = req.session.user_id;

    try {
        await fdb.collection('panels').doc(panel_id).collection('users').doc(user_id).get().then((user) => {
            let data = {
                email: user.data().email,
                first_name: user.data().first_name,
                last_name: user.data().last_name,
                profile_img: user.data().profile_img,
                role: user.data().role,
                description: user.data().description,
                phone_number: user.data().phone_number
            }
            res.send(JSON.stringify(data));
        });
    } catch (e) {
        console.log(e)
        var r = { r: 0 };
        res.send(JSON.stringify(r));
    }
});

router.post('/edit', async (req, res) => {
    var r = { r: 0 }
    const fieldsToCheck = ['first_name', 'last_name', 'role'];
    const errors = fieldsToCheck.filter(field => !req.body[field] || req.body[field].trim() === '');

    if (errors.length > 0) {
        r['r'] = 3; // invalid or empty fields
        res.send(JSON.stringify(r));
    }

    const user_id = req.body.user_id;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const phone_number = req.body.phone_number || '';
    const role = req.body.role;

    var data = {
        first_name: first_name,
        last_name: last_name,
        phone_number: phone_number,
        role: role,
    }

    if(role=='student') data.pass = req.body.pass;

    await fdb.collection('panels').doc(req.session.panel_id).collection('users').doc(user_id).update(data).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });
});

router.post('/delete', async (req, res) => {
    var r = { r: 0 }

    const user_id = req.body.user_id;
    await fdb.collection('panels').doc(req.session.panel_id).collection('users').doc(user_id).delete().then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });
});


module.exports = router;