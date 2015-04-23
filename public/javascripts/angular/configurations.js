/**
 * Created by lukas on 15.4.6.
 */
angular.module('progress', ['ngResource', 'ngRoute', 'datetimepicker', 'textAngular', 'ui.bootstrap', 
    'angular-svg-round-progress'])
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
                    if (response.status === 401)
                        $location.url('/signin');
                    return $q.reject(response);
                }
            };
        });

        $routeProvider
            .when('/', {
                templateUrl: 'partials/home'
            })
            .when('/dashboard', {
                templateUrl: 'partials/dashboard',
                controller: DashboardCtrl,
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/tasks', {
                templateUrl: 'partials/tasks',
                controller: TasksCtrl,
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .when('/signin', {
                templateUrl: 'partials/signin',
                controller: SignInCtrl
            })
            .when('/signup', {
                templateUrl: 'partials/signup',
                controller: SignUpCtrl
            })
            .otherwise({
                redirectTo: '/404'
            });

        $locationProvider.html5Mode(true);

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