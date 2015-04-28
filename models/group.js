/**
 * Created by lukas on 15.4.27.
 */
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var Schema = mongoose.Schema;

var GroupSchema = new Schema({

});

GroupSchema.plugin(autoIncrement.plugin, { model: 'Group', field: 'numberId' });
module.exports = mongoose.model('Group', GroupSchema);