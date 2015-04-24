/**
 * Created by lukas on 15.4.23.
 */
var express = require('express');
var router = express.Router();

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
        .populate('_createdBy', 'firstname lastname')
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

    Task.findOne({'NumberId': taskId})
        .populate('_createdBy', 'firstname lastname')
        .populate('_assignedTo', 'firstname lastname')
        .exec(function(err, result) {
            var statusCode = 200;
            if ((err || !result) || !(result._createdBy._id.equals(req.user._id) || result._assignedTo._id.equals(req.user._id))) {
                statusCode = 404;
            }
            console.log('LOGGING:', req.user.firstname, req.user.lastname, 'requested for task id:', taskId, ', status:', statusCode);
            res.status(statusCode).send(result);
        });
});

module.exports = router;