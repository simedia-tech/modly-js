/*!
 * Modl.js v0.0.1
 * (c) 2018 Ivan Sieder
 * Released under the MIT License.
 */

(function() {
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
  let modlWrapper;
  let modl;
  let options;

  // determine proper transition end method
  let transitionEnd = transitionSelect();

  // modl constructor
  window.Modl = function(userOptions = {}) {
    // Extend defaults with passed options
    options = Object.assign({}, defaults, userOptions);

    // Build the Modl
    buildModl.call(this);

    // Initialize events on the Modl
    initEvents.call(this);

    /**
     * Add the open class and check if the modl is taller than the window
     * and if so, the anchored class will be added
     */
    modlWrapper.className = modlWrapper.className + " modl-open";
    modl.className =
      modl.className +
      (modl.offsetHeight > window.innerHeight
        ? " modl-open modl-anchored"
        : " modl-open");
  };

  Modl.prototype.close = function() {
    // Listen for css transitioned event and remove DOM nodes afterwards
    modl.addEventListener(transitionEnd, () => {
      modlWrapper.parentNode.removeChild(modlWrapper);
    });

    // Remove open classes
    modlWrapper.className = modlWrapper.className.replace(" modl-open", "");
    modl.className = modl.className.replace(" modl-open", "");

    // Change opacity
    modlWrapper.style.opacity = "0";
    modl.style.opacity = "0";
  };

  // Build a Modl instance
  function buildModl() {
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

    // Create Modl wrapper
    modlWrapper = document.createElement("div");
    modlWrapper.className = `modl-wrapper`;
    modlWrapper.style = {
      transitionProperty: "opacity",
      transitionDuration: `${options.animation.duration / 1000}s`,
      transitionTimingFunction: options.animation.effect
    };

    // Generate correct Modl positioning
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

    modlWrapper.style.justifyContent = horizontal;
    modlWrapper.style.alignItems = vertical;

    // Create Modl
    modl = document.createElement("div");
    modl.className = `modl ${options.className}`;
    modl.style = {
      width: `${options.sizes.width}px`,
      maxWidth: `100%`,
      transitionProperty: "opacity",
      transitionDuration: `${options.animation.duration / 1000}s`,
      transitionTimingFunction: options.animation.effect,
      opacity: "0",
      zIndex: "20"
    };
    modlWrapper.appendChild(modl);

    // If closeButton option is truthy, add a close button
    if (options.closeButton.enabled) {
      closeButton = document.createElement("button");
      closeButton.className = "modl-close";
      closeButton.innerHTML = "×";
      modl.appendChild(closeButton);
    }

    // Construct content area
    contentWrapper = document.createElement("div");
    contentWrapper.className = "modl-content";
    contentWrapper.innerHTML = content;
    modl.appendChild(contentWrapper);

    // Append Modl to document fragment
    fragment.appendChild(modlWrapper);

    // Append document fragment to body
    document.body.appendChild(fragment);

    // Inject styles
    injectStyles.call(this);

    // Show Modl
    setTimeout(() => (modlWrapper.style.opacity = "1"), 0);
    setTimeout(() => {
      // Check if the modl is longer than the screen
      const style = window.getComputedStyle
        ? window.getComputedStyle(modl)
        : modl.currentStyle;

      if (
        modl.offsetHeight +
          (parseInt(style.marginTop) || 0) +
          (parseInt(style.marginBottom) || 0) >
        window.innerHeight
      ) {
        modlWrapper.style.alignItems = "flex-start";
      }

      // Make the Modl visible
      modl.style.opacity = "1";
    }, 0);
  }

  function initEvents() {
    if (options.closeButton.enabled === true) {
      closeButton.addEventListener("click", this.close.bind(this));
    }

    if (options.overlay.enabled) {
      modl.addEventListener("click", e => {
        e.stopPropagation();
      });

      modlWrapper.addEventListener("click", this.close.bind(this));
    }
  }

  function injectStyles() {
    const head = document.head;
    const style = document.createElement("style");

    let wrapper_background_color;
    let modl_background_color;
    let modl_text_color;
    let modl_close_button_color;

    switch (options.theme) {
      default:
        wrapper_background_color = "rgba(62, 61, 64, 0.8)";
        modl_background_color = "#ffffff";
        modl_text_color = "#000000";
        modl_close_button_color = "#000000";
        break;
    }

    const cssContent = `
      .modl-wrapper * {
        box-sizing: border-box;
      }
    
      .modl-wrapper {
        background-color: ${wrapper_background_color};
        display: flex;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        overflow-y: auto;
      }
    
      .modl {
        background-color: ${modl_background_color};
        color: ${modl_text_color};
        margin: 1.4em;
        padding: 1.5em;
        position: relative;
        border-radius: 5px;
      }
    
      .modl * {
        max-width: 100%;
      }
    
      .modl-close {
        background: none;
        border: 0;
        border-radius: 0;
        box-shadow: none;
        color: ${modl_close_button_color};
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
})();
