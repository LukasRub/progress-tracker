/**
 * Created by lukas on 15.3.16.
 */
angular.module('progress')
    .controller('GatewayFormController', ['$scope', '$http', '$location', function($scope, $http, $location){

        //$scope.signupSuccessful = false;
        
        this.highlightInputs = function(){
            $('.form-group input').addClass('ng-dirty');

        };

        this.createUser = function(newUser) {
            $http.post('/api/create/user', {'data': newUser})
                .success(function() {
                    $scope.signupSuccessful = true;
                })
                .error(function() {
                    $scope.signupFailed = true;
                })
                .finally(function(){
                    $scope.newUser={};
                    $scope.signup.$setPristine();
                });
        };

        this.loginUser = function(user) {
            $http.post('/signin', {
                email: user.email,
                password: user.password
            }).success(function(){
                $location.path('/');
            }).error(function(){
                $scope.loginFailed = true;
            })
        };

    }]);

