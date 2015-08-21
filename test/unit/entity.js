var assert = require('assert');
var sinon = require('sinon');
var _ = require('underscore');
var Entity = require('../../lib/entity.js');
var Q = require('q');


function restoreAll(stubs) {
  _.each(stubs, function(stub){
    stub.restore();
  });
}

describe('Entity', function(){

  var sampleMetaData = {
    domain: 'domain001',
    classId: 'classId',
    inherits: 'parentClassId',
    attrs: {
      foo: {
        label: 'Foo Attribute Label',
        required: true
      },
      bar: {
        label: 'Bar Attribute Label'
      },
      fooBar: {
        label: 'Foo Bar',
        formula: 'foo+bar'
      }
    },
    validations: {
      barMustBeShorterThan5Char: {
        expr: 'bar.length < 5'
      },
      fooMustMatchRegex: {
        attr: 'foo',
        regex: 'test[0-9]*'
      }
    }
  };

  describe('new instance', function(){
    it('should create a new object based on Entity prototype', function(){
      var ent = new Entity(sampleMetaData);
      assert.deepEqual(ent._metaData, sampleMetaData);
    });
  });
  describe('#set(), get()', function(){
    it('should be able to get values previously set (single value)', function(){
      var ent = new Entity(sampleMetaData);
      ent.set('foo', 'test001');
      assert.equal(ent.get('foo'), 'test001');
    });
    it('should be able to get values previously set (multiple values)', function(){
      var ent = new Entity(sampleMetaData);
      ent.set({
        foo: 'test001',
        bar: 'aaa'
      });
      assert.equal(ent.get('foo'), 'test001');
      assert.equal(ent.get('bar'), 'aaa');
    });
    it('should be able to get values previously set (multiple values/multi-get)', function(){
      var ent = new Entity(sampleMetaData);
      ent.set({
        foo: 'test001',
        bar: 'aaa'
      });
      assert.deepEqual(ent.get(), {
        foo: 'test001',
        bar: 'aaa',
        fooBar: 'test001aaa'
      });
    });

    it('should calculate formula attr', function(){
      var ent = new Entity(sampleMetaData);
      ent.set({
        foo: 'test001',
        bar: 'aaa'
      });
      assert.equal(ent.get('fooBar'), 'test001aaa');
    });
  }); //end describe('#set(), get()', function(){

  describe('#create()', function(){
    it('should reject if object contains invalid values', function(done){
      var ent = new Entity(sampleMetaData);
      ent.set({
        foo: 'xxx',
        bar: '1111111111111111111'
      });
      ent.create()
      .done(function(results){
        throw 'should not be successful';
      }, function(e){
        assert.deepEqual(e, ['barMustBeShorterThan5Char','fooMustMatchRegex']);
        done();
      });
    });

    it('should assign new ID and put data', function(done){
      var ent = new Entity(sampleMetaData);
      var ss = {
        put: sinon.stub(ent._bdc, 'put'),
        id: sinon.stub(ent._bdc, 'generateId')
      };
      ss.id.onCall(0).returns('rowID1');
      //ss.id.onCall(1).returns('random1');
      ss.put.onCall(0).returns(Q({
        _id: 'rowID1-domain001',
        _rev: 'rev001',
        foo: 'test001',
        bar: 'aaa',
        fooBar: 'test001aaa'
      }));

      ent.set({
        foo: 'test001',
        bar: 'aaa'
      })
      .create()
      .done(function(results){
        assert.ok(ss.put.calledOnce, 'called bdc.put()');
        assert.deepEqual(ss.put.getCall(0).args,['rowID1-domain001', 'classId', {
          foo: 'test001',
          bar: 'aaa',
          fooBar: 'test001aaa'
        }], 'called bdc.put() with right params');
        assert.equal(results, ent, 'returns itself');
        restoreAll(ss);
        done();
      }, function(e){
        throw e;
      })

    });

  }); //END describe('#create()', function(){

});
