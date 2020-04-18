const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({ 
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    wish_list: {
        type: [
            {
                multiverse_id: Number,
                name: String,
                set_name: String,
                set_code: String,
                condition: Array,
                wish_price: Number
            }
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('users', UserSchema);