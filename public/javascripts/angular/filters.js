/**
 * Created by lukas on 15.4.24.
 */
angular.module('progress')

    .filter('sanitize', ['$sce', function($sce) {
        return function(htmlCode){
            return $sce.trustAsHtml(htmlCode);
        }
    }]);