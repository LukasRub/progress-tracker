/**
 * Created by lukas on 15.4.7.
 */
var formUtilities = {
    highlightInputs: function(formName) {
        console.log(formName);
        $('form[name=' + formName +'] .form-group input').addClass('ng-dirty');
    }
};