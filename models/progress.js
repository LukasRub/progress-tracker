/**
 * Created by lukas on 15.4.27.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProgressSchema = new Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    _madeBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    current: {
        type: Number,
        default: null
    },
    percentageDone: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: "#FFFFFF"
    },
    textColor: {
        type: String,
        default: "#000000"
    }
}, {
    collection: 'progress'
});

module.exports = mongoose.model('Progress', ProgressSchema);