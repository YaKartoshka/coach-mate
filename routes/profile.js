const express = require('express');
const router = express.Router();
const { fdb, admin_fauth } = require("../libs/firebase_db");

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
})



module.exports = router;