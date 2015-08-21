var assert = require('assert');
var sinon = require('sinon');
var _ = require('underscore');
var config = require('../../lib/config.js');

describe('Platform config manager', function(){
  describe('#get()', function(){
    it('should be able to set and get configuration info', function(){
      /*config.set({
        foo: { map: 'bar'}
      });*/
      assert.deepEqual(config.get('foo'), { map: 'bar'});
    });
  });
});
