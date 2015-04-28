/**
 * Created by lukas on 15.4.27.
 */
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var Schema = mongoose.Schema;

var SubtaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    weight: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    dateCreated: {
        type: Date,
        default: Date.now(),
        required: true
    },
    dateStarted: {
        type: Date,
        default: Date.now(),
        required: true
    },
    dateDue: {
        type: Date,
        default: null
    },
    dateCompleted: {
        type: Date,
        default: null
    },
    _createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _progress: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Progress'
        }
    ],
    isQuantifiable: {
        type: Boolean,
        default: false
    },
    goal: {
        type: Number,
        default: null
    },
    current: {
        type: Number,
        default: 0
    },
    units: {
        type: String,
        default: null
    },
    percentageDone: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
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
    },
    status: {
        type: String,
        enum: ['Created', 'Started', 'Completed']
    }
});

SubtaskSchema.plugin(autoIncrement.plugin, { model: 'Subtask', field: 'numberId' });
module.exports = mongoose.model('Subtask', SubtaskSchema);