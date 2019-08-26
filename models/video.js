const { mongoose } = require('../models');

const Schema = mongoose.Schema;

const videoSchema = new Schema({
    resolution: [{
        size: {
            type: Number,
            min: 1,
            max: 10,
            require: true
        },
        unit: {
            type: String,
            enum: ['KB', 'MB', 'GB'],
            require: true
        },
        width: {
            type: Number,
            enum: [],
            require: true
        },
        height: {
            type: Number,
            enum: [],
            require: true
        },
        type: {
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
    }],

}, {
        timestamps: true,
        collection: 'videos'
    });

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
