const express = require('express');
const router = express.Router();
const Cards = require('../models/Cards')

//Get search results
router.get('/', async (req, res) => {
    let card_name = req.query.card_name;

    try {
        let queried_cards = await Cards.aggregate([
            {
              $searchBeta: {
                text: {
                  query: card_name,
                  path: ["name", "set_name"],
                  fuzzy: {
                      maxEdits: 2,
                      prefixLength: 2,
                      maxExpansions: 100
                  }
                }
              }
            },
            { $limit: 25 },
            {
              $project: {
                _id: 0,
                multiverse_id: 1,
                name: 1,
                set_name: 1,
                set_code: 1,
                image_uris: 1
              }
            }
        ]);

        res.status(200).json(queried_cards);
    }
    catch (error) {
        res.status(404).send({ message: error })
    }
});

module.exports = router;