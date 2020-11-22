const {registerFamily, findFamily, findFamilyMember} = require('./family');
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

module.exports = router;