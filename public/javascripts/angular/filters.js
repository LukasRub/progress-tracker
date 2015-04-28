/**
 * Created by lukas on 15.4.24.
 */
angular.module('progress')

    .filter('sanitize', ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
    }])

    .filter('percentage', ['$filter', function ($filter) {
        return function (input, decimals) {
            return $filter('number')(input * 100, decimals) + '%';
        };
    }])

    .filter('simplePercentage', ['$filter', function ($filter) {
        return function (input) {
            return $filter('number')(input) + '%';
        };
    }]);
