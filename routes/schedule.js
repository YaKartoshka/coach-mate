const express = require('express');
const router = express.Router();
const { fdb } = require("../libs/firebase_db");

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.send('Unauthorized access'); // redirect to sign-in route
    }
    next();
};


router.post('/conduct', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const { repetition, event_name, event_type, time, event_date, week_day, coach_id, coach_name } = req.body;

    if (!repetition || !event_name || !event_type || !time || !coach_id) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').add({
        repetition: repetition,
        event_name: event_name,
        event_type: event_type,
        time: time,
        event_date: event_date,
        week_day: week_day,
        coach_id: coach_id,
        coach_name: coach_name,
        status: 'conducted'
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});

router.post('/reschedule', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const { repetition, event_name, event_type, time, event_date, week_day, coach_id, coach_name } = req.body;

    if (!repetition || !event_name || !event_type || !time || !coach_id) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').add({
        repetition: repetition,
        event_name: event_name,
        event_type: event_type,
        time: time,
        event_date: event_date,
        week_day: week_day,
        coach_id: coach_id,
        coach_name: coach_name,
        status: 'new'
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});

router.post('/cancel', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const { repetition, event_name, event_type, time, event_date, week_day, coach_id, coach_name } = req.body;

    if (!repetition || !event_name || !event_type || !time || !coach_id) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').add({
        repetition: repetition,
        event_name: event_name,
        event_type: event_type,
        time: time,
        event_date: event_date,
        week_day: week_day,
        coach_id: coach_id,
        coach_name: coach_name,
        status: 'cancelled'
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});





module.exports = router;