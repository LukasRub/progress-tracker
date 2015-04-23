/**
 * Created by lukas on 15.3.17.
 */
var express = require('express');
var router = express.Router();

/* Check user email availability */
router.post('/checkemail', function(req, res, next) {
    var User = require('../models/user');
    var data = req.body['data'];

    User.findOne({'email': data}, function(err, result) {
        var statusCode = 200;
        if (err) statusCode = 400;
        if (result) statusCode = 409;
        console.log('LOGGING: Email availability of', data, 'was requested, status:', statusCode);
        res.sendStatus(statusCode);
    });
});

/* Sign up new user */
router.post('/user', function(req, res, next) {
    var User = require('../models/user');
    var data = req.body['data'];

    User.create(data, function(err, result) {
        var statusCode = 200;
        if (err) statusCode = 400;
        console.log('LOGGING: A new user', result.firstname, result.lastname, 'was created.');
        res.sendStatus(statusCode);
    });

});

module.exports = router;