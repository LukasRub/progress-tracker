var express = require('express');
var router = express.Router();

/* GET home page. */
exports.index = function(req, res) {
    res.render('index', { title: 'Express' });
};

/* GET Jade partials */
exports.partials = function (req, res) {
    var name = req.params.name;
    res.render('partials/' + name);
};
