// Generated by CoffeeScript 1.10.0
(function() {
  var ANDROID_RELATIONS, BASE_FIELDS, EXTRA_FIELDS, IM_VENDORS, IOS_IM_VENDORS, IOS_SERVICE_LABELS, IOS_SERVICE_TYPES, PHONETIC_FIELDS, SOCIAL_URLS, VCardParser, capitalizeFirstLetter, exportAbout, exportAdr, exportAlerts, exportBaseFields, exportChat, exportDefault, exportExtraFields, exportName, exportOther, exportPicture, exportRelation, exportRev, exportSocial, exportTags, exportUid, exportUrl, getAndroidItem, isValidDate, quotedPrintable, regexps, utf8,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    utf8 = require('utf8');
    quotedPrintable = require('quoted-printable');
  } else {
    utf8 = window.utf8;
    quotedPrintable = window.quotedPrintable;
  }

  regexps = {
    begin: /^BEGIN:VCARD$/i,
    end: /^END:VCARD$/i,
    beginNonVCard: /^BEGIN:(.*)$/i,
    endNonVCard: /^END:(.*)$/i,
    simple: /^(version|fn|n|title|org|note|categories|bday|url|nickname|uid|tz|lang|geo|gender|kind)(;CHARSET=UTF-8)?(;ENCODING=QUOTED-PRINTABLE)?\:(.+)$/i,
    composedkey: /^item(\d{1,2})\.([^\:]+):(.+)$/,
    complex: /^([^\:\;]+);([^\:]+)\:(.+)$/,
    property: /^(.+)=(.+)$/,
    extended: /^X-([^\:]+)\:(.+)$/i,
    applebday: /^(version|fn|n|title|org|note|categories|bday|url);value=date:(.+)$/i,
    android: /^x-android-custom\:(.+)$/i
  };

  IM_VENDORS = ['skype', 'skype-username', 'aim', 'msn', 'yahoo', 'qq', 'google-talk', 'gtalk', 'icq', 'jabber', 'sip', 'gad'];

  IOS_IM_VENDORS = ['aim', 'jabber', 'msn', 'yahoo', 'icq'];

  PHONETIC_FIELDS = ['phonetic-first-name', 'phonetic-middle-name', 'phonetic-last-name'];

  ANDROID_RELATIONS = ['custom', 'assistant', 'brother', 'child', 'domestic partner', 'father', 'friend', 'manager', 'mother', 'parent', 'partner', 'referred by', 'relative', 'sister', 'spouse'];

  BASE_FIELDS = ['fn', 'bday', 'org', 'title', 'url', 'note', 'nickname', 'uid'];

  EXTRA_FIELDS = ['tz', 'lang', 'geo', 'gender', 'kind'];

  SOCIAL_URLS = {
    twitter: "http://twitter.com/",
    facebook: "http://facebook.com/",
    flickr: "http://www.flickr.com/photos/",
    linkedin: "http://www.linkedin.com/in/",
    myspace: "http://www.myspace.com/",
    sina: "http://weibo.com/n/"
  };

  IOS_SERVICE_TYPES = {
    'msn': 'MSN:msnim',
    'skype': 'Skype:skype',
    'google-talk': 'GoogleTalk:xmpp',
    'googletalk': 'GoogleTalk:xmpp',
    'gtalk': 'GoogleTalk:xmpp',
    'facebook': 'Facebook:xmpp',
    'aim': 'AIM:aim',
    'yahoo': 'Yahoo:aim',
    'icq': 'ICQ:aim',
    'jabber': 'Jabber:xmpp',
    'qq': 'QQ:x-apple',
    'gadugadu': 'GaduGadu:x-apple'
  };

  IOS_SERVICE_LABELS = {
    'msn': 'MSN',
    'skype': 'Skype',
    'google-talk': 'GoogleTalk',
    'googletalk': 'GoogleTalk',
    'gtalk': 'GoogleTalk',
    'facebook': 'Facebook',
    'aim': 'AIM',
    'yahoo': 'Yahoo:',
    'icq': 'ICQ',
    'jabber': 'Jabber',
    'qq': 'QQ',
    'gadugadu': 'GaduGadu'
  };

  isValidDate = function(date) {
    var d, m, matches, res, y;
    matches = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/.exec(date);
    if (matches === null) {
      return false;
    } else {
      y = parseInt(matches[1]);
      m = parseInt(matches[2] - 1);
      d = parseInt(matches[3]);
      date = new Date(y, m, d);
      res = date.getDate() === d;
      res = res && date.getMonth() === m;
      res = res && date.getFullYear() === y;
      return res;
    }
  };

  capitalizeFirstLetter = function(string) {
    return "" + (string.charAt(0).toUpperCase()) + (string.toLowerCase().slice(1));
  };

  getAndroidItem = function(type, key, value) {
    var index, length, prefix;
    key = key.toLowerCase().replace('_', ' ');
    if (key === 'anniversary') {
      index = 1;
    } else if (key === 'died') {
      index = 2;
    } else {
      index = 0;
      length = ANDROID_RELATIONS.length;
      while (index < length && ANDROID_RELATIONS[index] !== key) {
        index++;
      }
      if (index === length) {
        key = null;
      }
    }
    if (key) {
      prefix = 'X-ANDROID-CUSTOM:vnd.android.cursor.item/';
      return "" + prefix + type + ";" + value + ";" + index + ";;;;;;;;;;;;;";
    } else {
      return null;
    }
  };

  VCardParser = (function() {
    function VCardParser(vcf) {
      this.reset();
      if (vcf) {
        this.read(vcf);
      }
    }

    VCardParser.prototype.reset = function() {
      this.contacts = [];
      this.currentContact = null;
      this.currentDatapoint = null;
      this.currentIndex = null;
      return this.currentVersion = "3.0";
    };

    VCardParser.prototype.storeCurrentDatapoint = function() {
      if (this.currentDatapoint) {
        this.currentContact.datapoints.push(this.currentDatapoint);
        return this.currentDatapoint = null;
      }
    };

    VCardParser.prototype.addDatapoint = function(name, type, value) {
      this.storeCurrentDatapoint();
      return this.currentContact.datapoints.push({
        name: name,
        type: type,
        value: value
      });
    };

    VCardParser.prototype.addTypeProperty = function(dp, pvalue) {
      if ((dp.type != null) && dp.type !== 'internet') {
        return dp.type = dp.type + " " + pvalue;
      } else {
        return dp.type = pvalue;
      }
    };

    VCardParser.prototype.storeCurrentContact = function() {
      var ref;
      if ((this.currentContact.n == null) && (this.currentContact.fn == null)) {
        console.error('There should be at least a N field or a FN field');
      }
      if ((this.currentContact.n == null) || ((ref = this.currentContact.n) === '' || ref === ';;;;')) {
        this.currentContact.n = VCardParser.fnToN(this.currentContact.fn).join(';');
      }
      if ((this.currentContact.fn == null) || this.currentContact.fn === '') {
        this.currentContact.fn = VCardParser.nToFN(this.currentContact.n);
      }
      return this.contacts.push(this.currentContact);
    };

    VCardParser.prototype.read = function(vcard) {
      var j, len, line, ref, results;
      ref = this.splitLines(vcard);
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        line = ref[j];
        results.push(this.handleLine(line));
      }
      return results;
    };

    VCardParser.prototype.splitLines = function(vcard) {
      var inQuotedPrintable, lines, sourcelines;
      sourcelines = vcard.split(/\r?\n/);
      lines = [];
      inQuotedPrintable = false;
      sourcelines.forEach(function(line) {
        var lineIndex;
        if (!((line == null) || line === '')) {
          if (line[0] === ' ' || inQuotedPrintable) {
            if (line[0] === ' ') {
              line = line.slice(1);
            }
            if (inQuotedPrintable) {
              if (line[line.length - 1] === '=') {
                line = line.slice(0, -1);
              } else {
                inQuotedPrintable = false;
              }
            }
            lineIndex = lines.length - 1;
            if (lineIndex >= 0) {
              return lines[lineIndex] = lines[lineIndex] + line;
            } else {
              return lines.push(line);
            }
          } else {
            if (/^(.+)ENCODING=QUOTED-PRINTABLE(.+)=$/i.test(line)) {
              inQuotedPrintable = true;
              line = line.slice(0, -1);
            }
            return lines.push(line);
          }
        }
      });
      return lines;
    };

    VCardParser.prototype.handleLine = function(line) {
      if (this.nonVCard) {
        if (regexps.endNonVCard.test(line)) {
          if (line.match(regexps.endNonVCard)[1] === this.nonVCard) {
            return this.nonVCard = false;
          }
        }
      } else if (regexps.begin.test(line)) {
        return this.currentContact = {
          datapoints: []
        };
      } else if (regexps.beginNonVCard.test(line)) {
        return this.nonVCard = line.match(regexps.beginNonVCard)[1];
      } else if (regexps.end.test(line)) {
        this.storeCurrentDatapoint();
        return this.storeCurrentContact();
      } else if (regexps.simple.test(line)) {
        return this.handleSimpleLine(line);
      } else if (regexps.applebday.test(line)) {
        return this.handleSimpleLine(line, true);
      } else if (regexps.android.test(line)) {
        return this.handleAndroidLine(line);
      } else if (regexps.extended.test(line)) {
        return this.handleExtendedLine(line);
      } else if (regexps.composedkey.test(line)) {
        return this.handleComposedLine(line);
      } else if (regexps.complex.test(line)) {
        return this.handleComplexLine(line);
      }
    };

    VCardParser.prototype.handleSimpleLine = function(line, apple) {
      var all, key, nParts, nPartsCleaned, quoted, ref, ref1, utf, value, values;
      if (apple == null) {
        apple = false;
      }
      if (apple) {
        ref = line.match(regexps.applebday), all = ref[0], key = ref[1], value = ref[2];
      } else {
        ref1 = line.match(regexps.simple), all = ref1[0], key = ref1[1], utf = ref1[2], quoted = ref1[3], value = ref1[4];
      }
      if (quoted != null) {
        value = VCardParser.unquotePrintable(value);
      }
      value = VCardParser.unescapeText(value);
      key = key.toLowerCase();
      if (key === 'version') {
        return this.currentversion = value;
      } else if (key === 'rev') {
        return this.currentContact.revision = value;
      } else if (key === 'categories') {
        return this.currentContact.tags = value.split(/(?!\\),/).map(VCardParser.unescapeText);
      } else if (key === 'n') {
        nParts = value.split(/(?!\\);/);
        if (nParts.length === 5) {
          return this.currentContact['n'] = value;
        } else {
          nPartsCleaned = ['', '', '', '', ''];
          if (nParts.length <= 5) {
            nParts.forEach(function(part, index) {
              return nPartsCleaned[index] = part;
            });
          } else if (nParts.length === 6) {
            nPartsCleaned.push('');
            nParts.forEach(function(part, index) {
              return nPartsCleaned[index] = part;
            });
          } else {
            nPartsCleaned[2] = nParts.join(' ');
          }
          return this.currentContact['n'] = nPartsCleaned.join(';');
        }
      } else if (indexOf.call(BASE_FIELDS, key) >= 0) {
        if (key === 'org') {
          values = value.split(';');
          if (values.length === 2) {
            this.currentContact.org = values[0];
            return this.currentContact.department = values[1];
          } else {
            return this.currentContact.org = value;
          }
        } else {
          return this.currentContact[key.toLowerCase()] = value;
        }
      } else if (indexOf.call(EXTRA_FIELDS, key) >= 0) {
        return this.currentContact[key.toLowerCase()] = value;
      }
    };

    VCardParser.prototype.handleExtendedLine = function(line) {
      var all, elements, j, key, keyvalues, kv, len, ref, splitted, type, user, vals, value;
      ref = line.match(regexps.extended), all = ref[0], key = ref[1], value = ref[2];
      if (key != null) {
        key = key.toLowerCase();
        if (indexOf.call(IM_VENDORS, key) >= 0) {
          return this.currentContact.datapoints.push({
            name: 'chat',
            type: key,
            value: value
          });
        } else if (indexOf.call(PHONETIC_FIELDS, key) >= 0) {
          key = key.replace(/-/g, ' ');
          return this.currentContact.datapoints.push({
            name: 'about',
            type: key,
            value: value
          });
        } else if (key.indexOf('socialprofile') === 0) {
          keyvalues = key.split(';');
          elements = {};
          for (j = 0, len = keyvalues.length; j < len; j++) {
            kv = keyvalues[j];
            splitted = kv.split('=');
            elements[splitted[0].replace('x-', '')] = splitted[1];
          }
          if (!elements.user) {
            elements['user'] = value;
          }
          if (elements.type && elements.user) {
            type = elements['type'];
            user = elements['user'];
            return this.currentContact.datapoints.push({
              name: 'social',
              type: type,
              value: user
            });
          }
        } else if (key === 'activity-alert') {
          vals = value.split(',');
          if (vals.length > 1) {
            type = vals.splice(0, 1)[0];
            type = type.split('=')[1].replace(/\\/g, '');
            value = vals.join(',');
          }
          return this.currentContact.datapoints.push({
            name: 'alerts',
            type: type,
            value: value
          });
        }
      }
    };

    VCardParser.prototype.handleAndroidLine = function(line) {
      var all, parts, raw, ref, ref1, type, value;
      ref = line.match(regexps.android), all = ref[0], raw = ref[1];
      parts = raw.split(';');
      switch (parts[0].replace('vnd.android.cursor.item/', '')) {
        case 'contact_event':
          value = parts[1];
          type = (ref1 = parts[2]) === '0' || ref1 === '2' ? parts[3] : parts[2] === '1' ? 'anniversary' : 'birthday';
          return this.currentContact.datapoints.push({
            name: 'about',
            type: type,
            value: value
          });
        case 'relation':
          value = parts[1];
          type = ANDROID_RELATIONS[+parts[2]];
          if (type === 'custom') {
            type = parts[3];
          }
          return this.currentContact.datapoints.push({
            name: 'relation',
            type: type,
            value: value
          });
        case 'nickname':
          value = parts[1];
          return this.currentContact.nickname = value;
      }
    };

    VCardParser.prototype.handleCurrentSpecialCases = function() {
      var dp, ref, ref1;
      dp = this.currentDatapoint;
      if (ref = dp != null ? dp.type : void 0, indexOf.call(IM_VENDORS, ref) >= 0) {
        dp.name = 'chat';
        if (dp['x-service-type'] != null) {
          dp.value = dp.value.split(':')[1];
          if (ref1 = dp['x-service-type'], indexOf.call(IM_VENDORS, ref1) < 0) {
            dp.type = dp['x-service-type'];
          }
        }
      }
      if ((dp != null ? dp.name : void 0) === 'impp') {
        dp.name = 'chat';
        return dp.value = dp.value.split(':')[1];
      }
    };

    VCardParser.prototype.handleComposedLine = function(line) {
      var all, itemidx, key, part, properties, ref, value;
      ref = line.match(regexps.composedkey), all = ref[0], itemidx = ref[1], part = ref[2], value = ref[3];
      if (this.currentIndex === null || this.currentIndex !== itemidx || !this.currentDatapoint) {
        this.handleCurrentSpecialCases();
        this.storeCurrentDatapoint();
        this.currentDatapoint = {};
      }
      this.currentIndex = itemidx;
      part = part.split(';');
      key = part[0];
      properties = part.splice(1);
      value = value.split(';');
      if (value.length === 1) {
        value = value[0].replace('_$!<', '').replace('>!$_', '').replace('\\:', ':');
      }
      key = key.toLowerCase();
      if (key === 'x-ablabel' || key === 'x-abadr') {
        return this.addTypeProperty(this.currentDatapoint, value.toLowerCase());
      } else {
        this.handleProperties(this.currentDatapoint, properties);
        if (key === 'x-abdate') {
          key = 'about';
        }
        if (key === 'x-abrelatednames') {
          key = 'relation';
        }
        if (key === 'adr') {
          if (Array.isArray(value)) {
            value = value.map(VCardParser.unescapeText);
          } else {
            value = ['', '', VCardParser.unescapeText(value), '', '', '', ''];
          }
        }
        this.currentDatapoint['name'] = key.toLowerCase();
        return this.currentDatapoint['value'] = value;
      }
    };

    VCardParser.prototype.handleComplexLine = function(line) {
      var all, key, properties, ref, ref1, value;
      ref = line.match(regexps.complex), all = ref[0], key = ref[1], properties = ref[2], value = ref[3];
      this.storeCurrentDatapoint();
      this.currentDatapoint = {};
      value = value.split(';');
      if (value.length === 1) {
        value = value[0];
      }
      key = key.toLowerCase();
      if (key === 'photo') {
        this.currentContact['photo'] = value;
        return this.currentDatapoint = null;
      } else if ((ref1 = !key) === 'email' || ref1 === 'tel' || ref1 === 'adr' || ref1 === 'url') {
        return this.currentDatapoint = null;
      } else {
        this.currentDatapoint['name'] = key;
        if (key === 'adr') {
          if (Array.isArray(value)) {
            value = value.map(VCardParser.unescapeText);
          } else {
            value = ['', '', VCardParser.unescapeText(value), '', '', '', ''];
          }
        }
        this.handleProperties(this.currentDatapoint, properties.split(';'));
        if (this.currentDatapoint.encoding === 'quoted-printable') {
          if (Array.isArray(value)) {
            value = value.map(VCardParser.unquotePrintable);
          } else {
            value = VCardParser.unquotePrintable(value);
          }
          delete this.currentDatapoint.encoding;
        }
        return this.currentDatapoint.value = value;
      }
    };

    VCardParser.prototype.handleProperties = function(dp, properties) {
      var all, j, len, match, pname, previousValue, property, pvalue, results;
      results = [];
      for (j = 0, len = properties.length; j < len; j++) {
        property = properties[j];
        if (match = property.match(regexps.property)) {
          all = match[0], pname = match[1], pvalue = match[2];
          pvalue = pvalue.toLowerCase();
          previousValue = dp[pname.toLowerCase()];
          if ((previousValue != null) && previousValue !== 'internet') {
            pvalue = previousValue + " " + pvalue;
          }
        } else if (property === 'PREF') {
          pname = 'pref';
          pvalue = true;
          if (dp.type != null) {
            dp.type = dp.type + " " + (property.toLowerCase());
          } else {
            dp.type = property.toLowerCase();
          }
        } else {
          pname = 'type';
          if (dp.type != null) {
            pvalue = dp.type + " " + (property.toLowerCase());
          } else {
            pvalue = property.toLowerCase();
          }
        }
        if (pname === 'type' && pvalue === 'pref') {
          pname = 'pref';
          pvalue = true;
        }
        results.push(dp[pname.toLowerCase()] = pvalue);
      }
      return results;
    };

    return VCardParser;

  })();

  VCardParser.unquotePrintable = function(value) {
    var error, error1;
    value = value || '';
    try {
      return utf8.decode(quotedPrintable.decode(value));
    } catch (error1) {
      error = error1;
      return value;
    }
  };

  VCardParser.escapeText = function(value) {
    var text;
    if (value == null) {
      return value;
    } else {
      text = value.replace(/([,;\\])/ig, "\\$1");
      text = text.replace(/\n/g, '\\n');
      return text;
    }
  };

  VCardParser.unescapeText = function(t) {
    var s;
    if (t == null) {
      return t;
    } else {
      s = t.replace(/\\n/ig, '\n');
      s = s.replace(/\\([,;\\])/ig, "$1");
      return s;
    }
  };

  VCardParser.toVCF = function(model, picture, mode) {
    var currentType, datapoint, formattedType, i, itemCounter, j, key, len, options, out, ref, ref1, type, types, value;
    if (picture == null) {
      picture = null;
    }
    if (mode == null) {
      mode = 'google';
    }
    itemCounter = 0;
    out = ["BEGIN:VCARD"];
    out.push("VERSION:3.0");
    exportUid(out, model);
    if (model.revision != null) {
      exportRev(out, model);
    }
    if (model.n != null) {
      exportName(out, model);
    }
    exportBaseFields(out, model);
    exportExtraFields(out, model);
    if ((model.tags != null) && model.tags.length > 0) {
      exportTags(out, model);
    }
    ref = model.datapoints;
    for (i in ref) {
      datapoint = ref[i];
      if (!((datapoint.name != null) && (datapoint.value != null))) {
        continue;
      }
      key = datapoint.name.toUpperCase();
      type = ((ref1 = datapoint.type) != null ? ref1.toUpperCase() : void 0) || null;
      value = datapoint.value;
      if (Array.isArray(value)) {
        value = value.map(VCardParser.escapeText);
      } else {
        value = VCardParser.escapeText(value);
      }
      formattedType = "";
      if (type != null) {
        types = type.split(' ');
        for (j = 0, len = types.length; j < len; j++) {
          currentType = types[j];
          formattedType += ";TYPE=" + currentType;
        }
      }
      options = {
        out: out,
        type: type,
        formattedType: formattedType,
        value: value,
        mode: mode,
        itemCounter: itemCounter,
        key: key
      };
      switch (key) {
        case 'ABOUT':
          itemCounter = exportAbout(options);
          break;
        case 'OTHER':
          itemCounter = exportOther(options);
          break;
        case 'CHAT':
          itemCounter = exportChat(options);
          break;
        case 'URL':
          itemCounter = exportUrl(options);
          break;
        case 'RELATION':
          itemCounter = exportRelation(options);
          break;
        case 'ADR':
          itemCounter = exportAdr(options);
          break;
        case 'SOCIAL':
          itemCounter = exportSocial(options);
          break;
        case 'ALERTS':
          itemCounter = exportAlerts(options);
          break;
        default:
          itemCounter = exportDefault(options);
      }
    }
    if (picture != null) {
      exportPicture(out, picture);
    }
    out.push("END:VCARD");
    return out.join("\n") + "\n";
  };

  exportUid = function(out, model) {
    var uid, uri;
    uri = model.carddavuri;
    uid = (uri != null ? uri.substring(0, uri.length - 4) : void 0) || model.id;
    if (uid != null) {
      return out.push("UID:" + uid);
    }
  };

  exportBaseFields = function(out, model) {
    var department, j, len, prop, results, value;
    results = [];
    for (j = 0, len = BASE_FIELDS.length; j < len; j++) {
      prop = BASE_FIELDS[j];
      value = model[prop];
      if (value) {
        value = VCardParser.escapeText(value);
      }
      if (prop === 'org') {
        if ((model.department != null) && model.department.length > 0) {
          department = VCardParser.escapeText(model.department);
          value = value + ";" + department;
        }
      }
      if (value) {
        results.push(out.push((prop.toUpperCase()) + ":" + value));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  exportExtraFields = function(out, model) {
    var j, len, prop, results, value;
    results = [];
    for (j = 0, len = EXTRA_FIELDS.length; j < len; j++) {
      prop = EXTRA_FIELDS[j];
      value = model[prop];
      if (value) {
        value = VCardParser.escapeText(value);
      }
      if (value) {
        results.push(out.push((prop.toUpperCase()) + ":" + value));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  exportName = function(out, model) {
    return out.push("N:" + model.n);
  };

  exportRev = function(out, model) {
    if (typeof model.revision === 'date') {
      return out.push("REV:" + (model.revision.toISOString()));
    } else {
      return out.push("REV:" + model.revision);
    }
  };

  exportTags = function(out, model) {
    var value;
    value = model.tags.map(VCardParser.escapeText).join(',');
    return out.push("CATEGORIES:" + value);
  };

  exportAbout = function(options) {
    var formattedType, itemCounter, mode, out, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter;
    if (type === 'DIED' || type === 'ANNIVERSARY') {
      if (mode === 'android') {
        out.push(getAndroidItem('contact_event', type, value));
      } else {
        itemCounter++;
        out.push("item" + itemCounter + ".X-ABDATE:" + value);
        formattedType = capitalizeFirstLetter(type);
        out.push("item" + itemCounter + ".X-ABLabel:" + formattedType);
      }
    } else if (type.indexOf('PHONETIC') === 0) {
      out.push("X-" + (type.replace(/\s/g, '-')) + ":" + value);
    } else if (isValidDate(value)) {
      itemCounter++;
      out.push("item" + itemCounter + ".X-ABDATE:" + value);
      formattedType = capitalizeFirstLetter(type);
      out.push("item" + itemCounter + ".X-ABLabel:" + formattedType);
    } else {
      out.push("X-" + type + ":" + value);
    }
    return itemCounter;
  };

  exportOther = function(options) {
    var formattedType, itemCounter, mode, out, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter;
    out.push("X-EVENT" + formattedType + ":" + value);
    return itemCounter;
  };

  exportChat = function(options) {
    var formattedType, itemCounter, line, mode, out, serviceType, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter;
    if (type === 'SKYPE' && mode === 'android') {
      out.push("X-SKYPE-USERNAME:" + value);
    } else {
      if (mode === 'ios') {
        itemCounter++;
        serviceType = IOS_SERVICE_TYPES[type.toLowerCase()];
        if (serviceType != null) {
          line = "item" + itemCounter + ".IMPP;";
          line += "X-SERVICE-TYPE=" + serviceType + ":" + value;
          out.push(line);
        } else {
          type = capitalizeFirstLetter(type.toLowerCase());
          line = "item" + itemCounter + ".IMPP;";
          line += "X-SERVICE-TYPE=" + type + ":x-apple:" + value;
          out.push(line);
        }
      } else {
        out.push("X-" + type + ":" + value);
      }
    }
    return itemCounter;
  };

  exportUrl = function(options) {
    var formattedType, itemCounter, mode, out, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter;
    if (type != null) {
      itemCounter++;
      out.push("item" + itemCounter + ".URL:" + value);
      if (type !== 'PROFILE' && type !== 'BLOG') {
        formattedType = capitalizeFirstLetter(type.toLowerCase());
        if ((mode === 'ios') && (type === 'HOME' || type === 'WORK' || type === 'OTHER')) {
          out.push("item" + itemCounter + ".X-ABLabel:_$!<" + formattedType + ">!$_");
        } else if (mode === 'ios') {
          out.push("item" + itemCounter + ".X-ABLabel:" + formattedType);
        } else {
          out.push("item" + itemCounter + ".X-ABLabel:_$!<" + formattedType + ">!$_");
        }
      } else {
        out.push("item" + itemCounter + ".X-ABLabel:" + type);
      }
    } else {
      out.push("URL:" + value);
    }
    return itemCounter;
  };

  exportRelation = function(options) {
    var formattedType, itemCounter, line, mode, out, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter;
    if (mode === 'android') {
      line = getAndroidItem('relation', type, value);
      if (line) {
        out.push(line);
      }
    } else {
      itemCounter++;
      out.push("item" + itemCounter + ".X-ABRELATEDNAMES:" + value);
      formattedType = capitalizeFirstLetter(type.toLowerCase());
      out.push("item" + itemCounter + ".X-ABLabel:_$!<" + formattedType + ">!$_");
    }
    return itemCounter;
  };

  exportAdr = function(options) {
    var formattedType, itemCounter, key, mode, out, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter, key = options.key;
    if (Array.isArray(value)) {
      value = value.join(';');
    }
    out.push("" + key + formattedType + ":" + value);
    return itemCounter;
  };

  exportSocial = function(options) {
    var formattedType, itemCounter, key, mode, out, res, type, url, urlPrefix, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter, key = options.key;
    url = value;
    urlPrefix = SOCIAL_URLS[type.toLowerCase()];
    if (urlPrefix != null) {
      url = "" + urlPrefix + value;
    } else {
      formattedType = capitalizeFirstLetter(type.toLowerCase());
      formattedType = ";TYPE=" + formattedType;
    }
    res = "X-SOCIALPROFILE" + formattedType + ";x-user=" + value + ":" + url;
    out.push(res);
    return itemCounter;
  };

  exportAlerts = function(options) {
    var formattedType, itemCounter, key, mode, out, res, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter, key = options.key;
    type = type.toLowerCase();
    value = value.replace(/\\\\\\/g, "\\");
    res = "X-ACTIVITY-ALERT:type=" + type + "\\," + value;
    out.push(res);
    return itemCounter;
  };

  exportDefault = function(options) {
    var formattedType, itemCounter, key, mode, out, type, value;
    out = options.out, type = options.type, formattedType = options.formattedType, value = options.value, mode = options.mode, itemCounter = options.itemCounter, key = options.key;
    out.push("" + key + formattedType + ":" + value);
    return itemCounter;
  };

  exportPicture = function(out, picture) {
    var folded, pictureString;
    folded = picture.match(/.{1,75}/g).join('\n ');
    pictureString = "PHOTO;ENCODING=B;TYPE=JPEG;VALUE=BINARY:\n " + folded;
    return out.push(pictureString);
  };

  VCardParser.nToFN = function(n) {
    var familly, given, middle, parts, prefix, suffix;
    n = n || [];
    familly = n[0], given = n[1], middle = n[2], prefix = n[3], suffix = n[4];
    parts = [prefix, given, middle, familly, suffix];
    parts = parts.filter(function(part) {
      return (part != null) && part !== '';
    });
    return parts.join(' ');
  };

  VCardParser.fnToN = function(fn) {
    fn = fn || '';
    return ['', fn, '', '', ''];
  };

  VCardParser.fnToNLastnameNFirstname = function(fn) {
    var familly, given, j, middle, parts, ref;
    fn = fn || '';
    ref = fn.split(' '), given = ref[0], middle = 3 <= ref.length ? slice.call(ref, 1, j = ref.length - 1) : (j = 1, []), familly = ref[j++];
    parts = [familly, given, middle.join(' '), '', ''];
    return parts;
  };

  VCardParser.adrArrayToString = function(value) {
    var countryPart, flat, streetPart, structuredToFlat;
    value = value || [];
    structuredToFlat = function(t) {
      t = t.filter(function(part) {
        return (part != null) && part !== '';
      });
      return t.join(', ');
    };
    streetPart = structuredToFlat(value.slice(0, 3));
    countryPart = structuredToFlat(value.slice(3, 7));
    flat = streetPart;
    if (countryPart !== '') {
      flat += '\n' + countryPart;
    }
    return flat;
  };

  VCardParser.adrStringToArray = function(s) {
    s = s || '';
    return ['', '', s, '', '', '', ''];
  };

  if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
    module.exports = VCardParser;
  } else {
    window.VCardParser = VCardParser;
  }

}).call(this);