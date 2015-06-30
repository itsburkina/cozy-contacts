// Generated by CoffeeScript 1.9.3
var Binary, Photo, americano, async;

americano = require('americano-cozy');

async = require('async');

Binary = require('./binary');

module.exports = Photo = americano.getModel('Photo', {
  id: String,
  title: String,
  description: String,
  orientation: Number,
  binary: function(x) {
    return x;
  },
  _attachments: Object,
  albumid: String,
  date: String
});

Photo.fromAlbum = function(album, callback) {
  var params;
  if (album.folderid === "all") {
    return Photo.request('all', {}, callback);
  } else {
    params = {
      startkey: [album.id],
      endkey: [album.id + "0"]
    };
    return Photo.request('byalbum', params, callback);
  }
};

Photo.albumsThumbs = function(callback) {
  var params;
  params = {
    reduce: true,
    group: true
  };
  return Photo.rawRequest('albumphotos', params, function(err, results) {
    var i, len, out, result;
    if (err) {
      return callback(err);
    }
    out = {};
    for (i = 0, len = results.length; i < len; i++) {
      result = results[i];
      out[result.key] = result.value;
    }
    return callback(null, out);
  });
};

Photo.prototype.destroyWithBinary = function(callback) {
  if ((this.binary != null) && typeof this.binary === 'object') {
    return async.eachSeries(Object.keys(this.binary), (function(_this) {
      return function(bin, cb) {
        return _this.removeBinary(bin, function(err) {
          if (err) {
            console.log("Cannot destroy binary linked to photo " + _this.id);
          }
          return cb();
        });
      };
    })(this), (function(_this) {
      return function(err) {
        return _this.destroy(callback);
      };
    })(this));
  } else {
    return this.destroy(callback);
  }
};
