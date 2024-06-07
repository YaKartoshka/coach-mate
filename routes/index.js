const express = require('express');
const router = express.Router();
const fdb = require('../libs/firebase_db').fdb;

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('login'); // redirect to sign-in route
    }
    next();
};

router.get('/', isAuthenticated, (req, res, next) => {
    res.render('index', { role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en' });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/join', async (req, res) => {
    const panel_id = req.query.panel_id;

    if (!panel_id || panel_id == undefined) {
        res.render('login');
        return;
    }

    await fdb.collection('panels').doc(panel_id).get().then((panelDoc) => {
        if (panelDoc.exists) {
            res.render('join', { role: req.session.role });
        } else {
            res.render('login');
        }
    }).catch((e) => {
        res.render('login');
    });
});

router.get('/settings', isAuthenticated, (req, res) => {
    res.render('settings', { role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en' });
});

router.get('/members', isAuthenticated, (req, res) => {
    res.render('members', { role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en' });
});

router.get('/schedule', isAuthenticated, (req, res) => {
    res.render('schedule', { role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en' });
});

router.get('/events', isAuthenticated, (req, res) => {
    res.render('events', { role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en' });
});

router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en'})
})

router.get('/passes', isAuthenticated, (req, res) => {
    res.render('passes', {role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en'})
});

router.get('/competitions', (req, res) => {
    res.render('competitions', {role: req.session.role, L:L, language: req.cookies.language ? req.cookies.language : 'en'});
});

router.post('/', (req,res)=>{
    var r = {r:0};
    var action = req.body.action;
    
    if(action == 'changeLanguage'){
        const language = req.body.language;
        res.cookie("language", language);
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }
});


module.exports = router;