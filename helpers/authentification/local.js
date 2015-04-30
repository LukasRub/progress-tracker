/**
 * Created by lukas on 15.4.6.
 */
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/user');

module.exports = function(passport) {
    
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(username, password, done) {
            User.findOne({ email: username }, function (err, user) {
                if (err) return done(err);
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                user.comparePassword(password, function(err, isMatch){
                    if (err) return done(err);
                    if (!isMatch) {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                    return done(null, user);
                });
            });
        }
    ));
};