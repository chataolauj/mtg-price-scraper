const mongoose = require('mongoose');

const ScrapeListSchema = mongoose.Schema({
    name: {
        type: String
    },
    set_name: {
        type: String
    },
    set_code: {
        type: String
    },
    websites: {
        type: [
            {
                website: String,
                url: String,
                listings: {
                    type: [
                        {
                            qty: Number,
                            condition: String,
                            usd: Number,
                            usd_foil: Number,
                            eur: Number,
                            eur_foil: Number,
                            shipping: Number,
                            total_price: Number
                        }
                    ]
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    notify_list: {
        type: [
            {
                email: String,
                wish_price: Number
            }
        ]
    }
});

module.exports = mongoose.model('scrape_list', ScrapeListSchema, 'scrape_list');