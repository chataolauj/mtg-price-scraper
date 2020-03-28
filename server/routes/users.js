const express = require('express');
const router = express.Router();
const User = require('../models/User')

//Get all users
router.get('/', (req, res) => {
    User.find()
        .sort({ date: -1 })
        .then(users => res.json(users));
});

//Get specific user by their ObjectId
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
        wish_list: req.body.wish_list
    });

    user.save()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.json({ message: err })
        });
});

//Update specific user information (password)
router.patch('/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        await User.updateOne({_id: req.params.id}, {$set: {password: req.body.password}});
        res.json({message: user.email +  `'s information has been updated.`});
    } catch(err) {
        res.json({message: err})
    }
});

//Delete user
router.delete('/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        await User.findByIdAndRemove(req.params.id);
        res.json({message: 'Removed ' + user.email + ' from the database.'});
    } catch (err) {
        res.json({message: err});
    }
});

//Get user wish list
router.get('/:id/wish_list', async (req, res) => {
    try {
        let wish_list = await User.findOne({_id: req.params.id}, {_id: 0, wish_list: 1});
        res.json(wish_list)
    } catch (err) {
        res.json({message: err});
    }
});

//Get card from user's wish list
router.get('/:id/wish_list/:multiverse_id', async (req, res) => {
    try {
        let card = await User.findOne(
            {_id: req.params.id, 'wish_list.multiverse_id': req.params.multiverse_id},
            {_id: 0, wish_list: {$elemMatch: {multiverse_id: req.params.multiverse_id}}}
        );
        res.json(card)
    } catch (err) {
        res.json({message: err});
    }
});

//Insert card to user's wish list
router.post('/:id/wish_list', async (req, res) => {
    try {
        let card = {
            multiverse_id: req.body.multiverse_id,
            name: req.body.name,
            set: req.body.set,
            condition: req.body.condition,
            wish_price: req.body.wish_price,
            max_range: req.body.max_range
        }

        await User.update(
            {_id: req.params.id, 'wish_list.multiverse_id': {$ne: card.multiverse_id}},
            {$push: {wish_list: card}}
        );

        res.json(card)
    } catch (err) {
        res.json({message: err});
    }
});

//Update card in user wish list
router.patch('/:id/wish_list/:multiverse_id', async (req, res) => {
    try {
        let card = {
            condition: req.body.condition,
            wish_price: req.body.wish_price,
            max_range: req.body.max_range
        }

        await User.updateOne(
            {_id: req.params.id, 'wish_list.multiverse_id': req.params.multiverse_id},
            {
                $set: {
                    'wish_list.$.condition': card.condition,
                    'wish_list.$.wish_price': card.wish_price,
                    'wish_list.$.max_range': card.max_range
                }
            }
        );

        res.json(card)
    } catch (err) {
        res.json({message: err});
    }
});

//Remove card from wish list
router.delete('/:id/wish_list/:multiverse_id', async (req, res) => {
    try {
        await User.update(
            {_id: req.params.id},
            {$pull: {wish_list: {multiverse_id: req.params.multiverse_id}}}
        );
        res.json({message: 'Removed card from the wish list.'});
    } catch (err) {
        res.json({message: err});
    }
});

module.exports = router;