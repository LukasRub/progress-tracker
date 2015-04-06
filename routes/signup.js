/**
 * Created by lukas on 15.3.16.
 */
var express = require('express');
var router = express.Router();

/* GET registration page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Register an account' });
});

module.exports = router;