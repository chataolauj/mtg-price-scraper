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
        type: Number,
        unique: true
    },
    lowest_listings: {
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
                url: String
            }
        ]
    },
    notify_list: {
        type: Array
    }
});

module.exports = mongoose.model('scrape_list', ScrapeListSchema);