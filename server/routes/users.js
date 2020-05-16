const express = require('express');
const router = express.Router();
const User = require('../models/User')
const ScrapeList = require('../models/ScrapeList');
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');

//Get specific user by their ObjectId
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch(err) {
        res.json({message: err});
    }
});

//Update specific user email
router.patch('/:id/change-email', 
    [
        check('new_email')
            .trim()
            .isEmail().withMessage('Please enter a valid email.')
            .normalizeEmail()
            .custom(async (new_email, {req}) => {
                return await User.findOne({email: new_email})
                .then(user => {
                    if(user) {
                        if(user.email == req.body.curr_email) {
                            return Promise.reject(`New email must be different from your current email.`)
                        }

                        return Promise.reject(`${new_email} is already in use.`)
                    }
                });
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).send(errors.array());
        }

        try {
            let query = await User.findOne({_id: req.params.id}, {_id: 0, wish_list: 1});

            await query.wish_list.forEach(async (card) => {
                await ScrapeList.updateOne(
                    {name: card.name, set_name: card.set_name, 'notify_list.email': req.body.curr_email},
                    {$set: {'notify_list.$.email': req.body.new_email}}
                );
            })

            console.log(req.body.curr_email)
            console.log(req.body.new_email)

            await User.updateOne(
                {_id: req.params.id},
                {$set: {email: req.body.new_email}},
                (err) => {
                    if(err) throw err;
                    
                    res.status(200).send({ message: `Your email was successfully updated to ${req.body.new_email}`});
                }
            )
        } catch (error) {
            res.status(400).send({ message: error });
        }
    }
)

//Update specific user password
router.patch('/:id/change-password', 
    [
        check('curr_password').custom(async (curr_password, {req}) => {
            let user = await User.findOne({_id: req.params.id});

            let isMatch = await bcrypt.compare(curr_password, user.password).then((result) => {
                return result;
            });

            if(!isMatch) {
                throw new Error('Incorrect current password.');
            }
        }),
        check('new_password')
            .trim()
            .custom(async (new_password, {req}) => {
                let user = await User.findOne({_id: req.params.id});
    
                let isMatch = await bcrypt.compare(new_password, user.password).then((result) => {
                    return result;
                });
    
                if(isMatch) {
                    throw new Error('cannot be the same as your current password');
                }
            })
            .isLength({ min: 8}).withMessage('a min. of 8 characters')
            .matches(/(?=.*[a-z])/).withMessage('one lowercase letter')
            .matches(/(?=.*[A-Z])/).withMessage('one uppercase letter')
            .matches(/(?=.*\d)/).withMessage('one digit')
            .matches(/(?=.*[!@#$*_.])/).withMessage('one special character (!@#$*_.)'),
        check('confirm_new_pw').custom((value, {req}) => {
            if(value !== req.body.new_password) {
                throw new Error('Your new passwords do not match.');
            }

            return true;
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).send(errors.array());
        }

        try {
            await bcrypt.genSalt(10, (err, salt) => {
                if(err) throw err;
        
                bcrypt.hash(req.body.new_password, salt, async (err, hash) => {
                    if(err) throw err;
        
                    await User.updateOne(
                        {_id: req.params.id},
                        {$set: {password: hash}},
                        (err) => {
                            if(err) throw err;

                            res.status(200).send({ message: 'Your password was successfully updated!'});
                        }
                    )
                });
            });
        } catch (error) {
            res.status(400).send({ message: error });
        }
    }
);

//Delete user
router.delete('/:id', 
    [
        check('password').custom(async (password, {req}) => {
            let user = await User.findOne({_id: req.params.id});

            let isMatch = await bcrypt.compare(password, user.password).then((result) => {
                console.log(result)
                return result;
            });

            if(!isMatch) {
                throw new Error('Incorrect password.');
            }
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(422).send(errors.array());
        }

        let user_email = req.body.email;

        try {
            let query = await User.findOne({_id: req.params.id}, {_id: 0, wish_list: 1});

            await query.wish_list.forEach(async (card) => 
                await ScrapeList.updateOne(
                    {name: card.name, set_name: card.set_name},
                    {$pull: {notify_list: {email: user_email}}}
                )
            )

            await User.deleteOne({_id: req.params.id});
            res.status(200).send({message: 'Your account has been deleted.'});
        } catch (err) {
            res.send({message: err});
        }
    }
);

//Get user wish list
router.get('/:id/wish_list', async (req, res) => {
    try {
        let query = await User.findOne({_id: req.params.id}, {_id: 0, wish_list: 1});
        
        res.status(200).json(query.wish_list)
    } catch (err) {
        res.send({message: err});
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
            image_uris: req.body.image_uris,
            isFoil: req.body.isFoil != null ? req.body.isFoil : false
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
            isFoil: req.body.isFoil
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
                        'wish_list.$.wish_price': update.wish_price,
                        'wish_list.$.isFoil': update.isFoil
                    }
                }
            );

            res.status(202).json({message: `${query.wish_list[0].name} (${query.wish_list[0].set_name}) was successfully updated!`});
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