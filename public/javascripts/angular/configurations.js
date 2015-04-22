/**
 * Created by lukas on 15.4.6.
 */
angular.module('progress', ['ngRoute'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

//        var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
//            var deferred = $q.defer();
//
//            $http.get('/loggedin').success(function(user){
//                if (user) deferred.resolve();
//                else {
//                    $rootScope.message = 'You need to log in.';
//                    deferred.reject();
//                    $location.url('/login');
//                }
//            });
//
//            return deferred.promise;
//        };
//
//        $httpProvider.interceptors.push(function($q, $location) {
//            return {
//                response: function(response) {
//                    return response;
//                },
//                responseError: function(response) {
//                    if (response.status === 401)
//                        $location.url('/login');
//                    return $q.reject(response);
//                }
//            };
//        });

        $routeProvider
            .when('/', {
                templateUrl: 'partials/home'
            })
//            .when('/admin', {
//                templateUrl: 'views/admin.html',
//                controller: 'AdminCtrl',
//                resolve: {
//                    loggedin: checkLoggedin
//                }
//            })
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

    }]);
//    .run(function($rootScope, $http){
//        $rootScope.message = '';
//
//        // Logout function is available in any pages
//        $rootScope.logout = function(){
//            $rootScope.message = 'Logged out.';
//            $http.post('/logout');
//        };
//    });