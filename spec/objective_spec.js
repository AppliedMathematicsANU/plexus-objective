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
    var result = [];
    var i, j, shrunk, tmp;

    for (i in list) {
      shrunk = list.slice();
      shrunk.splice(i, 1);
      result.push(shrunk);
    }

    for (i in list) {
      tmp = shrinkElement(list[i]);
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


var genObj = function(genKey, genVal) {
  return function(n) {
    var size = comfy.randomInt(0, n);
    var obj = {};
    for (var i = 0; i < size; ++i)
      obj[genKey(n)] = genVal(n);
    return obj;
  };
};


var modified = function(obj, key, val) {
  var result = {};
  for (var k in obj) {
    if (k !== key)
      result[k] = obj[k];
    else if (val !== undefined)
      result[k] = val;
  }
  return result;
};


var shrinkObj = function(n) {
  return function(obj) {
    var result = {};
    var k, j, tmp;

    for (k in Object.keys(obj))
      result.push(modified(obj, k));

    for (k in Object.keys(obj)) {
      tmp = shrinkElement(obj[k]);
      for (j in tmp)
        result.push(modified(obj, k, tmp[j]));
    }

    return result;    
  };
};


var verifyKeys = function(expected, obj) {
  var keys = Object.keys(obj);
  var seen = {};
  var i, k;

  for (i in keys) {
    k = keys[i];
    seen[k] = true;
    if (!expected[k])
      return comfy.failure('unexpected key ' + k + ' in result');
  }

  for (k in expected)
    if (!seen[k])
      return comfy.failure('missing key ' + k + ' in result');

  return comfy.success();
};


var verifyValues = function(expected, obj) {
  var i, key, val;

  for (i in expected) {
    key = expected[i][0];
    val = expected[i][1];

    if (obj[key] !== val)
      return comfy.failure('expected ' + val + ' at position ' + key +
                           ', got ' + obj[key]);
  }
  return comfy.success();
};


describe('the object function', function() {
  var checkKeys = function(list) {
    var obj = ou.object.apply(null, list);
    var expected = {};
    var i;

    for (i = 0; i+1 < list.length; i += 2)
      expected[list[i]] = true;

    return verifyKeys(expected, obj);
  };

  var checkValues = function(list) {
    var obj = ou.object.apply(null, list);
    var expected = [];
    var seen = {};
    var i, key, val;

    for (i = Math.floor((list.length - 2) / 2); i >= 0; --i) {
      key = list[2*i];
      val = list[2*i + 1];

      if (!seen[key])
        expected.push([key, val]);
      seen[key] = true;
    }

    return verifyValues(expected, obj);
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
