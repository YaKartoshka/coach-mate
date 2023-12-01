const express = require('express');
const router = express.Router();
const { fdb } = require("../libs/firebase_db");

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.send('Unauthorized access'); // redirect to sign-in route
    }
    next();
};


router.post('/create', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const { repetition, event_name, event_type, time, event_date, week_day } = req.body;

    if (!repetition || !event_name || !event_type || !time) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').add({
        repetition: repetition,
        event_name: event_name,
        event_type: event_type,
        time: time,
        event_date: event_date,
        week_day: week_day
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});

router.get('/get', isAuthenticated, async (req, res) => {
    var data = [];
    const panel_id = req.session.panel_id;
    const schedules = await fdb.collection('panels').doc(panel_id).collection('schedules').get();
    schedules.docs.forEach((schedule) => {
        data.push(schedule.data());
    })
    res.send(data);
})





module.exports = router;