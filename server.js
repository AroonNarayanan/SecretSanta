const {generateFamilyId, generatePin} = require('./src/utils');
const v2routes = require('./src/routes');
const {DB_URL} = require('./src/constants');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Shuffle = require('shuffle-array');

const Santa = require('./models').Santa;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
mongoose.connect(DB_URL, {useNewUrlParser: true});

app.route('/registerFamily').post((req, res) => {
    if (req.body.family) {
        //TODO: check for existing familyIds
        const familyId = generateFamilyId();
        const familyNames = req.body.family;
        Shuffle(familyNames);
        const family = familyNames.map(name => {
            return {
                name: name,
                pin: generatePin(),
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
}).delete((req, res) => {

});

app.route('/getSanta/:name').get((req, res) => {
    const santa = req.params.name;
    const pin = req.query.pin;
    Santa.findOne({name: santa, pin: pin}, (err, result) => {
        if (err) res.send(err);
        else if (!result) res.sendStatus(401);
        else res.json({
                name: result.giftee,
                budget: result.budget ? result.budget : 'unknown'
            });
    });
});

app.route('/policy').get((req, res) => {
    res.send('This app will not share any of your data - any information stored will be used only for the purposes of fulfilling the app\'s services.');
});

app.route('/app').get((req, res) => {
    res.redirect('http://onelink.to/3ncjk8');
});

app.use('/v2', v2routes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('App is listening on port ' + port);
});

function saveSanta(santa) {
    return new Promise((resolve, reject) => {
        santa.save((err, result) => {
            if (err) reject(err); else resolve(result);
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