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
    lang: {
        type: Array
    },
    multiverse_id: {
        type: Number
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
                            eur_foil: Number
                        }
                    ]
                }
            }
        ]
    },
    scrape_urls: {
        type: [
            {
                website: String,
                base_url: String
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

module.exports = mongoose.model('scrape_list', ScrapeListSchema);