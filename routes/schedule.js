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
    console.log(req.body)
    if (req.body.schedule_id) {
        const status = await conductScheduledEvent(req);
        if (status) r['r'] = 1;
        return res.send(JSON.stringify(r));
    };


    const { repetition, event_name, time, event_date, week_day, coach_id, coach_name, members, event_id, description } = req.body;

    if (!repetition || !event_name || !time || !coach_id) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').add({
        repetition: repetition,
        event_name: event_name,
        description: description,
        time: time,
        event_date: event_date,
        week_day: week_day,
        coach_id: coach_id,
        coach_name: coach_name,
        members: members,
        status: 1,
        event_id: event_id,
        event_date: event_date
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

    const { repetition, event_name, time, event_date, coach_id, coach_name, members, event_id } = req.body;

    if (!repetition || !event_name || !time || !coach_id) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').add({
        repetition: repetition,
        event_name: event_name,
        time: time,
        event_date: event_date,
        coach_id: coach_id,
        coach_name: coach_name,
        status: 2,
        members: members,
        event_id: event_id,
        week_day: "",
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
    if (req.body.schedule_id) {
        const status = await cancelScheduledEvent(req);
        if (status) r['r'] = 1;
        return res.send(JSON.stringify(r));
    };
    const { repetition, event_name, time, event_date, week_day, coach_id, coach_name, members, event_id, description } = req.body;

    if (!repetition || !event_name || !time || !coach_id) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').add({
        repetition: repetition,
        event_name: event_name,
        description: description || '',
        time: time,
        event_date: event_date,
        week_day: week_day,
        coach_id: coach_id,
        coach_name: coach_name,
        members: members,
        status: 0,
        event_id: event_id,
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});

router.post('/edit', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const { members, description, schedule_id } = req.body;

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').doc(schedule_id).update({
        description: description,
        members: members,
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});


router.post('/delete', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
    const { schedule_id } = req.body;

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').doc(schedule_id).delete().then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});

router.post('/get-all', async (req, res) => {
    var data = [];
    const panel_id = req.session.panel_id;
    const schedules = await fdb.collection('panels').doc(panel_id).collection('schedules').get();
    schedules.docs.forEach((schedule) => {
        data.push({ ...schedule.data(), schedule_id: schedule.id });
    })
    res.send(data);
});


async function cancelScheduledEvent(req) {
    const { repetition, event_name, time, event_date, week_day, coach_id, coach_name, members, event_id, description, schedule_id } = req.body;

    if (!repetition || !event_name || !time || !coach_id) {
        return 0;
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').doc(schedule_id).update({
        repetition: repetition,
        event_name: event_name,
        description: description || '',
        time: time,
        event_date: event_date,
        week_day: week_day,
        coach_id: coach_id,
        coach_name: coach_name,
        members: members,
        status: 0,
        event_id: event_id,
    }).then(() => {
        return 1
    }).catch((e) => {
        console.log(e)
        return 0;
    })
}

async function conductScheduledEvent(req) {
    const { repetition, event_name, time, event_date, week_day, coach_id, coach_name, members, event_id, description, schedule_id } = req.body;

    if (!repetition || !event_name || !time || !coach_id) {
        return 0;
    }

    await fdb.collection('panels').doc(req.session.panel_id).collection('schedules').doc(schedule_id).update({
        repetition: repetition,
        event_name: event_name,
        description: description || '',
        time: time,
        event_date: event_date,
        week_day: week_day,
        coach_id: coach_id,
        coach_name: coach_name,
        members: members,
        status: 1,
        event_id: event_id,
    }).then(() => {
        return 1
    }).catch((e) => {
        console.log(e)
        return 0;
    })
}




module.exports = router;