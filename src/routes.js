const {registerFamily} = require('./registerFamily');
const router = require('express').Router();

router.route('/family')
    .get((req, res) => {

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

module.exports = router;