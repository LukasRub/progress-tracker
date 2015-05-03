/**
 * Created by lukas on 15.4.27.
 */
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var Schema = mongoose.Schema;

var GroupSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    _administrator : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _users: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _invitations: [{
        type: Schema.Types.ObjectId,
        ref: 'Invitation'
    }],
    description: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: null
    },
    textColor: {
        type: String,
        default: null
    }
});

GroupSchema.plugin(autoIncrement.plugin, { model: 'Group', field: 'numberId' });
module.exports = mongoose.model('Group', GroupSchema);