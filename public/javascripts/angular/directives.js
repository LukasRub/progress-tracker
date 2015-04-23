/**
 * Created by lukas on 15.4.6.
 */
angular.module('progress')
    .directive('ensureUniqueEmail', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
        return {
            require: 'ngModel',
            link: function ($scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.emailAvailable = function (email) {
                    var deffered = $q.defer();
                    $timeout(function () {
                        $http.post('/public/check/user/email', {data: email})
                            .success(function() {
                                deffered.resolve();
                            })
                            .error(function() {
                                deffered.reject();
                            });
                    }, 1000);
                    return deffered.promise;
                };
            }
        }
    }]);    
