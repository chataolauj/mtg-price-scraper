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

//Clear wish list
router.put('/:id/wish_list', async (req, res) => {
    let clear = req.query.clear;

    try {
        if(clear == 'true') {
            await User.update(
                {_id: req.params.id}, 
                {
                    $set: {
                        wish_list: []
                    }
                }
            );
            res.status(200).json({message: 'Your wish list has been cleared.'});
        }
        else {
            res.status(204).send();
        }
    } catch (err) {
        res.json({message: err});
    }
});

//Insert card to user's wish list
router.post('/:id/wish_list', async (req, res) => {
    try {
        let conditions = ['Near Mint', 'Lightly Played', 'Moderately Played', 'Heavily Played', 'Damaged'];

        let new_card = {
            multiverse_id: req.body.multiverse_id,
            name: req.body.name,
            set_name: req.body.set_name,
            set_code: req.body.set_code,
            conditions: req.body.conditions.length ? req.body.conditions : conditions,
            wish_price: req.body.wish_price != null ? req.body.wish_price : 0.00,
            image_uris: req.body.image_uris
        }

        let query = await User.findOne(
            {_id: req.params.id, 'wish_list.name': new_card.name, 'wish_list.set_name': new_card.set_name},
            {_id: 0, 'wish_list.$': 1}
        );

        if(!query) {
            await User.updateOne(
                {_id: req.params.id},
                {$push: {wish_list: new_card}}
            );

            res.status(200).send({message: `${new_card.name} (${new_card.set_name}) was added to your wish list.`});
        }
        else{
            res.status(409).send({message: `${new_card.name} (${new_card.set_name}) is already in your wish list.`});
        }
    } catch (err) {
        res.json({message: 'Something went wrong...'});
    }
});

//Get a card from user's wish list
router.get('/:id/wish_list/card/:card_id', async (req, res) => {
    try {
        let query = await User.findOne(
            {_id: req.params.id, 'wish_list._id': req.params.card_id},
            {_id: 0, 'wish_list.$': 1}
        );

        console.log(query.wish_list[0]);
        res.status(200).json(query.wish_list[0]);
        
    } catch (err) {
        res.status(404).send({message: 'No such card in your wish list.'});
    }
});

//Update card in user wish list
router.patch('/:id/wish_list/card/:card_id', async (req, res) => {
    try {
        let update = {
            conditions: req.body.conditions,
            wish_price: req.body.wish_price,
        }

        let query = await User.findOne(
            {_id: req.params.id, 'wish_list._id': req.params.card_id},
            {_id: 0, 'wish_list.$': 1}
        );

        if(query) {
            await User.updateOne(
                {_id: req.params.id, 'wish_list._id': req.params.card_id},
                {
                    $set: {
                        'wish_list.$.conditions': update.conditions,
                        'wish_list.$.wish_price': update.wish_price
                    }
                }
            );

            res.status(202).json({message: `${query.wish_list[0].name} (${query.wish_list[0].set_name}) successfully updated.`});
        }
        else{
            res.status(404).json({message: `No such card in your wish list.`});
        }
    } catch (err) {
        res.status(404).send({message: err});
    }
});

//Remove card from wish list
router.delete('/:id/wish_list/card/:card_id', async (req, res) => {
    try {
        let query = await User.findOne(
            {_id: req.params.id, 'wish_list._id': req.params.card_id},
            {_id: 0, 'wish_list.$': 1}
        );

        if(query) {
            let card_doc = query.wish_list[0];

            await User.updateOne(
                {_id: req.params.id},
                {$pull: {wish_list: {_id: req.params.card_id}}}
            );

            res.status(200).send({message: `${card_doc.name} (${card_doc.set_name}) has been removed from your wish list.`});
        }
        else{
            res.status(404).send({error: `${card_doc.name} (${card_doc.set_name}) is not in your wish list.`});
        }
        
    } catch (err) {
        res.status(404).send({message: `No such card is not in your wish list.`});
    }
});

module.exports = router;