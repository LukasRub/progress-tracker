/**
 * Created by lukas on 15.4.27.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProgressSchema = new Schema({

});

module.exports = mongoose.model('Progress', ProgressSchema);