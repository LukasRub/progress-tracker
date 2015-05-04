/**
 * Created by lukas on 15.4.6.
 */
angular.module('progress', ['ngResource', 'ngRoute', 'ui-rangeSlider', 'datetimepicker', 'textAngular', 'ui.bootstrap', 
    'angular-svg-round-progress', 'minicolors' ])
    .config(['$routeProvider', '$locationProvider', '$httpProvider' , 'datetimepickerProvider', 
        function($routeProvider, $locationProvider, $httpProvider, datetimepickerProvider) {

        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
            var deferred = $q.defer();

            $http.get('/signedin').success(function(user){
                if (user) {
                    $rootScope.message = 'You are logged in.';
                    deferred.resolve();
                }
                else {
                    $rootScope.message = 'You need to log in.';
                    deferred.reject();
                    $location.path('/signin');
                }
            });

            return deferred.promise;
        };

        $httpProvider.interceptors.push(function($q, $location) {
            return {
                response: function(response) {
                    return response;
                },
                responseError: function(response) {
                    if (response.status === 401){
                        $location.replace().url('/signin');
                    }
                    if (response.status === 404) {
                        $location.replace().url('/404');
                    }
                    return $q.reject(response);
                }
            };
        });
            

        $routeProvider
            .when('/', {
                templateUrl: 'partials/home'
            })
            .when('/tasks', {
                templateUrl: 'partials/my_tasks',
                controller: TasksCtrl,
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/groups', {
                templateUrl: 'partials/my_groups',
                controller: GroupsCtrl,
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/tasks/:id', {
                templateUrl: 'partials/task',
                controller: TaskCtrl,
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/groups/:id', {
                templateUrl: 'partials/group',
                controller: GroupCtrl,
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/tasks/:task_id/subtasks/:subtask_id', {
                templateUrl: 'partials/subtask',
                controller: SubtaskCtrl,
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/signin', {
                templateUrl: 'partials/sign_in_form',
                controller: SignInCtrl
            })
            .when('/signup', {
                templateUrl: 'partials/sign_up_form',
                controller: SignUpCtrl
            })
            .otherwise({
                redirectTo: '/404'
            });

        $locationProvider.html5Mode(true)

        datetimepickerProvider.setOptions({
            format: 'YYYY-MM-DD'
            
        });

    }]) // end of config
    
    .run(function($rootScope, $http, $location){
        $rootScope.message = '';
        
        // Logout function is available in any pages
        $rootScope.signOutUser = function(){
            $rootScope.message = 'Logged out.';
            $http.post('/signout').success(function(){
                $location.path('/signin');
            });
        };
        
    });