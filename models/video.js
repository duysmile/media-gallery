const { mongoose } = require('../models');

const Schema = mongoose.Schema;

const videoSchema = new Schema({
    title: {
        type: String,
        minlength: 1,
        maxlength: 100,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    description: {
        type: String,
        minlength: 3,
        maxlength: 1000
    },
    type: [{
        size: {
            type: Number,
            min: 1,
            max: 1024 * 1024 * 1024 * 3,
            require: true
        },
        quality: {
            type: String,
            enum: ['1080p', '720p', '480p'],
            require: true
        },
        url: {
            type: String,
            min: 5,
            max: 300,
            require: true
        }
    }]
}, {
        timestamps: true,
        collection: 'videos'
    });

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
