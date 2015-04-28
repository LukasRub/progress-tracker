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

function TasksCtrl($scope, $http, $modal, $location) {
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
    
    $scope.getTaskStatusColor = function(task) {
        var statusColor = "#000";
        switch (task.toLowerCase()) {
            case 'created':
                statusColor = "#FFC848";
                break;
        }
        return statusColor;
    };
    
    $scope.openTask = function(id) {
        $location.path('/tasks/' + id);
    };
    
}



function TaskCtrl($scope, $http, $routeParams, $modal) {
    $scope.task = {};
    $scope.isCollapsed = false;
    
    $scope.getTask = function() {
        $http.get('api/private/task/' + $routeParams['id'])
        .success(function(data) {
            $scope.task = data;
            $scope.taskFound = true;
        });
    };

    $scope.openNewSubtaskModal = function(task){

        var modalInstance = $modal.open({
            templateUrl: 'partials/subtaskform.jade',
            controller: SubtaskFormCtrl,
            size: 'lg',
            resolve: {
                parentTask: function(){
                    return task;
                }
            }
        });

        modalInstance.result.then(function(subtask) {
            $http.post('api/private/subtask', {
                'data': subtask
            })
            .success(function() {
                $scope.getTask();
                $scope.createNewSubtaskSuccessful = true;
            })
            .error(function() {
                $scope.createNewSubtaskFailed = true;
            });
        });
    };
    
}

// Modal form controllers

function TaskFormCtrl($scope, $modalInstance) {

    $scope.ok = function(form) {
        $modalInstance.close(form);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}

function SubtaskFormCtrl($scope, $modalInstance, parentTask) {
    
    $scope.parentTask = parentTask;
    $scope.subtask = {
        percentageWeight: 10,
        parentTaskId: parentTask._id
    };
    
    $scope.datetimepickerOptions = {
        minDate: moment(parentTask.dateStarted).format('YYYY-MM-DD') || false,
        maxDate: moment(parentTask.dateDue).format('YYYY-MM-DD') || false
    };
    
    $scope.ok = function(form) {
        $modalInstance.close(form);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

}