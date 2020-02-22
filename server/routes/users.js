const express = require('express');
const router = express.Router();
const User = require('../models/User')

//Get all users
router.get('/', (req, res) => {
    User.find()
        .sort({ date: -1 })
        .then(users => res.json(users));
});

//Insert a user
router.post('/', (req, res) => {
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    user.save()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err })
        });
});

module.exports = router;