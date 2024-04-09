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
    const { repetition, event_name, time, event_date, week_day, coach_id, coach_name } = req.body;
    console.log(req.body)
    if (!repetition || !event_name || !time || !coach_id) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('competitions').add({
        event_name: event_name,
        time: time,
        event_date: event_date,
       
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e)
        res.send(JSON.stringify(r));
    })
});

router.post('/get-all', isAuthenticated, async (req, res) => {
    var data = [];
    const competitions = await fdb.collection('competitions').get();
    competitions.docs.forEach((comp) => {
        data.push({ ...comp.data(), comp_id: comp.id });
    });
    res.send(data);
});

router.get('/:id', isAuthenticated, async (req, res) => {
    const comp_id = req.params.id;
    
    await fdb.collection('competitions').doc(comp_id).get().then((doc) => {
        if (!doc.exists) {
            return res.render('error');
        }
        res.render('competitions', {comp_data: { ...comp.data(), comp_id: comp.id }})
    });
});






module.exports = router;