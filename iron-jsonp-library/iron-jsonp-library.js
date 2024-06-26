/**
@license
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
import { Polymer } from "../polymer/lib/legacy/polymer-fn.js";
import { Base } from "../polymer/polymer-legacy.js";
/**
 * `IronJsonpLibraryBehavior` loads a jsonp library.
 * Multiple components can request same library, only one copy will load.
 *
 * Some libraries require a specific global function be defined.
 * If this is the case, specify the `callbackName` property.
 *
 * You should use an HTML Import to load library dependencies
 * when possible instead of using this element.
 *
 * @hero hero.svg
 * @demo demo/index.html
 * @polymerBehavior
 */

export const IronJsonpLibraryBehavior = {
  properties: {
    /**
     * True if library has been successfully loaded
     */
    libraryLoaded: {
      type: Boolean,
      value: false,
      notify: true,
      readOnly: true
    },

    /**
     * Not null if library has failed to load
     */
    libraryErrorMessage: {
      type: String,
      value: null,
      notify: true,
      readOnly: true // Following properties are to be set by behavior users

      /**
       * Library url. Must contain string `%%callback%%`.
       *
       * `%%callback%%` is a placeholder for jsonp wrapper function name
       *
       * Ex: https://maps.googleapis.com/maps/api/js?callback=%%callback%%
       * @property libraryUrl
       */

      /**
       * Set if library requires specific callback name.
       * Name will be automatically generated if not set.
       * @property callbackName
       */

      /**
       * name of event to be emitted when library loads. Standard is `api-load`
       * @property notifyEvent
       */

      /**
       * event with name specified in `notifyEvent` attribute
       * will fire upon successful load2
       * @event `notifyEvent`
       */

    }
  },
  observers: ['_libraryUrlChanged(libraryUrl)'],
  _libraryUrlChanged: function (libraryUrl) {
    // can't load before ready because notifyEvent might not be set
    if (this._isReady && this.libraryUrl) this._loadLibrary();
  },
  _libraryLoadCallback: function (err, result) {
    if (err) {
      Base._warn('Library load failed:', err.message);

      this._setLibraryErrorMessage(err.message);
    } else {
      this._setLibraryErrorMessage(null);

      this._setLibraryLoaded(true);

      if (this.notifyEvent) this.fire(this.notifyEvent, result, {
        composed: true
      });
    }
  },

  /** loads the library, and fires this.notifyEvent upon completion */
  _loadLibrary: function () {
    LoaderMap.require(this.libraryUrl, this._libraryLoadCallback.bind(this), this.callbackName);
  },
  ready: function () {
    this._isReady = true;
    if (this.libraryUrl) this._loadLibrary();
  }
};
/**
 * LoaderMap keeps track of all Loaders
 */

var LoaderMap = {
  apiMap: {},
  // { hash -> Loader }

  /**
   * @param {Function} notifyCallback loaded callback fn(result)
   * @param {string} jsonpCallbackName name of jsonpcallback. If API does not provide it, leave empty. Optional.
   */
  require: function (url, notifyCallback, jsonpCallbackName) {
    // make hashable string form url
    var name = this.nameFromUrl(url); // create a loader as needed

    if (!this.apiMap[name]) this.apiMap[name] = new Loader(name, url, jsonpCallbackName); // ask for notification

    this.apiMap[name].requestNotify(notifyCallback);
  },
  nameFromUrl: function (url) {
    return url.replace(/[\:\/\%\?\&\.\=\-\,]/g, '_') + '_api';
  }
};
/** @constructor */

var Loader = function (name, url, callbackName) {
  this.notifiers = []; // array of notifyFn [ notifyFn* ]
  // callback is specified either as callback name
  // or computed dynamically if url has callbackMacro in it

  if (!callbackName) {
    if (url.indexOf(this.callbackMacro) >= 0) {
      callbackName = name + '_loaded';
      url = url.replace(this.callbackMacro, callbackName);
    } else {
      this.error = new Error('IronJsonpLibraryBehavior a %%callback%% parameter is required in libraryUrl'); // TODO(sjmiles): we should probably fallback to listening to script.load

      return;
    }
  }

  this.callbackName = callbackName;
  window[this.callbackName] = this.success.bind(this);
  this.addScript(url);
};

Loader.prototype = {
  callbackMacro: '%%callback%%',
  loaded: false,
  addScript: function (src) {
    var script = document.createElement('script');
    script.src = src;
    script.onerror = this.handleError.bind(this);
    var s = document.querySelector('script') || document.body;
    s.parentNode.insertBefore(script, s);
    this.script = script;
  },
  removeScript: function () {
    if (this.script.parentNode) {
      this.script.parentNode.removeChild(this.script);
    }

    this.script = null;
  },
  handleError: function (ev) {
    this.error = new Error('Library failed to load');
    this.notifyAll();
    this.cleanup();
  },
  success: function () {
    this.loaded = true;
    this.result = Array.prototype.slice.call(arguments);
    this.notifyAll();
    this.cleanup();
  },
  cleanup: function () {
    delete window[this.callbackName];
  },
  notifyAll: function () {
    this.notifiers.forEach(function (notifyCallback) {
      notifyCallback(this.error, this.result);
    }.bind(this));
    this.notifiers = [];
  },
  requestNotify: function (notifyCallback) {
    if (this.loaded || this.error) {
      notifyCallback(this.error, this.result);
    } else {
      this.notifiers.push(notifyCallback);
    }
  }
};
/**
  Loads specified jsonp library.

  Example:

      <iron-jsonp-library
        library-url="https://apis.google.com/js/plusone.js?onload=%%callback%%"
        notify-event="api-load"
        library-loaded="{{loaded}}"></iron-jsonp-library>

  Will emit 'api-load' event when loaded, and set 'loaded' to true

  Implemented by  Polymer.IronJsonpLibraryBehavior. Use it
  to create specific library loader elements.

  @demo demo/index.html
*/

Polymer({
  is: 'iron-jsonp-library',
  behaviors: [IronJsonpLibraryBehavior],
  properties: {
    /**
     * Library url. Must contain string `%%callback%%`.
     *
     * `%%callback%%` is a placeholder for jsonp wrapper function name
     *
     * Ex: https://maps.googleapis.com/maps/api/js?callback=%%callback%%
     */
    libraryUrl: String,

    /**
     * Set if library requires specific callback name.
     * Name will be automatically generated if not set.
     */
    callbackName: String,

    /**
     * event with name specified in 'notifyEvent' attribute
     * will fire upon successful load
     */
    notifyEvent: String
    /**
     * event with name specified in 'notifyEvent' attribute
     * will fire upon successful load
     * @event `notifyEvent`
     */

  }
});