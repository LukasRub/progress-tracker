/**
 * Created by lukas on 15.3.16.
 */

function SignInCtrl($scope, $http, $location) {
    $scope.signInUser = function(user) {
        $http.post('/signin', {
            email: user.email,
            password: user.password
        }).success(function(){
            $location.path('/dashboard');
        }).error(function(){
            $scope.signInFailed = true;
            $scope.signinform.email.$setPristine();
            $scope.signinform.password.$setPristine();
        });
    }
}

function SignUpCtrl($scope, $http) {
    $scope.signUpUser = function(user) {
        $http.post('api/public/user', {
            'data': user
        }).success(function() {
                $scope.signUpSuccessful = true;
        }).error(function() {
                $scope.signUpFailed = true;
        }).finally(function(){
            $scope.newUser = {};
            $scope.signupform.$setPristine();
        });
    };
}

function DashboardCtrl($scope) {
    //$scope.message = "Logged in";
}

function TasksCtrl($scope, $http) {
    $scope.tasks = {};
    
    
    
    $scope.getTasks = function() {
        $http.get('api/private/task')
        .success(function(data, status, headers, config) {
            $scope.tasks = data;
            console.log("ok", data);
        })
        .error(function(data, status, headers, config) {
                console.log('err')
        });
    };

    $scope.getTasks();
    
    $scope.createNewTask = function(task) {
        $http.post('api/private/task', {
            'data': task
        })
        .success(function(data, status, headers, config) {
        })
        .error(function(data, status, headers, config) {
        });
    };
}