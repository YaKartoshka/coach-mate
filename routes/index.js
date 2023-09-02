const express = require('express');
const router = express.Router();


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

router.get('/settings', isAuthenticated, (req,res)=>{
    res.render('settings');
});













module.exports = router;