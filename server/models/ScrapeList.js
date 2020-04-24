const mongoose = require('mongoose');

const ScrapeListSchema = mongoose.Schema({
    name: {
        type: String
    },
    set: {
        type: String
    },
    lang: {
        type: Array
    },
    multiverse_id: {
        type: Number
    },
    listings: {
        type: [
            {
                website: String,
                url: String,
                condition: String,
                usd: Number,
                usd_foil: Number,
                eur: Number,
                eur_foil: Number,
                qty: Number,
                seller: String
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
                price_range: Number
            }
        ]
    }
});

module.exports = mongoose.model('scrape_list', ScrapeListSchema);