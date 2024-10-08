const mongoose = require('mongoose');

const prefixSchema = new mongoose.Schema({
    guildId: { type: String },
    prefix: { type: String },
});

const PrefixModel = mongoose.model('Prefix', prefixSchema);

module.exports = PrefixModel;