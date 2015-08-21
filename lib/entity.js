var _ = require('underscore'),
    exprProc = require('./expression-processor.js'),
    SS = require('bangkoku-data-core').SimpleStore;
    config = require('./config.js'),
    Q = require('q');
/***
Entity Meta data
{
  domain: 'domainId',
  inherits: 'classId',
  attrs : {
    'attribute-name' : {
      label: 'display label in default language',
      label_LOCALE: 'display label in different locale',
      formula: 'EXPRESSION', //automatically calculates attr based on other attr
      required: BOOLEAN, //optional
    },
    // MORE ATTRIBUTES
  },
  validations: {
    name : { expr: 'EXPRESSION', //must evaluated to TRUE to be considered valid, optional
      regex: 'PATTERN', //regex pattern, optional },
      attr: 'NAME', //required if regex is present
    // MORE VALIDATIONS
  },
  recordName: 'ATTRIBUTE NAME', //attribute name will be used for naming the record

}

**/
var coreConfig = config.get('core');
var D = SS(coreConfig.simpleStore);
var bdc = new D(coreConfig.applicationName);

function Entity(metaData) {
  var self = this;
  _.extend(this, {
    _bdc: bdc, //backdoor for unit test
    _metaData: metaData,
    _data: {},
    _reEval: function() {
      _.each(this._metaData.attrs, function(attr, name){
        if (attr.formula) {
          //console.log('** cal '+attr.formula);
          self._data[name] = exprProc.eval(attr.formula, self._data);
        }
      });
    },
    _validate: function() {
      var err = [];
      var data = this._data;
      _.each(this._metaData.validations, function(validation, name){
        if (validation.expr) {
          //console.log('** cal '+attr.formula);
          var result = exprProc.eval(validation.expr, data);
          if (result !== true) {
            err.push(name);
          }
        } else if (validation.regex) {
          var rx = new RegExp(validation.regex);
          if (!rx.test(self._data[validation.attr])) {
            err.push(name);
          }
        }
      });
      return err;
    },
    set: function(attrs, value) {
      if (_.isObject(attrs)) {
        _.extend(self._data, attrs);
      } else if (_.isString(attrs)) {
        self._data[attrs] = value;
      }
      this._reEval();
      return this;
    },
    get: function(attr) {
      if (_.isUndefined(attr)) {
        return _.extend({}, self._data); //send a shallow copy
      } else {
        return self._data[attr];
      }
    },
    create: function() {
      var errs = this._validate();
      if (errs.length > 0) {
        return Q.reject(errs);
      }
      var id = this._bdc.generateId() + '-'+this._metaData.domain;
      var putData = _.extend({}, this._data);
      return this._bdc.put(id, this._metaData.classId, putData)
      .then(function(results){
        _.extend(self._data, results);
        return self;
      });

    },
    retrieve: function(id) {
      return Q(null);
    },
    update: function() {
      return Q(null);
    },
    delete: function() {
      return Q(null);
    },
    find: function(condition) {
      return Q(null);
    }
  });
}


module.exports = Entity;
