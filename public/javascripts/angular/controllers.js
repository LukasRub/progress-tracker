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
    $scope.deleteTaskSuccessful = $rootScope.deleteTaskSuccessful;
    delete $rootScope.deleteTaskSuccessful;
    
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
    
}



function TaskCtrl($scope, $http, $routeParams, $modal, $location, $rootScope, $timeout) {
    $scope.task = {};
    $scope.isCollapsed = false;
    $scope.deleteSubtaskSuccessful = $rootScope.deleteSubtaskSuccessful;
    delete $rootScope.deleteSubtaskSuccessful;
    
    $scope.getTask = function() {
        $http.get('api/private/tasks/' + $routeParams['id'])
        .success(function(data) {
            $scope.task = data;
            if ($scope.task._subtasks.length > 0) {
                angular.element('#collapseSubtasks').collapse('show');
            }
            if ($scope.task._progress.length > 0) {
                angular.element('#collapseProgress').collapse('show');
            }
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
            controller: TaskConfirmationCtrl,
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
                    $rootScope.deleteTaskSuccessful = true;
                    $location.path('/tasks');
                })
                .error(function() {
                    $scope.deleteTaskFailed = true;
                });
        });

    };

    $scope.openMarkAsCompleteConfirmationModal = function(task) {
        task.type = 'task';

        var modalInstance = $modal.open({
            templateUrl: 'partials/mark_as_completed.jade',
            controller: TaskConfirmationCtrl,
            size: 'sm',
            resolve: {
                task: function() {
                    return task;
                }
            }
        });

        modalInstance.result.then(function(task) {
            $http.put('api/private/tasks/' + task.numberId, {
                data : {
                    status: 'Completed'
                }
            })
            .success(function() {
                $scope.getTask();
                $scope.modifyTaskSuccessful = true;
            })
            .error(function() {
                $scope.modifyTaskFailed = true;
            });
        });
    };

    $scope.openEditTaskModal = function(task){
        var modalInstance = $modal.open({
            templateUrl: 'partials/taskform.jade',
            controller: EditTaskCtrl,
            size: 'lg',
            resolve: {
                task: function() {
                    return task;
                }
            }
        });

        modalInstance.result.then(function(task) {
            var changeDetected = false;
            var data = {};
            
            if (task.title !== $scope.task.title){
                data['title'] = task.title;
                changeDetected = true;
            }   

            if (!moment(task.dateStarted).isSame($scope.task.dateStarted, 'day')){
                data['dateStarted'] = task.dateStarted;
                changeDetected = true;
            }   
            if (!moment(task.dateDue).isSame($scope.task.dateDue, 'day')){
                data['dateDue'] = task.dateDue;
                changeDetected = true;
            }   
            if (task.description !== $scope.task.description) {
                data['description'] = task.description;
                changeDetected = true;
            }
            if (task.color !== $scope.task.color) {
                data['color'] = task.color;
                changeDetected = true;
            }
            if (task.textColor !== $scope.task.textColor) {
                data['textColor'] = task.textColor;
                changeDetected = true;
            }

            if (changeDetected) {
                $http.put('api/private/tasks/' + task.numberId, {
                    data : data
                })
                .success(function() {
                    $scope.getTask();
                    $scope.modifyTaskSuccessful = true;
                })
                .error(function() {
                    $scope.modifyTaskFailed = true;
                });
            }
            
        });
    };
    
}

function SubtaskCtrl($scope, $http, $routeParams, $modal, $location, $rootScope) {
    $scope.subtask = {};
    $scope.isCollapsed = false;
    
    $scope.getSubtask = function() {
        $http.get('api/private/tasks/' + $routeParams['task_id'] + '/subtasks/' + $routeParams['subtask_id'])
            .success(function(data) {
                $scope.subtask = data;
                if ($scope.subtask._progress.length > 0) {
                    angular.element('#collapseProgress').collapse('show');
                }
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
            $http.post('api/private/tasks/' + $routeParams['task_id'] + '/subtasks/' + subtask.numberId + '/progress', {
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

    $scope.openDeleteConfirmationModal = function(subtask) {

        subtask.type = 'subtask';

        var modalInstance = $modal.open({
            templateUrl: 'partials/delete_task.jade',
            controller: TaskConfirmationCtrl,
            size: 'sm',
            resolve: {
                task: function(){
                    return subtask;
                }
            }
        });

        modalInstance.result.then(function(subtask) {
            $http.delete('api/private/tasks/' + $routeParams['task_id'] + '/subtasks/' + subtask.numberId)
                .success(function() {
                    $rootScope.deleteSubtaskSuccessful = true;
                    $location.path('/tasks/' + $routeParams['task_id']);
                })
                .error(function() {
                    $scope.deleteSubtaskFailed = true;
                });
        });

    };

    $scope.openMarkAsCompleteConfirmationModal = function(task) {
        task.type = 'subtask';

        var modalInstance = $modal.open({
            templateUrl: 'partials/mark_as_completed.jade',
            controller: TaskConfirmationCtrl,
            size: 'sm',
            resolve: {
                task: function() {
                    return task;
                }
            }
        });

        modalInstance.result.then(function(subtask) {
            $http.put('api/private/tasks/' + $routeParams['task_id'] + '/subtasks/' + subtask.numberId, {
                data : {
                    status: 'Completed'
                }
            })
            .success(function() {
                $scope.getSubtask();
                $scope.modifySubtaskSuccessful = true;
            })
            .error(function() {
                $scope.modifySubtaskFailed = true;
            });
        });
    };
    
}

// Modal form controllers

function TaskFormCtrl($scope, $modalInstance) {
    $scope.task = {
        autoComplete: true,
        color: '#31b0d5',
        textColor: "#FFFFFF"
    };
    
    $scope.ok = function(form) {
        $modalInstance.close(form);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}

function EditTaskCtrl($scope, $modalInstance, task) {
    $scope.task = angular.copy(task);
    $scope.task.dateStarted = moment(task.dateStarted).format('YYYY-MM-DD');
    $scope.task.dateDue = moment(task.dateDue).format('YYYY-MM-DD');
    $scope.editMode = true;

    $scope.dateStartedPickerOptions = {
        maxDate: $scope.task.dateStarted
    };

    $scope.dateDuePickerOptions = {
        minDate: $scope.task.dateDue
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
        color: '#337ab7',
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

function TaskConfirmationCtrl($scope, $modalInstance, task) {
    
    $scope.task = task;
    
    $scope.ok = function(task) {
        $modalInstance.close(task);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    
}