const express = require("express");
const { fdb } = require("../libs/firebase_db");
const router = express.Router();

router.post('/create', async (req, res, next) => {
    var r = { r: 1 };
    const panel_id = req.session.panel_id;
    console.log(req.body)
    try {
        const passesRef = fdb.collection('panels').doc(panel_id).collection('passes');
        const pass = await passesRef.add({});

        var data = {
            pass_id: pass.id,
            pass_section: req.body.pass_section,
            pass_price: req.body.pass_price,
            pass_visits_number: req.body.pass_visits_number,
        }
        await passesRef.doc(pass.id).update(data);
        res.send(JSON.stringify(r));
    } catch (e) {
        r['r'] = 0;
        console.log(e);
        res.send(JSON.stringify(r));
    }
});

router.post('/get-all', async (req, res) => {
    const panel_id = req.session.panel_id;
    const data = [];
    try {
        await fdb.collection('panels').doc(panel_id).collection('passes').get().then((passes) => {
            passes.forEach((pass_doc) => {
                data.push({ pass_id: pass_doc.data().pass_id, pass_section: pass_doc.data().pass_section, pass_price: pass_doc.data().pass_price, pass_visits_number: pass_doc.data().pass_visits_number });
            });
            res.send(JSON.stringify(data));
        });
    } catch (e) {
        res.send(e);
    }
});

router.post('/edit', async (req, res, next) => {
    var r = { r: 0 };
    const panel_id = req.session.panel_id;
    const { pass_id, pass_section, pass_price, pass_visits_number } = req.body;

    if (!pass_section || !pass_price || !pass_visits_number) {
        return res.status(400).send('All fields are required.');
    }

    await fdb.collection('panels').doc(panel_id).collection('passes').doc(pass_id).update({
        pass_section: pass_section,
        pass_price: pass_price,
        pass_visits_number: pass_visits_number
    }).then(() => {
        r['r'] = 1;
        res.send(JSON.stringify(r));
    }).catch((e) => {
        console.log(e);
        res.send(JSON.stringify(r));
    });
});

router.post('/delete', async (req, res, next) => {
    var r = { r: 1 };
    const panel_id = req.session.panel_id;
    const pass_id = req.body.pass_id;

    console.log(pass_id);

    try {
        await fdb.collection('panels').doc(panel_id).collection('passes').doc(pass_id).delete();
        res.send(JSON.stringify(r));
    } catch (e) {
        r['r'] = 0;
        console.log(e);
        res.send(JSON.stringify(r));
    }
})


module.exports = router;