/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
import "../../polymer/polymer-legacy.js";
export const _scrollEffects = {};
export let _scrollTimer = null;
export const scrollTimingFunction = function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
};
/**
 * Registers a scroll effect to be used in elements that implement the
 * `Polymer.AppScrollEffectsBehavior` behavior.
 *
 * @param {string} effectName The effect name.
 * @param {Object} effectDef The effect definition.
 */

export const registerEffect = function registerEffect(effectName, effectDef) {
  if (_scrollEffects[effectName] != null) {
    throw new Error('effect `' + effectName + '` is already registered.');
  }

  _scrollEffects[effectName] = effectDef;
};
export const queryAllRoot = function (selector, root) {
  var queue = [root];
  var matches = [];

  while (queue.length > 0) {
    var node = queue.shift();
    matches.push.apply(matches, node.querySelectorAll(selector));

    for (var i = 0; node.children[i]; i++) {
      if (node.children[i].shadowRoot) {
        queue.push(node.children[i].shadowRoot);
      }
    }
  }

  return matches;
};
/**
 * Scrolls to a particular set of coordinates in a scroll target.
 * If the scroll target is not defined, then it would use the main document as
 * the target.
 *
 * To scroll in a smooth fashion, you can set the option `behavior: 'smooth'`.
 * e.g.
 *
 * ```js
 * Polymer.AppLayout.scroll({top: 0, behavior: 'smooth'});
 * ```
 *
 * To scroll in a silent mode, without notifying scroll changes to any
 * app-layout elements, you can set the option `behavior: 'silent'`. This is
 * particularly useful we you are using `app-header` and you desire to scroll to
 * the top of a scrolling region without running scroll effects. e.g.
 *
 * ```js
 * Polymer.AppLayout.scroll({top: 0, behavior: 'silent'});
 * ```
 *
 * @param {Object} options {top: Number, left: Number, behavior: String(smooth | silent)}
 */

export const scroll = function scroll(options) {
  options = options || {};
  var docEl = document.documentElement;
  var target = options.target || docEl;
  var hasNativeScrollBehavior = 'scrollBehavior' in target.style && target.scroll;
  var scrollClassName = 'app-layout-silent-scroll';
  var scrollTop = options.top || 0;
  var scrollLeft = options.left || 0;
  var scrollTo = target === docEl ? window.scrollTo : function scrollTo(scrollLeft, scrollTop) {
    target.scrollLeft = scrollLeft;
    target.scrollTop = scrollTop;
  };

  if (options.behavior === 'smooth') {
    if (hasNativeScrollBehavior) {
      target.scroll(options);
    } else {
      var timingFn = scrollTimingFunction;
      var startTime = Date.now();
      var currentScrollTop = target === docEl ? window.pageYOffset : target.scrollTop;
      var currentScrollLeft = target === docEl ? window.pageXOffset : target.scrollLeft;
      var deltaScrollTop = scrollTop - currentScrollTop;
      var deltaScrollLeft = scrollLeft - currentScrollLeft;
      var duration = 300;

      var updateFrame = function updateFrame() {
        var now = Date.now();
        var elapsedTime = now - startTime;

        if (elapsedTime < duration) {
          scrollTo(timingFn(elapsedTime, currentScrollLeft, deltaScrollLeft, duration), timingFn(elapsedTime, currentScrollTop, deltaScrollTop, duration));
          requestAnimationFrame(updateFrame);
        } else {
          scrollTo(scrollLeft, scrollTop);
        }
      }.bind(this);

      updateFrame();
    }
  } else if (options.behavior === 'silent') {
    var headers = queryAllRoot('app-header', document.body);
    headers.forEach(function (header) {
      header.setAttribute('silent-scroll', '');
    }); // Browsers keep the scroll momentum even if the bottom of the scrolling
    // content was reached. This means that calling scroll({top: 0, behavior:
    // 'silent'}) when the momentum is still going will result in more scroll
    // events and thus scroll effects. This seems to only apply when using
    // document scrolling. Therefore, when should we remove the class from the
    // document element?

    if (_scrollTimer) {
      window.cancelAnimationFrame(_scrollTimer);
    }

    _scrollTimer = window.requestAnimationFrame(function () {
      headers.forEach(function (header) {
        header.removeAttribute('silent-scroll');
      });
      _scrollTimer = null;
    });
    scrollTo(scrollLeft, scrollTop);
  } else {
    scrollTo(scrollLeft, scrollTop);
  }
};
/**
 * @interface
 * @extends {Polymer_LegacyElementMixin}
 */

export class ElementWithBackground {
  /** @return {boolean} True if there's content below the current element */
  isContentBelow() {}
  /** @return {boolean} true if the element is on screen */


  isOnScreen() {}
  /**
   * @param {string} title
   * @return {?Element} Element in local dom by id.
   */


  _getDOMRef(title) {}

}