/**
 * Created by lukas on 15.4.23.
 */
var express = require('express');
var router = express.Router();

// TASK

router.post('/task', function(req, res, next) {
    var Task = require('../models/task');
    var task = req.body['data'];
    
    task._createdBy = req.user._id;
    task._assignedTo = req.user._id;
    task.status = 'Created';
    
    Task.create(task, function(err, result) {
        var statusCode = 200;
        if (err) statusCode = 400;
        console.log('LOGGING:', req.user.firstname, req.user.lastname, 'created a new task:', result.title, ', status:', statusCode);
        res.sendStatus(statusCode)
    });
   
});

router.get('/task', function(req, res, next) {
    var Task = require('../models/task');

    Task.find({'_assignedTo': req.user._id})
        .populate('_createdBy', 'firstname lastname numberId')
        //.populate('_groupId', 'title numberId')
        .exec(function(err, result) {
            var statusCode = 200;
            if (err) statusCode = 500;
            console.log('LOGGING:', req.user.firstname, req.user.lastname, 'requested for tasks:', result.length, ', status:', statusCode);
            res.status(statusCode).send(result);
    });

});

router.get('/task/:id', function(req, res, next) {
    var Task = require('../models/task');
    var taskId = req.params['id'];

    Task.findOne({'numberId': taskId})
        .populate('_createdBy', 'firstname lastname numberId')
        .populate('_assignedTo', 'firstname lastname numberId')
        .populate('_subtasks')
        .populate('_progress')
        .populate('_group', 'title numberId')
        .exec(function(err, result) {
            var statusCode = 200;
            if ((err || !result) || !(result._createdBy._id.equals(req.user._id) || result._assignedTo._id.equals(req.user._id))) {
                statusCode = 404;
            } else {
                var options = {
                    path: '_subtasks._createdBy',
                    model: 'User',
                    select: 'firstname lastname numberId'
                };
                Task.populate(result, options, function(err, result){
                    console.log('LOGGING:', req.user.firstname, req.user.lastname, 'requested for task id:', taskId, ', status:', statusCode);
                    res.status(statusCode).send(result);
                });
            }
        });
});

// SUBTASK

router.post('/subtask', function(req, res, next) {
    
    var Task = require('../models/task');
    var Subtask = require('../models/subtask');
    var subtask = req.body['data'];
    
    Task.findById(subtask.parentTaskId, function(err, parentResult) {
        var statusCode = 200;
        
        if ((err || !parentResult) || !(parentResult._createdBy.equals(req.user._id) || parentResult._assignedTo.equals(req.user._id))) {
            statusCode = 404;
        }
        
        if (statusCode === 200) {

            subtask._createdBy = req.user._id;
            subtask._assignedTo = parentResult._assignedTo;
            subtask.status = 'Created';
            subtask.weight = subtask.percentageWeight / 100;
            delete subtask.percentageWeight;
            
            Subtask.create(subtask, function(err, childResult){
                if (err) statusCode = 400;
                
                else if (childResult) {
                    
                    parentResult.availableWeight -= childResult.weight;
                    parentResult.percentageDone *= parentResult.availableWeight;
                    parentResult._subtasks.push(childResult._id);
                    parentResult.save();
                    
                    console.log('LOGGING:', req.user.firstname, req.user.lastname, 'created a new subtask:', childResult.title, ', for parent task:', parentResult.title, 'status:', statusCode);
                }
                
                res.sendStatus(statusCode)
                
            });
        } else {
            
            res.sendStatus(statusCode);
        }
    });
});

module.exports = router;