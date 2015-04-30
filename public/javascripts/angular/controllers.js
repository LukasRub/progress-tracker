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

function TasksCtrl($scope, $rootScope, $http, $modal, $location) {
    $scope.tasks = {};
    
    $scope.openNewTaskModal = function(){
        var modalInstance = $modal.open({
            templateUrl: 'partials/taskform.jade',
            controller: TaskFormCtrl,
            size: 'lg'
        });

        modalInstance.result.then(function(task) {
            $http.post('api/private/tasks', {
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
        $http.get('api/private/tasks')
        .success(function(data) {
            $scope.tasks = data;
        });
    };
    
    $scope.openTask = function(id) {
        $location.path('/tasks/' + id);
    };

    $scope.$on('LastRepeaterElement', function(){
    });
    
}



function TaskCtrl($scope, $http, $routeParams, $modal, $location) {
    $scope.task = {};
    $scope.isCollapsed = false;
    
    $scope.getTask = function() {
        $http.get('api/private/tasks/' + $routeParams['id'])
        .success(function(data) {
            $scope.task = data;
        });
    };
    
    $scope.openSubtask = function(id) {
        $location.path('/tasks/' + $scope.task.numberId + '/subtasks/' + id);
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
            $http.post('api/private/tasks/' + task.numberId + '/subtasks', {
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
    
    $scope.openNewProgressModal = function(task) {

        var modalInstance = $modal.open({
            templateUrl: 'partials/progressform.jade',
            controller: ProgressFormCtrl,
            size: 'lg',
            resolve: {
                parentTask: function(){
                    return task;
                }
            }
        });

        modalInstance.result.then(function(progress) {
            $http.post('api/private/tasks/' + task.numberId + '/progress', {
                'data': progress
            })
            .success(function() {
                $scope.getTask();
                $scope.makeNewProgressSuccessful = true;
            })
            .error(function() {
                $scope.makeNewProgressFailed = true;
            });
        });
        
    };

    $scope.openDeleteConfirmationModal = function(task) {

        task.type = 'task';

        var modalInstance = $modal.open({
            templateUrl: 'partials/delete_task.jade',
            controller: DeleteTaskCtrl,
            size: 'sm',
            resolve: {
                task: function(){
                    return task;
                }
            }
         });

        modalInstance.result.then(function(task) {
            $http.delete('api/private/tasks/' + task.numberId)
            .success(function() {
                $location.path('/tasks');
            })
            .error(function() {
                console.log('sum ting wong');
                $scope.createNewSubtaskFailed = true;
            });
        });
        
        
        
    }
}

function SubtaskCtrl($scope, $http, $routeParams, $modal) {
    $scope.subtask = {};
    $scope.isCollapsed = false;

    $scope.getSubtask = function() {
        $http.get('api/private/tasks/' + $routeParams['task_id'] + '/subtasks/' + $routeParams['subtask_id'])
        .success(function(data) {
            $scope.subtask = data;
        })
        .error(function(){
            console.log('bad');
        });
    };

    $scope.openNewProgressModal = function(subtask) {

        var modalInstance = $modal.open({
            templateUrl: 'partials/progressform.jade',
            controller: ProgressFormCtrl,
            size: 'lg',
            resolve: {
                parentTask: function(){
                    return subtask;
                }
            }
        });

        modalInstance.result.then(function(progress) {
            console.log(subtask);
            $http.post('api/private/tasks/' + subtask._parentTask.numberId + '/subtasks/' + subtask.numberId + '/progress', {
                'data': progress
            })
            .success(function() {
                $scope.getSubtask();
                $scope.makeNewProgressSuccessful = true;
            })
            .error(function() {
                $scope.makeNewProgressFailed = true;
            });
        });

    };
}

// Modal form controllers

function TaskFormCtrl($scope, $modalInstance) {
    $scope.task = {
        autoComplete: true,
        color: '#337ab7',
        textColor: "#FFFFFF"
    };

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
        weight: 10,
        autoComplete: true,
        color: '#286090',
        textColor: "#FFFFFF"
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

function ProgressFormCtrl($scope, $modalInstance, parentTask) {
    
    $scope.parentTask = parentTask;
    $scope.progress = {
        color: '#269abc',
        textColor: "#FFFFFF"
    };
    
    if (!parentTask.isQuantifiable) {
        $scope.progress.percentageDone = 10;
    }
    
    $scope.ok = function(form) {
        $modalInstance.close(form);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}

// Confirmation modal controllers

function DeleteTaskCtrl($scope, $modalInstance, task) {
    
    $scope.task = task;
    
    $scope.ok = function(task) {
        $modalInstance.close(task);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    
}