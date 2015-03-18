/**
 * Created by lukas on 15.3.16.
 */
(function(){
    var app = angular.module('progress', []);

    app.controller('GatewayFormController', function(){
        this.highlightInputs = function(){
            $('.form-group input').addClass('ng-dirty');
        };
        this.createUser = function(newUser) {
            console.log(newUser);
        };
        this.loginUser = function(user) {
            console.log(user);
        };
    });

    app.directive('ensureUniqueEmail', ['$http', function($http) {
        return {
            require : 'ngModel',
            link : function($scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.emailAvailable = function(email) {
                    return $http.get('/api/user/email?val=' + email);
                };
            }
        }
    }]);

})();
