/**
 * Created by lukas on 15.3.16.
 */
var express = require('express');
var passport = require('passport');
var router = express.Router();


/* GET login page. */
router.get('/', function(req, res, next) {
    res.render('signin', { title: 'Log in' });
});

router.post('/', passport.authenticate('local'), function(req, res, next) {
    res.send(req.user);
});

module.exports = router;
