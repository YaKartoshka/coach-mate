const express = require("express");
const { fdb } = require("../libs/firebase_db");
const router = express.Router();

router.get('/get-all', async (req, res) => {
    const panel_id = req.session.panel_id;
    const data = [];
    try {
        await fdb.collection('panels').doc(panel_id).collection('links').get().then((links) => {
            links.forEach((link_doc) => {
                data.push({ link_id: link_doc.data().link_id, link_text: link_doc.data().link_text, link_url: link_doc.data().link_url });
            });
            res.send(JSON.stringify(data));
        });
    } catch (e) {
        res.send(e);
    }
});

router.post('/create', async function (req, res, next) {
    var r = { r: 1 };
    const panel_id = req.session.panel_id;
    console.log(req.body)
    try {
        const linksRef = fdb.collection('panels').doc(panel_id).collection('links');
        const link = await linksRef.add({});
        var data = {
            link_id: link.id,
            link_url: req.body.link_url,
            link_text: req.body.link_text,
        }
        await linksRef.doc(link.id).update(data);
        res.send(JSON.stringify(data));
    } catch (e) {
        r['r'] = 0;
        console.log(e);
        res.send(JSON.stringify(r));
    }
});

module.exports = router;