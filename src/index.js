/*!
 * Modly.js v0.0.1
 * (c) 2018 Ivan Sieder
 * Released under the MIT License.
 */

"use strict";

// default options
const defaults = {
  animation: {
    enabled: true,
    duration: 300,
    effect: "ease"
  },
  className: "fade",
  closeButton: {
    enabled: true
  },
  content: "",
  overlay: {
    enabled: true
  },
  position: "center",
  sizes: {
    width: 900
  },
  theme: "light"
};

// element references
let closeButton;
let modlyWrapper;
let modly;
let options;

// determine proper transition end method
let transitionEnd = transitionSelect();

// modly constructor
const Modly = function(userOptions = {}) {
  // only one modly at a time is allowed,
  // so we clean up any existing ones before.
  if (modlyWrapper) {
    this.close.bind(this);
  }
  // Extend defaults with passed options
  options = Object.assign({}, defaults, userOptions);

  // Build the Modly
  buildModly.call(this);

  // Initialize events on the Modly
  initEvents.call(this);

  /**
   * Add the open class and check if the modly is taller than the window
   * and if so, the anchored class will be added
   */
  modlyWrapper.className = modlyWrapper.className + " modly-open";
  modly.className =
    modly.className +
    (modly.offsetHeight > window.innerHeight
      ? " modly-open modly-anchored"
      : " modly-open");
};

Modly.prototype.close = function() {
  // Listen for css transitioned event and remove DOM nodes afterwards
  modly.addEventListener(transitionEnd, () => {
    modlyWrapper.parentNode.removeChild(modlyWrapper);

    closeButton = undefined;
    modlyWrapper = undefined;
    modly = undefined;
    options = undefined;
  });

  // Remove open classes
  modlyWrapper.className = modlyWrapper.className.replace(" modly-open", "");
  modly.className = modly.className.replace(" modly-open", "");

  // Change opacity
  modlyWrapper.style.opacity = "0";
  modly.style.opacity = "0";
};

// Build a Modly instance
function buildModly() {
  let content;
  let contentWrapper;
  let fragment;

  /**
   * If the content is an HTML string, append the HTML plainly
   * If the content is a DOM node, append it's content
   */
  if (typeof options.content === "string") {
    content = options.content;
  } else {
    content = options.content.innerHTML;
  }

  // Create document fragment
  fragment = document.createDocumentFragment();

  // Create Modly wrapper
  modlyWrapper = document.createElement("div");
  modlyWrapper.className = `modly-wrapper`;
  modlyWrapper.style = [
    `transitionProperty: opacity`,
    `transitionDuration: ${options.animation.duration / 1000}s`,
    `transitionTimingFunction: options.animation.effect`
  ].join(";");

  // Generate correct Modly positioning
  let horizontal;
  let vertical;
  switch (options.position) {
    case "center":
      horizontal = "center";
      vertical = "center";
      break;
    case "top":
      horizontal = "center";
      vertical = "flex-start";
      break;
    case "top-right":
      horizontal = "flex-end";
      vertical = "flex-start";
      break;
    case "right":
      horizontal = "flex-end";
      vertical = "center";
      break;
    case "bottom-right":
      horizontal = "flex-end";
      vertical = "flex-end";
      break;
    case "bottom":
      horizontal = "center";
      vertical = "flex-end";
      break;
    case "bottom-left":
      horizontal = "flex-start";
      vertical = "flex-end";
      break;
    case "left":
      horizontal = "flex-start";
      vertical = "center";
      break;
    case "top-left":
      horizontal = "flex-start";
      vertical = "flex-start";
      break;
  }

  modlyWrapper.style.justifyContent = horizontal;
  modlyWrapper.style.alignItems = vertical;

  // Create Modly
  modly = document.createElement("div");
  modly.className = `modly ${options.className}`;
  modly.style.cssText = [
    `width: ${options.sizes.width}px`,
    `maxWidth: 100%`,
    `transitionProperty: opacity`,
    `transitionDuration: ${options.animation.duration / 1000}s`,
    `transitionTimingFunction: options.animation.effect`,
    `opacity: 0`,
    `zIndex: 20`
  ].join(";");
  modlyWrapper.appendChild(modly);

  // If closeButton option is truthy, add a close button
  if (options.closeButton.enabled) {
    closeButton = document.createElement("button");
    closeButton.className = "modly-close";
    closeButton.innerHTML = "×";
    modly.appendChild(closeButton);
  }

  // Construct content area
  contentWrapper = document.createElement("div");
  contentWrapper.className = "modly-content";
  contentWrapper.innerHTML = content;
  modly.appendChild(contentWrapper);

  // Append Modly to document fragment
  fragment.appendChild(modlyWrapper);

  // Append document fragment to body
  document.body.appendChild(fragment);

  // Inject styles
  injectStyles.call(this);

  // Show Modly
  setTimeout(() => (modlyWrapper.style.opacity = "1"), 0);
  setTimeout(() => {
    // Check if the modly is longer than the screen
    const style = window.getComputedStyle
      ? window.getComputedStyle(modly)
      : modly.currentStyle;

    if (
      modly.offsetHeight +
        (parseInt(style.marginTop) || 0) +
        (parseInt(style.marginBottom) || 0) >
      window.innerHeight
    ) {
      modlyWrapper.style.alignItems = "flex-start";
    }

    // Make the Modly visible
    modly.style.opacity = "1";
  }, 0);
}

function initEvents() {
  if (options.closeButton.enabled === true) {
    closeButton.addEventListener("click", this.close.bind(this));
  }

  if (options.overlay.enabled) {
    modly.addEventListener("click", e => {
      e.stopPropagation();
    });

    modlyWrapper.addEventListener("click", this.close.bind(this));
  }
}

function injectStyles() {
  const head = document.head;
  const style = document.createElement("style");

  let wrapper_background_color;
  let modly_background_color;
  let modly_text_color;
  let modly_close_button_color;

  switch (options.theme) {
    default:
      wrapper_background_color = "rgba(62, 61, 64, 0.8)";
      modly_background_color = "#ffffff";
      modly_text_color = "#000000";
      modly_close_button_color = "#000000";
      break;
  }

  const cssContent = `
      .modly-wrapper * {
        box-sizing: border-box;
      }
    
      .modly-wrapper {
        background-color: ${wrapper_background_color};
        display: flex;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow-y: auto;
      }
    
      .modly {
        background-color: ${modly_background_color};
        color: ${modly_text_color};
        margin: 1.4em;
        padding: 1.5em;
        position: relative;
        border-radius: 5px;
      }
    
      .modly * {
        max-width: 100%;
      }
    
      .modly-close {
        background: none;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        color: ${modly_close_button_color};
        font-family: serif;
        font-size: 1.5em;
        height: 1em;
        line-height: 1;
        padding: 0;
        cursor: pointer;
        position: absolute;
        right: 0;
        top: 0;
        width: 1em;
      }
    `;

  style.type = "text/css";
  if (style.styleSheet) {
    style.styleSheet.cssText = cssContent;
  } else {
    style.appendChild(document.createTextNode(cssContent));
  }

  head.appendChild(style);
}

// Utility method to determine which transistionend event is supported
function transitionSelect() {
  const element = document.createElement("div");
  if (element.style.WebkitTransition) return "webkitTransitionEnd";
  if (element.style.OTransition) return "oTransitionEnd";
  return "transitionend";
}

export default Modly;
