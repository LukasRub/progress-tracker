/**
 * Created by lukas on 15.3.16.
 */

function SignInCtrl($scope, $http, $location) {
    $scope.signInUser = function(user) {
        $http.post('/signin', {
            email: user.email,
            password: user.password
        }).success(function(){
            $location.path('/');
        }).error(function(){
            $scope.signInFailed = true;
        });
    }
}

function SignUpCtrl($scope, $http, $location) {
    $scope.signUpUser = function(user) {
        $http.post('/api/create/user', {
            'data': user
        }).success(function() {
                $scope.signUpSuccessful = true;
        }).error(function() {
                $scope.signUpFailed = true;
        }).finally(function(){
            $scope.newUser = {};
            $scope.signUpForm.$setPristine();
        });
    };
}