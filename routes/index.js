const express = require('express');
const router = express.Router();
const fdb = require('../libs/firebase_db').fdb;

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('login'); // redirect to sign-in route
    }
    next();
};

router.get('/', isAuthenticated, (req,res,next)=>{
    console.log(req.session);
    res.render('index');
});

router.get('/login', (req,res)=>{
    res.render('login');
});

router.get('/join', async(req,res)=>{
    const panel_name = req.query.panel_name;
    // const panel = await fdb.collection('panel').where('panel_name', '==', panel_name).get();
    console.log(panel_name)
    res.render('join');
});

router.get('/settings', isAuthenticated, (req,res)=>{
    res.render('settings');
});

router.get('/members', isAuthenticated, (req,res)=>{
    res.render('members');
});













module.exports = router;