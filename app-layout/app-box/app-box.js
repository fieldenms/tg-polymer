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
import "../../polymer/polymer-legacy.js";
import "../../iron-flex-layout/iron-flex-layout.js";
import { IronResizableBehavior } from "../../iron-resizable-behavior/iron-resizable-behavior.js";
import { Polymer } from "../../polymer/lib/legacy/polymer-fn.js";
import { html } from "../../polymer/lib/utils/html-tag.js";
import { AppScrollEffectsBehavior } from '../app-scroll-effects/app-scroll-effects-behavior.js';
/**
app-box is a container element that can have scroll effects - visual effects
based on scroll position. For example, the parallax effect can be used to move
an image at a slower rate than the foreground.

```html
<app-box style="height: 100px;" effects="parallax-background">
  <img slot="background" src="picture.png" style="width: 100%; height: 600px;">
</app-box>
```

Notice the `background` attribute in the `img` element; this attribute specifies
that that image is used as the background. By adding the background to the light
dom, you can compose backgrounds that can change dynamically. Alternatively, the
mixin `--app-box-background-front-layer` allows to style the background. For
example:

```css
  .parallaxAppBox {
    --app-box-background-front-layer: {
      background-image: url(picture.png);
    };
  }
```

Finally, app-box can have content inside. For example:

```html
<app-box effects="parallax-background">
  <h2>Sub title</h2>
</app-box>
```

#### Importing the effects

To use the scroll effects, you must explicitly import them in addition to
`app-box`:

```js
import '@polymer/app-layout/app-scroll-effects/app-scroll-effects.js';
```

#### List of effects

* **parallax-background**
A simple parallax effect that vertically translates the backgrounds based on a
fraction of the scroll position. For example:

```css
app-header {
  --app-header-background-front-layer: {
    background-image: url(...);
  };
}
```
```html
<app-header style="height: 300px;" effects="parallax-background">
  <app-toolbar>App name</app-toolbar>
</app-header>
```

The fraction determines how far the background moves relative to the scroll
position. This value can be assigned via the `scalar` config value and it is
typically a value between 0 and 1 inclusive. If `scalar=0`, the background
doesn't move away from the header.

## Styling

Mixin | Description | Default
----------------|-------------|----------
`--app-box-background-front-layer` | Applies to the front layer of the background | {}

@element app-box
@demo app-box/demo/document-scroll.html Document Scroll
@demo app-box/demo/scrolling-region.html Scrolling Region
*/

Polymer({
  /** @override */
  _template: html`
    <style>
      :host {
        position: relative;
        display: block;
      }

      #background {
        @apply --layout-fit;
        overflow: hidden;
        height: 100%;
      }

      #backgroundFrontLayer {
        min-height: 100%;
        pointer-events: none;
        background-size: cover;
        @apply --app-box-background-front-layer;
      }

      #contentContainer {
        position: relative;
        width: 100%;
        height: 100%;
      }

      :host([disabled]),
      :host([disabled]) #backgroundFrontLayer {
        transition: none !important;
      }
    </style>

    <div id="background">
      <div id="backgroundFrontLayer">
        <slot name="background"></slot>
      </div>
    </div>
    <div id="contentContainer">
      <slot></slot>
    </div>
`,
  is: 'app-box',
  behaviors: [AppScrollEffectsBehavior, IronResizableBehavior],
  listeners: {
    'iron-resize': '_resizeHandler'
  },

  /**
   * The current scroll progress.
   *
   * @type {number}
   */
  _progress: 0,

  /** @override */
  attached: function () {
    this.resetLayout();
  },
  _debounceRaf: function (fn) {
    var self = this;

    if (this._raf) {
      window.cancelAnimationFrame(this._raf);
    }

    this._raf = window.requestAnimationFrame(function () {
      self._raf = null;
      fn.call(self);
    });
  },

  /**
   * Resets the layout. This method is automatically called when the element is
   * attached to the DOM.
   *
   * @method resetLayout
   */
  resetLayout: function () {
    this._debounceRaf(function () {
      // noop if the box isn't in the rendered tree
      if (this.offsetWidth === 0 && this.offsetHeight === 0) {
        return;
      }

      var scrollTop = this._clampedScrollTop;
      var savedDisabled = this.disabled;
      this.disabled = true;
      this._elementTop = this._getElementTop();
      this._elementHeight = this.offsetHeight;
      this._cachedScrollTargetHeight = this._scrollTargetHeight;

      this._setUpEffect();

      this._updateScrollState(scrollTop);

      this.disabled = savedDisabled;
    });
  },
  _getElementTop: function () {
    var currentNode = this;
    var top = 0;

    while (currentNode && currentNode !== this.scrollTarget) {
      top += currentNode.offsetTop;
      currentNode = currentNode.offsetParent;
    }

    return top;
  },
  _updateScrollState: function (scrollTop) {
    if (this.isOnScreen()) {
      var viewportTop = this._elementTop - scrollTop;
      this._progress = 1 - (viewportTop + this._elementHeight) / this._cachedScrollTargetHeight;

      this._runEffects(this._progress, scrollTop);
    }
  },

  /**
   * Returns true if this app-box is on the screen.
   * That is, visible in the current viewport.
   *
   * @method isOnScreen
   * @return {boolean}
   */
  isOnScreen: function () {
    return this._elementTop < this._scrollTop + this._cachedScrollTargetHeight && this._elementTop + this._elementHeight > this._scrollTop;
  },
  _resizeHandler: function () {
    this.resetLayout();
  },
  _getDOMRef: function (id) {
    if (id === 'background') {
      return this.$.background;
    }

    if (id === 'backgroundFrontLayer') {
      return this.$.backgroundFrontLayer;
    }
  },

  /**
   * Returns an object containing the progress value of the scroll effects.
   *
   * @method getScrollState
   * @return {Object}
   */
  getScrollState: function () {
    return {
      progress: this._progress
    };
  }
});