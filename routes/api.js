/**
 * Created by lukas on 15.3.17.
 */
var express = require('express');
var router = express.Router();

router.get('/signedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : false);
});

router.post('/logout', function(req, res) {
    req.logOut();
    res.send(200);
});

/* POST user email availability */
router.post('/check/user/email', function(req, res, next) {
    var User = require('../models/user');
    var data = req.body['data'];

    User.findOne({'email': data}, function(err, result) {
        var statusCode = 200;
        if (err) statusCode = 400;
        if (result) statusCode = 409;
        res.sendStatus(statusCode);
    });
});

router.post('/create/user', function(req, res, next) {
    var User = require('../models/user');
    var data = req.body['data'];

    User.create(data, function(err, result) {
        var statusCode = 200;
        if (err) statusCode = 400;
        res.sendStatus(statusCode);
    });

});

module.exports = router;