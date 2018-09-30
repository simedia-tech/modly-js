(function () {
  // Modl constructor
  this.Modl = function (options = {}) {
    // Element references
    this.closeButton = null;
    this.modlWrapper = null;
    this.modl = null;

    // Determine proper transition end method
    this.transitionEnd = transitionSelect();

    // Default options
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
        width: 900,
      },
      theme: "light"
    }

    // Extend defaults with passed options
    this.options = Object.assign({}, defaults, options);

    // Build the Modl
    buildModl.call(this);

    // Initialize events on the Modl
    initEvents.call(this);

    /**
     * Add the open class and check if the modl is taller than the window
     * and if so, the anchored class will be added
     */
    this.modlWrapper.className = this.modlWrapper.className + " modl-open";
    this.modl.className = this.modl.className + (this.modl.offsetHeight > window.innerHeight ? " modl-open modl-anchored" : " modl-open");
  }

  Modl.prototype.close = function () {
    // Listen for css transitioned event and remove DOM nodes afterwards
    this.modl.addEventListener(this.transitionEnd, () => {
      this.modlWrapper.parentNode.removeChild(this.modlWrapper);
    });

    // Remove open classes
    this.modlWrapper.className = this.modlWrapper.className.replace(" modl-open", "");
    this.modl.className = this.modl.className.replace(" modl-open", "");

    // Change opacity
    this.modlWrapper.style.opacity = "0";
    this.modl.style.opacity = "0";
  }

  // Build a Modl instance
  function buildModl() {
    let content;
    let contentWrapper;
    let fragment;

    /**
     * If the content is an HTML string, append the HTML plainly
     * If the content is a DOM node, append it's content
     */
    if (typeof this.options.content === "string") {
      content = this.options.content;
    } else {
      content = this.options.content.innerHTML;
    }

    // Create document fragment
    fragment = document.createDocumentFragment();

    // Create Modl wrapper
    this.modlWrapper = document.createElement("div");
    this.modlWrapper.className = `modl-wrapper`;
    this.modlWrapper.style.transitionProperty = "opacity";
    this.modlWrapper.style.transitionDuration = `${this.options.animation.duration / 1000}s`;
    this.modlWrapper.style.transitionTimingFunction = this.options.animation.effect;

    // Generate correct Modl positioning
    let horizontal = null;
    let vertical = null;
    switch (this.options.position) {
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

    this.modlWrapper.style.justifyContent = horizontal;
    this.modlWrapper.style.alignItems = vertical;

    // Create Modl
    this.modl = document.createElement("div");
    this.modl.className = `modl ${this.options.className}`;
    this.modl.style.width = `${this.options.sizes.width}px`;
    this.modl.style.maxWidth = `100%`;
    this.modl.style.transitionProperty = "opacity";
    this.modl.style.transitionDuration = `${this.options.animation.duration / 1000}s`
    this.modl.style.transitionTimingFunction = this.options.animation.effect
    this.modl.style.opacity = "0";
    this.modl.style.zIndex = "20";
    this.modlWrapper.appendChild(this.modl);

    // If closeButton option is true, add a close button
    if (this.options.closeButton.enabled === true) {
      this.closeButton = document.createElement("button");
      this.closeButton.className = "modl-close";
      this.closeButton.innerHTML = "×";
      this.modl.appendChild(this.closeButton);
    }

    // Construct content area
    contentWrapper = document.createElement("div");
    contentWrapper.className = "modl-content";
    contentWrapper.innerHTML = content;
    this.modl.appendChild(contentWrapper);

    // Append Modl to document fragment
    fragment.appendChild(this.modlWrapper);

    // Append document fragment to body
    document.body.appendChild(fragment);

    // Inject styles
    injectStyles.call(this);

    // Show Modl
    setTimeout(() => this.modlWrapper.style.opacity = "1", 0);
    setTimeout(() => {
      // Check if the modl is longer than the screen
      const style = window.getComputedStyle ? window.getComputedStyle(this.modl) : this.modl.currentStyle;

      if (this.modl.offsetHeight + (parseInt(style.marginTop) || 0) + (parseInt(style.marginBottom) || 0) > window.innerHeight) {
        this.modlWrapper.style.alignItems = "flex-start";
      }

      // Make the Modl visible
      this.modl.style.opacity = "1"
    }, 0);
  }

  function initEvents() {
    if (this.options.closeButton.enabled === true) {
      this.closeButton.addEventListener("click", this.close.bind(this));
    }

    if (this.options.overlay.enabled) {
      this.modl.addEventListener("click", e => {
        e.stopPropagation();
      });

      this.modlWrapper.addEventListener("click", this.close.bind(this));
    }
  }

  function injectStyles() {
    const head = document.head;
    const style = document.createElement("style");

    let wrapper_background_color;
    let modl_background_color;
    let modl_text_color;
    let modl_close_button_color;

    switch (this.options.theme) {
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
    `

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
})()