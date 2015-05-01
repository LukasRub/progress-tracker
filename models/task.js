/**
 * Created by lukas on 15.4.23.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var moment = require('moment');

var TaskSchema = new Schema({
    title: {
        type: String,
        required: true
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
    _subtasks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Subtask'
        }
    ],
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
    availableWeight: {
        type: Number,
        default: 100,
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

TaskSchema.pre('save', function(next){
    var task = this;
    var Progress = require('./progress');
    
    var select = (task.isQuantifiable) ? 'current' : 'percentageDone';
    
    Progress.find({'_id': { $in: task._progress}}, select, function(err, progress){
        
        if (err) next(err);

        task[select] = 0;
        task.availableWeight = 100;
        
        for (var i in progress){
            task[select] += progress[i][select];
            if (!task.isQuantifiable) {
                task.availableWeight -= progress[i].percentageDone;
            }
        }
        
        if (task.isQuantifiable) {
            var percentageDone = Math.floor((task.current * 100) / task.goal);
            task.percentageDone = (percentageDone > 100) ? 100 : percentageDone;
        }
        
        next();
        
    });
    
});

TaskSchema.pre('save', function(next){
    var task = this;
    var Subtask = require('./subtask');

    Subtask.find({'_id': { $in: task._subtasks}}, 'weight percentageDone', function(err, subtasks){
        
        if (err) next(err);
        
        var percentageDone = 0;
        
        for (var i in subtasks){
            percentageDone += Math.floor(subtasks[i].percentageDone * subtasks[i].weight / 100);
            task.availableWeight -= subtasks[i].weight;
        }
        
        if (task.isQuantifiable) {
            task.percentageDone = Math.floor(task.percentageDone * task.availableWeight / 100);
        }
        
        task.percentageDone += percentageDone;
        
        next();

    });
});

TaskSchema.pre('remove', true, function(next, done){
    next();
    var task = this;
    var Progress = require('./progress');
    Progress.find({'_id': { $in: task._progress}}).remove(function(){
        done();
    });
});

TaskSchema.pre('remove', true, function(next, done){
    next();
    var task = this;
    var Subtask = require('./subtask');
    Subtask.find({'_id': { $in: task._subtasks}}, function(err, result) {
        for (var i in result) {
            result[i].remove();
        }
        done();
    });
});

TaskSchema.plugin(autoIncrement.plugin, { model: 'Task', field: 'numberId' });
module.exports = mongoose.model('Task', TaskSchema);