/**
 * Created by lukas on 15.4.23.
 */
var express = require('express');
var moment = require('moment');
var router = express.Router();

// TASK

router.post('/tasks', function(req, res, next) {
    var Task = require('../models/task');
    var task = req.body['data'];
    
    task._createdBy = req.user._id;
    task._assignedTo = req.user._id;
    task.status = 'Created';
    
    Task.create(task, function(err, parentResult) {

        if (err && !parentResult) {
            
            console.log('LOGGING:', req.user.firstname, req.user.lastname, 'failed to create a new task:', err);
            res.sendStatus(400);
        }
            
        var log = {
            date: moment(),
            info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname + 
                '</a> created the task'
        };
        
        parentResult.logs.push(log);
        parentResult.save();
        
        console.log('LOGGING:', req.user.firstname, req.user.lastname, 'created a new task:', parentResult.title);
        res.sendStatus(200);
        
    });
    
});

router.get('/tasks', function(req, res, next) {
    var Task = require('../models/task');

    Task.find({'_assignedTo': req.user._id})
        .populate('_createdBy', 'firstname lastname numberId')
        .populate('_groupId', 'title numberId')
        .exec(function(err, result) {
            
            var statusCode = 200;
            if (err) statusCode = 500;
            
            console.log('LOGGING:', req.user.firstname, req.user.lastname, 'requested for tasks:', result.length, ', status:', statusCode);
           
            res.status(statusCode).send(result);
            
    });
});

router.get('/tasks/:id', function(req, res, next) {
    var Task = require('../models/task');
    var taskId = req.params['id'];

    Task.findOne({'numberId': taskId})
        .populate('_createdBy', 'firstname lastname numberId')
        .populate('_assignedTo', 'firstname lastname numberId')
        .populate('_subtasks')
        .populate('_progress')
        .populate('_group', 'title numberId')
        .exec(function(err, result) {
            
            if ((err || !result) 
                    || !(result._createdBy._id.equals(req.user._id) || result._assignedTo._id.equals(req.user._id))) {
                res.sendStatus(404);
            }
            
            var options = {
                path: '_subtasks._createdBy',
                model: 'User',
                select: 'firstname lastname numberId'
            };
            
            Task.populate(result, options, function(err, populatedResult){
                
                var statusCode = 200;
                if (err) statusCode = 500;
                
                console.log('LOGGING:', req.user.firstname, req.user.lastname, 'requested for task id:', taskId, ', ' +
                'status:', statusCode);
                
                res.status(statusCode).send(populatedResult);
                
            });
        
    });
});

router.delete('/tasks/:id', function(req, res, next){
    var Task = require('../models/task');
    var taskId = req.params['id'];
    console.log(taskId);

    Task.findOne({'numberId': taskId})
        .exec(function(err, result){
            
            if ((err || !result)
                || !(result._createdBy.equals(req.user._id) || result._assignedTo.equals(req.user._id))) {
                res.sendStatus(404);
            }
            
            result.remove(function(err){
                if (err) {
                    res.sendStatus(400);
                } else {
                    res.sendStatus(200);
                }
            });
            
        });
    
});

// SUBTASK

router.post('/tasks/:id/subtasks', function(req, res, next) {
    
    var Task = require('../models/task');
    var Subtask = require('../models/subtask');
    var subtask = req.body['data'];
    var taskId = req.params['id'];
    
    Task.findOne({'numberId': taskId}, function(err, parentResult) {
        
        if ((err || !parentResult) || !(parentResult._createdBy.equals(req.user._id) || parentResult._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
        }

        subtask._createdBy = req.user._id;
        subtask._assignedTo = parentResult._assignedTo;
        subtask._parentTask = parentResult._id;
        subtask.status = 'Created';
        
        Subtask.create(subtask, function(err, childResult){
            
            if (err && !childResult) {
                console.log('LOGGING:', req.user.firstname, req.user.lastname, 'failed to create a new subtask:', err);
                res.sendStatus(400);
            }

            var log = {
                date: moment(),
                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                    '</a> created a subtask <a href="tasks/' + parentResult.numberId + '/subtasks/' + childResult.numberId 
                    + '">' + childResult.title + '</a> (subtask weight: ' + childResult.weight + '%)' 
            };
            
            if (parentResult.isQuantifiable) {
                log.info += '. Parent task progress has been recalculated to account for ' +
                (parentResult.availableWeight - childResult.weight)  + '% of the task';
            }
            parentResult._subtasks.push(childResult);
            parentResult.logs.push(log);
            
            parentResult.save(function(err){
                if (err) res.sendStatus(400);
                console.log('LOGGING:', req.user.firstname, req.user.lastname, 'created a new subtask:', childResult.title,
                    ', for parent task:', parentResult.title);
                res.sendStatus(200);
            });
            
        });

    });
    
});

router.get('/tasks/:task_id/subtasks/:subtask_id', function(req, res, next){
    var Subtask = require('../models/subtask');
    var subtaskId = req.params['subtask_id'];

    Subtask.findOne({'numberId': subtaskId})
        .populate('_createdBy', 'firstname lastname numberId')
        .populate('_assignedTo', 'firstname lastname numberId')
        .populate('_parentTask', 'numberId')
        .populate('_progress')
        .exec(function(err, result){

            if ((err || !result)
                || !(result._createdBy._id.equals(req.user._id) || result._assignedTo._id.equals(req.user._id))) {
                res.sendStatus(404);
            }
            
            res.status(200).send(result);

        });    
});

// PROGRESS

router.post('/tasks/:id/progress', function(req, res, next) {
    var Task = require('../models/task');
    var Progress = require('../models/progress');
    var progress = req.body['data'];
    var taskId = req.params['id'];
    console.log(taskId);
    Task.findOne({'numberId': taskId}, function(err, parentResult){
        if((err || !parentResult) || !(parentResult._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
        }
        
        progress._madeBy = req.user._id;
        
        Progress.create(progress, function(err, childResult) {

            if (err && !childResult) {
                console.log('LOGGING:', req.user.firstname, req.user.lastname, 'failed to make new progress:', err);
                res.sendStatus(400);
            }

            var log = {
                date: moment(),
                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                    '</a> made progress of '
            };
            
            if (!parentResult.percentageDone) {
                parentResult.status = "Started";
                parentResult.logs.push({
                    date: moment(),
                    info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                        '</a> started the task'
                });
            }
            
            var percentageDone = 0;
            
            if (parentResult.isQuantifiable) {
                
                percentageDone = Math.floor(((parentResult.current + childResult.current) * parentResult.availableWeight) / parentResult.goal);
                percentageDone = (percentageDone > parentResult.availableWeight) ? parentResult.availableWeight : percentageDone;
                
                log.info += childResult.current + ' ' + parentResult.units + ' (' + (parentResult.current + 
                    childResult.current) + '/' + parentResult.goal + ', or ' + percentageDone + '% done)';
                
            } else {
                
                log.info += childResult.percentageDone  + '% (' + (parentResult.percentageDone + childResult.percentageDone)  + '% done)';
                
            }

            parentResult.logs.push(log);
            
            if (parentResult.autoComplete && (percentageDone === 100)) {
                parentResult.status = "Completed";
                parentResult.dateCompleted = moment();
                parentResult.logs.push({
                    date: moment(),
                    info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                        '</a> have completed the task'
                });
            }
            
            parentResult._progress.push(childResult);
            
            parentResult.save(function(err){
                if (err) res.sendStatus(400);
                console.log('LOGGING:', req.user.firstname, req.user.lastname, 'made progress for parent task:',
                    parentResult.title);
                res.sendStatus(200);
                
            });
            
        });
        
    });
    
});

router.post('/tasks/:task_id/subtasks/:subtask_id/progress', function(req, res, next) {
    var Task = require('../models/task');
    var Subtask = require('../models/subtask');
    var Progress = require('../models/progress');
    var progress = req.body['data'];
    var subtaskId = req.params['subtask_id'];

    Subtask.findOne({'numberId': subtaskId }, function(err, subtaskResult){
        if((err || !subtaskResult) || !(subtaskResult._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
        }
        
        Task.findOne({ '_id': subtaskResult._parentTask}, function(err, taskResult){
            if((err || !taskResult) || !(taskResult._assignedTo.equals(req.user._id))) {
                res.sendStatus(404);
            }
        
            progress._madeBy = req.user._id;
            
            Progress.create(progress, function(err, progressResult) {
        
                if (err && !progressResult) {
                    console.log('LOGGING:', req.user.firstname, req.user.lastname, 'failed to make new progress:', err);
                    res.sendStatus(400);
                }
                
                subtaskResult._progress.push(progressResult);
                subtaskResult.save(function(err){
                    
                    if (err) res.sendStatus(400);
                    
                    taskResult.save(function(err) {
                        if (err) res.sendStatus(400);
                        
                        res.sendStatus(200);
                    })
                    
                });
                
            });
            
        });
    });
});

module.exports = router;