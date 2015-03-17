/**
 * Created by lukas on 15.3.16.
 */
(function(){
    var app = angular.module('progress', []);

    app.controller('SignUpFormController', function(){
        this.highlightInputs = function(){
            $('.form-group input').addClass('ng-dirty');
        };
        this.createUser = function(newUser) {
            console.log(newUser);

        }
    });

    app.directive('ensureUnique', ['$http', function($http) {
        return {
            require : 'ngModel',
            link : function($scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.emailAvailable = function(value) {
                    return $http.post('/api/user/'+ attrs.ensureUnique, {'value': value});
                };
            }
        }
    }]);

})();
