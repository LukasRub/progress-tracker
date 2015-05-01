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
        max: 100
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    dateStarted: {
        type: Date,
        default: Date.now()
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
        max: 100
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
    autoComplete: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Created', 'Started', 'Completed'],
        default: 'Created'
    },
    logs: [{
        date: {
            type: Date,
            default: Date.now()
        },
        info: {
            type: String,
            required: true
        }
    }]
});

SubtaskSchema.pre('save', function(next){
    var subtask = this;
    var Progress = require('./progress');

    var select = (subtask.isQuantifiable) ? 'current' : 'percentageDone';

    Progress.find({'_id': { $in: subtask._progress}}, select, function(err, progress){

        if (err) next(err);

        subtask[select] = 0;

        for (var i in progress) {
            subtask[select] += progress[i][select];
        }

        if (subtask.isQuantifiable) {
            var percentageDone = Math.floor((subtask.current * 100) / subtask.goal);
            subtask.percentageDone = (percentageDone > 100) ? 100 : percentageDone;
        }

        next();

    });
});

SubtaskSchema.pre('remove', function(next){
    var subtask = this;
    var Progress = require('./progress');
    Progress.find({'_id': { $in: subtask._progress}}).remove(function(){
        next();
    });
});

SubtaskSchema.plugin(autoIncrement.plugin, { model: 'Subtask', field: 'numberId' });
module.exports = mongoose.model('Subtask', SubtaskSchema);