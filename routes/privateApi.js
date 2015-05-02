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
            res.sendStatus(500);
            return;
        } 
            
        var log = {
            date: moment(),
            info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname + 
                '</a> created the task'
        };
        
        parentResult.logs.push(log);
        parentResult.save(function(err){
            if (err) {
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);

        });
        
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
                return;
            } 
            
            var options = {
                path: '_subtasks._createdBy',
                model: 'User',
                select: 'firstname lastname numberId'
            };

            Task.populate(result, options, function(err, populatedResult){

                var statusCode = 200;
                if (err) statusCode = 500;

                res.status(statusCode).send(populatedResult);

            });
            
    });
});

router.delete('/tasks/:id', function(req, res, next){
    var Task = require('../models/task');
    var taskId = req.params['id'];

    Task.findOne({'numberId': taskId}, function(err, result){
            
        if ((err || !result)
            || !(result._createdBy.equals(req.user._id) || result._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
            return;
        }
        
        result.remove(function(err){
            if (err) {
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);
        });
        
    });
    
});

router.put('/tasks/:id', function(req, res, next){
    var Task = require('../models/task');
    var Subtask = require('../models/subtask');
    var taskId = req.params['id'];
    var task = req.body['data'];
    
    Task.findOne({'numberId': taskId}, function(err, result){

        if ((err || !result)
            || !(result._createdBy.equals(req.user._id) || result._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
            return;
        }
        
        var now = moment();
        
        if (task.status) {
            result.logs.push({
                date: now,
                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                '</a> marked task as completed'
            });
            
            var subtaskLog = {
                date: now,
                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                '</a> marked parent task as completed'
            };
            
            for (var i = 0; i < result._subtasks.length; i++) {
                Subtask.findById(result._subtasks[i], function(err, subtask){
                    if (!err && subtask) {
                        if (subtask.status.toLowerCase() !== 'completed') {
                            subtask.status = "Completed";
                            subtask.dateCompleted = now;
                            subtask.logs.push(subtaskLog);
                            subtask.save();
                        }
                    }
                });
            }
            
            result.status = "Completed";
            result.dateCompleted = now;
            
        } else {
            for (var property in task) {
                if (task.hasOwnProperty(property)) {
                    switch (property) {
                        case 'title':
                            result[property] = task[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed task title to ' + task[property]
                            });
                            break;
                        case 'dateStarted':
                            result[property] = task[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed task date started to ' + moment(task[property]).format('YYYY-MM-DD')
                            });
                            break;
                        case 'dateDue':
                            result[property] = task[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed task due date to ' + moment(task[property]).format('YYYY-MM-DD')
                            });
                            break;
                        case 'description':
                            result[property] = task[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> updated task description'
                            });
                            break;
                        case 'color':
                            result[property] = task[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed task background color to <div style="width: 12px; height: 12px; display: inline-flex;' +
                                ' border: 1px solid #000; background-color: ' + task[property] + '"/>'
                            });
                            break;
                        case 'textColor':
                            result[property] = task[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed task text color to <div style="width: 12px; height: 12px; display: inline-flex;' +
                                ' border: 1px solid #000; background-color: ' + task[property] + '"/>'
                            });
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        
        
        result.save(function(err){
            
            if (err) {
                res.sendStatus(500);
                return;
            }
            res.sendStatus(200);
            
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
            return;
        }

        subtask._createdBy = req.user._id;
        subtask._assignedTo = parentResult._assignedTo;
        subtask.status = 'Created';
        
        Subtask.create(subtask, function(err, childResult){
            
            if (err && !childResult) {
                res.sendStatus(500);
                return;
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
            childResult.logs.push(log);
            parentResult.logs.push(log);
            
            childResult.save(function(err){
                if (err) {
                    res.sendStatus(500);
                    return;
                }
                
                parentResult.save(function(err){
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    res.sendStatus(200);
                });
                
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
        .populate('_progress')
        .exec(function(err, result){

            if ((err || !result)
                || !(result._createdBy._id.equals(req.user._id) || result._assignedTo._id.equals(req.user._id))) {
                res.sendStatus(404);
                return;
            }
            
            res.status(200).send(result);

        });    
});

router.delete('/tasks/:task_id/subtasks/:subtask_id', function(req, res, next){
    var Task = require('../models/task');
    var Subtask = require('../models/subtask');
    var taskId = req.params['task_id'];
    var subtaskId = req.params['subtask_id'];
    
    Subtask.findOne({numberId : subtaskId}, function(err, subtaskResult){

        if ((err || !subtaskResult) || !(subtaskResult._createdBy.equals(req.user._id) || subtaskResult._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
            return;
        }
        
        subtaskResult.remove(function(err){
            if (err) {
                res.sendStatus(500);
                return;
            }
            
            Task.findOne({numberId : taskId}, function(err, taskResult) {
                if (err || !taskResult) {
                    res.sendStatus(500);
                    return;
                }
                taskResult._subtasks.pull(subtaskResult);
                var log = {
                    date: moment(),
                    info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                    '</a> deleted subtask ' + subtaskResult.title
                };
                if (taskResult.isQuantifiable) {
                    log.info += ' Parent task progress has been recalculated to account for ' +
                        (taskResult.availableWeight + subtaskResult.weight)  + '% of the task'
                }
                taskResult.logs.push(log);
                taskResult.save(function(err){
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    res.sendStatus(200);
                });
                
            });
            
        });
        
    });
    
});

router.put('/tasks/:task_id/subtasks/:subtask_id', function(req, res, next) {
    var Task = require('../models/task');
    var Subtask = require('../models/subtask');
    var taskId = req.params['task_id'];
    var subtaskId = req.params['subtask_id'];
    var subtask = req.body['data'];

    Subtask.findOne({'numberId': subtaskId}, function(err, result) {

        if ((err || !result)
            || !(result._createdBy.equals(req.user._id) || result._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
            return;
        }
        
        var now = moment();
        var parentTaskLog = [];

        if (subtask.status) {

            result.logs.push({
                date: now,
                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                '</a> marked subtask as completed'
            });

            parentTaskLog.push({
                date: now,
                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                '</a> marked subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' + result.title +'</a> as completed'
            });

            result.status = "Completed";
            result.dateCompleted = now;
            
        } else {
            for (var property in subtask) {
                if (subtask.hasOwnProperty(property)) {
                    switch (property) {
                        case 'title':
                            result[property] = subtask[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                    '</a> changed subtask title to ' + subtask[property]
                            });
                            parentTaskLog.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                    '</a> changed subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' +
                                    result.title +'</a> title to ' + subtask[property]
                            });
                            break;
                        case 'dateStarted':
                            result[property] = subtask[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                    '</a> changed subtask date started to ' + moment(subtask[property]).format('YYYY-MM-DD')
                            });
                            parentTaskLog.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                    '</a> changed subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' +
                                    result.title +'</a> date started to ' + moment(subtask[property]).format('YYYY-MM-DD')
                            });
                            break;
                        case 'dateDue':
                            result[property] = subtask[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                    '</a> changed subtask due date to ' + moment(subtask[property]).format('YYYY-MM-DD')
                            });
                            parentTaskLog.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                    '</a> changed subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' +
                                    result.title +'</a> date started to ' + moment(subtask[property]).format('YYYY-MM-DD')
                            });
                            break;
                        case 'dateDue':
                            result[property] = subtask[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> updated subtask description'
                            });
                            parentTaskLog.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                    '</a> changed subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' +
                                    result.title +'</a> date started to ' + moment(subtask[property]).format('YYYY-MM-DD')
                            });
                            break;
                        case 'color':
                            result[property] = subtask[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed subtask background color to <div style="width: 12px; height: 12px; display: inline-flex;' +
                                ' border: 1px solid #000; background-color: ' + subtask[property] + '"/>'
                            });
                            parentTaskLog.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' +
                                result.title +'</a> background color to <div style="width: 12px; height: 12px; display: inline-flex;' +
                                ' border: 1px solid #000; background-color: ' + subtask[property] + '"/>'
                            });
                            break;
                        case 'textColor':
                            result[property] = subtask[property];
                            result.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed subtask  text color to <div style="width: 12px; height: 12px; display: inline-flex;' +
                                ' border: 1px solid #000; background-color: ' + subtask[property] + '"/>'
                            });
                            parentTaskLog.logs.push({
                                date: now,
                                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                                '</a> changed subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' +
                                result.title +'</a> text color to <div style="width: 12px; height: 12px; display: inline-flex;' +
                                ' border: 1px solid #000; background-color: ' + subtask[property] + '"/>'
                            });
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        

        result.save(function(err){

            if (err) {
                res.sendStatus(500);
                return;
            }
            
            Task.findOne({'numberId': taskId}, function(err, parentTask){
                if ((!err && parentTask) && !(parentTask._createdBy.equals(req.user._id) || parentTask._assignedTo.equals(req.user._id))) {
                    res.sendStatus(404);
                    return;
                }
                
                for(var i = 0; i < parentTaskLog.length; i++) {
                    parentTask.logs.push(parentTaskLog[i]);
                }

                parentTask.save(function(err){
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    res.sendStatus(200);

                });
                
            });

        });
        
    });
    
});

// PROGRESS

router.post('/tasks/:id/progress', function(req, res, next) {
    var Task = require('../models/task');
    var Progress = require('../models/progress');
    var progress = req.body['data'];
    var taskId = req.params['id'];

    Task.findOne({'numberId': taskId}, function(err, parentResult){
        if((err || !parentResult) || !(parentResult._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
            return;
        }
        
        progress._madeBy = req.user._id;
        
        Progress.create(progress, function(err, childResult) {

            if (err && !childResult) {
                res.sendStatus(500);
                return;
            }

            if (!parentResult.percentageDone) {
                parentResult.status = "Started";
                parentResult.logs.push({
                    date: moment(),
                    info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                        '</a> started the task'
                });
            }
            
            var percentageDone = 0;
            var log = {
                date: moment(),
                info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                '</a> made '
            };
            
            if (parentResult.isQuantifiable) {

                var percentageDoneFromProgress = Math.floor(parentResult.current / parentResult.goal * parentResult.availableWeight);
                var percentageDoneFromSubtasks = parentResult.percentageDone - percentageDoneFromProgress;
                
                var totalProgressPercentageDone = Math.floor((childResult.current + parentResult.current) / parentResult.goal * parentResult.availableWeight);
               
                percentageDone = (totalProgressPercentageDone > parentResult.availableWeight) ? parentResult.availableWeight : totalProgressPercentageDone;
                
                var totalPercentageDone = percentageDoneFromSubtasks + percentageDone;
                
                log.info += childResult.current + ' ' + parentResult.units + ' progress (' + (parentResult.current + 
                    childResult.current) + '/' + parentResult.goal + ' or ' + totalPercentageDone + '% done)';
                
            } else {
                
                percentageDone = parentResult.percentageDone + childResult.percentageDone;
                log.info += childResult.percentageDone  + '% progress (' + percentageDone  + '% done)';
                
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
                if (err) {
                    res.sendStatus(500);
                    return;
                }
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
    var taskId = req.params['task_id'];
    var subtaskId = req.params['subtask_id'];

    Subtask.findOne({'numberId': subtaskId }, function(err, subtaskResult){
        if((err || !subtaskResult) || !(subtaskResult._assignedTo.equals(req.user._id))) {
            res.sendStatus(404);
            return;
        }
        
        Task.findOne({ 'numberId': taskId}, function(err, taskResult){
            if((err || !taskResult) || !(taskResult._assignedTo.equals(req.user._id))) {
                res.sendStatus(404);
                return;
            }
        
            progress._madeBy = req.user._id;
            
            Progress.create(progress, function(err, progressResult) {
        
                if (err && !progressResult) {
                    res.sendStatus(500);
                    return;
                }

                if (!taskResult.percentageDone) {
                    taskResult.status = "Started";
                    taskResult.logs.push({
                        date: moment(),
                        info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                        '</a> started the task'
                    });
                }

                if (!subtaskResult.percentageDone) {
                    
                    subtaskResult.status = "Started";
                    var now = moment();
                    
                    subtaskResult.logs.push({
                        date: now,
                        info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                            '</a> started the subtask'
                    });
                    taskResult.logs.push({
                        date: now,
                        info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                            '</a> started the subtask <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' + 
                            subtaskResult.title +'</a>'
                    });
                }

                var totalPercentageDone = 0;
                var subtaskPercentageDone = 0;
                
                var subtaskLog = {
                    date: moment(),
                    info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                    '</a> made '
                };
                
                var taskLog = {
                    date: subtaskLog.date,
                    info: subtaskLog.info
                };

                if (subtaskResult.isQuantifiable) {

                    subtaskPercentageDone = Math.floor((subtaskResult.current + progressResult.current) / subtaskResult.goal * 100);
                    subtaskPercentageDone = (subtaskPercentageDone > 100) ? 100 : subtaskPercentageDone; 
                    
                    var weightedCurrentSubtaskPercentageDone = Math.floor(subtaskPercentageDone / 100 * subtaskResult.weight);
                    var weightedPreviousSubtaskPercentageDone = Math.floor(subtaskResult.percentageDone / 100 * subtaskResult.weight);
                    
                    totalPercentageDone = taskResult.percentageDone - weightedPreviousSubtaskPercentageDone + weightedCurrentSubtaskPercentageDone;
                       
                    subtaskLog.info += progressResult.current + ' ' + subtaskResult.units + ' progress (' + (subtaskResult.current +
                        progressResult.current) + '/' + subtaskResult.goal + ', or ' + subtaskPercentageDone + '% done)';
                    
                    taskLog.info += progressResult.current + ' ' + subtaskResult.units + ' progress on subtask <a href="tasks/' +
                        taskId + '/subtasks/' + subtaskId + '">' + subtaskResult.title +'</a> (' + (subtaskResult.current +
                        progressResult.current) + '/' + subtaskResult.goal + ' or ' + subtaskPercentageDone + '% done, total ' +
                        totalPercentageDone + '% done)';

                } else {

                    subtaskPercentageDone = subtaskResult.percentageDone +  progressResult.percentageDone;
                    
                    var weightedPreviousSubtaskPercentageDone = Math.floor(subtaskResult.percentageDone * subtaskResult.weight / 100);
                    var weightedCurrentSubtaskPercentageDone = Math.floor(subtaskPercentageDone * subtaskResult.weight / 100);

                    totalPercentageDone = taskResult.percentageDone - weightedPreviousSubtaskPercentageDone + weightedCurrentSubtaskPercentageDone;

                    subtaskLog.info += progressResult.percentageDone  + '% progress (' + subtaskPercentageDone + '% done)';
                    
                    taskLog.info += progressResult.percentageDone  + '% progress on subtask <a href="tasks/' + taskId +
                        '/subtasks/' + subtaskId + '">' + subtaskResult.title +'</a> (' + subtaskPercentageDone + 
                        '% done, total ' + totalPercentageDone + '% done)';

                }
                
                taskResult.logs.push(taskLog);
                subtaskResult.logs.push(subtaskLog);

                if (subtaskResult.autoComplete && (subtaskPercentageDone === 100)) {
                    subtaskResult.status = "Completed";
                    subtaskResult.dateCompleted = moment();
                    var subtaskLog = {
                        date: moment(),
                        info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                        '</a> have completed the subtask'
                    };
                    var taskLog = {
                        date: subtaskLog.date,
                        info: subtaskLog.info + ' <a href="tasks/' + taskId + '/subtasks/' + subtaskId + '">' + subtaskResult.title +'</a>'
                    };
                    subtaskResult.logs.push(subtaskLog);
                    taskResult.logs.push(taskLog);
                }

                if (taskResult.autoComplete && (totalPercentageDone === 100)) {
                    taskResult.status = "Completed";
                    taskResult.dateCompleted = moment();
                    taskResult.logs.push({
                        date: moment(),
                        info: '<a href="users/' + req.user.numberId + '">' + req.user.firstname + ' ' + req.user.lastname +
                        '</a> have completed the task'
                    });
                }
                
                subtaskResult._progress.push(progressResult);
                subtaskResult.save(function(err){
                    
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    
                    taskResult.save(function(err) {
                        
                        if (err) {
                            res.sendStatus(500);
                            return;
                        }
                        
                        res.sendStatus(200);
                    });
                    
                });
                
            });
            
        });
    });
});

module.exports = router;