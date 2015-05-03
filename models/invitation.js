/**
 * Created by lukas on 15.4.27.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var InvitationSchema = new Schema({
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    _inviter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _invitee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
    
});

module.exports = mongoose.model('Invitation', InvitationSchema);