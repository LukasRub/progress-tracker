/**
 * Created by lukas on 15.3.16.
 */
(function(){
    var app = angular.module('progress', []);

//    $locationProvider.html5Mode(true);
//    $locationProvider.hashPrefix('!');

    app.controller('GatewayFormController', ['$http', '$location', '$scope', function($scope, $http, $location){

        $scope.signupSuccessful = false;

        this.highlightInputs = function(){
            $('.form-group input').addClass('ng-dirty');
        };

        this.createUser = function(newUser) {
            $http.post('/api/create/user', {'data': newUser})
                .success(function() {
                    $scope.signupSuccessful = true;
                    console.log(signup.signupSuccessful);
                })
                .error(function() {
                    $scope.signupSuccessful = false;
                    console.log(this.signupSuccessful);
                });
        };

        this.loginUser = function(user) {
            console.log(user);
        };

    }]);

    app.directive('ensureUniqueEmail', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
        return {
            require : 'ngModel',
            link : function($scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.emailAvailable = function(email) {
                    var deffered = $q.defer();
                    $timeout(function() {
                        $http.post('/api/check/user/email', { data: email })
                            .success(function() {
                                deffered.resolve();
                                $scope.signupSuccessful = true;
                            })
                            .error(function() {
                                deffered.reject();
                                $scope.signupSuccessful = true;
                            });
                    }, 1000);
                    return deffered.promise;
                };
            }
        }
    }]);
})();
