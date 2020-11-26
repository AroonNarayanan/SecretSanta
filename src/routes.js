const {isLegacyPin} = require('./utils');
const {registerFamily, findFamily, findFamilyMember} = require('./family');
const {Santa} = require('../models');
const router = require('express').Router();

router.route('/family')
    .get(async (req, res) => {
        if (req.query.familyId) {
            try {
                res.json(await findFamily(req.query.familyId));
            } catch (e) {
                console.error(e);
                res.status(500).send(e);
            }
        } else res.sendStatus(400);
    })
    .post(async (req, res) => {
        if (req.body.family && req.body.budget && req.body.due) {
            try {
                res.json(await registerFamily(req.body.family, req.body.budget, req.body.due));
            } catch (e) {
                console.error(e);
                res.status(500).send(e);
            }
        } else {
            res.sendStatus(400);
        }
    });

router.route('/member/:name').get(async (req, res) => {
    if (req.query.pin) {
        try {
            res.json(await findFamilyMember(req.params.name, req.query.pin));
        } catch (e) {
            console.error(e);
            res.status(500).send(e);
        }
    } else res.sendStatus(400);
});

router.get('/unified/:name', async (req, res) => {
    if (req.query.pin) {
        if (isLegacyPin(req.query.pin)) {
            console.log('LEGACYREQUEST');
            Santa.findOne({name: req.params.name, pin: req.query.pin}, (err, result) => {
                if (err) res.send(err);
                else if (!result) res.sendStatus(404);
                else res.json({
                        name: req.params.name,
                        interests: '',
                        giftee: {
                            name: result.giftee,
                            interests: ''
                        },
                        family: {
                            budget: result.budget ? result.budget : 'unknown',
                            due: null
                        },
                        legacy: true
                    });
            });
        } else {
            try {
                const familyMember = await findFamilyMember(req.params.name, req.query.pin)
                if (familyMember) {
                    res.json(familyMember);
                } else {
                    res.sendStatus(404);
                }
            } catch (e) {
                console.error(e);
                res.status(500).send(e);
            }
        }
    } else res.sendStatus(400);
});

module.exports = router;