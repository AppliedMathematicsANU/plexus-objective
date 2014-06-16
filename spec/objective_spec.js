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


var genKey = function(n) {
  var size = comfy.randomInt(0, n);
  var t = [];
  for (var i = 0; i < n/4; ++i)
    t.push(comfy.oneOf(['a', 'b']));
  return t.join('');
};


var shrinkKey = function(s) {
  return [];
};


describe('the object function', function() {
  var checkKeys = function(list) {
    var obj = ou.object.apply(null, list);
    var keys = Object.keys(obj);
    var expected = {};
    var seen = {};
    var i, k;

    for (i = 0; i+1 < list.length; i += 2)
      expected[list[i]] = true;

    for (i in keys)
      seen[keys[i]] = true;

    for (k in expected)
      if (!seen[k])
        return comfy.failure('missing key ' + k + ' in result');

    for (k in seen)
      if (!expected[k])
        return comfy.failure('unexpected key ' + k + ' in result');

    return comfy.success();
  };

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
    var gen = genList(function(n) { return comfy.randomInt(0, n); });
    var shrink = shrinkList(comfy.shrinkInt);

    var checkArray = function(list) {
      if (Array.isArray(ou.object.apply(null, list)))
        return comfy.success();
      else
        return comfy.failure();
    };

    it('returns an array', function() { 
      expect(checkArray).toSucceedOn(gen, shrink);
    });

    it('sets the correct keys', function() { 
      expect(checkKeys).toSucceedOn(gen, shrink);
    });

    it('sets the correct values', function() {
      expect(checkValues).toSucceedOn(gen, shrink);
    });
  });

  describe('when given string arguments', function() {
    var gen = genList(genKey);
    var shrink = shrinkList(shrinkKey);

    it('sets the correct keys', function() { 
      expect(checkKeys).toSucceedOn(gen, shrink);
    });

    it('sets the correct values', function() {
      expect(checkValues).toSucceedOn(gen, shrink);
    });
  });
});
