// Generated by CoffeeScript 1.9.3
(function() {
  var Minuta, MinutaAjaxDownloader, MinutaAjaxMessageParser, Notifier, notifier,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  MinutaAjaxDownloader = (function() {
    function MinutaAjaxDownloader() {
      this.getMessages = bind(this.getMessages, this);
    }

    MinutaAjaxDownloader.prototype.URI = "https://dennikn.sk/wp-admin/admin-ajax.php?action=minute&home=0&tag=";

    MinutaAjaxDownloader.prototype.ARTICLE_REGEX = /(<article[\s\S]*?<\/article>)/ig;

    MinutaAjaxDownloader.prototype.xhrDownload = function(responseType, URI, successCallback, errorCallback) {
      var xhr;
      xhr = new XMLHttpRequest();
      xhr.open("GET", URI);
      xhr.responseType = responseType;
      xhr.onload = successCallback;
      xhr.onerror = errorCallback;
      return xhr.send(null);
    };

    MinutaAjaxDownloader.prototype.getMessages = function(response) {
      return response.match(this.ARTICLE_REGEX);
    };

    return MinutaAjaxDownloader;

  })();

  MinutaAjaxMessageParser = (function() {
    function MinutaAjaxMessageParser() {
      this.getTopics = bind(this.getTopics, this);
      this.getPriority = bind(this.getPriority, this);
      this.getTargetUrl = bind(this.getTargetUrl, this);
      this.getId = bind(this.getId, this);
      this.getTimePretty = bind(this.getTimePretty, this);
      this.getFigure = bind(this.getFigure, this);
    }

    MinutaAjaxMessageParser.prototype.TARGET_URL_REGEX = /https?:\/\/dennikn.sk\/minuta\/(\d+)/;

    MinutaAjaxMessageParser.prototype.TIME_REGEX = /(\d{4})-0?(\d+)-0?(\d+)[T ]0?(\d+):0?(\d+):0?(\d+)/;

    MinutaAjaxMessageParser.prototype.MESSAGE_REGEX = /<article.*?>(.*?)<\/article>/g;

    MinutaAjaxMessageParser.prototype.MESSAGE_EXCERPT_REGEX = /<p>(.*?)<\/p>/gi;

    MinutaAjaxMessageParser.prototype.HTML_REGEX = /(<([^>]+)>)/ig;

    MinutaAjaxMessageParser.prototype.IMAGE_REGEX = /<img.*?src="(.*?)"/;

    MinutaAjaxMessageParser.prototype.ARTICLE_ID_REGEX = /article id="mpm-(\d+)"/;

    MinutaAjaxMessageParser.prototype.PRIORITY_REGEX = /article.*?class="([^>]*?)"/;

    MinutaAjaxMessageParser.prototype.YOUTUBE_REGEX = /youtube\.com\/embed\/(.*?)[\/\?]/;

    MinutaAjaxMessageParser.prototype.TOPIC_REGEX = /"#tema=(.*?)".*?>(.*?)</g;

    MinutaAjaxMessageParser.prototype.PRIORITY_STICKY = "sticky";

    MinutaAjaxMessageParser.prototype.PRIORITY_IMPORTANT = "important";

    MinutaAjaxMessageParser.prototype.messageBody = null;

    MinutaAjaxMessageParser.prototype.parse = function(messageBody) {
      this.messageBody = messageBody.replace(/\s+/g, " ");
      return {
        thumbnail: this.getFigure(),
        time: this.getTimePretty(),
        text: this.getText(),
        html: this.getHtml(),
        id: this.getId(),
        targetUrl: this.getTargetUrl(),
        priority: this.getPriority(),
        topics: this.getTopics()
      };
    };

    MinutaAjaxMessageParser.prototype.getFigure = function() {
      var matches;
      matches = this.messageBody.match(this.IMAGE_REGEX);
      if (matches !== null && matches.length === 2) {
        return matches[1];
      }
      matches = this.messageBody.match(this.YOUTUBE_REGEX);
      if ((matches != null) && matches.length === 2) {
        return "http://img.youtube.com/vi/" + matches[1] + "/mqdefault.jpg";
      }
    };

    MinutaAjaxMessageParser.prototype.getTimePretty = function() {
      var matches;
      matches = this.messageBody.match(this.TIME_REGEX);
      if ((matches != null) && matches.length === 7) {
        return ("0" + matches[4]).slice(-2) + ":" + ("0" + matches[5]).slice(-2);
      }
    };

    MinutaAjaxMessageParser.prototype.getText = function() {
      var matches, value;
      matches = this.messageBody.match(this.MESSAGE_EXCERPT_REGEX);
      if ((matches != null) && matches.length > 0) {
        value = matches[0].replace(this.HTML_REGEX, "");
        return this.decodeHtml(value);
      }
    };

    MinutaAjaxMessageParser.prototype.getHtml = function() {
      var matches;
      matches = this.MESSAGE_REGEX.exec(this.messageBody);
      if (matches != null) {
        return matches[1];
      }
    };

    MinutaAjaxMessageParser.prototype.getId = function() {
      var matches;
      matches = this.messageBody.match(this.ARTICLE_ID_REGEX);
      if (matches != null) {
        return matches[1];
      }
    };

    MinutaAjaxMessageParser.prototype.getTargetUrl = function() {
      var matches;
      matches = this.messageBody.match(this.TARGET_URL_REGEX);
      if ((matches != null) && matches.length === 2) {
        return matches[0];
      }
    };

    MinutaAjaxMessageParser.prototype.getPriority = function() {
      var classes, matches;
      matches = this.messageBody.match(this.PRIORITY_REGEX);
      if ((matches != null) && matches.length === 2) {
        classes = matches[1];
        if (classes.indexOf("important") !== -1) {
          return this.PRIORITY_IMPORTANT;
        }
        if (classes.indexOf("sticky") !== -1) {
          return this.PRIORITY_STICKY;
        }
      }
    };

    MinutaAjaxMessageParser.prototype.getTopics = function() {
      var topic, topics;
      topics = {};
      topic = this.TOPIC_REGEX.exec(this.messageBody);
      while ((topic != null) && topic.length > 2) {
        topics[topic[1]] = topic[2];
        topic = this.TOPIC_REGEX.exec(this.messageBody);
      }
      return topics;
    };

    MinutaAjaxMessageParser.prototype.decodeHtml = function(html) {
      var txt;
      txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    };

    return MinutaAjaxMessageParser;

  })();

  Minuta = (function() {
    Minuta.prototype.thumbnail = null;

    Minuta.prototype.time = null;

    Minuta.prototype.message = null;

    Minuta.prototype.id = null;

    Minuta.prototype.targetUrl = null;

    Minuta.prototype.priority = null;

    Minuta.prototype.topics = null;

    function Minuta(thumbnail, time, message1, id1, targetUrl1, priority) {
      this.thumbnail = thumbnail;
      this.time = time;
      this.message = message1;
      this.id = id1;
      this.targetUrl = targetUrl1;
      this.priority = priority;
    }

    return Minuta;

  })();

  Notifier = (function() {
    Notifier.prototype.LOGO = "/images/icon512.png";

    Notifier.prototype.BUTTONS = [chrome.i18n.getMessage("readMoreButton")];

    Notifier.prototype.DEFAULT_SYNC_SETTINGS = {
      "sound": "no-sound",
      "interval": 5,
      "messageCount": 3,
      "importantOnly": false,
      "displayTime": 10,
      "notificationClick": "open",
      "snooze": "off"
    };

    Notifier.prototype.DEFAULT_LOCAL_SETTINGS = {
      "selectedTopic": "0",
      "topics": {}
    };

    Notifier.prototype.DEFAULT_NOTIFICATION_OPTIONS = {
      type: "basic",
      title: chrome.i18n.getMessage("notificationTitle"),
      message: null,
      priority: 1
    };

    Notifier.prototype.notificationSound = null;

    Notifier.prototype.currentSettings = {};

    Notifier.prototype.downloader = null;

    Notifier.prototype.parser = null;

    Notifier.prototype.topics = {};

    Notifier.prototype.selectedTopic = "0";

    function Notifier(downloader1, parser1) {
      this.downloader = downloader1;
      this.parser = parser1;
      this.openMessage = bind(this.openMessage, this);
      this.notificationBtnClick = bind(this.notificationBtnClick, this);
      this.notificationClicked = bind(this.notificationClicked, this);
      this.notificationClosed = bind(this.notificationClosed, this);
      this.creationCallback = bind(this.creationCallback, this);
      this.updateTopics = bind(this.updateTopics, this);
      this.reloadSettings = bind(this.reloadSettings, this);
      this.downloadMessages = bind(this.downloadMessages, this);
      chrome.notifications.onClosed.addListener(this.notificationClosed);
      chrome.notifications.onClicked.addListener(this.notificationClicked);
      chrome.notifications.onButtonClicked.addListener(this.notificationBtnClick);
    }

    Notifier.prototype.run = function(forceSilent) {
      var downloader, parser;
      downloader = new this.downloader();
      parser = new this.parser();
      return this.reloadSettings((function(_this) {
        return function() {
          return _this.downloadMessages(downloader, parser, forceSilent);
        };
      })(this));
    };

    Notifier.prototype.downloadMessages = function(downloader, parser, silently) {
      var minutesInterval;
      if (!silently) {
        silently = this.currentSettings['snooze'] !== 'off' && this.currentSettings['snooze'] > (new Date()).getTime();
      }
      minutesInterval = (this.currentSettings['interval'] != null) && parseInt(this.currentSettings['interval']) >= 1 ? parseInt(this.currentSettings['interval']) : 1;
      chrome.storage.local.remove("stickyTopicMessage");
      return downloader.xhrDownload("text", downloader.URI + this.selectedTopic, (function(_this) {
        return function(event) {
          var i, len, message, messages, rawMessage, rawMessages, storage;
          rawMessages = downloader.getMessages(event.target.response);
          storage = {};
          messages = {};
          for (i = 0, len = rawMessages.length; i < len; i++) {
            rawMessage = rawMessages[i];
            if (Object.keys(messages).length === parseInt(_this.currentSettings['messageCount'])) {
              break;
            }
            message = parser.parse(rawMessage);
            if (message.priority === parser.PRIORITY_STICKY) {
              if (_this.selectedTopic === "0") {
                _this.updateTopics(message);
              } else {
                _this.updateStickyTopicMessage(message);
              }
              continue;
            }
            messages[message.id] = message;
          }
          return chrome.storage.local.get(Object.keys(messages), function(alreadyNotifiedMessages) {
            var delay, id;
            delay = 0;
            for (id in messages) {
              message = messages[id];
              if (message.id in alreadyNotifiedMessages) {
                continue;
              }
              if (silently || (_this.currentSettings['importantOnly'] && message.priority !== parser.PRIORITY_IMPORTANT)) {
                storage[message.id] = {
                  "skipped": true,
                  "targetUrl": message.targetUrl
                };
              } else {
                (function(message) {
                  return setTimeout(function() {
                    return _this.notifyArticle(message);
                  }, delay);
                })(message);
                delay += 100;
              }
            }
            if (silently && Object.keys(storage).length) {
              console.log("silent iteration, skipping following messages...");
              console.log(storage);
              chrome.storage.local.set(storage);
            }
            return setTimeout(_this.run.bind(_this, false), 60000 * minutesInterval);
          });
        };
      })(this));
    };

    Notifier.prototype.reloadSettings = function(callback) {
      return chrome.storage.sync.get(this.DEFAULT_SYNC_SETTINGS, (function(_this) {
        return function(val) {
          _this.currentSettings = val;
          chrome.storage.sync.clear();
          chrome.storage.sync.set(val);
          if (val['sound'] !== 'no-sound' && ((_this.notificationSound == null) || _this.notificationSound.src.indexOf(val['sound']) === -1)) {
            _this.notificationSound = new Audio('sounds/' + val['sound'] + '.mp3');
          }
          return chrome.storage.local.get(_this.DEFAULT_LOCAL_SETTINGS, function(wal) {
            _this.selectedTopic = wal['selectedTopic'];
            _this.topics = wal['topics'];
            if (callback != null) {
              return callback();
            }
          });
        };
      })(this));
    };

    Notifier.prototype.updateTopics = function(message) {
      if (Object.keys(this.topics).toString() !== Object.keys(message.topics).toString()) {
        return chrome.storage.local.set({
          "topics": message.topics
        }, (function(_this) {
          return function() {
            return _this.topics = message.topics;
          };
        })(this));
      }
    };

    Notifier.prototype.updateStickyTopicMessage = function(message) {
      return chrome.storage.local.set({
        "stickyTopicMessage": message.html
      });
    };

    Notifier.prototype.notifyArticle = function(message) {
      var meta, options;
      options = JSON.parse(JSON.stringify(this.DEFAULT_NOTIFICATION_OPTIONS));
      meta = {
        "targetUrl": message.targetUrl
      };
      if (!((message.id != null) && (message.text != null))) {
        console.warn("Could not parse the message from the source, skipping...");
        return false;
      }
      options.message = message.text;
      if (this.selectedTopic !== "0") {
        options.title = this.topics[this.selectedTopic];
      }
      if (message.time != null) {
        options.title = "[" + message.time + "] " + options.title;
      }
      if (message.thumbnail != null) {
        options.type = "image";
        options.imageUrl = message.thumbnail;
      }
      this.doNotify(message.id, options, meta);
      return true;
    };

    Notifier.prototype.doNotify = function(id, options, meta) {
      var button, i, len, ref, storage;
      options.iconUrl = chrome.runtime.getURL(this.LOGO);
      options.buttons = [];
      ref = this.BUTTONS;
      for (i = 0, len = ref.length; i < len; i++) {
        button = ref[i];
        options.buttons.push({
          title: button
        });
      }
      storage = {};
      storage[id] = meta;
      chrome.storage.local.set(storage);
      return chrome.notifications.create(id, options, this.creationCallback);
    };

    Notifier.prototype.creationCallback = function(notID) {
      console.log("The nofitication '" + notID + " 'was created.");
      setTimeout((function(_this) {
        return function() {
          return chrome.notifications.clear(notID);
        };
      })(this), 1000 * this.currentSettings['displayTime']);
      if (this.notificationSound != null) {
        return this.notificationSound.play();
      }
    };

    Notifier.prototype.notificationClosed = function(notID, bByUser) {
      return console.log("The notification '" + notID + "' was closed");
    };

    Notifier.prototype.notificationClicked = function(notID) {
      console.log("The notification '" + notID + "' was clicked");
      chrome.notifications.clear(notID);
      if (this.currentSettings['notificationClick'] === 'open') {
        return this.openMessage(notID);
      }
    };

    Notifier.prototype.notificationBtnClick = function(notID) {
      return this.openMessage(notID);
    };

    Notifier.prototype.openMessage = function(notID) {
      return chrome.storage.local.get(notID, function(val) {
        var targetUrl;
        targetUrl = val[notID].targetUrl;
        return chrome.tabs.create({
          url: targetUrl
        });
      });
    };

    return Notifier;

  })();

  notifier = new Notifier(MinutaAjaxDownloader, MinutaAjaxMessageParser);

  notifier.run(true);

}).call(this);
