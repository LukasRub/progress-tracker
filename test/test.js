/**
 * Created by lukas on 15.5.21.
 */
var should = require('should');
var mongoose = require('mongoose');

var connection = mongoose.connect('mongodb://localhost/testDB');
require('mongoose-auto-increment').initialize(connection);

describe('Calculating Task percentage done', function(){
    
    context('when new subtask is being added', function(){
        var task;
        var progress;
        var subtask;
                
        before(function(done){
            var Task = require('../models/task');
            var testSetUp = {
                '_createdBy': '55471ceedd4300500ce9f182',
                '_assignedTo': '55471ceedd4300500ce9f182',
                'title': 'Test',
                'status': 'Created',
                'isQuantifiable': true,
                'goal': 100
            };
            Task.create(testSetUp, function(err, result){
                task = result;
                done();
            });
        });
        
        before(function(done){
            var Progress = require('../models/progress');
            var testSetUp = {
                '_madeBy': '55471ceedd4300500ce9f182',
                'current': 30
            };
            Progress.create(testSetUp, function(err, result){
                progress = result;
                task._progress.push(result);
                task.save(done);
            });
        
        });
        
        before(function(done){
            var Subtask = require('../models/subtask');
            var testSetUp = {
                '_createdBy': '55471ceedd4300500ce9f182',
                '_assignedTo': '55471ceedd4300500ce9f182',
                'title': 'Test',
                'status': 'Created',
                'weight': 50
            };
            Subtask.create(testSetUp, function(err, result){
                progress = result;
                task._subtasks.push(result);
                task.save(done);
            });
        });

        it('should correctly recalculate percentage done', function(){
            (task.percentageDone).should.equal(15);
            (task.availableWeight).should.equal(50);
        });
        
        after(function(done){
            mongoose.connection.db.dropDatabase(done);
        });
        
    });
    
});
