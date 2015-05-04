/**
 * Created by lukas on 15.3.17.
 */
var express = require('express');
var router = express.Router();

/* Check user email availability */
router.post('/checkemail', function(req, res, next) {
    var User = require('../models/user');
    var data = req.body['data'];

    User.findOne({'email': data}, 'email', function(err, result) {
        var statusCode = 200;
        if (err || ((result && req.user )&& result._id.equals(req.user._id))) statusCode = 400;
        res.status(statusCode).send(result);
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