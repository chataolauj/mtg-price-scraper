const express = require('express');
const router = express.Router();
const User = require('../models/User')
const {check, validationResult} = require('express-validator');

//Insert/Register a user
router.post('/register', [
    check('email')
        .isEmail().withMessage('Please enter a valid email.')
        .normalizeEmail()
], 
async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).send(errors.array());
    }

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    user.save()
        .then(data => {
            res.status(200).send({message: `${user.email} is now registered.`});
        })
        .catch(err => {
            res.status(409).send({error: `${user.email} is already in use.`});
        });
});

module.exports = router;