const { mongoose } = require('./index');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 3,
        max: 100,
        unique: true,
        // required: true
    },
    password: {
        type: String,
        min: 5,
        max: 300,
        // required: true
    },
    email: {
        type: String,
        max: 300,
        required: true,
        unique: true
    },
    facebook: {
        userId: {
            type: String,
            max: 100
        }
    },
    token: {
        type: String,
        max: 300
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        // required: true
    },
    geoPosition: {
        type: [Number]
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
