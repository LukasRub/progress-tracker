/**
 * Created by lukas on 15.3.16.
 */
(function(){
    var app = angular.module('progress', []);
    app.controller('SignUpFormController', function(){
        this.newUser = {};
        this.submitted = false;

        this.createUser = function() {
            if (this.signup-form.$valid) {
                // Submit
            } else {
                this.submitted = true;
            }

        }
    });
})();
