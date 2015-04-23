var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.connect('mongodb://localhost/progress');
autoIncrement.initialize(connection);

var routes = require('./routes/index');
var publicApi = require('./routes/publicApi');
var privateApi = require('./routes/privateApi');


var app = express();

app.set('views', path.join(__dirname, 'views')); // view engine setup
app.set('view engine', 'jade');
app.set('view options', {
    layout: false
});
//app.use(favicon(__dirname + '/public/favicon.ico')); // uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

require('./helpers/authentification/local.js')(passport);

var auth = function(req, res, next){
    if (!req.isAuthenticated())
        res.send(401);
    else
        next();
};

app.get('/', routes.index);
app.use('/public', publicApi);
app.use('/privateApi', auth, privateApi);

//==================================================================
// route to test if the user is logged in or not
app.get('/signedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : null);
});

app.get('/data', auth, function(req, res) {
    res.send(req.user);
});

// route to log in
app.post('/signin', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

// route to log out
app.post('/signout', function(req, res){
    req.logOut();
    res.sendStatus(200);
});
//==================================================================

app.get('/partials/:name', routes.partials);
app.get('/*', routes.index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;