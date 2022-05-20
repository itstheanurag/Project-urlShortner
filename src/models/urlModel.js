const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        unique: true,
        trim: true,
        lowercase : true
    },
    
    longUrl: {
        type: String,
        required: 'Long Url is required',
        trim: true
    },
    shortUrl: {
        type: String,
        unique: true,
        trim: true,
        lowercase : true
    },
}, { timestamps: true });

module.exports = mongoose.model('url', urlSchema)