/**
 * Unit Tests
 * 
*/

// Dependencies
var helpers = require('./../lib/helpers.js');
var assert = require('assert');
const logs = require('./../lib/logs')


// Assert that the getANumber function is returning a number
_app.tests.unit['helpers.getANumber should return a number'] = function(done){
  var val = helpers.getANumber();
  assert.equal(typeof(val), 'number');
  done();
};


// Assert that the getANumber function is returning 1
_app.tests.unit['helpers.getANumber should return 1'] = function(done){
  var val = helpers.getANumber();
  assert.equal(val, 1);
  done();
};

// Assert that the getANumber function is returning 2
_app.tests.unit['helpers.getNumberOne should return 2'] = function(done){
  var val = helpers.getANumber();
  assert.equal(val, 2);
  done();
};