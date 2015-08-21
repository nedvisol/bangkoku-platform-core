/****
Platform configuration manager
*****/

var configData = null;
if (process.env.BKK_CONFIG_FILE) {
  configData = require(process.env.BKK_CONFIG_FILE);
}

var config = {
  /***
  Load config from file
  **/
  loadConfig: function(fileName) {

  },
  set: function(data) {
    configData = data;
  },
  get: function(key) {
    if (configData == null) {
      throw 'Config data has not been loaded';
    }
    return configData[key];
  }
};

module.exports = config;
