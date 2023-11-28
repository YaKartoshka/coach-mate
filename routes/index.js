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
    const panel_id = 'OFZuPNKPFyRdejchRQp6';
   
    await fdb.collection('panels').doc(panel_id).get().then((panelDoc)=>{
        if(panelDoc.exists){
            res.render('join');
        } else {
            res.render('login');
        }
    }).catch((e)=>{
        console.log(e)
        res.render('login');
    })
});

router.get('/settings', isAuthenticated, (req,res)=>{
    res.render('settings');
});

router.get('/members', isAuthenticated, (req,res)=>{
    res.render('members');
});













module.exports = router;