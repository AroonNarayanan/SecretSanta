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
    if (req.body.family && req.body.passphrase && req.body.passphrase === process.env.PASSPHRASE) {
        const familyNames = req.body.family;
        Santa.remove({}, () => {
            Shuffle(familyNames);
            const family = familyNames.map(name => {
                return {
                    name: name,
                    pin: Math.floor(Math.random() * 100000).toString()
                };
            });
            const promiseArray = [];
            family.forEach((member, i) => {
                member.giftee = family[(i + 1) % family.length].name;
                const santa = new Santa(member);
                promiseArray.push(saveSanta(santa));
            });
            Promise.all(promiseArray).then(resultArray => {
                res.json(removeGiftees(resultArray, req.query.hideGiftees));
            }).catch(err => {
                res.status(500).send(err);
            })
        });
    } else {
        res.sendStatus(401);
    }
});

app.route('/family').get((req, res) => {
    if (req.query.passphrase && req.query.passphrase === process.env.PASSPHRASE) {
        Santa.find({}, (err, results) => {
            if (err) res.send(err); else {
                res.json(removeGiftees(results, req.query.hideGiftees));
            }
        });
    } else res.sendStatus(401);
});

app.route('/getSanta/:name').get((req, res) => {
    const santa = req.params.name;
    const pin = req.query.pin;
    Santa.findOne({name: santa, pin: pin}, (err, result) => {
        if (err) res.send(err);
        else if (!result) res.sendStatus(401);
        else res.send(result.giftee);
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
    return performRemoval ? array.map(item => {
        return {
            name: item.name,
            pin: item.pin
        }
    }) : array;
}