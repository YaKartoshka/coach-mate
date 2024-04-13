const express = require('express');
const router = express.Router();
const { fdb } = require("../libs/firebase_db");

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.send('Unauthorized access'); // redirect to sign-in route
    }
    next();
};

router.get('/create', isAuthenticated, (req,res)=>{
    res.render('competition_create', { role: req.session.role });
});

router.post('/create', isAuthenticated, async (req, res) => {
    var r = { r: 0 };
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
        entries: entries
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

    await fdb.collection('competitions').doc(comp_id).get().then((comp) => {
        if (!comp.exists) {
            return res.render('error');
        }
        res.render('competition', { comp_data: { ...comp.data(), comp_id: comp.id }, role: req.session.role })
    });
});






module.exports = router;