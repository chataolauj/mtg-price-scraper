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

//Get a card from user's wish list
router.get('/:id/wish_list/:multiverse_id', async (req, res) => {
    try {
        let card = await User.findOne(
            {_id: req.params.id, 'wish_list.multiverse_id': req.params.multiverse_id},
            {_id: 0, 'wish_list.$': 1}
        );

        res.status(200).json(card.wish_list[0]);
        console.log(card.wish_list[0]);
        
    } catch (err) {
        res.status(404).json({message: 'No such card in your wish list.'});
    }
});

//Insert card to user's wish list
router.post('/:id/wish_list', async (req, res) => {
    try {
        let new_card = {
            multiverse_id: req.body.multiverse_id,
            name: req.body.name,
            set_name: req.body.set_name,
            set_code: req.body.set_code,
            conditions: req.body.conditions,
            wish_price: req.body.wish_price,
            image_uris: req.body.image_uris
        }

        let card_doc = await User.findOne({_id: req.params.id, 'wish_list.multiverse_id': new_card.multiverse_id});

        if(!card_doc) {
            await User.update(
                {_id: req.params.id},
                {$push: {wish_list: new_card}}
            );

            res.status(200).json({message: `${new_card.name} (${new_card.set_code}) was added to your wish list.`});
        }
        else{
            res.status(409).json({message: `${new_card.name} (${new_card.set_code}) is already in your wish list.`});
        }
    } catch (err) {
        res.json({message: err});
    }
});

//Update card in user wish list
router.patch('/:id/wish_list/:multiverse_id', async (req, res) => {
    try {
        let update = {
            condition: req.body.condition,
            wish_price: req.body.wish_price,
            max_range: req.body.max_range
        }

        let card_doc = await User.findOne(
            {_id: req.params.id, 'wish_list.multiverse_id': req.params.multiverse_id},
            {_id: 0, 'wish_list.$': 1}
        );

        if(card_doc) {
            await User.updateOne(
                {_id: req.params.id, 'wish_list.multiverse_id': req.params.multiverse_id},
                {
                    $set: {
                        'wish_list.$.condition': update.condition,
                        'wish_list.$.wish_price': update.wish_price,
                        'wish_list.$.max_range': update.max_range
                    }
                }
            );

            res.status(202).json({message: `${card_doc.wish_list[0].name} (${card_doc.wish_list[0].set_code}) successfully updated.`});
        }
        else{
            res.status(404).json({message: `No such card in your wish list.`});
        }
    } catch (err) {
        res.status(404).json({message: err});
    }
});

//Remove card from wish list
router.delete('/:id/wish_list/:multiverse_id', async (req, res) => {
    try {
        let card_doc = await User.findOne(
            {_id: req.params.id, 'wish_list.multiverse_id': req.params.multiverse_id},
            {_id: 0, 'wish_list.$': 1}
        );

        if(card_doc) {
            await User.update(
                {_id: req.params.id},
                {$pull: {wish_list: {multiverse_id: req.params.multiverse_id}}}
            );

            res.status(200).send({message: `Removed ${card_doc.wish_list[0].name} (${card_doc.wish_list[0].set_code}) from your wish list.`});
        }
        else{
            res.status(404).send({error: 'No such card in your wish list.'});
        }
        
    } catch (err) {
        res.status(404).json({error: err});
    }
});

module.exports = router;