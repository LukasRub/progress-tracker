/**
 * Created by lukas on 15.3.16.
 */
var express = require('express');
var router = express.Router();

/* GET registration page. */
router.get('/', function(req, res, next) {
    res.render('signup', { title: 'Register an account' });
});

/* POST registration data. */
router.post('/', function(req, res, next) {
    console.log(req.body);
    res.json({ message: 'Bear created!' });
});

module.exports = router;