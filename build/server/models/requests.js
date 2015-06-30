// Generated by CoffeeScript 1.9.3
var americano;

americano = require('cozydb');

module.exports = {
  contact: {
    all: americano.defaultRequests.all,
    byName: function(doc) {
      var dp, i, len, ref, results;
      if ((doc.fn != null) && doc.fn.length > 0) {
        return emit(doc.fn, doc);
      } else if (doc.n != null) {
        return emit(doc.n.split(';').join(' ').trim(), doc);
      } else {
        ref = doc.datapoints;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          dp = ref[i];
          if (dp.name === 'email') {
            results.push(emit(dp.value, doc));
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    }
  },
  config: {
    all: americano.defaultRequests.all
  },
  tag: {
    all: function(doc) {
      return emit(doc.name, doc);
    }
  },
  webdavaccount: {
    all: americano.defaultRequests.all
  }
};
