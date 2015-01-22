// Generated by CoffeeScript 1.8.0
var File, americano;

americano = require('americano-cozy');

module.exports = File = americano.getModel('File', {
  id: String,
  name: String,
  path: String,
  lastModification: String,
  binary: Object,
  "class": String
});

File.imageByDate = function(options, callback) {
  return File.request('imageByDate', options, callback);
};

File.withoutThumb = function(callback) {
  return File.request('withoutThumb', {}, callback);
};
