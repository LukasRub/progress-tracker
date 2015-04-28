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
                        $http.post('api/public/checkemail', {data: email})
                            .success(function(data) {
                                if (data) {
                                    deffered.reject();
                                } else {
                                    deffered.resolve();
                                }
                            })
                            .error(function() {
                                deffered.reject();
                            });
                    }, 1000);
                    return deffered.promise;
                };
            }
        }
    }])
    
    .directive('emitLastRepeaterElement', function() {
        return function(scope) {
            if (scope.$last){
                scope.$emit('LastRepeaterElement');
            }
        };
    });
