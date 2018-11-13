const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Shuffle = require('shuffle-array');

const Santa = require('./models').Santa;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
mongoose.connect('mongodb://rudolph:9reindeer@ds045087.mlab.com:45087/secretsanta');

app.route('/registerFamily').post((req, res) => {
    if (req.body.family) {
        const familyId = Math.floor(Math.random() * 100000).toString();
        const familyNames = req.body.family;
        Shuffle(familyNames);
        const family = familyNames.map(name => {
            return {
                name: name,
                pin: Math.floor(Math.random() * 100000).toString(),
                familyId: familyId,
                budget: req.body.budget
            };
        });
        const promiseArray = [];
        family.forEach((member, i) => {
            member.giftee = family[(i + 1) % family.length].name;
            const santa = new Santa(member);
            promiseArray.push(saveSanta(santa));
        });
        Promise.all(promiseArray).then(resultArray => {
            res.json({
                members: removeGiftees(resultArray, req.query.hideGiftees),
                id: familyId
            });
        }).catch(err => {
            res.status(500).send(err);
        });
    } else {
        res.sendStatus(400);
    }
});

app.route('/family').get((req, res) => {
    if (req.query.familyId) {
        Santa.find({familyId: req.query.familyId}, (err, results) => {
            if (err) res.send(err); else {
                res.json(removeGiftees(results, req.query.hideGiftees));
            }
        });
    } else res.sendStatus(400);
});

app.route('/getSanta/:name').get((req, res) => {
    const santa = req.params.name;
    const pin = req.query.pin;
    Santa.findOne({name: santa, pin: pin}, (err, result) => {
        if (err) res.send(err);
        else if (!result) res.sendStatus(401);
        else res.json({
                name: result.giftee,
                budget: result.budget
            });
    });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('App is listening on port ' + port);
});

function saveSanta(santa) {
    return new Promise((resolve, reject) => {
        santa.save((err, result) => {
            if (err) reject(); else resolve(result);
        });
    });
}

function removeGiftees(array, performRemoval) {
    return performRemoval === 'true' ? array.map(item => {
        return {
            name: item.name,
            pin: item.pin
        }
    }) : array;
}