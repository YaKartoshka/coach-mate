const express = require('express');
const router = express.Router();

function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.send('Unauthorized access'); // redirect to sign-in route
    }
    next();
};


router.get('/get-profile', isAuthenticated, async(req, res) => {
    const user_id = req.session.user_id;
    const panel_id = req.session.panel_id;
    try {
        const panel = await fdb.collection('panels').doc(panel_id).get();
        console.log(panel.data().name);
        


    } catch(e){
        res.send(e);
    }


});








module.exports = router;