const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({ 
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    wishList: {
        type: Array
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Users', UserSchema);