/**
 * Created by lukas on 15.4.23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var TaskSchema = new Schema({
    title: {
        type: String,
        required: true
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
        default: Date.now(),
        required: true
    },
    dateCompleted: {
        type: Date,
        default: Date.now()
    },
    _assignedTo: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    isQuantifiable: {
        type: Boolean,
        default: false,
        required: true
    },
    goal: {
        type: Number
    },
    percentageDone: {
        type: Number,
        default: 0,
        required: true
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending, Started, Completed']
    } 
});

TaskSchema.plugin(autoIncrement.plugin, { model: 'Task', field: 'NumberId' });
module.exports = mongoose.model('Task', TaskSchema);