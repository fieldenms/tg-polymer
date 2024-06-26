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
import "../polymer/polymer-legacy.js";
import { NeonAnimationBehavior } from "../neon-animation/neon-animation-behavior.js";
import { Polymer } from "../polymer/lib/legacy/polymer-fn.js";
Polymer({
  is: 'paper-menu-grow-height-animation',

  /** @override */
  _template: null,
  behaviors: [NeonAnimationBehavior],
  configure: function (config) {
    var node = config.node;
    var rect = node.getBoundingClientRect();
    var height = rect.height;
    this._effect = new KeyframeEffect(node, [{
      height: height / 2 + 'px'
    }, {
      height: height + 'px'
    }], this.timingFromConfig(config));
    return this._effect;
  }
});
Polymer({
  is: 'paper-menu-grow-width-animation',

  /** @override */
  _template: null,
  behaviors: [NeonAnimationBehavior],
  configure: function (config) {
    var node = config.node;
    var rect = node.getBoundingClientRect();
    var width = rect.width;
    this._effect = new KeyframeEffect(node, [{
      width: width / 2 + 'px'
    }, {
      width: width + 'px'
    }], this.timingFromConfig(config));
    return this._effect;
  }
});
Polymer({
  is: 'paper-menu-shrink-width-animation',

  /** @override */
  _template: null,
  behaviors: [NeonAnimationBehavior],
  configure: function (config) {
    var node = config.node;
    var rect = node.getBoundingClientRect();
    var width = rect.width;
    this._effect = new KeyframeEffect(node, [{
      width: width + 'px'
    }, {
      width: width - width / 20 + 'px'
    }], this.timingFromConfig(config));
    return this._effect;
  }
});
Polymer({
  is: 'paper-menu-shrink-height-animation',

  /** @override */
  _template: null,
  behaviors: [NeonAnimationBehavior],
  configure: function (config) {
    var node = config.node;
    var rect = node.getBoundingClientRect();
    var height = rect.height;
    this.setPrefixedProperty(node, 'transformOrigin', '0 0');
    this._effect = new KeyframeEffect(node, [{
      height: height + 'px',
      transform: 'translateY(0)'
    }, {
      height: height / 2 + 'px',
      transform: 'translateY(-20px)'
    }], this.timingFromConfig(config));
    return this._effect;
  }
});