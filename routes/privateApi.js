/**
 * Created by lukas on 15.4.23.
 */
var express = require('express');
var router = express.Router();

router.post('/create/task', function(req, res, next) {
    var User = require('../models/task');
    var data = req.body['data'];

    console.log(data);

});

module.exports = router;