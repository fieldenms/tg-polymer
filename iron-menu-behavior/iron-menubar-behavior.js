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
import { IronMenuBehavior } from './iron-menu-behavior.js';
/**
 * `IronMenubarBehavior` implements accessible menubar behavior.
 *
 * @polymerBehavior IronMenubarBehavior
 */

export const IronMenubarBehaviorImpl = {
  hostAttributes: {
    'role': 'menubar'
  },

  /**
   * @type {!Object}
   */
  keyBindings: {
    'left': '_onLeftKey',
    'right': '_onRightKey'
  },
  _onUpKey: function (event) {
    this.focusedItem.click();
    event.detail.keyboardEvent.preventDefault();
  },
  _onDownKey: function (event) {
    this.focusedItem.click();
    event.detail.keyboardEvent.preventDefault();
  },

  get _isRTL() {
    return window.getComputedStyle(this)['direction'] === 'rtl';
  },

  _onLeftKey: function (event) {
    if (this._isRTL) {
      this._focusNext();
    } else {
      this._focusPrevious();
    }

    event.detail.keyboardEvent.preventDefault();
  },
  _onRightKey: function (event) {
    if (this._isRTL) {
      this._focusPrevious();
    } else {
      this._focusNext();
    }

    event.detail.keyboardEvent.preventDefault();
  },
  _onKeydown: function (event) {
    if (this.keyboardEventMatchesKeys(event, 'up down left right esc')) {
      return;
    } // all other keys focus the menu item starting with that character


    this._focusWithKeyboardEvent(event);
  }
};
/** @polymerBehavior */

export const IronMenubarBehavior = [IronMenuBehavior, IronMenubarBehaviorImpl];