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

function TasksCtrl($scope, $http, $modal) {
    $scope.tasks = {};
    
    $scope.openNewTaskModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partials/taskform.jade',
            controller: TaskFormCtrl,
            size: 'lg'
        });

        modalInstance.result.then(function(task) {
            $http.post('api/private/task', {
                'data': task
            })
            .success(function() {
                $scope.getTasks();  
                $scope.createNewTaskSuccessful = true;
            })
            .error(function() {
                $scope.createNewTaskFailed = true;
            });
        });
    };
    
    $scope.getTasks = function() {
        $http.get('api/private/task')
        .success(function(data) {
            $scope.tasks = data;
        });
    };
    
    $scope.$on('LastRepeaterElement', function() {

    });

}

function TaskFormCtrl($scope, $modalInstance) {
    
    $scope.ok = function(task) {
        $modalInstance.close(task);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}