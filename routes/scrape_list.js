const express = require('express');
const router = express.Router();
const ScrapeList = require('../models/ScrapeList');
const { getWebsites } = require('../src/scrape')

//Get cards with non-empty notify_list array
router.get('/', async (req, res) => {
    try {
        if(req.query.nonEmptyNotify == 'true') {
            await ScrapeList.find(
                { "notify_list.0": { $exists: true } }
            )
            .then(cards => res.status(200).json(cards))
            .catch(error => res.status(404).send({ message: error }));
        }
        else {
            ScrapeList.find()
            .sort({ date: -1 })
            .then(cards => res.status(200).json(cards))
            .catch(error => res.status(404).send({ message: error }));
        }
    } catch (error) {
        res.status(400).send({ message: error });
    }
});

//Scrapes then adds card to collection if it doesn't already exist
router.post('/', async (req, res) => {
    try {
        const new_card = new ScrapeList({
            name: req.body.name,
            set_name: req.body.set_name,
            set_code: req.body.set_code
        });

        let query = await ScrapeList.findOne(
            {name: new_card.name, set_name: new_card.set_name}
        );

        if(!query) {
            new_card.websites = await getWebsites(new_card.name, new_card.set_name);

            if(new_card.websites.length) {
                new_card.save();
    
                res.status(200).send({ message: `Found prices for ${new_card.name} (${new_card.set_name})!`});
            }
            else {
                res.status(404).send({ message: `Could not find any prices for ${new_card.name} (${new_card.set_name}). Please check your spelling and try again.`});
            }
        }
        else {
            res.status(204).send();
        }
    } catch (error) {
        res.send({ message: error });
    }
});

//Get card websites
router.get('/:set_name/:card_name/websites', async (req, res) => {
    try {
        let card = {
            name: req.params.card_name,
            set_name: req.params.set_name
        }

        let query = await ScrapeList.findOne(
            {name: card.name, set_name: card.set_name},
            {_id: 0, websites: 1}
        );

        if(query) {
            res.status(200).send(query.websites);
        }
        else {
            res.status(404).send({ message: `${card.name} (${card.set_name}) not found.` });
        }
        
    } catch (error) {
        res.send({ message: error });
    }
});

//Update card's websites array with new website listings
router.put('/:set_name/:card_name/websites', async (req, res) => {
    try {
        let card = {
            name: req.params.card_name,
            set_name: req.params.set_name
        }

        let query = await ScrapeList.findOne(
            {name: card.name, set_name: card.set_name}
        );

        if(query) {
            let websites = await getWebsites(card.name, card.set_name);

            if(websites.length) {
                await ScrapeList.updateOne(
                    {name: card.name, set_name: card.set_name},
                    {$set: {websites: websites}}
                );

                query = await ScrapeList.findOne(
                    {name: card.name, set_name: card.set_name},
                    {_id: 0, websites: 1}
                ); 

                res.status(200).send({ message: `Listings for ${card.name} (${card.set_name}) was successfully updated!`, websites: query.websites});
            }
            else {
                res.status(404).send({ message: `No prices found for ${card.name} (${card.set_name}).`});
            }
        }
        else {
            res.status(404).send({ message: `${card.name} (${card.set_name}) not found.`});
        }
    } catch (error) {
        res.send({ message: error })
    }
});

//Insert new object {email, wish price} to notify list
router.post('/:set_name/:card_name/notify-list', async (req, res) => {
    try {
        let card = {
            name: req.params.card_name,
            set_name: req.params.set_name
        }

        let new_user = {
            email: req.body.email,
            wish_price: req.body.wish_price != null ? req.body.wish_price : 0
        }

        let query = await ScrapeList.findOne(
            {name: card.name, set_name: card.set_name, 'notify_list.email': new_user.email},
            {_id: 0, 'notify_list.$': 1}
        );

        if(!query) {
            await ScrapeList.updateOne(
                {name: card.name, set_name: card.set_name},
                {$push: {notify_list: new_user}}
            );

            res.status(200).send({ message: `${new_user.email} was successfully added to ${card.name}'s (${card.set_name}) notify list.`});
        }
        else {
            res.status(404).send({ message: `${new_user.email} is already in ${card.name}'s (${card.set_name}) notify list.`});
        }
    } catch (error) {
        res.send({ message: error });
    }
});

//Update user information in notify list
router.patch('/:set_name/:card_name/notify-list', async (req, res) => {
    try {
        let card = {
            name: req.params.card_name,
            set_name: req.params.set_name
        }

        let user = {
            email: req.body.email,
            wish_price: req.body.wish_price == null ? 0 : req.body.wish_price
        }

        let query = await ScrapeList.findOne(
            {name: card.name, set_name: card.set_name, 'notify_list.email': user.email},
            {_id: 0, 'notify_list.$': 1}
        );

        if(query) {
            await ScrapeList.updateOne(
                {name: card.name, set_name: card.set_name, 'notify_list.email': user.email},
                {$set: {'notify_list.$.wish_price': user.wish_price}}
            );

            res.status(200).send({ message: `${user.email} notify information for ${card.name}'s (${card.set_name}) successfully updated!`});
        }
        else {
            res.status(404).send({ message: `Could not find ${user.email} in ${card.name}'s (${card.set_name}) notify list.`});
        }
    } catch (error) {
        res.send({ message: error });
    }
});

router.delete('/:set_name/:card_name/notify-list', async (req, res) => {
    try {
        let card = {
            name: req.params.card_name,
            set_name: req.params.set_name
        }

        let user_email = req.query.email;

        let query = await ScrapeList.findOne(
            {name: card.name, set_name: card.set_name, 'notify_list.email': user_email},
            {_id: 0, 'notify_list.$': 1}
        );

        if(query) {
            await ScrapeList.updateOne(
                {name: card.name, set_name: card.set_name},
                {$pull: {notify_list: {email: user_email}}}
            );

            res.status(200).send({ message: `${user_email} successfully removed from ${card.name}'s (${card.set_name}) notify list.`});
        }
        else {
            res.status(404).send({ message: `Could not find ${user_email} in ${card.name}'s (${card.set_name}) notify list.`});
        }
    } catch (error) {
        res.send({ message: error });
    }
});

module.exports = router;