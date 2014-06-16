'use strict';

require('comfychair/jasmine');
var comfy = require('comfychair');

var ou = require('../index.js');


var genList = function(genElement) {
  return function(n) {
    var size = comfy.randomInt(0, n);
    var list = [];
    for (var i = 0; i < size; ++i)
      list.push(genElement(n));
    return list;
  };
};


var shrinkList = function(shrinkElement) {
  return function(list) {
    var result = []
    var i, j, shrunk, tmp;

    for (i in list) {
      shrunk = list.slice();
      shrunk.splice(i, 1);
      result.push(shrunk);
    }

    for (i in list) {
      tmp = shrinkElement(shrunk[i]);
      for (j in tmp) {
        shrunk = list.slice();
        shrunk[i] = tmp[j];
        result.push(shrunk);
      }
    }

    return result;    
  };
};


var genInt = function(n) {
  return comfy.randomInt(0, n);
};


var shrinkInt = comfy.shrinkInt;


describe('the object function', function() {
  var checkValues = function(list) {
    var obj = ou.object.apply(null, list);
    var seen = {};
    var key, val;

    for (var i = Math.floor((list.length - 2) / 2); i >= 0; --i) {
      key = list[2*i];
      val = list[2*i + 1];

      if (!seen[key] && obj[key] !== val)
        return comfy.failure('expected ' + val + ' at position ' + key +
                             ', got ' + obj[key]);
      seen[key] = true;
    }
    return comfy.success();
  };

  describe('when given only integer arguments', function() {
    it('sets the correct values', function() {
      expect(checkValues).toSucceedOn(genList(genInt), shrinkList(shrinkInt));
    });
  });
});
