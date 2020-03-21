const express = require('express');
const router = express.Router();
const User = require('../models/User')

//Get all users
router.get('/', (req, res) => {
    User.find()
        .sort({ date: -1 })
        .then(users => res.json(users));
});

//Get user by their ObjectId
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch(err) {
        res.json({message: err});
    }
});

//Insert a user
router.post('/', (req, res) => {
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        wishList: req.body.wishList
    });

    user.save()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err })
        });
});

//Update specific user information
router.patch('/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        await User.updateOne({_id: req.params.id}, {$set: {password: req.body.password}});
        res.json({message: user.email +  `'s information has been updated.`});
    } catch(err) {
        res.json({message: err})
    }
})

//Delete specific user
router.delete('/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        await User.findByIdAndRemove(req.params.id);
        res.json({message: 'Removed ' + user.email + ' from the database.'});
    } catch (error) {
        res.json({message: err});
    }
})

module.exports = router;