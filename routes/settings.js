const express = require('express');
const router = express.Router();
const { fdb, admin_fauth } = require("../libs/firebase_db");
const stripe = require('stripe')(conf.stripe_sk_key);

async function addCustomer(email, username, cb) {
    var description = ' ';
    var customer_data = {
        description: description,
        email: email,
        name: username
    }

    const customers = await stripe.customers.list({
        email: email,
    });

    if (customers.data[0] != undefined) {
        return cb(customers.data[0].id);
    } else {
        return await stripe.customers.create(
            customer_data, (err, customer) => {
                if (err) {
                    return cb(null);
                } else {
                    return cb(customer.id);
                }
            }
        );
    }
}


router.post('/payments', async function (req, res, next) {
    console.log('/payments', req.body.action);
    var action = req.body.action, r = { r: 1 };

    if (action == 'add_payment_method') {

        await fdb.collection('panels').doc(req.session.panel_id).collection('users').doc(req.session.user_id).get().then((user_data) => {
            addCustomer(user_data.data().email, user_data.data().first_name, async function (cid) {
                if (!cid) {
                    r['r'] = 0;
                    res.send(JSON.stringify(r));
                } else {
                    console.log(req.body)
                    console.log(cid)

                    const card_number = req.body.card_number;
                    const exp_month = req.body.exp_month;
                    const exp_year = req.body.exp_year;
                    const cvc = req.body.cvc;
                    const name_on_card = req.body.name_on_card;
                    try {

                        const paymentMethod = await stripe.paymentMethods.create({
                            type: 'card',
                            card: {
                                number: '5555555555554444',
                                exp_month: 8,
                                exp_year: 2026,
                                cvc: '314',
                            },
                            
                        });
                        // const paymentMethod = await stripe.paymentMethods.create({
                        //     type: "card",
                        //     card: {
                        //         number: card_number,
                        //         exp_month: exp_month,
                        //         exp_year: exp_year,
                        //         cvc: cvc
                        //     },
                        // });
                        console.log(paymentMethod)
                        var card_id = paymentMethod.id;
                        const cardAttach = await stripe.paymentMethods.attach(
                            card_id,
                            { customer: cid }
                        );
                        const customer = await stripe.customers.update(
                            cid,
                            { invoice_settings: { default_payment_method: card_id } }
                        );

                        const paymentIntent = await stripe.paymentIntents.create({
                            amount: 50,
                            currency: 'usd',
                            customer: cid,
                            payment_method: card_id,
                            confirm: true,
                            return_url: 'http://localhost:4000',
                            automatic_payment_methods: { enabled: true },
                        });

                        if (paymentIntent.status == 'succeeded') {
                            var last_digits = card_number.slice(-4);
                            await fdb.collection('panels').doc(req.session.panel_id).update({
                                last_digits: `${last_digits}`,
                                expiration_date: `${exp_month}.${exp_year}`,
                                card_type: cardAttach.card.brand,
                                cid: cid,
                                name_on_card: name_on_card
                            }).then(() => {
                                r['r'] = 1;
                                res.send(JSON.stringify(r));
                            });

                        } else {
                            r['r'] = 0;
                            console.log('error');
                            res.send(JSON.stringify(r));
                        }
                    } catch (e) {
                        r['r'] = 0;
                        console.log(e)
                        if (e.raw.code == 'incorrect_number') {
                        } else if (e.raw.code == 'resource_missing') {
                            console.log(e.raw.code, 'or user does not exist');
                        }
                        res.send(JSON.stringify(r));
                    }
                }
            })

        })


    }


    else

        if (action == 'change_payment_method') {
            await fdb.collection('panels').doc(req.session.panel_id).get().then(async function (cb1) {
                const cid = cb1.data().cid;
                const card_number = req.body.card_number;
                const exp_month = req.body.exp_month;
                const exp_year = req.body.exp_year;
                const cvc = req.body.cvc;
                const name_on_card = req.body.name_on_card;
                try {
                    const customer = await stripe.customers.retrieve(cid);

                    var pm_id = customer.invoice_settings.default_payment_method;
                    const removed_paymentMethod = await stripe.paymentMethods.detach(pm_id);

                    const paymentMethod = await stripe.paymentMethods.create({
                        type: "card",
                        card: {
                            number: card_number,
                            exp_month: exp_month,
                            exp_year: exp_year,
                            cvc: cvc,
                        },
                    });

                    var card_id = paymentMethod.id;
                    const cardAttach = await stripe.paymentMethods.attach(card_id, { customer: cid });

                    const updated_customer = await stripe.customers.update(
                        cid, { invoice_settings: { default_payment_method: card_id } }
                    );

                    const paymentIntent = await stripe.paymentIntents.create({
                        amount: 50,
                        currency: 'usd',
                        customer: cid,
                        payment_method: card_id,
                        confirm: true,
                        return_url: 'http://localhost:4000',
                        automatic_payment_methods: { enabled: true },
                    });

                    if (paymentIntent.status == 'succeeded') {
                        await fdb.collection('panels').doc(req.session.panel_id).update({
                            "last_digits": `${last_digits}`,
                            expiration_date: `${exp_month}.${exp_year}`,
                            card_type: cardAttach.card.brand,
                            cid: cid,
                            name_on_card: name_on_card
                        }).then(() => {
                            r['r'] = 1;
                            res.send(JSON.stringify(r));
                        });
                    } else {
                        r['r'] = 0;
                        res.send(JSON.stringify(r));
                    }

                } catch (e) {
                    r['r'] = 0;
                    if (e.raw.code == 'incorrect_number') {
                        res.send(JSON.stringify(r));
                    } else if (e.raw.code == 'resource_missing') {
                        console.log(e.raw.code, 'or user does not exist');
                        res.send(JSON.stringify(r));
                    } else {
                        res.send(JSON.stringify(r));
                    }
                }
            });
        }
});



router.get('/payments', async function (req, res, next) {
    console.log('/payments', req.query.action);
    var action = req.query.action, r = { r: 200 };
    try {
        if (action == 'getPaymentMethod') {
            await fdb.collection('panels').doc(req.session.panel_id).get().then((panel_data) => {
                console.log(panel_data)
                if (!panel_data.data().card_type) {
                    r['r'] = 2;
                    res.send(JSON.stringify(r));
                } else {
                    var paymentMethod = {
                        card_type: panel_data.data().card_type,
                        last_digits: panel_data.data().last_digits,
                        expiration_date: panel_data.data().expiration_date,
                    }
                    res.send(JSON.stringify(paymentMethod));
                }
            });
        }
    } catch (e) {
        console.log(e);
        r['r'] = 0;
        res.send(JSON.stringify(r));
    }
});

router.post('/get', async (req, res) => {
    var panel_id = req.session.panel_id;
    try {
        await fdb.collection('panels').doc(panel_id).get().then((user) => {
            res.send(JSON.stringify({ ...user.data(), panel_creation_date: user.createTime.toDate() }));
        });
    } catch (e) {
        console.log(e)
        var r = { r: 0 };
        res.send(JSON.stringify(r));
    }
});

router.post('/update', async (req, res) => {
    var r = { r: 0 };
    var panel_name = req.body.panel_name;
    var panel_id = req.session.panel_id;
    try {
        await fdb.collection('panels').doc(panel_id).update({
            panel_name: panel_name
        }).then(() => {
            r['r'] = 1;
            res.send(JSON.stringify(r));
        });
    } catch (e) {
        console.log(e);
        res.send(JSON.stringify(r));
    }
});


module.exports = router;