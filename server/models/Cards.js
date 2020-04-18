const mongoose = require('mongoose');

const MTGSchema = mongoose.Schema({ 
    multiverse_id: {
      type: Number
    },
    name: {
        type: String
    },
    tcgplayer_id: {
        type: Number
    },
    lang: {
      type: String
    },
    image_uris: {
        type: Object
    },
    set_name: {
      type: String
    },
    set_code: {
      type: String
    }
});

module.exports = mongoose.model('mtg_cards', MTGSchema);