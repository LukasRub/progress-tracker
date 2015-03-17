/**
 * Created by lukas on 15.3.17.
 */
var express = require('express');
var router = express.Router();

/* POST users listing. */
router.post('/user/:field', function(req, res, next) {
    var User = require('../models/user');
    var field = req.params['field'];
    var value = req.body['value'];

    User.findOne({field: value}, function(err, result) {
        var statusCode = 200;
        if (err) statusCode = 400;
        if (result) statusCode = 409;
        res.sendStatus(statusCode);
    });
});

module.exports = router;