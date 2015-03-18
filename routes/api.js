/**
 * Created by lukas on 15.3.17.
 */
var express = require('express');
var router = express.Router();

/* GET */
router.get('/user/email', function(req, res, next) {
    var User = require('../models/user');
    var value = req.query['val'];

    User.findOne({'email': value}, function(err, result) {
        var statusCode = 200;
        if (err) statusCode = 400;
        if (result) statusCode = 409;
        res.sendStatus(statusCode);
    });
});

module.exports = router;